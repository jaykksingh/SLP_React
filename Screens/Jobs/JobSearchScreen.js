import React , {useEffect} from "react";
import { StatusBar, 
    ScrollView, 
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    TextInput,
    TouchableOpacity,
    FlatList,
    Platform,
    Alert,
    Linking
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'
import { BaseUrl, EndPoints, StaticMessage, ThemeColor, FontName } from '../../_helpers/constants';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import { getAuthHeader} from '../../_helpers/auth-header';
import Loader from '../../Components/Loader';
import { AuthContext } from '../../Components/context';
import MovableView from 'react-native-movable-view';

import GetLocation from 'react-native-get-location'
import { SafeAreaView } from "react-native-safe-area-context";
// import Geocoder from 'react-native-geocoder';

// TODO: Convert to FC

const JobSearchScreen = ({route,navigation}) => {
  
  const [data,setData] = React.useState({
    searchKey:'',
    authTokenKey:'',
    isLoading: false,
  });
  // const { fromJobRefer } = route.params;

  let [isUserLoggedIn, setIsUserLoggedIn] = React.useState(false);
  let [isLocationLoading, setLocationLoading] = React.useState(false);
  let [searchLocation, setSearchLocation] = React.useState('');
  let [filtersArray, setfiltersArray] = React.useState('');
  let [locationArray, setLocationArray] = React.useState([]);
  const { signOut } = React.useContext(AuthContext);
  let [locationUpdated, setLocationUpdated] = React.useState(false);

  React.useLayoutEffect(() => {
		navigation.setOptions({
		title : 'Find jobs'
		});
	}, [navigation]);
	
  useEffect(() => {
    getAllDetails();
  }, []);

  const  getAllDetails = async () => {
    let user = await AsyncStorage.getItem('loginDetails'); 
    if(user) {
      let parsed = JSON.parse(user);  
      let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
      var encoded = base64.encode(userAuthToken);
      setData({...data,authTokenKey: encoded});
      getJobStatistics(encoded);
      setIsUserLoggedIn(true);
    }else{
      setIsUserLoggedIn(false);
    }
    
  }

  const textSearchKeyChange = (val) => {
    setData({...data,searchKey: val});
  }
  const textSearchLocationChange = (val) => {
    setSearchLocation(val);
    if (val.length > 2){
      getCurrentLocation(val);
    }else{
      setLocationArray([]);
    }
  }
  const searchJobs = (searchKey, searchLocation) => {
    navigation.navigate("JobsList", {
      searchKey: searchKey,
      location: searchLocation,
    });
  }

  const getJobStatistics = (authToken) => {
    setData({...data,isLoading: true});

    console.log('URL:',BaseUrl + EndPoints.JobStatistics);

    axios ({
      "method": "POST",
      "url": BaseUrl + EndPoints.JobStatistics,
      "headers": getAuthHeader(authToken),
      data:{"type":"jobs"}
    })
    .then((response) => {
      setData({...data,isLoading: false});
      if (response.data.code == 200){
        setfiltersArray(response.data.content.dataList[0].jobAlerts);
      }else if (response.data.code == 417){
        setData({...data,isLoading: false});
        const errorList = Object.values(response.data.content.messageList);
        Alert.alert(StaticMessage.AppName, errorList.join(), [
          {text: 'Ok'}
        ]);

      }else{

      }
    })
    .catch((error) => {
      setData({...data, isJobCountLoading: false});
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
  

  const getCurrentLocation = async (searchKey) => {
    setLocationLoading(true);
    let user = await AsyncStorage.getItem('loginDetails');  
    var token  = "U3RhZmZMaW5lQDIwMTc=";
    if(user){
        let parsed = JSON.parse(user);  
        let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
        token = base64.encode(userAuthToken);
    }

    axios ({
      "method": "POST",
      "url": BaseUrl + EndPoints.LocationSearch,
      "headers": getAuthHeader(token),
      data:{"searchString":searchKey}
    })
    .then((response) => {
      setLocationLoading(false);
      if (response.data.code == 200){
        console.log('Location Result:',JSON.stringify(response.data.content.dataList));
        setLocationArray(response.data.content.dataList);
        setLocationUpdated(!locationUpdated);
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
    setSearchLocation(locationName);
    setLocationArray([]);
    setLocationUpdated(!locationUpdated);
  }
  const handleCurrentLocation = () => {
    setData({...data,isLoading: true});
    GetLocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 15000,
    })
    .then(location => {
      setData({...data,isLoading: false});
        console.log(location);
        getLatLongAddress(location);
    })
    .catch(error => {
        const { code, message } = error;
        console.log('Location Error:',code, message);
        setData({...data,isLoading: false});
        if(code == 'UNAUTHORIZED'){
          console.log('Location is UNAUTHORIZED');
          Alert.alert("Would you like to see jobs based on your location?","Allow StafflinePro™ to access your location when you use the app.",
            [{
              text: 'Ok'
            },{
              text: 'Go to Settings',
              onPress: () => Linking.openSettings()
            }]
          )
        }

    })

  }
  const handleGoToSetting = () => {

  }
  const getLatLongAddress = async(location) => {
    setData({...data,isLoading: true});

    var NY = {
      lat: location.latitude,
      lng: location.longitude
    };
    let ret = await Geocoder.geocodePosition(NY);
    console.log(JSON.stringify(ret));
      setData({...data,isLoading: false});

    Geocoder.geocodePosition(NY).then(res => {
      setData({...data,isLoading: false});
      // res is an Array of geocoding object (see below)
      let placemark = res.length > 0 ? res[0] : {};
      let strCityName= placemark.locality;
      let strStateName = placemark.subAdminArea;
      let strCountryName = placemark.position.country;
      let locationName = strCityName + ', ' + strStateName;
      setSearchLocation(locationName);

      console.log(JSON.stringify(res));
    })
    .catch(err => {
      console.log(err);
      setData({...data,isLoading: false});
    })
  
  }
  const locationFound =  locationArray.length > 0 ? true : false;

  return (
    <ScrollView>
    <View style={styles.container}>
      {route.params ? 
      <View>
        <Text style={{fontFamily:FontName.Regular, fontSize:14,color:ThemeColor.SubTextColor, marginTop:16,marginBottom:8, textAlign:'center'}}>If you refer someone with the right qualifications needed for a specific job, we'll pay you a higher referral fee than simply referring or inviting a friend. Start by searching for jobs that match your friend's qualifications.</Text>
      </View> : null}
      <Text style={{textAlign: 'left',fontFamily:FontName.Regular, fontSize:16,color:'black', marginTop:24,marginBottom:16}}>Search for jobs</Text>
      <View style={{MarginTop:16, marginBottom:16}}>
        <View style={styles.inputView}>
        <Icon name="search-outline" color={'black'} size={20} />
        <TextInput  
          style={[styles.inputText,{marginRight:0}]}
          placeholder="Job title, skills or keywords" 
					placeholderTextColor={ThemeColor.PlaceHolderColor}
          keyboardType='email-address'
          value = {data.searchKey}
          clearButtonMode='while-editing'
          onChangeText={(val) => textSearchKeyChange(val)}
        />
        </View>
        <Text style={{fontFamily:FontName.Regular, fontSize:12,color:ThemeColor.HelpingTextColor, paddingLeft:8, marginTop:4}}>Enter job title, skills, keyword or company name</Text>
      </View>
      

      <View style={{}}>
        <View style={{flexDirection:'row'}}>
          <View style={[styles.inputView,{flex:1}]}>
            <Icon name="navigate-outline" color={'black'} size={20} />
            <TextInput  
              style={styles.inputText}
              placeholder="City, State" 
              placeholderTextColor={ThemeColor.PlaceHolderColor}
              keyboardType='email-address'
              value = {searchLocation}
              // clearButtonMode='while-editing'
              onChangeText={(val) => textSearchLocationChange(val)}
            />
            {isLocationLoading && <ActivityIndicator /> }
          </View>
          <TouchableOpacity style ={styles.btnTarget} onPress={ () => {handleCurrentLocation()}}> 
            <MaterialIcons name="gps-fixed" color={'gray'} size={24} />
          </TouchableOpacity>
        </View>
        <Text style={{fontFamily:FontName.Regular, fontSize:12,color:ThemeColor.HelpingTextColor, paddingLeft:8, marginTop:4}}>Enter city or state name</Text>
      </View>
      {/* {locationArray.length > 0 && 
      } */}
      {locationArray.length > 0 ?
        <FlatList style={{marginTop:0,height:locationArray.length > 3 ? 120 : locationArray.length * 30, backgroundColor:ThemeColor.BorderColor, borderRadius:5}}
          data={locationArray}
          keyExtractor={(item, index) => index.toString()}
          randomUpdateProp={locationUpdated}
          renderItem={({item}) => 
            <TouchableOpacity onPress={(event)=> {didSelectLocation(item)}}>
              <View style={{flex: 1,flexDirection:'row', height:30, margin_bottom:4,alignItems: 'center'}}>
                <Text style={{flex: 1, fontFamily: FontName.Regular, fontSize:14, marginLeft:16}}>{item.City_Name}, {item.State_Name}</Text>
              </View>
              <View style={{flex: 1,height:1, backgroundColor:'gray', marginLeft:16}}/> 
            </TouchableOpacity>
          }
        /> :  null
        }
     
      <TouchableOpacity style={styles.btnFill} onPress={() => {searchJobs( data.searchKey, searchLocation )}}>
        <Text style={{color:'#53962E',fontFamily: FontName.Regular, fontSize:16, color:'#fff' }}>FIND JOBS</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.btnLink} onPress={() => {searchJobs( '', '')}}>
        <Text style={{color:'#53962E',fontFamily: FontName.Regular, fontSize:16, color:ThemeColor.BtnColor }}>Show all jobs</Text>
      </TouchableOpacity>
      {filtersArray.length > 0 && <Text style={{textAlign: 'left',fontFamily:FontName.Regular, fontSize:16,color:'black', marginTop:16}}>Saved job alerts</Text>}
      <FlatList style={{marginTop:16}}
        data={filtersArray}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({item}) => 
          <View>
            <View style={{flex: 1,flexDirection:'row', height:40, margin_bottom:4,alignItems: 'center'}}>
              <Text style={{flex: 1, fontFamily: FontName.Regular, fontSize:14}}>{item.searchName}</Text>
              <Text style={{fontFamily: FontName.Bold, fontSize:16, color:ThemeColor.BtnColor, marginRight:4}}>0</Text>
              <Text style={{fontFamily: FontName.Regular, fontSize:14, width:30, color:ThemeColor.HelpingTextColor}}>Jobs</Text>
              <TouchableOpacity style ={{width:40,alignItems: 'flex-end', justifyContent: 'center'}}> 
                <Icon name="trash-outline" color={'gray'} size={20} />
              </TouchableOpacity>
            </View>
            <View style={{flex: 1,height:1, backgroundColor:ThemeColor.BorderColor}}/> 
          </View>
        }
      />
      <Loader isLoading={data.isLoading} />
      {isUserLoggedIn ?
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
      </MovableView> : null }
    </View>
    </ScrollView>
  );
  
}

export default JobSearchScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding:16,
    paddingTop:0,
  },inputView:{
    flexDirection:'row',
    paddingLeft:8,
    paddingRight:8,
    height:40,
    alignItems:"center",
    borderColor:ThemeColor.BorderColor,
    borderWidth:1,
    borderRadius:5
  },
  btnTarget:{
    width:40,
    height:40,
    marginLeft:12,
    alignItems:"center",
    borderColor:ThemeColor.BorderColor,
    borderWidth:1,
    borderRadius:5,
    alignItems: 'center', 
    justifyContent: 'center'
  },
  inputText:{
    flex: 1,
    height:40,
    color:"black",
    fontSize:14,
    fontFamily: FontName.Regular,
    marginLeft:8,
    marginRight:0,
    alignContent:'stretch'
  },inputImage: {
    width: 20,
    height: 20,
    tintColor:'black'
  },btnFill:{
    marginTop:32,
    borderRadius:5,
    height:40,
    justifyContent:"center",
    backgroundColor: ThemeColor.BtnColor,
    borderWidth:1,
    alignItems:'center',
    borderColor:ThemeColor.BtnColor
  },btnLink:{
    marginTop:16,
    height:40,
    justifyContent:"center",
    alignItems:'center',


  },

});