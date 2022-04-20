/* eslint-disable react/display-name */
import React , {useEffect} from "react";
import { StatusBar, 
    View,
    Text,
    StyleSheet,
    Alert,
    FlatList,
	SafeAreaView,
	TouchableOpacity
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'
import axios from 'axios';
import Feather from 'react-native-vector-icons/Feather';
import moment from 'moment';
import FileViewer from "react-native-file-viewer";
import RNFS from "react-native-fs";

import MovableView from 'react-native-movable-view';
import Icon from 'react-native-vector-icons/Ionicons';
import { BaseUrl, EndPoints, StaticMessage, ThemeColor, FontName } from '../../_helpers/constants';
import { getAuthHeader} from '../../_helpers/auth-header';
import {parseErrorMessage} from '../../_helpers/Utils';
import Loader from '../../Components/Loader';


const LegalDocumentScreen = ({route,navigation}) => {
	let [isLoading, setLoading] = React.useState(false);
	let [documentArray,setDocumentArray] = React.useState([]);


	React.useLayoutEffect(() => {
		navigation.setOptions({
			  title:'Legal documents'
		});
	}, [navigation]);

	useEffect(() => {
		getDocumentsList();
	},[]);

  

  const getDocumentsList = async () => {
    setLoading(true);

    let user = await AsyncStorage.getItem('loginDetails');  
    let parsed = JSON.parse(user);  
    let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
    var encoded = base64.encode(userAuthToken);

	console.log(BaseUrl + EndPoints.LegalDocumentsList);
    axios ({
      "method": "POST",
      "url": BaseUrl + EndPoints.LegalDocumentsList,
      "headers": getAuthHeader(encoded),
	  data:{}
    })
    .then((response) => {
      setLoading(false);
      if (response.data.code == 200){
        let result = JSON.stringify(response.data.content.dataList[0]);
		console.log('Documents:',result);
		setDocumentArray(response.data.content.dataList);
      }else if (response.data.code == 417){
        setLoading(false);
        const message = parseErrorMessage(response.data.content.messageList);

        Alert.alert(StaticMessage.AppName,message, [
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
	const getFormatedDate=(item) =>{
		let momentStartDate = moment(item.createdDate, 'YYYY-MM-DDTHH:mm:ssZZ');
		let startDateString = moment(momentStartDate).format('ddd, DD MMM');
	  
		return `${startDateString}`;
	}
	const viewFile = (fileObject) => {
    navigation.navigate('DocumentViewer',{fileURL:fileObject.fileName,fileName:fileObject.documentName});
    console.log(fileObject);
        // let url =  fileObject.fileName;
        // const extension = url.split(/[#?]/)[0].split(".").pop().trim();
        // const localFile = `${RNFS.DocumentDirectoryPath}/${fileObject.documentName}.${extension}`;
        // const options = {
        //   fromUrl: url,
        //   toFile: localFile,
        // };
        // RNFS.downloadFile(options)
        // .promise.then(() => FileViewer.open(localFile,{ showOpenWithDialog: true }))
        // .then(() => {
        //   console.log('View Sucess')
        // })
        // .catch((error) => {
        //   console.log('View Failed',error)
        // });
        
    }

  	return (
      	<SafeAreaView style={[styles.container,{backgroundColor:ThemeColor.ViewBgColor,}]}>
          {documentArray.length > 0 ?
          <FlatList style={{marginTop:16}}
            data={documentArray}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item,index}) => 
              <TouchableOpacity style={{backgroundColor:'white', marginBottom:8, paddingBottom:8,paddingTop:8, marginLeft:16, marginRight:16,borderRadius:5,justifyContent:'center',flexDirection:'row', alignItems: 'center'}} onPress={() => {viewFile(item)}}>
                <View style={{ flex:1}}>
                  <Text style ={{color:ThemeColor.TextColor, fontSize:14, fontFamily:FontName.Regular, paddingLeft:8, flex:1}}>{item.documentName}</Text>
                  <View style={{flexDirection:'row',marginTop:4}}> 
                    <Text style ={{color:ThemeColor.SubTextColor, fontSize:12, fontFamily:FontName.Regular, paddingLeft:8}}>Uploaded date: </Text>
                    <Text style ={{color:ThemeColor.TextColor, fontSize:12, fontFamily:FontName.Regular}}>{getFormatedDate(item)}</Text>
                  </View>
                </View>
                <Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22,22} />
              </TouchableOpacity>
            }
          /> :
          <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
            <Text style ={{color:ThemeColor.TextColor, fontSize:16, fontFamily:FontName.Regular, paddingLeft:8}}>No documents available</Text>
          </View>
          }   
        	<Loader isLoading={isLoading} />
          <MovableView>
            <TouchableOpacity style={{
              position: 'absolute',
              margin: 16,
              right: 0,
              bottom:50,
              backgroundColor:ThemeColor.BtnColor,
              height:50, 
              width:50,
              borderRadius:25,
              justifyContent: 'center',
              alignItems: 'center'}} onPress={() => navigation.navigate('ChatBot')}>
              <Icon name="chatbubble-ellipses-outline" color={'white'} size={25} />
            </TouchableOpacity>
          </MovableView>
      	</SafeAreaView>
    );
}
export default LegalDocumentScreen;


const styles = StyleSheet.create({
    container: {
      flex: 1,
    }
  });