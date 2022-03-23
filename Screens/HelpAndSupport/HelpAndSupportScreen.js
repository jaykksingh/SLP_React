import React ,{useEffect,useState}from 'react';
import { View ,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Image,
    Text} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import Icons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import {expo} from '../../app.json'
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'
import axios from 'axios'
import {getAuthHeader} from '../../_helpers/auth-header';
import { BaseUrl, EndPoints, StaticMessage, ThemeColor , FontName} from '../../_helpers/constants';
import Loader from '../../Components/Loader';
import MovableView from 'react-native-movable-view';
import Icon from 'react-native-vector-icons/Ionicons';


const HelpAndSupportScreen = ({navigation})  => {
	const [isLoading, setIsLoading] = React.useState(false);

	React.useLayoutEffect(() => {
		navigation.setOptions({
		  title: "Help and support ",
		});
	}, [navigation]);
	const d = new Date();
	let year = d.getFullYear();

	const  getSupportDetails = async(callType) => {

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
			// setSupportDetails(response.data.content.dataList[0]);
			let supportData = response.data.content.dataList[0];
			if(callType == 'CALL'){
				navigation.navigate('CallSupport',{supportDetails:supportData});
			}else{
				navigation.navigate('EmailSupport',{supportDetails:supportData});
			}
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
			<View style={{justifyContent: 'space-between', flex:1, marginTop:16}}>
				<View>
					<View style={{backgroundColor:'#fff', paddingLeft:16}}>
						<TouchableOpacity style={{height:40, alignItems:'center', flexDirection:'row',paddingRight:8}} onPress={() => {getSupportDetails('CALL')}}>
							<View style={styles.menuContainer}>
								<View style={{flexDirection: "row", alignItems:'center',justifyContent: 'center',alignItems: 'center'}}>
									<Entypo name="old-phone" color={ThemeColor.SubTextColor} size={22,22} />
									<Text style={{color:ThemeColor.TextColor, flex:1, fontSize:16, fontFamily: FontName.Regular,marginTop:4, marginLeft:8}}>Call</Text>
								</View>
								<Feather name="chevron-right" color={ThemeColor.BorderColor} size={22,22} />
							</View>
						</TouchableOpacity>
						<View style={{height:1, backgroundColor:ThemeColor.BorderColor, paddingLeft:16}}/>
					</View>
					<View style={{backgroundColor:'#fff', paddingLeft:16}}>
						<TouchableOpacity style={{height:40, alignItems:'center', flexDirection:'row',paddingRight:8}} onPress={() => {getSupportDetails('EMAIL')}}>
							<View style={styles.menuContainer}>
								<View style={{flexDirection: "row", alignItems:'center',justifyContent: 'center',alignItems: 'center'}}>
									<Icons name="mail" color={ThemeColor.SubTextColor} size={22,22} />
									<Text style={{color:ThemeColor.TextColor, flex:1, fontSize:16, fontFamily: FontName.Regular,marginTop:4, marginLeft:8}}>Email</Text>
								</View>
								<Feather name="chevron-right" color={ThemeColor.BorderColor} size={22,22} />
							</View>
						</TouchableOpacity>
						<View style={{height:1, backgroundColor:ThemeColor.BorderColor, paddingLeft:16}}/>
					</View>
					<View style={{backgroundColor:'#fff', paddingLeft:16}}>
						<TouchableOpacity style={{height:40, alignItems:'center', flexDirection:'row',paddingRight:8}} onPress={() => navigation.navigate('ReportBug')}>
							<View style={styles.menuContainer}>
								<View style={{flexDirection: "row",alignItems:'center'}}>
									<Icons name="bug" color={ThemeColor.SubTextColor} size={22,22} />
									<Text style={{color:ThemeColor.TextColor, flex:1, fontSize:16, fontFamily: FontName.Regular,marginTop:4, marginLeft:8}}>Report a bug</Text>
								</View>
								<Feather name="chevron-right" color={ThemeColor.BorderColor} size={22,22} />
							</View>
						</TouchableOpacity>
					</View>
				</View>
				
				<View style={{height:45, alignItems:'center', justifyContent: 'center', marginBottom:24}}>
					<Text style={{color:ThemeColor.TextColor, fontSize:16,flex:1, fontFamily: FontName.Regular,marginTop:4, marginLeft:8}}>© {year} StafflinePro™ Inc.</Text>
					<Text style={{color:ThemeColor.SubTextColor, fontSize:12,flex:1, fontFamily: FontName.Regular,marginTop:4, marginLeft:8}}>Version {expo.version} ({expo.build})</Text>
				</View> 
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

export default HelpAndSupportScreen;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:'#E5E9EB' 
    },menuContainer: {
		backgroundColor:'#fff',
		flex:1, 
		justifyContent: 'space-between', 
		flexDirection:'row',
		alignItems:'center', 
		paddingRight:24
	  },menuImage: {
		width: 18,
		height: 18,
	  }
  });
