import React,{useEffect} from "react";
import { 
	Text, 
    TouchableOpacity,
    StyleSheet, 
    View,
	FlatList,
	Alert,
	SafeAreaView
} from "react-native";
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'
import axios from 'axios'
import RNFS from 'react-native-fs';
import DocumentPicker from 'react-native-document-picker';
import Loader from '../../Components/Loader';
import {getAuthHeader} from '../../_helpers/auth-header';
import { BaseUrl, EndPoints, StaticMessage, ThemeColor, FontName } from '../../_helpers/constants';


const NewLcaDocumentScreen = ({route,navigation}) => {
	const [isLoading, setIsLoading] = React.useState(false);
	const {detail} = route.params;
	const {name} = route.params;
	const {applTypeName} = route.params;
	let [data,setData] = React.useState({
		documentsList:[]
	});

	
	
	React.useLayoutEffect(() => {
		navigation.setOptions({
			  title: `New application - documents`,
		});
	}, [navigation]);
	
	useEffect(() => {
		console.log(detail);
		if(detail){
			getApplicationDetails(detail.legalAppId);
		}
		
		
	  },[])

	  const getApplicationDetails = async (applicationID) => {
		setIsLoading(true);
	
		let user = await AsyncStorage.getItem('loginDetails');  
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var encoded = base64.encode(userAuthToken);
	
		console.log(`URL:${BaseUrl}${EndPoints.ImmigrationDetails}/${applicationID}`);
	
		axios ({
		  "method": "GET",
		  "url": `${BaseUrl}${EndPoints.ImmigrationDetails}/${applicationID}`,
		  "headers": getAuthHeader(encoded)
		})
		.then((response) => {
			setIsLoading(false);
		  if (response.data.code == 200){
			let result = JSON.stringify(response.data.content.dataList[0]);
			console.log('App Details:',result);
			setData(response.data.content.dataList[0]);
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
			console.log(error);
			setIsLoading(false);
			Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
				{text: 'Ok'}
			]);
		})
	}
	const  uploadDocument = async(legalDocName,legalDocument,checkListId) => {

		let user = await AsyncStorage.getItem('loginDetails');  
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken);

		setIsLoading(true);
		let params = {
			legalDocName:legalDocName,
			legalDocument:legalDocument,
			checkListId:checkListId
		}
		axios ({  
		  "method": "POST",
		  "url": BaseUrl + EndPoints.LegalFilingDocList,
		  "headers": getAuthHeader(authToken),
		  data:params
		})
		.then((response) => {
		  setIsLoading(false);
		  console.log('Document:',JSON.stringify(response.data));
		  if (response.data.code == 200){
			getApplicationDetails(detail.legalAppId);
		  }else if (response.data.code == 417){
			console.log(Object.values(response.data.content.messageList));
			const errorList = Object.values(response.data.content.messageList);
			Alert.alert(StaticMessage.AppName, errorList.join(), [
			  {text: 'Ok'}
			]);
	
		  }else{
		  }
		})
		.catch((error) => {
		  console.error(error);
		  setIsLoading(false);
		  Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
			{text: 'Ok'}
		  ]);
	
		})
	}
	const selectResume = async (checkListId) => {
        try {
            const res = await DocumentPicker.pick({
                type: [DocumentPicker.types.pdf,DocumentPicker.types.doc,DocumentPicker.types.docx,DocumentPicker.types.plainText],
            });
            console.log(res.uri,res.type, res.name,res.size);
			var newURI = res.uri.split("%20").join("\ ");
            var base64data = await RNFS.readFile( newURI, 'base64').then(res => { return res });
			uploadDocument(res.name,base64data,checkListId);
        } catch (err) {
            if (DocumentPicker.isCancel(err)) {
            } else {
                throw err;
            }
        }
    }

	const note1 = 'Please refer the list of required documents below to proceed with your application filing.' 
	const note2 ='Our team will review the submitted documents and shall get in touch with you if additional information or documents are required.'

	return(
		<SafeAreaView style={styles.container}>
			<View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8, marginTop:16, justifyContent:'space-between', marginLeft:16,marginRight:16}}>
				<Text style ={{color:ThemeColor.TextColor, fontSize:16, fontFamily:FontName.Regular, paddingLeft:8}}>Application for</Text>
				<Text style ={{color:ThemeColor.NavColor, fontSize:16, fontFamily:FontName.Regular, paddingLeft:8}}>{name ? name : ''}</Text>
			</View>
			<View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8, marginTop:16, justifyContent:'space-between', marginLeft:16,marginRight:16}}>
				<Text style ={{color:ThemeColor.TextColor, fontSize:16, fontFamily:FontName.Regular, paddingLeft:8}}>Application Type</Text>
				<Text style ={{color:ThemeColor.NavColor, fontSize:16, fontFamily:FontName.Regular, paddingLeft:8}}>{applTypeName ? applTypeName : ''}</Text>
			</View>

			{data.documentsList.length > 0 ? <FlatList style={{marginTop:16}}
				data={data.documentsList}
				keyExtractor={(item, index) => index.toString()}
				renderItem={({item,index}) => 
					<View style={{backgroundColor:'white', marginBottom:8, paddingBottom:8,paddingTop:8, marginLeft:16, marginRight:16,borderRadius:5, flexDirection:'row', alignItems: 'center',justifyContent: 'center'}}>
						<Text style ={{color:ThemeColor.TextColor, fontSize:16, fontFamily:FontName.Regular, paddingLeft:8, flex:1}}>{item.documentName}</Text>
						<TouchableOpacity style={{alignItems: 'center',justifyContent: 'center',marginRight:8}} onPress = {() => {selectResume(item.checkListId)}}>
							<FontAwesome name="cloud-upload" color={ThemeColor.BtnColor} size={30} />
							<Text style ={{color:ThemeColor.SubTextColor, fontSize:12, fontFamily:FontName.Regular}}>Upload now</Text>
						</TouchableOpacity>
					</View>
				}
			/> :
				<View style={{flex:1,justifyContent: 'center', padding:16}}>
					<Text style ={{color:ThemeColor.TextColor, fontSize:16, fontFamily:FontName.Regular, textAlign:'center'}}>No Document required for this application.</Text>
				</View>
			}
			<View style={{flexDirection:'row',borderRadius:5,marginLeft:16, marginRight:16,}}>
				<TouchableOpacity style={styles.btnFill} onPress={() => navigation.navigate('LegalFilings')}>
					<Text style={{color:'#53962E',fontFamily: FontName.Regular, fontSize:16, color:'#fff' }}>DONE</Text>
				</TouchableOpacity>
			</View> 
			<Loader isLoading={isLoading} />
		</SafeAreaView>
	);
}

export default NewLcaDocumentScreen;

const styles = StyleSheet.create({
    container: {
		flex: 1,
		backgroundColor:'#E5E9EB',
	},
	inputView:{
        flexDirection:'row',
        paddingLeft:16,
        paddingRight:16,
        height:40,
        alignItems:"center", 
        backgroundColor:ThemeColor.BorderColor
    
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
		color:'black',
		fontSize:16,
		fontFamily: FontName.Regular,
		marginLeft:8,
		alignContent:'stretch',
	},btnFill:{
		flex: 1,
		height:45,
		justifyContent:"center",
		backgroundColor: ThemeColor.BtnColor ,
		alignItems:'center',
		marginTop:8, 
		marginBottom:8,
		borderRadius:5
	}
  });