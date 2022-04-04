import 'react-native-gesture-handler';
import React ,{useEffect,createRef, useRef}from 'react';
import { View ,
    Dimensions,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Text} from 'react-native';

import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from "react-native-vector-icons/FontAwesome";
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'
import axios from 'axios'
import RNFS from 'react-native-fs';
import DocumentPicker from 'react-native-document-picker';
import * as ImagePicker from 'react-native-image-picker';
import DatePicker from 'react-native-date-picker'
import {default as ActionSheetView} from 'react-native-actions-sheet';
import ActionSheet from 'react-native-actionsheet'

import { AuthContext } from '../../Components/context';
import {getAuthHeader} from '../../_helpers/auth-header';
import {parseErrorMessage} from '../../_helpers/Utils';
import { BaseUrl, EndPoints, StaticMessage, ThemeColor,FontName } from '../../_helpers/constants';
import Loader from '../../Components/Loader';

import moment from 'moment';

const startDateRef = createRef();


const EOBAttachmentScreen = ({route,navigation})  => {
    const [data,setData] = React.useState({
        resumeTitle:'',
        resumeData:'',
        fileName:'',
        startDate:'',
        fileType:'',
    });
    const { signOut } = React.useContext(AuthContext);
    let [isLoading, setIsLoading] = React.useState(false);
    const [startDate, setStartDate] = React.useState(new Date());
    const [startDateString, setStartDateString] = React.useState('');
    const actionSheetDoc = useRef();
    const { comeFrom } = route.params;
    const { stepDetail } = route.params;
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
		
    },[]);
    
    const  updateProfileDetails = async() => {
        let user = await AsyncStorage.getItem('loginDetails');  
        let parsed = JSON.parse(user);  
        let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
        var authToken = base64.encode(userAuthToken);

        const params = {
            'dmsId':'',
            'docId':stepDetail.docId,
            'docName':stepDetail.docName,
            'docPath':'',
            'envelopeTypeId':stepDetail.envelopeTypeId,
            'expiryDate':startDateString,
            'isMandatory':1,
            "fileName":data.fileName,
            'fileData':data.resumeData,
            'fileType': data.fileName.split('.').pop()
        }
        console.log(JSON.stringify(params),BaseUrl + EndPoints.EOBAttachment);
        setIsLoading(true);

        axios ({  
          "method": "POST",
          "url": BaseUrl + EndPoints.EOBAttachment,
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
              setData({...data,resumeData:base64data,fileName:res.name});
            }
        } catch (err) {
            if (DocumentPicker.isCancel(err)) {
            } else {
                throw err;
            }
        }
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
          // const source = { uri: res.assets[0].uri };
          console.log('Image URI:',+ res.uri ? res.uri : res.assets[0].uri);
          console.log('response', JSON.stringify(res));          
          var base64data = await RNFS.readFile(res.uri ? res.uri : res.assets[0].uri, 'base64').then(res => { return res });
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
            var base64data = await RNFS.readFile( res.assets[0].uri, 'base64').then(res => { return res });
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
    const showActionSheet = () => {
      actionSheetDoc.current.show();
    }
    return (
        <View style={styles.container}>            
            <View style={{flex:1, height:'100%', width:'100%',alignItems: 'center', justifyContent: 'center', marginBottom:160}}>
                <TouchableOpacity onPress = {() => {showActionSheet()}}>
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
                {data.resumeData.length > 0 &&
                  <View style={{marginTop:12, width:'100%'}}>
                      <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8,marginBottom:4}}>Expiry date</Text>
                      <TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}} onPress={() => {startDateRef.current?.setModalVisible()}}>
                          <Text style={[styles.labelText,{color:startDateString.length > 0 ? ThemeColor.TextColor :ThemeColor.PlaceHolderColor}]}>{startDateString.length > 0 ? startDateString : 'Select expity date'}</Text>
                          <Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22,22} />
                      </TouchableOpacity>
                  </View>  
                }
            </View>
            <TouchableOpacity style={styles.btnFill} onPress={() => {updateProfileDetails()}}>
                <Text style={{color:'white',fontFamily: FontName.Regular, fontSize:16 }}>SAVE</Text>
            </TouchableOpacity>
            <Loader isLoading={isLoading} /> 
            <ActionSheetView ref={startDateRef} containerStyle={{backgroundColor:ThemeColor.ViewBgColor}} >
                <View style={{height:300}}>
                <View style={{height:44, flexDirection:'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft:16,paddingRight:16}}>
                    <TouchableOpacity onPress={() => {startDateRef.current?.setModalVisible()}}>
                        <Text style={{color:ThemeColor.BtnColor, fontSize:18, fontFamily: FontName.Regular}}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={{color:ThemeColor.TextColor, fontSize:18, fontFamily: FontName.Regular}}>Expiry date</Text>
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
                    date={startDate}
                    onDateChange={(val) => {handleStartDateChange(val)}}
                />
                </View>
            </ActionSheetView>


        </View>
    );
  };

export default EOBAttachmentScreen;


const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      alignItems: 'center' ,
      backgroundColor:'#E5E9EB',
      padding:16 
    },inputText:{
		flex: 1,
		height:40,
		color:'black',
		fontSize:16,
		fontFamily: FontName.Regular,
		marginLeft:8,
		alignContent:'stretch',
	  },btnFill:{
        width:'100%',
        margin: 16,
        height:50,
        justifyContent:"center",
        backgroundColor:ThemeColor.BtnColor ,
        alignItems:'center',
        borderRadius:5
      },labelText:{
        flex: 1,
        color:'black',
        fontSize:16,
        fontFamily: FontName.Regular,
        marginLeft:8,
        alignContent:'stretch',
      }
  });

    