import React ,{useEffect,useState,createRef,useRef} from "react";
import { StatusBar, 
    StyleSheet, 
    Text,
    TouchableOpacity,
    Image,
    View,
    ScrollView,
    Alert,
    FlatList,
    TextInput,
    Switch,
    Button
} from "react-native";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'
import axios from 'axios'
import Icon from 'react-native-vector-icons/Ionicons';
import {getAuthHeader} from '../../_helpers/auth-header';
import { BaseUrl, EndPoints, StaticMessage, ThemeColor, FontName } from '../../_helpers/constants';
import {parseErrorMessage} from '../../_helpers/Utils';
import Loader from '../../Components/Loader';


const AddSkillScreen = ({route,navigation}) => {
  const [isLoading,setIsLoading] = React.useState(false);
  const [skill,setSkill] = React.useState({});
  
  const { profileDetail } = route.params;
  const { skillDetails } = route.params;
  const skillNameInput = useRef(null);
  const yearInput = useRef(null);
  
  React.useLayoutEffect(() => {
    navigation.setOptions({
        headerRight: () => (
          skillDetails ? <TouchableOpacity style={{marginRight:16}} onPress={() => showDeleteAlert()}>
            <Icon name="trash-outline" color={'white'} size={20} />
          </TouchableOpacity> : null
        ),
        title:'Skills'
    });
  }, [navigation]);
  const showDeleteAlert = () =>{
    Alert.alert(StaticMessage.AppName,'Are sure want to delete?',
        [{
          	text: 'Cancel',
        },
		{
            text: 'Delete',
            onPress: () => deleteProfileDetails()
        }]
      )
  }
  
  useEffect(() => {
    if(skillDetails){
      const expYears = skillDetails.yearExp;
      setSkill({skillName:skillDetails.skillName,yearExp:String(expYears),isPrimary:skillDetails.isPrimary,candidateSkillId:String(skillDetails.candidateSkillId)});
    }
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
    
  },[])

  const  updateProfileDetails = async() => {
    let user = await AsyncStorage.getItem('loginDetails');  
    let parsed = JSON.parse(user);  
    let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
    var authToken = base64.encode(userAuthToken);

    setIsLoading(true);
    const params = {
        "skillName":skill.skillName,
        'yearExp':skill.yearExp,
        'candidateSkillId':skill.candidateSkillId,
        'isPrimary':skill.isPrimary,
    }
    console.log('Params:',JSON.stringify(params));
    axios ({  
      "method": "PUT",
      "url": BaseUrl + EndPoints.UserProfile,
      "headers": getAuthHeader(authToken),
      data:{'skills':params}
    })
    .then((response) => {
      if (response.data.code == 200){
        setIsLoading(false);
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
  const  deleteProfileDetails = async() => {
    let user = await AsyncStorage.getItem('loginDetails');  
    let parsed = JSON.parse(user);  
    let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
    var authToken = base64.encode(userAuthToken);
	console.log('candidateSkillId:',skillDetails.candidateSkillId);
    setIsLoading(true);
    axios ({  
      "method": "DELETE",
      "url": BaseUrl + EndPoints.UserProfile,
      "headers": getAuthHeader(authToken),
      data:{'candidateSkillId':skillDetails.candidateSkillId}
    })
    .then((response) => {
      if (response.data.code == 200){
        setIsLoading(false);
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
 
  const handleSkillChange = (val) => {
    setSkill({...skill,skillName: val});
  }
  const handleYearChange = (val) => {
    setSkill({...skill,yearExp: val});
  }
  const toggleSwitch = () => {
    setSkill({...skill,isPrimary:!skill.isPrimary});
  }

  return (
    <View style={styles.container}>
    	<KeyboardAwareScrollView style={{paddingLeft:16, paddingRight:16, marginTop:16,marginBottom:32,width:'100%' }}>
			<View style={{marginTop:12}}>
				<Text style ={{color:ThemeColor.TextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Skills*</Text>
				<View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}>
					<TextInput  
					style={styles.inputText}
					placeholder="Skills" 
					placeholderTextColor={ThemeColor.PlaceHolderColor}
					keyboardType='default'
          returnKeyType="next"
					value= {skill.skillName}
          onEndEditing={() => {yearInput.current.focus()}}
					onChangeText={(val) => handleSkillChange(val)}
					/>
				</View>
			</View> 
            <View style={{marginTop:12}}>
                <Text style ={{color:ThemeColor.TextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Years*</Text>
                <View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}>
                  <TextInput  
                    style={styles.inputText}
                    ref={yearInput}
                    placeholder="Enter years" 
                    placeholderTextColor={ThemeColor.PlaceHolderColor}
                    keyboardType='decimal-pad'
                    value= {skill.yearExp}
                    onChangeText={(val) => handleYearChange(val)}
                  />
                </View>
            </View> 
			<View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8, marginTop:16, justifyContent:'space-between'}}>
				<Text style ={{color:ThemeColor.TextColor, fontSize:16,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Primary skill</Text>
				<Switch
					trackColor={{ false: ThemeColor.SwitchInactiveColor, true:ThemeColor.BtnColor }}
					ios_backgroundColor = {ThemeColor.SwitchInactiveColor}
					onValueChange={toggleSwitch}
          thumbColor={skill.isPrimary == 1 ? "#FFF" : "#f4f3f4"}
					value={ skill.isPrimary == 1 ? true : false}
				/>            
			</View>
      </KeyboardAwareScrollView>
      <View style={{flexDirection:'row',borderRadius:5, marginTop:8, marginLeft:16,marginRight:16, marginBottom:34}}>
        <TouchableOpacity style={[styles.btnFill,{backgroundColor:'white'}]} onPress={() => {navigation.goBack()}}>
          <Text style={{color:'#53962E',fontFamily: FontName.Regular, fontSize:16, color:ThemeColor.BtnColor }}>CANCEL</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnFill} onPress={() => {updateProfileDetails()}}>
          <Text style={{color:'#53962E',fontFamily: FontName.Regular, fontSize:16, color:'#fff' }}>SAVE</Text>
        </TouchableOpacity>
      </View>  
      <Loader isLoading={isLoading} />
	  </View>
	);
}

export default AddSkillScreen;

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