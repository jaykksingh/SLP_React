import React ,{useEffect,useState}from 'react';
import { 
	TouchableOpacity,
	View ,
    StyleSheet,
    Alert,
    FlatList,
    SafeAreaView,
    Text,
	Image} from 'react-native';
	
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'
import axios from 'axios'
import moment from 'moment';
import Loader from '../../Components/Loader';
import {getAuthHeader} from '../../_helpers/auth-header';
import { BaseUrl, EndPoints, StaticMessage, ThemeColor ,MessageGroupId, FontName} from '../../_helpers/constants';


const PastProjectScreen = ({route,navigation})  => {

	const [isLoading, setIsLoading] = React.useState(false);
	const [pastProjectArray, setPastProjectArray] = React.useState([]);

	React.useLayoutEffect(() => {
		navigation.setOptions({
			title:'Past projects'
		});
	}, [navigation]);

	useEffect(() => {
		getPastProjects();
	},[]);

	const getPastProjects = async() => {
		let user = await AsyncStorage.getItem('loginDetails');  
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken);    
	  
		setIsLoading(true);
		
		axios ({  
		  "method": "GET",
		  "url": BaseUrl + EndPoints.PastProjectList,
		  "headers": getAuthHeader(authToken)
		})
		.then((response) => {
			setIsLoading(false);
			if (response.data.code == 200){
				const results = JSON.stringify(response.data.content.dataList[0])
				console.log('Past Project:',results);
				setPastProjectArray(response.data.content.dataList);
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
		
	const getDateRange=(item) => {

		let momentStartDate = moment(item.projectDetails.startDate, 'YYYY-MM-DDTHH:mm:ssZZ');
		let momentEndDate = moment(item.projectDetails.endDate, 'YYYY-MM-DDTHH:mm:ssZZ');

		let startDateString = moment(momentStartDate).format('MMM DD, YYYY');
		let endDateString = moment(momentEndDate).format('MMM DD, YYYY');

		return `${startDateString} - ${endDateString}`;
	}

	

  	return(
		<SafeAreaView style={styles.container}>
			{pastProjectArray.length > 0 ?
			<FlatList style={{}}
				data={pastProjectArray}
				keyExtractor={(item, index) => index.toString()}
				renderItem={({item,index}) => 
					<View style={{backgroundColor:'white', marginBottom:8, paddingTop:8, paddingBottom:8,paddingLeft:16, paddingRight:16}}>
						<Text style={{color:ThemeColor.NavColor, fontSize:16,fontFamily: FontName.Regular, flex:1}}>{item.projectDetails.projectName}</Text>
						<Text style={{color:ThemeColor.TextColor, fontSize:14,fontFamily: FontName.Regular, marginTop:2}}>{item.projectDetails.clientName}</Text>
						<Text style={{color:ThemeColor.TextColor, fontSize:14,fontFamily: FontName.Regular, marginTop:2}}>{getDateRange(item)}</Text>
					</View>
				}
			/> : 
			<View style={{flex:1, justifyContent:'center', margin:16}}>
				<Text style={{color:ThemeColor.TextColor,fontFamily: FontName.Regular, fontSize:16 , textAlign:'center'}}>Looking for past project details?</Text>
				<TouchableOpacity style={{marginTop:8, height:30}} onPress = {() => {navigation.navigate('CreateMessage',{groupName:'Accounts payable',groupID:MessageGroupId.PayrollSupportID})}}>
				<Text style={{color:ThemeColor.BtnColor,fontFamily: FontName.Regular, fontSize:16 , textAlign:'center'}}>Contact your account manager</Text>
				</TouchableOpacity>
        	</View>
			}
			<Loader isLoading={isLoading} />
		</SafeAreaView>	
	);
}

export default PastProjectScreen;

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
