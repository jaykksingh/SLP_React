import 'react-native-gesture-handler';
import React ,{useEffect,useState}from 'react';
import { View ,
    useWindowDimensions,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Alert,
	FlatList,
    Image,
    Text} from 'react-native';
	
import Feather from 'react-native-vector-icons/Feather';
import Icon from 'react-native-vector-icons/Ionicons';
import FontAwesome from "react-native-vector-icons/FontAwesome";
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'
import axios from 'axios'
import moment from 'moment';

import { AuthContext } from '../../Components/context';
import {getAuthHeader} from '../../_helpers/auth-header';
import { BaseUrl, EndPoints, StaticMessage, ThemeColor, FontName } from '../../_helpers/constants';
import Loader from '../../Components/Loader';


const EOBProcessScreen = ({navigation})  => {
    const { signOut } = React.useContext(AuthContext);
    const { skipEOB } = React.useContext(AuthContext);

    const { loginDetail } = React.useContext(AuthContext);
    let [onboardingData, setonboardingData] = React.useState([]);
    let [isLoading, setIsLoading] = React.useState(false);
    let [stepsArray, setStepsArray] = React.useState([]);

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                 <TouchableOpacity style={{marginRight:16}} onPress={() => showLogOutAlert()}>
                   <Feather name="more-vertical" color={'white'} size={25,25} />
                </TouchableOpacity>
            ),
			title: 'Onboarding process',
        });
    }, [navigation]);
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
    const SessionExpiredAlert = () =>{
  
        Alert.alert(StaticMessage.AppName,StaticMessage.SessionExpired,
            [{
              text: 'Ok',
              onPress: () => signOut()
          }]
      ) 
  }

    useEffect(() => {
        navigation.addListener('focus', () => {
			getProfileDetails();
		});
        getProfileDetails();
    },[]);
    const  getProfileDetails = async() => {
		let user = await AsyncStorage.getItem('loginDetails');  
        let parsed = JSON.parse(user);  
        let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
        var encoded = base64.encode(userAuthToken);    

        setIsLoading(true);
        axios ({  
          "method": "GET",
          "url": BaseUrl + EndPoints.UserProfile,
          "headers": getAuthHeader(encoded)
        })
        .then((response) => {
            setIsLoading(false);
            if (response.data.code == 200){
                let employeeOnboarding = response.data.content.dataList[0].empDetails.employeeOnboarding;
                console.log("employeeOnboarding", JSON.stringify(employeeOnboarding));
                setonboardingData(employeeOnboarding);
                MergerStepArrWithDocumentArr(employeeOnboarding);
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
            setIsLoading(false);
			console.log(error)
            if(error.response.status == 401){
                SessionExpiredAlert();
            }else{
                Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
                    {text: 'Ok'}
                  ]);
            }
            console.log('Error:',error);    
        })
    }

    const MergerStepArrWithDocumentArr = (employeeOnboarding) => {
        var stagesArray =  employeeOnboarding.stages ? employeeOnboarding.stages : [];
        let attachmentsArray = employeeOnboarding.attachments ? employeeOnboarding.attachments : [];
        let step = 0;
        for (; step < stagesArray.length; step++) {
            let envelopeTypeId = stagesArray[step].envelopeTypeId;
            if(envelopeTypeId == 2121){
                break;
            }
        }
        step++;
        stagesArray.splice.apply(stagesArray, [step, 0].concat(attachmentsArray));
        // console.log('Merged Ayyay: ' + JSON.stringify(stagesArray));
        setStepsArray(stagesArray);
    }

	
    
    const handleSkipBtn = () => {
        navigation.navigate('Basic details',{profileDetail: onboardingData})
    }
	const isPathAvailable = (item) =>{
        if(item.path){
            if(item.path.length > 0){
                return true;
            }else{
                return false;
            }
        }
        return false;
    }
    const isAttachmentPathAvailable = (item) =>{
        if(item.docPath){
            if(item.docPath.length > 0){
                return true;
            }else{
                return false;
            }
        }
        return false;
    }
    const isAttachmentsType = (item) =>{
        if(item.isMandatory){
            return true;
        }
        return false;
    }
	const isStepsType = (item) =>{
        if(item.status){
            return true;
        }
        return false;
    }

    const handleReviewAndSingh = (item) =>{
        console.log(item);
        let step = item.step;
        let envelopeTypeId = item.envelopeTypeId;
        if(step === 0){
            navigation.navigate('OfferLatter');
        }else if (envelopeTypeId === 2123 ){
            navigation.navigate('EOBBenefits',{comeFrom:'',stepDetail:item});
        }else{
            console.log('EOBDocumentScreen');
            navigation.navigate('EOBDocumentScreen',{comeFrom:'',stepDetail:item});
        }    
    }
    const handleUploadDocument = (item) =>{
        console.log('stepDetail:',item);

        console.log(item);
        let step = item.step;
        let envelopeTypeId = item.envelopeTypeId;
        if(step === 0){
            navigation.navigate('OfferLatter');
        }else if(item.docId == 1073){
            navigation.navigate('CovidVaccination',{comeFrom:'',stepDetail:item});
        }else if (envelopeTypeId === 2123 ){

        }else{
            console.log('EOBAttachmentScreen');
            navigation.navigate('EOBAttachmentScreen',{comeFrom:'',stepDetail:item});
        }    
    }
    const handleViewClick = (item) => {
        console.log('Steps:', item);
        navigation.navigate('EOBViewAttachment',{stepDetail:item})
    }
    const handleDelete = async (item) => {
        console.log('Delete:', item);
        Alert.alert(StaticMessage.AppName,'Are you sure want to delete?',
            [{
              text: 'Yes',
              onPress: () => deleteDocumentCall(item)
            },{
                text: 'No',
            }]
      ) 
        

    }
    const deleteDocumentCall = async (item) => {
        console.log('Delete:', item);

        let user = await AsyncStorage.getItem('loginDetails');  
        let parsed = JSON.parse(user);  
        let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
        var encoded = base64.encode(userAuthToken);    

        setIsLoading(true);
        axios ({  
          "method": "DELETE",
          "url": BaseUrl + EndPoints.EOBAttachment,
          "headers": getAuthHeader(encoded),
          data:{'dmsId':'' + item.dmsId}
        })
        .then((response) => {
            setIsLoading(false);
            if (response.data.code == 200){
                getProfileDetails();
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
            setIsLoading(false);
			console.log(error)
            if(error.response.status == 401){
                SessionExpiredAlert();
            }else{
                Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
                    {text: 'Ok'}
                  ]);
            }
            console.log('Error:',error);    
        })

    }



	// let stagesArray =  onboardingData.stages ? onboardingData.stages : [];
	// let attachmentsArray = onboardingData.attachments ? onboardingData.attachments : [];
	// let setpsArray = [...stagesArray,...attachmentsArray];
    const getFormatedDate=(item) =>{
		let momentStartDate = moment(item.expiryDate, 'YYYY-MM-DD');
		let startDateString = moment(momentStartDate).format('MMM DD, yyyy')
		return `${startDateString}`;
	}
    return (
        <SafeAreaView style={styles.container}>
			<FlatList
				data={stepsArray}
				keyExtractor={(item, index) => index.toString()}
				renderItem={({item}) =>
					<View style={{ backgroundColor:'#fff',paddingLeft:16,paddingRight:16}}>
						<View style={{ height:50, flexDirection:'row', alignItems: 'center', justifyContent: 'space-between'}}>
                            <View style={{ flexDirection:'row', alignItems: 'center',width:'50%'}}>
                                {item.isComplete === 1 || isAttachmentPathAvailable(item) ?
                                    <Image style={{width:20,height:20}} source={require('../../assets/Images/icon_circular_check_blue.png')} />
                                    :<Image style={{width:20,height:20}} source={require('../../assets/Images/icon_circular_check_gray.png')} />
                                }
                                <Text style={{color:ThemeColor.TextColor, fontSize:14, fontFamily: FontName.Regular, marginLeft:8, flex:1}}>{item.title ? item.title : item.docName}</Text>
                            </View>
                            <View style={{ flexDirection:'row', alignItems: 'center'}}>
                                
                                {isStepsType(item) && 
                                <View style={{flexDirection:'row',}}>
                                    {item.isComplete === 1 && <Text style={{color:ThemeColor.SubTextColor, fontSize:14, fontFamily: FontName.Regular, marginLeft:8}}>{item.status}</Text>}
                                    {item.isComplete !== 1 && !isAttachmentsType(item) &&
                                        <TouchableOpacity onPress={() => {handleReviewAndSingh(item)}}>
                                            <Text style={{color:ThemeColor.BtnColor, fontSize:14, fontFamily: FontName.Regular, marginLeft:8}}>{'REVIEW & SIGN'}</Text>
                                        </TouchableOpacity>                            
                                    }
                                </View> 
                                }
                                {isPathAvailable(item) &&
                                <TouchableOpacity style={{paddingRight:0}} onPress= {() => {handleViewClick(item)}}>
                                    <Text style={{color:ThemeColor.BtnColor, fontSize:14, fontFamily: FontName.Regular, marginLeft:8}}>VIEW</Text>
                                </TouchableOpacity>
                                }
                                {isAttachmentsType(item) && 
                                    <View style={{ flexDirection:'row', justifyContent:'flex-end'}}>
                                        {isAttachmentPathAvailable(item) ? 
                                        <View style={{flexDirection:'row', alignItems:'center'}}>
                                            {item.expiryDate.length > 0 &&
                                                <Text style={{color:ThemeColor.SubTextColor, fontSize:14, fontFamily: FontName.Regular, marginLeft:4, marginRight:8}}>{getFormatedDate(item)}</Text>
                                            }
                                            {
                                                item.MetaDetails && item.MetaDetails.Dose1Date.length > 0 ?
                                                <View style={{justifyContent:'center', alignItems:'center'}}>
                                                    <Text style={{color:ThemeColor.SubTextColor, fontSize:14, fontFamily: FontName.Regular, marginLeft:4, marginRight:8}}>{item.MetaDetails.Dose2Date.length > 0 ? item.MetaDetails.Dose2Date : item.MetaDetails.Dose1Date}</Text>
                                                    <Text style={{color:ThemeColor.SubTextColor, fontSize:12, fontFamily: FontName.Regular, marginLeft:4, marginRight:8}}>Vaccination date</Text>
                                                </View>
                                                : null
                                            }
                                            <TouchableOpacity style={{height:40,justifyContent:'center', alignItems:'center'}} onPress= {() => {handleViewClick(item)}}>
                                                <Text style={{color:ThemeColor.BtnColor, fontSize:14, fontFamily: FontName.Regular}}>{'VIEW'}</Text>
                                            </TouchableOpacity> 
                                            <TouchableOpacity style ={{width:30,alignItems: 'flex-end', justifyContent: 'center'}} onPress={ () => {handleDelete(item)}}> 
                                                <Icon name="trash-outline" color={'gray'} size={20} />
                                            </TouchableOpacity>
                                        </View> : 
                                        <TouchableOpacity style ={{alignContent: 'center', alignItems: 'center'}}onPress = {() => {handleUploadDocument(item)}}>
                                            <FontAwesome name="cloud-upload" color={ThemeColor.BtnColor} size={25} />
                                        </TouchableOpacity>
                                    } 
                                    </View> 
                                }
                                
                            </View>
						</View>
						<View style={{height:1, backgroundColor:ThemeColor.BorderColor}} />
					</View>  
				}  

			/>
			<View style={{flexDirection:'row', marginLeft:0, marginRight:0,marginTop:8, marginBottom:8}}>
				<TouchableOpacity style={[styles.btnFill,{backgroundColor:'white'}]} onPress={() => {skipEOB()}}>
					<Text style={{color:'#53962E',fontFamily: FontName.Regular, fontSize:14, color:ThemeColor.BtnColor }}>DO IT LATER</Text>
				</TouchableOpacity>
				<TouchableOpacity style={[styles.btnFill]} onPress={() => {navigation.navigate('EOBHowDoIScreen')}}>
					<Text style={{color:'#53962E',fontFamily: FontName.Regular, fontSize:14, color:'#fff' }}>NEXT</Text>
				</TouchableOpacity>
			</View>
            <Loader isLoading={isLoading} /> 
        
    	</SafeAreaView>
		
    );
  };

export default EOBProcessScreen;


const styles = StyleSheet.create({
    container: {
		flex: 1,
	  },
    tabBar: {
      flexDirection: 'row',
      paddingTop: 0,
      backgroundColor:'#F6F6F6',
    },
    tabItem: {
      flex: 1,
      alignItems: 'center',
      padding: 16,
      fontSize: 10
    },btnFill:{
		flex: 1,
		height:50,
		justifyContent:"center",
		backgroundColor: ThemeColor.BtnColor ,
		alignItems:'center',
	  }
  });

    