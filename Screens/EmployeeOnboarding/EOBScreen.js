import 'react-native-gesture-handler';
import React ,{useEffect,useState}from 'react';
import { View ,
    useWindowDimensions,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Alert,
    Text} from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import Feather from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'
import axios from 'axios'
import RNFS from 'react-native-fs';
import DocumentPicker from 'react-native-document-picker';
import RNExitApp from 'react-native-exit-app';
import { openComposer } from "react-native-email-link";
import DocumentViewerScreen from '../DocumentViewer/DocumentViewerScreen';


import { AuthContext } from '../../Components/context';
import {getAuthHeader} from '../../_helpers/auth-header';
import { BaseUrl, EndPoints, StaticMessage, ThemeColor, FontName } from '../../_helpers/constants';
import Loader from '../../Components/Loader';

const UserOnboardingStack  = createStackNavigator();
import EOBProcessScreen from './EOBProcessScreen';
import EOBAttachmentScreen from './EOBAttachmentScreen';
import EOBBenefitDetailScreen from './EOBBenefitDetailScreen';
import EOBBenefitsScreen from './EOBBenefitsScreen';
import EOBCovidVaccinationScreen from './EOBCovidVaccinationScreen';
import EOBDocumentScreen from './EOBDocumentScreen';
import EOBHowDoIScreen from './EOBHowDoIScreen';
import EOBPOfferScreen from './EOBPOfferScreen';
import EOBViewAttachmentScreen from './EOBViewAttachmentScreen';
import ReviewSignScreen from './ReviewSignScreen';
import ReferContactScreen from '../ReferralsAndInvite/ReferContactScreen';
import InviteFriendScreen from '../ReferralsAndInvite/InviteFriendScreen';
import EmailInviteScreen from '../ReferralsAndInvite/EmailInviteScreen';


const EOBScreen = () => {
    return(
        <UserOnboardingStack.Navigator screenOptions={{
            headerStyle: {
                backgroundColor: ThemeColor.NavColor,
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
                fontFamily:FontName.Regular,
                fontSize:16
            },
            headerBackTitleVisible: false
            }}>
            <UserOnboardingStack.Screen name="Onboarding" component={OnboardingScreen} />
            <UserOnboardingStack.Screen name="OnboaringProcess" component={EOBProcessScreen} />
            <UserOnboardingStack.Screen name="EOBAttachmentScreen" component={EOBAttachmentScreen} />
            <UserOnboardingStack.Screen name="BenefitDetail" component={EOBBenefitDetailScreen}/>
            <UserOnboardingStack.Screen name="EOBBenefits" component={EOBBenefitsScreen} />
            <UserOnboardingStack.Screen name="CovidVaccination" component={EOBCovidVaccinationScreen}/>
            <UserOnboardingStack.Screen name="EOBDocumentScreen" component={EOBDocumentScreen} />
            <UserOnboardingStack.Screen name="EOBHowDoIScreen" component={EOBHowDoIScreen} />
            <UserOnboardingStack.Screen name="OfferLatter" component={EOBPOfferScreen} />
            <UserOnboardingStack.Screen name="EOBViewAttachment" component={EOBViewAttachmentScreen} />
            <UserOnboardingStack.Screen name="ReviewSignScreen" component={ReviewSignScreen} />
            <UserOnboardingStack.Screen name="ReferContact" component={ReferContactScreen}/>
            <UserOnboardingStack.Screen name="InviteAFriend" component={InviteFriendScreen}/>
            <UserOnboardingStack.Screen name="EmailInvite" component={EmailInviteScreen}/>
            <UserOnboardingStack.Screen name="DocumentViewer" component={DocumentViewerScreen}/>

        </UserOnboardingStack.Navigator>
    );
};

const OnboardingScreen = ({navigation})  => {
    const [data,setData] = React.useState({
        resumeTitle:'',
        isLoading: false,
    });
    const { signOut } = React.useContext(AuthContext);
    const { skipEOB } = React.useContext(AuthContext);

    const { loginDetail } = React.useContext(AuthContext);
    const [loggedInUser, setLoggedInUser] = useState('');
    let [profileData, setProfileData] = React.useState('');
    let [isLoading, setIsLoading] = React.useState(false);

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                 <TouchableOpacity style={{marginRight:16}} onPress={() => showLogOutAlert()}>
                   <Feather name="more-vertical" color={'white'} size={25,25} />
                </TouchableOpacity>
            ),
            title : 'StafflinePro™',
        });
    }, [navigation]);
    const showLogOutAlert = () =>{
        console.log('Log Out')
        Alert.alert('Are you sure want to log out?',null,
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
        if(loginDetails){
            setLoggedInUser(loginDetails);
        }
        getAllDetails();
    },[]);
    
    const  getAllDetails = async () => {
        let user = await AsyncStorage.getItem('loginDetails');  
        let parsed = JSON.parse(user);  
        let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
        var encoded = base64.encode(userAuthToken);    
        getProfileDetails(encoded);
    }
    const  getProfileDetails = (authToken) => {
        setIsLoading(true);
        axios ({  
          "method": "GET",
          "url": BaseUrl + EndPoints.UserProfile,
          "headers": getAuthHeader(authToken)
        })
        .then((response) => {
            setIsLoading(false);
            console.log('Session:',response.data);
            if (response.data.code == 200){
                let isMandatory = response.data.content.mandatory;
                if(response.data.content.dataList.length > 0){
                    setProfileData(response.data.content.dataList[0]);
                }
                if( typeof response.data.content.mandatory != "undefined"){
                  let message = response.data.content.info;
                  Alert.alert(StaticMessage.AppName, message, [
                    {
                      text: 'Exit', 
                      onPress: () => RNExitApp.exitApp()
                    },
                    {
                      text: 'Update',
                      onPress: () => handleClick()
                    }
                  ]);   
          
                }
        
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
            console.log('error.response:',error);
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
    const handleClick = () => {
        let iosURL = "https://itunes.apple.com/in/app/stafflinepro-jobs-find-you/id1306795942?mt=8";
        Linking.canOpenURL(iosURL).then(supported => {
            supported && Linking.openURL(iosURL);
        }, (err) => console.log(err));
      }
    const  updateProfileDetails = async(resumeData) => {
        let user = await AsyncStorage.getItem('loginDetails');  
        let parsed = JSON.parse(user);  
        let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
        var authToken = base64.encode(userAuthToken);

        setIsLoading(true);
        const params = {
            "fileName":data.resumeTitle,
            'file':resumeData,
            'docName':data.resumeTitle,
            'fileType':'1702'
        }

        axios ({  
          "method": "PUT",
          "url": BaseUrl + EndPoints.UserProfile,
          "headers": getAuthHeader(authToken),
          data:{'documents':params}
        })
        .then((response) => {
          if (response.data.code == 200){
            const results = JSON.stringify(response.data.content)
            setIsLoading(false);
            navigation.navigate('Basic details',{profileDetail: profileData})
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
    
    
    const handleSkipBtn = () => {
        navigation.navigate('Basic details',{profileDetail: profileData})
    }

    const selectResume = async () => {
        try {
            const res = await DocumentPicker.pick({
                type: [DocumentPicker.types.pdf,DocumentPicker.types.doc,DocumentPicker.types.docx,DocumentPicker.types.plainText],
            });
            setData({...data,resumeTitle:res[0].name});
            var newURI = res[0].uri.split("%20").join("\ ");
            var base64data = await RNFS.readFile( newURI, 'base64').then(res => { return res });
            updateProfileDetails(base64data);
        } catch (err) {
            if (DocumentPicker.isCancel(err)) {
                // User cancelled the picker, exit any dialogs or menus and move on
            } else {
                throw err;
            }
        }
    }
    const handleContinue = () => {
        const empDetails = profileData.empDetails;
        const eobDetails = empDetails.employeeOnboarding;
        let offerLetter = eobDetails.offerLetter;
        console.log(JSON.stringify(eobDetails));
        if(offerLetter){
            navigation.navigate('OfferLatter');
        }else{
            navigation.navigate('OnboaringProcess');
        }
    }

    
    const empDetails = profileData.empDetails;
    console.log('EMP Details:', JSON.stringify(empDetails));
    return (
        <View style={styles.container}>
			<View style={{alignItems: 'center'}}>
				<Text style={{fontFamily:FontName.Bold, fontSize:20,color:ThemeColor.TextColor}}> Welcome, {empDetails ? empDetails.firstName : ''}</Text>
				<Text style={{fontFamily:FontName.Regular, fontSize:16,color:ThemeColor.TextColor, marginTop:8}}>Congrats on joining Compunnel!</Text>
				<Text style={{fontFamily:FontName.Regular, fontSize:16,color:ThemeColor.TextColor}}>We are thrilled to have you on the team.</Text>
			</View>
			<Text style={{fontFamily:FontName.Regular, fontSize:16,color:ThemeColor.TextColor, textAlign: 'center'}}>Your onboarding process can be completed within a few minutes. Let's get started.</Text>
			<View style={{flexDirection:'row', marginLeft:0, marginRight:0,marginTop:8, marginBottom:8}}>
				<TouchableOpacity style={[styles.btnFill,{backgroundColor:'white',borderTopLeftRadius:5,borderBottomLeftRadius:5, width:'40%'}]} onPress={() => {skipEOB()}}>
					<Text style={{color:'#53962E',fontFamily: FontName.Regular, fontSize:14, color:ThemeColor.BtnColor }}>DO IT LATER</Text>
				</TouchableOpacity>
				<TouchableOpacity style={[styles.btnFill,{borderTopRightRadius:5,borderBottomRightRadius:5, width:'60%'}]} onPress={() => {handleContinue()}}>
					<Text style={{color:'#53962E',fontFamily: FontName.Regular, fontSize:14, color:'#fff' }}>CONTINUE ONBOARDING</Text>
				</TouchableOpacity>
			</View>
			
            <Loader isLoading={isLoading} /> 

        </View>
    );
  };

export default EOBScreen;


const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      alignItems: 'center' ,
      backgroundColor:'#E5E9EB' ,
	  justifyContent: 'space-between'
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
		// flex: 1,
		height:50,
		justifyContent:"center",
		backgroundColor: ThemeColor.BtnColor ,
		alignItems:'center',
	  }
  });

    