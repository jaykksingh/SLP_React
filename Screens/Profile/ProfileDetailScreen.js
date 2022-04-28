import React ,{useEffect, useState,createRef} from "react";
import { StatusBar, 
    StyleSheet, 
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    View,
    Switch,
    Image,
    Platform,
    FlatList,
    SafeAreaView
} from "react-native";
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome5';
import Icons from 'react-native-vector-icons/Ionicons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import * as ImagePicker from 'react-native-image-picker';
import * as Animatable from 'react-native-animatable';
import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'
import axios from 'axios'
import {Picker} from '@react-native-picker/picker';
import ActionSheet from "react-native-actions-sheet";
import MovableView from 'react-native-movable-view';
import Icon from 'react-native-vector-icons/Ionicons';
import { AuthContext } from '../../Components/context';
import {getAuthHeader} from '../../_helpers/auth-header';
import { BaseUrl, EndPoints, StaticMessage, ThemeColor, FontName } from '../../_helpers/constants';
import Loader from '../../Components/Loader';
import {parseErrorMessage} from '../../_helpers/Utils';

const workAuthorizationRef = createRef();
const availabilityRef = createRef();
const experienceRef = createRef();
const expertiesRef = createRef();
const countryRef = createRef();
const stateRef = createRef();
const cityRef = createRef();

const ProfileDetailScreen = ({route,navigation}) => {
  const [data,setData] = React.useState({
    firstName:'',
    lastName:'',
    emailId:'',
    contactNumber:'',
    contactNumberDialCode:'',
    cnShortCountryCode:'us',
    allowSms: false,
    currentJobTitle:'',
    authorisationStatus: '',
    authorisationStatusId:'',
    domain:'',
    subDomain:'',
    roleName:'',
    skillName:'',
    jobSearchStatusId:'',
    availability:'',
    totalExp:'',
    industryVertical:'',
    currentLocation:'',
    city:'',
    cityId:'',
    state:'',
    stateId:'',
    country:'',
    countryId:'',
    zipCode:'',
    linkedIn:'',
    twitter:'',
  });
  
  const { profileDetail } = route.params;
  const { signOut } = React.useContext(AuthContext);
  const [show, setShow] = useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [lookupData, setLookupData] = useState({});
  const [countryArray,setCountryArray] = useState([]);
  const [stateArray,setStateArray] = useState([]);
  const [cityArray,setCityArray] = useState([]);

  useEffect(() => {
    
    getUserLookups();
    getRegionList('COUNTRY');
    if(profileDetail.empDetails.countryId){
      getRegionList('STATE',profileDetail.empDetails.countryId);
    }
   
    setData(profileDetail.empDetails);
   
  },[]);

  
  const toggleSwitch = () => {
    setData({...data,allowSms:!data.allowSms});
  }
  const toggleSearchStatusSwitch = () => {
    if(data.jobSearchStatusId == '4751' || data.jobSearchStatusId == '4752'){
      setData({...data,jobSearchStatusId:'4753'});
    }else{
      setData({...data,jobSearchStatusId:'4751'});
    }
  }
 
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
  const  getRegionList = async(regionType, searchKey) => {
    console.log(regionType);
    let user = await AsyncStorage.getItem('loginDetails');  
    let parsed = JSON.parse(user);  
    let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
    var authToken = base64.encode(userAuthToken);
    setIsLoading(true);
    var url = BaseUrl + EndPoints.CountryEndPoint;
    if(regionType == 'STATE'){
      url = BaseUrl + EndPoints.StateEndPint + searchKey;
    }else if(regionType == 'CITY'){
      url = BaseUrl + EndPoints.CityEndPint + searchKey;
    }
    console.log('URL:',url);
    axios ({  
      "method": "GET",
      "url": url,
      "headers": getAuthHeader(authToken),
    })
    .then((response) => {
      if (response.data.code == 200){
        setIsLoading(false);
        console.log(regionType,response.data.content.dataList);
        if(regionType == 'COUNTRY'){
          setCountryArray(response.data.content.dataList);
        }else if (regionType == 'STATE'){
          setStateArray(response.data.content.dataList);
        }else if (regionType == 'CITY'){
          setCityArray(response.data.content.dataList);
        }
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
  
  const  updateProfileDetails = async() => {
    let user = await AsyncStorage.getItem('loginDetails');  
    let parsed = JSON.parse(user);  
    let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
    var authToken = base64.encode(userAuthToken);

    setIsLoading(true);
    const params = {
      "firstName":data.firstName,
      'lastName':data.lastName,
      'emailid':data.emailId,
      'contactNumber':data.contactNumber,
      "contactNumberCountryCode":data.contactNumberDialCode,
      "currentJobTitle":data.currentJobTitle,
      "totalExp":data.totalExpId,
      "availabilityId":data.availabilityId,
      "authorisationStatusId":data.authorisationStatusId,
      "jobSearchStatusId":data.jobSearchStatusId,
      "industryVerticalId":data.industryVerticalId,
      "currentLocation":data.currentLocation,
      "countryId":data.countryId,
      'stateId':data.stateId,
      "cityId":data.cityId,
      "zipCode":data.zipCode,
      "twitter":data.twitter,
      "linkedIn":data.linkedIn,
      "allowSms":data.allowSms

    }
    console.log('Params:',JSON.stringify(params));
    axios ({  
      "method": "PUT",
      "url": BaseUrl + EndPoints.UserProfile,
      "headers": getAuthHeader(authToken),
      data:{'empDetails':params}
    })
    .then((response) => {
      if (response.data.code == 200){
        setIsLoading(false);
        navigation.goBack();
      }else if (response.data.code == 417){
        setIsLoading(false);
        const message = parseErrorMessage(response.data.content.messageList);
        Alert.alert(StaticMessage.AppName, message, [
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
  
  const didSelectDialCode = (selectedItem) => {
    console.log(selectedItem);
    setData({...data,contactNumberDialCode: selectedItem.dialCode,cnShortCountryCode:selectedItem.countryCode});
    setShow(false);
  }
  const textPhoneChange = (text) => {
    var cleaned = ('' + text).replace(/\D/g, '')
    var match = cleaned.match(/^(1|)?(\d{3})(\d{3})(\d{4})$/)
    if (match) {
        var intlCode = (match[1] ? '+1 ' : ''),
            number = [intlCode, '(', match[2], ') ', match[3], '-', match[4]].join('');

       
        setData({...data,contactNumber: number});
        return;
    }
    setData({...data,contactNumber: text});
  }
  const handleStatePicker = () => {
    if(data.countryId > 0){
      stateRef.current?.setModalVisible()
    }else{
      Alert.alert(StaticMessage.AppName, 'Please select country', [
        {text: 'Ok'}
      ]);

    }
  }
  const handleCityPicker = () => {
    if(data.stateId > 0){
      cityRef.current?.setModalVisible()
    }else{
      Alert.alert(StaticMessage.AppName, 'Please select state', [
        {text: 'Ok'}
      ]);
    }
  }

  const authorizationStatusList = lookupData ? lookupData.authorizationStatusList : [];
  const availabilityList = lookupData ? lookupData.availability : [];
  const experienceList = lookupData ? lookupData.experienceList : [];
  const industryVerticalList = lookupData ? lookupData.empIndustryVerticalList : [];
  const countryDialCodeList = lookupData ? lookupData.countryDialCode : [];

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareScrollView>
      <View style={{paddingLeft:16, paddingRight:16, marginTop:16,marginBottom:32 }}>
        <View style={{flexDirection:'row', flex:1,marginTop:12}}>
          <View style={{flex: 1,}}>
            <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>First name</Text>
            <View style={{backgroundColor:'white', height:40, borderTopLeftRadius:5,borderBottomLeftRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}>
              <TextInput  
                style={styles.inputText}
                placeholder="First name" 
                placeholderTextColor={ThemeColor.PlaceHolderColor}
                keyboardType='email-address'
                value= {data.firstName}
                onChangeText={(val) => setData({...data,firstName:val})}
              />
            </View>
          </View>
          <View style={{flex:1}}>
            <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Last name</Text>
            <View style={{backgroundColor:'white', height:40, borderTopRightRadius:5,borderBottomRightRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}>
              <TextInput  
                style={styles.inputText}
                placeholder="Last name" 
                placeholderTextColor={ThemeColor.PlaceHolderColor}
                keyboardType='email-address'
                value= {data.lastName}
                onChangeText={(val) => setData({...data,lastName:val})}
              />
            </View>
          </View>
        </View>
        <View style={{marginTop:12}}>
          <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Email address</Text>
          <View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}>
            <TextInput  
              style={styles.inputText}
              placeholder="Email address" 
              placeholderTextColor={ThemeColor.PlaceHolderColor}
              keyboardType='email-address'
              editable = {false}
              value= {data.emailId}
              onChangeText={(val) => setData({...data,emailId:val})}
            />
          </View>
        </View>
        {Platform.OS == 'ios' ?
          <View style={{marginTop:12}}>
            <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Current area of expertise</Text>
            <TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}} onPress={() => {expertiesRef.current?.setModalVisible()}}>
              <Text style={[styles.labelText,{color:data.industryVertical.length > 0 ? 'black' : ThemeColor.PlaceHolderColor}]}>{data.industryVertical.length >0 ? data.industryVertical : 'Current area of expertise'}</Text>
              <Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22} />
            </TouchableOpacity>
          </View> :
          <View style={{marginTop:12}}>
            <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Current area of expertise</Text>
            <View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center'}} onPress={() => {expertiesRef.current?.setModalVisible()}}>
              <Picker
                style={{flex:1,fontSize:14, fontFamily: FontName.Regular}}
                itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
                selectedValue={data.industryVerticalId}
                onValueChange={(itemValue, index) =>{
                  console.log(itemValue,index)
                  let selectedItem = industryVerticalList[index];
                  setData({...data,industryVertical:selectedItem.Text,industryVerticalId:selectedItem.Value});

                }}>
                {industryVerticalList && industryVerticalList.map((item, index) => {
                  return (<Picker.Item label={item.Text} value={item.Value} key={index}/>) 
                })}
              </Picker>
            </View>
          </View>
        }
	     
        <View style={{marginTop:12}}>
          <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Phone number</Text>
          <View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}>
            <TouchableOpacity style={{flexDirection: 'row',marginRight:8, paddingLeft:8, alignContent:'center'}} onPress={() => setShow(true)}>
                {/* <Flag code="DE" size={32}/> */}
                <Text style={{color:ThemeColor.TextColor, fontSize:16, fontFamily: FontName.Regular, marginRight:8, marginLeft:8}}>+{data.contactNumberDialCode}</Text>
                <Icons name="caret-down" color={ThemeColor.LabelTextColor} size={20} />
            </TouchableOpacity>
            
            <TextInput  
              style={styles.inputText}
              placeholder="Phone number" 
              maxLength={14}
              placeholderTextColor= {ThemeColor.PlaceHolderColor}
              keyboardType='phone-pad'
              textContentType='telephoneNumber' 
              dataDetectorTypes='phoneNumber' 
              value= {data.contactNumber}
              onChangeText={(val) => textPhoneChange(val)}
            />
          </View>
        </View>
        <View style={{marginTop:12}}>
          <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Current job title</Text>
          <View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}>
            <TextInput  
              style={styles.inputText}
              placeholder="Current job title" 
              placeholderTextColor={ThemeColor.PlaceHolderColor}
              keyboardType='default'
              value= {data.currentJobTitle}
              onChangeText={(val) => setData({...data,currentJobTitle:val})}
            />
          </View>
        </View> 
	      {Platform.OS == 'ios' ? 
          <View style={{marginTop:12}}>
            <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Years of experience</Text>
            <TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}} onPress={() => {experienceRef.current?.setModalVisible()}}>
              <Text style={[styles.labelText,{color:data.totalExp.length > 0 ? 'black' : ThemeColor.PlaceHolderColor}]}>{data.totalExp.length >0 ? data.totalExp : 'Years of experience'}</Text>
              <Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22,22} />
            </TouchableOpacity>
          </View> :
        <View style={{marginTop:12}}>
          <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Years of experience</Text>
          <View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', }} onPress={() => {experienceRef.current?.setModalVisible()}}>
            <Picker
                style={{flex:1,}}
                itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
                selectedValue={parseInt(data.totalExpId)}
                onValueChange={(itemValue, index) =>{
                  console.log(itemValue,index)
                  let selectedItem = experienceList[index];
                  setData({...data,totalExp:selectedItem.keyName,totalExpId:selectedItem.keyId});

                }}>
                {experienceList && experienceList.map((item, index) => {
                  return (<Picker.Item label={item.keyName} value={item.keyId} key={index}/>) 
                })}
            </Picker>
          </View>
        </View>
        }
	      {
          Platform.OS == 'ios' ?
          <View style={{marginTop:12}}>
            <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Availability to start new job</Text>
            <TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}} onPress={() => {availabilityRef.current?.setModalVisible()}}>
              <Text style={[styles.labelText,{color:data.availability.length > 0 ? 'black' : ThemeColor.PlaceHolderColor}]}>{data.availability.length >0 ? data.availability : 'Availability to start new job'}</Text>
              <Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22,22} />
            </TouchableOpacity>
          </View> :
          <View style={{marginTop:12}}>
            <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Availability to start new job</Text>
            <View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center'}} onPress={() => {availabilityRef.current?.setModalVisible()}}>
              <Picker
                style={{flex:1,}}
                itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
                selectedValue={parseInt(data.availabilityId)}
                onValueChange={(itemValue, index) =>{
                  console.log(itemValue,index)
                  let selectedItem = availabilityList[index];
                  setData({...data,availability:selectedItem.availability,availabilityId:selectedItem.availabilityId});

                }}>
                {availabilityList && availabilityList.map((item, index) => {
                  return (<Picker.Item label={item.availability} value={item.availabilityId} key={index}/>) 
                })}
              </Picker>
            </View>
          </View>
        }
        {
          Platform.OS == 'ios' ?
            <View style={{marginTop:12}}>
              <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Work authorization</Text>
              <TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}  onPress={() => {workAuthorizationRef.current?.setModalVisible()}}>
                <Text style={[styles.labelText,{color:data.authorisationStatus.length > 0 ? 'black' : ThemeColor.PlaceHolderColor}]}>{data.authorisationStatus.length >0 ? data.authorisationStatus : 'Work authorization'}</Text>
                <Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22,22} />
              </TouchableOpacity>
            </View> :
            <View style={{marginTop:12}}>
              <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Work authorization</Text>
              <View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center'}}  onPress={() => {workAuthorizationRef.current?.setModalVisible()}}>
                <Picker
                  style={{flex:1,}}
                  itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
                  selectedValue={parseInt(data.authorisationStatusId)}
                  onValueChange={(itemValue, index) =>{
                    console.log(itemValue,index)
                    let selectedItem = authorizationStatusList[index];
                    setData({...data,authorisationStatus:selectedItem.keyName,authorisationStatusId:selectedItem.keyId});

                  }}>
                  {authorizationStatusList && authorizationStatusList.map((item, index) => {
                    return (<Picker.Item label={item.keyName} value={item.keyId} key={index}/>) 
                  })}
                </Picker>
              </View>
            </View>
        }
        
	      <View style={{marginTop:12}}>
          <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Job search status</Text>
          <View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8, justifyContent:'space-between'}}>
            <Text style ={{color:ThemeColor.TextColor, fontSize:16,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Interested in new opportunities</Text>
            <Switch
              trackColor={{ false: ThemeColor.SwitchInactiveColor, true:ThemeColor.BtnColor }}
              ios_backgroundColor = {ThemeColor.SwitchInactiveColor}
              onValueChange={toggleSearchStatusSwitch}
              thumbColor={data.jobSearchStatusId == 4751 || data.jobSearchStatusId == 4752 ? "#FFF" : "#f4f3f4"}
              value={ data.jobSearchStatusId == 4751 || data.jobSearchStatusId == 4752}
            />            
          </View>
        </View>
	      <View style={{marginTop:12}}>
          <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Street address</Text>
          <View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}>
            <TextInput  
              style={styles.inputText}
              placeholder="Address" 
              placeholderTextColor={ThemeColor.PlaceHolderColor}
              keyboardType='default'
              value= {data.currentLocation}
              onChangeText={(val) => setData({...data,currentLocation:val})}
            />
          </View>
        </View> 
        {
          Platform.OS == 'ios' ?
          <View style={{marginTop:12}}>
            <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Country</Text>
            <TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}  onPress={() => {countryRef.current?.setModalVisible()}}>
              <Text style={[styles.labelText,{color:data.country.length > 0 ? 'black' : ThemeColor.PlaceHolderColor}]}>{data.country.length >0 ? data.country : 'Select country'}</Text>
              <Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22,22} />
            </TouchableOpacity>
          </View> :
          <View style={{marginTop:12}}>
            <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Country</Text>
            <View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', }}  >
              <Picker
                style={{flex:1,}}
                itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
                selectedValue={parseInt(data.countryId)}
                onValueChange={(itemValue, index) =>{
                  console.log(itemValue,index)
                  let selectedItem = countryArray[index];
                  console.log(selectedItem);
                  setData({...data,country:selectedItem.countryName,countryId:selectedItem.countryId,state:'',stateId:'', city:'',cityId:''});
                  getRegionList('STATE',selectedItem.countryId);
                }}>
                {countryArray && countryArray.map((item, index) => {
                  return (<Picker.Item label={item.countryName} value={item.countryId} key={index}/>) 
                })}
              </Picker>
            </View>
          </View>
        }
	      
        {
          Platform.OS == 'ios' ?
          <View style={{marginTop:12}}>
            <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>State</Text>
            <TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}  onPress={() => {handleStatePicker()}}>
              <Text style={[styles.labelText,{color:data.state.length > 0 ? 'black' : ThemeColor.PlaceHolderColor}]}>{data.state.length >0 ? data.state : 'Select state'}</Text>
              <Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22,22} />
            </TouchableOpacity>
          </View> :
          <View style={{marginTop:12}}>
            <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>State</Text>
            <View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center'}}>
              <Picker
                style={{flex:1,}}
                itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
                selectedValue={data.stateId}
                onValueChange={(itemValue, index) =>{
                  console.log(itemValue,index)
                  let selectedItem = stateArray[index];
                  console.log(selectedItem);
                  setData({...data,state:selectedItem.stateName,stateId:selectedItem.stateId,city:'',cityId:''});
                  getRegionList('CITY',selectedItem.stateId);

                }}>
                {stateArray && stateArray.map((item, index) => {
                  return (<Picker.Item label={item.stateName} value={item.stateId} key={index}/>) 
                })}
              </Picker>
            </View>
          </View>
        }
	      {
          Platform.OS == 'ios' ?
          <View style={{marginTop:12}}>
            <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>City</Text>
            <TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}  onPress={() => {handleCityPicker()}}>
              <Text style={[styles.labelText,{color:data.city.length > 0 ? 'black' : ThemeColor.PlaceHolderColor}]}>{data.city.length >0 ? data.city : 'Select city'}</Text>
              <Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22,22} />
            </TouchableOpacity>
          </View>
          :
          <View style={{marginTop:12}}>
            <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>City</Text>
            <TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center'}}  onPress={() => {handleCityPicker()}}>
              <Picker
                style={{flex:1,}}
                itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
                selectedValue={data.cityId}
                onValueChange={(itemValue, index) =>{
                  console.log(itemValue,index)
                  let selectedItem = cityArray[index];
                  console.log(selectedItem);
                  setData({...data,city:selectedItem.cityName,cityId:selectedItem.cityId});

                }}>
                {cityArray && cityArray.map((item, index) => {
                  return (<Picker.Item label={item.cityName} value={item.cityId} key={index}/>) 
                })}
              </Picker>
            </TouchableOpacity>
          </View>
        }
        
        <View style={{marginTop:8}}>
          <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Zip </Text>
          <View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}>
            <TextInput  
              style={styles.inputText}
              placeholder="Zip" 
              placeholderTextColor={ThemeColor.PlaceHolderColor}
              keyboardType='number-pad'
              value= {data.zipCode}
              onChangeText={(val) => setData({...data,zipCode:val})}
            />
          </View>
        </View> 
        <View style={{marginTop:12}}>
          <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>LinkedIn</Text>
          <View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}>
            <TextInput  
              style={styles.inputText}
              placeholder="LinkedIn" 
              placeholderTextColor={ThemeColor.PlaceHolderColor}
              keyboardType='default'
              value= {data.linkedIn}
              onChangeText={(val) => setData({...data,linkedIn:val})}
            />
          </View>
       	</View>
	<View style={{marginTop:12}}>
          <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Twitter</Text>
          <View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}>
            <TextInput  
              style={styles.inputText}
              placeholder="Twitter" 
					placeholderTextColor={ThemeColor.PlaceHolderColor}
              keyboardType='default'
              value= {data.twitter}
              onChangeText={(val) => setData({...data,twitter:val})}
            />
          </View>
       	</View>
	<View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8, marginTop:16, justifyContent:'space-between'}}>
          <Text style ={{color:ThemeColor.TextColor, fontSize:16,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Ok to text/sms</Text>
          <Switch
            trackColor={{ false: ThemeColor.SwitchInactiveColor, true:ThemeColor.BtnColor }}
            ios_backgroundColor = {ThemeColor.SwitchInactiveColor}
            onValueChange={toggleSwitch}
            thumbColor={data.allowSms ? "#FFF" : "#f4f3f4"}
            value={ data.allowSms}
          />            
        </View>
      	</View>
	</KeyboardAwareScrollView>
      <View style={{flexDirection:'row',borderRadius:5,  marginLeft:16, marginRight:16,marginTop:8, marginBottom:8}}>
        <TouchableOpacity style={styles.btnFill} onPress={() => {updateProfileDetails()}}>
          <Text style={{color:'#53962E',fontFamily: FontName.Regular, fontSize:16, color:'#fff' }}>UPDATE</Text>
        </TouchableOpacity>
      </View>
      {show && 
        <Animatable.View  animation="fadeInUpBig" style={styles.footer}>
            <View style={{backgroundColor:ThemeColor.BorderColor, height:4, width:200, borderRadius:2}}/>
            {countryDialCodeList.length > 0 && 
            <FlatList style={{marginTop:16, marginBottom:16 ,width:'100%'}}
                data={countryDialCodeList}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({item}) => 
                  <TouchableOpacity onPress={(event)=> {didSelectDialCode(item)}}>
                    <View style={{flex: 1,flexDirection:'row', height:40, margin_bottom:4,alignItems: 'center'}}>
                      <Text style={{flex: 1, fontFamily: FontName.Regular, fontSize:14, marginLeft:16}}>{item.keyName} [{item.dialCode}]</Text>
                    </View>
                    <View style={{flex: 1,height:1, backgroundColor:ThemeColor.BorderColor, marginLeft:16}}/> 
                  </TouchableOpacity>
                }
            />} 
            <TouchableOpacity style={{height:40,justifyContent:"center",backgroundColor: ThemeColor.BtnColor ,alignItems:'center',width:'90%',borderRadius:5}} onPress={() => setShow(false)}>
              <Text style={{color:'#53962E',fontFamily: FontName.Regular, fontSize:16, color:'#fff' }}>DONE</Text>
            </TouchableOpacity>
        </Animatable.View>
      }
      <Loader isLoading={isLoading} />
      <ActionSheet ref={workAuthorizationRef} containerStyle={{backgroundColor:ThemeColor.ViewBgColor}}>
          <View style={{height:300}}>
            <View style={{height:60, flexDirection:'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft:16,paddingRight:16}}>
              <TouchableOpacity onPress={() => {workAuthorizationRef.current?.setModalVisible()}}>
                <Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Cancel</Text>
              </TouchableOpacity>
              <Text style={{color:ThemeColor.TextColor, fontSize:16, fontFamily: FontName.Bold}}>Authorization status</Text>
              <TouchableOpacity onPress={() => {workAuthorizationRef.current?.setModalVisible()}}>
                <Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Done</Text>
              </TouchableOpacity>
            </View>
            <Picker
              style={{backgroundColor: 'white',flex:1,}}
              itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
              selectedValue={data.authorisationStatusId}
              onValueChange={(itemValue, index) =>{
                console.log(itemValue,index)
                let selectedItem = authorizationStatusList[index];
                setData({...data,authorisationStatus:selectedItem.keyName,authorisationStatusId:selectedItem.keyId});

              }}>
              {authorizationStatusList && authorizationStatusList.map((item, index) => {
                return (<Picker.Item label={item.keyName} value={item.keyId} key={index}/>) 
              })}
            </Picker>
          </View>
        </ActionSheet>
        <ActionSheet ref={availabilityRef} containerStyle={{backgroundColor:ThemeColor.ViewBgColor}}>
          <View style={{height:300}}>
            <View style={{height:60, flexDirection:'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft:16,paddingRight:16}}>
              <TouchableOpacity onPress={() => {availabilityRef.current?.setModalVisible()}}>
                <Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Cancel</Text>
              </TouchableOpacity>
              <Text style={{color:ThemeColor.TextColor, fontSize:16, fontFamily: FontName.Bold}}>Availability status</Text>
              <TouchableOpacity onPress={() => {availabilityRef.current?.setModalVisible()}}>
                <Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Done</Text>
              </TouchableOpacity>
            </View>
            <Picker
              style={{backgroundColor: 'white',flex:1,}}
              itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
              selectedValue={data.availabilityId}
              onValueChange={(itemValue, index) =>{
                console.log(itemValue,index)
                let selectedItem = availabilityList[index];
                setData({...data,availability:selectedItem.availability,availabilityId:selectedItem.availabilityId});

              }}>
              {availabilityList && availabilityList.map((item, index) => {
                return (<Picker.Item label={item.availability} value={item.availabilityId} key={index}/>) 
              })}
            </Picker>
          </View>
        </ActionSheet>
        <ActionSheet ref={experienceRef} containerStyle={{backgroundColor:ThemeColor.ViewBgColor}}>
          <View style={{height:300}}>
            <View style={{height:60, flexDirection:'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft:16,paddingRight:16}}>
              <TouchableOpacity onPress={() => {experienceRef.current?.setModalVisible()}}>
                <Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Cancel</Text>
              </TouchableOpacity>
              <Text style={{color:ThemeColor.TextColor, fontSize:16, fontFamily: FontName.Bold}}>Total experience</Text>
              <TouchableOpacity onPress={() => {experienceRef.current?.setModalVisible()}}>
                <Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Done</Text>
              </TouchableOpacity>
            </View>
            <Picker
              style={{backgroundColor: 'white',flex:1,}}
              itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
              selectedValue={data.totalExpId}
              onValueChange={(itemValue, index) =>{
                console.log(itemValue,index)
                let selectedItem = experienceList[index];
                setData({...data,totalExp:selectedItem.keyName,totalExpId:selectedItem.keyId});

              }}>
              {experienceList && experienceList.map((item, index) => {
                return (<Picker.Item label={item.keyName} value={item.keyId} key={index}/>) 
              })}
            </Picker>
          </View>
        </ActionSheet> 
        <ActionSheet ref={expertiesRef} containerStyle={{backgroundColor:ThemeColor.ViewBgColor}}>
          <View style={{height:300}}>
            <View style={{height:60, flexDirection:'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft:16,paddingRight:16}}>
              <TouchableOpacity onPress={() => {expertiesRef.current?.setModalVisible()}}>
                <Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Cancel</Text>
              </TouchableOpacity>
              <Text style={{color:ThemeColor.TextColor, fontSize:16, fontFamily: FontName.Bold}}>Current area of expertise</Text>
              <TouchableOpacity onPress={() => {expertiesRef.current?.setModalVisible()}}>
                <Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Done</Text>
              </TouchableOpacity>
            </View>
            <Picker
              style={{backgroundColor: 'white',flex:1,fontSize:14, fontFamily: FontName.Regular}}
              itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
              selectedValue={data.industryVerticalId}
              onValueChange={(itemValue, index) =>{
                console.log(itemValue,index)
                let selectedItem = industryVerticalList[index];
                setData({...data,industryVertical:selectedItem.Text,industryVerticalId:selectedItem.Value});

              }}>
              {industryVerticalList && industryVerticalList.map((item, index) => {
                return (<Picker.Item label={item.Text} value={item.Value} key={index}/>) 
              })}
            </Picker>
          </View>
        </ActionSheet>
	      <ActionSheet ref={countryRef} containerStyle={{backgroundColor:ThemeColor.ViewBgColor}}>
          <View style={{height:300}}>
            <View style={{height:60, flexDirection:'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft:16,paddingRight:16}}>
              <TouchableOpacity onPress={() => {countryRef.current?.setModalVisible()}}>
                <Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Cancel</Text>
              </TouchableOpacity>
              <Text style={{color:ThemeColor.TextColor, fontSize:16, fontFamily: FontName.Bold}}>Select country</Text>
              <TouchableOpacity onPress={() => {countryRef.current?.setModalVisible()}}>
                <Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Done</Text>
              </TouchableOpacity>
            </View>
            <Picker
              style={{backgroundColor: 'white',flex:1,}}
              itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
              selectedValue={parseInt(data.countryId)}
              onValueChange={(itemValue, index) =>{
                console.log(itemValue,index)
                let selectedItem = countryArray[index];
                console.log(selectedItem);
                setData({...data,country:selectedItem.countryName,countryId:selectedItem.countryId,state:'',stateId:'', city:'',cityId:''});
                getRegionList('STATE',selectedItem.countryId);
              }}>
              {countryArray && countryArray.map((item, index) => {
                return (<Picker.Item label={item.countryName} value={item.countryId} key={index}/>) 
              })}
            </Picker>
          </View>
        </ActionSheet>
	      <ActionSheet ref={stateRef} containerStyle={{backgroundColor:ThemeColor.ViewBgColor}}>
          <View style={{height:300}}>
            <View style={{height:60, flexDirection:'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft:16,paddingRight:16}}>
              <TouchableOpacity onPress={() => {stateRef.current?.setModalVisible()}}>
                <Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Cancel</Text>
              </TouchableOpacity>
              <Text style={{color:ThemeColor.TextColor, fontSize:16, fontFamily: FontName.Bold}}>Select state</Text>
              <TouchableOpacity onPress={() => {
                  {data.state.length == 0 && setData({...data,state:stateArray[0].stateName,stateId:stateArray[0].stateId,city:'',cityId:''})}
                  {data.state.length == 0 && getRegionList('CITY',stateArray[0].stateId)}
                  stateRef.current?.setModalVisible()
                }}>
                <Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Done</Text>
              </TouchableOpacity>
            </View>
            <Picker
              style={{backgroundColor: 'white',flex:1,}}
              itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
              selectedValue={parseInt(data.stateId)}
              onValueChange={(itemValue, index) =>{
                console.log(itemValue,index)
                let selectedItem = stateArray[index];
				        console.log(selectedItem);
                setData({...data,state:selectedItem.stateName,stateId:selectedItem.stateId,city:'',cityId:''});
                getRegionList('CITY',selectedItem.stateId);

              }}>
              {stateArray && stateArray.map((item, index) => {
                return (<Picker.Item label={item.stateName} value={item.stateId} key={index}/>) 
              })}
            </Picker>
          </View>
        </ActionSheet>
	<ActionSheet ref={cityRef} containerStyle={{backgroundColor:ThemeColor.ViewBgColor}}>
          <View style={{height:300}}>
            <View style={{height:60, flexDirection:'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft:16,paddingRight:16}}>
              <TouchableOpacity onPress={() => {cityRef.current?.setModalVisible()}}>
                <Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Cancel</Text>
              </TouchableOpacity>
              <Text style={{color:ThemeColor.TextColor, fontSize:16, fontFamily: FontName.Bold}}>Select city</Text>
              <TouchableOpacity onPress={() => {
                  {data.city.length == 0 && setData({...data,city:cityArray[0].cityName,cityId:cityArray[0].cityId})}
                  cityRef.current?.setModalVisible()
                }}>
                <Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Done</Text>
              </TouchableOpacity>
            </View>
            <Picker
              style={{backgroundColor: 'white',flex:1,}}
              itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
              selectedValue={parseInt(data.cityId)}
              onValueChange={(itemValue, index) =>{
                console.log(itemValue,index)
                let selectedItem = cityArray[index];
				        console.log(selectedItem);
                setData({...data,city:selectedItem.cityName,cityId:selectedItem.cityId});

              }}>
              {cityArray && cityArray.map((item, index) => {
                return (<Picker.Item label={item.cityName} value={item.cityId} key={index}/>) 
              })}
            </Picker>
          </View>
        </ActionSheet> 
        <MovableView>
          <TouchableOpacity style={{
            position: 'absolute',
            margin: 16,
            right: 0,
            bottom:50,
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

export default ProfileDetailScreen;


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
    marginLeft:8,
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
    flex: 1,
    height:50,
    justifyContent:"center",
    backgroundColor: ThemeColor.BtnColor ,
    borderRadius:5,
    alignItems:'center',
  },footer: {
    position:'absolute',
    bottom:0,
    flex: 1,
    backgroundColor: ThemeColor.ViewBgColor,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingLeft: 12,
    paddingRight: 12,
    paddingVertical: 16,
    paddingBottom:16,
    height:'90%',
    width:'100%', 
    borderColor:ThemeColor.ViewBgColor,
    borderWidth:1,
    alignItems:'center',
},
});