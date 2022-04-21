import React ,{useEffect,useState,createRef} from "react";
import { StatusBar, 
    StyleSheet, 
    Text,
    TouchableOpacity,
    Dimensions,
    View,
    SafeAreaView,
    Alert,
    FlatList,
    TextInput,
    Switch,
    Button,
	Platform
} from "react-native";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'
import axios from 'axios'
import Icon from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import ActionSheet from "react-native-actions-sheet";
import {Picker} from '@react-native-picker/picker';
import moment from 'moment';
import DatePicker from 'react-native-date-picker'
import Loader from '../../Components/Loader';
import {getAuthHeader} from '../../_helpers/auth-header';
import { BaseUrl,LeaveMgrBaseURL ,EndPoints, StaticMessage, ThemeColor, FontName } from '../../_helpers/constants';
import {parseErrorMessage} from '../../_helpers/Utils';


const leaveTypeRef = createRef();
const startDateRef = createRef();
const endDateRef = createRef();


const AddLeaveScreen = ({route,navigation}) => {
	const [isLoading,setIsLoading] = React.useState(false);
	const [data,setData] = React.useState({
		leaveType:'',
		leaveTypeID:0,
		fullDay:true,
		firstHalf:false,
		secondHalf:false,
		startDate:'',
		endDate:'',
		reason:'',
		contact:'',
		address:'',
		balance:0,
		pending:0,
		allowNegativeLeave:''
	});
	const [startDate,setStartDate] = React.useState(new Date());
	const [endDate,setEndDate] = React.useState(new Date());
	const [leaveTypeArr,setLeaveTypeArr] = React.useState([]);
	let [profileData, setProfileData] = React.useState({
		empDetails:{
			API_session_uuid:''
		}
	});
	

  

	React.useLayoutEffect(() => {
		navigation.setOptions({
		title : 'New leave'
		});
	}, [navigation]);
	
	useEffect(() => {
		getLookupsData();
		getProfileDetails();
		
		
	},[])

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
	
	const  getLookupsData = async() => {
		let user = await AsyncStorage.getItem('loginDetails');  
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken);
	
		setIsLoading(true);
		axios ({  
		  "method": "GET",
		  "url": BaseUrl + EndPoints.LeaveLookUp,
		  "headers": getAuthHeader(authToken)
		})
		.then((response) => {
		  if (response.data.code == 200){
			setIsLoading(false);
			console.log('Leave type:',response.data.content.dataList);
			setLeaveTypeArr(response.data.content.dataList);
		  }else if (response.data.code == 417){
			setIsLoading(false);
			console.log(Object.values(response.data.content.messageList));
			const errorList = Object.values(response.data.content.messageList);
			Alert.alert(StaticMessage.AppName, errorList.join(), [
			  {text: 'Ok'}
			]);
	
		  }else{
			setIsLoading(false);
		  }
		})
		.catch((error) => {
			setIsLoading(false);
			Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
			  {text: 'Ok'}
			]);
		})
	  }

	const  handleSubmit = () => {
		const empDetails =  profileData.empDetails;
		let session_uuid = empDetails.API_session_uuid;

		setIsLoading(true);
		var cleaned = data.contact.replace(/\D/g, '')

		let params = {
			'API_session_uuid':session_uuid,
			'From_Date':data.startDate,
			'To_Date':data.endDate,
			'LeaveTypeId':'' + data.leaveTypeID,
			'FullHalfDay':data.fullDay ? 'fd' : data.firstHalf ? 'fh' : 'sh',
			'Reason':data.reason,
			'LeaveContact':cleaned,
			'LeaveAddress':data.address,
			'LeaveStatus':'101'
		};
		console.log(params);
		
		axios ({  
		  "method": "POST",
		  "url": LeaveMgrBaseURL + EndPoints.LeaveRequst,
		  "headers": {'Authorization':'qwerty~!@','Content-Type':'application/json'},
		  data:params
		})
		.then((response) => {
      		setIsLoading(false);
		  	if (response.data.header == 200){
				  console.log
				const message = response.data.content.data.message;
				Alert.alert(StaticMessage.AppName, message, [{
					text: 'Ok',
					onPress: () => navigation.goBack()
				}]);
			}else if (response.data.header == 417){
				var message = parseErrorMessage(response.data.content.errors.details);
				console.log('Error: ', JSON.stringify(response.data.content.errors));
				if( message.length == 0){
					message =  '1. ' + response.data.content.errors.message
				}
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
  
	const toggleSwitchFullDay = () => {
		setData({...data,fullDay:true, firstHalf:false,secondHalf:false});
	}
	const toggleSwitchFirstHalf = () => {
		setData({...data,fullDay:false, firstHalf:true,secondHalf:false});
	}
	const toggleSwitchSecondHalf = () => {
		setData({...data,fullDay:false, firstHalf:false,secondHalf:true});
	}
	const handleStartDateChange = (val) => {
		setStartDate(val);
		console.log("Start Date:",val.toString());
		let showDate = moment(val).format('MMM DD, YYYY')
		setData({...data,startDate:showDate});
	}
	const handleEndDateChange = (val) => {
		setEndDate(val);
		console.log("End Date:",val.toString());
		let showDate = moment(val).format('MMM DD, YYYY')
		setData({...data,endDate:showDate});
	}
	const textPhoneChange = (text) => {
		var cleaned = ('' + text).replace(/\D/g, '')
		var match = cleaned.match(/^(1|)?(\d{3})(\d{3})(\d{4})$/)
		if (match) {
			var intlCode = (match[1] ? '+1 ' : ''),
				number = [intlCode, '(', match[2], ') ', match[3], '-', match[4]].join('');
			   
			setData({...data,contact:number})
			return;
		}
		setData({...data,contact: text});
	}
	const handleHelpBtn = () => {
		let message = `Negative leaves allowed ${data.allowNegativeLeave}`
		Alert.alert(StaticMessage.AppName, message, [
			{text: 'Ok'}
		  ]);
	}
  	return (
		<SafeAreaView style={styles.container}>
			<KeyboardAwareScrollView style={{paddingLeft:16, paddingRight:16, marginTop:16,marginBottom:8,width:'100%' }}>
				
				<View style={{marginTop:12}}>
					<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Leave type</Text>
					<View style={{backgroundColor:'white',borderRadius:5 ,marginTop:0,}}>
						{Platform.OS == 'ios' ?
							<TouchableOpacity style={{ height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}  onPress={() => {leaveTypeRef.current?.setModalVisible()}}>
								<Text style={[styles.labelText,{color:data.leaveType.length > 0 ? 'black' : ThemeColor.PlaceHolderColor}]}>{data.leaveType.length >0 ? data.leaveType : 'Select leave type'}</Text>
								<Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22} />
							</TouchableOpacity> :
							<View style={{ height:40, borderRadius:5, flexDirection:'row', alignItems:'center'}}  onPress={() => {leaveTypeRef.current?.setModalVisible()}}>
								<Picker	
									style={{flex:1,}}
									selectedValue={data.leaveTypeID}
									onValueChange={(itemValue, index) =>{
										console.log(itemValue,index)
										let selectedItem = leaveTypeArr[index];
										console.log(selectedItem);
										setData({...data,leaveTypeID: selectedItem.leaveTypeId, leaveType:selectedItem.leaveName, balance:selectedItem.leaveBalance, pending:selectedItem.pendingLeave,allowNegativeLeave:selectedItem.AllowNegativeLeave});
									}}>
									{leaveTypeArr.map((item, index) => {
										return (<Picker.Item label={item.leaveName} value={item.leaveTypeId} key={index}/>) 
									})}
								</Picker>								
							</View>
						}
						{data.leaveType.length > 0 && <View style={{height:1, backgroundColor:ThemeColor.BorderColor, marginLeft:8}}/> }
						{data.leaveType.length > 0 &&
						<View style={{height:40, justifyContent: 'space-between', alignItems: 'center', flexDirection:'row',paddingRight:8}}>
							<Text style ={{color:ThemeColor.TextColor, fontSize:14, fontFamily:FontName.Regular, paddingLeft:8}}>Balance: {data.balance} </Text>
							<Text style ={{color:ThemeColor.TextColor, fontSize:14, fontFamily:FontName.Regular, paddingLeft:8}}>Pending approval: {data.pending} </Text>
							<TouchableOpacity onPress={() => {handleHelpBtn()}}>
								<Feather name="help-circle" color={ThemeColor.SubTextColor} size={20,20} />
							</TouchableOpacity>
						</View> 
						}
					</View>
				</View> 
				<View style={{marginTop:12}}>
					<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>From date</Text>
					<TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}  onPress={() => {startDateRef.current?.setModalVisible()}}>
						<Text style={[styles.labelText,{color:data.startDate.length > 0 ? 'black' : ThemeColor.PlaceHolderColor}]}>{data.startDate.length >0 ? data.startDate : 'Select date'}</Text>
						<Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22,22} />
					</TouchableOpacity>
				</View> 
				<View style={{marginTop:12}}>
					<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>To date</Text>
					<TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}  onPress={() => {endDateRef.current?.setModalVisible()}}>
						<Text style={[styles.labelText,{color:data.endDate.length > 0 ? 'black' : ThemeColor.PlaceHolderColor}]}>{data.endDate.length >0 ? data.endDate : 'Select date'}</Text>
						<Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22,22} />
					</TouchableOpacity>
				</View> 
				<View style={{backgroundColor:'white',borderRadius:5 ,marginTop:24,}}>
					<View style={{height:45,flexDirection:'row', alignItems:'center', paddingRight:8, justifyContent:'space-between'}}>
						<Text style ={{color:ThemeColor.TextColor, fontSize:14, fontFamily:FontName.Regular, paddingLeft:8}}>Full day</Text>
						<Switch
							trackColor={{ false: ThemeColor.SwitchInactiveColor, true:ThemeColor.BtnColor }}
							ios_backgroundColor = {ThemeColor.SwitchInactiveColor}
							thumbColor={data.fullDay ? "#FFF" : "#f4f3f4"}
							onValueChange={toggleSwitchFullDay}
							value={ data.fullDay}
						/>            
					</View>
					<View style={{backgroundColor:ThemeColor.BorderColor, height:0.5, marginLeft:8}}/>
					<View style={{height:45, borderRadius:5, flexDirection:'row', paddingRight:8,alignItems:'center',justifyContent:'space-between'}}>
						<Text style ={{color:ThemeColor.TextColor, fontSize:14, fontFamily:FontName.Regular, paddingLeft:8}}>First half</Text>
						<Switch
							trackColor={{ false: ThemeColor.SwitchInactiveColor, true:ThemeColor.BtnColor }}
							ios_backgroundColor = {ThemeColor.SwitchInactiveColor}
							onValueChange={toggleSwitchFirstHalf}
							thumbColor={data.firstHalf ? "#FFF" : "#f4f3f4"}
							value={ data.firstHalf}
						/>            
					</View>
					<View style={{backgroundColor:ThemeColor.BorderColor, height:0.5, marginLeft:8}}/>
					<View style={{height:45, borderRadius:5, flexDirection:'row', paddingRight:8,alignItems:'center',justifyContent:'space-between'}}>
						<Text style ={{color:ThemeColor.TextColor, fontSize:14, fontFamily:FontName.Regular, paddingLeft:8}}>Second half</Text>
						<Switch
							trackColor={{ false: ThemeColor.SwitchInactiveColor, true:ThemeColor.BtnColor }}
							ios_backgroundColor = {ThemeColor.SwitchInactiveColor}
							onValueChange={toggleSwitchSecondHalf}
							thumbColor={data.secondHalf ? "#FFF" : "#f4f3f4"}
							value={ data.secondHalf}
						/>            
					</View>
				</View>
				<View style={{marginTop:24}}>
					<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Leave reason</Text>
					<View style={{backgroundColor:'white', height:100, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}>
					<TextInput style={[styles.inputText,{textAlignVertical: "top", height:100, paddingRight:8}]}
							multiline={true}
							placeholder="Enter your reason here" 
							placeholderTextColor={ThemeColor.PlaceHolderColor}
							keyboardType='default'
							value = {data.reason}
							onChangeText={(val) => setData({...data,reason:val})}
						/>
					</View>
				</View>
				<View style={{marginTop:12}}>
					<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Contact</Text>
					<View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}>
						<TextInput style={styles.inputText}
							placeholder="Enter contact number" 
							placeholderTextColor={ThemeColor.PlaceHolderColor}
							keyboardType='phone-pad'
							value = {data.contact}
							onChangeText={(val) => textPhoneChange(val)}
						/>
					</View>
				</View>
				<View style={{marginTop:12}}>
					<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Leave address</Text>
					<View style={{backgroundColor:'white', height:100, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}>
					<TextInput style={[styles.inputText,{textAlignVertical: "top", height:100, paddingRight:8}]}
							multiline={true}
							placeholder="Leave address" 
							placeholderTextColor={ThemeColor.PlaceHolderColor}
							keyboardType='default'
							value = {data.address}
							onChangeText={(val) => setData({...data,address:val})}
						/>
					</View>
				</View>
			</KeyboardAwareScrollView>
			<View style={{flexDirection:'row',borderRadius:5, marginTop:8, marginLeft:16,marginRight:16, marginBottom:8}}>
				<TouchableOpacity style={styles.btnFill} onPress={() => {handleSubmit()}}>
					<Text style={{color:'#53962E',fontFamily: FontName.Regular, fontSize:16, color:'#fff' }}>SUBMIT</Text>
				</TouchableOpacity>
			</View>
			<ActionSheet ref={leaveTypeRef} containerStyle={{backgroundColor:ThemeColor.ViewBgColor}}>
				<View style={{height:300}}>
					<View style={{height:60, flexDirection:'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft:16,paddingRight:16}}>
						<TouchableOpacity onPress={() => {leaveTypeRef.current?.setModalVisible()}}>
							<Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Cancel</Text>
						</TouchableOpacity>
						<Text style={{color:ThemeColor.TextColor, fontSize:16, fontFamily: FontName.Regular}}>Leave type</Text> 
						<TouchableOpacity onPress={() => {
							{data.leaveType.length == 0 && setData({...data,leaveType:leaveTypeArr[0].leaveName,leaveTypeID:leaveTypeArr[0].leaveTypeId,balance:leaveTypeArr[0].leaveBalance, pending:leaveTypeArr[0].pendingLeave,allowNegativeLeave:leaveTypeArr[0].AllowNegativeLeave})}
							leaveTypeRef.current?.setModalVisible()}
							
							}>
							<Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Done</Text>
						</TouchableOpacity>
					</View>
					<Picker
						style={{backgroundColor: 'white',flex:1,}}
						selectedValue={data.leaveTypeID}
						onValueChange={(itemValue, index) =>{
							console.log(itemValue,index)
							let selectedItem = leaveTypeArr[index];
							console.log(selectedItem);
							setData({...data,leaveTypeID: selectedItem.leaveTypeId, leaveType:selectedItem.leaveName, balance:selectedItem.leaveBalance, pending:selectedItem.pendingLeave,allowNegativeLeave:selectedItem.AllowNegativeLeave});
						}}>
						{leaveTypeArr.map((item, index) => {
							return (<Picker.Item label={item.leaveName} value={item.leaveTypeId} key={index}/>) 
						})}
					</Picker>
				</View>
			</ActionSheet>
			<ActionSheet ref={startDateRef} containerStyle={{backgroundColor:ThemeColor.ViewBgColor}}>
				<View style={{height:300}}>
					<View style={{height:44, flexDirection:'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft:16,paddingRight:16}}>
					<TouchableOpacity onPress={() => {startDateRef.current?.setModalVisible()}}>
						<Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Cancel</Text>
					</TouchableOpacity>
					<Text style={{color:ThemeColor.TextColor, fontSize:18, fontFamily: FontName.Regular}}>From date</Text>
					<TouchableOpacity onPress={() => {
						{data.startDate.length == 0 && handleStartDateChange(startDate)}
						startDateRef.current?.setModalVisible()
						}}>
						<Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Done</Text>
					</TouchableOpacity>
					</View>
					<DatePicker
						style={{backgroundColor: 'white',flex:1,width:Dimensions.get('window').width}}
						mode={'date'}
						date={startDate}
						onDateChange={(val) => {handleStartDateChange(val)}}
					/>
				</View>
			</ActionSheet>
		    <ActionSheet ref={endDateRef} containerStyle={{backgroundColor:ThemeColor.ViewBgColor}}>
				<View style={{height:300}}>
					<View style={{height:44, flexDirection:'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft:16,paddingRight:16}}>
					<TouchableOpacity onPress={() => {endDateRef.current?.setModalVisible()}}>
						<Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Cancel</Text>
					</TouchableOpacity>
					<Text style={{color:ThemeColor.TextColor, fontSize:18, fontFamily: FontName.Regular}}>To date</Text>
					<TouchableOpacity onPress={() => {
						{data.endDate.length == 0 && handleEndDateChange(endDate)}
						endDateRef.current?.setModalVisible()
						}}>
						<Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Done</Text>
					</TouchableOpacity>
					</View>
					<DatePicker
						style={{backgroundColor: 'white',flex:1,width:Dimensions.get('window').width}}
						mode={'date'}
						date={endDate}
						onDateChange={(val) => {handleEndDateChange(val)}}
					/>
				</View>
			</ActionSheet>
			<Loader isLoading={isLoading} />
		</SafeAreaView>
	);
}

export default AddLeaveScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:'#E5E9EB',
  },inputText:{
    flex: 1,
    height:40,
    color:'black',
    fontSize:16,
    fontFamily: FontName.Regular,
    marginLeft:8,
    alignContent:'stretch',
  },
  labelText:{
    flex: 1,
    color:'black',
    fontSize:16,
    fontFamily: FontName.Regular,
    marginLeft:8,
    alignContent:'stretch',
  },btnFill:{
    flex: 1,
    height:50,
    justifyContent:"center",
    backgroundColor: ThemeColor.BtnColor ,
    alignItems:'center',
	borderRadius:5
  },chipTitle: {
    fontSize: 14,
    paddingLeft:8,
    paddingRight:8
  },chipItem: {
    padding: 4,
    marginVertical: 4,
    marginHorizontal: 8,
    borderRadius:20,
    borderColor:ThemeColor.BtnColor,
    borderWidth:1,
  },footer: {
    position:'absolute',
    bottom:0,
    flex: 1,
    backgroundColor: ThemeColor.ViewBgColor,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingBottom:16,
    height:'80%',
    width:'100%', 
    borderColor:ThemeColor.ViewBgColor,
    borderWidth:1,
    alignItems:'center',
  },
  containerContent: {marginTop: 140, height:200},
  containerHeader: {
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    backgroundColor: 'green',
    marginTop:100
  },
  headerContent:{
    marginTop: 0,
  },

}); 