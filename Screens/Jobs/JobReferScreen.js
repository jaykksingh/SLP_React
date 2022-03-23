import React,{useEffect} from "react";
import { StatusBar, 
    SafeAreaView, 
    View,
    Text,
    StyleSheet,
    Image,
    TextInput,
    TouchableOpacity,
    Alert
} from "react-native";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'
import axios from 'axios';
import MovableView from 'react-native-movable-view';
import Icon from "react-native-vector-icons/Ionicons";
import {parseErrorMessage} from '../../_helpers/Utils';
import { BaseUrl, EndPoints, StaticMessage, ThemeColor, FontName } from '../../_helpers/constants';
import { getAuthHeader} from '../../_helpers/auth-header';
import Loader from '../../Components/Loader';

const JobReferScreen = ({route,navigation}) => {

    const [data,setData] = React.useState({
        email:'',
        name:'',
        comment:'',
    });
    let [isLoading, setLoading] = React.useState(false);
    let [relationIDs, setRelation] = React.useState(0);
    let [howMuchFit, setHowMuchFit] = React.useState(0);
    const { jobDetails } = route.params;

    useEffect(() => {
       
    }, []);
    const handleEmailId = (val) => {
        checkAlreadyRefered();
    }

    const handleSubmit = async () => {
        setLoading(true);
        let message1 = "Your referral will receive an invitation to apply within the next few minutes. Please encourage them to apply soon as the opportunity may not last."
        let message2 = "Remember: You can earn unlimited referral rewards for successful hires."

        let user = await AsyncStorage.getItem('loginDetails');  
        let parsed = JSON.parse(user);  
        let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
        var encoded = base64.encode(userAuthToken);

        let params = {
            "jobId":jobDetails.cjmJobId,
            "candidateName":data.name,
            "candidateEmail":data.email,
            "candidateRelation":relationIDs,
            "candidateRequirement":howMuchFit,
            "referrerComments":data.comment
        }
        axios ({
          "method": "POST",
          "url": BaseUrl + EndPoints.ReferJob,
          "headers": getAuthHeader(encoded),
          data:params
        })
        .then((response) => {
            setLoading(false);
            if (response.data.code == 200){
                  Alert.alert(StaticMessage.AppName,`${message1} \n\n ${message2}`,
                    [{
                        text: 'Ok',
                        onPress: () => navigation.goBack()
                    },{
                        text: 'View similar jobs',
                        onPress: () => handleSimilarJobs()
                    }])

            }else if (response.data.code == 417){
                setLoading(false);
                const message = parseErrorMessage(response.data.content.messageList);
                Alert.alert(StaticMessage.AppName, message, [
                {text: 'Ok'}
                ]);

            }else{
        
            }
        })
        .catch((error) => {
            setLoading(false);
            Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
                {text: 'Ok'}
            ]);
        })
    }
    const handleSimilarJobs = () => {
		navigation.goBack();
		if(route.params.onClickEvent){
			route.params.onClickEvent(jobDetails.cjmJobId);
		}
	}
    const checkAlreadyRefered = async () => {
        setLoading(true);
        let user = await AsyncStorage.getItem('loginDetails');  
        let parsed = JSON.parse(user);  
        let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
        var encoded = base64.encode(userAuthToken);
        let params = {
            "jobId":jobDetails.cjmJobId,
            "email":data.email,
        }
        axios ({
          "method": "POST",
          "url": BaseUrl + EndPoints.CheckJobAlreadyRefer,
          "headers": getAuthHeader(encoded),
          data:params
        })
        .then((response) => {
            setLoading(false);
            if (response.data.code == 200){
                console.log(`Check Result: ${JSON.stringify(response.data.content.dataList[0])}`)  
                let userDetails =  response.data.content.dataList[0] ? response.data.content.dataList[0] : {};
                let name = userDetails ? userDetails.name : '';
                setData({...data,name:name});
                let isApplied = userDetails ? userDetails.applied : false;
                let isReffered = userDetails ? userDetails.reffered : false;
                
                let message = isApplied ? "Candidate has already applied for this job" : "Candidate is already referred for this job" ;
                if(isApplied || isReffered){
                    Alert.alert(StaticMessage.AppName, message, [
                        {
                          text: 'Ok',
                          onPress: () => {
                            setData({...data, name:'', email:''});
                        },
                        }
                    ]);
                }
                

            }else if (response.data.code == 417){
                setLoading(false);
                const message = parseErrorMessage(response.data.content.messageList);
                Alert.alert(StaticMessage.AppName, message, [
                {text: 'Ok'}
                ]);

            }else{
        
            }
        })
        .catch((error) => {
            setLoading(false);
            Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
                {text: 'Ok'}
            ]);
        })
    }

    return(
        <SafeAreaView style={{flex:1,flex_direction:'column', backgroundColor:'#F6F6F6'}}>
        <KeyboardAwareScrollView style={{flex: 1, paddingTop:16, marginBottom:0}}>
            <View style={[styles.inputView]}>
                <Text style={{color:ThemeColor.TextColor, fontSize:14, fontFamily: FontName.Regular, marginBottom:4, paddingLeft:16}}>Enter email address of your friend</Text>
                <TextInput  
                    style={styles.inputText}
                    placeholder="Email address" 
					placeholderTextColor={ThemeColor.PlaceHolderColor}
                    keyboardType='email-address'
                    value = {data.email}
                    onChangeText={(val) => {setData({...data, email:val})}}
                    onEndEditing={(e)=>handleEmailId(e.nativeEvent.text)}

                />
            </View>
            <View style={[styles.inputView]}>
                <Text style={{color:ThemeColor.TextColor, fontSize:14, fontFamily: FontName.Regular, marginBottom:4, paddingLeft:16}}>Enter name</Text>
                <TextInput  
                    style={styles.inputText}
                    placeholder="Enter name" 
					placeholderTextColor={ThemeColor.PlaceHolderColor}
                    keyboardType= 'default'
                    value = {data.name}
                    onChangeText={(val) => {setData({...data, name:val})}}
                />
            </View>
            <Text style={{color:ThemeColor.TextColor, fontSize:14, fontFamily: FontName.Regular, marginBottom:4, paddingLeft:16, marginTop:16}}>Which of these describes your relationship with the candidate</Text>
            <View style={{backgroundColor:'#fff', marginTop:16}}>
                <TouchableOpacity style={{height:40,flexDirection: "row", alignSelf: 'flex-start', alignItems: 'center'}} onPress={() => setRelation(1)}>
                    {relationIDs == 1 ? <Image style={styles.radioImage} source={require('../../assets/Images/radion_select.png')} /> :
                    <Image style={styles.radioImage} source={require('../../assets/Images/radion_unselect.png')} />} 
                    <Text style={{flex: 1,color:ThemeColor.TextColor,fontFamily:FontName.Regular, fontSize:14,marginLeft:8}}>They reported to me within the last 2 years</Text>
                </TouchableOpacity>
                <View style={{backgroundColor:ThemeColor.BorderColor, height:1,marginLeft:16}}></View>
                <TouchableOpacity style={{height:40,flexDirection: "row", alignSelf: 'flex-start', alignItems: 'center'}} onPress={() => setRelation(2)}>
                    {relationIDs == 2 ? <Image style={styles.radioImage} source={require('../../assets/Images/radion_select.png')} /> :
                    <Image style={styles.radioImage} source={require('../../assets/Images/radion_unselect.png')} />} 
                    <Text style={{flex: 1,color:ThemeColor.TextColor,fontFamily:FontName.Regular, fontSize:14,marginLeft:8}}>They reported to me more than 2 years ago</Text>
                </TouchableOpacity>
                <View style={{backgroundColor:ThemeColor.BorderColor, height:1,marginLeft:16}}></View>
                <TouchableOpacity style={{height:40,flexDirection: "row", alignSelf: 'flex-start', alignItems: 'center'}} onPress={() => setRelation(3)}>
                    {relationIDs == 3 ? <Image style={styles.radioImage} source={require('../../assets/Images/radion_select.png')} /> :
                    <Image style={styles.radioImage} source={require('../../assets/Images/radion_unselect.png')} />} 
                    <Text style={{flex: 1,color:ThemeColor.TextColor,fontFamily:FontName.Regular, fontSize:14,marginLeft:8}}>Current colleague of mine during the last two years</Text>
                </TouchableOpacity>
                <View style={{backgroundColor:ThemeColor.BorderColor, height:1,marginLeft:16}}></View>
                <TouchableOpacity style={{height:40,flexDirection: "row", alignSelf: 'flex-start', alignItems: 'center'}} onPress={() => setRelation(4)}>
                    {relationIDs == 4 ? <Image style={styles.radioImage} source={require('../../assets/Images/radion_select.png')} /> :
                    <Image style={styles.radioImage} source={require('../../assets/Images/radion_unselect.png')} />} 
                    <Text style={{flex: 1,color:ThemeColor.TextColor,fontFamily:FontName.Regular, fontSize:14,marginLeft:8}}>A previous colleague of mine from over 2 years ago</Text>
                </TouchableOpacity>
                <View style={{backgroundColor:ThemeColor.BorderColor, height:1,marginLeft:16}}></View>
                <TouchableOpacity style={{height:40,flexDirection: "row", alignSelf: 'flex-start', alignItems: 'center'}} onPress={() => setRelation(5)}>
                    {relationIDs == 5 ? <Image style={styles.radioImage} source={require('../../assets/Images/radion_select.png')} /> :
                    <Image style={styles.radioImage} source={require('../../assets/Images/radion_unselect.png')} />} 
                    <Text style={{flex: 1,color:ThemeColor.TextColor,fontFamily:FontName.Regular, fontSize:14,marginLeft:8}}>Other</Text>
                </TouchableOpacity>
                <View style={{backgroundColor:ThemeColor.BorderColor, height:1,marginLeft:0}}></View>
            </View>
            <View>
                <Text style={{color:ThemeColor.TextColor, fontSize:14, fontFamily: FontName.Regular, marginBottom:4, paddingLeft:16, marginTop:16}}>Does this candidate meet 100% of the job requirements?</Text>
                <View style={{backgroundColor:'#fff', marginTop:16, flexDirection:'row', paddingTop:16, paddingBottom:16}}>
                    <View style={{backgroundColor:ThemeColor.BtnColor, width:'92%', height:2,marginLeft:16,position: 'absolute', top:26.5}}></View>

                    <TouchableOpacity activeOpacity={1} style={{flex:1, justifyContent: 'center', alignItems: 'center'}} onPress={() => setHowMuchFit(1)}> 
                        {howMuchFit == 1 ? <Image style={styles.radioRequiremt} source={require('../../assets/Images/radion_select.png')} /> 
                        : <Image style={styles.radioRequiremt} source={require('../../assets/Images/radion_unselect.png')} /> }
                        <Text style={{color:ThemeColor.TextColor, fontSize:12, fontFamily: FontName.Regular, marginTop:4}}>75%</Text>
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={1} style={{flex:1, justifyContent: 'center', alignItems: 'center'}} onPress={() => setHowMuchFit(2)}> 
                        {howMuchFit == 2 ? <Image style={styles.radioRequiremt} source={require('../../assets/Images/radion_select.png')} /> 
                        : <Image style={styles.radioRequiremt} source={require('../../assets/Images/radion_unselect.png')} /> }
                        <Text style={{color:ThemeColor.TextColor, fontSize:12, fontFamily: FontName.Regular, marginTop:4}}>85%</Text>

                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={1} style={{flex:1, justifyContent: 'center', alignItems: 'center'}} onPress={() => setHowMuchFit(3)}> 
                        {howMuchFit == 3 ? <Image style={styles.radioRequiremt} source={require('../../assets/Images/radion_select.png')} /> 
                        : <Image style={styles.radioRequiremt} source={require('../../assets/Images/radion_unselect.png')} /> }
                        <Text style={{color:ThemeColor.TextColor, fontSize:12, fontFamily: FontName.Regular, marginTop:4}}>90%</Text>
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={1} style={{flex:1, justifyContent: 'center', alignItems: 'center'}} onPress={() => setHowMuchFit(4)}> 
                        {howMuchFit == 4 ? <Image style={styles.radioRequiremt} source={require('../../assets/Images/radion_select.png')} /> 
                        : <Image style={styles.radioRequiremt} source={require('../../assets/Images/radion_unselect.png')} /> }
                        <Text style={{color:ThemeColor.TextColor, fontSize:12, fontFamily: FontName.Regular, marginTop:4}}>100%</Text> 
                    </TouchableOpacity>
                </View>
            </View>
            <View style={{}}>
                <Text style={{color:ThemeColor.TextColor, fontSize:14, fontFamily: FontName.Regular, marginBottom:4, paddingLeft:16, marginTop:16}}>Add comments</Text>
                <View style={{marginBottom:32,
                        borderRadius:5,
                        borderWidth:1,
                        borderColor:ThemeColor.BorderColor,
                        color:ThemeColor.TextColor,
                        marginLeft:16,
                        marginRight:16,
                        backgroundColor:'#FFFFFF',
                    }}>
                    <TextInput  
                        style={{ paddingLeft:8,
                            marginTop:8,
                            height:70,
                            
                            fontSize:14,
                            fontFamily:FontName.Regular,
                            alignContent:'stretch',
                            textAlignVertical:'top',
                        }}
                        multiline
                        placeholder="Enter comment" 
                        maxLength={250}
                        placeholderTextColor={ThemeColor.PlaceHolderColor}
                        keyboardType='default'
                        value = {data.comment}
                        onChangeText={(val) => {setData({...data, comment:val})}}

                    />
                    <Text style={{color:ThemeColor.TextColor, fontSize:14, fontFamily: FontName.Regular, marginBottom:4,textAlign:'right', marginRight:8}}>{250-data.comment.length }</Text>
                </View>
                
            </View>

        </KeyboardAwareScrollView>
        <TouchableOpacity style={styles.submitBtn} onPress={() => {handleSubmit()}}>
            <Text style={{color:'#53962E',fontFamily: FontName.Regular, fontSize:16, color:'#fff' }}>SUBMIT</Text>
        </TouchableOpacity>
        <Loader isLoading={isLoading} />
        <MovableView>
            <TouchableOpacity style={{
                position: 'absolute',
                margin: 16,
                right: 0,
                bottom: 0,
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

export default JobReferScreen;

const styles = StyleSheet.create({
    container: {    
      flex: 1,
      justifyContent: 'center',
    },inputView:{
        flex: 1,
        marginTop:8,
        justifyContent:"center",
    },inputText:{
        paddingLeft:16,
        height:40,
        color:ThemeColor.TextColor,
        fontSize:14,
        fontFamily:FontName.Regular,
        alignContent:'stretch',
        backgroundColor:'#FFFFFF',
      },radioImage: {
        width: 16,
        height: 16,
        marginLeft:16,
        tintColor:ThemeColor.BtnColor
      },radioRequiremt: {
        width: 24,
        height: 24,
        tintColor:ThemeColor.BtnColor,
        backgroundColor:'#fff'
      },submitBtn:{
        marginTop:32,
        width:"90%",
        borderRadius:5,
        height:40,
        margin:16,
        justifyContent:"center",
        backgroundColor:'#53962E',
        borderWidth:1,
        alignItems:'center',
        borderColor:'#53962E',
    
      },
});