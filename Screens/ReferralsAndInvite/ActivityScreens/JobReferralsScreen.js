import React ,{useEffect,useState}from 'react';
import { 
	TouchableOpacity,
	View ,
    StyleSheet,
    Alert,
    FlatList,
    SafeAreaView,
    Text,
	Image} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'
import axios from 'axios'
import moment from 'moment';
import Loader from '../../../Components/Loader';
import {getAuthHeader} from '../../../_helpers/auth-header';
import { BaseUrl, EndPoints, StaticMessage, ThemeColor, FontName } from '../../../_helpers/constants';


const JobReferralsScreen = ({route,navigation})  => {

	const [isLoading, setIsLoading] = React.useState(false);
	const [jobReferredArray, setJobReferredArray] = React.useState([]);
	let [showProgressCellIndex, setShowProgressCellIndex] = React.useState(-1);

	React.useLayoutEffect(() => {
		navigation.setOptions({
			title:'Job referrals'
		});
	}, [navigation]);

	useEffect(() => {
		getContactReferralsList();
	},[]);

	const getContactReferralsList = async() => {
		let user = await AsyncStorage.getItem('loginDetails');  
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken);    
	  
		setIsLoading(true);
		
		axios ({  
		  "method": "GET",
		  "url": BaseUrl + EndPoints.JobReferredList,
		  "headers": getAuthHeader(authToken)
		})
		.then((response) => {
			setIsLoading(false);
			if (response.data.code == 200){
				const results = JSON.stringify(response.data.content.dataList[0])
				console.log('setJobReferredArray:',results);
				setJobReferredArray(response.data.content.dataList);
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
			setIsLoading(false);
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
		
	const getEmailAndDate=(item) =>{
		let momentStartDate = moment(item.appliedOn, 'YYYY-MM-DDTHH:mm:ssZZ');
		let startDateString = moment(momentStartDate).format('MMM DD, YYYY')
		return `${item.email} | ${startDateString}`;
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
		
		return assignmentType;
	}
	const getApplStatusImage = (details) =>{
		let strApplied = details.applicationStage.applied;
		let strInprocess = details.applicationStage.inprocess;
		let strOffer = details.applicationStage.offer;
		let applicationStatus = details.applicationStatus;
	
		if ( strApplied == "wip" ) {
			return require('../../../assets/Images/ApplicationStages/application_stage1.png')
		}else if ( strApplied == "no" ){
			return require('../../../assets/Images/ApplicationStages/application_stage1a.png')
		}else if ( strApplied =="failed" ){
			return require('../../../assets/Images/ApplicationStages/application_stage2.png')
		}else if ( strInprocess == "wip" ){
			return require('../../../assets/Images/ApplicationStages/application_stage3.png')
		}else if ( strInprocess == "no" || strInprocess =="failed" ){
			return require('../../../assets/Images/ApplicationStages/application_stage4.png')
		}else if ( strOffer == "no"  || strOffer =="failed" ){
			return require('../../../assets/Images/ApplicationStages/application_stage5.png')
		}else if ( strOffer =="yes" ){
			return require('../../../assets/Images/ApplicationStages/application_stage6.png')
		}else if ( strOffer =="wip" ){
			return require('../../../assets/Images/ApplicationStages/application_stage7.png')
		}else{
			return require('../../../assets/Images/ApplicationStages/application_stage1.png')
		}
	}
	const getJobDetails = async (jobID) => {
        setIsLoading(true);

        let user = await AsyncStorage.getItem('loginDetails');  
        var token  = "U3RhZmZMaW5lQDIwMTc=";
        if(user){
            let parsed = JSON.parse(user);  
            let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
            token = base64.encode(userAuthToken);
        }    
		console.log(BaseUrl + "jobs/" + ''+jobID)
        axios ({
          "method": "GET",
          "url": BaseUrl + "jobs/" + ''+jobID,
          "headers": getAuthHeader(token),
        })
        .then((response) => {
            setIsLoading(false);
          if (response.data.code == 200){
			navigation.navigate("JobDetails", {jobDetail: response.data.content.dataList[0]});
          }else if (response.data.code == 417){
            setIsLoading(false);
            const errorList = Object.values(response.data.content.messageList);
            Alert.alert(StaticMessage.AppName, errorList.join(), [
              {text: 'Ok'}
            ]);
    
          }else{
    
          }
        })
        .catch((error) => {
			console.log(error)
            setIsLoading(false);
            Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
                {text: 'Ok'}
            ]);
        })
    }
	let message = "Help a friend find a job and earn referral rewards. Find and refer any jobs that would be a good match for anyone in your network. Your opportunity to earn referral rewards could be substantial and limitless.";
  	return(
		<SafeAreaView style={styles.container}>
			{jobReferredArray.length > 0 ?
			<FlatList style={{}}
				data={jobReferredArray}
				keyExtractor={(item, index) => index.toString()}
				renderItem={({item,index}) => 
					<View style={{backgroundColor:'white', marginBottom:8, paddingTop:8, paddingBottom:8}}>
						<View style={{paddingLeft:16, paddingRight:16, marginBottom:4}}>
							<View style={{flexDirection:'row', alignItems: 'center', justifyContent: 'center'}}>
								<TouchableOpacity style={{flex:1}} onPress={() => {getJobDetails(item.jobId)}}>
									<Text style={{color:ThemeColor.NavColor, fontSize:16,fontFamily: FontName.Regular, flex:1}}>{item.jobTitle}</Text>
								</TouchableOpacity>
							</View>
							<View style={{flexDirection:'row', marginTop:2}}>
								<Text style={{color:ThemeColor.LabelTextColor, fontSize:14,fontFamily: FontName.Regular}}>Referred to </Text>
								<Text style={{color:ThemeColor.TextColor, fontSize:14,fontFamily: FontName.Regular}}>{`${item.firstName} ${item.lastName}`}</Text>
							</View>
							<Text style={{color:ThemeColor.TextColor, fontSize:14,fontFamily: FontName.Regular, marginTop:2}}>{getEmailAndDate(item)}</Text>
							<View style={{flexDirection:'row', alignItems: 'center', justifyContent: 'center'}}>
								<Text style={{color:ThemeColor.SubTextColor, fontSize:14,fontFamily: FontName.Regular, marginTop:2, flex:1}}>{getApplicationAttributes(item)}</Text>
								<TouchableOpacity onPress={() => setShowProgressCellIndex(index == showProgressCellIndex ? -1 : index)}>
									<Text style={{color:ThemeColor.BtnColor, fontSize:12,fontFamily: FontName.Regular, marginTop:4}}>{showProgressCellIndex == index ? 'Hide progress' : 'Show progress'}</Text>						
								</TouchableOpacity>
							</View>
						</View>
						<View style={{backgroundColor:ThemeColor.BorderColor, height:1, marginTop:8}}/>
						<View style={{height:30, justifyContent:'center',alignItems:'center'}}>
							<Text style={{color:item.status =='Pending' ? ThemeColor.RedColor : ThemeColor.GreenColor, fontSize:12,fontFamily: FontName.Regular, marginTop:4}}>{item.applicationStatus}</Text>						
						</View>
						{showProgressCellIndex == index && <View style={{height:1, backgroundColor:ThemeColor.BorderColor, marginTop:8}} />}
						{showProgressCellIndex == index && 
						<View style={{height:40, alignItems: 'center', justifyContent: 'center',paddingLeft:16, paddingRight:16}}>
							<Image style={{width:'100%', height:30, marginTop:8}} source={getApplStatusImage(item)} /> 
					  	</View>
					  }
					</View>
				}
			/> :
				<View style={{flex:1,justifyContent:'center', padding:16, justifyContent:'center', alignItems:'center'}}>
					<Text style={{color:ThemeColor.TextColor, fontSize:16,fontFamily: FontName.Regular, textAlign:'center'}}>{message}</Text>
					<TouchableOpacity style={{backgroundColor:ThemeColor.BtnColor, height:40, justifyContent:'center', borderRadius:5,width:180, marginTop:16}} onPress={() => navigation.navigate('Find jobs')}>
						<Text style={{color:'white', fontSize:16,fontFamily: FontName.Regular, textAlign:'center'}}>FIND JOBS</Text>
					</TouchableOpacity>
				</View> 
			}
			<Loader isLoading={isLoading} />
		</SafeAreaView>	
	);
}

export default JobReferralsScreen;

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
