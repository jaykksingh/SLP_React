/* eslint-disable react/display-name */
import React,{useEffect,useState,createRef} from "react";
import { StatusBar, 
    Text, 
    View,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ActionSheetIOS,
    SectionList,
    FlatList
} from "react-native";

import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'
import axios from 'axios'
import Feather from 'react-native-vector-icons/Feather';
import {getAuthHeader} from '../../_helpers/auth-header';
import Loader from '../../Components/Loader';
import { BaseUrl, EndPoints, StaticMessage,ThemeColor, FontName } from '../../_helpers/constants';



const FuntionalAreaScreen = ({route,navigation}) => {  
  const [isLoading, setIsLoading] = React.useState(false);
  const { profileDetail } = route.params;
  const { lookupData } = route.params;

  const [data,setData] = React.useState({
    departmentName :'',
	departmentId:''
  });
  React.useLayoutEffect(() => {
    navigation.setOptions({
          title:'Select option',
    });
  }, [navigation]);
  
  useEffect(() => {
    setData({...data,departmentName:profileDetail.empDetails.departmentName,departmentId:profileDetail.empDetails.departmentId});
   
  }, []);

  const  updateProfileDetails = async() => {
    let user = await AsyncStorage.getItem('loginDetails');  
    let parsed = JSON.parse(user);  
    let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
    var authToken = base64.encode(userAuthToken);

    setIsLoading(true);
    const params = {
      "DomainDepartment":data.departmentId,
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
      console.log(error);
      setIsLoading(false);
      Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
        {text: 'Ok'}
      ]);

    })
  }
  
  const deparmentArray = lookupData ? lookupData.departmentList : [];
  return (
    <SafeAreaProvider style={styles.container}>
      	
		<FlatList style={{}}
			data={deparmentArray}
			keyExtractor={(item, index) => index.toString()}
			renderItem={({item}) => 
				<View style={{ paddingLeft:16}}>
					<TouchableOpacity style={{ height:40,flexDirection:'row', alignItems:'center', paddingRight:16}} onPress={() => setData({...data,departmentName:item.Text, departmentId:item.Value})}>
						<Text style={{fontFamily: FontName.Regular, fontSize:14, color:ThemeColor.TextColor, flex:1}}>{item.Text}</Text>
						{data.departmentName == item.Text && <Feather name="check" color={ThemeColor.BtnColor} size={20,20} /> }
					</TouchableOpacity>
					<View style={{backgroundColor:ThemeColor.BorderColor, height:1}}/>
				</View>
			}
		/> 
      <View style={{flexDirection:'row',borderRadius:5, paddingLeft:16,paddingRight:16, marginBottom:34,marginTop:16}}>
        <TouchableOpacity style={styles.btnFill} onPress={() => {updateProfileDetails()}}>
          <Text style={{color:'#53962E',fontFamily: FontName.Regular, fontSize:16, color:'#fff' }}>UPDATE</Text>
        </TouchableOpacity>
      </View>  
	  <Loader isLoading={isLoading} />
    </SafeAreaProvider>
);
}

export default FuntionalAreaScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:'white',
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
  }
});