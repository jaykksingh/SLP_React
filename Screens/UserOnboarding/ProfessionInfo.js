import React ,{useEffect,useState,createRef} from "react";
import { StatusBar, 
    StyleSheet, 
    Text,
    TouchableOpacity,
    Image,
    View,
    ScrollView,
    Alert,
    FlatList,
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Feather from 'react-native-vector-icons/Feather';
import Icons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import base64 from 'react-native-base64'
import axios from 'axios'
import {getAuthHeader} from '../../_helpers/auth-header';
import { BaseUrl, EndPoints, StaticMessage, ThemeColor,FontName } from '../../_helpers/constants';
import { AuthContext } from '../../Components/context';
import Loader from '../../Components/Loader';


const ProfessionInfo = ({route,navigation}) => {
  const [data,setData] = React.useState({
    skillsArray:[],
    liceAndCertArray:[],
    experienceArray:[],
    loginDetails: {}
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
    getProfileDetails();

  },[])

  const { signOut } = React.useContext(AuthContext);
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
            setData({...data,
              skillsArray:profileDetail.skills,
              liceAndCertArray:profileDetail.licensesAndCertifications,
              experienceArray:profileDetail.experiences
            })
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
    ) 
  }
  const handleSkipBtn = () => {
    navigation.navigate('Education',{profileDetail: profileData, lookupData:lookupData})
  }
  const handleNextBtn = () => {
    navigation.navigate('Education',{profileDetail: profileData,lookupData:lookupData})
  }
 
  const didSelectSkills = (selectedItem) => {
    console.log(selectedItem);
    navigation.navigate('Skill',{profileDetail: profileData,skillDetails:selectedItem})
  }
  const didSelectWorkExperience = (selectedItem) => {
    console.log(selectedItem);
    navigation.navigate('Experience',{profileDetail: profileData,experienceDetails:selectedItem,lookupData:lookupData})
  }
  const showAlert = () => {
    Alert.alert(StaticMessage.AppName,'Are sure want to delete?',
        [{
          	text: 'Cancel',
        },
		{
            text: 'Delete',
            onPress: () => deleteProfileDetails(skill.candidateSkillId)
        }]
      )
  }
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={{marginBottom:16}} keyboardShouldPersistTaps='handled'>
        <View style={{paddingLeft: 20, paddingRight:16, justifyContent:'space-between', flexDirection:'row', marginTop:16}}>
          <Text style ={{color:ThemeColor.TextColor, fontSize:16,height:30, fontFamily:FontName.Regular,}}>Skills</Text>
          <TouchableOpacity style={{flexDirection: 'row', alignContent:'center', marginRight:4}}  onPress={() => {navigation.navigate('Skill',{profileDetail: profileData,lookupData:lookupData})}}>
            <Icons name="add-circle-outline" color={ThemeColor.BtnColor} size={20,20} />
            <Text style ={{color:ThemeColor.BtnColor, fontSize:16,fontFamily:FontName.Regular,marginLeft:4}}>Add skill</Text>
          </TouchableOpacity>
        </View>
        <View style={{backgroundColor:ThemeColor.BorderColor, height:2,marginLeft:16, marginRight:16}}/>
        <FlatList style={{marginLeft:16,marginRight:16, borderRadius:5}}
            data={data.skillsArray}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item}) => 
            <View style={{borderRadius:5}}> 
            <TouchableOpacity style={{alignContent:'center', backgroundColor:'#fff'}} onPress={(event)=> {didSelectSkills(item)}}>
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
            </TouchableOpacity>
            </View>
            }
        />
        <Loader isLoading={isLoading} />
        
        <View style={{paddingLeft: 20, paddingRight:16, marginTop:24, justifyContent:'space-between', flexDirection:'row'}}>
          <Text style ={{color:ThemeColor.TextColor, fontSize:16,height:30, fontFamily:FontName.Regular,}}>Licence / Certifications</Text>
          <TouchableOpacity style={{flexDirection: 'row', alignContent:'center', marginRight:4}} onPress={() => {navigation.navigate('Edit profile',{profileDetail: profileData,lookupData:lookupData,dataType:'Licence'})}}>
            <Icons name="add-circle-outline" color={ThemeColor.BtnColor} size={20} />
            <Text style ={{color:ThemeColor.BtnColor, fontSize:16,fontFamily:FontName.Regular,marginLeft:4}}>Add</Text>
          </TouchableOpacity>
        </View>
        <View style={{backgroundColor:ThemeColor.BorderColor, height:2,marginLeft:16, marginRight:16}}/>
        <FlatList style={{marginTop:8, marginLeft:8, marginRight:16, marginBottom:8}}
            horizontal
            data={data.liceAndCertArray}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item}) => 
              <View>
                <TouchableOpacity style={[styles.chipItem, {backgroundColor:'white'}]} onPress={() => {navigation.navigate('Edit profile',{profileDetail: profileData,lookupData:lookupData,dataType:'Licence',licenceDict:item})}}>
                  <Text style={[styles.chipTitle, {color:ThemeColor.BtnColor}]}>{item.certificateExamName}</Text>
                </TouchableOpacity>
              </View>
            }
          />
        
        <View style={{paddingLeft: 20, paddingRight:16, marginTop:24, justifyContent:'space-between', flexDirection:'row'}}>
          <Text style ={{color:ThemeColor.TextColor, fontSize:16,height:30, fontFamily:FontName.Regular,}}>Work experience</Text>
          <TouchableOpacity style={{flexDirection: 'row', alignContent:'center', marginRight:4}} onPress={() => {navigation.navigate('Experience',{lookupData:lookupData})}}>
            <Icons name="add-circle-outline" color={ThemeColor.BtnColor} size={20,20} />
            <Text style ={{color:ThemeColor.BtnColor, fontSize:16,fontFamily:FontName.Regular,marginLeft:4}}>Add experience</Text>
          </TouchableOpacity>
        </View>
        <View style={{backgroundColor:ThemeColor.BorderColor, height:2,marginLeft:16, marginRight:16}}/>
        <FlatList style={{marginLeft:16,marginRight:16, borderRadius:5}}
            data={data.experienceArray}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item}) => 
            <View>
            <TouchableOpacity style={{alignContent:'center', backgroundColor:'#fff'}} onPress={(event)=> {didSelectWorkExperience(item)}}>
                <View style={{flexDirection:'row', alignItems:'center', paddingRight:8}}>
                  <View style={{paddingLeft:16,paddingTop:8, flex:1,marginRight:4}}>
                      <Text style={{flex: 1, fontFamily: FontName.Regular, fontSize:16,color:ThemeColor.TextColor, marginBottom:4}}>{item.positionTitle}</Text>
                      <Text style={{fontFamily: FontName.Regular, fontSize:14, color:ThemeColor.TextColor, marginBottom:4}}>{item.employerName}</Text>
                      <Text style={{fontFamily: FontName.Regular, fontSize:14, color:ThemeColor.TextColor, marginBottom:4}}>{item.positionStartDate} - {item.positionStartDate.length > 0 && item.positionEndDate.length == 0 ?'Present' :item.positionEndDate}</Text>

                  </View>
                  <Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22,22} />

                </View>
                <View style={{marginLeft:16,flex: 1,height:1, backgroundColor:ThemeColor.BorderColor, marginTop:4, marginBottom:1}}/>
            </TouchableOpacity>
            </View>
            }
        />
      </ScrollView>
      <View style={{flexDirection:'row',borderRadius:5,  marginLeft:16, marginRight:16,marginBottom:16}}>
        <TouchableOpacity style={[styles.btnFill,{backgroundColor:'white',borderTopLeftRadius:5,borderBottomLeftRadius:5}]} onPress={() => {handleSkipBtn()}}>
          <Text style={{color:'#53962E',fontFamily: FontName.Regular, fontSize:16, color:ThemeColor.BtnColor }}>SKIP</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btnFill,{borderBottomRightRadius:5,borderTopRightRadius:5}]} onPress={() => {handleNextBtn()}}>
          <Text style={{color:'#53962E',fontFamily: FontName.Regular, fontSize:16, color:'#fff' }}>NEXT</Text>
        </TouchableOpacity>
      </View>
		</SafeAreaView>
	);
}

export default ProfessionInfo;

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