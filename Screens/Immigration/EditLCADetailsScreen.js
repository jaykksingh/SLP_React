/* eslint-disable react/display-name */
import React , {useEffect,createRef} from "react";
import { View,
    Text,
    StyleSheet,
    Alert,
    TextInput,
    FlatList,
	TouchableOpacity,
    SafeAreaView} from "react-native";
import SegmentedControlTab from "react-native-segmented-control-tab";
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'
import axios from 'axios';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import Icons from 'react-native-vector-icons/Ionicons';
import { BaseUrl, EndPoints, StaticMessage, ThemeColor, FontName } from '../../_helpers/constants';
import { getAuthHeader} from '../../_helpers/auth-header';
import Loader from '../../Components/Loader';
import Feather from 'react-native-vector-icons/Feather';
import ActionSheet from "react-native-actions-sheet";
import {Picker} from '@react-native-picker/picker';

const applForRef = createRef();
const priorityRef = createRef();
const currentStatusRef = createRef();
const skillsRef = createRef();

const EditLCADetailsScreen = ({route,navigation}) => {
	let [isLoading, setLoading] = React.useState(false);
	let [selectedIndex, setSelectedIndex] = React.useState(0);
	let [data,setData] = React.useState({
		applTypeName:'',
		applTypeId:'',
		applFor:'',
		applForId:'',
		firstName:'',
		lastName:'',
		email:'',
		contactNumber:'',
		contactNumberCountryCode:'1',
		appPriorityId:'',
		appPriority:'',
		currentStatusName:'',
		currentStatus:'',
		skillCategoryId:'',
		skillCategory:'',
		comments:'',
		documentsList:[],
		updated:false,
	});
	const {docList} = route.params;
	const [lookUpData, setLookUpData] = React.useState({});
	const {applicationID} = route.params;
	const {applicationDetails} = route.params;

	

	React.useLayoutEffect(() => {
		navigation.setOptions({
			title:'Application details'
		});
	}, [navigation]);

	useEffect(() => {
		getLookupData();	
		setData({...data,updated:!data.updated,documentsList:applicationDetails.documentsList});
	
	},[]);
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
  
  const handleIndexChange = (index) => {
    setSelectedIndex(index);
    console.log("Index:", index);
    if(index == 1){
    }else{
    }
  }
 

  const getApplicationDetails = async (applicationID) => {
    setLoading(true);

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
      setLoading(false);
      if (response.data.code == 200){
        let result = JSON.stringify(response.data.content.dataList[0]);
		console.log('App Details:',result);
		let responce = response.data.content.dataList[0];
		setData({...data,updated:!data.updated,documentsList:data.documentsList});
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
		console.log(error);
        setLoading(false);
        Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
            {text: 'Ok'}
        ]);
    })
  }

  
  
	const toggleSwitch = () => {
		setData({...data,allowSms:!data.allowSms});
	}
	const applicationTypeList = lookUpData ? lookUpData.applicationForList : [];
	const priorityList = lookUpData ? lookUpData.priorityList : [];
	const currentEmploymentStatusList = lookUpData ? lookUpData.currentEmploymentStatusList : [];
	const skillCategoryList = lookUpData ? lookUpData.skillCategoryList : [];
	const applicationForList = lookUpData ? lookUpData.applicationForList : [];
	console.log('App for list:',lookUpData);
  	return (
      	<SafeAreaView style={[styles.container,{backgroundColor:ThemeColor.ViewBgColor,}]}>
			{data.documentsList.length > 0 && 
			<View style={{alignItems:'center', justifyContent:'center', height:50,marginTop:8}}>
				<SegmentedControlTab
					tabStyle ={{ borderColor: ThemeColor.BtnColor}}
					activeTabStyle={{ backgroundColor: ThemeColor.BtnColor  }}
					tabsContainerStyle={{ height: 35, width:'70%', tintColor:ThemeColor.BtnColor, borderColor:ThemeColor.BtnColor }}
					lastTabStyle={{color: ThemeColor.LabelTextColor}}		  
					values={["Details", "Documents"]}
					tabTextStyle={{ color: ThemeColor.BtnColor }}
					activeTabTextStyle={{ color: '#fff' }}
					selectedIndex={selectedIndex}
					onTabPress={ (index) => {handleIndexChange(index)}}
				/>
			</View>
			}
			{
			selectedIndex == 0 ?
			<>
			<KeyboardAwareScrollView style={{paddingLeft:16,paddingRight:16}}> 
			  	<View style={{marginTop:12}}>
					<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Application type</Text>
					<View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}>
						<Text style={[styles.labelText,{color:data.applTypeName.length > 0 ? 'black' : ThemeColor.PlaceHolderColor}]}>{data.applTypeName.length >0 ? data.applTypeName : 'Application type'}</Text>
					</View>
				</View>
				{Platform.OS == 'ios' ? 
				<View style={{marginTop:12}}>
					<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Application for</Text>
					<TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}  onPress={() => {applForRef.current?.setModalVisible()}}>
						<Text style={[styles.labelText,{color:data.applFor.length > 0 ? 'black' : ThemeColor.PlaceHolderColor}]}>{data.applFor.length >0 ? data.applFor : 'Application For'}</Text>
						<Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22} />
					</TouchableOpacity>
				</View> :
				<View style={{marginTop:12}}>
					<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Application for</Text>
					<View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}} >
						<Picker
							style={{flex:1,fontSize:14, fontFamily: FontName.Regular}}
							itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
							selectedValue={data.applForId}
							onValueChange={(itemValue, index) =>{
								let selectedObj = applicationForList[index];
								setData({...data, applForId: selectedObj.keyId,applFor: selectedObj.keyName});
							}}>
							{applicationForList && applicationForList.map((item, index) => {
								return (<Picker.Item label={item.keyName} value={item.keyId} key={index}/>) 
							})}
						</Picker>
					</View>
				</View>
				}
				<View style={{flexDirection:'row', flex:1,marginTop:12}}>
					<View style={{flex: 1,}}>
						<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>First name</Text>
						<View style={{backgroundColor:'white', height:40, borderTopLeftRadius:5,borderBottomLeftRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}>
						<TextInput  
							style={styles.inputText}
							placeholder="First name" 
							placeholderTextColor={ThemeColor.PlaceHolderColor}
							keyboardType='default'
							value= {data.firstName}
							onChangeText={(val) => setData({...data,firstName:val})}
						/>
						</View>
					</View>
					<View style={{flex:1}}>
						<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Last name</Text>
						<View style={{backgroundColor:'white', height:40, borderTopRightRadius:5,borderBottomRightRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}>
						<TextInput  
							style={styles.inputText}
							placeholder="Last name" 
							placeholderTextColor={ThemeColor.PlaceHolderColor}
							keyboardType='default'
							value= {data.lastName}
							onChangeText={(val) => setData({...data,lastName:val})}
						/>
						</View>
					</View>
				</View>
				<View style={{marginTop:12}}>
					<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Email</Text>
					<View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}>
						<TextInput  
						style={styles.inputText}
						placeholder="Email" 
						placeholderTextColor={ThemeColor.PlaceHolderColor}
						keyboardType='email-address'
						value= {data.email}
						onChangeText={(val) => setData({...data,email:val})}
						/>
					</View>
				</View>
				<View style={{marginTop:12}}>
					<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Phone number</Text>
					<View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}>
						<TouchableOpacity style={{flexDirection: 'row',marginRight:8, paddingLeft:8, alignItems:'center', justifyContent: 'center'}} onPress={() => setShow(true)}>
							{/* <Flag code="US" size={32}/> */}
							<Text style={{color:ThemeColor.TextColor, fontSize:16, fontFamily: FontName.Regular, marginRight:8, marginLeft:8}}>+{data.contactNumberCountryCode}</Text>
							<Icons name="caret-down" color={ThemeColor.LabelTextColor} size={20} />
						</TouchableOpacity>
						<TextInput  
						style={styles.inputText}
						placeholder="Phone number" 
						maxLength={14}
						placeholderTextColor={ThemeColor.PlaceHolderColor}
						keyboardType='phone-pad'
						textContentType='telephoneNumber' 
						dataDetectorTypes='phoneNumber' 
						value= {data.contactNumber}
						onChangeText={(val) => textPhoneChange(val)}
						/>
					</View>
				</View>
				{Platform.OS == 'ios' ?
				<>
					<View style={{marginTop:12}}>
						<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Priority</Text>
						<TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}  onPress={() => {priorityRef.current?.setModalVisible()}}>
							<Text style={[styles.labelText,{color:data.appPriority.length > 0 ? 'black' : ThemeColor.PlaceHolderColor}]}>{data.appPriority.length >0 ? data.appPriority : 'Priority'}</Text>
							<Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22} />
						</TouchableOpacity>
					</View>
					<View style={{marginTop:12}}>
						<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Current employment status for</Text>
						<TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}  onPress={() => {currentStatusRef.current?.setModalVisible()}}>
							<Text style={[styles.labelText,{color:data.currentStatusName.length > 0 ? 'black' : ThemeColor.PlaceHolderColor}]}>{data.currentStatusName.length >0 ? data.currentStatusName : 'Employment status'}</Text>
							<Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22} />
						</TouchableOpacity>
					</View>
					<View style={{marginTop:12}}>
						<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Skill</Text>
						<TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}  onPress={() => {skillsRef.current?.setModalVisible()}}>
							<Text style={[styles.labelText,{color:data.skillCategory.length > 0 ? 'black' : ThemeColor.PlaceHolderColor}]}>{data.skillCategory.length >0 ? data.skillCategory : 'Skills'}</Text>
							<Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22} />
						</TouchableOpacity>
					</View>
				</> :
				<>
					<View style={{marginTop:12}}>
						<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Priority</Text>
						<TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center'}}  onPress={() => {priorityRef.current?.setModalVisible()}}>
							<Picker
								style={{flex:1,fontSize:14, fontFamily: FontName.Regular}}
								itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
								selectedValue={data.appPriorityId}
								onValueChange={(itemValue, index) =>{
									let selectedObj = lookUpData.priorityList[index];
									setData({...data, appPriorityId: selectedObj.keyId,appPriority: selectedObj.keyName});
								}}>
								{lookUpData && lookUpData.priorityList.map((item, index) => {
									return (<Picker.Item label={item.keyName} value={item.keyId} key={index}/>) 
								})}
							</Picker>
						</TouchableOpacity>
					</View>
					<View style={{marginTop:12}}>
						<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Current employment status for</Text>
						<TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center'}}  onPress={() => {currentStatusRef.current?.setModalVisible()}}>
							<Picker
								style={{flex:1,fontSize:14, fontFamily: FontName.Regular}}
								itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
								selectedValue={data.currentStatus}
								onValueChange={(itemValue, index) =>{
									let selectedObj = currentEmploymentStatusList[index];
									setData({...data, currentStatus: selectedObj.keyId,currentStatusName: selectedObj.keyName});
								}}>
								{currentEmploymentStatusList.map((item, index) => {
									return (<Picker.Item label={item.keyName} value={item.keyId} key={index}/>) 
								})}
							</Picker>						
						</TouchableOpacity>
					</View>
					<View style={{marginTop:12}}>
						<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Skill</Text>
						<View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center'}}  onPress={() => {skillsRef.current?.setModalVisible()}}>
							<Picker
								style={{flex:1,fontSize:14, fontFamily: FontName.Regular}}
								itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
								selectedValue={data.skillCategoryId}
								onValueChange={(itemValue, index) =>{
									let selectedObj = skillCategoryList[index];
									setData({...data, skillCategoryId: selectedObj.id,skillCategory: selectedObj.name});
								}}>
								{skillCategoryList.map((item, index) => {
									return (<Picker.Item label={item.name} value={item.id} key={index}/>) 
								})}
							</Picker>
						</View>
					</View>
				</>}
				
				<View style={{marginTop:12}}>
					<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Comments</Text>
					<View style={{backgroundColor:'white', height:100, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}>
					<TextInput  
						style={[styles.inputText,{height:90, textAlignVertical:'top'}]}
						multiline={true}
						placeholder="Not provided" 
						placeholderTextColor={ThemeColor.PlaceHolderColor}
						keyboardType='default'
						value= {data.comments}
						onChangeText={(val) => setData({...data,comments:val})}
					/>
					</View>
				</View> 
			</KeyboardAwareScrollView>
			<View style={{flexDirection:'row',marginTop:8, marginLeft:16, marginRight:16,}}>
				<TouchableOpacity style={styles.btnFill} onPress={() => {updateApplicationDetails()}}>
				<Text style={{color:'#53962E',fontFamily: FontName.Regular, fontSize:16, color:'#fff' }}>{docList && docList.length > 0 ? 'NEXT' : 'SUBMIT'}</Text>
				</TouchableOpacity>
			</View> 
        	<Loader isLoading={isLoading} />
			<ActionSheet ref={applForRef} containerStyle={{backgroundColor:ThemeColor.ViewBgColor}}>
				<View style={{height:300}}>
					<View style={{height:60, flexDirection:'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft:16,paddingRight:16}}>
					<TouchableOpacity onPress={() => {applForRef.current?.setModalVisible()}}>
						<Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Cancel</Text>
					</TouchableOpacity>
					<Text style={{color:ThemeColor.TextColor, fontSize:16, fontFamily: FontName.Bold}}>Application for</Text>
					<TouchableOpacity onPress={() => {
						data.applFor.length == 0 ? setData({...data,applForId:lookUpData.applicationForList[0].keyId,applFor:lookUpData.applicationForList[0].keyName}) : '';
						applForRef.current?.setModalVisible()}
					}>
						<Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Done</Text>
					</TouchableOpacity>
					</View>
					<Picker
						style={{backgroundColor: 'white',flex:1,fontSize:14, fontFamily: FontName.Regular}}
						itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
						selectedValue={data.applForId}
						onValueChange={(itemValue, index) =>{
							let selectedObj = applicationForList[index];
							setData({...data, applForId: selectedObj.keyId,applFor: selectedObj.keyName});
						}}>
						{applicationForList.map((item, index) => {
							return (<Picker.Item label={item.keyName} value={item.keyId} key={index}/>) 
						})}
					</Picker>
				</View>
			</ActionSheet>
			<ActionSheet ref={priorityRef} containerStyle={{backgroundColor:ThemeColor.ViewBgColor}}>
				<View style={{height:300}}>
					<View style={{height:60, flexDirection:'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft:16,paddingRight:16}}>
					<TouchableOpacity onPress={() => {priorityRef.current?.setModalVisible()}}>
						<Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Cancel</Text>
					</TouchableOpacity>
					<Text style={{color:ThemeColor.TextColor, fontSize:16, fontFamily: FontName.Bold}}>Priority</Text>
					<TouchableOpacity onPress={() => {
						data.appPriority.length == 0 ? setData({...data,appPriorityId:lookUpData.priorityList[0].keyId,appPriority:lookUpData.priorityList[0].keyName}) : '';
						priorityRef.current?.setModalVisible()}
					}>
						<Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Done</Text>
					</TouchableOpacity>
					</View>
					<Picker
						style={{backgroundColor: 'white',flex:1,fontSize:14, fontFamily: FontName.Regular}}
						itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
						selectedValue={data.appPriorityId}
						onValueChange={(itemValue, index) =>{
							let selectedObj = priorityList[index];
							setData({...data, appPriorityId: selectedObj.keyId,appPriority: selectedObj.keyName});
						}}>
						{priorityList.map((item, index) => {
							return (<Picker.Item label={item.keyName} value={item.keyId} key={index}/>) 
						})}
					</Picker>
				</View>
			</ActionSheet>  
			<ActionSheet ref={currentStatusRef} containerStyle={{backgroundColor:ThemeColor.ViewBgColor}}>
				<View style={{height:300}}>
					<View style={{height:60, flexDirection:'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft:16,paddingRight:16}}>
					<TouchableOpacity onPress={() => {currentStatusRef.current?.setModalVisible()}}>
						<Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Cancel</Text>
					</TouchableOpacity>
					<Text style={{color:ThemeColor.TextColor, fontSize:16, fontFamily: FontName.Bold}}>Employment status</Text>
					<TouchableOpacity onPress={() => {
						data.currentStatusName.length == 0 ? setData({...data,currentStatus:lookUpData.currentEmploymentStatusList[0].keyId,currentStatusName:lookUpData.currentEmploymentStatusList[0].keyName}) : '';
						currentStatusRef.current?.setModalVisible()}
					}>
						<Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Done</Text>
					</TouchableOpacity>
					</View>
					<Picker
						style={{backgroundColor: 'white',flex:1,fontSize:14, fontFamily: FontName.Regular}}
						itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
						selectedValue={data.currentStatus}
						onValueChange={(itemValue, index) =>{
							let selectedObj = lookUpData.currentEmploymentStatusList[index];
							setData({...data, currentStatus: selectedObj.keyId,currentStatusName: selectedObj.keyName});
						}}>
						{lookUpData && lookUpData.currentEmploymentStatusList.map((item, index) => {
							return (<Picker.Item label={item.keyName} value={item.keyId} key={index}/>) 
						})}
					</Picker>
				</View>
			</ActionSheet>   
			<ActionSheet ref={skillsRef} containerStyle={{backgroundColor:ThemeColor.ViewBgColor}}>
				<View style={{height:300}}>
					<View style={{height:60, flexDirection:'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft:16,paddingRight:16}}>
					<TouchableOpacity onPress={() => {skillsRef.current?.setModalVisible()}}>
						<Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Cancel</Text>
					</TouchableOpacity>
					<Text style={{color:ThemeColor.TextColor, fontSize:16, fontFamily: FontName.Bold}}>Skills</Text>
					<TouchableOpacity onPress={() => {
						data.skillCategory.length == 0 ? setData({...data,skillCategoryId:lookUpData.skillCategoryList[0].id,skillCategory:lookUpData.skillCategoryList[0].name}) : '';
						skillsRef.current?.setModalVisible()}
					}>
						<Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Done</Text>
					</TouchableOpacity>
					</View>
					<Picker
						style={{backgroundColor: 'white',flex:1,fontSize:14, fontFamily: FontName.Regular}}
						itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
						selectedValue={data.skillCategoryId}
						onValueChange={(itemValue, index) =>{
							let selectedObj = lookUpData.skillCategoryList[index];
							setData({...data, skillCategoryId: selectedObj.id,skillCategory: selectedObj.name});
						}}>
						{lookUpData && lookUpData.skillCategoryList.map((item, index) => {
							return (<Picker.Item label={item.name} value={item.id} key={index}/>) 
						})}
					</Picker>
				</View>
			</ActionSheet>        
			</> 
			: 
			<View style={{flex: 1}}>
				<View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8, marginTop:16, justifyContent:'space-between', marginLeft:16,marginRight:16}}>
					<Text style ={{color:ThemeColor.TextColor, fontSize:16, fontFamily:FontName.Regular, paddingLeft:8}}>Application for</Text>
					<Text style ={{color:ThemeColor.NavColor, fontSize:16, fontFamily:FontName.Regular, paddingLeft:8}}>Self</Text>
				</View>
				<View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8, marginTop:16, justifyContent:'space-between', marginLeft:16,marginRight:16}}>
					<Text style ={{color:ThemeColor.TextColor, fontSize:16, fontFamily:FontName.Regular, paddingLeft:8}}>Application Type</Text>
					<Text style ={{color:ThemeColor.NavColor, fontSize:16, fontFamily:FontName.Regular, paddingLeft:8}}>H1-B Extension</Text>
				</View>

				<FlatList style={{marginTop:16}}
					data={data.documentsList}
					randomUpdateProp={data.updated}
					keyExtractor={(item, index) => index.toString()}
					renderItem={({item,index}) => 
						<View style={{backgroundColor:'white', marginBottom:8, paddingBottom:8,paddingTop:8, marginLeft:16, marginRight:16,borderRadius:5, flexDirection:'row', justifyContent:'center'}}>
							<Text style ={{color:ThemeColor.TextColor, fontSize:14, fontFamily:FontName.Regular, paddingLeft:8, flex:1}}>{item.documentName}</Text>
							<Text style ={{color:ThemeColor.SubTextColor, fontSize:12, fontFamily:FontName.Regular, paddingLeft:8,width:90, paddingRight:8}}>Not uploaded</Text>
						</View>
					}
				/>
			</View>
		}
        
        <Loader isLoading={isLoading} />
      </SafeAreaView>
    );
}
export default EditLCADetailsScreen;


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
    
      },inputText:{
		flex: 1,
		height:40,
		color:'black',
		fontSize:16,
		fontFamily: FontName.Regular,
		marginLeft:8,
		alignContent:'stretch',
	  },
	  labelText:{
		flex: 1,
		color:'black',
		fontSize:16,
		fontFamily: FontName.Regular,
		marginLeft:8,
		alignContent:'stretch',
	  }
  });