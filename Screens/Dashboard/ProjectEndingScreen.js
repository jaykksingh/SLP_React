import React ,{useEffect,useState,createRef} from "react";
import { StatusBar, 
    StyleSheet, 
    Text,
    TouchableOpacity,
    SafeAreaView,
    View,
    ScrollView,
    Alert,
    FlatList,
    TextInput,
    Dimensions,
    Platform,
} from "react-native";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'
import axios from 'axios'
import Icon from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import moment from 'moment';
import DatePicker from 'react-native-date-picker'
import ActionSheet from "react-native-actions-sheet";
import {Picker} from '@react-native-picker/picker';
import {parseErrorMessage} from '../../_helpers/Utils';
import Loader from '../../Components/Loader';
import {getAuthHeader} from '../../_helpers/auth-header';
import { BaseUrl, EndPoints, StaticMessage, ThemeColor, FontName } from '../../_helpers/constants';

const projectRef = createRef();
const dateRef = createRef();
const reasonRef = createRef();


const ProjectEndingScreen = ({route,navigation}) => {
  const [isLoading,setIsLoading] = React.useState(false);
  const [data,setData] = React.useState({
	  projectName:'',
	  projectId:'',
	  projectEndDate: '',
	  reason:'',
	  reasonId:'',
	  comment:'',
  });
  const [projectArray, setProjectArray] = React.useState([]);

  const [endDate, setEndDate] = React.useState(new Date());
  const [lookupData, setLookupData] = useState({});

  

  React.useLayoutEffect(() => {
    navigation.setOptions({
        title: 'Project ending'
    });
  }, [navigation]);
  const showLogOutAlert = () =>{
    Alert.alert(StaticMessage.AppName,'Are sure want to delete?',
        [{
          	text: 'Cancel',
        },
		{
            text: 'Delete',
            onPress: () => deleteProfileDetails(skill.candidateSkillId)
        }]
      )
  }
  
  useEffect(() => {
	  getProjectDetails();
    getUserLookups();	
   
  },[])
  const  getUserLookups = async() => {
    let user = await AsyncStorage.getItem('loginDetails');  
    let parsed = JSON.parse(user);  
    let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
    var authToken = base64.encode(userAuthToken);

    setIsLoading(true);
    axios ({  
      "method": "GET",
      "url": BaseUrl + EndPoints.UserLookups,
      "headers": getAuthHeader(authToken)
    })
    .then((response) => {
      if (response.data.code == 200){
        setIsLoading(false);
        setLookupData(response.data.content.dataList[0]);
      }else if (response.data.code == 417){
        setIsLoading(false);
        console.log(Object.values(response.data.content.messageList));
        const errorList = Object.values(response.data.content.messageList);
        Alert.alert(StaticMessage.AppName, errorList.join(), [
          {text: 'Ok'}
        ]);

      }else{
        setIsLoading(false);
      }
    })
    .catch((error) => {
        setIsLoading(false);
        Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
          {text: 'Ok'}
        ]);
    })
  }
  const  getProjectDetails = async() => {

		let user = await AsyncStorage.getItem('loginDetails');  
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken);

		setIsLoading(true);
		axios ({  
		"method": "GET",
		"url": BaseUrl + EndPoints.CurrentProjectsList,
		"headers": getAuthHeader(authToken)
		})
		.then((response) => {
		setIsLoading(false);
		if (response.data.code == 200){
			const results = JSON.stringify(response.data.content.dataList[0])
			console.log(`Current Projects: ${results}`);

			setProjectArray(response.data.content.dataList);
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

  const  updateProfileDetails = async() => {
    let user = await AsyncStorage.getItem('loginDetails');  
    let parsed = JSON.parse(user);  
    let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
    var authToken = base64.encode(userAuthToken);

    setIsLoading(true);

    const params = {
        "projectDetailId":data.projectId,
        'projectEndDate':data.projectEndDate,
        'reasonId':data.reasonId,
        'comment':data.comment,
    }
    console.log('Params:',JSON.stringify(params));
    axios ({  
      "method": "POST",
      "url": BaseUrl + EndPoints.ProjectEndDate,
      "headers": getAuthHeader(authToken),
      data:params
    })
    .then((response) => {
      if (response.data.code == 200){
        setIsLoading(false);
        let message = 'Your update has been submitted to the project support team';
        Alert.alert(StaticMessage.AppName,message,
          [{
            text: 'Ok',
            onPress: () => navigation.goBack()
          }])
       
        navigation.goBack();
      }else if (response.data.code == 417){
        setIsLoading(false);
        const message = parseErrorMessage(response.data.content.messageList);
        Alert.alert(StaticMessage.AppName, message, [
          {text: 'Ok'}
        ]);

      }else{
        setIsLoading(false);
      }
    })
    .catch((error) => {
      setIsLoading(false);
      Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
        {text: 'Ok'}
      ]);

    })
  }
  
  
	const handleEndDateChange = (val) =>{
		setEndDate(val);
		let showDate = moment(val).format('MMM DD, YYYY')
		setData({...data,projectEndDate:showDate});
	}

	const availabilityList = lookupData ? lookupData.availability : [];
	const reasonList = lookupData ? lookupData.reasonList : [];

	
 	return (
    <SafeAreaView style={styles.container}>
    	<KeyboardAwareScrollView style={{paddingLeft:16, paddingRight:16, marginTop:16,marginBottom:32,width:'100%' }}>
        {Platform.OS == 'ios' ?
          <View style={{marginTop:12}}>
            <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Project</Text>
            <TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}  onPress={() => {projectRef.current?.setModalVisible()}}>
              <Text style={[styles.labelText,{color:data.projectName.length > 0 ? 'black' : ThemeColor.PlaceHolderColor}]}>{data.projectName.length >0 ? data.projectName : 'Select project'}</Text>
              <Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22,22} />
            </TouchableOpacity>
          </View> : 
          <View style={{marginTop:12}}>
            <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Project</Text>
            <View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center'}}>
              <Picker
                style={{flex:1,fontSize:14, fontFamily: FontName.Regular}}
                itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
                selectedValue={data.projectId}
                onValueChange={(itemValue, index) =>{
                  let selectedObj = projectArray[index];
                  setData({...data, projectId: selectedObj.projectDetails.projectDetailId,projectName: selectedObj.projectDetails.projectName})
                }}>
                {projectArray && projectArray.map((item, index) => {
                  return (<Picker.Item label={item.projectDetails.projectName} value={item.projectDetails.projectDetailId} key={index}/>) 
                })}
              </Picker>
            </View>
          </View>
        }
        <View style={{flex:1, marginTop:12}}>
          <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Project end date</Text>
          <TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}  onPress={() => {dateRef.current?.setModalVisible()}}>
            <Text style={[styles.labelText,{color:data.projectEndDate.length > 0 ? 'black' : ThemeColor.PlaceHolderColor}]}>{data.projectEndDate.length > 0 ? data.projectEndDate : 'Select end date'}</Text>
            <Icon name="calendar" color={ThemeColor.SubTextColor} size={22} />
          </TouchableOpacity>
        </View> 
        {Platform.OS == 'ios' ?
          <View style={{marginTop:12}}>
            <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Reason</Text>
            <TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}  onPress={() => {reasonRef.current?.setModalVisible()}}>
              <Text style={[styles.labelText,{color:data.reason.length > 0 ? 'black' : ThemeColor.PlaceHolderColor}]}>{data.reason.length >0 ? data.reason : 'Selct reason'}</Text>
              <Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22} />
            </TouchableOpacity>
          </View> :
          <View style={{marginTop:12}}>
            <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Reason</Text>
            <View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center'}}>
              <Picker
                style={{flex:1,}}
                itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
                selectedValue={data.reasonId}
                onValueChange={(itemValue, index) =>{
                  console.log(itemValue,index)
                  let selectedItem = reasonList[index];
                  setData({...data,reason:selectedItem.keyName,reasonId:selectedItem.keyId});

                }}>
                {reasonList && reasonList.map((item, index) => {
                  return (<Picker.Item label={item.keyName} value={item.keyId} key={index}/>) 
                })}
              </Picker>
            </View>
          </View> 
        }
        <View style={{marginTop:12}}>
          <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Comment</Text>
          <View style={{backgroundColor:'white', height:100, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}>
          <TextInput  
            style={[styles.inputText,{height:90, textAlignVertical:'top'}]}
            multiline={true}
            placeholder="Enter message" 
            placeholderTextColor={ThemeColor.PlaceHolderColor}
            keyboardType='default'
            value= {data.comment}
            onChangeText={(val) => setData({...data,comment:val})}
          />
          </View>
        </View> 
      </KeyboardAwareScrollView>
		<View style={{flexDirection:'row',borderRadius:5, marginTop:8, marginLeft:16,marginRight:16, marginBottom:34}}>
			<TouchableOpacity style={styles.btnFill} onPress={() => {updateProfileDetails()}}>
				<Text style={{color:'#53962E',fontFamily: FontName.Regular, fontSize:16, color:'#fff' }}>SAVE</Text>
			</TouchableOpacity>
		</View>
		<ActionSheet ref={projectRef} containerStyle={{backgroundColor:ThemeColor.ViewBgColor}}>
			<View style={{height:300}}>
				<View style={{height:60, flexDirection:'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft:16,paddingRight:16}}>
				<TouchableOpacity onPress={() => {projectRef.current?.setModalVisible()}}>
					<Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Cancel</Text>
				</TouchableOpacity>
				<Text style={{color:ThemeColor.TextColor, fontSize:16, fontFamily: FontName.Bold}}>Select project</Text>
				<TouchableOpacity onPress={() => {
					data.projectName.length == 0 ? setData({...data,projectId:projectArray[0].projectDetails.projectDetailId,projectName:projectArray[0].projectDetails.projectName}) : '';
					projectRef.current?.setModalVisible()}
				}>
					<Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Done</Text>
				</TouchableOpacity>
				</View>
				<Picker
					style={{backgroundColor: 'white',flex:1,fontSize:14, fontFamily: FontName.Regular}}
          itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
					selectedValue={data.projectId}
					onValueChange={(itemValue, index) =>{
						let selectedObj = projectArray[index];
						setData({...data, projectId: selectedObj.projectDetails.projectDetailId,projectName: selectedObj.projectDetails.projectName})
					}}>
					{projectArray && projectArray.map((item, index) => {
						return (<Picker.Item label={item.projectDetails.projectName} value={item.projectDetails.projectDetailId} key={index}/>) 
					})}
				</Picker>
			</View>
		</ActionSheet>
		<ActionSheet ref={dateRef} containerStyle={{backgroundColor:ThemeColor.ViewBgColor}}>
          <View style={{height:300}}>
            <View style={{height:44, flexDirection:'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft:16,paddingRight:16}}>
              <TouchableOpacity onPress={() => {dateRef.current?.setModalVisible()}}>
                <Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Cancel</Text>
              </TouchableOpacity>
              <Text style={{color:ThemeColor.TextColor, fontSize:18, fontFamily: FontName.Regular}}>End date</Text>
              <TouchableOpacity onPress={() => {
                {data.projectEndDate.length == 0 && handleEndDateChange(endDate)}
                dateRef.current?.setModalVisible()
                }}>
                <Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Done</Text>
              </TouchableOpacity>
            </View>
            <DatePicker
                style={{backgroundColor: 'white',flex:1,width:Dimensions.get('window').width}}
              mode={'date'}
              minimumDate={new Date()}
              date={endDate}
              onDateChange={(val) => {handleEndDateChange(val)}}
            />
          </View>
        </ActionSheet>
		<ActionSheet ref={reasonRef} containerStyle={{backgroundColor:ThemeColor.ViewBgColor}}>
          <View style={{height:300}}>
            <View style={{height:60, flexDirection:'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft:16,paddingRight:16}}>
              <TouchableOpacity onPress={() => {reasonRef.current?.setModalVisible()}}>
                <Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Cancel</Text>
              </TouchableOpacity>
              <Text style={{color:ThemeColor.TextColor, fontSize:16, fontFamily: FontName.Bold}}>Select reason</Text>
              <TouchableOpacity onPress={() => {
                {data.reasonId.length == 0 && setData({...data,reason:reasonList[0].keyName,reasonId:reasonList[0].keyId})}
                reasonRef.current?.setModalVisible()
                }}>
                <Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Done</Text>
              </TouchableOpacity>
            </View>
            <Picker
              style={{backgroundColor: 'white',flex:1,}}
              itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
              selectedValue={data.reasonId}
              onValueChange={(itemValue, index) =>{
                console.log(itemValue,index)
                let selectedItem = reasonList[index];
                setData({...data,reason:selectedItem.keyName,reasonId:selectedItem.keyId});

              }}>
              {reasonList && reasonList.map((item, index) => {
                return (<Picker.Item label={item.keyName} value={item.keyId} key={index}/>) 
              })}
            </Picker>
          </View>
        </ActionSheet>
        <Loader isLoading={isLoading} />
		</SafeAreaView>
	);
}

export default ProjectEndingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:'#E5E9EB',
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
  },btnFill:{
    flex: 1,
    height:50,
    justifyContent:"center",
    backgroundColor: ThemeColor.BtnColor ,
    borderRadius:5,
    alignItems:'center',
  },chipTitle: {
    fontSize: 14,
    paddingLeft:8,
    paddingRight:8
  },chipItem: {
    padding: 4,
    marginVertical: 4,
    marginHorizontal: 8,
    borderRadius:20,
    borderColor:ThemeColor.BtnColor,
    borderWidth:1,
  },footer: {
    position:'absolute',
    bottom:0,
    flex: 1,
    backgroundColor: ThemeColor.ViewBgColor,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingBottom:16,
    height:'80%',
    width:'100%', 
    borderColor:ThemeColor.ViewBgColor,
    borderWidth:1,
    alignItems:'center',
  },
  containerContent: {marginTop: 140, height:200},
  containerHeader: {
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    backgroundColor: 'green',
    marginTop:100
  },
  headerContent:{
    marginTop: 0,
  },

}); 