/* eslint-disable react/display-name */
import React,{useEffect,createRef} from "react";
import { Text, 
    View,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Platform
} from "react-native";

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'
import axios from 'axios'
import Feather from 'react-native-vector-icons/Feather';
import {Picker} from '@react-native-picker/picker';
import ActionSheet from "react-native-actions-sheet";
import {parseErrorMessage} from '../../_helpers/Utils';
import { BaseUrl, EndPoints, StaticMessage,ThemeColor, FontName } from '../../_helpers/constants';
import {getAuthHeader} from '../../_helpers/auth-header';
import Loader from '../../Components/Loader';


const salarayTypeRef = createRef();


const DesiredSalaryScreen = ({route,navigation}) => {  
  const [isLoading, setIsLoading] = React.useState(false);
  const { profileDetail } = route.params;
  const { lookupData } = route.params;

  const [data,setData] = React.useState({
    annualSalary :'',
	  contractRate:'',
    contractRateType:'',
    contractRateTypeId:''
  });

  
  useEffect(() => {
    setData({...data,
      annualSalary:profileDetail.empDetails.annualSalary,
      contractRate:profileDetail.empDetails.contractRate,
      contractRateType:profileDetail.empDetails.contractRateType,
      contractRateTypeId:profileDetail.empDetails.contractRateTypeId
    });
    
  }, []);

  const  updateProfileDetails = async() => {
    let user = await AsyncStorage.getItem('loginDetails');  
    let parsed = JSON.parse(user);  
    let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
    var authToken = base64.encode(userAuthToken);

    setIsLoading(true);
    const params = {
      "annualSalary":data.annualSalary,
      "contractRate":data.contractRate,
      "contractRateTypeId":data.contractRateTypeId,
    }
    axios ({  
      "method": "PUT",
      "url": BaseUrl + EndPoints.UserProfile,
      "headers": getAuthHeader(authToken),
      data:{'empDetails':params}
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
      console.log(error);
      setIsLoading(false);
      Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
        {text: 'Ok'}
      ]);

    })
  }
  
  const salaryTypeArray = lookupData ? lookupData.rateType : [];
  console.log(data);
  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView >
          <View style={{marginTop:12}}>
            <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Salary requirement for full-time employment</Text>
            <View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}>
              <Text style={{marginLeft:8,fontSize:16,fontFamily: FontName.Regular}}>$</Text>
              <TextInput  
                style={styles.inputText}
                placeholder="$" 
                placeholderTextColor={ThemeColor.PlaceHolderColor}
                keyboardType='number-pad'
                value= {data.annualSalary.toString()}
                onChangeText={(val) => setData({...data,annualSalary:val})}
              />
            </View>
          </View>
          <View style={{marginTop:12}}>
            <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Salary requirement for consulting</Text>
            <View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}>
              <Text style={{marginLeft:8,fontSize:16,fontFamily: FontName.Regular}}>$</Text>
              <TextInput  
                style={styles.inputText}
                placeholder="$" 
                placeholderTextColor={ThemeColor.PlaceHolderColor}
                keyboardType='number-pad'
                value= {data.contractRate}
                onChangeText={(val) => setData({...data,contractRate:val})}
              />
              <View style={{width:8, height:40,backgroundColor:'#E5E9EB'}}/>
              {
                Platform.OS == 'ios' ? 
                <TouchableOpacity style={{backgroundColor:'white',width:'40%', flexDirection:'row', alignItems:'center'}}  onPress={() => {salarayTypeRef.current?.setModalVisible()}}>
                  <Text style={[styles.labelText,{color:data.contractRateType.length > 0 ? 'black' : ThemeColor.PlaceHolderColor}]}>{data.contractRateType.length >0 ? data.contractRateType : 'Select rate type'}</Text>
                  <Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22} />
                </TouchableOpacity> :
                <View style={{backgroundColor:'white',width:'50%', flexDirection:'row', alignItems:'center', height:40}}>
                  <Picker
                    style={{flex:1,}}
                    itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
                    selectedValue={data.contractRateTypeId}
                    onValueChange={(itemValue, index) =>{
                      console.log(itemValue,index)
                      let selectedItem = salaryTypeArray[index];
                      setData({...data,contractRateType:selectedItem.keyName,contractRateTypeId:selectedItem.keyId});
                    }}>
                    {salaryTypeArray && salaryTypeArray.map((item, index) => {
                      return (<Picker.Item label={item.keyName} value={item.keyId} key={index}/>) 
                    })}
                  </Picker>
                </View>
              }
            </View>
          </View>

        <Loader isLoading={isLoading} />
      </KeyboardAwareScrollView>
      <TouchableOpacity style={styles.btnFill} onPress={() => {updateProfileDetails()}}>
        <Text style={{color:'#53962E',fontFamily: FontName.Regular, fontSize:16, color:'#fff' }}>NEXT</Text>
      </TouchableOpacity>
      <ActionSheet ref={salarayTypeRef} containerStyle={{backgroundColor:ThemeColor.ViewBgColor}}>
          <View style={{height:300}}>
            <View style={{height:60, flexDirection:'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft:16,paddingRight:16}}>
              <TouchableOpacity onPress={() => {salarayTypeRef.current?.setModalVisible()}}>
                <Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Cancel</Text>
              </TouchableOpacity>
              <Text style={{color:ThemeColor.TextColor, fontSize:16, fontFamily: FontName.Bold}}>Salary type</Text>
              <TouchableOpacity onPress={() => {salarayTypeRef.current?.setModalVisible()}}>
                <Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Done</Text>
              </TouchableOpacity>
            </View>
            <Picker
              style={{backgroundColor: 'white',flex:1,}}
              itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
              selectedValue={data.contractRateTypeId}
              onValueChange={(itemValue, index) =>{
                console.log(itemValue,index)
                let selectedItem = salaryTypeArray[index];
                setData({...data,contractRateType:selectedItem.keyName,contractRateTypeId:selectedItem.keyId});

              }}>
              {salaryTypeArray && salaryTypeArray.map((item, index) => {
                return (<Picker.Item label={item.keyName} value={item.keyId} key={index}/>) 
              })}
            </Picker>
          </View>
        </ActionSheet>
    </View>
);
}

export default DesiredSalaryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:'#E5E9EB',
    paddingLeft:16,
    paddingRight:16,
  },inputText:{
    flex: 1,
    height:40,
    color:'black',
    fontSize:16,
    fontFamily: FontName.Regular,
    marginLeft:4,
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
    marginBottom:34,
    height:50,
    justifyContent:"center",
    backgroundColor: ThemeColor.BtnColor ,
    alignItems:'center',
	borderRadius:5
  }
});