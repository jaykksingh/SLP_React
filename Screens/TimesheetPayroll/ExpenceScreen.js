import React,{useEffect} from "react";
import { 
	Text, 
    TouchableOpacity,
    StyleSheet, 
    View,
	FlatList,
} from "react-native";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'
import axios from 'axios'
import moment from 'moment';
// import OpenFile from 'react-native-doc-viewer';
import numeral from 'numeral';
import MovableView from 'react-native-movable-view';
import {getAuthHeader} from '../../_helpers/auth-header';
import { BaseUrl, EndPoints, StaticMessage, ThemeColor, FontName } from '../../_helpers/constants';
import Loader from '../../Components/Loader';

const ExpenceScreen = ({route,navigation}) => {
	const [isLoading, setIsLoading] = React.useState(false);
	const [expensesArray, setExpensesArray] = React.useState([]);

	React.useLayoutEffect(() => {
		navigation.setOptions({
			headerRight: () => (
				<TouchableOpacity style={{marginRight:16, flexDirection:'row', justifyContent: 'center', alignItems: 'center'}} onPress={() => navigation.navigate('AddExpence')}>
				  <Icon name="add-outline" color={'white'} size={20,20} />
				  <Text style={{fontSize:16, color:'white',fontFamily: FontName.Regular}}>New</Text>
				</TouchableOpacity> 
			  ),
			  title: `Expense management `,
		});
	}, [navigation]);
	const showShareOptions = () =>{

	}
	useEffect(() => {
		navigation.addListener('focus', () => {
			getExpensesList();
		})
		getExpensesList();

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
	const  getExpensesList = async() => {
		let user = await AsyncStorage.getItem('loginDetails');  
		let parsed = JSON.parse(user);  
		let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
		var authToken = base64.encode(userAuthToken);

		setIsLoading(true);
		axios ({  
		  "method": "GET",
		  "url": BaseUrl + EndPoints.ExpensesList,
		  "headers": getAuthHeader(authToken)
		})
		.then((response) => {
			setIsLoading(false);

			if (response.data.code == 200){
				const results = JSON.stringify(response.data.content.dataList[0])
				console.log(results);
				setExpensesArray(response.data.content.dataList);
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
		  if(error.response && error.response.status == 401){
			SessionExpiredAlert();
		  }else{
			  Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
				  {text: 'Ok'}
				]);
		  }
		})
	}
	const viewFile = (fileObject) => {
        console.log('File Path:', fileObject.documentExpenseFileLocation);
        // if(Platform.OS === 'ios'){
        //     //IOS
        //     OpenFile.openDoc([{
        //         url:fileObject.documentExpenseFileLocation,
        //         fileNameOptional:fileObject.documentExpenseName
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
        //         url:fileObject.documentExpenseFileLocation, // Local "file://" + filepath
        //         fileName:fileObject.documentExpenseName,
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
	
	const getFormatedDateRange=(item) =>{
		let momentStartDate = moment(item.expenseFromDate, 'YYYY-MM-DDTHH:mm:ssZZ');
		let momentEndDate = moment(item.expenseToDate, 'YYYY-MM-DDTHH:mm:ssZZ');
		let startDateString = moment(momentStartDate).format('MMM DD, YYYY')
		let endDateString = moment(momentEndDate).format('MMM DD, YYYY')
		return `${startDateString} - ${endDateString}`;
	}
	const getFormatedRequestedDate=(item) =>{
		let momentStartDate = moment(item.createdDate, 'YYYY-MM-DDTHH:mm:ssZZ');
		let startDateString = moment(momentStartDate).format('MMM DD, YYYY')
		return `${startDateString}`;
	}
	const description = 'Lorem ipsum dolor sit er elit lamet, consectetaur cillium adipisicing pecu, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Nam liber te conscient to factor tum poen legum odioque civiuda.'
	return(
		<SafeAreaProvider style={{flex:1,backgroundColor:ThemeColor.ViewBgColor, paddingBottom:34}}>
			{expensesArray.length > 0 ?
			<FlatList style={{}}
                data={expensesArray}
                keyExtractor={(item, index) => item.key}
                renderItem={({item}) => 
                <View>
					<View  style={{backgroundColor:'#fff'}} >
						<View style={{paddingLeft:16, paddingRight:16, flexDirection:'row', marginTop:8}}>
							<Text style={{flex: 1, fontFamily: FontName.Regular, fontSize:16,color:ThemeColor.NavColor}}>{item.projectDescription}</Text>
							<Text style={{fontFamily: FontName.Regular, fontSize:14, color: item.status == 'Pending' ? ThemeColor.OrangeColor : ThemeColor.GreenColor}}>{item.status}</Text>
						</View>
						<View style={{paddingLeft:16, paddingRight:16, flexDirection:'row', marginTop:4}}>
							<Text style={{fontFamily: FontName.Regular, fontSize:14,color:ThemeColor.SubTextColor}}>Raised on: </Text>
							<Text style={{fontFamily: FontName.Regular, fontSize:14, color:ThemeColor.TextColor}}>{getFormatedRequestedDate(item)}</Text>
						</View>
						<View style={{paddingLeft:16, paddingRight:16, flexDirection:'row', marginTop:4, alignContent:'center'}}>
							<Text style={{fontFamily: FontName.Regular, fontSize:14, color:ThemeColor.TextColor,flex:1}}>{getFormatedDateRange(item)}</Text>
							<Text style={{fontFamily: FontName.Bold, fontSize:16, color:ThemeColor.NavColor}}>${numeral(item.expenseAmount).format('0,0[.]00')}</Text>
						</View>
						<Text style={{fontFamily: FontName.Regular, fontSize:14, color:ThemeColor.TextColor, marginLeft:16, marginTop:2}}>{item.billableToClient == 1 ? 'Billable to client' : 'Not billable to client'}</Text>
						<Text style={{fontFamily: FontName.Regular, fontSize:14, color:ThemeColor.SubTextColor, marginLeft:16, marginRight:16,marginTop:4}}>{item.expenseDescription}</Text>

						<View style={{flex: 1,height:1, backgroundColor:ThemeColor.BorderColor, marginTop:8}}/>
						<TouchableOpacity style={{height:40, paddingLeft:16, paddingRight:8, flexDirection:'row', marginTop:4, alignItems:'center'}} onPress={() => {viewFile(item)}}>
							<Text style={{fontFamily: FontName.Regular, fontSize:14, color:ThemeColor.NavColor,flex:1}}>{item.documentExpenseName}</Text>
							<Feather name="chevron-right" color={ThemeColor.BorderColor} size={25,25} />
						</TouchableOpacity>
					</View>
                	<View style={{height:12, backgroundColor:ThemeColor.BorderColor}} />
                </View>
                }
            /> :
			<View style={{flex:1, padding:16, justifyContent:'center'}}>
				<Text style={{fontFamily: FontName.Regular, fontSize:16, color:ThemeColor.TextColor, textAlign:'center'}}>No expense found. Go ahead and submit your new Expense.</Text>
			</View>
			}
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
		</SafeAreaProvider>
	);
}

export default ExpenceScreen;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
    },inputView:{
        flexDirection:'row',
        paddingLeft:16,
        paddingRight:16,
        height:40,
        alignItems:"center", 
        backgroundColor:ThemeColor.BorderColor
    
      },
      bottomView:{
        flexDirection:'row',
        paddingLeft:16,
        paddingRight:16,
        height:40,
        backgroundColor:'#fff',
        alignItems:"center",
    
      }
  });