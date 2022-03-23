import React ,{useEffect}from 'react';
import { View ,
    TouchableOpacity,
    StyleSheet,
    Alert,
    TextInput,
    SafeAreaView,
	KeyboardAvoidingView,
    Text} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'
import axios from 'axios'
import {getAuthHeader} from '../../_helpers/auth-header';
import { BaseUrl, EndPoints, StaticMessage, ThemeColor, FontName } from '../../_helpers/constants';
import {parseErrorMessage} from '../../_helpers/Utils';
import Loader from '../../Components/Loader';




const PayPalAccountScreen = ({route,navigation})  => {

	const [isLoading, setIsLoading] = React.useState(false);
	const [data,setData] = React.useState({
		paypalId:''
	});
	let [profileData, setProfileData] = React.useState({});

	React.useLayoutEffect(() => {
		navigation.setOptions({
			title:'PayPal'
		});
	}, [navigation]);
	useEffect(() => {
		getProfileDetails();
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
	},[]);
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
				let empDetails = response.data.content.dataList[0].empDetails;
				setData({...data,paypalId:empDetails.paypalId});
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
	const  updateProfileDetails = async() => {
		let user = await AsyncStorage.getItem('loginDetails');  
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken);
	
		setIsLoading(true);
		const params = {
			"paypalId":data.paypalId
		}
		axios ({  
		  "method": "PUT",
		  "url": BaseUrl + EndPoints.UserProfile,
		  "headers": getAuthHeader(authToken),
		  data:{'empDetails':params}
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
			console.log(error)
		  setIsLoading(false);
		  Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
			{text: 'Ok'}
		  ]);
	
		})
	}

  
	
  	return(
		<SafeAreaView style={styles.container}>
			<KeyboardAvoidingView style={{paddingLeft:16, paddingRight:16, marginTop:16,marginBottom:32,width:'100%' }}>
				<View style={{marginTop:12}}>
					<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>PayPal account</Text>
					<View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}>
						<TextInput  
							style={styles.inputText}
							placeholder="PayPal account email id" 
							placeholderTextColor={ThemeColor.PlaceHolderColor}
							keyboardType='default'
							value= {data.paypalId}
							onChangeText={(val) => setData({...data,paypalId:val})}
						/>
					</View>
				</View> 
        	</KeyboardAvoidingView>
			<TouchableOpacity style={styles.btnFill} onPress={() => {updateProfileDetails()}}>
				<Text style={{color:'#53962E',fontFamily: FontName.Regular, fontSize:16, color:'#fff' }}>UPDATE</Text>
			</TouchableOpacity>
			<Loader isLoading={isLoading} />
			
		</SafeAreaView>	
	);
}

export default PayPalAccountScreen;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:'#E5E9EB' 
    },
    inputText:{
		flex: 1,
		height:40,
		color:'black',
		fontSize:16,
		fontFamily: FontName.Regular,
		marginLeft:8,
		alignContent:'stretch',
	  },btnFill:{
		width:200,
        margin: 16,
        height:50,
        justifyContent:"center",
        backgroundColor:ThemeColor.BtnColor ,
        alignItems:'center',
        borderRadius:5,
		alignSelf:'center'
      }
  });
