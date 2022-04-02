import React,{useEffect,useState} from "react";
import { 
	StatusBar, 
    Text, 
    SafeAreaView,
    TouchableOpacity, 
    View,
	Alert,
	FlatList
} from "react-native";
import SegmentedControlTab from "react-native-segmented-control-tab";
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'
import axios from 'axios'
import MovableView from 'react-native-movable-view';
import Icon from 'react-native-vector-icons/Ionicons';
import {getAuthHeader} from '../../_helpers/auth-header';
import { BaseUrl, EndPoints, StaticMessage, ThemeColor, FontName } from '../../_helpers/constants';
import Loader from '../../Components/Loader';


const PayrollCalenderScreen = ({route,navigation}) => {
	const [isLoading, setIsLoading] = React.useState(false);
	let [selectedIndex, setSelectedIndex] = React.useState(0);
	let [calendarArray, setCalendarArray] = React.useState([]);

	React.useLayoutEffect(() => {
		navigation.setOptions({
			  title: `Payroll calendar`,
		});
	}, [navigation]);
	const showShareOptions = () =>{

	}
	useEffect(() => {
		getCalenderDetails();
		

	},[])
	const handleIndexChange = (index) => {
		setSelectedIndex(index);
		getCalenderDetails();

	}
	
	const  getCalenderDetails = async() => {
		let user = await AsyncStorage.getItem('loginDetails');  
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken);
		let callType = '1001';
		if(selectedIndex == 0){
			callType = '1002';
		}
		setIsLoading(true);
		axios ({  
		  "method": "GET",
		  "url": `${BaseUrl}${EndPoints.PayrollCalendar}/${callType}`,
		  "headers": getAuthHeader(authToken)
		})
		.then((response) => {
			setIsLoading(false);
			if (response.data.code == 200){
				const results = JSON.stringify(response.data.content)
				console.log(results);
				setCalendarArray(response.data.content.dataList);
			}else if (response.data.code == 417){
				console.log(Object.values(response.data.content.messageList));
				const errorList = Object.values(response.data.content.messageList);
				Alert.alert(StaticMessage.AppName, errorList.join(), [
					{text: 'Ok'}
				]);
		
			}else{
			}
		})
		.catch((error) => {
		  console.error(error);
		  setIsLoading(false);
		  if(error.response && error.response.status == 401){
			SessionExpiredAlert();
		  }else{
			  Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
				  {text: 'Ok'}
				]);
		  }
		})
	}

	return(
		<SafeAreaView style={{flex:1,backgroundColor:ThemeColor.ViewBgColor, paddingBottom:34}}>
			<View style={{alignItems:'center', justifyContent:'center', height:50, marginTop:8}}>
				<SegmentedControlTab
					tabStyle ={{ borderColor: ThemeColor.BtnColor}}
					activeTabStyle={{ backgroundColor: ThemeColor.BtnColor  }}
					tabsContainerStyle={{ height: 35, width:'70%', tintColor:ThemeColor.BtnColor, borderColor:ThemeColor.BtnColor }}
					values={["Weekly", "Semi-monthly"]}
					tabTextStyle={{ color: ThemeColor.BtnColor }}
					activeTabTextStyle={{ color: '#fff' }}
					selectedIndex={selectedIndex}
					onTabPress={ (index) => {handleIndexChange(index)}}
				/>
			</View>
			{calendarArray.length > 0 ? 
			<View style={{flex:1}}>
				<FlatList style={{}}
					data={calendarArray}
					keyExtractor={(item, index) => index.toString()}
					renderItem={({item}) => 
					<View style={{backgroundColor:'white'}}>
						<View style={{padding:8, paddingLeft:16}}>
							<View style={{flexDirection:'row',marginBottom:4}}>
								<Text style={{color:ThemeColor.SubTextColor, fontFamily:FontName.Regular, fontSize:16, marginRight:8}}>Payroll date:</Text>
								<Text style={{color:ThemeColor.TextColor, fontFamily:FontName.Regular, fontSize:16}}>{item.formattedPayrollDate}</Text>
							</View>
							<View style={{flexDirection:'row'}}>
								<Text style={{color:ThemeColor.SubTextColor, fontFamily:FontName.Regular, fontSize:16, marginRight:8}}>Period:</Text>
								<Text style={{color:ThemeColor.TextColor, fontFamily:FontName.Regular, fontSize:16}}>{item.formattedFromDate} to {item.formattedToDate}</Text>
							</View>
						</View>
						<View style={{height:12, backgroundColor:ThemeColor.BorderColor}} />
					</View>
					}
				/>
				</View> : 
				selectedIndex == 0 ? 
				<View style={{ flex: 1}}> 
					<View style={{alignContent: 'center', justifyContent: 'center', flex: 1,padding:16}}>
						<Text style={{fontSize:16, color:ThemeColor.TextColor,fontFamily: FontName.Regular, textAlign: 'center'}}>Are you looking for existing Weekly payroll information? Please contact HR for assistance.</Text>
					</View>
				</View> : 
				<View style={{flex: 1}}> 
					<View style={{alignContent: 'center', justifyContent: 'center', flex: 1,padding:16}}>
						<Text style={{fontSize:16, color:ThemeColor.TextColor,fontFamily: FontName.Regular, textAlign: 'center'}}>Are you looking for existing Semi-monthly payroll information? Please contact HR for assistance.</Text>
					</View>
				</View>
			}
			<Loader isLoading={isLoading} />
			<MovableView>
				<TouchableOpacity style={{
					position: 'absolute',
					margin: 16,
					right: 0,
					bottom:50,
					backgroundColor:ThemeColor.BtnColor,
					height:50, 
					width:50,
					borderRadius:25,
					justifyContent: 'center',
					alignItems: 'center'}} onPress={() => navigation.navigate('ChatBot')}>
					<Icon name="chatbubble-ellipses-outline" color={'white'} size={25} />
				</TouchableOpacity>
			</MovableView>
		</SafeAreaView>
	);
}

export default PayrollCalenderScreen;