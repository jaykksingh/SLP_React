import React,{useEffect,createRef} from "react";
import { 
	Text, 
    TouchableOpacity,
    StyleSheet, 
    View,
	FlatList,
	Alert,
	SafeAreaView,
	Platform
} from "react-native";
import Feather from 'react-native-vector-icons/Feather';
import {Picker} from '@react-native-picker/picker';
import ActionSheet from "react-native-actions-sheet";
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'
import axios from 'axios'
import {getAuthHeader} from '../../_helpers/auth-header';
import { BaseUrl, EndPoints, StaticMessage, ThemeColor, FontName } from '../../_helpers/constants';
import Loader from '../../Components/Loader';

const projectRef = createRef();

const ChooseLcaTypeScreen = ({route,navigation}) => {
	const [isLoading, setIsLoading] = React.useState(false);
	const [lookUpData, setLookUpData] = React.useState({
		applicationTypeList:[]
	});
	const [documentArray,setDocumentArray] = React.useState([]);

	const [data,setData] = React.useState({
		applTypeName:'',
		applTypeId:'',
	});
	React.useLayoutEffect(() => {
		navigation.setOptions({
			  title: `Create application`,
		});
	}, [navigation]);
	
	useEffect(() => {
		getLookupData();
		
		
	  },[])

	const  getLookupData = async() => {

		let user = await AsyncStorage.getItem('loginDetails');  
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken);

		setIsLoading(true);
		axios ({  
		  "method": "GET",
		  "url": BaseUrl + EndPoints.LegalFilingLookup,
		  "headers": getAuthHeader(authToken)
		})
		.then((response) => {
		  setIsLoading(false);
		  if (response.data.code == 200){
			setLookUpData(response.data.content.dataList[0]);
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
	const  getDocumentList = async(applTypeId) => {

		let user = await AsyncStorage.getItem('loginDetails');  
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken);

		setIsLoading(true);
		axios ({  
		  "method": "GET",
		  "url": BaseUrl + EndPoints.LegalFilingDocList + '/' + applTypeId,
		  "headers": getAuthHeader(authToken)
		})
		.then((response) => {
		  setIsLoading(false);
		  console.log('Document:',JSON.stringify(response.data));

		  if (response.data.code == 200){
			setDocumentArray(response.data.content.dataList);
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


	const note1 = 'Please refer the list of required documents below to proceed with your application filing.' 
	const note2 ='Our team will review the submitted documents and shall get in touch with you if additional information or documents are required.'
	let optionArray = lookUpData ? lookUpData.applicationTypeList : [];
	console.log(JSON.stringify(optionArray));
	return(
		<SafeAreaView style={styles.container}>
			<View style={{paddingLeft:16, paddingRight:16, marginBottom:8, flex:1}}>
				{Platform.OS == 'ios' ? 
					<View style={{marginTop:12}}>
						<Text style ={{color:ThemeColor.SubTextColor, fontSize:16,height:22, fontFamily:FontName.Regular, paddingLeft:8, marginBottom:4}}>Application type</Text>
						<TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}} onPress={() => {projectRef.current?.setModalVisible()}}>
							<Text style={[styles.labelText,{color:data.applTypeName.length > 0 ? 'black' : ThemeColor.PlaceHolderColor}]}>{data.applTypeName.length >0 ? data.applTypeName : 'Choose type of application'}</Text>
							<Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22,22} />
						</TouchableOpacity>
					</View> :
					<View style={{marginTop:12}}>
						<Text style ={{color:ThemeColor.SubTextColor, fontSize:16,height:22, fontFamily:FontName.Regular, paddingLeft:8, marginBottom:4}}>Application type</Text>
						<View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center'}}>
							<Picker
								style={{flex:1,fontSize:14, fontFamily: FontName.Regular}}
								itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
								selectedValue={data.applTypeId}
								onValueChange={(itemValue, index) =>{
									let selectedObj = lookUpData.applicationTypeList[index];
									setData({...data, applTypeId: selectedObj.appTypeCode,applTypeName: selectedObj.appTypeName});
									getDocumentList(selectedObj.appTypeCode);
								}}>
								{lookUpData && lookUpData.applicationTypeList.map((item, index) => {
									return (<Picker.Item label={item.appTypeName} value={item.appTypeCode} key={index}/>) 
								})}
							</Picker>							
						</View>
					</View>
				}
				<Text style ={{color:ThemeColor.TextColor, fontSize:14,fontFamily:FontName.Regular, marginTop:12}}>{note1}</Text>
				<Text style ={{color:ThemeColor.TextColor, fontSize:14,fontFamily:FontName.Regular,marginTop:12}}>{note2}</Text>
				<FlatList style={{marginTop:24}}
					data={documentArray}
					keyExtractor={(item, index) => index.toString()}
					renderItem={({item,index}) => 
						<View style={{marginBottom:8, paddingBottom:8,paddingTop:8}} onPress={() => navigation.navigate('EditLCA')}>
							<Text style ={{color:ThemeColor.TextColor, fontSize:16, fontFamily:FontName.Regular}}>{item.documentName}</Text>
							<View style={{backgroundColor:ThemeColor.BorderColor, height:1,marginTop:8}}/>
						</View>
					}
				/>
				<Loader isLoading={isLoading} />
			</View>
			{data.applTypeId.length > 0 ? 
			<TouchableOpacity style={styles.btnFill} onPress={() => navigation.navigate('AddLCADetails',{applTypeName:data.applTypeName,applTypeId:data.applTypeId,lookUpData:lookUpData,docList:documentArray})}>
				<Text style={{color:'#53962E',fontFamily: FontName.Regular, fontSize:16, color:'#fff' }}>PROCEED</Text>
			</TouchableOpacity> : null
			}
			<ActionSheet ref={projectRef} containerStyle={{backgroundColor:ThemeColor.ViewBgColor}}>
				<View style={{height:300}}>
					<View style={{height:60, flexDirection:'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft:16,paddingRight:16}}>
					<TouchableOpacity onPress={() => {projectRef.current?.setModalVisible()}}>
						<Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Cancel</Text>
					</TouchableOpacity>
					<Text style={{color:ThemeColor.TextColor, fontSize:16, fontFamily: FontName.Bold}}>Application type</Text>
					<TouchableOpacity onPress={() => {
						data.applTypeName.length == 0 ? getDocumentList(lookUpData.applicationTypeList[0].appTypeCode) : '';
						data.applTypeName.length == 0 ? setData({...data,applTypeId:lookUpData.applicationTypeList[0].appTypeCode,applTypeName:lookUpData.applicationTypeList[0].appTypeName}) : '';

						projectRef.current?.setModalVisible()}
					}>
						<Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Done</Text>
					</TouchableOpacity>
					</View>
					<Picker
						style={{backgroundColor: 'white',flex:1,fontSize:14, fontFamily: FontName.Regular}}
						itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
						selectedValue={data.applTypeId}
						onValueChange={(itemValue, index) =>{
							let selectedObj = lookUpData.applicationTypeList[index];
							setData({...data, applTypeId: selectedObj.appTypeCode,applTypeName: selectedObj.appTypeName});
							getDocumentList(selectedObj.appTypeCode);
						}}>
						{optionArray.map((item, index) => {
							return (<Picker.Item label={item.appTypeName} value={item.appTypeCode} key={index}/>) 
						})}
					</Picker>
				</View>
			</ActionSheet>      
		</SafeAreaView>
	);
}

export default ChooseLcaTypeScreen;

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
		fontSize:14,
		fontFamily: FontName.Regular,
		marginLeft:8,
		alignContent:'stretch',
	},btnFill:{
		margin:16,
		height:45,
		justifyContent:"center",
		backgroundColor: ThemeColor.BtnColor ,
		alignItems:'center',
		borderRadius:5,
		marginBottom:8,
	}
  });