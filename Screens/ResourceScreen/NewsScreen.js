import React ,{useEffect} from "react";
import {
	useWindowDimensions, 
	StyleSheet, 
	Text,
	View,
	ScrollView,
	Alert,
	SafeAreaView,
	Dimensions,
	TouchableOpacity
} from "react-native";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import PageControl from 'react-native-page-control';
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'
import axios from 'axios'
import moment from 'moment';
import HTML from "react-native-render-html";
import MovableView from 'react-native-movable-view';
import Icon from 'react-native-vector-icons/Ionicons';
import { ThemeColor ,BaseUrl, EndPoints, StaticMessage, FontName} from '../../_helpers/constants';
import {getAuthHeader} from '../../_helpers/auth-header';
import Loader from '../../Components/Loader';
import { AuthContext } from '../../Components/context';



const NewsScreen = ({route,navigation}) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [newsArray, setNewsArray] = React.useState([]);
  const { signOut } = React.useContext(AuthContext);
  
	const showLogOutAlert = () =>{
		console.log('Log Out')
		Alert.alert('Are sure want to log out?',null,
			[{
			text: 'Cancel',
			},{
				text: 'Log out',
				onPress: () => signOut()
			}]
		)
	}
	React.useLayoutEffect(() => {
		navigation.setOptions({
			title:'News'
		});
	}, [navigation]);


	useEffect(() => {
		getNewsList();
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
  
	const  getNewsList = async() => {
		let user = await AsyncStorage.getItem('loginDetails');  
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken);

		setIsLoading(true);
		axios ({  
			"method": "POST",
			"url": BaseUrl + EndPoints.NewsList,
			"headers": getAuthHeader(authToken),
			data:{'newsType':'1'}
		})
		.then((response) => {
		setIsLoading(false);
		if (response.data.code == 200){
			const results = JSON.stringify(response.data.content.dataList[0]);
			console.log(results);
			setNewsArray(response.data.content.dataList);
		}else if (response.data.code == 417){
			console.log(Object.values(response.data.content.messageList));
			const errorList = Object.values(response.data.content.messageList);
			Alert.alert(StaticMessage.AppName, errorList.join(), [
			{text: 'Ok'}
			]);

		}else{
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
  
  
  	const windowWidth = Dimensions.get('window').width;
	const getFormatedDate=(newsDate) => {
		let momentDate = moment(newsDate, 'YYYY-MM-DDTHH:mm:ssZZ');
		let dateString = moment(momentDate).format('MMM DD, YYYY');
		return dateString;
	}
	const contentWidth = useWindowDimensions().width;
  	var projects = [];
	for(let i = 0; i < newsArray.length; i++){
		projects.push(
			<KeyboardAwareScrollView key = {i} style={{width:windowWidth, flex: 1, padding:16,paddingTop:0 }}>
				<View style={{marginTop:12}}>
					<Text style ={{color:ThemeColor.TextColor, fontSize:16,fontFamily:FontName.Regular}}>{newsArray[i].newsName}</Text>
					<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,fontFamily:FontName.Regular, marginTop:4}}>{getFormatedDate(newsArray[i].newsDate)}</Text>
					<View style={{flex: 1, marginTop:16}}>
						<HTML  source={{ html: newsArray[i].newsDetails }} contentWidth={contentWidth} />
					</View>
				</View>		
			</KeyboardAwareScrollView>
		)
	}
  	return (
    	<SafeAreaView style={styles.container}>
			<PageControl
				style={{position:'absolute', left:0, right:0, top:10}}
				numberOfPages={newsArray.length}
				currentPage={activeIndex}
				hidesForSinglePage
				pageIndicatorTintColor='gray'
				currentPageIndicatorTintColor={ThemeColor.BtnColor}
				indicatorStyle={{borderRadius: 5}}
				currentIndicatorStyle={{borderRadius: 5}}
				indicatorSize={{width:8, height:8}}
				onPageIndicatorPress={this.onItemTap}
			/>
			<ScrollView horizontal={true} pagingEnabled={true} style={{marginBottom:8, marginTop:24}}  scrollEventThrottle={newsArray.length}>        
				{newsArray.length > 0 && projects}
				<Loader isLoading={isLoading} /> 
			</ScrollView>
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

export default NewsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:'#E5E9EB',
  },inputText:{
    flex: 1,
    height:40,
    color:'black',
    fontSize:16,
    fontFamily: FontName.Regular,
    marginLeft:8,
    alignContent:'stretch',
  },
  labelText:{
    flex: 1,
    color:'black',
    fontSize:16,
    fontFamily: FontName.Regular,
    marginLeft:8,
    alignContent:'stretch',
  },btnFill:{
    flex: 1,
    height:50,
    justifyContent:"center",
    backgroundColor: ThemeColor.BtnColor ,
    alignItems:'center',
  },chipTitle: {
    fontSize: 14,
    paddingLeft:8,
    paddingRight:8
  },chipItem: {
    padding: 4,
    marginVertical: 4,
    marginHorizontal: 8,
    borderRadius:20,
    borderColor:ThemeColor.BtnColor,
    borderWidth:1,
  },
});