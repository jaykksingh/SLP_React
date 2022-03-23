import React ,{useEffect}from 'react';
import { View ,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    Alert,
	SafeAreaView,
	Text} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'
import axios from 'axios'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import {getAuthHeader} from '../../_helpers/auth-header';
import { BaseUrl, WebBaseURL,EndPoints, StaticMessage, ThemeColor, FontName } from '../../_helpers/constants';
import Loader from '../../Components/Loader';

const ReportBugScreen = ({navigation})  => {
	const [isLoading, setIsLoading] = React.useState(false);
	const [data, setData] = React.useState({
		comment:''
	});

	React.useLayoutEffect(() => {
		navigation.setOptions({
		  title: "Report a bug",
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
		let pageUrl = `${WebBaseURL}reportabug`
		setIsLoading(true);
		axios ({  
		  "method": "POST",
		  "url": BaseUrl + EndPoints.ReportABug,
		  "headers": getAuthHeader(authToken),
		  data:{'comment':data.comment,pageUrl:pageUrl}
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
			const errorList = Object.values(response.data.content.messageList);
			Alert.alert(StaticMessage.AppName, errorList.join(), [
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
					<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Comment</Text>
					<View style={{backgroundColor:'white', height:140, borderRadius:3, flexDirection:'row', alignItems:'center', paddingRight:8, marginTop:4}}>
					<TextInput  
						style={[styles.inputText,{height:130, textAlignVertical:'top'}]}
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
			<TouchableOpacity style={styles.btnFill} onPress={() => {handleSubmit()}}>
				<Text style={{color:'#53962E',fontFamily: FontName.Regular, fontSize:16, color:'#fff' }}>SUBMIT</Text>
			</TouchableOpacity> 
			<Loader isLoading={isLoading} />
		</SafeAreaView>
	);
}

export default ReportBugScreen;

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
