import React ,{useEffect,useState,createRef} from "react";
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
    Button,
    Platform
} from "react-native";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'
import axios from 'axios'
import Icon from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import ActionSheet from "react-native-actions-sheet";
import {Picker} from '@react-native-picker/picker';
import {parseErrorMessage} from '../../_helpers/Utils';
import {getAuthHeader} from '../../_helpers/auth-header';
import { BaseUrl, EndPoints, StaticMessage, ThemeColor, FontName } from '../../_helpers/constants';
import Loader from '../../Components/Loader';


const passingYearRef = createRef();


const AddEducationScreen = ({route,navigation}) => {
  const [isLoading,setIsLoading] = React.useState(false);
  const [education,setEducation] = React.useState({
	institutionName:'',
	passingYear: Platform.OS == 'ios' ? '' : new Date().getFullYear(),
	qualification:'',
	employeeEducationId:'',
  });
  
  const { profileDetail } = route.params;
  const { educationDetails } = route.params;

  React.useLayoutEffect(() => {
    navigation.setOptions({
        headerRight: () => (
			educationDetails ? <TouchableOpacity style={{marginRight:16}} onPress={() => showLogOutAlert()}>
			<Icon name="trash-outline" color={'white'} size={20} />
		  </TouchableOpacity> : null      
      ),
      title : educationDetails ? 'Edit education' : 'Add education'
    });
  }, [navigation]);
  const showLogOutAlert = () =>{
    Alert.alert(StaticMessage.AppName,'Are you sure want to delete?',
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
    if(educationDetails){
      const passingYear = educationDetails.passingYear;
      console.log(educationDetails,String(passingYear));
      setEducation({...education,institutionName:educationDetails.institutionName,qualification:educationDetails.qualification,passingYear:String(passingYear),employeeEducationId:educationDetails.employeeEducationId});
    }
    
    
  },[])

  const  updateProfileDetails = async() => {
    let user = await AsyncStorage.getItem('loginDetails');  
    let parsed = JSON.parse(user);  
    let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
    var authToken = base64.encode(userAuthToken);

    setIsLoading(true);
    const params = {
        institutionName:education.institutionName,
		passingYear:education.passingYear,
		qualification:education.qualification,
		employeeEducationId:education.employeeEducationId,
    }
    console.log('Params:',JSON.stringify(params));
    axios ({  
      "method": "PUT",
      "url": BaseUrl + EndPoints.UserProfile,
      "headers": getAuthHeader(authToken),
      data:{'educations':params}
    })
    .then((response) => {
      setIsLoading(false);
      if (response.data.code == 200){
        navigation.goBack();
      }else if (response.data.code == 417){
        const message = parseErrorMessage(response.data.content.messageList);
        Alert.alert(StaticMessage.AppName, message, [
          {text: 'Ok'}
        ]);

      }else{
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
	console.log('employeeEducationId:',educationDetails.employeeEducationId);
    setIsLoading(true);
    axios ({  
      "method": "DELETE",
      "url": BaseUrl + EndPoints.UserProfile,
      "headers": getAuthHeader(authToken),
      data:{'employeeEducationId':educationDetails.employeeEducationId}
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
//   NSDateFormatter *format = [[NSDateFormatter alloc] init];
//   [format setDateFormat:@"yyyy"];
//   NSString *dateString = [format stringFromDate:[NSDate date]];
//   yearArr = [[NSMutableArray alloc] init];
//   NSInteger year = [dateString integerValue];
//   for ( ; year > 1960; year--) {
// 	  [yearArr addObject:[NSString stringWithFormat:@"%ld",(long)year]];
//   }
  let year = new Date().getFullYear();
  var yearArr =[];
  for( ; year > 1960; year--) {
	  yearArr.push(String(year));
  }

  return (
    <View style={styles.container}>
    	<KeyboardAwareScrollView style={{paddingLeft:16, paddingRight:16, marginTop:16,marginBottom:32,width:'100%' }}>
			
        <View style={{marginTop:12}}>
            <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Degree</Text>
            <View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}>
              <TextInput  
                style={styles.inputText}
                placeholder="Degree" 
                placeholderTextColor={ThemeColor.PlaceHolderColor}
                keyboardType='default'
                value= {education.qualification}
                onChangeText={(val) => setEducation({...education,qualification:val})}
              />
            </View>
        </View>
        <View style={{marginTop:12}}>
          <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Collage/School</Text>
          <View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}>
            <TextInput  
              style={styles.inputText}
              placeholder="Collage/School" 
              placeholderTextColor={ThemeColor.PlaceHolderColor}
              keyboardType='default'
              value= {education.institutionName}
              onChangeText={(val) => setEducation({...education,institutionName:val})}
            />
				</View>
			  </View>  
          {Platform.OS == 'ios' ?
          <View style={{marginTop:12}}>
              <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Passing year</Text>
              <TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}  onPress={() => {passingYearRef.current?.setModalVisible()}}>
                <Text style={[styles.labelText,{color:education.passingYear.length > 0 ? 'black' : ThemeColor.PlaceHolderColor}]}>{education.passingYear.length >0 ? education.passingYear : 'Passing year'}</Text>
                <Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22} />
              </TouchableOpacity>
          </View>  : 
          <View style={{marginTop:12}}>
            <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Passing year</Text>
            <TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center'}}  onPress={() => {passingYearRef.current?.setModalVisible()}}>
              <Picker
                style={{flex:1,}}
                itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
                selectedValue={education.passingYear}
                onValueChange={(itemValue, index) =>{
                  console.log(itemValue,index)
                  let selectedItem = yearArr[index];
                  console.log(selectedItem);
                  setEducation({...education,passingYear:selectedItem});
                }}>
                {yearArr && yearArr.map((item, index) => {
                  return (<Picker.Item label={item} value={item} key={index}/>) 
                })}
              </Picker>
            </TouchableOpacity>
          </View>
          
          }
			
        </KeyboardAwareScrollView>
        <View style={{flexDirection:'row',borderRadius:5, marginTop:8, marginLeft:16,marginRight:16, marginBottom:34}}>
          <TouchableOpacity style={styles.btnFill} onPress={() => {updateProfileDetails()}}>
            <Text style={{color:'#53962E',fontFamily: FontName.Regular, fontSize:16, color:'#fff' }}>{educationDetails ? 'UPDATE' : 'SAVE'}</Text>
          </TouchableOpacity>
        </View>
        <ActionSheet ref={passingYearRef} containerStyle={{backgroundColor:ThemeColor.ViewBgColor}}>
          <View style={{height:300}}>
            <View style={{height:60, flexDirection:'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft:16,paddingRight:16}}>
              <TouchableOpacity onPress={() => {passingYearRef.current?.setModalVisible()}}>
                <Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Cancel</Text>
              </TouchableOpacity>
              <Text style={{color:ThemeColor.TextColor, fontSize:16, fontFamily: FontName.Bold }}>Passing year</Text>
              <TouchableOpacity onPress={() => {
                {education.passingYear.length == 0 && setEducation({...education,passingYear:yearArr[0]})}
                passingYearRef.current?.setModalVisible()}
                
                }>
                <Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Done</Text>
              </TouchableOpacity>
            </View>
            <Picker
              style={{backgroundColor: 'white',flex:1,}}
              itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
              selectedValue={education.passingYear}
              onValueChange={(itemValue, index) =>{
                console.log(itemValue,index)
                let selectedItem = yearArr[index];
				        console.log(selectedItem);
                setEducation({...education,passingYear:selectedItem});
              }}>
              {yearArr && yearArr.map((item, index) => {
                return (<Picker.Item label={item} value={item} key={index}/>) 
              })}
            </Picker>
          </View>
        </ActionSheet>
        <Loader isLoading={isLoading} />
	</View>
	);
}

export default AddEducationScreen;

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
    borderRadius:5
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