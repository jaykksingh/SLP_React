import React ,{useEffect}from 'react';
import { View ,
    TouchableOpacity,
    StyleSheet,
    Alert,
	SafeAreaView,
	TextInput,
	Text} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'
import axios from 'axios'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import {getAuthHeader} from '../../_helpers/auth-header';
import { BaseUrl, EndPoints, StaticMessage, ThemeColor,LeaveMgrBaseURL, FontName } from '../../_helpers/constants';
import Loader from '../../Components/Loader';
import { parseErrorATS } from '../../_helpers/Utils'


const LeaveDetailsScreen = ({route,navigation})  => {
	const [isLoading, setIsLoading] = React.useState(false);
	const [data, setData] = React.useState({
		reason:''
	})
	let [profileData, setProfileData] = React.useState({
		empDetails:{
			API_session_uuid:''
		}
	});
	const { leaveDetails } = route.params;
	const { isMyLeave } = route.params;

	React.useLayoutEffect(() => {
		navigation.setOptions({
		  title: "Leave details",
		});
	}, [navigation]);
	
	useEffect(() => {
		console.log(leaveDetails);
		getProfileDetails();
		
	}, []);
	const getProfileDetails = async() => {
		let user = await AsyncStorage.getItem('loginDetails');  
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken);    
	  
		setIsLoading(true);
		axios ({  
		  "method": "GET",
		  "url": BaseUrl + EndPoints.UserProfile,
		  "headers": getAuthHeader(authToken)
		})
		.then((response) => {
			setIsLoading(false);
			if (response.data.code == 200){
				setProfileData(response.data.content.dataList[0]);
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
		})
		.catch((error) => {
			setIsLoading(false);
			if(error.response.status == 401){
				SessionExpiredAlert();
			}else{
				Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
					{text: 'Ok'}
				  ]);
			}
			console.log('Error:',error);      
		})
	}
	const  approveLeaveRequest = async() => {
		let user = await AsyncStorage.getItem('loginDetails');  
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken);
		let employeeDetailsId = parsed.employeeDetailsId;
		let session_uuid = profileData.empDetails.API_session_uuid;

		setIsLoading(true);		
		let params = {
			'LeaveRequestId':leaveDetails.leaveRequestId,
			'Reason':data.reason,
			'API_session_uuid':session_uuid,
			'LeaveStatus':'102',
			'PreviousLeaveStatus':leaveDetails.status

		}
		let requestParams = {
			'API_session_uuid':session_uuid,
			'LoggedIn_EmployeeDetails_Id':employeeDetailsId,
			'data':[params]
		}
		console.log('params: ',requestParams);
		axios ({  
		  "method": "POST",
		  "url": LeaveMgrBaseURL + EndPoints.LeaveApprove,
		  "headers": {'Authorization':'qwerty~!@','Content-Type':'application/json'},
		  data:requestParams
		})
		.then((response) => {
      		setIsLoading(false);
			  console.log('Regularization:',JSON.stringify(response.data));
		  	if (response.data.header == 200){
				console.log('Regularization:',JSON.stringify(response.data.content.data.message));
				let message =  response.data.content.data.message;
				Alert.alert(StaticMessage.AppName, message, [
					{text: 'Ok',
					onPress:() => navigation.goBack()	
				}
				]);
			}else{
				const message = parseErrorATS(response.data.content.errors.details);
				Alert.alert(StaticMessage.AppName, message, [
					{text: 'Ok'}
				]);
			}
		})
		.catch((error) => {
		console.log(error);
		  setIsLoading(false);
		  Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
			{text: 'Ok'}
		  ]);
	
		})
	}
	const  rejectLeaveRequest = async() => {
		let user = await AsyncStorage.getItem('loginDetails');  
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken);
		let employeeDetailsId = parsed.employeeDetailsId;
		let session_uuid = profileData.empDetails.API_session_uuid;

		setIsLoading(true);		
		let params = {
			'LeaveRequestId':leaveDetails.leaveRequestId,
			'Reason':data.reason,
			'API_session_uuid':session_uuid,
			'LeaveStatus':'103',
		}
		let requestParams = {
			'API_session_uuid':session_uuid,
			'LoggedIn_EmployeeDetails_Id':employeeDetailsId,
			'data':[params]
		}
		console.log('params: ',requestParams);
		axios ({  
		  "method": "POST",
		  "url": LeaveMgrBaseURL + EndPoints.LeaveReject,
		  "headers": {'Authorization':'qwerty~!@','Content-Type':'application/json'},
		  data:requestParams
		})
		.then((response) => {
      		setIsLoading(false);
			  console.log('Regularization:',JSON.stringify(response.data));
		  	if (response.data.header == 200){
				console.log('Regularization:',JSON.stringify(response.data.content.data.message));
				let message =  response.data.content.data.message;
				Alert.alert(StaticMessage.AppName, message, [
					{text: 'Ok',
					onPress:() => navigation.goBack()	
				}
				]);
			}else{
				const message = parseErrorATS(response.data.content.errors.details);
				Alert.alert(StaticMessage.AppName, message, [
					{text: 'Ok'}
				]);
			}
		})
		.catch((error) => {
		console.log(error);
		  setIsLoading(false);
		  Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
			{text: 'Ok'}
		  ]);
	
		})
	}
	const  cancelLeaveRequest = async() => {
		let user = await AsyncStorage.getItem('loginDetails');  
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken);
		let employeeDetailsId = parsed.employeeDetailsId;
		let session_uuid = profileData.empDetails.API_session_uuid;

		setIsLoading(true);		
		let params = {
			'LeaveRequestId':leaveDetails.leaveRequestId,
			'Reason':data.reason,
			'API_session_uuid':session_uuid,
			'PreviousLeaveStatus':leaveDetails.status,
		}
		
		axios ({  
		  "method": "POST",
		  "url": LeaveMgrBaseURL + EndPoints.LeaveCancel,
		  "headers": {'Authorization':'qwerty~!@','Content-Type':'application/json'},
		  data:params
		})
		.then((response) => {
      		setIsLoading(false);
			  console.log('Regularization:',JSON.stringify(response.data));
		  	if (response.data.header == 200){
				console.log('Regularization:',JSON.stringify(response.data.content.data.message));
				let message =  response.data.content.data.message;
				Alert.alert(StaticMessage.AppName, message, [
					{text: 'Ok',
					onPress:() => navigation.goBack()	
				}
				]);
			}else{
				const message = parseErrorATS(response.data.content.errors.details);
				Alert.alert(StaticMessage.AppName, message, [
					{text: 'Ok'}
				]);
			}
		})
		.catch((error) => {
		console.log(error);
		  setIsLoading(false);
		  Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
			{text: 'Ok'}
		  ]);
	
		})
	}
	const  pullbackLeaveRequest = async() => {
		let user = await AsyncStorage.getItem('loginDetails');  
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken);
		let employeeDetailsId = parsed.employeeDetailsId;
		let session_uuid = profileData.empDetails.API_session_uuid;

		setIsLoading(true);		
		let params = {
			'LeaveRequestId':leaveDetails.leaveRequestId,
			'Reason':data.reason,
			'API_session_uuid':session_uuid,
			'LeaveStatus':'104',
			'PreviousLeaveStatus':leaveDetails.status,
		}
		
		axios ({  
		  "method": "POST",
		  "url": LeaveMgrBaseURL + EndPoints.LeavePullBack,
		  "headers": {'Authorization':'qwerty~!@','Content-Type':'application/json'},
		  data:params
		})
		.then((response) => {
      		setIsLoading(false);
			  console.log('Regularization:',JSON.stringify(response.data));
		  	if (response.data.header == 200){
				console.log('Regularization:',JSON.stringify(response.data.content.data.message));
				let message =  response.data.content.data.message;
				Alert.alert(StaticMessage.AppName, message, [
					{text: 'Ok',
					onPress:() => navigation.goBack()	
				}
				]);
			}else{
				const message = parseErrorATS(response.data.content.errors.details);
				Alert.alert(StaticMessage.AppName, message, [
					{text: 'Ok'}
				]);
			}
		})
		.catch((error) => {
		console.log(error);
		  setIsLoading(false);
		  Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
			{text: 'Ok'}
		  ]);
	
		})
	}
	
	const getStatusFromIds= (key) => {
		switch (key) {
			case 101:
				return "Pending";
			case 102:
				return "Approved";
			case 103:
				return "Rejected";
			case 104:
				return "Pullback";
			case 105:
				return "Cancelled";
			default:
				break;
		}
		return "Pending";
	}

	return(
		<SafeAreaView style={styles.container}>
			<KeyboardAwareScrollView>
			<View style={{padding:16, flex:1}}>
				<Text style={{fontSize:16, fontFamily: FontName.Regular, marginTop:4, color:ThemeColor.TextColor}}>{leaveDetails.CompanyEmployeeId}</Text>
				<Text style={{fontSize:16, fontFamily: FontName.Regular, marginTop:4, color:ThemeColor.TextColor}}>{`${leaveDetails.firstName} ${leaveDetails.lastName}`}</Text>
				<Text style={{fontSize:16, fontFamily: FontName.Regular, marginTop:4, color:ThemeColor.TextColor}}>{leaveDetails.fromDate} - {leaveDetails.toDate}</Text>
				<View style={{backgroundColor:ThemeColor.BorderColor, height:1, marginTop:8}}/>
				<View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
					<Text style={{fontSize:16, fontFamily: FontName.Regular, marginTop:4, color:ThemeColor.SubTextColor}}>Leave type</Text>
					<Text style={{fontSize:16, fontFamily: FontName.Regular, marginTop:4, color:ThemeColor.TextColor}}>{leaveDetails.leaveType}</Text>
				</View>
				<View style={{backgroundColor:ThemeColor.BorderColor, height:1, marginTop:8}}/>
				<View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
					<Text style={{fontSize:16, fontFamily: FontName.Regular, marginTop:4, color:ThemeColor.SubTextColor}}>Status</Text>
					<Text style={{fontSize:16, fontFamily: FontName.Regular, marginTop:4, color:leaveDetails.status === 102 ? ThemeColor.GreenColor : ThemeColor.RedColor}}>{getStatusFromIds(leaveDetails.status)}</Text>
				</View>
				<View style={{backgroundColor:ThemeColor.BorderColor, height:1, marginTop:8}}/>
				<Text style={{fontSize:16, fontFamily: FontName.Regular, marginTop:4, color:ThemeColor.SubTextColor}}>Reason</Text>
				<Text style={{fontSize:16, fontFamily: FontName.Regular, marginTop:4, color:ThemeColor.TextColor}}>{leaveDetails.reason}</Text>
				<View style={{backgroundColor:ThemeColor.BorderColor, height:1, marginTop:8}}/>
				{leaveDetails.status == 101 || leaveDetails.status == 102 && !leaveDetails.IsCancelRequest?
				<>
				<Text style={{fontSize:16, fontFamily: FontName.Regular, marginTop:12, color:ThemeColor.SubTextColor}}> Enter your reason</Text>
				<View style={{borderColor:ThemeColor.BorderColor, borderWidth:1,height:140, borderRadius:3, flexDirection:'row', alignItems:'center', paddingRight:8, marginTop:8}}>
					<TextInput  
						style={[styles.inputText,{height:130, textAlignVertical:'top'}]}
						multiline={true}
						placeholder="Enter your remark here..." 
						placeholderTextColor={ThemeColor.PlaceHolderColor}
						keyboardType='default'
						value= {data.reason}
						onChangeText={(val) => setData({...data,reason:val})}
					/>
				</View>
				</> : null}
				
				<Loader isLoading={isLoading} />
			</View>
			</KeyboardAwareScrollView>
			{leaveDetails.status == 101 && !isMyLeave?
			<View style={{flexDirection:'row', paddingLeft:16, paddingRight:16,marginBottom:8}}>
				<TouchableOpacity style={[styles.btnFill,{marginRight:8}]} onPress={() => {rejectLeaveRequest()}}>
					<Text style={{color:'#53962E',fontFamily: FontName.Regular, fontSize:16, color:'#fff' }}>REJECT</Text>
				</TouchableOpacity>
				<TouchableOpacity style={[styles.btnFill,{marginLeft:8}]} onPress={() => {approveLeaveRequest()}}>
					<Text style={{color:'#53962E',fontFamily: FontName.Regular, fontSize:16, color:'#fff' }}>APPROVE</Text>
				</TouchableOpacity>
			</View> : leaveDetails.status == 102 && !leaveDetails.IsCancelRequest ? 
			<TouchableOpacity style={[styles.btnFill2,{marginLeft:16, marginRight:16,marginBottom:8}]} onPress={() => {cancelLeaveRequest()}}>
				<Text style={{color:'#53962E',fontFamily: FontName.Regular, fontSize:16, color:'#fff' }}>CANCEL</Text>
			</TouchableOpacity> : 
			leaveDetails.status == 101 && isMyLeave ? 
			<TouchableOpacity style={[styles.btnFill2,{marginLeft:16, marginRight:16, marginBottom:8}]} onPress={() => {pullbackLeaveRequest()}}>
				<Text style={{color:'#53962E',fontFamily: FontName.Regular, fontSize:16, color:'#fff' }}>PULLBACK LEAVE</Text>
			</TouchableOpacity> : null
			}
		</SafeAreaView>
	);
}

export default LeaveDetailsScreen;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:'#fff',
	  padding:16
	  
    },inputText:{
		flex: 1,
		height:40,
		color:'black',
		fontSize:16,
		fontFamily: FontName.Regular,
		marginLeft:8,
		alignContent:'stretch',
	  },btnFill:{
		flex:1,
        height:50,
        justifyContent:"center",
        backgroundColor:ThemeColor.BtnColor ,
        alignItems:'center',
        borderRadius:5,
      },
	  btnFill2:{
        height:50,
        justifyContent:"center",
        backgroundColor:ThemeColor.BtnColor ,
        alignItems:'center',
        borderRadius:5,
		marginBottom:8
      }
  });
