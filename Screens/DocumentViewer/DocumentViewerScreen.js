import React,{useEffect} from "react";
import { 
    SafeAreaView,
	View} from "react-native";

import { WebView } from 'react-native-webview';
import { ThemeColor } from '../../_helpers/constants';
import Loader from '../../Components/Loader';


const DocumentViewerScreen = ({route,navigation}) => {
	const [isLoading, setIsLoading] = React.useState(false);
	const {fileURL} = route.params;
    const {fileName} = route.params;
	React.useLayoutEffect(() => {
		navigation.setOptions({
			  title: fileName.count > 0 ? fileName : "Document" ,
		});
	}, [navigation]);
	const showShareOptions = () =>{

	}
	useEffect(() => {
	},[])

	
	var urlToLoad = fileURL.split("%20").join("\ ");
	return(
		<SafeAreaView style={{flex:1,backgroundColor:ThemeColor.ViewBgColor}}>
			<View style={{flex:1, backgroundColor:ThemeColor.ViewBgColor}}>
				<WebView source={{ uri: urlToLoad }} style={{ marginTop: 0 }}/>
			</View>
			<Loader isLoading={isLoading} />
		</SafeAreaView>
	);
}

export default DocumentViewerScreen;