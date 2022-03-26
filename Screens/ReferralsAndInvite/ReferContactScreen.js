import React,{useEffect,userState,createRef} from "react";
import { 
	StatusBar, 
    Text, 
    TouchableOpacity,
    StyleSheet, 
    View,
	TextInput,
	FlatList,
	Alert,
	SafeAreaView
} from "react-native";
import Icons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'
import axios from 'axios'
import RNFS from 'react-native-fs';
import DocumentPicker from 'react-native-document-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import MovableView from 'react-native-movable-view';
import * as Animatable from 'react-native-animatable';
import {getAuthHeader} from '../../_helpers/auth-header';
import { BaseUrl, EndPoints, StaticMessage, ThemeColor, FontName } from '../../_helpers/constants';
import {parseErrorMessage} from '../../_helpers/Utils';
import Loader from '../../Components/Loader';


const ReferContactScreen = ({route,navigation}) => {
	const [isLoading, setIsLoading] = React.useState(false);

	const [data,setData] = React.useState({
		firstName:'',
		lastName:'',
		email:'',
		fromDate:'',
		contactNumber:'',
		contactNumberDialCode:'1',
		resumeData:'',
		fileName:''
	});
	const [show, setShow] = React.useState(false);
	const [lookupData, setLookupData] = React.useState({});

	React.useLayoutEffect(() => {
		navigation.setOptions({
			  title: `Refer your contact `,
		});
	}, [navigation]);
	
	useEffect(() => {
		getUserLookups();
		if(navigation.dangerouslyGetParent){
		  const parent = navigation.dangerouslyGetParent();
		  parent.setOptions({
			tabBarVisible: false
		  });
		  return () =>
			parent.setOptions({
			tabBarVisible: false
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
	const  handleSubmit = async() => {
		
		let user = await AsyncStorage.getItem('loginDetails');  
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken);

		setIsLoading(true);
		const params = {
			"firstName":data.firstName,
			'lastName':data.lastName,
			'email':data.email,
			'phone':data.contactNumber,
			'phoneCountryCode':data.contactNumberDialCode,
			'resumeFile':data.resumeData,
			'resumeName':data.fileName
		}
		console.log('Params:',JSON.stringify(params));
		axios ({  
		  "method": "POST",
		  "url": BaseUrl + EndPoints.ReferarContact,
		  "headers": getAuthHeader(authToken),
		  data:params
		})
		.then((response) => {
			setIsLoading(false);
			if (response.data.code == 200){
				let messageObj = response.data.content.messageList;
				showSucessAlert(messageObj);				
			}else if (response.data.code == 417){
				const message = parseErrorMessage(response.data.content.messageList);
				Alert.alert(StaticMessage.AppName, message, [
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
	const showSucessAlert = (messageObj) => {
		const msgList = Object.values(messageObj);
		Alert.alert(StaticMessage.AppName,msgList.join(),
			[{
				text: 'Ok',
				onPress: () => navigation.goBack()
			}]
		)
	}
	
	const selectResume = async () => {
        try {
            const res = await DocumentPicker.pick({
                type: [DocumentPicker.types.pdf,DocumentPicker.types.doc,DocumentPicker.types.docx,DocumentPicker.types.plainText],
            });
            console.log(res.uri,res.type, res.name,res.size);
			var newURI = res.uri.split("%20").join("\ ");
            var base64data = await RNFS.readFile( newURI, 'base64').then(res => { return res });
			setData({...data,resumeData:base64data,fileName:res.name});
        } catch (err) {
            if (DocumentPicker.isCancel(err)) {
            } else {
                throw err;
            }
        }
    }
	const didSelectDialCode = (selectedItem) => {
		console.log(selectedItem);
		setData({...data,contactNumberDialCode: selectedItem.dialCode});
		setShow(false);
	}
	 
	const textPhoneChange = (text) => {
		var cleaned = ('' + text).replace(/\D/g, '')
		var match = cleaned.match(/^(1|)?(\d{3})(\d{3})(\d{4})$/)
		if (match) {
			var intlCode = (match[1] ? '+1 ' : ''),
				number = [intlCode, '(', match[2], ') ', match[3], '-', match[4]].join('');
	
		   
			setData({...data,contactNumber: number});
	
			return;
		}
		setData({...data,contactNumber: text});
	}
	const countryDialCodeList = lookupData ? lookupData.countryDialCode : [];
  
	return(
		<SafeAreaView style={styles.container}>
			<KeyboardAwareScrollView style={{paddingLeft:16, paddingRight:16, marginBottom:8}}>
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
					<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Email*</Text>
					<View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}>
						<TextInput  
						style={styles.inputText}
						placeholder="Email" 
						placeholderTextColor={ThemeColor.PlaceHolderColor}
						keyboardType='email-address'
						value= {data.description}
						onChangeText={(val) => setData({...data,email:val})}
						/>
					</View>
				</View>
				<View style={{marginTop:12}}>
					<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Phone number</Text>
					<View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}>
						<TouchableOpacity style={{flexDirection: 'row',marginRight:8, paddingLeft:8, alignItems:'center', justifyContent:'center'}} onPress={() => setShow(true)}>
							{/* <Flag code="DE" size={32}/> */}
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
						value= {data.contactNumber}
						onChangeText={(val) => textPhoneChange(val)}
						/>
					</View>
				</View>
				<View style={{marginTop:32,alignItems:'center'}}>
					<TouchableOpacity onPress = {() => {selectResume()}}>
						<FontAwesome name="cloud-upload" color={ThemeColor.BtnColor} size={80} />
					</TouchableOpacity> 
					<Text style={{fontFamily:FontName.Regular, fontSize:16,color:ThemeColor.SubTextColor, textAlign:'center'}}>{data.fileName.length > 0 ? data.fileName : 'Upload file'}</Text>
					<Text style={{fontFamily:FontName.Regular, fontSize:14,color:ThemeColor.SubTextColor, textAlign:'center', marginTop:2}}>Maximum file size: 2MB</Text>
				</View>
				<Loader isLoading={isLoading} />
			</KeyboardAwareScrollView>
			<View style={{flexDirection:'row',borderRadius:5, marginTop:8, marginLeft:16, marginRight:16,}}>
				<TouchableOpacity style={styles.btnFill} onPress={() => {handleSubmit()}}>
				<Text style={{color:'#53962E',fontFamily: FontName.Regular, fontSize:16, color:'#fff' }}>SAVE</Text>
				</TouchableOpacity>
			</View>
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

export default ReferContactScreen;

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
		marginBottom:8
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