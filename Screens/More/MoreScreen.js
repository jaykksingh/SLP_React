/* eslint-disable react/display-name */
import React ,{useEffect} from "react";
import { StatusBar, 
    StyleSheet, 
    Text,
    TouchableOpacity,
    Image,
    View,
    FlatList,
    SafeAreaView,
} from "react-native";
import FeatherIcons from 'react-native-vector-icons/Feather';
import Icon from 'react-native-vector-icons/Ionicons';
import { AuthContext } from '../../Components/context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BaseUrl, EndPoints, StaticMessage,ThemeColor, FontName } from '../../_helpers/constants';
import base64 from 'react-native-base64'
import axios from 'axios'
import {getAuthHeader} from '../../_helpers/auth-header';
import MovableView from 'react-native-movable-view';
import {expo} from '../../app.json'


// TODO: Convert to FC

const MoreScreen = ({navigation}) => {
  
  const [data,setData] = React.useState({
    isLoading: true, 
    loginDetails: {}
  });
  let [profileData, setProfileData] = React.useState('');
  let [isLoading, setIsLoading] = React.useState(false);
  const { signOut } = React.useContext(AuthContext);


  useEffect(() => {
    console.log('More Screen');
    getProfileDetails();
  }, []);

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
  const SessionExpiredAlert = () =>{
    Alert.alert(StaticMessage.AppName,StaticMessage.SessionExpired,
        [{
          text: 'Ok',
          onPress: () => signOut()
      }]
  )}

  const empDetails = profileData.empDetails;
  console.log('EmpDetails:',empDetails);
  let defaultLogoUrl = empDetails ? empDetails.companyDetails.DefaultLogoUrl : '';
  let profileImageUrl = empDetails ? empDetails.profilePicture : '';
  let userName = empDetails ? empDetails.firstName + ' ' + empDetails.lastName : '';
  let displayType = empDetails ? empDetails.displayLeave : 3;
  let isExternalUser = empDetails ? empDetails.employeeTypeId == 1224 ? true : false : false;
  let jobSeeker = empDetails ? empDetails.jobSeeker : false;
  const jobSearchStatusID =  empDetails ? empDetails.jobSearchStatusId : '';
  let isJobSeeker = (jobSeeker || jobSearchStatusID == 4751 || jobSearchStatusID == 4752 || isExternalUser);
  let authorisationStatusId = empDetails ? empDetails.authorisationStatusId : 0;
  let employeeTypeId = empDetails ? empDetails.employeeTypeId : 0
  let isImmigrationAndHRVisible = (authorisationStatusId == 1 || authorisationStatusId == 2 || employeeTypeId == 1223) ? false : true;    

  console.log(displayType,isExternalUser,jobSeeker,jobSearchStatusID,isJobSeeker);
  var menuOptionArr = [];
  if(displayType == 1){
      menuOptionArr.push({"cellType": "BRAND" , "title":"Brand"});
      menuOptionArr.push({"cellType" : "PROFILE","title":"Profile"});
      menuOptionArr.push({"cellType" : "MENU" , "title":"Dashboard","icon":require('../../assets/Images/MenuIcons/Timecards.png')});
      menuOptionArr.push({"cellType" : "MENU" , "title":"Leave", "icon":require('../../assets/Images/MenuIcons/Timecards.png')});
      menuOptionArr.push({"cellType" : "MENU" , "title":"Attendance", "icon":require('../../assets/Images/MenuIcons/Timecards.png')});
      menuOptionArr.push({"cellType" : "SPACE" , "title":"" ,"height" : "40","icon":require('../../assets/Images/MenuIcons/Timecards.png')});
      menuOptionArr.push({"cellType" : "MENU" , "title":"LOG OUT","icon":require('../../assets/Images/MenuIcons/Timecards.png')});
      menuOptionArr.push({"cellType" : "VERSION" , "title":"VERSION","icon":require('../../assets/Images/MenuIcons/Timecards.png')});
  }else if (displayType == 2){
      menuOptionArr.push({"cellType" : "BRAND" , "title":"Brand" ,});
      menuOptionArr.push({"cellType" : "PROFILE","title":"Profile"});
      menuOptionArr.push({"cellType" : "MENU" , "title":"Dashboard","icon":require('../../assets/Images/MenuIcons/Dashboard.png')});
      menuOptionArr.push({"cellType" : "MENU" , "title":"Jobs" ,"icon":require('../../assets/Images/MenuIcons/Search_Jobs.png')});
      menuOptionArr.push({"cellType" : "MENU" , "title":"Messages" ,"icon":require('../../assets/Images/MenuIcons/Messages.png')});
      menuOptionArr.push({"cellType" : "MENU" , "title":"Referrals and invites" ,"icon":require('../../assets/Images/MenuIcons/Referrals.png')});
      menuOptionArr.push({"cellType" : "MENU" , "title":"Interviews" ,"icon":require('../../assets/Images/MenuIcons/Interview.png')});
      menuOptionArr.push({"cellType" : "SPACE" , "title":"" ,"height" : "40"});
        
      menuOptionArr.push({"cellType" : "MENU","title":"Leave","icon":require('../../assets/Images/MenuIcons/Timecards.png')});
      menuOptionArr.push({"cellType" : "MENU","title":"Attendance",'icon':require('../../assets/Images/MenuIcons/Timecards.png')});
      menuOptionArr.push({"cellType" : "SPACE" , "title":""});
      if(!isExternalUser){
        menuOptionArr.push({"cellType" : "MENU" , "title":"Timesheet and payroll" ,"icon":require('../../assets/Images/MenuIcons/Timecards.png')});
        menuOptionArr.push({"cellType" : "MENU" , "title":"Projects" ,"icon":require('../../assets/Images/MenuIcons/My_Projects.png')});
        if(isImmigrationAndHRVisible){
          menuOptionArr.push({"cellType" : "MENU" , "title":"Immigration" ,"icon":require('../../assets/Images/MenuIcons/Immigration.png')});
        }
        // menuOptionArr.push({"cellType" : "MENU" , "title":"Immigration" ,"icon":require('../../assets/Images/MenuIcons/Immigration.png')});

      }

      menuOptionArr.push({"cellType" : "SPACE" , "title":""});

      if(!isJobSeeker){
        menuOptionArr.push({"cellType" : "MENU" , "title":"Staff contacts" ,"icon":require('../../assets/Images/MenuIcons/Staff_Contract.png')});
      }
      menuOptionArr.push({"cellType" : "MENU" , "title":"HR" ,"icon":require('../../assets/Images/MenuIcons/hr_icon.png')});
      menuOptionArr.push({"cellType" : "MENU" , "title":"Resources" ,"icon":require('../../assets/Images/MenuIcons/Resources.png')});
      menuOptionArr.push({"cellType" : "MENU" , "title":"Help and support" ,"icon":require('../../assets/Images/MenuIcons/Help_&_Support.png')});
        
      menuOptionArr.push({"cellType" : "SPACE" , "title":"" ,"height" : "40"});
    
      menuOptionArr.push({"cellType" : "MENU" , "title":"Change password" ,"icon":require('../../assets/Images/MenuIcons/Password_change.png')});
      menuOptionArr.push({"cellType" : "MENU" , "title":"Settings" ,"icon":require('../../assets/Images/MenuIcons/Setting.png')});
      
      menuOptionArr.push({"cellType" : "SPACE" , "title":"" ,"height" : "40"});
      
      menuOptionArr.push({"cellType" : "MENU" , "title":"Privacy policy" ,"icon":require('../../assets/Images/MenuIcons/Privacy_Policy.png')});
      menuOptionArr.push({"cellType" : "MENU" , "title":"Terms of use" ,"icon":require('../../assets/Images/MenuIcons/Terms_of_Use.png')});
      menuOptionArr.push({"cellType" : "SPACE" , "title":"" ,"height" : "40"});
      
      menuOptionArr.push({"cellType" : "MENU" , "title":"LOG OUT" ,"icon":require('../../assets/Images/MenuIcons/icon_logout.png')});
      menuOptionArr.push({"cellType" : "VERSION" , "title":"VERSION", "height" : "60" ,"icon":""});
  
  }else{
    menuOptionArr.push({"cellType" : "BRAND" , "title":"Brand" ,});    
    menuOptionArr.push({"cellType" : "PROFILE","title":"Profile"});
    menuOptionArr.push({"cellType" : "MENU" , "title":"Dashboard","icon":require('../../assets/Images/MenuIcons/Dashboard.png')});
    menuOptionArr.push({"cellType" : "MENU" , "title":"Jobs" ,"icon":require('../../assets/Images/MenuIcons/Search_Jobs.png')});
    menuOptionArr.push({"cellType" : "MENU" , "title":"Messages" ,"icon":require('../../assets/Images/MenuIcons/Messages.png')});
    menuOptionArr.push({"cellType" : "MENU" , "title":"Referrals and invites" ,"icon":require('../../assets/Images/MenuIcons/Referrals.png')});
    menuOptionArr.push({"cellType" : "MENU" , "title":"Interviews" ,"icon":require('../../assets/Images/MenuIcons/Interview.png')});
    menuOptionArr.push({"cellType" : "SPACE" , "title":"" ,"height" : "40"});
    if(!isExternalUser){
      menuOptionArr.push({"cellType" : "MENU" , "title":"Timesheet and payroll" ,"icon":require('../../assets/Images/MenuIcons/Timecards.png')});
      menuOptionArr.push({"cellType" : "MENU" , "title":"Projects" ,"icon":require('../../assets/Images/MenuIcons/My_Projects.png')});
      if(isImmigrationAndHRVisible){
        menuOptionArr.push({"cellType" : "MENU" , "title":"Immigration" ,"icon":require('../../assets/Images/MenuIcons/Immigration.png')});
      }

      menuOptionArr.push({"cellType" : "SPACE" , "title":""});
    }
    if(!isJobSeeker){
      menuOptionArr.push({"cellType" : "MENU" , "title":"Staff contacts" ,"icon":require('../../assets/Images/MenuIcons/Staff_Contract.png')});
    }
    if (!isExternalUser) {
      if (isImmigrationAndHRVisible) {
        menuOptionArr.push({"cellType" : "MENU" , "title":"HR" ,"icon":require('../../assets/Images/MenuIcons/hr_icon.png')});
      }
  }

   
    menuOptionArr.push({"cellType" : "MENU" , "title":"Resources" ,"icon":require('../../assets/Images/MenuIcons/Resources.png')});
    // menuOptionArr.push({"cellType" : "MENU" , "title":"Knowledge center" ,"icon":require('../../assets/Images/MenuIcons/icon_knowledge_center.png')});
    menuOptionArr.push({"cellType" : "MENU" , "title":"Help and support" ,"icon":require('../../assets/Images/MenuIcons/Help_&_Support.png')});
    
    menuOptionArr.push({"cellType" : "SPACE" , "title":"" ,"height" : "40"});
    
    menuOptionArr.push({"cellType" : "MENU" , "title":"Change password" ,"icon":require('../../assets/Images/MenuIcons/Password_change.png')});
    menuOptionArr.push({"cellType" : "MENU" , "title":"Settings" ,"icon":require('../../assets/Images/MenuIcons/Setting.png')});
    
    menuOptionArr.push({"cellType" : "SPACE" , "title":"" ,"height" : "40"});
    
    menuOptionArr.push({"cellType" : "MENU" , "title":"Privacy policy" ,"icon":require('../../assets/Images/MenuIcons/Privacy_Policy.png')});
    menuOptionArr.push({"cellType" : "MENU" , "title":"Terms of use" ,"icon":require('../../assets/Images/MenuIcons/Terms_of_Use.png')});
    menuOptionArr.push({"cellType" : "SPACE" , "title":"" ,"height" : "40"});
    
    menuOptionArr.push({"cellType" : "MENU" , "title":"LOG OUT" ,"icon":require('../../assets/Images/MenuIcons/icon_logout.png')});
    menuOptionArr.push({"cellType" : "VERSION" , "title":"VERSION", "height" : "60" ,"icon":""});
  }
  const didSelectMenu = (selectedItem) => {
      console.log(selectedItem);
      let title = selectedItem.title;
      if(title == 'Dashboard') {
        navigation.navigate("Dashboard");
      }else if (title == 'Timesheet and payroll'){
        navigation.navigate('TimesheetPayroll',{profileDetail:profileData});
      }else if (title == 'Jobs'){
        navigation.navigate('Jobs');
      }
      else if(title == 'Messages'){
        navigation.navigate('MessageHome');
      }else if(title == 'Referrals and invites'){
        navigation.navigate('ReferralsAndInvite');
      }else if(title == 'Interviews'){
        navigation.navigate('InterviewScreen');
      }else if(title == 'Projects'){
        navigation.navigate('ProjectHome');
      }else if(title == 'Immigration'){
        navigation.navigate('ImmigrationHome');
      }else if(title == 'HR'){
        navigation.navigate('HrHome');
      }else if(title == 'Resources'){
        navigation.navigate('ResourceHome');
      }else if(title == 'Help and support'){
        navigation.navigate('HelpAndSupport');
      }else if(title == 'Staff contacts'){
        navigation.navigate('StaffContact');
      }else if(title == 'Change password'){
        navigation.navigate('ChangePassword');
      }else if(title == 'Settings'){
        navigation.navigate('AlertSetting');
      }else if(title == 'Settings'){
        navigation.navigate('AlertSetting');
      }else if(title == 'Leave'){
        navigation.navigate('LeaveHome');
      }else if(title == 'Attendance'){
        navigation.navigate('AttendanceHome');
      }else if(title == 'Privacy policy'){
        navigation.navigate("PrivacyAndTerms", {urlToLoad: "https://www.stafflinepro.com/privacy-policy",urlType: "Privacy",fromMenu:true});
      }else if(title == 'Terms of use'){
        navigation.navigate("PrivacyAndTerms", {urlToLoad: "https://www.stafflinepro.com/terms",urlType: "Terms",fromMenu:true});
      }
      else if(title == 'LOG OUT'){
        signOut();
      }
      // const handlePrivacyPolicy = () => {
      //   navigation.navigate("PrivacyAndTerms", {urlToLoad: "http://www.stafflinepro.com/privacy-policy/?off=true",urlType: "Privacy"});
      // }
      // const handleTermsOfUse = () => {
      //   navigation.navigate("PrivacyAndTerms", {urlToLoad: "http://www.stafflinepro.com/terms/?off=true",urlType: "Terms"});
      // }
    
  }
	const d = new Date();
	let year = d.getFullYear();

  return (
    <SafeAreaView style={[styles.container, {flexDirection: "column"}]}>
      <FlatList style={{marginTop:16}}
        data={menuOptionArr}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({item,index}) => 
          <View>
            {item.cellType == 'BRAND'? 
              <View style={{alignItems:'center', justifyContent: 'center', marginBottom:8, marginTop:8}}>
                <Image style={styles.brandImage} source={{uri: defaultLogoUrl}} /> 

                <Text style={{color:ThemeColor.SubTextColor, fontSize:12, fontFamily: FontName.Regular}}> powered by StafflinePro™</Text>
              </View> : null}
            {item.cellType == 'PROFILE' && profileData ?
              <TouchableOpacity style={{ height:45, marginTop:16, backgroundColor:'#fff',paddingLeft:16 }}  onPress= {() => navigation.navigate("Profile",{profileDetails:profileData,onClickEvent:getProfileDetails})}>
                <View style={styles.menuContainer}>
                  <View style={[styles.container, {flexDirection: "row", alignItems:'center' }]}>
                    <Image resizeMode='cover' style={{height:30, width:30, borderRadius:15, resizeMode:'cover'}} source={{uri: profileImageUrl}} /> 
                    <View style={[styles.container, {flexDirection: "column",marginLeft:8, height:35}]}>
                      <Text style={{color:'black', flex:1, fontSize:16, fontFamily: FontName.Regular}}>{userName} </Text>
                      <Text style={{color:'#4C4C4C', flex:1, fontSize:14, fontFamily: FontName.Regular}}>{empDetails ? empDetails.emailId : ''}</Text>
                    </View>
                  </View>
                  <FeatherIcons name="chevron-right" color={'gray'} size={20} />
                </View>
                <View style={{backgroundColor:ThemeColor.BorderColor, height:1, marginLeft: 0}}></View>
              </TouchableOpacity> : null 
              } 

            {item.cellType == 'MENU' ? <TouchableOpacity style={{ height:45, backgroundColor:'#fff',paddingLeft:16 }}  onPress={ () => {didSelectMenu(item)}}>
                <View style={styles.menuContainer}>
                  <View style={[styles.container, {flexDirection: "row", alignItems:'center'}]}>
                    <Image style={styles.menuImage} source={item.icon} /> 
                    <Text style={{color:'#4C4C4C', flex:1, fontSize:16, fontFamily: FontName.Regular,marginTop:4, marginLeft:8}}>{item.title}</Text>
                  </View>
                  <FeatherIcons name="chevron-right" color={'gray'} size={20} />
                </View>
                <View style={{backgroundColor:ThemeColor.BorderColor, height:1}}></View>
              </TouchableOpacity> : null
            }
            {item.cellType == 'SPACE' ? 
              <View style={{height:45}}/> : null
            }
            {item.cellType == 'VERSION' ? 
                <View style={{height:45, alignItems:'center', justifyContent: 'center', marginTop:24,marginBottom:24}}>
                  <Text style={{color:ThemeColor.TextColor, fontSize:16,flex:1, fontFamily: FontName.Regular,marginTop:4, marginLeft:8}}>© {year} StafflinePro™ Inc.</Text>
                  <Text style={{color:ThemeColor.SubTextColor, fontSize:12,flex:1, fontFamily: FontName.Regular,marginTop:4, marginLeft:8}}>Version {expo.version} ({expo.build})</Text>
                </View> 
              : null
            }
            
          </View>
        }
      />
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

export default MoreScreen;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0,
  },
  brandImage: {
    width: 80,
    height: 60,
    resizeMode:'contain'
  },menuImage: {
    width: 25,
    height: 25,
  },menuTitle :{
    color:'#4C4C4C', 
    flex:1, fontSize:16,
    fontFamily: FontName.Regular,
    marginTop:4, 
    marginLeft:8
  },menuContainer: {
    flex:1, 
    justifyContent: 'space-between', 
    flexDirection:'row',
    alignItems:'center', 
    paddingRight:8
  }
});