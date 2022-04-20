import React ,{useEffect,useState,useRef}from 'react';
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
import SearchBar from 'react-native-search-bar';
import { TouchableOpacity } from 'react-native-gesture-handler';
import {getAuthHeader} from '../../../_helpers/auth-header';
import { BaseUrl, EndPoints, StaticMessage, ThemeColor, FontName } from '../../../_helpers/constants';
import Loader from '../../../Components/Loader';


const InvitesScreen = ({route,navigation})  => {

	const [isLoading, setIsLoading] = React.useState(false);
	const [invitationArray, setInvitationArray] = React.useState([]);
	const [searchKey,setSearchKey] = React.useState('');
	let mySearchBar = useRef();

	React.useLayoutEffect(() => {
		navigation.setOptions({
			title:'Invites'
		});
	}, [navigation]);

	useEffect(() => {
		navigation.addListener('focus', () => {
			getContactReferralsList('');
		});
	},[]);
	const handleTextChange = (val) => {
		setSearchKey(val);
		if(val.length == 0){
			getContactReferralsList('')
		}
	}
	const getContactReferralsList = async(searchKey) => {
		let user = await AsyncStorage.getItem('loginDetails');  
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken);    
	  
		setIsLoading(true);
		let params = {
			'searchText':searchKey,
			'pageCount':1,
			'pageSize':1000	
		}
		axios ({  
		  "method": "POST",
		  "url": BaseUrl + EndPoints.InvitationList,
		  "headers": getAuthHeader(authToken),
		  data:params
		})
		.then((response) => {
			setIsLoading(false);
			if (response.data.code == 200){
				const results = JSON.stringify(response.data.content.dataList[0].data)
				console.log('InvitationList:',results);
				setInvitationArray(response.data.content.dataList[0].data);
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
		
	const getFormatedDate=(item) =>{
		let momentStartDate = moment(item.invitationDate, 'YYYY-MM-DDTHH:mm:ssZZ');
		let startDateString = moment(momentStartDate).format('MMM DD, YYYY')
	
		return `${startDateString}`;
	}
	let message = "You have not invited anyone yet"
  	return(
		<SafeAreaView style={styles.container}>
			<SearchBar
				ref={mySearchBar}
				placeholder="Search"
				value= {searchKey}
				icon = {{type: 'material-community', color: '#86939e', name: 'share' }}

				onChangeText={(val) => handleTextChange(val)}
				onSearchButtonPress={(val) => {getContactReferralsList(val)}}
				onCancelButtonPress={(val) => {getContactReferralsList('')}}
				onCancel={()=>getContactReferralsList('')}
			/>
			{invitationArray.length > 0 ?
			<FlatList style={{}}
				data={invitationArray}
				keyExtractor={(item, index) => index.toString()}
				renderItem={({item,index}) => 
					<View style={{backgroundColor:'white', marginBottom:8,paddingLeft:16, paddingRight:16, paddingTop:8, paddingBottom:8}}>
						<View style={{flexDirection:'row'}}>
							<Text style={{color:ThemeColor.TextColor, fontSize:16,fontFamily: FontName.Regular, flex:1}}>{item.contactEmail.trim()}</Text>
							<Text style={{color:item.status =='Pending' ? ThemeColor.RedColor : ThemeColor.GreenColor, fontSize:12,fontFamily: FontName.Regular, marginTop:4}}>{item.status}</Text>						
						</View>
						<View style={{flexDirection:'row'}}>
							<Text style={{color:ThemeColor.LabelTextColor, fontSize:14,fontFamily: FontName.Regular, marginTop:4}}>Invited on </Text>
							<Text style={{color:ThemeColor.TextColor, fontSize:14,fontFamily: FontName.Regular, marginTop:4}}>{getFormatedDate(item)}</Text>
						</View>
					</View>
				}
			/> : searchKey.length > 0 ? 
				<View style={{flex:1,justifyContent:'center', padding:16, justifyContent:'center', alignItems:'center'}}>
					<Text style={{color:ThemeColor.TextColor, fontSize:16,fontFamily: FontName.Regular, textAlign:'center'}}>No result found</Text>
				</View>
				:
				<View style={{flex:1,justifyContent:'center', padding:16, justifyContent:'center', alignItems:'center'}}>
					<Text style={{color:ThemeColor.TextColor, fontSize:16,fontFamily: FontName.Regular, textAlign:'center'}}>{message}</Text>
					<TouchableOpacity style={{backgroundColor:ThemeColor.BtnColor, height:40, justifyContent:'center', borderRadius:5,width:180, marginTop:16}} onPress={() => {navigation.navigate('InviteFriend',{isFromEOB:false})}}>
						<Text style={{color:'white', fontSize:16,fontFamily: FontName.Regular, textAlign:'center'}}>INVITE A FRIEND</Text>
					</TouchableOpacity>
				</View>
			}
			<Loader isLoading={isLoading} />
		</SafeAreaView>	
	);
}

export default InvitesScreen;

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
