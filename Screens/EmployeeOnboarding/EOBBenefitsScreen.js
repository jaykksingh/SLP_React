import React, {useEffect} from "react";
import { StatusBar, 
    Text, 
    TouchableOpacity,
    SafeAreaView, 
    View,
	Alert,
	StyleSheet,
	FlatList
} from "react-native";

import Feather from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'
import axios from 'axios'
import { BaseUrl, WebBaseURL,EndPoints, StaticMessage, ThemeColor ,FontName} from '../../_helpers/constants';
import { AuthContext } from '../../Components/context';
import Loader from '../../Components/Loader';
import {getAuthHeader} from '../../_helpers/auth-header';


const EOBBenefitsScreen = ({route,navigation}) => {
	const { comeFrom } = route.params;
	const { stepDetail } = route.params;
	const [isURLExit, setIsURLExit] = React.useState(false);
	const [urlToLoad, setUrlToLoad] = React.useState('');
	const { signOut } = React.useContext(AuthContext);
	let [isLoading, setIsLoading] = React.useState(true);
	const [benefitsArr, setBenefitsArr] = React.useState([]);
	
	React.useLayoutEffect(() => {
		navigation.setOptions({
			headerRight: () => (
				<TouchableOpacity style={{marginRight:16}} onPress={() => showLogOutAlert()}>
				  <Feather name="more-vertical" color={'white'} size={25,25} />
				</TouchableOpacity>
			),
			title: 'Benefits offered',
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
        getHrBenefitsList();
    },[]);

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
	
	const note = 'Compunnel considers its team members as valued assets for the organization. We offer exclusive benefits packages for our team members in order to meet and exceed industry compliance & standards.';

	return(
		<SafeAreaView style={styles.container}>
			<Text style={{fontSize:14,padding: 16, color:ThemeColor.SubTextColor,fontFamily: FontName.Regular, textAlign:'justify'}}>{note}</Text>
			
			<FlatList style={{}}
				data={benefitsArr}
				keyExtractor={(item,index) => index.toString()}
				renderItem={({item, index}) => 
					<View style={{backgroundColor:'#fff', paddingLeft:16}}>
						<TouchableOpacity style={{alignItems:'center', flexDirection:'row',paddingRight:8, paddingTop:8, paddingBottom:8}} onPress={() => {navigation.navigate("BenefitDetail",{benefitObj:item})}}>
							<Text style={{flex: 1,fontSize:16, color:ThemeColor.TextColor,fontFamily: FontName.Regular}}>{item.benefitName}</Text>
							<Feather name="chevron-right" color={ThemeColor.BorderColor} size={22,22} />
						</TouchableOpacity>
						<View style={{backgroundColor:ThemeColor.BorderColor, height:1}} />
					</View>
				}
			/>
			<Loader isLoading={isLoading} />
			<TouchableOpacity style={[styles.btnFill,{borderTopRightRadius:5,borderBottomRightRadius:5}]} onPress={() => {navigation.navigate('EOBDocumentScreen',{comeFrom:'',stepDetail:stepDetail})}}>
				<Text style={{color:'#53962E',fontFamily: FontName.Regular, fontSize:16, color:'#fff' }}>{'REVIEW & SIGN'}</Text>
			</TouchableOpacity>
		</SafeAreaView>
	);
}

export default EOBBenefitsScreen;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:ThemeColor.ViewBgColor,
	  
    },btnFill:{
		marginLeft:16,
		marginRight:16,
		marginTop:8,
		marginBottom:8,
		height:50,
		justifyContent:"center",
		backgroundColor: ThemeColor.BtnColor ,
		alignItems:'center',
		borderRadius:5,
	  }
  });
