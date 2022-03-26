/* eslint-disable react/display-name */
import React , {useEffect,useRef, useState} from "react";
import { View,
    StyleSheet,
    Alert,
    SafeAreaView,
    TouchableOpacity,
    FlatList,
    TextInput,
    Image,
	KeyboardAvoidingView,
	ActionSheetIOS
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'
import axios from 'axios';
import Feather from 'react-native-vector-icons/Feather';
import moment from 'moment';
import * as ImagePicker from 'react-native-image-picker';
import RNFS from 'react-native-fs';
import DocumentPicker from 'react-native-document-picker';
import { BaseUrl, EndPoints, StaticMessage, ThemeColor, FontName } from '../../_helpers/constants';
import { getAuthHeader} from '../../_helpers/auth-header';
import Loader from '../../Components/Loader';



const ChatAttachmentScreen = ({route,navigation}) => {
  	let [isLoading, setIsLoading] = React.useState(false);
	const [pickedImage, setPickedImage] = useState('');
	const [selectedFileArray,setFileArray] = React.useState([]);

	const [data, setData] = React.useState({
		message:'',
		titles:'',
		resumeTitle:'',
		fileData:'',
		fileName:'',
		selectedIndex:0
	});


	
	const { messagesArray } = route.params;
	const { conversations } = route.params;
	const { base64File } = route.params;
	const { fileName } = route.params;
	const { fileType } = route.params;
	const { fileURL } = route.params;
	
	React.useLayoutEffect(() => {
		navigation.setOptions({
			// headerRight: () => (
			// 	<TouchableOpacity style={{marginRight:16}} onPress={() => deleteSelectedFile()}>
			// 	  <Icon name="trash-outline" color={'white'} size={20} />
			// 	</TouchableOpacity>
			// ),
		  	title: 'Preview',
		});
	}, [navigation]);
	const deleteSelectedFile = () => {
		// let tempArray = selectedFileArray;
		// let newTempArray = tempArray.filter((_, i) => i !== data.selectedIndex); 
		// setData({...data,selectedIndex:0});
		// setFileArray(newTempArray);
		// let index = data.selectedIndex;
		// setData({...data,selectedIndex:0});
		// setFileArray([selectedFileArray.filter((_, i) => i !== index)]);
		
	}

	useEffect(() => {
		let params = {
			'base64File':base64File,
			'fileName':fileName,
			'title':'',
		}
		setFileArray([params]);
		setData({...data, selectedIndex:0})
		setData({...data,fileData:base64File,fileName:fileName});


		
		if(navigation.dangerouslyGetParent){
			const parent = navigation.dangerouslyGetParent();
			parent.setOptions({
			  tabBarVisible: false
			});
			return () =>
			  parent.setOptions({
				tabBarVisible: false
			  });
		  }
	}, []);

	const  handleSendMessage = async() => {
		if(data.message.length == 0){
			Alert.alert(StaticMessage.AppName, "Title is required", [
				{text: 'Ok'}
			]);
			return;
		}
		let user = await AsyncStorage.getItem('loginDetails'); 
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken);    
		setIsLoading(true);

		// let params = {
		// 	'chatId':conversations.chatId,
		// 	'severity':conversations.severityId,
		// 	'messageId':messagesArray[messagesArray.length -1].messageId,
		// 	'groupId':conversations.groupId,
		// 	'issueType':conversations.issueTypeId,
		// 	'fileData':data.fileData,
		// 	'fileName':data.fileName,
		// 	'fileTitle':data.message
		// }
		// console.log(`params: ${JSON.stringify(selectedFileArray)}`)

		// axios ({  
		//   "method": "POST",
		//   "url": BaseUrl + EndPoints.SendMessage,
		//   "headers": getAuthHeader(authToken),
		//   data:params
		// })
		// .then((response) => {
		// 	setIsLoading(false);
		// 	if (response.data.code == 200){
		// 		let resultArr = response.data.content.dataList;
		// 		console.log('Send Result:',JSON.stringify(resultArr));				
		// 		navigation.goBack();
		// 	}else if (response.data.code == 417){
		// 		console.log(Object.values(response.data.content.messageList));
		// 		const errorList = Object.values(response.data.content.messageList);
		// 		Alert.alert(StaticMessage.AppName, errorList.join(), [
		// 		{text: 'Ok'}
		// 		]);
		
		// 	}else if (response.data.code == 401){
		// 		console.log('Session Expired Already');
		// 		SessionExpiredAlert();
		// 	}
		// })
		// .catch((error) => {
		// 	setIsLoading(false);
		// 	if(error.response && error.response.status == 401){
		// 		SessionExpiredAlert();
		// 	}else{
		// 		Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
		// 			{text: 'Ok'}
		// 		  ]);
		// 	}
		// 	console.log('Error:',error);      
		// })
		
		console.log(`params: ${JSON.stringify(selectedFileArray)}`)

		let promiseArray = [];
		for(let i=0; i < selectedFileArray.length; i++){
			promiseArray.push(
				axios ({  
					"method": "POST",
					"url": BaseUrl + EndPoints.SendMessage,
					"headers": getAuthHeader(authToken),
					data:{
						'chatId':conversations.chatId,
						'severity':conversations.severityId,
						'messageId':messagesArray[messagesArray.length -1].messageId,
						'groupId':conversations.groupId,
						'issueType':conversations.issueTypeId,
						'fileData':selectedFileArray[0].base64File,
						'fileName':selectedFileArray[0].fileName,
						'fileTitle':data.message
					}
				})
			)
		}
		Promise.all(promiseArray)
		.then( values => {
			setIsLoading(false);
			values.map( value => console.log( value.url + " ==> " + value.status ));
			navigation.goBack();
		})
		.catch( err => console.log(err))
	}
	const showAttachmentPicker = () => ActionSheetIOS.showActionSheetWithOptions(
		{
			options: ["Cancel", "Choose from gallery", "Take picture"],
			// destructiveButtonIndex: 0,
			cancelButtonIndex: 0,
			userInterfaceStyle: 'light',  
		},
		buttonIndex => {
			if (buttonIndex === 0) {
			  // cancel action
			} else if (buttonIndex === 1) {
			  	imageGalleryLaunch();
			} else if (buttonIndex === 2) {
			  	cameraLaunch();
			}else if (buttonIndex === 3) {
				selectDocument();
			}
		}
	);
	const selectDocument = async () => {
        try {
            const res = await DocumentPicker.pick({
                type: [DocumentPicker.types.pdf,DocumentPicker.types.doc,DocumentPicker.types.docx,DocumentPicker.types.plainText],
            });
            console.log(res.uri,res.type, res.name,res.size);
			var newURI = res.uri.split("%20").join("\ ");
            var base64data = await RNFS.readFile( newURI, 'base64').then(res => { return res });
            setData({...data,fileData:base64data,fileName:res.name});
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
		  maxHeight: 500,
		  quality: 0.5
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
            let params = {
				'base64File':base64data,
				'fileName':'temp.jpg',
			}
			let tempArray = selectedFileArray;
			tempArray.push(params);
			setFileArray(tempArray);
			setData({...data,fileData:base64data,fileName:'temp.jpg'});

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
			let params = {
				'base64File':base64data,
				'fileName':'temp.jpg',
			}
			let tempArray = selectedFileArray;
			tempArray.push(params);
			setFileArray(tempArray);
			setData({...data,fileData:base64data,fileName:'temp.jpg'});

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
			return 'Sample data';
		}
	}
	let myList = useRef();
  
  	return (
		  	<SafeAreaView style={styles.container}>
			<KeyboardAvoidingView enabled
				behavior={"padding"} // you can change that by using Platform
				keyboardVerticalOffset={Platform.select({ ios: 85, android: 85 })} style={styles.container}>
				<View style={{flex: 1,backgroundColor:'#fff'}}>
					{selectedFileArray.length > 0 && <Image
					    resizeMode={'contain'}
						source={{ uri: `data:image/png;base64,${selectedFileArray[data.selectedIndex].base64File}`}}
						style={{ flex: 1, margin:16}}
					/>}

				</View>
				<View style={{flexDirection:'row', paddingTop:8, paddingBottom:8, backgroundColor:ThemeColor.ViewBgColor}}>
					<TouchableOpacity style={{width:40, height:40, justifyContent: 'center', alignItems: 'center'}} onPress = {showAttachmentPicker}>
						<Feather name="plus" color={ThemeColor.BtnColor} size={25,25} />
					</TouchableOpacity>
					<TextInput  
						style={styles.inputText}
						placeholder="Enter message" 
						placeholderTextColor={ThemeColor.PlaceHolderColor}
						keyboardType='default'
						value= {data.message}
						onChangeText={(val) => setData({...data,message:val})}
					/>
					<TouchableOpacity style={{width:40, height:40, justifyContent: 'center', alignItems: 'center'}} onPress={() => {handleSendMessage()}}>
						<Image style={{width:30,height:30}} source={require('../../assets/Images/iconSend.png')} />
					</TouchableOpacity>
				</View>
				<View style={{flexDirection:'row', paddingTop:8, paddingBottom:8, backgroundColor:ThemeColor.ViewBgColor}}>
				<FlatList style={{paddingLeft:16, paddingRight:16}}
					horizontal
					data={selectedFileArray}
					keyExtractor={(item, index) => index.toString()}
					renderItem={({item,index}) => 
						<TouchableOpacity  style={{marginRight:8,borderColor: index == data.selectedIndex ? ThemeColor.NavColor : ThemeColor.BorderColor,borderWidth:4,borderRadius:5}} onPress={() => setData({...data,selectedIndex:index})}>
							<Image
								resizeMode={'stretch'}
								source={{ uri: `data:image/png;base64,${item.base64File}`}}
								style={{ height:50, width:50 , backgroundColor:'#fff'}}
							/>
						</TouchableOpacity>
					}
				/>
					
				</View>

			</KeyboardAvoidingView>
        	<Loader isLoading={isLoading} />
		  </SafeAreaView>

    );
}
export default ChatAttachmentScreen;


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
	  },
  });