import React ,{useEffect,useState,createRef,useRef} from "react";
import { StatusBar, 
    StyleSheet, 
    Text,
    TouchableOpacity,
    SafeAreaView,
    View,
    ScrollView,
    Alert,
    FlatList,
    TextInput,
    Switch,
    Dimensions,
    Platform
} from "react-native";

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import ActionSheet from "react-native-actions-sheet";
import {Picker} from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import DatePicker from 'react-native-date-picker'
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'
import axios from 'axios'
import {getAuthHeader} from '../../_helpers/auth-header';
import { BaseUrl, EndPoints, StaticMessage, ThemeColor, FontName } from '../../_helpers/constants';
import {parseErrorMessage} from '../../_helpers/Utils';
import Loader from '../../Components/Loader';

const startDateRef = createRef();
const endDateRef = createRef();
const countryRef = createRef();
const stateRef = createRef();
const cityRef = createRef();

const AddWorkExperienceScreen = ({route,navigation}) => {
  
  const titleInput = useRef(null);
  const responsibilityInput = useRef(null);

  
  const [isLoading,setIsLoading] = useState(false);
  const [countryArray,setCountryArray] = useState([]);
  const [stateArray,setStateArray] = useState([]);
  const [cityArray,setCityArray] = useState([]);
	const [startDate, setStartDate] = React.useState(new Date());
	const [endDate, setEndDate] = React.useState(new Date());

  const [experience,setExperience] = React.useState({
    isLoading: false, 
    employerName:'',
    positionTitle:'',
    positionStartDate:'',
    positionEndDate:'',
    positionResponsibilities:'',
    candidateEmploymentExperienceId:'',
    countryId:'',
    stateId:'',
    cityId:'',
    countryName:'',
    stateName:'',
    cityName:'',
    isCurrent:false,
  });
  const { lookupData } = route.params;
  const { experienceDetails } = route.params;

  React.useLayoutEffect(() => {
    navigation.setOptions({
        headerRight: () => (
          experienceDetails ? 
            <TouchableOpacity style={{marginRight:16}} onPress={() => showLogOutAlert()}>
              <Icon name="trash-outline" color={'white'} size={20} />
            </TouchableOpacity> : null
          ),
          title: experienceDetails ? 'Edit work experience' : 'Add work experience',
    });
  }, [navigation]);
  const showLogOutAlert = () =>{
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
	  if(experienceDetails){
      console.log(`Experience: ${JSON.stringify(experienceDetails)}`);
      let momentStartDate = moment(experienceDetails.positionStartDate);
      let momentEndDate = moment(experienceDetails.positionEndDate);
      if(experienceDetails.positionEndDate.length == 0 && experienceDetails.positionStartDate.length > 0){
        experienceDetails.isCurrent = true;
      }
      setExperience(experienceDetails);
      console.log(momentStartDate,momentEndDate)
      setStartDate(new Date());
      setEndDate(new Date());
      getRegionList('COUNTRY');
      getRegionList('STATE',experienceDetails.countryId);
      getRegionList('CITY',experienceDetails.stateId);
  
	  }else{
      console.log(startDate,endDate)

      getRegionList('COUNTRY');
	  }
    
    
  },[])

  const  updateProfileDetails = async() => {
    let user = await AsyncStorage.getItem('loginDetails');  
    let parsed = JSON.parse(user);  
    let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
    var authToken = base64.encode(userAuthToken);

    setIsLoading(true);
    const params = {
      employerName:experience.employerName,
      positionTitle:experience.positionTitle,
      positionStartDate:experience.positionStartDate,
      positionEndDate: experience.isCurrent ? "" : experience.positionEndDate,
      positionResponsibilities:experience.positionResponsibilities,
      candidateEmploymentExperienceId:experience.candidateEmploymentExperienceId,
      countryId: ''+experience.countryId,
      stateId:experience.stateId,
      cityId:experience.cityId,
    }
    console.log('experiences update:',JSON.stringify(params));
    axios ({  
      "method": "PUT",
      "url": BaseUrl + EndPoints.UserProfile,
      "headers": getAuthHeader(authToken),
      data:{'experiences':params}
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
      setIsLoading(false);
      Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
        {text: 'Ok'}
      ]);

    })
  }
  const  deleteProfileDetails = async() => {
    let user = await AsyncStorage.getItem('loginDetails');  
    let parsed = JSON.parse(user);  
    let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
    var authToken = base64.encode(userAuthToken);
	  console.log('candidateEmploymentExperienceId:','');
    setIsLoading(true);
    axios ({  
      "method": "DELETE",
      "url": BaseUrl + EndPoints.UserProfile,
      "headers": getAuthHeader(authToken),
      data:{'candidateEmploymentExperienceId':experienceDetails.candidateEmploymentExperienceId}
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
      setIsLoading(false);
      Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
        {text: 'Ok'}
      ]);

    })
  } 
  const  getRegionList = async(regionType, searchID) => {
    let user = await AsyncStorage.getItem('loginDetails');  
    let parsed = JSON.parse(user);  
    let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
    var authToken = base64.encode(userAuthToken);
    setIsLoading(true);
    var url = BaseUrl + EndPoints.CountryEndPoint;
    if(regionType == 'STATE'){
      url = BaseUrl + EndPoints.StateEndPint + searchID;
    }else if(regionType == 'CITY'){
      url = BaseUrl + EndPoints.CityEndPint + searchID;
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

  const handleStartDateChange = (val) =>{
    console.log("Start Date:",moment(val));
    setStartDate(val);
    let showDate = moment(val).format('MMM DD, YYYY')
    setExperience({...experience,positionStartDate:showDate});
  }
  const handleEndDateChange = (val) =>{
    console.log("Start Date:",val.toString());
    setEndDate(val);
    let showDate = moment(val).format('MMM DD, YYYY')
    setExperience({...experience,positionEndDate:showDate});
  }
  const handleStatePicker = () => {
    if(experience.countryId.length == 0){
      Alert.alert(StaticMessage.AppName, 'Please select country', [
        {text: 'Ok'}
      ]);
    }else{
      stateRef.current?.setModalVisible();
    }
  }
  const handleCityPicker = () => {
    if(experience.stateId.length == 0){
      Alert.alert(StaticMessage.AppName, 'Please select state', [
        {text: 'Ok'}
      ]);
    }else{
      cityRef.current?.setModalVisible();
    }
  }
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareScrollView KeyboardAwareScrollView style={{paddingLeft:16, paddingRight:16, marginTop:16,marginBottom:32,width:'100%' }}>
        <View style={{marginTop:12}}>
          <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Employer name*</Text>
          <View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}>
            <TextInput  
              style={styles.inputText}
              placeholder="Employer name" 
              placeholderTextColor={ThemeColor.PlaceHolderColor}
              keyboardType='default'
              returnKeyType="next"
              value= {experience.employerName}
              onEndEditing={() => {titleInput.current.focus()}}
              onChangeText={(val) => setExperience({...experience,employerName:val})}
            />
          </View>
        </View> 
        <View style={{marginTop:12}}>
          <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Position title*</Text>
          <View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}>
            <TextInput  
              style={styles.inputText}
              ref={titleInput}
              placeholder="Position title" 
              placeholderTextColor={ThemeColor.PlaceHolderColor}
              keyboardType='default'
              returnKeyType="next"
              value= {experience.positionTitle}
              onEndEditing={() => {responsibilityInput.current.focus()}}
              onChangeText={(val) => setExperience({...experience,positionTitle:val})}
            />
          </View>
        </View>
        <View style={{marginTop:12}}>
          <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Responsibility*</Text>
          <View style={{backgroundColor:'white', height:100, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}>
            <TextInput  
              style={[styles.inputText,{height:90, textAlignVertical:'top'}]}
              multiline={true}
              ref={responsibilityInput}
              placeholder="Responsibility" 
              numberOfLines={5}
              placeholderTextColor={ThemeColor.PlaceHolderColor}
              keyboardType='default'
              value= {experience.positionResponsibilities}
              onChangeText={(val) => setExperience({...experience,positionResponsibilities:val})}
            />
          </View>
        </View> 
        <View style={{marginTop:12, flexDirection:'row'}}>
          <View style={{flex:1, marginRight:4}}>
            <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Start date*</Text>
            <TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}  onPress={() => {startDateRef.current?.setModalVisible()}}>
              <Text style={[styles.labelText,{color:experience.positionStartDate.length > 0 ? 'black' : ThemeColor.PlaceHolderColor}]}>{experience.positionStartDate.length > 0 ? experience.positionStartDate : 'Start date'}</Text>
              <Icon name="calendar" color={ThemeColor.SubTextColor} size={22,22} />
            </TouchableOpacity>
          </View> 
          {!experience.isCurrent && 
          <View style={{flex: 1, marginLeft:4}}>
            <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>End date*</Text>
            <TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}  onPress={() => {endDateRef.current?.setModalVisible()}}>
              <Text style={[styles.labelText,{color:experience.positionEndDate.length > 0 ? 'black' : ThemeColor.PlaceHolderColor}]}>{experience.positionEndDate.length > 0 ? experience.positionEndDate : 'End date'}</Text>
              <Icon name="calendar" color={ThemeColor.SubTextColor} size={22,22} />
            </TouchableOpacity>
          </View> }
        </View> 
        <View style={{alignItems: 'flex-end'}}>
            <TouchableOpacity style={{height:40,width:90,flexDirection:'row', alignItems:'center',paddingLeft:4}}  onPress={() => {setExperience({...experience,isCurrent:!experience.isCurrent})}}>
              {experience.isCurrent ? <MaterialIcons name="check-box" color={ThemeColor.BtnColor} size={20,20} /> : <MaterialIcons name="check-box-outline-blank" color={ThemeColor.BtnColor} size={20,20} />} 
              <Text style={[styles.labelText,{color: ThemeColor.TextColor, marginLeft:4 }]}>Current</Text>
            </TouchableOpacity>
        </View> 
        {Platform.OS == 'ios' ?
          <>
            <View style={{marginTop:0}}>
              <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Country</Text>
              <TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}  onPress={() => {countryRef.current?.setModalVisible()}}>
                <Text style={[styles.labelText,{color:experience.countryName.length > 0 ? 'black' : ThemeColor.PlaceHolderColor}]}>{experience.countryName.length >0 ? experience.countryName : 'Country'}</Text>
                <Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22,22} />
              </TouchableOpacity>
            </View> 
            <View style={{marginTop:12}}>
                <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>State</Text>
                <TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}  onPress={() => {handleStatePicker()}}>
                  <Text style={[styles.labelText,{color:experience.stateName.length > 0 ? 'black' : ThemeColor.PlaceHolderColor}]}>{experience.stateName.length >0 ? experience.stateName : 'State'}</Text>
                  <Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22,22} />
                </TouchableOpacity>
            </View> 
            <View style={{marginTop:12}}>
                <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>City</Text>
                <TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}  onPress={() => {handleCityPicker()}}>
                  <Text style={[styles.labelText,{color:experience.cityName.length > 0 ? 'black' : ThemeColor.PlaceHolderColor}]}>{experience.cityName.length >0 ? experience.cityName : 'City'}</Text>
                  <Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22,22} />
                </TouchableOpacity>
            </View> 
          </> :
          <>
            <View style={{marginTop:0}}>
              <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Country</Text>
              <TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}  onPress={() => {countryRef.current?.setModalVisible()}}>
                <Picker
                  style={{backgroundColor: 'white',flex:1,}}
                  itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
                  selectedValue={parseInt(experience.countryId)}
                  onValueChange={(itemValue, index) =>{
                    console.log(itemValue,index)
                    let selectedItem = countryArray[index];
                    setExperience({...experience,countryName:selectedItem.countryName,countryId:selectedItem.countryId,stateName:'',stateId:'',cityName:'',cityId:''});
                    getRegionList('STATE',selectedItem.countryId);
                  }}>
                  {countryArray && countryArray.map((item, index) => {
                    return (<Picker.Item label={item.countryName} value={item.countryId} key={index}/>) 
                  })}
                </Picker>
                <Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22,22} />
              </TouchableOpacity>
            </View> 
            <View style={{marginTop:12}}>
                <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>State</Text>
                <TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}  onPress={() => {handleStatePicker()}}>
                  <Picker
                    style={{backgroundColor: 'white',flex:1,}}
                    itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
                    selectedValue={parseInt(experience.stateId)}
                    onValueChange={(itemValue, index) =>{
                      console.log(itemValue,index)
                      let selectedItem = stateArray[index];
                      console.log(selectedItem);
                      setExperience({...experience,stateName:selectedItem.stateName,stateId:selectedItem.stateId,cityName:'',cityId:''});
                      getRegionList('CITY',selectedItem.stateId);

                    }}>
                    {stateArray && stateArray.map((item, index) => {
                      return (<Picker.Item label={item.stateName} value={item.stateId} key={index}/>) 
                    })}
                  </Picker>
                  <Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22,22} />
                </TouchableOpacity>
            </View> 
            <View style={{marginTop:12}}>
                <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>City</Text>
                <TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}  onPress={() => {handleCityPicker()}}>
                  <Picker
                    style={{backgroundColor: 'white',flex:1,}}
                    itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
                    selectedValue={parseInt(experience.cityId)}
                    onValueChange={(itemValue, index) =>{
                      console.log(itemValue,index)
                      let selectedItem = cityArray[index];
                      console.log(selectedItem);
                      setExperience({...experience,cityName:selectedItem.cityName,cityId:selectedItem.cityId});

                    }}>
                    {cityArray && cityArray.map((item, index) => {
                      return (<Picker.Item label={item.cityName} value={item.cityId} key={index}/>) 
                    })}
                  </Picker>
                  <Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22,22} />
                </TouchableOpacity>
            </View> 
          </>
        }
        
      </KeyboardAwareScrollView>
      <View style={{flexDirection:'row',borderRadius:5, marginTop:8, marginLeft:16,marginRight:16, marginBottom:16}}>
        <TouchableOpacity style={styles.btnFill} onPress={() => {updateProfileDetails()}}>
          <Text style={{color:'#53962E',fontFamily: FontName.Regular, fontSize:16, color:'#fff' }}>{experienceDetails ? "UPDATE" : "SAVE"}</Text>
        </TouchableOpacity>
      </View>  
      <Loader isLoading={isLoading} />
      
      <ActionSheet ref={startDateRef} containerStyle={{backgroundColor:ThemeColor.ViewBgColor}}>
        <View style={{height:300}}>
          <View style={{height:44, flexDirection:'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft:16,paddingRight:16}}>
          <TouchableOpacity onPress={() => {startDateRef.current?.setModalVisible()}}>
            <Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Cancel</Text>
          </TouchableOpacity>
          <Text style={{color:ThemeColor.TextColor, fontSize:18, fontFamily: FontName.Regular}}>Start date</Text>
          <TouchableOpacity onPress={() => {
              {experience.positionStartDate.length == 0 && handleStartDateChange(startDate) }
              startDateRef.current?.setModalVisible()
            }}>
            <Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Done</Text>
          </TouchableOpacity>
          </View>
          <DatePicker
            style={{backgroundColor: 'white',flex:1,width:Dimensions.get('window').width}}
            mode={'date'}
            date={startDate}
            onDateChange={(val) => {
              handleStartDateChange(val)}
            }
          />
        </View>
      </ActionSheet>
      <ActionSheet ref={endDateRef} containerStyle={{backgroundColor:ThemeColor.ViewBgColor}}>
        <View style={{height:300}}>
          <View style={{height:44, flexDirection:'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft:16,paddingRight:16}}>
          <TouchableOpacity onPress={() => {endDateRef.current?.setModalVisible()}}>
            <Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Cancel</Text>
          </TouchableOpacity>
          <Text style={{color:ThemeColor.TextColor, fontSize:18, fontFamily: FontName.Regular}}>End date</Text>
          <TouchableOpacity onPress={() => {
              {experience.positionEndDate.length == 0 && handleEndDateChange(endDate) }
              endDateRef.current?.setModalVisible()
            }}>
            <Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Done</Text>
          </TouchableOpacity>
          </View>
          <DatePicker
            style={{backgroundColor: 'white',flex:1,width:Dimensions.get('window').width}}
            mode={'date'}
            minimumDate={startDate}
            date={endDate}
            onDateChange={(val) => {handleEndDateChange(val)}}
          />
        </View>
      </ActionSheet> 
      <ActionSheet ref={countryRef} containerStyle={{backgroundColor:ThemeColor.ViewBgColor}}>
        <View style={{height:300}}>
          <View style={{height:60, flexDirection:'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft:16,paddingRight:16}}>
            <TouchableOpacity onPress={() => {countryRef.current?.setModalVisible()}}>
              <Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Cancel</Text>
            </TouchableOpacity>
            <Text style={{color:ThemeColor.TextColor, fontSize:16, fontFamily: FontName.Bold}}>Select country</Text>
            <TouchableOpacity onPress={() => {
                {experience.countryId.length == 0 && setExperience({...experience,countryName:countryArray[0].countryName,countryId:countryArray[0].countryId,stateName:'',stateId:'',cityName:'',cityId:''})}
                {experience.countryId.length == 0 && getRegionList('STATE',countryArray[0].countryId)};
                countryRef.current?.setModalVisible()}
              }>
              <Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Done</Text>
            </TouchableOpacity>
          </View>
          <Picker
            style={{backgroundColor: 'white',flex:1,}}
            itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
            selectedValue={parseInt(experience.countryId)}
            onValueChange={(itemValue, index) =>{
              console.log(itemValue,index)
              let selectedItem = countryArray[index];
              setExperience({...experience,countryName:selectedItem.countryName,countryId:selectedItem.countryId,stateName:'',stateId:'',cityName:'',cityId:''});
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
                {experience.stateId.length == 0 && setExperience({...experience,stateName:stateArray[0].stateName,stateId:stateArray[0].stateId,cityName:'',cityId:''})}
                {experience.stateId.length == 0 && getRegionList('CITY',stateArray[0].stateId)};
                stateRef.current?.setModalVisible()
              }}>
              <Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Done</Text>
            </TouchableOpacity>
          </View>
          <Picker
            style={{backgroundColor: 'white',flex:1,}}
            itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
            selectedValue={parseInt(experience.stateId)}
            onValueChange={(itemValue, index) =>{
              console.log(itemValue,index)
              let selectedItem = stateArray[index];
              console.log(selectedItem);
              setExperience({...experience,stateName:selectedItem.stateName,stateId:selectedItem.stateId,cityName:'',cityId:''});
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
                {experience.cityId.length == 0 && setExperience({...experience,cityName:cityArray[0].cityName,cityId:cityArray[0].cityId})}
                cityRef.current?.setModalVisible()}
              }>
              <Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Done</Text>
            </TouchableOpacity>
          </View>
          <Picker
            style={{backgroundColor: 'white',flex:1,}}
            itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
            selectedValue={parseInt(experience.cityId)}
            onValueChange={(itemValue, index) =>{
              console.log(itemValue,index)
              let selectedItem = cityArray[index];
              console.log(selectedItem);
              setExperience({...experience,cityName:selectedItem.cityName,cityId:selectedItem.cityId});

            }}>
            {cityArray && cityArray.map((item, index) => {
              return (<Picker.Item label={item.cityName} value={item.cityId} key={index}/>) 
            })}
          </Picker>
        </View>
      </ActionSheet>
	  </SafeAreaView>
	);
}

export default AddWorkExperienceScreen;

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
    alignItems:'center',
    borderRadius:5
  },chipTitle: {
    fontSize: 14,
    paddingLeft:8,
    paddingRight:8
  },chipItem: {
    padding: 4,
    marginVertical: 4,
    marginHorizontal: 8,
    borderRadius:20,
    borderColor:ThemeColor.BtnColor,
    borderWidth:1,
  },footer: {
    position:'absolute',
    bottom:0,
    flex: 1,
    backgroundColor: ThemeColor.ViewBgColor,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingBottom:16,
    height:'80%',
    width:'100%', 
    borderColor:ThemeColor.ViewBgColor,
    borderWidth:1,
    alignItems:'center',
  },
  containerContent: {marginTop: 140, height:200},
  containerHeader: {
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    backgroundColor: 'green',
    marginTop:100
  },
  headerContent:{
    marginTop: 0,
  },

}); 