import React, {useEffect} from "react";
import { StatusBar, 
    Text, 
    TouchableOpacity,
    SafeAreaView, 
    View,
	Alert
} from "react-native";

import Feather from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'
import { BaseUrl, WebBaseURL,EndPoints, StaticMessage, ThemeColor ,BaseURLElastic} from '../../_helpers/constants';
import { WebView } from 'react-native-webview';
import { AuthContext } from '../../Components/context';
import Loader from '../../Components/Loader';


const EOBDocumentScreen = ({route,navigation}) => {
	const { comeFrom } = route.params;
	const { stepDetail } = route.params;
	const [isURLExit, setIsURLExit] = React.useState(false);
	const [urlToLoad, setUrlToLoad] = React.useState('');
	const { signOut } = React.useContext(AuthContext);
	let [isLoading, setIsLoading] = React.useState(true);

	
	React.useLayoutEffect(() => {
		navigation.setOptions({
			headerRight: () => (
				<TouchableOpacity style={{marginRight:16}} onPress={() => showLogOutAlert()}>
				  <Feather name="more-vertical" color={'white'} size={25,25} />
				</TouchableOpacity>
			),
			title: stepDetail.title ? stepDetail.title : stepDetail.docName,
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
				onPress: () => navigation.goBack()
			  },{
				text: 'Cancel',
			  },]
		  )
	  }

	useEffect(() => {
		
        getDocumentURL();
    },[]);

	const getDocumentURL = async () => {
		let user = await AsyncStorage.getItem('loginDetails');  
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken);
		
		let step = stepDetail.step;
		let envId = stepDetail.envId;

		let urlString = `${WebBaseURL}/onboarding/webview?code=${authToken}&envelopeId=${envId}`;
		    // NSString *docUrl = [NSString stringWithFormat:@"%@/onboarding/webview?code=%@&envelopeId=%@",WebBaseURL,authKey,envelopeId];
		setUrlToLoad(urlString);
		setIsURLExit(true);
		console.log(urlString);
	}

	
	return(
		<View style={{flex:1,backgroundColor:ThemeColor.ViewBgColor}}>
			<SafeAreaView style={{flex:1}}>
				{isURLExit ? 
				<View style={{flex:1, backgroundColor:ThemeColor.ViewBgColor}}>
				<WebView
					onLoadEnd ={() => {setIsLoading(false)}}
					source={{ uri: urlToLoad }}
					style={{ marginTop: 0 }}
				/>
				</View> : null
				}
			</SafeAreaView>
			<Loader isLoading={isLoading} />

		</View>
	);
}

export default EOBDocumentScreen;