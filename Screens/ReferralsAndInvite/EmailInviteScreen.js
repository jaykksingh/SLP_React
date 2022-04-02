import React,{useEffect} from "react";
import { 
	Keyboard, 
    Text, 
    TouchableOpacity,
    StyleSheet, 
    View,
	TextInput,
	Alert,
	SafeAreaView
} from "react-native";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'
import axios from 'axios'
import {getAuthHeader} from '../../_helpers/auth-header';
import { BaseUrl, EndPoints, StaticMessage, ThemeColor, FontName } from '../../_helpers/constants';
import {parseErrorMessage} from '../../_helpers/Utils';
import Loader from '../../Components/Loader';


const EmailInviteScreen = ({route,navigation}) => {
	const [isLoading, setIsLoading] = React.useState(false);

	const [data,setData] = React.useState({
		email:'',
	});
	React.useLayoutEffect(() => {
		navigation.setOptions({
			  title: `Invite via email`,
		});
	}, [navigation]);
	
	useEffect(() => {
		
	  },[])
	
	const  showInviteConfirmation = () => {
		let emailString = data.email;
		var replaced = emailString.replace(' ', '');
		let emailArray = replaced.split(',');
		if(emailArray.length == 0 || replaced.length == 0){
			Alert.alert(StaticMessage.AppName, 'Enter valid email', [
				{text: 'Ok'}
			]);
		}else{
			let inviteEmailArray = [];
			for (let emailId of emailArray) {
				console.log(emailId);
				inviteEmailArray.push({'contactName':'','contactEmail':emailId,'sendMail':true});
			}
			console.log(inviteEmailArray);
			let message = `You are about to invite ${inviteEmailArray.length} invites.`;
    
			if (inviteEmailArray.count == 1) {
				message = "Are you sure you want to send only 1 invite?";
			}
			Alert.alert(StaticMessage.AppName,message,
				[{
					text: 'CANCEL'
				},{
					text: 'CONTINUE',
					onPress: () => handleSubmit(inviteEmailArray)
				}]
			)
			
		}
		

  	}


	const  handleSubmit = async(emailIDS) => {
		
		let user = await AsyncStorage.getItem('loginDetails');  
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken);

		setIsLoading(true);
		
		axios ({  
		  "method": "POST",
		  "url": BaseUrl + EndPoints.InviteViaEmail,
		  "headers": getAuthHeader(authToken),
		  data:{'invites':emailIDS}
		})
		.then((response) => {
			setIsLoading(false);
			if (response.data.code == 200){
				Alert.alert(StaticMessage.AppName, 'Your invitation has been sent. The recruiter will be in touch with your contact if there is a good fit.', 
				[{
					text: 'Ok',
					onPress: () => navigation.goBack()
				}]);
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
	
	
	return(
		<SafeAreaView style={styles.container}>
			<KeyboardAwareScrollView style={{paddingLeft:16, paddingRight:16, marginBottom:8}}>
				<View style={{marginTop:12}}>
					<View style={{backgroundColor:'white', height:160, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}>
						<TextInput  
							style={[styles.inputText,{height:150,textAlignVertical:'top'}]}
							placeholder="Enter email ids comma separated"
							multiline={true} 
							placeholderTextColor={ThemeColor.PlaceHolderColor}
							value= {data.email}
							returnKeyType='done'
							onSubmitEditing={() => {Keyboard.dismiss()}}
							onChangeText={(val) => setData({...data,email:val})}
						/>
					</View>
				</View>
				<Loader isLoading={isLoading} />
			</KeyboardAwareScrollView>
			<View style={{flexDirection:'row',borderRadius:5, marginTop:8,marginBottom:8, marginLeft:16, marginRight:16,}}>
				<TouchableOpacity style={styles.btnFill} onPress={() => {showInviteConfirmation()}}>
					<Text style={{color:'#53962E',fontFamily: FontName.Regular, fontSize:16, color:'#fff' }}>SUBMIT</Text>
				</TouchableOpacity>
			</View>  
		</SafeAreaView>
	);
}

export default EmailInviteScreen;

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
		borderRadius:5
	}
  });