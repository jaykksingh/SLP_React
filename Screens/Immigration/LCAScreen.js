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
// import OpenFile from 'react-native-doc-viewer';
import MovableView from 'react-native-movable-view';
import Icon from 'react-native-vector-icons/Ionicons';
import { BaseUrl, EndPoints, StaticMessage, ThemeColor,MessageGroupId, FontName } from '../../_helpers/constants';
import { getAuthHeader} from '../../_helpers/auth-header';
import Loader from '../../Components/Loader';


const LCAScreen = ({route,navigation}) => {
	let [isLoading, setLoading] = React.useState(false);
	let [LCAArray,setLCAArray] = React.useState([]);


	React.useLayoutEffect(() => {
		navigation.setOptions({
			title:'LCA'
		});
	}, [navigation]);

	useEffect(() => {
		getDocumentsList();
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
	},[]);

  

  const getDocumentsList = async () => {
    setLoading(true);

    let user = await AsyncStorage.getItem('loginDetails');  
    let parsed = JSON.parse(user);  
    let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
    var encoded = base64.encode(userAuthToken);

	console.log(BaseUrl + EndPoints.LCAList);
    axios ({
      "method": "GET",
      "url": BaseUrl + EndPoints.LCAList,
      "headers": getAuthHeader(encoded)
    })
    .then((response) => {
      setLoading(false);
      if (response.data.code == 200){
        let result = JSON.stringify(response.data.content.dataList[0]);
		console.log('LCA:',result);
		setLCAArray(response.data.content.dataList);
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
	const getFormatedDateRange=(item) =>{
		let momentStartDate = moment(item.validityFrom, 'YYYY-MM-DDTHH:mm:ssZZ');
		let momentEndDate = moment(item.validityTo, 'YYYY-MM-DDTHH:mm:ssZZ');

		let startDateString = moment(momentStartDate).format('MMM DD, YYYY');
		let endDateString = moment(momentEndDate).format('MMM DD, YYYY');

	  
		return `${startDateString} - ${endDateString}`;
	}
	const viewFile = (fileObject) => {
        console.log('File Path:', JSON.stringify(fileObject.lcaDocPath));
        // if(Platform.OS === 'ios'){
        //     //IOS
        //     OpenFile.openDoc([{
        //         url:fileObject.lcaDocPath,
        //         fileNameOptional:fileObject.lcaDocUploadName
        //     }], (error, url) => {
        //         if (error) {
		// 			console.error(error);
		// 			Alert.alert(StaticMessage.AppName, error, [
		// 				{text: 'Ok'}
		// 			]);
        //         } else {
		// 			console.log('Filte URL:',url);
		// 			Alert.alert(StaticMessage.AppName, url, [
		// 				{text: 'Ok'}
		// 			]);
        //         }
        //     })
        // }else{
        //     //Android
        //     OpenFile.openDoc([{
        //         url:fileObject.lcaDocPath, // Local "file://" + filepath
        //         fileName:fileObject.lcaDocUploadName,
        //         cache:false,
        //         fileType:"jpg"
        //     }], (error, url) => {
        //         if (error) {
        //         console.error(error);
		// 			Alert.alert(StaticMessage.AppName, error, [
		// 				{text: 'Ok'}
		// 			]);
        //         } else {
        //         console.log(url)
				
        //         }
        //     })
        // }
    }

  	return (
      	<SafeAreaView style={[styles.container,{backgroundColor:ThemeColor.ViewBgColor,}]}>
			{LCAArray.length > 0 ?
			<FlatList style={{marginTop:16}}
				data={LCAArray}
				keyExtractor={(item, index) => index.toString()}
				renderItem={({item,index}) => 
					<TouchableOpacity style={{backgroundColor:'white', marginBottom:8, paddingBottom:8,paddingTop:8,borderRadius:5}} onPress={() => {viewFile(item)}}>
						<View style={{ flex:1 , paddingLeft:8, paddingRight:8}}>
							<Text style ={{color:ThemeColor.NavColor, fontSize:16, fontFamily:FontName.Regular, paddingLeft:8, flex:1}}>{item.lca}</Text>
							<Text style ={{color:ThemeColor.TextColor, fontSize:14, fontFamily:FontName.Regular, paddingLeft:8, flex:1, marginTop:2}}>{item.city},  {item.state}</Text>
							<Text style ={{color:ThemeColor.TextColor, fontSize:14, fontFamily:FontName.Regular, paddingLeft:8, flex:1, marginTop:2}}>{getFormatedDateRange(item)}</Text>
						</View>
						<View style ={{backgroundColor:ThemeColor.BorderColor, height:1, marginTop:8}}/>
						<TouchableOpacity style={{flexDirection: 'row', justifyContent:'center', alignItems: 'center', height:30,paddingLeft:8, paddingRight:8}} onPress={() => {viewFile(item)}}>
							<Text style ={{color:ThemeColor.NavColor, fontSize:14, fontFamily:FontName.Regular, paddingLeft:8, flex:1}}>Lca document</Text>
							<Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22,22} />
						</TouchableOpacity>
					</TouchableOpacity>
				}
			/> : 
			<View style={{flex:1, justifyContent: 'center', padding:16}}>
				<Text style={{fontSize:16, color:ThemeColor.LabelTextColor,fontFamily: FontName.Regular, textAlign: 'center',}}>Are you looking for a recent Labor Condition Application?</Text>
				<TouchableOpacity onPress = {() => {navigation.navigate('CreateMessage',{groupName:'Immigration support',groupID:MessageGroupId.ImmigrationSupportID})}}>
				<Text style={{fontSize:16, color:ThemeColor.BtnColor,fontFamily: FontName.Regular, textAlign: 'center',marginTop:2}}>Contact Immigration support</Text>
				</TouchableOpacity>
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
export default LCAScreen;


const styles = StyleSheet.create({
    container: {
      flex: 1,
    }
  });