import 'react-native-gesture-handler';
import React ,{useEffect,useRef,createRef}from 'react';
import { View ,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Platform,
    Alert,
    Text} from 'react-native';

import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'
import axios from 'axios'
import RNFS from 'react-native-fs';
import DocumentPicker from 'react-native-document-picker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import {Picker} from '@react-native-picker/picker';
import {default as ActionSheetView} from 'react-native-actions-sheet';
import ActionSheet from 'react-native-actionsheet'
import * as ImagePicker from 'react-native-image-picker';
import { AuthContext } from '../../Components/context';
import {getAuthHeader} from '../../_helpers/auth-header';
import { BaseUrl, EndPoints, StaticMessage, ThemeColor,FILETYPE , FontName} from '../../_helpers/constants';
import Loader from '../../Components/Loader';
import {parseErrorMessage} from '../../_helpers/Utils';


const docTitleRef = createRef();


const ResumeDocumentScreen = ({route,navigation})  => {
    const [data,setData] = React.useState({
        resumeTitle:'',
        resumeData:'',
        fileName:'',
        docName:'',
        docTitle:''
    });
    const { signOut } = React.useContext(AuthContext);
    let [isLoading, setIsLoading] = React.useState(false);
	
	const { profileDetail } = route.params;
	const { lookupData } = route.params;
	const { fileType } = route.params;
  const actionSheet = useRef();

    React.useLayoutEffect(() => {
		navigation.setOptions({
			title: fileType == 'DOC' ? 'Upload document' : 'Upload resume',
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
        console.log("File Type",fileType);
    },[]);
    
    const  updateProfileDetails = async() => {
        let user = await AsyncStorage.getItem('loginDetails');  
        let parsed = JSON.parse(user);  
        let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
        var authToken = base64.encode(userAuthToken);

        setIsLoading(true);
        const params = {
            "fileName":data.fileName,
            'file':data.resumeData,
            'docName': fileType == 'DOC' ? data.docName : data.resumeTitle,
            'fileType': fileType == 'DOC' ? FILETYPE.TYPE_DOC : FILETYPE.TYPE_RESUME
        }
        console.log(`File upload request: ${JSON.stringify(params)}`);

        axios ({  
          "method": "PUT",
          "url": BaseUrl + EndPoints.UserProfile,
          "headers": getAuthHeader(authToken),
          data:{'documents':params}
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
    const handleDocActionsheet = (index) => {
        if(index == 0){
            selectResume();
        }else if(index == 1){
            imageGalleryLaunch();
        }else if (index == 2){
            cameraLaunch();
        }
    }
    const showActionSheet = () => {
      actionSheet.current.show();
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
    const selectResume = async () => {
        try {
            const res = await DocumentPicker.pick({
                type: [DocumentPicker.types.pdf,DocumentPicker.types.doc,DocumentPicker.types.docx,DocumentPicker.types.plainText],
            });
            console.log(res.uri,res.type, res.name,res.size);
            var newURI = res.uri.split("%20").join("\ ");
            var base64data = await RNFS.readFile( newURI, 'base64').then(res => { return res });
            setData({...data,resumeData:base64data,fileName:res.name});
        } catch (err) {
            if (DocumentPicker.isCancel(err)) {
            } else {
                throw err;
            }
        }
    }
   

    const uploadDocTypeList = lookupData ? lookupData.uploadDocType : [];

    return (
        <View style={styles.container}>            
            <View style={{flex:1, height:'100%', width:'100%',alignItems: 'center', justifyContent: 'center', marginBottom:160}}>
                
                <TouchableOpacity onPress = {() => {fileType == 'DOC' ? showActionSheet() :selectResume()}}>
                    <FontAwesome name="cloud-upload" color={ThemeColor.BtnColor} size={80} />
                    <ActionSheet
                        ref={actionSheet}
                        options={['Upload document', 'Photo library','Take photo', 'Cancel']}
                        cancelButtonIndex={3}
                        onPress={(index) => { handleDocActionsheet(index) }}
                    />
                </TouchableOpacity>
                <Text style={{fontFamily:FontName.Regular, fontSize:16,color:ThemeColor.SubTextColor, textAlign:'center', marginTop:16}}>Tap here to select a file to upload</Text>
                <Text style={{fontFamily:FontName.Regular, fontSize:14,color:ThemeColor.SubTextColor, textAlign:'center', marginTop:4}}>Maximum file size: 2MB</Text>
                {data.fileName.length > 0 && 
					<View>
						<Text style={{fontFamily:FontName.Regular, fontSize:16,color:ThemeColor.SubTextColor, textAlign:'center', marginTop:16}}>You are attaching file</Text> 
						<Text style={{fontFamily:FontName.Regular, fontSize:16,color:ThemeColor.NavColor, textAlign:'center'}}>{data.fileName}</Text> 
					</View>
				}
                { fileType != 'DOC' ? 
				<View style={{marginTop:24, width:'100%'}}>
					<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Document / Resume title</Text>
					<View style={{backgroundColor:'white', height:40, borderRadius:3, flexDirection:'row', alignItems:'center', paddingRight:8, marginTop:2}}>
						<TextInput  
						style={[styles.inputText,{height:130, textAlignVertical:'top'}]}
						placeholder="Document / Resume title" 
                        placeholderTextColor={ThemeColor.PlaceHolderColor}
						keyboardType='default'
						returnKeyType='done'
						value= {data.resumeTitle}
						onChangeText={(val) => setData({...data,resumeTitle:val})}
						/>
					</View>
				</View> : null }  
                {
                    fileType == 'DOC' ? 
                    Platform.OS == 'ios' ? 
                    <View style={{marginTop:32, width:'100%'}}>
                        <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Title*</Text>
                        <TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}  onPress={() => {docTitleRef.current?.setModalVisible()}}>
                            <Text style={[styles.labelText,{color:data.docTitle.length > 0 ? 'black' : ThemeColor.PlaceHolderColor}]}>{data.docTitle.length >0 ? data.docTitle : 'Select document title'}</Text>
                            <Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22,22} />
                        </TouchableOpacity>
                    </View> 
                    :
                    <View style={{marginTop:32, width:'100%'}}>
                        <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Title*</Text>
                        <TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}  onPress={() => {docTitleRef.current?.setModalVisible()}}>
                            <Picker
                                style={{backgroundColor: 'white',flex:1,}}
                                itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
                                selectedValue={data.docName}
                                onValueChange={(itemValue, index) =>{
                                    console.log(itemValue,index)
                                    let selectedItem = uploadDocTypeList[index];
                                    setData({...data,docName:selectedItem.key,docTitle:selectedItem.value});

                                }}>
                                {uploadDocTypeList && uploadDocTypeList.map((item, index) => {
                                    return (<Picker.Item label={item.value} value={item.key} key={index}/>) 
                                })}
                            </Picker>
                            <Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22,22} />
                        </TouchableOpacity>
                    </View> : null 
                }
            </View>
            <TouchableOpacity style={styles.btnFill} onPress={() => {updateProfileDetails()}}>
                <Text style={{color:'white',fontFamily: FontName.Regular, fontSize:16 }}>SAVE</Text>
            </TouchableOpacity>
            <Loader isLoading={isLoading} /> 
            <ActionSheetView ref={docTitleRef} containerStyle={{backgroundColor:ThemeColor.ViewBgColor}}>
                <View style={{height:300}}>
                    <View style={{height:60, flexDirection:'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft:16,paddingRight:16}}>
                    <TouchableOpacity onPress={() => {docTitleRef.current?.setModalVisible()}}>
                        <Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={{color:ThemeColor.ActionSheetTitleColor, fontSize:18, fontFamily: 'Lato-Bold'}}>Authorization status</Text>
                    <TouchableOpacity onPress={() => {
                            {data.docName.length == 0 && setData({...data,docName:uploadDocTypeList[0].key,docTitle:uploadDocTypeList[0].value})}
                            docTitleRef.current?.setModalVisible()}
                        }>
                        <Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Done</Text>
                    </TouchableOpacity>
                    </View>
                    <Picker
                    style={{backgroundColor: 'white',flex:1,}}
                    itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
                    selectedValue={data.docName}
                    onValueChange={(itemValue, index) =>{
                        console.log(itemValue,index)
                        let selectedItem = uploadDocTypeList[index];
                        setData({...data,docName:selectedItem.key,docTitle:selectedItem.value});

                    }}>
                    {uploadDocTypeList && uploadDocTypeList.map((item, index) => {
                        return (<Picker.Item label={item.value} value={item.key} key={index}/>) 
                    })}
                    </Picker>
                </View>
            </ActionSheetView>
        </View>
    );
  };

export default ResumeDocumentScreen;


const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      alignItems: 'center' ,
      backgroundColor:'#E5E9EB' 
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
        borderRadius:5,
      },labelText:{
        flex: 1,
        color:'black',
        fontSize:16,
        fontFamily: FontName.Regular,
        marginLeft:8,
        alignContent:'stretch',
      }
  });

    