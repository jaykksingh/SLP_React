import React ,{useEffect}from 'react';
import { View ,
    TouchableOpacity,
    StyleSheet,
    Alert,
    FlatList,
    SafeAreaView,
    Text} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'
import axios from 'axios'
import moment from 'moment';
import { LeaveMgrBaseURL, EndPoints, StaticMessage, ThemeColor, FontName } from '../../_helpers/constants';
import Loader from '../../Components/Loader';



const MyregularizationScreen = ({route,navigation})  => {

	const [isLoading, setIsLoading] = React.useState(false);
	const [regularizationArray, setRegularizationArray] = React.useState([]);
	const [filterKey, setFilterKey] = React.useState('Pending');

  	const [data,setData] = React.useState({
		project:'',
		listUpdated:false
	});

  	useEffect(() => {
		navigation.addListener('focus', () => {
			console.log(filterKey);
			setData({...data,listUpdated:!data.listUpdated})
			getRegularizationList(filterKey);		
		});

	},[]);

	const  getRegularizationList = async(filterKey) => {
		let user = await AsyncStorage.getItem('loginDetails');  
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken);
		let employeeDetailsId = parsed.employeeDetailsId;
	
		setIsLoading(true);
		var filterKeyId = '';
		switch (filterKey){
			case 'Pending':
				filterKeyId = '37131';
				break;
			case 'Approved':
				filterKeyId = '37132';
				break;
			case 'Rejected':
				filterKeyId = '37133';
				break;
			case 'Pullback':
				filterKeyId = '37134';
				break;
			case 'Cancelled':
				filterKeyId = '37135';
				break;
			default:
				filterKeyId = '37131';
				break;

		}
		console.log('filterKeyId',filterKeyId)
		let params = {
			"EmployeeDetailsId": '' + employeeDetailsId,
			'LoggedInEmployeeDetailsId':'' + employeeDetailsId,
			'ARStatusId':filterKeyId,
			'PageIndex':1,
			'PageSize':100,
			'SortColumn':'',
			'SortDirection':''
		}
		console.log('params: ',params);
		
		axios ({  
		  "method": "POST",
		  "url": LeaveMgrBaseURL + EndPoints.Myregularization,
		  "headers": {'Authorization':'qwerty~!@','Content-Type':'application/json'},
		  data:params
		})
		.then((response) => {
      		setIsLoading(false);
		  	if (response.data.header == 200){
				  console.log("Regularizations: ", JSON.stringify(response.data.content.data));
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
  	const getStatusFromIds= (item) => {
		let key = item.AR_Status;
		let IsCancelRequest = item.IsCancelRequest;
		// if(IsCancelRequest){
		// 	return "Pending";
		// }
		// if(item.Cancel_On){
		// 	return "Cancelled"
		// }
		// else if(item.Cancel_PullBack_Date){
		// 	return "Pullback"
		// }
		switch (key) {
			case 'Pending':
				return "Pending";
			case 'Approved':
				return "Approved";
			case 'Reject':
				return "Rejected";
			case 'PullBack':
				return "Pullback";
			case 'Cancel':
				return "Cancel";
			default:
				break;
		}
		return "Pending";
	}
	const getDateRange = () => {

	}
	const didSelectFilterKey = (key) => {
		setFilterKey(key);
		getRegularizationList(key);
	}

  	return(
		<SafeAreaView style={styles.container}>
			<View style={{flexDirection:'row',alignItems: 'center', padding:8, height:60}}>
				<FlatList
					horizontal
					data={['Pending','Approved','Rejected','Pullback','Cancelled']}
					keyExtractor={(item, index) => index.toString()}
					randomUpdateProp={data.listUpdated}
					renderItem={({item}) => 
						<TouchableOpacity  style={[styles.item, {backgroundColor:item == filterKey ? ThemeColor.BtnColor : 'white'}]} onPress={() =>{didSelectFilterKey(item)}}>
							<Text style={[styles.title,{color: item == filterKey ? 'white' : ThemeColor.TextColor}]}>{item}</Text>
						</TouchableOpacity>
					}
				/>
          	</View>
			{regularizationArray.length > 0 ? 
			<FlatList
				data={regularizationArray}
				keyExtractor={(item, index) => index.toString()}
				renderItem={({item}) => 
					<TouchableOpacity style={{backgroundColor:'#fff',marginBottom:8, paddingBottom:8,paddingTop:8, flexDirection: 'row', justifyContent:'center', alignItems: 'center'}} onPress={() => navigation.navigate('RegularizationDetail',{leaveDetails:item,isMyAttendance:true})}>
						<View style={{flex:1}}>
							<View style={{paddingLeft:12,flexDirection: 'row', justifyContent: 'space-between'}}> 
								<View style={{backgroundColor:ThemeColor.SubHeaderColor, borderRadius:5,padding:4,paddingBottom:4}}>
									<Text style={{paddingLeft:8,paddingRight:8, borderRadius:5, fontSize:12, fontFamily: FontName.Regular}}>{item.Category_Desc}</Text>
								</View>
								
								<View style={{flexDirection:'row'}}>
									<View style={{backgroundColor:ThemeColor.SubHeaderColor, borderRadius:5}}>
										<Text style={{padding:4, paddingLeft:8,paddingRight:8,borderRadius:5,fontSize:12, fontFamily: FontName.Regular, color: item.IsCancelRequest ? ThemeColor.RedColor : item.AR_Status === 'Approved' ? ThemeColor.GreenColor : ThemeColor.RedColor}}>{getStatusFromIds(item)}</Text>
									</View>
								</View>
							</View>
							<Text style={{marginLeft:16,marginRight:16, fontSize:16, fontFamily: FontName.Regular, marginTop:8, color:ThemeColor.TextColor}}>{`${item.EmployeeName} (${item.CompanyEmployeeId})`}</Text>
							<View style={{paddingLeft:16, paddingRight:16, marginTop:4, flexDirection: 'row'}}> 
								<Text style={{fontSize:14, fontFamily: FontName.Regular, color:ThemeColor.SubTextColor}}>From: </Text>
								<Text style={{fontSize:14, fontFamily: FontName.Regular, color:ThemeColor.TextColor}}>{item.From_Date} to {item.To_Date}</Text>
							</View>
							{item.IsCancelRequest && item.AR_Status != 'Cancel' ? 
								<View style={{marginTop:4}}>
									<Text style={{fontSize:14, fontFamily: FontName.Regular, color:ThemeColor.SubTextColor, textAlign:'right'}}>Cancellation Raised</Text>
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
			<TouchableOpacity style={styles.btnFill} onPress={() => {navigation.navigate('AddRegularization')}}>
				<Text style={{color:'#53962E',fontFamily: FontName.Regular, fontSize:16, color:'#fff' }}>ADD NEW REQUEST</Text>
			</TouchableOpacity>
	  	<Loader isLoading={isLoading} />
    	</SafeAreaView>	
	);
}

export default MyregularizationScreen;

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
