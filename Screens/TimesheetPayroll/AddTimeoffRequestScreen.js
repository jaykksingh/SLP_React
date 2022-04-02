import React,{useEffect,userState,createRef} from "react";
import { 
	StatusBar, 
    Text, 
    TouchableOpacity,
    StyleSheet, 
    View,
	TextInput,
	Dimensions,
	Switch,
	SafeAreaView,
	Alert,
	Platform
} from "react-native";
import { WebView } from 'react-native-webview';
import Icon from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import moment from 'moment';
import {Picker} from '@react-native-picker/picker';
import ActionSheet from 'react-native-actionsheet'
import {default as ActionSheetView} from 'react-native-actions-sheet';

import DatePicker from 'react-native-date-picker'
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'
import axios from 'axios'
import RNFS from 'react-native-fs';
import * as ImagePicker from 'react-native-image-picker';

import DocumentPicker from 'react-native-document-picker';
import { parseErrorMessage } from '../../_helpers/Utils'
import Loader from '../../Components/Loader';
import {getAuthHeader} from '../../_helpers/auth-header';
import { BaseUrl, EndPoints, StaticMessage, ThemeColor , FontName} from '../../_helpers/constants';



const projectRef = createRef();
const startDateRef = createRef();
const endDateRef = createRef();
const vacationTypeRef = createRef();
const vacationLocationRef = createRef();


const AddTimeoffRequestScreen = ({route,navigation}) => {
	const [isLoading, setIsLoading] = React.useState(false);
	const [lookupData, setLookupData] = React.useState({});
	const [projectArray, setProjectArray] = React.useState([]);
	const [startDate, setStartDate] = React.useState(new Date());
	const [endDate, setEndDate] = React.useState(new Date());
  
	const [data,setData] = React.useState({
		projectName:'',
		projectId:'',
		fromDate:'',
		toDate:'',
		vacationTypeID:'',
		vacationType:'',
		vacationLocationID:'',
		vacationLocation:'',
		reason:'',
		contactInfo:'',
		joinSameClient:true,
		resumeTitle:'',
		resumeData:'',
		fileName:''

	});
	React.useLayoutEffect(() => {
		navigation.setOptions({
			  title: `Request for time-off `,
		});
	}, [navigation]);
	const showShareOptions = () =>{

	}
	useEffect(() => {
		getUserLookups();
		getProjectDetails();
		
	},[]);

	const  getProjectDetails = async() => {

		let user = await AsyncStorage.getItem('loginDetails');  
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken);

		setIsLoading(true);
		axios ({  
		  "method": "GET",
		  "url": BaseUrl + EndPoints.CurrentProjectsList,
		  "headers": getAuthHeader(authToken)
		})
		.then((response) => {
		  setIsLoading(false);
		  if (response.data.code == 200){
			const results = JSON.stringify(response.data.content.dataList[0])
			console.log(`Current Projects: ${results}`);

			setProjectArray(response.data.content.dataList);
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
		  console.error(error);
		  setIsLoading(false);
		  Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
			{text: 'Ok'}
		  ]);
	
		})
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
			setIsLoading(false);
		  if (response.data.code == 200){
			const results = JSON.stringify(response.data.content.dataList[0])

			console.log(`Lookup data: ${results}`);
			setLookupData(response.data.content.dataList[0]);
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
			setIsLoading(false);
			Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
			  {text: 'Ok'}
			]);
		})
	}
	const  handleSubmit = async() => {
		if(data.projectName.length == 0){
			Alert.alert(StaticMessage.AppName, StaticMessage.SelectProjectAlert, [
				{text: 'Ok'}
			]);
			return;
		}
		let user = await AsyncStorage.getItem('loginDetails');  
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken);

		setIsLoading(true);
		const params = {
			"project":data.projectId,
			'fromDate':data.fromDate,
			'toDate':data.toDate,
			'reason':data.reason,
			'contactInfo':data.contactInfo,
			'vactiontype':String(data.vacationTypeID),
			'vactionlocation':String(data.vacationLocationID),
			'joinSameClient': data.joinSameClient ? '1' : '0',
			'file':data.resumeData,
			'fileName':data.fileName
		}
		console.log('Params:',JSON.stringify(params));
		axios ({  
		  "method": "POST",
		  "url": BaseUrl + EndPoints.GetVacationList,
		  "headers": getAuthHeader(authToken),
		  data:params
		})
		.then((response) => {
			setIsLoading(false);
			if (response.data.code == 200){
				let message = response.data.content.messageList.success;
				Alert.alert(StaticMessage.AppName, message, [
					{text: 'Ok',
					onPress : () => navigation.goBack()
					}
				]);
			}else if (response.data.code == 417){
				const message = parseErrorMessage(response.data.content.messageList);
				Alert.alert(StaticMessage.AppName, message, [
					{text: 'Ok'}
				]);
			}
		})
		.catch((error) => {
		  setIsLoading(false);
		  Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
			{text: 'Ok'}
		  ]);
	
		})
	  }

	const toggleSwitch = () => {
		setData({...data,joinSameClient:!data.joinSameClient});
	}

	
	
	const sampleData = [
	{
		Value: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
		Text: 'First Item',
	},
	{
		Value: '3ac68afc-c605-48d3-a4f8-fbd91aa97f63',
		Text: 'Second Item',
	},
	{
		Value: '58694a0f-3da1-471f-bd96-145571e29d72',
		Text: 'Third Item',
	},
	];
	const handleStartDateChange = (val) =>{
		console.log("Start Date:",val.toString());
		setStartDate(val);
		let showDate = moment(val).format('MMM DD, YYYY')
		setData({...data,fromDate:showDate});
	}
	const handleEndDateChange = (val) =>{
		console.log("Start Date:",val.toString());
		setEndDate(val);
		let showDate = moment(val).format('MMM DD, YYYY')
		setData({...data,toDate:showDate});
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
	const selectResume = async () => {
        try {
            const res = await DocumentPicker.pick({
                type: [DocumentPicker.types.pdf,DocumentPicker.types.doc,DocumentPicker.types.docx,DocumentPicker.types.plainText],
            });
            console.log(res.uri,res.type, res.name,res.size);
			var result = res.uri.split("%20").join("\ ");

            var base64data = await RNFS.readFile( result, 'base64').then(res => { return res });
			setData({...data,resumeData:base64data,fileName:res.name});
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

	
	return(
		<SafeAreaView style={styles.container}>
			<KeyboardAwareScrollView style={{paddingLeft:16, paddingRight:16, marginBottom:8}}>
				{Platform.OS == 'ios' ?
					<View style={{marginTop:12}}>
						<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Project</Text>
						<TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}} onPress={() => {projectRef.current?.setModalVisible()}}>
							<Text style={[styles.labelText,{color:data.projectName.length > 0 ? 'black' : ThemeColor.PlaceHolderColor}]}>{data.projectName.length >0 ? data.projectName : 'Select project'}</Text>
							<Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22} />
						</TouchableOpacity>
					</View> : 
					<View style={{marginTop:12}}>
						<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Project</Text>
						<TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center'}}>
							<Picker
								style={{flex:1,fontSize:14, fontFamily: FontName.Regular}}
								itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
								selectedValue={data.projectId}
								onValueChange={(itemValue, index) =>{
									let selectedObj = projectArray[index];
									setData({...data, projectId: selectedObj.projectDetails.projectDetailId,projectName: selectedObj.projectDetails.projectName})
								}}>
								{projectArray && projectArray.map((item, index) => {
									return (<Picker.Item label={item.projectDetails.projectName} value={item.projectDetails.projectDetailId} key={index}/>) 
								})}
							</Picker>
						</TouchableOpacity>
					</View> 
				}
				<View style={{marginTop:8}}>
					<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Period</Text>
					<View style={{flexDirection:'row',borderRadius:5,backgroundColor:'white', height:40,}}>
						<TouchableOpacity style={{flex: 1, flexDirection:'row', alignItems:'center', paddingRight:8}}  onPress={() => {startDateRef.current?.setModalVisible()}}>
							<Text style={[styles.labelText,{color:data.fromDate.length > 0 ? 'black' : ThemeColor.PlaceHolderColor}]}>{data.fromDate.length > 0 ? data.fromDate : 'Start date'}</Text>
							<Icon name="calendar" color={ThemeColor.LabelTextColor} size={22,22} />
						</TouchableOpacity>
						<TouchableOpacity style={{flex: 1,flexDirection:'row', alignItems:'center', paddingRight:16}}  onPress={() => {endDateRef.current?.setModalVisible()}}>
							<Text style={[styles.labelText,{color:data.toDate.length > 0 ? 'black' : ThemeColor.PlaceHolderColor}]}>{data.toDate.length > 0 ? data.toDate : 'End date'}</Text>
							<Icon name="calendar" color={ThemeColor.LabelTextColor} size={22,22} />
						</TouchableOpacity>
					</View>
					<View style={{height:1, backgroundColor:ThemeColor.BorderColor}}/>
				</View>
				{Platform.OS == 'ios' ? 
				<>
					<View style={{marginTop:12}}>
						<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Vacation type</Text>
						<TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}} onPress={() => {vacationTypeRef.current?.setModalVisible()}}>
							<Text style={[styles.labelText,{color:data.vacationType.length > 0 ? 'black' : ThemeColor.PlaceHolderColor}]}>{data.vacationType.length >0 ? data.vacationType : 'Select vacation type'}</Text>
							<Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22,22} />
						</TouchableOpacity>
					</View> 
					<View style={{marginTop:12}}>
						<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Vacation location</Text>
						<TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}} onPress={() => {vacationLocationRef.current?.setModalVisible()}}>
							<Text style={[styles.labelText,{color:data.vacationLocation.length > 0 ? 'black' : ThemeColor.PlaceHolderColor}]}>{data.vacationLocation.length >0 ? data.vacationLocation : 'Select vacation location'}</Text>
							<Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22,22} />
						</TouchableOpacity>
					</View>
				</> :
				<>
					<View style={{marginTop:12}}>
						<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Vacation type</Text>
						<View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center'}}>
							<Picker
								style={{flex:1,fontSize:14, fontFamily: FontName.Regular}}
								itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
								selectedValue={data.vacationTypeID}
								onValueChange={(itemValue, index) =>{
									console.log(itemValue,index)
									let selectedObj = lookupData.vacationType[index];
									console.log(selectedObj)
									setData({...data,vacationTypeID:selectedObj.keyId,vacationType:selectedObj.keyName});

								}}>
								{lookupData.vacationType && lookupData.vacationType.map((item, index) => {
									return (<Picker.Item label={item.keyName} value={item.keyId} key={index}/>) 
								})}
							</Picker>
						</View>
					</View> 
					<View style={{marginTop:12}}>
						<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Vacation location</Text>
						<View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center'}}>
							<Picker
								style={{flex:1,fontSize:14, fontFamily: FontName.Regular}}
								itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
								selectedValue={data.vacationLocationID}
								onValueChange={(itemValue, index) =>{
									console.log(itemValue,index)
									let selectedObj = lookupData.vacationLocation[index];
									console.log(selectedObj)
									setData({...data,vacationLocationID:selectedObj.keyId,vacationLocation:selectedObj.keyName});

								}}>
								{lookupData.vacationLocation && lookupData.vacationLocation.map((item, index) => {
									return (<Picker.Item label={item.keyName} value={item.keyId} key={index}/>) 
								})}
							</Picker>
						</View>
					</View>
				</>
				} 
				{data.vacationLocationID == 20542 ? 
				<View style={{marginTop:18, backgroundColor:'#fff',borderRadius:5, alignItems: 'center', paddingBottom:16, paddingTop:16}}>
					<TouchableOpacity onPress = {() => {this.ActionSheet.show()}}>
                    	<FontAwesome name="cloud-upload" color={ThemeColor.BtnColor} size={60} />
					</TouchableOpacity>
					<ActionSheet
                        ref={o => this.ActionSheet = o}
                        options={['Upload document', 'Photo library','Take photo', 'Cancel']}
                        cancelButtonIndex={3}
                        // destructiveButtonIndex={}
                        onPress={(index) => { handleDocActionsheet(index) }}
                    /> 
					<Text style={{fontFamily:FontName.Regular, fontSize:16,color:ThemeColor.SubTextColor, textAlign:'center', paddingLeft:8, paddingRight:8}}>{data.fileName.length > 0 ? data.fileName : 'Upload file'}</Text>
					<Text style={{fontFamily:FontName.Regular, fontSize:14,color:ThemeColor.SubTextColor, textAlign:'center', marginTop:2}}>Maximum file size: 2MB</Text>
				</View> : null
				}
			
				<View style={{marginTop:12}}>
					<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Reason</Text>
					<View style={{backgroundColor:'white', height:100, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}>
						<TextInput  
							style={[styles.inputText,{height:90, textAlignVertical:'top'}]}
							multiline={true}
							placeholder="Enter Reason" 
							placeholderTextColor={ThemeColor.PlaceHolderColor}
							keyboardType='default'
							value= {data.reason}
							onChangeText={(val) => setData({...data,reason:val})}
						/>
					</View>
				</View>
				<View style={{marginTop:12}}>
					<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Contact info</Text>
					<View style={{backgroundColor:'white', height:100, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}>
						<TextInput  
						style={[styles.inputText,{height:90, textAlignVertical:'top'}]}
						multiline={true}
						placeholder="Enter contact info" 
						placeholderTextColor={ThemeColor.PlaceHolderColor}
						keyboardType='default'
						value= {data.contactInfo}
						onChangeText={(val) => setData({...data,contactInfo:val})}
						/>
					</View>
				</View>
				<View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8, marginTop:16, justifyContent:'space-between'}}>
					<Text style ={{color:ThemeColor.TextColor, fontSize:14, fontFamily:FontName.Regular, paddingLeft:8}}>Will continue with same client upon return</Text>
					<Switch
						trackColor={{ false: ThemeColor.SwitchInactiveColor, true:ThemeColor.BtnColor }}
						ios_backgroundColor = {ThemeColor.SwitchInactiveColor}
						onValueChange={toggleSwitch}
						thumbColor={data.joinSameClient ? "#FFF" : "#f4f3f4"}
						value={ data.joinSameClient}
					/>            
				</View>
				<Loader isLoading={isLoading} />
			</KeyboardAwareScrollView>
			<View style={{flexDirection:'row',borderRadius:5,marginTop:8,marginLeft:16, marginRight:16,marginBottom:8}}>
				<TouchableOpacity style={styles.btnFill} onPress={() => {handleSubmit()}}>
					<Text style={{color:'#53962E',fontFamily: FontName.Regular, fontSize:16, color:'#fff' }}>SAVE</Text>
				</TouchableOpacity>
			</View> 
			<ActionSheetView ref={projectRef} containerStyle={{backgroundColor:ThemeColor.ViewBgColor}}>
				<View style={{height:300}}>
					<View style={{height:60, flexDirection:'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft:16,paddingRight:16}}>
					<TouchableOpacity onPress={() => {projectRef.current?.setModalVisible()}}>
						<Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Cancel</Text>
					</TouchableOpacity>
					<Text style={{color:ThemeColor.TextColor, fontSize:16, fontFamily: 'Lato-Bold'}}>Select project</Text>
					<TouchableOpacity onPress={() => {
						data.projectName.length == 0 ? setData({...data,projectId:projectArray[0].projectDetails.projectDetailId,projectName:projectArray[0].projectDetails.projectName}) : '';
						projectRef.current?.setModalVisible()}
					}>
						<Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Done</Text>
					</TouchableOpacity>
					</View>
					<Picker
						style={{backgroundColor: 'white',flex:1,fontSize:14, fontFamily: FontName.Regular}}
						itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
						selectedValue={data.projectId}
						onValueChange={(itemValue, index) =>{
							let selectedObj = projectArray[index];
							setData({...data, projectId: selectedObj.projectDetails.projectDetailId,projectName: selectedObj.projectDetails.projectName})
						}}>
						{projectArray && projectArray.map((item, index) => {
							return (<Picker.Item label={item.projectDetails.projectName} value={item.projectDetails.projectDetailId} key={index}/>) 
						})}
					</Picker>
				</View>
			</ActionSheetView>
			<ActionSheetView ref={startDateRef} containerStyle={{backgroundColor:ThemeColor.ViewBgColor}}>
				<View style={{height:300}}>
					<View style={{height:44, flexDirection:'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft:16,paddingRight:16}}>
					<TouchableOpacity onPress={() => {startDateRef.current?.setModalVisible()}}>
						<Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Cancel</Text>
					</TouchableOpacity>
					<Text style={{color:ThemeColor.TextColor, fontSize:18, fontFamily: FontName.Regular}}>Start date</Text>
					<TouchableOpacity onPress={() => {
						{data.fromDate.length == 0 && handleStartDateChange(startDate) }
						startDateRef.current?.setModalVisible()
						}}>
						<Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Done</Text>
					</TouchableOpacity>
					</View>
					<DatePicker
						style={{backgroundColor: 'white',flex:1,width:Dimensions.get('window').width}}
						mode={'date'}
						minimumDate={new Date()}
						date={startDate}
						onDateChange={(val) => {
							handleStartDateChange(val)}
						}
					/>
				</View>
			</ActionSheetView>
			<ActionSheetView ref={endDateRef} containerStyle={{backgroundColor:ThemeColor.ViewBgColor}}>
				<View style={{height:300}}>
					<View style={{height:44, flexDirection:'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft:16,paddingRight:16}}>
					<TouchableOpacity onPress={() => {endDateRef.current?.setModalVisible()}}>
						<Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Cancel</Text>
					</TouchableOpacity>
					<Text style={{color:ThemeColor.TextColor, fontSize:18, fontFamily: FontName.Regular}}>End date</Text>
					<TouchableOpacity onPress={() => {
						{data.toDate.length == 0 && handleEndDateChange(endDate) }
						endDateRef.current?.setModalVisible()
						}}>
						<Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Done</Text>
					</TouchableOpacity>
					</View>
					<DatePicker
						style={{backgroundColor: 'white',flex:1,width:Dimensions.get('window').width}}
						mode={'date'}
						minimumDate={startDate}
						date={endDate}
						onDateChange={(val) => {handleEndDateChange(val)}}
					/>
				</View>
			</ActionSheetView> 
			<ActionSheetView ref={vacationTypeRef} containerStyle={{backgroundColor:ThemeColor.ViewBgColor}}>
				<View style={{height:300}}>
					<View style={{height:60, flexDirection:'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft:16,paddingRight:16}}>
					<TouchableOpacity onPress={() => {vacationTypeRef.current?.setModalVisible()}}>
						<Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Cancel</Text>
					</TouchableOpacity>
					<Text style={{color:ThemeColor.TextColor, fontSize:16, fontFamily: 'Lato-Bold'}}>Select vacation type</Text>
					<TouchableOpacity onPress={() => {
						data.vacationType.length == 0 ? setData({...data,vacationTypeID:lookupData.vacationType[0].keyId,vacationType:lookupData.vacationType[0].keyName}) : '';
						vacationTypeRef.current?.setModalVisible()}
					}>
						<Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Done</Text>
					</TouchableOpacity>
					</View>
					<Picker
						style={{backgroundColor: 'white',flex:1,fontSize:14, fontFamily: FontName.Regular}}
						itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
						selectedValue={data.vacationTypeID}
						onValueChange={(itemValue, index) =>{
							console.log(itemValue,index)
							let selectedObj = lookupData.vacationType[index];
							console.log(selectedObj)
							setData({...data,vacationTypeID:selectedObj.keyId,vacationType:selectedObj.keyName});

						}}>
						{lookupData.vacationType && lookupData.vacationType.map((item, index) => {
							return (<Picker.Item label={item.keyName} value={item.keyId} key={index}/>) 
						})}
					</Picker>
				</View>
			</ActionSheetView> 
			<ActionSheetView ref={vacationLocationRef} containerStyle={{backgroundColor:ThemeColor.ViewBgColor}}>
				<View style={{height:300}}>
					<View style={{height:60, flexDirection:'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft:16,paddingRight:16}}>
					<TouchableOpacity onPress={() => {vacationLocationRef.current?.setModalVisible()}}>
						<Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Cancel</Text>
					</TouchableOpacity>
					<Text style={{color:ThemeColor.TextColor, fontSize:16, fontFamily: 'Lato-Bold'}}>Select vacation location</Text>
					<TouchableOpacity onPress={() => {
						data.vacationLocation.length == 0 ? setData({...data,vacationLocationID:lookupData.vacationLocation[0].keyId,vacationLocation:lookupData.vacationLocation[0].keyName}) : '';
						vacationLocationRef.current?.setModalVisible()}
					}>
						<Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Done</Text>
					</TouchableOpacity>
					</View>
					<Picker
						style={{backgroundColor: 'white',flex:1,fontSize:14, fontFamily: FontName.Regular}}
						itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
						selectedValue={data.vacationLocationID}
						onValueChange={(itemValue, index) =>{
							console.log(itemValue,index)
							let selectedObj = lookupData.vacationLocation[index];
							console.log(selectedObj)
							setData({...data,vacationLocationID:selectedObj.keyId,vacationLocation:selectedObj.keyName});

						}}>
						{lookupData.vacationLocation && lookupData.vacationLocation.map((item, index) => {
							return (<Picker.Item label={item.keyName} value={item.keyId} key={index}/>) 
						})}
					</Picker>
				</View>
			</ActionSheetView>         
		</SafeAreaView>
	);
}

export default AddTimeoffRequestScreen;

const styles = StyleSheet.create({
    container: {
		flex: 1,
		backgroundColor:'#E5E9EB',
	},
	inputView:{
        flexDirection:'row',
        paddingLeft:16,
        paddingRight:16,
        height:40,
        alignItems:"center", 
        backgroundColor:ThemeColor.BorderColor
    
    },
    inputText:{
		flex: 1,
		height:40,
		color:'black',
		fontSize:16,
		fontFamily: FontName.Regular,
		marginLeft:8,
		alignContent:'stretch',
	},labelText:{
		flex: 1,
		color:'black',
		fontSize:16,
		fontFamily: FontName.Regular,
		marginLeft:8,
		alignContent:'stretch',
	},btnFill:{
		flex: 1,
		height:45,
		justifyContent:"center",
		backgroundColor: ThemeColor.BtnColor ,
		alignItems:'center',
		borderRadius:5
	}
  });