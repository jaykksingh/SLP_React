import React, {useEffect} from "react";
import { TouchableOpacity,
    SafeAreaView, 
    Alert,
	StyleSheet} from "react-native";

import Ionic from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'
import axios from 'axios'
import { WebView } from 'react-native-webview';
import RNFS from "react-native-fs";
import FileViewer from "react-native-file-viewer";
import { BaseUrl, EndPoints, StaticMessage} from '../../_helpers/constants';
import { AuthContext } from '../../Components/context';
import Loader from '../../Components/Loader';
import {getAuthHeader} from '../../_helpers/auth-header';



const EOBBenefitDetailScreen = ({route,navigation}) => {
	const { comeFrom } = route.params;
	const { benefitObj } = route.params;
	const { signOut } = React.useContext(AuthContext);
	let [isLoading, setIsLoading] = React.useState(true);
	const [benefitDetails, setBenefitDetails] = React.useState({});
	
	React.useLayoutEffect(() => {
		navigation.setOptions({
			headerRight: () => (
				<TouchableOpacity style={{marginRight:16}} onPress={() => viewFile(benefitObj)}>
				  <Ionic name="ios-share-outline" color={'white'} size={25,25} />
				</TouchableOpacity>
			),
			title: benefitObj ? benefitObj.benefitName : 'Benefits',
		});
	}, [navigation]);
	const showLogOutAlert = () =>{
		console.log('Log Out')
		Alert.alert('Are sure want to log out?',null,
			[{
				text: 'Log out',
				onPress: () => signOut()
			  },{
				text: 'Close',
				onPress: () => signOut()
			  },{
				text: 'Cancel',
			  },]
		  )
	  }

	useEffect(() => {
        getHrBenefitDetails();
    },[]);

	const  getHrBenefitDetails = async() => {

		let user = await AsyncStorage.getItem('loginDetails');  
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken);

		setIsLoading(true);
		axios ({  
		  "method": "GET",
		  "url": `${BaseUrl}${EndPoints.HrBenefits}/${benefitObj.benefitId}`,
		  "headers": getAuthHeader(authToken)
		})
		.then((response) => {
		  setIsLoading(false);
		  if (response.data.code == 200){
			const results = JSON.stringify(response.data.content.dataList[0])
			setBenefitDetails(response.data.content.dataList[0]);
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
		  if(error.response && error.response.status == 401){
            SessionExpiredAlert();
          }else{
                Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
                  {text: 'Ok'}
                ]);
          }
	
		})
	}
    const SessionExpiredAlert = () =>{
        Alert.alert(StaticMessage.AppName,StaticMessage.SessionExpired,
            [{
              text: 'Ok',
              onPress: () => signOut()
          }]
      )}
	const viewFile = (fileObject) => {
        console.log('File Path:', fileObject.documentExpenseFileLocation);
		let url =  fileObject.documentExpenseFileLocation;
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
    let benefitContains = benefitDetails ? benefitDetails.benefitContains : '';
	return(
		<SafeAreaView style={styles.container}>
              <WebView
                    originWhitelist={['*']}
                    source={{ html: benefitContains }}
                />		
			<Loader isLoading={isLoading} />
		</SafeAreaView>
	);
}

export default EOBBenefitDetailScreen;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      margin:16	,
	  backgroundColor:'white'

    },
  });
