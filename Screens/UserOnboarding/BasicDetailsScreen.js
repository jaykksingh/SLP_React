import React ,{useEffect, useState,createRef} from "react";
import { StyleSheet, 
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    View,
    Switch,
    Image,
    ActionSheetIOS,
    FlatList,
    ActivityIndicator,
    Platform,
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
import {getAuthHeader} from '../../_helpers/auth-header';
import Loader from '../../Components/Loader';
import { BaseUrl, EndPoints, StaticMessage, ThemeColor, FontName } from '../../_helpers/constants';
import { AuthContext } from '../../Components/context';


const workAuthorizationRef = createRef();
const availabilityRef = createRef();
const experienceRef = createRef();
const expertiesRef = createRef();

const BasicDetailsScreen = ({route,navigation}) => {
  const [data,setData] = React.useState({
    isLoading: true, 
    firstName:'',
    lastName:'',
    email:'',
    contactNumber:'',
    contactNumberDialCode:'',
    cnShortCountryCode:'us',
    allowSms: false,
    careerProfile:'',
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
    city:'',
    state:'',
    profilePicture:'',
    dob:'',
    loginDetails: {}
  });
  
  let [base64Data, setBase64Data] = React.useState('');
  const [pickedImage, setPickedImage] = useState('');
  const { signOut } = React.useContext(AuthContext);
  const [show, setShow] = React.useState(false);
  const [selectedCallingCode, setSelectedCallingCode] = useState('');
  let [isLoading, setIsLoading] = React.useState(false);
  const [lookupData, setLookupData] = useState({});
  const [searchLocation, setSearchLocation] = useState({});
  let [locationArray, setLocationArray] = React.useState('');
  let [isLocationLoading, setLocationLoading] = React.useState(false);
  const [value, setValue] = useState()
  let [profileDetail, setProfileData] = React.useState('');

  useEffect(() => {
    navigation.addListener('focus', () => {
			getProfileDetails();
		})
    getProfileDetails();
    getUserLookups();
  },[]);
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
            setProfileDetailsData(response.data.content.dataList[0]);
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
  const setProfileDetailsData = (profileData) => {
    let empDetails = profileData.empDetails;
    setData({...data,
      firstName:empDetails.firstName,
      lastName:empDetails.lastName, 
      emailId:empDetails.emailId,
      allowSms:empDetails.allowSms,
      careerProfile: empDetails.careerProfile,
      contactNumber:empDetails.contactNumber,
      contactNumberDialCode:empDetails.contactNumberDialCode,
      cnShortCountryCode: empDetails.cnShortCountryCode,
      currentJobTitle:empDetails.currentJobTitle,
      authorisationStatus:empDetails.authorisationStatus,
      authorisationStatusId:empDetails.authorisationStatusId,
      domain: empDetails.domain,
      subDomain: empDetails.subDomain,
      roleName: empDetails.roleName,
      skillName: empDetails.skillName,
      jobSearchStatusId: empDetails.jobSearchStatusId,
      availability: empDetails.availability,
      availabilityId: empDetails.availabilityId,
      totalExp: empDetails.totalExp,
      totalExpId: empDetails.totalExpId,
      industryVertical: empDetails.industryVertical,
      industryVerticalId: empDetails.industryVerticalId,
      city: empDetails.city,
      state: empDetails.state,
      profilePicture: empDetails.profilePicture
    });
    let location =  empDetails.city.length > 0 && empDetails.state.length > 0 ? `${empDetails.city}, ${empDetails.state}` : empDetails.city.length > 0 ? empDetails.city : empDetails.state.length > 0 ? empDetails.state : '';
    setSearchLocation(location);
  }

  const showLogOutAlert = () =>{
    console.log('Log Out')
    Alert.alert('Are sure want to log out?',null,
        [{
          text: 'Cancel',
        },{
            text: 'Log out',
            onPress: () => signOut()
          }]
      )
  }
  React.useLayoutEffect(() => {
      navigation.setOptions({
          headerRight: () => (
              <TouchableOpacity style={{marginRight:16}} onPress={() => showLogOutAlert()}>
                <Feather name="more-vertical" color={'white'} size={25,25} />
              </TouchableOpacity>
          ),
      });
  }, [navigation]);
  const toggleSwitch = () => {
    setData({...data,allowSms:!data.allowSms});
  }
  // const toggleSearchStatusSwitch = () => {
  //   if(data.jobSearchStatusId == '4751' || data.jobSearchStatusId == '4752'){
  //     setData({...data,jobSearchStatusId:'4753'});
  //   }else{
  //     setData({...data,jobSearchStatusId:'4751'});
  //   }
  // }
  const toggleSearchStatusSwitch = () => {
    if(data.jobSearchStatusId == 4751 || data.jobSearchStatusId == 4752){
      setData({...data,jobSearchStatusId:'4753'});
      Alert.alert('Confirmation', 'Job match notifications will be turned off for next 90 days', [
        {
          text: 'CONTINUE',
          onPress: () => {
            setData({...data,jobSearchStatusId:'4753'});
            updateJobSearchStatus('4753');
          }
        },
        {
          text: 'CANCEL',
          onPress: () => {
            setData({...data,jobSearchStatusId:'4751'});
          }
        }
      ]);
    }else{
      setData({...data,jobSearchStatusId:'4751'});
      updateJobSearchStatus('4751');
    }    
  }
  const  updateJobSearchStatus = async(jobSearchStatusId) => {
    let user = await AsyncStorage.getItem('loginDetails');  
    let parsed = JSON.parse(user);  
    let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
    var authToken = base64.encode(userAuthToken);
    setData({...data, isLoading:true});
    console.log('jobSearchStatusId : ',jobSearchStatusId);
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
        console.log(results);
        getProfileDetails();
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

  const handleSkipBtn = () => {
    navigation.navigate('Professional details',{profileDetail: profileDetail,lookupData:lookupData});
  }
 
  const showProfileImagePicker = () => ActionSheetIOS.showActionSheetWithOptions(
  {
      options: ["Cancel", "Choose from gallery", "Take picture"],
      // destructiveButtonIndex: 0,
      cancelButtonIndex: 0,
      userInterfaceStyle: 'light',  
    },
    buttonIndex => {
      if (buttonIndex === 0) {
        // cancel action
      } else if (buttonIndex === 1) {
        imageGalleryLaunch();
      } else if (buttonIndex === 2) {
        cameraLaunch();
      }
    }
  );
  
  // {
  //   this.ActionSheet.show();
  // }
 
  
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
        setBase64Data(base64data);
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
        setBase64Data(base64data);
        updateProfilePicture(base64data);
      }
    });
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
        "availability":data.availability,
        "authorisationStatusId":data.authorisationStatusId,
        "jobSearchStatusId":data.jobSearchStatusId,
        "careerProfile":data.careerProfile,
        "industryVerticalId":data.industryVerticalId,
        "cityId":data.cityId,
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
        navigation.navigate('Professional details',{profileDetail: profileDetail,lookupData:lookupData});

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
      console.log(response.data.content);
      if (response.data.code == 200){
        setIsLoading(false);
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
  const textFirstNameChange = (val) => {
    setData({...data,firstName: val});
  }
  const textLastNameChange = (val) => {
    setData({...data,lastName: val});
  }
  const textEmailChange = (val) => {
    setData({...data,emailId: val});
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
  const formatMobileNumber = (text) => {
    var number = text.replace('(', '');
    number = text.replace(')', '');
    number = text.replace('-', '');
    number = text.replace(' ', '');
    number = '(' + number + ') ';
    console.log(number);
   
    number = '(' + number.substring(0,3) + ') ' + number.substring(3,3) + '- ';


    if(text.length == 3){
       
        return number;
    }else if(text.length == 16){
        // textField.text = [NSString stringWithFormat:@"(%@) %@-",[num  substringToIndex:3],[num substringFromIndex:3]];
        number = '(' + number.substring(0,3) + ') ' + number.substring(3,3) + '-';
    }
    return text;
  }
  const textBasicSummaryChange = (val) => {
    setData({...data,careerProfile: val});
  }
  const textJobTitleChange = (val) => {
    setData({...data,currentJobTitle: val});
  }
  const textSearchLocationChange = (val) => {
    setSearchLocation(val);
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
        console.log(`Location Search Result:${JSON.stringify(response.data.content.dataList)}`)
        setLocationArray(response.data.content.dataList);
      }else if (response.data.code == 417){
        setData({...data,isLoading: false});
        setLocationArray([]);
      }else{

      }
    })
    .catch((error) => {
      console.log('Search Error' + error);
      setLocationLoading(false);
      setLocationArray([]);
    })
  }
  const didSelectLocation = (selectedItem) => {
    console.log(selectedItem);
    let locationName = selectedItem.City_Name + ', ' + selectedItem.State_Name;
    setData({...data,city: selectedItem.City_Name,state: selectedItem.State_Name});
    setSearchLocation(locationName);
    setLocationArray([]);
  }
  const didSelectDialCode = (selectedItem) => {
    console.log(selectedItem);
    setData({...data,contactNumberDialCode: selectedItem.dialCode,cnShortCountryCode:selectedItem.countryCode});
    setShow(false);
  }
  
  var imageURL = data.profilePicture.length > 0 ? data.profilePicture : 'https://homepages.cae.wisc.edu/~ece533/images/airplane.png'
  const authorizationStatusList = lookupData ? lookupData.authorizationStatusList : [];
  const availabilityList = lookupData ? lookupData.availability : [];
  const experienceList = lookupData ? lookupData.experienceList : [];
  const industryVerticalList = lookupData ? lookupData.empIndustryVerticalList : [];
  const countryDialCodeList = lookupData ? lookupData.countryDialCode : [];

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareScrollView>
      <View style={{alignItems: 'center', justifyContent: 'center',marginTop:16}}>
        <TouchableOpacity style={{alignItems: 'center', justifyContent: 'center'}} onPress={showProfileImagePicker}>
          <View style={{width:100, height:100, backgroundColor:'white',borderRadius:50, borderWidth:1, borderColor:ThemeColor.SubTextColor,alignItems: 'center', justifyContent: 'center'}}> 
            {pickedImage ? <Image resizeMode='cover' source={{ uri: pickedImage }} style={{height:100, width:100, borderRadius:50}} /> :
            data.profilePicture.length == 0 ?
              <FontAwesome name="user-alt" color={ThemeColor.SubTextColor} size={40,40} /> :
              <Image resizeMode='cover' style={{height:100, width:100, borderRadius:50}} source={{uri: imageURL}} defaultSource={require('../../assets/Images/icon_profile.png')}/>
            }
            
            {/* <ActionSheet
                ref={o => this.ActionSheet = o}
                title={null}
                options={['Choose from gallery', 'Take picture','Cancel']}
                cancelButtonIndex={2}
                // destructiveButtonIndex={}
                onPress={(index) => { index == 0 ? imageGalleryLaunch(): cameraLaunch() }}
            /> */}
          </View>
          <Text style ={{color:ThemeColor.NavColor, fontSize:12,textAlign:'center', marginTop:12}}>Edit photo</Text>
        </TouchableOpacity>
      </View>

      <View style={{paddingLeft:16, paddingRight:16, marginTop:8,marginBottom:32 }}>
        <View style={{marginTop:12}}>
          <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Name</Text>
          <View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}>
            <TextInput  
              style={styles.inputText}
              placeholder="First name" 
              placeholderTextColor={ThemeColor.PlaceHolderColor}
              keyboardType='email-address'
              returnKeyType="next"
              value= {data.firstName}
              onChangeText={(val) => textFirstNameChange(val)}
            />
            <TextInput  
              style={styles.inputText}
              placeholder="Last name" 
              returnKeyType="next"
              placeholderTextColor={ThemeColor.PlaceHolderColor}
              keyboardType='email-address'
              value= {data.lastName}
              onChangeText={(val) => textLastNameChange(val)}
            />
          </View>
        </View>
        <View style={{marginTop:12}}>
          <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Email address</Text>
          <View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}>
            <TextInput  
              style={[styles.inputText,{color:ThemeColor.SubTextColor}]}
              placeholder="Email address" 
              placeholderTextColor={ThemeColor.PlaceHolderColor}
              keyboardType='email-address'
              editable = {false}
              value= {data.emailId}
              onChangeText={(val) => textEmailChange(val)}
            />
          </View>
        </View>
        <View style={{marginTop:12}}>
          <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Phone number</Text>
          <View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}>
            <TouchableOpacity style={{flexDirection: 'row',marginRight:8, paddingLeft:8}} onPress={() => setShow(true)}>
                {/* <Image resizeMode='cover' style={{height:20, width:20}} source={flagURL}/> */}
                <Text style={{color:ThemeColor.TextColor, fontSize:16, fontFamily: FontName.Regular, marginRight:8, marginLeft:8}}>+{data.contactNumberDialCode}</Text>
                <Icons name="caret-down" color={ThemeColor.LabelTextColor} size={20} />
            </TouchableOpacity>
            <TextInput  
              style={styles.inputText}
              placeholder="+ Add " 
              maxLength={12}
              placeholderTextColor= {ThemeColor.PlaceHolderColor}
              keyboardType='phone-pad'
              textContentType='telephoneNumber' 
              dataDetectorTypes='phoneNumber' 
              value= {data.contactNumber}
              onChangeText={(val) => textPhoneChange(val)}
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
        <View style={{marginTop:12}}>
          <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Basic summary</Text>
          <View style={{backgroundColor:'white', height:100, borderTopLeftRadius:5, borderTopRightRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}>
            <TextInput  
              style={[styles.inputText,{height:90, textAlignVertical:'top',}]}
              multiline={true}
              maxLength={2000}
              placeholder="+ Add" 
              placeholderTextColor={ThemeColor.PlaceHolderColor}
              keyboardType='default'
              value= {data.careerProfile}
              onChangeText={(val) => textBasicSummaryChange(val)}
            />
          </View>
          <View style={{backgroundColor:'white',borderBottomLeftRadius:5, borderBottomRightRadius:5,flexDirection:'row', alignItems:'center'}}>
            <Text style ={{color:ThemeColor.SubTextColor, fontSize:14, fontFamily:FontName.Regular,flex:1, textAlign:'right', paddingBottom:4, paddingRight:8}}>{2000 - data.careerProfile.length}</Text>
          </View>
        </View> 
        <View style={{marginTop:12}}>
          <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Current job title</Text>
          <View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}>
            <TextInput  
              style={styles.inputText}
              placeholder="+ Add" 
              placeholderTextColor={ThemeColor.PlaceHolderColor}
              keyboardType='default'
              value= {data.currentJobTitle}
              onChangeText={(val) => textJobTitleChange(val)}
            />
          </View>
        </View>
        {Platform.OS == 'ios' ? 
          <View style={{marginTop:12}}>
              <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Work authorization</Text>
              <TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}  onPress={() => {workAuthorizationRef.current?.setModalVisible()}}>
                <Text style={[styles.labelText,{color:data.authorisationStatus.length > 0 ? 'black' : ThemeColor.PlaceHolderColor}]}>{data.authorisationStatus.length >0 ? data.authorisationStatus : '+ Add'}</Text>
                <Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22,22} />
              </TouchableOpacity>
            </View>
           :
          <View style={{marginTop:12}}>
            <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Work authorization</Text>
            <View style={{backgroundColor:'white',  borderRadius:5, flexDirection:'row', alignItems:'center'}}  onPress={() => {workAuthorizationRef.current?.setModalVisible()}}>
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
          </View>
        }
        <View style={{marginTop:12}}>
          <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Domain</Text>
          <TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}} 
            onPress={() => {navigation.navigate('Domain',{profileDetail: profileDetail,lookupData:lookupData})}}>
            <Text style={[styles.labelText,{color:data.domain.length > 0 ? 'black' : ThemeColor.PlaceHolderColor}]}>{data.domain.length >0 ? (data.domain + ' [ ' + data.subDomain + ' ] ') : '+ Add'}</Text>
            <Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22,22} />
          </TouchableOpacity>
        </View>
        <View style={{marginTop:12}}>
          <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Role</Text>
          <TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}
            onPress={() => {navigation.navigate('Domain',{profileDetail: profileDetail,lookupData:lookupData})}}>
            <Text style={[styles.labelText,{color:data.roleName.length > 0 ? 'black' : ThemeColor.PlaceHolderColor}]}>{data.roleName.length >0 ? data.roleName : 'Role'}</Text>
            <Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22,22} />
          </TouchableOpacity>
        </View>
        <View style={{marginTop:12}}>
          <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Primary skill</Text>
          <TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}
            onPress={() => {navigation.navigate('Domain',{profileDetail: profileDetail,lookupData:lookupData})}}>
            <Text style={[styles.labelText,{color:data.skillName.length > 0 ? 'black' : ThemeColor.PlaceHolderColor}]}>{data.skillName.length >0 ? data.skillName : '+ Add'}</Text>
            <Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22,22} />
          </TouchableOpacity>
        </View>
      
        <View style={{marginTop:12}}>
          <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Job search status</Text>
          <View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8, justifyContent:'space-between'}}>
            <Text style ={{color:ThemeColor.TextColor, fontSize:16,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Interested in new opportunities</Text>
            <Switch
              trackColor={{ false: ThemeColor.SwitchInactiveColor, true:ThemeColor.BtnColor }}
              ios_backgroundColor = {ThemeColor.SwitchInactiveColor}
              onValueChange={toggleSearchStatusSwitch}
              thumbColor={(data.jobSearchStatusId == 4751 || data.jobSearchStatusId == 4752) ? "#FFF" : "#f4f3f4"}
              value={ data.jobSearchStatusId == 4751 || data.jobSearchStatusId == 4752}
            />            
          </View>
        </View>
        {Platform.OS == 'ios' ? 
          <>
            <View style={{marginTop:12}}>
              <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Availability to start new job</Text>
              <TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}} onPress={() => {availabilityRef.current?.setModalVisible()}}>
                <Text style={[styles.labelText,{color:data.availability.length > 0 ? 'black' : ThemeColor.PlaceHolderColor}]}>{data.availability.length >0 ? data.availability : '+ Add'}</Text>
                <Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22,22} />
              </TouchableOpacity>
            </View>
            <View style={{marginTop:12}}>
              <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Years of experience</Text>
              <TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}} onPress={() => {experienceRef.current?.setModalVisible()}}>
                <Text style={[styles.labelText,{color:data.totalExp.length > 0 ? 'black' : ThemeColor.PlaceHolderColor}]}>{data.totalExp.length >0 ? data.totalExp : '+ Add'}</Text>
                <Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22,22} />
              </TouchableOpacity>
            </View>
            <View style={{marginTop:12}}>
              <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Current area of expertise</Text>
              <TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}} onPress={() => {expertiesRef.current?.setModalVisible()}}>
                <Text style={[styles.labelText,{color:data.industryVertical.length > 0 ? 'black' : ThemeColor.PlaceHolderColor}]}>{data.industryVertical.length >0 ? data.industryVertical : '+ Add'}</Text>
                <Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22,22} />
              </TouchableOpacity>
            </View>
          </> :
          <>
            <View style={{marginTop:12}}>
              <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Availability to start new job</Text>
              <View style={{backgroundColor:'white' ,borderRadius:5, flexDirection:'row', alignItems:'center'}} onPress={() => {availabilityRef.current?.setModalVisible()}}>
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
            </View>
            <View style={{marginTop:12}}>
              <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Years of experience</Text>
              <View style={{backgroundColor:'white',  borderRadius:5, flexDirection:'row', alignItems:'center'}} onPress={() => {experienceRef.current?.setModalVisible()}}>
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
            </View>
            <View style={{marginTop:12}}>
              <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Current area of expertise</Text>
              <View style={{backgroundColor:'white', borderRadius:5, flexDirection:'row', alignItems:'center'}} onPress={() => {expertiesRef.current?.setModalVisible()}}>
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
            </View>
          </>

        }
        <View style={{marginTop:12}}>
          <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Current location</Text>
          <View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}>
            <TextInput  
              style={styles.inputText}
              placeholder="+ Add" 
					placeholderTextColor={ThemeColor.PlaceHolderColor}
              keyboardType='default'
              returnKeyType="next"
              value= {searchLocation}
              onChangeText={(val) => textSearchLocationChange(val)}
            />
            {isLocationLoading && <ActivityIndicator /> }
          </View>
        </View>
        {locationArray.length > 0 && 
            <FlatList style={{marginTop:0 , backgroundColor:ThemeColor.BorderColor, borderRadius:5}}
                data={locationArray}
                renderItem={({item}) => 
                  <TouchableOpacity onPress={(event)=> {didSelectLocation(item)}}>
                    <View style={{flex: 1,flexDirection:'row', height:30, margin_bottom:4,alignItems: 'center'}}>
                      <Text style={{flex: 1, fontFamily: FontName.Regular, fontSize:14, marginLeft:16}}>{item.City_Name}, {item.State_Name}</Text>
                    </View>
                    <View style={{flex: 1,height:1, backgroundColor:'gray', marginLeft:16}}/> 
                  </TouchableOpacity>
                }
            />} 
      </View>
		</KeyboardAwareScrollView>
      <View style={{flexDirection:'row',borderRadius:5, marginLeft:16, marginRight:16,marginTop:8,marginBottom:16}}>
        <TouchableOpacity style={[styles.btnFill,{backgroundColor:'white',borderBottomLeftRadius:5,borderTopLeftRadius:5}]} onPress={() => {handleSkipBtn()}}>
          <Text style={{color:'#53962E',fontFamily: FontName.Regular, fontSize:16, color:ThemeColor.BtnColor }}>SKIP</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btnFill,{borderBottomRightRadius:5,borderTopRightRadius:5}]} onPress={() => {updateProfileDetails()}}>
          <Text style={{color:'#53962E',fontFamily: FontName.Regular, fontSize:16, color:'#fff' }}>NEXT</Text>
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
              <Text style={{color:ThemeColor.ActionSheetTitleColor, fontSize:18, fontFamily: FontName.Bold}}>Authorization status</Text>
              <TouchableOpacity onPress={() => {
                	{data.authorisationStatusId.length == 0 && setData({...data,authorisationStatus:authorizationStatusList[0].keyName,authorisationStatusId:authorizationStatusList[0].keyId})}
                  workAuthorizationRef.current?.setModalVisible()}
                }>
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
              <Text style={{color:ThemeColor.ActionSheetTitleColor, fontSize:18, fontFamily: FontName.Bold}}>Availability status</Text>
              <TouchableOpacity onPress={() => {
                  {data.availabilityId.length == 0 && setData({...data,availability:availabilityList[0].availability,availabilityId:availabilityList[0].availabilityId})}
                  availabilityRef.current?.setModalVisible()}
                }>
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
              <Text style={{color:ThemeColor.ActionSheetTitleColor, fontSize:18, fontFamily: FontName.Bold}}>Total experience</Text>
              <TouchableOpacity onPress={() => {
                  {data.totalExpId.length == 0 && setData({...data,totalExp:experienceList[0].keyName,totalExpId:experienceList[0].keyId})}
                  experienceRef.current?.setModalVisible()}
                }>
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
              <Text style={{color:ThemeColor.ActionSheetTitleColor, fontSize:18, fontFamily: FontName.Bold}}>Current area of expertise</Text>
              <TouchableOpacity onPress={() => {
                  {data.industryVerticalId.length == 0 && setData({...data,industryVertical:industryVerticalList[0].Text,industryVerticalId:industryVerticalList[0].Value})}
                  expertiesRef.current?.setModalVisible()}
                }>
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
    </SafeAreaView>
	);
  
}

export default BasicDetailsScreen;


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