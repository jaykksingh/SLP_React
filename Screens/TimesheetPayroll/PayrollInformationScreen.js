import React,{useEffect} from "react";
import { 
    TouchableOpacity,
	SafeAreaView,
	View} from "react-native";

import { WebView } from 'react-native-webview';
import Icons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'
import axios from 'axios'
// import OpenFile from 'react-native-doc-viewer';
import MovableView from 'react-native-movable-view';
import Icon from 'react-native-vector-icons/Ionicons';
import {getAuthHeader} from '../../_helpers/auth-header';
import { BaseUrl, EndPoints, StaticMessage, ThemeColor } from '../../_helpers/constants';
import Loader from '../../Components/Loader';


const PayrollInformationScreen = ({route,navigation}) => {
	const [isLoading, setIsLoading] = React.useState(false);
	// const [payrollDetail, setPayrollDetail] = React.useState({
	// 	docUrl:''
	// });
	const {payrollInfo} = route.params;
	React.useLayoutEffect(() => {
		navigation.setOptions({
			// headerRight: () => (
			// 	<TouchableOpacity style={{marginRight:16}} onPress={() => viewResume(payrollInfo)}>
			// 	  <Icons name="share-outline" color={'white'} size={20} />
			// 	</TouchableOpacity> 
			//   ),
			  title: `Payroll information`,
		});
	}, [navigation]);
	const showShareOptions = () =>{

	}
	useEffect(() => {
		// getPayrollInfo();
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
	const  getPayrollInfo = async() => {
		let user = await AsyncStorage.getItem('loginDetails');  
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken);

		setIsLoading(true);
		axios ({  
		  "method": "GET",
		  "url": BaseUrl + EndPoints.PayrollInfo,
		  "headers": getAuthHeader(authToken)
		})
		.then((response) => {
			setIsLoading(false);
			if (response.data.code == 200){
				const results = JSON.stringify(response.data.content.dataList[0])
				console.log(results);
				setPayrollDetail(response.data.content.dataList[0]);
			}else if (response.data.code == 417){
				console.log(Object.values(response.data.content.messageList));
				const errorList = Object.values(response.data.content.messageList);
				Alert.alert(StaticMessage.AppName, errorList.join(), [
					{text: 'Ok'}
				]);
		
			}else{
			}
		})
		.catch((error) => {
		  console.error(error);
		  setIsLoading(false);
		  if(error.response && error.response.status == 401){
			SessionExpiredAlert();
		  }else{
			  Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
				  {text: 'Ok'}
				]);
		  }
		})
	}
	const viewResume = (resume) => {
		console.log('resume:', resume.docUrl);
		var newURI = resume.docUrl.split("%20").join("\ ");

		// if(Platform.OS === 'ios'){
		// 	//IOS
		//   OpenFile.openDoc([{
		// 	  url:newURI,
		// 	  fileNameOptional:"Payroll information"
		//   }], (error, url) => {
		// 	if (error) {
		// 	  console.error(error);
		// 	} else {
		// 	  console.log('Filte URL:',url)
		// 	}
		//   })
		// }else{
		// 	//Android
		//   OpenFile.openDoc([{
		// 	  url:newURI, // Local "file://" + filepath
		// 	  fileName:"Payroll information",
		// 	  cache:false,
		// 	  fileType:"jpg"
		//   }], (error, url) => {
		// 	  if (error) {
		// 	  console.error(error);
		// 	  } else {
		// 	  console.log(url)
		// 	  }
		//   })
		// }
	  }
	
	var urlToLoad = payrollInfo.docUrl.split("%20").join("\ ");

	return(
		<SafeAreaView style={{flex:1,backgroundColor:ThemeColor.ViewBgColor}}>
			{/* <View style={{flex: 1, padding:16, color:ThemeColor.SubTextColor}}>
          		<HTML  source={{ html: payrollDetail.pageContentsEmployee }} contentWidth={useWindowDimensions().width} />
      		</View> */}
			<View style={{flex:1, backgroundColor:ThemeColor.ViewBgColor}}>
				<WebView
					source={{ uri: urlToLoad }}
					style={{ marginTop: 0 }}
				/>
			</View>
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

export default PayrollInformationScreen;