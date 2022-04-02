import React,{useEffect,createRef} from "react";
import { 
	Text, 
    TouchableOpacity,
    StyleSheet, 
    View,
	SafeAreaView,
	Alert,
	Platform,
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'
import axios from 'axios'
import Feather from 'react-native-vector-icons/Feather';
import ActionSheet from "react-native-actions-sheet";
import {Picker} from '@react-native-picker/picker';
import MovableView from 'react-native-movable-view';
import Icon from 'react-native-vector-icons/Ionicons';
import { AuthContext } from '../../Components/context';
import { BaseUrl, EndPoints, StaticMessage, ThemeColor ,FontName} from '../../_helpers/constants';
import {getAuthHeader} from '../../_helpers/auth-header';
import Loader from '../../Components/Loader';
import {parseErrorMessage} from '../../_helpers/Utils';

const yearRef = createRef();
const monthRef = createRef();

const PaymentStatusSCreen = ({route,navigation}) => {
	var months = new Array(12);
	months[0] = "January";
	months[1] = "February";
	months[2] = "March";
	months[3] = "April";
	months[4] = "May";
	months[5] = "June";
	months[6] = "July";
	months[7] = "August";
	months[8] = "September";
	months[9] = "October";
	months[10] = "November";
	months[11] = "December";
	const [data,setData] = React.useState({
		year:new Date().getFullYear().toString(),
		month:months[new Date().getMonth()],
		monthId:new Date().getMonth()
	});
	let [payrollStatusArray, setPayrollStatus] = React.useState([]);
	const [isLoading,setIsLoading] = React.useState(false);
	const { signOut } = React.useContext(AuthContext);


	React.useLayoutEffect(() => {
		navigation.setOptions({
			  title: `Payroll Status`,
		});
	}, [navigation]);
	const showShareOptions = () =>{

	}
	useEffect(() => {
		getPayrollStatusDetails();
		
	},[])

	const  getPayrollStatusDetails = async() => {
		let user = await AsyncStorage.getItem('loginDetails');  
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken);
		console.log('API Call :' + BaseUrl + EndPoints.PayrollStatusList);
		setIsLoading(true);
		axios ({  
		  "method": "POST",
		  "url": BaseUrl + EndPoints.PayrollStatusList,
		  "headers": getAuthHeader(authToken),
		  data:{"year": ''+data.year,"month": ''+ ''+data.monthId}
		})
		.then((response) => {
			setIsLoading(false);
			if (response.data.code == 200){
				const results = JSON.stringify(response.data.content)
				console.log('Payroll Status: ' + results);
				setPayrollStatus(response.data.content.dataList);
			}else if (response.data.code == 417){
				const message = parseErrorMessage(response.data.content.messageList);
				Alert.alert(StaticMessage.AppName, message, [
					{text: 'Ok'}
				]);
		
			}else{
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
	const SessionExpiredAlert = () =>{
		Alert.alert(StaticMessage.AppName,StaticMessage.SessionExpired,
			[{
			  text: 'Ok',
			  onPress: () => signOut()
		  }]
	  )}
	let year = new Date().getFullYear();
	var yearArr =[];
	for( ; year > 1960; year--) {
		yearArr.push(String(year));
	}
	let monthArray = ["January","February","March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]; 

	return(
		<SafeAreaView style={styles.container}>
			{Platform.OS == 'ios' ?
			<>
				<View style={{marginTop:16	,flexDirection:'row',marginLeft:16, marginRight:16}}>
					<View style={{flex:1, height:50, marginRight:8}}>
						<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Year</Text>
						<TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}} onPress={() => {yearRef.current?.setModalVisible()}}>
							<Text style={[styles.labelText,{color:data.year.length > 0 ? 'black' : ThemeColor.PlaceHolderColor}]}>{data.year.length >0 ? data.year : 'Select year'}</Text>
							<Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22,22} />
						</TouchableOpacity>
					</View>
					<View style={{flex:1, height:50,marginLeft:8}}>
						<Text style ={{color:ThemeColor.SubTextColor,fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Month</Text>
						<TouchableOpacity style={{backgroundColor:'white',borderRadius:5, height:40, flexDirection:'row', alignItems:'center', paddingRight:8}} onPress={() => {monthRef.current?.setModalVisible()}}>
							<Text style={[styles.labelText,{color:data.month.length > 0 ? 'black' : ThemeColor.PlaceHolderColor}]}>{data.month.length >0 ? data.month : 'Select month'}</Text>
							<Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22,22} />
						</TouchableOpacity>
					</View>
				</View>
			</> :
			<>
				<View style={{marginTop:16	,flexDirection:'row',marginLeft:16, marginRight:16}}>
					<View style={{flex:1, height:50, marginRight:8}}>
						<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Year</Text>
						<TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center'}}>
							<Picker
								style={{flex:1,}}
								itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
								selectedValue={data.year}
								onValueChange={(itemValue, index) =>{
									setData({...data,year:itemValue});
									getPayrollStatusDetails();
								}}>
								{yearArr && yearArr.map((item, index) => {
									return (<Picker.Item label={item} value={item} key={index}/>) 
								})}
							</Picker>							
						</TouchableOpacity>
					</View>
					<View style={{flex:1, height:50,marginLeft:8}}>
						<Text style ={{color:ThemeColor.SubTextColor,fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Month</Text>
						<TouchableOpacity style={{backgroundColor:'white',borderRadius:5, height:40, flexDirection:'row', alignItems:'center'}}>
							<Picker
								style={{flex:1,}}
								itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
								selectedValue={data.month}
								onValueChange={(itemValue, index) =>{
									setData({...data,month:itemValue,monthId:index});
									getPayrollStatusDetails();
								}}>
								{monthArray && monthArray.map((item, index) => {
									return (<Picker.Item label={item} value={item} key={index}/>) 
								})}
							</Picker>
						</TouchableOpacity>
					</View>
				</View>
			</>
			}

			{
				payrollStatusArray.length > 0 ?
				<View>

				</View> :
				<View style={{flex:1, padding:16, justifyContent:'center', alignContent:'center'}}>
					<Text style ={{color:ThemeColor.TextColor, fontSize:16, fontFamily:FontName.Regular, textAlign:'center'}}>No payment status available</Text>
				</View>
			}
			<Loader isLoading={isLoading} />
			<ActionSheet ref={yearRef} containerStyle={{backgroundColor:ThemeColor.ViewBgColor}}>
				<View style={{height:300}}>
					<View style={{height:60, flexDirection:'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft:16,paddingRight:16}}>
					<TouchableOpacity onPress={() => {yearRef.current?.setModalVisible()}}>
						<Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Cancel</Text>
					</TouchableOpacity>
					<Text style={{color:ThemeColor.TextColor, fontSize:16, fontFamily: 'Lato-Bold'}}>Select year</Text>
					<TouchableOpacity onPress={() => {
						{
							data.year == 0 && setData({...data,year:yearArr[0]})}
							yearRef.current?.setModalVisible()
							getPayrollStatusDetails()

						}
							
						}>
						<Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Done</Text>
					</TouchableOpacity>
					</View>
					<Picker
						style={{backgroundColor: 'white',flex:1,}}
						itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
						selectedValue={data.year}
						onValueChange={(itemValue, index) =>{
							setData({...data,year:itemValue});
							getPayrollStatusDetails();
						}}>
						{yearArr && yearArr.map((item, index) => {
							return (<Picker.Item label={item} value={item} key={index}/>) 
						})}
					</Picker>
				</View>
			</ActionSheet>
			<ActionSheet ref={monthRef} containerStyle={{backgroundColor:ThemeColor.ViewBgColor}}>
				<View style={{height:300}}>
					<View style={{height:60, flexDirection:'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft:16,paddingRight:16}}>
					<TouchableOpacity onPress={() => {monthRef.current?.setModalVisible()}}>
						<Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Cancel</Text>
					</TouchableOpacity>
					<Text style={{color:ThemeColor.TextColor, fontSize:16, fontFamily: 'Lato-Bold'}}>Select month</Text>
					<TouchableOpacity onPress={() => {
						{data.month == 0 && setData({...data,month:monthArray[0],monthId:0})}
						monthRef.current?.setModalVisible()}
						
						}>
						<Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Done</Text>
					</TouchableOpacity>
					</View>
					<Picker
						style={{backgroundColor: 'white',flex:1,}}
						itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
						selectedValue={data.month}
						onValueChange={(itemValue, index) =>{
							setData({...data,month:itemValue,monthId:index});
							getPayrollStatusDetails();
						}}>
						{monthArray && monthArray.map((item, index) => {
							return (<Picker.Item label={item} value={item} key={index}/>) 
						})}
					</Picker>
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

export default PaymentStatusSCreen;

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
	}
  });