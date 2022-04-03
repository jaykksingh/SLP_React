import React ,{useEffect, useState,createRef} from "react";
import { 
    StyleSheet, 
    Text,
    TouchableOpacity,
    Alert,
    View,
	Platform
} from "react-native";
import Feather from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'
import axios from 'axios'
import {Picker} from '@react-native-picker/picker';
import ActionSheet from "react-native-actions-sheet";
import {parseErrorMessage} from '../../_helpers/Utils';
import {getAuthHeader} from '../../_helpers/auth-header';
import { BaseUrl, EndPoints, StaticMessage, ThemeColor, FontName } from '../../_helpers/constants';
import Loader from '../../Components/Loader';


const domainRef = createRef();
const subDomainRef = createRef();
const roleRef = createRef();
const skillsRef = createRef();


const DomainScreen = ({route,navigation}) => {
	const [data,setData] = React.useState({
		isLoading: true, 
		domain:'',
		domainId:'',
		subDomain:'',
		subDomainId:'',
		roleName:'',
		roleId:'',
		skillName:'',
		skillId:''
	});
  
	const { profileDetail } = route.params;
	const { lookupData } = route.params;

	const empDetails = profileDetail.empDetails;
	let [isLoading, setIsLoading] = React.useState(false);
	const [subDomainArray, setSubDomainArray] = useState([]);
	const [roleArray, setRoleArray] = useState([]);
	const [primarySkillArray, setPrimarySkillArray] = useState([]);

	useEffect(() => {
		setData({...data,
			domain: empDetails.domain,
			domainId: empDetails.domainId,
			subDomain: empDetails.subDomain,
			subDomainId: empDetails.subDomainId,
			roleName: empDetails.roleName,
			roleId: empDetails.roleId,
			skillName: empDetails.skillName,
			skillId: empDetails.skillId
		});
		getSubDomains(empDetails.domainId);
		getOtherInformation(empDetails.domainId);
		

	},[]);
    
	const  getSubDomains = async(domainID) => {
		let user = await AsyncStorage.getItem('loginDetails');  
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken);
		console.log('URL: ',BaseUrl + EndPoints.SubDomains + domainID)

		setIsLoading(true);
		axios ({  
		"method": "GET",
		"url": BaseUrl + EndPoints.SubDomains + domainID,
		"headers": getAuthHeader(authToken)
		})
		.then((response) => {
			setIsLoading(false);
			if (response.data.code == 200){
				setSubDomainArray(response.data.content.dataList);
			}else if (response.data.code == 417){
				const errorList = Object.values(response.data.content.messageList);
				Alert.alert(StaticMessage.AppName, errorList.join(), [
				{text: 'Ok'}
				]);

			}else{
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
	const  getOtherInformation = async(domainID) => {
		let user = await AsyncStorage.getItem('loginDetails');  
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken);
		console.log('URL: ',BaseUrl + EndPoints.OtherInformation + domainID)
		setIsLoading(true);
		axios ({  
		"method": "GET",
		"url": BaseUrl + EndPoints.OtherInformation + domainID,
		"headers": getAuthHeader(authToken)
		})
		.then((response) => {
			console.log(response.data);
			if (response.data.code == 200){
				let resultDict = response.data.content.dataList[0];
				setRoleArray(resultDict.roles);
				setPrimarySkillArray(resultDict.primarySkills);
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
			console.log(error);
			setIsLoading(false);
			Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
			{text: 'Ok'}
			]);
		})
	}				
  	const  updateProfileDetails = async() => {
		let user = await AsyncStorage.getItem('loginDetails');  
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken);

		setIsLoading(true);
	
		const params = {
			"domainId":data.domainId,
			'subDomainId':data.subDomainId,
			'Role':data.roleId,
			'skill':data.skillId
		}

		axios ({  
			"method": "PUT",
			"url": BaseUrl + EndPoints.UserProfile,
			"headers": getAuthHeader(authToken),
			data:{'empDetails':params}
		})
		.then((response) => {
			console.log(response.data);
			if (response.data.code == 200){
				const results = JSON.stringify(response.data.content)
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
			console.log(error);
			setIsLoading(false);
			Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
				{text: 'Ok'}
			]);

		})
  	}
	const domainList = lookupData ? lookupData.domainList : [];
	return (
		<View style={styles.container}>
			{
			Platform.OS == 'ios' ?
			<View style={{paddingLeft:16, paddingRight:16, marginTop:16,marginBottom:32 }}>
				<View style={{marginTop:12}}>
					<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Domain</Text>
					<TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}} onPress={() => {domainRef.current?.setModalVisible()}}>
						<Text style={[styles.labelText,{color:data.domain.length > 0 ? 'black' : ThemeColor.PlaceHolderColor}]}>{data.domain.length >0 ? data.domain : 'Domain'}</Text>
						<Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22,22} />
					</TouchableOpacity>
				</View> 
				<View style={{marginTop:12}}>
					<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Sub-domain</Text>
					<TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}} onPress={() => {subDomainRef.current?.setModalVisible()}}>
						<Text style={[styles.labelText,{color:data.subDomain.length > 0 ? 'black' : ThemeColor.PlaceHolderColor}]}>{data.subDomain.length >0 ? data.subDomain  : 'Sub-domain'}</Text>
						<Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22} />
					</TouchableOpacity>
				</View>
				<View style={{marginTop:12}}>
					<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Role</Text>
					<TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}} onPress={() => {roleRef.current?.setModalVisible()}}>
						<Text style={[styles.labelText,{color:data.roleName.length > 0 ? 'black' : ThemeColor.PlaceHolderColor}]}>{data.roleName.length >0 ? data.roleName : 'Role'}</Text>
						<Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22} />
					</TouchableOpacity>
				</View>
				<View style={{marginTop:12}}>
					<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Primary skill</Text>
					<TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}} onPress={() => {skillsRef.current?.setModalVisible()}}>
						<Text style={[styles.labelText,{color:data.skillName.length > 0 ? 'black' : ThemeColor.PlaceHolderColor}]}>{data.skillName.length >0 ? data.skillName : 'Primary skill'}</Text>
						<Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22} />
					</TouchableOpacity>
				</View>        

			</View> :
			<View style={{paddingLeft:16, paddingRight:16, marginTop:16,marginBottom:32 }}>
				<View style={{marginTop:12}}>
					<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Domain</Text>
					<View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center'}}>
						<Picker
							style={{flex:1,}}
							itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
							selectedValue={data.domainId}
							onValueChange={(itemValue, index) =>{
								console.log(itemValue,index)
								let selectedItem = domainList[index];
								setData({...data,domain:selectedItem.keyName,
									domainId:selectedItem.keyId,
									subDomain:'',
									subDomainId:'',
									roleName: '',
									roleId: '',
									skillName: '',
									skillId: ''
								});
								getSubDomains(selectedItem.keyId);
								getOtherInformation(selectedItem.keyId);

							}}>
							{domainList && domainList.map((item, index) => {
								return (<Picker.Item label={item.keyName} value={item.keyId} key={index}/>) 
							})}
						</Picker>
					</View>
				</View>
			
			<View style={{marginTop:12}}>
				<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Sub-domain</Text>
				<TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center'}} onPress={() => {subDomainRef.current?.setModalVisible()}}>
					<Picker
						style={{flex:1,}}
						itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
						selectedValue={data.subDomainId}
						onValueChange={(itemValue, index) =>{
							console.log(itemValue,index)
							let selectedItem = subDomainArray[index];
							setData({...data,subDomain:selectedItem.keyName,subDomainId:selectedItem.keyId});
						}}>
						{subDomainArray && subDomainArray.map((item, index) => {
							return (<Picker.Item label={item.keyName} value={item.keyId} key={index}/>) 
						})}
					</Picker>
				</TouchableOpacity>
			</View>
			<View style={{marginTop:12}}>
				<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Role</Text>
				<TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center'}} onPress={() => {roleRef.current?.setModalVisible()}}>
					<Picker
						style={{flex:1,}}
						itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
						selectedValue={data.roleId}
						onValueChange={(itemValue, index) =>{
							console.log(itemValue,index)
							let selectedItem = roleArray[index];
							setData({...data,roleName:selectedItem.Text,roleId:selectedItem.Value});

						}}>
						{roleArray && roleArray.map((item, index) => {
							return (<Picker.Item label={item.Text} value={item.Value} key={index}/>) 
						})}
					</Picker>
				</TouchableOpacity>
			</View>
			<View style={{marginTop:12}}>
				<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Primary skill</Text>
				<TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center',}} onPress={() => {skillsRef.current?.setModalVisible()}}>
					<Picker
						style={{flex:1,}}
						itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
						selectedValue={data.skillId}
						onValueChange={(itemValue, index) =>{
							console.log(itemValue,index)
							let selectedItem = primarySkillArray[index];
							setData({...data,skillName:selectedItem.Text,skillId:selectedItem.Value});

						}}>
						{primarySkillArray && primarySkillArray.map((item, index) => {
							return (<Picker.Item label={item.Text} value={item.Value} key={index}/>) 
						})}
					</Picker>
				</TouchableOpacity>
			</View>        

		</View>

		}
			<View style={{flexDirection:'row',borderRadius:5, marginLeft:16, marginRight:16,marginTop:8, marginBottom:32}}>
				<TouchableOpacity style={styles.btnFill} onPress={() => {updateProfileDetails()}}>
					<Text style={{color:'#53962E',fontFamily: FontName.Regular, fontSize:16, color:'#fff' }}>SAVE</Text>
				</TouchableOpacity>
			</View>
			<ActionSheet ref={domainRef} containerStyle={{backgroundColor:ThemeColor.ViewBgColor}}>
				<View style={{height:300}}>
					<View style={{height:60, flexDirection:'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft:16,paddingRight:16}}>
					<TouchableOpacity onPress={() => {domainRef.current?.setModalVisible()}}>
						<Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Cancel</Text>
					</TouchableOpacity>
					<Text style={{color:ThemeColor.TextColor, fontSize:16, fontFamily: FontName.Bold}}>Select domain</Text>
					<TouchableOpacity onPress={() => {
						{data.domain.length == 0 && setData({...data,domain:domainList[0].keyName,
							domainId:domainList[0].keyId,
							subDomain:'',
							subDomainId:'',
							roleName: '',
							roleId: '',
							skillName: '',
							skillId: ''
						})}
						domainRef.current?.setModalVisible()
						}}>
						<Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Done</Text>
					</TouchableOpacity>
					</View>
					<Picker
						style={{backgroundColor: 'white',flex:1,}}
						itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
						selectedValue={data.domainId}
						onValueChange={(itemValue, index) =>{
							console.log(itemValue,index)
							let selectedItem = domainList[index];
							setData({...data,domain:selectedItem.keyName,
								domainId:selectedItem.keyId,
								subDomain:'',
								subDomainId:'',
								roleName: '',
								roleId: '',
								skillName: '',
								skillId: ''
							});
							getSubDomains(selectedItem.keyId);
							getOtherInformation(selectedItem.keyId);

						}}>
						{domainList && domainList.map((item, index) => {
							return (<Picker.Item label={item.keyName} value={item.keyId} key={index}/>) 
						})}
					</Picker>
				</View>
			</ActionSheet>
			<ActionSheet ref={subDomainRef} containerStyle={{backgroundColor:ThemeColor.ViewBgColor}}>
				<View style={{height:300}}>
					<View style={{height:60, flexDirection:'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft:16,paddingRight:16}}>
					<TouchableOpacity onPress={() => {subDomainRef.current?.setModalVisible()}}>
						<Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Cancel</Text>
					</TouchableOpacity>
					<Text style={{color:ThemeColor.TextColor, fontSize:16, fontFamily: FontName.Bold}}>Select sub-domain</Text>
					<TouchableOpacity onPress={() => {
							{data.subDomain.length == 0 && setData({...data,subDomain:subDomainArray[0].keyName,subDomainId:subDomainArray[0].keyId})}
							subDomainRef.current?.setModalVisible()
						}}>
						<Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Done</Text>
					</TouchableOpacity>
					</View>
					<Picker
						style={{backgroundColor: 'white',flex:1,}}
						itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
						selectedValue={data.subDomainId}
						onValueChange={(itemValue, index) =>{
							console.log(itemValue,index)
							let selectedItem = subDomainArray[index];
							setData({...data,subDomain:selectedItem.keyName,subDomainId:selectedItem.keyId});
						}}>
						{subDomainArray && subDomainArray.map((item, index) => {
							return (<Picker.Item label={item.keyName} value={item.keyId} key={index}/>) 
						})}
					</Picker>
				</View>
			</ActionSheet>
			<ActionSheet ref={roleRef} containerStyle={{backgroundColor:ThemeColor.ViewBgColor}}>
				<View style={{height:300}}>
					<View style={{height:60, flexDirection:'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft:16,paddingRight:16}}>
					<TouchableOpacity onPress={() => {roleRef.current?.setModalVisible()}}>
						<Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Cancel</Text>
					</TouchableOpacity>
					<Text style={{color:ThemeColor.TextColor, fontSize:16, fontFamily: FontName.Bold}}>Select role</Text>
					<TouchableOpacity onPress={() => {
							{data.roleName.length == 0 && setData({...data,roleName:roleArray[0].Text,roleId:roleArray[0].Value})}
							roleRef.current?.setModalVisible()
						}}>
						<Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Done</Text>
					</TouchableOpacity>
					</View>
					<Picker
						style={{backgroundColor: 'white',flex:1,}}
						itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
						selectedValue={data.roleId}
						onValueChange={(itemValue, index) =>{
							console.log(itemValue,index)
							let selectedItem = roleArray[index];
							setData({...data,roleName:selectedItem.Text,roleId:selectedItem.Value});

						}}>
						{roleArray && roleArray.map((item, index) => {
							return (<Picker.Item label={item.Text} value={item.Value} key={index}/>) 
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
					<Text style={{color:ThemeColor.TextColor, fontSize:16, fontFamily: FontName.Bold}}>Select primary skill</Text>
					<TouchableOpacity onPress={() => {
							{data.skillName.length == 0 && setData({...data,skillName:primarySkillArray[0].Text,skillId:primarySkillArray[0].Value})}
							skillsRef.current?.setModalVisible()
						}}>
						<Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Done</Text>
					</TouchableOpacity>
					</View>
					<Picker
						style={{backgroundColor: 'white',flex:1,}}
						itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
						selectedValue={data.skillId}
						onValueChange={(itemValue, index) =>{
							console.log(itemValue,index)
							let selectedItem = primarySkillArray[index];
							setData({...data,skillName:selectedItem.Text,skillId:selectedItem.Value});

						}}>
						{primarySkillArray && primarySkillArray.map((item, index) => {
							return (<Picker.Item label={item.Text} value={item.Value} key={index}/>) 
						})}
					</Picker>
				</View>
			</ActionSheet>
			<Loader isLoading={isLoading} /> 
		</View>
	);
}

export default DomainScreen;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:'#E5E9EB',
	justifyContent: 'space-between'
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
  },footer: {
    position:'absolute',
    bottom:0,
    flex: 1,
    backgroundColor: ThemeColor.ViewBgColor,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 16,
    height:'90%',
    width:'100%', 
    borderColor:ThemeColor.ViewBgColor,
    borderWidth:1,
    alignItems:'center',
},
});