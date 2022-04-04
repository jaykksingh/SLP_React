import React , { createRef ,useEffect,useCallback,useRef} from "react";
import { ScrollView, 
    View,
    Text,
    StyleSheet,
    Alert,
    SectionList,
    TouchableOpacity,
    FlatList,
    SafeAreaView,
    Image,
    Platform,
    Dimensions
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'

import Icon from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import ActionSheet from 'react-native-actionsheet'
import axios from 'axios';
import MovableView from 'react-native-movable-view';
import {default as ActionSheetView} from 'react-native-actions-sheet';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { BaseUrl, BaseURLElastic, EndPoints, StaticMessage, ThemeColor, FontName } from '../../_helpers/constants';
import { getAuthHeader} from '../../_helpers/auth-header';
import Loader from '../../Components/Loader';

const jobFilterRef = createRef();
const savedAlertRef = createRef();


const JobSearchResult = ({route,navigation}) => {
    const { searchKey } = route.params;
    const { location } = route.params;
    const [filtersArray, setfiltersArray] = React.useState('');
    const [isModalVisible, setModalVisible] = React.useState(false);
    const [refineSearchArr, setRefineSearchArr] = React.useState([]);
    const [selectedJobCat, setSelectedJobCat] = React.useState([]);
    const [selectedEmployment, setSelectedEmployment] = React.useState([]);
    const [selectedLocation, setSelectedLocation]  = React.useState(location);
    const [selectedCompany, setSelectedCompany] = React.useState([]);
    const [minExperience, setMinExperience]  = React.useState(0);
    const [maxExperience, setMaxExperience]  = React.useState(25);
    const [selectedWorkAuthorization, setSelectedWorkAuthorization]  = React.useState([]);
    const [selectedIndustry, setSelectedIndustry]  = React.useState([]);
    const [activeJobID, setActiveJobID]  = React.useState('');
    const [isLoggedIn, setIsLoggedIn] =  React.useState(false);
    const [alertUpdated, setAlertUpdated] = React.useState(false);
    const [data,setData] = React.useState({
		updated:false,
	});
    const actionsheetSort = useRef();
    const [companyNameArray,setCompanyNameArray] = React.useState([{
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
    ])

    let [isLoading, setLoading] = React.useState(false);
    let [jobsList, setJobsList] = React.useState('');
    let [jobDetails, setJobDetails] = React.useState('');
    const [filterObject, setFilterObject] = React.useState({
        _sortBy:'date',
        _sortOrder:'desc',
        _keywords:"", 
        _location:"", 
    });
    const [multiSliderValue, setMultiSliderValue] = React.useState([0, 25]);    
    useEffect(() => {
        setIsLoggedInUser();
        setSelectedLocation(location);
        setFilterObject({...filterObject,_keywords: searchKey,_location:location});
        getAllJobs(searchKey,location,selectedEmployment,selectedJobCat,selectedCompany,filterObject._sortBy,filterObject._sortOrder);
        
        getSavedJobFilter();

    }, []);
    const setIsLoggedInUser = async() => {
        let user = await AsyncStorage.getItem('loginDetails');  
        setIsLoggedIn(user ? true : false);
    }

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                 <TouchableOpacity style={{marginRight:16}} onPress={() => {jobFilterRef.current?.setModalVisible()}}>
                    <Image style={{ width: 25,height: 25,tintColor:'white'}} source={require('../../assets/Images/icon_filter.png')} /> 
                </TouchableOpacity>
            ),
            title : "Jobs"
        });
    }, [navigation]);
    const getNavTitle = () => {
        // const { searchKey } = route.params;
        // const { location } = route.params;
        if(searchKey.length > 0 && location.length > 0){
            return `${searchKey} jobs in ${location}`
        }else if(searchKey.length > 0){
            return `${searchKey} jobs`;
        }else if(location.length > 0){
            return `All jobs in ${location}`
        }else{
            return 'All jobs'
        }
    
    }

    let swipeBtns = [{
        text: 'APPLY',
        backgroundColor: ThemeColor.NavColor,
        underlayColor: '#fff',
        onPress: () => { getJobDetails(activeJobID, true) }
      }];
    const showActionSheet = () => {
        console.log('Sort Actionsheet')
        actionsheetSort.current.show();
    }

    
    
    const getAllJobs = async (searchKey,location,employmentType,jobsCategory,companies,_sortBy,_sortOrder) => {

        setLoading(true);
        let filterDict = {  
            "_limit":100,
            "_page":1,
            "keywords":searchKey, 
            "location":location, 
            "radius":200, 
            "assignmentType":employmentType, 
            "domain":jobsCategory, 
            "experience":multiSliderValue,
            "workAuthorization":selectedWorkAuthorization, 
            "industry":selectedIndustry,
            "jobOwnerName":companies,
            "searchType":"Any",
            "_sortBy":_sortBy,
            "_sortOrder":_sortOrder,
        };  
        console.log('PArams: ' + JSON.stringify(filterDict));      
        axios ({
            method: "POST",
            url: `${BaseURLElastic}job`,
            headers: {
                'sdSecKey':'sda43WfR797sWQE',
                'Content-Type':'application/x-www-form-urlencoded'
            },
            data:filterDict
        }).then((response) => {
            setLoading(false);
            if (response.data.statusCode == 200){
                setJobsList(response.data.data);
                setRefineSearchArray(response.data.data);
            }else if (response.data.statusCode == 417){
                setLoading(false);
                Alert.alert(StaticMessage.AppName, response.data.description, [
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

    const setRefineSearchArray = (jobsData) => {
        console.log('Refine Search:' + JSON.stringify(jobsData.countStats));
        let countStats = jobsData.countStats; 
        var tempSearchArr = [];
        if(countStats.jobOwner) {
            let domains = {
                name: 'Company name',
                isExpended: 1,
                data:countStats.jobOwner
            }
            tempSearchArr.push(domains);
        }
        if(countStats.domain) {
            let domains = {
                name: 'Job category',
                isExpended: 1,
                data:countStats.domain
            }
            tempSearchArr.push(domains);
        }
        if(countStats.assignmentType) {
            let domains = {
                name: 'Employment type',
                isExpended: 1,
                data:countStats.assignmentType
            }
            tempSearchArr.push(domains);
        }
        if(countStats.location) {
            let domains = {
                name: 'Location',
                isExpended: 1,
                data:countStats.location
            }
            tempSearchArr.push(domains);
        }
        
        // if(countStats.experience) {
        //     let domains = {
        //         name: 'Experience',
        //         isExpended: 1,
        //         data:countStats.experience
        //     }
        //     tempSearchArr.push(domains);
        // }
        // if(countStats.experience) {
        //     let domains = {
        //         name: 'Experience range',
        //         isExpended: 1,
        //         data:[{min:0,max:25}]
        //     }
        //     tempSearchArr.push(domains);
        // }
        setRefineSearchArr(tempSearchArr);
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
        console.log('URL:',jobID.length > 0 ? jobID : activeJobID);
    
        axios ({
          "method": "GET",
          "url": BaseUrl + "jobs/" + ''+jobID,
          "headers": getAuthHeader(token),
        })
        .then((response) => {
            setLoading(false);
          if (response.data.code == 200){
            setJobDetails(response.data.content.dataList[0]);
            if(isJobApply){
                navigation.navigate('Job apply',{jobDetails: response.data.content.dataList[0]})
            }else{
                navigation.navigate("JobDetails", {jobDetail: response.data.content.dataList[0]});
            }
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
            setLoading(false);
            Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
                {text: 'Ok'}
            ]);
        })
    }
    const getSavedJobFilter = async() => {
        let user = await AsyncStorage.getItem('loginDetails');  
        if(user){
            let parsed = JSON.parse(user);  
            let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
            var authToken = base64.encode(userAuthToken);

            setData({...data,isLoading: true});
        
            console.log('URL:',BaseUrl + EndPoints.JobStatistics);
        
            axios ({
            "method": "POST",
            "url": BaseUrl + EndPoints.JobStatistics,
            "headers": getAuthHeader(authToken),
            data:{"type":"jobs"}
            })
            .then((response) => {
                setData({...data,isLoading: false});
                if (response.data.code == 200){
                    setfiltersArray(response.data.content.dataList[0].jobAlerts);
                    setAlertUpdated(!alertUpdated);
                }else if (response.data.code == 417){
                    setData({...data,isLoading: false});
                    const errorList = Object.values(response.data.content.messageList);
                    Alert.alert(StaticMessage.AppName, errorList.join(), [
                    {text: 'Ok'}
                    ]);
                }
            })
            .catch((error) => {
                setData({...data, isJobCountLoading: false});
                if(error.response.status == 401){
                    SessionExpiredAlert();
                }else{
                    Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
                        {text: 'Ok'}
                        ]);
                }
            
            })
        }
        
    }
    const getJobAttributes = (item) => {
        let assignmentType = item.assignmentType;
        let payRate = item.package.value + ' ' + item.package.type;
        let experience = item.experience > 0 ? ~~item.experience + ' Years' : '';

        var jobAttribute = assignmentType;
        // if (payRate.length > 0) {
        //     if (jobAttribute.length > 0) {
        //         jobAttribute = `${jobAttribute} | ${payRate}`;
        //     }
        // }
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
       
    const arrayHasIndex = (array, itemName) => {
        let index = array.indexOf(itemName);
        if(index != -1) {
            return true;
        }
        return false;
    };
    
    const handleJobCategory = (itemName) => {
        var tempArr = selectedJobCat
        if(arrayHasIndex(selectedJobCat,itemName)){
            let index = selectedJobCat.indexOf(itemName);
            if(index != -1) {
                tempArr.splice(index, 1); // remove 1 element from index 
             }
        }else{
            tempArr.push(itemName);
        }
        setSelectedJobCat(tempArr);
        setData({...data,updated:!data.updated});
        jobFilterRef.current?.setModalVisible();
        getAllJobs(filterObject._keywords,selectedLocation,selectedEmployment,tempArr,selectedCompany,filterObject._sortBy,filterObject._sortOrder);

    }
    const handleEmploymentType = (itemName) => {
        var tempArr = selectedEmployment
        if(arrayHasIndex(tempArr,itemName)){
            let index = tempArr.indexOf(itemName);
            if(index != -1) {
                tempArr.splice(index, 1); // remove 1 element from index 
             }
        }else{
            tempArr.push(itemName);
        }
        setSelectedEmployment(tempArr);
        setData({...data,updated:!data.updated});
        jobFilterRef.current?.setModalVisible();
        getAllJobs(filterObject._keywords,selectedLocation,tempArr,selectedJobCat,selectedCompany,filterObject._sortBy,filterObject._sortOrder);

    }
    const handleLocation = (itemName) => {
        if(selectedLocation == itemName){
            setSelectedLocation('');
        }else{
            setSelectedLocation(itemName);
        }
        console.log(itemName);
        setData({...data,updated:!data.updated});
        jobFilterRef.current?.setModalVisible();
        getAllJobs(filterObject._keywords,itemName,selectedEmployment,selectedJobCat,selectedCompany,filterObject._sortBy,filterObject._sortOrder);

    }
    const handleCompany = (itemName) => {
        var tempArr = selectedCompany
        if(arrayHasIndex(tempArr,itemName)){
            let index = tempArr.indexOf(itemName);
            if(index != -1) {
                tempArr.splice(index, 1); // remove 1 element from index 
             }
        }else{
            tempArr.push(itemName);
        }
        setSelectedCompany(tempArr);
        setData({...data,updated:!data.updated});
        jobFilterRef.current?.setModalVisible();
        getAllJobs(filterObject._keywords,selectedLocation,selectedEmployment,selectedJobCat,tempArr,filterObject._sortBy,filterObject._sortOrder);

    }
    const handleResetFilter = () => {
        setSelectedJobCat([]);
        setSelectedEmployment([]);
        setSelectedLocation('');
        setSelectedCompany([]);
        setData({...data,updated:!data.updated});
        jobFilterRef.current?.setModalVisible();
        getAllJobs(filterObject._keywords,'',[],[],[],filterObject._sortBy,filterObject._sortOrder);

    }
    const handleViewAllJobs = () => {
        setSelectedJobCat([]);
        setSelectedEmployment([]);
        setSelectedLocation('');
        setSelectedCompany([]);
        setData({...data,updated:!data.updated});
        setFilterObject({...filterObject,_keywords:''});
        getAllJobs('','',[],[],[],filterObject._sortBy,filterObject._sortOrder);
    }
    const setActiveJobsID = (item) => {
        console.log(item.clientPrimaryKey);
        setActiveJobID(item.clientPrimaryKey);
    }
    const handleSortBy = (index) => {
        // options={['Relevence', 'Posting date: Ascending', 'Posting date: Descending','Cancel']}
        var sortby = "relevancy";
        var sortOrder = "asc";
        if(index == 0){
            sortby = "relevancy";
        }else if(index == 1){
            sortby = "date";
        }else if(index == 2){
            sortby = "date";
            sortOrder = "desc";
        }
        // const [filterObject, setFilterObject] = React.useState({
        //     _sortBy:'date',
        //     _sortOrder:'desc',
        //     keywords:"", 
        //     location:"", 
        // });
        setFilterObject({...filterObject, _sortBy:sortby,_sortOrder:sortOrder});
        getAllJobs(searchKey,selectedLocation,selectedEmployment,selectedJobCat,selectedCompany,sortby,sortOrder);
    }
    const getSortByText = () => {
        if(filterObject._sortBy == "relevancy"){
            return 'Relevence'
        }else if(filterObject.sortOrder == "asc"){
            return "Posting date: Ascending";
        }else{
            return 'Posting date: Descending';
        }
    }
    const onChange = (min, max) => {
        console.log('min: ', min)
        console.log('max: ', max)
        setMinExperience(min);
        setMaxExperience(max);
        getAllJobs(searchKey,selectedLocation,selectedEmployment,selectedJobCat,selectedCompany,filterObject._sortBy,filterObject._sortOrder);
    }
   
    const handleDeleteSavedAlert = (item) => {
        console.log(`jobSearchAlertId : ${item.jobSearchAlertId}`);
        Alert.alert(StaticMessage.AppName,'Are sure want to delete?',
        [{
              text: 'Cancel',
        },
        {
            text: 'Delete alert',
            onPress: () => deleteJobalert(item.jobSearchAlertId)
        }]
      )
    }
    
    const deleteJobalert = async(jobSearchAlertId) => {
        let user = await AsyncStorage.getItem('loginDetails');  
        let parsed = JSON.parse(user);  
        let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
        var authToken = base64.encode(userAuthToken);
        setLoading(true);
        axios ({  
          "method": "DELETE",
          "url": `${BaseUrl}${EndPoints.JobAlert}/${jobSearchAlertId}`,
          "headers": getAuthHeader(authToken),
        })
        .then((response) => {
          if (response.data.code == 200){
            setLoading(false);
            console.log(`Response: ${JSON.stringify(response.data.content.messageList)}`)
            getSavedJobFilter();
        }else if (response.data.code == 417){
            setLoading(false);
            const message = parseErrorMessage(response.data.content.messageList);
            Alert.alert(StaticMessage.AppName, message, [
              {text: 'Ok'}
            ]);
          }else{
            setIsLoading(false);
          }
        })
        .catch((error) => {
            setLoading(false);
          Alert.alert(StaticMessage.AppName, StaticMessage.UnknownErrorMsg, [
            {text: 'Ok'}
          ]);
    
        })
    }
    // if (strSearchLocation.length > 0 && strKeyword.length > 0) {
    //     lblNoJobsFound.text = [NSString stringWithFormat:@"No jobs found for \"%@\" in %@.\nPlease try with a different keyword or location.",strKeyword,strSearchLocation];
    // }else if (strKeyword.length > 0){
    //     lblNoJobsFound.text = [NSString stringWithFormat:@"No jobs found for \"%@\". \nPlease try with a different keyword or location.",strKeyword];
    // }else if(strSearchLocation.length > 0){
    //     lblNoJobsFound.text = [NSString stringWithFormat:@"No jobs found in %@.\nPlease try with a different keyword or location.",strSearchLocation];
    // }else{
    //     lblNoJobsFound.text = [NSString stringWithFormat:@"No jobs found.\nPlease try with a different keyword or location."];

    // }
    const getNoJobsFoundMessage = () => {
        if(filterObject._keywords.length > 0 && selectedLocation.length > 0){
            return `No jobs found for ${filterObject._keywords} in ${selectedLocation}. Please try with a diffrent keyword or location`;
        }else if(filterObject._keywords.length > 0){
            return `No jobs found for ${filterObject._keywords}. Please try with a diffrent keyword or location`;
        }else if(selectedLocation.length > 0){
            return `No jobs found in ${selectedLocation}. Please try with a diffrent keyword or location`;
        }else{
            return `No jobs found. Please try with a diffrent keyword or location`;
        }
    }
    const handleValueChange = useCallback((low, high) => {
        // setLow(low);
        // setHigh(high);
        console.log(low, high);
    }, []);
    const multiSliderValuesChange = (values) => {
        console.log(values);
        setMultiSliderValue(values);
    }
    return (
        <SafeAreaView style={{flex: 1}}>
        <View style={styles.container}>
                    
            {jobsList && jobsList.job.length > 0 ?
            <>
            <View style={styles.inputView}>
                <Text style={{color:'gray', fontSize:14, fontFamily: FontName.Regular}}> Sort by</Text>
                <TouchableOpacity style={{flex:1}} onPress={() => {showActionSheet()}}>
                    <Text style={{color: ThemeColor.BtnColor, fontSize:14, fontFamily: FontName.Regular, marginLeft:8}}>{getSortByText()}</Text>
                    <ActionSheet
                        ref={actionsheetSort}
                        title={'Sort by'}
                        options={['Relevence', 'Posting date: Ascending', 'Posting date: Descending','Cancel']}
                        cancelButtonIndex={3}
                        onPress={(index) => { handleSortBy(index)}}
                    />
                </TouchableOpacity> 
                {isLoggedIn ? 
                <TouchableOpacity onPress={() => {savedAlertRef.current?.setModalVisible()}}>
                    <Feather name="filter" color={'black'} size={20} />
                </TouchableOpacity> : null }
            </View>    
            <FlatList style={{}}
                data={jobsList.job}
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
            /> 
            </>: 
            !isLoading ?
            <View style={{flex:1, padding:16,justifyContent:'center'}}>
                <Text style={{color: ThemeColor.SubTextColor, fontSize:14, fontFamily: FontName.Regular, marginLeft:4, textAlign:'center'}}>{getNoJobsFoundMessage()}</Text>
                <TouchableOpacity style={{borderColor:ThemeColor.BtnColor, borderWidth:1, borderRadius:5, padding:8, width:170, alignSelf:'center', marginTop:16}} onPress={() => {handleViewAllJobs()}}>
                    <Text style={{color: ThemeColor.BtnColor, fontSize:14, fontFamily: FontName.Regular, marginLeft:4, textAlign:'center'}}>VIEW ALL JOBS</Text>
                </TouchableOpacity>
            </View> : null 
            }
        </View>
        <Loader isLoading={isLoading} />

        <ActionSheetView ref={jobFilterRef} containerStyle={{backgroundColor:ThemeColor.ViewBgColor}}>
          <View style={{height:"90%"}}>
            <View style={{height:60, flexDirection:'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft:16,paddingRight:16}}>
              <TouchableOpacity onPress={() => {jobFilterRef.current?.setModalVisible()}}>
                <Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Done</Text>
              </TouchableOpacity>
              <Text style={{color:ThemeColor.TextColor, fontSize:16, fontFamily: FontName.Bold}}>Filter results</Text>
              <TouchableOpacity onPress={() => {handleResetFilter()}}>
                <Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>RESET ALL</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={{backgroundColor:'#fff'}}>
                <SectionList style={{marginBottom:0}}
                    sections={refineSearchArr}
                    randomUpdateProp={data.updated}
                    keyExtractor={(item, index) => item + index}
                    renderSectionHeader={({ section: { name },index }) => (
                        <View style={{}}>
                            <View style={{marginLeft:8,marginRight:16}}>
                                <Text style={{fontSize:16, color:'black',fontFamily: FontName.Bold, paddingLeft:8,height:40,paddingTop: 10}}>{name == 'Company name' ? 'Company' : name}</Text>
                                <View style={{height:1, backgroundColor:ThemeColor.BorderColor, marginLeft:8}} />
                            </View> 
                        </View>
                    )}
                    renderItem={({ item , index,section}) => 
                        <View style={{marginLeft:16, marginRight:16,}}>
                            {section.name == "Job category" && 
                            <TouchableOpacity  style={{ backgroundColor:'#fff',justifyContent: 'center', flexDirection:'row', marginRight:8,alignItems: 'center', height:30}} onPress={() =>{handleJobCategory(item.name)}}>
                                <Icon name= {arrayHasIndex(selectedJobCat,item.name) ? "checkbox-outline":"square-outline"} color={ThemeColor.BtnColor} size={20,20} />
                                <Text style={{marginLeft:8, fontFamily: FontName.Regular, fontSize:14, color:ThemeColor.TextColor, flex:1}}>{item.name}  [{item.count}]</Text>
                            </TouchableOpacity>    
                            }
                            {section.name == "Employment type" && 
                            <TouchableOpacity  style={{ backgroundColor:'#fff',justifyContent: 'center', flexDirection:'row', marginRight:8,alignItems: 'center', height:30}} onPress={() => {handleEmploymentType(item.name)}}>
                                <Icon name= {arrayHasIndex(selectedEmployment,item.name) ? "checkbox-outline":"square-outline"} color={ThemeColor.BtnColor} size={20,20} />
                                <Text style={{marginLeft:8, fontFamily: FontName.Regular, fontSize:14, color:ThemeColor.TextColor, flex:1}}>{item.name}  [{item.count}]</Text>
                            </TouchableOpacity>    
                            }  
                            {section.name == "Location" && 
                            <TouchableOpacity  style={{ backgroundColor:'#fff',justifyContent: 'center', flexDirection:'row', marginRight:8,alignItems: 'center', height:30}} onPress={() =>{handleLocation(item.name)}}>
                                <Icon name= {selectedLocation == item.name ? "radio-button-on" : "radio-button-off"} color={ThemeColor.BtnColor} size={20,20} />
                                <Text style={{marginLeft:8, fontFamily: FontName.Regular, fontSize:14, color:ThemeColor.TextColor, flex:1}}>{item.name}  [{item.count}]</Text>
                            </TouchableOpacity>    
                            }    
                            {section.name == "Company name" && 
                            <TouchableOpacity  style={{ backgroundColor:'#fff',justifyContent: 'center', flexDirection:'row', marginRight:8,alignItems: 'center', height:30}} onPress={() =>{handleCompany(item.name)}}>
                                <Icon name= {arrayHasIndex(selectedCompany,item.name) ? "checkbox-outline":"square-outline"} color={ThemeColor.BtnColor} size={20,20} />
                                <Text style={{marginLeft:8, fontFamily: FontName.Regular, fontSize:14, color:ThemeColor.TextColor, flex:1}}>{getCompanyOwnerName(item.name)}  [{item.count}]</Text>
                            </TouchableOpacity>    
                            }   
                            {section.name == "Experience" && 
                            <TouchableOpacity  style={{ backgroundColor:'#fff',justifyContent: 'center', flexDirection:'row', marginRight:8,alignItems: 'center', height:30}} >
                                {/* <Icon name="square-outline" color={ThemeColor.BtnColor} size={20,20} /> */}
                                <Text style={{marginLeft:8, fontFamily: FontName.Regular, fontSize:16, color:ThemeColor.TextColor, flex:1}}>{item.name}  [{item.count}]</Text>
                            </TouchableOpacity>    
                            }  
                            {section.name == "Experience range" && 
                            <View style={{marginTop:16, marginBottom:16}}>
                                <View style={{flexDirection:'row', justifyContent:'space-between', flex:1}}>
                                    <Text style={{marginLeft:8, fontFamily: FontName.Bold, fontSize:16, color:ThemeColor.TextColor, flex:1}}>{multiSliderValue[0]}</Text>
                                    <Text style={{marginLeft:8, fontFamily: FontName.Bold, fontSize:16, color:ThemeColor.TextColor}}>{multiSliderValue[1]}</Text>

                                </View>                                
                                <MultiSlider
                                    values={[multiSliderValue[0], multiSliderValue[1]]}
                                    sliderLength={Dimensions.get("window").width-32}
                                    onValuesChange={multiSliderValuesChange}
                                    min={0}
                                    max={25}
                                    step={1}
                                    allowOverlap
                                    snapped
                                />
                            </View>
                            
                            }      
                               
                        </View>
                    }
                />
            </ScrollView>            
          </View>
        </ActionSheetView>
        <ActionSheetView ref={savedAlertRef} containerStyle={{backgroundColor:ThemeColor.ViewBgColor}}>
          <View style={{height:"90%"}}>
            <View style={{height:60, flexDirection:'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft:16,paddingRight:16}}>
              <TouchableOpacity onPress={() => {savedAlertRef.current?.setModalVisible()}}>
                <Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}></Text>
              </TouchableOpacity>
              <Text style={{color:ThemeColor.TextColor, fontSize:16, fontFamily: FontName.Bold}}>Saved job alerts</Text>
              <TouchableOpacity onPress={() => {savedAlertRef.current?.setModalVisible()}}>
                <Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Done</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={{backgroundColor:'#fff', paddingLeft:16, paddingRight:16}}>
                <FlatList style={{}}
                    data={filtersArray}
                    keyExtractor={(item, index) => index.toString()}
                    randomUpdateProp={alertUpdated}
                    renderItem={({item}) => 
                    <View>
                        <View style={{flex: 1,flexDirection:'row', height:40, margin_bottom:4,alignItems: 'center'}}>
                        <Text style={{flex: 1, fontFamily: FontName.Regular, fontSize:14}}>{item.searchName}</Text>
                        <Text style={{fontFamily: FontName.Bold, fontSize:16, color:ThemeColor.BtnColor, marginRight:4}}>0</Text>
                        <Text style={{fontFamily: FontName.Regular, fontSize:14, width:30, color:ThemeColor.HelpingTextColor}}>Jobs</Text>
                        <TouchableOpacity style ={{width:40,alignItems: 'flex-end', justifyContent: 'center'}} onPress={() => {handleDeleteSavedAlert(item)}}> 
                            <Icon name="trash-outline" color={'gray'} size={20} />
                        </TouchableOpacity>
                        </View>
                        <View style={{flex: 1,height:1, backgroundColor:ThemeColor.BorderColor}}/> 
                    </View>
                    }
                />
            </ScrollView>            
          </View>
        </ActionSheetView>
        {isLoggedIn ?
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
        </MovableView> : null }
        </SafeAreaView>
    );
}

export default JobSearchResult;

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