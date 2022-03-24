/* eslint-disable react/display-name */
import React , {useEffect} from "react";
import { StatusBar, 
    ScrollView, 
    View,
    Text,
    StyleSheet,
    Alert,
    TextInput,
    TouchableOpacity,
    FlatList,
    Button,
    Image
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'
import axios from 'axios';
import Feather from 'react-native-vector-icons/Feather';
import moment from 'moment';
import MovableView from 'react-native-movable-view';
import Icon from 'react-native-vector-icons/Ionicons';
import { BaseUrl, EndPoints, StaticMessage, ThemeColor, FontName } from '../../_helpers/constants';
import { getAuthHeader} from '../../_helpers/auth-header';
import Loader from '../../Components/Loader';


const NotificationScreen = ({route,navigation}) => {
  let [isLoading, setIsLoading] = React.useState(false);
	const [notificationsArray,setNotificationsArray] = React.useState([]);

  useEffect(() => {
    getNotifications();
  }, []);

  const SessionExpiredAlert = () =>{
    Alert.alert(StaticMessage.AppName,StaticMessage.SessionExpired,
        [{
          text: 'Ok',
          onPress: () => signOut()
      }]
  )}
  const  getNotifications = async() => {
		let user = await AsyncStorage.getItem('loginDetails'); 
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken);    
	
		setIsLoading(true);
    let params = {
      'type':'notification',
      'messageType':'',
      'pageNum':'1',
      'pageSize':'1000'
    }
		axios ({  
		  "method": "POST",
		  "url": BaseUrl + EndPoints.NotificationsList,
		  "headers": getAuthHeader(authToken),
      data:params
		})
		.then((response) => {
			setIsLoading(false);
			if (response.data.code == 200){
				setNotificationsArray(response.data.content.dataList[0].message.list);
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
  
  return (
      <View style={[styles.container,{backgroundColor:'#fff',}]}>
        {notificationsArray.length > 0 ?
          <FlatList style={{}}
              data={notificationsArray}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({item}) => 
                <View style={{paddingLeft:16, backgroundColor:'#fff', paddingTop:4, paddingBottom:4}}>
                  <TouchableOpacity style={{flexDirection:'row',alignItems: 'center', justifyContent: 'center', paddingBottom:8}}>
                    <View style={{flex: 1}}>
                      <Text style={{fontFamily: FontName.Regular, fontSize:12,color:ThemeColor.LabelTextColor,textAlign:'right', marginBottom:4}}>{getFormatedDate(item)}</Text>
                      <Text style={{fontFamily: FontName.Regular, fontSize:14,color:ThemeColor.TextColor}}>{item.messageBody.replace(/<[^>]+>/g, '')}</Text>
                    </View>
                    <Feather name="chevron-right" color={'gray'} size={22,22} />
                  </TouchableOpacity>                
                  <View style={{height:1, backgroundColor:ThemeColor.BorderColor}} />
                </View>
              }
          /> : 
          <View style={{alignContent:'center', justifyContent:'center', flex:1, padding:16}}>
            {!isLoading && <Text style={{fontFamily: FontName.Regular, fontSize:16,color:ThemeColor.TextColor,textAlign:'center'}}>No notifications found</Text>}
          </View>
        }
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
export default NotificationScreen;


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