/* eslint-disable react/display-name */
import React , {useEffect,useRef, useState} from "react";
import { View,
    Text,
    StyleSheet,
    Alert,
    SafeAreaView,
    TouchableOpacity,
    FlatList,
    TextInput,
    Image,
	Dimensions,
	KeyboardAvoidingView,
	} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'
import axios from 'axios';
import Feather from 'react-native-vector-icons/Feather';
import moment from 'moment';
import * as ImagePicker from 'react-native-image-picker';
import RNFS from 'react-native-fs';
import DocumentPicker from 'react-native-document-picker';
import dismissKeyboard from 'react-native-dismiss-keyboard';
import ActionSheet from 'react-native-actionsheet'

import { BaseUrl, EndPoints, MessageGroupId, StaticMessage, ThemeColor, FontName } from '../../_helpers/constants';
import { getAuthHeader} from '../../_helpers/auth-header';
import Loader from '../../Components/Loader';
import { AuthContext } from '../../Components/context';


const ChatScreen = ({route,navigation}) => {
	const { signOut } = React.useContext(AuthContext);
  	let [isLoading, setIsLoading] = React.useState(false);
	const [messagesArray,setMessagesArray] = React.useState([]);
	let [base64Data, setBase64Data] = React.useState('');
	const [pickedImage, setPickedImage] = useState('');
	const [messagesID,setMessagesID] = React.useState('');
	const [selectdFeedback,setSelectedFeedback] = React.useState(0);
	const [feedback,setFeedback] = React.useState('');
	const [forcedChatOpen,setForsedChatOpen] = React.useState(false);
	const actionsheetFile = useRef();

	const [data, setData] = React.useState({
		message:'',
		resumeTitle:'',
		resumeData:'',
		fileName:''
	});

	const { groupDetail } = route.params;
	const { conversations } = route.params;
	const { oldMessage } = route.params;
	const { recruiterDetails } = route.params;

	const getSeverityText = (item) => {
		console.log(JSON.stringify(conversations))
		var groupTitle = conversations.groupTitle;

		if(groupDetail.groupId == MessageGroupId.MyRecruiterID){
			groupTitle = `${recruiterDetails.firstName} ${recruiterDetails.lastName} (My recruiter)`
		}else if(groupDetail.groupId == MessageGroupId.JobSupportID){
			groupTitle = `${conversations.jobTitle}`
		}
		let severityId = conversations.severityId;
		if(severityId === 13103){
			return `!! ${groupTitle}`;
		}else if(severityId === 13102){
			return `! ${groupTitle}`;
		}{
			return `${groupTitle}`;
		}
	}
	React.useLayoutEffect(() => {
		var navigationTitle = 'Conversassions';
		if(conversations){
			navigationTitle = getSeverityText()
		}
		
		navigation.setOptions({
		  headerRight: () => (
			<View style={{backgroundColor:'#B8F992',borderRadius:8, padding:2, paddingLeft:8, paddingRight:8,marginBottom:28, marginRight:8}}>
				<Text style={{fontFamily: FontName.Regular, fontSize:8,color:'black',  textAlign:'center'}}>{conversations.issueType}</Text>
			</View>
		
		  ),
		  title: navigationTitle,
		});
	  }, [navigation]);

	useEffect(() => {
		if(oldMessage){
			console.log('oldMessage:',oldMessage);
			saveChatHistoryList(oldMessage);
		}else{
			getMessageList();
		}
		navigation.addListener('focus', () => {
			getMessageList();
		});
		
	}, []);

	const  saveChatHistoryList = async(messageList) => {
		let user = await AsyncStorage.getItem('loginDetails'); 
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken);    
		setIsLoading(true);

		let params = {
			'groupId':groupDetail.groupId,
			'messages':messageList,
		}

		axios ({  
		  "method": "POST",
		  "url": BaseUrl + EndPoints.SaveChatHistory,
		  "headers": getAuthHeader(authToken),
		  data:params
		})
		.then((response) => {
			setIsLoading(false);
			if (response.data.code == 200){
				let resultObject = response.data.content.dataList[0];
				
				console.log('Save Chat history:',JSON.stringify(resultObject));
				var resultArr = resultObject.messages;
				var filterArray = resultArr.filter(
					data => data.isForwardedMessage === true,
				);
				let index = resultArr.indexOf(filterArray[filterArray.length - 1]);
				if(index > 0){
					resultArr.splice( index+1, 0, {'posterType':-1,
					'messageBody':{'type':'forwaded',"content" :""},
					"sentBy" : "forwaded",
					"timeStamp" : ""} );
				}
				
				setMessagesArray(resultArr);

				conversations['chatId'] = resultObject.chatId;
				conversations['severityId'] = resultObject.severityId;
				conversations['severity'] = resultObject.severity;
				conversations['issueType'] = resultObject.issueType;
				conversations['issueTypeId'] = resultObject.issueTypeId;
				conversations['issueType'] = resultObject.issueType;
				setMessagesID(resultObject.lastMessageId);


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
			if(error.response && error.response.status == 401){
				SessionExpiredAlert();
			}else{
				Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
					{text: 'Ok'}
				  ]);
			}
			console.log('Error:',error);      
		})
	}

	const  getMessageList = async() => {
		if(!conversations.chatId){
			return;
		}
		let user = await AsyncStorage.getItem('loginDetails'); 
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken);    
		setIsLoading(true);

		axios ({  
		  "method": "POST",
		  "url": BaseUrl + EndPoints.MessageList,
		  "headers": getAuthHeader(authToken),
		  data:{'chatId':conversations.chatId}
		})
		.then((response) => {
			setIsLoading(false);
			if (response.data.code == 200){
				console.log('Message List:' + JSON.stringify(response.data.content.dataList));
				let resultArr = response.data.content.dataList;
				setMessagesID(resultArr[resultArr.length - 1].messageId);
				var filterArray = resultArr.filter(
					data => data.isForwardedMessage === true,
				);
				let index = resultArr.indexOf(filterArray[filterArray.length - 1]);
				if(index > 0){
					resultArr.splice( index+1, 0, {'posterType':-1,
					'messageBody':{'type':'forwaded',"content" :""},
					"sentBy" : "forwaded",
					"timeStamp" : ""} );
				}
				
				setMessagesArray(resultArr);
			}else if (response.data.code == 417){
				console.log(Object.values(response.data.content.messageList));
				const errorList = Object.values(response.data.content.messageList);
				Alert.alert(StaticMessage.AppName, errorList.join() + 'test', [
				{text: 'Ok'}
				]);
		
			}else if (response.data.code == 401){
				console.log('Session Expired Already');
				SessionExpiredAlert();
			}
		})
		.catch((error) => {
			setIsLoading(false);
			if(error.response && error.response.status == 401){
				SessionExpiredAlert();
			}else{
				Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
					{text: 'Ok'}
				  ]);
			}
			console.log('Error:',error);      
		})
	}
	const  updateMessageList = async() => {
		let user = await AsyncStorage.getItem('loginDetails'); 
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken);    
		setIsLoading(false);

		axios ({  
		  "method": "POST",
		  "url": BaseUrl + EndPoints.MessageList,
		  "headers": getAuthHeader(authToken),
		  data:{'chatId':conversations.chatId,'messageId':messagesID}
		})
		.then((response) => {
			setIsLoading(false);
			if (response.data.code == 200){
				let resultArr = response.data.content.dataList;
				setMessagesID(resultArr[resultArr.length - 1].messageId);

				setMessagesArray(messagesArray.concat(resultArr));
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
			if(error.response && error.response.status == 401){
				SessionExpiredAlert();
			}else{
				Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
					{text: 'Ok'}
				  ]);
			}
			console.log('Error:',error);      
		})
	}
	const  handleChatFeedback = async() => {
		let user = await AsyncStorage.getItem('loginDetails'); 
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken);    
		setIsLoading(true);

		let params = {
			'chatId':conversations.chatId,
			'feedbackComments':feedback,
			'feedbackPoints': '' + selectdFeedback,
		}

		axios ({  
		  "method": "POST",
		  "url": BaseUrl + EndPoints.ChatFeedback,
		  "headers": getAuthHeader(authToken),
		  data:params
		})
		.then((response) => {
			setIsLoading(false);
			if (response.data.code == 200){
				console.log('Send Result:',JSON.stringify(response.data.content.messageList));
				let messageDict = response.data.content.messageList;
				Alert.alert(StaticMessage.AppName, 'Thank you for your valuable feedback.', 
				[{
					text: 'Ok',
					onPress: () => navigation.goBack()
				}]);
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
			if(error.response && error.response.status == 401){
				SessionExpiredAlert();
			}else{
				Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
					{text: 'Ok'}
				  ]);
			}
			console.log('Error:',error);      
		})
	}
	const handleTapToOpenChat = () => {
		setForsedChatOpen(true);
	}

	const  handleSendMessage = async() => {
		let user = await AsyncStorage.getItem('loginDetails'); 
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken);    
		setIsLoading(true);

		let params = {
			'chatId':conversations.chatId,
			'messageBody':data.message,
			'recipientId':conversations.recipientId,
			'groupId':conversations.groupId,
			'issueType':conversations.issueTypeId,
			'severity':conversations.severityId,
			'jobId':conversations.jobId,
			'messageId':messagesID
		}

		axios ({  
		  "method": "POST",
		  "url": BaseUrl + EndPoints.SendMessage,
		  "headers": getAuthHeader(authToken),
		  data:params
		})
		.then((response) => {
			setIsLoading(false);
			if (response.data.code == 200){
				let resultArr = response.data.content.dataList;
				
				console.log('Send Result:',JSON.stringify(resultArr));
				setData({...data,message:''});
				updateMessageList();

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
			if(error.response && error.response.status == 401){
				SessionExpiredAlert();
			}else{
				Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
					{text: 'Ok'}
				  ]);
			}
			console.log('Error:',error);      
		})
	}
	const SessionExpiredAlert = () =>{
		Alert.alert(StaticMessage.AppName,StaticMessage.SessionExpired,
			[{
			  text: 'Ok',
			  onPress: () => signOut()
		  }]
	)}
	
	const handleDocActionsheet = (index) => {
        if(index == 0){
            imageGalleryLaunch();
        }else if(index == 1){
            cameraLaunch();
        }
    }
    
    const showActionSheet = () => {
      actionsheetFile.current.show();
    }
	const selectDocument = async () => {
        try {
            const res = await DocumentPicker.pick({
                type: [DocumentPicker.types.pdf,DocumentPicker.types.doc,DocumentPicker.types.docx,DocumentPicker.types.plainText],
            });
			var newURI = res[0].uri.split("%20").join("\ ");
            var base64data = await RNFS.readFile( newURI, 'base64').then(res => { return res });
            setData({...data,resumeData:base64data,fileName:res[0].name});
			navigation.navigate('ChatAttachments',{conversations:conversations,groupDetail:groupDetail,base64File:base64data,fileName:res.name,fileType:'Document',fileURL:res.uri});
        } catch (err) {
            if (DocumentPicker.isCancel(err)) {
            } else {
                throw err;
            }
        }
    }
	const imageGalleryLaunch = () => {

		let options = {
		  storageOptions: {
			skipBackup: true,
			path: 'images',
		  },maxWidth: 500,
		  maxHeight: 700,
		  quality: 1
		};
	  
		ImagePicker.launchImageLibrary(options, async(res) => {
		  console.log('Response = ', res);
	  
		  if (res.didCancel) {
			console.log('User cancelled image picker');
		  } else if (res.error) {
			console.log('ImagePicker Error: ', res.error);
		  } else if (res.customButton) {
			console.log('User tapped custom button: ', res.customButton);
			alert(res.customButton);
		  } else {
			console.log('response', JSON.stringify(res));
			setPickedImage(res.assets[0].uri);
			var base64data = await RNFS.readFile( res.assets[0].uri, 'base64').then(res => { return res });
			setBase64Data(base64data);
			navigation.navigate('ChatAttachments',{conversations:conversations,groupDetail:groupDetail,base64File:base64data,fileName:'text.jpg',fileType:'Image',messagesArray:messagesArray});
	
		  }
		});
	}
	const cameraLaunch = () => {
		let options = {
		  storageOptions: {
			skipBackup: true,
			path: 'images',
		  },maxWidth: 500,
		  maxHeight: 500,
		  quality: 0.5
		};
		ImagePicker.launchCamera(options, async (res) => {
		  console.log('Response = ', res);
	
		  if (res.didCancel) {
			console.log('User cancelled image picker');
		  } else if (res.error) {
			console.log('ImagePicker Error: ', res.error);
		  } else if (res.customButton) {
			console.log('User tapped custom button: ', res.customButton);
			alert(res.customButton);
		  } else {
			const source = { uri: res.uri };
			console.log('response', JSON.stringify(res));
			setPickedImage(res.assets[0].uri);
			var base64data = await RNFS.readFile( res.assets[0].uri, 'base64').then(res => { return res });
			setBase64Data(base64data);
			navigation.navigate('ChatAttachments',{conversations:conversations,groupDetail:groupDetail,base64File:base64data,fileName:'text.jpg',fileType:'Image',messagesArray:messagesArray});
		  }
		});
	}

	const getFormatedDate=(item) =>{
		let momentStartDate = moment(item.createdDate, 'YYYY-MM-DDTHH:mm:ssZZ');
		let startDateString = moment(momentStartDate).format('ddd, DD MMM, hh:mm A');
	  
		return `${startDateString}`;
	}
	const getMessageText = (item) => {
		if(item.messageBody.type === 'content'){
			return item.messageBody.content;
		}else{
			return 'Sample';
		}
	}
	let myList = useRef();
	console.log('Message Array: ' + JSON.stringify(messagesArray));
	let lastMessage = messagesArray.length > 0 ? messagesArray[messagesArray.length - 1] : null;
  	var isFeedbackSent = lastMessage ? lastMessage.feedbackSent : false;
	var isComplete = lastMessage ? lastMessage.isComplete : false;
	if(forcedChatOpen){
		isFeedbackSent = isComplete = false;
	}
	return (
		  	<SafeAreaView style={styles.container}>
			<View style={{padding:8, backgroundColor:ThemeColor.SubHeaderColor}} >
				<Text style={{color:ThemeColor.OrangeColor ,fontFamily:FontName.Regular,fontSize:12, textAlign: 'center'}}>Response time is based on team availability. If response time exceeds 24hrs, please contact support (609)606-9010.</Text>
			</View>
			<FlatList style={{backgroundColor:'#fff', paddingTop:16}}
				data={messagesArray}
				ref={myList}
				keyExtractor={(item, index) => index.toString()}
				onContentSizeChange={()=> myList.current?.scrollToEnd()}
				renderItem={({item,index}) => 
					<View style={{paddingLeft:16, paddingRight:16, paddingBottom:12}}>
						{
							item.posterType === 1 && item.messageBody.type === 'content'?
							<View style={{alignSelf:'flex-end' ,backgroundColor:ThemeColor.SkyBlueColor, padding:8,paddingLeft:8, paddingRight:8,maxWidth:'80%', minWidth:'40%',borderRadius:5, borderWidth:1, borderColor:ThemeColor.BorderColor, marginBottom: index == messagesArray.length -1 ? 12 : 0}}>
								<Text style={{color:ThemeColor.TextColor, fontSize:14 ,fontFamily:FontName.Regular}}>{getMessageText(item)}</Text>
								<Text style={{fontFamily: FontName.Regular, fontSize:10,color:ThemeColor.LabelTextColor,textAlign:'right', marginTop:8}}>{getFormatedDate(item)}</Text>

							</View> : null
						}
						{
						(item.posterType === 0 || item.posterType == -1) && item.messageBody.type == 'content' ?
						<View style={{alignSelf:'flex-start' ,backgroundColor:'#fff', padding:8,paddingLeft:8, paddingRight:8,maxWidth:'80%', minWidth:'40%',borderRadius:5, borderWidth:1, borderColor:ThemeColor.BorderColor, marginBottom:8}}>
							<Text style={{color:ThemeColor.TextColor, fontSize:14 ,fontFamily:FontName.Regular}}>{getMessageText(item)}</Text>
							<Text style={{fontFamily: FontName.Regular, fontSize:10,color:ThemeColor.LabelTextColor,textAlign:'right', marginTop:8}}>{getFormatedDate(item)}</Text>

						</View> : null
						}
						{
						item.messageBody.type === 'download' ?
						<View style={{ flex:1,flexDirection:'row',alignItems: 'center',alignSelf:'flex-end', marginBottom:8}}>
							<View style={{backgroundColor:ThemeColor.SkyBlueColor,borderRadius:5, borderWidth:1, borderColor:ThemeColor.BorderColor, width:150, padding:4}}>
								<Image resizeMode='cover' style={{height:160, width:'100%',borderRadius:5}} source={{uri: item.messageBody.download[0].url}} defaultSource={require('../../assets/Images/LoginBG.png')}/>

								<Text style={{fontFamily: FontName.Regular, fontSize:14,color:ThemeColor.TextColor, marginTop:8}}>{item.messageBody.download[0].title}</Text>
								<Text style={{fontFamily: FontName.Regular, fontSize:10,color:ThemeColor.LabelTextColor,textAlign:'right', marginTop:8}}>{getFormatedDate(item)}</Text>

							</View>
						</View> : null
						}
						{
						item.messageBody.type === 'chip' ?
						<View style={{ flex:1,flexDirection:'row',alignItems: 'center'}}>
							<FlatList
								horizontal
								data={item.messageBody ? item.messageBody.chip : item.chip}
								keyExtractor={(item, index) => index.toString()}
								renderItem={({item}) => 
								<View  style={[styles.chipItem]}>
									<Text style={[styles.chipTitle]}>{item}</Text>
								</View>
								}
							/>
						</View> : null
						}
						{
						item.messageBody.type === 'link'?
						<View style={{ flex:1,flexDirection:'row',alignItems: 'center'}}>
							<FlatList
								horizontal
								data={item.messageBody.link}
								keyExtractor={(item, index) => index.toString()}
								renderItem={({item}) => 
								<View  style={[styles.chipItem]}>
									<Text style={[styles.chipTitle]}>{item.text}</Text>
								</View>
								}
							/>
						</View> : null
						}
						{
						item.messageBody.type === 'carousel'?
						<View style={{ flex:1}}>
							<FlatList
								horizontal
								data={item.messageBody.carousel}
								keyExtractor={(item, index) => index.toString()}
								renderItem={({item}) => 
								<View  style={{borderRadius:5, width:Dimensions.get('window').width * 0.85, marginRight:8, backgroundColor:ThemeColor.ViewBgColor}}>
									<Image resizeMode='cover' style={{height:160, width:'100%',}} source={{uri: item.image.url}} defaultSource={require('../../assets/Images/LoginBG.png')}/>
									<Text style={{color:ThemeColor.TextColor,fontSize:16, fontFamily: FontName.Regular, marginTop:8, marginLeft:4, paddingRight:4}}>{item.title}</Text>
									<Text style={{color:ThemeColor.SubTextColor,fontSize:14, fontFamily: FontName.Regular, marginTop:4,marginLeft:4, paddingRight:4}}>{item.description}</Text>
									<FlatList style={{width:'100%', marginBottom:8, marginTop:8}}
										horizontal
										showsHorizontalScrollIndicator={false}
										scrollEnabled={false}
										data={item.buttons}
										keyExtractor={(item, index) => index.toString()}
										renderItem={({item}) => 
										<View  style={[styles.chipItem]}>
											<Text style={[styles.chipTitle]}>{item.text}</Text>
										</View>
										}
									/>
								</View>
								}
							/>
							<Text style={{fontFamily: FontName.Regular, fontSize:10,color:ThemeColor.LabelTextColor}}>{getFormatedDate(item)}</Text>

						</View> : null
						}
						{
							item.messageBody.type === 'forwaded'?
							<View style={{alignSelf:'center', padding:8,maxWidth:'100%'}}>
								<Text style={{color:ThemeColor.TextColor, fontSize:14 ,fontFamily:FontName.Regular}}>------- Forwarded by Sia -------</Text>
							</View> : null
						}
					</View>
				}
			/>
			{isComplete || isFeedbackSent ? 
				<KeyboardAvoidingView style={{backgroundColor:'white'}} enabled behavior={"padding"} keyboardVerticalOffset={Platform.select({ ios: 85, android: 85 })}>
					<View style={{backgroundColor:ThemeColor.ViewBgColor, padding:16,paddingRight:16, flexDirection:'column'}}>
						<Text style={{color:ThemeColor.TextColor ,fontFamily:FontName.Regular,fontSize:14,alignSelf:'baseline'}}>This ticket is closed. If it is not resolved up to your satisfaction then  
							<Text onPress={() =>{handleTapToOpenChat()}} style={{color:ThemeColor.NavColor ,fontFamily:FontName.Regular,fontSize:14,}}> Click here.</Text>
						</Text>
					</View>
					{!isFeedbackSent &&
						<View>
						<Text style={{color:ThemeColor.TextColor ,fontFamily:FontName.Regular,fontSize:14, paddingLeft:16, marginTop:8}}>How was your experience?</Text>
						<View style={{paddingLeft:16, marginTop:8, marginBottom:8, flexDirection:'row'}}>
							<TouchableOpacity style={{height:60, width:90, borderWidth:1, borderColor: selectdFeedback == 1 ? ThemeColor.NavColor : ThemeColor.BorderColor,borderRadius:5, backgroundColor:ThemeColor.ViewBgColor, justifyContent:'center',alignItems:'center'}} 
								onPress={() => setSelectedFeedback(1)}>
								<Image style={{ width: 25,height: 25,tintColor:selectdFeedback == 1 ? ThemeColor.NavColor : ThemeColor.SubTextColor}} source={require('../../assets/Images/happiness.png')} /> 
								<Text style={{color:selectdFeedback == 1 ? ThemeColor.NavColor : ThemeColor.SubTextColor ,fontFamily:FontName.Regular,fontSize:14, textAlign: 'center',marginTop:4}}>Good</Text>
							</TouchableOpacity>
							<TouchableOpacity style={{height:60, width:90, borderWidth:1, borderColor:selectdFeedback == 2 ? ThemeColor.NavColor : ThemeColor.BorderColor,borderRadius:5, backgroundColor:ThemeColor.ViewBgColor, justifyContent:'center',alignItems:'center', marginLeft:16}}
							onPress={() => setSelectedFeedback(2)}>
								<Image style={{ width: 25,height: 25,tintColor:selectdFeedback == 2 ? ThemeColor.NavColor : ThemeColor.SubTextColor}} source={require('../../assets/Images/indifferent.png')} /> 
								<Text style={{color:selectdFeedback == 2 ? ThemeColor.NavColor : ThemeColor.SubTextColor ,fontFamily:FontName.Regular,fontSize:14, textAlign: 'center',marginTop:4}}>Not so good</Text>
							</TouchableOpacity>
							<TouchableOpacity style={{height:60, width:90, borderWidth:1, borderColor:selectdFeedback == 3 ? ThemeColor.NavColor : ThemeColor.BorderColor,borderRadius:5, backgroundColor:ThemeColor.ViewBgColor, justifyContent:'center',alignItems:'center',marginLeft:16}}
							onPress={() => setSelectedFeedback(3)}>
								<Image style={{ width: 25,height: 25,tintColor:selectdFeedback == 3 ? ThemeColor.NavColor : ThemeColor.SubTextColor}} source={require('../../assets/Images/frown-face.png')} /> 
								<Text style={{color:selectdFeedback == 3 ? ThemeColor.NavColor : ThemeColor.SubTextColor ,fontFamily:FontName.Regular,fontSize:14, textAlign: 'center', marginTop:4}}>Bad</Text>
							</TouchableOpacity>
						</View>
						<TextInput  
							style={styles.feedbackText}
							placeholder="Enter feedback" 
							placeholderTextColor={ThemeColor.PlaceHolderColor}
							keyboardType='default'
							multiline={true}
							value= {feedback}
							onChangeText={(val) => setFeedback(val)}
						/>
						<TouchableOpacity style={styles.btnFill} onPress={() => {handleChatFeedback()}}>
							<Text style={{color:'#53962E',fontFamily: FontName.Regular, fontSize:16, color:'#fff' }}>SEND</Text>
						</TouchableOpacity>
						</View>
					}
				</KeyboardAvoidingView> : 
				<KeyboardAvoidingView keyboardVerticalOffset={Platform.select({ ios: 85, android: 0 })}>
					<View style={{flexDirection:'row', paddingTop:8, paddingBottom:8, backgroundColor:ThemeColor.ViewBgColor}}>
						<TouchableOpacity style={{width:40, height:40, justifyContent: 'center', alignItems: 'center'}} onPress = {() => showActionSheet()}>
							<Feather name="plus" color={ThemeColor.BtnColor} size={25} />
						</TouchableOpacity>
						<ActionSheet
							ref={actionsheetFile}
							options={['Photo library','Take photo', 'Cancel']}
							cancelButtonIndex={2}
							onPress={(index) => { handleDocActionsheet(index) }}
						/>
						<TextInput  
							style={styles.inputText}
							placeholder="Enter message" 
							placeholderTextColor={ThemeColor.PlaceHolderColor}
							// multiline={true}
							value= {data.message}
							returnKeyType="done"
							onChangeText={(val) => setData({...data,message:val})}
							onSubmitEditing={() => {dismissKeyboard()}}
							/>
						<TouchableOpacity style={{width:40, height:40, justifyContent: 'center', alignItems: 'center'}} onPress={() => {handleSendMessage()}}>
							<Image style={{width:30,height:30}} source={require('../../assets/Images/iconSend.png')} />
						</TouchableOpacity>
					</View>	
				</KeyboardAvoidingView>
			}
			
        	<Loader isLoading={isLoading} />
		  </SafeAreaView>

    );
}
export default ChatScreen;


const styles = StyleSheet.create({
    container: {
      flex: 1,
	  backgroundColor:ThemeColor.ViewBgColor,
    },inputView:{
        flexDirection:'row',
        paddingLeft:16,
        paddingRight:16,
        height:40,
        alignItems:"center", 
        backgroundColor:ThemeColor.BorderColor
      },
      inputText:{
		flex: 1,
		backgroundColor:'white',
		minHeight:35,
		maxHeight:100,
		color:'black',
		fontSize:16,
		fontFamily: FontName.Regular,
		paddingLeft:8,
		alignContent:'stretch',
		borderRadius:5,
		paddingTop:4, paddingBottom:4,paddingRight:4,marginBottom:8
	  },chipItem: {
		padding: 4,
		marginVertical: 4,
		marginHorizontal: 8,
		borderRadius:20,
		borderColor:ThemeColor.NavColor,
		borderWidth:1,
	  },
	  chipTitle: {
		fontSize: 14,
		paddingLeft:8,
		paddingRight:8,
		color:ThemeColor.NavColor
	  },feedbackText:{
		backgroundColor:'white',
		height:80,
		color:'black',
		fontSize:16,
		fontFamily: FontName.Regular,
		alignContent:'stretch',
		borderRadius:5,
		borderColor:ThemeColor.BorderColor,
		borderWidth:1, margin:16, marginTop:8,
		paddingLeft:8,
		paddingRight:8
	  },btnFill:{
		height:50,
		width:200,
		justifyContent:"center",
		backgroundColor: ThemeColor.BtnColor ,
		alignItems:'center',
		marginBottom:8,
		borderRadius:5,
		alignSelf:'center',
		marginBottom:16,
	  }
  });