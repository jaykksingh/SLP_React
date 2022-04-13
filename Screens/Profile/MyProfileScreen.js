/* eslint-disable react/display-name */
import React,{useEffect,useState,useRef} from "react";
import { StatusBar, 
    Text, 
    View,
    StyleSheet,
    TouchableOpacity,
    Image,
    SectionList,
    SafeAreaView,
    FlatList,
    Alert
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'
import axios from 'axios'
import * as ImagePicker from 'react-native-image-picker';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import MovableView from 'react-native-movable-view';
import Icon from 'react-native-vector-icons/Ionicons';
import RNFS from 'react-native-fs';
import FileViewer from "react-native-file-viewer";
import ActionSheet from 'react-native-actionsheet'

import { BaseUrl, EndPoints, StaticMessage,ThemeColor, FontName } from '../../_helpers/constants';
import {getAuthHeader} from '../../_helpers/auth-header';
import Loader from '../../Components/Loader';
import { AuthContext } from '../../Components/context';

const MyProfileScreen = ({route,navigation}) => {

  let [profileData, setProfileData] = React.useState({
    empDetails:{
      careerProfile:'',
      currentJobTitle:'',
      industryVertical:'',
      totalExp:'',
      currentJobTitle:'',
      currentLocation: '',
      jobSearchStatus:'',
      country:'',
      state:'',
      city:'',
      zipCode:'',
      domain:'',
      subDomain:'',
      profilePicture:'',
      availability:'',
      authorisationStatus:'',
      prefferedCity:[],
      departmentName:'',
      skillName:'',
      roleName:'',
      desiredEmployement:[],
      annualSalary:'',
      contractRate:'',
    },
    experiences:[],
    educations:[],
    documents:[],
    resume:[],
    licensesAndCertifications:[],
    skills:[],
    candidateAchievements:[],
    taxonomy:[],

  });
  let [isLoading, setIsLoading] = React.useState(false);
  const [pickedImage, setPickedImage] = useState('');
  const [lookupData, setLookupData] = useState({});
	const { signOut } = React.useContext(AuthContext);
  const actionSheetImage = useRef();

  useEffect(() => {
    getUserLookups();
    navigation.addListener('focus', () => {
      getProfileDetails();
    });
  }, []);

  const getProfileDetails = async() => {
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
        setIsLoading(false);
        if (response.data.code == 200){
            setProfileData(response.data.content.dataList[0]);
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
  const SessionExpiredAlert = () =>{
		Alert.alert(StaticMessage.AppName,StaticMessage.SessionExpired,
			[{
			  text: 'Ok',
			  onPress: () => signOut()
		  }]
	)}
  const  getUserLookups = async() => {
    let user = await AsyncStorage.getItem('loginDetails');  
    let parsed = JSON.parse(user);  
    let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
    var authToken = base64.encode(userAuthToken);

    setIsLoading(true);
    axios ({  
      "method": "GET",
      "url": BaseUrl + EndPoints.UserLookups,
      "headers": getAuthHeader(authToken)
    })
    .then((response) => {
      if (response.data.code == 200){
        setIsLoading(false);
        setLookupData(response.data.content.dataList[0]);
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
  const handleDeleteData = (item, type) => {
    Alert.alert(StaticMessage.AppName,'Are sure want to delete?',
        [{
          	text: 'Cancel',
        },
		    {
            text: 'Delete',
            onPress: () => handleDeleteProfileData(item,type)
        }]
      )
  }
  const  handleDeleteProfileData = async(item, type) => {
    let user = await AsyncStorage.getItem('loginDetails');  
    let parsed = JSON.parse(user);  
    let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
    var authToken = base64.encode(userAuthToken);
    var params ={};
    if(type == 'RESUME'){
      params ={'candidateDocId':item.candidateDocId};
    }else if(type == 'DOCUMENT'){
      params ={'candidateDocId':item.candidateDocId};
    }
    setIsLoading(true);
    axios ({  
      "method": "DELETE",
      "url": BaseUrl + EndPoints.UserProfile,
      "headers": getAuthHeader(authToken),
      data:params
    })
    .then((response) => {
      if (response.data.code == 200){
        setIsLoading(false);
        getProfileDetails();
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
  
  const showProfileImagePicker = () => {
    Alert.alert('Choose option','',
        [
		    {
            text: 'Choose from gallery',
            onPress: () => imageGalleryLaunch()
        },{
          text: 'Take picture',
          onPress: () => cameraLaunch()
        },{
          text: 'Cancel',
        }]
      )
  }
  const showActionSheet = () => {
    actionSheetImage.current.show();
  }
  const handleActionsheet = (index) => {
    if(index == 0){
      imageGalleryLaunch();
    }else if(index == 1){
      cameraLaunch();
    }
  }
    
    const imageGalleryLaunch = () => {
  
      let options = {
        storageOptions: {
          skipBackup: true,
          path: 'images',
        },maxWidth: 500,
        maxHeight: 500,
        quality: 0.5
      };
    
      ImagePicker.launchImageLibrary(options, async(res) => {
        console.log('Response = ', res);
    
        if (res.didCancel) {
          console.log('User cancelled image picker');
        } else if (res.error) {
          console.log('ImagePicker Error: ', res.error);
        } else if (res.customButton) {
          console.log('User tapped custom button: ', res.customButton);
          alert(res.customButton);
        } else {
          console.log('response', JSON.stringify(res));
          setPickedImage(res.assets[0].uri);
          var base64data = await RNFS.readFile( res.assets[0].uri, 'base64').then(res => { return res });
          updateProfilePicture(base64data);
  
        }
      });
    }
    const cameraLaunch = () => {
      let options = {
        storageOptions: {
          skipBackup: true,
          path: 'images',
        },maxWidth: 500,
        maxHeight: 500,
        quality: 0.5
      };
      ImagePicker.launchCamera(options, async (res) => {
        console.log('Response = ', res);
  
        if (res.didCancel) {
          console.log('User cancelled image picker');
        } else if (res.error) {
          console.log('ImagePicker Error: ', res.error);
        } else if (res.customButton) {
          console.log('User tapped custom button: ', res.customButton);
          alert(res.customButton);
        } else {
          const source = { uri: res.uri };
          console.log('response', JSON.stringify(res));
          setPickedImage(res.assets[0].uri);
          var base64data = await RNFS.readFile( res.assets[0].uri, 'base64').then(res => { return res });
          updateProfilePicture(base64data);
        }
      });
  }
  const  updateProfilePicture = async(imageBase64) => {
    let user = await AsyncStorage.getItem('loginDetails');  
    let parsed = JSON.parse(user);  
    let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
    var authToken = base64.encode(userAuthToken);

    setIsLoading(true);
    const params = {
        "profilePicture":imageBase64
    }
    axios ({  
      "method": "PUT",
      "url": BaseUrl + EndPoints.UserProfile,
      "headers": getAuthHeader(authToken),
      data:{'empDetails':params}
    })
    .then((response) => {
      if (response.data.code == 200){
        setIsLoading(false);
        getProfileDetails();
        route.params.onClickEvent();
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
      console.log(error);
      setIsLoading(false);
      Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
        {text: 'Ok'}
      ]);

    })
  }

  

  const empDetails =  profileData.empDetails;
  let industryVertical = empDetails ? empDetails.industryVertical : '';
  let profileImageUrl = empDetails ? empDetails.profilePicture : '';
  let userName = empDetails ? empDetails.firstName + ' ' + empDetails.lastName : '';
  let totalExp = empDetails ? empDetails.totalExp : '';
  let currentJobTitle = empDetails ? empDetails.currentJobTitle : '';
  var exp = totalExp;
  if(currentJobTitle.length > 0){
    if(exp.length > 0){
      exp = exp + ' | ' + currentJobTitle;
    }else{
      exp= currentJobTitle;
    }
  }
  let availability = empDetails ? empDetails.availability : '';
  let authorisationStatus = empDetails ? empDetails.authorisationStatus : '';
  let jobSearchStatus = empDetails ? empDetails.jobSearchStatus : '';
  var statusText = authorisationStatus;
  if(jobSearchStatus.length > 0){
    if(statusText.length > 0){
      statusText = statusText + ' | ' + jobSearchStatus;
    }else{
      exp= jobSearchStatus;
    }
  }
  let currentLocation = empDetails ? empDetails.currentLocation : '';
  let city = empDetails ? empDetails.city : '';
  let state = empDetails ? empDetails.state : '';
  let country = empDetails ? empDetails.country : '';
  let zipCode = empDetails ? empDetails.zipCode : '';
  var address = currentLocation;

  if(city.length > 0){
    if(address.length > 0){
      address = address + ", " + city;
    }else{
      address = city;
    }
  }
  if(state.length > 0){
    if(address.length > 0){
      address = address + ", " + state;
    }else{
      address = state;
    }
  }
  if(country.length > 0){
    if(address.length > 0){
      address = address + ", " + country;
    }else{
      address = country;
    }
  }
  if(zipCode.length > 0){
    if(address.length > 0){
      address = address + " - " + zipCode;
    }else{
      address = zipCode;
    }
  }
  let profileStrength = empDetails ? empDetails.profileStrength : 0;
  let domain = empDetails ? empDetails.domain : '';
  let subDomain = empDetails ? empDetails.subDomain : '';
  if(subDomain.length > 0){
    domain = `${domain} [ ${subDomain} ]`;
  }
  
  const viewResume = (resume) => {
    console.log('resume:', resume.filePath);
    let url =  resume.filePath;
		const extension = url.split(/[#?]/)[0].split(".").pop().trim();
		const localFile = `${RNFS.DocumentDirectoryPath}/temporaryfile.${extension}`;
		const options = {
			fromUrl: url,
			toFile: localFile,
		};
		RNFS.downloadFile(options)
		.promise.then(() => FileViewer.open(localFile,{ showOpenWithDialog: true }))
		.then(() => {
			console.log('View Sucess')
		})
		.catch((error) => {
			console.log('View Failed',error)
		});
   
  }

  const handleAddButton = (title) => {
    if(title == 'Basic summary'){
      navigation.navigate('Edit profile',{profileDetail:profileData,dataType:'Summary',lookupData:lookupData});
    }else if (title == 'Domain' || title == 'Role' || title == 'Primary skills'){
      navigation.navigate('Domain',{profileDetail: profileData,lookupData:lookupData});
    }else if (title == 'Functional area/department'){
      navigation.navigate('Funtional area',{profileDetail: profileData,lookupData:lookupData});
    }else if (title == 'Desired salary'){
      navigation.navigate('Desired salary',{profileDetail: profileData,lookupData:lookupData})
    }else if(title == 'Education'){
      navigation.navigate('AddEducation',{profileDetail: profileData,lookupData:lookupData});
    }else if(title == 'Preferred city'){
      navigation.navigate('Edit profile',{profileDetail: profileData,lookupData:lookupData,dataType:'PreferredCity'})
    }else if (title == 'Work experience'){
      navigation.navigate('Experience',{profileDetail: profileData,lookupData:lookupData});
    }else if (title == 'Skills'){
      navigation.navigate('Skill',{profileDetail: profileData,lookupData:lookupData})
    }else if (title == 'Documents'){
      navigation.navigate('AddDocument',{profileDetail: profileData,lookupData:lookupData,fileType:'DOC'})
    }else if (title == 'Resume'){
      navigation.navigate('AddDocument',{profileDetail: profileData,lookupData:lookupData,fileType:'RESUME'})
    }else if (title == 'Licence / Certifications'){
      navigation.navigate('Edit profile',{profileDetail: profileData,lookupData:lookupData,dataType:'Licence'})
    }else if(title == 'Achievements'){
      navigation.navigate('Edit profile',{profileDetail: profileData,lookupData:lookupData,dataType:'Achievements'})
    }else if(title == 'Speciality'){
      navigation.navigate('Speciality',{profileDetail: profileData,lookupData:lookupData})
    }

  }

  const handleSocialBtn = () => {
    const empDetails =  profileData.empDetails;
    let message = `Linkedin: ${empDetails.linkedIn}\n Twitter: ${empDetails.twitter}`
    Alert.alert(StaticMessage.AppName, message, [
      {text: 'Ok'}
    ]);
  }
  const handleEmailBtn = () => {
    const empDetails =  profileData.empDetails;
    let message = `Email Id: ${empDetails.emailId}`
    Alert.alert(StaticMessage.AppName, message, [
      {text: 'Ok'}
    ]);
  }
  const handleCallBtn = () => {
    const empDetails =  profileData.empDetails;
    let message = `Contact: +${empDetails.contactNumberCountryCode} ${empDetails.contactNumber}`
    Alert.alert(StaticMessage.AppName, message, [
      {text: 'Ok'}
    ]);
  }
  const handleAchivementHelp = () => {
    let message = 'Please add any relevant publications, certifications, patents, courses, project, honors and awards, test scores, or languages you would like to include.';
    Alert.alert(StaticMessage.AppName, message, [
      {text: 'Ok'}
    ]);
  }
  const getFileExtention = (item) => {
    let filename = item.filePath;
    return filename.split('.').pop();
  } 
  

  const employementDetails = profileData ? profileData.employeementDetails : '';
  console.log(`Resume: ${JSON.stringify(profileData.resume)}`);
  return (
    <SafeAreaView style={styles.container}>
      <SectionList style={{marginBottom:0}}
        sections={[
          {
            title: "Profile",
            data: []
          },
          {
            title: "Basic summary",
            data: empDetails.careerProfile.length > 0 ? [empDetails.careerProfile] : []
          },
          {
            title: "Domain",
            data: ["French Fries"]
          },
          {
            title: "Role",
            data: ["Water"]
          },{
            title: "Primary skills",
            data: ["Water"]
          },{
            title: "Functional area/department",
            data: ["Water"]
          },
          {
            title: "Desired employment",
            data: ["Cheese Cake"]
          },
          {
            title: "Desired salary",
            data: ["Cheese Cake"]
          },
          {
            title: "Speciality",
            data: profileData.taxonomy
          },
          {
            title: "Education",
            data: profileData.educations
          },{
            title: "Preferred city",
            data: empDetails.prefferedCity
          },{
            title: "Work experience",
            data: profileData.experiences
          },{
            title: "Documents",
            data: profileData.documents
          },{
            title: "Resume",
            data: profileData.resume
          },{
            title: "Licence / Certifications",
            data: profileData.licensesAndCertifications
          },{
            title: "Employment details",
            data: [profileData.employeementDetails]
          },{
            title: "Skills",
            data: profileData.skills
          },{
            title: "Achievements",
            data: profileData.candidateAchievements
          },
          
        ]}
        keyExtractor={(item, index) => item + index}
        stickySectionHeadersEnabled={false}
        renderItem={({ item , index,section}) => 
          <View style={{backgroundColor:'white',marginLeft:16, marginRight:16,}}>
            {section.title == 'Basic summary' ? 
              <TouchableOpacity  style={{ backgroundColor:'#fff',justifyContent: 'center', flexDirection:'row', marginRight:8, alignItems: 'center'}} onPress={() => {navigation.navigate('Edit profile',{profileDetail:profileData,lookupData:lookupData,dataType:'Summary'})}}>
                <Text style={{marginLeft:8, marginRight:8, fontFamily: FontName.Regular, fontSize:14, color:ThemeColor.TextColor, paddingTop:8, paddingBottom:16, flex:1}}>{empDetails ? empDetails.careerProfile : ''}</Text>
                <Feather name="chevron-right" color={'gray'} size={25} />
              </TouchableOpacity> : null
            }
            {section.title == 'Domain' ? 
              <TouchableOpacity  style={{ backgroundColor:'#fff',justifyContent: 'center', flexDirection:'row', marginRight:8,alignItems: 'center'}} onPress={() => {navigation.navigate('Domain',{profileDetail: profileData,lookupData:lookupData})}}>
                <Text style={{marginLeft:8, marginRight:8, fontFamily: FontName.Regular, fontSize:14, color:ThemeColor.TextColor, paddingTop:8, paddingBottom:16, flex:1}}>{domain}</Text>
                <Feather name="chevron-right" color={'gray'} size={25} />
              </TouchableOpacity> : null
            }
            {section.title == 'Role' && empDetails.roleName.length > 0 ? 
            <TouchableOpacity  style={{ backgroundColor:'#fff',justifyContent: 'center', flexDirection:'row', marginRight:8,alignItems: 'center'}} onPress={() => {navigation.navigate('Domain',{profileDetail: profileData,lookupData:lookupData})}}>
              <Text style={{marginLeft:8, marginRight:8, fontFamily: FontName.Regular, fontSize:14, color:ThemeColor.TextColor, paddingTop:8, paddingBottom:16, flex:1}}>{empDetails ? empDetails.roleName : ''}</Text>
              <Feather name="chevron-right" color={'gray'} size={25} />
            </TouchableOpacity> : null
            }
            {section.title == 'Primary skills' && empDetails.skillName ? 
            <TouchableOpacity  style={{ backgroundColor:'#fff',justifyContent: 'center', flexDirection:'row', marginRight:8,alignItems: 'center'}} onPress={() => {navigation.navigate('Domain',{profileDetail: profileData,lookupData:lookupData})}}>
              <Text style={{marginLeft:8, marginRight:8, fontFamily: FontName.Regular, fontSize:14, color:ThemeColor.TextColor, paddingTop:8, paddingBottom:16, flex:1}}>{empDetails ? empDetails.skillName : ''}</Text>
              <Feather name="chevron-right" color={'gray'} size={25,25} />
            </TouchableOpacity> : null
            }
            {section.title == 'Functional area/department' && empDetails.departmentName ? 
            <TouchableOpacity  style={{ backgroundColor:'#fff',justifyContent: 'center', flexDirection:'row', marginRight:8,alignItems: 'center'}} onPress={() => {navigation.navigate('Funtional area',{profileDetail: profileData,lookupData:lookupData})}}>
              <Text style={{marginLeft:8, marginRight:8, fontFamily: FontName.Regular, fontSize:14, color:ThemeColor.TextColor, paddingTop:8, paddingBottom:16, flex:1}}>{empDetails ? empDetails.departmentName : ''}</Text>
              <Feather name="chevron-right" color={'gray'} size={25,25} />
            </TouchableOpacity> : null
            }
            {section.title == 'Desired employment' && empDetails.desiredEmployement.length > 0 ? 
              <TouchableOpacity  style={{ backgroundColor:'#fff',justifyContent: 'center', flexDirection:'row', marginRight:8,alignItems: 'center'}} onPress={() => {navigation.navigate('Desired employeement',{profileDetail: profileData,lookupData:lookupData})}}>
                <Text style={{marginLeft:8, marginRight:8, fontFamily: FontName.Regular, fontSize:14, color:ThemeColor.TextColor, paddingTop:8, paddingBottom:16, flex:1}}>{empDetails ? empDetails.desiredEmployement.join(', ') : ''}</Text>
                <Feather name="chevron-right" color={'gray'} size={25,25} />
              </TouchableOpacity> : null
            }
            {section.title == 'Desired salary' && empDetails.annualSalary? 
              <TouchableOpacity  style={{ backgroundColor:'#fff',justifyContent: 'center', flexDirection:'row', marginRight:8,alignItems: 'center'}} onPress={() => {navigation.navigate('Desired salary',{profileDetail: profileData,lookupData:lookupData})}}>
                <View style={{flex:1,marginLeft:8, marginRight:8,paddingTop:8, paddingBottom:16,}}>
                  <Text style={{height:20, fontFamily: FontName.Regular, fontSize:14, color:ThemeColor.TextColor,  flex:1}}>${empDetails ? empDetails.annualSalary + ' Per annum' : ''}</Text>
                  <Text style={{height:20,fontFamily: FontName.Regular, fontSize:14, color:ThemeColor.TextColor, flex:1}}>${empDetails ? empDetails.contractRate + ' ' + empDetails.contractRateType: ''}</Text>
                </View>
                <Feather name="chevron-right" color={'gray'} size={25,25} />
              </TouchableOpacity> : null
            }
            {section.title == 'Speciality' ? 
              <View>
                <TouchableOpacity  style={{ backgroundColor:'white',justifyContent: 'center', flexDirection:'row', marginRight:8,alignItems: 'center'}} onPress={() => {navigation.navigate('Speciality',{profileDetail: profileData,lookupData:lookupData})}}>
                  <View style={{flex:1,marginLeft:8, marginRight:8,paddingTop:8, paddingBottom:8,justifyContent: 'center'}}>
                    <Text style={{height:20, fontFamily: FontName.Regular, fontSize:14, color:ThemeColor.TextColor,}}>{item.keyName}</Text>
                  </View>
                  <Feather name="chevron-right" color={'gray'} size={25,25} />
                </TouchableOpacity>
                <View style={{height:1, backgroundColor:ThemeColor.BorderColor, marginLeft:8 }} />
                <FlatList
                  data={item.child}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({item}) => 
                    <View style={{flex:1,marginLeft:24, height:30}}>
                      <Text style={{height:20, fontFamily: FontName.Regular, fontSize:14, color:ThemeColor.SubTextColor,  flex:1, marginTop:4}}>{item.keyName}</Text>
                      <View style={{height:1, backgroundColor:ThemeColor.BorderColor}} />
                    </View>
                  }
                />
              </View> : null
            }
            {section.title == 'Education' ? 
              <View> 
                <TouchableOpacity style={{padding:8,paddingRight:0, backgroundColor:'#fff',justifyContent: 'center', flexDirection:'row', marginRight:8,alignItems: 'center'}} onPress={() => {navigation.navigate('AddEducation',{profileDetail: profileData,educationDetails:item,lookupData:lookupData})}}>
                  <View style={{flex:1}}>
                    <Text style={{height:20, fontFamily: FontName.Regular, fontSize:16, color:ThemeColor.TextColor,  flex:1}}>{item.institutionName}</Text>
                    <Text style={{height:20,fontFamily: FontName.Regular, fontSize:14, color:ThemeColor.TextColor, flex:1}}>{item.qualification} - {item.passingYear}</Text>
                  </View>
                  <Feather name="chevron-right" color={'gray'} size={25,25} />
                </TouchableOpacity>
                <View style={{height:1, backgroundColor:ThemeColor.BorderColor, marginLeft:12}} />
              </View>
            : null}
            {section.title == 'Preferred city' ? 
              <View> 
                <TouchableOpacity style={{padding:8,paddingRight:0, backgroundColor:'#fff',justifyContent: 'center', flexDirection:'row', marginRight:8,alignItems: 'center'}} onPress={() =>{navigation.navigate('Edit profile',{profileDetail: profileData,lookupData:lookupData,prefferedLocation:item,dataType:'PreferredCity'})}}>
                  <View style={{flex:1}}>
                    <Text style={{height:20, fontFamily: FontName.Regular, fontSize:16, color:ThemeColor.TextColor,  flex:1}}>{item}</Text>
                  </View>
                  <Feather name="chevron-right" color={'gray'} size={25,25} />
                </TouchableOpacity>
                <View style={{height:1, backgroundColor:ThemeColor.BorderColor, marginLeft:12}} />
              </View>
            : null}
            {section.title == 'Work experience' ? 
              <View> 
                <TouchableOpacity style={{padding:8,paddingRight:0, backgroundColor:'#fff',justifyContent: 'center', flexDirection:'row', marginRight:8,alignItems: 'center'}} onPress={() => {navigation.navigate('Experience',{profileDetail: profileData,experienceDetails:item,lookupData:lookupData})}}>
                  <View style={{flex:1}}>
                    <Text style={{height:20, fontFamily: FontName.Regular, fontSize:16, color:ThemeColor.TextColor,  flex:1}}>{item.positionTitle}</Text>
                    <Text style={{height:20,fontFamily: FontName.Regular, fontSize:14, color:ThemeColor.TextColor, flex:1}}>{item.employerName}</Text>
                    <Text style={{height:20,fontFamily: FontName.Regular, fontSize:14, color:ThemeColor.TextColor, flex:1}}>{item.positionStartDate} - {item.positionEndDate ? item.positionEndDate : 'Present'}</Text>
                  </View>
                  <Feather name="chevron-right" color={'gray'} size={25} />
                </TouchableOpacity>
                <View style={{height:1, backgroundColor:ThemeColor.BorderColor, marginLeft:12}} />
              </View>
 
            : null}
            
            {section.title == 'Documents' ? 
              <View> 
                <View style={{padding:8,paddingRight:0, backgroundColor:'#fff',justifyContent: 'center', flexDirection:'row', marginRight:8,alignItems: 'center'}}>
                  <TouchableOpacity style={{flex:1, flexDirection:'row', alignItems: 'center'}} onPress={() => {viewResume(item)}}>
                    {
                      getFileExtention(item) == 'docx' ? <Image style={{width: 25,height: 25, tintColor:ThemeColor.NavColor}} source={require('../../assets/Images/icon_doc.png')} /> 
                      : getFileExtention(item) == 'pdf' ? <Image style={{width: 25,height: 25, tintColor:ThemeColor.NavColor}} source={require('../../assets/Images/icon_pdf.png')} /> : 
                      <Image style={{width: 25,height: 25, tintColor:ThemeColor.NavColor}} source={require('../../assets/Images/icon_txt.png')} />
                    }                    
                    <Text style={{marginLeft:8, fontFamily: FontName.Regular, fontSize:16, color:ThemeColor.TextColor,  flex:1}}>{item.fileName}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={{height:40, width:40, justifyContent:'center', alignItems: 'center'}} onPress={() => {handleDeleteData(item,'DOCUMENT')}}>
                    <Ionicons name="trash-outline" color={'gray'} size={20} />
                  </TouchableOpacity>
                </View>
                <View style={{height:1, backgroundColor:ThemeColor.BorderColor, marginLeft:12}} />
              </View>
            : null}
            {section.title == 'Resume' ? 
              <View> 
                <View style={{padding:8,paddingRight:0, backgroundColor:'#fff',justifyContent: 'center', flexDirection:'row',alignItems: 'center'}} >
                  <TouchableOpacity style={{flex:1, flexDirection:'row', alignItems: 'center'}} onPress={() => {viewResume(item)}}>
                    {
                      getFileExtention(item) == 'docx' ? <Image style={{width: 25,height: 25, tintColor:ThemeColor.NavColor}} source={require('../../assets/Images/icon_doc.png')} /> 
                      : getFileExtention(item) == 'pdf' ? <Image style={{width: 25,height: 25, tintColor:ThemeColor.NavColor}} source={require('../../assets/Images/icon_pdf.png')} /> : 
                      <Image style={{width: 25,height: 25, tintColor:ThemeColor.NavColor}} source={require('../../assets/Images/icon_txt.png')} />
                    }
                    <Text style={{marginLeft:8, fontFamily: FontName.Regular, fontSize:16, color:ThemeColor.TextColor,  flex:1}}>{item.fileName}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={{height:40, width:40, justifyContent:'center', alignItems: 'center'}} onPress={() => {handleDeleteData(item,'RESUME')}}>
                    <Ionicons name="trash-outline" color={'gray'} size={20,20} />
                  </TouchableOpacity>
                </View>
                <View style={{height:1, backgroundColor:ThemeColor.BorderColor, marginLeft:12}} />
              </View>
            : null}
            {section.title == 'Licence / Certifications' ? 
             <View>
                <TouchableOpacity  style={{ backgroundColor:'#fff',justifyContent: 'center', flexDirection:'row', marginRight:8,alignItems: 'center'}} 
                  onPress={() =>{navigation.navigate('Edit profile',{profileDetail: profileData,lookupData:lookupData,dataType:'Licence',licenceDict:item})}}>
                  <Text style={{marginLeft:16, marginRight:8, fontFamily: FontName.Regular, fontSize:14, color:ThemeColor.TextColor, paddingTop:8, paddingBottom:16, flex:1}}>{item.certificateExamName}</Text>
                  <Feather name="chevron-right" color={'gray'} size={25,25} />
                </TouchableOpacity>
                <View style={{height:1, backgroundColor:ThemeColor.BorderColor, marginLeft:16}} />
              </View> : null
            }
            {section.title == 'Employment details' ? 
              <View  style={{ backgroundColor:'#fff', marginRight:8, marginBottom:16,paddingLeft:16, paddingTop:8}}>
                <View>
                  <Text style={{fontFamily: FontName.Regular, fontSize:14, color:ThemeColor.SubTextColor}}>Reporting manager</Text>
                  <Text style={{fontFamily: FontName.Regular, fontSize:16, color:ThemeColor.TextColor}}>{employementDetails ? employementDetails.ReportingManager : 'Not available'}</Text>
                  <View style={{height:1, backgroundColor:ThemeColor.BorderColor, marginTop:8}} />
                </View>
                <View style={{marginTop:8}}>
                  <Text style={{fontFamily: FontName.Regular, fontSize:14, color:ThemeColor.SubTextColor}}>Division head</Text>
                  <Text style={{fontFamily: FontName.Regular, fontSize:16, color:ThemeColor.TextColor}}>{employementDetails ? employementDetails.DivisionHead : 'Not available'}</Text>
                  <View style={{height:1, backgroundColor:ThemeColor.BorderColor, marginTop:8}} />
                </View>
                <View style={{marginTop:8}}>
                  <Text style={{fontFamily: FontName.Regular, fontSize:14, color:ThemeColor.SubTextColor}}>Working location</Text>
                  <Text style={{fontFamily: FontName.Regular, fontSize:16, color:ThemeColor.TextColor}}>{employementDetails ? employementDetails.WorkingLocation : 'Not available'}</Text>
                  <View style={{height:1, backgroundColor:ThemeColor.BorderColor, marginTop:8}} />
                </View>
                <View style={{marginTop:8}}>
                  <Text style={{fontFamily: FontName.Regular, fontSize:14, color:ThemeColor.SubTextColor}}>Daily working hours</Text>
                  <Text style={{fontFamily: FontName.Regular, fontSize:16, color:ThemeColor.TextColor}}>{employementDetails ? employementDetails.DailyWorkingHours : 'Not available'}</Text>
                  <View style={{height:1, backgroundColor:ThemeColor.BorderColor, marginTop:8}} />
                </View>
                <View style={{marginTop:8}}>
                  <Text style={{fontFamily: FontName.Regular, fontSize:14, color:ThemeColor.SubTextColor}}>Grade</Text>
                  <Text style={{fontFamily: FontName.Regular, fontSize:16, color:ThemeColor.TextColor}}>{employementDetails ? employementDetails.Grade : 'Not available'}</Text>
                  <View style={{height:1, backgroundColor:ThemeColor.BorderColor, marginTop:8}} />
                </View>
                <View style={{marginTop:8}}>
                  <Text style={{fontFamily: FontName.Regular, fontSize:14, color:ThemeColor.SubTextColor}}>Working shift</Text>
                  <Text style={{fontFamily: FontName.Regular, fontSize:16, color:ThemeColor.TextColor}}>{employementDetails ? employementDetails.WorkingShift : 'Not available'}</Text>
                  <View style={{height:1, backgroundColor:ThemeColor.BorderColor, marginTop:8}} />
                </View>
                <View style={{marginTop:8}}>
                  <Text style={{fontFamily: FontName.Regular, fontSize:14, color:ThemeColor.SubTextColor}}>Employment status</Text>
                  <Text style={{fontFamily: FontName.Regular, fontSize:16, color:ThemeColor.TextColor}}>{employementDetails ? employementDetails.EmploymentStatus : 'Not available'}</Text>
                  <View style={{height:1, backgroundColor:ThemeColor.BorderColor, marginTop:8}} />
                </View>
                <View style={{marginTop:8}}>
                  <Text style={{fontFamily: FontName.Regular, fontSize:14, color:ThemeColor.SubTextColor}}>Designation</Text>
                  <Text style={{fontFamily: FontName.Regular, fontSize:16, color:ThemeColor.TextColor}}>{employementDetails ? employementDetails.Designation : 'Not available'}</Text>
                </View>
              </View> : null
            }
            {section.title == 'Skills' ? 
              <TouchableOpacity style={{alignContent:'center', backgroundColor:'#fff'}} onPress={() => {navigation.navigate('Skill',{profileDetail: profileData,skillDetails:item,lookupData:lookupData})}}>
                <View style={{flexDirection:'row', alignItems:'center', paddingRight:8}}>
                  <View style={{paddingLeft:16,paddingTop:8, flex:1,marginRight:4}}>
                      <Text style={{flex: 1, fontFamily: FontName.Regular, fontSize:16,color:ThemeColor.TextColor, marginBottom:4}}>{item.skillName}</Text>
                      <Text style={{fontFamily: FontName.Regular, fontSize:12, color:ThemeColor.TextColor, marginBottom:4}}>Experience: {item.yearExp} year</Text>
                  </View>
                  <View style={{flexDirection:'row', alignItems: 'center', justifyContent: 'center'}}>
                    {item.isPrimary == 1 &&  <View style={{ backgroundColor:ThemeColor.BorderColor,borderRadius:3 }}>
                      <Text style={{fontFamily: FontName.Regular, fontSize:10, color:ThemeColor.TextColor,padding:4}}>Primary</Text>
                    </View> }
                    <Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22,22} />
                  </View>
                </View>
                <View style={{marginLeft:16,flex: 1,height:1, backgroundColor:ThemeColor.BorderColor, marginTop:4, marginBottom:1}}/>
              </TouchableOpacity> : null
            }
            {section.title == 'Achievements' ? 
              <View>
                <TouchableOpacity  style={{ backgroundColor:'#fff',justifyContent: 'center', flexDirection:'row', marginRight:8,alignItems: 'center'}} onPress={() =>{navigation.navigate('Edit profile',{profileDetail: profileData,lookupData:lookupData,dataType:'Achievements',achievementDict:item})}}>
                <Text style={{marginLeft:16, marginRight:8, fontFamily: FontName.Regular, fontSize:14, color:ThemeColor.TextColor, paddingTop:8, paddingBottom:16, flex:1}}>{item.description}</Text>
                <Feather name="chevron-right" color={'gray'} size={25,25} />
              </TouchableOpacity>
              <View style={{marginLeft:16,flex: 1,height:1, backgroundColor:ThemeColor.BorderColor, marginTop:4, marginBottom:1}}/>
              </View> : null
            }

          </View>
        }
        renderSectionHeader={({ section: { title },index }) => (
          <View>
            {title == 'Profile' ? 
              <View > 
                {industryVertical.length > 0 ?
                <View style={{flexDirection:'row', alignItems:'center', marginLeft:16, marginTop:8}}>
                  <Text style={{color:ThemeColor.NavColor, fontFamily: FontName.Regular,fontSize:12,borderWidth:1,borderColor:ThemeColor.NavColor, borderRadius:5,padding:4, paddingLeft:8, paddingRight:8}}>{industryVertical}</Text>
                </View> : 
                 <View style={{height:30}}>
                </View>
                }
                <View style={{backgroundColor:'white', height:280, borderRadius:5,borderWidth:1, borderColor:ThemeColor.BorderColor, marginTop:64, alignItems: 'center', margin:16, marginBottom:0}}>
                  <TouchableOpacity style={styles.imageContainer} onPress={()=>showActionSheet()}>
                      <View style={{width:100, height:100, backgroundColor:'white',borderRadius:50, borderWidth:1, borderColor:ThemeColor.SubTextColor,alignItems: 'center', justifyContent: 'center'}}> 
                        {pickedImage ? <Image resizeMode='cover' source={{ uri: pickedImage }} style={{height:100, width:100,borderRadius:50}} /> :
                        profileImageUrl.length == 0 ?
                          <FontAwesome name="user-alt" color={ThemeColor.SubTextColor} size={40} /> :
                          <Image resizeMode='cover' style={{height:100, width:100,borderRadius:50}} source={{uri: profileImageUrl}} defaultSource={require('../../assets/Images/icon_profile.png')}/>
                        }
                      </View>
                      <Text style ={{borderBottomLeftRadius:50,borderBottomRightRadius:50,color:'white', fontSize:12, width:80, textAlign:'center', height:25, position:'absolute', top:75,paddingTop:4}}>EDIT</Text>
                      
                  </TouchableOpacity>
                  <ActionSheet
                    ref={actionSheetImage}
                    options={['Choose from gallery','Take photo', 'Cancel']}
                    cancelButtonIndex={2}
                    onPress={(index) => { handleActionsheet(index) }}
                  />
                  <TouchableOpacity style={{position:'absolute', right:4, top:4, height:40, width:40, alignItems: 'center', justifyContent: 'center'}} onPress={() => {navigation.navigate('Modify profile',{profileDetail:profileData})}}>
                    <EvilIcons name="pencil" color={ThemeColor.BtnColor} size={20} />
                  </TouchableOpacity>
                  <Text style={{marginTop:66, fontFamily: FontName.Regular, fontSize:20, color:'black', }}>{userName}</Text>
                  {exp.length > 0 && <Text style={{ fontFamily: FontName.Regular, fontSize:14, color:ThemeColor.TextColor, marginTop:4}}>{exp}</Text>}
                  <View style ={{flexDirection:'row',marginTop:4}}>
                    <Text style={{ fontFamily: FontName.Regular, fontSize:14, color:ThemeColor.TextColor, }}>Availability: </Text>
                    <Text style={{ fontFamily: FontName.Regular, fontSize:14, color:ThemeColor.YellowColor, }}>{availability.length > 0 ? availability : 'Not available'} </Text>
                  </View>
                  {statusText.length > 0 && <Text style={{ fontFamily: FontName.Regular, fontSize:14, color:ThemeColor.TextColor,marginTop:4 }}>{statusText}</Text>}
                  {address.length > 0 && <Text style={{ fontFamily: FontName.Regular, fontSize:14, color:ThemeColor.TextColor,marginTop:4, paddingLeft:12, paddingRight:12, textAlign:'center' }}>{address}</Text>}
                  <View style={{justifyContent:'space-between', flexDirection:'row', flex:1, width:'80%',alignItems: 'center'}}>
                    <TouchableOpacity onPress={() => {handleSocialBtn()}}>
                      <Image style={{ width:30,height:30,tintColor:ThemeColor.BtnColor}} source={require('../../assets/Images/social.png')} /> 
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => {handleCallBtn()}}>
                      <Image style={{ width:30,height:30, tintColor:ThemeColor.BtnColor}} source={require('../../assets/Images/phone.png')} /> 
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => {handleEmailBtn()}}>
                      <Image style={{ width:30,height:30,tintColor:ThemeColor.BtnColor}} source={require('../../assets/Images/email.png')} />
                    </TouchableOpacity>
                  </View>
                  <View style={{height:20, backgroundColor:ThemeColor.BorderColor,width:'90%', marginBottom:16 ,marginLeft:16, marginRight:16}}>
                    <View style={{height:20, backgroundColor:ThemeColor.BtnColor,width:'90%', alignItems:'center', justifyContent: 'center'}}>
                      <Text style={{ fontFamily: FontName.Regular, fontSize:12, color:'white'}}>Profile strength: {profileStrength}% </Text>
                    </View>
                  </View>
                </View>
              </View> : title == 'Employment details' ? 
              <View style={{backgroundColor:'white',marginLeft:16,marginRight:16,marginTop:16}}>
                <Text style={{fontSize:16, color:'black',fontFamily: FontName.Regular, paddingLeft:8,height:40,paddingTop: 10}}>{title}</Text>
                <View style={{height:1, backgroundColor:ThemeColor.BorderColor}} />
              </View> : title == 'Achievements' ? 
              <View style={{backgroundColor:'white',marginLeft:16,marginRight:16,marginTop:16,height:40,}} >
                <TouchableOpacity style={{height:40,  justifyContent: 'center', alignItems: 'center',flexDirection:'row', justifyContent:'space-between'}} onPress={() => {handleAddButton(title)}}>
                  <View style={{justifyContent: 'center', alignItems: 'center', flexDirection:'row'}} >
                    <Text style={{fontSize:16, color:'black',fontFamily: FontName.Regular, paddingLeft:8}}>{title}</Text>
                    <TouchableOpacity style={{marginLeft:8}} onPress={() => {handleAchivementHelp()}}>
                      <Ionicons name="help-circle-outline" color={ThemeColor.SubTextColor} size={20,20} />
                    </TouchableOpacity>
                  </View>
                  <View style={{ width:40, height:40,justifyContent: 'center', alignItems: 'center'}} >
                    <Ionicons name="add-outline" color={ThemeColor.BtnColor} size={25,25} />
                  </View>
                </TouchableOpacity>
                <View style={{height:1, backgroundColor:ThemeColor.BorderColor}} />
              </View> :
              <View style={{backgroundColor:'white',marginLeft:16,marginRight:16,marginTop:16,height:40,}} >
              <TouchableOpacity style={{  justifyContent: 'center', alignItems: 'center',flexDirection:'row', justifyContent:'space-between'}} onPress={() => {handleAddButton(title)}}>
                <Text style={{fontSize:16, color:'black',fontFamily: FontName.Regular, paddingLeft:8}}>{title}</Text>
                <View style={{ width:40, height:40,justifyContent: 'center', alignItems: 'center'}} >
                  <Ionicons name="add-outline" color={ThemeColor.BtnColor} size={25,25} />
                </View>
              </TouchableOpacity>
              <View style={{height:1, backgroundColor:ThemeColor.BorderColor}} />
            </View>
            }
          </View>
        )}
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
  </SafeAreaView>
);
}

export default MyProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:'#E5E9EB',
  },item: {
    backgroundColor: "#f9c2ff",
    padding: 20,
    marginVertical: 8
  },
  header: {
    fontSize: 16,
    backgroundColor: "#fff"
  },
  title: {
    fontSize: 24
  },
  imageContainer:{
    overflow:'hidden',
    height:100,
    width:100, 
    borderRadius:50,borderRadius:5, alignItems: 'center', justifyContent: 'center',position: 'absolute',alignSelf:'center', top:-50
  }
});