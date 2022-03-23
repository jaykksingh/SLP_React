import React ,{useEffect,useState}from 'react';
import { View ,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    Alert,
	SafeAreaView,
	KeyboardAvoidingView,
    Text} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'
import axios from 'axios'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import {parseErrorMessage} from '../../_helpers/Utils';
import {getAuthHeader} from '../../_helpers/auth-header';
import { BaseUrl, WebBaseURL,EndPoints, StaticMessage, ThemeColor, FontName } from '../../_helpers/constants';
import Loader from '../../Components/Loader';

const ChangePasswordScreen = ({navigation})  => {
	const [isLoading, setIsLoading] = React.useState(false);
	const [data, setData] = React.useState({
		oldPassword:'',
		newPassword:'',
		confirmPassword:'',
		comment:''
	});

	React.useLayoutEffect(() => {
		navigation.setOptions({
		  title: "Change password",
		});
	}, [navigation]);

	
	useEffect(() => {
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
	}, []);

	const  handleSubmit = async() => {

		let user = await AsyncStorage.getItem('loginDetails');  
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken);
		setIsLoading(true);
		axios ({  
		  "method": "POST",
		  "url": BaseUrl + EndPoints.ChangePassword,
		  "headers": getAuthHeader(authToken),
		  data:{'oldPassword':data.oldPassword,'newPassword':data.newPassword,'confirmPassword':data.confirmPassword}
		})
		.then((response) => {
		  setIsLoading(false);
		  if (response.data.code == 200){
			const results = JSON.stringify(response.data.content)
			console.log(`HR Benefits: ${results}`);
			Alert.alert(StaticMessage.AppName, response.data.content.messageList.success, 
			[{
				text: 'Ok',
				onPress: () => navigation.goBack()
			}]);
		  }else if (response.data.code == 417){
			console.log(Object.values(response.data.content.messageList));
			const message = parseErrorMessage(response.data.content.messageList);

			Alert.alert(StaticMessage.AppName, message, [
			  {text: 'Ok'}
			]);
	
		  }
		})
		.catch((error) => {
		  console.error(error);
		  setIsLoading(false);
		  Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
			{text: 'Ok'}
		  ]);
	
		})
	}
	
	return(
		<SafeAreaView style={styles.container}>			
			<KeyboardAwareScrollView style={{padding:16}}>
				<View style={{marginTop:4}}>
					<Text style ={{color:ThemeColor.TextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Old password</Text>
					<View style={{backgroundColor:'white', height:40, borderRadius:3, flexDirection:'row', alignItems:'center', paddingRight:8, marginTop:4}}>
						<TextInput  
							style={[styles.inputText,{height:40, textAlignVertical:'top'}]}
							placeholder="Old password" 
							placeholderTextColor={ThemeColor.PlaceHolderColor}
							keyboardType='default'
							secureTextEntry= {true}
							value= {data.oldPassword}
							onChangeText={(val) => setData({...data,oldPassword:val})}
						/>
					</View>
				</View>    
				<View style={{marginTop:12}}>
					<Text style ={{color:ThemeColor.TextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>New password</Text>
					<View style={{backgroundColor:'white', height:40, borderRadius:3, flexDirection:'row', alignItems:'center', paddingRight:8, marginTop:4}}>
						<TextInput  
							style={[styles.inputText,{height:40, textAlignVertical:'top'}]}
							placeholder="New password" 
							placeholderTextColor={ThemeColor.PlaceHolderColor}
							keyboardType='default'
							secureTextEntry= {true}
							value= {data.newPassword}
							onChangeText={(val) => setData({...data,newPassword:val})}
						/>
					</View>
				</View>    
				<View style={{marginTop:12}}>
					<Text style ={{color:ThemeColor.TextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Confirm password</Text>
					<View style={{backgroundColor:'white', height:40, borderRadius:3, flexDirection:'row', alignItems:'center', paddingRight:8, marginTop:4}}>
						<TextInput  
							style={[styles.inputText,{height:40, textAlignVertical:'top'}]}
							placeholder="Confirm password" 
							placeholderTextColor={ThemeColor.PlaceHolderColor}
							keyboardType='default'
							secureTextEntry= {true}
							value= {data.confirmPassword}
							onChangeText={(val) => setData({...data,confirmPassword:val})}
						/>
					</View>
				</View>    
        	</KeyboardAwareScrollView>
			<TouchableOpacity style={styles.btnFill} onPress={() => {handleSubmit()}}>
				<Text style={{color:'#53962E',fontFamily: FontName.Regular, fontSize:16, color:'#fff' }}>UPDATE</Text>
			</TouchableOpacity> 
			<Loader isLoading={isLoading} />
		</SafeAreaView>
	);
}

export default ChangePasswordScreen;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:ThemeColor.ViewBgColor,
    },inputText:{
		flex: 1,
		height:40,
		color:'black',
		fontSize:16,
		fontFamily: FontName.Regular,
		marginLeft:8,
		alignContent:'stretch',
	  },btnFill:{
		height:50,
		justifyContent:"center",
		backgroundColor: ThemeColor.BtnColor ,
		alignItems:'center',
		marginBottom:8, borderRadius:5,
		marginLeft:16, marginRight:16,
	  }
  });
