import React,{ useEffect } from "react";
import { ScrollView, 
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    Alert,
    TouchableOpacity,
    FlatList,
    useWindowDimensions
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'
import Icon from "react-native-vector-icons/Ionicons";
import HTML from "react-native-render-html";
import axios from 'axios';
import MovableView from 'react-native-movable-view';
import {parseErrorMessage} from '../../_helpers/Utils';
import { AuthContext } from '../../Components/context';
import { BaseUrl, EndPoints, StaticMessage, ThemeColor,MessageGroupId, FontName } from '../../_helpers/constants';
import { getAuthHeader} from '../../_helpers/auth-header';

import moment from 'moment';

const JobDetailScreen = ({route,navigation}) => {

    const { jobDetail } = route.params;
    let [jobDetails, setJobDetails] = React.useState('');
	const { signOut } = React.useContext(AuthContext);
    let [isUserLoggedIn, setIsUserLoggedIn] = React.useState(false);

    console.log('Job Details: ', jobDetail);
    let [isLoading, setLoading] = React.useState(false);
    let [jobApplicationDetails, setJobApplicationDetails] = React.useState({
        "applicationCount": 0, "hiredCount": 0, "interviewCount": 0
    });

    const note = 'Please note that the end client name may not be displayed due to confidentiality agreements. The client’s name will be disclosed by the recruiter prior to submission.'
    const contentWidth = useWindowDimensions().width;

    useEffect(() => {
        setJobDetails(jobDetail);
        navigation.addListener('focus', () => {
            getJobDetails(jobDetail.cjmJobId);
        });
        getJobApplicationCount();
        
       
    }, []);
    const getJobDetails = async (jobID) => {
        setLoading(true);
        var encoded = "U3RhZmZMaW5lQDIwMTc=";

        let user = await AsyncStorage.getItem('loginDetails'); 
        if(user){
            setIsUserLoggedIn(true);
            let parsed = JSON.parse(user);  
            let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
            encoded = base64.encode(userAuthToken);
        } else{
            setIsUserLoggedIn(false);
        }

        console.log('URL:',BaseUrl + EndPoints.JobStatistics);
    
        axios ({
          "method": "GET",
          "url": BaseUrl + "jobs/" + jobID,
          "headers": getAuthHeader(encoded),
        })
        .then((response) => {
            setLoading(false);
          if (response.data.code == 200){
            setJobDetails(response.data.content.dataList[0]);            
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
    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                 <TouchableOpacity style={{marginRight:16}} >
				    <Icon name="ios-share-outline" color={'white'} size={25,25} />
                </TouchableOpacity>
            ),
            title:'More about this job'
        });
    }, [navigation]);

    const getJobApplicationCount = async () => {
        setLoading(true);
        var encoded = "U3RhZmZMaW5lQDIwMTc=";
        let user = await AsyncStorage.getItem('loginDetails');
        if(user){
            let parsed = JSON.parse(user);  
            let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
            encoded = base64.encode(userAuthToken);
        }  

        console.log('URL:',BaseUrl + EndPoints.JobApplicationCount);
    
        axios ({
          "method": "POST",
          "url": BaseUrl + EndPoints.JobApplicationCount,
          "headers": getAuthHeader(encoded),
          data:{"jobId":jobDetail.cjmJobId}
        })
        .then((response) => {
            setLoading(false);
          if (response.data.code == 200){
            setJobApplicationDetails(response.data.content.dataList[0]);
            // console.log(response.data.content.dataList[0]);
          }else if (response.data.code == 417){
            setLoading(false);
            const message = parseErrorMessage(response.data.content.messageList);
            Alert.alert(StaticMessage.AppName, message, [
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

    let ctcRate = jobDetails.ctcRate;
    let w2Rate = jobDetails.w2Rate;
    let annualSalary = jobDetails.annualSalary;
    let rateToDisplay = '';
    if (jobDetails.cjmAssessmentTypeKey == 'f' || jobDetails.cjmAssessmentTypeKey == 'F'){
        rateToDisplay = annualSalary;
    }else{
        if(ctcRate == 'DOE' && w2Rate == 'DOE'){
            rateToDisplay = "W2 (DOE)";
        }else{
            rateToDisplay = "W2 (" + w2Rate + ")" + '| (' + ctcRate + ')';
        }
    }
    const handleJobRefer = async() => {
        let user = await AsyncStorage.getItem('loginDetails');
        if(user){
            navigation.navigate('Job refer',{jobDetails: jobDetails,onClickEvent:handleViewSimilarJobs});
        }else{
            Alert.alert(StaticMessage.AppName, "LOG IN or SIGN UP to continue.", [
                {
                    text: 'Cancel',
                },
                {
                    text: 'Continue',
                    onPress: () => signOut()
                }
            ]); 
        }
    }
    const handleViewSimilarJobs = (clientPrimaryKey,showSimilarJob) => {
        if(showSimilarJob){
            console.log("View Similar Jobs: " + clientPrimaryKey);
            navigation.navigate('SimilarJobs',{clientPrimaryKey:clientPrimaryKey});
        }
       
    }

    let isApplied = jobDetails.alreadyApplied;
    let jobReferral_Id = jobDetails ? jobDetails.JobReferral_Id : jobDetail.JobReferral_Id;
    let isNotIntrested = jobDetails ? jobDetails.isNotIntrested : jobDetail.isNotIntrested;
    let referrerName = jobDetails ? jobDetails.referrerName : jobDetail.referrerName;
    var noteReferNotInterested = '';
    if (isNotIntrested){
        noteReferNotInterested = 'You took action "NOT INTERESTED" for this job"'
    }else{
        noteReferNotInterested = 'You took action "APPLY" for this job"'
    }
    let noteApplyNotintrested = 'This job is referred to you by "' + referrerName + '"';
    
    const getFormattedDate=(cjmPostingDate) =>{
		let momentDate = moment(cjmPostingDate, 'YYYY-MM-DD');
		let dateString = moment(momentDate).format('MMM DD, YYYY')
		return `${dateString}`;
	}
    return (
        <SafeAreaView style={{flex:1,flex_direction:'column'}}>
            <ScrollView style={{}}>
            <View style={styles.container}>
                <View style={styles.subHeaderView}>
                    <Text style={{flex: 1,color: ThemeColor.TextColor, fontSize:16, fontFamily: FontName.Regular}}>About this job</Text>
                    <TouchableOpacity style={{flexDirection: 'row'}} onPress = {() => {navigation.navigate('CreateMessage',{groupName:'Job support',groupID:MessageGroupId.JobSupportID, jobID:jobDetails.cjmJobId})}}>
                        <Icon name="chatbubble-ellipses-outline" color={ThemeColor.BtnColor} size={20} />
                        <Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular, marginLeft:4}}>Message recruiter</Text>
                    </TouchableOpacity>
                </View>
                <View style={{padding:16}}>
                    <Text style={{flex: 1,color: ThemeColor.textColor, fontSize:16, fontFamily: FontName.Regular, fontWeight: 'bold'}}>{jobDetails.jobTitle}</Text>
                    <Text style={{flex: 1,color: ThemeColor.TextColor, fontSize:14, fontFamily: FontName.Regular, marginTop:8}}>{jobDetails.employerName}</Text>
                    <Text style={{flex: 1,color: ThemeColor.TextColor, fontSize:14, fontFamily: FontName.Regular, marginTop:2}}>{jobDetails.city}, {jobDetails.state}</Text>
                    <View style={{flexDirection: 'row'}} >
                        <Text style={{color: ThemeColor.LabelTextColor, fontSize:14, fontFamily: FontName.Regular, marginTop:2}}>Posted on: </Text>
                        <Text style={{flex: 1,color: ThemeColor.TextColor, fontSize:14, fontFamily: FontName.Regular, marginTop:2}}>{getFormattedDate(jobDetails.cjmPostingDate)}</Text>
                    </View>
                    <FlatList style={{marginTop:16}}
                        horizontal
                        data={[
                        {key: '# OF APPLICATIONS',count:jobApplicationDetails.applicationCount},
                        {key: '# OF INTERVIEWED',count:jobApplicationDetails.interviewCount},
                        {key: '# OF HIRED',count:jobApplicationDetails.hiredCount},
                        ]}
                        renderItem={({item}) => 
                            <TouchableOpacity style={styles.item}>
                                <Text style={styles.cardTitle}>{item.count}</Text>
                                <Text style={[styles.title, {color:ThemeColor.TextColor, paddingLeft:8, paddingRight:8}]}>{item.key}</Text>
                            </TouchableOpacity>
                        }
                    />
                </View>
                <View style={styles.subHeaderView}>
                    <Text style={{flex: 1,color: ThemeColor.TextColor, fontSize:16, fontFamily: FontName.Regular}}>Description</Text>
                </View>
                <View style={{flex: 1, paddingLeft:16, paddingRight:16}}>
                    <HTML  source={{ html: jobDetails.cjmJobDetails }} contentWidth={contentWidth} />
                </View>
                <View style={styles.subHeaderView}>
                    <Text style={{flex: 1,color: ThemeColor.TextColor, fontSize:16, fontFamily: FontName.Regular}}>Details</Text>
                </View>
                <View style={{flex: 1, paddingLeft:16, paddingTop:8}}>
                    <Text style={{color: ThemeColor.LabelTextColor, fontSize:14, fontFamily: FontName.Regular, marginRight:16}}>Employment</Text>
                    <Text style={{color: ThemeColor.TextColor, fontSize:14, fontFamily: FontName.Regular, marginRight:16,marginTop:4}}>{jobDetails.cjmAssessmentType}</Text>
                    <View style={{flex: 1,height:1, backgroundColor:ThemeColor.BorderColor, marginTop:8}}/>
                </View>
                <View style={{flex: 1, paddingLeft:16, paddingTop:8}}>
                    <Text style={{color: ThemeColor.LabelTextColor, fontSize:14, fontFamily: FontName.Regular, marginRight:16}}>Pay rate</Text>
                    <Text style={{color: ThemeColor.TextColor, fontSize:14, fontFamily: FontName.Regular, marginRight:16,marginTop:4}}>{rateToDisplay}</Text>
                    <View style={{flex: 1,height:1, backgroundColor:ThemeColor.BorderColor, marginTop:8}}/>
                </View>
                <View style={{flex: 1, paddingLeft:16, paddingTop:8}}>
                    <Text style={{color: ThemeColor.LabelTextColor, fontSize:14, fontFamily: FontName.Regular, marginRight:16}}>Experience</Text>
                    <Text style={{color: ThemeColor.TextColor, fontSize:14, fontFamily: FontName.Regular, marginRight:16,marginTop:4}}>{jobDetails.experienceRange}</Text>
                    <View style={{flex: 1,height:1, backgroundColor:ThemeColor.BorderColor, marginTop:8}}/>
                </View>
                <View style={{flex: 1, paddingLeft:16, paddingTop:8}}>
                    <Text style={{color: ThemeColor.LabelTextColor, fontSize:14, fontFamily: FontName.Regular, marginRight:16}}>Job ID</Text>
                    <Text style={{color: ThemeColor.TextColor, fontSize:14, fontFamily: FontName.Regular, marginRight:16, marginTop:4}}>{jobDetails.cjmJobReferenceId}</Text>
                    <View style={{flex: 1,height:1, backgroundColor:ThemeColor.BorderColor, marginTop:8}}/>
                </View>
            </View>
            <Text style={{color: ThemeColor.LabelTextColor, fontSize:14, fontFamily:'Lato-italic', padding:16, flex:1}}>{note}</Text>

            </ScrollView>
                { isApplied == 1 &&
                    <Text style={{color:ThemeColor.SubTextColor,fontFamily: FontName.Regular, fontSize:14,textAlign: 'center', margin:8}}>You took action "APPLY" for this job</Text>
                }
            <View style={{height:50, backgroundColor:'#fff', flexDirection: 'row'}}>
                
                <TouchableOpacity style={[styles.btnFill,{backgroundColor:'#fff',}]} onPress={() => {handleJobRefer()}}>
                    <Text style={{color:ThemeColor.BtnColor,fontFamily: FontName.Regular, fontSize:16, }}>REFER</Text>
                </TouchableOpacity>
                
                {jobReferral_Id.length > 0 ? 
                    <TouchableOpacity style={[styles.btnFill,{backgroundColor:ThemeColor.RedColor}]} >
                        <Text style={{color:'#53962E',fontFamily: FontName.Regular, fontSize:16, color:'#fff' }}>NOT INTERESTED</Text>
                    </TouchableOpacity> :
                    isApplied == 0 && <TouchableOpacity style={styles.btnFill} onPress={() => navigation.navigate('Job apply',{jobDetails: jobDetails,onClickEvent:handleViewSimilarJobs})}>
                        <Text style={{color:'#53962E',fontFamily: FontName.Regular, fontSize:16, color:'#fff' }}>APPLY</Text>
                    </TouchableOpacity>
                }
                
            </View>
            {isUserLoggedIn ?
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
            </MovableView> : null}
        </SafeAreaView>
    );
}

export default JobDetailScreen;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      backgroundColor:'#fff'
    },subHeaderView:{
      flexDirection:'row',
      paddingLeft:16,
      paddingRight:16,
      height:50,
      alignItems:'flex-end',
      paddingBottom:12,
      backgroundColor:ThemeColor.SubHeaderColor,
    },item: {
        padding: 4,
        marginVertical: 4,
        borderRadius:5,
        marginRight:8,
        borderColor:ThemeColor.BorderColor,
        borderWidth:1,
        height:80,
        width:160,
        alignItems:'center', 
        justifyContent: 'center'
      },cardTitle: {
        fontSize: 25,
        fontFamily: FontName.Bold,
        color:ThemeColor.RedColor,
        marginBottom:8,
        paddingLeft:8,
        paddingRight:8
    
      },btnFill:{
        flex:1,
        justifyContent:"center",
        backgroundColor: ThemeColor.BtnColor,
        alignItems:'center',
      }
});