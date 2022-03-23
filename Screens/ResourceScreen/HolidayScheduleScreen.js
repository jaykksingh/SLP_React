import React ,{useEffect,useState}from 'react';
import { View ,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    Alert,
	SafeAreaView,
    Text} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'
import axios from 'axios'
// import OpenFile from 'react-native-doc-viewer';
import moment from 'moment';
import MovableView from 'react-native-movable-view';
import Icon from 'react-native-vector-icons/Ionicons';
import {getAuthHeader} from '../../_helpers/auth-header';
import { BaseUrl, EndPoints, StaticMessage, ThemeColor, FontName } from '../../_helpers/constants';
import Loader from '../../Components/Loader';


const HolidayScheduleScreen = ({navigation})  => {
	const [isLoading, setIsLoading] = React.useState(false);
	const [holidayArr, setHolidayArr] = React.useState([]);

	React.useLayoutEffect(() => {
		navigation.setOptions({
		  title: "Holiday schedule",
		});
	}, [navigation]);

	
	useEffect(() => {
		getHolidayList();
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
	}, []);

	const  getHolidayList = async() => {

		let user = await AsyncStorage.getItem('loginDetails');  
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken);

		setIsLoading(true);
		axios ({  
		  "method": "GET",
		  "url": BaseUrl + EndPoints.HolidayScheduleList,
		  "headers": getAuthHeader(authToken)
		})
		.then((response) => {
		  setIsLoading(false);
		  if (response.data.code == 200){
			const results = JSON.stringify(response.data.content.dataList[0])
			console.log(`Holiday: ${results}`);
			setHolidayArr(response.data.content.dataList);
		  }else if (response.data.code == 417){
			console.log(Object.values(response.data.content.messageList));
			const errorList = Object.values(response.data.content.messageList);
			Alert.alert(StaticMessage.AppName, errorList.join(), [
			  {text: 'Ok'}
			]);
	
		  }
		})
		.catch((error) => {
		  console.error(error);
		  setIsLoading(false);
		  Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
			{text: 'Ok'}
		  ]);
	
		})
	}
	const viewFile = (fileObject) => {
        console.log('File Path:', fileObject.documentExpenseFileLocation);
        // if(Platform.OS === 'ios'){
        //     //IOS
        //     OpenFile.openDoc([{
        //         url:fileObject.formDoc,
        //         fileNameOptional:fileObject.benefitName
        //     }], (error, url) => {
        //         if (error) {
        //         console.error(error);
        //         } else {
        //         console.log('Filte URL:',url)
        //         }
        //     })
        // }else{
        //     //Android
        //     OpenFile.openDoc([{
        //         url:fileObject.formDoc, // Local "file://" + filepath
        //         fileName:fileObject.benefitName,
        //         cache:false,
        //         fileType:"jpg"
        //     }], (error, url) => {
        //         if (error) {
        //         console.error(error);
        //         } else {
        //         console.log(url)
        //         }
        //     })
        // }
    }
	const getFormatedDate=(item) =>{
		let momentStartDate = moment(item.holidayDate, 'YYYY-MM-DD');
		let startDateString = moment(momentStartDate).format('MMM DD, YYYY')	  
		return `${startDateString}`;
	}

	return(
		<SafeAreaView style={styles.container}>			
			{holidayArr.length > 0 ?
			<FlatList style={{}}
				data={holidayArr}
				keyExtractor={(item,index) => index.toString()}
				renderItem={({item, index}) => 
					<View style={{backgroundColor:'#fff', paddingLeft:16}}>
						<View style={{flex:1,paddingRight:8, paddingTop:8, paddingBottom:8}} onPress={() => {viewFile(item)}}>
							<Text style={{fontSize:16, color:ThemeColor.NavColor,fontFamily: FontName.Regular}}>{getFormatedDate(item)}</Text>
							<Text style={{fontSize:16, color:ThemeColor.TextColor,fontFamily: FontName.Regular}}>{item.holidayDetail}</Text>
						</View>
						<View style={{backgroundColor:ThemeColor.BorderColor, height:1}} />
					</View>
				}
			/> : 
			<View style={{flex:1,justifyContent: 'center',alignItems: 'center'}}>
				<Text style={{fontSize:16, color:ThemeColor.TextColor,fontFamily: FontName.Regular}}>No data available</Text>
			</View>}
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

export default HolidayScheduleScreen;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:ThemeColor.ViewBgColor,
	  
    }
  });
