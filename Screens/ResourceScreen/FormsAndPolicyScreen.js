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
// import OpenFile from 'react-native-doc-viewer';
import SegmentedControlTab from "react-native-segmented-control-tab";
import AntDesign from 'react-native-vector-icons/AntDesign';
import MovableView from 'react-native-movable-view';
import Icon from 'react-native-vector-icons/Ionicons';
import {getAuthHeader} from '../../_helpers/auth-header';
import { BaseUrl, EndPoints, StaticMessage, ThemeColor, FontName } from '../../_helpers/constants';
import Loader from '../../Components/Loader';

const FormsAndPolicyScreen = ({navigation})  => {
	const [isLoading, setIsLoading] = React.useState(false);
	const [formsArr, setFormsArray] = React.useState([]);
	let [selectedIndex, setSelectedIndex] = React.useState(0);

	React.useLayoutEffect(() => {
		navigation.setOptions({
		  title: "India HR and policies",
		});
	}, [navigation]);

	
	useEffect(() => {
		getFormsList('Accounts');
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
	const handleIndexChange = (index) => {
		setSelectedIndex(index);
		console.log("Index:", index);
		if(index == 0){
			getFormsList('Accounts');
		}else if(index == 1){
			getFormsList('Human Resources');
		}else if(index == 2){
			getFormsList('Legal');
		}else{
			getFormsList('Payroll');
		}
	  }
	const  getFormsList = async(formType) => {

		let user = await AsyncStorage.getItem('loginDetails');  
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken);
		
		setIsLoading(true);
		axios ({  
		  "method": "POST",
		  "url": BaseUrl + EndPoints.FormsList,
		  "headers": getAuthHeader(authToken),
		  data: {'deptName':formType}
		})
		.then((response) => {
		  setIsLoading(false);
		  if (response.data.code == 200){
			const results = JSON.stringify(response.data.content.dataList[0])
			console.log(`Forms: ${results}`);
			setFormsArray(response.data.content.dataList);
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
        // if(Platform.OS === 'ios'){
        //     //IOS
        //     OpenFile.openDoc([{
        //         url:fileObject.filePathUrl,
        //         fileNameOptional:fileObject.fileName
        //     }], (error, url) => {
        //         if (error) {
        //         console.error(error);
        //         } else {
        //         console.log('Filte URL:',url)
        //         }
        //     })
        // }else{
        //     //Android
        //     OpenFile.openDoc([{
        //         url:fileObject.filePathUrl, // Local "file://" + filepath
        //         fileName:fileObject.fileName,
        //         cache:false,
        //         fileType:"jpg"
        //     }], (error, url) => {
        //         if (error) {
        //         console.error(error);
        //         } else {
        //         console.log(url)
        //         }
        //     })
        // }
    }

	const note = 'Compunnel considers its team members as valued assets for the organization. We offer exclusive benefits packages for our team members in order to meet and exceed industry compliance & standards.';

	return(
		<SafeAreaView style={styles.container}>
			<View style={{alignItems:'center', justifyContent:'center', height:50, marginTop:8}}>
				<SegmentedControlTab
					tabStyle ={{ borderColor: ThemeColor.BtnColor}}
					activeTabStyle={{ backgroundColor: ThemeColor.BtnColor  }}
					tabsContainerStyle={{height:40, width:'90%', tintColor:ThemeColor.BtnColor, borderColor:ThemeColor.BtnColor }}
					values={["Accounting",'HR', 'Immigration','Payroll']}
					tabTextStyle={{ color: ThemeColor.BtnColor, fontSize:14, flexWrap:'wrap' ,}}
					activeTabTextStyle={{ color: '#fff' }}
					selectedIndex={selectedIndex}
					onTabPress={ (index) => {handleIndexChange(index)}}
				/>
			</View>
			
			{formsArr.length > 0 ?
			 <FlatList style={{}}
				data={formsArr}
				keyExtractor={(item,index) => index.toString()}
				renderItem={({item, index}) => 
					<View style={{backgroundColor:'#fff', paddingLeft:16}}>
						<TouchableOpacity style={{alignItems:'center', flexDirection:'row',paddingRight:8, paddingTop:8, paddingBottom:8}} onPress={() => {viewFile(item)}}>
							<AntDesign name="pdffile1" color={ThemeColor.SubTextColor} size={30,30} />
							<View style={{flex:1, marginLeft:8}}>
								<Text style={{flex: 1,fontSize:16, color:ThemeColor.TextColor,fontFamily: FontName.Regular}}>{item.description}</Text>
								<Text style={{flex: 1,fontSize:14, color:ThemeColor.TextColor,fontFamily: FontName.Regular}}>{item.formSize/1000} KB</Text>
							</View>
							<Feather name="chevron-right" color={ThemeColor.BorderColor} size={22,22} />
						</TouchableOpacity>
						<View style={{backgroundColor:ThemeColor.BorderColor, height:1}} />
					</View>
				}
			/> : 
			<View style={{flex:1,justifyContent: 'center',alignItems: 'center'}}>
				<Text style={{fontSize:16, color:ThemeColor.TextColor,fontFamily: FontName.Regular}}>No forms are available</Text>

			</View>}
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

export default FormsAndPolicyScreen;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:ThemeColor.ViewBgColor,
	  
    }
  });
