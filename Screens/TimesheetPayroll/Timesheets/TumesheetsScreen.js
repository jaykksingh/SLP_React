import React ,{createRef, useRef}from 'react';
import { TouchableOpacity,
    StyleSheet,
    Alert} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import ActionSheet from 'react-native-actionsheet'
import MovableView from 'react-native-movable-view';
import Icon from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import { StaticMessage,ThemeColor } from '../../../_helpers/constants';
import { TimesheetContext } from '../../../Components/context';


import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import PendingTimesheetScreen from './PendingTimesheetScreen';
import SubmittedTimesheetScreen from './SubmittedTimesheetScreen';
import ApprovedTimesheetScreen from './ApprovedTimesheetScreen';

const Tab = createMaterialTopTabNavigator();
const projectRef = createRef();

const TumesheetsScreen = ({route, navigation})  => {
  const initialProjectState = {
    projectDetail: null,
  };
  const [timesheetsArray, setTimesheetArray] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const actionSheetDoc = useRef();

  React.useEffect(() => {
    let timesheets = JSON.parse(global.PendingTimesheetArray);  
    console.log('Timesheets: ',timesheets);
    setTimesheetArray(timesheets);
  },[]);
  
  const timesheetReducer = (prevState, action) => {
    switch( action.type ) {
      case 'SELECT_PROJECT': 
        return {
          ...prevState,
          projectDetail: action.project,
      };
    }
  };
  const [projectState, dispatch] = React.useReducer(timesheetReducer, initialProjectState);
  const timesheetContext = React.useMemo(() => ({
    selectProject: async(projectDetail) => {
      dispatch({ type: 'SELECT_PROJECT', project: projectDetail });
    }
    
  }), []);

	React.useLayoutEffect(() => {
		navigation.setOptions({
			headerRight: () => (
				<TouchableOpacity style={{marginRight:16}} onPress={() => showActionSheet()}>
				  <Feather name="more-vertical" color={'white'} size={25} />
          <ActionSheet
              ref={actionSheetDoc}
              options={['Enter hours','Timesheet workflow', 'Cancel']}
              cancelButtonIndex={2}
              onPress={(index) => { handleDocActionsheet(index) }}
          />
				</TouchableOpacity>
			),
		});
	}, [navigation]);
  

  const selectedProjectEvent = (projectDetail) => {
    console.log(`Parent function called ${JSON.stringify(projectDetail)}`);
    if(isPendingTimesheetAvailable(timesheetsArray)){
      if(projectDetail.hoursDetail.length > 0){
        navigation.navigate('EditTimesheet',{timesheetDetails:projectDetail.hoursDetail[0],projectDetail:projectDetail});
      }else{
        let message = "At this moment, there are no timecards pending for this project";
        Alert.alert(StaticMessage.AppName, message, [
          {text: 'Ok'}
        ]);
      }
    }else{
      let message = "At this moment, there are no timecards pending for submission";
      Alert.alert(StaticMessage.AppName, message, [
        {text: 'Ok'}
      ]);
    }
  
  }
  const isPendingTimesheetAvailable = (timesheetsArray) => {
    for (let i = 0; i < timesheetsArray.length; i++) {
      for(let j= 0 ; j < timesheetsArray[i].hoursDetail.length ; j++){
        let hoursDetail = timesheetsArray[i].hoursDetail[j];
        let momentStartDate = moment(hoursDetail.startDate, 'YYYY-MM-DD');
        let momentEndDate = moment(hoursDetail.endDate, 'YYYY-MM-DD');
        let startDateString = moment(momentStartDate).format('MMM DD, YYYY')
        let endDateString = moment(momentEndDate).format('MMM DD, YYYY')
        let todayDate =  new Date();
        if(momentEndDate <= todayDate){
          return true;
        }
      }
    }
    return false;
  }
  const handleDocActionsheet = (index) => {
    if(index == 1){
      navigation.navigate("TsWorkFlow")
    }else if(index == 0){
      let message = "At this moment, there are no timecards pending for submission";
      if(isPendingTimesheetAvailable(timesheetsArray)){
        navigation.navigate('SelectProject',{timesheetsArray:timesheetsArray,onClickEvent:selectedProjectEvent});
      }else{
        Alert.alert(StaticMessage.AppName, message, [
          {text: 'Ok'}
        ]);
      }
    }
  }

  const showActionSheet = () => {
    actionSheetDoc.current.show();
  }
  
  
  
	return(
    <TimesheetContext.Provider value={timesheetContext}>

		<Tab.Navigator
		  tabBarOptions={{
        labelStyle: { fontSize: 14, tintColor:ThemeColor.BtnColor, textTransform:'capitalize' },
        activeTintColor: ThemeColor.BtnColor,
        inactiveTintColor:ThemeColor.TextColor,
        indicatorStyle:{backgroundColor: ThemeColor.BtnColor},
        tabStyle: {  },
        style: { tintColor:ThemeColor.BtnColor},
		  }}
		>
			<Tab.Screen name="Pending" component={PendingTimesheetScreen} /> 
			<Tab.Screen name="Submitted" component={SubmittedTimesheetScreen}  />
			<Tab.Screen name="Approved" component={ApprovedTimesheetScreen} />
		</Tab.Navigator>
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
    </TimesheetContext.Provider>
	);
}

export default TumesheetsScreen;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:'#E5E9EB' 
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
        width:'100%',
        margin: 16,
        height:50,
        justifyContent:"center",
        backgroundColor:'#fff' ,
        alignItems:'center',
        borderRadius:5,
      }
  });
