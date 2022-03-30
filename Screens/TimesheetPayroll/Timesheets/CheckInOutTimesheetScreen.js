import React,{useEffect,createRef} from "react";
import { 
	Text, 
    TouchableOpacity,
    StyleSheet, 
    View,
	TextInput,
	ActionSheetIOS,
	SafeAreaView,
	Alert,
	FlatList,
	Platform} from "react-native";
import Icon from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import moment from 'moment';
import {Picker} from '@react-native-picker/picker';
import ActionSheet from "react-native-actions-sheet";
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'
import axios from 'axios'
import * as ImagePicker from 'react-native-image-picker';
import RNFS from 'react-native-fs';
import DocumentPicker from 'react-native-document-picker';
import { AuthContext } from '../../../Components/context';
import Loader from '../../../Components/Loader';
import {getAuthHeader} from '../../../_helpers/auth-header';
import { BaseUrl, EndPoints, StaticMessage, ThemeColor, FontName } from '../../../_helpers/constants';


const timesheetPeriodRef = createRef();
const shiftTypeRef = createRef();
const projectRef = createRef();


const CheckInOutTimesheetScreen = ({route,navigation}) => {
	const [isLoading, setIsLoading] = React.useState(false);
	const { signOut } = React.useContext(AuthContext);

	const [data,setData] = React.useState({
		selectedIndex:-1,
		clientName:'',
		projectName:'',
		projectId:'',
		timesheetPeriod:'',
		hours:'',
		showMannualHours:false,
		timeSheetCycle:'',
		startDate:'',
		endDate:'',
		resumeTitle:'',
		resumeData:'',
		fileName:'',
		isHoursVerified:false,
	});
	const [pickedImage, setPickedImage] = React.useState('');
	const [projectHoursDict,setProjectHoursDict] = React.useState({});
	const [mannualHoursArray, setMannualHoursArray] = React.useState([]);
	const [hoursArray, setHoursArray] = React.useState([]);
	const [selectedHours, setSelectedHours] = React.useState({
		shiftOption:[]
	});
	const [timesheetPeriodArray,setTimesheetPeriodArray] = React.useState([]);
	const [selectedIndex, setSelectedIndex] = React.useState(0);
	const [hoursUpdated, setHoursUpdated] = React.useState(false);
	const { timesheetDetails } = route.params;
	const { projectDetail } = route.params;
	const { timesheetsArray } = route.params;
	const [showProjectSelect, setShowProjectSelect] = React.useState(false);
	const [showClockInOut, setShowClockInOut] =  React.useState(false);


	React.useLayoutEffect(() => {
		navigation.setOptions({
			  title: projectDetail ? projectDetail.projectName  :`Edit timesheet `,
		});
	}, [navigation]);
	const showShareOptions = () =>{

	}
	useEffect(() => {
		if(timesheetsArray){
			setShowProjectSelect(true);
		}else{
			let momentStartDate = moment(timesheetDetails.startDate, 'YYYY-MM-DD');
			let momentEndDate = moment(timesheetDetails.endDate, 'YYYY-MM-DD');
			let startDateString = moment(momentStartDate).format('MMM DD, YYYY')
			let endDateString = moment(momentEndDate).format('MMM DD, YYYY')	
			const timesheetPeriod = `${startDateString} - ${endDateString}`;

			setData({...data, timeSheetCycle:projectDetail.timeSheetCycle,clientName:projectDetail.clientName,timesheetPeriod:timesheetPeriod,startDate:timesheetDetails.startDate,endDate:timesheetDetails.endDate});
			getHoursDetails(timesheetDetails.startDate,timesheetDetails.endDate);
		}
		var tempPeriodArray = [];
		if(projectDetail.data){
			for (let i = 0; i < projectDetail.data.length; i++) {
				let hour = projectDetail.data[i];
				let momentStartDate = moment(hour.startDate, 'YYYY-MM-DD');
				let momentEndDate = moment(hour.endDate, 'YYYY-MM-DD');
				let startDateString = moment(momentStartDate).format('MMM DD, YYYY')
				let endDateString = moment(momentEndDate).format('MMM DD, YYYY')	
				const timesheetPeriod = `${startDateString} - ${endDateString}`;
				tempPeriodArray.push(timesheetPeriod);
			}
			setTimesheetPeriodArray(tempPeriodArray);
		}
		
		
	},[]);

	


	const showManualEntryAlert = () =>{
		Alert.alert(StaticMessage.AppName,StaticMessage.MannualEntryAlert,
			[{
			  text: 'Ok',
		  }]
	)}
	const SessionExpiredAlert = () =>{
		Alert.alert(StaticMessage.AppName,StaticMessage.SessionExpired,
			[{
			  text: 'Ok',
			  onPress: () => signOut()
		  }]
	)}

	const handleTimesheetPeriodSelect = (index) => {
		let selectedItem = timesheetPeriodArray[index];
		let hour = projectDetail.data[index];
		setData({...data,timesheetPeriod:selectedItem,startDate:hour.startDate,endDate:hour.endDate});
		getHoursDetails(hour.startDate,hour.endDate);				
	}

	const refreshHoursDetails = () => {
		getHoursDetails(timesheetDetails.startDate,timesheetDetails.endDate);
	}
	const getHoursDetails = async(startDate, endDate) => {
		console.log("Start Date and End Date : ", startDate,endDate);

		let user = await AsyncStorage.getItem('loginDetails');  
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken);
	
		setIsLoading(true);
		axios ({  
		  "method": "POST",
		  "url": BaseUrl + EndPoints.GetTimesheetHours,
		  "headers": getAuthHeader(authToken),
		  data:{"projectId":projectDetail.projectDetailId,'startDate':startDate,'endDate':endDate}
		})
		.then((response) => {
			setIsLoading(false);
			if (response.data.code == 200){
				setProjectHoursDict(response.data.content.dataList[0]);
				setMannualHoursArray(response.data.content.dataList[0].project.hoursDetail);
				setHoursUpdated(!hoursUpdated);
				console.log('Mannual Hours: ', JSON.stringify(response.data.content.dataList[0].project.hoursDetail));

			}else if (response.data.code == 417){
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
			console.log(error);
			if(error.response.status == 401){
				SessionExpiredAlert();
			}else{
				Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
					{text: 'Ok'}
				  ]);
			}
		})
	}
	const handlePrintTimesheet = async() => {
		let momentStartDate = moment(timesheetDetails.startDate, 'YYYY-MM-DD');
		let momentEndDate = moment(timesheetDetails.endDate, 'YYYY-MM-DD');
		let startDateString = moment(momentStartDate).format('MMM DD, YYYY')
		let endDateString = moment(momentEndDate).format('MMM DD, YYYY')	
		const timesheetPeriod = `${startDateString} - ${endDateString}`;

		let user = await AsyncStorage.getItem('loginDetails');  
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken);
	
		setIsLoading(true);
		
		axios ({  
		  "method": "POST",
		  "url": BaseUrl + EndPoints.TimehssetPDF,
		  "headers": getAuthHeader(authToken),
		  data:{"projectId":projectDetail.projectDetailId,'startDate':timesheetDetails.startDate,'endDate':timesheetDetails.endDate}
		})
		.then((response) => {
			setIsLoading(false);
			if (response.data.code == 200){
				const results = JSON.stringify(response.data.content.dataList)
				// if(Platform.OS === 'ios'){
				// 	//IOS
				// 	OpenFile.openDoc([{
				// 		url:response.data.content.dataList[0].filePath,
				// 		fileNameOptional:timesheetPeriod
				// 	}], (error, url) => {
				// 		if (error) {
				// 		console.error(error);
				// 		} else {
				// 		console.log('Filte URL:',url)
				// 		}
				// 	})
				// }else{
				// 	//Android
				// 	OpenFile.openDoc([{
				// 		url:response.data.content.dataList[0].filePath, // Local "file://" + filepath
				// 		fileName:timesheetPeriod,
				// 		cache:false,
				// 		fileType:"jpg"
				// 	}], (error, url) => {
				// 		if (error) {
				// 		console.error(error);
				// 		} else {
				// 		console.log(url)
				// 		}
				// 	})
				// }
			}else if (response.data.code == 417){
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
	}
	const handleClientTSSubmit = () => {
		const message = "Please ensure that your total hours match the number of hours approved by the client.";
		const totalHour = getTotalHours();
		if(data.hours != totalHour){
			Alert.alert(StaticMessage.AppName, message, [
				{text: 'Ok'}
			]);
		}else{
			submitMannualHours();
		}
	}
	const submitMannualHours = async() => {

		let user = await AsyncStorage.getItem('loginDetails');  
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken);

		var dateDict = projectHoursDict.date;
		let startSate = timesheetDetails.startDate;
		let endDate = timesheetDetails.endDate;
		let projectName = projectHoursDict.project.projectName;

		var tempManualHours = [];
		for (let i = 0; i < mannualHoursArray.length ; i++) {
			let hoursObj = mannualHoursArray[i];
			let statusID = hoursObj.statusId;
			if(statusID < 3302){
				hoursObj.statusId = 3302;
			}
			hoursObj.regHrs = parseFloat(hoursObj.regHrs, 10);
			hoursObj.otHrs = parseFloat(hoursObj.otHrs, 10);
			hoursObj.dtHrs = parseFloat(hoursObj.dtHrs, 10);

			tempManualHours.push(hoursObj);
		}

		var project = projectHoursDict.project;
		project['totalRegHrs'] = parseFloat(getTotalRegHours(), 10);
		project['totalOtHrs'] = parseFloat(getTotalOtHours(), 10);
		project['totalDtHrs'] = parseFloat(getTotalDtHours(), 10);
		project['hoursDetail'] = tempManualHours;
		project['substatus'] = 0

		var dateDict1 = {
			"fromDate":dateDict.startDate,
			"toDate":dateDict.endDate
		};

		const params = {
			"date":dateDict1,
			"project":project
		}
		console.log('Params SUBMIT:',JSON.stringify(params));

		setIsLoading(true);
		axios ({  
		  "method": "POST",
		  "url": BaseUrl + EndPoints.SaveTimesheetHours,
		  "headers": getAuthHeader(authToken),
		  data:params,
		}).then((response) => {
			if (response.data.code == 200){
				if(data.resumeData.length == 0){
					setIsLoading(false);
					let message = `Your hours for ${data.timesheetPeriod} period have been recorded.  When available, upload your client approved timesheet to complete the submission process.`
					Alert.alert(StaticMessage.AppName, message, [
						{text: 'Ok',
						onPress:()=> navigation.goBack()
						}
					]);
				}else{
					submitTimesheetDocument();
				}
				
			}else if (response.data.code == 417){
				setIsLoading(false);
				const errorList = Object.values(response.data.content.messageList);
				Alert.alert(StaticMessage.AppName, errorList.join(), [
					{text: 'Ok'}
				]);
			}else if (response.data.code == 401){
				setIsLoading(false);
				console.log('Session Expired Already');
				SessionExpiredAlert();
			}
		})
		.catch((error) => {
			console.log(error);
			setIsLoading(false);
			if(error.response && error.response.status == 401){
				SessionExpiredAlert();
			  }else{
				  Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
					  {text: 'Ok'}
					]);
			  }
		})
	}
	const submitTimesheetDocument = async() => {
		console.warn('Submit Timesheet Document');
		let user = await AsyncStorage.getItem('loginDetails');  
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken);

		var dateDict = projectHoursDict.date;
		let projectName = projectHoursDict.project.projectName;
		let projectId = projectHoursDict.project.projectId;

		var project = {
			'projectId':''+ projectId,
			'projectName':projectName,
			'totalHours':getTotalHours(),
			'substatus':908,
			'fileData':data.resumeData,
			'fileName':data.fileName
		};
		if(data.resumeData.length > 0){
			project['fileName'] = data.fileName;
			project['fileData'] = data.resumeData;
		}
		
		const params = {
			"fromDate":dateDict.startDate,
			'toDate':dateDict.endDate,
			'totalHours':getTotalHours(),
			"projects":[project],
		}
		console.log('Client Approved Params:',JSON.stringify(params));

		setIsLoading(true);
		axios ({  
		  "method": "POST",
		  "url": BaseUrl + EndPoints.UploadClientTimesheet,
		  "headers": getAuthHeader(authToken),
		  data:params,
		})
		.then((response) => {
		setIsLoading(false);
			if (response.data.code == 200){
				let message = `Your hours for ${data.timesheetPeriod} have been submitted to our team for verification. Please contact timesheet support for any questions.`
				Alert.alert(StaticMessage.AppName, message, [
					{text: 'Ok',
					onPress:()=> navigation.goBack()
				}
				]);
			}else if (response.data.code == 417){
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
			console.log(error);
			setIsLoading(false);
			if(error.response && error.response.status == 401){
				SessionExpiredAlert();
			  }else{
				  Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
					  {text: 'Ok'}
					]);
			  }
		})
	}
	const handleSubmitForApproval = (updateType) => {
		Alert.alert(StaticMessage.AppName, 'You will not be able to change hours after submission until your manager rejects your timesheet.', [
			{text: 'Yes',
			onPress:()=>saveMannualHours(updateType)
			},
			{text: 'No'}

		]);
		
	}
	const saveMannualHours = async(updateType) => {

		let user = await AsyncStorage.getItem('loginDetails');  
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken);

		var dateDict = projectHoursDict.date;
		let startSate = timesheetDetails.startDate;
		let endDate = timesheetDetails.endDate;
		let projectName = projectHoursDict.project.projectName;

		var tempManualHours = [];
		for (let i = 0; i < mannualHoursArray.length ; i++) {
			let hoursObj = mannualHoursArray[i];
			let statusID = hoursObj.statusId;
			if(statusID < 3302){
				hoursObj.statusId = updateType;
			}
			hoursObj.regHrs = parseFloat(hoursObj.regHrs, 10);
			hoursObj.otHrs = parseFloat(hoursObj.otHrs, 10);
			hoursObj.dtHrs = parseFloat(hoursObj.dtHrs, 10);

			tempManualHours.push(hoursObj);
		}

		var project = projectHoursDict.project;
		project['totalRegHrs'] = parseFloat(getTotalRegHours(), 10);
		project['totalOtHrs'] = parseFloat(getTotalOtHours(), 10);
		project['totalDtHrs'] = parseFloat(getTotalDtHours(), 10);
		project['hoursDetail'] = tempManualHours;
		project['substatus'] = updateType

		var dateDict1 = {
			"fromDate":dateDict.startDate,
			"toDate":dateDict.endDate
		};

		const params = {
			"date":dateDict1,
			"project":project
		}
		console.log('Params:',JSON.stringify(params));

		setIsLoading(true);
		axios ({  
		  "method": "POST",
		  "url": BaseUrl + EndPoints.SaveTimesheetHours,
		  "headers": getAuthHeader(authToken),
		  data:params,
		}).then((response) => {
			if (response.data.code == 200){
				if(updateType == 907){
					setIsLoading(false);
					let message = `Your hours for ${data.timesheetPeriod} period have been recorded.`
					Alert.alert(StaticMessage.AppName, message, [
						{text: 'Ok',
						onPress:()=> navigation.goBack()
						}
					]);
				}else{
					submitClientApproved();
				}
				
			}else if (response.data.code == 417){
				setIsLoading(false);
				const errorList = Object.values(response.data.content.messageList);
				Alert.alert(StaticMessage.AppName, errorList.join(), [
					{text: 'Ok'}
				]);
			}else if (response.data.code == 401){
				setIsLoading(false);
				console.log('Session Expired Already');
				SessionExpiredAlert();
			}
		})
		.catch((error) => {
			console.log(error);
			setIsLoading(false);
			if(error.response && error.response.status == 401){
				SessionExpiredAlert();
			  }else{
				  Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
					  {text: 'Ok'}
					]);
			  }
		})
	}

	const submitClientApproved = async() => {
		console.warn('Client Approved Called');
		let user = await AsyncStorage.getItem('loginDetails');  
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken);

		var dateDict = projectHoursDict.date;
		let projectName = projectHoursDict.project.projectName;
		let projectId = projectHoursDict.project.projectId;

		var project = {
			'projectId':''+ projectId,
			'projectName':projectName,
			'totalHours':getTotalHours(),
			'substatus':908,
			'fileData':'',
			'fileName':''
		};
		if(data.resumeData.length > 0){
			project['fileName'] = data.fileName;
			project['fileData'] = data.resumeData;
		}
		
		const params = {
			"fromDate":dateDict.startDate,
			'toDate':dateDict.endDate,
			'totalHours':getTotalHours(),
			"projects":[project],
		}
		console.log('Client Approved Params:',JSON.stringify(params));

		setIsLoading(true);
		axios ({  
		  "method": "POST",
		  "url": BaseUrl + EndPoints.ApproveClientTimesheet,
		  "headers": getAuthHeader(authToken),
		  data:params,
		})
		.then((response) => {
		setIsLoading(false);
			if (response.data.code == 200){
				let message = `Your hours for ${data.timesheetPeriod} have been submitted to our team for verification. Please contact timesheet support for any questions.`
				Alert.alert(StaticMessage.AppName, message, [
					{text: 'Ok',
					onPress:() => navigation.goBack()}
				]);
			}else if (response.data.code == 417){
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
			console.log(error);
			setIsLoading(false);
			if(error.response && error.response.status == 401){
				SessionExpiredAlert();
			  }else{
				  Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
					  {text: 'Ok'}
					]);
			  }
		})
	}
	const showProfileImagePicker = () => ActionSheetIOS.showActionSheetWithOptions(
		{
			options: ["Cancel", "Upload document","Photo library", "Take photo"],
			cancelButtonIndex: 0,
			userInterfaceStyle: 'light',  
		  },
		  buttonIndex => {
			if (buttonIndex === 0) {
			} else if (buttonIndex === 1) {
			  	selectResume();
			} else if (buttonIndex === 2) {
				imageGalleryLaunch();
			}else if (buttonIndex === 3) {
				cameraLaunch();
			}
		  }
	);
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
		  console.log('Response = ', res);
	  
		  if (res.didCancel) {
			console.log('User cancelled image picker');
		  } else if (res.error) {
			console.log('ImagePicker Error: ', res.error);
		  } else if (res.customButton) {
			console.log('User tapped custom button: ', res.customButton);
			alert(res.customButton);
		  } else {
			console.log('response', JSON.stringify(res));
			setPickedImage(res.assets[0].uri);
			var base64data = await RNFS.readFile( res.assets[0].uri, 'base64').then(res => { return res });
			setData({...data,resumeData:base64data,fileName:res.assets[0].fileName,showMannualHours:true, hours:getTotalHours()});
			
		  }
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
			const source = { uri: res.uri };
			console.log('response', JSON.stringify(res));
			setPickedImage(res.assets[0].uri);
			var base64data = await RNFS.readFile( res.assets[0].uri, 'base64').then(res => { return res });
			setData({...data,resumeData:base64data,fileName:res.assets[0].fileName,showMannualHours:true, hours:getTotalHours()});

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
			setData({...data,resumeData:base64data,fileName:res.name,showMannualHours:true,hours:getTotalHours()});
        } catch (err) {
            if (DocumentPicker.isCancel(err)) {
            } else {
                throw err;
            }
        }
    }
	
	
	

	const getItemTotals = (itemObj) => {
		console.log('Item :', itemObj);
		return (10);

		let total  = regHrs + othrs + dtHrs
		console.log('Tptal:', total);
		return ('44');
	}
	const getFormatedDate=(item) =>{
		let momentStartDate = moment(item.day, 'YYYY-MM-DD');
		let startDateString = moment(momentStartDate).format('ddd, MMM DD')
		return `${startDateString}`;
	}
	const getTotalRegHours = () => {
		var totalHours = 0;
		for (let i = 0; i < mannualHoursArray.length ; i++){
			totalHours = totalHours + (parseFloat(mannualHoursArray[i].regHrs));
		}
		return '' + totalHours.toFixed(2);
	}
	const getTotalOtHours = () => {
		var totalHours = 0;
		for (let i = 0; i < mannualHoursArray.length ; i++){
			totalHours = totalHours + (parseFloat(mannualHoursArray[i].otHrs));
		}
		return '' + totalHours.toFixed(2);
	}
	const getTotalDtHours = () => {
		var totalHours = 0;
		for (let i = 0; i < mannualHoursArray.length ; i++){
			totalHours = totalHours + (parseFloat(mannualHoursArray[i].dtHrs));
		}
		return '' + totalHours.toFixed(2);
	}
	const getTotalBreakHours = () => {
		var totalHours = 0;
		for (let i = 0; i < mannualHoursArray.length ; i++){
			totalHours = totalHours + (parseFloat(mannualHoursArray[i].breakHrs));
		}
		return '' + totalHours.toFixed(2);
	}
	const getTotalHours = () => {
		var totalHours = 0;
		for (let i = 0; i < mannualHoursArray.length ; i++){
			totalHours = totalHours + (parseFloat(mannualHoursArray[i].regHrs)) + (parseFloat(mannualHoursArray[i].otHrs)) + (parseFloat(mannualHoursArray[i].dtHrs) );
		}

		return '' + totalHours.toFixed(2);
	}
	const showShiftTypePicker = (item, index) => {
		console.log(item);
		setSelectedHours(item);
		setSelectedIndex(index);
		shiftTypeRef.current?.setModalVisible()
	}

	const getShiftTypeName = (item) => {
		let shiftOptions = item.shiftOption;
		var shiftName = '';
		for(let i = 0; i < shiftOptions.length; i++) {
			if(shiftOptions[i].Shift_Id == item.shiftId){
				shiftName = shiftOptions[i].ShiftName;
				return shiftName;
			}
		}
	}
	const removeSelectedFile = () => {
		setData({...data,resumeData:"",fileName:""});

	}

	const handleFrequencyChange = (frequency) => {
		let message =  `Please change my timesheet frequency to "${frequency}"`;
		navigation.navigate('CreateMessage',{timesheets:timesheetDetails,preMessage:message, groupID:6,groupName:'Timesheet support',showTabBar:false})

	}
	const handleIconClicked = (item) => {
		let message = "Pending"
		if(item.holiday == 1){
			message = "Holiday";
		}else if(item.vacation){
			message = "Time-off";
		}else if(item.statusId > 3302){
			message = "Future date"
		}
		Alert.alert(StaticMessage.AppName, message, [
			{text: 'Ok'}
		  ]);
	}
	const handleEditClicked = (item) => {
		navigation.navigate('CheckInOutEdit',{dayDetails:item,timesheetDetails:timesheetDetails,projectDetail:projectDetail,onClickEvent:refreshHoursDetails})

	}
	const tips='Tip: Enter 0.50 increments to indicate a half hour. For example, for eight and a half hours, please enter 8.50 rather than 8.30'
	
	return(
		<SafeAreaView style={styles.container}>
			<KeyboardAwareScrollView style={{ paddingTop:16,paddingBottom:16,}}>
				<View style={{flexDirection:'row-reverse',alignContent: 'center', alignItems: 'center',paddingLeft:16, paddingRight:16,}}>
					<TouchableOpacity style={{width:20, height:20, alignItems: 'center',justifyContent: 'center'}} onPress ={() => {navigation.navigate('TimesheetFrequency',{projectDetail:projectDetail,timesheetDetails:timesheetDetails, onClickEvent:handleFrequencyChange})}}>
						<Feather name="settings" color={ThemeColor.TextColor} size={15,15} />
					</TouchableOpacity>
					<Text style={{color:ThemeColor.TextColor, fontSize:14,fontFamily:FontName.Regular}}>{data.timeSheetCycle} </Text>
					<Text style={{color:ThemeColor.SubTextColor, fontSize:14,fontFamily:FontName.Regular}}>Your timesheet frequency: </Text>
				</View>
				{Platform.OS === 'ios' ? 
					<View style={{marginTop:12,paddingLeft:16, paddingRight:16,}}>
						<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Select timesheet period</Text>
						<TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}  onPress={() => {timesheetPeriodRef.current?.setModalVisible()}}>
							<Text style={[styles.labelText,{color:data.timesheetPeriod.length > 0 ? 'black' : ThemeColor.PlaceHolderColor}]}>{data.timesheetPeriod.length >0 ? data.timesheetPeriod : 'Select timesheet period'}</Text>
							<Feather name="chevron-down" color={ThemeColor.SubTextColor} size={22} />
						</TouchableOpacity>
					</View> : 
					<View style={{marginTop:12,paddingLeft:16, paddingRight:16,}}>
						<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Select timesheet period</Text>
						<TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center'}}>
							<Picker
								style={{flex:1,}}
								itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
								selectedValue={data.timesheetPeriod}
								onValueChange={(itemValue, index) =>{
									let selectedItem = timesheetPeriodArray[index];
									setData({...data,timesheetPeriod:selectedItem});
								}}>
								{timesheetPeriodArray && timesheetPeriodArray.map((item, index) => {
									return (<Picker.Item label={item} value={item} key={index}/>) 
								})}
							</Picker>
						</TouchableOpacity>
						
					</View>
				
				}
				
				{projectDetail.timesheetClientApproval != 1 ?
				<View style={{marginTop:12, height:200, backgroundColor:'white',borderRadius:5,justifyContent:'space-between',marginLeft:16, marginRight:16,}}>
					<TouchableOpacity style={{alignSelf:'center', backgroundColor:ThemeColor.BtnColor, flexDirection:'row', paddingLeft:16,paddingRight:16, height:40, alignItems: 'center', borderRadius:5, marginTop:16	}} onPress={showProfileImagePicker}>
						<FontAwesome name="cloud-upload" color={'white'} size={25	} />
						<Text style ={{color:'white', fontSize:16 ,fontFamily:FontName.Regular, marginLeft:8}}>UPLOAD TIMESHEET</Text>
					</TouchableOpacity>
					{data.fileName.length > 0 ? 
						<View style={{alignContent:'center', justifyContent: 'center', flexDirection: 'row'}}>
							<TouchableOpacity>
								<Text style ={{color:ThemeColor.NavColor, fontSize:12 ,fontFamily:FontName.Regular, marginLeft:8, marginRight:8, textAlign: 'center'}}>{data.fileName}</Text>
							</TouchableOpacity>
							<TouchableOpacity style={{width:20, height:20, alignItems: 'center',justifyContent: 'center'}} onPress={() => removeSelectedFile()}>
								<Icon name="close-circle-outline" color={ThemeColor.TextColor} size={20,20} />
							</TouchableOpacity>
						</View> : null
					}
					<View style={{height:40, alignItems: 'center'}}>
						<TextInput  
							style={{height:40,
								paddingLeft:24, paddingRight:24,
								color:'black',
								fontSize:16,
								fontFamily: FontName.Regular,
								marginLeft:8,
								alignContent:'stretch',}}
							placeholder="Client approved hours" 
							placeholderTextColor={ThemeColor.PlaceHolderColor}
							keyboardType='default'
							value= {data.hours}
							onChangeText={(val) => setData({...data,hours:val})}
						/>
						<View style={{backgroundColor:ThemeColor.BorderColor, height:1,width:200}}/>
					</View> 
					<View style={{justifyContent:'space-between', flexDirection:'row', height:40,alignItems: 'center', paddingRight:16, paddingLeft:16, marginBottom:8	}}>
						
						<View style={{flexDirection:'row',}}>
						{data.resumeData.length == 0 ?
							<>
								<TouchableOpacity style={{flexDirection: 'row' , alignItems:'center',}} onPress={() => setData({...data, showMannualHours:!data.showMannualHours})}>
									{data.showMannualHours ? <FontAwesome name="check-square" color={ThemeColor.TextColor} size={20} /> : <FontAwesome name="square-o" color={ThemeColor.TextColor} size={20} />}
									<Text style ={{color:ThemeColor.TextColor, fontSize:14 ,fontFamily:FontName.Regular, marginLeft:4}}>Manually enter hours</Text>
								</TouchableOpacity>
								<TouchableOpacity style={{width:20, height:20, alignItems: 'center',justifyContent: 'center', marginLeft:8}} onPress={() => {showManualEntryAlert()}}>
									<Feather name="help-circle" color={ThemeColor.TextColor} size={15,15} />
								</TouchableOpacity>
							</> : null}
							
						</View>
						<TouchableOpacity style={{alignItems: 'center',justifyContent: 'center', height:40,}} onPress={() => {handlePrintTimesheet()}}>
							<Feather name="printer" color={ThemeColor.TextColor} size={25,25} />
						</TouchableOpacity>
					</View>
				</View> : null}
				{(data.showMannualHours || projectDetail.timesheetClientApproval == 1) && 
				<View style ={{backgroundColor:'white', flex: 1, marginBottom:16, marginTop:16}}>
					<View style ={{flexDirection:'row', marginBottom:1, justifyContent: 'center', alignItems: 'center', alignContent:'center'}}>
						<View style={{height:30, width:90, flexDirection:'row',justifyContent: 'center',alignItems: 'center'}}>
							<Text style={{color:ThemeColor.SubTextColor,fontSize:12, textAlign: 'center', flex: 1}}>Date</Text>
							<View style={{backgroundColor:ThemeColor.BorderColor, height:30, width:1}}/>
						</View>
						{mannualHoursArray.length > 0 && mannualHoursArray[0].shiftOption.length > 1 ?
						<View style={{height:30, width:80, flexDirection:'row',justifyContent: 'center',alignItems: 'center'}}>
							<Text style={{color:ThemeColor.SubTextColor,fontSize:12, textAlign: 'center', flex: 1}}>Shift</Text>
							<View style={{backgroundColor:ThemeColor.BorderColor, height:30, width:1}}/>
						</View> :  null 
						}
						<View style={{height:30, flex:1, flexDirection:'row',justifyContent: 'center',alignItems: 'center'}}>
							<Text style={{color:ThemeColor.SubTextColor,fontSize:12, textAlign: 'center', flex: 1}}>Reg. hours</Text>
							<View style={{backgroundColor:ThemeColor.BorderColor, height:30, width:1}}/>
						</View>
						<View style={{height:30, flex:1, flexDirection:'row',justifyContent: 'center',alignItems: 'center'}}>
							<Text style={{color:ThemeColor.SubTextColor,fontSize:12, textAlign: 'center', flex: 1}}>OT hours</Text>
							<View style={{backgroundColor:ThemeColor.BorderColor, height:30, width:1}}/>
						</View>
						<View style={{height:30, flex:1, flexDirection:'row',justifyContent: 'center',alignItems: 'center'}}>
							<Text style={{color:ThemeColor.SubTextColor,fontSize:12, textAlign: 'center', flex: 1}}>DT hours</Text>
							<View style={{backgroundColor:ThemeColor.BorderColor, height:30, width:1}}/>
						</View>
						<View style={{height:30, flex:1, flexDirection:'row',justifyContent: 'center',alignItems: 'center', paddingRight:8}}>
							<Text style={{color:ThemeColor.SubTextColor,fontSize:12, textAlign: 'center', flex:1}}>Lunch hours</Text>
						</View>
					</View>
					<View style={{backgroundColor:ThemeColor.BorderColor, height:1}}/> 
					
					<FlatList
						style={{flex: 1}}
						data={mannualHoursArray}
						scrollEnabled={false}
						keyExtractor={(item, index) => index.toString()}
						randomUpdateProp={hoursUpdated}
						renderItem={({item, index}) => 
						<View>
							<View style ={{flexDirection:'row', marginBottom:1, justifyContent: 'center', alignItems: 'center', alignContent:'center'}}>
								<View style={{height:30, width:90, flexDirection:'row',justifyContent: 'center',alignItems: 'center'}}>
									<Text style={{color:ThemeColor.SubTextColor,fontSize:12, textAlign: 'center', flex: 1}}>{getFormatedDate(item)}</Text>
									<View style={{backgroundColor:ThemeColor.BorderColor, height:30, width:1}}/>
								</View>
								{mannualHoursArray.length > 0 && mannualHoursArray[0].shiftOption.length > 1 ?
								<View style={{height:30, width:80, flexDirection:'row',justifyContent: 'center',alignItems: 'center'}}>
									{item.statusId > 3302 ?
									<View style={{height:30, width:80, flexDirection:'row',justifyContent: 'center',alignItems: 'center'}} onPress ={() => {showShiftTypePicker(item, index)}}>
										<Text style={{color:'white',fontSize:12, textAlign: 'center', flex: 1}}>{item.shiftId > 0 ? getShiftTypeName(item) : "Select shift"}</Text>
										<Feather name="chevron-down" color={'white'} size={10} />
									</View> :
									<TouchableOpacity style={{height:30, width:80, flexDirection:'row',justifyContent: 'center',alignItems: 'center'}} onPress ={() => {showShiftTypePicker(item, index)}}>
										<Text style={{color:ThemeColor.SubTextColor,fontSize:12, textAlign: 'center', flex: 1}}>{item.shiftId > 0 ? getShiftTypeName(item) : "Select shift"}</Text>
										<Feather name="chevron-down" color={ThemeColor.TextColor} size={10} />
									</TouchableOpacity> }
									<View style={{backgroundColor:ThemeColor.BorderColor, height:30, width:1}}/>
								</View> : null
								}
								
								<View style={{height:30, flex:1, flexDirection:'row',justifyContent: 'center',alignItems: 'center'}}>
									<Text style={{color:ThemeColor.SubTextColor,fontSize:12, textAlign: 'center', flex: 1}}>{item.regHrs }</Text>
									<View style={{backgroundColor:ThemeColor.BorderColor, height:30, width:1}}/>
								</View>
								<View style={{height:30, flex:1, flexDirection:'row',justifyContent: 'center',alignItems: 'center'}}>
									<Text style={{color:ThemeColor.SubTextColor,fontSize:12, textAlign: 'center', flex: 1}}>{item.otHrs}</Text>
									<View style={{backgroundColor:ThemeColor.BorderColor, height:30, width:1}}/>
								</View>
								<View style={{height:30, flex:1, flexDirection:'row',justifyContent: 'center',alignItems: 'center'}}>
									<Text style={{color:ThemeColor.SubTextColor,fontSize:12, textAlign: 'center', flex: 1}}>{item.dtHrs}</Text>
									<View style={{backgroundColor:ThemeColor.BorderColor, height:30, width:1}}/>
								</View>

								<View style={{height:30, flex:1, flexDirection:'row',justifyContent: 'center',alignItems: 'center', paddingRight:8}}>
									<Text style={{color:ThemeColor.SubTextColor,fontSize:12, textAlign: 'center', flex: 1}}>{item.breakHrs}</Text>
									{
										item.statusId > 3302 ? 
										<View onPress={ () => {handleEditClicked(item)}}>
											<MaterialIcons name="lock" color={ThemeColor.SubTextColor} size={15} />
										</View> :
										<TouchableOpacity onPress={ () => {handleEditClicked(item)}}>
											<MaterialIcons name="edit" color={ThemeColor.TextColor} size={15} />
										</TouchableOpacity>
									}
									
								</View>
							</View>
							<View style={{backgroundColor:ThemeColor.BorderColor, height:1}}/>
						</View>}
					/>						
				</View>}
			</KeyboardAwareScrollView>
			<Loader isLoading={isLoading} />

			{(data.showMannualHours  || projectDetail.timesheetClientApproval == 1) && 
			<View style={{backgroundColor:'white'}}>
				<View style ={{flexDirection:'row', marginBottom:1, justifyContent: 'center', alignItems: 'center', alignContent:'center'}}>
					<View style={{height:30, width:90, flexDirection:'row',justifyContent: 'center',alignItems: 'center'}}>
						<Text style={{color:ThemeColor.TextColor,fontSize:12, textAlign: 'center', flex: 1}}>Total</Text>
					</View>
					{mannualHoursArray.length > 0 && mannualHoursArray[0].shiftOption.length > 1 ?
					<View style={{height:30, width:80, flexDirection:'row',justifyContent: 'center',alignItems: 'center'}}>
						<Text style={{color:ThemeColor.TextColor,fontSize:12, textAlign: 'center', flex: 1}}></Text>
						<View style={{backgroundColor:ThemeColor.BorderColor, height:30, width:1}}/>
					</View> : null 
					}
					<View style={{height:30, flex:1, flexDirection:'row',justifyContent: 'center',alignItems: 'center'}}>
						<Text style={{color:ThemeColor.TextColor,fontSize:12, textAlign: 'center', flex: 1}}>{getTotalRegHours()}</Text>
						<View style={{backgroundColor:ThemeColor.BorderColor, height:30, width:1}}/>
					</View>
					<View style={{height:30, flex:1, flexDirection:'row',justifyContent: 'center',alignItems: 'center'}}>
						<Text style={{color:ThemeColor.TextColor,fontSize:12, textAlign: 'center', flex: 1}}>{getTotalOtHours()}</Text>
						<View style={{backgroundColor:ThemeColor.BorderColor, height:30, width:1}}/>
					</View>
					<View style={{height:30, flex:1, flexDirection:'row',justifyContent: 'center',alignItems: 'center'}}>
						<Text style={{color:ThemeColor.TextColor,fontSize:12, textAlign: 'center', flex: 1}}>{getTotalDtHours()}</Text>
						<View style={{backgroundColor:ThemeColor.BorderColor, height:30, width:1}}/>
					</View>
					<View style={{height:30, flex:1, flexDirection:'row',justifyContent: 'center',alignItems: 'center', paddingRight:8}}>
						<Text style={{color:ThemeColor.TextColor,fontSize:12, textAlign: 'center', flex: 1}}>{getTotalHours()}</Text>
					</View>
				</View>
				<View style={{backgroundColor:ThemeColor.BorderColor, height:1}}/>			
			</View>
			}
			{data.resumeData.length > 0 ? 
				<>
					<TouchableOpacity style={{flexDirection: 'row' , alignItems:'center',padding:8}} onPress={() => setData({...data, isHoursVerified:!data.isHoursVerified})}>
						{data.isHoursVerified ? <FontAwesome name="check-square" color={ThemeColor.SubTextColor} size={20} /> : <FontAwesome name="square-o" color={ThemeColor.TextColor} size={20} />}
						<Text style ={{color:ThemeColor.TextColor, fontSize:12 ,fontFamily:FontName.Regular, marginLeft:8}}>I verify that the hours on the client approved timesheet match the daily hours, which I entered manually.</Text>
					</TouchableOpacity>
					{data.isHoursVerified ?  
					<TouchableOpacity style={{height:50, backgroundColor:ThemeColor.BtnColor, justifyContent:'center', alignItems:'center'}}  onPress={() => {handleClientTSSubmit()}}>
						<Text style={{color:'#53962E',fontFamily: FontName.Regular, fontSize:14, color:'#fff' }}>SUBMIT</Text>
					</TouchableOpacity> : null }
				</> :
				projectDetail.timesheetClientApproval == 1 ? 
				<View style={{flexDirection:'row'}}>
					<TouchableOpacity style={[styles.btnFill,{backgroundColor:ThemeColor.SubHeaderColor}]} onPress={() => {saveMannualHours('907')}}>
						<Text style={{color:'#53962E',fontFamily: FontName.Regular, fontSize:14, color:ThemeColor.BtnColor }}>ASAVE DRAFT</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.btnFill} onPress={() => {handleSubmitForApproval('908')}}>
						<Text style={{color:'#53962E',fontFamily: FontName.Regular, fontSize:14, color:'#fff' }}>SUBMIT FOR APPROVAL</Text>
					</TouchableOpacity>
				</View> : null
			 }

		
			<ActionSheet ref={timesheetPeriodRef} containerStyle={{backgroundColor:ThemeColor.ViewBgColor}}>
				<View style={{height:300}}>
					<View style={{height:60, flexDirection:'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft:16,paddingRight:16}}>
					<TouchableOpacity onPress={() => {timesheetPeriodRef.current?.setModalVisible()}}>
						<Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Cancel</Text>
					</TouchableOpacity>
					<Text style={{color:ThemeColor.TextColor, fontSize:16, fontFamily: FontName.Bold}}>Select timesheet period</Text>
					<TouchableOpacity onPress={() => {timesheetPeriodRef.current?.setModalVisible()}}>
						<Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Done</Text>
					</TouchableOpacity>
					</View>
					<Picker
						style={{backgroundColor: 'white',flex:1,}}
						itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
						selectedValue={data.timesheetPeriod}
						onValueChange={(itemValue, index) => { handleTimesheetPeriodSelect(index)}}
					>
					{timesheetPeriodArray && timesheetPeriodArray.map((item, index) => {
						return (<Picker.Item label={item} value={item} key={index}/>) 
					})}
					</Picker>
				</View>
			</ActionSheet>  
			<ActionSheet ref={shiftTypeRef} containerStyle={{backgroundColor:ThemeColor.ViewBgColor}}>
				<View style={{height:300}}>
					<View style={{height:60, flexDirection:'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft:16,paddingRight:16}}>
					<TouchableOpacity onPress={() => {shiftTypeRef.current?.setModalVisible()}}>
						<Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Cancel</Text>
					</TouchableOpacity>
					<Text style={{color:ThemeColor.TextColor, fontSize:16, fontFamily: FontName.Bold}}>Select shift</Text>
					<TouchableOpacity onPress={() => {
						let selectedItem = selectedHours.shiftOption[0];
						setSelectedHours({...selectedHours,shiftId:selectedItem.Shift_Id});
						
						let tempArr = mannualHoursArray;
						let editObj = selectedHours;
						editObj.Shift_Id = selectedItem.Shift_Id;
						console.log(editObj);
						tempArr[selectedIndex] = editObj;
						setMannualHoursArray(tempArr);
						setHoursUpdated(!hoursUpdated);
							
						shiftTypeRef.current?.setModalVisible()
						
						}}>
						<Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Done</Text>
					</TouchableOpacity>
					</View>
					<Picker
						style={{backgroundColor: 'white',flex:1,}}
						itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
						selectedValue={parseInt(selectedHours.shiftId)}
						onValueChange={(itemValue, index) =>{
							let selectedItem = selectedHours.shiftOption[index];
							setSelectedHours({...selectedHours,shiftId:selectedItem.Shift_Id});
							
							let tempArr = mannualHoursArray;
							let editObj = selectedHours;
							editObj.Shift_Id = selectedItem.Shift_Id;
							tempArr[selectedIndex] = editObj;
							setMannualHoursArray(tempArr);
						}}
					>
					{selectedHours && selectedHours.shiftOption.map((item, index) => {
						return (<Picker.Item label={item.ShiftName} value={item.Shift_Id} key={index}/>) 
					})}
					</Picker>
				</View>
			</ActionSheet>
			
		</SafeAreaView>
	);
}

export default CheckInOutTimesheetScreen;

const styles = StyleSheet.create({
    container: {
		flex: 1,
		backgroundColor:ThemeColor.ViewBgColor,
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
		fontSize:14,
		fontFamily: FontName.Regular,
		marginLeft:8,
		alignContent:'stretch',
	},inputHour:{
		flex:1,
		color:ThemeColor.TextColor,
		fontSize:12,
		fontFamily: FontName.Regular,
		marginLeft:8,
		textAlign: 'center'
	},labelText:{
		flex: 1,
		color:'black',
		fontSize:14,
		fontFamily: FontName.Regular,
		marginLeft:8,
		alignContent:'stretch',
	},btnUpload:{
		flex: 1,
		height:45,
		justifyContent:"center",
		backgroundColor: ThemeColor.BtnColor ,
		alignItems:'center',
	},btnFill:{
		flex:1,
		height:50,
		justifyContent:"center",
		backgroundColor: ThemeColor.BtnColor ,
		alignItems:'center',
	  }
  });