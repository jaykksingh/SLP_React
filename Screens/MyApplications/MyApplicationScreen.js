/* eslint-disable react/display-name */
import React , {useEffect} from "react";
import { StatusBar, 
    ScrollView, 
    View,
    Text,
    StyleSheet,
    Alert,
    TextInput,
    TouchableOpacity,
    FlatList,
    Button,
    Image
} from "react-native";
import SegmentedControlTab from "react-native-segmented-control-tab";
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'
import axios from 'axios';
import MovableView from 'react-native-movable-view';
import Icon from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import { AuthContext } from '../../Components/context';
import Loader from '../../Components/Loader';
import { BaseUrl, EndPoints, StaticMessage, ThemeColor,MessageGroupId, FontName } from '../../_helpers/constants';
import { getAuthHeader} from '../../_helpers/auth-header';
import '../../_helpers/global';

const MyApplicationScreen = ({route,navigation}) => {
  let [isLoading, setLoading] = React.useState(false);
  let [selectedIndex, setSelectedIndex] = React.useState(0);
  let [applicationArray, setApplicationArray] = React.useState('');
  let [pastApplicationArray, setPastApplicationArray] = React.useState('');
  let [showProgressCell, setShowProgressCell] = React.useState('');
	const { signOut } = React.useContext(AuthContext);

  React.useLayoutEffect(() => {    
		navigation.setOptions({
      title: 'Applications',
		});
  }, [navigation]);
  useEffect(() => {
    navigation.addListener('focus', () => {
      getMyApplication('active');
		});
    getMyApplication('active');
  }, []);

  
  const handleIndexChange = (index) => {
    setSelectedIndex(index);
    if(index == 1){
      getMyApplication('archive');
    }else{
      getMyApplication('active');
    }
  }
  const handleShowProgress = (details) => {
    if(showProgressCell == details.jobId){
      setShowProgressCell('');
    }else{
      setShowProgressCell(details.jobId);
    }
  }

  const getMyApplication = async(applicatonType) => {
    let user = await AsyncStorage.getItem('loginDetails');  
    let parsed = JSON.parse(user);  
    let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
    var authToken = base64.encode(userAuthToken);

    setLoading(true);
    axios ({
      "method": "POST",
      "url": BaseUrl + EndPoints.JobApplications,
      "headers": getAuthHeader(authToken),
      data:{"applicationStatus":applicatonType}
    })
    .then((response) => {
      setLoading(false);
      if (response.data.code == 200){
        if(applicatonType == 'active'){
          setApplicationArray(response.data.content.dataList);
        }else{
          setPastApplicationArray(response.data.content.dataList);
        }
      }else if (response.data.code == 417){
        setLoading(false);
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
        setLoading(false);
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
 

  const getJobDetails = async (details) => {
    if(details.SelfApplied == 'n' || selectedIndex == 1){
      return;
    }
    setLoading(true);

    axios ({
      "method": "GET",
      "url": BaseUrl + "jobs/" + details.jobId,
      "headers": getAuthHeader(global.AccessToken),
    })
    .then((response) => {
        setLoading(false);
      if (response.data.code == 200){
        navigation.navigate("JobDetails", {jobDetail: response.data.content.dataList[0]});
      }else if (response.data.code == 417){
        setLoading(false);
        const errorList = Object.values(response.data.content.messageList);
        Alert.alert(StaticMessage.AppName, errorList.join(), [
          {text: 'Ok'}
        ]);

      }else{

      }
    })
    .catch((error) => {
        setLoading(false);
        Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
            {text: 'Ok'}
        ]);
    })
  }
  const getProfileDetails = async() => {
		let user = await AsyncStorage.getItem('loginDetails');  
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken);    
	  
		setLoading(true);
		axios ({  
		  "method": "GET",
		  "url": BaseUrl + EndPoints.UserProfile,
		  "headers": getAuthHeader(authToken)
		})
		.then((response) => {
			setLoading(false);
			if (response.data.code == 200){
				let profileData = response.data.content.dataList[0];
				let recruiterDetails = profileData.empDetails.recruiterDetails
				let name = `${recruiterDetails.firstName} ${recruiterDetails.lastName} (My recruiter)`;
				navigation.navigate('CreateMessage',{timesheets:{},preMessage:'', groupID:MessageGroupId.MyRecruiterID,groupName:name})

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
			setLoading(false);
			if(error.response.status == 401){
				SessionExpiredAlert();
			}else{
				Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
					{text: 'Ok'}
				  ]);
			}
			console.log('Error:',error);      
		})
	}
  const getApplicationAttributes = (details) => {
    var assignmentType = details.assesmentType;
    let annualSalary = details.annualSalary;
    let expYear = details.experience;
    var experience = "";
    if (expYear > 0){
      experience = expYear + "Years";
    }else{
      experience = expYear;
    }
    let city = details.city;
    let state = details.state;
    var address = city;
    if(state.length > 0){
      if(address.length > 0){
        address = address + ", " + state;
      }else{
        address = state;
      }
    }
    if (annualSalary.length > 0) {
      if (assignmentType.length > 0) {
          assignmentType = assignmentType + " | " + annualSalary;
      }else{
          assignmentType = annualSalary;
      }
    }
    if (experience.length > 0) {
      if (assignmentType.length > 0) {
        assignmentType = assignmentType + " | " + experience;
      }else{
          assignmentType = experience;
      }
    }
    if (address.length > 0) {
      if (assignmentType.length > 0) {
        assignmentType = assignmentType + " | " + address;
      }else{
          assignmentType = address;
      }
  }
    return assignmentType;
  }

  const getApplStatusImage = (details) =>{
    let strApplied = details.applicationStage.applied;
    let strInprocess = details.applicationStage.inprocess;
    let strOffer = details.applicationStage.offer;
    let applicationStatus = details.applicationStatus;

    if (applicationStatus == "Pre-screening pending") {
      return require('../../assets/Images/ApplicationStages/application_stage1a.png')
    }else if ( strApplied == "wip" ) {
        return require('../../assets/Images/ApplicationStages/application_stage1.png')
    }else if ( strApplied == "no" || strApplied =="failed" ){
        return require('../../assets/Images/ApplicationStages/application_stage2.png')
    }else if ( strInprocess == "wip" ){
        return require('../../assets/Images/ApplicationStages/application_stage3.png')
    }else if ( strInprocess == "no" || strInprocess =="failed" ){
        return require('../../assets/Images/ApplicationStages/application_stage4.png')
    }else if ( strOffer == "no"  || strOffer =="failed" ){
        return require('../../assets/Images/ApplicationStages/application_stage5.png')
    }else if ( strOffer =="yes" ){
        return require('../../assets/Images/ApplicationStages/application_stage6.png')
    }else if ( strOffer =="wip" ){
        return require('../../assets/Images/ApplicationStages/application_stage7.png')
    }else{
        return require('../../assets/Images/ApplicationStages/application_stage1.png')
    }
  }

  const getApplicationType = (details) => {
    let isReferred = details.isReferred;
    let selfApplied = details.SelfApplied;
    if (isReferred){
      let referrerName = details.referrerName;
      return referrerName + ' Referred you to'
    }else{
      if(selfApplied == 'n'){
        return "Your submission for";
      }else{
        return "You applied for";
      }
    }
    return 'You applied for';
  }
  const swipeBtns =[{
    text: 'APPLY',
    backgroundColor: ThemeColor.NavColor,
    underlayColor: '#fff',
    onPress: () => { this.deleteNote(rowData) }
  },
  {
    text: 'NOT INTERESTED',
    backgroundColor: ThemeColor.RedColor,
    underlayColor: '#fff',
    onPress: () => { this.deleteNote(rowData) }
  }];

  const getFormatedDate=(item) =>{
		let momentDate = item.appliedOn ? moment(item.appliedOn, 'YYYY-MM-DD') : moment(item.referredDate, 'YYYY-MM-DD');
		let dateString = moment(momentDate).format('MMM DD, YYYY')
		return `${dateString}`;
	}
  const handleViewSimilarJobs = (clientPrimaryKey) => {
    console.log("View Similar Jobs: " + clientPrimaryKey);
    navigation.navigate('SimilarJobs',{clientPrimaryKey:clientPrimaryKey});

  }
  const handleStatusClick = (item) => {
    let applicationStatus = item.applicationStatus;
    if(applicationStatus == 'Pre-screening pending'){
      navigation.navigate('PreScreenings',{screenngCode:item.screenngCode,clientPrimaryKey:item.jobId,onClickEvent:handleViewSimilarJobs});
    }
  }
  let noApplicationText = "What are you waiting for? Find your ideal job match, apply and get hired through StafflinePro™. After you apply, visit this section to view the status of your application.";
  let noArchiveApplText = "Missing an old application?";
  return (
      <View style={[styles.container,{backgroundColor:ThemeColor.ViewBgColor,}]}>
        <View style={{alignItems:'center', justifyContent:'center', height:50, marginTop:8}}>
          <SegmentedControlTab
            tabStyle ={{ borderColor: ThemeColor.BtnColor}}
            activeTabStyle={{ backgroundColor: ThemeColor.BtnColor  }}
            tabsContainerStyle={{ height: 30, width:'70%', tintColor:ThemeColor.BtnColor, borderColor:ThemeColor.BtnColor }}
            values={["Active", "Archive"]}
            tabTextStyle={{ color: ThemeColor.BtnColor }}
            activeTabTextStyle={{ color: '#fff' }}
            selectedIndex={selectedIndex}
            onTabPress={ (index) => {handleIndexChange(index)}}
          />
        </View>
        {((selectedIndex == 0 && applicationArray.length > 0) || (selectedIndex == 1 && pastApplicationArray.length > 0)) ?
        <FlatList style={{}}
            data={selectedIndex == 0 ? applicationArray : pastApplicationArray}
            keyExtractor={(item, index) => item.Job_Resume_Id}
            renderItem={({item}) => 
              <View>
                <View right={(item.isReferred && item.applicationStatus != 'Not Interested' && item.appliedOn.length == 0 ? swipeBtns : null)} autoClose='true' backgroundColor= 'transparent'>
                <View style={{backgroundColor:'#fff'}} onPress={() => {getJobDetails(item)}}>
                  <View style={{paddingLeft:16, paddingRight:16}}>
                    <View style={{justifyContent:'space-between', flexDirection:'row', marginTop:8}}>
                      <Text style={{flex: 1, fontFamily: FontName.Regular, fontSize:12,color:ThemeColor.TextColor}}>{getApplicationType(item)}</Text>
                      {item.jobStatus == 'C' && <Text style={{flex: 1, fontFamily: FontName.Regular, fontSize:12,color:ThemeColor.RedColor, textAlign:'right' }}>Job closed</Text>}
                    </View>
                    <TouchableOpacity onPress={() => {getJobDetails(item)}}>
                      <Text style={{flex: 1, fontFamily: FontName.Regular, fontSize:16,color:ThemeColor.NavColor, marginTop:8}}>{item.jobTitle}</Text>
                    </TouchableOpacity>
                    <View style={{justifyContent:'space-between', flexDirection:'row', marginTop:2}}>
                      <View style={{flexDirection:'row', alignItems:'center'}}>
                        <Text style={{fontFamily: FontName.Regular, fontSize:14, color:ThemeColor.LabelTextColor}}>on </Text>
                        <Text style={{fontFamily: FontName.Regular, fontSize:14, color:ThemeColor.TextColor}}>{getFormatedDate(item)}</Text>
                      </View>
                      {
                        selectedIndex == 0 && 
                        <TouchableOpacity onPress={() => {handleShowProgress(item)}}>
                          <Text style={{fontFamily: FontName.Regular, fontSize:14, color:ThemeColor.BtnColor}}>{showProgressCell == item.jobId ? 'Hide progress' : 'Show progress'}</Text>
                        </TouchableOpacity> 
                      }
                    </View>
                    <View style={{flexDirection:'row', alignItems:'center',marginTop:2}}>
                      <Text style={{fontFamily: FontName.Regular, fontSize:14, color:ThemeColor.LabelTextColor}}>at </Text>
                      <Text style={{fontFamily: FontName.Regular, fontSize:14, color:ThemeColor.TextColor}}>{item.cjmCompanyName ? item.cjmCompanyName : "Compunnel Software Group. Inc"} </Text>
                    </View>
                    <View style={{flexDirection:'row', alignItems:'center',marginTop:8}}>
                      <Text style={{flex:1,fontFamily: FontName.Regular, fontSize:14, color:ThemeColor.SubTextColor}}>{getApplicationAttributes(item)}</Text>
                    </View>
                  </View>
                  <View style={{height:1,marginTop:8, backgroundColor:ThemeColor.BorderColor}}/>
                  <TouchableOpacity style={{paddingLeft:16, paddingRight:16, height:40, alignContent:'center', justifyContent: 'center'}} onPress={() => {handleStatusClick(item)}}>
                    <Text style={{fontFamily: FontName.Regular, fontSize:12, color: item.positiveStatus == 'Y' ? ThemeColor.GreenColor : ThemeColor.RedColor,textAlign: 'center'}}>{item.applicationStatus}</Text>
                  </TouchableOpacity>
                  <View style={{height:1, backgroundColor:ThemeColor.BorderColor}}/>
                  {
                    showProgressCell == item.jobId &&
                    <View style={{height:50, alignItems: 'center', justifyContent: 'center',paddingLeft:16, paddingRight:16}}>
                      <Image resizeMode= 'contain' style={{width:'95%', height:50}} source={getApplStatusImage(item)} /> 
                    </View>
                  }
                  
                </View>
                </View>
                <View style={{height:12, backgroundColor:ThemeColor.BorderColor}} />
              </View>
            }
        /> : 
          <View style={{flex:1, justifyContent:'center', alignItems:'center', padding:16}}>
            
            {!isLoading && 
            <View>
              <Text style={{fontFamily: FontName.Regular, fontSize:16, color:ThemeColor.TextColor, textAlign:'center'}}>{selectedIndex == 0 ? noApplicationText : noArchiveApplText}</Text>
              {selectedIndex == 0 ? 
              <TouchableOpacity style={styles.btnFill} onPress={() => {navigation.navigate('FindJobs')}}>
                <Text style={{color:'#53962E',fontFamily: FontName.Regular, fontSize:16, color:'#fff' }}>FIND JOBS</Text>
              </TouchableOpacity> : 
              <TouchableOpacity style={{}} onPress = {() => {getProfileDetails()}}>
                <Text style={{color:'#53962E',fontFamily: FontName.Regular, fontSize:16, color:ThemeColor.BtnColor, marginTop:4 }}>Let your recruiter know</Text>
              </TouchableOpacity>
              }
            </View>}
            
          </View>
        }
        <Loader isLoading={isLoading} />
        <MovableView>
        <TouchableOpacity style={{
          position: 'absolute',
          margin: 16,
          right: 0,
          bottom: 0,
          backgroundColor:ThemeColor.BtnColor,
          height:50, 
          width:50,
          borderRadius:25,
          justifyContent: 'center',
          alignItems: 'center'}} onPress={() => navigation.navigate('ChatBot')}>
          <Icon name="chatbubble-ellipses-outline" color={'white'} size={25} />
        </TouchableOpacity>
      </MovableView>
      </View>
    );
}
export default MyApplicationScreen;


const styles = StyleSheet.create({
    container: {
      flex: 1,
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
        height:40,
        backgroundColor:'#fff',
        alignItems:"center",
    
      },btnFill:{
        marginTop:32,
        borderRadius:5,
        height:40,
        justifyContent:"center",
        backgroundColor: ThemeColor.BtnColor,
        alignItems:'center',
        paddingLeft:32, paddingRight:32
      },
  });