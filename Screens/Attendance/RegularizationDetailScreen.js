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
import { AuthContext } from '../../Components/context';
import {getAuthHeader} from '../../_helpers/auth-header';
import { LeaveMgrBaseURL, EndPoints, StaticMessage, ThemeColor, BaseUrl, FontName } from '../../_helpers/constants';
import Loader from '../../Components/Loader';
import { parseErrorATS } from '../../_helpers/Utils'


const RegularizationDetailScreen = ({route,navigation})  => {
	const [isLoading, setIsLoading] = React.useState(false);
	const [data, setData] = React.useState({
		reason:''
	})
	const { signOut } = React.useContext(AuthContext);
	const { leaveDetails } = route.params;
	const { isMyAttendance } = route.params;
	let [profileData, setProfileData] = React.useState({
		empDetails:{
			API_session_uuid:''
		}
	});
	React.useLayoutEffect(() => {
		navigation.setOptions({
		  title: "Regularization details",
		});
	}, [navigation]);
	
	useEffect(() => {
		getProfileDetails();
		
	}, []);
	const SessionExpiredAlert = () =>{
		Alert.alert(StaticMessage.AppName,StaticMessage.SessionExpired,
			[{
			  text: 'Ok',
			  onPress: () => signOut()
		  }]
	)}
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
	const updateStatus = () => {
		if(data.reason.length == 0){
			Alert.alert(StaticMessage.AppName, 'Please enter reason', [
				{text: 'Ok'}
			]);
			return;
		}
		updateRegularizationStatus(37134);
	}
	const  updateRegularizationStatus = async(statusType) => {
		let user = await AsyncStorage.getItem('loginDetails');  
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken);
		let employeeDetailsId = parsed.employeeDetailsId;
	
		setIsLoading(true);		
		let params = {
			"LoggedIn_EmployeeDetails_Id": employeeDetailsId,
			'Regularization_Id':leaveDetails.Regularization_Id,
			'AR_Status':statusType,
			'Remarks':data.reason
		}
		console.log('params: ',params);
		axios ({  
		  "method": "POST",
		  "url": LeaveMgrBaseURL + EndPoints.RegularizationStatusUpdate,
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
				console.log(Object.values(response.data.content.errors));
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
	const  cancelRegularizationStatus = async() => {
		let user = await AsyncStorage.getItem('loginDetails');  
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken);
		let employeeDetailsId = parsed.employeeDetailsId;
	
		setIsLoading(true);		
		let params = {
			"LoggedIn_EmployeeDetails_Id": employeeDetailsId,
			'Regularization_Id':leaveDetails.Regularization_Id,
			'Reason':data.reason
		}
		console.log('params: ',params);
		axios ({  
		  "method": "POST",
		  "url": LeaveMgrBaseURL + EndPoints.RegularizationStatusCancel,
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
				console.log(Object.values(response.data.content.errors));
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
	const  approveRegularization = async() => {
		let user = await AsyncStorage.getItem('loginDetails');  
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken);
		let employeeDetailsId = parsed.employeeDetailsId;
	
		setIsLoading(true);		
		let params = {
			"LoggedIn_EmployeeDetails_Id": employeeDetailsId,
			'Regularization_Id':leaveDetails.Regularization_Id,
			'Reason':data.reason
		}
		console.log('params: ',params);
		axios ({  
		  "method": "POST",
		  "url": LeaveMgrBaseURL + EndPoints.RegularizationStatusCancel,
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
				console.log(Object.values(response.data.content.errors));
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
	const  bulkUpdateRegularization = async(status) => {
		let user = await AsyncStorage.getItem('loginDetails');  
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken);
		let employeeDetailsId = parsed.employeeDetailsId;
		let session_uuid = profileData.empDetails.API_session_uuid;

		setIsLoading(true);		
		
		let params = {
			"LoggedIn_EmployeeDetails_Id": employeeDetailsId,
			'Regularization_Id':leaveDetails.Regularization_Id,
			'AR_Status':status,
			'Remarks':data.reason
		}
		let requestParams = {
			'API_session_uuid':session_uuid,
			'LoggedIn_EmployeeDetails_Id':employeeDetailsId,
			'data':[params]
		}
		console.log('URL: ',LeaveMgrBaseURL + EndPoints.RegularizationBulkUpdateStatus);
		axios ({  
		  "method": "POST",
		  "url": LeaveMgrBaseURL + EndPoints.RegularizationBulkUpdateStatus,
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
	
	const getStatusFromIds= (item) => {
		console.log(item);
		let key = item.AR_Status;
		let IsCancelRequest = item.IsCancelRequest;
		
		switch (key) {
			case 'Pending':
				return "Pending";
			case 'Approved':
				return "Approved";
			case 'Reject':
				return "Rejected";
			case 'Pullback':
				return "Pullback";
			case 'Cancelled':
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
				<View style={{flexDirection: 'row', justifyContent: 'space-between', paddingTop:12}}>
					<Text style={{fontSize:14, fontFamily: FontName.Regular, marginTop:4, color:ThemeColor.TextColor}}>{leaveDetails.CompanyEmployeeId}</Text>
					<Text style={{fontSize:14, fontFamily: FontName.Regular,  color:ThemeColor.SubTextColor}}>{leaveDetails.AR_Duration_Type}</Text>
				</View>
				<Text style={{fontSize:16, fontFamily: FontName.Regular, marginTop:4, color:ThemeColor.TextColor}}>{`${leaveDetails.EmployeeName}`}</Text>
				<Text style={{fontSize:14, fontFamily: FontName.Regular, marginTop:4, color:ThemeColor.SubTextColor}}>{leaveDetails.From_Date} - {leaveDetails.To_Date}</Text>
				<View style={{backgroundColor:ThemeColor.BorderColor, height:1, marginTop:12}}/>
				<View style={{flexDirection: 'row', justifyContent: 'space-between',paddingBottom:12, paddingTop:12}}>
					<Text style={{fontSize:14, fontFamily: FontName.Regular,  color:ThemeColor.SubTextColor, marginRight:8}}>Regularization category</Text>
					<Text style={{fontSize:14, fontFamily: FontName.Regular,  color:ThemeColor.TextColor}}>{leaveDetails.Category_Desc}</Text>
				</View>
				<View style={{backgroundColor:ThemeColor.BorderColor, height:1}}/>
				<View style={{flexDirection: 'row', justifyContent: 'space-between',paddingBottom:12, paddingTop:12}}>
					<Text style={{fontSize:14, fontFamily: FontName.Regular, color:ThemeColor.SubTextColor}}>Status</Text>
					<Text style={{fontSize:14, fontFamily: FontName.Regular, color:leaveDetails.AR_Status === 'Approved' ? ThemeColor.GreenColor : leaveDetails.IsCancelRequest ? ThemeColor.RedColor :  ThemeColor.RedColor}}>{getStatusFromIds(leaveDetails)}</Text>
				</View>
				<View style={{backgroundColor:ThemeColor.BorderColor, height:1,}}/>
				<Text style={{fontSize:14, fontFamily: FontName.Regular, marginTop:12, color:ThemeColor.SubTextColor}}>Reason details</Text>
				<Text style={{fontSize:14, fontFamily: FontName.Regular, marginTop:4, marginBottom:4,color:ThemeColor.TextColor}}>{leaveDetails.Reason}</Text>
				<View style={{backgroundColor:ThemeColor.BorderColor, height:1, marginTop:8}}/>
				{(leaveDetails.AR_Status === 'Pending' || leaveDetails.AR_Status === 'Approved') && !leaveDetails.IsCancelRequest ?
				<>
				<Text style={{fontSize:14, fontFamily: FontName.Regular, marginTop:12, color:ThemeColor.SubTextColor}}> Enter your reason</Text>
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
				</> :  null }
				
				<Loader isLoading={isLoading} />
			</View>
			</KeyboardAwareScrollView>
			{leaveDetails.AR_Status === 'Pending' && !isMyAttendance?
			<View style={{flexDirection:'row', paddingLeft:16, paddingRight:16,marginBottom:8}}>
				<TouchableOpacity style={[styles.btnFill,{flex:1,margin:0, marginRight:8}]} onPress={() => {bulkUpdateRegularization(37133)}}>
					<Text style={{color:'#53962E',fontFamily: FontName.Regular, fontSize:16, color:'#fff' }}>REJECT</Text>
				</TouchableOpacity>
				<TouchableOpacity style={[styles.btnFill,{flex:1, margin:0,marginLeft:8}]} onPress={() => {bulkUpdateRegularization(37132)}}>
					<Text style={{color:'#53962E',fontFamily: FontName.Regular, fontSize:16, color:'#fff' }}>APPROVE</Text>
				</TouchableOpacity>
			</View>:
			leaveDetails.AR_Status === 'Pending' ?

			<TouchableOpacity style={styles.btnFill} onPress={() => {updateStatus()}}>
				<Text style={{color:'#53962E',fontFamily: FontName.Regular, fontSize:16, color:'#fff' }}>PULLBACK</Text>
			</TouchableOpacity> : 
			leaveDetails.AR_Status == "Approved" && !leaveDetails.IsCancelRequest ?
			 <TouchableOpacity style={styles.btnFill} onPress={() => {cancelRegularizationStatus()}}>
			 	<Text style={{color:'#53962E',fontFamily: FontName.Regular, fontSize:16, color:'#fff' }}>CANCEL ATTENDANCE</Text>
		 	</TouchableOpacity> : null
			}
		</SafeAreaView>
	);
}

export default RegularizationDetailScreen;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:'#fff',
	  padding:16
	  
    },inputText:{
		flex: 1,
		height:40,
		color:'black',
		fontSize:14,
		fontFamily: FontName.Regular,
		marginLeft:8,
		alignContent:'stretch',
	  },btnFill:{
        margin: 16,
        height:50,
        justifyContent:"center",
        backgroundColor:ThemeColor.BtnColor ,
        alignItems:'center',
        borderRadius:5,
      }
  });
