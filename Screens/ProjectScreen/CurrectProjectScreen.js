import React ,{useEffect,createRef} from "react";
import { StatusBar, 
    StyleSheet, 
    Text,
    TouchableOpacity,
    Image,
    View,
    ScrollView,
    Alert,
    SafeAreaView,
    Dimensions,
    TextInput,
    Platform
} from "react-native";
import Feather from 'react-native-vector-icons/Feather';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import PageControl from 'react-native-page-control';
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'
import axios from 'axios'
import ActionSheet from "react-native-actions-sheet";
import {Picker} from '@react-native-picker/picker';
import {parseErrorMessage} from '../../_helpers/Utils';
import { ThemeColor ,BaseUrl, EndPoints, StaticMessage,MessageGroupId, FontName} from '../../_helpers/constants';
import {getAuthHeader} from '../../_helpers/auth-header';
import { AuthContext } from '../../Components/context';
import Loader from '../../Components/Loader';


const technologyRef = createRef();
const roleRef = createRef();

const CurrectProjectScreen = ({route,navigation}) => {
  const [data,setData] = React.useState({
    isLoading: true, 
    dob:'',
    name:'',
    email:'',
    comment:''
  });


  const [activeIndex, setActiveIndex] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);
  const [projectArray, setProjectArray] = React.useState([]);
  const [lookupData, setLookupData] = React.useState({});

  const [projectDetail, setProjectDetail] = React.useState({
    projectName:'',
    projectDuration:'',
    technology:'',
    role:'',
    projectDescription:'',
    specialComments:'',
    projectDetailId:'',
    technologyId:'',
    roleId:''
  });
  const [managerDetail, setManagerDetail] = React.useState({
    managerName:'',
    managerTitle:'',
    managerEmail:'',
    managerOffPhone:''
  });


  const { signOut } = React.useContext(AuthContext);
  const { skipOnboarding } = React.useContext(AuthContext);

  
  const showLogOutAlert = () =>{
    console.log('Log Out')
    Alert.alert('Are sure want to log out?',null,
        [{
          text: 'Cancel',
        },{
            text: 'Log out',
            onPress: () => signOut()
          }]
      )
  }
  React.useLayoutEffect(() => {
    navigation.setOptions({
        headerRight: () => (
            <TouchableOpacity style={{marginRight:16}} onPress={() => showLogOutAlert()}>
              <Feather name="more-vertical" color={'white'} size={25,25} />
            </TouchableOpacity>
        ),
    });
  }, [navigation]);


  useEffect(() => {
    getAllDetails();
  },[]);

  const  getAllDetails = async () => {
    let user = await AsyncStorage.getItem('loginDetails');  
    let parsed = JSON.parse(user);  
    let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
    var encoded = base64.encode(userAuthToken);
    getProjectDetails(encoded);
    getProjectLookups(encoded);
  }
  const  getProjectLookups = async(authToken) => {

    setIsLoading(true);
    axios ({  
      "method": "GET",
      "url": BaseUrl + EndPoints.ProjectLookups,
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
  const  getProjectDetails = (authToken) => {
    setIsLoading(true);
    axios ({  
      "method": "GET",
      "url": BaseUrl + EndPoints.CurrentProjectsList,
      "headers": getAuthHeader(authToken)
    })
    .then((response) => {
      setIsLoading(false);
      if (response.data.code == 200){
        setProjectArray(response.data.content.dataList);
        if(response.data.content.dataList.length > 0){
          setProjectDetail(response.data.content.dataList[0].projectDetails);
          setManagerDetail(response.data.content.dataList[0].managerDetails);
        }
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
  const  updateProjectDetails = async() => {
    let user = await AsyncStorage.getItem('loginDetails');  
    let parsed = JSON.parse(user);  
    let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
    var authToken = base64.encode(userAuthToken);

    setIsLoading(true);
   

    const params = {
        'projectName':projectDetail.projectName,
        "projectDetailId":projectDetail.projectDetailId,
        'projectDuration':projectDetail.projectDuration,
        'roleId':projectDetail.roleId,
        'technologyId':projectDetail.technologyId,
        'managerName':managerDetail.managerName,
        'managerTitle':managerDetail.managerTitle,
        'managerEmail':managerDetail.managerEmail,
        'managerOffPhone':managerDetail.managerOffPhone,
        'specialComments':projectDetail.specialComments,
        'projectDescription':projectDetail.projectDescription,
        'managerOffPhoneCountryCode':'1'

    }
    console.log(BaseUrl + EndPoints.MyProjectUpdate,'\nParams:',JSON.stringify(params),BaseUrl + EndPoints.MyProjectUpdate);
    axios ({  
      "method": "PUT",
      "url": BaseUrl + EndPoints.MyProjectUpdate,
      "headers": getAuthHeader(authToken),
      data:params
    })
    .then((response) => {
      if (response.data.code == 200){
        setIsLoading(false);
        const message = response.data.content.messageList.success;
        Alert.alert(StaticMessage.AppName, message, [
          {text: 'Ok'}
        ]);
      }else if (response.data.code == 417){
        setIsLoading(false);
        console.log(Object.values(response.data.content.messageList));
        const message = parseErrorMessage(response.data.content.messageList);
        Alert.alert(StaticMessage.AppName, message, [
          {text: 'Ok'}
        ]);

      }else{
        setIsLoading(false);
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
  const handleSkipBtn = () => {
    // navigation.navigate('Education');
  }
  const handleNextBtn = () => {
    // navigation.navigate('Education');
    
  }
  const windowWidth = Dimensions.get('window').width;
  const handleOnScroll = (event) => {
    //calculate screenIndex by contentOffset and screen width
    let currentIndex = parseInt(event.nativeEvent.contentOffset.x/Dimensions.get('window').width);
    if(currentIndex != activeIndex && currentIndex >= 0 && currentIndex < projectArray.length) {
      setActiveIndex(currentIndex);
      projectArray[activeIndex] = {'projectDetails':projectDetail,"managerDetails":managerDetail};
      setProjectDetail(projectArray[currentIndex].projectDetails);
      setManagerDetail(projectArray[currentIndex].managerDetails);
    }
  }
  const handleComment = (val) => {
    setData({...data, comment: val});
  }
  const textPhoneChange = (text) => {
    var cleaned = ('' + text).replace(/\D/g, '')
    var match = cleaned.match(/^(1|)?(\d{3})(\d{3})(\d{4})$/)
    if (match) {
        var intlCode = (match[1] ? '+1 ' : ''),
            number = [intlCode, '(', match[2], ') ', match[3], '-', match[4]].join('');
       
        setManagerDetail({...managerDetail,managerOffPhone:number})
        return;
    }
    setData({...data,managerOffPhone: text});
  }
  var projects = [];
  const roleArray = lookupData ? lookupData.role : [];
  const technologyArray = lookupData ? lookupData.primaryTechnology : [];

	for(let i = 0; i < projectArray.length; i++){
    // let projectDetail = projectArray[i].projectDetails;
    // let managerDetail = projectArray[i].managerDetails;
		projects.push(
      <KeyboardAwareScrollView key = {i} style={{width:windowWidth, flex: 1, padding:16,paddingTop:0 }}>
      <View style={{marginTop:12}}>
        <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Project name</Text>
        <View style={{backgroundColor:ThemeColor.ViewBgColor, height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}>
          <Text style={[styles.labelText,{color:projectDetail ? 'black' : ThemeColor.PlaceHolderColor}]}>{projectDetail ? projectDetail.projectName : 'Project name'}</Text>
        </View>
      </View>
      <View style={{marginTop:12}}>
        <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Project duraton (in months)</Text>
        <View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}>
          <TextInput  
            style={styles.inputText}
            placeholder="" 
            placeholderTextColor={ThemeColor.PlaceHolderColor}
            keyboardType='number-pad'
            value= {projectDetail.projectDuration}
            onChangeText={(val) => setProjectDetail({...projectDetail,projectDuration:val})}
          />
        </View>
      </View>
      <View style={{marginTop:12}}>
        <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Project description</Text>
        <View style={{backgroundColor:'white', height:100, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}>
        <TextInput style={[styles.inputText,{textAlignVertical: "top", height:100, paddingRight:8}]}
                multiline
                placeholder="Enter description" 
                placeholderTextColor={ThemeColor.PlaceHolderColor}
                keyboardType='default'
                value = {projectDetail.projectDescription}
                onChangeText={(val) => setProjectDetail({...projectDetail,projectDescription:val})}
            />
        </View>
      </View>
      {Platform.OS == 'ios' ?
        <View style={{marginTop:12}}>
          <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Primary technology</Text>
          <TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}} onPress={() => {technologyRef.current?.setModalVisible()}}>
            <Text style={[styles.labelText,{color:projectDetail.technology.length > 0 ? 'black' : ThemeColor.PlaceHolderColor}]}>{projectDetail.technology.length >0 ? projectDetail.technology : 'Primary technology'}</Text>
            <Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22,22} />
          </TouchableOpacity>
        </View> :
        <View style={{marginTop:12}}>
          <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Primary technology</Text>
          <View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center',}}>
            <Picker
                style={{flex:1,}}
                itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
                selectedValue={projectDetail.technologyId}
                onValueChange={(itemValue, index) =>{
                  console.log(itemValue,index)
                  let selectedItem = technologyArray[index];
                  console.log(selectedItem);
                  setProjectDetail({...projectDetail,technologyName:selectedItem.technologyName ,technologyId:selectedItem.technologyId});
                }}>
                {technologyArray && technologyArray.map((item, index) => {
                  return (<Picker.Item label={item.technologyName} value={item.technologyId} key={index}/>) 
                })}
              </Picker>
          </View>
        </View>
      }
      {
      Platform.OS == 'ios' ?
        <View style={{marginTop:12}}>
          <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Role</Text>
          <TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}} onPress={() => {roleRef.current?.setModalVisible()}}>
            <Text style={[styles.labelText,{color:projectDetail.role ? 'black' : ThemeColor.PlaceHolderColor}]}>{projectDetail.role ? projectDetail.role : 'Role'}</Text>
            <Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22,22} />
          </TouchableOpacity>
        </View> :
        <View style={{marginTop:12}}>
          <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Role</Text>
          <View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center'}}>
            <Picker
                style={{flex:1,}}
                itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
                selectedValue={projectDetail.roleId}
                onValueChange={(itemValue, index) =>{
                  console.log(itemValue,index)
                  let selectedItem = technologyArray[index];
                  console.log(selectedItem);
                  setProjectDetail({...projectDetail,role:selectedItem.skillRoleName,roleId:selectedItem.skillRoleId});
                }}>
                {roleArray && roleArray.map((item, index) => {
                  return (<Picker.Item label={item.skillRoleName} value={item.skillRoleId} key={index}/>) 
                })}
              </Picker>
          </View>
        </View>
      }
      <View style={{marginTop:12}}>
        <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Manager name</Text>
        <View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}>
          <TextInput  
            style={styles.inputText}
            placeholder="Manager name" 
            placeholderTextColor={ThemeColor.PlaceHolderColor}
            keyboardType='default'
            value= {managerDetail.managerName}
            onChangeText={(val) => setManagerDetail({...managerDetail,managerName:val})}
          />
        </View>
      </View>
      <View style={{marginTop:12}}>
        <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Manager title</Text>
        <View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}>
          <TextInput  
            style={styles.inputText}
            placeholder="Manager title" 
            placeholderTextColor={ThemeColor.PlaceHolderColor}
            keyboardType='default'
            value= {managerDetail.managerTitle}
            onChangeText={(val) => setManagerDetail({...managerDetail,managerTitle:val})}
          />
        </View>
      </View>
      <View style={{marginTop:12}}>
        <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Manager email</Text>
        <View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}>
          <TextInput  
            style={styles.inputText}
            placeholder="Manager email" 
            placeholderTextColor={ThemeColor.PlaceHolderColor}
            keyboardType='email-address'
            value= {managerDetail.managerEmail}
            onChangeText={(val) => setManagerDetail({...managerDetail,managerEmail:val})}
          />
        </View>
      </View>
      <View style={{marginTop:12}}>
        <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Manager phone</Text>
        <View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}>
          <TextInput  
            style={styles.inputText}
            maxLength={14}
            placeholder="Manager phone" 
            placeholderTextColor={ThemeColor.PlaceHolderColor}
            keyboardType='phone-pad'
            value= {managerDetail.managerOffPhone}
            onChangeText={(val) => textPhoneChange(val)}
          />
        </View>
      </View>
      <View style={{marginTop:12, marginBottom:32}}>
        <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Comment</Text>
        <View style={{backgroundColor:'white', height:100, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}>
          <TextInput style={[styles.inputText,{textAlignVertical: "top", height:100, paddingRight:8}]}
                multiline
                placeholder="Enter Comment" 
                placeholderTextColor={ThemeColor.PlaceHolderColor}
                keyboardType='default'
                numberOfLines={3}
                value = {projectDetail.specialComments}
                onChangeText={(val) => setProjectDetail({...projectDetail,specialComments:val})}
            />
        </View>
      </View>
      

    </KeyboardAwareScrollView>
		)
	}


  return (
    <SafeAreaView style={styles.container}>
      <PageControl
        style={{position:'absolute', left:0, right:0, top:10}}
        numberOfPages={projectArray.length}
        currentPage={activeIndex}
        hidesForSinglePage
        pageIndicatorTintColor='gray'
        currentPageIndicatorTintColor={ThemeColor.BtnColor}
        indicatorStyle={{borderRadius: 5}}
        currentIndicatorStyle={{borderRadius: 5}}
        indicatorSize={{width:8, height:8}}
        // onPageIndicatorPress={onItemTap}
      />
      {projectArray.length > 0 ?
        <ScrollView horizontal={true} pagingEnabled={true} style={{marginBottom:8, marginTop:24}} onScroll={(e)=>handleOnScroll(e)} scrollEventThrottle={projectArray.length}>        
          {projectArray.length > 0 && projects}
          <Loader isLoading={isLoading} /> 
        </ScrollView>:
        <View style={{flex:1, justifyContent:'center', margin:16}}>
            <Text style={{color:ThemeColor.TextColor,fontFamily: FontName.Regular, fontSize:16 , textAlign:'center'}}>Are you looking for information regarding your current project?</Text>
            <TouchableOpacity style={{marginTop:8, height:30}} onPress = {() => {navigation.navigate('CreateMessage',{groupName:"Accounts payable",groupID:MessageGroupId.PayrollSupportID})}}>
              <Text style={{color:ThemeColor.BtnColor,fontFamily: FontName.Regular, fontSize:16 , textAlign:'center'}}>Contact your account manager</Text>
            </TouchableOpacity>
        </View>
      }
      {projectArray.length > 0 ?
      <TouchableOpacity style={styles.btnFill} onPress={() => {updateProjectDetails()}}>
        <Text style={{color:'white',fontFamily: FontName.Regular, fontSize:16, color:'#fff' }}>UPDATE</Text>
      </TouchableOpacity> : null }
      
      
      <ActionSheet ref={technologyRef} containerStyle={{backgroundColor:ThemeColor.ViewBgColor}}>
          <View style={{height:300}}>
            <View style={{height:60, flexDirection:'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft:16,paddingRight:16}}>
              <TouchableOpacity onPress={() => {technologyRef.current?.setModalVisible()}}>
                <Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Cancel</Text>
              </TouchableOpacity>
              <Text style={{color:ThemeColor.TextColor, fontSize:16, fontFamily: FontName.Bold}}>Select technology </Text>
              <TouchableOpacity onPress={() => {
                {projectDetail.technologyId.length == 0 &&  setProjectDetail({...projectDetail,technology:technologyArray[0].technologyName ,technologyId:technologyArray[0].technologyId})}
                technologyRef.current?.setModalVisible()
                }}>
                <Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Done</Text>
              </TouchableOpacity>
            </View>
            <Picker
              style={{backgroundColor: 'white',flex:1,}}
              itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
              selectedValue={projectDetail.technologyId}
              onValueChange={(itemValue, index) =>{
                console.log(itemValue,index)
                let selectedItem = technologyArray[index];
				        console.log(selectedItem);
                setProjectDetail({...projectDetail,technologyName:selectedItem.technologyName ,technologyId:selectedItem.technologyId});
              }}>
              {technologyArray && technologyArray.map((item, index) => {
                return (<Picker.Item label={item.technologyName} value={item.technologyId} key={index}/>) 
              })}
            </Picker>
          </View>
        </ActionSheet>
        <ActionSheet ref={roleRef} containerStyle={{backgroundColor:ThemeColor.ViewBgColor}}>
          <View style={{height:300}}>
            <View style={{height:60, flexDirection:'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft:16,paddingRight:16}}>
              <TouchableOpacity onPress={() => {roleRef.current?.setModalVisible()}}>
                <Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Cancel</Text>
              </TouchableOpacity>
              <Text style={{color:ThemeColor.TextColor, fontSize:16, fontFamily: FontName.Bold}}>Select role</Text>
              <TouchableOpacity onPress={() => {
                {projectDetail.roleId.length == 0 && setProjectDetail({...projectDetail,role:roleArray[0].skillRoleName,roleId:roleArray[0].skillRoleId})}
                roleRef.current?.setModalVisible()}
                }>
                <Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Done</Text>
              </TouchableOpacity>
            </View>
            <Picker
              style={{backgroundColor: 'white',flex:1,}}
              itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
              selectedValue={projectDetail.roleId}
              onValueChange={(itemValue, index) =>{
                console.log(itemValue,index)
                let selectedItem = technologyArray[index];
				        console.log(selectedItem);
                setProjectDetail({...projectDetail,role:selectedItem.skillRoleName,roleId:selectedItem.skillRoleId});
              }}>
              {roleArray && roleArray.map((item, index) => {
                return (<Picker.Item label={item.skillRoleName} value={item.skillRoleId} key={index}/>) 
              })}
            </Picker>
          </View>
        </ActionSheet>
		</SafeAreaView>
	);
}

export default CurrectProjectScreen;

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
    height:50,
    justifyContent:"center",
    backgroundColor: ThemeColor.BtnColor ,
    alignItems:'center',
    borderRadius:5,
    margin:16,
    marginBottom:8
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
  },
});