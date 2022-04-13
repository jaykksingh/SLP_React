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
import {getAuthHeader} from '../../_helpers/auth-header';
import { BaseUrl, EndPoints, StaticMessage, ThemeColor, FontName } from '../../_helpers/constants';
import Loader from '../../Components/Loader';
import moment from 'moment';


const AttendanceDetailsScreen = ({route,navigation})  => {
	const [isLoading, setIsLoading] = React.useState(false);
	const [data, setData] = React.useState({
		reason:''
	})
	const { details } = route.params;

	React.useLayoutEffect(() => {
		navigation.setOptions({
		  title: "Attendance details",
		});
	}, [navigation]);
	
	useEffect(() => {
		
	}, []);
	const getStatusFromIds= (key) => {
		switch (key) {
			case 101:
				return "Pending";
			case 102:
				return "Approved";
			case 103:
				return "Rejected";
			case 104:
				return "Pullback";
			case 105:
				return "Cancelled";
			default:
				break;
		}
		return "Pending";
	}
	const getFormattedShiftRange=(item) =>{
		let momentStartDate = moment(item.Shift_StartTime, 'YYYY-MM-DDTHH:mm');
		let momentEndDate = moment(item.Shift_Endtime, 'YYYY-MM-DDTHH:mm:ss');
		let startDateString = moment(momentStartDate).format('hh:mm A')
		let endDateString = moment(momentEndDate).format('hh:mm A')
	
		return ` (${startDateString} - ${endDateString})`;
	}
	const getFormattedShiftDate=(item) =>{
		let momentStartDate = moment(item.Date, 'YYYY-MM-DDTHH:mm');
		let startDateString = moment(momentStartDate).format('MMM DD, YYYY')
	
		return ` (${startDateString})`;
	}
	

	let shiftDetail = details.ShiftDetail[0];
	let attendanceArray = details.AttendanceDetail ? details.AttendanceDetail : [];
	let leaveArray = details.LeaveDetail ? details.LeaveDetail : [];

	return(
		<SafeAreaView style={styles.container}>
			<View style={{flex:1}}>
				<Text style={{padding:16,fontSize:16, fontFamily: FontName.Bold,color:ThemeColor.TextColor}}>{shiftDetail.ShiftName} {getFormattedShiftRange(shiftDetail)}</Text>
				{details.AttendanceDetail && 
				<View>
					<View style={{padding:16, flexDirection: 'row', justifyContent:'space-between', backgroundColor:ThemeColor.SubHeaderColor, marginTop:16}}>
						<Text style={{fontSize:16, fontFamily: FontName.Regular,color:ThemeColor.TextColor}}>Attendance details {getFormattedShiftDate(shiftDetail)}</Text>
						<Text style={{fontSize:16, fontFamily: FontName.Regular,color:ThemeColor.TextColor}}>{shiftDetail.Total_Hours_Spent} hours</Text>
					</View>
					<View style={{backgroundColor:ThemeColor.BorderColor, height:1}} />

					<View style={{flexDirection: 'row', justifyContent:'space-around', paddingTop:12, paddingBottom:12, backgroundColor:'#fff'}}>
						<Text style={{fontSize:16, fontFamily: FontName.Regular,color:ThemeColor.TextColor}}>In Time</Text>
						<Text style={{fontSize:16, fontFamily: FontName.Regular,color:ThemeColor.TextColor}}>Out Time</Text>
						<Text style={{fontSize:16, fontFamily: FontName.Regular,color:ThemeColor.TextColor}}>Total hours</Text>
					</View>
					<View style={{backgroundColor:ThemeColor.BorderColor, height:1}} />
					<FlatList
						data={attendanceArray}
						keyExtractor={(item, index) => index.toString()}
						renderItem={({item}) =>
							<View style={{backgroundColor:'#fff'}}>
								<View style={{flexDirection: 'row', justifyContent:'space-around', paddingTop:12, paddingBottom:12}}>
									<Text style={{fontSize:14, fontFamily: FontName.Regular,color:ThemeColor.TextColor}}>{item.In_Time}</Text>
									<Text style={{fontSize:14, fontFamily: FontName.Regular,color:ThemeColor.TextColor}}>{item.Out_Time}</Text>
									<Text style={{fontSize:14, fontFamily: FontName.Regular,color:ThemeColor.TextColor}}>{item.Hours_Spent} {item.Attendance_Type.length > 0 ? `(${item.Attendance_Type})` : ''}</Text>
								</View>
								<View style={{backgroundColor:ThemeColor.BorderColor, height:1}} />
							</View>
						}
					/>
				</View>}
				{details.LeaveDetail && 
				<View>
					<View style={{padding:16, flexDirection: 'row', justifyContent:'space-between', backgroundColor:ThemeColor.SubHeaderColor, marginTop:16}}>
						<Text style={{fontSize:16, fontFamily: FontName.Regular,color:ThemeColor.TextColor}}>Leave details {getFormattedShiftDate(shiftDetail)}</Text>
					</View>
					<View style={{backgroundColor:ThemeColor.BorderColor, height:1}} />
					<FlatList
						data={leaveArray}
						keyExtractor={(item, index) => index.toString()}
						renderItem={({item}) =>
							<View style={{backgroundColor:'#fff',paddingTop:8,}}>
								<View style={{paddingLeft:16, paddingRight:16, flexDirection: 'row', justifyContent:'space-between'}}>
									<Text style={{fontSize:16, fontFamily: FontName.Regular,color:ThemeColor.TextColor}}>{item.LeaveName}</Text>
									<Text style={{fontSize:16, fontFamily: FontName.Regular,color: item.Leave_Status == 'Approved' ? ThemeColor.NavColor : ThemeColor.RedColor}}>{item.Leave_Status}</Text>
								</View>
								<Text style={{paddingLeft:16, paddingRight:16,marginTop:8,fontSize:16, fontFamily: FontName.Regular,color:ThemeColor.TextColor}}>{item.Day}</Text>
								<View style={{paddingLeft:16, paddingRight:16, flexDirection: 'row'}}>
									<Text style={{fontSize:16, fontFamily: FontName.Regular,color:ThemeColor.SubTextColor}}>Reason: </Text>
									<Text style={{fontSize:16, fontFamily: FontName.Regular,color: ThemeColor.TextColor}}>{item.Reason}</Text>
								</View>
								<View style={{backgroundColor:ThemeColor.BorderColor, height:1, marginTop:8}} />
							</View>
						}
					/>
				</View>}
				{details.LeaveDetail || details.AttendanceDetail ? null : 
					<View style={{flex:1, justifyContent: 'center',alignItems: 'center'}}>
						<Text style={{fontSize:16, fontFamily: FontName.Regular,color:ThemeColor.TextColor}}>No activity available</Text>
					</View>
				}
				<Loader isLoading={isLoading} />
			</View>
		</SafeAreaView>
	);
}

export default AttendanceDetailsScreen;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:ThemeColor.ViewBgColor,
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
