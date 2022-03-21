import 'react-native-gesture-handler';
import React ,{useEffect,useState}from 'react';
import { View ,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Alert,
    Text} from 'react-native';
import { TabView, SceneMap } from 'react-native-tab-view';
import { createStackNavigator } from '@react-navigation/stack';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from "react-native-vector-icons/FontAwesome";
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'
import axios from 'axios'
import DocumentPicker from 'react-native-document-picker';
// import RNFS from 'react-native-fs';
// import OpenFile from 'react-native-doc-viewer';

import { AuthContext } from '../../Components/context';
import {getAuthHeader} from '../../_helpers/auth-header';
import { BaseUrl, EndPoints, StaticMessage, ThemeColor, FontName } from '../../_helpers/constants';
import Loader from '../../Components/Loader';


const UserOnboardingStack  = createStackNavigator();
import BasicDetailsScreen from './BasicDetailsScreen';
import ProfessionInfo from './ProfessionInfo';
import EducationInfoScreen from './EducationInfoScreen';
import DesiredJobScreen from './DesiredJobScreen';
import CurrentProject from './CurrentProject';
import DomainScreen from '../Profile/DomainScreen';
import AddSkillScreen from '../Profile/AddSkillScreen';
import AddExperienceScreen from '../Profile/AddWorkExperienceScreen';
import AddEducationScreen from '../Profile/AddEducationScreen';
import ProfileDetailScreen from '../Profile/ProfileDetailScreen';
import EditProfileScreen from '../Profile/EditProfileScreen';


const UBHomeScreen = () => {
    return(
        <UserOnboardingStack.Navigator screenOptions={{
            headerStyle: {
                backgroundColor: ThemeColor.NavColor,
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
                fontWeight: 'bold'
            },
            headerBackTitleVisible: false
            }}>
            <UserOnboardingStack.Screen name="Getting Started" component={OnboardingScreen} />
            <UserOnboardingStack.Screen name="Basic details" component={BasicDetailsScreen} />
            <UserOnboardingStack.Screen name="Professional details" component={ProfessionInfo} />
            <UserOnboardingStack.Screen name="Education" component={EducationInfoScreen} />
            <UserOnboardingStack.Screen name="DesiredJob" component={DesiredJobScreen} />  
            <UserOnboardingStack.Screen name="Current project" component={CurrentProject} />
            <UserOnboardingStack.Screen name="Domain" component={DomainScreen} />
            <UserOnboardingStack.Screen name="Skill" component={AddSkillScreen} />
            <UserOnboardingStack.Screen name="Experience" component={AddExperienceScreen} />
            <UserOnboardingStack.Screen name="AddEducation" component={AddEducationScreen} />
            <UserOnboardingStack.Screen name="Edit profile" component={EditProfileScreen} />  

        </UserOnboardingStack.Navigator>
    );
};

const OnboardingScreen = ({navigation})  => {
    const [data,setData] = React.useState({
        resumeTitle:'',
        isLoading: false,
    });
    const { signOut } = React.useContext(AuthContext);
    const { loginDetail } = React.useContext(AuthContext);
    const [loggedInUser, setLoggedInUser] = useState('');
    let [profileData, setProfileData] = React.useState('');
    let [isLoading, setIsLoading] = React.useState(false);

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                 <TouchableOpacity style={{marginRight:16}} onPress={() => showLogOutAlert()}>
                   <Feather name="more-vertical" color={'white'} size={25,25} />
                </TouchableOpacity>
            ),
        });
    }, [navigation]);
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
    const SessionExpiredAlert = () =>{
  
        Alert.alert(StaticMessage.AppName,StaticMessage.SessionExpired,
            [{
              text: 'Ok',
              onPress: () => signOut()
          }]
      ) 
  }

    useEffect(() => {
        let loginDetails = loginDetail();
        console.log('BasicDetailsScreen:',loginDetails);
        if(loginDetails){
            setLoggedInUser(loginDetails);
        }
        getAllDetails();
    },[]);
    
    const  getAllDetails = async () => {
        let user = await AsyncStorage.getItem('loginDetails');  
        let parsed = JSON.parse(user);  
        let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
        var encoded = base64.encode(userAuthToken);    
        getProfileDetails(encoded);
      }
    const  getProfileDetails = (authToken) => {
        setIsLoading(true);
        axios ({  
          "method": "GET",
          "url": BaseUrl + EndPoints.UserProfile,
          "headers": getAuthHeader(authToken)
        })
        .then((response) => {
            setIsLoading(false);
            console.log('Session:',response);
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

            // if (error.response) {
            //     console.log(error.response.data);
            //     console.log(error.response.status);
            //     console.log(error.response.headers);
                
            // }
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
    const  updateProfileDetails = async(resumeData,resumeTitle) => {
        let user = await AsyncStorage.getItem('loginDetails');  
        let parsed = JSON.parse(user);  
        let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
        var authToken = base64.encode(userAuthToken);

        setIsLoading(true);
        const params = {
            "fileName":resumeTitle,
            'file':resumeData,
            'docName':resumeTitle,
            'fileType':'1702'
        }

        axios ({  
          "method": "PUT",
          "url": BaseUrl + EndPoints.UserProfile,
          "headers": getAuthHeader(authToken),
          data:{'documents':params}
        })
        .then((response) => {
          if (response.data.code == 200){
            const results = JSON.stringify(response.data.content)
            setIsLoading(false);
            navigation.navigate('Basic details',{profileDetail: profileData})
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
    
    const renderTabBar = (props) => {
        const inputRange = props.navigationState.routes.map((x, i) => i);

        return (
            <View style={styles.tabBar}>
                {props.navigationState.routes.map((route, i) => {
                const opacity = props.position.interpolate({
                    inputRange,
                    outputRange: inputRange.map((inputIndex) =>
                    inputIndex === i ? 1 : 0.5
                    ),
                });

                return (
                    <TouchableOpacity
                    style={styles.tabItem}
                    onPress={() => this.setState({ index: i })}>
                    <Animated.Text style={{ opacity }}>{route.title}</Animated.Text>
                    </TouchableOpacity>
                );
                })}
            </View>
        );
    };
    const handleSkipBtn = () => {
        navigation.navigate('Basic details',{profileDetail: profileData})
    }

    const selectResume = async () => {
        try {
            const res = await DocumentPicker.pick({
                type: [DocumentPicker.types.pdf,DocumentPicker.types.doc,DocumentPicker.types.docx,DocumentPicker.types.plainText],
            });
            console.log(res.uri,res.type, res.name,res.size);
            setData({...data,resumeTitle:res.name});
            var newURI = res.uri.split("%20").join("\ ");
            // var base64data = await RNFS.readFile( newURI, 'base64').then(res => { return res });
            // updateProfileDetails(base64data,res.name);
        } catch (err) {
            if (DocumentPicker.isCancel(err)) {
                // User cancelled the picker, exit any dialogs or menus and move on
            } else {
                throw err;
            }
        }
    }
    const viewResume = (resume) => {
        console.log('resume:', resume.filePath);
        // if(Platform.OS === 'ios'){
        //     //IOS
        //     OpenFile.openDoc([{
        //         url:resume.filePath,
        //         fileNameOptional:resume.fileName
        //     }], (error, url) => {
        //         if (error) {
        //         console.error(error);
        //         } else {
        //         console.log('Filte URL:',url)
        //         }
        //     })
        // }else{
        //     // Android
        //     OpenFile.openDoc([{
        //         url:resume.filePath, // Local "file://" + filepath
        //         fileName:resume.fileName,
        //         cache:false,
        //         fileType:"jpg"
        //     }], (error, url) => {
        //         if (error) {
        //         console.error(error);
        //         } else {
        //         console.log(url)
        //         }
        //     })
        // }
    }

    
    const empDetails = profileData.empDetails;
    const resumeArr = profileData ? profileData.resume : [];
    let resumeTitle = resumeArr.length> 0 ? resumeArr[0].fileName : '';
    return (
        <View style={styles.container}>
            <Text style={{fontFamily:FontName.bold, fontSize:18,color:ThemeColor.NavColor}}> Welcome, {empDetails ? empDetails.firstName : ''}!</Text>
            <Text style={{fontFamily:FontName.Regular, fontSize:14,color:ThemeColor.NavColor, marginTop:8}}> Let’s get started. Upload your resume for an instant analysis.</Text>
            { resumeArr.length > 0 &&
            <View style={{marginTop:16, flexDirection:'column',padding:16}}>
                <Text style={{fontFamily:FontName.Regular, fontSize:16,color:ThemeColor.TextColor, textAlign:'center'}}>Great news! We've analyzed your existing resume:</Text>
                <TouchableOpacity onPress = {() => {viewResume(resumeArr[0])}}>
                    <Text style={{fontFamily:FontName.Regular, fontSize:16,color:ThemeColor.NavColor, textAlign:'center'}}>{resumeTitle}</Text>
                </TouchableOpacity>
                <View style={{flexDirection:'row'}}>
                    <Text style={{fontFamily:'Lato-Italic', fontSize:16,color:ThemeColor.TextColor, textAlign:'center',marginRight:4}}>Do you have an updated version?  </Text>
                    <TouchableOpacity onPress = {() => {selectResume()}}>
                        <Text style={{fontFamily:FontName.Regular, fontSize:16,color:ThemeColor.NavColor, textAlign:'center'}}>UPLOAD NEW</Text>
                    </TouchableOpacity>
                </View>
            </View>}
            <View style={{flex:1, height:'100%', width:'100%',alignItems: 'center', justifyContent: 'center', marginBottom:160}}>
                <TouchableOpacity onPress = {() => {selectResume()}}>
                    <FontAwesome name="cloud-upload" color={ThemeColor.BtnColor} size={80} />
                </TouchableOpacity>
                <Text style={{fontFamily:FontName.Regular, fontSize:18,color:ThemeColor.SubTextColor, textAlign:'center', marginTop:16}}>Tap here to select a file to upload</Text>
                <Text style={{fontFamily:FontName.Regular, fontSize:14,color:ThemeColor.SubTextColor, textAlign:'center', marginTop:4}}>Maximum file size: 2MB</Text>
                {data.resumeTitle.length > 0 && <Text style={{fontFamily:FontName.Regular, fontSize:16,color:ThemeColor.SubTextColor, textAlign:'center', marginTop:16}}>{data.resumeTitle}</Text> }

            </View>
            <TouchableOpacity style={styles.btnFill} onPress={() => {handleSkipBtn()}}>
                <Text style={{color:'#53962E',fontFamily: FontName.Regular, fontSize:16, color:ThemeColor.BtnColor }}>SKIP</Text>
            </TouchableOpacity>
            <Loader isLoading={isLoading} /> 

        </View>
    );
  };

export default UBHomeScreen;


const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      alignItems: 'center' ,
      backgroundColor:'#E5E9EB' 
    },
    tabBar: {
      flexDirection: 'row',
      paddingTop: 0,
      backgroundColor:'#F6F6F6',
    },
    tabItem: {
      flex: 1,
      alignItems: 'center',
      padding: 16,
      fontSize: 10
    },btnFill:{
        width:'100%',
        margin: 16,
        height:50,
        justifyContent:"center",
        backgroundColor:'#fff' ,
        alignItems:'center',
        borderRadius:5,
      }
  });

    