import React ,{useEffect,useState}from 'react';
import { View ,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Alert,
    FlatList,
    SafeAreaView,
    Text} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'
import axios from 'axios'
import moment from 'moment';
import {getAuthHeader} from '../../_helpers/auth-header';
import { BaseUrl,LeaveMgrBaseURL, EndPoints, StaticMessage, ThemeColor, FontName } from '../../_helpers/constants';
import Loader from '../../Components/Loader';


const AttendancePendingScreen = ({route,navigation})  => {

	const [isLoading, setIsLoading] = React.useState(false);
	const [regularizationArray, setRegularizationArray] = React.useState([]);

  	const [data,setData] = React.useState({
		project:'',
	});

  	useEffect(() => {
		navigation.addListener('focus', () => {
			setIsLoading(true);
			getRegularizationList();		
		});

	},[]);

	const  getRegularizationList = async() => {
		let user = await AsyncStorage.getItem('loginDetails');  
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken);
		let employeeDetailsId = parsed.employeeDetailsId;
	
		let params = {
			'LoggedInEmployeeDetailsId':'' + employeeDetailsId,
			'ARStatusId':'0',
			'PageIndex':1,
			'PageSize':200,
			'SortColumn':'',
			'SortDirection':''
		}
		console.log('params: ',params);
		
		axios ({  
		  "method": "POST",
		  "url": LeaveMgrBaseURL + EndPoints.TeamRegularizationList,
		  "headers": {'Authorization':'qwerty~!@','Content-Type':'application/json'},
		  data:params
		})
		.then((response) => {
      		setIsLoading(false);
		  	if (response.data.header == 200){
				console.log('Regularization:',JSON.stringify(response.data.content.data));
				setRegularizationArray(response.data.content.data);
			}else if (response.data.code == 417){
				console.log(Object.values(response.data.content.messageList));
				const errorList = Object.values(response.data.content.messageList);
				Alert.alert(StaticMessage.AppName, errorList.join(), [
				{text: 'Ok'}
			]);
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
  	

	const note ='Note: In order to receive timely payment, upload timesheets and submit hours regularly. We are unable to bill without client approved timesheets.';
	
	const getFormatedDateRange=(item) =>{
		let startDate = item.startDate;
		let endDate = item.endDate;

		let momentStartDate = moment(item.startDate, 'YYYY-MM-DD');
		let momentEndDate = moment(item.endDate, 'YYYY-MM-DD');
		let startDateString = moment(momentStartDate).format('MMM DD, YYYY')
		let endDateString = moment(momentEndDate).format('MMM DD, YYYY')
	
		return `${startDateString} - ${endDateString}`;
	}
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
	
	const didSelectFilterKey = (key) => {
		setFilterKey(key);
		getRegularizationList(key);
	}
  	return(
		<SafeAreaView style={styles.container}>
			{/* <View style={{flexDirection:'row',alignItems: 'center', padding:8}}>
				<FlatList
					horizontal
					data={['All','Pending','Approved','Rejected','Pullback']}
					keyExtractor={(item, index) => index.toString()}
					renderItem={({item}) => 
						<TouchableOpacity  style={[styles.item, {backgroundColor:item == filterKey ? ThemeColor.BtnColor : 'white'}]} onPress={() =>{didSelectFilterKey(item)}}>
							<Text style={[styles.title,{color: item == filterKey ? 'white' : ThemeColor.TextColor}]}>{item}</Text>
						</TouchableOpacity>
					}
				/>
          	</View> */}
			{regularizationArray.length > 0 ? <FlatList
				data={regularizationArray}
				keyExtractor={(item, index) => index.toString()}
				renderItem={({item}) => 
					<TouchableOpacity style={{backgroundColor:'#fff',marginBottom:8, paddingBottom:8,paddingTop:8, flexDirection: 'row', justifyContent:'center', alignItems: 'center'}} onPress={() => navigation.navigate('RegularizationDetail',{leaveDetails:item,isMyAttendance:false})}>
						<View style={{flex:1}}>
							<View style={{paddingLeft:12,flexDirection: 'row', justifyContent: 'space-between'}}> 
								<View style={{backgroundColor:ThemeColor.SubHeaderColor, borderRadius:5,padding:4,paddingBottom:4}}>
									<Text style={{paddingLeft:8,paddingRight:8, borderRadius:5, fontSize:12, fontFamily: FontName.Regular}}>{item.Category_Desc}</Text>
								</View>
								<View style={{backgroundColor:ThemeColor.SubHeaderColor, borderRadius:5}}>
									<Text style={{padding:4, paddingLeft:8,paddingRight:8,borderRadius:5,fontSize:12, fontFamily: FontName.Regular, color:item.AR_Status == 'Approved'  ? ThemeColor.GreenColor : ThemeColor.RedColor}}>{item.AR_Status}</Text>
								</View>
							</View>
							<Text style={{marginLeft:16,marginRight:16, fontSize:16, fontFamily: FontName.Regular, marginTop:8, color:ThemeColor.TextColor}}>{`${item.EmployeeName} (${item.CompanyEmployeeId})`}</Text>
							<View style={{paddingLeft:16, paddingRight:16, marginTop:4, flexDirection: 'row'}}> 
								<Text style={{fontSize:14, fontFamily: FontName.Regular, color:ThemeColor.SubTextColor}}>From: </Text>
								<Text style={{fontSize:14, fontFamily: FontName.Regular, color:ThemeColor.TextColor}}>{item.From_Date} to {item.To_Date}</Text>
							</View>
							{item.IsCancelRequest ? 
								<View style={{marginTop:4}}>
									<Text style={{fontSize:14, fontFamily: FontName.Regular, color:ThemeColor.SubTextColor, textAlign:'right'}}>(Cancellation Request)</Text>
								</View> : null
							}
						</View>
						<Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22,22} />
					</TouchableOpacity>
				}
			/> : 
			<View style={{flex:1, justifyContent: 'center',alignItems: 'center'}}>
				{!isLoading && <Text style={{fontSize:16, fontFamily: FontName.Regular, color:ThemeColor.TextColor}}>No request found</Text>}
			</View>
			}
			
	  	<Loader isLoading={isLoading} />
    	</SafeAreaView>	
	);
}

export default AttendancePendingScreen;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      // backgroundColor:'#E5E9EB' 
    },
    tabBar: {
      flexDirection: 'row',
      paddingTop: 0,
      backgroundColor:'#F6F6F6',
    },
    tabItem: {
      flex: 1,
      alignItems: 'center',
      padding: 16,
      fontSize: 10
    },btnFill:{
        width:'100%',
        margin: 16,
        height:50,
        justifyContent:"center",
        backgroundColor:'#fff' ,
        alignItems:'center',
        borderRadius:5,
      },btnFill:{
		height:50,
		justifyContent:"center",
		backgroundColor: ThemeColor.BtnColor ,
		alignItems:'center',
		marginLeft:16, 
		marginRight:16,
		marginBottom:8,
		borderRadius:5,
	  },item: {
		padding: 4,
		marginVertical: 0,
		height:35,
		marginHorizontal: 4,
		borderRadius:5,
		borderColor:ThemeColor.BorderColor,
		borderWidth:1,
		alignItems: 'center',
		justifyContent: 'center'
	  },
	  title: {
		fontSize: 14,
		paddingLeft:8,
		paddingRight:8,
		color:ThemeColor.TextColor
	  },
  });
