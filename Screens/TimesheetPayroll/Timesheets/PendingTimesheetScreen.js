import React ,{useEffect,useState}from 'react';
import { View ,
    useWindowDimensions,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Alert,
    SectionList,
    SafeAreaView,
    Text} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'
import axios from 'axios'
import moment from 'moment';
import { AuthContext } from '../../../Components/context';
import Loader from '../../../Components/Loader';
import {getAuthHeader} from '../../../_helpers/auth-header';
import { BaseUrl, EndPoints, StaticMessage, ThemeColor ,MessageGroupId, FontName} from '../../../_helpers/constants';


const PendingTimesheetScreen = ({route,navigation})  => {

  const [isLoading, setIsLoading] = React.useState(false);
  const [timesheetsArray, setTimesheetsArray] = React.useState([]);
	const { signOut } = React.useContext(AuthContext);

  const [data,setData] = React.useState({
		project:'',
	});

  useEffect(() => {
    navigation.addListener('focus', () => {
      getTimeshetsList();	
    })	
	},[]);

  const  getTimeshetsList = async() => {
		let user = await AsyncStorage.getItem('loginDetails');  
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken);
	
		setIsLoading(true);
		
		axios ({  
		  "method": "POST",
		  "url": BaseUrl + EndPoints.GetTimehsstes,
		  "headers": getAuthHeader(authToken),
		  data:{"status":"pending",'startDate':"",'endDate':""}
		})
		.then((response) => {
      setIsLoading(false);
		  if (response.data.code == 200){
        console.log('Timesheets Pending:',JSON.stringify(response.data.content.dataList));

        filterTimesheetArray(response.data.content.dataList);
		  }else if (response.data.code == 417){
        setIsLoading(false);
        console.log(Object.values(response.data.content.messageList));
        const errorList = Object.values(response.data.content.messageList);
        Alert.alert(StaticMessage.AppName, errorList.join(), [
          {text: 'Ok'}
        ]);
		  }else if (response.data.code == 401){
        console.log('Session Expired Already');
        SessionExpiredAlert();
      }else{

		  }
		})
		.catch((error) => {
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
  const SessionExpiredAlert = () =>{
		Alert.alert(StaticMessage.AppName,StaticMessage.SessionExpired,
			[{
			  text: 'Ok',
			  onPress: () => signOut()
		  }]
	)}
  const filterTimesheetArray = (timesheetList) => {
    let tempTimesheetList = [];
    for(let i = 0 ; i < timesheetList.length ; i++){
      let projectDetail = timesheetList[i];
      if(projectDetail.hoursDetail.length > 0){
        tempTimesheetList.push(projectDetail);
      }
    }
    setTimesheetsArray(tempTimesheetList);
    setIsLoading(false);

  }

  const transformedArray = timesheetsArray.map(({ hoursDetail,projectName ,timeSheetCycle,timeSheetCycleId,timesheetClientApproval,projectDetailId}) => ({ data: hoursDetail,projectName:projectName,timeSheetCycle:timeSheetCycle,timeSheetCycleId:timeSheetCycleId,timesheetClientApproval:timesheetClientApproval,projectDetailId:projectDetailId }));
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

  const showPendingTSLabel = (item) => {
    if(item.timesheetClientApproval == 1){
      return false;
    }
    return true;
  }
  const handleEditTimesheet = (item, section) => {
    console.log(item);
    let projectTemplateID = item.projectTemplateID ? item.projectTemplateID : "27632";
    if(projectTemplateID == "27632"){
      navigation.navigate('CheckInOutTimesheet',{timesheetDetails:item,projectDetail:section})
    }else{
      navigation.navigate('EditTimesheet',{timesheetDetails:item,projectDetail:section})
    }
  }
  return(
		<SafeAreaView style={styles.container}>
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
          renderItem={({ item ,section, index}) => 
            <View style={{ backgroundColor:'#fff'}}>
              <TouchableOpacity style={{flexDirection:'row',paddingTop:8, paddingBottom:8}} onPress={()=> {handleEditTimesheet(item,section)}}>
                <View style={{height:40,paddingLeft:16,justifyContent: 'center', flex:1}}>
                  <Text style={{fontSize:14, color:ThemeColor.TextColor,fontFamily: FontName.Regular}}>{getFormatedDateRange(item)}</Text>
                  {showPendingTSLabel(section) ? <Text style={{fontSize:12, color:ThemeColor.RedColor,fontFamily: FontName.Regular, marginTop:4}}>Client timesheet missing</Text> : null}
                </View>
                <View style={{flexDirection:'row',justifyContent: 'center', alignItems: 'center',paddingRight:8}}>
                  <View style={{justifyContent: 'center',paddingRight:4}}>
                    <Text style={{fontSize:14, color:ThemeColor.TextColor,fontFamily: FontName.Regular, textAlign: 'right'}}>{item.totalHours} Hours</Text>
                    <Text style={{fontSize:12, color: item.subStatus == "Rejected by Manager" ? ThemeColor.GreenColor : item.subStatus == "Pending" ? ThemeColor.RedColor : ThemeColor.OrangeColor,fontFamily: FontName.Regular,textAlign: 'right',marginTop:4}}>{item.subStatus}</Text>
                  </View>
                  <Feather name="chevron-right" color={ThemeColor.BorderColor} size={25} />
                </View>
              </TouchableOpacity>
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
      <Text style={{fontFamily: FontName.Italic, fontSize:12, color:ThemeColor.SubTextColor,paddingLeft:16,paddingRight:16,paddingTop:8,marginBottom:4}}>{note}</Text>  
	  	<Loader isLoading={isLoading} />
    </SafeAreaView>	
	);
}

export default PendingTimesheetScreen;

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
      }
  });
