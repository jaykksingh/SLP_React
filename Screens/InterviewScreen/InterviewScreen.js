/* eslint-disable react/display-name */
import React , {useEffect} from "react";
import { SafeAreaView, 
    View,
    Text,
    StyleSheet,
    Alert,
    TouchableOpacity,
    FlatList} from "react-native";
import SegmentedControlTab from "react-native-segmented-control-tab";
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'
import axios from 'axios';
import MovableView from 'react-native-movable-view';
import Icon from 'react-native-vector-icons/Ionicons';
import '../../_helpers/global';
import { BaseUrl, EndPoints, MessageGroupId, StaticMessage, ThemeColor, FontName } from '../../_helpers/constants';
import { getAuthHeader} from '../../_helpers/auth-header';
import Loader from '../../Components/Loader';


const InterviewScreen = ({route,navigation}) => {
	let [isLoading, setLoading] = React.useState(false);
	let [selectedIndex, setSelectedIndex] = React.useState(0);
	let [interviewArray, setInterviewArray] = React.useState('');
	let [pastInterviewArray, setPastInterviewArray] = React.useState('');
	let [showProgressCell, setShowProgressCell] = React.useState('');

  
	React.useLayoutEffect(() => {
		navigation.setOptions({
		  title : 'Interviews'
		});
	  }, [navigation]);
	useEffect(() => {
		getMyInterviews('upcomming');
		if(navigation.dangerouslyGetParent){
			const parent = navigation.dangerouslyGetParent();
			parent.setOptions({
			tabBarVisible: false
			});
			return () =>
			parent.setOptions({
				tabBarVisible: true
			});
		}
	},[]);

  
	const handleIndexChange = (index) => {
		setSelectedIndex(index);
		console.log("Index:", index);
		if(index == 1){
			getMyInterviews('upcomming');
		}else{
			getMyInterviews('past');
		}
	}
  	const handleShowProgress = (details) => {
		if(showProgressCell == details.Job_Resume_Id){
			setShowProgressCell('');
		}else{
			setShowProgressCell(details.Job_Resume_Id);
		}
		console.log("ShowProgressCell:", showProgressCell);
	}

	const getMyInterviews = async (applicatonType) => {
		setLoading(true);

		let user = await AsyncStorage.getItem('loginDetails');  
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var encoded = base64.encode(userAuthToken);

		axios ({
		"method": "POST",
		"url": BaseUrl + EndPoints.InterviewList,
		"headers": getAuthHeader(encoded),
		data:{"type":applicatonType}
		})
		.then((response) => {
		setLoading(false);
		if (response.data.code == 200){
			if(applicatonType == 'upcomming'){
				setInterviewArray(response.data.content.dataList);
			}else{
				setPastInterviewArray(response.data.content.dataList);
			}
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

	const getJobDetails = async (details) => {
		if(details.SelfApplied == 'n'){
		return;
		}
		setLoading(true);

		let user = await AsyncStorage.getItem('loginDetails');  
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var encoded = base64.encode(userAuthToken);

		console.log('URL:',BaseUrl + "jobs/" + details.jobId);

		axios ({
		"method": "GET",
		"url": BaseUrl + "jobs/" + details.jobId,
		"headers": getAuthHeader(encoded),
		})
		.then((response) => {
			setLoading(false);
		if (response.data.code == 200){
			console.log('Responce :',response.data.content.dataList[0])
			navigation.navigate("Job Details", {jobDetail: response.data.content.dataList[0]});
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

  	return (
		<SafeAreaView style={[styles.container,{backgroundColor:ThemeColor.ViewBgColor,}]}>
			<View style={{alignItems:'center', justifyContent:'center', height:50, marginTop:8}}>
			<SegmentedControlTab
				tabStyle ={{ borderColor: ThemeColor.BtnColor}}
				activeTabStyle={{ backgroundColor: ThemeColor.BtnColor  }}
				tabsContainerStyle={{ height: 30, width:'70%', tintColor:ThemeColor.BtnColor, borderColor:ThemeColor.BtnColor }}
				values={["Upcoming", "Past"]}
				tabTextStyle={{ color: ThemeColor.BtnColor }}
				activeTabTextStyle={{ color: '#fff' }}
				selectedIndex={selectedIndex}
				onTabPress={ (index) => {handleIndexChange(index)}}
			/>
			</View>
			{interviewArray.length > 0 || pastInterviewArray.length > 0 ?
			 <FlatList style={{}}
				data={selectedIndex == 0 ? interviewArray : pastInterviewArray}
				keyExtractor={(item, index) => item.Job_Resume_Id}
				renderItem={({item}) => 
				<View style={{backgroundColor:'#fff',paddingTop:8,marginBottom:8}}>
					<View style={{paddingLeft:16, paddingRight:16}}>
						<View style={{flexDirection:'row', justifyContent: 'flex-end'}}>
							<Text style={{color:ThemeColor.SubTextColor, fontSize:12, fontFamily: FontName.Regular}}>Applied: </Text>
							<Text style={{color:ThemeColor.TextColor, fontSize:12, fontFamily: FontName.Regular}}>Aug 10. 2017</Text>
						</View>
						<Text style={{color:ThemeColor.NavColor, fontSize:16, fontFamily: FontName.Regular}}>{item.jobTitle}</Text>
						{item.employerName.length > 0 && <Text style={{color:ThemeColor.TextColor, fontSize:14, fontFamily: FontName.Regular, marginTop:2}}>{item.employerName}</Text>}
						<View style={{flexDirection:'row', marginTop:2}}>
							<Text style={{color:ThemeColor.SubTextColor, fontSize:12, fontFamily: FontName.Regular}}>Interview date & time: </Text>
							<Text style={{color:ThemeColor.TextColor, fontSize:12, fontFamily: 'Lato-Bold'}}>Jun 18. 2017, 06:50 AM</Text>
						</View>
						<View style={{flexDirection:'row', marginTop:2}}>
							<Text style={{color:ThemeColor.SubTextColor, fontSize:12, fontFamily: FontName.Regular}}>Interview type: </Text>
							<Text style={{color:ThemeColor.TextColor, fontSize:12, fontFamily: FontName.Regular}}>In person</Text>
						</View>
						<View style={{flexDirection:'row', marginTop:2}}>
							<Text style={{color:ThemeColor.SubTextColor, fontSize:12, fontFamily: FontName.Regular}}>Location </Text>
							<Text style={{color:ThemeColor.TextColor, fontSize:12, fontFamily: FontName.Regular}}>11 broadway, suite 632, New York</Text>
						</View>
					</View>
					<View style={{backgroundColor:ThemeColor.BorderColor,height:1,marginTop:8}}/>
					<View style = {{height:40, alignItems: 'center', justifyContent: 'center'}}>
					<Text style={{color:ThemeColor.GreenColor, fontSize:14, fontFamily: FontName.Regular, textAlign: 'center'}}>Interview scheduled</Text>
					</View>
				</View>
				}
			/> : 
			<View style = {{flex:1, justifyContent: 'center', alignItems: 'center'}}>
				<Text style={{color:ThemeColor.TextColor, fontSize:14, fontFamily: FontName.Regular, textAlign: 'center'}}>{selectedIndex == 0 ? 'Do you have an interview scheduled?' : 'Looking for a past interview?'}</Text>
				<TouchableOpacity onPress = {() => {getProfileDetails()}}>
					<Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular, textAlign: 'center'}}>Let your recruiter know</Text>
				</TouchableOpacity>
			</View>}
			<Loader isLoading={isLoading} />
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
export default InterviewScreen;


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
    
      }
  });