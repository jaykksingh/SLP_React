import React ,{useEffect,useState}from 'react';
import { View ,
    StyleSheet,
    Alert,
    FlatList,
    SafeAreaView,
	TouchableOpacity,
    Text} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'
import axios from 'axios'
import moment from 'moment';
import Feather from 'react-native-vector-icons/Feather';
import MovableView from 'react-native-movable-view';
import Icon from 'react-native-vector-icons/Ionicons';
import Loader from '../../Components/Loader';
import {getAuthHeader} from '../../_helpers/auth-header';
import { BaseUrl, EndPoints, StaticMessage, ThemeColor, FontName } from '../../_helpers/constants';



const LegalFilingsScreen = ({route,navigation})  => {

	const [isLoading, setIsLoading] = React.useState(true);
	const [legalFilingArray, setLegalFilingArray] = React.useState([]);

	React.useLayoutEffect(() => {
		navigation.setOptions({
			headerRight: () => (
				<TouchableOpacity style={{marginRight:16, flexDirection:'row', justifyContent: 'center', alignItems: 'center'}} onPress={() => navigation.navigate('ChooseLcaType')}>
				  <Icon name="add-outline" color={'white'} size={20} />
				  <Text style={{fontSize:16, color:'white',fontFamily: FontName.Regular}}>New</Text>
				</TouchableOpacity> 
			  ),
			title:'Legal filings'
		});
	}, [navigation]);

	useEffect(() => {
		navigation.addListener('focus', () => {
			getLegalFilingList();
		  });		
	},[]);

	const getLegalFilingList = async() => {
		let user = await AsyncStorage.getItem('loginDetails');  
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken);    
	  
		setIsLoading(true);
		
		axios ({  
		  "method": "GET",
		  "url": BaseUrl + EndPoints.LegalFilingList,
		  "headers": getAuthHeader(authToken)
		})
		.then((response) => {
			setIsLoading(false);
			if (response.data.code == 200){
				const results = JSON.stringify(response.data.content.dataList[0])
				setLegalFilingArray(response.data.content.dataList);
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
			if(error.response && error.response.status == 401){
				SessionExpiredAlert();
			}else{
				Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
					{text: 'Ok'}
				  ]);
			}
			console.log('Error:',error);      
		})
	}
		
	const getFormatedDate=(item) =>{
		let momentStartDate = moment(item.invitationDate, 'YYYY-MM-DDTHH:mm:ssZZ');
		let startDateString = moment(momentStartDate).format('MMM DD, YYYY')
	
		return `${startDateString}`;
	}
	const getApplicationDetails = async (applicationID) => {
		setIsLoading(true);
	
		let user = await AsyncStorage.getItem('loginDetails');  
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var encoded = base64.encode(userAuthToken);
	
		console.log(`URL:${BaseUrl}${EndPoints.ImmigrationDetails}/${applicationID}`);
	
		axios ({
		  "method": "GET",
		  "url": `${BaseUrl}${EndPoints.ImmigrationDetails}/${applicationID}`,
		  "headers": getAuthHeader(encoded)
		})
		.then((response) => {
			setIsLoading(false);
		  if (response.data.code == 200){
			let result = JSON.stringify(response.data.content.dataList[0]);
			console.log('App Details:',result);
			let responce = response.data.content.dataList[0];
			navigation.navigate('EditLCADetails',{applicationID:applicationID,applicationDetails:responce})
		  }else if (response.data.code == 417){
			setIsLoading(false);
			const errorList = Object.values(response.data.content.messageList);
			Alert.alert(StaticMessage.AppName, errorList.join(), [
			  {text: 'Ok'}
			]);
	
		  }else{
	
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
	

  	return(
		<SafeAreaView style={styles.container}>
			{legalFilingArray.length > 0 ? <FlatList style={{}}
				data={legalFilingArray}
				keyExtractor={(item, index) => index.toString()}
				renderItem={({item,index}) => 
					<TouchableOpacity style={{backgroundColor:'white', marginBottom:8, paddingTop:8}} onPress={() => navigation.navigate('ViewLCADetails',{applicationID:item.legalAppId})}>
						<View style={{flexDirection:'row', marginRight:8, justifyContent:'center', alignItems: 'center'}}>
							<View style={{paddingLeft:16, flex:1}}>
								<View style={{flexDirection:'row'}}>
									<Text style={{color:ThemeColor.NavColor, fontSize:14,fontFamily: FontName.Regular, flex:1}}>{`${item.firstName} ${item.lastName}`}</Text>
									<Text style={{color:ThemeColor.TextColor, fontSize:12,fontFamily: FontName.Regular, marginTop:4}}>{item.appFor}</Text>						
								</View>
								<Text style={{color:ThemeColor.TextColor, fontSize:14,fontFamily: FontName.Regular}}>{item.appTypeName}</Text>						
								<View style={{flexDirection:'row', alignContent: 'center'}}>
									<Text style={{color:ThemeColor.LabelTextColor, fontSize:14,fontFamily: FontName.Regular}}>EAC #: </Text>
									<Text style={{color:item.eacNumber.length > 0 ? ThemeColor.TextColor : ThemeColor.SubTextColor, fontSize:14,fontFamily: FontName.Regular}}>{item.eacNumber.length > 0 ? item.eacNumber :'Not Available'}</Text>
								</View>
							</View>
							<Feather name="chevron-right" color={ThemeColor.BorderColor} size={22} />
						</View>
						<View style={{ backgroundColor:ThemeColor.BorderColor, height:1, marginTop:8}}/>
						<View style={{justifyContent: 'center',alignItems: 'center', height:40}}>
							<Text style={{color:ThemeColor.LabelTextColor, fontSize:14,fontFamily: FontName.Regular}}>{item.appStatus}</Text>
						</View>
					</TouchableOpacity>
				}
			/> : 
				<View style={{justifyContent: 'center',alignItems: 'center', flex:1, padding:16}}>
					{!isLoading && <Text style={{color:ThemeColor.TextColor, fontSize:16,fontFamily: FontName.Regular, textAlign:'center'}}>No application found. Go ahead and submit your new application.</Text>	}					
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

export default LegalFilingsScreen;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      // backgroundColor:'#E5E9EB' 
    },
    tabBar: {
      flexDirection: 'row',
      paddingTop: 0,
      backgroundColor:'#F6F6F6',
    },
    tabItem: {
      flex: 1,
      alignItems: 'center',
      padding: 16,
      fontSize: 10
    },btnFill:{
        width:'100%',
        margin: 16,
        height:50,
        justifyContent:"center",
        backgroundColor:'#fff' ,
        alignItems:'center',
        borderRadius:5,
		marginBottom:8,
      }
  });
