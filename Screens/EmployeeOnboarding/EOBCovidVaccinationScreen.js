import 'react-native-gesture-handler';
import React ,{useEffect,useState,createRef, useRef}from 'react';
import { View ,
    Dimensions,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Alert,
    Animated,
    Text,
    ScrollView,
    Platform} from 'react-native';

import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from "react-native-vector-icons/FontAwesome";
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'
import axios from 'axios'
import FileViewer from "react-native-file-viewer";
import RNFS from "react-native-fs";

import DocumentPicker from 'react-native-document-picker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import ActionSheet from 'react-native-actionsheet'
import * as ImagePicker from 'react-native-image-picker';
import DatePicker from 'react-native-date-picker'
import {default as ActionSheetView} from 'react-native-actions-sheet';
import {Picker} from '@react-native-picker/picker';
import moment from 'moment';

import {getAuthHeader} from '../../_helpers/auth-header';
import {parseErrorMessage} from '../../_helpers/Utils';
import { BaseUrl, EndPoints, StaticMessage, ThemeColor,FILETYPE, FontName } from '../../_helpers/constants';
import Loader from '../../Components/Loader';
import { AuthContext } from '../../Components/context';


const startDateRef = createRef();
const endDateRef = createRef();
const bosterDateRef = createRef();
const statusRef = createRef();
const vaccineRef = createRef();


const EOBCovidVaccinationScreen = ({route,navigation})  => {
    const [data,setData] = React.useState({
        resumeTitle:'',
        resumeData:'',
        fileName:'',
        startDate:'',
        fileType:'',
        vaccineId:0,
        vaccineName:'',
        vaccineStatusId:0,
        vaccineStatusName:''
    });
    const { signOut } = React.useContext(AuthContext);
    let [isLoading, setIsLoading] = React.useState(false);
    const [startDate, setStartDate] = React.useState(new Date());
    const [startDateString, setStartDateString] = React.useState('');
    const [endDate, setEndDate] = React.useState(new Date());
    const [endDateString, setEndDateString] = React.useState('');
    const [bosterDate, setBoosterDate] = React.useState(new Date());
    const [bosterDateString, setBoosterDateString] = React.useState('');

    const [lookupData, setLookupData] = useState({});

    const { comeFrom } = route.params;
    const { stepDetail } = route.params;
    const actionSheetDoc = useRef();

    React.useLayoutEffect(() => {
      navigation.setOptions({
        title: stepDetail.title ? stepDetail.title : stepDetail.docName,
      });
    }, [navigation]);
    
    const SessionExpiredAlert = () =>{
  
        Alert.alert(StaticMessage.AppName,StaticMessage.SessionExpired,
        	[{
              text: 'Ok',
              onPress: () => signOut()
          	}]
      	)	 
  	}

    useEffect(() => {
      getLookups();
    },[]);
    const  getLookups = async() => {
      let user = await AsyncStorage.getItem('loginDetails');  
      let parsed = JSON.parse(user);  
      let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
      var authToken = base64.encode(userAuthToken);
  
      setIsLoading(true);
      axios ({  
        "method": "GET",
        "url": BaseUrl + EndPoints.AlertSettingLookup,
        "headers": getAuthHeader(authToken)
      })
      .then((response) => {
        if (response.data.code == 200){
          setIsLoading(false);
          setLookupData(response.data.content.dataList[0]);
          console.log(`Lookup Data : ${JSON.stringify(response.data.content.dataList[0])}`);
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
    const  uploadDocument = async() => {
        let user = await AsyncStorage.getItem('loginDetails');  
        let parsed = JSON.parse(user);  
        let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
        var authToken = base64.encode(userAuthToken);

        const params = {
            'dmsId':'',
            'docId':1073,
            'docName':'Covid-19 Vaccination Car',
            'expiryDate':startDateString,
            'secondDate':endDateString,
            'boosterDate':bosterDateString,
            "fileName":data.fileName,
            'fileData':data.resumeData,
            "listOne": data.vaccineId,
            "listTwo":data.vaccineStatusId
        }
        

        console.log(JSON.stringify(params),BaseUrl + EndPoints.DocumentUpload);
        setIsLoading(true);

        axios ({  
          "method": "POST",
          "url": BaseUrl + EndPoints.DocumentUpload,
          "headers": getAuthHeader(authToken),
          data:params
        })
        .then((response) => {
          if (response.data.code == 200){
            const results = JSON.stringify(response.data.content);
			console.log(results);
            setIsLoading(false);
            navigation.goBack();
        }else if (response.data.code == 417){
            setIsLoading(false);
            const message = parseErrorMessage(response.data.content.messageList);
            Alert.alert(StaticMessage.AppName, message, [
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
    
    const selectResume = async () => {
      try {
        const res = await DocumentPicker.pick({
            type: [DocumentPicker.types.pdf,DocumentPicker.types.doc,DocumentPicker.types.docx,DocumentPicker.types.plainText],
        });
        console.log('File Log: ',res[0].uri,res[0].type, res[0].name,res[0].size);
        var result = res[0].uri.split("%20").join("\ ");
        var base64data = await RNFS.readFile( result, 'base64').then(res => { return res });
        let bytes = res[0].size  / 1000000;
        console.log(`File Size: ${bytes}`)
        if(bytes > 5){
          Alert.alert(StaticMessage.AppName, StaticMessage.FileSize5MbExcedMsg, [
            {text: 'Ok'}
          ]);
        }else{
          setData({...data,resumeData:base64data,fileName:res[0].name});
        }
    } catch (err) {
        if (DocumentPicker.isCancel(err)) {
        } else {
            throw err;
        }
    }
    }
    const viewResume = (resume) => {
        console.log('resume:', resume.filePath);
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
          let imageURL = res.uri ? res.uri : res.assets[0].uri;
          var result = imageURL.split("%20").join("\ ");
          var base64data = await RNFS.readFile(result, 'base64').then(res => { return res });
          setData({...data,resumeData:base64data,fileName:res.fileName ? res.fileName : res.assets[0].fileName});
        }
      });
    }
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
          console.log('Response = ', res.assets[0].fileName);
      
          if (res.didCancel) {
            console.log('User cancelled image picker');
          } else if (res.error) {
            console.log('ImagePicker Error: ', res.error);
          } else if (res.customButton) {
            console.log('User tapped custom button: ', res.customButton);
            alert(res.customButton);
          } else {
            let imageURL = res.assets[0].uri;
            var result = imageURL.split("%20").join("\ ");  
            var base64data = await RNFS.readFile( result, 'base64').then(res => { return res });
            setData({...data,resumeData:base64data,fileName:res.assets[0].fileName});    
          }
        });
    }

    
    const handleDocActionsheet = (index) => {
        if(index == 0){
            selectResume();
        }else if(index == 1){
            imageGalleryLaunch();
        }else if (index == 2){
            cameraLaunch();
        }
    }
    const handleStartDateChange = (val) =>{
      console.log("Start Date:",val.toString());
      setStartDate(val);
      let showDate = moment(val).format('MMM DD, YYYY')
      setStartDateString(showDate);
        console.log("showDate:",showDate);

	  }
    const handleEndDateChange = (val) =>{
      setEndDate(val);
      let showDate = moment(val).format('MMM DD, YYYY')
      setEndDateString(showDate);
        console.log("showDate:",showDate);
	  }
    const handleBoosterDateChange = (val) =>{
      setBoosterDate(val);
      let showDate = moment(val).format('MMM DD, YYYY')
      setBoosterDateString(showDate);
        console.log("boosterDate:",showDate);
	  }
    const showActionSheet = () => {
      actionSheetDoc.current.show();
    }

    let covidVaccinesArray = lookupData ? lookupData.covidVaccines : [];
    let covidVaccinesStatusArray = lookupData ? lookupData.covidVaccinesStatus : [];

    return (
        <SafeAreaView style={styles.container}>            
              <ScrollView style={{padding:16, height:1200}}>
                <View style={{ alignItems: 'center', flex:1}}>
                    <TouchableOpacity style={{marginTop:32}} onPress = {() => {showActionSheet()}}>
                        <FontAwesome name="cloud-upload" color={ThemeColor.BtnColor} size={80} />
                    </TouchableOpacity>
                    
                    <ActionSheet
                            ref={actionSheetDoc}
                            options={['Upload document', 'Photo library','Take photo', 'Cancel']}
                            cancelButtonIndex={3}
                            onPress={(index) => { handleDocActionsheet(index) }}
                        />
                    
                    <Text style={{fontFamily:FontName.Regular, fontSize:18,color:ThemeColor.SubTextColor, textAlign:'center', marginTop:16}}>Tap here to select a file to upload</Text>
                    <Text style={{fontFamily:FontName.Regular, fontSize:14,color:ThemeColor.SubTextColor, textAlign:'center', marginTop:4}}>Maximum file size: 5MB</Text>
                    {data.fileName.length > 0 && 
                      <View>
                        <Text style={{fontFamily:FontName.Regular, fontSize:16,color:ThemeColor.SubTextColor, textAlign:'center', marginTop:16}}>You are attaching file</Text> 
                        <Text style={{fontFamily:FontName.Regular, fontSize:16,color:ThemeColor.NavColor, textAlign:'center'}}>{data.fileName}</Text> 
                      </View>
                    }
                    {Platform.OS == 'ios' ?
                    <View style={{marginTop:24, width:'100%'}}>
                        <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8,marginBottom:4}}>Vaccination status</Text>
                        <TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}} onPress={() => {statusRef.current?.setModalVisible()}}>
                            <Text style={[styles.labelText,{color:data.vaccineStatusName.length > 0 ? ThemeColor.TextColor :ThemeColor.PlaceHolderColor}]}>{data.vaccineStatusName.length > 0 ? data.vaccineStatusName : 'Select vaccination status'}</Text>
                            <Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22} />
                        </TouchableOpacity>
                    </View>                    
                    :
                    <View style={{marginTop:24, width:'100%'}}>
                        <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8,marginBottom:4}}>Vaccination status</Text>
                        <View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center'}} onPress={() => {statusRef.current?.setModalVisible()}}>
                          <Picker
                            style={{flex:1,fontSize:14, fontFamily: FontName.Regular}}
                            itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
                            selectedValue={data.vaccineStatusId}
                            onValueChange={(itemValue, index) =>{
                              console.log(itemValue,index)
                              let selectedItem = covidVaccinesStatusArray[index];
                              setData({...data,vaccineStatusId:selectedItem.id,vaccineStatusName:selectedItem.name});

                            }}>
                            {covidVaccinesStatusArray && covidVaccinesStatusArray.map((item, index) => {
                              return (<Picker.Item label={item.name} value={item.id} key={index}/>) 
                            })}
                          </Picker>                        
                          </View>
                    </View>
                    }  

                    {data.vaccineStatusId == 21164 ? 
                    null :
                    <>
                      {Platform.OS == 'ios' ?
                        <View style={{marginTop:12, width:'100%'}}>
                          <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8,marginBottom:4}}>Vaccine provider</Text>
                          <TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}} onPress={() => {vaccineRef.current?.setModalVisible()}}>
                              <Text style={[styles.labelText,{color:data.vaccineName.length > 0 ? ThemeColor.TextColor :ThemeColor.PlaceHolderColor}]}>{data.vaccineName.length > 0 ? data.vaccineName : 'Select vaccine provider'}</Text>
                              <Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22} />
                          </TouchableOpacity>
                        </View> :
                        <View style={{marginTop:12, width:'100%'}}>
                          <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8,marginBottom:4}}>Vaccine provider</Text>
                            <View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center'}} onPress={() => {vaccineRef.current?.setModalVisible()}}>
                              <Picker
                                style={{flex:1,fontSize:14, fontFamily: FontName.Regular}}
                                itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
                                selectedValue={data.vaccineId}
                                onValueChange={(itemValue, index) =>{
                                  console.log(itemValue,index)
                                  let selectedItem = covidVaccinesArray[index];
                                  setData({...data,vaccineId:selectedItem.id,vaccineName:selectedItem.name});

                                }}>
                                {covidVaccinesArray && covidVaccinesArray.map((item, index) => {
                                  return (<Picker.Item label={item.name} value={item.id} key={index}/>) 
                                })}
                              </Picker>
                            </View>
                        </View> 
                       }
                      <View style={{marginTop:12, width:'100%'}}>
                          <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8,marginBottom:4}}>First vaccination date</Text>
                          <TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}} onPress={() => {startDateRef.current?.setModalVisible()}}>
                              <Text style={[styles.labelText,{color:startDateString.length > 0 ? ThemeColor.TextColor :ThemeColor.PlaceHolderColor}]}>{startDateString.length > 0 ? startDateString : 'Select first date'}</Text>
                              <Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22} />
                          </TouchableOpacity>
                      </View>  
                      <View style={{marginTop:12, width:'100%'}}>
                          <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8,marginBottom:4}}>Second vaccination date</Text>
                          <TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}} onPress={() => {endDateRef.current?.setModalVisible()}}>
                              <Text style={[styles.labelText,{color:endDateString.length > 0 ? ThemeColor.TextColor :ThemeColor.PlaceHolderColor}]}>{endDateString.length > 0 ? endDateString : 'Select second date'}</Text>
                              <Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22} />
                          </TouchableOpacity>
                      </View>
                      {data.vaccineStatusId == 21165 ?
                      <View style={{marginTop:12, width:'100%'}}>
                        <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8,marginBottom:4}}>Booster vaccination date</Text>
                        <TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}} onPress={() => {bosterDateRef.current?.setModalVisible()}}>
                            <Text style={[styles.labelText,{color:bosterDateString.length > 0 ? ThemeColor.TextColor :ThemeColor.PlaceHolderColor}]}>{bosterDateString.length > 0 ? bosterDateString : 'Select booster date'}</Text>
                            <Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22} />
                        </TouchableOpacity>
                      </View> : null
                      }
                    </>
                    }                  
                    
                    <TouchableOpacity style={styles.btnFill} onPress={() => {uploadDocument()}}>
                      <Text style={{color:'white',fontFamily: FontName.Regular, fontSize:16 }}>SAVE</Text>
                    </TouchableOpacity> 
                </View>
              </ScrollView>
              
            <Loader isLoading={isLoading} /> 
            
            <ActionSheetView ref={startDateRef} containerStyle={{backgroundColor:ThemeColor.ViewBgColor}} >
                <View style={{height:300}}>
                <View style={{height:44, flexDirection:'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft:16,paddingRight:16}}>
                    <TouchableOpacity onPress={() => {startDateRef.current?.setModalVisible()}}>
                        <Text style={{color:ThemeColor.BtnColor, fontSize:18, fontFamily: FontName.Regular}}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={{color:ThemeColor.TextColor, fontSize:18, fontFamily: FontName.Bold}}>Vaccination date</Text>
                    <TouchableOpacity onPress={() => {
                      {startDateString.length == 0 && handleStartDateChange(startDate) }
                      startDateRef.current?.setModalVisible()
                      }}>
                        <Text style={{color:ThemeColor.BtnColor, fontSize:18, fontFamily: FontName.Regular}}>Done</Text>
                    </TouchableOpacity>
                </View>
                <DatePicker
                    style={{backgroundColor: 'white',flex:1,width:Dimensions.get('window').width}}
                    mode={'date'}
                    itemStyle={{fontSize:16, fontFamily:FontName.Regular, height:20}}

                    maximumDate={new Date()}
                    date={startDate}
                    onDateChange={(val) => {handleStartDateChange(val)}}
                />
                </View>
            </ActionSheetView>
            <ActionSheetView ref={endDateRef} containerStyle={{backgroundColor:ThemeColor.ViewBgColor}} >
                <View style={{height:300}}>
                <View style={{height:44, flexDirection:'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft:16,paddingRight:16}}>
                    <TouchableOpacity onPress={() => {endDateRef.current?.setModalVisible()}}>
                        <Text style={{color:ThemeColor.BtnColor, fontSize:18, fontFamily: FontName.Regular}}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={{color:ThemeColor.TextColor, fontSize:18, fontFamily: FontName.Bold}}>Vaccination date</Text>
                    <TouchableOpacity onPress={() => {
                      {endDateString.length == 0 && handleEndDateChange(endDate) }
                      endDateRef.current?.setModalVisible()
                      }}>
                        <Text style={{color:ThemeColor.BtnColor, fontSize:18, fontFamily: FontName.Regular}}>Done</Text>
                    </TouchableOpacity>
                </View>
                <DatePicker
                    style={{backgroundColor: 'white',flex:1,width:Dimensions.get('window').width}}
                    itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
                    mode={'date'}
                    minimumDate={startDate}
                    maximumDate={new Date()}
                    date={endDate}
                    onDateChange={(val) => {handleEndDateChange(val)}}
                />
                </View>
            </ActionSheetView>
            <ActionSheetView ref={bosterDateRef} containerStyle={{backgroundColor:ThemeColor.ViewBgColor}} >
                <View style={{height:300}}>
                <View style={{height:44, flexDirection:'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft:16,paddingRight:16}}>
                    <TouchableOpacity onPress={() => {bosterDateRef.current?.setModalVisible()}}>
                        <Text style={{color:ThemeColor.BtnColor, fontSize:18, fontFamily: FontName.Regular}}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={{color:ThemeColor.TextColor, fontSize:18, fontFamily: FontName.Bold}}>Booster date</Text>
                    <TouchableOpacity onPress={() => {
                      {bosterDateString.length == 0 && handleBoosterDateChange(bosterDate) }
                      bosterDateRef.current?.setModalVisible()
                      }}>
                        <Text style={{color:ThemeColor.BtnColor, fontSize:18, fontFamily: FontName.Regular}}>Done</Text>
                    </TouchableOpacity>
                </View>
                <DatePicker
                    style={{backgroundColor: 'white',flex:1,width:Dimensions.get('window').width}}
                    itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
                    mode={'date'}
                    minimumDate={startDate}
                    maximumDate={new Date()}
                    date={bosterDate}
                    onDateChange={(val) => {handleBoosterDateChange(val)}}
                />
                </View>
            </ActionSheetView>
            <ActionSheetView ref={statusRef} containerStyle={{backgroundColor:ThemeColor.ViewBgColor}}>
              <View style={{height:300}}>
                <View style={{height:60, flexDirection:'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft:16,paddingRight:16}}>
                  <TouchableOpacity onPress={() => {statusRef.current?.setModalVisible()}}>
                    <Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Cancel</Text>
                  </TouchableOpacity>
                  <Text style={{color:ThemeColor.ActionSheetTitleColor, fontSize:18, fontFamily: FontName.Bold}}>Vaccination status</Text>
                  <TouchableOpacity onPress={() => {
                    {data.vaccineStatusId == 0 && setData({...data,vaccineStatusId:covidVaccinesStatusArray[0].id,vaccineStatusName:covidVaccinesStatusArray[0].name})}
                      statusRef.current?.setModalVisible()}
                    }>
                    <Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Done</Text>
                  </TouchableOpacity>
                </View>
                <Picker
                  style={{backgroundColor: 'white',flex:1,fontSize:14, fontFamily: FontName.Regular}}
                  itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
                  selectedValue={data.vaccineStatusId}
                  onValueChange={(itemValue, index) =>{
                    console.log(itemValue,index)
                    let selectedItem = covidVaccinesStatusArray[index];
                    setData({...data,vaccineStatusId:selectedItem.id,vaccineStatusName:selectedItem.name});

                  }}>
                  {covidVaccinesStatusArray && covidVaccinesStatusArray.map((item, index) => {
                    return (<Picker.Item label={item.name} value={item.id} key={index}/>) 
                  })}
                </Picker>
              </View>
            </ActionSheetView>
            <ActionSheetView ref={vaccineRef} containerStyle={{backgroundColor:ThemeColor.ViewBgColor}}>
              <View style={{height:300}}>
                <View style={{height:60, flexDirection:'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft:16,paddingRight:16}}>
                  <TouchableOpacity onPress={() => {vaccineRef.current?.setModalVisible()}}>
                    <Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Cancel</Text>
                  </TouchableOpacity>
                  <Text style={{color:ThemeColor.ActionSheetTitleColor, fontSize:18, fontFamily: FontName.Bold}}>Vaccine provider</Text>
                  <TouchableOpacity onPress={() => {
                      {data.vaccineId == 0 && setData({...data,vaccineId:covidVaccinesArray[0].id,vaccineName:covidVaccinesArray[0].name}) }
                      vaccineRef.current?.setModalVisible()}
                    }>
                    <Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Done</Text>
                  </TouchableOpacity>
                </View>
                <Picker
                  style={{backgroundColor: 'white',flex:1,fontSize:14, fontFamily: FontName.Regular}}
                  itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
                  selectedValue={data.vaccineId}
                  onValueChange={(itemValue, index) =>{
                    console.log(itemValue,index)
                    let selectedItem = covidVaccinesArray[index];
                    setData({...data,vaccineId:selectedItem.id,vaccineName:selectedItem.name});

                  }}>
                  {covidVaccinesArray && covidVaccinesArray.map((item, index) => {
                    return (<Picker.Item label={item.name} value={item.id} key={index}/>) 
                  })}
                </Picker>
              </View>
            </ActionSheetView>    
        </SafeAreaView>
    );
};

export default EOBCovidVaccinationScreen;


const styles = StyleSheet.create({
    container: {
      backgroundColor:'#E5E9EB',
    },inputText:{
      flex: 1,
      height:40,
      color:'black',
      fontSize:16,
      fontFamily: FontName.Regular,
      marginLeft:8,
      alignContent:'stretch',
	  },btnFill:{
      marginTop:32,
       width:'100%',
        height:50,
        justifyContent:"center",
        backgroundColor:ThemeColor.BtnColor ,
        alignItems:'center',
        borderRadius:5,
        padding:16,
        marginRight:16,
        marginLeft:16,
        marginBottom:16,
      },labelText:{
        flex: 1,
        color:'black',
        fontSize:16,
        fontFamily: FontName.Regular,
        marginLeft:8,
        alignContent:'stretch',
      }
  });

    