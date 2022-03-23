import React,{useEffect} from "react";
import { 
	Text, 
    TouchableOpacity,
    StyleSheet, 
    View,
	FlatList,
	SafeAreaView,
	Alert
} from "react-native";
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'
import axios from 'axios'
import moment from 'moment';
// import OpenFile from 'react-native-doc-viewer';
import MovableView from 'react-native-movable-view';
import {getAuthHeader} from '../../_helpers/auth-header';
import { BaseUrl, EndPoints, StaticMessage, ThemeColor, FontName } from '../../_helpers/constants';
import Loader from '../../Components/Loader';


const RequestTimeoffScreen = ({route,navigation}) => {
	const [isLoading, setIsLoading] = React.useState(false);
	const [requetTimeoffArray, setRequestTimeoffArray] = React.useState([]);

	React.useLayoutEffect(() => {
		navigation.setOptions({
			headerRight: () => (
				<TouchableOpacity style={{marginRight:16, flexDirection:'row', justifyContent: 'center', alignItems: 'center'}} onPress={() => navigation.navigate('AddTimeoffRequest')}>
				  <Icon name="add-outline" color={'white'} size={20,20} />
				  <Text style={{fontSize:16, color:'white',fontFamily: FontName.Regular}}>New</Text>
				</TouchableOpacity> 
			  ),
			  title: `Time-off request`,
		});
	}, [navigation]);

	const showShareOptions = () =>{

	}
	useEffect(() => {
		navigation.addListener('focus', () => {
			getTimeoffRequest();
		})
		getTimeoffRequest();
		if(navigation.dangerouslyGetParent){
		  const parent = navigation.dangerouslyGetParent();
		  parent.setOptions({
			tabBarVisible: false
		  });
		  return () =>
			parent.setOptions({
			tabBarVisible: true
		  });
		}
		
	},[]);

	const  getTimeoffRequest = async() => {
		let user = await AsyncStorage.getItem('loginDetails');  
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken);

		setIsLoading(true);
		axios ({  
		  "method": "GET",
		  "url": BaseUrl + EndPoints.GetVacationList,
		  "headers": getAuthHeader(authToken)
		})
		.then((response) => {
			setIsLoading(false);

			if (response.data.code == 200){
				const results = JSON.stringify(response.data.content.dataList[0])
				console.log(results);
				setRequestTimeoffArray(response.data.content.dataList);
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
	const viewFile = (fileObject) => {
        console.log('File Path:', fileObject);
		navigation.navigate('DocumentViewer',{fileURL:fileObject.vacationFilePath,fileName:'Document'})
        
    }
	
	const getFormatedDateRange=(item) =>{
		let momentStartDate = moment(item.fromDate, 'YYYY-MM-DD');
		let momentEndDate = moment(item.toDate, 'YYYY-MM-DD');
		let startDateString = moment(momentStartDate).format('MMM DD, YYYY')
		let endDateString = moment(momentEndDate).format('MMM DD, YYYY')
		return `${startDateString} - ${endDateString}`;
	}
	const getFormatedRequestedDate=(item) =>{
		let momentStartDate = moment(item.requestedDate, 'YYYY-MM-DD');
		let startDateString = moment(momentStartDate).format('MMM DD, YYYY')
		return `${startDateString}`;
	}
	
	const description = 'Lorem ipsum dolor sit er elit lamet, consectetaur cillium adipisicing pecu, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Nam liber te conscient to factor tum poen legum odioque civiuda.'
	return(
		<SafeAreaView style={{flex:1,backgroundColor:ThemeColor.ViewBgColor, paddingBottom:34}}>
			{requetTimeoffArray.length > 0 ?
			<FlatList style={{}}
                data={requetTimeoffArray}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({item}) => 
                <View>
					<View  style={{backgroundColor:'#fff'}} >
						<View style ={{flexDirection:'row'}}>
							<View style={{paddingLeft:16, paddingRight:16,marginTop:8, flex:1}}>
								<Text style={{flex: 1, fontFamily: FontName.Regular, fontSize:16,color:ThemeColor.TextColor}}>{item.projectName}</Text>
								<Text style={{fontFamily: FontName.Regular, fontSize:14, color:ThemeColor.TextColor, marginTop:4}}>{getFormatedDateRange(item)}</Text>
								<View style={{flexDirection:'row', marginTop:4}}>
									<Text style={{fontFamily: FontName.Regular, fontSize:14,color:ThemeColor.SubTextColor}}>Reason: </Text>
									<Text style={{fontFamily: FontName.Regular, fontSize:14, color:ThemeColor.TextColor}}>{item.reason}</Text>
								</View>
								<View style={{flexDirection:'row', marginTop:4}}>
									<Text style={{fontFamily: FontName.Regular, fontSize:14,color:ThemeColor.SubTextColor}}>Requested on: </Text>
									<Text style={{fontFamily: FontName.Regular, fontSize:14, color:ThemeColor.TextColor}}>{getFormatedRequestedDate(item)}</Text>
								</View>
								<View style={{flexDirection:'row', marginTop:4}}>
									<Text style={{fontFamily: FontName.Regular, fontSize:14,color:ThemeColor.SubTextColor}}>Vacation type: </Text>
									<Text style={{fontFamily: FontName.Regular, fontSize:14, color:ThemeColor.TextColor}}>{item.vacationTypeName}</Text>
								</View>
								<View style={{flexDirection:'row', marginTop:4}}>
									<Text style={{fontFamily: FontName.Regular, fontSize:14,color:ThemeColor.SubTextColor}}>Vacation location: </Text>
									<Text style={{fontFamily: FontName.Regular, fontSize:14, color:ThemeColor.TextColor}}>{item.vacationLocation}</Text>
								</View>
								<View style={{flexDirection:'row', marginTop:4}}>
									<Text style={{fontFamily: FontName.Regular, fontSize:14,color:ThemeColor.SubTextColor}}>Rejoining same client: </Text>
									<Text style={{fontFamily: FontName.Regular, fontSize:14, color:ThemeColor.TextColor}}>{item.joinSameClient ? 'YES' : 'NO'}</Text>
								</View>
							</View>
							<View style = {{justifyContent:'center', alignItems:'center', marginRight:16, paddingLeft:8}}>
								<Text style={{fontFamily: FontName.Bold, fontSize:16,color:ThemeColor.TextColor}}>{item.numberOfDays}</Text>
								<Text style={{fontFamily: FontName.Regular, fontSize:14, color:ThemeColor.SubTextColor}}>days</Text>
								{item.vacationFilePath.length > 0 &&
								<TouchableOpacity style={{}} onPress={() => {viewFile(item)}}>
									<Text style={{fontFamily: FontName.Regular, fontSize:14,color:ThemeColor.BtnColor}}>View file</Text>
								</TouchableOpacity>}
							</View>
						</View>
						<View style={{flex: 1,height:1, backgroundColor:ThemeColor.BorderColor, marginTop:8}}/>
						<View style={{height:40, paddingLeft:16, paddingRight:16,justifyContent:'center'}}>
							<Text style={{fontFamily: FontName.Regular, fontSize:16, color: item.status === 'Approved' ? ThemeColor.GreenColor : ThemeColor.OrangeColor, textAlign:'center'}}>{item.status}</Text>
						</View>
					</View>
                	<View style={{height:12, backgroundColor:ThemeColor.BorderColor}} />
                </View>
                }
            /> :
			<View style={{flex:1, padding:16, justifyContent:'center'}}>
				<Text style={{fontFamily: FontName.Regular, fontSize:16, color:ThemeColor.TextColor, textAlign:'center'}}>No time-off request found. Go ahead and submit your new request.</Text>
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

export default RequestTimeoffScreen;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
    },inputView:{
        flexDirection:'row',
        paddingLeft:16,
        paddingRight:16,
        height:40,
        alignItems:"center", 
        backgroundColor:ThemeColor.BorderColor
    
      },
      bottomView:{
        flexDirection:'row',
        paddingLeft:16,
        paddingRight:16,
        height:40,
        backgroundColor:'#fff',
        alignItems:"center",
    
      }
  });