/* eslint-disable react/display-name */
import React, {useEffect} from "react";
import { StatusBar, 
    Text, 
    View,
    Switch,
    ScrollView,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Image,
    Alert,
    Linking,
    SafeAreaView
} from "react-native";

import base64 from 'react-native-base64'
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios'
import Icon from 'react-native-vector-icons/Ionicons';
import Fontisto from 'react-native-vector-icons/Fontisto';
import Entypo from 'react-native-vector-icons/Entypo';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import MovableView from 'react-native-movable-view';
import RNExitApp from 'react-native-exit-app';
import moment from 'moment';
import '../../_helpers/global';
import Loader from '../../Components/Loader';
import { AuthContext } from '../../Components/context';
import {parseErrorMessage} from '../../_helpers/Utils';
import { getAuthHeader } from '../../_helpers/auth-header';
import { BaseUrl, EndPoints, StaticMessage, ThemeColor ,BaseURLElastic, FontName} from '../../_helpers/constants';

import { requestUserPermission } from '../../_helpers/notificationService'
import messaging from '@react-native-firebase/messaging';
import crashlytics from '@react-native-firebase/crashlytics';
import PushNotification from "react-native-push-notification";
import PushNotificationIOS from "@react-native-community/push-notification-ios";


const Item = ({ item, onPress, backgroundColor, textColor }) => (
  <TouchableOpacity onPress={onPress} style={[styles.item, backgroundColor]}>
    <Text style={[styles.title, textColor]}>{item.skillName}</Text>
  </TouchableOpacity>
);
const renderItem = ({ item }) => {
  const backgroundColor = ThemeColor.SkyBlueColor;
  const color =  ThemeColor.BtnColor;

  return (
    <Item
      item={item}
      backgroundColor={{ backgroundColor }}
      textColor={{ color }}
    />
  );
};

const DashboardScreen = ({navigation}) => {
  const [data,setData] = React.useState({
    loginDetails: {},
    authTokenKey:'',
    isLoading: false, 
    isSummaryCountLoading: false, 
    isJobCountLoading: false, 
  });
  
  let [authTokenKey, setAuthTokenKey] = React.useState('')
  let [responseData, setResponseData] = React.useState({
    empDetails:{},
    skills:[],
  })
  let [dashboardCounts, setDashboardCounts] = React.useState('')
  let [matchingJobCounts, setMatchingJobCounts] = React.useState('0')
  let [filterDetails, setFilterDetails] = React.useState('')
  let [isInterestedInJob, setIsInterestedInJob] = React.useState(false);
  const { signOut } = React.useContext(AuthContext);
  const { resumeEOB } = React.useContext(AuthContext);

  const { refreshDashboard } = React.useContext(AuthContext);

  const [lookupData, setLookupData] = React.useState({});
  const [timesheetsArray, setTimesheetsArray] = React.useState([]);
  

  useEffect( () => {
    PushNotification.configure({
      onNotification: function (notification) {
        if (notification.userInteraction) {
          console.log(notification);
          let data = notification.data;
          let screenName = data['gcm.notification.screenName'];
          console.log('screenName :',screenName);
          handlePushDeepLinking(screenName);
        }
        notification.finish(PushNotificationIOS.FetchResult.NoData);
      },
    });
    crashlytics().log('Updating user count.');
    requestUserPermission();
    // const unsubscribe = messaging().onMessage(async remoteMessage => {
    //   Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
    // });
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Message handled in the background!', remoteMessage);
    });

    // Linking.addEventListener('url', handleDeepLink('url'))
    Linking.addEventListener('url', ({url}) => {handleDeepLink(url)})

    navigation.addListener('focus', () => {
      getProfileDetails(false);
    })
    // getProfileDetails(false);
  }, []);
  const handlePushDeepLinking = (linkUrl) => {
    // let linkUrl1 = 'StafflinePro/message/list/607';
    // console.log("linkUrl : ",linkUrl1);
    handleDeepLink(linkUrl);
  }
  const handleDeepLink = (e) =>  {  
    var screenName = "";
    var subScreenName = "";
    var detailsId = "";
    var domainName = "";

    const linkRoute = e.replace(/.*?:\/\//g, '');
    let screenArr = linkRoute.split('/');
    domainName = screenArr.length > 0 ? screenArr[0] : "";
    screenName = screenArr.length > 1 ? screenArr[1] : "";
    subScreenName = screenArr.length > 2 ? screenArr[2] : "";
    detailsId = screenArr.length > 3 ? screenArr[3] : "";


    // Then handle redirection to the specific page in the app
    if(domainName == "StafflinePro"){
      if(screenName == "dashboard"){
        navigation.navigate('Dashboard');
      }else if(screenName == "job"){
        navigation.navigate('FindJobs');
        if(subScreenName == "list"){
          navigation.navigate('JobsList',{searchKey:'',location:''});
        }
      }else if (screenName == "nonlogin_job"){
        navigation.navigate('FindJobs');
        if(subScreenName == "list"){
          navigation.navigate('JobsList',{searchKey:'',location:''});
        }
      }else if (screenName == "jobdetail"){
        navigation.navigate('FindJobs');
  
        if(subScreenName == 'apply'){
          getJobDetails(detailsId,'apply');
        }else if(subScreenName == 'refer'){
          getJobDetails(detailsId,'refer');
        }else if(subScreenName == 'summary'){
          getJobDetails(detailsId,'summary');
        }else{
          getJobDetails(detailsId,'');
        }
      }else if (screenName == 'profile'){
        navigation.navigate('More');
        getProfileDetails(true);
      }else if (screenName == 'message'){
        navigation.navigate('MessageHome');
      }else if(screenName == 'timecard'){
        navigation.navigate('Timesheets');
      }
    }else if(screenName == "dashboard"){
      navigation.navigate('Dashboard');
    }else if(screenName == "job"){
      navigation.navigate('FindJobs');
      if(subScreenName == "list"){
        navigation.navigate('JobsList',{searchKey:'',location:''});
      }
    }else if (screenName == "nonlogin_job"){
      navigation.navigate('FindJobs');
      if(subScreenName == "list"){
        navigation.navigate('JobsList',{searchKey:'',location:''});
      }
    }else if (screenName == "jobdetail"){
      navigation.navigate('FindJobs');

      if(subScreenName == 'apply'){
        getJobDetails(detailsId,'apply');
      }else if(subScreenName == 'refer'){
        getJobDetails(detailsId,'refer');
      }else if(subScreenName == 'summary'){
        getJobDetails(detailsId,'summary');
      }else{
        getJobDetails(detailsId,'');
      }
    }else if (screenName == 'profile'){
      navigation.navigate('More');
      getProfileDetails(true);
    }
  }
  const getJobDetails = async (jobID, redirectTo) => {
    setData({...data, isLoading: true});
    navigation.navigate('JobsList',{searchKey:'',location:''});

    let user = await AsyncStorage.getItem('loginDetails');  
    let parsed = JSON.parse(user);  
    let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
    var encoded = base64.encode(userAuthToken);


    axios ({
      "method": "GET",
      "url": BaseUrl + "jobs/" + jobID,
      "headers": getAuthHeader(encoded),
    })
    .then((response) => {
      setData({...data, isLoading: false});
      if (response.data.code == 200){
        if(redirectTo == 'apply'){
          navigation.navigate('Job apply',{jobDetails: response.data.content.dataList[0]});
        }else if(redirectTo == 'refer'){
          navigation.navigate('Job refer',{jobDetails: response.data.content.dataList[0]})
        }else{
          navigation.navigate("Job Details", {jobDetail: response.data.content.dataList[0]});
        }
      }else if (response.data.code == 417){
        setData({...data, isLoading: false});
        const errorList = Object.values(response.data.content.messageList);
        Alert.alert(StaticMessage.AppName, errorList.join(), [
          {text: 'Ok'}
        ]);

      }else{

      }
    })
    .catch((error) => {
      setData({...data, isLoading: false});
        Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
            {text: 'Ok'}
        ]);
    })
  }
 

  React.useLayoutEffect(() => {
    navigation.setOptions({
        headerRight: () => (
          <TouchableOpacity style={{marginRight:16}}>
              <Image style={{ width: 22,height: 22,tintColor:'white'}} source={require('../../assets/Images/icon_alarm.png')} /> 
          </TouchableOpacity>
        ),
    });
  }, [navigation]);

 
  const SessionExpiredAlert = () =>{
    Alert.alert(StaticMessage.AppName,StaticMessage.SessionExpired,
        [{
          text: 'Ok',
          onPress: () => signOut()
      }]
  )}
  

  const  getProfileDetails = async(isForRedirect) => {
    let user = await AsyncStorage.getItem('loginDetails');  
    let parsed = JSON.parse(user);  
    let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
    var authToken = base64.encode(userAuthToken);

    setData({...data,isLoading: true});
    axios ({  
      "method": "GET",
      "url": BaseUrl + EndPoints.UserProfile,
      "headers": getAuthHeader(authToken)
    })
    .then((response) => {
      if (response.data.code == 200){
        const results = JSON.stringify(response.data.content.dataList[0]);
        if(response.data.content.dataList.length > 0){
            setResponseData(response.data.content.dataList[0]);
            let empDetails = response.data.content.dataList[0].empDetails;
            const jobSearchStatusID =  empDetails ? empDetails.jobSearchStatusId : '';
            if(jobSearchStatusID == 4751 || jobSearchStatusID == 4752){
              setIsInterestedInJob(true);
            }else{          
              setIsInterestedInJob(false);
            }
            if(isForRedirect){
              navigation.navigate("Profile",{profileDetails:response.data.content.dataList[0]});
            }
            getDashboardSummary(); 
            getMyApplication(empDetails.resumeId);
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
        setData({...data,isLoading: false});
        const message = parseErrorMessage(response.data.content.messageList);
        Alert.alert(StaticMessage.AppName, message, [
          {text: 'Ok'}
        ]);

      }else{
        setData({...data,isLoading: false});
      }
    })
    .catch((error) => {
      console.error(error);
      setData({...data, isLoading: false});
      if(error.response && error.response.status == 401){
        SessionExpiredAlert();
      }else{
          Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
              {text: 'Ok'}
            ]);
      }
    })
  }
  const handleClick = () => {
    let iosURL = "https://itunes.apple.com/in/app/stafflinepro-jobs-find-you/id1306795942?mt=8";
    Linking.canOpenURL(iosURL).then(supported => {
        supported && Linking.openURL(iosURL);
    }, (err) => console.log(err));
  }
  const getMyApplication = async (resumeId) => {
    setData({...data, isLoading: true});

    let user = await AsyncStorage.getItem('loginDetails');  
    let parsed = JSON.parse(user);  
    let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
    var encoded = base64.encode(userAuthToken);
    axios ({
      "method": "POST",
      "url": BaseUrl + EndPoints.JobApplications,
      "headers": getAuthHeader(encoded),
      data:{"applicationStatus":'active'}
    })
    .then((response) => {
      setData({...data, isLoading: false});
      if (response.data.code == 200){
        let applicationsArray =  response.data.content.dataList;
        let records = [];
        applicationsArray.map((product, key) => {
          records.push(product.Job_Resume_Id);
       });
        getJobStatistics(resumeId,records);

      }else if (response.data.code == 417){
        setData({...data, isLoading: false});
        const errorList = Object.values(response.data.content.messageList);
        
        Alert.alert(StaticMessage.AppName, errorList.join(), [
          {text: 'Ok'}
        ]);

      }else{

      }
    })
    .catch((error) => {
      setData({...data, isLoading: false});
        if(error.response && error.response.status == 401){
          SessionExpiredAlert();
        }else{
            Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
                {text: 'Ok'}
              ]);
        }
    })
  }
  const  getTimesheets = async() => {
    let user = await AsyncStorage.getItem('loginDetails');  
    let parsed = JSON.parse(user);  
    let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
    var authToken = base64.encode(userAuthToken);

    axios ({  
      "method": "POST",
      "url": BaseUrl + EndPoints.GetTimehsstes,
      "headers": getAuthHeader(authToken),
      data:{"status":"pending",'startDate':"",'endDate':""}
    })
    .then((response) => {
      setData({...data,isLoading: false});
      if (response.data.code == 200){
        if(response.data.content.dataList.length > 0){
          setTimesheetsArray(response.data.content.dataList);
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
              onPress: () => openComposer({
                to: "support@stafflinepro.com",
                subject: "",
                body: "",
              })
            }
          ]);   
  
        }       
      }else if (response.data.code == 417){
        setData({...data,isLoading: false});
        const message = parseErrorMessage(response.data.content.messageList);
        Alert.alert(StaticMessage.AppName, message, [
          {text: 'Ok'}
        ]);
      }
    })
    .catch((error) => {
      console.error(error);
      setData({...data, isLoading: false});
      if(error.response && error.response.status == 401){
        SessionExpiredAlert();
      }else{
          Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
              {text: 'Ok'}
            ]);
      }
    })
  }
  const  getDashboardSummary = async() => {
    let user = await AsyncStorage.getItem('loginDetails');  
    let parsed = JSON.parse(user);  
    let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
    var authToken = base64.encode(userAuthToken);

    axios ({  
      "method": "GET",
      "url": BaseUrl + EndPoints.DashboardSummary,
      "headers": getAuthHeader(authToken)
    })
    .then((response) => {
      if (response.data.code == 200){
        if(response.data.content.dataList.length > 0){
          setDashboardCounts(response.data.content.dataList[0]);

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
              onPress: () => openComposer({
                to: "support@stafflinepro.com",
                subject: "",
                body: "",
              })
            }
          ]);   
  
        }  
        getTimesheets(); 
      }else if (response.data.code == 417){
        setData({...data,isLoading: false});
        const message = parseErrorMessage(response.data.content.messageList);
        Alert.alert(StaticMessage.AppName, message, [
          {text: 'Ok'}
        ]);
      }
    })
    .catch((error) => {
      console.error(error);
      setData({...data, isLoading: false});
      if(error.response && error.response.status == 401){
        SessionExpiredAlert();
      }else{
          Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
              {text: 'Ok'}
            ]);
      }
    })
  }
  

  

  const getJobStatistics = async(resumeId,oldApplication) => {
    setData({...data,isJobCountLoading: true});
    
    let user = await AsyncStorage.getItem('loginDetails');  
    let parsed = JSON.parse(user);  
    let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
    var authToken = base64.encode(userAuthToken);

    axios ({
      "method": "POST",
      "url": BaseUrl + EndPoints.JobStatistics,
      "headers": getAuthHeader(authToken),
      data:{"type":"matching-jobs"}
    })
    .then((response) => {
      if (response.data.code == 200){
        // setFilterDetails(response.data.content.dataList[0]);
        getMatchingJobCount(response.data.content.dataList[0],resumeId,oldApplication);
      }else if (response.data.code == 417){
        setData({...data,isJobCountLoading: false});
        const message = parseErrorMessage(response.data.content.messageList);
        Alert.alert(StaticMessage.AppName, message, [
          {text: 'Ok'}
        ]);

      }else{

      }
    })
    .catch((error) => {
      setData({...data, isJobCountLoading: false});
      if(error.response && error.response.status == 401){
        SessionExpiredAlert();
      }else{
          Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
              {text: 'Ok'}
            ]);
      }

    })
  }
  const getMatchingJobCount = async (filter,resumeId,oldApplication) => {
    var filterDict;
    if(filter.jobAlerts.length > 0){
      filterDict =  filter.jobAlerts[0].searchParameter
    }else{
      filterDict =  {  
       
      }
    }
    filterDict = {...filterDict,"excludeJobsById":oldApplication}

    // const empDetails = responseData.empDetails;
    // let resumeId = empDetails.resumeId;
    setData({...data,isSummaryCountLoading: true});
    axios ({
        method: "POST",
        url: `${BaseURLElastic}job/matching/${resumeId}`,
        headers: {
            'sdSecKey':'sda43WfR797sWQE',
            'Content-Type':'application/x-www-form-urlencoded'
        },
        data:filterDict
    }).then((response) => {
        setData({...data,isSummaryCountLoading: true});
        if (response.data.statusCode == 200){
          setMatchingJobCounts(response.data.data.totalRecords ? response.data.data.totalRecords : 0);
        }else if (response.data.statusCode == 417){
          setData({...data,isSummaryCountLoading: true});
          Alert.alert(StaticMessage.AppName, response.data.description, [
                {text: 'Ok'}
            ]);
        }else{

        }
    })
    .catch((error) => {

        console.log(error);
        setData({...data,isSummaryCountLoading: true});
        Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
        {text: 'Ok'}
      ]);
    })
  }
  // const getMatchingJobCount = () => {
    
  //   console.log('URL Count:',BaseURLElastic + "job/matching/582716");
  //   var params = filterDetails.jobAlerts > 0 ? filterDetails.jobAlerts[0].searchParameter : {};

  //   console.log("Search Params:", params);
  //   axios ({
  //     "method": "POST",
  //     "url": BaseURLElastic + "job/matching/582716",
  //     "headers": getElasticHeader(),
  //     data:params
  //   })
  //   .then((response) => {
  //     if (response.data.statusCode == 200){
  //       // setData({...data,isSummaryCountLoading: false});
  //       console.log(`Matching Count: ${JSON.stringify(response.data)}`);
  //       // setFilterDetail(response.data.content.dataList[0]);
  //     }else if (response.data.statusCode == 417){
  //       setData({...data,isSummaryCountLoading: false});
  //       console.log(Object.values(response.data.content.messageList));
  //       const errorList = Object.values(response.data.content.messageList);
  //       Alert.alert(StaticMessage.AppName, errorList.join(), [
  //         {text: 'Ok'}
  //       ]);

  //     }else{
  //       console.log(response);
        
  //     }
  //   })
  //   .catch((error) => {
  //     console.log(error);
  //     setData({...data, isSummaryCountLoading: false});
  //     Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
  //       {text: 'Ok'}
  //     ]);

  //   })
  // }

  const toggleSwitch = () => {
        setIsInterestedInJob(!isInterestedInJob);
    if(isInterestedInJob){
      Alert.alert('Confirmation', 'Job match notifications will be turned off for next 90 days', [
        {
          text: 'CONTINUE',
          onPress: () => {updateJobSearchStatus('4753')}
        },
        {
          text: 'CANCEL',
          onPress: () => {setIsInterestedInJob(true)}
        }
      ]);
    }else{
      updateJobSearchStatus('4751')
    }
    
  }
  const  updateJobSearchStatus = async(jobSearchStatusId) => {
    let user = await AsyncStorage.getItem('loginDetails');  
    let parsed = JSON.parse(user);  
    let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
    var authToken = base64.encode(userAuthToken);
    setData({...data, isLoading:true});
    axios ({  
      "method": "PUT",
      "url": BaseUrl + EndPoints.UserProfile,
      "headers": getAuthHeader(authToken),
      data:{'empDetails':{"jobSearchStatusId":jobSearchStatusId}}
    })
    .then((response) => {
      setData({...data, isLoading:false});
      if (response.data.code == 200){
        const results = JSON.stringify(response.data.content);
        getProfileDetails();
        refreshDashboard();
      }else if (response.data.code == 417){
        setIsInterestedInJob(!isInterestedInJob);
        const message = parseErrorMessage(response.data.content.messageList);
        Alert.alert(StaticMessage.AppName, message, [
          {text: 'Ok'}
        ]);

      }
    })
    .catch((error) => {
      setIsInterestedInJob(!isInterestedInJob);
      setData({...data, isLoading:false});
      Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
        {text: 'Ok'}
      ]);

    })
  }
  
  
  const didSelectSkills = (selectedItem) => {
    console.log(selectedItem);
    navigation.navigate('Skill',{profileDetail: responseData,skillDetails:selectedItem})
  }
  const isPendingTimesheetAvailable = () => {
    for (let i = 0; i < timesheetsArray.length; i++) {
      for(let j= 0 ; j < timesheetsArray[i].hoursDetail.length ; j++){
        let hoursDetail = timesheetsArray[i].hoursDetail[j];
        let momentStartDate = moment(hoursDetail.startDate, 'YYYY-MM-DD');
        let momentEndDate = moment(hoursDetail.endDate, 'YYYY-MM-DD');
        let startDateString = moment(momentStartDate).format('MMM DD, YYYY')
        let endDateString = moment(momentEndDate).format('MMM DD, YYYY')
        let todayDate =  new Date();
        if(momentEndDate <= todayDate){
          return true;
        }
      }
    }
    return false;
  }
  const getPendingTimesheetDate = () => {
    for (let i = 0; i < timesheetsArray.length; i++) {
      for(let j= 0 ; j < timesheetsArray[i].hoursDetail.length ; j++){
        let hoursDetail = timesheetsArray[i].hoursDetail[j];
        let momentStartDate = moment(hoursDetail.startDate, 'YYYY-MM-DD');
        let momentEndDate = moment(hoursDetail.endDate, 'YYYY-MM-DD');
        let startDateString = moment(momentStartDate).format('MMM DD, YYYY')
        let endDateString = moment(momentEndDate).format('MMM DD, YYYY')
        let todayDate =  new Date();
        if(momentEndDate <= todayDate){
          return `${startDateString} - ${endDateString}`
        }
      }
    }
    return ''
  }
  const getPendingTimesheetDays = () => {
    for (let i = 0; i < timesheetsArray.length; i++) {
      for(let j= 0 ; j < timesheetsArray[i].hoursDetail.length ; j++){
        let hoursDetail = timesheetsArray[i].hoursDetail[j];
        let momentStartDate = moment(hoursDetail.startDate, 'YYYY-MM-DD');
        let momentEndDate = moment(hoursDetail.endDate, 'YYYY-MM-DD');
        let startDateString = moment(momentStartDate).format('MMM DD, YYYY')
        let endDateString = moment(momentEndDate).format('MMM DD, YYYY')
        // let todayDate =  new Date();
        var todayDate = moment(); //This was the change required

        if(momentEndDate <= todayDate){
          let days = todayDate.diff(momentEndDate, 'days') ;
          return `Overdue  ( ${days} days )`        
        }
      }
    }
    return '0'


  }
  const handleProjectEndingSoonHelpText = () => {
    let message = "Minimize downtime. Give us a Head's up as soon as you know.";
    Alert.alert(StaticMessage.AppName, message, [
      {text: 'Ok'}
    ]);
  }
  const empDetails = responseData.empDetails;
  let empOnboarding = empDetails.employeeOnboarding ? empDetails.employeeOnboarding.onboarding : null;

  const jobSearchStatusID =  empDetails ? empDetails.jobSearchStatusId : '';
  const liceAndCertArr = responseData ? responseData.licensesAndCertifications : [];
  const skillsArr = responseData ? responseData.skills : [];
  const domainId = empDetails ? empDetails.domainId : '';
  var loadSkills = true;
  if (skillsArr.length > 0){
    if (domainId == '4653' || domainId == 'Healthcare'){
      // load licence
      loadSkills = false;
    }
  }
  var dashboardItems = [];
  let isExternalUser = empDetails.employeeTypeId == 1224 ? true : false;
  let isJobSeeker = (empDetails.jobSeeker || jobSearchStatusID == 4751 || jobSearchStatusID == 4752 || isExternalUser);
  if(isJobSeeker){
    if(jobSearchStatusID == 4751 || jobSearchStatusID == 4752){
      dashboardItems.push({cellType:'TITLE', height:50});
      if(empOnboarding){
        dashboardItems.push({cellType:'EMPONBOARD', height:50});
      }
      dashboardItems.push({cellType:'MYSTATUS', height:120});
      dashboardItems.push({cellType:'ADDSKILL', height:160});
      dashboardItems.push({cellType:'MATCHINGJOB', height:160});
      dashboardItems.push({cellType:'ACTIVEAPPL', height:160});
      dashboardItems.push({cellType:'MATCHINGJOB_ACTIVEAPPL', height:160});
      dashboardItems.push({cellType:'INTERVIEW_MESSAGE', height:160});

    }else{
      dashboardItems.push({cellType:'TITLE', height:50});
      if(empOnboarding){
        dashboardItems.push({cellType:'EMPONBOARD', height:50});
      }
      dashboardItems.push({cellType:'MYSTATUS', height:120});
      dashboardItems.push({cellType:'ADDSKILL', height:160});
      dashboardItems.push({cellType:'MATCHINGJOB', height:160});
      dashboardItems.push({cellType:'REFERCLIENT', height:160});
      dashboardItems.push({cellType:'MATCHINGJOB_REFERCLIENT', height:160});

    }
  }else{
    dashboardItems.push({cellType:'TITLE', height:50});
    if(empOnboarding){
      dashboardItems.push({cellType:'EMPONBOARD', height:50});
    }
    dashboardItems.push({cellType:'PROJECTSTATUS', height:120});
    dashboardItems.push({cellType:'MYSTATUS', height:120});
    if(timesheetsArray.length > 0 ){
      dashboardItems.push({cellType:'TIMESHEET', height:120});
    }
    dashboardItems.push({cellType:'REFERCLIENT', height:160});
    dashboardItems.push({cellType:'REFERJOB', height:160});
    dashboardItems.push({cellType:'REFERCLIENT_REFERJOB', height:160});

  }
  let skillCetiArr = loadSkills ? skillsArr : liceAndCertArr;
  return (
    <SafeAreaView style={{flex: 1, backgroundColor:'white', paddingTop:16}}>
      <FlatList style={{paddingLeft:16, paddingRight:16, marginTop:16,marginBottom:8, paddingBottom:16}}
          data={dashboardItems}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item}) => 
            <View style={{}}>
              {
                item.cellType == 'TITLE' ?
                <View style={{width:'100%',backgroundColor:'white', height:50,borderColor:ThemeColor.BorderColor,borderWidth:1,borderRadius:5,alignItems: 'center',justifyContent: 'center'}}>
                  <Text style={{fontFamily:FontName.Bold, fontSize:16,color:ThemeColor.NavColor, fontWeight:'bold'}}> Hello, {empDetails ? empDetails.firstName : ''}!</Text>
                </View> : null  
              }
              {
                item.cellType == 'EMPONBOARD' ?
                <TouchableOpacity style={{width:'100%',backgroundColor:'#fff', height:50,borderColor:ThemeColor.BorderColor,borderWidth:1,borderRadius:5,alignItems: 'center',justifyContent: 'center', marginTop:16, flex:1,flexDirection: 'row'}} onPress = {() => {resumeEOB()}}>
                  <Text style={{fontFamily:FontName.Regular, fontSize:16,color:'orange', flex:1, textAlign: 'center',paddingLeft:28}}>RESUME ONBOARDING</Text>
                  <EvilIcons name="chevron-right" color={'orange'} size={25} />
                </TouchableOpacity> : null  
              }
              {
                item.cellType == 'PROJECTSTATUS' ?
                <TouchableOpacity style={{marginTop:16,width:'100%',backgroundColor:'white', height:50,borderColor:ThemeColor.BorderColor,borderWidth:1,borderRadius:5,alignItems: 'center',justifyContent: 'center', flexDirection:'row'}} onPress = {() => {navigation.navigate('ProjectEndDate',{lookupData:lookupData})}}>
                  <Text style={{fontFamily:FontName.Regular, fontSize:16,color:ThemeColor.TextColor}}>Is your project ending soon? </Text>
                  <Text style={{fontFamily:FontName.Bold, fontSize:16,color:ThemeColor.NavColor}}>Let us know</Text>
                  <TouchableOpacity style={{height:40, width:40, marginLeft:8, justifyContent:'center'}} onPress={ () => {handleProjectEndingSoonHelpText()}}>
                    <EvilIcons name="question" color={ThemeColor.SubTextColor} size={25} />
                  </TouchableOpacity>
                </TouchableOpacity> : null  
              }
              {
                item.cellType == 'TIMESHEET' && isPendingTimesheetAvailable() ?
                <View style={{marginTop:16,width: '100%',height: 140, backgroundColor:'#fff',borderColor: ThemeColor.BorderColor,borderWidth:1,borderRadius:5,}}>
                  <View style={{width:'100%',backgroundColor:ThemeColor.SkyBlueColor, height:50,alignItems: 'center',justifyContent: 'center'}}>
                    <Text style={{fontFamily:FontName.Regular, fontSize:16,color:'black'}}>You have pending timesheet</Text>
                  </View>
                  <TouchableOpacity style={{ flex:1 ,padding:8,flexDirection:'row', alignItems:'center'}} onPress={() => {navigation.navigate('Timesheets',{timesheetsList:timesheetsArray})}}>
                    <View style={{ flex:1,alignItems: 'center', padding:8, justifyContent: 'center'}}>
                      <Text style={{fontFamily:FontName.Regular, fontSize:16,color: ThemeColor.TextColor, }}>{getPendingTimesheetDate()}</Text>
                      <Text style={{fontFamily:FontName.Regular, fontSize:12,color: ThemeColor.RedColor,paddingTop:4}}>{getPendingTimesheetDays()}</Text>
                    </View>
                    <Entypo name="chevron-thin-right" color={'gray'} size={20} />
                  </TouchableOpacity>
                </View> : null  
              }
              {
                item.cellType == 'MYSTATUS' ?
                <View style={{marginTop:16,width: '100%',height: 140, backgroundColor:'#fff',borderColor:ThemeColor.BorderColor,borderWidth:1,borderRadius:5,}}>
                  <View style={{width:'100%',backgroundColor:ThemeColor.SkyBlueColor, height:50,alignItems: 'center',justifyContent: 'center'}}>
                    <Text style={{fontFamily:FontName.Regular, fontSize:16,color:'black'}}>Update your status</Text>
                  </View>
                  <View style={{justifyContent: 'space-between', flex:1,flexDirection:'row',alignItems: 'center', padding:16}}>
                    <Text style={{fontFamily:FontName.Regular, fontSize:16,color:'black'}}>Interested in new opportunities</Text>
                    <Switch
                      trackColor={{ false: ThemeColor.SwitchInactiveColor, true:ThemeColor.BtnColor }}
                      ios_backgroundColor = {ThemeColor.SwitchInactiveColor}
                      thumbColor={isInterestedInJob ? "#FFF" : "#f4f3f4"}
                      onValueChange={toggleSwitch}
                      value={isInterestedInJob}
                    />          
                  </View>   
                </View> : null  
              }
              {
                item.cellType == 'ADDSKILL' ?
                <View style={{marginTop:16,height: 140, backgroundColor:'#fff',borderColor: ThemeColor.BorderColor,borderWidth:1,borderRadius:5}}>
                  <View style={{backgroundColor:ThemeColor.SkyBlueColor, height:50,alignItems: 'center',justifyContent: 'center'}}>
                    <Text style={{fontFamily:FontName.Regular, fontSize:16,color:ThemeColor.TextColor, textAlign:'center', paddingLeft:8, paddingRight:8}}>{loadSkills ? 'Update your skills to see most relevant job matches' : 'Do you have any professional licences or certificates?'}</Text>
                  </View>
                  <View style={{ flex:1,flexDirection:'row',alignItems: 'center', padding:8, marginTop:12}}>
                    {skillCetiArr.length > 0 ? 
                    <FlatList
                      style={{paddingBottom:12,height:40}}
                      horizontal
                      data={loadSkills ? skillsArr : liceAndCertArr}
                      keyExtractor={(item, index) => index.toString()}
                      renderItem={({item}) => 
                        <TouchableOpacity  style={{backgroundColor:ThemeColor.SkyBlueColor,flexDirection:'row', alignContent:'center',justifyContent:'center' ,padding:4,paddingRight:8, paddingLeft:8,marginRight:8, borderRadius:10}} onPress={() =>{didSelectSkills(item)}}>
                          <Text style={{fontSize: 14,paddingLeft:8,paddingRight:8,color:ThemeColor.NavColor}}>{loadSkills ? item.skillName : item.certificateExamName}</Text>
                          {item.isPrimary == 1 ? <Icon name="star" color={'orange'} size={12} /> : null}
                        </TouchableOpacity>
                      }
                    /> :
                    <View style={{justifyContent:'center', alignContent:'center', flex:1}}>
                      <Text style={{fontFamily:FontName.Regular, fontSize:16,color: ThemeColor.TextColor, textAlign:'center'}}>{loadSkills ? 'No skills' : 'No certificates'}</Text>
                    </View>
                    }
                  </View>
                  <TouchableOpacity style={{marginRight:8, marginBottom:8}} onPress={() => {navigation.navigate('Skill',{profileDetail: responseData,lookupData:lookupData})}}>
                    <Text style={{fontFamily:FontName.Regular, fontSize:14,color: ThemeColor.BtnColor, textAlign:'right'}}>{loadSkills ? 'Add missing skills' : 'Add more'}</Text>
                  </TouchableOpacity>
                </View> : null  
              }
              {
                item.cellType == 'MATCHINGJOB_REFERCLIENT' ?
                <View style={{marginTop:16,flex: 1,flexDirection: 'row'}}>
                  <TouchableOpacity style={{ flex: 1, height:150, marginRight:8,backgroundColor:'#fff',borderColor:ThemeColor.BorderColor,borderWidth:1,borderRadius:5, width: '45%' }} onPress={() => {navigation.navigate('JobMatching')}}>
                    <View style={{width:'100%',backgroundColor:ThemeColor.SkyBlueColor, height:50,alignItems: 'center',justifyContent: 'center'}}>
                      <Icon name="stop-circle-outline" color={'black'} size={25} />
                    </View>
                    <View style={{width:'100%',alignItems: 'center',justifyContent: 'center',alignItems: 'center'}}>
                      <Text style={{fontFamily:FontName.Regular, fontSize:25,color:ThemeColor.BtnColor, marginTop:8}}>{matchingJobCounts}</Text>
                      <View style={{width:120, height:2, backgroundColor:ThemeColor.BorderColor,marginTop:0}}/>
                      <Text style={{fontFamily:FontName.Regular, fontSize:14,color:'black', marginTop:8}}>Job matches</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity style={{ flex: 1, height:150, backgroundColor:'#fff',borderColor:ThemeColor.BorderColor,borderWidth:1,borderRadius:5 }} onPress={() => navigation.navigate('ReferClient')}>
                    <View style={{width:'100%',backgroundColor:ThemeColor.SkyBlueColor, height:50,alignItems: 'center',justifyContent: 'center'}}>
                      <Icon name="person-add" color={ThemeColor.TextColor} size={25} />
                    </View>
                    <View style={{flex: 1,alignItems: 'center',justifyContent: 'center',alignItems: 'center',justifyContent:'center' , alignContent:'center',paddingRight:8, paddingLeft:8 }}>
                      <Text style={{fontFamily:FontName.Regular, fontSize:14,color:'black', marginTop:8}}>Need additional skills or resources on your project?</Text>
                    </View>
                    <Text style={{fontFamily:FontName.Regular, fontSize:14,color:ThemeColor.BtnColor, marginTop:8,textAlign:'right', paddingRight:8, paddingBottom:4}}>Yes</Text>
                  </TouchableOpacity>
                </View> : null  
              }
              {
                item.cellType == 'MATCHINGJOB_ACTIVEAPPL' ?
                <View style={{marginTop:16,flex: 1,flexDirection: 'row'}}>
                  <TouchableOpacity style={{ flex: 1, height:150, marginRight:8,backgroundColor:'#fff',borderColor:ThemeColor.BorderColor,borderWidth:1,borderRadius:5, width: '45%' }} onPress={() => {navigation.navigate('JobMatching')}}>
                    <View style={{width:'100%',backgroundColor:ThemeColor.SkyBlueColor, height:50,alignItems: 'center',justifyContent: 'center'}}>
                      <Icon name="stop-circle-outline" color={'black'} size={25} />
                    </View>
                    <View style={{width:'100%',alignItems: 'center',justifyContent: 'center',alignItems: 'center'}}>
                      <Text style={{fontFamily:FontName.Regular, fontSize:25,color:ThemeColor.BtnColor, marginTop:8}}>{matchingJobCounts}</Text>
                      <View style={{width:120, height:2, backgroundColor:ThemeColor.BorderColor,marginTop:0}}/>
                      <Text style={{fontFamily:FontName.Regular, fontSize:14,color:'black', marginTop:8}}>Job matches</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity style={{ flex: 1, height:150,marginLeft:8, backgroundColor:'#fff',borderColor:ThemeColor.BorderColor,borderWidth:1,borderRadius:5 }} onPress={() => {navigation.navigate('Application')}}>
                    <View style={{width:'100%',backgroundColor:ThemeColor.SkyBlueColor, height:50,alignItems: 'center',justifyContent: 'center'}}>
                      <Icon name="folder-open-outline" color={'black'} size={25} />
                    </View>
                    <View style={{width:'100%',alignItems: 'center',justifyContent: 'center',alignItems: 'center'}}>
                      <Text style={{fontFamily:FontName.Regular, fontSize:25,color:ThemeColor.BtnColor, marginTop:8}}>{dashboardCounts ? dashboardCounts.openApplications.count : 0}</Text>
                      <View style={{width:120, height:2, backgroundColor:ThemeColor.BorderColor,marginTop:0}}/>
                      <Text style={{fontFamily:FontName.Regular, fontSize:14,color:'black', marginTop:8}}>Active applications</Text>
                    </View>
                  </TouchableOpacity>
                </View> : null  
              }
              {
                item.cellType == 'INTERVIEW_MESSAGE' ? 
                <View style={{marginTop:16,flex: 1,flexDirection: 'row'}}>
                  <TouchableOpacity style={{ flex: 1, height:150, marginRight:8,backgroundColor:'#fff',borderColor:ThemeColor.BorderColor,borderWidth:1,borderRadius:5 }} onPress={() => {navigation.navigate('Interviews')}}>
                    <View style={{width:'100%',backgroundColor:ThemeColor.SkyBlueColor, height:50,alignItems: 'center',justifyContent: 'center'}}>
                      <Image style={{ width: 25,height: 25,tintColor:'black'}} source={require('../../assets/Images/Interview.png')} /> 
                    </View>
                    <View style={{width:'100%',alignItems: 'center',justifyContent: 'center',alignItems: 'center'}}>
                      <Text style={{fontFamily:FontName.Regular, fontSize:25,color:ThemeColor.BtnColor, marginTop:8}}>{dashboardCounts ? dashboardCounts.interviewScheduled.count : 0}</Text>
                      <View style={{width:120, height:2, backgroundColor:ThemeColor.BorderColor,marginTop:0}}/>
                      <Text style={{fontFamily:FontName.Regular, fontSize:14,color:'black', marginTop:8}}>Upcoming interviews</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity style={{ flex: 1, height:150,marginLeft:8, backgroundColor:'#fff',borderColor:ThemeColor.BorderColor,borderWidth:1,borderRadius:5 }} onPress={() => {navigation.navigate('MessageHome')}}>
                    <View style={{width:'100%',backgroundColor:ThemeColor.SkyBlueColor, height:50,alignItems: 'center',justifyContent: 'center'}}>
                      <Fontisto name="email" color={'black'} size={25} />
                    </View>
                    <View style={{width:'100%',alignItems: 'center',justifyContent: 'center',alignItems: 'center'}}>
                      <Text style={{fontFamily:FontName.Regular, fontSize:25,color:ThemeColor.BtnColor, marginTop:8}}>{dashboardCounts ? dashboardCounts.unreadConversations.count : 0}</Text>
                      <View style={{width:120, height:2, backgroundColor:ThemeColor.BorderColor,marginTop:0}}/>
                      <Text style={{fontFamily:FontName.Regular, fontSize:14,color:'black', marginTop:8}}>Unread messages</Text>
                    </View>
                  </TouchableOpacity>
                </View> : null
              }
              {
                item.cellType == 'REFERCLIENT_REFERJOB' ? 
                <View style={{marginTop:16,flex: 1,flexDirection: 'row'}}>
                  <TouchableOpacity style={{ flex: 1, height:150, backgroundColor:'#fff',borderColor:ThemeColor.BorderColor,borderWidth:1,borderRadius:5 }} onPress={() => navigation.navigate('ReferClient')}>
                    <View style={{width:'100%',backgroundColor:ThemeColor.SkyBlueColor, height:50,alignItems: 'center',justifyContent: 'center'}}>
                      <Icon name="person-add" color={ThemeColor.TextColor} size={25} />
                    </View>
                    <View style={{flex: 1,alignItems: 'center',justifyContent: 'center',alignItems: 'center',justifyContent:'center' , alignContent:'center',paddingRight:8, paddingLeft:8 }}>
                      <Text style={{fontFamily:FontName.Regular, fontSize:14,color:'black', marginTop:8}}>Need additional skills or resources on your project?</Text>
                    </View>
                    <Text style={{fontFamily:FontName.Regular, fontSize:14,color:ThemeColor.BtnColor, marginTop:8,textAlign:'right', paddingRight:8, paddingBottom:4}}>Yes</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={{ flex: 1, height:150,marginLeft:8, backgroundColor:'#fff',borderColor:ThemeColor.BorderColor,borderWidth:1,borderRadius:5 }} onPress={() => navigation.navigate('FindJobs')}>
                    <View style={{width:'100%',backgroundColor:ThemeColor.SkyBlueColor, height:50,alignItems: 'center',justifyContent: 'center'}}>
                      <Icon name="ios-briefcase" color={ThemeColor.TextColor} size={25} />
                    </View>
                    <View style={{flex: 1,alignItems: 'center',justifyContent: 'center',alignItems: 'center',justifyContent:'center' , alignContent:'center',paddingRight:8, paddingLeft:8 }}>
                      <Text style={{fontFamily:FontName.Regular, fontSize:14,color:'black', marginTop:8}}>Know someone who needs help with their job search?</Text>
                    </View>
                    <Text style={{fontFamily:FontName.Regular, fontSize:14,color:ThemeColor.BtnColor, marginTop:8,textAlign:'right', paddingRight:8, paddingBottom:4}}>Refer?</Text>
                  </TouchableOpacity>
                </View> : null
              }
              
            </View>
            
          }
      />
      <Loader isLoading={data.isLoading} />
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
    </SafeAreaView>
  );
  
}

export default DashboardScreen;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: StatusBar.currentHeight || 0,
  },
  item: {
    padding: 4,
    marginVertical: 4,
    marginHorizontal: 8,
    borderRadius:20,
    borderColor:ThemeColor.BtnColor,
    borderWidth:1,
  },
  title: {
    fontSize: 14,
    paddingLeft:8,
    paddingRight:8,
    color:ThemeColor.BtnColor
  },
  inputImage: {
    width: 20,
    height: 20,
    tintColor:'black',
  }
});



// export default DashboardScreenStack;
