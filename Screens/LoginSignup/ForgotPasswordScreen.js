/* eslint-disable react/display-name */
import React from "react";
import { StatusBar, 
    Text, 
    TouchableOpacity,
    StyleSheet, 
    View,
    Button,
    ScrollView,
    Modal,
    TextInput,
    Image,
    Alert
} from "react-native";

import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { openComposer } from "react-native-email-link";

import axios from 'axios'
import Loader from '../components/Loader';
import { API } from '../_networkCall/api';
import { authHeader, authHeaderMultipart } from '../_helpers/auth-header';
import { BaseUrl, EndPoints, StaticMessage } from '../_helpers/constants';
import { AuthContext } from '../components/context';
import {parseErrorMessage} from '../_helpers/Utils';


// TODO: Convert to FC
const ForgotPasswordScreen = ({navigation}) => {

    const [data,setData] = React.useState({
      username:'',
      isLoading: false
    });
    const { signIn } = React.useContext(AuthContext);

    const textInputChange = (val) => {
        setData({
            ...data,
            username: val,
            check_textInputChange: true,
        });
    }


    const loginHandle = (userName, password) => {
        if ( data.username.length == 0 || data.password.length == 0 ) {
            Alert.alert(StaticMessage.AppName, 'Username or password field cannot be empty.', [
                {text: 'Ok'}
            ]);
            return;
        }
        setData({...data,isLoading: true});

        axios ({
            "method": "POST",
            "url": BaseUrl + EndPoints.LoginEndPoint,
            "headers": authHeader(),
            data:{"userName":userName, "password":password}})
            .then((response) => {
            setData({...data,isLoading: false});

            if (response.data.code == 200){
                const loginDetail = JSON.stringify(response.data.content.dataList[0])
                console.log(loginDetail);
                // Alert.alert(info)
                try {
                AsyncStorage.setItem('loginDetails', loginDetail);
                } catch(e) {
                console.log(e);
                }
                signIn(loginDetail);

            }else if (response.data.code == 417){
                // const errorList = JSON.stringify(response.data.content.messageList)
                const message = parseErrorMessage(response.data.content.messageList);
                Alert.alert(StaticMessage.AppName, message, [
                  {text: 'Ok'}
                ]);
            }else{

            }
            }).catch((error) => {
                console.log(error)
            })
    }

    return (
        
      <View style={{flex:1, flexDirection:'column'}}>
            <View style={{height:88, backgroundColor:'#2C84CC',flexDirection:'column-reverse'}}>
                <Text style={{color:'#fff',height:44, textAlign:'center', fontFamily: 'Lato-Regular', fontSize:18}}>Forgot password</Text>
            </View>
        <ScrollView>
            <SafeAreaView style={{flex:1, alignItems: 'center', justifyContent: 'center'}}>
              <Text style={styles.subLogo}>To reset your password, enter your email address or employee ID you use to sign in</Text>
              <View style={styles.inputView}>
                <View style={{flexDirection: "row", alignItems:'center'}}>
                  <Image style={styles.inputImage} source={require('../assets/Images/user.png')} /> 
                  <TextInput  
                  style={styles.inputText}
                  placeholder="Email or employee ID" 
                  placeholderTextColor={ThemeColor.PlaceHolderColor}
                  keyboardType='email-address'
                  value = {data.username}
                  onChangeText={(val) => textInputChange(val)}
                  onEndEditing={(e)=>handleValidUser(e.nativeEvent.text)}
                  />
              </View>
                <View style={{backgroundColor:'#848484', height:0.5}}></View>
              </View>
              
              <TouchableOpacity style={styles.submitBtn} onPress={() => {loginHandle( data.username, data.password )}}>
                <Text style={{color:'#53962E',fontFamily: 'Lato-Regular', fontSize:16, color:'#fff' }}>SUBMIT</Text>
              </TouchableOpacity>
              {/* {this.state.isLoading && <ActivityIndicator color={"#fff"} />} */}
              <Loader isLoading={data.isLoading} />
            </SafeAreaView>
          </ScrollView>
          {data.isLoading && <Loader />}
      </View>
    );
}

export default ForgotPasswordScreen;


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
    fontFamily:'Lato-Regular',
    textAlign: 'center'

  },
  subLogo:{
    fontSize:16,
    color:"black",
    marginBottom:2,
    fontFamily:'Lato-Regular',
    marginBottom:24,
    textAlign: 'center'

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
    fontFamily: 'Lato-Regular',
    marginLeft:8,
    marginRight:24,
    alignContent:'stretch'
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


  },
  textBtn:{
    flex:6,
    height:50,
    margin:16,
    justifyContent:"center",
    alignItems:'center',
    fontFamily: 'Lato-Regular',
    fontSize:16,
    color:'white',
  },
  inputImage: {
    width: 20,
    height: 20,
    tintColor:'black',
  }

});