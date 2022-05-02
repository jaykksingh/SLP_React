/* eslint-disable react/display-name */
import React , {useEffect, useState,useRef,createRef}from "react";
import { StatusBar, 
    Text, 
    View,
    Image,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    useWindowDimensions,
    FlatList,
    Alert,
    Switch
} from "react-native";
import FontAwesome from 'react-native-vector-icons/MaterialCommunityIcons';
import Icons from 'react-native-vector-icons/Ionicons';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import SegmentedControlTab from "react-native-segmented-control-tab";
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import HTML from "react-native-render-html";
import MovableView from 'react-native-movable-view';
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'
import axios from 'axios';
import { ScrollView } from "react-native-gesture-handler";
import { FlatGrid } from 'react-native-super-grid';
import {default as ActionSheetView} from 'react-native-actions-sheet';
import Carousel from 'react-native-snap-carousel';
import { AuthContext } from '../../Components/context';
import Loader from '../../Components/Loader';
import { BaseUrl, EndPoints, StaticMessage, ThemeColor ,BaseURLElastic, FontName} from '../../_helpers/constants';
import { getAuthHeader, getElasticHeader} from '../../_helpers/auth-header';


const jobFilterRef = createRef();


const JobMatchingScreen = ({route,navigation}) => {
  const { signOut } = React.useContext(AuthContext);
  let [isLoading, setLoading] = React.useState(false);
  let [updated, setUpdated] = React.useState(false);
  let [jobsArray, setJobsArray] = React.useState([]);
  const [selectedTaxonomy,setSelectedTaxonomy] = React.useState([]);
  const [selectedSkills,setSelectedSkills] = React.useState([]);
  const [selectedCertificate,setSelectedCertificate] = React.useState([]);
  const [selectedEmployment,setSelectedEmployment] = React.useState([]);
	let [selectedIndex, setSelectedIndex] = React.useState(0);
  const [multiSliderValue, setMultiSliderValue] = React.useState([0, 120]);

  let [profileData, setProfileData] = React.useState({
    empDetails:{
      prefferedCity:[],
      currentJobTitle:''
    }
  });
  var carouselRef = useRef(null);
  let [selectedData, setSelectedData] = React.useState({
    jobTitleSelected:false,
    isLocationSelected:false,
    skillsUpdated:false,
    certificateUpdated: false,
    employmentUpdated : false,
    certificateEdit:false,
    skillEdit:false
  });
  const [companyNameArray,setCompanyNameArray] = React.useState([{
        keyId : "1",
        keyName : "Compunnel Inc."
        },
        {
            keyId : "2",
            keyName : "Infopro Learning, Inc."
        },
        {
            keyId : "3",
            keyName : "Compunnel Healthcare"
        },
        {
            keyId : "4",
            keyName : "JobleticsPro"
        },
        {
            keyId : "5",
            keyName : "Compunnel India"
        },
        {
            keyId : "6",
            keyName : "Compunnel Canada"
        },
        {
            keyId : "7",
            keyName : "LMG Healthcare"
        },
        {
            keyId : "8",
            keyName : "Willhire Inc"
        }
  ]);
  const [activeJobData, setActiveJobData] = React.useState({
    activeIndex:0,
    activeJob:{}
  });
  const [data, setData] = React.useState({
    matchingAlert:false,
    skillsArr:[{skillName:'ios'}, {skillName:'Android'}],
  });

  
  // replace with real remote data fetching
  
  React.useLayoutEffect(() => {
    navigation.setOptions({
        headerRight: () => (
             <TouchableOpacity style={{marginRight:16}} onPress={() => {jobFilterRef.current?.setModalVisible()}}>
               <Icons name="ios-settings-outline" color={'white'} size={25,25} />
            </TouchableOpacity>
        ),
        title: 'Job matches',
    });
  }, [navigation]);
  useEffect(() => {
    navigation.addListener('focus', () => {
      getProfileDetails();
    });
    getSettingDetails();
  }, []);
  const getProfileDetails = async() => {
    let user = await AsyncStorage.getItem('loginDetails');  
    let parsed = JSON.parse(user);  
    let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
    var authToken = base64.encode(userAuthToken);    
  
    setLoading(true);
    axios ({  
      "method": "GET",
      "url": BaseUrl + EndPoints.UserProfile,
      "headers": getAuthHeader(authToken)
    })
    .then((response) => {
        if (response.data.code == 200){
          let profile = response.data.content.dataList[0];
          let empDetails = profile.empDetails;
          let skillsList = profile ? profile.skills : [];
          setSelectedSkills(getPrimarrySkills(skillsList));
          setProfileData(response.data.content.dataList[0]);
          getMyApplication(empDetails.resumeId,profile);
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
        setLoading(false);
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
  const SessionExpiredAlert = () =>{
		Alert.alert(StaticMessage.AppName,StaticMessage.SessionExpired,
			[{
			  text: 'Ok',
			  onPress: () => signOut()
		  }]
	)}
  
  const getMyApplication = async (resumeId, profile) => {
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
          records.push(product.jobId);
       });
       getMatchingJobsList(resumeId,records,profile);
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
            // Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
            //     {text: 'Ok'}
            //   ]);
        }
    })
  }
  const getMatchingJobsList = async (resumeId,oldApplication,profile) => {
    var filterDict =  {"excludeJobsById":[],
                      "jobTitle":"",
                      "primarySkill":getSkillsName( getPrimarrySkills(profile.skills)),
                      "secondarySkill":[],
                      "location":"",
                      "radius":200,
                      "assignmentType":["Fulltime","Contract to Hire"],
                      "package":{"type":"hourly","min":"0","max":"500"},
                      "jobOwnerName":[1,2,5,6,7,8],
                      "taxonomy":[]}
    filterDict = {...filterDict,"excludeJobsById":oldApplication};
    console.log('Matching Job Params: ', JSON.stringify(filterDict));
    setData({...data,isSummaryCountLoading: true});
    axios ({
        method: "POST",
        url:'https://rs.iendorseu.com/search/_a/job/matching/' + resumeId,
        headers: {
            'sdSecKey':'sda43WfR797sWQE',
            'Content-Type':'application/json'
        },
        data:filterDict
    }).then((response) => {
      console.log('Matching Job Data:', JSON.stringify(response.data));

      setLoading(false);
      if (response.data.statusCode == 200){
        setJobsArray(response.data.data.job);
      }else if (response.data.statusCode == 417){
          Alert.alert(StaticMessage.AppName, response.data.description, [
              {text: 'Ok'}
          ]);
      }
    })
    .catch((error) => {
        console.log('getMatchingJobsList',error);
        setLoading(false);
        Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg + 'getMatchingJobsList', [
        {text: 'Ok'}
      ]);
    })
  }
 
  const getPrimarrySkills = (skillsArray) => {
    if(!skillsArray){
      return [];
    }
    const primarrySkills = skillsArray.filter(skill => skill.isPrimary == 1);
    setData({...data,skillsUpdated:!data.skillsUpdated});
    return primarrySkills.length > 0 ? primarrySkills : [];
  }
  const getSecondrySkills = (skillsArray) => {
    if(!skillsArray){
      return [];
    }
    const primarrySkills = skillsArray.filter(skill => skill.isPrimary != 1);
    setData({...data,skillsUpdated:!data.skillsUpdated});
    return primarrySkills.length > 0 ? primarrySkills : [];
  }
  const getSkillsName = (skillsArray) => {
    if(skillsArray.length == 0){
      return [];
    }
    console.log(`Skills: ${JSON.stringify(skillsArray)}`);
    let result = skillsArray.map(a => a.skillName);
    return result.length > 0 ? result : [];
  }
 
  
  const getMatchingJobs = async (profileData, skillsList, isJobTitleSelected, isLocationSelected,certificateArr, employmentArr, taxonomyArray) => {
    let empDetails = profileData ? profileData.empDetails : {currentJobTitle:'',};
    let resumeId = empDetails.resumeId;
    var jobTitle = empDetails.currentJobTitle;
    if(!isJobTitleSelected){
      jobTitle = "";
    }
    setLoading(true);
    let filterDict = {  
      assignmentType:employmentArr,
      'certificate':certificateArr,
      'excludeJobsById':[],
      jobTitle: jobTitle,
      'location':isLocationSelected ? empDetails.prefferedCity[0] : '',
      'package':{'max' : 500,'min':0,'type' : 'hourly'},
      'primarySkill':getSkillsName( getPrimarrySkills(skillsList)),
      'radius':200,
      'secondarySkill':getSkillsName( getSecondrySkills(skillsList)),
      'taxonomy':taxonomyArray
    };  
    console.log('Matching Job Params: ' + JSON.stringify(filterDict));  
    axios ({
        method: "POST",
        url: `${BaseURLElastic}${EndPoints.MatchingJob}${resumeId}`,
        headers: {
            'sdSecKey':'sda43WfR797sWQE',
            'Content-Type':'application/json'
        },
        data:filterDict
    }).then((response) => {
      console.log('Matching Job Data:', JSON.stringify(response.data));

      setLoading(false);
      if (response.data.statusCode == 200){
        setJobsArray(response.data.data.job);
      }else if (response.data.statusCode == 417){
          setLoading(false);
          Alert.alert(StaticMessage.AppName, response.data.description, [
              {text: 'Ok'}
          ]);
      }
    })
    .catch((error) => {

        console.log(error);
        setLoading(false);
      Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
        {text: 'Ok'}
      ]);
    })
  }
  
  const setJobDetailsToMatchingJob = (jobIndex, jobDetail) => {
    let tempJobArray = jobsArray;
    let jobData =  tempJobArray[jobIndex];
  }

  
  function handleYup(card) {
    console.log(`Yup for ${card.text}`);
    return true; // return false if you wish to cancel the action
  }
  function handleNope(card) {
    console.log(`Nope for ${card.text}`);
    return true;
  }
  function handleMaybe(card) {
    console.log(`Maybe for ${card.text}`);
    return true;
  }
  
  const getCompanyOwnerName = (jobOwnerName) =>{
    let result = companyNameArray.filter(company => {
        return company.keyId === jobOwnerName;
    });
    if(result.length > 0){
        return result[0].keyName;
    }else{
        return 'Compunnel Software Group Inc.'
    }
  }

  const handleNotaFit = () => {
    console.log(`Active Job: ${JSON.stringify(activeJobData)}`)
    callNotAFitAPICall(jobsArray[activeJobData.activeIndex]);
  }
  const callNotAFitAPICall = async(jobDetail) => {
    let clientPrimaryKey = jobDetail.clientPrimaryKey;
    let score = jobDetail._score;

    let user = await AsyncStorage.getItem('loginDetails');  
    let parsed = JSON.parse(user);  
    let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
    var authToken = base64.encode(userAuthToken);    
  
    setLoading(true);
    axios ({  
      "method": "POST",
      "url": BaseUrl + EndPoints.NotFit,
      "headers": getAuthHeader(authToken),
      data:{'jobId':clientPrimaryKey,'matchScore': '' + score , 'fit':'No'}
    })
    .then((response) => {
      setLoading(false);
        if (response.data.code == 200){
          console.log(response.data.content);
          let tempJobArray = jobsArray;
          tempJobArray.splice(activeJobData.activeIndex,1);
          setJobsArray(tempJobArray);
          carouselRef.snapToItem(activeJobData.activeIndex == 0 ? activeJobData.activeIndex + 1 : activeJobData.activeIndex -1 );
          console.log('Matching job count:', tempJobArray.length);
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
        setLoading(false);
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
  const handleInterested = () => {
    getJobDetails(jobsArray[activeJobData.activeIndex].clientPrimaryKey);

    console.log(`Active Job: ${JSON.stringify(activeJobData)}`)
    let tempJobArray = jobsArray;
    tempJobArray.splice(activeJobData.activeIndex,1);
    setJobsArray(tempJobArray);
    carouselRef.snapToItem(activeJobData.activeIndex == 0 ? activeJobData.activeIndex + 1 : activeJobData.activeIndex -1 );
    console.log('Matching job count:', tempJobArray.length);

  }
  const getJobDetails = async (jobID) => {
    setLoading(true);

    let user = await AsyncStorage.getItem('loginDetails');  
    var token  = "U3RhZmZMaW5lQDIwMTc=";
    if(user){
        let parsed = JSON.parse(user);  
        let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
        token = base64.encode(userAuthToken);
    }
    console.log('URL:',jobID.length > 0 ? jobID : '');

    axios ({
      "method": "GET",
      "url": BaseUrl + "jobs/" + '' + jobID,
      "headers": getAuthHeader(token),
    })
    .then((response) => {
        setLoading(false);
      if (response.data.code == 200){
        console.log(response.data.content.dataList[0]);
        navigation.navigate('Job apply',{jobDetails: response.data.content.dataList[0],showParentTab:true,onClickEvent:handleViewSimilarJobs})
      }else if (response.data.code == 417){
        setLoading(false);
        const errorList = Object.values(response.data.content.messageList);
        Alert.alert(StaticMessage.AppName, errorList.join(), [
          {text: 'Ok'}
        ]);

      }else{

      }
    })
    .catch((error) => {
        setLoading(false);
        Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
            {text: 'Ok'}
        ]);
    })
}
const handleViewSimilarJobs = (clientPrimaryKey) => {
  console.log("View Similar Jobs: " + clientPrimaryKey);
  navigation.navigate('SimilarJobs',{clientPrimaryKey:clientPrimaryKey});
}

  const carouselSnap = (index) => {
    const jobDetails = jobsArray[index];
    setActiveJobData({...activeJobData,activeIndex:index, activeJob:jobDetails});
  }
  const  getSettingDetails = async() => {

		let user = await AsyncStorage.getItem('loginDetails');  
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken);

		setLoading(true);
		axios ({  
		  "method": "GET",
		  "url": BaseUrl + EndPoints.AlertSetting,
		  "headers": getAuthHeader(authToken)
		})
		.then((response) => {
		  setLoading(false);
		  if (response.data.code == 200){
        const results = JSON.stringify(response.data.content.dataList)
        let settingDetails = response.data.content.dataList;
        let result = settingDetails.find(x => x.alertTypeId === 8008);
        setData({...data,matchingAlert:result.alertStatus ? true : false})
		  }else if (response.data.code == 417){
			console.log(Object.values(response.data.content.messageList));
			const errorList = Object.values(response.data.content.messageList);
			Alert.alert(StaticMessage.AppName, errorList.join(), [
			  {text: 'Ok'}
			]);
	
		  }
		})
		.catch((error) => {
		  console.error(error);
		  setLoading(false);
		  Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
			{text: 'Ok'}
		  ]);
	
		})
	}
  
  const toggleSwitch = () => {
    // data.matchingAlert
    updateSettingDetails('8008', data.matchingAlert ? '0' : '1','', '');
    setData({...data,matchingAlert:!data.matchingAlert})

  }
  const  updateSettingDetails = async(alertTypeId,alertStatus,alertDate,alertFrequency) => {

		let user = await AsyncStorage.getItem('loginDetails');  
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken);

		let params = {
			'alertTypeId': alertTypeId,
			'alertStatus': alertStatus,
			'dateTo':alertDate,
			'alertFrequencyId': alertFrequency.length > 0 ? alertFrequency : '',
		};
		console.log('params:', JSON.stringify(params));

		setLoading(true);
		axios ({  
		  "method": "POST",
		  "url": BaseUrl + EndPoints.AlertSetting,
		  "headers": getAuthHeader(authToken),
		  data:params
		})
		.then((response) => {
		  setLoading(false);
		  if (response.data.code == 200){
			const results = JSON.stringify(response.data.content)
			console.log(`Update: ${results}`);
		  }else if (response.data.code == 417){
			console.log(Object.values(response.data.content.messageList));
			const errorList = Object.values(response.data.content.messageList);
			Alert.alert(StaticMessage.AppName, errorList.join(), [
			  {text: 'Ok'}
			]);
	
		  }
		})
		.catch((error) => {
		  console.error(error);
		  setLoading(false);
		  Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
			{text: 'Ok'}
		  ]);
	
		})
	}
  const handleHeaderSelect = (item) => {
    console.log(`Header Item : ${JSON.stringify(item)}`);
    let tempArray = selectedTaxonomy;
    if(searchHeaderKey(item.keyId)){
        let index = indexOfHeader(item.keyId,tempArray);
        console.log('Item exit at :' + index);
        tempArray.splice(index, 1);

    }else{
        console.log("Item does't exit");
        tempArray.push(item);
    }
    setSelectedTaxonomy(tempArray);
    setUpdated(!updated);
  }
  const indexOfHeader = (keyID, listArray) => {
      return listArray.findIndex(obj => obj.keyId === keyID);
  }

  const handleItemSelect = (item,taxonomyList) => {
      let selectedItem = taxonomyList.reduce((r, {keyName,keyId,child}) => {
          let o = child.filter(({keyName,keyId}) => keyId == item.keyId );
          if(o && o.length)
            r.push({keyName,keyId, child : [...o]});
          return r;
      },[]);
      let rootItemKey = selectedItem ? selectedItem[0].keyId : '';
      let mainArray = selectedTaxonomy.filter(e => e.keyId === rootItemKey);
      console.log('selectedItem:',JSON.stringify(selectedItem));
      console.log('item:',JSON.stringify(item));

      let tempArray = selectedTaxonomy;
      if(searchItemKey(item.keyId)){
          let selectedTaxoTempArr = selectedTaxonomy;
          let indexOfRoot = indexOfHeader(rootItemKey,selectedTaxoTempArr);
          const mainObjectToEdit = selectedTaxonomy[indexOfRoot];
          selectedTaxoTempArr.splice(indexOfRoot, 1);
          setSelectedTaxonomy(selectedTaxoTempArr);

          if(mainObjectToEdit.child.length > 1){
              let tempChildArray = mainObjectToEdit.child;
              let index  = indexOfHeader(item.keyId,mainObjectToEdit.child);
              tempChildArray.splice(index, 1);
              mainObjectToEdit.child = tempChildArray;
              tempArray.push(mainObjectToEdit);
          }
      }else{
          let selectedTaxoTempArr = selectedTaxonomy;

          let mainArray2 = selectedTaxonomy.filter(e => e.keyId === rootItemKey);
          if(mainArray2.length > 0){
              let indexOfRoot = indexOfHeader(rootItemKey,selectedTaxoTempArr);
              selectedTaxoTempArr.splice(indexOfRoot, 1);
              setSelectedTaxonomy(selectedTaxoTempArr);

              var tempChildArray = mainArray2[0].child;
              tempChildArray.push(item);
              mainArray2[0].child = tempChildArray;
              selectedTaxoTempArr.push(mainArray2[0]);
              setSelectedTaxonomy(selectedTaxoTempArr);
          }else{
              selectedTaxoTempArr.push(selectedItem[0]);
          }
          

      }
      setSelectedTaxonomy(tempArray);
      setUpdated(!updated);
      getMatchingJobs(profileData,tempArray, selectedData.jobTitleSelected,selectedData.isLocationSelected, selectedCertificate, selectedEmployment,tempArray);

  }
  const searchHeaderKey = (keyId) => {
      let tempTaxonomy = selectedTaxonomy;
      let result =  tempTaxonomy.find(data => data.keyId === keyId);
      if(result){
          return true;
      }
      return false;
  }; 
  const searchItemKey = (keyId) => {
      let tempTaxonomy = selectedTaxonomy;
      let result = tempTaxonomy.find(product => product.child.find(item => item.keyId === keyId));
      if(result){
          return true;
      }
      return false;
  }; 
  function arrayContains(searchKey, itemArray){
    return (itemArray.indexOf(searchKey) > -1);
  }
  
  const didSelectSkills = (item) => {
    if(selectedData.skillEdit){
      jobFilterRef.current?.setModalVisible();
      setSelectedData({...selectedData,skillEdit:false});
      navigation.navigate('Skill',{profileDetail: profileData,skillDetails:item,lookupData:null})
    }else{
      let tempArr = selectedSkills;
      let index = tempArr.indexOf(item.skillName);
      if(index >= 0){
        tempArr.splice(index, 1);
      }else{
        tempArr.push(item.skillName);
      }
      setSelectedSkills(tempArr);
      setData({...data,skillsUpdated:!data.skillsUpdated});
      getMatchingJobs(profileData,tempArr, selectedData.jobTitleSelected,selectedData.isLocationSelected, selectedCertificate, selectedEmployment,selectedTaxonomy);
    }
  }

  const didSelectCertification = (item) => {
    if(selectedData.certificateEdit){
      jobFilterRef.current?.setModalVisible()
      setSelectedData({...selectedData,certificateEdit:false});
      navigation.navigate('Edit profile',{profileDetail: profileData,lookupData:null,dataType:'Licence',licenceDict:item})    }else{
      let tempArr = selectedCertificate;
      let index = tempArr.indexOf(item.certificateExamName);
      if(index >= 0){
        tempArr.splice(index, 1);
      }else{
        tempArr.push(item.certificateExamName);
      }
      setSelectedCertificate(tempArr);
      setSelectedData({...selectedData,certificateUpdated:!data.certificateUpdated});
      console.log(`Selected Certificate: ${tempArr}`);
      getMatchingJobs(profileData,selectedSkills,selectedData.jobTitleSelected,selectedData.isLocationSelected,tempArr, selectedEmployment,selectedTaxonomy);

    }
  }

  const didSelectEmploymentType = (item) => {
    let tempArr = selectedEmployment;
    let index = tempArr.indexOf(item);
    if(index >= 0){
      tempArr.splice(index, 1);
    }else{
      tempArr.push(item);
    }
    setSelectedEmployment(tempArr);
    setSelectedData({...selectedData,employmentUpdated:!data.employmentUpdated});
    getMatchingJobs(profileData,selectedSkills,selectedData.jobTitleSelected,selectedData.isLocationSelected,selectedCertificate,tempArr,selectedTaxonomy);

  }
  const handleJobTitleSelect = () => {
    setSelectedData({...selectedData,jobTitleSelected:!selectedData.jobTitleSelected });
    getMatchingJobs(profileData,selectedSkills,!selectedData.jobTitleSelected,selectedData.isLocationSelected,selectedCertificate, selectedEmployment,selectedTaxonomy);

  }
  const handleLocationSelect = () => {
    setSelectedData({...selectedData,isLocationSelected:!selectedData.isLocationSelected });
    getMatchingJobs(profileData,selectedSkills,selectedData.jobTitleSelected,!selectedData.isLocationSelected,selectedCertificate, selectedEmployment,selectedTaxonomy);

  }
  let empDetails = profileData ? profileData.empDetails : {currentJobTitle:'',};
  let taxonomyList = profileData ? profileData.taxonomy : []; 
  let skillsList = profileData ? profileData.skills : [];
  let currentJobTitle = empDetails ? empDetails.currentJobTitle : '';
  let prefferedCityArray = empDetails ? empDetails.prefferedCity : [];
  let prefferedCity = prefferedCityArray.length > 0 ? prefferedCityArray[0] : '';
  let desiredEmployementList = empDetails ? empDetails.desiredEmployement : [];
  let certificationsList = profileData ? profileData.licensesAndCertifications : [];

  var noJobs =  "Select at least one skill or job title to see jobs matches."
  if( selectedSkills.length == 0 && !selectedData.jobTitleSelected){
    noJobs =  "Select at least one skill or job title to see jobs matches."
  }else{
    noJobs = "There are no jobs matching your exact Profile and Location.\nWe recommend trying combination of different Skills, Job title and/or expand your Location criteria to find open jobs.\n\nAdditional tips: \nYou might want try out changing Specialty and/or Employment type to see more jobs."
  }
  const getMatchedKeyList = (matchKeyStats) => {
    var skillArray = [];
    let statsArr = matchKeyStats.stats;
    for(let i= 0; i < statsArr.length ; i++){
      if(statsArr[i].count > 0){
        skillArray.push(statsArr[i].key)
      }
    }
    return skillArray;

  }
  const multiSliderValuesChange = (values) => {
    console.log(values);
    setMultiSliderValue(values);
  }
  const handleIndexChange = (index) => {
    setSelectedIndex(index);
    console.log("Index:", index);
    if(index == 0){
      setMultiSliderValue([0,120]);
    }else{
      setMultiSliderValue([0,500]);
    }
  }
  
  return (
    <View style={[styles.container]}>
      {jobsArray.length> 0 ? (
        <Carousel
          // ref ={carouselRef}
          ref={(c) => { carouselRef = c; }}
          data={jobsArray}
          sliderWidth={Dimensions.get('window').width}
          itemWidth={Dimensions.get('window').width -32}
          onSnapToItem={index => carouselSnap(index)}
          renderItem={({item, index}) =>
            <View style={{flex: 1,width:Dimensions.get('window').width-32 , marginTop:16,marginBottom:16    ,backgroundColor:'#fff',borderColor:ThemeColor.BorderColor, borderRadius:15, borderWidth:1,padding:16}}>
              <Text style={{fontFamily: FontName.Bold, fontSize:18,color:ThemeColor.TextColor, marginTop:8}}>{item.title}</Text>
              <Text style={{fontFamily: FontName.Regular, fontSize:16, color:ThemeColor.TextColor, marginTop:4}}>{getCompanyOwnerName(item.jobOwnerName)}</Text>
              <View style={{flexDirection:'row',alignItems: 'center', marginTop:4, marginLeft:-4  }}>
                <FontAwesome name="map-marker-outline" color={ThemeColor.SubTextColor } size={25,25} />
                <Text style={{fontFamily: FontName.Regular, fontSize:16, color:ThemeColor.TextColor, marginLeft:4}}>{item.cityState}</Text>
              </View>
              <ScrollView style={{marginTop:16, color:ThemeColor.SubTextColor}}>
                  <HTML  source={{ html: item.description }} contentWidth={Dimensions.get('window').width} />
              </ScrollView>
              <View style={{flexDirection:'row',paddingTop:8, height:100}}>
                  <FlatGrid
                    itemDimension={100}
                    data={getMatchedKeyList(item._matchedKeys)}
                    renderItem={({ item }) => 
                      <View  style={{borderRadius:5, borderColor:ThemeColor.BorderColor,borderWidth:1, flexDirection:'row', justifyContent:'center',paddingTop:4,paddingBottom:4,}}>
                        <Feather name="check" color={ThemeColor.BtnColor} size={16,16} />
                        <Text style={{fontSize: 12, alignSelf:'center',marginLeft:8}}>{item}</Text>
                      </View>
                    }
                  />
                  
              </View>
              
            </View>
          }
        />
      ) : (
        <View style={{padding:16, alignItems: 'center', justifyContent: 'center', flex:1}}>
          <Text style={{fontFamily: FontName.Regular, fontSize:14, color:ThemeColor.TextColor,textAlign: 'center'}}>{noJobs}</Text>
        </View>
      )}
      {jobsArray.length > 0 && 
      <View style={{ flexDirection:'row', alignItems: 'center',marginBottom:16,}}>
        <TouchableOpacity style={{flex: 1, alignItems: 'center', marginTop:8}} onPress={() => {handleNotaFit()}}>
          <Icons name="close-circle-outline" color={ThemeColor.RedColor} size={35} />
          <Text style={{fontFamily: FontName.Regular, fontSize:14, color:ThemeColor.RedColor, marginTop:4}}>NOT A FIT</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{flex:1,  alignItems: 'center'}} onPress={() => {handleInterested()}}>
          <Icons name="checkmark-circle-outline" color={ThemeColor.BtnColor} size={35} />
          <Text style={{fontFamily: FontName.Regular, fontSize:14, color:ThemeColor.BtnColor, marginTop:4}}>INTERESTED</Text>
        </TouchableOpacity>
      </View>
      }
      <Loader isLoading={isLoading} />
      <ActionSheetView ref={jobFilterRef} containerStyle={{backgroundColor:ThemeColor.ViewBgColor}}>
          <View style={{height:Dimensions.get("window").height - 120, paddingBottom:34}}>
            <View style={{height:50, flexDirection:'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft:16,paddingRight:16}}>
              <View onPress={() => {jobFilterRef.current?.setModalVisible()}}>
                <Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}></Text>
              </View>
              <Text style={{color:ThemeColor.TextColor, fontSize:16, fontFamily: FontName.Bold}}>Filter</Text>
              <TouchableOpacity onPress={() => {jobFilterRef.current?.setModalVisible()}}>
                <Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Done</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={{flex:1}}>
              <View style={{backgroundColor:'white', borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:16,paddingLeft:16 ,paddingTop:8, paddingBottom:8,justifyContent:'space-between'}}>
                <View style={{marginRight:8, flex:1}}> 
                  <Text style ={{color:ThemeColor.TextColor, fontSize:18, fontFamily:FontName.Regular}}>Matching Job alerts</Text>
                  <Text style ={{color:ThemeColor.SubTextColor, fontSize:12, fontFamily:FontName.Regular}}>Get most relevant top matching jobs based on your skills and preferred location.</Text>
                </View>
                <Switch
                  trackColor={{ false: ThemeColor.SwitchInactiveColor, true:ThemeColor.BtnColor }}
                  ios_backgroundColor = {ThemeColor.SwitchInactiveColor}
                  onValueChange={toggleSwitch}
                  thumbColor={data.matchingAlert ? "#FFF" : "#f4f3f4"}
                  value={ data.matchingAlert}
                />            
              </View>
              <View style={{backgroundColor:'white', borderRadius:5,alignItems:'center', paddingRight:16,paddingLeft:16 ,paddingTop:8, paddingBottom:8,marginTop:8}}>
                <View style={{marginRight:8, flex:1, flexDirection:'row',}}> 
                  <View style={{flex:1}}>
                    <Text style ={{color:ThemeColor.TextColor, fontSize:18, fontFamily:FontName.Regular, flex:1}}>Skills</Text>
                   {selectedSkills.length == 0 && <Text style ={{color:ThemeColor.SubTextColor, fontSize:12, fontFamily:FontName.Regular, flex:1}}>No skills selected</Text>}
                  </View>

                  {!selectedData.skillEdit ? 
                  <View style={{flexDirection:'row'}}>
                    <TouchableOpacity style={{width:25, height:25, justifyContent:'center'}} onPress={() => {setSelectedData({...selectedData,skillEdit:!selectedData.skillEdit})}}>
                      <Material name="pencil" color={ThemeColor.BtnColor} size={20,20} />
                    </TouchableOpacity>
                    <TouchableOpacity style={{width:25, height:25, marginLeft:8}} 
                      onPress={() => {
                        jobFilterRef.current?.setModalVisible()
                        navigation.navigate('Skill',{profileDetail: profileData,lookupData:{}})
                      }}>
                      <Icons name="add" color={ThemeColor.BtnColor} size={25,25} />
                    </TouchableOpacity>
                  </View> : 
                  <TouchableOpacity onPress={() => {setSelectedData({...selectedData,skillEdit:!selectedData.skillEdit})}}>
                    <Text style ={{color:ThemeColor.BtnColor, fontSize:16, fontFamily:FontName.Regular, flex:1}}>Cancel</Text>
                  </TouchableOpacity>
                  }
                </View>
                <View style={{ flex:1,flexDirection:'row',alignItems: 'center', padding:8, height:50}}>
                  <FlatList
                    style={{}}
                    horizontal
                    data={skillsList}
                    randomUpdateProp={data.skillsUpdated}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({item}) => 
                      <TouchableOpacity  style={{marginBottom:8,flexDirection:'row', alignContent:'center',justifyContent:'center' ,padding:4,paddingRight:8, paddingLeft:8,marginRight:8, borderRadius:10,borderColor:ThemeColor.BtnColor,borderWidth:1, backgroundColor:arrayContains(item.skillName,selectedSkills) ? ThemeColor.SkyBlueColor : 'white'}} onPress={() =>{didSelectSkills(item)}}>
                        <Text style={{fontSize: 14,paddingLeft:8,paddingRight:8,color:ThemeColor.BtnColor}}>{ item.skillName}</Text>
                        {item.isPrimary == 1 ? <Icons name="star" color={'orange'} size={12} /> : null}
                      </TouchableOpacity>
                    }
                  />
                </View>
              </View>

              <View style={{backgroundColor:'white', borderRadius:5,alignItems:'center', paddingRight:16,paddingLeft:16 ,paddingTop:8, paddingBottom:8,marginTop:8}}>
                <View style={{marginRight:8, flex:1, flexDirection:'row',}}> 
                  <Text style ={{color:ThemeColor.TextColor, fontSize:18, fontFamily:FontName.Regular, flex:1}}>Current job title</Text>
                  <TouchableOpacity onPress={() => {
                      jobFilterRef.current?.setModalVisible()
                      navigation.navigate('Edit profile',{profileDetail: profileData,lookupData:{},dataType:'JobTitle'})
                    }}>
                      {currentJobTitle.length > 0 ?
                        <Text style ={{color:ThemeColor.BtnColor, fontSize:16, fontFamily:FontName.Regular}}>Edit</Text> :
                        <Icons name="add" color={ThemeColor.BtnColor} size={25} />
                      }
                  </TouchableOpacity>
                </View>
                {currentJobTitle.length > 0 ? 
                <TouchableOpacity style={{ flex:1,flexDirection:'row',alignItems: 'center',marginTop:8, height:30,marginRight:8}} onPress={() => {handleJobTitleSelect()}}>
                  <Text style ={{color:currentJobTitle.length > 0 ? ThemeColor.TextColor : ThemeColor.PlaceHolderColor, fontSize:16, fontFamily:FontName.Regular, flex:1}}>{currentJobTitle.length > 0 ? currentJobTitle : 'Not provided'}</Text>
                  {selectedData.jobTitleSelected ? 
                  <Feather name="check" color={ThemeColor.BtnColor} size={22} /> : null 
                  }
                </TouchableOpacity> : null 
                }
              </View>

              <View style={{backgroundColor:'white', borderRadius:5,alignItems:'center', paddingRight:16,paddingLeft:16 ,paddingTop:8, paddingBottom:8,marginTop:8}}>
                <View style={{marginRight:8, flex:1, flexDirection:'row',}}> 
                  <Text style ={{color:ThemeColor.TextColor, fontSize:18, fontFamily:FontName.Regular, flex:1}}>Location</Text>
                  <TouchableOpacity onPress={() => {
                      jobFilterRef.current?.setModalVisible()
                      navigation.navigate('Edit profile',{profileDetail: profileData,lookupData:{},dataType:'PreferredCity',prefferedLocation:prefferedCity})
                    }}>
                    {prefferedCity.length > 0 ?
                    <Text style ={{color:ThemeColor.BtnColor, fontSize:16, fontFamily:FontName.Regular}}>Edit</Text> :
                    <Icons name="add" color={ThemeColor.BtnColor} size={25} /> 
                    }
                  </TouchableOpacity>
                </View>
                {prefferedCity.length > 0 ?
                <TouchableOpacity style={{ flex:1,flexDirection:'row',alignItems: 'center',marginTop:8, height:30,marginRight:8}} onPress={() => {handleLocationSelect()}}>
                  <Text style ={{color:prefferedCity.length > 0 ?ThemeColor.TextColor : ThemeColor.PlaceHolderColor, fontSize:16, fontFamily:FontName.Regular, flex:1}}>{prefferedCity.length > 0 ? prefferedCity : 'Not provided'}</Text>
                  {selectedData.isLocationSelected ? <Feather name="check" color={ThemeColor.BtnColor} size={22,22} /> : null }
                 </TouchableOpacity> : null 
                 }
              </View>
              <View style={{backgroundColor:'white', borderRadius:5,alignItems:'center', paddingRight:16,paddingLeft:16 ,paddingTop:8, paddingBottom:8,marginTop:8}}>
                <View style={{marginRight:8, flex:1, flexDirection:'row',}}> 
                  <Text style ={{color:ThemeColor.TextColor, fontSize:18, fontFamily:FontName.Regular, flex:1}}>Specialty</Text>
                  <TouchableOpacity onPress={() => {
                      jobFilterRef.current?.setModalVisible()
                      navigation.navigate('Speciality',{profileDetail: profileData,lookupData:null})
                    }}>
                      {taxonomyList && taxonomyList.length > 0 ?
                      <Text style ={{color:ThemeColor.BtnColor, fontSize:16, fontFamily:FontName.Regular}}>Edit</Text> :
                      <Icons name="add" color={ThemeColor.BtnColor} size={25,25} />}
                  </TouchableOpacity>
                </View>
                <View style={{ flex:1,flexDirection:'row',alignItems: 'center',marginTop:8, width:'100%'}}>
                  <FlatList
                    style={{ width:'100%'}}
                    data={taxonomyList}
                    randomUpdateProp={updated}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({item}) => 
                      <View style={{}}>
                        <TouchableOpacity style={{marginLeft:0, height:30,justifyContent:'space-between',alignItems:'center', flexDirection:'row', marginRight:8}} onPress={() => {handleHeaderSelect(item)}}>
                            <Text style={{fontFamily: FontName.Bold, fontSize:16, color:ThemeColor.TextColor,}}>{item.keyName}</Text>
                            {searchHeaderKey(item.keyId) ? <Feather name="check" color={ThemeColor.BtnColor} size={22,22} /> : null }
                        </TouchableOpacity>
                        <View style={{height:1, backgroundColor:ThemeColor.BorderColor, marginLeft:0}} />
                        <FlatList
                            style={{}}
                            data={item.child}
                            keyExtractor={(item, index) => index.toString()}
                            randomUpdateProp={updated}
                            renderItem={({item}) => 
                              <View>
                                  <TouchableOpacity style={{marginLeft:8, height:30,justifyContent:'space-between',alignItems:'center', flexDirection:'row', marginRight:8}} onPress={() => {handleItemSelect(item,taxonomyList)}}>
                                      <Text style={{fontFamily: FontName.Regular, fontSize:16, color:ThemeColor.TextColor,}}>{item.keyName}</Text>
                                      {searchItemKey(item.keyId) ? <Feather name="check" color={ThemeColor.BtnColor} size={22} /> : null }
                                  </TouchableOpacity>
                                  <View style={{height:1, backgroundColor:ThemeColor.BorderColor, marginLeft:8}} />
                              </View>
                            }
                        />
                      </View>
                    }
                  />
                </View> 
              </View>
              <View style={{backgroundColor:'white', borderRadius:5,alignItems:'center', paddingRight:16,paddingLeft:16 ,paddingTop:8, paddingBottom:8,marginTop:8}}>
                <View style={{marginRight:8, flex:1, flexDirection:'row',}}> 
                  <Text style ={{color:ThemeColor.TextColor, fontSize:18, fontFamily:FontName.Regular, flex:1}}>Certifications</Text>
                  {!selectedData.certificateEdit ? 
                  <View style={{flexDirection:'row'}}>
                    {certificationsList && certificationsList.length > 0 &&
                    <TouchableOpacity style={{width:25, height:25, justifyContent:'center'}} onPress={() => {setSelectedData({...selectedData,certificateEdit:!selectedData.certificateEdit})}}>
                      <Material name="pencil" color={ThemeColor.BtnColor} size={20} />
                    </TouchableOpacity>
                    }
                    <TouchableOpacity style={{width:25, height:25, marginLeft:8}} 
                      onPress={() => {
                        jobFilterRef.current?.setModalVisible()
                        navigation.navigate('Edit profile',{profileDetail: profileData,lookupData:null,dataType:'Licence'})
                      }}>
                      <Icons name="add" color={ThemeColor.BtnColor} size={25} />
                    </TouchableOpacity>
                  </View> : 
                  <TouchableOpacity onPress={() => {setSelectedData({...selectedData,certificateEdit:!selectedData.certificateEdit})}}>
                    <Text style ={{color:ThemeColor.BtnColor, fontSize:16, fontFamily:FontName.Regular, flex:1}}>Cancel</Text>
                  </TouchableOpacity>
                  }
                </View>
                
                <View style={{ flex:1,flexDirection:'row',alignItems: 'center'}}>
                  <FlatList
                    horizontal
                    data={certificationsList}
                    randomUpdateProp={data.certificateUpdated}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({item}) => 
                      <TouchableOpacity  style={{flexDirection:'row', alignItems:'center',justifyContent:'center' ,padding:4,paddingRight:8, paddingLeft:8,marginRight:8, borderRadius:10,borderColor:ThemeColor.BtnColor,borderWidth:1, 
                        backgroundColor:arrayContains(item.certificateExamName,selectedCertificate) ? ThemeColor.SkyBlueColor : 'white'}} onPress={() =>{didSelectCertification(item)}}>
                        <Text style={{fontSize: 14,paddingLeft:8,paddingRight:8,color:ThemeColor.BtnColor,height:25 }}>{ item.certificateExamName}</Text>
                        {item.isPrimary == 1 ? <Icons name="star" color={'orange'} size={12} /> : null}
                      </TouchableOpacity>
                    }
                  />
                </View> 
              </View>
              <View style={{backgroundColor:'white', borderRadius:5,alignItems:'center', paddingRight:16,paddingLeft:16 ,paddingTop:8, paddingBottom:8,marginTop:8}}>
                <View style={{marginRight:8, flex:1, flexDirection:'row',}}> 
                  <Text style ={{color:ThemeColor.TextColor, fontSize:18, fontFamily:FontName.Regular, flex:1}}>Employment type</Text>
                  <View style={{flexDirection:'row'}}>
                    {desiredEmployementList && desiredEmployementList.length > 0 &&
                      <TouchableOpacity style={{width:25, height:25, marginLeft:8}} onPress={() => {
                        jobFilterRef.current?.setModalVisible()
                        navigation.navigate('Desired employeement',{profileDetail: profileData,lookupData:null})
                      }}>
                        <Material name="pencil" color={ThemeColor.BtnColor} size={20} />
                    </TouchableOpacity>
                    }
                    <TouchableOpacity style={{width:25, height:25, marginLeft:8}} onPress={() => {
                        jobFilterRef.current?.setModalVisible()
                        navigation.navigate('Desired employeement',{profileDetail: profileData,lookupData:null})
                      }}>
                        <Icons name="add" color={ThemeColor.BtnColor} size={25} />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={{ flex:1,flexDirection:'row',alignItems: 'center', padding:8,height: desiredEmployementList && desiredEmployementList.length > 0 ? 50 : 0}}>
                  <FlatList
                    horizontal
                    data={desiredEmployementList}
                    randomUpdateProp={data.employmentUpdated}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({item}) => 
                      <TouchableOpacity  style={{flexDirection:'row', alignContent:'center',justifyContent:'center' ,padding:4,paddingRight:8, paddingLeft:8,marginRight:8, borderRadius:10,borderColor:ThemeColor.BtnColor,borderWidth:1, 
                        backgroundColor:arrayContains(item,selectedEmployment) ? ThemeColor.SkyBlueColor : 'white'}} onPress={() =>{didSelectEmploymentType(item)}}>
                        <Text style={{fontSize: 14,paddingLeft:8,paddingRight:8,color:ThemeColor.BtnColor}}>{ item}</Text>
                        {item.isPrimary == 1 ? <Icons name="star" color={'orange'} size={12} /> : null}
                      </TouchableOpacity>
                    }
                  />
                </View>
              </View>
              <View style={{backgroundColor:'white', borderRadius:5,alignItems:'center', paddingRight:16,paddingLeft:16 ,paddingTop:8, paddingBottom:8,marginTop:8}}>
                <View style={{marginRight:8, flex:1, flexDirection:'row',alignItems:'center'}}> 
                  <Text style ={{color:ThemeColor.TextColor, fontSize:18, fontFamily:FontName.Regular}}>Salary</Text>
                  <View style={{alignItems:'center', justifyContent:'center', height:30, flex:1}}>
                    <SegmentedControlTab
                      tabStyle ={{ borderColor: ThemeColor.BtnColor}}
                      activeTabStyle={{ backgroundColor: ThemeColor.BtnColor  }}
                      tabsContainerStyle={{ height: 30, width:'70%', tintColor:ThemeColor.BtnColor, borderColor:ThemeColor.BtnColor }}
                      values={["Annual", "Hourly"]}
                      tabTextStyle={{ color: ThemeColor.BtnColor }}
                      activeTabTextStyle={{ color: '#fff' }}
                      selectedIndex={selectedIndex}
                      onTabPress={ (index) => {handleIndexChange(index)}}
                    />
                  </View>
                </View>
                <View style={{flexDirection:'row', justifyContent:'space-between', flex:1}}>
                    <Text style={{marginLeft:8, fontFamily: FontName.Regular, fontSize:16, color:ThemeColor.TextColor, flex:1}}>{multiSliderValue[0]}</Text>
                    <Text style={{marginLeft:8, fontFamily: FontName.Regular, fontSize:16, color:ThemeColor.TextColor}}>{multiSliderValue[1]}</Text>
                </View> 
                <MultiSlider
                    values={[multiSliderValue[0], multiSliderValue[1]]}
                    sliderLength={Dimensions.get("window").width-32}
                    onValuesChange={multiSliderValuesChange}
                    min={0}
                    max={selectedIndex == 0 ? 120 : 500}
                    step={1}
                    allowOverlap
                    snapped
                /> 
                <View style={{flexDirection:'row', justifyContent:'space-between', flex:1}}>
                    <Text style={{marginLeft:8, fontFamily: FontName.Regular, fontSize:14, color:ThemeColor.TextColor, flex:1}}>$0/hr</Text>
                    <Text style={{marginLeft:8, fontFamily: FontName.Regular, fontSize:14, color:ThemeColor.TextColor}}>${`${selectedIndex == 0 ? 120 : 500}/hr`}</Text>
                </View> 
              </View>
              
            </ScrollView>            
          </View>
        </ActionSheetView>
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
          <Icons name="chatbubble-ellipses-outline" color={'white'} size={25} />
        </TouchableOpacity>
      </MovableView>
    </View>
  );
}

export default JobMatchingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:ThemeColor.ViewBgColor
  },
  card: {
    justifyContent: "center",
    alignItems: "center",
    width:300,
    height:300  
  },
  cardsText: {
    fontSize: 22,
  },item: {
    padding: 4,
    marginVertical: 4,
    marginHorizontal: 8,
    borderRadius:5,
    borderColor:ThemeColor.BtnColor,
    borderWidth:1,
  },
});