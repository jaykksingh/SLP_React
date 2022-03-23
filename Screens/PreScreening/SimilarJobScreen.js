import React , { createRef ,useEffect} from "react";
import { View,
    Text,
    StyleSheet,
    Alert,
    TouchableOpacity,
    FlatList,
    SafeAreaView} from "react-native";
    import AsyncStorage from '@react-native-async-storage/async-storage';
    import base64 from 'react-native-base64'
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import MovableView from 'react-native-movable-view';
import { getAuthHeader} from '../../_helpers/auth-header';
import Loader from '../../Components/Loader';
import { BaseUrl, BaseURLElastic, StaticMessage, ThemeColor , FontName} from '../../_helpers/constants';


const SimilarJobScreen = ({route,navigation}) => {
    const { clientPrimaryKey } = route.params;
    const [data,setData] = React.useState({
		updated:false,
	});
    let [isLoading, setLoading] = React.useState(false);
    let [jobsList, setJobsList] = React.useState([]);

    let companyNameArray = [{
        keyId : "1",
        keyName : "Compunnel Inc."
    },
    {
        keyId : "2",
        keyName : "Infopro Learning, Inc."
    },
    {
        keyId : "3",
        keyName : "Compunnel Healthcare"
    },
    {
        keyId : "4",
        keyName : "JobleticsPro"
    },
    {
        keyId : "5",
        keyName : "Compunnel India"
    },
    {
        keyId : "6",
        keyName : "Compunnel Canada"
    },
    {
        keyId : "7",
        keyName : "LMG Healthcare"
    },
    {
        keyId : "8",
        keyName : "Willhire Inc"
    }
    ]
    
    useEffect(() => {
        getSimilarJobs();
       
    }, []);
    const setIsLoggedInUser = async() => {
        let user = await AsyncStorage.getItem('loginDetails');  
        setIsLoggedIn(user ? true : false);
    }

   
    React.useLayoutEffect(() => {
        navigation.setOptions({
            title : 'Similar jobs'
        });
    }, [navigation]);
    

    
    const showActionSheet = () => {
        this.ActionSheet.show();
    }

    
    
    const getSimilarJobs = () => {

        setLoading(true);
             
        axios ({
            method: "POST",
            url: `${BaseURLElastic}job/similar/${clientPrimaryKey}`,
            headers: {
                'sdSecKey':'sda43WfR797sWQE',
                'Content-Type':'application/x-www-form-urlencoded'
            },
            data:{}
        }).then((response) => {
            console.log('JOB Similar:' + JSON.stringify(response.data));
            setLoading(false);
            if (response.data.statusCode == 200){
                setJobsList(response.data.data.job);
            }else if (response.data.statusCode == 417){
                setLoading(false);
                Alert.alert(StaticMessage.AppName, response.data.description, [
                    {text: 'Ok'}
                ]);
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

   
    
    const getJobDetails = async (jobID,isJobApply) => {
        setLoading(true);

        let user = await AsyncStorage.getItem('loginDetails');  
        var token  = "U3RhZmZMaW5lQDIwMTc=";
        if(user){
            let parsed = JSON.parse(user);  
            let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
            token = base64.encode(userAuthToken);
        }
        console.log(BaseUrl + "jobs/" + ''+jobID + token);
        axios ({
          "method": "GET",
          "url": BaseUrl + "jobs/" + ''+jobID,
          "headers": getAuthHeader(token),
        })
        .then((response) => {
            setLoading(false);
          if (response.data.code == 200){
            navigation.navigate("Job Details", {jobDetail: response.data.content.dataList[0]});
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
  
    const getJobAttributes = (item) => {
        let assignmentType = item.assignmentType;
        let payRate = item.package.value + ' ' + item.package.type;
        let experience = item.experience > 0 ? ~~item.experience + ' Years' : '';

        var jobAttribute = assignmentType;
        if (experience.length > 0) {
            if (jobAttribute.length > 0) {
                jobAttribute = `${jobAttribute} | ${experience}`;
            }
        }
        return jobAttribute;
    }
    const getCompanyOwnerName = (jobOwnerName) =>{
        let result = companyNameArray.filter(company => {
            return company.keyId === jobOwnerName;
        });
        if(result.length > 0){
            return result[0].keyName;
        }else{
            return 'Compunnel Software Group Inc.'
        }
    }
 
   
    return (
        <SafeAreaView style={{flex: 1}}>
        <View style={styles.container}>
                    
            {jobsList.length > 0 ?
            <FlatList style={{}}
                data={jobsList}
                keyExtractor={(item, index) => item.key}
                renderItem={({item}) => 
                <View>
                    <TouchableOpacity onPress={() => {getJobDetails(item.clientPrimaryKey)}}>

                        <View style={{ margin_bottom:4, backgroundColor:'#fff', paddingLeft:16, paddingRight:16, paddingTop:8, paddingBottom:8}}>
                            <Text style={{flex: 1, fontFamily: FontName.Regular, fontSize:16,color:ThemeColor.NavColor, marginBottom:4}}>{item.title}</Text>
                            <Text style={{fontFamily: FontName.Regular, fontSize:14, color:ThemeColor.TextColor, marginBottom:4}}>{getCompanyOwnerName(item.jobOwnerName)}</Text>
                            <Text style={{fontFamily: FontName.Regular, fontSize:14, color:ThemeColor.TextColor, marginBottom:4}}>{getJobAttributes(item)}</Text>
                        </View>
                        <View style={{flex: 1,height:1, backgroundColor:ThemeColor.BorderColor}}/>
                        <View style={styles.bottomView}>
                            <View style={{flex: 1,flexDirection: 'row',alignItems: 'center'}}>
                                <Icon name="location-outline" color={ThemeColor.SubTextColor} size={20} />
                                <Text style={{color: ThemeColor.SubTextColor, fontSize:14, fontFamily: FontName.Regular, marginLeft:4}}>{item.cityState}</Text>
                            </View>
                            <View style={{flexDirection: 'row',alignItems: 'center' }}>
                                <Icon name="ios-calendar-sharp" color={ThemeColor.SubTextColor} size={20} />
                                <Text style={{color: ThemeColor.SubTextColor, fontSize:14, fontFamily: FontName.Regular, marginLeft:4}}>{item.lastUpdated}</Text>
                            </View>
                            
                        </View>
                    </TouchableOpacity>
                    <View style={{height:12, backgroundColor:ThemeColor.BorderColor}} />
                </View>
                }
            /> : 
            !isLoading ?
            <View style={{flex:1, padding:16,justifyContent:'center'}}>
                <Text style={{color: ThemeColor.SubTextColor, fontSize:14, fontFamily: FontName.Regular, marginLeft:4, textAlign:'center'}}>No similar jobs found</Text>
            </View> : null 
            }
        </View>
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

export default SimilarJobScreen;

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