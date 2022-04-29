import React,{useEffect} from "react";
import { 
	Text, 
    TouchableOpacity,
    StyleSheet, 
    View,
	SafeAreaView,
	Alert,
	FlatList,
	ScrollView,
	Image,
	Platform
} from "react-native";
import Feather from 'react-native-vector-icons/Feather';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'
import axios from 'axios'
import {getAuthHeader} from '../../../_helpers/auth-header';
import { BaseUrl, EndPoints, StaticMessage, ThemeColor, FontName } from '../../../_helpers/constants';
import { AuthContext } from '../../../Components/context';
import Loader from '../../../Components/Loader';
import FileViewer from "react-native-file-viewer";
import RNFS from "react-native-fs";


const ViewClockInOutTimesheetScreen = ({route,navigation}) => {
	const [isLoading, setIsLoading] = React.useState(false);
	const [data,setData] = React.useState({
		clientName:'',
		projectId:'',
		timesheetPeriod:'',
		hours:'',
		timeSheetCycle:'',
		startDate:'',
		endDate:'',

	});
	const [mannualHoursArray, setMannualHoursArray] = React.useState([]);
	const [projectDetails, setProjectDetail] = React.useState({});
	const [timesheetPdfDetail, setTimesheetPdfDetail] = React.useState({});
	const [projectListArray, setProjectListArray] = React.useState([]);

	const { timesheetDetails } = route.params;
	const { projectDetail } = route.params;
	const { signOut } = React.useContext(AuthContext);


	React.useLayoutEffect(() => {
		navigation.setOptions({
			  title: projectDetail ? projectDetail.projectName  : `View timesheet `,
		});
	}, [navigation]);
	const showShareOptions = () =>{

	}
	useEffect(() => {
		getHoursDetails(projectDetail.projectDetailId,timesheetDetails.startDate,timesheetDetails.endDate);
		GetProjectList();
		let momentStartDate = moment(timesheetDetails.startDate, 'YYYY-MM-DD');
		let momentEndDate = moment(timesheetDetails.endDate, 'YYYY-MM-DD');
		let startDateString = moment(momentStartDate).format('MMM DD, YYYY')
		let endDateString = moment(momentEndDate).format('MMM DD, YYYY')	
		const timesheetPeriod = `${startDateString} - ${endDateString}`;

		setData({...data, projectId:projectDetail.projectDetailId, timeSheetCycle:projectDetail.timeSheetCycle,clientName:projectDetail.clientName,timesheetPeriod:timesheetPeriod,startDate:timesheetDetails.startDate,endDate:timesheetDetails.endDate});
		
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
	const getHoursDetails = async(projectId,startDate, endDate) => {
		let user = await AsyncStorage.getItem('loginDetails');  
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken);
	
		setIsLoading(true);
		
		axios ({  
		  "method": "POST",
		  "url": BaseUrl + EndPoints.GetTimesheetHours,
		  "headers": getAuthHeader(authToken),
		  data:{"projectId":projectId,'startDate':startDate,'endDate':endDate}
		})
		.then((response) => {
			setIsLoading(false);
			if (response.data.code == 200){
				const results = JSON.stringify(response.data.content.dataList[0].project.hoursDetail)
				console.log('Hours Array:',results)
				setMannualHoursArray(response.data.content.dataList[0].project.hoursDetail);
				setProjectDetail(response.data.content.dataList[0].project);
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
	
	const GetProjectList = async () => {
		let user = await AsyncStorage.getItem('loginDetails');  
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken);
	
		console.log('Param Project :',{'fromDate':timesheetDetails.startDate,'toDate':timesheetDetails.endDate});
		axios ({  
		  "method": "POST",
		  "url": BaseUrl + EndPoints.GetProjectHours,
		  "headers": getAuthHeader(authToken),
		  data:{'fromDate':timesheetDetails.startDate,'toDate':timesheetDetails.endDate}
		})
		.then((response) => {
			if (response.data.code == 200){
				setProjectListArray(response.data.content.dataList[0].projects);
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
			if(error.response && error.response.status == 401){
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
				console.log('Result:', results);
				setTimesheetPdfDetail(response.data.content.dataList[0]);
				let url =  response.data.content.dataList[0].filePath;
				var extension = url.split(/[#?]/)[0].split(".").pop().trim();
				
				const localFile = `${RNFS.DocumentDirectoryPath}/Timesheet.${extension}`;
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

	const getFormatedDate=(item) =>{
		let momentStartDate = moment(item.day, 'YYYY-MM-DD');
		let startDateString = moment(momentStartDate).format('ddd, MMM DD')
		return `${startDateString}`;
	}
	
	const tips='Tip: Enter 0.50 increments to indicate a half hour. For example, for eight and a half hours, please enter 8.50 rather than 8.30'
	
	const viewFile = () => {
		let tempArray =  projectListArray;
		let projectDetailId = projectDetail.projectDetailId;
		const newArr = projectListArray.filter(item => item.projectId == projectDetailId)
		console.log(`Result array : ${JSON.stringify(newArr)}`);


		if(newArr.length == 0){
			return;
		}
		let details =  newArr[0];
		let url =  details.path;
		var extension = url.split(/[#?]/)[0].split(".").pop().trim();
		const localFile = `${RNFS.DocumentDirectoryPath}/${details.fileName}.${extension}`;
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
    const handleIconClicked = (item) => {
		let message = "Submitted Hours"
		if(item.holiday == 1){
			message = "Holiday";
		}else if(item.vacation){
			message = "Time-off";
		}
		Alert.alert(StaticMessage.AppName, message, [
			{text: 'Ok'}
		  ]);
	}
    const handleViewClockInOut = (item) => {
		console.log('Item Details:',item);
        navigation.navigate('ViewClockInOut',{dayDetails:item,timesheetDetails:timesheetDetails,projectDetail:projectDetail})
	}

	return(
		<SafeAreaView style={styles.container}>
			<ScrollView style={{ paddingTop:8,paddingBottom:16,}}>
				<View style={{marginTop:12,paddingLeft:16, paddingRight:16,}}>
					<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Timesheet period</Text>
					<View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}>
						<Text style={[styles.labelText,{color:data.timesheetPeriod.length > 0 ? 'black' : ThemeColor.PlaceHolderColor}]}>{data.timesheetPeriod.length >0 ? data.timesheetPeriod : 'Select timesheet period'}</Text>
					</View>
				</View>
				<View style={{marginTop:12, backgroundColor:'white',borderRadius:5,justifyContent:'space-between',marginLeft:16, marginRight:16,}}>
					<TouchableOpacity style={{alignSelf:'center', backgroundColor:ThemeColor.BtnColor, flexDirection:'row', paddingLeft:16,paddingRight:16, height:40, alignItems: 'center', borderRadius:5, marginTop:16, marginBottom:16	}} onPress={() => {viewFile()}}>
						<Text style ={{color:'white', fontSize:16 ,fontFamily:FontName.Regular, marginLeft:8}}>VIEW TIMESHEET</Text>
					</TouchableOpacity>
					<View style ={{flexDirection:'row', alignItems: 'center', justifyContent: 'center', marginBottom:16}}>
						<Text style ={{color:ThemeColor.SubTextColor, fontSize:16 ,fontFamily:FontName.Regular}}>Client approved hours:</Text>
						<Text style ={{color:ThemeColor.TextColor, fontSize:16 ,fontFamily:FontName.Regular, marginLeft:4}}>{timesheetDetails.totalHours} hours</Text>
					</View>
					
					<View style={{justifyContent:'flex-end', flexDirection:'row',alignItems: 'center', paddingRight:16, paddingLeft:16, marginBottom:16	}}>
						<TouchableOpacity style={{alignItems: 'center',justifyContent: 'center', height:40,}} onPress={() => {handlePrintTimesheet()}}>
							<Feather name="printer" color={ThemeColor.TextColor} size={25} />
						</TouchableOpacity>
					</View>
				</View>
				
				<View style ={{backgroundColor:'white', flex: 1, marginBottom:16, marginTop:16, borderRadius:5}}>
					<View style ={{flexDirection:'row', marginBottom:1, justifyContent: 'center', alignItems: 'center', alignContent:'center'}}>
						<View style={{height:30, width:90, flexDirection:'row',justifyContent: 'center',alignItems: 'center'}}>
							<Text style={{color:ThemeColor.SubTextColor,fontSize:12, textAlign: 'center', flex: 1}}>Date</Text>
							<View style={{backgroundColor:ThemeColor.BorderColor, height:30, width:1}}/>
						</View>
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
							<Text style={{color:ThemeColor.SubTextColor,fontSize:12, textAlign: 'center', flex:1}}>Meal hours</Text>
						</View>
					</View>
					<View style={{backgroundColor:ThemeColor.BorderColor, height:1}}/> 
					
					<FlatList
						style={{flex: 1}}
						data={mannualHoursArray}
						keyExtractor={(item, index) => index.toString()}
						renderItem={({item, index}) => 
						<View>
							<View style ={{flexDirection:'row', marginBottom:1, justifyContent: 'center', alignItems: 'center', alignContent:'center'}}>
								<View style={{height:30, width:90, flexDirection:'row',justifyContent: 'center',alignItems: 'center'}}>
									<Text style={{color:ThemeColor.SubTextColor,fontSize:12, textAlign: 'center', flex: 1}}>{getFormatedDate(item)}</Text>
									<View style={{backgroundColor:ThemeColor.BorderColor, height:30, width:1}}/>
								</View>
								<View style={{height:30, flex:1, flexDirection:'row',justifyContent: 'center',alignItems: 'center'}}>
									<Text style={{color:ThemeColor.SubTextColor,fontSize:12, textAlign: 'center', flex: 1}}>{item.regHrs}</Text>
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
								<TouchableOpacity style={{height:30, flex:1, flexDirection:'row',justifyContent: 'center',alignItems: 'center', paddingRight:8}} onPress={ () => {handleViewClockInOut(item)}}>
									<Text style={{color:ThemeColor.TextColor,fontSize:12, textAlign: 'center', flex:1}}>{item.breakHrs}</Text>
                                    <Feather name="chevron-right" color={ThemeColor.SubTextColor} size={15} />
								</TouchableOpacity>
							</View>
							<View style={{backgroundColor:ThemeColor.BorderColor, height:1}}/>
						</View>}
					/>
					<View style ={{flexDirection:'row', marginBottom:1, justifyContent: 'center', alignItems: 'center', alignContent:'center'}}>
						<View style={{height:30, width:90, flexDirection:'row',justifyContent: 'center',alignItems: 'center'}}>
							<Text style={{color:ThemeColor.SubTextColor,fontSize:14, textAlign: 'center', flex: 1}}>Total</Text>
							<View style={{backgroundColor:ThemeColor.BorderColor, height:30, width:1}}/>
						</View>
						<View style={{height:30, flex:1, flexDirection:'row',justifyContent: 'center',alignItems: 'center'}}>
							<Text style={{color:ThemeColor.SubTextColor,fontSize:14, textAlign: 'center', flex: 1}}>{getTotalRegHours()}</Text>
							<View style={{backgroundColor:ThemeColor.BorderColor, height:30, width:1}}/>
						</View>
						<View style={{height:30, flex:1, flexDirection:'row',justifyContent: 'center',alignItems: 'center'}}>
							<Text style={{color:ThemeColor.SubTextColor,fontSize:14, textAlign: 'center', flex: 1}}>{getTotalOtHours()}</Text>
							<View style={{backgroundColor:ThemeColor.BorderColor, height:30, width:1}}/>
						</View>
						<View style={{height:30, flex:1, flexDirection:'row',justifyContent: 'center',alignItems: 'center'}}>
							<Text style={{color:ThemeColor.SubTextColor,fontSize:14, textAlign: 'center', flex: 1}}>{getTotalDtHours()}</Text>
							<View style={{backgroundColor:ThemeColor.BorderColor, height:30, width:1}}/>
						</View>
						<View style={{height:30, flex:1, flexDirection:'row',justifyContent: 'center',alignItems: 'center', paddingRight:8}}>
							<Text style={{color:ThemeColor.TextColor,fontSize:14, textAlign: 'center', flex:1}}>{getTotalBreakHours()}</Text>
						</View>
					</View>					
				</View>
				
			
			</ScrollView> 
			<Loader isLoading={isLoading} />    
		</SafeAreaView>
	);
}

export default ViewClockInOutTimesheetScreen;

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
		flex: 1,
		height:50,
		justifyContent:"center",
		backgroundColor: ThemeColor.BtnColor ,
		alignItems:'center',
	  }
  });