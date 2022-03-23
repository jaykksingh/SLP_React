import React,{useEffect,useState,createRef,useRef} from "react";
import { 
	StatusBar, 
    Text, 
    TouchableOpacity,
    StyleSheet, 
    View,
	TextInput,
	FlatList,
	Alert,
	SafeAreaView,
	Platform
} from "react-native";
import Icons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'
import axios from 'axios'
import ActionSheet from "react-native-actions-sheet";
import {Picker} from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/Ionicons';
import MovableView from 'react-native-movable-view';
import * as Animatable from 'react-native-animatable';
import Loader from '../../Components/Loader';
import {getAuthHeader} from '../../_helpers/auth-header';
import { BaseUrl, EndPoints, StaticMessage, ThemeColor, FontName } from '../../_helpers/constants';
import {parseErrorMessage} from '../../_helpers/Utils';

const countryRef = createRef();
const stateRef = createRef();
const cityRef = createRef();



const ReferClientScreen = ({route,navigation}) => {
	const [isLoading, setIsLoading] = React.useState(false);
	const [countryArray,setCountryArray] = useState([]);
	const [stateArray,setStateArray] = useState([]);
	const [cityArray,setCityArray] = useState([]);
    const [show, setShow] = React.useState(false);
	const [lookupData, setLookupData] = useState({});

	const [data,setData] = React.useState({
		companyName:'',
		jobPosition:'',
		address:'',
		countryId:'',
		stateId:'',
		cityId:'',
		countryName:'',
		stateName:'',
		cityName:'',
		name:'',
		jobTitle:'',
		emailId:'',
		phone:'',
		contactNumberDialCode:'1',
		cnShortCountryCode:'us',
		comment:'',
	});
	const ref_input1 = useRef();
	const ref_input2 = useRef();
	const ref_input3 = useRef();
	const ref_input4 = useRef();
	const ref_input5 = useRef();

	React.useLayoutEffect(() => {
		navigation.setOptions({
			  title: `Refer a client `,
		});
	}, [navigation]);
	
	useEffect(() => {
		getRegionList('COUNTRY');
		getUserLookups();
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
		
	  },[])
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
		  if (response.data.code == 200){
			setIsLoading(false);
			setLookupData(response.data.content.dataList[0]);
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
	const  getRegionList = async(regionType, keyId) => {
		let user = await AsyncStorage.getItem('loginDetails');  
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken);
		setIsLoading(true);
		var url = BaseUrl + EndPoints.CountryEndPoint;
		if(regionType == 'STATE'){
			url = BaseUrl + EndPoints.StateEndPint + keyId;
		}else if(regionType == 'CITY'){
			url = BaseUrl + EndPoints.CityEndPint + keyId;
		}
		console.log('URL:',url);
		axios ({  
		  "method": "GET",
		  "url": url,
		  "headers": getAuthHeader(authToken),
		})
		.then((response) => {
		  if (response.data.code == 200){
			setIsLoading(false);
			console.log('COUNTRY:',response.data.content.dataList);
			if(regionType == 'COUNTRY'){
			  setCountryArray(response.data.content.dataList);
			}else if (regionType == 'STATE'){
			  setStateArray(response.data.content.dataList);
			}else if (regionType == 'CITY'){
			  setCityArray(response.data.content.dataList);
			}
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
	const  handleSubmit = async() => {
		
		let user = await AsyncStorage.getItem('loginDetails');  
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken);

		setIsLoading(true);
		var cleaned = ('' + data.phone).replace(/\D/g, '')

		const params = {
			"companyName":data.companyName,
			'jobPosition':data.jobPosition,
			'address':data.address,
			'countryId':data.countryName,
			'stateId':data.stateName,
			'cityId':data.cityName,
			'name':data.name,
			'jobTitle':data.jobTitle,
			'emailId':data.emailId,
			'phone':cleaned,
			'phoneCountryCode':data.contactNumberDialCode,
			'comment':data.comment
		}
		console.log('Params:',JSON.stringify(params));
		axios ({  
		  "method": "POST",
		  "url": BaseUrl + EndPoints.ReferClient,
		  "headers": getAuthHeader(authToken),
		  data:params
		})
		.then((response) => {
			setIsLoading(false);
			console.log(response);
			if (response.data.code == 200){
				let messageObj = response.data.content.messageList;
				if(messageObj.success){
					Alert.alert(StaticMessage.AppName,"Thank you for your referral, we will be reaching out to them as soon as possible.",
					[{
						text: 'Ok',
						onPress: () => navigation.goBack()
					}]
				)
				}else{
					showSucessAlert(messageObj);				
				}
			}else if (response.data.code == 417){
				const message = parseErrorMessage(response.data.content.messageList);
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
	const showSucessAlert = (messageObj) => {
		const msgList = Object.values(messageObj);
		Alert.alert(StaticMessage.AppName,msgList.join(),
			[{
				text: 'Ok',
				onPress: () => navigation.goBack()
			}]
		)
	}
	
	const textPhoneChange = (text) => {
		var cleaned = ('' + text).replace(/\D/g, '')
		var match = cleaned.match(/^(1|)?(\d{3})(\d{3})(\d{4})$/)
		if (match) {
			var intlCode = (match[1] ? '+1 ' : ''),
				number = [intlCode, '(', match[2], ') ', match[3], '-', match[4]].join('');
	
		   
			setData({...data,phone: number});
	
			return;
		}
		setData({...data,phone: text});
	}
	const handleStatePicker = () => {
		if(data.countryId.length == 0){
		  Alert.alert(StaticMessage.AppName, 'Please select country first', [
			{text: 'Ok'}
		  ]);
		}else{
		  stateRef.current?.setModalVisible();
		}
	  }
	const handleCityPicker = () => {
		if(data.stateId.length == 0){
		  Alert.alert(StaticMessage.AppName, 'Please select state first', [
			{text: 'Ok'}
		  ]);
		}else{
		  cityRef.current?.setModalVisible();
		}
	}
	const didSelectDialCode = (selectedItem) => {
		console.log(selectedItem);
		setData({...data,contactNumberDialCode: selectedItem.dialCode,cnShortCountryCode:selectedItem.countryCode});
		setShow(false);
	}


	const countryDialCodeList = lookupData ? lookupData.countryDialCode : [];

	return(
		<SafeAreaView style={styles.container}>
			<KeyboardAwareScrollView style={{paddingLeft:16, paddingRight:16, marginBottom:8}}>
				<View style={{ height:40, justifyContent: 'center'}}>
					<Text style ={{color:ThemeColor.TextColor, fontSize:16,fontFamily:FontName.Bold}}>Client details</Text>
				</View>
				<View style={{}}>
					<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Company name</Text>
					<View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}>
						<TextInput  
							style={styles.inputText}
							placeholder="Company name" 
							placeholderTextColor={ThemeColor.PlaceHolderColor}
							keyboardType='default'
							value= {data.companyName}
							onChangeText={(val) => setData({...data,companyName:val})}
							returnKeyType='next'
							onSubmitEditing={() => {ref_input1.current.focus()}}

						/>
					</View>
				</View>
				<View style={{marginTop:12}}>
					<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Job position (if known)</Text>
					<View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}>
						<TextInput  
							style={styles.inputText}
							placeholder="Job position" 
							placeholderTextColor={ThemeColor.PlaceHolderColor}
							keyboardType='default'
							value= {data.jobPosition}
							onChangeText={(val) => setData({...data,jobPosition:val})}
							returnKeyType='next'
							ref={ref_input1}
							onSubmitEditing={() => {ref_input2.current.focus()}}
						/>
					</View>
				</View>
				<View style={{marginTop:12}}>
					<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Address</Text>
					<View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}>
						<TextInput  
							style={styles.inputText}
							placeholder="Address" 
							placeholderTextColor={ThemeColor.PlaceHolderColor}
							keyboardType='default'
							value= {data.address}
							onChangeText={(val) => setData({...data,address:val})}
							ref={ref_input2}
							returnKeyType='next'
							onSubmitEditing={() => {ref_input3.current.focus()}}

						/>
					</View>
				</View>
				{Platform.OS == 'ios' ?
					<>
						<View style={{marginTop:12}}>
							<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Country</Text>
							<TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}  onPress={() => {countryRef.current?.setModalVisible()}}>
								<Text style={[styles.labelText,{color:data.countryName.length > 0 ? 'black' : ThemeColor.PlaceHolderColor}]}>{data.countryName.length >0 ? data.countryName : 'Country'}</Text>
								<Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22,22} />
							</TouchableOpacity>
						</View>
						<View style={{marginTop:12}}>
							<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>State</Text>
							<TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}  onPress={() => {handleStatePicker()}}>
								<Text style={[styles.labelText,{color:data.stateName.length > 0 ? 'black' : ThemeColor.PlaceHolderColor}]}>{data.stateName.length >0 ? data.stateName : 'State'}</Text>
								<Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22,22} />
							</TouchableOpacity>
						</View>
						<View style={{marginTop:12}}>
							<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>City</Text>
							<TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}  onPress={() => {handleCityPicker()}}>
								<Text style={[styles.labelText,{color:data.cityName.length > 0 ? 'black' : ThemeColor.PlaceHolderColor}]}>{data.cityName.length >0 ? data.cityName : 'City'}</Text>
								<Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22,22} />
							</TouchableOpacity>
						</View>
					</> :
					<>
						<View style={{marginTop:12}}>
							<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Country</Text>
							<View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}>
								<Picker
									style={{backgroundColor: 'white',flex:1,}}
									itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
									selectedValue={parseInt(data.countryId)}
									onValueChange={(itemValue, index) =>{
										console.log(itemValue,index)
										let selectedItem = countryArray[index];
												console.log(selectedItem);
												setData({...data,countryName:selectedItem.countryName,countryId:selectedItem.countryId});
												getRegionList('STATE',selectedItem.countryId)
									}}>
									{countryArray && countryArray.map((item, index) => {
										return (<Picker.Item label={item.countryName} value={item.countryId} key={index}/>) 
									})}
								</Picker>
								<Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22,22} />
							</View>
						</View>
						<View style={{marginTop:12}}>
							<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>State</Text>
							<View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}  >
								<Picker
									style={{backgroundColor: 'white',flex:1,}}
									itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
									selectedValue={parseInt(data.stateId)}
									onValueChange={(itemValue, index) =>{
										console.log(itemValue,index)
										let selectedItem = stateArray[index];
										setData({...data,stateName:selectedItem.stateName,stateId:selectedItem.stateId});
										getRegionList('CITY',selectedItem.stateId)

									}}>
									{stateArray && stateArray.map((item, index) => {
										return (<Picker.Item label={item.stateName} value={item.stateId} key={index}/>) 
									})}
								</Picker>
								<Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22,22} />
							</View>
						</View>
						<View style={{marginTop:12}}>
							<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>City</Text>
							<TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}  onPress={() => {cityRef.current?.setModalVisible()}}>
								<Picker
									style={{backgroundColor: 'white',flex:1,}}
									itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
									selectedValue={parseInt(data.cityId)}
									onValueChange={(itemValue, index) =>{
										console.log(itemValue,index)
										let selectedItem = cityArray[index];
												console.log(selectedItem);
										setData({...data,cityName:selectedItem.cityName,cityId:selectedItem.cityId});

									}}>
									{cityArray && cityArray.map((item, index) => {
										return (<Picker.Item label={item.cityName} value={item.cityId} key={index}/>) 
									})}
								</Picker>
								<Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22,22} />
							</TouchableOpacity>
						</View>
					</>

				}
				<></>
				<View style={{ height:40, justifyContent: 'center',marginTop:12}}>
					<Text style ={{color:ThemeColor.TextColor, fontSize:16,fontFamily:FontName.Bold}}>Contact person info</Text> 
				</View>
				<View style={{marginTop:0}}>
					<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Full name</Text>
					<View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}>
						<TextInput  
							style={styles.inputText}
							placeholder="Name" 
							placeholderTextColor={ThemeColor.PlaceHolderColor}
							keyboardType='default'
							value= {data.name}
							onChangeText={(val) => setData({...data,name:val})}
							ref={ref_input3}
							returnKeyType='next'
							onSubmitEditing={() => {ref_input4.current.focus()}}

						/>
					</View>
				</View>
				<View style={{marginTop:12}}>
					<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Job title</Text>
					<View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}>
						<TextInput  
							style={styles.inputText}
							placeholder="Job title" 
							placeholderTextColor={ThemeColor.PlaceHolderColor}
							keyboardType='default'
							value= {data.jobTitle}
							onChangeText={(val) => setData({...data,jobTitle:val})}
							ref={ref_input4}
							returnKeyType='next'
							onSubmitEditing={() => {ref_input5.current.focus()}}
						/>
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
							value= {data.emailId}
							onChangeText={(val) => setData({...data,emailId:val})}
							ref={ref_input5}
						/>
					</View>
				</View>
				<View style={{marginTop:12}}>
					<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Phone number</Text>
					<View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}>
						<TouchableOpacity style={{flexDirection: 'row',marginRight:8, paddingLeft:8, alignItems:'center', justifyContent:'center'}} onPress={() => setShow(true)}>
							<Text style={{color:ThemeColor.TextColor, fontSize:16, fontFamily: FontName.Regular, marginRight:8, marginLeft:8}}>+{data.contactNumberDialCode}</Text>
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
						value= {data.phone}
						onChangeText={(val) => textPhoneChange(val)}
						/>
					</View>
				</View>
				<View style={{marginTop:12}}>
					<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Comments</Text>
					<View style={{backgroundColor:'white', height:100, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}>
						<TextInput  
						style={[styles.inputText,{height:90, textAlignVertical:'top'}]}
						multiline={true}
						placeholder="Enter comment" 
						placeholderTextColor={ThemeColor.PlaceHolderColor}
						keyboardType='default'
						value= {data.comment}
						onChangeText={(val) => setData({...data,comment:val})}
						/>
					</View>
				</View> 
				
				<Loader isLoading={isLoading} />
			</KeyboardAwareScrollView>
			<View style={{flexDirection:'row',borderRadius:5, marginTop:8, marginLeft:16, marginRight:16,}}>
				<TouchableOpacity style={styles.btnFill} onPress={() => {handleSubmit()}}>
				<Text style={{color:'#53962E',fontFamily: FontName.Regular, fontSize:16, color:'#fff' }}>SUBMIT</Text>
				</TouchableOpacity>
			</View>
			<ActionSheet ref={countryRef} containerStyle={{backgroundColor:ThemeColor.ViewBgColor}}>
				<View style={{height:300}}>
					<View style={{height:60, flexDirection:'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft:16,paddingRight:16}}>
					<TouchableOpacity onPress={() => {countryRef.current?.setModalVisible()}}>
						<Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Cancel</Text>
					</TouchableOpacity>
					<Text style={{color:ThemeColor.TextColor, fontSize:16, fontFamily: FontName.Bold}}>Select country</Text>
					<TouchableOpacity onPress={() => {
					{data.countryName.length == 0 && setData({...data,countryName:countryArray[0].countryName,countryId:countryArray[0].countryId})}
						countryRef.current?.setModalVisible();
						{data.countryName.length == 0 && getRegionList('STATE',countryArray[0].countryId)};
					}}>
						<Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Done</Text>
					</TouchableOpacity>
					</View>
					<Picker
					style={{backgroundColor: 'white',flex:1,}}
					itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
					selectedValue={parseInt(data.countryId)}
					onValueChange={(itemValue, index) =>{
						console.log(itemValue,index)
						let selectedItem = countryArray[index];
								console.log(selectedItem);
								setData({...data,countryName:selectedItem.countryName,countryId:selectedItem.countryId,stateName:'',stateId:''});
								getRegionList('STATE',selectedItem.countryId)

					}}>
					{countryArray && countryArray.map((item, index) => {
						return (<Picker.Item label={item.countryName} value={item.countryId} key={index}/>) 
					})}
					</Picker>
				</View>
			</ActionSheet>
			<ActionSheet ref={stateRef} containerStyle={{backgroundColor:ThemeColor.ViewBgColor}}>
				<View style={{height:300}}>
					<View style={{height:60, flexDirection:'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft:16,paddingRight:16}}>
					<TouchableOpacity onPress={() => {stateRef.current?.setModalVisible()}}>
						<Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Cancel</Text>
					</TouchableOpacity>
					<Text style={{color:ThemeColor.TextColor, fontSize:16, fontFamily: FontName.Bold}}>Select state</Text>
					<TouchableOpacity onPress={() => {
							{data.stateName.length == 0 ? getRegionList('CITY',stateArray[0].stateId) : getRegionList('CITY',data.stateId)}
							{data.stateName.length == 0 && setData({...data,stateName:stateArray[0].stateName,stateId:stateArray[0].stateId})}
							stateRef.current?.setModalVisible();
							
						}}>
						<Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Done</Text>
					</TouchableOpacity>
					</View>
					<Picker
					style={{backgroundColor: 'white',flex:1,}}
					itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
					selectedValue={parseInt(data.stateId)}
					onValueChange={(itemValue, index) =>{
						console.log(itemValue,index)
						let selectedItem = stateArray[index];
						setData({...data,stateName:selectedItem.stateName,stateId:selectedItem.stateId,cityName:'',cityId:''});
						getRegionList('CITY',selectedItem.stateId)

					}}>
					{stateArray && stateArray.map((item, index) => {
						return (<Picker.Item label={item.stateName} value={item.stateId} key={index}/>) 
					})}
					</Picker>
				</View>
			</ActionSheet>
			<ActionSheet ref={cityRef} containerStyle={{backgroundColor:ThemeColor.ViewBgColor}}>
				<View style={{height:300}}>
					<View style={{height:60, flexDirection:'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft:16,paddingRight:16}}>
					<TouchableOpacity onPress={() => {cityRef.current?.setModalVisible()}}>
						<Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Cancel</Text>
					</TouchableOpacity>
					<Text style={{color:ThemeColor.TextColor, fontSize:16, fontFamily: FontName.Bold}}>Select city</Text>
					<TouchableOpacity onPress={() => {
						{data.cityName.length == 0 && setData({...data,cityName:cityArray[0].cityName,cityId:cityArray[0].cityId})}
						cityRef.current?.setModalVisible()
						}}>
						<Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Done</Text>
					</TouchableOpacity>
					</View>
					<Picker
					style={{backgroundColor: 'white',flex:1,}}
					itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
					selectedValue={parseInt(data.cityId)}
					onValueChange={(itemValue, index) =>{
						console.log(itemValue,index)
						let selectedItem = cityArray[index];
								console.log(selectedItem);
						setData({...data,cityName:selectedItem.cityName,cityId:selectedItem.cityId});

					}}>
					{cityArray && cityArray.map((item, index) => {
						return (<Picker.Item label={item.cityName} value={item.cityId} key={index}/>) 
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

export default ReferClientScreen;

const styles = StyleSheet.create({
    container: {
		flex: 1,
		backgroundColor:'#E5E9EB',
	},
	inputView:{
        flexDirection:'row',
        paddingLeft:16,
        paddingRight:16,
        height:40,
        alignItems:"center", 
        backgroundColor:ThemeColor.BorderColor
    
    },
    inputText:{
		flex: 1,
		height:40,
		color:'black',
		fontSize:16,
		fontFamily: FontName.Regular,
		marginLeft:8,
		alignContent:'stretch',
	},labelText:{
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
		borderRadius:5,
		marginBottom:8,
	},footer: {
		position:'absolute',
		bottom:0,
		flex: 1,
		backgroundColor: ThemeColor.ViewBgColor,
		borderTopLeftRadius: 30,
		borderTopRightRadius: 30,
		paddingLeft: 12,
		paddingRight: 12,
		paddingVertical: 16,
		paddingBottom:16,
		height:'90%',
		width:'100%', 
		borderColor:ThemeColor.ViewBgColor,
		borderWidth:1,
		alignItems:'center',
	},
  });