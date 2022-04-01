import React,{ useEffect,createRef } from "react";
import { 
	StyleSheet, 
    SafeAreaView,
    View,
    Text,
    FlatList,
    Alert,
    TextInput,
    TouchableOpacity,
    Dimensions
} from "react-native";
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'
import axios from 'axios'
import Feather from 'react-native-vector-icons/Feather';
import {default as ActionSheetView} from 'react-native-actions-sheet';
import DatePicker from 'react-native-date-picker'
import {Picker} from '@react-native-picker/picker';
import Ionicons from 'react-native-vector-icons/Ionicons';

import {getAuthHeader} from '../../../_helpers/auth-header';
import { BaseUrl, EndPoints, StaticMessage, ThemeColor, FontName } from '../../../_helpers/constants';
import { AuthContext } from '../../../Components/context';


const ViewClockInOutScreen = ({route,navigation}) => {
    const { signOut } = React.useContext(AuthContext);
    const { timesheetDetails } = route.params;
	const { projectDetail } = route.params;
    const { dayDetails } = route.params;
	const [mannualHoursArray, setMannualHoursArray] = React.useState([]);
	const [isLoading, setIsLoading] = React.useState(false);
	const [isListUpdated, setIsListUpdated] = React.useState(false);
	const [selectedIndex, setSelectedIndex] = React.useState(0);
    const [selectedHours, setSelectedHours] = React.useState({});
    const [startDate, setStartDate] = React.useState(new Date());
	const [endDate, setEndDate] = React.useState(new Date());

	React.useLayoutEffect(() => {
		navigation.setOptions({
			title: "Clock hours",
		});
	}, [navigation]);

	useEffect(() => {
        getClockInClockOut();	
	},[]);
    
    const addMoreRecord = () => {
		let editObj = {"clockHourDetailId": 0,
                    "duration": '',
                    "entryDate": dayDetails.day,
                    "hourType": 24162,
                    "inTime": "",
                    "notes": "",
                    "outTime": ""
                };
        setMannualHoursArray(mannualHoursArray => [...mannualHoursArray, editObj]);

		setIsListUpdated(!isListUpdated);

    }
    const getClockInClockOut = async() => {
		let user = await AsyncStorage.getItem('loginDetails');  
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken);
		
		setIsLoading(true);
		axios ({  
		  "method": "POST",
		  "url": BaseUrl + EndPoints.ClockInout,
		  "headers": getAuthHeader(authToken),
		  data:{"tsEntryDetailId":dayDetails.detailId},
		})
		.then((response) => {
		    setIsLoading(false);
            if (response.data.code == 200){
                setIsListUpdated(!isListUpdated);
                // console.log('Mannual Hours: ', JSON.stringify(response.data.content.dataList));
                setMannualHoursArray(response.data.content.dataList);
               
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
    const SessionExpiredAlert = () =>{
  
        Alert.alert(StaticMessage.AppName,StaticMessage.SessionExpired,
            [{
              text: 'Ok',
              onPress: () => signOut()
          }]
      ) 
    }	
    const getFormatedDate=(dateValue) =>{
		let momentStartDate = moment(dateValue, 'YYYY-MM-DD');
		let startDateString = moment(momentStartDate).format('dddd, MMMM DD, yyyy')
		return `${startDateString}`;
	}
    const getTotalHours = () => {
        let totalHours =  parseFloat(dayDetails.regHrs) + parseFloat(dayDetails.otHrs) + parseFloat(dayDetails.dtHrs);
        let total =  '' + totalHours;
        return total.length > 1 ? total : `${total}.00`
    }
	return(
		<SafeAreaView style={{flex:1}}>
            <View style={{flexDirection:'row',margin:16}}>
                <Text style={{fontSize:16, fontFamily:FontName.Bold, color:ThemeColor.TextColor, flex:1}}>{getFormatedDate(dayDetails.day)}</Text>
                <View style={{flexDirection:'row'}}>
                    <Text style={{fontSize:16, fontFamily:FontName.Regular, color:ThemeColor.SubTextColor}}>Total hours: </Text>
                    <Text style={{fontSize:16, fontFamily:FontName.Bold, color:ThemeColor.TextColor}}>{getTotalHours()}</Text>
                </View>
            </View>
            <View style ={{backgroundColor:'white', marginBottom:0}}>
                <View style ={{flexDirection:'row', marginBottom:1, justifyContent: 'center', alignItems: 'center', alignContent:'center'}}>
                    <View style={{height:30, width:80, flexDirection:'row',justifyContent: 'center',alignItems: 'center'}}>
                        <Text style={{color:ThemeColor.SubTextColor,fontSize:12, textAlign: 'center', flex: 1}}>IN</Text>
                        <View style={{backgroundColor:ThemeColor.BorderColor, height:30, width:1}}/>
                    </View>
                    <View style={{height:30, width:80, flexDirection:'row',justifyContent: 'center',alignItems: 'center'}}>
                        <Text style={{color:ThemeColor.SubTextColor,fontSize:12, textAlign: 'center', flex: 1}}>OUT</Text>
                        <View style={{backgroundColor:ThemeColor.BorderColor, height:30, width:1}}/>
                    </View>
                    <View style={{height:30, width:90, flexDirection:'row',justifyContent: 'center',alignItems: 'center', paddingRight:4}}>
                        <Text style={{color:ThemeColor.SubTextColor,fontSize:12, textAlign: 'center', flex: 1}}>TYPE</Text>
                        <View style={{backgroundColor:ThemeColor.BorderColor, height:30, width:1}}/>
                    </View>
                    <View style={{height:30, flex:1, flexDirection:'row',justifyContent: 'center',alignItems: 'center'}}>
                        <Text style={{color:ThemeColor.SubTextColor,fontSize:12, textAlign: 'left', flex: 1, paddingLeft:8}}>NOTES</Text>
                        <View style={{backgroundColor:ThemeColor.BorderColor, height:30, width:1}}/>
                    </View>
                </View>
                <View style={{backgroundColor:ThemeColor.BorderColor, height:1}}/> 
            </View>
            {mannualHoursArray.length > 0 ?
            <FlatList
                style={{flex: 1, marginBottom:8}}
                data={mannualHoursArray}
                keyExtractor={(item, index) => index.toString()}
                randomUpdateProp={isListUpdated}
                renderItem={({item, index}) => 
                <View>
                    <View style ={{flexDirection:'row', marginBottom:1, justifyContent: 'center', alignItems: 'center', alignContent:'center', backgroundColor:'white'}}>		
                        <View style={{height:30, width:80, flexDirection:'row',justifyContent: 'center',alignItems: 'center',backgroundColor:'white'}}>
                            <Text style={{color:item.inTime.length == 0 ? ThemeColor.PlaceHolderColor : ThemeColor.SubTextColor,fontSize:12, textAlign: 'center', flex: 1}}>{item.inTime.length == 0 ? '00:00' : item.inTime}</Text>
                            <View style={{backgroundColor:ThemeColor.BorderColor, height:30, width:1}}/>
						</View>
                        <View style={{height:30, width:80, flexDirection:'row',justifyContent: 'center',alignItems: 'center',backgroundColor:'white'}}>
                            <Text style={{color:item.outTime.length == 0 ? ThemeColor.PlaceHolderColor : ThemeColor.SubTextColor,fontSize:12, textAlign: 'center', flex: 1}}>{item.outTime.length == 0 ? '00:00' : item.outTime}</Text>
                            <View style={{backgroundColor:ThemeColor.BorderColor, height:30, width:1}}/>
						</View>

                        <View style={{height:30, width:90, flexDirection:'row',justifyContent: 'center',alignItems: 'center',backgroundColor:'white'}}>
                            <Text style={{color:ThemeColor.SubTextColor,fontSize:12, textAlign: 'center', flex: 1}}>{item.hourType == 24163 ? 'Meal Break' : "Regular Hours"}</Text>
                            <View style={{backgroundColor:ThemeColor.BorderColor, height:30, width:1}}/>
						</View>
                        <View style={{height:30, flex:1, flexDirection:'row',justifyContent: 'center',alignItems:'center',backgroundColor:'white'}}>
                            <Text style={{color:ThemeColor.SubTextColor,fontSize:12, textAlign: 'left', flex: 1, marginLeft:4}}>{item.notes}</Text>
                        </View>
                    </View>
                    <View style={{backgroundColor:ThemeColor.BorderColor, height:1}}/>
                </View>
            }/> :
            <View style={{flex:1, justifyContent:'center'}}>
                <Text style={{color:ThemeColor.TextColor,fontSize:16, textAlign: 'center', marginLeft:4}}>No clock hours found</Text>
            </View>
            }
            
		</SafeAreaView>
	);
}

export default ViewClockInOutScreen;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
    },inputView:{
        flexDirection:'row',
        paddingLeft:16,
        paddingRight:16,
        height:40,
        alignItems:"center", 
        backgroundColor:ThemeColor.BorderColor
    
      },
      bottomView:{
        flexDirection:'row',
        paddingLeft:16,
        paddingRight:16,
        height:40,
        backgroundColor:'#fff',
        alignItems:"center",
    
      },inputHour:{
		flex:1,
        height:30,
		color:ThemeColor.TextColor,
		fontSize:12,
		fontFamily: FontName.Regular,
		marginLeft:8,
		textAlign: 'center',
        backgroundColor:'white',

	},btnFill:{
		height:50,
		justifyContent:"center",
		backgroundColor: ThemeColor.BtnColor ,
		alignItems:'center',
	  }
  });