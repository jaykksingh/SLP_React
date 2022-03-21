import React ,{useEffect, useState,createRef} from "react";
import { StyleSheet, 
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    View,
    Switch} from "react-native";
import Feather from 'react-native-vector-icons/Feather';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'
import axios from 'axios'
import {getAuthHeader} from '../../_helpers/auth-header';
import { BaseUrl, EndPoints, StaticMessage, ThemeColor, FontName } from '../../_helpers/constants';
import Loader from '../../Components/Loader';
import { AuthContext } from '../../Components/context';

const DesiredJobScreen = ({route,navigation}) => {
    let [isLoading, setIsLoading] = React.useState('');

    const [data,setData] = React.useState({
        prefferedCity:'',
        annualSalary:'',
        contractRate:'',
        contractRateTypeId:'1101',
        openToRelocate:true
    });
    
    const { lookupData } = route.params;

    const { signOut } = React.useContext(AuthContext);
    const { skipOnboarding } = React.useContext(AuthContext);
    // const [lookupData, setLookupData] = useState({});
    const [profileDetail, setProfileData] = React.useState('');

    useEffect(() => {
        navigation.addListener('focus', () => {
            getProfileDetails();
        })
        getProfileDetails();
        // getUserLookups();
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
    const SessionExpiredAlert = () =>{
        Alert.alert(StaticMessage.AppName,StaticMessage.SessionExpired,
            [{
              text: 'Ok',
              onPress: () => signOut()
          }]
      )}
    const setProfileDetailsData = (profileData) => {
        let empDetails = profileData.empDetails;
        setData({...data,
            desiredEmployementKey:empDetails.desiredEmployementKey,
            desiredEmployement:empDetails.desiredEmployement,
            prefferedCity:empDetails.prefferedCity,
            annualSalary:'' + empDetails.annualSalary,
            contractRate: '' + empDetails.contractRate,
            contractRateTypeId:'1101',
            openToRelocate:true
        });
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
            title:'Desired job'
        });
    }, [navigation]);
    const toggleSwitch = () => {
        setData({...data,openToRelocate:!data.openToRelocate});
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
        let strAnnualSalary = data.annualSalary.replace(',', '');

        const params = {
            'annualSalary':strAnnualSalary,
            'contractRateTypeId':data.contractRateTypeId,
            'contractRate':data.contractRate,
            "openToRelocate":data.openToRelocate ? "1" : "0",
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
            skipOnboarding();
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
  
    const textPhoneChange = (text) => {
        var cleaned = ('' + text).replace(/\D/g, '')
        var match = cleaned.match(/^(1|)?(\d{3})(\d{3})(\d{4})$/)
        if (match) {
            var intlCode = (match[1] ? '+1 ' : ''),number = [intlCode, '(', match[2], ') ', match[3], '-', match[4]].join('');       
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
            number = '(' + number.substring(0,3) + ') ' + number.substring(3,3) + '-';
        }
        return text;
    }
    
    const textJobTitleChange = (val) => {
        setData({...data,currentJobTitle: val});
    }
  
    let desiredEmployementType = data.desiredEmployement ? data.desiredEmployement.join(", ") : '';
    let prefferedCityType = data.prefferedCity ? data.prefferedCity.join(", ") : '';
    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAwareScrollView style={{ paddingLeft:16, paddingRight:16,marginBottom:32, paddingTop:16}}>
                <View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8, justifyContent:'space-between'}}>
                <Text style ={{color:ThemeColor.TextColor, fontSize:16,height:22, fontFamily:'Lato-Regular', paddingLeft:8}}>Consider relocating?</Text>
                <Switch
                    trackColor={{ false: ThemeColor.SwitchInactiveColor, true:ThemeColor.BtnColor }}
                    ios_backgroundColor = {ThemeColor.SwitchInactiveColor}
                    onValueChange={toggleSwitch}
                    thumbColor={data.openToRelocate ? "#FFF" : "#f4f3f4"}
                    value={ data.openToRelocate}
                />            
                </View>
                <View style={{marginTop:12}}>
                <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:'Lato-Regular', paddingLeft:8}}>Desired employment</Text>
                <TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}  onPress={() => {navigation.navigate('Edit profile',{profileDetail: profileDetail,lookupData:lookupData,dataType:'DesiredEmployeement'})}}>
                    <Text style={[styles.labelText,{color:desiredEmployementType.length > 0 ? 'black' : ThemeColor.PlaceHolderColor}]}>{desiredEmployementType.length >0 ? desiredEmployementType : '+ Add'}</Text>
                    <Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22,22} />
                </TouchableOpacity>
                </View>
                <View style={{marginTop:12}}>
                <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:'Lato-Regular', paddingLeft:8}}>My desired location</Text>
                <TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}} 
                    onPress={() => {navigation.navigate('Edit profile',{profileDetail: profileDetail,lookupData:lookupData,dataType:'PreferredCity'})}}>
                    <Text style={[styles.labelText,{color:prefferedCityType.length > 0 ? 'black' : ThemeColor.PlaceHolderColor}]}>{prefferedCityType.length >0 ? prefferedCityType : '+ Add'}</Text>
                    <Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22,22} />
                </TouchableOpacity>
                </View>
                <View style={{marginTop:12}}>
                <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:'Lato-Regular', paddingLeft:8}}>Salary requirement for full-time employment</Text>
                <View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}>
                    <Text style ={{color:ThemeColor.TextColor, fontSize:16, fontFamily:'Lato-Regular', paddingLeft:8}}>$</Text>
                    <TextInput  
                        style={styles.inputText}
                        placeholder="+ Add" 
                        placeholderTextColor={ThemeColor.PlaceHolderColor}
                        keyboardType='decimal-pad'
                        value= {data.annualSalary}
                        onChangeText={(val) => setData({...data,annualSalary:val})}
                    />
                </View>
                </View> 
                <View style={{marginTop:12}}>
                <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:'Lato-Regular', paddingLeft:8}}>Salary requirement for contract employment</Text>
                <View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}>
                    <Text style ={{color:ThemeColor.TextColor, fontSize:16, fontFamily:'Lato-Regular', paddingLeft:8}}>$</Text>
                    <TextInput  
                        style={styles.inputText}
                        placeholder="+ Add" 
					    placeholderTextColor={ThemeColor.PlaceHolderColor}
                        keyboardType='decimal-pad'
                        value= {data.contractRate}
                        onChangeText={(val) => setData({...data,contractRate:val})}
                    />
                </View>
                </View>    
            </KeyboardAwareScrollView>
            <View style={{flexDirection:'row',borderRadius:5, marginLeft:16, marginRight:16,marginTop:8, marginBottom:16}}>
                <TouchableOpacity style={[styles.btnFill,{backgroundColor:'white',borderBottomLeftRadius:5,borderTopLeftRadius:5}]} onPress={() => skipOnboarding()}>
                    <Text style={{color:'#53962E',fontFamily: 'Lato-Regular', fontSize:16, color:ThemeColor.BtnColor }}>SKIP</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btnFill,{borderBottomRightRadius:5,borderTopRightRadius:5}]} onPress={() => {updateProfileDetails()}}>
                    <Text style={{color:'#53962E',fontFamily: 'Lato-Regular', fontSize:16, color:'#fff' }}>SAVE</Text>
                </TouchableOpacity>
            </View>
        <Loader isLoading={isLoading} />
        </SafeAreaView>
	);
  
}

export default DesiredJobScreen;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:'#E5E9EB',
  },inputText:{
    flex: 1,
    height:40,
    color:'black',
    fontSize:16,
    fontFamily: 'Lato-Regular',
    marginLeft:8,
    alignContent:'stretch',
  },
  labelText:{
    flex: 1,
    color:'black',
    fontSize:16,
    fontFamily: 'Lato-Regular',
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