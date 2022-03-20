import React,{useEffect} from "react";
import { Text, 
    TouchableOpacity,
    View} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeColor} from '../../_helpers/constants';
import { WebView } from 'react-native-webview';
import Feather from 'react-native-vector-icons/Feather';


const PrivacyAndTermsScreen = ({route,navigation}) => {
	const { urlToLoad } = route.params;
	const { urlType } = route.params;
	const { fromMenu } = route.params;
	React.useLayoutEffect(() => {
		navigation.setOptions({
		  title: urlType == 'Privacy' ? 'Privacy policy':'Terms of use',
		});
	}, [navigation]);
	useEffect(() => {
		if(fromMenu){
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
	return(
		<SafeAreaView style={{flex:1,backgroundColor:ThemeColor.NavColor}}>
			<View style={{flex:1}}>
				{!fromMenu &&
				<View style={{backgroundColor:ThemeColor.NavColor, height: 44, alignItems: 'center', justifyContent: 'space-between', flexDirection:'row'}}>
					<TouchableOpacity style={{marginLeft:16}} onPress={() => {navigation.goBack()}}>
						<Feather name="chevron-left" color={ThemeColor.BorderColor} size={30,30} />
					</TouchableOpacity>					
					<Text style={{color:'#fff', fontSize:18,fontFamily: 'Lato-Regular'}}>{urlType == 'Privacy' ? 'Privacy policy':'Terms of use'}</Text>
					<View onPress={() => {navigation.goBack()}}>
						<Feather name="chevron-left" color={ThemeColor.NavColor} size={30,30} />
					</View>
				</View> }
				<View style={{flex:1, backgroundColor:ThemeColor.ViewBgColor}}>
				<WebView
					source={{ uri: urlToLoad }}
					style={{ marginTop: 0 }}
				/>
				</View>
			</View>
		</SafeAreaView>
	);
}

export default PrivacyAndTermsScreen;