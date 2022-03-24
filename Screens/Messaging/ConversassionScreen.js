/* eslint-disable react/display-name */
import React , {useEffect, useRef} from "react";
import { StatusBar, 
    ScrollView, 
    View,
    Text,
    StyleSheet,
    Alert,
    SafeAreaView,
    TouchableOpacity,
    FlatList,
    Keyboard,
    Image
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'
import axios from 'axios';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import SearchBar from 'react-native-search-bar';
import { BaseUrl, EndPoints, MessageGroupId, StaticMessage, ThemeColor, FontName } from '../../_helpers/constants';
import { getAuthHeader} from '../../_helpers/auth-header';
import Loader from '../../Components/Loader';



const ConversassionScreen = ({route,navigation}) => {
  	let [isLoading, setIsLoading] = React.useState(false);
	const [conversationsArray,setConversationsArray] = React.useState([]);
	const { groupDetail } = route.params;
	const { recruiterDetails } = route.params;
	let mySearchBar = useRef();
	const [searchKey,setSearchKey] = React.useState('');

	

	React.useLayoutEffect(() => {
		var navigationTitle = 'Conversassions';
		if(groupDetail){
			navigationTitle = groupDetail.groupTitle
			if(groupDetail.groupId == 5){
				navigationTitle = `${recruiterDetails.firstName} ${recruiterDetails.lastName} (My recruiter)`
			}
		}

		navigation.setOptions({
		  headerRight: () => (
			<TouchableOpacity style={{marginRight:16}} onPress = {() => {navigation.navigate('CreateMessage',{groupName:navigationTitle,groupID:groupDetail.groupId})}}>
				<Ionicons name="create-outline" color={'white'} size={25,25} />
			</TouchableOpacity>
		  ),
		  title: navigationTitle,
		});
	  }, [navigation]);

	useEffect(() => {
		navigation.addListener('focus', () => {
			getConversationsList();
		});
		getConversationsList();
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

	const  getConversationsList = async(searckText) => {
		let user = await AsyncStorage.getItem('loginDetails'); 
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken);    
		setIsLoading(true);
		Keyboard.dismiss()
		let params = {
			'searchText':searckText,
			groupId:groupDetail.groupId.toString(),
			'pageNum':'1',
			'pageSize':'1000'
		}
		console.log('params',params);
		axios ({  
		  "method": "POST",
		  "url": BaseUrl + EndPoints.ConversationsList,
		  "headers": getAuthHeader(authToken),
		  data:params
		})
		.then((response) => {
			setIsLoading(false);
			if (response.data.code == 200){
				console.log('Conversations:',JSON.stringify(response.data.content.dataList[0]));
				setConversationsArray(response.data.content.dataList[0].list);
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
		let momentStartDate = moment(item.createdDate, 'YYYY-MM-DDTHH:mm:ssZZ');
		let startDateString = moment(momentStartDate).format('ddd, DD MMM, HH:mm A');
	  
		return `${startDateString}`;
	}
	const getMessageText = (item) => {
		let messageBody = item.messageBody;
		if(item.messageBody.type === 'content'){
			return item.messageBody.content.replace(/\n|\r|,/g, " ");
		}else{
			return item.messageBody.type;
		}
	}
	const getSeverityText = (item) => {
		let severityId = item.severityId;
		if(severityId === 13103){
			return '!!';
		}else if(severityId === 13102){
			return '!';
		}{
			return '';
		}
	}
	const getRecruiterName = () => {
		if(recruiterDetails){
		  return `${recruiterDetails.firstName} ${recruiterDetails.lastName} (My recruiter)`
		} 
		return 'My recruiter';
	  }
  	return (
      	<SafeAreaView style={[styles.container,{backgroundColor:'#fff',}]}>
			<SearchBar
				ref={mySearchBar}
				placeholder="Search"
				value= {searchKey}
				onChangeText={(val) => setSearchKey(val)}
				onSearchButtonPress={(val) => {getConversationsList(val)}}
				onCancelButtonPress={(val) => {getConversationsList('')}}
			/>
			{conversationsArray.length > 0 ?
			<FlatList style={{}}
				data={conversationsArray}
				keyExtractor={(item, index) => index.toString()}
				renderItem={({item}) => 
				<View style={{paddingLeft:12, backgroundColor:'#fff', paddingBottom:8}}>
					<View style={{flexDirection:'row', justifyContent:'space-between',paddingRight:16, marginTop:8}}>
						<View style={{backgroundColor:ThemeColor.TagColcor,borderRadius:8, padding:4, paddingLeft:8, paddingRight:8}}>
							<Text style={{fontFamily: FontName.Regular, fontSize:10,color:'black',  textAlign:'center'}}>{item.issueType}</Text>
						</View>
						<Text style={{fontFamily: FontName.Regular, fontSize:12,color:ThemeColor.LabelTextColor,textAlign:'right'}}>{getFormatedDate(item)}</Text>
					</View>
					<TouchableOpacity style={{flexDirection:'row',alignItems: 'center', justifyContent: 'center', paddingRight:8, paddingBottom:8}} onPress={() => {navigation.navigate('ChatScreen',{conversations:item,groupDetail:groupDetail,recruiterDetails:recruiterDetails})}}>
						<View style={{width:44, height:44, borderRadius:22, backgroundColor:item.hexCode, justifyContent: 'center', alignItems:'center', marginRight:4,marginTop:4}}>
							<Text style={{fontFamily: FontName.Bold, fontSize:20,color:'white'}}>{item.profileLetter}</Text>
						</View>
						<View style={{flex: 1,marginLeft:8}}>
							<View style={{flexDirection:'row'}}>
								<Text style={{fontFamily: FontName.Regular, fontSize:16,color:ThemeColor.RedColor}}>{getSeverityText(item)}</Text>
								<Text style={{fontFamily: FontName.Regular, fontSize:16,color:ThemeColor.TextColor}}> {item.groupId == MessageGroupId.MyRecruiterID ? getRecruiterName() : item.groupId == MessageGroupId.JobSupportID ? item.jobTitle : item.groupTitle}</Text>
							</View>
							<Text style={{fontFamily: FontName.Regular, fontSize:14,color:ThemeColor.SubTextColor}}>{getMessageText(item)}</Text>
						</View>
						<Feather name="chevron-right" color={'gray'} size={22,22} />
					</TouchableOpacity>                
					<View style={{height:1, backgroundColor:ThemeColor.BorderColor}} />
				</View>
				}
			/> : 
			<View style={{justifyContent:'center', alignContent:'center', flex:1,padding:16}}>
				{!isLoading && <Text style={{fontFamily: FontName.Regular, fontSize:18,color:ThemeColor.TextColor, textAlign:'center'}}>The conversation you're looking for may be expired or no longer available</Text>}
			</View>}
        	<Loader isLoading={isLoading} />
      	</SafeAreaView>
    );
}
export default ConversassionScreen;


const styles = StyleSheet.create({
    container: {
      flex: 1,
    },inputView:{
        flexDirection:'row',
        paddingLeft:16,
        paddingRight:16,
        height:40,
        alignItems:"center", 
        backgroundColor:ThemeColor.BorderColor
    
      },
      bottomView:{
        flexDirection:'row',
        height:40,
        backgroundColor:'#fff',
        alignItems:"center",
    
      }
  });