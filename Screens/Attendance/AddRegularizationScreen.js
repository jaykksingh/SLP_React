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
import { parseErrorATS } from '../../_helpers/Utils'
import Loader from '../../Components/Loader';
import {getAuthHeader} from '../../_helpers/auth-header';
import { BaseUrl,LeaveMgrBaseURL ,EndPoints, StaticMessage, ThemeColor, FontName } from '../../_helpers/constants';

const categoryRef = createRef();
const startDateRef = createRef();
const endDateRef = createRef();


const AddRegularizationScreen = ({route,navigation}) => {
	const [isLoading,setIsLoading] = React.useState(false);
	const [data,setData] = React.useState({
		category:'',
		categoryID:'',
		dayBased:true,
		timeBased:false,
		startDate:'',
		endDate:'',
		reason:''
	});
	const [startDate,setStartDate] = React.useState(new Date());
	const [endDate,setEndDate] = React.useState(new Date());
	const [lookupData,setLookupData] = React.useState({
		Category:[],
	});
	let [profileData, setProfileData] = React.useState({
		empDetails:{
			API_session_uuid:''
		}
	});
	

  

	React.useLayoutEffect(() => {
		navigation.setOptions({
		title : 'New regularization'
		});
	}, [navigation]);
	
	useEffect(() => {
		getLookupData();
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
	
	const  getLookupData = async() => {
		let user = await AsyncStorage.getItem('loginDetails');  
		let parsed = JSON.parse(user);  
		let employeeDetailsId = parsed.employeeDetailsId;
	
		setIsLoading(true);
		
		axios ({  
		  "method": "GET",
		  "url": LeaveMgrBaseURL + EndPoints.GetRegularizationLookup,
		  "headers": {'Authorization':'qwerty~!@','Content-Type':'application/json'}
		})
		.then((response) => {
      		setIsLoading(false);
		  	if (response.data.header == 200){
				console.log('Lookup:',JSON.stringify(response.data.content.data));
				setLookupData(response.data.content.data);
			}else if (response.data.code == 417){
				console.log(Object.values(response.data.content.messageList));
				const errorList = Object.values(response.data.content.messageList);
				Alert.alert(StaticMessage.AppName, errorList.join(), [
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

	const  handleSubmit = () => {
		const empDetails =  profileData.empDetails;
		let session_uuid = empDetails.API_session_uuid;

		setIsLoading(true);
		let params = {
			'API_session_uuid':session_uuid,
			'Reg_Category_Id':data.categoryID,
			'AR_Duration_Type':data.dayBased ? 'd' :'t',
			'AR_Status':'37131',
			'From_Date':data.startDate,
			'To_Date':data.endDate,
			'Reason':data.reason,
		};		
		axios ({  
		  "method": "POST",
		  "url": LeaveMgrBaseURL + EndPoints.RegularizationRequest,
		  "headers": {'Authorization':'qwerty~!@','Content-Type':'application/json'},
		  data:params
		})
		.then((response) => {
      		setIsLoading(false);
		  	if (response.data.header == 200){
				const message = response.data.content.data.message;
				Alert.alert(StaticMessage.AppName, message, [{
					text: 'Ok',
					onPress: () => navigation.goBack()
				}]);
			}else if (response.data.header == 417){
				console.log('Error:',JSON.stringify(response.data.content.errors.details));
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
  
	const toggleSwitch = () => {
		setData({...data,dayBased:!data.dayBased, timeBased:!data.timeBased,startDate:'',endDate:''});

	}
	const handleStartDateChange = (val) => {
		setStartDate(val);
		console.log("Start Date:",val.toString());
		let showDate = moment(val).format(data.dayBased ? 'MMM DD, YYYY' : 'MMM DD, YYYY hh:mm a')
		setData({...data,startDate:showDate});
	}
	const handleEndDateChange = (val) => {
		setEndDate(val);
		console.log("End Date:",val.toString());
		let showDate = moment(val).format(data.dayBased ? 'MMM DD, YYYY' : 'MMM DD, YYYY hh:mm a')
		setData({...data,endDate:showDate});
	}

  	return (
		<SafeAreaView style={styles.container}>
			<KeyboardAwareScrollView style={{paddingLeft:16, paddingRight:16, marginTop:16,marginBottom:32,width:'100%' , flex:1}}>
				
				{Platform.OS == 'ios' ?
				<View style={{marginTop:12}}>
					<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Regularization category</Text>
					<TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}  onPress={() => {categoryRef.current?.setModalVisible()}}>
						<Text style={[styles.labelText,{color:data.category.length > 0 ? 'black' : ThemeColor.PlaceHolderColor}]}>{data.category.length >0 ? data.category : 'Select category'}</Text>
						<Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22} />
					</TouchableOpacity>
				</View> :
				<View style={{marginTop:12}}>
					<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Regularization category</Text>
					<View style={{backgroundColor:'white', height:40,borderRadius:5, flexDirection:'row', alignItems:'center'}}  onPress={() => {categoryRef.current?.setModalVisible()}}>
						<Picker
							style={{flex:1,}}
							itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
							selectedValue={data.categoryID}
							onValueChange={(itemValue, index) =>{
								console.log(itemValue,index)
								let selectedItem = lookupData.Category[index];
								console.log(selectedItem);
								setData({...data,categoryID: selectedItem.keyId, category:selectedItem.value});
							}}>
							{lookupData.Category.map((item, index) => {
								return (<Picker.Item label={item.value} value={item.keyId} key={index}/>) 
							})}
						</Picker>						
					</View>
				</View>
				} 
				<View style={{backgroundColor:'white',borderRadius:5 ,marginTop:24,}}>
					<View style={{height:45,flexDirection:'row', alignItems:'center', paddingRight:8, justifyContent:'space-between'}}>
						<Text style ={{color:ThemeColor.TextColor, fontSize:14, fontFamily:FontName.Regular, paddingLeft:8}}>Day based</Text>
						<Switch
							trackColor={{ false: ThemeColor.SwitchInactiveColor, true:ThemeColor.BtnColor }}
							ios_backgroundColor = {ThemeColor.SwitchInactiveColor}
							thumbColor={data.dayBased ? "#FFF" : "#f4f3f4"}
							onValueChange={toggleSwitch}
							value={ data.dayBased}
						/>            
					</View>
					<View style={{backgroundColor:ThemeColor.BorderColor, height:0.5, marginLeft:8}}/>
					<View style={{height:45, borderRadius:5, flexDirection:'row', paddingRight:8,alignItems:'center',justifyContent:'space-between'}}>
						<Text style ={{color:ThemeColor.TextColor, fontSize:14, fontFamily:FontName.Regular, paddingLeft:8}}>Time based</Text>
						<Switch
							trackColor={{ false: ThemeColor.SwitchInactiveColor, true:ThemeColor.BtnColor }}
							ios_backgroundColor = {ThemeColor.SwitchInactiveColor}
							thumbColor={data.timeBased ? "#FFF" : "#f4f3f4"}
							onValueChange={toggleSwitch}
							value={ data.timeBased}
						/>            
					</View>
				</View>
				
				<View style={{marginTop:12}}>
					<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>From date</Text>
					<TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}  onPress={() => {startDateRef.current?.setModalVisible()}}>
						<Text style={[styles.labelText,{color:data.startDate.length > 0 ? 'black' : ThemeColor.PlaceHolderColor}]}>{data.startDate.length >0 ? data.startDate : 'Select date'}</Text>
						<Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22} />
					</TouchableOpacity>
				</View> 
				<View style={{marginTop:12}}>
					<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>To date</Text>
					<TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}  onPress={() => {endDateRef.current?.setModalVisible()}}>
						<Text style={[styles.labelText,{color:data.endDate.length > 0 ? 'black' : ThemeColor.PlaceHolderColor}]}>{data.endDate.length >0 ? data.endDate : 'Select date'}</Text>
						<Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22} />
					</TouchableOpacity>
				</View> 

				<View style={{marginTop:24}}>
					<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Reason</Text>
					<View style={{backgroundColor:'white', height:100, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}>
					<TextInput style={[styles.inputText,{textAlignVertical: "top", height:100, paddingRight:8}]}
							multiline
							placeholder="Enter your reason here" 
							placeholderTextColor={ThemeColor.PlaceHolderColor}
							keyboardType='default'
							value = {data.reason}
							onChangeText={(val) => setData({...data,reason:val})}
						/>
					</View>
				</View>
				
				
			</KeyboardAwareScrollView>
			<View style={{flexDirection:'row',borderRadius:5, marginTop:8, marginLeft:16,marginRight:16, marginBottom:8}}>
				<TouchableOpacity style={styles.btnFill} onPress={() => {handleSubmit()}}>
					<Text style={{color:'#53962E',fontFamily: FontName.Regular, fontSize:16, color:'#fff' }}>SUBMIT</Text>
				</TouchableOpacity>
			</View>
			<ActionSheet ref={categoryRef} containerStyle={{backgroundColor:ThemeColor.ViewBgColor}}>
				<View style={{height:300}}>
					<View style={{height:60, flexDirection:'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft:16,paddingRight:16}}>
						<TouchableOpacity onPress={() => {categoryRef.current?.setModalVisible()}}>
							<Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Cancel</Text>
						</TouchableOpacity>
						<Text style={{color:ThemeColor.TextColor, fontSize:16, fontFamily: FontName.Bold}}>Regularization category</Text> 
						<TouchableOpacity onPress={() => {
							{data.category.length == 0 && setData({...data,category:lookupData.Category[0].value,categoryID:lookupData.Category[0].keyId})}
							categoryRef.current?.setModalVisible()}
							
							}>
							<Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Done</Text>
						</TouchableOpacity>
					</View>
					<Picker
						style={{backgroundColor: 'white',flex:1,}}
						itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
						selectedValue={data.categoryID}
						onValueChange={(itemValue, index) =>{
							console.log(itemValue,index)
							let selectedItem = lookupData.Category[index];
							console.log(selectedItem);
							setData({...data,categoryID: selectedItem.keyId, category:selectedItem.value});
						}}>
						{lookupData.Category.map((item, index) => {
							return (<Picker.Item label={item.value} value={item.keyId} key={index}/>) 
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
						mode={data.dayBased ? 'date' : 'datetime'}
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
						mode={data.dayBased ? 'date' : 'datetime'}
						date={endDate}
						onDateChange={(val) => {handleEndDateChange(val)}}
					/>
				</View>
			</ActionSheet>
			<Loader isLoading={isLoading} />
		</SafeAreaView>
	);
}

export default AddRegularizationScreen;

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