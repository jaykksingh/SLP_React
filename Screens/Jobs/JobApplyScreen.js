import React, {useEffect} from "react";
import { View,
    Text,
    StyleSheet,
    SafeAreaView,
    TextInput,
    TouchableOpacity,
    FlatList,
    Alert,
    Platform
} from "react-native";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

import FontAwesome from 'react-native-vector-icons/FontAwesome5';
import FontAwesome4 from 'react-native-vector-icons/FontAwesome';
import Icon from "react-native-vector-icons/Ionicons";
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'
import RNFS from 'react-native-fs';
import FileViewer from "react-native-file-viewer";
import DocumentPicker from 'react-native-document-picker';
import MovableView from 'react-native-movable-view';
import moment from 'moment';
import * as Animatable from 'react-native-animatable';
import { BaseUrl, EndPoints, StaticMessage, ThemeColor, FontName } from '../../_helpers/constants';
import { getAuthHeader} from '../../_helpers/auth-header';
import Loader from '../../Components/Loader';
import { AuthContext } from '../../Components/context';
import {parseErrorMessage} from '../../_helpers/Utils';


const JobApplyScreen = ({route,navigation}) => {
    const [data,setData] = React.useState({
        firstName:'',
        lastName:'',
        resumeTitle:'',
        email:'',
        contactNumberDialCode:'1',
        cnShortCountryCode:'',
        contactNumber:'',
        isLoading: false,
    });
    const { jobDetails } = route.params;
    const { showParentTab } = route.params;
    let [profileData, setProfileData] = React.useState('')
    let [isLoading, setLoading] = React.useState(false);
    let [selectedResume, setSelectedResume] = React.useState('');
    let [base64Resume, setBase64Resume] = React.useState('');
    const { signOut } = React.useContext(AuthContext);
    const [show, setShow] = React.useState(false);
    const [lookupData, setLookupData] = React.useState({});
    const [countryDialCodeList, setCountryDialCodeList] = React.useState([]);

    useEffect(() => {
        getProfileDetails();
        getUserLookups();
       
    }, []);
  
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
    const  getProfileDetails = async() => {
        let user = await AsyncStorage.getItem('loginDetails');  
        if(user){
            let parsed = JSON.parse(user);  
            let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
            var authToken = base64.encode(userAuthToken);
        
            setData({...data,isLoading: true});
            axios ({  
            "method": "GET",
            "url": BaseUrl + EndPoints.UserProfile,
            "headers": getAuthHeader(authToken)
            })
            .then((response) => {
            console.log('',JSON.stringify(response.data.content));
            setData({...data,isLoading: false});
            if (response.data.code == 200){
                const results = JSON.stringify(response.data.content.dataList[0]);
                if(response.data.content.dataList.length > 0){
                    setProfileData(response.data.content.dataList[0]);
                }
            }else if (response.data.code == 417){
                setData({...data,isLoading: false});
                const message = parseErrorMessage(response.data.content.messageList);
                Alert.alert(StaticMessage.AppName, message, [
                {text: 'Ok'}
                ]);
        
            }else{
                setData({...data,isLoading: false});
            }
            })
            .catch((error) => {
            console.error(error);
            setData({...data, isLoading: false});
            if(error.response && error.response.status == 401){
                SessionExpiredAlert();
            }else{
                Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
                    {text: 'Ok'}
                    ]);
            }
            })

        }else{
            getUserLookups();
        }
    }
    const  getUserLookups = async() => {
        var authToken  = "U3RhZmZMaW5lQDIwMTc=";

        let user = await AsyncStorage.getItem('loginDetails');  
        if(user){
            let parsed = JSON.parse(user);  
            let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
            authToken = base64.encode(userAuthToken);
        }
        
        console.log("getUserLookups");
        setData({...data,isLoading: true});
        axios ({  
          "method": "GET",
          "url": BaseUrl + EndPoints.UserLookups,
          "headers": getAuthHeader(authToken)
        })
        .then((response) => {
          if (response.data.code == 200){
            setData({...data,isLoading: false});
            let lookupDataList = response.data.content.dataList[0]; 
            console.log(`Look up data: ${JSON.stringify(lookupDataList.countryDialCode)}`)
            setCountryDialCodeList(lookupDataList.countryDialCode);
            setLookupData(response.data.content.dataList[0]);
          }else if (response.data.code == 417){
            setData({...data,isLoading: false});
            console.log(Object.values(response.data.content.messageList));
            const errorList = Object.values(response.data.content.messageList);
            Alert.alert(StaticMessage.AppName, errorList.join(), [
              {text: 'Ok'}
            ]);
    
          }else{
            setData({...data,isLoading: false});
          }
        })
        .catch((error) => {
            setData({...data,isLoading: false});
            Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
              {text: 'Ok'}
            ]);
        })
      }
    const SessionExpiredAlert = () =>{
        Alert.alert(StaticMessage.AppName,StaticMessage.SessionExpired,
            [{
              text: 'Ok',
              onPress: () => signOut()
          }]
    )}
    const viewResume = (resume) => {
        console.log('resume:', resume);
        let url =  resume.filePath;
		const extension = url.split(/[#?]/)[0].split(".").pop().trim();
		const localFile = `${RNFS.DocumentDirectoryPath}/temporaryfile.${extension}`;
		const options = {
			fromUrl: url,
			toFile: localFile,
		};
		RNFS.downloadFile(options)
		.promise.then(() => FileViewer.open(localFile,{ showOpenWithDialog: true }))
		.then(() => {
			console.log('View Sucess')
		})
		.catch((error) => {
			console.log('View Failed',error)
		});
    }
    const selectResume = async () => {
        try {
            const res = await DocumentPicker.pick({
                type: [DocumentPicker.types.pdf,DocumentPicker.types.doc,DocumentPicker.types.docx,DocumentPicker.types.plainText],
            });
            setData({...data,resumeTitle:res[0].name});
            var result = res[0].uri.split("%20").join("\ ");

            var base64data = await RNFS.readFile( result, 'base64').then(res => { return res });
            console.log('Base64 String:',base64data);
            setBase64Resume(base64data);
            setData({...data,resumeTitle:res[0].name});
        } catch (err) {
            if (DocumentPicker.isCancel(err)) {
                // User cancelled the picker, exit any dialogs or menus and move on
            } else {
                throw err;
            }
        }
    }

    const handleApplyJob = async () => {

        var encoded = "U3RhZmZMaW5lQDIwMTc=";
        let user = await AsyncStorage.getItem('loginDetails'); 
        if(user){
            let parsed = JSON.parse(user);  
            let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
            encoded = base64.encode(userAuthToken);    
        } 

        let params = {
            "jobId":jobDetails.cjmJobId,
            "Source":"4417",
            "Entity":"2323"
        }

        if(base64Resume.length > 0){
            params = {...params,"resumeFile":base64Resume}
            params = {...params,"resumeName":data.resumeTitle}
            params = {...params,"resumeTitle":data.resumeTitle}
        }else if (selectedResume){
            params = {...params,"candidateDocId":selectedResume.candidateDocId}
        }
        if(!user){
            params = {...params,"firstName":data.firstName}
            params = {...params,"lastName":data.lastName}
            params = {...params,"email":data.email}
            params = {...params,"phone":data.contactNumber}
            params = {...params,"contactNumberCountryCode":data.contactNumberDialCode}
            params = {...params,"resumeFile":base64Resume}
            params = {...params,"resumeName":data.resumeTitle}
            params = {...params,"resumeTitle":data.resumeTitle}

        }
        if(!(selectedResume || base64Resume.length > 0)){
            Alert.alert(StaticMessage.AppName, StaticMessage.NoResumeSelected, [
                {text: 'Ok'}
            ]);
            return;
        }

        console.log("params job aaply:",params);
        setLoading(true);
    
        axios ({  
            "method": "POST",
            "url": BaseUrl + EndPoints.ApplyJob,
            "headers": getAuthHeader(encoded),
            data:params
        })
        .then((response) => {
            setLoading(false);
          if (response.data.code == 200){
            console.log(response.data.content.dataList[0]);
            showPreScreeningAlert(response.data.content.dataList[0]);
          }else if (response.data.code == 417){
            const message = parseErrorMessage(response.data.content.messageList);
            Alert.alert(StaticMessage.AppName, message, [
              {text: 'Ok'}
            ]);
    
          }else{
          }
        })
        .catch((error) => {
          setLoading(false);
          Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
            {text: 'Ok'}
          ]);
    
        })
    }
    const handleViewSimilarJobs = (clientPrimaryKey) => {
        console.log('Job apply callback');
		navigation.goBack();
        route.params.onClickEvent(clientPrimaryKey);
    }
    const showPreScreeningAlert = (applyDict) => {
        // navigation.navigate('PreScreenings',{screenngCode:item.screenngCode})
        let message = "Let's complete your application by answering a few questions."
        Alert.alert("Apply with your resume",message,
          [{
                text: 'Cancel',
                onPress: () => navigation.goBack()

          },
              {
              text: 'Continue',
              onPress: () => {navigation.navigate('PreScreenings',{screenngCode:applyDict.encode,onClickEvent:handleViewSimilarJobs})}
          }]
        )
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
    const didSelectDialCode = (selectedItem) => {
        console.log(selectedItem);
        setData({...data,contactNumberDialCode: selectedItem.dialCode,cnShortCountryCode:selectedItem.countryCode});
        setShow(false);
    }
      

    let isLoggedin = profileData ? true : false;
    let resumeArray = profileData ? profileData.resume : [];
    let selectedResumeId = selectedResume ? selectedResume.candidateDocId : '';
    const getFormattedDate=(cjmPostingDate) =>{
		let momentDate = moment(cjmPostingDate, 'YYYY-MM-DD');
		let dateString = moment(momentDate).format('MMM DD, YYYY')
		return `${dateString}`;
	}
    const resumeDaysCalculate = (startDate) => {
		let momentDate = moment(startDate, 'YYYY-MM-DD');
        let endDate = moment(new Date());
        return endDate.diff(momentDate, "days");
    }
    return(
        <SafeAreaView style={{flex:1,flex_direction:'column'}}>
            <KeyboardAwareScrollView style={{flex: 1, padding:16}}>
                <View style={styles.jobCard }>
                    <View style={styles.companyLogo}>
                        <FontAwesome name="building" color={'gray'} size={50} />
                    </View>
                    <Text style={{color: ThemeColor.textColor, fontSize:18, fontFamily: FontName.Regular,fontWeight:'400', marginTop:50}}>{jobDetails.jobTitle}</Text>
                    <Text style={{color: ThemeColor.TextColor, fontSize:14, fontFamily: FontName.Regular, marginTop:8}}>{jobDetails.cjmCompanyName}</Text>
                    <Text style={{color: ThemeColor.TextColor, fontSize:14, fontFamily: FontName.Regular, marginTop:2}}>{jobDetails.city}, {jobDetails.state}</Text>
                    <View style={{flexDirection:'row', marginTop:4}} >
                        <Text style={{color: ThemeColor.LabelTextColor, fontSize:14, fontFamily: FontName.Regular,}}>Posted on: </Text>
                        <Text style={{color: ThemeColor.TextColor, fontSize:14, fontFamily: FontName.Regular}}>{getFormattedDate(jobDetails.cjmPostingDate)}</Text>
                    </View>
                </View>
                {!isLoggedin && 
                <View style={[styles.applyWithResume,{marginBottom:8}] }>
                    <Text style={{flex: 1,color: ThemeColor.textColor,fontSize:16, fontFamily: FontName.Regular,alignSelf: 'flex-start'}}>Apply with your resume</Text>
                    <View style={{flexDirection:'row', width:'100%',flex:1}}>
                        <View style={styles.inputView}>
                            <Text style={{color:ThemeColor.TextColor, fontSize:16, fontFamily: FontName.Regular}}>First name</Text>
                            <TextInput  
                                style={styles.inputText}
                                placeholder="First name" 
                                placeholderTextColor={ThemeColor.PlaceHolderColor}
                                keyboardType='default'
                                value = {data.firstName}
                                onChangeText={(val) => handleFnameChange(val)}/>
                            <View style={{backgroundColor:ThemeColor.BorderColor, height:1}}></View>
                        </View>
                        <View style={styles.inputView}>
                            <Text style={{color:ThemeColor.TextColor, fontSize:16, fontFamily: FontName.Regular}}>Last name</Text>
                            <TextInput  
                                style={styles.inputText}
                                placeholder="Last name" 
                                placeholderTextColor={ThemeColor.PlaceHolderColor}
                                keyboardType='default'
                                value = {data.lastName}
                                onChangeText={(val) => handleLnameChange(val)}/>
                            <View style={{backgroundColor:ThemeColor.BorderColor, height:1}}></View>
                        </View>
                    </View>
                    <View style={[styles.inputView,{width:'100%'}]}>
                        <Text style={{color:ThemeColor.TextColor, fontSize:16, fontFamily: FontName.Regular}}>Email</Text>
                        <TextInput  
                            style={styles.inputText}
                            placeholder="Email" 
                            placeholderTextColor={ThemeColor.PlaceHolderColor}
                            keyboardType='email-address'
                            value = {data.email}
                            onChangeText={(val) => handleEmailChange(val)}/>
                        <View style={{backgroundColor:ThemeColor.BorderColor, height:1}}></View>
                    </View>
                    <View style={[styles.inputView,{width:'100%'}]}>
                        <Text style={{color:ThemeColor.TextColor, fontSize:16, fontFamily: FontName.Regular}}>Phone</Text>
                        <View style={{flexDirection:'row', alignItems: 'center'}}>
                        <View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}>
                            <TouchableOpacity style={{flexDirection: 'row',marginRight:8, paddingLeft:8}} onPress={() => setShow(true)}>
                                <Text style={{color:ThemeColor.TextColor, fontSize:16, fontFamily: FontName.Regular, marginRight:8, marginLeft:8}}>+{data.contactNumberDialCode}</Text>
                                <Icon name="caret-down" color={ThemeColor.LabelTextColor} size={20} />
                            </TouchableOpacity>
                            <TextInput  
                            style={styles.inputText}
                            placeholder="+ Add " 
                            maxLength={14}
                            placeholderTextColor= {ThemeColor.PlaceHolderColor}
                            keyboardType='phone-pad'
                            textContentType='telephoneNumber' 
                            dataDetectorTypes='phoneNumber' 
                            value= {data.contactNumber}
                            onChangeText={(val) => textPhoneChange(val)}
                            />
                        </View>
                        </View>
                        <View style={{backgroundColor:ThemeColor.BorderColor, height:1}}></View>
                    </View>                    
                </View>
                }
                {profileData && resumeArray.length > 0 ?
                <View style={[styles.applyWithResume] }>
                    <View style={{flexDirection:'row', justifyContent:'space-between',}} >
                        <Text style={{flex: 1,color: ThemeColor.textColor,fontSize:16, fontFamily: FontName.Regular,}}>Apply with your resume</Text>
                        <TouchableOpacity style={{flexDirection: 'row'}} onPress = {() => {selectResume()}}>
                            <Icon name="add-circle-outline" color={ThemeColor.BtnColor} size={16} />
                            <Text style={{color:ThemeColor.BtnColor, fontSize:14, fontFamily: FontName.Regular, marginLeft:4}}>New resume</Text>
                        </TouchableOpacity>
                    </View>
                    <FlatList style={{marginTop:16, width:'100%', paddingLeft:0}}
                        data={resumeArray}
                        renderItem={({item}) => 
                        <View>
                            <View style={{flexDirection: 'row', alignItems: 'center',justifyContent: 'center'}}>
                                <TouchableOpacity style={{marginRight:8}} onPress={(event)=> {setSelectedResume(item)}}>
                                    {selectedResumeId == item.candidateDocId ?
                                    <Icon name="radio-button-on" color={ThemeColor.BtnColor} size={24} /> : 
                                    <Icon name="radio-button-off" color={ThemeColor.BtnColor} size={24} /> }
                                </TouchableOpacity>
                                <View style={{flex: 1,flexDirection:'column', margin_bottom:8, marginTop:0}}>
                                    <Text style={{flex: 1, fontFamily: FontName.Regular, fontSize:14, marginBottom:4, marginTop:8}}>{item.fileName}</Text>
                                    <View style={{flex: 1,flexDirection:'row', margin_bottom:4,alignItems: 'center'}}>
                                        <Text style={{fontFamily: FontName.Regular, fontSize:14, color:ThemeColor.LabelTextColor, marginRight:4, paddingRight:8}}>{resumeDaysCalculate(item.uploadedDate)} days old</Text>
                                        <View style={{width:2, height:12,backgroundColor:ThemeColor.BorderColor, marginRight:8, marginLeft:8}} />
                                        <TouchableOpacity onPress = {() => {viewResume(item)}}>
                                            <Text style={{fontFamily: FontName.Regular, fontSize:14, color:ThemeColor.BtnColor, paddingLeft:8}}>Preview</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                            <View style={{flex: 1,height:1,marginTop:8, marginLeft:32,backgroundColor:ThemeColor.BorderColor}}/>
                        </View>
                        }
                    />
                    {base64Resume.length > 0 &&
                        <Text style={{width:'100%', marginTop:8,marginBottom:8,fontFamily: FontName.Regular, fontSize:16,textAlign:'left'}}>{data.resumeTitle}</Text>
                    }
                </View> :
                
                <View style={[styles.applyWithResume] }>
                    <Text style={{flex: 1,color: ThemeColor.textColor,fontSize:16, fontFamily: FontName.Regular,alignSelf: 'flex-start'}}>Apply with your resume</Text>
                    <TouchableOpacity style={{margin:32, alignItems: 'center'}} onPress={(event)=> {selectResume()}}>
                        <FontAwesome4 name="cloud-upload" color={ThemeColor.BtnColor} size={80} />
                        <Text style={{color:ThemeColor.LabelTextColor, fontSize:16, fontFamily: FontName.Regular, marginLeft:4}}>Upload resume</Text>
                        {base64Resume.length > 0 &&
                            <Text style={{marginTop:8,marginBottom:8,fontFamily: FontName.Regular, fontSize:16,textAlign:'center'}}>{data.resumeTitle}</Text>
                        }
                    </TouchableOpacity>
                </View> 
                }
                
                
            </KeyboardAwareScrollView>
            <TouchableOpacity style={styles.btnFill} onPress={() => {handleApplyJob()}}>
                <Text style={{color:'#53962E',fontFamily: FontName.Regular, fontSize:16, color:'#fff' }}>SUBMIT</Text>
            </TouchableOpacity>
            <Loader isLoading={isLoading } /> 
            {isLoggedin &&
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
            </MovableView> }
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
        </SafeAreaView>
    );
}

export default JobApplyScreen;

const styles = StyleSheet.create({
    container: {    
      flex: 1,
      justifyContent: 'center',
    },jobCard:{
        backgroundColor:'#fff',
        borderColor:ThemeColor.BorderColor,
        borderWidth:1,
        borderRadius:5,
        height:200,
        alignItems: 'center',
        padding:16,
        marginTop:60
    },companyLogo: {
        width: 80,
        height: 80,
        padding:16,
        borderWidth:1,
        borderRadius:5,
        marginTop:60,
        borderColor:ThemeColor.BorderColor,
        alignSelf:'center',
        position: 'absolute',top:-100,
        backgroundColor:'#fff'
      },applyWithResume:{
        backgroundColor:'#fff',
        borderColor:ThemeColor.BorderColor,
        borderWidth:1,
        borderRadius:5,
        alignItems: 'center',
        padding:16,
        marginTop:16,
    },inputView:{
        flex: 1,
        marginTop:16,   
        justifyContent:"center",
      },inputText:{
        height:40,
        color:ThemeColor.TextColor,
        fontSize:16,
        fontFamily:FontName.Regular,
        marginRight:24,
        alignContent:'stretch'
      },btnFill:{
        margin: 16,
        height:50,
        justifyContent:"center",
        backgroundColor: ThemeColor.BtnColor,
        alignItems:'center',
        borderRadius:5,
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