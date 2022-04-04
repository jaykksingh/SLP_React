// import { StatusBar } from 'expo-status-bar';
import 'react-native-gesture-handler';
import React , {useEffect} from 'react';
import { Alert,Image} from "react-native";
import { NavigationContainer } from '@react-navigation/native';
import { StyleSheet, ActivityIndicator, View } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import base64 from 'react-native-base64'
import { getAuthHeader} from './_helpers/auth-header';
import { BaseUrl, EndPoints,StaticMessage } from './_helpers/constants';
import axios from 'axios'
import { AuthContext } from './Components/context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeepLinking from 'react-native-deep-linking';
import './_helpers/global'
// import PushNotificationIOS from "@react-native-community/push-notification-ios";
// import PushNotification from "react-native-push-notification";
import './_helpers/global';

import RootStackScreen from './Screens/LoginSignup/RootStackScreen';
import FirstTabScreen from './Screens/FirstTabScreen';
import SecondTabScreen from './Screens/SecondTabScreen';
import SkipTabScreen from './Screens/SkipTabScreen';
import UBHomeScreen from './Screens/UserOnboarding/UBHomeScreen';
import EOBScreen from './Screens/EmployeeOnboarding/EOBScreen';

const Stack = createStackNavigator();

const App = () => {
  
  const [isLoading, setIsLoading] = React.useState(false);

  const initialLoginState = {
    isLoading: true,
    userName: null,
    userToken: null,
    onBoardingSkipped: null,
    EOBSkipped:null,
    loginSkipped: null,
    loginDetails: null,
    profileDetail: null,
  };

  const loginReducer = (prevState, action) => {
    switch( action.type ) {
      case 'RETRIEVE_TOKEN': 
        return {
          ...prevState,
          loginDetails: action.loginDetails,
          userName: true,
      };
      case 'SKIPONBOARDING': 
        return {
          ...prevState,
          onBoardingSkipped: true,
          isLoading: false,
        };
      case 'PROFILE': 
        return {
          ...prevState,
          profileDetail: action.profileDetail,
          isLoading: false,

      };
      case 'SKIPEOB': 
        return {
          ...prevState,
          EOBSkipped: true,
          isLoading: false,
        };
      case 'RESUMEEOB': 
        return {
          ...prevState,
          EOBSkipped: false,
          isLoading: false,
      };
      case 'SKIPLOGIN': 
        return {
          ...prevState,
          loginSkipped: true,
          isLoading: false,
        };
      case 'LOGIN': 
        return {
          ...prevState,
          loginDetails: action.loginDetails,
          isLoading: true,
        };
      case 'LOGOUT': 
        return {
          ...prevState,
          userToken: null,
          loginSkipped:null,
          loginDetails: null,
          EOBSkipped:false,
          onBoardingSkipped:false,
          isLoading: false,
        };
      case 'REGISTER': 
        return {
          ...prevState,
          isLoading: false,
        };
      case 'SHOWLOADER': 
      return {
        ...prevState,
        isLoading: true,
      };
      case 'LOGINDETAILS': 
      return {
        ...prevState,
        isLoading: false,
      };
    }
  };

  const [loginState, dispatch] = React.useReducer(loginReducer, initialLoginState);

  const authContext = React.useMemo(() => ({
    signIn: async(loginDetail) => {
      dispatch({ type: 'LOGIN', loginDetails: loginDetail });
      try {
        await AsyncStorage.setItem('loginDetails', loginDetail);
      } catch(e) {
        console.log(e);
      }
      getProfileDetails();
    },
    signOut: async() => {
      try {
        await AsyncStorage.removeItem('loginDetails');
      } catch(e) {
        console.log(e);
      }
      dispatch({ type: 'LOGOUT' });
    },
    signUp: () => {
      // setUserToken('fgkj');
      // setIsLoading(false);
    },
    toggleTheme: () => {
      setIsDarkTheme( isDarkTheme => !isDarkTheme );
    },
    loginDetail: () => {
      dispatch({ type: 'LOGINDETAILS' });
      return JSON.parse(loginState.loginDetails);
    },skipOnboarding: () => {
      dispatch({ type: 'SKIPONBOARDING' ,skipStatus: true });
    },skipEOB: () => {
      dispatch({ type: 'SKIPEOB' ,skipStatus: true });
    },resumeEOB: () => {
      dispatch({ type: 'RESUMEEOB' ,skipStatus: false });
    },refreshDashboard: () => {
      getProfileDetails();;
    },
    skipLogin: () => {
      dispatch({ type: 'SKIPLOGIN' ,skipStatus: true });
    },
  }), []);

  useEffect(() => {
    DeepLinking.addScheme('stafflinepro://');
    DeepLinking.addRoute('/dashboard', (response) => {
      // example://test
      console.log('Example',response);
    });
    getLoginDetail();    
  }, []);
  const registerForPushing = () => {
    PushNotification.configure({
      // (optional) Called when Token is generated (iOS and Android)
      onRegister: function (token) {
        console.log("TOKEN:", token);
      },
    
      // (required) Called when a remote is received or opened, or local notification is opened
      onNotification: function (notification) {
        console.log("NOTIFICATION:", notification);
    
        // process the notification
    
        // (required) Called when a remote is received or opened, or local notification is opened
        notification.finish(PushNotificationIOS.FetchResult.NoData);
      },
    
      // (optional) Called when Registered Action is pressed and invokeApp is false, if true onNotification will be called (Android)
      onAction: function (notification) {
        console.log("ACTION:", notification.action);
        console.log("NOTIFICATION:", notification);
    
        // process the action
      },
    
      // (optional) Called when the user fails to register for remote notifications. Typically occurs when APNS is having issues, or the device is a simulator. (iOS)
      onRegistrationError: function(err) {
        console.error(err.message, err);
      },
    
      // IOS ONLY (optional): default: all - Permissions to register.
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
    
      // Should the initial notification be popped automatically
      // default: true
      popInitialNotification: true,
    
      /**
       * (optional) default: true
       * - Specified if permissions (ios) and token (android and ios) will requested or not,
       * - if not, you must call PushNotificationsHandler.requestPermissions() later
       * - if you are not using remote notification or do not have Firebase installed, use this:
       *     requestPermissions: Platform.OS === 'ios'
       */
      requestPermissions: true,
    });

  }
  const testNotification = () => {
    let object ={
      foreground: false, // BOOLEAN: If the notification was received in foreground or not
      userInteraction: false, // BOOLEAN: If the notification was opened by the user from the notification area or not
      message: 'My Notification Message', // STRING: The notification message
      data: {}, // OBJECT: The push data or the defined userInfo in local notifications
    }
    PushNotification.localNotification({
      /* Android Only Properties */
      channelId: "android_test", // (required) channelId, if the channel doesn't exist, notification will not trigger.
      foreground: true, // BOOLEAN: If the notification was received in foreground or not

      /* iOS only properties */
      category: "", // (optional) default: empty string
      subtitle: "My Notification Subtitle", // (optional) smaller title below notification title
    
      /* iOS and Android properties */
      id: 0, // (optional) Valid unique 32 bit integer specified as string. default: Autogenerated Unique ID
      title: "My Notification Title", // (optional)
      message: "My Notification Message", // (required)
    });
    
    
  }
  const testNotification1 = () => {
    PushNotification.localNotificationSchedule({
      channelId: "android_test", // (required) channelId, if the channel doesn't exist, notification will not trigger.
      foreground: true, // BOOLEAN: If the notification was received in foreground or not

      //... You can use all the options from localNotifications
      message: "My Notification Message", // (required)
      date: new Date(Date.now() + 5 * 1000), // in 60 secs
      allowWhileIdle: false, // (optional) set notification to work while on doze, default: false
    
      /* Android Only Properties */
      repeatType: 'time',
      repeatTime: 1, // (optional) Increment of configured repeatType. Check 'Repeating Notifications' section for more info.
    });
  }

  const getLoginDetail = async () => {
    var loginDetail = null;
    try {
      loginDetail = await AsyncStorage.getItem('loginDetails');
    } catch(e) {
      console.log(e);
    }
    dispatch({ type: 'RETRIEVE_TOKEN', loginDetails: loginDetail });
    getProfileDetails();
  }
  const  getProfileDetails = async() => {
    let user = await AsyncStorage.getItem('loginDetails');  
    let parsed = JSON.parse(user);  
    let authKey = parsed ? parsed.userAuthToken : null;
    if(authKey === null){
      dispatch({ type: 'PROFILE', profileDetail: {} });
      return;
    }
    let userAuthToken = 'StaffLine@2017:' + authKey;
    var authToken = base64.encode(userAuthToken);    
  
    axios ({  
      "method": "GET",
      "url": BaseUrl + EndPoints.UserProfile,
      "headers": getAuthHeader(authToken)
    })
    .then((response) => {
        // console.log('Profile API at App.js:',response.data);
        if (response.data.code == 200){
          let isMandatory = response.data.content.mandatory;
          if(!isMandatory){
            const profileDetail = JSON.stringify(response.data.content.dataList[0])
            // console.log('profileDetail: ' + profileDetail);  
            global.ProfileInfo =  profileDetail;
            try {
              AsyncStorage.setItem('profileDetails', profileDetail);
            } catch(e) {
              console.log(e);
            }
            dispatch({ type: 'PROFILE', profileDetail: profileDetail });
          }else{
            dispatch({ type: 'PROFILE', profileDetail: {} });

          }
        }else if (response.data.code == 417){
            dispatch({ type: 'PROFILE', profileDetail: {} });
            console.log(Object.values(response.data.content.messageList));
            const errorList = Object.values(response.data.content.messageList);
            Alert.alert(StaticMessage.AppName, errorList.join(), [
            {text: 'Ok'}
            ]);
    
        }else if (response.data.code == 401){
            dispatch({ type: 'PROFILE', profileDetail: {} });
            console.log('Session Expired Already');
            SessionExpiredAlert();
        }
    })
    .catch((error) => {
        setIsLoading(false);
        SessionExpiredAlert();

        // Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
        //   {text: 'Ok'}
        // ]);
        console.log('Error:',error);
    })
  }
  const SessionExpiredAlert = () =>{
    Alert.alert(StaticMessage.AppName,StaticMessage.SessionExpired,
        [{
          text: 'Ok',
          onPress: () => callLogout()
      }]
  )}
  const callLogout = async() =>{

    try {
      await AsyncStorage.removeItem('loginDetails');
    } catch(e) {
      console.log(e);
    }
    dispatch({ type: 'LOGOUT' });
  }
  
  if( loginState.isLoading) {
    return(
      <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
        <Image style={{position: 'absolute', width: '100%',height: '100%'}} source={require('./assets/Images/LoginBG.png')} /> 
        <ActivityIndicator size="large"/>
      </View>
    );
  }
  console.log(`LoginSkipped: ${JSON.stringify(loginState)}`);
  if(loginState.loginSkipped){
    return(
      <AuthContext.Provider value={authContext}>
      <NavigationContainer>
        <SkipTabScreen {...initialLoginState}/>
      </NavigationContainer>
      </AuthContext.Provider>
    );
  }
  let parsed = JSON.parse(loginState.loginDetails);  
  console.log("Login Details 1:", parsed);
  let userAuthToken = parsed ? parsed.userAuthToken : null

  if(userAuthToken == null){
    return(
      <AuthContext.Provider value={authContext}>
      <NavigationContainer>
        <RootStackScreen {...initialLoginState}/>
      </NavigationContainer>
      </AuthContext.Provider>
    );
  }
  let empOnboarding = parsed ? parsed.employeeOnboarding : "0";
  if(empOnboarding && !loginState.EOBSkipped){
    return(
      <AuthContext.Provider value={authContext}>
      <NavigationContainer>
        <EOBScreen screenProps={parsed}/>
      </NavigationContainer>
      </AuthContext.Provider>
    );
      
  }
  let parsedProfile = JSON.parse(loginState.profileDetail);  
  let empDetails = parsedProfile.empDetails;
  let isJobSeeker = empDetails.jobSeeker;
  let jobSearchStatusID = empDetails.jobSearchStatusId;
  let displayLeave = empDetails.displayLeave; // 1 = Leave only
  let employeeTypeId = empDetails.employeeTypeId;
  let onBoarding = parsed ? parsed.onBoarding : "0";
  let resumeUploaded = parsed ? parsed.resumeUploaded : "0";
  let onBoardingStage = parsed ? parsed.onBoardingStage : "";
  console.log("User onboarding:", resumeUploaded,onBoarding);

  if((onBoarding == 1) && !loginState.onBoardingSkipped && !loginState.EOBSkipped){
    console.log("User onboarding:", onBoardingStage,onBoarding);
    return(
      <AuthContext.Provider value={authContext}>
        <NavigationContainer>
          <UBHomeScreen screenProps={parsed}/>
        </NavigationContainer>
      </AuthContext.Provider>
    );
  }
  else if(displayLeave == 1){
    // show leave View
  }else if (jobSearchStatusID == 4751 || jobSearchStatusID == 4752 || isJobSeeker || employeeTypeId == 1224){
     return(
      <AuthContext.Provider value={authContext}>
      <NavigationContainer>
        <FirstTabScreen screenProps={parsed}/>
      </NavigationContainer>
      </AuthContext.Provider>
    );
  }else{
    return(
      <AuthContext.Provider value={authContext}>
        <NavigationContainer>
          <SecondTabScreen screenProps={parsed}/>
        </NavigationContainer>
      </AuthContext.Provider>
    );
    
  }

  // return (
  //   <AuthContext.Provider value={authContext}>
  //   <NavigationContainer>
  //     {userAuthToken != null ? (empOnboarding && !loginState.EOBSkipped? <EOBScreen screenProps={parsed}/> : (onBoarding == 1 && !loginState.onBoardingSkipped ? <UBHomeScreen screenProps={parsed}/> : <MainTabScreen {...initialLoginState}/> )) : loginState.loginSkipped ?  <SkipTabScreen {...initialLoginState}/> : <RootStackScreen {...initialLoginState}/> }
  //   </NavigationContainer>
  //   </AuthContext.Provider>

  // );
}


export default App;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

