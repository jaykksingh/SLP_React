  /* eslint-disable react/display-name */
import React,{useRef,createRef} from "react";
import { StyleSheet, 
    View,
    Linking,
    ImageBackground,
    Image,
    ScrollView,
    SafeAreaView,
    Text,
    TouchableOpacity,
    TextInput,
    Alert} from "react-native";

import axios from 'axios'
import { authFreeHeader } from '../../_helpers/auth-header';
import { AuthContext } from '../../Components/context';
import {parseErrorMessage} from '../../_helpers/Utils';
import { BaseUrl, EndPoints, StaticMessage ,ThemeColor} from '../../_helpers/constants';
import {Picker} from '@react-native-picker/picker';
import Loader from '../../Components/Loader';
import Feather from 'react-native-vector-icons/Feather';
import {default as ActionSheetView} from 'react-native-actions-sheet';

const actionSheetRef = createRef();

// TODO: Convert to FC
const SignUpScreen = ({navigation}) => {

    const [data,setData] = React.useState({
      firstName:'',
      lastName:'',
      password:'',
      email:'',
      workPermit:'United State',
      check_textInputChange:false,
      selectedBtn: '',
      secureTextEntry: true,
      isLoading: false
    });
    const CH_Text = 'Join our specialized experience for the healthcare workforce. Whether you are a Nurse, Medical Assistant, Medical Receptionist or Healthcare Administrator Compunnel Healthcare is the place for you. Head to Compunnel Healthcare to get started.';
    const { signIn } = React.useContext(AuthContext);
    const { skipLogin } = React.useContext(AuthContext);

    const ref_input1 = useRef();
    const ref_input2 = useRef();
    const ref_input3 = useRef();

    let actionSheet;

    React.useEffect(() => {
    },[]);

    const handleLnameChange = (val) => {
      setData({
        ...data,
        lastName: val
      });
    }
   
    const handleFnameChange = (val) => {
      setData({
        ...data,
        firstName: val
      });

    }
   
    const handleEmailChange = (val) => {
      setData({
        ...data,
        email: val
      });

    }
   
    const handlePasswordChange = (val) => {
      setData({
        ...data,
        password: val,
        isValidPassword: true
      });
    }


  const signupHandle = (fName, lName,email,password) => {
    
    var companyGroup = 0;
    if(data.workPermit == 'United State'){
      companyGroup = 1;
    }else if(data.workPermit == 'India'){
      companyGroup = 5;
    }else if(data.workPermit == 'Canada'){
      companyGroup = 6;
    }

    setData({...data,isLoading: true});
    console.log(BaseUrl + EndPoints.SignUpUserEndPoint);
    axios ({
      "method": "POST",
      "url": BaseUrl + EndPoints.SignUpUserEndPoint,
      "headers": authFreeHeader(),
      data:{"firstName":fName, 
      "lastName":lName,
      "email":email,
      "password":password,
      "userDomain":"y",
      "companyGroup":companyGroup,
      "termsAndConditions":"1",
      "selectWorkAuthName":'Dependent Visa',
      "selectWorkAuth":77
      }
    }).then((response) => {
      setData({...data,isLoading: false});
      if (response.data.code == 200){
        const msgList = Object.values(response.data.content.messageList);
        Alert.alert(StaticMessage.AppName, msgList.join(), [
          {
            text: 'Ok',
            onPress: () => navigation.goBack()
          }
        ]);

         
      }else if (response.data.code == 417){
        const message = parseErrorMessage(response.data.content.messageList);

        Alert.alert(StaticMessage.AppName, message, [
          {text: 'Ok'}
        ]);
      }else{
        }
    }).catch((error) => {
      setData({...data,isLoading: false});
      console.log(error)
      Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
        {text: 'Ok'}
      ]);
    })
  }
    
  const handleRedirect = () => {
    Linking.canOpenURL('nursedeck://').then(supported => {
      if (supported) {
        Linking.openURL('nursedeck://');
      } else {
        console.log('cannot open url')
        Linking.openURL('https://apps.apple.com/us/app/nursedeck-medical-job-tool/id1171747847');
      }
    });
  };

  const handlePrivacyPolicy = () => {
    navigation.navigate("PrivacyAndTerms", {urlToLoad: "https://www.stafflinepro.com/privacy-policy",urlType: "Privacy"});
  }
  const handleTermsOfUse = () => {
    navigation.navigate("PrivacyAndTerms", {urlToLoad: "https://www.stafflinepro.com/terms",urlType: "Terms"});
  }

  
  return (
      
    <View style={{flex:1, backgroundColor:'black'}}>
       <ImageBackground
        resizeMode={'stretch'} // or cover
        style={{flex: 1}} // must be passed from the parent, the number may vary depending upon your screen size
        source={require('../../assets/Images/LoginBG.png')}
      >
        <ScrollView>
          <SafeAreaView style={{flex:1, alignItems: 'center', justifyContent: 'center'}}>
              <View style={{alignItems: 'center',justifyContent: 'center', width:'100%', marginBottom:32,marginTop:16}}>
                <Text style={[styles.logo,{}]}>Elevate Your Career</Text>
                <TouchableOpacity style={{position:'absolute', right:16, padding:8}} onPress={() => skipLogin()} >
                  <Text style={{fontSize:16,color:"#fff"}}>Skip</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.subTitle}>Create your account - it's free</Text>
              <Text style={{fontSize:16, color:"#fff", fontSize:16,alignSelf: 'flex-start', paddingLeft:24}}>Is your background mostly in Healthcare?</Text>
              
              <View style={{flexDirection: "row", alignSelf: 'flex-start', paddingLeft:24,marginTop:8}}>
                <TouchableOpacity style={{height:30,flexDirection: "row", alignSelf: 'flex-start'}} onPress={() => setData({...data,selectedBtn: 'yes'})}>
                  {data.selectedBtn == 'yes' ? 
                    <Image style={styles.radioImage} source={require('../../assets/Images/radion_select.png')} /> : 
                    <Image style={styles.radioImage} source={require('../../assets/Images/radion_unselect.png')} /> }
                  <Text style={{color:'white',width:60, fontSize:14,marginLeft:8}}>Yes</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{height:30,flexDirection: "row", alignSelf: 'flex-start'}} onPress={() => setData({...data,selectedBtn: 'no'})}>
                  {data.selectedBtn == 'no' ? 
                    <Image style={styles.radioImage} source={require('../../assets/Images/radion_select.png')} /> : 
                    <Image style={styles.radioImage} source={require('../../assets/Images/radion_unselect.png')} /> }
                  <Text style={{color:'white',width:60, fontSize:14,marginLeft:8}}>No</Text>
                </TouchableOpacity>
                </View>
              {(data.selectedBtn == 'no' || data.selectedBtn == '') ?
              <>
              <View style={styles.inputView}>
                <View style={{flexDirection: "row", alignItems:'center'}}>
                    <Image style={styles.inputImage} source={require('../../assets/Images/user.png')} /> 
                    <View style={{flexDirection: "row", alignItems:'center', flex: 1}}>
                    <TextInput  
                      style={styles.inputText}
                      placeholder="First name" 
					            placeholderTextColor={ThemeColor.PlaceHolderColor}
                      keyboardType='default'
                      value = {data.firstName}
                      onChangeText={(val) => handleFnameChange(val)}
                      onEndEditing={(e)=>handleFnameChange(e.nativeEvent.text)}
                      returnKeyType='next'
                      onSubmitEditing={() => {ref_input1.current.focus()}}

                    />
                    <TextInput  
                      style={styles.inputText}
                      placeholder="Last name" 
                      returnKeyType='next'
                      placeholderTextColor={ThemeColor.PlaceHolderColor}
                      keyboardType='default'
                      value = {data.lastName}
                      onChangeText={(val) => handleLnameChange(val)}
                      onEndEditing={(e)=>handleLnameChange(e.nativeEvent.text)}
                      onSubmitEditing={() => {ref_input2.current.focus()}}
                      ref={ref_input1}

                    />
                    </View>
                </View>
                <View style={{backgroundColor:'#848484', height:1}}></View>
              </View>
              <View style={styles.inputView}>
              <View style={{flexDirection: "row", alignItems:'center'}}>
                  <Image style={styles.inputImage} source={require('../../assets/Images/envelope.png')} /> 
                  <TextInput  
                    style={styles.inputText}
                    placeholder="Email" 
                    returnKeyType='next'
                    placeholderTextColor={ThemeColor.PlaceHolderColor}
                    keyboardType='email-address'
                    value = {data.email}
                    onChangeText={(val) => handleEmailChange(val)}
                    onEndEditing={(e)=>handleEmailChange(e.nativeEvent.text)}
                    ref={ref_input2}
                    onSubmitEditing={() => {ref_input3.current.focus()}}

                  />
              </View>
              <View style={{backgroundColor:'#848484', height:1}}></View>
              </View>
              <View style={styles.inputView}>
                <View style={{flexDirection: "row", alignItems:'center'}}>
                  <Image style={styles.inputImage} source={require('../../assets/Images/padlock.png')} /> 
                    <TextInput  
                    style={styles.inputText}
                    placeholder="Password" 
                    placeholderTextColor={ThemeColor.PlaceHolderColor}
                    keyboardType='default'
                    value= {data.password}
                    secureTextEntry
                    onChangeText={(val) => handlePasswordChange(val)}
                    ref={ref_input3}

                    />
                </View>
                <View style={{backgroundColor:'#848484', height:1}}></View>
              </View>
              {Platform.OS === 'ios' ? 
              <View style={[styles.inputView,{marginLeft:0}]}>
                <TouchableOpacity style={{height:40, flexDirection:'row', alignItems:'center', marginTop:12}} onPress={() => {actionSheetRef.current?.setModalVisible()}}>
                    {data.workPermit.length > 0 && data.workPermit == 'United State' && <Image style={[styles.inputImage,{marginRight:8}]} source={require('../../assets/Images/united-states.png')} /> }
                    {data.workPermit.length > 0 && data.workPermit == 'India' && <Image style={[styles.inputImage,{marginRight:8}]} source={require('../../assets/Images/india.png')} /> }
                    {data.workPermit.length > 0 && data.workPermit == 'Canada' && <Image style={[styles.inputImage,{marginRight:8}]} source={require('../../assets/Images/canada.png')} /> }
                    <Text style={[styles.labelText,{color:data.workPermit.length > 0 ? 'white' : ThemeColor.PlaceHolderColor, marginLeft:0}]}>{data.workPermit.length >0 ? data.workPermit : 'Permit to work in country'}</Text>
                    <Feather name="chevron-right" color={ThemeColor.SubHeaderColor} size={22} />
                </TouchableOpacity>                
                <View style={{backgroundColor:'#848484', height:1}}></View>
              </View> :
              <View style={[styles.inputView,{marginLeft:0}]}>
                <TouchableOpacity style={{height:40, flexDirection:'row', alignItems:'center', marginTop:12}} onPress={() => {actionSheetRef.current?.setModalVisible()}}>
                    {data.workPermit.length > 0 && data.workPermit == 'United State' && <Image style={[styles.inputImage]} source={require('../../assets/Images/united-states.png')} /> }
                    {data.workPermit.length > 0 && data.workPermit == 'India' && <Image style={[styles.inputImage]} source={require('../../assets/Images/india.png')} /> }
                    {data.workPermit.length > 0 && data.workPermit == 'Canada' && <Image style={[styles.inputImage]} source={require('../../assets/Images/canada.png')} /> }
                    <Picker
                      style={{flex:1,color:'white'}}
                      itemStyle={{fontSize:16}}
                      selectedValue={data.workPermit}
                      mode="dropdown" // Android only
                      onValueChange={(itemValue, itemIndex) =>
                        setData({
                          ...data,
                          workPermit: itemValue
                        })
                      }>
                      <Picker.Item label="United State" value="United State" />
                      <Picker.Item label="India" value="India" />
                      <Picker.Item label="Canada" value="Canada" />
                  </Picker>
                </TouchableOpacity>
                <View style={{backgroundColor:'#848484', height:1}}></View>
              </View> 
              }
              
            
              <View style={styles.textPrivate}>
                  <View style={{}}>
                    <Text style={{color:'white', fontSize:14}}> By clicking Sign up, you agree to the</Text>
                  </View>
                  <View style={{flexDirection:'row',marginTop:4, justifyContent: 'center',alignItems: 'center', height:20}}>
                    <TouchableOpacity onPress={() => {handleTermsOfUse()}}>
                      <Text style={[styles.color_textPrivate]}>Terms of use</Text>
                    </TouchableOpacity>
                    <Text style={{color:'white',  fontSize:14,marginLeft:4, marginRight:4}}>and</Text>
                    <TouchableOpacity onPress={() => {handlePrivacyPolicy()}}>
                      <Text style={[styles.color_textPrivate]}>Privacy policy</Text>
                    </TouchableOpacity>
                  </View>
              </View>
              <TouchableOpacity style={styles.loginBtn} onPress={() => {signupHandle( data.firstName, data.lastName, data.email,data.password)}}>
                  <Text style={{color:'#53962E',fontSize:16 }}>SIGN UP</Text>
              </TouchableOpacity>
              {/* {this.state.isLoading && <ActivityIndicator color={"#fff"} />} */}
              <Loader isLoading={data.isLoading} />
              </> : 
              <View style={{flex:1, alignContent:'stretch'}}> 
                <Text style={{fontSize:16, color:"#fff", fontSize:16,alignSelf: 'flex-start', padding:16, textAlign: 'justify'}}>{CH_Text}</Text>
                <TouchableOpacity style={styles.btnRedirect} onPress={() => handleRedirect()}>
                  <Text style={{color:'#fff',fontSize:16,  }}>Go to Compunnel Healthcare</Text>
                </TouchableOpacity>

              </View> }
          </SafeAreaView>
        </ScrollView>
        <SafeAreaView style={{alignItems: 'center', width:'100%', position: 'absolute',bottom: 0}}>
          <TouchableOpacity style={{height:40,width:'90%',alignItems:'center'}} onPress={() => navigation.goBack()} >
            <Text style={{color:'#53962E',fontSize:16, textAlign:'right',  }}>Already have an account? Sign In</Text>
          </TouchableOpacity>
        </SafeAreaView>
        <Loader isLoading={data.isLoading} />
        <ActionSheetView ref={actionSheetRef} containerStyle={{backgroundColor:ThemeColor.ViewBgColor}}>
          <View style={{height:300}}>
            <View style={{height:60, flexDirection:'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft:16,paddingRight:16}}>
              <TouchableOpacity onPress={() => {actionSheetRef.current?.setModalVisible()}}>
                <Text style={{color:ThemeColor.BtnColor, fontSize:16}}>Cancel</Text>
              </TouchableOpacity>
              <Text style={{color:ThemeColor.TextColor, fontSize:18}}>Permit to work in country</Text>
              <TouchableOpacity onPress={() => {actionSheetRef.current?.setModalVisible()}}>
                <Text style={{color:ThemeColor.BtnColor, fontSize:16}}>Done</Text>
              </TouchableOpacity>
            </View>
            <Picker
              style={{backgroundColor: 'white',flex:1,}}
              itemStyle={{fontSize:16}}
              selectedValue={data.workPermit}
              mode="dropdown" // Android only
              onValueChange={(itemValue, itemIndex) =>
                setData({
                  ...data,
                  workPermit: itemValue
                })
              }>
              <Picker.Item label="United State" value="United State" />
              <Picker.Item label="India" value="India" />
              <Picker.Item label="Canada" value="Canada" />

            </Picker>
          </View>
        </ActionSheetView>
      </ImageBackground>
    </View>
  );
}

export default SignUpScreen;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#003f5c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo:{
    fontSize:18,
    color:"#fff",
  },
  radioImage: {
    width: 16,
    height: 16,
    tintColor:'#fff'
  },
  inputImage: {
    width: 20,
    height: 20
  },
  subTitle:{
    fontSize:16,
    color:"#fff",
    marginBottom:48,
  },
  inputView:{
    width:"100%",
    borderRadius:25,
    height:45,
    justifyContent:"center",
    paddingLeft:20, paddingRight:20
  },
  inputText:{
    flex: 1,
    height:35,
    color:"white",
    marginLeft:8,
    marginRight:24,
    alignContent:'stretch',
    
    fontSize:14

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
  btnRedirect:{
    borderRadius:5,
    height:40,
    margin:16,
    justifyContent:"center",
    borderColor:'#53962E',
    backgroundColor:'#53962E',
    borderWidth:1,
    alignItems:'center',
    flex: 1
  },
  textBtn:{
    flex:6,
    height:40,
    margin:16,
    justifyContent:"center",
    alignItems:'center'
  },textPrivate: {
    flexDirection: 'column',
    flexWrap: 'wrap',
    padding:24,
    justifyContent: 'center',
},
color_textPrivate: {
    color: '#53962E', fontSize:14
},labelText:{
  flex: 1,
  color:'black',
  fontSize:14,
  
  marginLeft:8,
  alignContent:'stretch',
},

});