/* eslint-disable react/display-name */
import React , {useEffect} from "react";
import { View,
    Text,
    StyleSheet,
    Alert,
    TouchableOpacity,
    FlatList} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'
import axios from 'axios';
import Feather from 'react-native-vector-icons/Feather';
import MovableView from 'react-native-movable-view';
import Icon from 'react-native-vector-icons/Ionicons';
import { BaseUrl, EndPoints, StaticMessage, ThemeColor, FontName } from '../../_helpers/constants';
import { getAuthHeader} from '../../_helpers/auth-header';
import Loader from '../../Components/Loader';


const ChatGroupScreen = ({route,navigation}) => {
  const [isLoading, setIsLoading] = React.useState(false);
	const [chatGroupsArray,setChatGroupsArray] = React.useState([]);
  const [profileData, setProfileData] = React.useState('');

  useEffect(() => {
    navigation.addListener('focus', () => {
      getChatGroups();
    });
    getProfileDetails();
  }, []);
  
  const SessionExpiredAlert = () =>{
    Alert.alert(StaticMessage.AppName,StaticMessage.SessionExpired,
        [{
          text: 'Ok',
          onPress: () => signOut()
      }]
  )}
  const  getProfileDetails = async() => {
    let user = await AsyncStorage.getItem('loginDetails'); 
    let parsed = JSON.parse(user);  
    let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
    var authToken = base64.encode(userAuthToken);    

    setIsLoading(true);
    axios ({  
      "method": "GET",
      "url": BaseUrl + EndPoints.UserProfile,
      "headers": getAuthHeader(authToken)
    })
    .then((response) => {
        if (response.data.code == 200){
            setProfileData(response.data.content.dataList[0]);
            console.log('ProfileData:' + JSON.stringify(response.data.content.dataList[0]));
            getChatGroups();
        }else if (response.data.code == 417){
          setIsLoading(false);
            console.log(Object.values(response.data.content.messageList));
            const errorList = Object.values(response.data.content.messageList);
            Alert.alert(StaticMessage.AppName, errorList.join(), [
            {text: 'Ok'}
            ]);
    
        }else if (response.data.code == 401){
            setIsLoading(false);
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
  const  getChatGroups = async() => {
		let user = await AsyncStorage.getItem('loginDetails'); 
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken);    
	
		setIsLoading(true);
		axios ({  
		  "method": "GET",
		  "url": BaseUrl + EndPoints.ChatGroups,
		  "headers": getAuthHeader(authToken)
		})
		.then((response) => {
			setIsLoading(false);
			if (response.data.code == 200){
				setChatGroupsArray(response.data.content.dataList);
        console.log('Chat Groups:' + JSON.stringify(response.data.content.dataList));

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

  const getRecruiterName = () => {
    const recruiterDetails = profileData ? profileData.empDetails.recruiterDetails : null
    if(recruiterDetails){
      return `${recruiterDetails.firstName} ${recruiterDetails.lastName} (My recruiter)`
    } 
    return 'recruiter';
  }
  
  return (
      <View style={[styles.container,{backgroundColor:'#fff',}]}>
        <FlatList style={{}}
            data={chatGroupsArray}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item}) => 
              <View style={{paddingLeft:12, backgroundColor:'#fff', paddingTop:8, paddingBottom:8}}>
                <TouchableOpacity style={{flexDirection:'row',alignItems: 'center', justifyContent: 'center', paddingRight:8, paddingBottom:8}} onPress={() => {navigation.navigate('Conversassions',{groupDetail:item,recruiterDetails:profileData.empDetails.recruiterDetails})}}>
                  <View style={{width:44, height:44, borderRadius:22, backgroundColor:item.hexCode, justifyContent: 'center', alignItems:'center', marginRight:12}}>
                    <Text style={{fontFamily: FontName.Bold, fontSize:20,color:'white'}}>{item.profileLetter}</Text>
                  </View>
                  <View style={{flex: 1,marginRight:8}}>
                    <Text style={{fontFamily: FontName.Regular, fontSize:16,color:ThemeColor.TextColor}}>{item.groupId === 5 ? getRecruiterName(item) : item.groupTitle}</Text>
                    <Text style={{fontFamily: FontName.Regular, fontSize:14,color:ThemeColor.SubTextColor}}>{item.description}</Text>
                    <Text style={{fontFamily: FontName.Regular, fontSize:14,color:ThemeColor.LabelTextColor}}>{item.totalConversation} conversation</Text>
                  </View>
                  <View style={{width:20, height:20, backgroundColor:ThemeColor.BtnColor, alignItems: 'center', justifyContent: 'center', borderRadius:10}}>
                    <Text style={{fontFamily: FontName.Regular, fontSize:10,color:'white', textAlign: 'center'}}>{item.unreadMessages}</Text>
                  </View>
                  <Feather name="chevron-right" color={'gray'} size={22,22} />
                </TouchableOpacity>                
                <View style={{height:1, backgroundColor:ThemeColor.BorderColor, marginLeft:60}} />
              </View>
            }
        />
        <Loader isLoading={isLoading} />
        <MovableView>
          <TouchableOpacity style={{
            position: 'absolute',
            margin: 16,
            right: 0,
            bottom: 0,
            backgroundColor:ThemeColor.BtnColor,
            height:50, 
            width:50,
            borderRadius:25,
            justifyContent: 'center',
            alignItems: 'center'}} onPress={() => navigation.navigate('ChatBot')}>
            <Icon name="chatbubble-ellipses-outline" color={'white'} size={25} />
          </TouchableOpacity>
        </MovableView>
      </View>
    );
}
export default ChatGroupScreen;


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