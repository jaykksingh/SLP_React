/* eslint-disable react/display-name */
import React,{useEffect} from "react";
import { Text, 
    View,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    FlatList,
    Alert,
    SafeAreaView
} from "react-native";

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'
import axios from 'axios'
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import {getAuthHeader} from '../../_helpers/auth-header';
import Loader from '../../Components/Loader';
import { AuthContext } from '../../Components/context';
import { BaseUrl, EndPoints, StaticMessage,ThemeColor, FontName } from '../../_helpers/constants';


const EditProfileScreen = ({route,navigation}) => { 
  const { signOut } = React.useContext(AuthContext); 
  const [isLoading, setIsLoading] = React.useState(false);
  const { profileDetail } = route.params;
  const { lookupData } = route.params;
  const { dataType } = route.params;
  const { licenceDict } = route.params;
  const { achievementDict } = route.params;
  const { prefferedLocation } = route.params;
  let [locationArray, setLocationArray] = React.useState('');
  let [isLocationLoading, setLocationLoading] = React.useState(false);
  let [seletcedJobTypes, setSeletcedJobTypes] = React.useState([]);

  
  
  const [data,setData] = React.useState({
    careerProfile :'',
    prefferedCity:'',
    updated:false,
    currentJobtitle:''
  });
  const [licenceDetails,setLicenceDetails] = React.useState({
    empCertificationDetailsId :'',
    certificateExamName:''
  });
  const [achievementDetails,setAchievementDetails] = React.useState({
    description :'',
    candidateAchievementId:''
  });


  React.useLayoutEffect(() => {
    var navigationTitle = '';
    if (dataType == 'Summary') {
      navigationTitle = 'Career profile';
    }if (dataType == 'DesiredEmployeement') {
      navigationTitle = 'Desired Employment';
    }else if (dataType == 'Licence'){
      navigationTitle = licenceDict ? 'Update certificate' : 'Add certificate';
    }else if (dataType == 'Achievements'){
      navigationTitle = achievementDict ? 'Update achievements' : 'Add achievements';
    }else if (dataType == 'PreferredCity'){
      navigationTitle = 'Preferred location';
    }else if (dataType == 'JobTitle') {
      navigationTitle = 'Update job title';
    }
		navigation.setOptions({
      headerRight: () => (
        licenceDict || achievementDict ? <TouchableOpacity style={{marginRight:16}} onPress={() => showDeleteAlert()}>
        <Ionicons name="trash-outline" color={'white'} size={20} />
        </TouchableOpacity> : null
      ),
      title: navigationTitle,
		});
  }, [navigation]);
  const showDeleteAlert = () =>{
    Alert.alert(StaticMessage.AppName,'Are sure want to delete?',
        [{
          	text: 'Cancel',
        },
		    {
            text: 'Delete',
            onPress: () => deleteProfileDetails()
        }]
      )
  }
  
  useEffect(() => {
    console.log(prefferedLocation);

    if (dataType == 'Summary') {
      setData({...data,careerProfile:profileDetail.empDetails.careerProfile});
    }else  if (dataType == 'JobTitle') {
      setData({...data,currentJobtitle:profileDetail.empDetails.currentJobTitle});
    }else if (dataType == 'DesiredEmployeement') {
      let empDetails = profileDetail.empDetails;
      let keyArray = empDetails ? empDetails.desiredEmployementKey : [];
      setSeletcedJobTypes(keyArray);
    }else if (dataType == 'Licence' && licenceDict){
      setLicenceDetails({...licenceDetails,certificateExamName:licenceDict.certificateExamName,empCertificationDetailsId:licenceDict.empCertificationDetailsId});
    }else if (dataType == 'Achievements' && achievementDict){
      setAchievementDetails({...achievementDetails,description:achievementDict.description,candidateAchievementId:achievementDict.candidateAchievementId});
    }else if (dataType == 'PreferredCity' && prefferedLocation){
      setData({...data,prefferedCity:prefferedLocation});
    }
   
    
  }, []);

  const updateProfileData = () =>{
    if (dataType == 'Summary'){
      updateProfileDetails({"empDetails":{"careerProfile":data.careerProfile}});
    }else  if (dataType == 'JobTitle'){
      updateProfileDetails({"empDetails":{"currentJobTitle":data.currentJobtitle}});
    }else if (dataType == 'DesiredEmployeement'){
      updateProfileDetails({"empDetails":{"desiredEmployementKey":seletcedJobTypes}});
    }else if (dataType == 'Licence'){
      updateProfileDetails({"licensesAndCertifications":{"empCertificationDetailsId":String(licenceDetails.empCertificationDetailsId),'certificateExamName':licenceDetails.certificateExamName}});
    }else if (dataType == 'Achievements'){
      updateProfileDetails({"candidateAchievements":{"candidateAchievementId":String(achievementDetails.candidateAchievementId),'description':achievementDetails.description}});
    }else if(dataType == 'PreferredCity'){
      updateProfileDetails({"empDetails":{"prefferedCity":[data.prefferedCity]}});
    }
  }
  const  updateProfileDetails = async(params) => {
    let user = await AsyncStorage.getItem('loginDetails');  
    let parsed = JSON.parse(user);  
    let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
    var authToken = base64.encode(userAuthToken);

    console.log('Update Params:',params);
    setIsLoading(true);
    axios ({  
      "method": "PUT",
      "url": BaseUrl + EndPoints.UserProfile,
      "headers": getAuthHeader(authToken),
      data:params
    })
    .then((response) => {
      if (response.data.code == 200){
        setIsLoading(false);
        navigation.goBack();
      }else if (response.data.code == 417){
        setIsLoading(false);
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
      console.log(error);
      setIsLoading(false);
      if(error.response.status == 401){
        SessionExpiredAlert();
    }else{
        Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
            {text: 'Ok'}
          ]);
    }

    })
  }
  const SessionExpiredAlert = () =>{
		Alert.alert(StaticMessage.AppName,StaticMessage.SessionExpired,
			[{
			  text: 'Ok',
			  onPress: () => signOut()
		  }]
	)}

  const  deleteProfileDetails = async() => {
    let user = await AsyncStorage.getItem('loginDetails');  
    let parsed = JSON.parse(user);  
    let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
    var authToken = base64.encode(userAuthToken);
    var params ={};
    if(dataType == 'Licence'){
      params ={'empCertificationDetailsId':licenceDict.empCertificationDetailsId};
    }else if(dataType == 'Achievements'){
      params ={'candidateAchievementId':achievementDict.candidateAchievementId};
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
        navigation.goBack();
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
  const handlePreferredCityChange = (val) =>{
    setData({...data,prefferedCity: val});
    if (val.length > 2){
      getCurrentLocation(val);
    }else{
      setLocationArray([]);
    }
  }
  const getCurrentLocation = async (searchKey) => {
    setLocationLoading(true);
    let user = await AsyncStorage.getItem('loginDetails');  
    let parsed = JSON.parse(user);  
    let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
    var encoded = base64.encode(userAuthToken);
    axios ({
      "method": "POST",
      "url": BaseUrl + EndPoints.LocationSearch,
      "headers": getAuthHeader(encoded),
      data:{"searchString":searchKey}
    })
    .then((response) => {
      setLocationLoading(false);
      if (response.data.code == 200){
        setLocationArray(response.data.content.dataList);
      }else if (response.data.code == 417){
        setData({...data,isLoading: false});
        setLocationArray([]);
      }else{

      }
    })
    .catch((error) => {
      setLocationLoading(false);
      setLocationArray([]);
    })
  }
  const didSelectLocation = (selectedItem) => {
    console.log(selectedItem);
    let locationName = selectedItem.City_Name + ', ' + selectedItem.State_Name;
    setData({...data,prefferedCity:locationName});
    setLocationArray([]);
  }
  
  const handleJobTypeSelect = (item) => {
    let tempArray = seletcedJobTypes;
    let searchResult = (tempArray.indexOf(item.desiredEmployementKey) > -1);
    console.log(searchResult);
    if(searchResult){
      tempArray.splice(tempArray.indexOf(item.desiredEmployementKey), 1);
    }else{
      tempArray.push(item.desiredEmployementKey);
    }
    setSeletcedJobTypes(tempArray);
    console.log(seletcedJobTypes,tempArray);
    setData({...data,updated:!data.updated});

  }
  const isJobTypeSelect = (item) => {
    let tempArray = seletcedJobTypes;
    let searchResult = (tempArray.indexOf(item.desiredEmployementKey) > -1);
    console.log(searchResult);
    return searchResult
  }
  const empDetails =  profileDetail.empDetails;
  let jobTypeArr = lookupData ? lookupData.desiredEmployement : []; 

  var btnText = "SAVE";
  if (dataType == 'Achievements'){
    btnText = achievementDict ? 'UPDATE' : 'SAVE';
  }else if(dataType == 'Licence'){
    btnText = licenceDict ? 'UPDATE' : 'SAVE';
  }else if(dataType == 'JobTitle'){
    btnText = 'UPDATE';

  }
  return (
    <SafeAreaView style={styles.container}>
      {
        dataType == 'Summary' ? 
        <KeyboardAwareScrollView >
          <View style={{marginTop:4}}>
            <Text style ={{color:ThemeColor.TextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Career profile</Text>
            <View style={{backgroundColor:'white', height:140, borderRadius:3, flexDirection:'row', alignItems:'center', paddingRight:8, marginTop:4}}>
              <TextInput  
                style={[styles.inputText,{height:130, textAlignVertical:'top'}]}
                multiline={true}
                placeholder="" 
                placeholderTextColor={ThemeColor.PlaceHolderColor}
                keyboardType='default'
                value= {data.careerProfile}
                onChangeText={(val) => setData({...data,careerProfile:val})}
              />
            </View>
          </View>    
          <Loader isLoading={isLoading} />
        </KeyboardAwareScrollView> : null
      }
      {
        dataType == 'JobTitle' ? 
        <KeyboardAwareScrollView >
          <View style={{marginTop:16}}>
            <Text style ={{color:ThemeColor.TextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:16}}>Current job title</Text>
            <View style={{backgroundColor:'white', height:40, borderRadius:3, flexDirection:'row', alignItems:'center', paddingRight:8, marginTop:0}}>
              <TextInput  
                style={[styles.inputText]}
                placeholder="" 
                clearButtonMode='while-editing'
                placeholderTextColor={ThemeColor.PlaceHolderColor}
                keyboardType='default'
                value= {data.currentJobtitle}
                onChangeText={(val) => setData({...data,currentJobtitle:val})}
              /> 
            </View>
          </View>    
          <Loader isLoading={isLoading} />
        </KeyboardAwareScrollView> : null
      }
      {
        dataType == 'DesiredEmployeement' ? 
        <KeyboardAwareScrollView >
          <View style={{marginTop:16}}>
            <Text style ={{color:ThemeColor.TextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:16}}>Desired type of Employment</Text>
            <FlatList style={{}}
              data={jobTypeArr}
              keyExtractor={(item, index) => index.toString()}
              randomUpdateProp={data.updated}
              renderItem={({item}) => 
                <View>
                  <TouchableOpacity style={{alignContent:'center', backgroundColor:'#fff',}} onPress={(event)=> {handleJobTypeSelect(item)}}>
                      <View style={{flexDirection:'row', alignItems:'center', paddingRight:16, paddingTop:4,paddingBottom:4}}>
                        <View style={{paddingLeft:16,paddingTop:8, flex:1,marginRight:4}}>
                            <Text style={{flex: 1, fontFamily: FontName.Regular, fontSize:16,color:ThemeColor.TextColor, marginBottom:4}}>{item.desiredEmployement}</Text>
                        </View>
                          {isJobTypeSelect(item) ? <Feather name="check" color={ThemeColor.NavColor} size={22,22} /> : null}
                      </View>
                      <View style={{marginLeft:16,flex: 1,height:1, backgroundColor:ThemeColor.BorderColor, marginTop:4}}/>
                  </TouchableOpacity>
                </View>
              }
            />
          </View>    
          <Loader isLoading={isLoading} />
        </KeyboardAwareScrollView> : null
      }
      {
        dataType == 'Licence' ? 
        <KeyboardAwareScrollView >
          <View style={{marginTop:16}}>
            <Text style ={{color:ThemeColor.TextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:16}}>Name</Text>
            <View style={{backgroundColor:'white', height:40, borderRadius:3, flexDirection:'row', alignItems:'center', paddingRight:16, marginTop:4}}>
              <TextInput  
                style={[styles.inputText,{height:130, textAlignVertical:'top'}]}
                placeholder="Licence / Certifications name" 
                placeholderTextColor={ThemeColor.PlaceHolderColor}
                keyboardType='default'
                value= {licenceDetails.certificateExamName}
                onChangeText={(val) => setLicenceDetails({...licenceDetails,certificateExamName:val})}
              />
            </View>
          </View>    
          <Loader isLoading={isLoading} />
        </KeyboardAwareScrollView> : null
      }
      {
        dataType == 'Achievements' ? 
        <KeyboardAwareScrollView >
          <View style={{marginTop:16}}>
            <Text style ={{color:ThemeColor.TextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:16}}>Achievements</Text>
            <View style={{backgroundColor:'white', height:140, borderRadius:3, flexDirection:'row', alignItems:'center', paddingRight:8, marginTop:4}}>
              <TextInput  
                style={[styles.inputText,{height:130, textAlignVertical:'top'}]}
                multiline={true}
                placeholder="" 
                placeholderTextColor={ThemeColor.PlaceHolderColor}
                keyboardType='default'
                value= {achievementDetails.description}
                onChangeText={(val) => setAchievementDetails({...achievementDetails,description:val})}
              />
            </View>
          </View>    
          <Loader isLoading={isLoading} />
        </KeyboardAwareScrollView> : null
      }
      {
        dataType == 'PreferredCity' ? 
        <View style={{flex: 1}}>
          <View style={{marginTop:16}}>
            <Text style ={{color:ThemeColor.TextColor, fontSize:14, fontFamily:FontName.Regular, paddingLeft:16}}>Preferred location</Text>
            <View style={{backgroundColor:'white', height:40, borderRadius:3, flexDirection:'row', alignItems:'center', paddingRight:8, marginTop:4}}>
              <TextInput  
                style={styles.inputText}
                placeholder="Preferred city" 
                placeholderTextColor={ThemeColor.PlaceHolderColor}
                keyboardType='default'
                clearButtonMode='while-editing'
                value= {data.prefferedCity}
                onChangeText={(val) => handlePreferredCityChange(val)}
              />
              <ActivityIndicator animating={isLocationLoading} />
            </View>
          </View> 
          <FlatList style={{marginTop:1}}
            data={locationArray}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item}) => 
            <View>
            <TouchableOpacity style={{alignContent:'center'}} onPress={()=> {didSelectLocation(item)}}>
                <View style={{flexDirection:'row', alignItems:'center', paddingRight:8}}>
                  <View style={{paddingLeft:8,paddingTop:8, flex:1,marginRight:4}}>
                      <Text style={{flex: 1, fontFamily: FontName.Regular, fontSize:14,color:ThemeColor.TextColor, marginBottom:4}}>{item.City_Name}, {item.State_Name}</Text>
                  </View>
                </View>
                <View style={{marginLeft:16,flex: 1,height:1, backgroundColor:ThemeColor.BorderColor, marginTop:4, marginBottom:1}}/>
            </TouchableOpacity>
            </View>
            }
        />   
          <Loader isLoading={isLoading} />
        </View> : null
      }
      <TouchableOpacity style={styles.btnFill} onPress={() => {updateProfileData()}}>
        <Text style={{color:'#53962E',fontFamily: FontName.Regular, fontSize:16, color:'#fff' }}>{btnText}</Text>
      </TouchableOpacity> 
    </SafeAreaView>
);
}

export default EditProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:'#E5E9EB',
  },inputText:{
    flex: 1,
    height:40,
    color:'black',
    fontSize:16,
    fontFamily: FontName.Regular,
    marginLeft:16,
    alignContent:'stretch',
  },
  labelText:{
    flex: 1,
    color:'black',
    fontSize:16,
    fontFamily: FontName.Regular,
    marginLeft:8,
    alignContent:'stretch',
  },btnFill:{
    height:50,
    justifyContent:"center",
    backgroundColor: ThemeColor.BtnColor ,
    alignItems:'center',
    marginBottom:8, borderRadius:5,
    margin:16
  }
});