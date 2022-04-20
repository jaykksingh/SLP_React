import React, {useEffect} from "react";
import { TouchableOpacity,
    SafeAreaView, 
    View,
	Alert
} from "react-native";

import Feather from 'react-native-vector-icons/Feather';
import { ThemeColor} from '../../_helpers/constants';
import { WebView } from 'react-native-webview';
import { AuthContext } from '../../Components/context';
import Loader from '../../Components/Loader';


const EOBViewAttachmentScreen = ({route,navigation}) => {
	const { stepDetail } = route.params;
	const { signOut } = React.useContext(AuthContext);
	let [isLoading, setIsLoading] = React.useState(true);

	
	React.useLayoutEffect(() => {
		navigation.setOptions({
			headerRight: () => (
				<TouchableOpacity style={{marginRight:16}} onPress={() => showLogOutAlert()}>
				  <Feather name="more-vertical" color={'white'} size={25} />
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
				text: 'Cancel',
			  },]
		  )
	  }

	useEffect(() => {
		let fileName = stepDetail.fileName;
		let ext =  fileName.slice((Math.max(0, fileName.lastIndexOf(".")) || Infinity) + 1);
		if (ext == 'pdf' || ext == 'doc' || ext == 'docx'){
			setIsLoading(false);
		}
    },[]);

	
	
	return(
		<View style={{flex:1,backgroundColor:ThemeColor.ViewBgColor}}>
			<SafeAreaView style={{flex:1}}>
				<View style={{flex:1, backgroundColor:ThemeColor.ViewBgColor}}>
					<WebView
						onLoadEnd ={() => {setIsLoading(false)}}
						source={{ uri: stepDetail.docPath ? stepDetail.docPath : stepDetail.path}}
						style={{ marginTop: 0 }}
					/>
				</View>
			</SafeAreaView>
			<Loader isLoading={isLoading} />

		</View>
	);
}

export default EOBViewAttachmentScreen;