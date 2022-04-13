import React ,{useEffect,useState,createRef} from "react";
import { StatusBar, 
    StyleSheet, 
    Text,
    TouchableOpacity,
    Image,
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
import Feather from 'react-native-vector-icons/Feather';
import moment from 'moment';
import ActionSheet from "react-native-actions-sheet";
import {Picker} from '@react-native-picker/picker';
import { parseErrorMessage } from '../../_helpers/Utils';
import Loader from '../../Components/Loader';
import {getAuthHeader} from '../../_helpers/auth-header';
import { BaseUrl, EndPoints, StaticMessage, ThemeColor, FontName } from '../../_helpers/constants';


const groupRef = createRef();
const severityRef = createRef();
const issueTypeRef = createRef();


const CreateMessageScreen = ({route,navigation}) => {
	const [isLoading,setIsLoading] = React.useState(false);
	const [isProfileLoading,setProfileLoading] = React.useState(false);

	const [chatGroupsArray,setChatGroupsArray] = React.useState([]);
	const [fikterGroupsArray,setFikterGroupsArray] = React.useState([]);
	const [lookupData, setLookupData] = useState({});
	const [issueTypeArray,setIssueTypeArray] = React.useState([]);
	const [profileData, setProfileData] = React.useState('');

	const [data,setData] = React.useState({
		groupName:'',
		groupId:'',
		severityType:'',
		severityID:'',
		issueType:'',
		issueTypeID:'',
		message:'',
		jobId:''
	});
  	const { timesheets } = route.params;
	const {preMessage} = route.params;
	const {groupID} = route.params;
	const {isFromJobSupport} = route.params;
	const {groupName} = route.params;
	const {jobID} = route.params;

	
	React.useLayoutEffect(() => {
		navigation.setOptions({
			title : 'New Message / Issue'
		});
	}, [navigation]);
  
  
  	useEffect(() => {
		if(timesheets){
			let momentStartDate = moment(timesheets.startDate, 'YYYY-MM-DD');
			let momentEndDate = moment(timesheets.endDate, 'YYYY-MM-DD');
			let startDateString = moment(momentStartDate).format('MMM DD, YYYY');
			let endDateString = moment(momentEndDate).format('MMM DD, YYYY');
			console.log('Timesheet: ', timesheets);
			setData({...data, message:preMessage, groupName:groupName,groupId:groupID});
			getIssueType(groupID);
		}else{
			if(groupID){
				getIssueType(groupID);
			}
		}
		if(groupName.length > 0){
			setData({...data,groupName:groupName,groupId:groupID, message:preMessage});
		}
		
		getProfileDetails();
		getUserLookups();
		
  	},[])
	const  getProfileDetails = async() => {
		let user = await AsyncStorage.getItem('loginDetails'); 
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken);    
	
		setProfileLoading(true);
		axios ({  
		  "method": "GET",
		  "url": BaseUrl + EndPoints.UserProfile,
		  "headers": getAuthHeader(authToken)
		})
		.then((response) => {
			setProfileLoading(false);
			if (response.data.code == 200){
				setProfileData(response.data.content.dataList[0]);
				console.log('ProfileData:' + JSON.stringify(response.data.content.dataList[0]));
				getChatGroups(response.data.content.dataList[0]);

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
			setProfileLoading(false);
			if(error.response && error.response.status == 401){
				SessionExpiredAlert();
			}else{
				Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
					{text: 'Ok'}
				  ]);
			}
			console.log('Error:',error);      
		})
	}
	const  getChatGroups = async(profileDetail) => {
		let user = await AsyncStorage.getItem('loginDetails'); 
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken);    
	
		setIsLoading(true);
		axios ({  
		  "method": "GET",
		  "url": BaseUrl + EndPoints.ChatGroups,
		  "headers": getAuthHeader(authToken)
		})
		.then((response) => {
			setIsLoading(false);
			if (response.data.code == 200){
				console.log('Groups:',JSON.stringify(response.data.content.dataList));
				filterChatGroup(response.data.content.dataList,profileDetail);
				// setChatGroupsArray(response.data.content.dataList);
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
			if(error.response && error.response.status == 401){
				SessionExpiredAlert();
			}else{
				Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
					{text: 'Ok'}
				  ]);
			}
			console.log('Error:',error);      
		})
	}
	const filterChatGroup = (groupsArray,profileDetail) => {
		var tempGroupArray = [];
		for (var i=0; i < groupsArray.length; i++) {
			var group = groupsArray[i];
			if(group.groupId == 4 ){
				if(jobID || isFromJobSupport){
					tempGroupArray.push(group);
				}
			}else{
				if(group.groupId == 5){
					const recruiterDetails = profileDetail ? profileDetail.empDetails.recruiterDetails : null
					var recruiterName = '';
					if(recruiterDetails){
						recruiterName = `${recruiterDetails.firstName} ${recruiterDetails.lastName} (My recruiter)`
					}else{
						recruiterName = `My recruiter`
					} 
				
					group.groupTitle =  recruiterName;
				}
				tempGroupArray.push(group);
			}
		}
		setChatGroupsArray(tempGroupArray);
		setFikterGroupsArray(tempGroupArray);
	
	}
	const  getUserLookups = async() => {
		let user = await AsyncStorage.getItem('loginDetails');  
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken);
	
		setIsLoading(true);
		axios ({  
		  "method": "GET",
		  "url": BaseUrl + EndPoints.UserLookups,
		  "headers": getAuthHeader(authToken)
		})
		.then((response) => {
			setIsLoading(false);
			if (response.data.code == 200){
				console.log('Lookup Data: ',response.data.content.dataList[0]);
				setLookupData(response.data.content.dataList[0]);
			}else if (response.data.code == 417){
				console.log(Object.values(response.data.content.messageList));
				const errorList = Object.values(response.data.content.messageList);
				Alert.alert(StaticMessage.AppName, errorList.join(), [
				{text: 'Ok'}
				]);
		
			}
		})
		.catch((error) => {
			setIsLoading(false);
			Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
			  {text: 'Ok'}
			]);
		})
	}
	const  getIssueType = async(groupID) => {
		let user = await AsyncStorage.getItem('loginDetails');  
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken);
	
		setIsLoading(true);
		axios ({  
		  "method": "GET",
		  "url": BaseUrl + EndPoints.IssueTypeList+groupID,
		  "headers": getAuthHeader(authToken)
		})
		.then((response) => {
			setIsLoading(false);
			if (response.data.code == 200){
				console.log('IssueTypeList: ',response.data.content.dataList);
				setIssueTypeArray(response.data.content.dataList);
			}else if (response.data.code == 417){
				console.log(Object.values(response.data.content.messageList));
				const errorList = Object.values(response.data.content.messageList);
				Alert.alert(StaticMessage.AppName, errorList.join(), [
				{text: 'Ok'}
				]);
		
			}
		})
		.catch((error) => {
			setIsLoading(false);
			Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
			  {text: 'Ok'}
			]);
		})
	}

	const  handleSubmit = async() => {
		let user = await AsyncStorage.getItem('loginDetails');  
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken);

		setIsLoading(true);
		
		var params = {
			'groupId':data.groupId,
			'issueType':data.issueTypeID,
			'severity':''+data.severityID,
			'messageBody':data.message
		}
		if(jobID){
			params = {
				'groupId':data.groupId,
				'issueType':data.issueTypeID.length > 0 ? data.issueTypeID : '63',
				'severity':''+data.severityID,
				'messageBody':data.message,
				'jobId':jobID ? jobID : data.jobId,
			}
		}
		console.log('Params:',JSON.stringify(params));
		axios ({  
		"method": "POST",
		"url": BaseUrl + EndPoints.StartConversation,
		"headers": getAuthHeader(authToken),
		data:params
		})
		.then((response) => {
		if (response.data.code == 200){
			setIsLoading(false);
			navigation.goBack();
		}else if (response.data.code == 417){
			setIsLoading(false);
			const message = parseErrorMessage(response.data.content.messageList);
			Alert.alert(StaticMessage.AppName, message, [
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
	
	const handleSkillChange = (val) => {
		setSkill({...skill,skillName: val});
	}
	const handleYearChange = (val) => {
		setSkill({...skill,yearExp: val});
	}
	const toggleSwitch = () => {
		setSkill({...skill,isPrimary:!skill.isPrimary});
	}

	const getFirstGrup =() => {
		if(chatGroupsArray.length > 0){
			let firstGroup = chatGroupsArray[0];
			setData({...data,groupId: firstGroup.groupId,groupName:firstGroup.groupTitle, issueType:'', issueTypeID:''});
			getIssueType(firstGroup.groupId);
			return firstGroup.groupTitle;
		}else{
			return 'Select group'
		}
		

	}
	return (
    	<SafeAreaView style={styles.container}>
    	<KeyboardAwareScrollView style={{paddingLeft:16, paddingRight:16, marginTop:16,marginBottom:32,width:'100%' }}>
			{Platform.OS == 'ios' ? 
				<>
					<View style={{marginTop:12}}>
						<TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}  onPress={() => {groupRef.current?.setModalVisible()}}>
							<Text style={[styles.labelText,{color:data.groupName.length > 0 ? 'black' : ThemeColor.PlaceHolderColor}]}>{data.groupName.length > 0 ? data.groupName : getFirstGrup()}</Text>
							<Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22} />
						</TouchableOpacity>
					</View>
					<View style={{marginTop:12}}>
						<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Bold, paddingLeft:8}}>Severity of issue</Text>
						<TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}  onPress={() => {severityRef.current?.setModalVisible()}}>
							<Text style={[styles.labelText,{color:data.severityType.length > 0 ? 'black' : ThemeColor.PlaceHolderColor}]}>{data.severityType.length >0 ? data.severityType : 'Select severity'}</Text>
							<Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22} />
						</TouchableOpacity>
					</View>
				</> :
				<>
					<View style={{marginTop:12}}>
						<View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center'}}>
							<Picker
								style={{flex:1,}}
								selectedValue={data.groupId}
								onValueChange={(itemValue, index) =>{
									let selectedItem = chatGroupsArray[index];
									console.log(selectedItem);
									setData({...data,groupId: selectedItem.groupId,groupName:selectedItem.groupTitle, issueType:'', issueTypeID:''});
									getIssueType(selectedItem.groupId);

								}}>
								{fikterGroupsArray && fikterGroupsArray.map((item, index) => {
									return (<Picker.Item label={item.groupTitle} value={item.groupId} key={index}/>) 
								})}
							</Picker>
						</View>
					</View>
					<View style={{marginTop:12}}>
						<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Bold, paddingLeft:8}}>Severity of issue</Text>
						<TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center'}}  onPress={() => {severityRef.current?.setModalVisible()}}>
							<Picker
								style={{flex:1}}
								selectedValue={data.severityID}
								onValueChange={(itemValue, index) =>{
									let selectedItem = lookupData.severityType[index];
									console.log(selectedItem);
									setData({...data,severityType: selectedItem.keyName,severityID: selectedItem.keyId});
								}}>
								{lookupData.severityType && lookupData.severityType.map((item, index) => {
									return (<Picker.Item label={item.keyName} value={item.keyId} key={index}/>) 
								})}
							</Picker>							
						</TouchableOpacity>
					</View>
				</>
			}
			{!jobID ? 
			Platform.OS == 'ios' ?
			<View style={{marginTop:12}}>
				<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Bold, paddingLeft:8}}>Issue type</Text>
				<TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}  onPress={() => {issueTypeRef.current?.setModalVisible()}}>
					<Text style={[styles.labelText,{color:data.issueType.length > 0 ? 'black' : ThemeColor.PlaceHolderColor}]}>{data.issueType.length >0 ? data.issueType : 'Select issue type'}</Text>
					<Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22} />
				</TouchableOpacity>
            </View> :
			<View style={{marginTop:12}}>
				<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Bold, paddingLeft:8}}>Issue type</Text>
				<TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center'}}  onPress={() => {issueTypeRef.current?.setModalVisible()}}>
					<Picker
						style={{flex:1,}}
						selectedValue={data.issueTypeID}
						onValueChange={(itemValue, index) =>{
							let selectedItem = issueTypeArray[index];
							console.log(selectedItem);
							setData({...data,issueTypeID: selectedItem.keyId,issueType:selectedItem.keyName});
						}}>
						{issueTypeArray && issueTypeArray.map((item, index) => {
							return (<Picker.Item label={item.keyName} value={item.keyId} key={index}/>) 
						})}
					</Picker>					
				</TouchableOpacity>
			</View>  
			: null
			}
			<View style={{marginTop:12}}>
				<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Bold, paddingLeft:8}}>Message</Text>
				<View style={{backgroundColor:'white', height:100, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}>
				<TextInput  
					style={[styles.inputText,{height:90, textAlignVertical:'top'}]}
					multiline={true}
					placeholder="Enter message" 
					placeholderTextColor={ThemeColor.PlaceHolderColor}
					keyboardType='default'
					value= { data.message}
					onChangeText={(val) => setData({...data,message:val})}
				/>
				</View>
			</View> 
        </KeyboardAwareScrollView>
		<View style={{flexDirection:'row',borderRadius:5,marginTop:8, marginLeft:16,marginRight:16}}>
			<TouchableOpacity style={styles.btnFill} onPress={() => {handleSubmit()}}>
				<Text style={{color:'#53962E',fontFamily: FontName.Bold, fontSize:16, color:'#fff' }}>SUBMIT</Text>
			</TouchableOpacity>
		</View>
        <Loader isLoading={isLoading} />
		<Loader isLoading={isProfileLoading} />

		<ActionSheet ref={groupRef} containerStyle={{backgroundColor:ThemeColor.ViewBgColor}}>
          <View style={{height:300}}>
            <View style={{height:60, flexDirection:'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft:16,paddingRight:16}}>
              <TouchableOpacity onPress={() => {groupRef.current?.setModalVisible()}}>
                <Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Bold}}>Cancel</Text>
              </TouchableOpacity>
              <Text style={{color:ThemeColor.TextColor, fontSize:16, fontFamily: FontName.Bold}}>Select group</Text>
              <TouchableOpacity onPress={() => {
						{data.groupId.length == 0 && setData({...data,groupId: chatGroupsArray[0].groupId,groupName:chatGroupsArray[0].groupTitle, issueType:'', issueTypeID:''})}
						groupRef.current?.setModalVisible()}
					}>
                <Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Bold}}>Done</Text>
              </TouchableOpacity>
            </View>
            <Picker
              style={{backgroundColor: 'white',flex:1,}}
              selectedValue={data.groupId}
              onValueChange={(itemValue, index) =>{
                let selectedItem = chatGroupsArray[index];
				console.log(selectedItem);
                setData({...data,groupId: selectedItem.groupId,groupName:selectedItem.groupTitle, issueType:'', issueTypeID:''});
				getIssueType(selectedItem.groupId);

              }}>
              {fikterGroupsArray && fikterGroupsArray.map((item, index) => {
                return (<Picker.Item label={item.groupTitle} value={item.groupId} key={index}/>) 
              })}
            </Picker>
          </View>
        </ActionSheet>
		<ActionSheet ref={severityRef} containerStyle={{backgroundColor:ThemeColor.ViewBgColor}}>
          <View style={{height:300}}>
            <View style={{height:60, flexDirection:'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft:16,paddingRight:16}}>
              <TouchableOpacity onPress={() => {severityRef.current?.setModalVisible()}}>
                <Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Bold}}>Cancel</Text>
              </TouchableOpacity>
              <Text style={{color:ThemeColor.TextColor, fontSize:16, fontFamily: FontName.Bold}}>Select severity</Text>
              <TouchableOpacity onPress={() => {
					{data.severityID.length == 0 && setData({...data,severityType: lookupData.severityType[0].keyName,severityID: lookupData.severityType[0].keyId})}
				  	severityRef.current?.setModalVisible()}
				  }>
                <Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Bold}}>Done</Text>
              </TouchableOpacity>
            </View>
            <Picker
              style={{backgroundColor: 'white',flex:1,}}
              selectedValue={data.severityID}
              onValueChange={(itemValue, index) =>{
                let selectedItem = lookupData.severityType[index];
				console.log(selectedItem);
                setData({...data,severityType: selectedItem.keyName,severityID: selectedItem.keyId});
              }}>
              {lookupData.severityType && lookupData.severityType.map((item, index) => {
                return (<Picker.Item label={item.keyName} value={item.keyId} key={index}/>) 
              })}
            </Picker>
          </View>
        </ActionSheet>
		<ActionSheet ref={issueTypeRef} containerStyle={{backgroundColor:ThemeColor.ViewBgColor}}>
          <View style={{height:300}}>
            <View style={{height:60, flexDirection:'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft:16,paddingRight:16}}>
              <TouchableOpacity onPress={() => {issueTypeRef.current?.setModalVisible()}}>
                <Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Bold}}>Cancel</Text>
              </TouchableOpacity>
              <Text style={{color:ThemeColor.TextColor, fontSize:16, fontFamily: FontName.Bold}}>Select issue type</Text>
              <TouchableOpacity onPress={() => {
				  	{data.issueTypeID.length == 0 && setData({...data,issueTypeID: issueTypeArray[0].keyId,issueType:issueTypeArray[0].keyName})}
				  	issueTypeRef.current?.setModalVisible()}
				  }>
                <Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Bold}}>Done</Text>
              </TouchableOpacity>
            </View>
            <Picker
              style={{backgroundColor: 'white',flex:1,}}
              selectedValue={data.issueTypeID}
              onValueChange={(itemValue, index) =>{
                let selectedItem = issueTypeArray[index];
				console.log(selectedItem);
                setData({...data,issueTypeID: selectedItem.keyId,issueType:selectedItem.keyName});
              }}>
              {issueTypeArray && issueTypeArray.map((item, index) => {
                return (<Picker.Item label={item.keyName} value={item.keyId} key={index}/>) 
              })}
            </Picker>
          </View>
        </ActionSheet>
	</SafeAreaView>
	);
}

export default CreateMessageScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:'#E5E9EB',
  },inputText:{
    flex: 1,
    height:40,
    color:'black',
    fontSize:14,
    fontFamily: FontName.Regular,
    marginLeft:8,
    alignContent:'stretch',
  },
  labelText:{
    flex: 1,
    color:'black',
    fontSize:14,
    fontFamily: FontName.Regular,
    marginLeft:8,
    alignContent:'stretch',
  },btnFill:{
    flex: 1,
    height:50,
    justifyContent:"center",
    backgroundColor: ThemeColor.BtnColor ,
    alignItems:'center',
	marginBottom:8,
	borderRadius:5,
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