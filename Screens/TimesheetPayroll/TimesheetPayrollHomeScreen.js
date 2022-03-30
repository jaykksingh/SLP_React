import React ,{useEffect,useState}from 'react';
import { View ,
    useWindowDimensions,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Alert,
	SafeAreaView,
    Text} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'
import axios from 'axios'
import MovableView from 'react-native-movable-view';
import Icon from 'react-native-vector-icons/Ionicons';
import Loader from '../../Components/Loader';
import {getAuthHeader} from '../../_helpers/auth-header';
import { BaseUrl, EndPoints, StaticMessage,ThemeColor, FontName } from '../../_helpers/constants';

const TimesheetPayrollHomeScreen = ({route,navigation})  => {
	const {profileDetail} = route.params;
	const [isLoading, setIsLoading] = React.useState(false);
	const [timesheetsArray, setTimesheetsArray] = React.useState([]);

	React.useLayoutEffect(() => {
		navigation.setOptions({
		  title: "Timesheet and  Payroll",
		});
	}, [navigation]);

	React.useEffect(() => {
		getTimeshetsList();
	},[])
	const  getPayrollInfo = async() => {
		let user = await AsyncStorage.getItem('loginDetails');  
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken);

		setIsLoading(true);
		axios ({  
		  "method": "GET",
		  "url": BaseUrl + EndPoints.PayrollInfo,
		  "headers": getAuthHeader(authToken)
		})
		.then((response) => {
			setIsLoading(false);
			if (response.data.code == 200){
				const results = JSON.stringify(response.data.content.dataList[0])
				navigation.navigate('PayrollInformation',{payrollInfo:response.data.content.dataList[0]})
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
	const  getTimeshetsList = async() => {
		let user = await AsyncStorage.getItem('loginDetails');  
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken);
	
		setIsLoading(true);
		
		axios ({  
		  "method": "POST",
		  "url": BaseUrl + EndPoints.GetTimehsstes,
		  "headers": getAuthHeader(authToken),
		  data:{"status":"pending",'startDate':"",'endDate':""}
		})
		.then((response) => {
      	setIsLoading(false);
			if (response.data.code == 200){
				setTimesheetsArray(response.data.content.dataList);
			}else if (response.data.code == 417){
				console.log(Object.values(response.data.content.messageList));
				const errorList = Object.values(response.data.content.messageList);
				Alert.alert(StaticMessage.AppName, errorList.join(), [
					{text: 'Ok'}
				]);
			}else if (response.data.code == 401){
				console.log('Session Expired Already');
				SessionExpiredAlert();
			}
		}).catch((error) => {
			setIsLoading(false);
			if (!error.status) {
			Alert.alert(StaticMessage.AppName, StaticMessage.NoInternetMessage, [
				{text: 'Ok'}
			]);
			}else if(error.response.status == 401){
			SessionExpiredAlert();
			}else{
				Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
					{text: 'Ok'}
				]);
			}
    	})
	}
	
	var showPayrollInfo = false;
	var showPayrollCalender = false;
	var showExpence = false;
	var showPayrollStatus = false;

	if(profileDetail){
		let empDetails = profileDetail.empDetails;
		let authorisationStatusId = empDetails.authorisationStatusId;
		let employeeTypeId = empDetails.employeeTypeId;
		if(authorisationStatusId == 1 || authorisationStatusId == 2 || employeeTypeId == 1223){
			showPayrollInfo = showPayrollCalender =  showExpence = false;
		}else{
			showPayrollInfo = showPayrollCalender =  showExpence = true;
		}
		if(employeeTypeId == 1221 || employeeTypeId == 1222){
			showPayrollStatus = true;
		}else{
			showPayrollStatus = false;
		}
	}
	showPayrollInfo = true;
	showPayrollCalender = true;
	showExpence = true;
	showPayrollStatus = true;

	return(
		<SafeAreaView style={{flex:1,backgroundColor:'#E5E9EB'}}>
		<View style={styles.container}>
			<View style={{backgroundColor:'#fff',marginTop:16}}>
				<TouchableOpacity style={{height:40,paddingLeft:16, alignItems:'center', flexDirection:'row',paddingRight:8}} onPress={() => navigation.navigate('Timesheets',{timesheetsList:timesheetsArray})}>
					<Text style={{flex: 1,fontSize:16, color:ThemeColor.TextColor,fontFamily: FontName.Regular}}>Manage timesheet</Text>
					<Feather name="chevron-right" color={ThemeColor.BorderColor} size={22,22} />
				</TouchableOpacity>
				<View style={{height:1, backgroundColor:ThemeColor.BorderColor, paddingLeft:16}}/>
			</View>
			{showPayrollInfo ?
			<View style={{backgroundColor:'#fff'}}>
				<TouchableOpacity style={{height:40,paddingLeft:16, alignItems:'center', flexDirection:'row',paddingRight:8}}  onPress={() => getPayrollInfo()}>
					<Text style={{flex: 1,fontSize:16, color:ThemeColor.TextColor,fontFamily: FontName.Regular}}>Payroll information</Text>
					<Feather name="chevron-right" color={ThemeColor.BorderColor} size={22,22} />
				</TouchableOpacity>
				<View style={{height:1, backgroundColor:ThemeColor.BorderColor, paddingLeft:16}}/>
			</View> : null }
			{showPayrollCalender ?
			<View style={{backgroundColor:'#fff'}}>
				<TouchableOpacity style={{height:40,paddingLeft:16, alignItems:'center', flexDirection:'row',paddingRight:8}}  onPress={() => navigation.navigate('PayrollCalender')}>
					<Text style={{flex: 1,fontSize:16, color:ThemeColor.TextColor,fontFamily: FontName.Regular}}>Payroll calendar</Text>
					<Feather name="chevron-right" color={ThemeColor.BorderColor} size={22,22} />
				</TouchableOpacity>
				<View style={{height:1, backgroundColor:ThemeColor.BorderColor, paddingLeft:16}}/>
			</View> : null}
			{showExpence ? 
			<View style={{backgroundColor:'#fff'}}>
				<TouchableOpacity style={{height:40,paddingLeft:16, alignItems:'center', flexDirection:'row',paddingRight:8}}  onPress={() => navigation.navigate('ExpenceScreen')}>
					<Text style={{flex: 1,fontSize:16, color:ThemeColor.TextColor,fontFamily: FontName.Regular}}>Expense management</Text>
					<Feather name="chevron-right" color={ThemeColor.BorderColor} size={22,22} />
				</TouchableOpacity>
				<View style={{height:1, backgroundColor:ThemeColor.BorderColor, paddingLeft:16}}/>
			</View> : null}
			<View style={{backgroundColor:'#fff'}}>
				<TouchableOpacity style={{height:40,paddingLeft:16, alignItems:'center', flexDirection:'row',paddingRight:8}} onPress={() => navigation.navigate('RequestTimeoff')}>
					<Text style={{flex: 1,fontSize:16, color:ThemeColor.TextColor,fontFamily: FontName.Regular}}>Request time-off</Text>
					<Feather name="chevron-right" color={ThemeColor.BorderColor} size={22,22} />
				</TouchableOpacity>
				<View style={{height:1, backgroundColor:ThemeColor.BorderColor, paddingLeft:16}}/>
			</View>
			{showPayrollStatus ?
			<View style={{backgroundColor:'#fff'}}>
				<TouchableOpacity style={{height:40,paddingLeft:16, alignItems:'center', flexDirection:'row',paddingRight:8}} onPress={() => navigation.navigate('PaymentStatus')}>
					<Text style={{flex: 1,fontSize:16, color:ThemeColor.TextColor,fontFamily: FontName.Regular}}>Payroll Status</Text>
					<Feather name="chevron-right" color={ThemeColor.BorderColor} size={22,22} />
				</TouchableOpacity>
				<View style={{height:1, backgroundColor:ThemeColor.BorderColor, paddingLeft:16}}/>
			</View> : null}
			<Loader isLoading={isLoading} />
			
		</View>
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

export default TimesheetPayrollHomeScreen;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:'#E5E9EB' 
    },
    tabBar: {
      flexDirection: 'row',
      paddingTop: 0,
      backgroundColor:'#F6F6F6',
    },
    tabItem: {
      flex: 1,
      alignItems: 'center',
      padding: 16,
      fontSize: 10
    },btnFill:{
        width:'100%',
        margin: 16,
        height:50,
        justifyContent:"center",
        backgroundColor:'#fff' ,
        alignItems:'center',
        borderRadius:5,
      }
  });
