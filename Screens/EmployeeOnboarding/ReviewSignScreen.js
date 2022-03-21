import React from "react";
import { SafeAreaView, 
    View,
} from "react-native";
import { ThemeColor} from '../../_helpers/constants';
import { WebView } from 'react-native-webview';


const ReviewSignScreen = ({route,navigation}) => {
	const { urlToLoad } = route.params;
	const { urlType } = route.params;
	const { docName } = route.params;

	React.useLayoutEffect(() => {
		navigation.setOptions({
			  title: docName,
		});
	}, [navigation]);
	
	return(
		<View style={{flex:1,backgroundColor:ThemeColor.NavColor}}>
			<SafeAreaView style={{flex:1}}>
				<View style={{flex:1, backgroundColor:ThemeColor.ViewBgColor}}>
				<WebView
					source={{ uri: urlToLoad }}
					style={{ marginTop: 0 }}
				/>
				</View>
			</SafeAreaView>
		</View>
	);
}

export default ReviewSignScreen;