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
 

  const getLoginDetail = async () => {
    var loginDetail = null;
    try {
      loginDetail = await AsyncStorage.getItem('loginDetails');
      const parsed = JSON.parse(loginDetail); 
      const userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
      const authToken = base64.encode(userAuthToken);    
      global.AccessToken = authToken;
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
  let parsedProfile = JSON.parse(loginState.profileDetail);  

  let empOnboarding = parsedProfile ? parsedProfile.empDetails.employeeOnboarding.onboarding : "0";
  if(empOnboarding && !loginState.EOBSkipped){
    return(
      <AuthContext.Provider value={authContext}>
      <NavigationContainer>
        <EOBScreen screenProps={parsed}/>
      </NavigationContainer>
      </AuthContext.Provider>
    );
      
  }
  let empDetails = parsedProfile.empDetails;
  let isJobSeeker = empDetails.jobSeeker;
  let jobSearchStatusID = empDetails.jobSearchStatusId;
  let displayLeave = empDetails.displayLeave; // 1 = Leave only
  let employeeTypeId = empDetails.employeeTypeId;

  let onBoarding = empDetails ? empDetails.onBoarding : "0";
  let resumeUploaded = empDetails ? empDetails.resumeUploaded : "0";
  let onBoardingStage = parsed ? parsed.onBoardingStage : "";

  if((onBoarding == 1 ) && !loginState.onBoardingSkipped && !loginState.EOBSkipped){
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
    return(
      <AuthContext.Provider value={authContext}>
      <NavigationContainer>
        <FirstTabScreen screenProps={parsed}/>
      </NavigationContainer>
      </AuthContext.Provider>
    );
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

