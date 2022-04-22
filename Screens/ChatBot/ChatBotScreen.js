/* eslint-disable react/display-name */
import React , {useEffect,useRef, useState} from "react";
import { StatusBar, 
    ScrollView, 
    View,
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
import ActionSheet from "react-native-actions-sheet";
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'
import axios from 'axios';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import moment from 'moment';
import Video from "react-native-video";
import FileViewer from "react-native-file-viewer";
import RNFS from "react-native-fs";
import '../../_helpers/global';
import { BaseUrl,ChatBotHistory,ChatBotSendMessage, EndPoints, MessageGroupId, StaticMessage, ThemeColor, FontName } from '../../_helpers/constants';
import { getAuthHeader} from '../../_helpers/auth-header';
import Loader from '../../Components/Loader';
import { AuthContext } from '../../Components/context';
import WebView from "react-native-webview";



const ChatBotScreen = ({route,navigation}) => {
	const { signOut } = React.useContext(AuthContext);
	const [isLoading, setIsLoading] = React.useState(false);
	const [messagesArray,setMessagesArray] = React.useState([]);
	const [data, setData] = React.useState({
		message:''
	});
	let [profileData, setProfileData] = React.useState({
		empDetails:{
			employeeDetailsId:'',
			profilePicture:'',
			firstName:'',
			lastName:'',
			guid:'283648273648273468237648723', 
		}
	});
	const [chatGroupsArray,setChatGroupsArray] = React.useState([]);
	
	React.useLayoutEffect(() => {
		navigation.setOptions({
		  title: 'Instant support',
		});
	  }, [navigation]);

	useEffect(() => {
		console.log(`Global Variable: ${global.SampleVar}`)

		getProfileDetails();
		navigation.addListener('focus', () => {
			// getMessageList();
		});
		if(global.chatMessageArray.length > 0){
			setMessagesArray(global.chatMessageArray);
		}else{
			let loader = {
				"sentBy" : "user",
				"content" :'',
				"type" : "loader"
			}
			const index = messagesArray.findIndex(item => item.type === 'loader');
			var tempMsgArray = [];
			if(index > -1){
				tempMsgArray.splice(index,1);
			}
			tempMsgArray.push(loader);
			setMessagesArray(tempMsgArray);
			sendMessage('Hi');
		}
		
	}, []);
	const getProfileDetails = async() => {
		let user = await AsyncStorage.getItem('loginDetails');  
		var authToken  = "U3RhZmZMaW5lQDIwMTc=";
		if(user){
			let parsed = JSON.parse(user);  
			let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
			authToken = base64.encode(userAuthToken);
		}
	
		setIsLoading(true);
		axios ({  
		  "method": "GET",
		  "url": BaseUrl + EndPoints.UserProfile,
		  "headers": getAuthHeader(authToken)
		})
		.then((response) => {
			setIsLoading(false);
			if (response.data.code == 200){
				setProfileData(response.data.content.dataList[0]);
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

	const  getMessageList = async() => {
		let user = await AsyncStorage.getItem('loginDetails');  
		var authToken  = "U3RhZmZMaW5lQDIwMTc=";
		if(user){
			let parsed = JSON.parse(user);  
			let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
			authToken = base64.encode(userAuthToken);
		}
		setIsLoading(true);
		console.log('Request:', JSON.stringify({'accessCode':'cgJAk6fdGd4rJLKjI54790jiA','guid':profileData.empDetails.guid,'authCode':authToken}));
		axios ({  
		  "method": "POST",
		  "url": ChatBotHistory,
		  "headers": getAuthHeader(authToken),
		  data:{'accessCode':'cgJAk6fdGd4rJLKjI54790jiA','guid':profileData.empDetails.guid,'authCode':authToken}
		})
		.then((response) => {
			console.log('Chat History: ',JSON.stringify(response.data));
			setIsLoading(false);
			if (response.error){
				console.log(Object.values(response.data.content.messageList));
				const errorList = Object.values(response.data.content.messageList);
				Alert.alert(StaticMessage.AppName, errorList.join(), [
					{text: 'Ok'}
				]);
			}else{
				console.log(`Chat bot Message : ${JSON.stringify(response.data)}`)
				createMessageArray(response.data);
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

	const createMessageArray = (responseData) => {
		var tempMsgArray = [];
		var otherDict = {};
		for(var i = 0; i < responseData.length; i++) {
			let response = responseData[i].response;
			if(response.queryResult){
				let queryResult = response.queryResult;
				if(queryResult.fulfillmentMessages.length > 0){
					let fulfillmentMessages = queryResult.fulfillmentMessages;
					for(var j = 0; j < fulfillmentMessages.length; j++){
						if(fulfillmentMessages[j].text){
							let textObjectArray = fulfillmentMessages[j].text.text;
							for(var k = 0; k < textObjectArray.length; k++){
								let message = textObjectArray[k];
								let msgObj =  {"sentBy" : "bot","content" :message,"type" : "content",'timeStamp':getCurrentDateTimeString()};
								if(message.length > 0){
									tempMsgArray.push(msgObj);
								}
							}
						}else{
							otherDict =  fulfillmentMessages[j];
							console.log("otherDict:",otherDict);
						}
						
					}
				}
				if(queryResult.webhookPayload){
					otherDict = queryResult.webhookPayload;
					otherDict['sentBy'] = 'bot';
					tempMsgArray.push(otherDict);

				}
			}
		}
		console.log('tempMsgArray',tempMsgArray);
		setMessagesArray(tempMsgArray);
		if(tempMsgArray.length == 0){
			// sendMessage('Hi');
		}else{
			global.chatMessageArray = tempMsgArray;
		}
	}
	const  handleSendMessage = async(textMessage) => {
		if(textMessage.replace(/\s/g, '').length == 0){
			return;
		}
		setData({...data,message:''});
		let params = {
			"sentBy" : "user",
			"content" :textMessage,
			"type" : "content",
			"timeStamp" : getCurrentDateTimeString()
		}
		
		console.log('Message::',params);
		var tempMsgArray = messagesArray;
		tempMsgArray.push(params);
		let loader = {
			"sentBy" : "user",
			"content" :'',
			"type" : "loader"
		}
		const index = messagesArray.findIndex(item => item.type === 'loader');
		if(index > -1){
			tempMsgArray.splice(index,1);
		}
		tempMsgArray.push(loader);

		setMessagesArray(tempMsgArray);
		sendMessage(textMessage);
	}
	function userExists(type,arr) {
		return arr.some(function(el) {
		  return el.type === type;
		}); 
	}
	const  sendMessage = async(textMessage) => {
		let user = await AsyncStorage.getItem('loginDetails'); 
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken); 

		
		var guid = profileData.empDetails.guid;
		var employeeDetailsId = profileData.empDetails.employeeDetailsId;
		let params = {
			'query':textMessage,
			'accessCode':'cgJAk6fdGd4rJLKjI54790jiA',
			'guid':guid,
			'employeeId':employeeDetailsId,
			'authCode':authToken
		}

		axios ({  
		  "method": "POST",
		  "url": ChatBotSendMessage,
		  "headers": {'Content-Type':'application/json'},
		  data:params
		})
		.then((response) => {
			if (response.error){
				console.log(Object.values(response.data.content.messageList));
				const errorList = Object.values(response.data.content.messageList);
				Alert.alert(StaticMessage.AppName, errorList.join(), [
					{text: 'Ok'}
				]);
			}else{
				// console.log('Send Message:',JSON.stringify(response.data));
				addMessageToArray(response.data);
			}
		})
		.catch((error) => {
			console.log('Error:',error); 
			var oldMsgArray = messagesArray;
			const index = messagesArray.findIndex(item => item.type === 'loader');
			if(index > -1){
				oldMsgArray.splice(index,1);
			}
			setMessagesArray(messagesArray);     
		})
	}
	const getCurrentDateTimeString=() => {
		let dateTimeString = moment(new Date()).format('DD/MM/YYYY, hh:mm A');
		return dateTimeString;
	}
	const addMessageToArray = (responseData) => {
		var tempMsgArray = [];
		var otherDict = {};
		console.log('responseData', JSON.stringify(responseData));
		if(responseData.queryResult){
			let queryResult = responseData.queryResult;
			if(queryResult.fulfillmentMessages.length > 0){
				let fulfillmentMessages = queryResult.fulfillmentMessages;
				for(var j = 0; j < fulfillmentMessages.length; j++){
					if(fulfillmentMessages[j].text){
						let textObjectArray = fulfillmentMessages[j].text.text;
						for(var k = 0; k < textObjectArray.length; k++){
							let message = textObjectArray[k];
							let msgObj =  {"sentBy" : "bot","content" :message,"type" : "content",'timeStamp':getCurrentDateTimeString()};
							if(message.length > 0){
								tempMsgArray.push(msgObj);
							}
						}
					}else{
						otherDict =  fulfillmentMessages[j];
						console.log("otherDict:",otherDict);
					}
					
				}
			}
			if(queryResult.webhookPayload){
				otherDict = queryResult.webhookPayload;
				otherDict['sentBy'] = 'bot';
				tempMsgArray.push(otherDict);

			}
		}
		
		var oldMsgArray = messagesArray;
		let removed = [];
		const index = messagesArray.findIndex(item => item.type === 'loader');
		if(index > -1){
			oldMsgArray.splice(index,1);
		}
		console.log('tempMsgArray:',removed);
		setMessagesArray([...messagesArray,...tempMsgArray]);
		global.chatMessageArray = [...messagesArray,...tempMsgArray];
	}

	const SessionExpiredAlert = () =>{
		Alert.alert(StaticMessage.AppName,StaticMessage.SessionExpired,
			[{
			  text: 'Ok',
			  onPress: () => signOut()
		  }]
	)}
	


	const getFormatedDate=(item) =>{
		var dateFormat = 'ddd, DD MMM, hh:mm A'
		let momentDate = moment(item.timeStamp, 'DD/MM/YYYY, hh:mm A');
		var msDiff = new Date() - momentDate;    //Future date - current date
		var daysTillNow = Math.floor(msDiff / (1000 * 60 * 60 * 24));
		if(daysTillNow <= 0){
			let dateString = moment(momentDate).format('hh:mm A');
			return dateString;
		}else if(daysTillNow == 1){
			let dateString = moment(momentDate).format('hh:mm A');
			return `Yesterday, ${dateString}`;
		}
		console.log('msDiff:',daysTillNow);
		return `${item.timeStamp}`;
	}
	const getMessageText = (item) => {
		if(item.sentBy === 'bot'){
			return item.content;
		}else if(item.sentBy === 'user'){
			return item.content;
		}else{
			return '';
		}
	}
	let myList = useRef();

	const handleCardClick = (item, index) => {
		if(item.postbackMobile){
			console.log('postbackMobile:', item);
			showRedirectAlert(item.postbackMobile);
		}
		if(item.postback.length > 0){

		}else{
			handleSendMessage(item.text);
		}
	}
	const handleLinkClick = (item, index) => {
		if(item.postbackMobile){
			console.log('postbackMobile:', item);
			showRedirectAlert(item.postbackMobile);
		}
		if(item.postback.length > 0){

		}else{
			handleSendMessage(item.text);
		}
	}
	const showRedirectAlert = (url) => {
		let message = 'This action will navigate you to a different screen. Are you sure to navigate?';
		console.log('showRedirectAlert',url)
		Alert.alert(StaticMessage.AppName,message,
			[
			  	{
					text: "NO",
					onPress: () => console.log("Cancel Pressed"),
					style: "cancel"
			  	},
			  	{ text: "YES", 
			  		onPress: () => {handleRedirectScreen(url)}
				}
			]
		  );
	}
	const handleRedirectScreen = (url) =>{
		console.log('handleRedirectScreen',url);
		let screenArr = url.split('/');
		let screenName = screenArr.length > 0 ? screenArr[0] : "";
		let subScreenName = screenArr.length > 1 ? screenArr[1] : "";
		let detailsId = screenArr.length > 2 ? screenArr[2] : "";

		if(screenName == ":job"){
			navigation.navigate('Find jobs');
			if(subScreenName == "list"){
				navigation.navigate('JobsList',{searchKey:'',location:''});
			}
		}else if(screenName == ":message"){
			if(subScreenName == "list"){
				getChatGroups(detailsId);
			}
		}else if(screenName == ":timesheet"){
			navigation.navigate('Timesheets');
		}else if(screenName == ':vacationrequest'){
			navigation.navigate('RequestTimeoff');
		}else{
			getChatGroups(MessageGroupId.GeneralQueriesID);
		}

	}
	const  getChatGroups = async(detailsId) => {
		let user = await AsyncStorage.getItem('loginDetails'); 
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken);    
		const chatGroupID = detailsId;
		console.log('chatGroupID:',chatGroupID);
		setIsLoading(true);
		axios ({  
		  "method": "GET",
		  "url": BaseUrl + EndPoints.ChatGroups,
		  "headers": getAuthHeader(authToken)
		})
		.then((response) => {
			setIsLoading(false);
			if (response.data.code == 200){
				const results = response.data.content.dataList;
				const newArr = results.filter(item => item.groupId == chatGroupID)
				console.log('Chat Group:',JSON.stringify(newArr));
				navigation.navigate('ChatScreen',{conversations:newArr[0],groupDetail:newArr[0],oldMessage:messagesArray});
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
	const viewFile = (document) => {
		console.log('resume:', document.url);
		let url =  document.url;
		const extension = url.split(/[#?]/)[0].split(".").pop().trim();
		const localFile = `${RNFS.DocumentDirectoryPath}/temporaryfile.${extension}`;
		const options = {
			fromUrl: url,
			toFile: localFile,
		};
		RNFS.downloadFile(options)
		.promise.then(() => FileViewer.open(localFile,{ showOpenWithDialog: true }))
		.then(() => {
			console.log('View Sucess')
		})
		.catch((error) => {
			console.log('View Failed',error)
		});
	}
	
  
  	return (
		<SafeAreaView style={styles.container}>
			<FlatList style={{backgroundColor:'#fff', paddingTop:16, paddingBottom:32}}
				data={messagesArray}
				ref={myList}
				keyExtractor={(item, index) => index.toString()}
				onContentSizeChange={()=> myList.current?.scrollToEnd()}
				renderItem={({item,index}) => 
					<View style={{paddingLeft:16, paddingRight:16, paddingBottom:12}}>
						{
							item.sentBy === 'bot' && item.type === 'content'?
							<View>
								<Text style={{ marginLeft:16,fontSize: 14, color: ThemeColor.NavColor,justifyContent:"center",fontFamily: FontName.Regular }} key={index}>Sia</Text>
								<View style={styles.receiveCell}>
									<Text style={{ fontSize: 14, color: ThemeColor.TextColor,justifyContent:"center",fontFamily: FontName.Regular}} key={index}> {getMessageText(item)}</Text>
									<Text style={{fontFamily: FontName.Regular, fontSize:12,color:ThemeColor.LabelTextColor,marginTop:8, textAlign:'right'}}>{getFormatedDate(item)}</Text>
									<View style={styles.leftArrow}/>
									<View style={styles.leftArrowOverlap}/>
                  				</View>
							</View>
							 : null
						}
						{
							item.sentBy === 'user' && item.type === 'content'?
							<View style={styles.sendCell} key={index}>  
								<Text style={{ fontSize: 16, color: ThemeColor.TextColor, }} >{getMessageText(item)}</Text>
								<Text style={{fontFamily: FontName.Regular, fontSize:12,color:ThemeColor.LabelTextColor,marginTop:8, textAlign:'right'}}>{getFormatedDate(item)}</Text>
								<View style={styles.rightArrow} />
								<View style={styles.rightArrowOverlap}/>                    
                  			</View> : null
						}
						{
							item.type === 'chip'?
							<View style={{ flex:1,flexDirection:'row',alignItems: 'center',marginBottom:16}}>
								<FlatList
									horizontal
									data={item.chip}
									keyExtractor={(item, index) => item + index}
									renderItem={({item, index}) => 
									<TouchableOpacity  style={[styles.chipItem]} onPress={() => {handleSendMessage(item)}}>
										<Text style={[styles.chipTitle]}>{item}</Text>
									</TouchableOpacity>
									}
								/>
							</View> : null
						}
						{item.type === 'loader' ? 
							<View>
								<Image resizeMode='contain' style={{height:50, width:50,borderRadius:25}} source={require('../../assets/Images/dribbble_img.gif')} />
							</View> : null
						}
						{
							item.type === 'link'?
							<View style={{ flex:1,flexDirection:'row',alignItems: 'center',marginBottom:12}}>
								<FlatList
									horizontal
									data={item.link}
									keyExtractor={(item, index) => index.toString()}
									renderItem={({item}) => 
									<TouchableOpacity  style={[styles.chipItem]} onPress={() => {handleLinkClick(item)}}>
										<Text style={[styles.chipTitle]}>{item.text}</Text>
									</TouchableOpacity>
									}
								/>
							</View> : null
						}
						{
						item.type === 'carousel'?
						<View style={{ flex:1}}>
							<FlatList
								horizontal
								data={item.carousel}
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
										<TouchableOpacity  style={[styles.chipItem]} onPress={() => {handleSendMessage(item.text)}}>
											<Text style={[styles.chipTitle]}>{item.text}</Text>
										</TouchableOpacity>
										}
									/>
								</View>
								}
							/>
							<Text style={{fontFamily: FontName.Regular, fontSize:10,color:ThemeColor.LabelTextColor}}>{getFormatedDate(item)}</Text>

						</View> : null
						}
						{
						item.type === 'card'?
						<View style={{ flex:1,marginBottom:16}}>
							<View  style={{borderRadius:5, backgroundColor:ThemeColor.ViewBgColor}}>
								<Image resizeMode='cover' style={{height:160, flex:1,margin:8}} source={{uri: item.card.imageUri}} defaultSource={require('../../assets/Images/LoginBG.png')}/>
								<Text style={{color:ThemeColor.TextColor,fontSize:16, fontFamily: FontName.Regular, marginTop:8, marginLeft:4, paddingRight:4}}>{item.card.title}</Text>
								<Text style={{color:ThemeColor.SubTextColor,fontSize:14, fontFamily: FontName.Regular, marginTop:4,marginLeft:4, paddingRight:4}}>{item.card.subtitle}</Text>
								<FlatList style={{width:'100%', marginBottom:8, marginTop:8}}
									horizontal
									showsHorizontalScrollIndicator={false}
									scrollEnabled={false}
									data={item.card.buttons}
									keyExtractor={(item, index) => index.toString()}
									renderItem={({item}) => 
									<TouchableOpacity  style={[styles.chipItem]} onPress={() => {handleCardClick(item, index)}}>
										<Text style={[styles.chipTitle]}>{item.text}</Text>
									</TouchableOpacity>
									}
								/>
							</View>

						</View> : null
						}
						{
							item.type === 'media'?
							<View style={{ flex:1}}>
								<FlatList
									horizontal
									data={item.media}
									keyExtractor={(item, index) => index.toString()}
									renderItem={({item}) => 
									<View  style={{borderRadius:5, width:Dimensions.get('window').width * 0.85, marginRight:8, backgroundColor:ThemeColor.ViewBgColor}}>
										<Video
											source={{ uri: item.source }}
											style={{height:180, flex:1,borderRadius:5}}
											paused={true}
											controls={true}
											ref={(ref) => {
												this.player = ref
											}} 
										/>
                                        <WebView
											source={{ uri: item.source }}
											style={{height:180, flex:1,borderRadius:5}}
											paused={true}
											controls={true}
											ref={(ref) => {
												this.player = ref
											}} 
										/>
									</View>
									}
								/>
							</View> : null
						}
						{
							item.type === 'grid' ?
							<View style={{ flex:1, padding:8, backgroundColor:ThemeColor.ViewBgColor}}>
								<View  style={{borderRadius:5, backgroundColor:ThemeColor.ViewBgColor, backgroundColor:'#fff'}}>
									<Text style={{color:ThemeColor.TextColor,fontSize:16, fontFamily: FontName.Regular, marginLeft:4, paddingRight:4, marginTop:8}}>{item.grid.title}</Text>
									<View style ={{flex: 1,borderColor:ThemeColor.BorderColor, borderWidth:1,marginTop:8}}>
										<View style ={{flexDirection:'row', marginBottom:1, justifyContent: 'center', alignItems: 'center', alignContent:'center'}}>
											<View style={{height:30, flex:1, flexDirection:'row',justifyContent: 'center',alignItems: 'center'}}>
												<Text style={{color:ThemeColor.TextColor,fontSize:12, textAlign: 'center', flex: 1}}>{item.grid.columns[0]}</Text>
												<View style={{backgroundColor:ThemeColor.BorderColor, height:30, width:1}}/>
											</View>
											<View style={{height:30, flex:1,flexDirection:'row',justifyContent: 'center',alignItems: 'center'}}>
												<Text style={{color:ThemeColor.TextColor,fontSize:12, textAlign: 'center', flex: 1}}>{item.grid.columns[1]}</Text>
												<View style={{backgroundColor:ThemeColor.BorderColor, height:30, width:1}}/>
											</View>
											<View style={{height:30, flex:1, flexDirection:'row',justifyContent: 'center',alignItems: 'center'}}>
												<Text style={{color:ThemeColor.TextColor,fontSize:12, textAlign: 'center', flex: 1}}>{item.grid.columns[2]}</Text>
												<View style={{backgroundColor:ThemeColor.BorderColor, height:30, width:1}}/>
											</View>
										</View>
									</View>
									<FlatList style={{flex: 1}}
										showsHorizontalScrollIndicator={false}
										scrollEnabled={false}
										data={item.grid.rows}
										keyExtractor={(item, index) => index.toString()}
										renderItem={({item}) => 
											<View style ={{flex: 1,borderColor:ThemeColor.BorderColor, borderWidth:1}}>
												<View style ={{flexDirection:'row', marginBottom:1, justifyContent: 'center', alignItems: 'center', alignContent:'center'}}>
													<View style={{height:30, flex:1, flexDirection:'row',justifyContent: 'center',alignItems: 'center'}}>
														<Text style={{color:ThemeColor.TextColor,fontSize:12, textAlign: 'center', flex: 1}}>{item[0]}</Text>
														<View style={{backgroundColor:ThemeColor.BorderColor, height:30, width:1}}/>
													</View>
													<View style={{height:30, flex:1,flexDirection:'row',justifyContent: 'center',alignItems: 'center'}}>
														<Text style={{color:ThemeColor.TextColor,fontSize:12, textAlign: 'center', flex: 1}}>{item[1]}</Text>
														<View style={{backgroundColor:ThemeColor.BorderColor, height:30, width:1}}/>
													</View>
													<View style={{height:30, flex:1, flexDirection:'row',justifyContent: 'center',alignItems: 'center'}}>
														<Text style={{color:ThemeColor.TextColor,fontSize:12, textAlign: 'center', flex: 1}}>{item[2]}</Text>
														<View style={{backgroundColor:ThemeColor.BorderColor, height:30, width:1}}/>
													</View>
												</View>
										</View>
										}
									/>
								</View>

							</View> : null
						}
						{
							item.type === 'download' ?
							<View style={{ flex:1, padding:8, backgroundColor:ThemeColor.ViewBgColor,borderRadius:5,}}>
								<FlatList style={{flex: 1,borderRadius:5,backgroundColor:'#fff'}}
									scrollEnabled={false}
									data={item.download}
									keyExtractor={(item, index) => index.toString()}
									renderItem={({item}) => 
										<View style={{borderRadius:5}}> 
											<TouchableOpacity style={{padding:8,justifyContent: 'center', flexDirection:'row',alignItems: 'center', paddingRight:0}} onPress={() => {viewFile(item)}} >
												<View style={{flex:1, flexDirection:'row', alignItems: 'center'}} >
													<AntDesign name="filetext1" color={ThemeColor.SubTextColor} size={25,25} />
													<Text style={{marginLeft:8, fontFamily: FontName.Regular, fontSize:16, color:ThemeColor.TextColor,  flex:1}}>{item.title}</Text>
												</View>
												<View style={{height:30, width:30, justifyContent:'center', alignItems: 'center'}}>
													<Feather name="chevron-right" color={ThemeColor.BorderColor} size={24,24} />
												</View>
											</TouchableOpacity>
											<View style={{height:1, backgroundColor:ThemeColor.BorderColor, marginLeft:12}} />
										</View>
									}
								/>
							</View> : null
						}
						
						
					</View>
				}
			/>
			<KeyboardAvoidingView enabled
				behavior={"padding"} // you can change that by using Platform
				keyboardVerticalOffset={Platform.select({ ios: 85, android: 85 })}>
			<View style={{flexDirection:'row', paddingTop:8, paddingBottom:8, backgroundColor:ThemeColor.ViewBgColor}}>
				<TextInput  
					style={styles.inputText}
					placeholder="Enter message" 
					placeholderTextColor={ThemeColor.PlaceHolderColor}
					keyboardType='default'
					multiline={true}
					value= {data.message}
					onChangeText={(val) => setData({...data,message:val})}
				/>
				<TouchableOpacity style={{width:40, height:40, justifyContent: 'center', alignItems: 'center'}} onPress={() => {handleSendMessage(data.message)}}>
					<Image style={{width:30,height:30}} source={require('../../assets/Images/iconSend.png')} />
				</TouchableOpacity>
			</View>	
			</KeyboardAvoidingView>
        	<Loader isLoading={isLoading} />
		</SafeAreaView>

    );
}
export default ChatBotScreen;


const styles = StyleSheet.create({
    container: {
      flex: 1,
	  backgroundColor:ThemeColor.ViewBgColor,
	  marginBottom:8
    },inputView:{
        flexDirection:'row',
        paddingLeft:16,
        paddingRight:16,
        height:40,
        alignItems:"center", 
        backgroundColor:ThemeColor.BorderColor
      },
      inputText:{
		  marginLeft:8,
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
		marginHorizontal: 4,
		borderRadius:20,
		borderColor:ThemeColor.NavColor,
		borderWidth:1,
	  },
	  chipTitle: {
		fontSize: 14,
		paddingLeft:8,
		paddingRight:8,
		color:ThemeColor.NavColor
	  },
	sendCell:{
		backgroundColor: ThemeColor.SkyBlueColor,
		padding:10,
		marginLeft: '45%',
		borderRadius: 5,
		marginTop: 5,
		marginRight: 8,
		maxWidth: '70%',
		alignSelf: 'flex-end',
		borderRadius: 20,
		marginBottom:8
	},receiveCell: {
		backgroundColor: "#f3f3f3",
		padding:10,
		borderRadius: 5,
		marginTop: 5,
		marginLeft: 8,
		maxWidth: '70%',
		alignSelf: 'flex-start',
		borderRadius: 20,
		marginBottom:12
	},
	  leftArrow: {
		position: "absolute",
		backgroundColor: "#f3f3f3",
		width: 20,
		height: 25,
		bottom: 0,
		borderBottomRightRadius: 25,
		left: -10
	},
	
	leftArrowOverlap: {
		position: "absolute",
		backgroundColor: "#fff",
		width: 20,
		height: 35,
		bottom: -6,
		borderBottomRightRadius: 18,
		left: -20
	
	},rightArrow: {
		position: "absolute",
		backgroundColor: ThemeColor.SkyBlueColor,
		width: 20,
		height: 25,
		bottom: 0,
		borderBottomLeftRadius: 25,
		right: -10
	  },
	  
	  rightArrowOverlap: {
		position: "absolute",
		backgroundColor: "#fff",
		width: 20,
		height: 35,
		bottom: -6,
		borderBottomLeftRadius: 18,
		right: -20
	  
	  },
  });