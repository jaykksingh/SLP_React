import React,{useEffect,useRef,createRef} from "react";
import { 
	Text, 
    TouchableOpacity,
    StyleSheet, 
    View,
	TextInput,
	Dimensions,
	Alert,
	SafeAreaView,
	Platform,
} from "react-native";
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
import DocumentPicker from 'react-native-document-picker';
import * as ImagePicker from 'react-native-image-picker';
import {getAuthHeader} from '../../_helpers/auth-header';
import { BaseUrl, EndPoints, StaticMessage, ThemeColor, FontName } from '../../_helpers/constants';
import Loader from '../../Components/Loader';
import { parseErrorMessage } from '../../_helpers/Utils'

const projectRef = createRef();
const startDateRef = createRef();
const endDateRef = createRef();
const billableRef = createRef();


const AddExpenceScreen = ({route,navigation}) => {
	const [isLoading, setIsLoading] = React.useState(false);
	const [projectArray, setProjectArray] = React.useState([]);
	const [startDate, setStartDate] = React.useState(new Date());
	const [endDate, setEndDate] = React.useState(new Date());
	const actionsheetFile = useRef();
	const [data,setData] = React.useState({
		projectName:'',
		projectId:'',
		fromDate:'',
		toDate:'',
		billableToClient:1,
		expenseAmount:'',
		description:'',
		resumeData:'',
		fileName:''
	});
	React.useLayoutEffect(() => {
		navigation.setOptions({
			  title: `New request `,
		});
	}, [navigation]);
	
	useEffect(() => {
		getProjectDetails();

		
	  },[])

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
			"projectDetailId":data.projectId,
			'expenseFromDate':data.fromDate,
			'expenseToDate':data.toDate,
			'expenseAmount':data.expenseAmount,
			'description':data.description,
			'billableToClient': data.billableToClient == 1 ? '1' : '0',
			'file':data.resumeData,
			'fileName':data.fileName,
			'docName': data.fileName
		}
		console.log('Params:',JSON.stringify(params));
		axios ({  
		  "method": "POST",
		  "url": BaseUrl + EndPoints.ExpensesList,
		  "headers": getAuthHeader(authToken),
		  data:params
		})
		.then((response) => {
			setIsLoading(false);
			if (response.data.code == 200){
				navigation.goBack();
			}else if (response.data.code == 417){
				const message = parseErrorMessage(response.data.content.messageList);
				Alert.alert(StaticMessage.AppName, message, [
					{text: 'Ok'}
				]);
			}
		})
		.catch((error) => {
		  setIsLoading(false);
		  console.log(error);
		  Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg , [
			{text: 'Ok'}
		  ]);
	
		})
	}
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
	const showActionSheet = () => {
		actionsheetFile.current.show();
	}
	const selectResume = async () => {
        try {
            const res = await DocumentPicker.pick({
                type: [DocumentPicker.types.pdf,DocumentPicker.types.doc,DocumentPicker.types.docx,DocumentPicker.types.plainText],
            });
			var result = res[0].uri.split("%20").join("\ ");
            var base64data = await RNFS.readFile( result, 'base64').then(res => { return res });

			setData({...data,resumeData:base64data,fileName:res[0].name});
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
	const sampleData = [
		{
			Value: 1,
			Text: 'Yes',
		},
		{
			Value: 2,
			Text: 'No',
		}
	];
	  
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
					<View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center'}} >
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

					</View>
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
				<View style={{marginTop:12}}>
					<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Billable</Text>
					<TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}} onPress={() => {billableRef.current?.setModalVisible()}}>
						<Text style={styles.labelText}>{data.billableToClient === 1 ? 'Yes' : 'No'}</Text>
						<Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22,22} />
					</TouchableOpacity>
				</View> :
				<View style={{marginTop:12}}>
					<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Billable</Text>
					<View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center'}} >
						<Picker
							style={{flex:1,fontSize:14, fontFamily: FontName.Regular}}
							itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
							selectedValue={data.billableToClient}
							onValueChange={(itemValue, index) =>{
								setData({...data, billableToClient: index == 0 ? 1 : 2});
							}}>
							{sampleData && sampleData.map((item, index) => {
								return (<Picker.Item label={item.Text} value={item.Value} key={index}/>) 
							})}
						</Picker>
					</View>
				</View> 
				}
				<View style={{marginTop:12}}>
					<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Amount</Text>
					<View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}>
						<TextInput  
							style={styles.inputText}
							placeholder="Amount" 
							placeholderTextColor={ThemeColor.PlaceHolderColor}
							keyboardType='decimal-pad'
							value= {data.expenseAmount}
							onChangeText={(val) => setData({...data,expenseAmount:val})}
						/>
					</View>
				</View>
				<View style={{marginTop:12}}>
					<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Description</Text>
					<View style={{backgroundColor:'white', height:100, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}>
						<TextInput  
						style={[styles.inputText,{height:90, textAlignVertical:'top'}]}
						multiline={true}
						placeholder="Description" 
						placeholderTextColor={ThemeColor.PlaceHolderColor}
						keyboardType='default'
						value= {data.description}
						onChangeText={(val) => setData({...data,description:val})}
						/>
					</View>
				</View>
				<View style={{marginTop:32,alignItems:'center', paddingBottom:16}}>
					<TouchableOpacity onPress = {() => {showActionSheet()}}>
						<FontAwesome name="cloud-upload" color={ThemeColor.BtnColor} size={80} />
					</TouchableOpacity>
					<ActionSheet
                        ref={actionsheetFile}
                        options={['Upload document', 'Photo library','Take photo', 'Cancel']}
                        cancelButtonIndex={3}
                        onPress={(index) => { handleDocActionsheet(index) }}
                    /> 
					<Text style={{fontFamily:FontName.Regular, fontSize:16,color:ThemeColor.SubTextColor, textAlign:'center'}}>{data.fileName.length > 0 ? data.fileName : 'Upload file'}</Text>
					<Text style={{fontFamily:FontName.Regular, fontSize:14,color:ThemeColor.SubTextColor, textAlign:'center', marginTop:2}}>Maximum file size: 2MB</Text>
				</View>
				<Loader isLoading={isLoading} />
			</KeyboardAwareScrollView>
			<View style={{flexDirection:'row',borderRadius:5, marginTop:8, marginLeft:16, marginRight:16,}}>
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
					<Text style={{color:ThemeColor.TextColor, fontSize:16, fontFamily: FontName.Bold, fontWeight:'bold'}}>Select project</Text>
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
						{data.fromDate.length == 0 && handleStartDateChange(startDate)}
						startDateRef.current?.setModalVisible()
						}}>
						<Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Done</Text>
					</TouchableOpacity>
					</View>
					<DatePicker
						style={{backgroundColor: 'white',flex:1,width:Dimensions.get('window').width}}
						mode={'date'}
						maximumDate={new Date()}
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
						{data.toDate.length == 0 && handleEndDateChange(endDate)}
						endDateRef.current?.setModalVisible()
						}}>
						<Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Done</Text>
					</TouchableOpacity>
					</View>
					<DatePicker
						style={{backgroundColor: 'white',flex:1,width:Dimensions.get('window').width}}
						mode={'date'}
						minimumDate={startDate}
						maximumDate={new Date()}
						date={endDate}
						onDateChange={(val) => {handleEndDateChange(val)}}
					/>
				</View>
			</ActionSheetView> 
			<ActionSheetView ref={billableRef} containerStyle={{backgroundColor:ThemeColor.ViewBgColor}}>
				<View style={{height:300}}>
					<View style={{height:60, flexDirection:'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft:16,paddingRight:16}}>
					<TouchableOpacity onPress={() => {billableRef.current?.setModalVisible()}}>
						<Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Cancel</Text>
					</TouchableOpacity>
					<Text style={{color:ThemeColor.TextColor, fontSize:16, fontFamily: FontName.Bold}}>Billable to client</Text>
					<TouchableOpacity onPress={() => {billableRef.current?.setModalVisible()}}>
						<Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Done</Text>
					</TouchableOpacity>
					</View>
					<Picker
						style={{backgroundColor: 'white',flex:1,fontSize:14, fontFamily: FontName.Regular}}
						itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
						selectedValue={data.billableToClient}
						onValueChange={(itemValue, index) =>{
							setData({...data, billableToClient: index == 0 ? 1 : 2});
						}}>
						{sampleData && sampleData.map((item, index) => {
							return (<Picker.Item label={item.Text} value={item.Value} key={index}/>) 
						})}
					</Picker>
				</View>
			</ActionSheetView>          
		</SafeAreaView>
	);
}

export default AddExpenceScreen;

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
		marginBottom:8,
		borderRadius:5,
	}
  });