import React,{useEffect,userState,createRef} from "react";
import { 
	TextInput, 
    Text, 
    TouchableOpacity,
    StyleSheet, 
    View,
	FlatList,
	SafeAreaView,
	Alert,
	Platform
} from "react-native";
import { WebView } from 'react-native-webview';
import Icon from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'
import axios from 'axios'
import ActionSheet from "react-native-actions-sheet";
import {Picker} from '@react-native-picker/picker';
import {parseErrorMessage} from '../../_helpers/Utils';
import Loader from '../../Components/Loader';
import { AuthContext } from '../../Components/context';
import {getAuthHeader} from '../../_helpers/auth-header';
import { BaseUrl, EndPoints, StaticMessage, ThemeColor, FontName } from '../../_helpers/constants';

const skillsRef = createRef();
const locationRef = createRef();
const workRef = createRef();
const selectionRef = createRef();


const PreScreeningScreen = ({route,navigation}) => {
	const [isLoading, setIsLoading] = React.useState(false);
	const [questionsArray, setQuestionsArray] = React.useState([]);
	const { signOut } = React.useContext(AuthContext);
    const { screenngCode } = route.params;
	const { clientPrimaryKey } = route.params;

	const [selectedItem, setSelectedItem] = React.useState({
		options:[],
	});

	const [data, setData] = React.useState({
		code:screenngCode,
		skillMatches:'',
		payRate:'0',
		currentlyLocated:'',
		workAuthorization:'',
		skillType:[],
		openToNegotiate:false,
	});

	React.useLayoutEffect(() => {
		navigation.setOptions({
			  title: `Pre-screening questions`,
		});
	}, [navigation]);

	
	useEffect(() => {
		console.log(`clientPrimaryKey: ${clientPrimaryKey}`)
		navigation.addListener('focus', () => {
			getScreningQuestion();
		})
		getScreningQuestion();
		
	},[]);

	const  getScreningQuestion = async() => {
		let user = await AsyncStorage.getItem('loginDetails');  
		var encoded = "U3RhZmZMaW5lQDIwMTc=";
        if(user){
            let parsed = JSON.parse(user);  
            let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
            encoded = base64.encode(userAuthToken);    
        } 

		setIsLoading(true);
		axios ({  
		  "method": "POST",
		  "url": BaseUrl + EndPoints.ScreeningQuestion,
		  "headers": getAuthHeader(encoded),
		  data:{'code':screenngCode}
		})
		.then((response) => {
			setIsLoading(false);
			if (response.data.code == 200){
				setQuestionsArray(response.data.content.dataList[0].questionDetails);
			}else if (response.data.code == 417){
				console.log(Object.values(response.data.content.messageList));
				const message = parseErrorMessage(response.data.content.messageList);
				Alert.alert(StaticMessage.AppName, message, [
					{text: 'Ok'}
				]);
		
			}else{
			}
		})
		.catch((error) => {
		  console.error(error);
		  setIsLoading(false);
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
	const  handleSubmitQuestion = async() => {
		let user = await AsyncStorage.getItem('loginDetails');  
		var encoded = "U3RhZmZMaW5lQDIwMTc=";
        if(user){
            let parsed = JSON.parse(user);  
            let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
            encoded = base64.encode(userAuthToken);    
        } 

		setIsLoading(true);
		axios ({  
		  "method": "POST",
		  "url": BaseUrl + EndPoints.ScreeningQuestionSave,
		  "headers": getAuthHeader(encoded),
		  data:data
		})
		.then((response) => {
			setIsLoading(false);
			if (response.data.code == 200){
				let message = 'Your completed application has been submitted for review. Updates are typically available within 24 hours.';
				console.log(JSON.stringify(response.data.content));
				Alert.alert(StaticMessage.AppName,message,
				[{
					text: 'Ok',
					onPress: () => handleSimilarJobs(true)
				},{
					text: 'View similar jobs',
					onPress: () => handleSimilarJobs(true)
				}]
			)
			}else if (response.data.code == 417){
				console.log(Object.values(response.data.content.messageList));
				const message = parseErrorMessage(response.data.content.messageList);
				Alert.alert(StaticMessage.AppName, message, [
					{text: 'Ok'}
				]);
		
			}else{
			}
		})
		.catch((error) => {
		  console.error(error);
		  setIsLoading(false);
		  if(error.response && error.response.status == 401){
			SessionExpiredAlert();
		  }else{
			  Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
				  {text: 'Ok'}
				]);
		  }
		})
	}
	const handleSimilarJobs = (showSimilarJob) => {
		navigation.goBack();
		console.log('Pre-Screning callback');

		if(route.params.onClickEvent){
			route.params.onClickEvent(clientPrimaryKey,showSimilarJob);
		}
	}
	
	const handleSelectionPicker = (item) => {
		setSelectedItem(item);
		selectionRef.current?.setModalVisible();
	}
	const getSelectedValue = () => {
		if(selectedItem.name == 'skillMatches'){
			return data.skillMatches;
		}else if(selectedItem.name == 'currentlyLocated'){
			return data.currentlyLocated;
		}else if(selectedItem.name == 'workAuthorization'){
			return data.workAuthorization;
		}
		return '';
	}
	const getSelectedValueFromItem = (Item) => {
		setSelectedItem(Item);

		if(Item.name == 'skillMatches'){
			return data.skillMatches;
		}else if(Item.name == 'currentlyLocated'){
			return data.currentlyLocated;
		}else if(Item.name == 'workAuthorization'){
			return data.workAuthorization;
		}
		return '';
	}

	const handleSelectedValue = (selectedValue) => {
		if(selectedItem.name == 'skillMatches'){
			setData({...data, skillMatches:selectedValue});
		}else if(selectedItem.name == 'currentlyLocated'){
			setData({...data, currentlyLocated:selectedValue});
		}else if(selectedItem.name == 'workAuthorization'){
			setData({...data, workAuthorization:selectedValue});
		}
	}
	const getItemValue = (item) => {
		if(item.name == 'skillMatches'){
			return data.skillMatches;
		}else if(item.name == 'currentlyLocated'){
			return data.currentlyLocated;
		}else if(item.name == 'workAuthorization'){
			return data.workAuthorization;
		}
		return '';
	}
	const arrayHasIndex = (array, itemName) => {
        let index = array.indexOf(itemName);
        if(index != -1) {
            return true;
        }
        return false;
    };
	const handleSkillTypeSelect = (itemName) => {
		var tempArr = data.skillType
        if(arrayHasIndex(tempArr,itemName)){
            let index = tempArr.indexOf(itemName);
            if(index != -1) {
                tempArr.splice(index, 1); // remove 1 element from index 
             }
        }else{
            tempArr.push(itemName);
        }
        setData({...data,skillType:tempArr});
	}

	return(
		<SafeAreaView style={{flex:1,backgroundColor:ThemeColor.ViewBgColor, paddingBottom:34}}>
			<FlatList style={{}}
                data={questionsArray}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({item}) => 
                <View>
					{item.type == 'select' ? 
					Platform.OS == 'ios' ?
					<View>
						<View style={{marginTop:12}}>
							<Text style ={{color:ThemeColor.SubTextColor, fontSize:14, fontFamily:FontName.Regular, paddingLeft:16, marginBottom:8}}>{item.question}</Text>
							<TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}  onPress={() => {handleSelectionPicker(item)}}>
								<Text style={[styles.labelText,{color:getItemValue(item).length > 0 ? 'black' : ThemeColor.PlaceHolderColor}]}>{getItemValue(item).length >0 ? getItemValue(item) : 'Select your choice'}</Text>
								<Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22} />
							</TouchableOpacity>
						</View> 
					</View> :
					<View>
						<View style={{marginTop:12}}>
							<Text style ={{color:ThemeColor.SubTextColor, fontSize:14, fontFamily:FontName.Regular, paddingLeft:16, marginBottom:8}}>{item.question}</Text>
							<View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center'}}  onPress={() => {handleSelectionPicker(item)}}>
								<Picker
									style={{flex:1,}}
									itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
									selectedValue={getSelectedValueFromItem(item)}
									onValueChange={(itemValue, index) =>{
										console.log(itemValue,index)
										handleSelectedValue(itemValue);
									}}>
									{item && item.options.map((item, index) => {
										return (<Picker.Item label={item} value={item} key={index}/>) 
									})}
								</Picker>							
							</View>
						</View> 
					</View> 
					: 
					null}
					{item.type == 'number' ? 
					<View style={{marginTop:12}}>
						<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:16, marginBottom:4}}>{item.question}</Text>
						<View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8, flex:1}}>
							<Text style ={{color:ThemeColor.TextColor, fontSize:16, fontFamily:FontName.Regular, paddingLeft:16}}>$</Text>
							<TextInput  
								style={[styles.inputText,{color:data.openToNegotiate ? ThemeColor.BorderColor : ThemeColor.TextColor, marginLeft:2}]}
								placeholder="Enter hourly rate" 
								placeholderTextColor={ThemeColor.PlaceHolderColor}
								keyboardType='decimal-pad'
								value= {data.payRate}
								editable={!data.openToNegotiate}
								onChangeText={(val) => setData({...data,payRate:val})}
							/>
							<TouchableOpacity  style={{ backgroundColor:'#fff',justifyContent: 'center', flexDirection:'row', marginRight:8,alignItems: 'center', height:30, width:'50%'}} onPress={() =>{setData({...data,openToNegotiate:!data.openToNegotiate})}}>
                                <Icon name= {data.openToNegotiate == true ? "checkbox-outline":"square-outline"} color={ThemeColor.BtnColor} size={20} />
                                <Text style={{marginLeft:8, fontFamily: FontName.Regular, fontSize:14, color:ThemeColor.TextColor, flex:1}}>{item.options[0]}</Text>
                            </TouchableOpacity> 
						</View>
					</View>  : null}
					{item.type == 'checkbox' ? 
					<View style={{marginTop:12}}>
						<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:16, marginBottom:4}}>{item.question}</Text>
						<FlatList style={{backgroundColor:'red'}}
							data={item.options}
							keyExtractor={(item, index) => index.toString()}
							renderItem={({item}) => 
								<View style={{width:'100%',backgroundColor:'#fff',paddingLeft:16}}>
									<TouchableOpacity  style={{  flexDirection:'row', marginRight:8, height:35, alignItems:'center'}} onPress={() =>{handleSkillTypeSelect(item)}}>
										<Icon name= {arrayHasIndex(data.skillType,item) ? "checkbox-outline" : "square-outline" } color={ThemeColor.BtnColor} size={20,20} />
										<Text style={{marginLeft:8, fontFamily: FontName.Regular, fontSize:14, color:ThemeColor.TextColor}}>{item}</Text>
									</TouchableOpacity>
									<View style={{height:1, backgroundColor:ThemeColor.BorderColor}}/>
								</View>
							} 
						/>
					</View>  : null}
                </View>
                }
            />
			<TouchableOpacity style={styles.btnFill} onPress={() => {handleSubmitQuestion()}}>
				<Text style={{color:'#53962E',fontFamily: FontName.Regular, fontSize:16, color:'#fff' }}>SUBMIT</Text>
			</TouchableOpacity>
        	<Loader isLoading={isLoading} />
			<ActionSheet ref={selectionRef} containerStyle={{backgroundColor:ThemeColor.ViewBgColor}}>
				<View style={{height:300}}>
					<View style={{height:60, flexDirection:'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft:16,paddingRight:16}}>
					<TouchableOpacity onPress={() => {selectionRef.current?.setModalVisible()}}>
						<Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Cancel</Text>
					</TouchableOpacity>
					<Text style={{color:ThemeColor.TextColor, fontSize:16, fontFamily: FontName.Bold}}>Select an option</Text>
					<TouchableOpacity onPress={() => {
						{getSelectedValue().length == 0 && handleSelectedValue(selectedItem.options[0])}
						selectionRef.current?.setModalVisible()
						}}>
						<Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Done</Text>
					</TouchableOpacity>
					</View>
					<Picker
						style={{backgroundColor: 'white',flex:1,}}
						itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
						selectedValue={getSelectedValue()}
						onValueChange={(itemValue, index) =>{
							console.log(itemValue,index)
							handleSelectedValue(itemValue);
						}}>
						{selectedItem && selectedItem.options.map((item, index) => {
							return (<Picker.Item label={item} value={item} key={index}/>) 
						})}
					</Picker>
				</View>
			</ActionSheet>
		</SafeAreaView>
	);
}

export default PreScreeningScreen;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
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
        paddingLeft:16,
        paddingRight:16,
        height:40,
        backgroundColor:'#fff',
        alignItems:"center",
    
      },labelText:{
		flex: 1,
		color:'black',
		fontSize:16,
		fontFamily: FontName.Regular,
		marginLeft:16,
		alignContent:'stretch',
	  },inputText:{
		flex: 1,
		height:40,
		color:'black',
		fontSize:16,
		fontFamily: FontName.Regular,
		marginLeft:16,
		alignContent:'stretch',
	  },btnFill:{
		marginLeft:16, 
		marginRight:16,
		borderRadius:5,
		marginBottom:8,
		height:50,
		justifyContent:"center",
		backgroundColor: ThemeColor.BtnColor ,
		alignItems:'center',
	  }
  });