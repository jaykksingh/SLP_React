/* eslint-disable react/display-name */
import React , {useEffect,createRef} from "react";
import { View,
    Text,
    StyleSheet,
    Alert,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
	Platform
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'
import axios from 'axios';
import Feather from 'react-native-vector-icons/Feather';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import Icons from 'react-native-vector-icons/Ionicons';
import {Picker} from '@react-native-picker/picker';
import ActionSheet from "react-native-actions-sheet";
import {parseErrorMessage} from '../../_helpers/Utils';
import Loader from '../../Components/Loader';
import { getAuthHeader} from '../../_helpers/auth-header';
import { BaseUrl, EndPoints, StaticMessage, ThemeColor, FontName } from '../../_helpers/constants';


const applForRef = createRef();
const priorityRef = createRef();
const currentStatusRef = createRef();
const skillsRef = createRef();


const NewLCAScreen = ({route,navigation}) => {
	let [isLoading, setLoading] = React.useState(false);
	let [data,setData] = React.useState({
		applTypeName:'',
		applTypeId:'',
		applFor:'',
		applForId:'',
		firstName:'',
		lastName:'',
		email:'',
		contactNumber:'',
		contactNumberCountryCode:'1',
		appPriorityId:'',
		appPriority:'',
		currentStatusName:'',
		currentStatus:'',
		skillCategoryId:'',
		skillCategory:'',
		comments:'',
		documentsList:[]
	});
	const {applTypeName} = route.params;
	const {applTypeId} = route.params;
	const {lookUpData} = route.params;
	const {docList} = route.params;

	

	React.useLayoutEffect(() => {
		navigation.setOptions({
			title:'New application - details'
		});
	}, [navigation]);

	useEffect(() => {
		if(applTypeName){
			setData({...data,applTypeId:applTypeId,applTypeName:applTypeName});
		}
		
	},[]);

  	const updateApplicationDetails = async () => {
		setLoading(true);

		let user = await AsyncStorage.getItem('loginDetails');  
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var encoded = base64.encode(userAuthToken);

		console.log('URL:'+ BaseUrl + EndPoints.LegalFilingList + applTypeId);
		let params = {
			'appType':data.applTypeId,
			'firstName':data.firstName,
			'lastName':data.lastName,
			'email':data.email,
			'contactNumber':data.contactNumber,
			'contactNumberCountryCode':data.contactNumberCountryCode,
			'appForId':data.applForId,
			'appPriorityId':data.appPriorityId,
			'currentStatus':data.currentStatus,
			'skillCategoryId':data.skillCategoryId,
			'comments':data.comments,
		}

		axios ({
			"method": "POST",
			"url": BaseUrl + EndPoints.LegalFilingList,
			"headers": getAuthHeader(encoded),
			data:params
		})
		.then((response) => {
		setLoading(false);
		if (response.data.code == 200){
			let result = JSON.stringify(response.data.content);
			console.log('App Details:',result);
			if(docList.length == 0){
				navigation.goBack();
			}else{
				navigation.navigate('NewLcaDocument',{detail:response.data.content.dataList[0],documentList:docList,name:data.firstName + ' ' + data.lastName, applTypeName:data.applTypeName})
			}
		}else if (response.data.code == 417){
			setLoading(false);
			const message = parseErrorMessage(response.data.content.messageList);
			Alert.alert(StaticMessage.AppName, message, [
			{text: 'Ok'}
			]);

		}else{

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
							<Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22,22} />
						</TouchableOpacity>
					</View> :
					<View style={{marginTop:12}}>
						<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Application for</Text>
						<TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}  onPress={() => {applForRef.current?.setModalVisible()}}>
							<Picker
								style={{backgroundColor: 'white',flex:1,fontSize:14, fontFamily: FontName.Regular}}
								itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
								selectedValue={data.applForId}
								onValueChange={(itemValue, index) =>{
									let selectedObj = lookUpData.applicationForList[index];
									setData({...data, applForId: selectedObj.keyId,applFor: selectedObj.keyName});
								}}>
								{lookUpData && lookUpData.applicationForList.map((item, index) => {
									return (<Picker.Item label={item.keyName} value={item.keyId} key={index}/>) 
								})}
							</Picker>
							<Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22,22} />
						</TouchableOpacity>
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
						maxLength={12}
						placeholderTextColor={ThemeColor.PlaceHolderColor}
						keyboardType='phone-pad'
						textContentType='telephoneNumber' 
						dataDetectorTypes='phoneNumber' 
						value= {data.contactNumber}
						onChangeText={(val) => setData({...data,contactNumber:val})}
						/>
					</View>
				</View>
				<View style={{marginTop:12}}>
					<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Priority</Text>
					<TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}  onPress={() => {priorityRef.current?.setModalVisible()}}>
						<Text style={[styles.labelText,{color:data.appPriority.length > 0 ? 'black' : ThemeColor.PlaceHolderColor}]}>{data.appPriority.length >0 ? data.appPriority : 'Priority'}</Text>
						<Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22,22} />
					</TouchableOpacity>
				</View>
				<View style={{marginTop:12}}>
					<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Current employment status for</Text>
					<TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}  onPress={() => {currentStatusRef.current?.setModalVisible()}}>
						<Text style={[styles.labelText,{color:data.currentStatusName.length > 0 ? 'black' : ThemeColor.PlaceHolderColor}]}>{data.currentStatusName.length >0 ? data.currentStatusName : 'Employment status'}</Text>
						<Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22,22} />
					</TouchableOpacity>
				</View>
				<View style={{marginTop:12}}>
					<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Skill</Text>
					<TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}  onPress={() => {skillsRef.current?.setModalVisible()}}>
						<Text style={[styles.labelText,{color:data.skillCategory.length > 0 ? 'black' : ThemeColor.PlaceHolderColor}]}>{data.skillCategory.length >0 ? data.skillCategory : 'Skills'}</Text>
						<Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22,22} />
					</TouchableOpacity>
				</View>
				<View style={{marginTop:12}}>
					<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Comment</Text>
					<View style={{backgroundColor:'white', height:100, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}>
					<TextInput  
						style={[styles.inputText,{height:90, textAlignVertical:'top'}]}
						multiline={true}
						placeholder="Enter comment" 
						placeholderTextColor={ThemeColor.PlaceHolderColor}
						keyboardType='default'
						value= {data.comments}
						onChangeText={(val) => setData({...data,comments:val})}
					/>
					</View>
				</View> 
			</KeyboardAwareScrollView>
			<View style={{flexDirection:'row',borderRadius:5,marginTop:8, marginLeft:16, marginRight:16,}}>
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
					<Text style={{color:ThemeColor.TextColor, fontSize:16, fontFamily: 'Lato-Bold'}}>Select project</Text>
					<TouchableOpacity onPress={() => {
						data.applFor.length == 0 ? setData({...data,applForId:lookUpData.applicationForList[0].keyId,applFor:lookUpData.applicationForList[0].keyName}) : '';
						applForRef.current?.setModalVisible()}
					}>
						<Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Done</Text>
					</TouchableOpacity>
					</View>
					<Picker
						style={{backgroundColor: 'white',flex:1,fontSize:14, fontFamily: FontName.Regular}}
						itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
						selectedValue={data.applForId}
						onValueChange={(itemValue, index) =>{
							let selectedObj = lookUpData.applicationForList[index];
							setData({...data, applForId: selectedObj.keyId,applFor: selectedObj.keyName});
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
					<Text style={{color:ThemeColor.TextColor, fontSize:16, fontFamily: 'Lato-Bold'}}>Select priority</Text>
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
					<Text style={{color:ThemeColor.TextColor, fontSize:16, fontFamily: 'Lato-Bold'}}>Select priority</Text>
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
					<Text style={{color:ThemeColor.TextColor, fontSize:16, fontFamily: 'Lato-Bold'}}>Select priority</Text>
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
      	</SafeAreaView>
    );
}
export default NewLCAScreen;


const styles = StyleSheet.create({
    // container: {
    //   flex: 1,
    // },inputView:{
    //     flexDirection:'row',
    //     paddingLeft:16,
    //     paddingRight:16,
    //     height:40,
    //     alignItems:"center", 
    //     backgroundColor:ThemeColor.BorderColor
    
    //   },
    //   bottomView:{
    //     flexDirection:'row',
    //     height:40,
    //     backgroundColor:'#fff',
    //     alignItems:"center",
    
    //   },inputText:{
	// 	flex: 1,
	// 	height:40,
	// 	color:'black',
	// 	fontSize:16,
	// 	fontFamily: FontName.Regular,
	// 	marginLeft:8,
	// 	alignContent:'stretch',
	//   },
	//   labelText:{
	// 	flex: 1,
	// 	color:'black',
	// 	fontSize:16,
	// 	fontFamily: FontName.Regular,
	// 	marginLeft:8,
	// 	alignContent:'stretch',
	//   },btnFill:{
	// 	flex: 1,
	// 	height:45,
	// 	justifyContent:"center",
	// 	backgroundColor: ThemeColor.BtnColor ,
	// 	alignItems:'center',
	// }
  });