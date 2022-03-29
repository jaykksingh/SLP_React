/* eslint-disable react/display-name */
import React ,{useRef,createRef, useEffect}from "react";
import { StatusBar, 
      Text, 
      TouchableOpacity,
      StyleSheet, 
      View,
      Dimensions,
      Linking,
      ImageBackground,
      TextInput,
      Image,
      Alert,
      Modal,
      SafeAreaView,
      Platform
  } from "react-native";
import Video from 'react-native-video';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../../Components/context';
import Icon from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import { BaseUrl, EndPoints, StaticMessage ,ThemeColor} from '../../_helpers/constants';
import ReactNativeBiometrics from 'react-native-biometrics'
import base64 from 'react-native-base64'
import axios from 'axios'
import Loader from '../../Components/Loader';
import { authFreeHeader } from '../../_helpers/auth-header';
import { openComposer } from "react-native-email-link";
import '../../_helpers/global'
import RNExitApp from 'react-native-exit-app';


const width = Dimensions.get("window").width;
const height = Dimensions.get("window").height;

const SignInScreen = ({navigation}) => {
    const ref_input1 = useRef();
    const ref_input2 = useRef();
    const { signIn } = React.useContext(AuthContext);

    const [data,setData] = React.useState({
      loginID:'',
      password:'',
      secureTextEntry: true,
      isLoading: false,
      forgotPasswordVisible:false,
      userId: '',
    });
    const [bioPassword, setBioPassword] = React.useState('');
    const [alreadyLaunched, setAlreadyLaunched] = React.useState(null);
    useEffect( () => {
      global.chatMessageArray = [];
      checkForVideo();
      getLoginDetails();
    }, []);
    const getLoginDetails = async () => {
      let user = await AsyncStorage.getItem('username');  
      let token = await AsyncStorage.getItem('token');  
      setData({...data,username:user});
      setBioPassword(token);
    }

    const checkForVideo = async () => {
      let alreadyLaunched = await AsyncStorage.getItem('alreadyLaunched');  
      if(!alreadyLaunched){
        AsyncStorage.setItem('alreadyLaunched','1');
        setAlreadyLaunched('0');
      }else{
        console.log("alreadyLaunched:",alreadyLaunched);
        setAlreadyLaunched('1');
      }
  }
  const getBiometicButtonTitle =  () => {
    // const { biometryType } = await ReactNativeBiometrics.isSensorAvailable()
    var biometricBtnTitle = "SIGN IN USING FACE ID";
    ReactNativeBiometrics.isSensorAvailable()
    .then((resultObject) => {
      const { available, biometryType } = resultObject
      if (available && biometryType === ReactNativeBiometrics.TouchID) {
        console.log('TouchID is supported')
        biometricBtnTitle = "SIGN IN USING TOUCH ID";
      } else if (available && biometryType === ReactNativeBiometrics.FaceID) {
        console.log('FaceID is supported')
        biometricBtnTitle = "SIGN IN USING FACE ID";
      } else if (available && biometryType === ReactNativeBiometrics.Biometrics) {
        console.log('Biometrics is supported')
      } else {
        console.log('Biometrics not supported')
      }
    })
    return biometricBtnTitle;
  }
  const getBiometicButtonIcon =  () => {
    // const { biometryType } = await ReactNativeBiometrics.isSensorAvailable()
    ReactNativeBiometrics.isSensorAvailable()
    .then((resultObject) => {
      const { available, biometryType } = resultObject
   
      if (available && biometryType === ReactNativeBiometrics.TouchID) {
        console.log('TouchID is supported')
        return require('../../assets/Images/Touchid.png');
      } else if (available && biometryType === ReactNativeBiometrics.FaceID) {
        console.log('FaceID is supported')
        return require('../../assets/Images/FaceIcon.png');
      } else if (available && biometryType === ReactNativeBiometrics.Biometrics) {
        return require('../../assets/Images/FaceIcon.png');
      } else {
        console.log('Biometrics not supported')
      }
    })
    return require('../../assets/Images/FaceIcon.png');
  
  }
  const biometricLoginHandle = () => {
    ReactNativeBiometrics.simplePrompt({promptMessage: 'SIGN IN to StafflinePro'})
    .then((resultObject) => {
      const { success } = resultObject
      if (success) {
        console.log('successful biometrics provided')
        const password = base64.decode(bioPassword);
        console.log('Pasword: ', password);
        loginHandle(data.username, password);
      } else {
        console.log('user cancelled biometric prompt')
      }
    })
    .catch(() => {
      console.log('biometrics failed')
    })
  }
  const loginHandle = (userID,password) => {
  
    setData({...data,isLoading: true});
    console.log('Login : ',userID,password);

    axios ({
      "method": "POST",
      "url": BaseUrl + EndPoints.LoginEndPoint,
      "headers": authFreeHeader(),
      data:{"userName":userID, "password":password}
    })
    .then((response) => {
      setData({...data,isLoading: false});
      if (response.data.code == 200){
        let isMandatory = response.data.content.mandatory;
        if(response.data.content.dataList.length > 0){
          // setUpdateLoginDetails();
          const loginDetail = JSON.stringify(response.data.content.dataList[0])
          console.log('API Login: ',loginDetail);
          if(!isMandatory){
            try {
              AsyncStorage.setItem('loginDetails', loginDetail);
            } catch(e) {
              console.log(e);
            }
            let userAuthToken = 'StaffLine@2017:' + loginDetail.userAuthToken;
            var authToken = base64.encode(userAuthToken);    
            global.AccessToken = authToken;
            signIn(loginDetail);
          }else{
            Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
              {text: 'Ok'}
            ]);
          }
         
        }
        if( typeof response.data.content.mandatory != "undefined"){
          let message = response.data.content.info;
          Alert.alert(StaticMessage.AppName, message, [
            {
              text: 'Exit', 
              onPress: () => RNExitApp.exitApp()
            },
            {
              text: 'Update',
              onPress: () => handleClick()
            }
          ]);   
  
        }

      }else if (response.data.code == 417){
        console.log(Object.values(response.data.content.messageList));
        const errorList = Object.values(response.data.content.messageList);

        Alert.alert(StaticMessage.AppName, errorList.join(), [
          {text: 'Ok'}
        ]);
      }else{

      }
    })
    .catch((error) => {
      console.warn('Login Error: ',error);

      setData({...data,isLoading: false});
      Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
        {text: 'Ok'}
      ]);
    })
  }
  const handleClick = () => {
    let iosURL = "https://itunes.apple.com/in/app/stafflinepro-jobs-find-you/id1306795942?mt=8";
    Linking.canOpenURL(iosURL).then(supported => {
        supported && Linking.openURL(iosURL);
    }, (err) => console.log(err));
  }
  const setUpdateLoginDetails = async () => {
    if(data.password.length == 0){
      return;
    }
    const token = base64.encode(data.password); 
    const username = data.userID;
    AsyncStorage.setItem('username',username);
    AsyncStorage.setItem('token',token);
  
  }
  const forgotEmpIdHandle = () => {
    const message = 'Please contact our HR Representative at +1(606) 609-9011 X 1316 or write an email to hr@compunnel.com. One of our support staff will contact you at the earliest.'
    Alert.alert(StaticMessage.AppName, message, [
      {
        text: 'Ok', 
        onPress: () => console.log('Ask me later pressed')
      },
      {
        text: 'Contact support',
        onPress: () => openComposer({
          to: "support@stafflinepro.com",
          subject: "",
          body: "",
        })
      }
    ]);   
  }
  const forgotPasswodHandle = () => {
    setData({...data, userId:'',forgotPasswordVisible: !data.forgotPasswordVisible});
  }
  const forgotPswdHandle = (userName) => {
  
    setData({...data,isLoading: true});
    console.log(BaseUrl + EndPoints.ForgotPasswordEndPoint);
    axios ({
      "method": "POST",
      "url": BaseUrl + EndPoints.ForgotPasswordEndPoint,
      "headers": authFreeHeader(),
      data:{"userName":userName}
    })
    .then((response) => {
  
      if (response.data.code == 200){
        setData({...data,isLoading: false});
        forgotPasswordAlert();
      }else if (response.data.code == 417){
        setData({...data,isLoading: false});
        console.log(Object.values(response.data));
        const errorList = Object.values(response.data.content.messageList);
        Alert.alert(StaticMessage.AppName, errorList.join(), [
          {
            text: 'Ok',
          }
        ]);
      }else{
        setData({...data,isLoading: false});
      }
    }).catch((error) => {
      setData({...data,isLoading: false});
      console.log(error)
      Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
        {
          text: 'Ok'
        }
      ]);
    })
  }
  const handleVideoClose = () => {
    setAlreadyLaunched('1');
  }
  const onBuffer = () => {

  }
  const videoError = () => {

  }

  return (
    <ImageBackground
        resizeMode={'cover'} // or cover
        style={{flex: 1}} // must be passed from the parent, the number may vary depending upon your screen size
        source={require('../../assets/Images/LoginBG.png')}>
        {alreadyLaunched == '0' ?
          <View style={styles.videoView}>
            <Video source={require('../../assets/Video/stafflineProIntro.mp4')}   // Can be a URL or a local file.
              fullscreen={true}
              controls={true}
              fullscreenAutorotate={true} 
              fullscreen={true}  
              resizeMode="contain" 
              repeat={true}
              onBuffer={onBuffer()}                // Callback when remote video is buffering
              onError={videoError()}               // Callback when video cannot be loaded
              style={styles.videoContainer} >
            </Video>
            
            <TouchableOpacity style={{position:'absolute',top:32,right:8, height:40, width:40, justifyContent:'center', alignItems:'center'}} onPress ={() => {handleVideoClose()}} >
              <Icon name="close-circle-outline" color={ThemeColor.BtnColor} size={25} />
            </TouchableOpacity> 
              
          </View>
        :
        <SafeAreaView style={{justifyContent:'space-between', flex:1}}>
          <View style={{paddingLeft:16, paddingRight:16, marginTop:16,marginBottom:32}}>
            <Text style={styles.logo}>Sign In</Text>
            <Text style={styles.subLogo}>Welcome back</Text>
            <View style={styles.inputView}>
              <View style={{flexDirection: "row", alignItems:'center'}}>
                <Image style={styles.inputImage} source={require('../../assets/Images/user.png')} /> 
                <TextInput  
                  style={styles.inputText}
                  placeholder="Email or employee ID" 
                  placeholderTextColor={ThemeColor.PlaceHolderColor}
                  keyboardType='email-address'
                  clearButtonMode='while-editing'
                  value = {data.loginID}
                  onChangeText={(val) => {setData({...data, loginID:val})}}
                  returnKeyType='next'
                  onSubmitEditing={() => {ref_input1.current.focus()}}
                />
              </View>
              <View style={{backgroundColor:'#848484', height:0.7}}></View>
            </View>
            <View style={styles.inputView}>
              <View style={{flexDirection: "row", alignItems:'center'}}>
                <Image style={styles.inputImage} source={require('../../assets/Images/padlock.png')} /> 
                <TextInput  
                  style={styles.inputText}
                  placeholder="Password" 
                  placeholderTextColor={ThemeColor.PlaceHolderColor}
                  keyboardType='default'
                  clearButtonMode='while-editing'
                  value= {data.password}
                  secureTextEntry={data.secureTextEntry}
                  onChangeText={(val) => {setData({...data, password:val})}}
                  ref={ref_input1}
                />
                <TouchableOpacity onPress={() => {setData({...data,secureTextEntry : !data.secureTextEntry})}}>
                  <Image style={styles.inputImage} source={data.secureTextEntry ? require('../../assets/Images/eye_hidden.png') : require('../../assets/Images/eye.png') } /> 
                </TouchableOpacity>
              </View>
              <View style={{backgroundColor:'#848484', height:0.7}}></View>
            </View>
            <TouchableOpacity style={styles.loginBtn} onPress={() => {loginHandle( data.loginID, data.password )}}>
                <Text style={{color:'#53962E', fontSize:16 }}>SIGN IN</Text>
            </TouchableOpacity>
            {Platform.OS == 'ios' ?
            <TouchableOpacity style={styles.btnBiometreic} onPress={() => {biometricLoginHandle( data.username, data.password )}}>
              <Image style={{width: 30,height: 30, marginRight:4,tintColor:ThemeColor.BtnColor}} source={getBiometicButtonIcon()} /> 
              <Text style={{color:'#53962E', fontSize:16 }}>{getBiometicButtonTitle()}</Text>
            </TouchableOpacity> : 
            <TouchableOpacity style={styles.btnBiometreic} onPress={() => {biometricLoginHandle( data.username, data.password )}}>
              <Image style={{width: 30,height: 30, marginRight:4,tintColor:ThemeColor.BtnColor}} source={require('../../assets/Images/Touchid.png')} /> 
              <Text style={{color:'#53962E', fontSize:16 }}>SIGN IN USING FACE ID</Text>
            </TouchableOpacity>
           }
            <View style={{justifyContent:'space-between', flex:1, flexDirection:'row', height:40, alignItems:'center',paddingLeft:16,paddingRight:16, marginTop:16}}>
              <TouchableOpacity style={{flex:6, height:40}} onPress={() => forgotPasswodHandle()}>
                <Text style={{color:'#53962E',fontSize:14 }}>Forgot password?</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{flex:6, height:40,fontSize:14}} onPress={() => forgotEmpIdHandle()}>
                <Text style={{color:'#53962E',fontSize:14, textAlign:'right' }}>Forgot employee ID?</Text>
              </TouchableOpacity>
            </View>
          </View> 
          {/* <TouchableOpacity style={{height:40,alignItems:'center', justifyContent:'center'}}  onPress={() => testNotification1()}>
            <Text style={{color:'#53962E',fontSize:16, fontFamily: 'Lato-Italic', textAlign:'right' }}>SEND NOTIFICATION</Text>
          </TouchableOpacity> */}
          <TouchableOpacity style={{height:40,alignItems:'center', justifyContent:'center'}} onPress={() => navigation.navigate("SignUpScreen")} >
            <Text style={{color:'#53962E',fontSize:16, textAlign:'right' }}>Create a new account</Text>
          </TouchableOpacity>
        </SafeAreaView>
        }
      <Loader isLoading={data.isLoading} />
      <Modal            
        animationType = {"fade"}  
        transparent = {true}  
        visible = {data.forgotPasswordVisible}  
        onRequestClose = {() =>{ console.log("Modal has been closed.") } }>  
        <View style = {styles.modal}> 
          <View style={styles.navBar}>
            <View style={styles.leftContainer}>
              <Text style={[styles.text, {textAlign: 'left'}]}>
                {''}
              </Text>
            </View>
            <Text style={styles.text}> Forgot password </Text>
            <TouchableOpacity style={styles.rightContainer} onPress={() => forgotPasswodHandle()}>
            <Text style={[styles.text, {textAlign: 'left'}]}>Close</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.subLogo2}>To reset your password, enter your email address or employee ID you use to sign in</Text>
          
          <View style={styles.inputView}>
            <View style={{flexDirection: "row", alignItems:'center'}}>
              <Image style={[styles.inputImage,{tintColor:'black'}]} source={require('../../assets/Images/user.png')} /> 
              <TextInput  
                style={styles.inputText2}
                placeholder="Email or employee ID" 
                placeholderTextColor={ThemeColor.PlaceHolderColor}
                keyboardType='email-address'
                value = {data.userId}
                onChangeText={(val) => handleUserId(val)}
                onEndEditing={(e)=>handleUserId(e.nativeEvent.text)}
              />
            </View>
            <View style={{backgroundColor:'#848484', height:0.5}}></View>
          </View>      
          <TouchableOpacity style={styles.submitBtn} onPress={() => {forgotPswdHandle( data.userId )}}>
            <Text style={{color:'#53962E', fontSize:16, color:'#fff' }}>SUBMIT</Text>
          </TouchableOpacity>
        </View> 
        <Loader isLoading={data.isLoading} />

      </Modal> 
    </ImageBackground>

  );
}

export default SignInScreen;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#003f5c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo:{
    marginTop:12,
    fontSize:18,
    color:"#fff",
    marginBottom:24,
    alignSelf:'center'
  },
  subLogo:{
    fontSize:16,
    color:"#fff",
    marginBottom:2,
    marginBottom:24,
    alignSelf:'center'

  },
  subLogo2:{
    fontSize:16,
    color:"black",
    marginTop:8,
    marginBottom:8  ,
    padding:16,
    textAlign:"center"


  },
  inputView:{
    width:"100%",
    borderRadius:25,
    height:50,
    marginBottom:0,
    justifyContent:"center",
    padding:20
  },
  inputText:{
    flex: 1,
    height:35,
    color:"white",
    fontSize:14,
    marginLeft:8,
    marginRight:0,
    alignContent:'stretch',

  },
  inputText2:{
    flex: 1,
    height:35,
    color:"black",
    fontSize:14,
    marginLeft:8,
    marginRight:24,
    alignContent:'stretch'
  },
  loginBtn:{
    width:"90%",
    borderRadius:5,
    height:40,
    margin:16,
    justifyContent:"center",
    borderColor:'#53962E',
    borderWidth:1,
    alignItems:'center'
  },
  btnBiometreic:{
    width:"90%",
    borderRadius:5,
    height:40,
    justifyContent:"center",
    borderColor:'#53962E',
    borderWidth:1,
    alignItems:'center',
    margin:16,
    marginTop:8,
    flexDirection:'row'
  },
  textBtn:{
    flex:6,
    height:50,
    margin:16,
    justifyContent:"center",
    alignItems:'center',
    fontSize:16,
  },
  inputImage: {
    width: 20,
    height: 20,
    tintColor:'#fff'
  },
  modal: {  
    alignSelf:'center',
    backgroundColor : "#fff",   
    height: 290,  
    width: '90%',  
    borderRadius:5,  
    marginTop:140,
    overflow: 'hidden'   
  },  
  text: {  
    color: '#fff',  
    marginTop: 6  ,
    fontSize:18
  } ,
    navBar: {
    height: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor:'#2C84CC',
  },
  leftContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    backgroundColor: '#2C84CC',
  },
  rightContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginRight:16
  },
  submitBtn:{
    marginTop:32,
    width:"90%",
    borderRadius:5,
    height:40,
    margin:16,
    justifyContent:"center",
    backgroundColor:'#53962E',
    borderWidth:1,
    alignItems:'center',
    borderColor:'#53962E'


  },backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  videoContainer: {
    width: Dimensions.get('window').height,
    height: Dimensions.get('window').width,
    minWidth: Dimensions.get('window').height,
    minHeight: Dimensions.get('window').width,
    width: Dimensions.get('screen').height,
    height: Dimensions.get('screen').width,
    transform: [{ rotate: '90deg' }],
},videoView: {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
}

});