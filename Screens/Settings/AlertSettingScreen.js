import React ,{useEffect,createRef}from 'react';
import { View ,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    Alert,
	SafeAreaView,
	Switch,
	Dimensions,
    Text,
	Platform} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'
import axios from 'axios'
import {Picker} from '@react-native-picker/picker';
import DatePicker from 'react-native-date-picker'
import ActionSheet from "react-native-actions-sheet";
import moment from 'moment';
import MovableView from 'react-native-movable-view';
import Icon from 'react-native-vector-icons/Ionicons';
import {getAuthHeader} from '../../_helpers/auth-header';
import { BaseUrl, EndPoints, StaticMessage, ThemeColor, FontName } from '../../_helpers/constants';
import Loader from '../../Components/Loader';
import { AuthContext } from '../../Components/context';

const alertTypeRef = createRef();
const dateRef = createRef();


const AlertSettingScreen = ({navigation})  => {
	const [isLoading, setIsLoading] = React.useState(false);
	const [settingDetails, setSettingDetails] = React.useState([]);
	const [lookupData, setLookupData] = React.useState({
		alertTypes:[],
		alertFrequency:[],
		reimbursementType:[],
		subReimbursementType:[],
		messageTypes:[]
	});
	const [selectedFrequencyId, setSelectedFrequencyId] = React.useState(0);
	const [selectedDateObj,setSelectedDateObj] = React.useState({})
	const [startDate, setStartDate] = React.useState(new Date());
	const { signOut } = React.useContext(AuthContext);

	React.useLayoutEffect(() => {
		navigation.setOptions({
		  title: "Alert settings",
		});
	}, [navigation]);
	
	useEffect(() => {
		getSettingLookup();
		getSettingDetails();
		
	}, []);

	const  getSettingLookup = async() => {

		let user = await AsyncStorage.getItem('loginDetails');  
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken);

		setIsLoading(true);
		axios ({  
		  "method": "GET",
		  "url": BaseUrl + EndPoints.AlertSettingLookup,
		  "headers": getAuthHeader(authToken)
		})
		.then((response) => {
		  setIsLoading(false);
		  console.log(`Lookup: ${JSON.stringify(response.data.content)}`);

			if (response.data.code == 200){
				const results = JSON.stringify(response.data.content.dataList[0])
				console.log(`Lookup: ${results}`);
				setLookupData(response.data.content.dataList[0]);
			}else if (response.data.code == 417){
				console.log(Object.values(response.data.content.messageList));
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
		  if(error.response.status == 401){
            SessionExpiredAlert();
			}else{
				Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
					{text: 'Ok'}
				]);
			}
	
		})
	
	}
	const SessionExpiredAlert = () =>{
		Alert.alert(StaticMessage.AppName,StaticMessage.SessionExpired,
			[{
			  text: 'Ok',
			  onPress: () => signOut()
		  }]
	)}
	const  getSettingDetails = async() => {

		let user = await AsyncStorage.getItem('loginDetails');  
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken);

		setIsLoading(true);
		axios ({  
		  "method": "GET",
		  "url": BaseUrl + EndPoints.AlertSetting,
		  "headers": getAuthHeader(authToken)
		})
		.then((response) => {
		  setIsLoading(false);
		  if (response.data.code == 200){
			const results = JSON.stringify(response.data.content.dataList)
			console.log(`Settings: ${results}`);
			setSettingDetails(response.data.content.dataList);
			// setFrequency();
		  }else if (response.data.code == 417){
			console.log(Object.values(response.data.content.messageList));
			const errorList = Object.values(response.data.content.messageList);
			Alert.alert(StaticMessage.AppName, errorList.join(), [
			  {text: 'Ok'}
			]);
	
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
	const handleFrequencySelect = (item,index) => {
		console.log('Frequency:',item);
		setSelectedFrequencyId(item);
		updateSettingDetails('8009','1','', '' + item); 
	}
	const toggleSwitch = (item) => {
		console.log('Switch:', item);
		let result = settingDetails.find(x => x.alertTypeId === item.id);
		console.log(result);
		if(result){
			let status =  result.alertStatus === 1 ? 0 : 1;
			updateSettingDetails('' + item.id, status,'', '');
		}else{
			updateSettingDetails('' + item.id, 0,'', '');
		}
		 
	}
	const handleSwitchOfForever = (item) => {
		updateSettingDetails('' + item.id,'0','', ''); 
	}
	const handleSwitchTillDate = () => {
		let startDateString = moment(startDate).format('YYYY-MM-DD');

		updateSettingDetails('' + selectedDateObj.id,'0',startDateString, ''); 
	}
	const  updateSettingDetails = async(alertTypeId,alertStatus,alertDate,alertFrequency) => {

		let user = await AsyncStorage.getItem('loginDetails');  
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken);

		let params = {
			'alertTypeId': alertTypeId,
			'alertStatus': alertStatus,
			'dateTo':alertDate,
			'alertFrequencyId': alertFrequency.length > 0 ? alertFrequency : '',
		};
		console.log('params:', JSON.stringify(params));

		setIsLoading(true);
		axios ({  
		  "method": "POST",
		  "url": BaseUrl + EndPoints.AlertSetting,
		  "headers": getAuthHeader(authToken),
		  data:params
		})
		.then((response) => {
		  setIsLoading(false);
		  if (response.data.code == 200){
			const results = JSON.stringify(response.data.content)
			console.log(`Update: ${results}`);
			getSettingDetails();
		  }else if (response.data.code == 417){
			console.log(Object.values(response.data.content.messageList));
			const errorList = Object.values(response.data.content.messageList);
			Alert.alert(StaticMessage.AppName, errorList.join(), [
			  {text: 'Ok'}
			]);
	
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
	
	const handleDate1Change = (val) => {
		setStartDate(val);
		let startDateString = moment(val).format('YYYY-MM-DD');
		console.log('Date: ', startDateString);
		setSelectedDateObj({...selectedDateObj,dateTo:startDateString});
	}
	
	const setFrequency = () => {
		let result = settingDetails.find(x => x.alertTypeId === 8009);
		if(result){
			setSelectedFrequencyId(result.alertFrequencyId);
		}
	}
	const getFrequency = (item) => {
		let result = settingDetails.find(x => x.alertTypeId === item.id);
		if(result){
			return result.alertFrequency;
		}
		return 'Daily';
	}
	
	const getSwitchStatus = (item) => {
		let result = settingDetails.find(x => x.alertTypeId === item.id);
		if(result){
			return result.alertStatus == 1 ? true : false;
		}
		return true;
	}
	const getIsOffForever = (item) => {
		let result = settingDetails.find(x => x.alertTypeId === item.id);
		if(result){
			return result.dateTo.length > 0 ? false : true;
		}
		return true;
	}
	const getSwitchOffDate = (item) => {
		let result = settingDetails.find(x => x.alertTypeId === item.id);
		if(result){
			if(result.dateTo.length > 0){
				let momentStartDate = moment(result.dateTo, 'YYYY-MM-DDTHH:mm:ssZZ');
				let startDateString = moment(momentStartDate).format('MMM DD, YYYY')
				return `${startDateString}`;
			}else{
				return '';
			}
		}
		return '';
	}
	
	const showDatePicker = (item) => {
		setSelectedDateObj(item);
		let result = settingDetails.find(x => x.alertTypeId === item.id);
		if(result.dateTo.length > 0){
			setStartDate(new Date(result.dateTo));
		}else{
			setStartDate(new Date());
		}
		dateRef.current?.setModalVisible();
	}
	

	let alertTypeArray = lookupData.alertTypes.length > 0 ? lookupData.alertTypes : []
	let alertFrequencyArray = lookupData.alertFrequency.length > 0 ? lookupData.alertFrequency : []

	return(
		<SafeAreaView style={styles.container}>			
			<FlatList style={{}}
				data={alertTypeArray}
				keyExtractor={(item,index) => index.toString()}
				renderItem={({item, index}) => 
					<View style={{backgroundColor:'white',marginBottom:8}}>
						<View style={{flexDirection:'row',paddingLeft:16, paddingRight:8,paddingTop:8, paddingBottom:8}}>
							<View style={{flex: 1}} >
								<Text style={{fontSize:16, color:ThemeColor.TextColor,fontFamily: FontName.Regular}}>{item.name}</Text>
								<Text style={{flex:1, fontSize:12, color:ThemeColor.SubTextColor,fontFamily: FontName.Regular,marginTop:2}}>{item.description}</Text>
							</View>
							<View style={{alignItems:'center', justifyContent: 'center', marginLeft:8}}>
								<Switch
									trackColor={{ false: ThemeColor.SwitchInactiveColor, true:ThemeColor.BtnColor }}
									ios_backgroundColor = {ThemeColor.SwitchInactiveColor}
									thumbColor={getSwitchStatus(item) ? "#FFF" : "#f4f3f4"}
									onValueChange={() => toggleSwitch(item)}
									value={getSwitchStatus(item)}
								/>   
							</View>
						</View>
						{getSwitchStatus(item) == true && (item.id === 8008 || item.id === 8009) ?
							Platform.OS == 'ios' ? 
							<View style={{backgroundColor:'#fff',}}>
								<View style={{height:1, backgroundColor:ThemeColor.BorderColor}}/>
								<TouchableOpacity style={{paddingLeft:24, flexDirection:'row', paddingRight:16, alignItems: 'center'}} onPress={() => {alertTypeRef.current?.setModalVisible()}}>
									<Text style={{flex:1, fontSize:14, color:ThemeColor.TextColor,fontFamily: FontName.Regular, paddingTop:12, paddingBottom:12}}>{getFrequency(item)}</Text>
									<Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22,22} />
								</TouchableOpacity>
							</View> :
							<View style={{backgroundColor:'#fff',}}>
								<View style={{height:1, backgroundColor:ThemeColor.BorderColor}}/>
								<View style={{paddingLeft:24, flexDirection:'row', paddingRight:16, alignItems: 'center'}}>
									<Picker
										style={{backgroundColor: 'white',flex:1,}} 
										itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
										selectedValue={selectedFrequencyId}
										onValueChange={(itemValue, index) => handleFrequencySelect(itemValue,index)}>
										{alertFrequencyArray && alertFrequencyArray.map((item, index) => {
											return (<Picker.Item label={item.name} value={item.id} key={index}/>) 
										})}
									</Picker>
									<Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22,22} />
								</View>
							</View> 
							: null
						}
						
						{getSwitchStatus(item) == false ?
						<View style={{backgroundColor:'#fff',}}>
							<View style={{height:1, backgroundColor:ThemeColor.BorderColor}}/>
							<TouchableOpacity style={{paddingLeft:24, flexDirection:'row', paddingRight:16, alignItems: 'center'}} onPress={() => {handleSwitchOfForever(item)}}>
								<Text style={{flex:1, fontSize:14, color:ThemeColor.TextColor,fontFamily: FontName.Regular, paddingTop:12, paddingBottom:12}}>Switch off forever</Text> 
								{getIsOffForever(item)  && <Feather name="check" color={ThemeColor.NavColor} size={22,22} />}
							</TouchableOpacity>
							<View style={{height:1, backgroundColor:ThemeColor.BorderColor, marginLeft:24}}/>
							<TouchableOpacity style={{paddingLeft:24, flexDirection:'row', paddingRight:16, alignItems: 'center'}} onPress={() => {showDatePicker(item)}}>
								<Text style={{flex:1, fontSize:14, color:ThemeColor.TextColor,fontFamily: FontName.Regular, paddingTop:8, paddingBottom:8}}>Switch off till a date</Text>
								<TouchableOpacity style={{paddingLeft:24, flexDirection:'row', alignItems: 'center'}} onPress={() => {showDatePicker(item)}}>
									<Text style={{fontSize:14, color: getIsOffForever(item) ? ThemeColor.PlaceHolderColor : ThemeColor.TextColor,fontFamily: FontName.Regular, paddingTop:12, paddingBottom:12}}>{getSwitchOffDate(item).length > 0 ? getSwitchOffDate(item) : 'Select date'}</Text>
							</TouchableOpacity>
							</TouchableOpacity>
						</View> : null
						}
						
					</View>
				}
			/>
			<Loader isLoading={isLoading} />
			<ActionSheet ref={alertTypeRef} containerStyle={{backgroundColor:ThemeColor.ViewBgColor}}>
				<View style={{height:300}}>
					<View style={{height:60, flexDirection:'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft:16,paddingRight:16,}}>
						<TouchableOpacity onPress={() => {alertTypeRef.current?.setModalVisible()}}>
							<Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Cancel</Text>
						</TouchableOpacity>
						<Text style={{color:ThemeColor.TextColor, fontSize:16, fontFamily: FontName.Bold, flex:1, textAlign:'center', marginLeft:8, marginRight:8}}>Select frequency</Text>
						<TouchableOpacity onPress={() => {alertTypeRef.current?.setModalVisible()}}>
							<Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Done</Text>
						</TouchableOpacity>
					</View>
					<Picker
						style={{backgroundColor: 'white',flex:1,}} 
						itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
						selectedValue={selectedFrequencyId}
						onValueChange={(itemValue, index) => handleFrequencySelect(itemValue,index)}>
						{alertFrequencyArray && alertFrequencyArray.map((item, index) => {
							return (<Picker.Item label={item.name} value={item.id} key={index}/>) 
						})}
					</Picker>
				</View>
			</ActionSheet>
			<ActionSheet ref={dateRef} containerStyle={{backgroundColor:ThemeColor.ViewBgColor}}>
				<View style={{height:300}}>
				<View style={{height:44, flexDirection:'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft:16,paddingRight:16}}>
					<TouchableOpacity onPress={() => {dateRef.current?.setModalVisible()}}>
					<Text style={{color:ThemeColor.BtnColor, fontSize:14, fontFamily: FontName.Regular}}>Cancel</Text>
					</TouchableOpacity>
					<Text style={{color:ThemeColor.TextColor, fontSize:16, fontFamily: FontName.Bold, flex:1, textAlign:'center', marginLeft:8, marginRight:8}}>{selectedDateObj.name}</Text>

					<TouchableOpacity onPress={() => {
						handleSwitchTillDate();
						dateRef.current?.setModalVisible()
					}}>
					<Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Done</Text>
					</TouchableOpacity>
				</View>
				<DatePicker
					style={{backgroundColor: 'white',flex:1,width:Dimensions.get('window').width}}
					mode={'date'}
					minimumDate={new Date()}
					date={startDate}
					onDateChange={(val) => {handleDate1Change(val)}}
				/>
				</View>
			</ActionSheet>
			<MovableView>
				<TouchableOpacity style={{
					position: 'absolute',
					margin: 16,
					right: 0,
					bottom:50,
					backgroundColor:ThemeColor.BtnColor,
					height:50, 
					width:50,
					borderRadius:25,
					justifyContent: 'center',
					alignItems: 'center'}} onPress={() => navigation.navigate('ChatBot')}>
					<Icon name="chatbubble-ellipses-outline" color={'white'} size={25} />
				</TouchableOpacity>
			</MovableView>
			
		</SafeAreaView>
	);
}

export default AlertSettingScreen;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:ThemeColor.ViewBgColor,
	  
    }
  });
