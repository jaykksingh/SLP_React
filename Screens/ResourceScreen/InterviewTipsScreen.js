import React ,{useEffect}from 'react';
import { View ,
	StyleSheet,
    Alert,
	SafeAreaView,
    TouchableOpacity} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'
import axios from 'axios'
import { WebView } from 'react-native-webview';
import MovableView from 'react-native-movable-view';
import Icon from 'react-native-vector-icons/Ionicons';
import {getAuthHeader} from '../../_helpers/auth-header';
import { BaseUrl, EndPoints, StaticMessage, ThemeColor } from '../../_helpers/constants';
import Loader from '../../Components/Loader';

const InterviewTipsScreen = ({navigation})  => {
	const [isLoading, setIsLoading] = React.useState(false);
	const [interviewDetails, setIntervieDetails] = React.useState({
		pageContentsEmployee:''
	});

	React.useLayoutEffect(() => {
		navigation.setOptions({
		  title: "Interview tips",
		});
	}, [navigation]);

	
	useEffect(() => {
		getInterviewTipsDetails();
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

	const  getInterviewTipsDetails = async() => {

		let user = await AsyncStorage.getItem('loginDetails');  
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken);

		setIsLoading(true);
		axios ({  
		  "method": "GET",
		  "url": BaseUrl + EndPoints.InterviewTips,
		  "headers": getAuthHeader(authToken)
		})
		.then((response) => {
		  setIsLoading(false);
		  if (response.data.code == 200){
			const results = JSON.stringify(response.data.content.dataList[0])
			setIntervieDetails(response.data.content.dataList[0]);
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
			{interviewDetails && 
			<View style={{flex:1,padding:16, backgroundColor:'#fff'}}>
				<WebView
					style={{fontSize:16}}
					originWhitelist={['*']}
					source={{ html: interviewDetails.pageContentsEmployee }}
				/>
			</View>
			
			}

			<Loader isLoading={isLoading} />
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

export default InterviewTipsScreen;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:ThemeColor.ViewBgColor,
	  
    }
  });
