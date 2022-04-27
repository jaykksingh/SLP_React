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
    Dimensions,
    Platform
} from "react-native";
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'
import axios from 'axios'
import Feather from 'react-native-vector-icons/Feather';
import Ionic from 'react-native-vector-icons/Ionicons';
import {default as ActionSheetView} from 'react-native-actions-sheet';
import DatePicker from 'react-native-date-picker'
import {Picker} from '@react-native-picker/picker';
import Ionicons from 'react-native-vector-icons/Ionicons';

import {getAuthHeader} from '../../../_helpers/auth-header';
import { BaseUrl, EndPoints, StaticMessage, ThemeColor, FontName } from '../../../_helpers/constants';
import { AuthContext } from '../../../Components/context';

const clockInTypeRef = createRef();
const clockOutTypeRef = createRef();
const breakTypeRef = createRef();


const CheckInOutScreen = ({route,navigation}) => {
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
            headerRight: () => (
                <TouchableOpacity style={{marginRight:16, flexDirection:'row', alignItems:'center'}} onPress = {() => {addMoreRecord()}}>
                    <Ionicons name="add-circle-outline" color={'white'} size={16} />
                    <Text style={{color:'white',fontSize:16, marginLeft:4}}>ADD MORE</Text>
                </TouchableOpacity>
              ),
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
                if(response.data.content.dataList.length == 0){
                    addMoreRecord();
                }
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
    const showClockInPicker = (item, index) => {
		console.log('Clock In: ',item);
        if(item.inTime > 0){
            let momentStartDate = moment(item.inTime, 'HH:mm');        
            if(momentStartDate){
                setStartDate(new Date(momentStartDate.format("YYYY-MM-DDTHH:mm:ssZ")));
            }
        }
       
		setSelectedHours(item);
		setSelectedIndex(index);
		clockInTypeRef.current?.setModalVisible()
	}
    const showClockOutPicker = (item, index) => {
		console.log(item);
        if(item.outTime > 0){
            let momentEndDate = moment(item.outTime, 'HH:mm');        
            if(momentEndDate){
                setEndDate(new Date(momentEndDate.format("YYYY-MM-DDTHH:mm:ssZ")));
            }
        }
       
		setSelectedHours(item);
		setSelectedIndex(index);
		clockOutTypeRef.current?.setModalVisible()
	}
    const showBreakTypePicker = (item, index) => {
		console.log(item);
		setSelectedHours(item);
		setSelectedIndex(index);
		breakTypeRef.current?.setModalVisible()
	}
	const handleNoteChange=(val, index, hrObject) => {
		console.log(val);
		let tempArr = mannualHoursArray;
		let editObj = hrObject;
		editObj.notes = val;
		tempArr[index] = editObj;
		setMannualHoursArray(tempArr);
		setIsListUpdated(!isListUpdated);

	}
    const handleClockInTimeChange = (val) =>{
		console.log("Start Date:",val.toString());
		setStartDate(val);
		let showDate = moment(val).format('HH:mm')
        let tempArr = mannualHoursArray;
		let editObj = selectedHours;
		editObj.inTime = showDate;
		tempArr[selectedIndex] = editObj;
		setMannualHoursArray(tempArr);
		setIsListUpdated(!isListUpdated);


	}
    const handleClockOutTimeChange = (val) =>{
		console.log("Start Date:",val.toString());
		setEndDate(val);
		let showDate = moment(val).format('HH:mm')
        let tempArr = mannualHoursArray;
		let editObj = selectedHours;
		editObj.outTime = showDate;
		tempArr[selectedIndex] = editObj;
		setMannualHoursArray(tempArr);
		setIsListUpdated(!isListUpdated);
	}
    const updateClockInClockOut = async() => {
		let user = await AsyncStorage.getItem('loginDetails');  
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken);
		
		console.log('Client Approved Params:',JSON.stringify(dayDetails));
        var params = {
			'forDate':dayDetails.day,
			'tsEntryDetailId':dayDetails.detailId,
			'hours':mannualHoursArray,
		};
		

		setIsLoading(true);
		axios ({  
		  "method": "POST",
		  "url": BaseUrl + EndPoints.UpdateClockInOut,
		  "headers": getAuthHeader(authToken),
		  data:params,
		})
		.then((response) => {
		    setIsLoading(false);
            if (response.data.code == 200){
                const message = response.data.content.messageList.success;
                Alert.alert(StaticMessage.AppName, message, [
                    {text: 'Ok',
                    onPress:() => {
                        navigation.goBack()
                        route.params.onClickEvent();
                    }}
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
    const handledelteClockInClockOut = async(item, index) => {
        console.log('Delete Record:', item, index);
        if(item.clockHourDetailId > 0){
            delteClockInClockOutRecord(item.clockHourDetailId);
        }else{
            let tempArr =  mannualHoursArray;
            tempArr.splice(index,1);
            setMannualHoursArray(tempArr);
		    setIsListUpdated(!isListUpdated);
        }
    }

    const delteClockInClockOutRecord = async(itemID, index) => {
		let user = await AsyncStorage.getItem('loginDetails');  
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken);
		
		console.log('Client Approved Params:',JSON.stringify(dayDetails));
        var params = {
			'forDate':dayDetails.day,
			'tsEntryDetailId':dayDetails.detailId,
			'hours':mannualHoursArray,
		};
		

		setIsLoading(true);
		axios ({  
		  "method": "DELETE",
		  "url": BaseUrl + EndPoints.DeleteClockInOut,
		  "headers": getAuthHeader(authToken),
		  data:{itemId:itemID},
		})
		.then((response) => {
		    setIsLoading(false);
            if (response.data.code == 200){
                const message = response.data.content.messageList.success;
                route.params.onClickEvent();
                getClockInClockOut();
               
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



    
    let breakTypeArr =  [{value:"Meal break", keyId:24163}, {value:"Regular Hours", keyId:24162}]

	return(
		<SafeAreaView style={{flex:1}}>
            <View style={{flexDirection:'row',margin:16}}>
                <Text style={{fontSize:16, fontFamily:FontName.Bold, color:ThemeColor.TextColor, fontWeight: "bold",flex:1}}>{getFormatedDate(dayDetails.day)}</Text>
                <View style={{flexDirection:'row'}}>
                    <Text style={{fontSize:16, fontFamily:FontName.Regular, color:ThemeColor.SubTextColor}}>Total hours: </Text>
                    <Text style={{fontSize:16, fontFamily:FontName.Bold, fontWeight:'bold', color:ThemeColor.TextColor}}>{getTotalHours()}</Text>
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
            <FlatList
                style={{flex: 1, marginBottom:8}}
                data={mannualHoursArray}
                keyExtractor={(item, index) => index.toString()}
                randomUpdateProp={isListUpdated}
                renderItem={({item, index}) => 
                <View>
                    <View style ={{flexDirection:'row', marginBottom:1, justifyContent: 'center', alignItems: 'center', alignContent:'center', backgroundColor:'white'}}>		
                        <View style={{height:30, width:80, flexDirection:'row',justifyContent: 'center',alignItems: 'center',backgroundColor:'white'}}>
                            <TouchableOpacity style={{height:30, width:80, flexDirection:'row',justifyContent: 'center',alignItems: 'center',paddingRight:4}} onPress ={() => {showClockInPicker(item, index)}}>
                                <Text style={{color:item.inTime ? ThemeColor.TextColor : ThemeColor.PlaceHolderColor,fontSize:12, textAlign: 'center', flex: 1}}>{item.inTime ? item.inTime : '00:00' }</Text>
                                <Feather name="chevron-down" color={ThemeColor.TextColor} size={10} />
                            </TouchableOpacity>
                            <View style={{backgroundColor:ThemeColor.BorderColor, height:30, width:1}}/>
						</View>
                        <View style={{height:30, width:80, flexDirection:'row',justifyContent: 'center',alignItems: 'center',backgroundColor:'white'}}>
                            <TouchableOpacity style={{height:30, width:80, flexDirection:'row',justifyContent: 'center',alignItems: 'center', paddingRight:4}} onPress ={() => {showClockOutPicker(item, index)}}>
                                <Text style={{color:item.outTime ? ThemeColor.TextColor : ThemeColor.SubTextColor,fontSize:12, textAlign: 'center', flex: 1}}>{item.outTime ?  item.outTime : '00:00' }</Text>
                                <Feather name="chevron-down" color={ThemeColor.TextColor} size={10} />
                            </TouchableOpacity>
                            <View style={{backgroundColor:ThemeColor.BorderColor, height:30, width:1}}/>
						</View>

                        {Platform.OS == 'ios' ?
                        <View style={{height:30, flex:1,flexDirection:'row',justifyContent: 'center',alignItems: 'center',backgroundColor:'white'}}>
                            <TouchableOpacity style={{height:30,flex:1, flexDirection:'row',justifyContent: 'center',alignItems: 'center',paddingRight:4}} onPress ={() => {showBreakTypePicker(item, index)}}>
                                <Text style={{color:ThemeColor.TextColor,fontSize:12, textAlign: 'center', flex: 1}}>{item.hourType == 24163 ? 'Meal Break' : "Regular Hours"}</Text>
                                <Feather name="chevron-down" color={ThemeColor.TextColor} size={10} />
                            </TouchableOpacity>
                            <View style={{backgroundColor:ThemeColor.BorderColor, height:30, width:1}}/>
                        </View>  :
                        <View style={{height:30, flex:1, flexDirection:'row',justifyContent: 'center',alignItems: 'center',backgroundColor:'white'}}>
                            <Picker
                                style={{flex:1,fontSize:10, fontFamily:FontName.Regular}}
                                itemStyle={{fontSize:10, fontFamily:FontName.Regular}}
                                selectedValue={item.hourType}
                                onValueChange={(itemValue, index) =>{
                                    let selectedItem = breakTypeArr[index];
                                    setSelectedHours({...selectedHours,hourType:selectedItem.keyId});
                                    
                                    let tempArr = mannualHoursArray;
                                    let editObj = selectedHours;
                                    editObj.hourType = selectedItem.keyId;
                                    tempArr[selectedIndex] = editObj;
                                    setMannualHoursArray(tempArr);
                                    setIsListUpdated(!isListUpdated);
                                }}
                            >

                            {breakTypeArr && breakTypeArr.map((item, index) => {
                                return (<Picker.Item label={item.value} value={item.keyId} key={index}/>) 
                            })}
                            </Picker>
                            <View style={{backgroundColor:ThemeColor.BorderColor, height:30, width:1}}/>
                        </View>  
                        }
                        <View style={{height:30, flexDirection:'row',justifyContent: 'center',backgroundColor:'white', alignItems:'center'}}>
                            {/* <TextInput  
                                style={[styles.inputHour,{textAlign:'left',}]}
                                placeholder="Notes" 
                                editable={ true}
                                numberOfLines={1}
                                placeholderTextColor={ThemeColor.PlaceHolderColor}
                                keyboardType='default'
                                value= {item.notes}
                                onChangeText={(val) => handleNoteChange(val, index,item)}
                            /> */}
                            <TouchableOpacity style={{justifyContent:'center', width:30, height:30, marginLeft:8}} onPress={()=> {handledelteClockInClockOut(item, index)}}>
                                <Ionic name="trash-outline" color={ThemeColor.TextColor} size={20} />
                            </TouchableOpacity>
                            <TouchableOpacity style={{justifyContent:'center', width:30, height:30}} onPress={()=> {handledelteClockInClockOut(item, index)}}>
                                <Ionic name="trash-outline" color={ThemeColor.TextColor} size={20} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={{backgroundColor:ThemeColor.BorderColor, height:1}}/>
                </View>
            }/>
            <TouchableOpacity style={[styles.btnFill, {marginLeft:16, marginRight:16, marginBottom:8, borderRadius:5}]} onPress={() => {updateClockInClockOut()}}>
			    <Text style={{color:'white',fontFamily: FontName.Regular, fontSize:16 }}>SAVE</Text>
			</TouchableOpacity>
            <ActionSheetView ref={breakTypeRef} containerStyle={{backgroundColor:ThemeColor.ViewBgColor}}>
				<View style={{height:300}}>
					<View style={{height:60, flexDirection:'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft:16,paddingRight:16}}>
					<TouchableOpacity onPress={() => {breakTypeRef.current?.setModalVisible()}}>
						<Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Cancel</Text>
					</TouchableOpacity>
					<Text style={{color:ThemeColor.TextColor, fontSize:16, fontFamily: FontName.Bold}}>Select break type</Text>
					<TouchableOpacity onPress={() => {
						breakTypeRef.current?.setModalVisible()						
					}}>
						<Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Done</Text>
					</TouchableOpacity>
					</View>
					<Picker
						style={{backgroundColor: 'white',flex:1,}}
						itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
						selectedValue={selectedHours.hourType}
						onValueChange={(itemValue, index) =>{
							let selectedItem = breakTypeArr[index];
							setSelectedHours({...selectedHours,hourType:selectedItem.keyId});
							
							let tempArr = mannualHoursArray;
							let editObj = selectedHours;
							editObj.hourType = selectedItem.keyId;
							tempArr[selectedIndex] = editObj;
							setMannualHoursArray(tempArr);
						}}
					>
					{breakTypeArr && breakTypeArr.map((item, index) => {
						return (<Picker.Item label={item.value} value={item.keyId} key={index}/>) 
					})}
					</Picker>
				</View>
			</ActionSheetView>
            <ActionSheetView ref={clockInTypeRef} containerStyle={{backgroundColor:ThemeColor.ViewBgColor}}>
                <View style={{height:300}}>
                <View style={{height:44, flexDirection:'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft:16,paddingRight:16}}>
                    <TouchableOpacity onPress={() => {clockInTypeRef.current?.setModalVisible()}}>
                        <Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={{color:ThemeColor.TextColor, fontSize:18, fontFamily: FontName.Regular}}>Clock In</Text>
                    <TouchableOpacity onPress={() => {
                        if(selectedHours.inTime.length == 0){
                            handleClockInTimeChange(new Date());
                        }
                        clockInTypeRef.current?.setModalVisible()
                    }}>
                        <Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Done</Text>
                    </TouchableOpacity>
                </View>
                <DatePicker
                    style={{backgroundColor: 'white',flex:1,width:Dimensions.get('window').width}}
                    mode={'time'}
                    date={startDate}
                    onDateChange={(val) => {handleClockInTimeChange(val)}}
                />
                </View>
            </ActionSheetView>
            <ActionSheetView ref={clockOutTypeRef} containerStyle={{backgroundColor:ThemeColor.ViewBgColor}}>
                <View style={{height:300}}>
                <View style={{height:44, flexDirection:'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft:16,paddingRight:16}}>
                    <TouchableOpacity onPress={() => {clockOutTypeRef.current?.setModalVisible()}}>
                    <Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={{color:ThemeColor.TextColor, fontSize:18, fontFamily: FontName.Regular}}>Clock Out</Text>
                    <TouchableOpacity onPress={() => {
                         if(selectedHours.outTime.length == 0){
                            handleClockOutTimeChange(new Date());
                        }
                        clockOutTypeRef.current?.setModalVisible()
                    }}>
                    <Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Done</Text>
                    </TouchableOpacity>
                </View>
                <DatePicker
                    style={{backgroundColor: 'white',flex:1,width:Dimensions.get('window').width}}
                    mode={'time'}
                    // minimumDate={startDate}
                    date={endDate}
                    onDateChange={(val) => {handleClockOutTimeChange(val)}}
                />
                </View>
            </ActionSheetView>	
		</SafeAreaView>
	);
}

export default CheckInOutScreen;

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

	},btnFill:{
		height:50,
		justifyContent:"center",
		backgroundColor: ThemeColor.BtnColor ,
		alignItems:'center',
	  }
  });