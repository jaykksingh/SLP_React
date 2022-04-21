/* eslint-disable react/display-name */
import React , {useEffect} from "react";
import { View,
    Text,
    StyleSheet,
    Alert,
    TextInput,
    FlatList,
    SafeAreaView} from "react-native";
import SegmentedControlTab from "react-native-segmented-control-tab";
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'
import axios from 'axios';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import Icons from 'react-native-vector-icons/Ionicons';
import { BaseUrl, EndPoints, StaticMessage, ThemeColor, FontName } from '../../_helpers/constants';
import { getAuthHeader} from '../../_helpers/auth-header';
import Loader from '../../Components/Loader';


const ViewLCADetailsScreen = ({route,navigation}) => {
	let [isLoading, setLoading] = React.useState(false);
	let [selectedIndex, setSelectedIndex] = React.useState(0);
	let [data,setData] = React.useState({
		appFor:'',
		appForId:'',
		firstName:'',
		lastName:'',
		email:'',
		contactNumberCountryCode:'',
		contactNumber:'',
		appPriority:'',
		appPriorityId:'',
		appType:'',
		appTypeName:'',
		appTypeId:'',
		currentStatus:'',
		skillCategory:'',
		comments:'',
		documentsList:[]
	});

	const {applicationID} = route.params;

	React.useLayoutEffect(() => {
		navigation.setOptions({
			title:'Application details'
		});
	}, [navigation]);

	useEffect(() => {
		getApplicationDetails(applicationID);
		
	},[]);

  
  const handleIndexChange = (index) => {
    setSelectedIndex(index);
    console.log("Index:", index);
    if(index == 1){
    }else{
    }
  }
 

  const getApplicationDetails = async (applicationID) => {
    setLoading(true);

    let user = await AsyncStorage.getItem('loginDetails');  
    let parsed = JSON.parse(user);  
    let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
    var encoded = base64.encode(userAuthToken);

    console.log(`URL:${BaseUrl}${EndPoints.ImmigrationDetails}/${applicationID}`);

    axios ({
      "method": "GET",
      "url": `${BaseUrl}${EndPoints.ImmigrationDetails}/${applicationID}`,
      "headers": getAuthHeader(encoded)
    })
    .then((response) => {
      setLoading(false);
      if (response.data.code == 200){
        let result = JSON.stringify(response.data.content.dataList[0]);
		console.log('App Details:',result);
		setData(response.data.content.dataList[0]);
      }else if (response.data.code == 417){
        setLoading(false);
        const errorList = Object.values(response.data.content.messageList);
        Alert.alert(StaticMessage.AppName, errorList.join(), [
          {text: 'Ok'}
        ]);

      }else{

      }
    })
    .catch((error) => {
		console.log(error);
        setLoading(false);
        Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
            {text: 'Ok'}
        ]);
    })
  }

  
  
	const toggleSwitch = () => {
		setData({...data,allowSms:!data.allowSms});
	}
  	return (
      	<SafeAreaView style={[styles.container,{backgroundColor:ThemeColor.ViewBgColor,}]}>
			{data.documentsList.length > 0 && 
			<View style={{alignItems:'center', justifyContent:'center', height:50,marginTop:8}}>
				<SegmentedControlTab
					tabStyle ={{ borderColor: ThemeColor.BtnColor}}
					activeTabStyle={{ backgroundColor: ThemeColor.BtnColor  }}
					tabsContainerStyle={{ height: 35, width:'70%', tintColor:ThemeColor.BtnColor, borderColor:ThemeColor.BtnColor }}
					lastTabStyle={{color: ThemeColor.LabelTextColor}}		  
					values={["Details", "Documents"]}
					tabTextStyle={{ color: ThemeColor.BtnColor }}
					activeTabTextStyle={{ color: '#fff' }}
					selectedIndex={selectedIndex}
					onTabPress={ (index) => {handleIndexChange(index)}}
				/>
			</View>
			}
			{
			selectedIndex == 0 ?
			<KeyboardAwareScrollView style={{paddingLeft:16,paddingRight:16}}> 
				<View style={{marginTop:12}}>
					<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Application for</Text>
					<View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}} >
						<Text style={[styles.labelText,{color:data.appFor.length > 0 ? 'black' : ThemeColor.PlaceHolderColor}]}>{data.appFor.length >0 ? data.appFor : 'Application For'}</Text>
					</View>
				</View>
				<View style={{flexDirection:'row', flex:1,marginTop:12}}>
					<View style={{flex: 1,}}>
						<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>First name</Text>
						<View style={{backgroundColor:'white', height:40, borderTopLeftRadius:5,borderBottomLeftRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}>
						<TextInput  
							style={styles.inputText}
							placeholder="First name" 
							placeholderTextColor={ThemeColor.PlaceHolderColor}
							keyboardType='default'
							editable = {false}
							value= {data.firstName}
							onChangeText={(val) => setData({...data,firstName:val})}
						/>
						</View>
					</View>
					<View style={{flex:1}}>
						<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Last name</Text>
						<View style={{backgroundColor:'white', height:40, borderTopRightRadius:5,borderBottomRightRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}>
						<TextInput  
							style={styles.inputText}
							placeholder="Last name" 
							placeholderTextColor={ThemeColor.PlaceHolderColor}
							keyboardType='default'
							editable = {false}
							value= {data.lastName}
							onChangeText={(val) => setData({...data,lastName:val})}
						/>
						</View>
					</View>
				</View>
				<View style={{marginTop:12}}>
					<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Email</Text>
					<View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}>
						<TextInput  
						style={styles.inputText}
						placeholder="Email" 
						placeholderTextColor={ThemeColor.PlaceHolderColor}
						keyboardType='email-address'
						editable = {false}
						value= {data.email}
						onChangeText={(val) => setData({...data,email:val})}
						/>
					</View>
				</View>
				<View style={{marginTop:12}}>
					<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Phone number</Text>
					<View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}>
						<View style={{flexDirection: 'row',marginRight:8, paddingLeft:8, alignItems:'center', justifyContent: 'center'}}>
							{/* <Flag code="US" size={32}/> */}
							<Text style={{color:ThemeColor.TextColor, fontSize:16, fontFamily: FontName.Regular, marginRight:8, marginLeft:8}}>+{data.contactNumberCountryCode}</Text>
							<Icons name="caret-down" color={ThemeColor.LabelTextColor} size={20} />
						</View>
						<TextInput  
						style={styles.inputText}
						placeholder="Phone number" 
						maxLength={14}
						placeholderTextColor={ThemeColor.PlaceHolderColor}
						keyboardType='phone-pad'
						editable = {false}
						textContentType='telephoneNumber' 
						dataDetectorTypes='phoneNumber' 
						value= {data.contactNumber}
						onChangeText={(val) => setData({...data,contactNumber:val})}
						/>
					</View>
				</View>
				<View style={{marginTop:12}}>
					<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Priority</Text>
					<View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}>
						<Text style={[styles.labelText,{color:data.appPriority.length > 0 ? 'black' : ThemeColor.PlaceHolderColor}]}>{data.appPriority.length >0 ? data.appPriority : 'Priority'}</Text>
					</View>
				</View>
				<View style={{marginTop:12}}>
					<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Application type</Text>
					<View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}>
						<Text style={[styles.labelText,{color:data.appTypeName.length > 0 ? 'black' : ThemeColor.PlaceHolderColor}]}>{data.appTypeName.length >0 ? data.appTypeName : 'Application type'}</Text>
					</View>
				</View>
				<View style={{marginTop:12}}>
					<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Current employment status for</Text>
					<View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}>
						<Text style={[styles.labelText,{color:data.currentStatus.length > 0 ? 'black' : ThemeColor.PlaceHolderColor}]}>{data.currentStatus.length >0 ? data.currentStatus : 'Employment status'}</Text>
					</View>
				</View>
				<View style={{marginTop:12}}>
					<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Skill</Text>
					<View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}>
						<Text style={[styles.labelText,{color:data.skillCategory.length > 0 ? 'black' : ThemeColor.PlaceHolderColor}]}>{data.skillCategory.length >0 ? data.skillCategory : 'Skills'}</Text>
					</View>
				</View>
				<View style={{marginTop:12,marginBottom:24}}>
					<Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:8}}>Comments</Text>
					<View style={{backgroundColor:'white', height:100, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}>
					<TextInput  
						style={[styles.inputText,{height:90, textAlignVertical:'top'}]}
						multiline={true}
						placeholder="Not provided" 
						placeholderTextColor={ThemeColor.PlaceHolderColor}
						editable={false}
						keyboardType='default'
						value= {data.comments}
						onChangeText={(val) => setData({...data,comments:val})}
					/>
					</View>
				</View> 
			</KeyboardAwareScrollView> : 
			<View style={{flex: 1}}>
				<View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8, marginTop:16, justifyContent:'space-between', marginLeft:16,marginRight:16}}>
					<Text style ={{color:ThemeColor.TextColor, fontSize:16, fontFamily:FontName.Regular, paddingLeft:8}}>Application for</Text>
					<Text style ={{color:ThemeColor.NavColor, fontSize:16, fontFamily:FontName.Regular, paddingLeft:8}}>Self</Text>
				</View>
				<View style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8, marginTop:16, justifyContent:'space-between', marginLeft:16,marginRight:16}}>
					<Text style ={{color:ThemeColor.TextColor, fontSize:16, fontFamily:FontName.Regular, paddingLeft:8}}>Application Type</Text>
					<Text style ={{color:ThemeColor.NavColor, fontSize:16, fontFamily:FontName.Regular, paddingLeft:8}}>H1-B Extension</Text>
				</View>

				<FlatList style={{marginTop:16}}
					data={data.documentsList}
					keyExtractor={(item, index) => index.toString()}
					renderItem={({item,index}) => 
						<View style={{backgroundColor:'white', marginBottom:8, paddingBottom:8,paddingTop:8, marginLeft:16, marginRight:16,borderRadius:5, flexDirection:'row', justifyContent:'center'}}>
							<Text style ={{color:ThemeColor.TextColor, fontSize:14, fontFamily:FontName.Regular, paddingLeft:8, flex:1}}>{item.documentName}</Text>
							<Text style ={{color:ThemeColor.SubTextColor, fontSize:12, fontFamily:FontName.Regular, paddingLeft:8,width:90, paddingRight:8}}>Not uploaded</Text>
						</View>
					}
				/>
			</View>
		}
        
        <Loader isLoading={isLoading} />
      </SafeAreaView>
    );
}
export default ViewLCADetailsScreen;


const styles = StyleSheet.create({
    container: {
      flex: 1,
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
        height:40,
        backgroundColor:'#fff',
        alignItems:"center",
    
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
	  }
  });