import React ,{useEffect,useState}from 'react';
import { View ,
    StyleSheet,
    Alert,
    FlatList,
    SafeAreaView,
    Text} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'
import axios from 'axios'
import moment from 'moment';
import Loader from '../../../Components/Loader';
import {getAuthHeader} from '../../../_helpers/auth-header';
import { BaseUrl, EndPoints, StaticMessage, ThemeColor, FontName } from '../../../_helpers/constants';


const ContactReferralsScreen = ({route,navigation})  => {

	const [isLoading, setIsLoading] = React.useState(false);
	const [referralsArray, setReferralsArray] = React.useState([]);

	React.useLayoutEffect(() => {
		navigation.setOptions({
			title:'Referrals'
		});
	}, [navigation]);

	useEffect(() => {
		getContactReferralsList();
	},[]);

	const getContactReferralsList = async() => {
		let user = await AsyncStorage.getItem('loginDetails');  
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken);    
	  
		setIsLoading(true);
		axios ({  
		  "method": "GET",
		  "url": BaseUrl + EndPoints.ReferarContact,
		  "headers": getAuthHeader(authToken)
		})
		.then((response) => {
			setIsLoading(false);
			if (response.data.code == 200){
				const results = JSON.stringify(response.data.content.dataList[0])
				console.log(results);
				setReferralsArray(response.data.content.dataList);
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
		
	const getAttribute=(item) =>{
		let email = item.email;

		let momentStartDate = moment(item.createdOn, 'YYYY-MM-DDTHH:mm:ssZZ');
		let startDateString = moment(momentStartDate).format('MMM DD, YYYY')
	
		return `${email} | ${startDateString}`;
	}
	let message = "By referring your network of friends and colleagues on StafflinePro, you can earn substantially and without limit if they are hired.";
  	return(
		<SafeAreaView style={styles.container}>
			{referralsArray.length > 0 ?
			<FlatList style={{}}
				data={referralsArray}
				keyExtractor={(item, index) => index.toString()}
				renderItem={({item,index}) => 
					<View style={{backgroundColor:'white', marginBottom:8, flexDirection:'row',paddingLeft:16, paddingRight:16, paddingTop:8, paddingBottom:8}}>
						<View style={{flex:1}}>
							<Text style={{color:ThemeColor.TextColor, fontSize:16,fontFamily: FontName.Regular}}>{`${item.firstName} ${item.lastName}`}</Text>
							<Text style={{color:ThemeColor.TextColor, fontSize:14,fontFamily: FontName.Regular, marginTop:4}}>{getAttribute(item)}</Text>
							<Text style={{color:ThemeColor.GreenColor, fontSize:12,fontFamily: FontName.Regular, marginTop:4}}>{item.JobSearchStatus}</Text>
						</View>
						<View style={{alignItems: 'center', justifyContent: 'center', width:55}}>
							<Text style={{color:ThemeColor.BtnColor, fontSize:18,fontFamily: FontName.Bold}}>{item.activeApplications}</Text>
							<Text style={{color:ThemeColor.SubTextColor, fontSize:10,fontFamily: FontName.Regular, textAlign: 'center'}}>Active applications</Text>
						</View>
					</View>
				}
			/> : 
			<View style={{flex:1,justifyContent:'center', padding:16}}>
				<Text style={{color:ThemeColor.TextColor, fontSize:16,fontFamily: FontName.Regular, textAlign:'center'}}>{message}</Text>
			</View>
			}
			<Loader isLoading={isLoading} />
		</SafeAreaView>	
	);
}

export default ContactReferralsScreen;

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
      }
  });
