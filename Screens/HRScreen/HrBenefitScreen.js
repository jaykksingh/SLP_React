import React ,{useEffect,useState}from 'react';
import { View ,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    Alert,
	SafeAreaView,
    Text} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'
import axios from 'axios'
import {getAuthHeader} from '../../_helpers/auth-header';
import { BaseUrl, EndPoints, StaticMessage, ThemeColor, FontName } from '../../_helpers/constants';
import Loader from '../../Components/Loader';
import FileViewer from "react-native-file-viewer";


const HrBenefitScreen = ({navigation})  => {
	const [isLoading, setIsLoading] = React.useState(false);
	const [benefitsArr, setBenefitsArr] = React.useState([]);

	React.useLayoutEffect(() => {
		navigation.setOptions({
		  title: "HR benefits",
		});
	}, [navigation]);

	
	useEffect(() => {
		getHrBenefitsList();
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
	}, []);

	const  getHrBenefitsList = async() => {

		let user = await AsyncStorage.getItem('loginDetails');  
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken);

		setIsLoading(true);
		axios ({  
		  "method": "GET",
		  "url": BaseUrl + EndPoints.HrBenefitsList,
		  "headers": getAuthHeader(authToken)
		})
		.then((response) => {
		  setIsLoading(false);
		  if (response.data.code == 200){
			const results = JSON.stringify(response.data.content.dataList[0])
			console.log(`HR Benefits: ${results}`);
			setBenefitsArr(response.data.content.dataList);
		  }else if (response.data.code == 417){
			console.log(Object.values(response.data.content.messageList));
			const errorList = Object.values(response.data.content.messageList);
			Alert.alert(StaticMessage.AppName, errorList.join(), [
			  {text: 'Ok'}
			]);
	
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
	const viewFile = (fileObject) => {
        console.log('File Path:', fileObject);
		let url =  fileObject.formDoc;
		const extension = url.split(/[#?]/)[0].split(".").pop().trim();
		const localFile = `${RNFS.DocumentDirectoryPath}/temporaryfile.${extension}`;
		const options = {
			fromUrl: url,
			toFile: localFile,
		};
		RNFS.downloadFile(options)
		.promise.then(() => FileViewer.open(localFile,{ showOpenWithDialog: true }))
		.then(() => {
			console.log('View Sucess')
		})
		.catch((error) => {
			console.log('View Failed',error)
		});
    }

	const note = 'Compunnel considers its team members as valued assets for the organization. We offer exclusive benefits packages for our team members in order to meet and exceed industry compliance & standards.';

	return(
		<SafeAreaView style={styles.container}>
			<Text style={{fontSize:14,padding: 16, color:ThemeColor.SubTextColor,fontFamily: FontName.Regular, textAlign:'justify'}}>{note}</Text>
			
			<FlatList style={{}}
				data={benefitsArr}
				keyExtractor={(item,index) => index.toString()}
				renderItem={({item, index}) => 
					<View style={{backgroundColor:'#fff', paddingLeft:16}}>
						<TouchableOpacity style={{alignItems:'center', flexDirection:'row',paddingRight:8, paddingTop:8, paddingBottom:8}} onPress={() => {viewFile(item)}}>
							<Text style={{flex: 1,fontSize:16, color:ThemeColor.TextColor,fontFamily: FontName.Regular}}>{item.benefitName}</Text>
							<Feather name="chevron-right" color={ThemeColor.BorderColor} size={22} />
						</TouchableOpacity>
						<View style={{backgroundColor:ThemeColor.BorderColor, height:1}} />
					</View>
				}
			/>
			<Loader isLoading={isLoading} />
		</SafeAreaView>
	);
}

export default HrBenefitScreen;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:ThemeColor.ViewBgColor,
	  
    }
  });
