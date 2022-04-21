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
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'
import axios from 'axios'
import moment from 'moment';
import {getAuthHeader} from '../../_helpers/auth-header';
import { BaseUrl, EndPoints, StaticMessage, ThemeColor, FontName } from '../../_helpers/constants';
import Loader from '../../Components/Loader';


const LeaveApprovalPending = ({route,navigation})  => {

	const [isLoading, setIsLoading] = React.useState(false);
	const [leavesArray, setLeavesArray] = React.useState([]);
	const [filterKey, setFilterKey] = React.useState('All');
	const [editEnabled, setEditEnabled] = React.useState(false);

  	const [data,setData] = React.useState({
		project:'',
	});

  	useEffect(() => {
		navigation.addListener('focus', () => {
			getMyLeaveList(filterKey);		
		});
    	getMyLeaveList('All');		
	},[]);

  	const  getMyLeaveList = async(filterKey) => {
		let user = await AsyncStorage.getItem('loginDetails');  
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken);

		setIsLoading(true);
		var filterKeyId = '';
		switch (filterKey){
			case 'All':
				filterKeyId = '';
				break;
			case 'CL - Causal Leave':
				filterKeyId = 'CL';
				break;
			case 'BL - Bonus Leave':
				filterKeyId = 'BL';
				break;
			case 'EL - Earned Leave':
				filterKeyId = 'EL';
				break;
			case 'ML - Maternity Leave':
				filterKeyId = 'ML';
				break;
			case 'PL - Paternity Leave':
				filterKeyId = 'PL';
				break;
			case 'SO - Special Occasion(s) Leave':
				filterKeyId = 'SO';
				break;
			case 'LW - Leave Without Pay':
				filterKeyId = 'LW';
				break;
			default:
				filterKeyId = '';
				break;

		}

		
		axios ({  
		  "method": "POST",
		  "url": BaseUrl + EndPoints.LeavesActionPending,
		  "headers": getAuthHeader(authToken),
		  data:{"leaveStatus":filterKeyId}
		})
		.then((response) => {
      		setIsLoading(false);
		  	if (response.data.code == 200){
				console.log('My Leaves:',response.data.content);
				setLeavesArray(response.data.content.dataList);
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

	const note ='Note: In order to receive timely payment, upload timesheets and submit hours regularly. We are unable to bill without client approved timesheets.';
	
	const getFormatedDate=(item) =>{
		let momentStartDate = moment(item.appliedDate, 'YYYY-MM-DD');
		let startDateString = moment(momentStartDate).format('MMM DD, YYYY')
		return `${startDateString}`;
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
		getMyLeaveList(key);
	}
	const handleLongPress = (item) => {
		console.log('Long pressed detected');
		setEditEnabled(true);
	}	
  	return(
		<SafeAreaView style={styles.container}>
			{/* <View style={{flexDirection:'row',alignItems: 'center', padding:8}}>
				<FlatList
					horizontal
					data={['All','CL - Causal Leave','BL - Bonus Leave','EL - Earned Leave','ML - Maternity Leave','PL - Paternity Leave','SO - Special Occasion(s) Leave','LW - Leave Without Pay']}
					keyExtractor={(item, index) => index.toString()}
					renderItem={({item}) => 
						<TouchableOpacity  style={[styles.item, {backgroundColor:item == filterKey ? ThemeColor.BtnColor : 'white'}]} onPress={() =>{didSelectFilterKey(item)}}>
							<Text style={[styles.title,{color: item == filterKey ? 'white' : ThemeColor.TextColor}]}>{item}</Text>
						</TouchableOpacity>
					}
				/>
          	</View> */}
			{leavesArray.length > 0 ? <FlatList
				data={leavesArray}
				keyExtractor={(item, index) => index.toString()}
				renderItem={({item}) => 
					<TouchableOpacity style={{backgroundColor:'#fff',marginBottom:8, paddingBottom:8,paddingTop:8, flexDirection: 'row', justifyContent:'center', alignItems: 'center'}} onPress={() => navigation.navigate('PendingApprovalLeaveDetails',{leaveDetails:item,isMyLeave:false})} onLongPress={() => {handleLongPress(item)}}>
						{editEnabled && 
						<View style={{paddingLeft:8,justifyContent: 'center', alignItems: 'center'}}> 
							<Icon name="checkmark-circle" color={ThemeColor.BtnColor} size={25} />
						</View>
						}
						<View style={{flex:1}}>
							<View style={{paddingLeft:12,flexDirection: 'row', justifyContent: 'space-between'}}> 
								<View style={{backgroundColor:ThemeColor.SubHeaderColor, borderRadius:5,padding:4,paddingBottom:4}}>
									<Text style={{paddingLeft:8,paddingRight:8, borderRadius:5, fontSize:14, fontFamily: FontName.Regular}}>{getFormatedDate(item)}</Text>
								</View>
								<View style={{backgroundColor:ThemeColor.SubHeaderColor, borderRadius:5}}>
									<Text style={{padding:4, paddingLeft:8,paddingRight:8,borderRadius:5,fontSize:14, fontFamily: FontName.Regular, color:item.status === 102 ? ThemeColor.GreenColor : ThemeColor.RedColor}}>{getStatusFromIds(item.status)}</Text>
								</View>
							</View>
							<Text style={{marginLeft:16,marginRight:16, fontSize:16, fontFamily: FontName.Regular, marginTop:4, color:ThemeColor.TextColor}}>{`${item.firstName} ${item.lastName}`}</Text>
							<View style={{paddingLeft:16, paddingRight:16, marginTop:4, flexDirection: 'row'}}> 
								<Text style={{fontSize:14, fontFamily: FontName.Regular, color:ThemeColor.SubTextColor}}>On leave: </Text>
								<Text style={{fontSize:14, fontFamily: FontName.Regular, color:ThemeColor.TextColor}}>{item.fromDate} to {item.toDate}</Text>
							</View>
							<View style={{paddingLeft:16, paddingRight:16, marginTop:4, flexDirection: 'row'}}> 
								<Text style={{fontSize:14, fontFamily: FontName.Regular, color:ThemeColor.SubTextColor}}>Leave type: </Text>
								<Text style={{fontSize:14, fontFamily: FontName.Regular, color:ThemeColor.TextColor}}>{item.leaveType}</Text>
							</View>
							<View style={{flexDirection:'row', justifyContent:'space-between', alignContent:'center'}}>
								<View style={{paddingLeft:16, paddingRight:16, marginTop:4, flexDirection: 'row'}}> 
									<Text style={{fontSize:14, fontFamily: FontName.Regular, color:ThemeColor.SubTextColor}}>Total days: </Text>
									<Text style={{fontSize:14, fontFamily: FontName.Bold, color:ThemeColor.TextColor}}>{item.noOfDays}</Text>
								</View>
								{item.IsCancelRequest ? 
								<View>
									<Text style={{fontSize:14, fontFamily: FontName.Regular, color:ThemeColor.SubTextColor}}>(Cancellation Request)</Text>
								</View> : null}
							</View>
							
						</View>
						<Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22,22} />
					</TouchableOpacity>
				}
			/> : 
			<View style={{flex:1, justifyContent: 'center',alignItems: 'center'}}>
				<Text style={{fontSize:16, fontFamily: FontName.Regular, color:ThemeColor.TextColor}}>No leaves found</Text>
			</View>
			}
			{editEnabled && 
				<View style={{flexDirection:'row', marginLeft:16, marginRight:16,marginTop:8}}>
					<TouchableOpacity style={[styles.btnFill,{backgroundColor:ThemeColor.BorderColor,marginRight:8}]} onPress={() => setEditEnabled(false)}>
						<Text style={{color:'#53962E',fontFamily: FontName.Regular, fontSize:16, color:ThemeColor.BtnColor }}>DONE</Text>
					</TouchableOpacity>
					<TouchableOpacity style={[styles.btnFill,{backgroundColor:'white',marginRight:8}]} onPress={() => {handleSkipBtn()}}>
						<Text style={{color:'#53962E',fontFamily: FontName.Regular, fontSize:16, color:ThemeColor.BtnColor }}>REJECT</Text>
					</TouchableOpacity>
					<TouchableOpacity style={[styles.btnFill,{marginLeft:8}]} onPress={() => {updateProfileDetails()}}>
						<Text style={{color:'#53962E',fontFamily: FontName.Regular, fontSize:16, color:'#fff' }}>APPROVE</Text>
					</TouchableOpacity>
					
			  </View>
			}
	  	<Loader isLoading={isLoading} />
    	</SafeAreaView>	
	);
}

export default LeaveApprovalPending;

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
	  },btnFill:{
		flex: 1,
		height:50,
		justifyContent:"center",
		backgroundColor: ThemeColor.BtnColor ,
		alignItems:'center',
		borderRadius:5,

	  }
  });
