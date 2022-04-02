import React ,{useEffect,createRef, useRef}from 'react';
import { View ,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    Alert,
	SafeAreaView,
	Text,
	Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'
import axios from 'axios'
import MovableView from 'react-native-movable-view';
import Icon from 'react-native-vector-icons/Ionicons';
import SearchBar from 'react-native-search-bar';
import Feather from 'react-native-vector-icons/Feather';

import {getAuthHeader} from '../../_helpers/auth-header';
import { BaseUrl, EndPoints, FontName, StaticMessage, ThemeColor } from '../../_helpers/constants';
import Loader from '../../Components/Loader';
import { AuthContext } from '../../Components/context';

const alertTypeRef = createRef();
const dateRef = createRef();


const StaffContactScreen = ({navigation})  => {
	const [isLoading, setIsLoading] = React.useState(false);
	const [staffContactArr, setStaffContactArr] = React.useState([]);
	const { signOut } = React.useContext(AuthContext);
	let mySearchBar = useRef();
	const [searchKey,setSearchKey] = React.useState('');
	const [expendexIndex,setExpendexIndex] = React.useState(-1);
	const [listUpdated, setListUpdated] = React.useState(false);

	React.useLayoutEffect(() => {
		navigation.setOptions({
		  title: "Staff contacts",
		});
	}, [navigation]);
	
	useEffect(() => {
		getStaffContacts('');
	}, []);

	const  getStaffContacts = async(searchKey) => {

		let user = await AsyncStorage.getItem('loginDetails');  
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken);
		let params = {
			'pageNum': 1,
			'pageSize': 1000,
			'searchText':searchKey
		};
		setIsLoading(true);
		axios ({  
		  "method": "POST",
		  "url": BaseUrl + EndPoints.StaffContacts,
		  "headers": getAuthHeader(authToken),
		  data:params
		})
		.then((response) => {
		  setIsLoading(false);
		  if (response.data.code == 200){
			const results = JSON.stringify(response.data.content)
			console.log(`Staff Contacts: ${results}`);
			setStaffContactArr(response.data.content.dataList[0].staffs);
		  }else if (response.data.code == 417){
			console.log(Object.values(response.data.content.messageList));
			const errorList = Object.values(response.data.content.messageList);
			Alert.alert(StaticMessage.AppName, errorList.join(), [
			  {text: 'Ok'}
			]);
	
		  }else if (response.data.code == 401){
			console.log('Session Expired Already');
			SessionExpiredAlert();
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
	
	const SessionExpiredAlert = () =>{
		Alert.alert(StaticMessage.AppName,StaticMessage.SessionExpired,
			[{
			  text: 'Ok',
			  onPress: () => signOut()
		  }]
	)}
	const handleContactSearchContact = (searchKey) => {

	}
	const handleExpendCollaps= (index) => {
		setExpendexIndex(expendexIndex == index ? -1 : index);
		setListUpdated(!listUpdated);
	}
	
	
	return(
		<SafeAreaView style={styles.container}>
			<SearchBar
				ref={mySearchBar}
				placeholder="Search"
				value= {searchKey}
				onChangeText={(val) => setSearchKey(val)}
				onSearchButtonPress={(val) => {getStaffContacts(val)}}
				onCancelButtonPress={(val) => {getStaffContacts('')}}
			/>			
			<FlatList style={{}}
				data={staffContactArr}
				keyExtractor={(item,index) => item.email.toString()}
				renderItem={({item, index}) => 
					<View style={{backgroundColor:'white',marginBottom:8,paddingLeft:16, paddingTop:8}}>
						<TouchableOpacity style={{flexDirection:'row', justifyContent:'center', paddingBottom:4}}  onPress={() => handleExpendCollaps(index)}>
							<View style={{flex:1}}>
								<Text style={{fontSize:16, fontFamily:FontName.Regular,color:ThemeColor.TextColor}}>{item.name}</Text>
								<Text style={{fontSize:14, fontFamily:FontName.Regular,color:ThemeColor.SubTextColor, marginTop:2}}>{item.jobTitle}</Text>
							</View>
							<View style={{justifyContent:'center', alignItems:'center',width:40, height:40}}>
								<Feather name="chevron-down" color={'gray'} size={22} />
							</View>
						</TouchableOpacity>
						{expendexIndex == index ? 
						<View>
							<View style={{height:1, backgroundColor:ThemeColor.BorderColor}}/>
							<View style={{flexDirection:'row', justifyContent:'center', }}>
								<View style={{flex:1,marginTop:8, marginBottom:8}}>
									<Text style={{fontSize:14, fontFamily:FontName.Regular,color:ThemeColor.TextColor}}>{item.email}</Text>
									<Text style={{fontSize:14, fontFamily:FontName.Regular,color:ThemeColor.SubTextColor, marginTop:2}}>{item.phone}</Text>
								</View>
								<View style={{width:1, height:'100%',backgroundColor:ThemeColor.BorderColor}}/>

								<TouchableOpacity style={{justifyContent:'center', alignItems:'center',width:100}} onPress={() => handleExpendCollaps(index)}>
									<Text style={{fontSize:item.ext > 0 ? 18 : 14, fontFamily:FontName.Regular,color:ThemeColor.TextColor, textAlign:'center'}}>{item.ext > 0 ? item.ext : 'Not provided'}</Text>
									<Text style={{fontSize:12, fontFamily:FontName.Regular,color:ThemeColor.SubTextColor, marginTop:2, marginBottom:2}}>Extention</Text>

								</TouchableOpacity>
							</View>
						</View> : null}
					</View>
				}
			/>
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

export default StaffContactScreen;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:ThemeColor.ViewBgColor,
	  
    }
  });
