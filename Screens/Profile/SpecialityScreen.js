import React ,{useEffect,useState} from "react";
import { StyleSheet, 
    Text,
    TouchableOpacity,
    SafeAreaView,
    View,
    Alert,
    FlatList} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'
import axios from 'axios'
import Icon from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import {getAuthHeader} from '../../_helpers/auth-header';
import { BaseUrl, EndPoints, StaticMessage, ThemeColor, FontName } from '../../_helpers/constants';
import {parseErrorMessage} from '../../_helpers/Utils';
import Loader from '../../Components/Loader';


const SpecialityScreen = ({route,navigation}) => {
    const [isLoading,setIsLoading] = React.useState(false);
    const [selectedTaxonomy,setSelectedTaxonomy] = React.useState([]);
    const [updated,setUpdated] = React.useState(false);
    const { profileDetail } = route.params;
    const { lookupData } = route.params;
    const { skillDetails } = route.params;
    const [lookupDataList, setLookupData] = useState({});

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
            skillDetails ? <TouchableOpacity style={{marginRight:16}} onPress={() => showDeleteAlert()}>
                <Icon name="trash-outline" color={'white'} size={20} />
            </TouchableOpacity> : null
            ),
            title:'Speciality'
        });
    }, [navigation]);
    const showDeleteAlert = () =>{
        Alert.alert(StaticMessage.AppName,'Are you sure want to delete?',
            [{
                text: 'Cancel',
            },
            {
                text: 'Delete',
                onPress: () => deleteProfileDetails()
            }]
        )
    }
  
    useEffect(() => {
        setSelectedTaxonomy(profileDetail.taxonomy);
        if(!lookupData){
            getUserLookups();
        }
        console.log(`Selected List: ${JSON.stringify(profileDetail.taxonomy)}`);
        
        
    },[])
    const  getUserLookups = async() => {
        let user = await AsyncStorage.getItem('loginDetails');  
        let parsed = JSON.parse(user);  
        let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
        var authToken = base64.encode(userAuthToken);
    
        setIsLoading(true);
        axios ({  
          "method": "GET",
          "url": BaseUrl + EndPoints.UserLookups,
          "headers": getAuthHeader(authToken)
        })
        .then((response) => {
          if (response.data.code == 200){
            setIsLoading(false);
            setLookupData(response.data.content.dataList[0]);
          }else if (response.data.code == 417){
            setIsLoading(false);
            console.log(Object.values(response.data.content.messageList));
            const errorList = Object.values(response.data.content.messageList);
            Alert.alert(StaticMessage.AppName, errorList.join(), [
              {text: 'Ok'}
            ]);
    
          }else{
            setIsLoading(false);
          }
        })
        .catch((error) => {
            setIsLoading(false);
            Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
              {text: 'Ok'}
            ]);
        })
      }

    const  updateProfileDetails = async() => {
        let user = await AsyncStorage.getItem('loginDetails');  
        let parsed = JSON.parse(user);  
        let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
        var authToken = base64.encode(userAuthToken);

        setIsLoading(true);
        console.log('selectedTaxonomy:',JSON.stringify(selectedTaxonomy));
        axios ({  
        "method": "PUT",
        "url": BaseUrl + EndPoints.UserProfile,
        "headers": getAuthHeader(authToken),
        data:{'taxonomy':selectedTaxonomy}
        })
        .then((response) => {
        if (response.data.code == 200){
            setIsLoading(false);
            navigation.goBack();
        }else if (response.data.code == 417){
            setIsLoading(false);
            const message = parseErrorMessage(response.data.content.messageList);
            Alert.alert(StaticMessage.AppName, message, [
            {text: 'Ok'}
            ]);

        }else{
            setIsLoading(false);
        }
        })
        .catch((error) => {
        setIsLoading(false);
        Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
            {text: 'Ok'}
        ]);

        })
    }
    const  deleteProfileDetails = async() => {
        let user = await AsyncStorage.getItem('loginDetails');  
        let parsed = JSON.parse(user);  
        let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
        var authToken = base64.encode(userAuthToken);
        console.log('candidateSkillId:',skillDetails.candidateSkillId);
        setIsLoading(true);
        axios ({  
        "method": "DELETE",
        "url": BaseUrl + EndPoints.UserProfile,
        "headers": getAuthHeader(authToken),
        data:{'candidateSkillId':skillDetails.candidateSkillId}
        })
        .then((response) => {
        if (response.data.code == 200){
            setIsLoading(false);
            navigation.goBack();
        }else if (response.data.code == 417){
            setIsLoading(false);
            const message = parseErrorMessage(response.data.content.messageList);
            Alert.alert(StaticMessage.AppName, message, [
            {text: 'Ok'}
            ]);
        }else{
            setIsLoading(false);
        }
        })
        .catch((error) => {
        setIsLoading(false);
        Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
            {text: 'Ok'}
        ]);

        })
    }
    const handleHeaderSelect = (item) => {
        console.log(`Header Item : ${JSON.stringify(item)}`);
        let tempArray = selectedTaxonomy;
        if(searchHeaderKey(item.keyId)){
            let index = indexOfHeader(item.keyId,tempArray);
            console.log('Item exit at :' + index);
            tempArray.splice(index, 1);

        }else{
            console.log("Item does't exit");
            tempArray.push(item);
        }
        setSelectedTaxonomy(tempArray);
        setUpdated(!updated);
    }
    const indexOfHeader = (keyID, listArray) => {
        return listArray.findIndex(obj => obj.keyId === keyID);
    }

    const handleItemSelect = (item,taxonomyList) => {
        selectedItem = taxonomyList.reduce((r, {keyName,keyId,child}) => {
            let o = child.filter(({keyName,keyId}) => keyId == item.keyId );
            if(o && o.length)
              r.push({keyName,keyId, child : [...o]});
            return r;
        },[]);
        let rootItemKey = selectedItem ? selectedItem[0].keyId : '';
        let mainArray = selectedTaxonomy.filter(e => e.keyId === rootItemKey);
            
        let tempArray = selectedTaxonomy;
        if(searchItemKey(item.keyId)){
            let selectedTaxoTempArr = selectedTaxonomy;
            let indexOfRoot = indexOfHeader(rootItemKey,selectedTaxoTempArr);
            const mainObjectToEdit = selectedTaxonomy[indexOfRoot];
            selectedTaxoTempArr.splice(indexOfRoot, 1);
            setSelectedTaxonomy(selectedTaxoTempArr);

            if(mainObjectToEdit.child.length > 1){
                let tempChildArray = mainObjectToEdit.child;
                let index  = indexOfHeader(item.keyId,mainObjectToEdit.child);
                tempChildArray.splice(index, 1);
                mainObjectToEdit.child = tempChildArray;
                tempArray.push(mainObjectToEdit);
            }
        }else{
            let selectedTaxoTempArr = selectedTaxonomy;

            let mainArray2 = selectedTaxonomy.filter(e => e.keyId === rootItemKey);
            if(mainArray2.length > 0){
                let indexOfRoot = indexOfHeader(rootItemKey,selectedTaxoTempArr);
                selectedTaxoTempArr.splice(indexOfRoot, 1);
                setSelectedTaxonomy(selectedTaxoTempArr);
    
                var tempChildArray = mainArray2[0].child;
                tempChildArray.push(item);
                mainArray2[0].child = tempChildArray;
                selectedTaxoTempArr.push(mainArray2[0]);
                setSelectedTaxonomy(selectedTaxoTempArr);
            }else{
                selectedTaxoTempArr.push(selectedItem[0]);
            }
            

        }
        setSelectedTaxonomy(tempArray);
        setUpdated(!updated);
    }
    const searchHeaderKey = (keyId) => {
        let tempTaxonomy = selectedTaxonomy;
        let result =  tempTaxonomy.find(data => data.keyId === keyId);
        // console.log('Srarch Result:  ' + JSON.stringify(result));
        if(result){
            return true;
        }
        return false;
    }; 
    const searchItemKey = (keyId) => {
        let tempTaxonomy = selectedTaxonomy;
        let result = tempTaxonomy.find(product => product.child.find(item => item.keyId === keyId));
        // console.log('Srarch Result: ' + JSON.stringify(result));
        if(result){
            return true;
        }
        return false;
    }; 
 
    
    let taxonomyList = lookupData ? lookupData.taxonomyList : lookupDataList ? lookupDataList.taxonomyList : []; 
    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                style={{}}
                data={taxonomyList}
                randomUpdateProp={updated}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({item}) => 
                    <View>
                        <TouchableOpacity style={{marginLeft:16, height:40,justifyContent:'space-between',alignItems:'center', flexDirection:'row', marginRight:16}} onPress={() => {handleHeaderSelect(item)}}>
                            <Text style={{fontFamily: FontName.Bold, fontSize:16, color:ThemeColor.TextColor,}}>{item.keyName}</Text>
                            {searchHeaderKey(item.keyId) ? <Feather name="check" color={ThemeColor.BtnColor} size={22,22} /> : null }
                        </TouchableOpacity>
                        <View style={{height:1, backgroundColor:ThemeColor.BorderColor, marginLeft:16}} />
                        <FlatList
                            style={{}}
                            data={item.child}
                            keyExtractor={(item, index) => index.toString()}
                            randomUpdateProp={updated}
                            renderItem={({item}) => 
                                <View>
                                    <TouchableOpacity style={{marginLeft:32, height:40,justifyContent:'space-between',alignItems:'center', flexDirection:'row', marginRight:16}} onPress={() => {handleItemSelect(item,taxonomyList)}}>
                                        <Text style={{fontFamily: FontName.Regular, fontSize:16, color:ThemeColor.TextColor,}}>{item.keyName}</Text>
                                        {searchItemKey(item.keyId) ? <Feather name="check" color={ThemeColor.BtnColor} size={22,22} /> : null }
                                    </TouchableOpacity>
                                    <View style={{height:1, backgroundColor:ThemeColor.BorderColor, marginLeft:32}} />
                                </View>
                            }
                        />
                    </View>
                }
            />
            <TouchableOpacity style={styles.btnFill} onPress={() => {updateProfileDetails()}}>
                <Text style={{color:'#53962E',fontFamily: FontName.Regular, fontSize:16, color:'#fff' }}>UPDATE</Text>
            </TouchableOpacity>
            <Loader isLoading={isLoading} />
        </SafeAreaView>
        );
    }

export default SpecialityScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:'#FFF',
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
    height:50,
    justifyContent:"center",
    backgroundColor: ThemeColor.BtnColor ,
    alignItems:'center',
    borderRadius:5,
    margin:16,marginBottom:8
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
  },footer: {
    position:'absolute',
    bottom:0,
    flex: 1,
    backgroundColor: ThemeColor.ViewBgColor,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingBottom:16,
    height:'80%',
    width:'100%', 
    borderColor:ThemeColor.ViewBgColor,
    borderWidth:1,
    alignItems:'center',
  },
  containerContent: {marginTop: 140, height:200},
  containerHeader: {
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    backgroundColor: 'green',
    marginTop:100
  },
  headerContent:{
    marginTop: 0,
  },

}); 