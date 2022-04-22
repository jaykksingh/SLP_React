import 'react-native-gesture-handler';
import React ,{useEffect,useState}from 'react';
import { View ,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Alert,
    Text} from 'react-native';
	
import Feather from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'
import axios from 'axios'
import { WebView } from 'react-native-webview';

import { AuthContext } from '../../Components/context';
import {getAuthHeader} from '../../_helpers/auth-header';
import { BaseUrl, EndPoints, StaticMessage, ThemeColor, FontName } from '../../_helpers/constants';
import Loader from '../../Components/Loader';


const EOBPOfferScreen = ({navigation})  => {
    const { signOut } = React.useContext(AuthContext);
    const { loginDetail } = React.useContext(AuthContext);
    const [offerLatterData, setOfferLatterData] = useState({
		  offerLetterPath: '',
	  });
    let [isLoading, setIsLoading] = React.useState(false);

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                 <TouchableOpacity style={{marginRight:16}} onPress={() => showLogOutAlert()}>
                   <Feather name="more-vertical" color={'white'} size={25} />
                </TouchableOpacity>
            ),
			title: 'Read & accept offer letter',
        });
    }, [navigation]);
    const showLogOutAlert = () =>{
        console.log('Log Out')
        Alert.alert('Are sure want to log out?',null,
            [{
              text: 'Cancel',
            },{
                text: 'Log out',
                onPress: () => signOut()
              }]
          )
    }
    const SessionExpiredAlert = () =>{
  
        Alert.alert(StaticMessage.AppName,StaticMessage.SessionExpired,
            [{
              text: 'Ok',
              onPress: () => signOut()
          }]
      ) 
  }

    useEffect(() => {
        let loginDetails = loginDetail();
        console.log('BasicDetailsScreen:',loginDetails);
        getOfferLetter();
    },[]);
    

	const  getOfferLetter = async () => {
		let user = await AsyncStorage.getItem('loginDetails');  
        let parsed = JSON.parse(user);  
        let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
        var encoded = base64.encode(userAuthToken);    
		console.log('OfferLatter URL:',BaseUrl + EndPoints.Offerletter);

        setIsLoading(true);
        axios ({  
          "method": "GET",
          "url": BaseUrl + EndPoints.Offerletter,
          "headers": getAuthHeader(encoded)
        })
        .then((response) => {
            setIsLoading(false);
            console.log('OfferLatter:',JSON.stringify(response.data.content.dataList[0].offerLetterPath));
            if (response.data.code == 200){
                setOfferLatterData(response.data.content.dataList[0]);
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
    
    const handleSkipBtn = () => {
        navigation.navigate('Basic details',{profileDetail: profileData})
    }
	const  handleAcceptOffer = async() => {
        let user = await AsyncStorage.getItem('loginDetails');  
        let parsed = JSON.parse(user);  
        let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
        var authToken = base64.encode(userAuthToken);

        setIsLoading(true);
        const params = {
            "offerLetterId":offerLatterData.offerLetterId,
            'isAccepted':'1',
        }
		console.log(params);
		console.log(BaseUrl + EndPoints.Offerletter);

        axios ({  
          "method": "POST",
          "url": BaseUrl + EndPoints.Offerletter,
          "headers": getAuthHeader(authToken),
          data:{ "offerLetterId":offerLatterData.offerLetterId,'isAccepted':'1'}
        })
        .then((response) => {
			if (response.data.code == 200){
				const results = JSON.stringify(response.data.content)
				console.log('Accept Offer:',results);
				setIsLoading(false);
				navigation.navigate('OnboaringProcess',{eobDetail: offerLatterData})
			}else if (response.data.code == 417){
				setIsLoading(false);
				console.log(Object.values(response.data.content.messageList));
				const errorList = Object.values(response.data.content.messageList);
				Alert.alert(StaticMessage.AppName, errorList.join(), [
				{text: 'Ok'}
				]);
		
			}else{
				setIsLoading(false);
			}
        })
        .catch((error) => {
            setIsLoading(false);
          Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
            {text: 'Ok'}
          ]);
    
        })
    }
    
    return (
        
		<View style={{flex:1,backgroundColor:ThemeColor.ViewBgColor}}>
		<SafeAreaView style={{flex:1}}>
			<View style={{flex:1, backgroundColor:ThemeColor.ViewBgColor}}>
				<WebView
					source={{ uri: offerLatterData.offerLetterPath }}
					style={{ marginTop: 0 }}
				/>
			</View>
			<TouchableOpacity style={[styles.btnFill,{borderTopRightRadius:5,borderBottomRightRadius:5}]} onPress={() => {handleAcceptOffer()}}>
				<Text style={{color:'#53962E',fontFamily: FontName.Regular, fontSize:16, color:'#fff' }}>{'ACCEPT & PROCEED'}</Text>
			</TouchableOpacity>
		</SafeAreaView>
		<Loader isLoading={isLoading} />
	</View>
    );
  };

export default EOBPOfferScreen;


const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:ThemeColor.ViewBgColor ,
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
		marginLeft:16,
		marginRight:16,
		marginTop:8,
		height:50,
		justifyContent:"center",
		backgroundColor: ThemeColor.BtnColor ,
		alignItems:'center',
		borderRadius:5,
	  }
  });

    