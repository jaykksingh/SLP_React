import React ,{useEffect}from 'react';
import { View ,
    StyleSheet,
    FlatList,
    Alert,
	SafeAreaView,
    Text} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'
import axios from 'axios'
import {getAuthHeader} from '../../_helpers/auth-header';
import { BaseUrl, EndPoints, StaticMessage, ThemeColor, FontName } from '../../_helpers/constants';
import Loader from '../../Components/Loader';

const CallSupportScreen = ({route,navigation})  => {
	const [isLoading, setIsLoading] = React.useState(false);
	const { supportDetails } = route.params;

	React.useLayoutEffect(() => {
		navigation.setOptions({
		  title: "Call",
		});
	}, [navigation]);
	
	
	useEffect(() => {
		// getSupportDetails();
		
	}, []);

	const  getSupportDetails = async() => {

		let user = await AsyncStorage.getItem('loginDetails');  
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken);

		setIsLoading(true);
		axios ({  
		  "method": "GET",
		  "url": BaseUrl + EndPoints.SupportContact,
		  "headers": getAuthHeader(authToken)
		})
		.then((response) => {
		  setIsLoading(false);
		  if (response.data.code == 200){
			const results = JSON.stringify(response.data.content.dataList[0])
			console.log(`Support Details: ${results}`);
			setSupportDetails(response.data.content.dataList[0]);
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
	


	let contactArray = supportDetails.phone.length > 0 ? supportDetails.phone[0].default : []
	return(
		<SafeAreaView style={styles.container}>			
			<FlatList style={{}}
				data={contactArray}
				keyExtractor={(item,index) => index.toString()}
				renderItem={({item, index}) => 
					<View>
						{
						item.label == 'Main number' ? 
						<View style={{alignItems:'center',paddingRight:8, paddingTop:24, paddingBottom:24}} >
							<Text style={{fontSize:18, color:ThemeColor.TextColor,fontFamily: FontName.Regular}}>+1 {item.value}</Text>
							<Text style={{flex:1, fontSize:14, color:ThemeColor.SubTextColor,fontFamily: FontName.Regular,marginTop:8}}>Toll free number</Text>
						</View> : 
						<View style={{backgroundColor:'#fff', paddingLeft:16, paddingRight:16,marginBottom:8}}>
							<View style={{marginBottom:8, alignContent: 'center', justifyContent: 'center', flexDirection:'row',marginTop:8, marginBottom:8}} >
								<Text style={{flex:1, fontSize:16, color:ThemeColor.TextColor,fontFamily: FontName.Regular}}>{item.label}</Text>
								<Text style={{fontSize:16, color:ThemeColor.TextColor,fontFamily: FontName.Regular}}>{item.value}</Text>
							</View>
						</View>
						}
					</View>
				}
			/>
			<Loader isLoading={isLoading} />
		</SafeAreaView>
	);
}

export default CallSupportScreen;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:ThemeColor.ViewBgColor,
	  
    }
  });
