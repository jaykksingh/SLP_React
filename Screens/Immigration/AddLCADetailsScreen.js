/* eslint-disable react/display-name */
import React , {useEffect,createRef} from "react";
import { View,
    Text,
    StyleSheet,
    Alert,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
	FlatList,
	Platform} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'
import axios from 'axios';
import Feather from 'react-native-vector-icons/Feather';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import Icons from 'react-native-vector-icons/Ionicons';
import {Picker} from '@react-native-picker/picker';
import ActionSheet from "react-native-actions-sheet";
import {parseErrorMessage} from '../../_helpers/Utils';
import { BaseUrl, EndPoints, StaticMessage, ThemeColor, FontName } from '../../_helpers/constants';
import { getAuthHeader} from '../../_helpers/auth-header';
import Loader from '../../Components/Loader';
import * as Animatable from 'react-native-animatable';


const applForRef = createRef();
const priorityRef = createRef();
const currentStatusRef = createRef();
const skillsRef = createRef();


const AddLCADetailsScreen = ({route,navigation}) => {
	let [isLoading, setLoading] = React.useState(false);
	let [data,setData] = React.useState({
		applTypeName:'',
		appType:'',
		applFor:'',
		appForId: Platform.OS == 'ios' ? '' : 3351,
		firstName:'',
		lastName:'',
		email:'',
		contactNumber:'',
		contactNumberCountryCode:'1',
		cnShortCountryCode:'',
		appPriorityId: Platform.OS == 'ios' ? '' : 3581,
		appPriority:'',
		currentStatusName:'',
		currentStatus: Platform.OS == 'ios' ? '' : 'F1',
		skillCategoryId:'',
		skillCategory:'',
		comments:'',
		documentsList:[]
	});
	const {applTypeName} = route.params;
	const {applTypeId} = route.params;
	const {lookUpData} = route.params;
	const {docList} = route.params;
	const [show, setShow] = React.useState(false);
	const [userLookupData, setUserLookupData] = React.useState({});

	

	React.useLayoutEffect(() => {
		navigation.setOptions({
			title:'New application - details'
		});
	}, [navigation]);

	useEffect(() => {
		if(applTypeName){
			setData({...data,appType:applTypeId,applTypeName:applTypeName});
		}
		getUserLookups();

		
	},[]);
	const  getUserLookups = async() => {
		let user = await AsyncStorage.getItem('loginDetails');  
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken);
	
		setLoading(true);
		axios ({  
		  "method": "GET",
		  "url": BaseUrl + EndPoints.UserLookups,
		  "headers": getAuthHeader(authToken)
		})
		.then((response) => {
		  if (response.data.code == 200){
			setLoading(false);
			setUserLookupData(response.data.content.dataList[0]);
		  }else if (response.data.code == 417){
			setLoading(false);
			console.log(Object.values(response.data.content.messageList));
			const errorList = Object.values(response.data.content.messageList);
			Alert.alert(StaticMessage.AppName, errorList.join(), [
			  {text: 'Ok'}
			]);
	
		  }else{
			setLoading(false);
		  }
		})
		.catch((error) => {
			setLoading(false);
			Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
			  {text: 'Ok'}
			]);
		})
	}
	const didSelectDialCode = (selectedItem) => {
		setData({...data,contactNumberCountryCode: selectedItem.dialCode,cnShortCountryCode:selectedItem.countryCode});
		setShow(false);
	}

  	const updateApplicationDetails = async () => {

		let user = await AsyncStorage.getItem('loginDetails');  
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var encoded = base64.encode(userAuthToken);

		let params = {
			'appType':data.appType,
			'firstName':data.firstName,
			'lastName':data.lastName,
			'email':data.email,
			'contactNumber':data.contactNumber,
			'contactNumberCountryCode':data.contactNumberCountryCode,
			'appForId':data.appForId,
			'appPriorityId':data.appPriorityId,
			'currentStatus':data.currentStatus,
			'skillCategoryId':data.skillCategoryId,
			'comments':data.comments,
		}
		console.log('PARAMS:',params)
		axios ({
			"method": "POST",
			"url": BaseUrl + EndPoints.LegalFilingList,
			"headers": getAuthHeader(encoded),
			data:params
		})
		.then((response) => {
			setLoading(false);
			if (response.data.code == 200){
				setLoading(false);
				if(docList.length == 0){
					console.log('My Leaves:',response.data.content);
					Alert.alert(StaticMessage.AppName, 'Saved sucessfully.', [
						{text: 'Ok',
						onPress: () => {navigation.goBack()}}
					]);
				}else{
					navigation.navigate('NewLcaDocument',{detail:response.data.content.dataList[0],documentList:docList,name:data.firstName + ' ' + data.lastName, applTypeName:data.applTypeName})
				}
			}else if (response.data.code == 417){
				setLoading(false);
				const message = parseErrorMessage(response.data.content.messageList);
				Alert.alert(StaticMessage.AppName, message, [
					{text: 'Ok'}
				]);

			}
		})
		.catch((error) => {
			console.log(error);
			setLoading(false);
			Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
				{text: 'Ok'}
			]);
		})
  	}
	const textPhoneChange = (text) => {
		var cleaned = ('' + text).replace(/\D/g, '')
		var match = cleaned.match(/^(1|)?(\d{3})(\d{3})(\d{4})$/)
		if (match) {
			var intlCode = (match[1] ? '+1 ' : ''),
				number = [intlCode, '(', match[2], ') ', match[3], '-', match[4]].join('');
			   
			setData({...data,contactNumber:number})
			return;
		}
		setData({...data,contactNumber: text});
	}
    const countryDialCodeList = userLookupData ? userLookupData.countryDialCode : [];

  	return (
      	<SafeAreaView style={[styles.container,{backgroundColor:ThemeColor.ViewBgColor,}]}>
			<KeyboardAwareScrollView style={{paddingLeft:16,paddingRight:16}}> 
			  	<View style={{marginTop:12}}>
					<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Application type</Text>
					<View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}>
						<Text style={[styles.labelText,{color:data.applTypeName.length > 0 ? 'black' : ThemeColor.PlaceHolderColor}]}>{data.applTypeName.length >0 ? data.applTypeName : 'Application type'}</Text>
					</View>
				</View>
				{Platform.OS == 'ios' ? 
				<View style={{marginTop:12}}>
					<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Application for</Text>
					<TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}  onPress={() => {applForRef.current?.setModalVisible()}}>
						<Text style={[styles.labelText,{color:data.applFor.length > 0 ? 'black' : ThemeColor.PlaceHolderColor}]}>{data.applFor.length >0 ? data.applFor : 'Application For'}</Text>
						<Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22} />
					</TouchableOpacity>
				</View> :
				<View style={{marginTop:12}}>
					<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Application for</Text>
					<View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center'}} >
						<Picker
							style={{flex:1,fontSize:14, fontFamily: FontName.Regular}}
							itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
							selectedValue={data.appForId}
							onValueChange={(itemValue, index) =>{
								let selectedObj = lookUpData.applicationForList[index];
								setData({...data, appForId: selectedObj.keyId,applFor: selectedObj.keyName});
							}}>
							{lookUpData && lookUpData.applicationForList.map((item, index) => {
								return (<Picker.Item label={item.keyName} value={item.keyId} key={index}/>) 
							})}
						</Picker>
					</View>
				</View>
				}
				<View style={{flexDirection:'row', flex:1,marginTop:12}}>
					<View style={{flex: 1,}}>
						<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>First name</Text>
						<View style={{backgroundColor:'white', height:40, borderTopLeftRadius:5,borderBottomLeftRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}>
						<TextInput  
							style={styles.inputText}
							placeholder="First name" 
							placeholderTextColor={ThemeColor.PlaceHolderColor}
							keyboardType='default'
							value= {data.firstName}
							onChangeText={(val) => setData({...data,firstName:val})}
						/>
						</View>
					</View>
					<View style={{flex:1}}>
						<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Last name</Text>
						<View style={{backgroundColor:'white', height:40, borderTopRightRadius:5,borderBottomRightRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}>
						<TextInput  
							style={styles.inputText}
							placeholder="Last name" 
							placeholderTextColor={ThemeColor.PlaceHolderColor}
							keyboardType='default'
							value= {data.lastName}
							onChangeText={(val) => setData({...data,lastName:val})}
						/>
						</View>
					</View>
				</View>
				<View style={{marginTop:12}}>
					<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Email</Text>
					<View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}>
						<TextInput  
						style={styles.inputText}
						placeholder="Email" 
						placeholderTextColor={ThemeColor.PlaceHolderColor}
						keyboardType='email-address'
						value= {data.email}
						onChangeText={(val) => setData({...data,email:val})}
						/>
					</View>
				</View>
				<View style={{marginTop:12}}>
					<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Phone number</Text>
					<View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}>
						<TouchableOpacity style={{flexDirection: 'row',marginRight:8, paddingLeft:8, alignItems:'center', justifyContent: 'center'}} onPress={() => setShow(true)}>
							{/* <Flag code="US" size={32}/> */}
							<Text style={{color:ThemeColor.TextColor, fontSize:16, fontFamily: FontName.Regular, marginRight:8, marginLeft:8}}>+{data.contactNumberCountryCode}</Text>
							<Icons name="caret-down" color={ThemeColor.LabelTextColor} size={20} />
						</TouchableOpacity>
						<TextInput  
						style={styles.inputText}
						placeholder="Phone number" 
						maxLength={14}
						placeholderTextColor={ThemeColor.PlaceHolderColor}
						keyboardType='phone-pad'
						textContentType='telephoneNumber' 
						dataDetectorTypes='phoneNumber' 
						value= {data.contactNumber}
						onChangeText={(val) => textPhoneChange(val)}
						/>
					</View>
				</View>
				{Platform.OS == 'ios' ?
				<>
					<View style={{marginTop:12}}>
						<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Priority</Text>
						<TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}  onPress={() => {priorityRef.current?.setModalVisible()}}>
							<Text style={[styles.labelText,{color:data.appPriority.length > 0 ? 'black' : ThemeColor.PlaceHolderColor}]}>{data.appPriority.length >0 ? data.appPriority : 'Priority'}</Text>
							<Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22} />
						</TouchableOpacity>
					</View>
					<View style={{marginTop:12}}>
						<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Current employment status for</Text>
						<TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}  onPress={() => {currentStatusRef.current?.setModalVisible()}}>
							<Text style={[styles.labelText,{color:data.currentStatusName.length > 0 ? 'black' : ThemeColor.PlaceHolderColor}]}>{data.currentStatusName.length >0 ? data.currentStatusName : 'Employment status'}</Text>
							<Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22} />
						</TouchableOpacity>
					</View>
					<View style={{marginTop:12}}>
						<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Skill</Text>
						<TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}  onPress={() => {skillsRef.current?.setModalVisible()}}>
							<Text style={[styles.labelText,{color:data.skillCategory.length > 0 ? 'black' : ThemeColor.PlaceHolderColor}]}>{data.skillCategory.length >0 ? data.skillCategory : 'Skills'}</Text>
							<Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22} />
						</TouchableOpacity>
					</View>
				</> :
				<>
					<View style={{marginTop:12}}>
						<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Priority</Text>
						<View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center'}}  onPress={() => {priorityRef.current?.setModalVisible()}}>
							<Picker
								style={{flex:1,fontSize:14, fontFamily: FontName.Regular}}
								itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
								selectedValue={data.appPriorityId}
								onValueChange={(itemValue, index) =>{
									let selectedObj = lookUpData.priorityList[index];
									setData({...data, appPriorityId: selectedObj.keyId,appPriority: selectedObj.keyName});
								}}>
								{lookUpData && lookUpData.priorityList.map((item, index) => {
									return (<Picker.Item label={item.keyName} value={item.keyId} key={index}/>) 
								})}
							</Picker>
						</View>
					</View>
					<View style={{marginTop:12}}>
						<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Current employment status for</Text>
						<View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center'}}  onPress={() => {currentStatusRef.current?.setModalVisible()}}>
							<Picker
								style={{flex:1,fontSize:14, fontFamily: FontName.Regular}}
								itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
								selectedValue={data.currentStatus}
								onValueChange={(itemValue, index) =>{
									let selectedObj = lookUpData.currentEmploymentStatusList[index];
									setData({...data, currentStatus: selectedObj.keyId,currentStatusName: selectedObj.keyName});
								}}>
								{lookUpData && lookUpData.currentEmploymentStatusList.map((item, index) => {
									return (<Picker.Item label={item.keyName} value={item.keyId} key={index}/>) 
								})}
							</Picker>						
						</View>
					</View>
					<View style={{marginTop:12}}>
						<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Skill</Text>
						<View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center'}}  onPress={() => {skillsRef.current?.setModalVisible()}}>
							<Picker
								style={{flex:1,fontSize:14, fontFamily: FontName.Regular}}
								itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
								selectedValue={data.skillCategoryId}
								onValueChange={(itemValue, index) =>{
									let selectedObj = lookUpData.skillCategoryList[index];
									setData({...data, skillCategoryId: selectedObj.id,skillCategory: selectedObj.name});
								}}>
								{lookUpData && lookUpData.skillCategoryList.map((item, index) => {
									return (<Picker.Item label={item.name} value={item.id} key={index}/>) 
								})}
							</Picker>
						</View>
					</View>
				</>}
				
				<View style={{marginTop:12}}>
					<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Comments</Text>
					<View style={{backgroundColor:'white', height:100, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}>
					<TextInput  
						style={[styles.inputText,{height:90, textAlignVertical:'top'}]}
						multiline={true}
						placeholder="Not provided" 
						placeholderTextColor={ThemeColor.PlaceHolderColor}
						keyboardType='default'
						value= {data.comments}
						onChangeText={(val) => setData({...data,comments:val})}
					/>
					</View>
				</View> 
			</KeyboardAwareScrollView>
			<View style={{flexDirection:'row',marginTop:8, marginLeft:16, marginRight:16,}}>
				<TouchableOpacity style={styles.btnFill} onPress={() => {updateApplicationDetails()}}>
				<Text style={{color:'#53962E',fontFamily: FontName.Regular, fontSize:16, color:'#fff' }}>{docList && docList.length > 0 ? 'NEXT' : 'SUBMIT'}</Text>
				</TouchableOpacity>
			</View> 
        	<Loader isLoading={isLoading} />
			<ActionSheet ref={applForRef} containerStyle={{backgroundColor:ThemeColor.ViewBgColor}}>
				<View style={{height:300}}>
					<View style={{height:60, flexDirection:'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft:16,paddingRight:16}}>
					<TouchableOpacity onPress={() => {applForRef.current?.setModalVisible()}}>
						<Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Cancel</Text>
					</TouchableOpacity>
					<Text style={{color:ThemeColor.TextColor, fontSize:16, fontFamily: FontName.Bold}}>Application for</Text>
					<TouchableOpacity onPress={() => {
						data.applFor.length == 0 ? setData({...data,appForId:lookUpData.applicationForList[0].keyId,applFor:lookUpData.applicationForList[0].keyName}) : '';
						applForRef.current?.setModalVisible()}
					}>
						<Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Done</Text>
					</TouchableOpacity>
					</View>
					<Picker
						style={{backgroundColor: 'white',flex:1,fontSize:14, fontFamily: FontName.Regular}}
						itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
						selectedValue={data.appForId}
						onValueChange={(itemValue, index) =>{
							let selectedObj = lookUpData.applicationForList[index];
							setData({...data, appForId: selectedObj.keyId,applFor: selectedObj.keyName});
						}}>
						{lookUpData && lookUpData.applicationForList.map((item, index) => {
							return (<Picker.Item label={item.keyName} value={item.keyId} key={index}/>) 
						})}
					</Picker>
				</View>
			</ActionSheet>
			<ActionSheet ref={priorityRef} containerStyle={{backgroundColor:ThemeColor.ViewBgColor}}>
				<View style={{height:300}}>
					<View style={{height:60, flexDirection:'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft:16,paddingRight:16}}>
					<TouchableOpacity onPress={() => {priorityRef.current?.setModalVisible()}}>
						<Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Cancel</Text>
					</TouchableOpacity>
					<Text style={{color:ThemeColor.TextColor, fontSize:16, fontFamily: FontName.Bold}}>Priority</Text>
					<TouchableOpacity onPress={() => {
						data.appPriority.length == 0 ? setData({...data,appPriorityId:lookUpData.priorityList[0].keyId,appPriority:lookUpData.priorityList[0].keyName}) : '';
						priorityRef.current?.setModalVisible()}
					}>
						<Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Done</Text>
					</TouchableOpacity>
					</View>
					<Picker
						style={{backgroundColor: 'white',flex:1,fontSize:14, fontFamily: FontName.Regular}}
						itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
						selectedValue={data.appPriorityId}
						onValueChange={(itemValue, index) =>{
							let selectedObj = lookUpData.priorityList[index];
							setData({...data, appPriorityId: selectedObj.keyId,appPriority: selectedObj.keyName});
						}}>
						{lookUpData && lookUpData.priorityList.map((item, index) => {
							return (<Picker.Item label={item.keyName} value={item.keyId} key={index}/>) 
						})}
					</Picker>
				</View>
			</ActionSheet>  
			<ActionSheet ref={currentStatusRef} containerStyle={{backgroundColor:ThemeColor.ViewBgColor}}>
				<View style={{height:300}}>
					<View style={{height:60, flexDirection:'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft:16,paddingRight:16}}>
					<TouchableOpacity onPress={() => {currentStatusRef.current?.setModalVisible()}}>
						<Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Cancel</Text>
					</TouchableOpacity>
					<Text style={{color:ThemeColor.TextColor, fontSize:16, fontFamily: FontName.Bold}}>Employment status</Text>
					<TouchableOpacity onPress={() => {
						data.currentStatusName.length == 0 ? setData({...data,currentStatus:lookUpData.currentEmploymentStatusList[0].keyId,currentStatusName:lookUpData.currentEmploymentStatusList[0].keyName}) : '';
						currentStatusRef.current?.setModalVisible()}
					}>
						<Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Done</Text>
					</TouchableOpacity>
					</View>
					<Picker
						style={{backgroundColor: 'white',flex:1,fontSize:14, fontFamily: FontName.Regular}}
						itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
						selectedValue={data.currentStatus}
						onValueChange={(itemValue, index) =>{
							let selectedObj = lookUpData.currentEmploymentStatusList[index];
							setData({...data, currentStatus: selectedObj.keyId,currentStatusName: selectedObj.keyName});
						}}>
						{lookUpData && lookUpData.currentEmploymentStatusList.map((item, index) => {
							return (<Picker.Item label={item.keyName} value={item.keyId} key={index}/>) 
						})}
					</Picker>
				</View>
			</ActionSheet>   
			<ActionSheet ref={skillsRef} containerStyle={{backgroundColor:ThemeColor.ViewBgColor}}>
				<View style={{height:300}}>
					<View style={{height:60, flexDirection:'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft:16,paddingRight:16}}>
					<TouchableOpacity onPress={() => {skillsRef.current?.setModalVisible()}}>
						<Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Cancel</Text>
					</TouchableOpacity>
					<Text style={{color:ThemeColor.TextColor, fontSize:16, fontFamily: FontName.Bold}}>Skills</Text>
					<TouchableOpacity onPress={() => {
						data.skillCategory.length == 0 ? setData({...data,skillCategoryId:lookUpData.skillCategoryList[0].id,skillCategory:lookUpData.skillCategoryList[0].name}) : '';
						skillsRef.current?.setModalVisible()}
					}>
						<Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Done</Text>
					</TouchableOpacity>
					</View>
					<Picker
						style={{backgroundColor: 'white',flex:1,fontSize:14, fontFamily: FontName.Regular}}
						itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
						selectedValue={data.skillCategoryId}
						onValueChange={(itemValue, index) =>{
							let selectedObj = lookUpData.skillCategoryList[index];
							setData({...data, skillCategoryId: selectedObj.id,skillCategory: selectedObj.name});
						}}>
						{lookUpData && lookUpData.skillCategoryList.map((item, index) => {
							return (<Picker.Item label={item.name} value={item.id} key={index}/>) 
						})}
					</Picker>
				</View>
			</ActionSheet> 
			{show && 
				<Animatable.View  animation="fadeInUpBig" style={styles.footer}>
					<View style={{backgroundColor:ThemeColor.BorderColor, height:4, width:200, borderRadius:2}}/>
					{countryDialCodeList.length > 0 && 
					<FlatList style={{marginTop:16, marginBottom:16 ,width:'100%'}}
						data={countryDialCodeList}
						keyExtractor={(item, index) => index.toString()}
						renderItem={({item}) => 
						<TouchableOpacity onPress={(event)=> {didSelectDialCode(item)}}>
							<View style={{flex: 1,flexDirection:'row', height:40, margin_bottom:4,alignItems: 'center'}}>
							<Text style={{flex: 1, fontFamily: FontName.Regular, fontSize:14, marginLeft:16}}>{item.keyName} [{item.dialCode}]</Text>
							</View>
							<View style={{flex: 1,height:1, backgroundColor:ThemeColor.BorderColor, marginLeft:16}}/> 
						</TouchableOpacity>
						}
					/>} 
					<TouchableOpacity style={{height:40,justifyContent:"center",backgroundColor: ThemeColor.BtnColor ,alignItems:'center',width:'90%',borderRadius:5}} onPress={() => setShow(false)}>
					<Text style={{color:'#53962E',fontFamily: FontName.Regular, fontSize:16, color:'#fff' }}>DONE</Text>
					</TouchableOpacity>
				</Animatable.View>
			}         
      	</SafeAreaView>
    );
}
export default AddLCADetailsScreen;


const styles = StyleSheet.create({
    container: {
      flex: 1,
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
        height:40,
        backgroundColor:'#fff',
        alignItems:"center",
    
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
		height:45,
		justifyContent:"center",
		backgroundColor: ThemeColor.BtnColor ,
		alignItems:'center',
		marginBottom:8,
		borderRadius:5
	}
  });