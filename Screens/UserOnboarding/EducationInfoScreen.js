import React ,{useEffect} from "react";
import { StatusBar, 
    StyleSheet, 
    Text,
    TouchableOpacity,
    Image,
    View,
    SafeAreaView,
    Alert,
    FlatList
} from "react-native";
import Feather from 'react-native-vector-icons/Feather';
import Icons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'
import axios from 'axios'
import {getAuthHeader} from '../../_helpers/auth-header';
import { BaseUrl, EndPoints, StaticMessage, ThemeColor, FontName } from '../../_helpers/constants';
import { AuthContext } from '../../Components/context';
import Loader from '../../Components/Loader';


const EducationInfoScreen = ({route,navigation}) => {
  const [data,setData] = React.useState({
    educationArray: [],
  });
  const { lookupData } = route.params;
  let [isLoading, setIsLoading] = React.useState(false);
  let [profileData, setProfileData] = React.useState('');

  React.useLayoutEffect(() => {
    navigation.setOptions({
        headerRight: () => (
            <TouchableOpacity style={{marginRight:16}} onPress={() => showLogOutAlert()}>
              <Feather name="more-vertical" color={'white'} size={25,25} />
            </TouchableOpacity>
        ),
    });
  }, [navigation]);

  useEffect(() => {
    navigation.addListener('focus', () => {
      getProfileDetails();
    })
    
  },[])
  const { signOut } = React.useContext(AuthContext);
  const showLogOutAlert = () =>{
    console.log('Log Out')
    Alert.alert('Are you sure want to log out?',null,
        [{
          text: 'Cancel',
        },{
            text: 'Log out',
            onPress: () => signOut()
          }]
      )
  }
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
            let profileDetail =  response.data.content.dataList[0];
            setData({...data,educationArray:profileDetail.educations})
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
      console.log(error);
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
    ) 
  }
  const handleSkipBtn = () => {
    console.log(`Profile Data: ${JSON.stringify(profileData)}`);
    let employeeTypeId = profileData ? profileData.empDetails.employeeTypeId : '1224';
    if(employeeTypeId == 1224){
      navigation.navigate('DesiredJob',{profileDetail: profileData,lookupData:lookupData});
    }else{
      navigation.navigate('Current project',{profileDetail: profileData,lookupData:lookupData});
    }
  }
  const handleNextBtn = () => {
    let employeeTypeId = profileData ? profileData.empDetails.employeeTypeId : '1224';
    if(employeeTypeId == 1224){
      navigation.navigate('DesiredJob',{profileDetail: profileData,lookupData:lookupData});
    }else{
      navigation.navigate('Current project',{profileDetail: profileData,lookupData:lookupData});
    }
  }
  const didSelectEducation = (selectedItem) => {
    console.log(selectedItem);
    navigation.navigate('AddEducation',{profileDetail: profileData,educationDetails:selectedItem,lookupData:lookupData})
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={{marginBottom:16, marginTop:16,flex:1}}>
        <View style={{paddingLeft: 20, paddingRight:16, justifyContent:'space-between', flexDirection:'row'}}>
          <Text style ={{color:ThemeColor.TextColor, fontSize:16,height:30, fontFamily:FontName.Regular,}}>My education</Text>
          <TouchableOpacity style={{flexDirection: 'row', alignContent:'center', marginRight:4}} onPress={() => {navigation.navigate('AddEducation',{profileDetail: profileData,lookupData:lookupData})}}>
            <Icons name="add-circle-outline" color={ThemeColor.BtnColor} size={20} />
            <Text style ={{color:ThemeColor.BtnColor, fontSize:16,fontFamily:FontName.Regular,marginLeft:4}}>Add new</Text>
          </TouchableOpacity>
        </View>
        <View style={{backgroundColor:ThemeColor.BorderColor, height:2,marginLeft:16, marginRight:16}}/>
        <FlatList style={{marginLeft:16,marginRight:16, borderRadius:5}}
            data={data.educationArray}
            keyExtractor={(item, index) => item.qualification}
            renderItem={({item}) => 
            <View>
            <TouchableOpacity style={{alignContent:'center', backgroundColor:'#fff'}} onPress={(event)=> {didSelectEducation(item)}}>
                <View style={{flexDirection:'row', alignItems:'center', paddingRight:8}}>
                  <View style={{paddingLeft:16,paddingTop:8, flex:1,marginRight:4}}>
                      <Text style={{flex: 1, fontFamily: FontName.Regular, fontSize:16,color:ThemeColor.TextColor, marginBottom:4}}>{item.qualification}</Text>
                      <Text style={{fontFamily: FontName.Regular, fontSize:14, color:ThemeColor.TextColor, marginBottom:4}}>{item.institutionName} - {item.passingYear}</Text>
                  </View>
                  <Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22,22} />
                </View>
                <View style={{marginLeft:16,flex: 1,height:1, backgroundColor:ThemeColor.BorderColor, marginTop:4, marginBottom:1}}/>
            </TouchableOpacity>
            </View>
            }
        />
      </View>
      <View style={{flexDirection:'row',borderRadius:5, marginLeft:16, marginRight:16, marginBottom:16}}>
        <TouchableOpacity style={[styles.btnFill,{backgroundColor:'white',borderTopLeftRadius:5,borderBottomLeftRadius:5}]} onPress={() => {handleSkipBtn()}}>
          <Text style={{color:'#53962E',fontFamily: FontName.Regular, fontSize:16, color:ThemeColor.BtnColor }}>SKIP</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btnFill,{borderBottomRightRadius:5,borderTopRightRadius:5}]} onPress={() => {handleNextBtn()}}>
          <Text style={{color:'#53962E',fontFamily: FontName.Regular, fontSize:16, color:'#fff' }}>NEXT</Text>
        </TouchableOpacity>
      </View>
      <Loader isLoading={isLoading} />
		</SafeAreaView>
	);
}

export default EducationInfoScreen;

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
  },
});