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
import { BaseUrl, EndPoints, StaticMessage,ThemeColor, ThemeColor, FontName } from '../../_helpers/constants';


const DesiredEmploymentScreen = ({route,navigation}) => {  
  const [isLoading, setIsLoading] = React.useState(false);
  const { profileDetail } = route.params;
  const { lookupData } = route.params;
  const [lookupDataList, setLookupData] = useState({});

  const [data,setData] = React.useState({
    desiredEmployement :[],
	  desiredEmployementKey:[],
  });
  React.useLayoutEffect(() => {
		navigation.setOptions({
            title: 'Desired employment',
		});
  }, [navigation]);
  
  useEffect(() => {
	  console.log(profileDetail.empDetails);
    if(!lookupData){
      getUserLookups();
    }
    setData({...data,desiredEmployement:profileDetail.empDetails.desiredEmployement,desiredEmployementKey:profileDetail.empDetails.desiredEmployementKey});
    const parent = navigation.dangerouslyGetParent();
    parent.setOptions({
      tabBarVisible: false
    });
    return () =>
      parent.setOptions({
        tabBarVisible: true
      });
  }, []);
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
  const  updateProfileDetails = async() => {
    let user = await AsyncStorage.getItem('loginDetails');  
    let parsed = JSON.parse(user);  
    let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
    var authToken = base64.encode(userAuthToken);

    setIsLoading(true);
    const params = {
      "desiredEmployementKey":data.desiredEmployementKey,
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
  
  const didEmploymentSelected = (selectedItem) => {
	let selectedKeyArray = data.desiredEmployementKey;
	var isInArray = selectedKeyArray.indexOf(selectedItem.desiredEmployementKey) !== -1;
	if(isInArray){
		const index = selectedKeyArray.indexOf(selectedItem.desiredEmployementKey);
		if (index > -1) {
			selectedKeyArray.splice(index, 1);
		}
	}else{
		selectedKeyArray.push(selectedItem.desiredEmployementKey);
	}
	setData({...data, desiredEmployementKey:selectedKeyArray});

  }

  const jobTypeArray = lookupData ? lookupData.desiredEmployement : lookupDataList ? lookupDataList.desiredEmployement : [];
  console.log(data.desiredEmployementKey);
  return (
    <SafeAreaProvider style={styles.container}>
		<Text style={{fontFamily: FontName.Regular, fontSize:16, color:ThemeColor.TextColor, marginLeft:16, marginBottom:8, marginTop:16}}>Desired type of employment</Text>
		<FlatList style={{}}
			data={jobTypeArray}
			keyExtractor={(item, index) => index.toString()}
			renderItem={({item}) => 
				<View style={{ paddingLeft:16, backgroundColor:'#fff'}}>
					<TouchableOpacity style={{ height:40,flexDirection:'row', alignItems:'center', paddingRight:16}} onPress={() => {didEmploymentSelected(item)}}>
						<Text style={{fontFamily: FontName.Regular, fontSize:16, color:ThemeColor.TextColor, flex:1}}>{item.desiredEmployement}</Text>
						{(data.desiredEmployementKey.indexOf(item.desiredEmployementKey) !== -1) && <Feather name="check" color={ThemeColor.BtnColor} size={20,20} /> }
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

export default DesiredEmploymentScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:ThemeColor.ViewBgColor,
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