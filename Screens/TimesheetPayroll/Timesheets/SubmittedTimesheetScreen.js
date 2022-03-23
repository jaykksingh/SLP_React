import React ,{useEffect,useState,createRef}from 'react';
import { View ,
    useWindowDimensions,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Alert,
    SectionList,
    SafeAreaView,
    Dimensions,
    Text} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import Icon from 'react-native-vector-icons/Ionicons';
import ActionSheet from "react-native-actions-sheet";
import DatePicker from 'react-native-date-picker'
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'
import axios from 'axios'
import {getAuthHeader} from '../../../_helpers/auth-header';
import { AuthContext } from '../../../Components/context';
import { BaseUrl, EndPoints, StaticMessage,ThemeColor,MessageGroupId,FontName } from '../../../_helpers/constants';
import Loader from '../../../Components/Loader';

const startDateRef = createRef();
const endDateRef = createRef();


const SubmittedTimesheetScreen = ({navigation})  => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [timesheetsArray, setTimesheetsArray] = React.useState([]);
	const [startDate, setStartDate] = React.useState(new Date());
	const [endDate, setEndDate] = React.useState(new Date());
	const { signOut } = React.useContext(AuthContext);

  
	const [data,setData] = React.useState({
    startDate:'',
    endDate:''
  });

  useEffect(() => {
    var date = new Date();
    var firstDay = new Date(date.getFullYear()-1, 3, 1);
    var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    setStartDate(firstDay);
    setEndDate(lastDay);
    
    let startDateString = moment(firstDay).format('MMM DD, YYYY');
    let endDateString = moment(lastDay).format('MMM DD, YYYY');
  
    setData({...data,startDate: startDateString,endDate: endDateString});
    
    let startDate = moment(firstDay).format('YYYY-MM-DD');
    let endDate = moment(lastDay).format('YYYY-MM-DD');

    getTimeshetsList(startDate,endDate);		
	},[]);
  const SessionExpiredAlert = () =>{
		Alert.alert(StaticMessage.AppName,StaticMessage.SessionExpired,
			[{
			  text: 'Ok',
			  onPress: () => signOut()
		  }]
	)}
  const  getTimeshetsList = async(startDate, endDate) => {
		let user = await AsyncStorage.getItem('loginDetails');  
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken);
	
    console.log(startDate,endDate);
		setIsLoading(true);
		
		axios ({  
		  "method": "POST",
		  "url": BaseUrl + EndPoints.GetTimehsstes,
		  "headers": getAuthHeader(authToken),
		  data:{"status":"submitted",'startDate':startDate,'endDate':endDate}
		})
		.then((response) => {
      console.log(response.data);
      setIsLoading(false);
		  if (response.data.code == 200){
        setTimesheetsArray(response.data.content.dataList);
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
		  if (!error.status) {
        Alert.alert(StaticMessage.AppName, StaticMessage.NoInternetMessage, [
          {text: 'Ok'}
        ]);
      }else if(error.response.status == 401){
        SessionExpiredAlert();
      }else{
          Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
              {text: 'Ok'}
            ]);
      }
	
		})
	}


  const getFormatedDateRange=(item) =>{
    let momentStartDate = moment(item.startDate, 'YYYY-MM-DD');
    let momentEndDate = moment(item.endDate, 'YYYY-MM-DD');
    let startDateString = moment(momentStartDate).format('MMM DD, YYYY')
    let endDateString = moment(momentEndDate).format('MMM DD, YYYY')
  
    return `${startDateString} - ${endDateString}`;
  }
  const handleStartDateChange = (val) =>{
		console.log("Start Date:",val.toString());
		setStartDate(val);
		let showDate = moment(val).format('MMM DD, YYYY')
		setData({...data,startDate:showDate});

    let startDateString = moment(val).format('YYYY-MM-DD');
    let endDateString = moment(endDate).format('YYYY-MM-DD');

    getTimeshetsList(startDateString,endDateString);
	}
	const handleEndDateChange = (val) =>{
		console.log("Start Date:",val.toString());
		setEndDate(val);
		let showDate = moment(val).format('MMM DD, YYYY')
		setData({...data,endDate:showDate});

    let startDateString = moment(startDate).format('YYYY-MM-DD');
    let endDateString = moment(val).format('YYYY-MM-DD');

    getTimeshetsList(startDateString,endDateString);
	}

  const transformedArray = timesheetsArray.map(({ hoursDetail,projectName ,timeSheetCycle,projectDetailId}) => ({ data: hoursDetail,projectName:projectName,timeSheetCycle:timeSheetCycle,projectDetailId:projectDetailId }));
	return(
		<SafeAreaView style={styles.container}>
      <View style={{marginTop:8}}>
        <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:16}}>Date range</Text>
        <View style={{flexDirection:'row',}}>
          <TouchableOpacity style={{flex: 1,paddingLeft:8,backgroundColor:'white', height:40, flexDirection:'row', alignItems:'center', paddingRight:8}}  onPress={() => {startDateRef.current?.setModalVisible()}}>
            <Text style={[styles.labelText,{color:data.startDate.length > 0 ? 'black' : ThemeColor.PlaceHolderColor}]}>{data.startDate.length > 0 ? data.startDate : 'Start date'}</Text>
            <Icon name="calendar" color={ThemeColor.SubTextColor} size={22,22} />
          </TouchableOpacity>
          <TouchableOpacity style={{flex: 1,backgroundColor:'white', height:40,flexDirection:'row', alignItems:'center', paddingRight:16}}  onPress={() => {endDateRef.current?.setModalVisible()}}>
            <Text style={[styles.labelText,{color:data.endDate.length > 0 ? 'black' : ThemeColor.PlaceHolderColor}]}>{data.endDate.length > 0 ? data.endDate : 'End date'}</Text>
            <Icon name="calendar" color={ThemeColor.SubTextColor} size={22,22} />
          </TouchableOpacity>
        </View>
        <View style={{height:1, backgroundColor:ThemeColor.BorderColor}}/>
      </View> 
      {transformedArray.length > 0 ?
       <SectionList 
          style={{}} 
          sections={transformedArray}
          keyExtractor={(item, index) => index.toString()}  
          renderSectionHeader={({section}) => 
            <View style={{ backgroundColor:'#fff',}}>
              <View style={{height:40,paddingLeft:16, justifyContent: 'center'}}>
                <Text style={styles.sectionHeader}>{section.projectName}</Text>
              </View>
              <View style={{height:1, backgroundColor:ThemeColor.BorderColor}}/>
            </View>
          }    
          renderItem={({item, index,section}) => 
            <View style={{ backgroundColor:'#fff'}}>
              <View style={{}} >
                <TouchableOpacity style={{height:40,paddingLeft:16, flexDirection:'row', alignItems:'center',}} onPress={()=> navigation.navigate('ViewTimesheet',{timesheetDetails:item,projectDetail:section})}>
                  <Text style={{fontSize:14, color:ThemeColor.TextColor,fontFamily: FontName.Regular, flex:1}}>{getFormatedDateRange(item)}</Text>
                  <Text style={{fontSize:14, color:ThemeColor.TextColor,fontFamily: FontName.Regular, textAlign: 'right'}}>{item.totalHours} Hours</Text>
                  <Feather name="chevron-right" color={ThemeColor.BorderColor} size={24,24} />
                </TouchableOpacity>
                <View style={{height:1, backgroundColor:ThemeColor.BorderColor}}/>
                <View style={{height:40,paddingLeft:16, flexDirection:'row', alignItems:'center',flex: 1}}>
                  <Text style={{fontSize:14, color:item.subStatusId == 908 ?  ThemeColor.RedColor : ThemeColor.GreenColor,fontFamily: FontName.Regular, flex: 1, textAlign: 'center'}}>{item.subStatus}</Text>
                  <View style={{height:40 , width:1,backgroundColor:ThemeColor.BorderColor}}/>
                  <TouchableOpacity style={{flex: 1,alignItems:'center',justifyContent: 'center', flexDirection:'row'}} onPress={()=> navigation.navigate('ViewTimesheet',{timesheetDetails:item,projectDetail:section})}>
                    <Feather name="lock" color={ThemeColor.NavColor} size={18,18} />
                    <Text style={{fontSize:14, color:ThemeColor.NavColor,fontFamily: FontName.Regular, textAlign: 'center', marginLeft:8}}>View timesheet</Text>
                  </TouchableOpacity>
                  
                </View>
              </View>
              <View style={{height:12 , backgroundColor:ThemeColor.BorderColor}}/>
            </View>
          }  
      /> : 
      <View style={{flex:1, justifyContent: 'center'}}>
          <Text style={{fontSize:16, color:ThemeColor.LabelTextColor,fontFamily: FontName.Regular, textAlign: 'center',}}>Looking for a timesheet record?</Text>
          <TouchableOpacity onPress = {() => {navigation.navigate('CreateMessage',{groupName:'Timesheet support',groupID:MessageGroupId.TimesheetSupportID})}}>
            <Text style={{fontSize:16, color:ThemeColor.BtnColor,fontFamily: FontName.Regular, textAlign: 'center',marginTop:2}}>Contact timesheet support</Text>
          </TouchableOpacity>
      </View>
      }
      <Loader isLoading={isLoading} />
      
      <ActionSheet ref={startDateRef} containerStyle={{backgroundColor:ThemeColor.ViewBgColor}}>
        <View style={{height:300}}>
          <View style={{height:44, flexDirection:'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft:16,paddingRight:16}}>
            <TouchableOpacity onPress={() => {startDateRef.current?.setModalVisible()}}>
              <Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Cancel</Text>
            </TouchableOpacity>
            <Text style={{color:ThemeColor.TextColor, fontSize:18, fontFamily: FontName.Regular}}>Start date</Text>
            <TouchableOpacity onPress={() => {startDateRef.current?.setModalVisible()}}>
              <Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Done</Text>
            </TouchableOpacity>
          </View>
          <DatePicker
              style={{backgroundColor: 'white',flex:1,width:Dimensions.get('window').width}}
            mode={'date'}
            maximumDate={new Date()}
            date={startDate}
            onDateChange={(val) => {handleStartDateChange(val)}}
          />
        </View>
      </ActionSheet>
      <ActionSheet ref={endDateRef} containerStyle={{backgroundColor:ThemeColor.ViewBgColor}}>
        <View style={{height:300}}>
          <View style={{height:44, flexDirection:'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft:16,paddingRight:16}}>
            <TouchableOpacity onPress={() => {endDateRef.current?.setModalVisible()}}>
              <Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Cancel</Text>
            </TouchableOpacity>
            <Text style={{color:ThemeColor.TextColor, fontSize:18, fontFamily: FontName.Regular}}>End date</Text>
            <TouchableOpacity onPress={() => {endDateRef.current?.setModalVisible()}}>
              <Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Done</Text>
            </TouchableOpacity>
          </View>
          <DatePicker
              style={{backgroundColor: 'white',flex:1,width:Dimensions.get('window').width}}
            mode={'date'}
            maximumDate={new Date()}
            date={endDate}
            onDateChange={(val) => {handleEndDateChange(val)}}
          />
        </View>
      </ActionSheet>
    </SafeAreaView>	
	);
}

export default SubmittedTimesheetScreen;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:'#E5E9EB' 
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
      color:ThemeColor.SubTextColor,
      fontSize:14,
      fontFamily: FontName.Regular,
      marginLeft:8,
      alignContent:'stretch',
    },btnFill:{
        width:'100%',
        margin: 16,
        height:50,
        justifyContent:"center",
        backgroundColor:'#fff' ,
        alignItems:'center',
        borderRadius:5,
      }
  });
