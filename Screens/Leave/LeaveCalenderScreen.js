import React ,{useEffect,createRef}from 'react';
import { View ,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    Alert,
	SafeAreaView,
	TextInput,
	Dimensions,
    Text} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'
import axios from 'axios'
import moment from 'moment';
import {Calendar, CalendarList, Agenda} from 'react-native-calendars';
import {getAuthHeader} from '../../_helpers/auth-header';
import { BaseUrl, LeaveMgrBaseURL,EndPoints, StaticMessage, ThemeColor, FontName } from '../../_helpers/constants';
import Loader from '../../Components/Loader';

function beginningOfMonth(){    
	let date = new Date();
	date.setDate(1)
	date.setHours(0);
	date.setMinutes(0);
	date.setSeconds(0); 
	let momentStartDate = moment(date, 'YYYY-MM-DDTHH:mm:ssZZ');
	let startDateString = moment(momentStartDate).format('YYYY-MM-DD')
  
	return startDateString;     
}
function endOfMonth(){
	let date = new Date();
	date.setMonth(date.getMonth() + 1 )
	date.setDate(0);
	date.setHours(23);
	date.setMinutes(59);
	date.setSeconds(59);

	let momentStartDate = moment(date, 'YYYY-MM-DDTHH:mm:ssZZ');
	let startDateString = moment(momentStartDate).format('YYYY-MM-DD')
	return startDateString;
}

const LeaveCalenderScreen = ({route,navigation})  => {
	const [isLoading, setIsLoading] = React.useState(false);
	const [attendanceList, setAttendanceList] = React.useState([]);
	const [selectedDate, setSelectedDate] = React.useState('')

	React.useLayoutEffect(() => {
		navigation.setOptions({
			headerRight: () => (
				<TouchableOpacity style={{marginRight:16}} onPress={() => showActionButton()}>
					<Feather name="more-vertical" color={'white'} size={25,25} />
				</TouchableOpacity>
			),
		});
	}, [navigation]);
	
	useEffect(() => {
		console.log('Dates :',beginningOfMonth(),endOfMonth());
		getCalenderDetails(beginningOfMonth(),endOfMonth());
		if(navigation.dangerouslyGetParent){
			const parent = navigation.dangerouslyGetParent();
				parent.setOptions({
				tabBarVisible: false
			});
			return () =>
				parent.setOptions({
				tabBarVisible: false
			});
		}
	}, []);

	const  getCalenderDetails = async(monthStartDate, monthEndDate) => {
		let user = await AsyncStorage.getItem('loginDetails');  
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken);
		let employeeDetailsId = parsed.employeeDetailsId;
	
		setIsLoading(true);
		let params = {
			"EmployeeDetails_Id": '' + employeeDetailsId,
			'From_Date':monthStartDate,
			'To_Date':monthEndDate
		}
		console.log('params: ',params);
		
		axios ({  
		  "method": "POST",
		  "url": LeaveMgrBaseURL + EndPoints.AttendanceCalender,
		  "headers": {'Authorization':'qwerty~!@','Content-Type':'application/json'},
		  data:params
		})
		.then((response) => {
      		setIsLoading(false);
			  console.log('Attendance:',JSON.stringify(response.data));

		  	if (response.data.header == 200){
				console.log('Attendance:',JSON.stringify(response.data.content.data));
				setAttendanceList(response.data.content.data);
			}else if (response.data.code == 417){
				console.log(Object.values(response.data.content.messageList));
				const errorList = Object.values(response.data.content.messageList);
				Alert.alert(StaticMessage.AppName, errorList.join(), [
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
	const  getAttendanceDetails = async() => {
		let user = await AsyncStorage.getItem('loginDetails');  
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken);
		let employeeDetailsId = parsed.employeeDetailsId;
	
		setIsLoading(true);
		let params = {
			"EmployeeDetails_Id": '' + employeeDetailsId,
			'Attendance_Date':selectedDate,
		}
		
		axios ({  
		  "method": "POST",
		  "url": LeaveMgrBaseURL + EndPoints.AttendanceDetails,
		  "headers": {'Authorization':'qwerty~!@','Content-Type':'application/json'},
		  data:params
		})
		.then((response) => {
      		setIsLoading(false);
		  	if (response.data.header == 200){
				console.log('Attendance:',JSON.stringify(response.data.content.data));
				navigation.navigate('AttendanceDetails',{details:response.data.content.data});
			}else if (response.data.code == 417){
				console.log(Object.values(response.data.content.messageList));
				const errorList = Object.values(response.data.content.messageList);
				Alert.alert(StaticMessage.AppName, errorList.join(), [
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

	var markedDateObject = {};
	for (var i = 0; i < attendanceList.length; i++) {
		let dictAttendance = attendanceList[i];
		for(var j=0 ; j < attendanceList[i].items.length ; j++) {
			let daysObject = attendanceList[i].items[j];
			let name = daysObject.name;
			for(var k=0 ; k < daysObject.days.length ; k++) {
				let dateString = daysObject.days[k];
				if(name == 'Absent'){
					markedDateObject[dateString] = {marked: true, dotColor: dictAttendance.color,type:dictAttendance.type,name:daysObject.name};
				}else if(dictAttendance.type == 'Present'){
					markedDateObject[dateString] = {marked: true, dotColor: dictAttendance.color,type:dictAttendance.type,name:daysObject.name};
				}else if(dictAttendance.type == 'WeeklyOff'){
					markedDateObject[dateString] = {disabled: true,type:dictAttendance.type,name:daysObject.name};
				}else if(dictAttendance.type == 'Leave'){
					markedDateObject[dateString] = {marked: true, dotColor: dictAttendance.color,type:dictAttendance.type,name:daysObject.name};
				}else if(dictAttendance.type == 'Holiday'){
					markedDateObject[dateString] = {marked: true, dotColor: dictAttendance.color,type:dictAttendance.type,name:daysObject.name};
				}
			}
		}
		
	}
	
	const eventList = [];
	if(selectedDate.length > 0){
		var key1 = markedDateObject[selectedDate];
		console.log('Event List',key1);
		if(key1){
			key1.date = selectedDate;
			eventList.push(key1);
		}
		console.log('Event List',eventList);
	}
	if(selectedDate.length > 0){
		markedDateObject[selectedDate] = {selected: true,  selectedColor: 'black'};
	}
	const handleMonthChange = (month) => {
		setSelectedDate('');
		console.log('Month changed', month);
		let monthNumber = month.month;
		let yearNumber = month.year;
		let monthEndDate = new Date(yearNumber, monthNumber, 0);
		let days = monthEndDate.getDate();
		let startDate = `${yearNumber}/${monthNumber < 10 ? '0'+monthNumber : monthNumber}/01`;
		let endDate = `${yearNumber}/${monthNumber < 10 ? '0'+monthNumber : monthNumber}/${days < 10 ? '0'+ days : days}`;
		getCalenderDetails(startDate, endDate);
	}
	
	return(
		<SafeAreaView style={styles.container}>
			<Calendar 
				theme={{textDisabledColor: ThemeColor.dissableDateColor}}
				markedDates={markedDateObject}
				onMonthChange={(month) => {handleMonthChange(month)}}
				onDayPress={(day) => {setSelectedDate(day.dateString)}}
			/>
			<View style={{backgroundColor:ThemeColor.BorderColor, height:1, marginTop:0}}/>

			{eventList.length > 0 ? <FlatList
				data={eventList}
				keyExtractor={(item, index) => index.toString()}
				renderItem={({item}) => 
					<TouchableOpacity style={{backgroundColor:'#fff', paddingLeft:16,}} onPress={() => {getAttendanceDetails()}}>
						<View style={{flexDirection: 'row', justifyContent:'center', alignItems: 'center',paddingBottom:4,paddingTop:8}} >
							<Text style={{fontSize:16, fontFamily: FontName.Regular,color:ThemeColor.TextColor,flex:1}}>{item.name} {item.type == 'Holiday' ? `(${item.type})` : ''}</Text>
							<Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22,22} />
						</View>
						<View style={{backgroundColor:ThemeColor.BorderColor, height:1, marginTop:8}}/>
					</TouchableOpacity>
				}
			/> : selectedDate.length > 0 ?
			<View style={{flex:1, alignItems: 'center',justifyContent: 'center'}}>
				<Text style={{fontSize:16, fontFamily: FontName.Regular,color:ThemeColor.TextColor}}>No event</Text>
			</View> : null}			
			<Loader isLoading={isLoading} />
		</SafeAreaView>
	);
}

export default LeaveCalenderScreen;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:'#fff',
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
        margin: 16,
        height:50,
        justifyContent:"center",
        backgroundColor:ThemeColor.BtnColor ,
        alignItems:'center',
        borderRadius:5,
      }
  });
