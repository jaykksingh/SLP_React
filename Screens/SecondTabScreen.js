import 'react-native-gesture-handler';
import React from 'react';
import {Text, View ,StyleSheet,TouchableOpacity ,Image,Alert} from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';
import FeatherIcons from 'react-native-vector-icons/Feather';
import { ThemeColor ,StaticMessage} from '../_helpers/constants';
import { AuthContext } from '../Components/context';
// import { BlurView } from "@react-native-community/blur";

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import DashboardScreen from './Dashboard/DashboardScreen'
import JobMatchingScreen from './MatchingJob/JobMatchingScreen';
import JobSearchScreen from './Jobs/JobSearchScreen';
import MyApplicationScreen from './MyApplications/MyApplicationScreen';
import MoreScreen from './More/MoreScreen';
import MyProfileScreen from './Profile/MyProfileScreen';
import JobsHomeScreen from './Jobs/JobsHomeScreen';
import JobSearchResult from './Jobs/JobSearchResult';
import JobDetailScreen from './Jobs/JobDetailScreen';
import JobReferScreen from './Jobs/JobReferScreen';
import JobApplyScreen from './Jobs/JobApplyScreen';
import PreScreeningScreen from './PreScreening/PreScreeningScreen'
import SimilarJobScreen from './PreScreening/SimilarJobScreen';
import ChangePasswordScreen from './ChangePassword/ChangePasswordScreen';
import AlertSettingScreen from './Settings/AlertSettingScreen';
import PrivacyAndTermsScreen from './LoginSignup/PrivacyAndTermsScreen';
import HelpAndSupportScreen from './HelpAndSupport/HelpAndSupportScreen';
import CallSupportScreen from './HelpAndSupport/CallSupportScreen';
import EmailSupportScreen from './HelpAndSupport/EmailSupportScreen';
import ReportBugScreen from './HelpAndSupport/ReportBugScreen';
import ChatBotScreen from './ChatBot/ChatBotScreen';
import ResourceHomeScreen from './ResourceScreen/ResourceHomeScreen';
import InterviewTipsScreen from './ResourceScreen/InterviewTipsScreen';
import FormsAndPolicyScreen from './ResourceScreen/FormsAndPolicyScreen';
import NewsScreen from './ResourceScreen/NewsScreen';
import HolidayScheduleScreen from './ResourceScreen/HolidayScheduleScreen';
import HrHomeScreen from './HRScreen/HrHomeScreen';
import HrBenefitScreen from './HRScreen/HrBenefitScreen';
import ImmigrationHomeScreen from './Immigration/ImmigrationHomeScreen';
import ImmigrationDeskScreen from './Immigration/ImmigrationDeskScreen';
import LegalFilingsScreen from './Immigration/LegalFilingsScreen';
import NewLCAScreen from './Immigration/NewLCAScreen';
import ViewLCADetailsScreen from './Immigration/ViewLCADetailsScreen';
import LegalDocumentScreen from './Immigration/LegalDocumentScreen';
import LCAScreen from './Immigration/LCAScreen';
import ChooseLcaTypeScreen from './Immigration/ChooseLcaTypeScreen';
import NewLcaDocumentScreen from './Immigration/NewLcaDocumentScreen';
import AddLCADetailsScreen from './Immigration/AddLCADetailsScreen';
import ProjectHomeScreen from './ProjectScreen/ProjectHomeScreen';
import TimesheetPayrollHomeScreen from './TimesheetPayroll/TimesheetPayrollHomeScreen';
import PayrollInformationScreen from './TimesheetPayroll/PayrollInformationScreen';
import PayrollCalenderScreen from './TimesheetPayroll/PayrollCalenderScreen';
import ExpenceScreen from './TimesheetPayroll/ExpenceScreen';
import AddExpenceScreen from './TimesheetPayroll/AddExpenceScreen';
import RequestTimeoffScreen from './TimesheetPayroll/RequestTimeoffScreen';
import AddTimeoffRequestScreen from './TimesheetPayroll/AddTimeoffRequestScreen';
import PaymentStatusSCreen from './TimesheetPayroll/PaymentStatusSCreen';
import DocumentViewerScreen from './DocumentViewer/DocumentViewerScreen';
import TumesheetsScreen from './TimesheetPayroll/Timesheets/TumesheetsScreen';
import ViewTimesheetScreen from './TimesheetPayroll/Timesheets/ViewTimesheetScreen';
import TimesheetWorkflowScreen from './TimesheetPayroll/Timesheets/TimesheetWorkflowScreen';
import EditTimesheetScreen from './TimesheetPayroll/Timesheets/EditTimesheetScreen';
import CheckInOutTimesheetScreen from './TimesheetPayroll/Timesheets/CheckInOutTimesheetScreen';
import CheckInOutScreen from './TimesheetPayroll/Timesheets/CheckInOutScreen';
import SelectProjectScreen from './TimesheetPayroll/Timesheets/SelectProjectScreen';
import TimesheetFrequencyScreen from './TimesheetPayroll/Timesheets/TimesheetFrequencyScreen';
import InterviewScreen from './InterviewScreen/InterviewScreen';
import ReferralsAndInviteScreen from './ReferralsAndInvite/ReferralsAndInviteScreen';
import ReferFriendScreen  from './ReferralsAndInvite/ReferFriendScreen';
import ReferContactScreen from './ReferralsAndInvite/ReferContactScreen';
import InviteFriendScreen from './ReferralsAndInvite/InviteFriendScreen';
import EmailInviteScreen from './ReferralsAndInvite/EmailInviteScreen';
import ReferClientScreen from './ReferralsAndInvite/ReferClientScreen';
import ActivityHomeScreen from './ReferralsAndInvite/ActivityScreens/ActivityHomeScreen';
import PayPalAccountScreen from './ReferralsAndInvite/PayPalAccountScreen';
import MessageHomeScreen from './Messaging/MessageHomeScreen';
import ConversassionScreen from './Messaging/ConversassionScreen';
import ChatScreen from './Messaging/ChatScreen';
import ChatAttachmentScreen from './Messaging/ChatAttachmentScreen';
import CreateMessageScreen from './Messaging/CreateMessageScreen';


const DashboardStack  = createStackNavigator();
const TimesheetStack  = createStackNavigator();
const MessageStack  = createStackNavigator();
const ReferInviteStack  = createStackNavigator();
const JobMatchingStack  = createStackNavigator();
const JobSearchStack  = createStackNavigator();
const MyApplicationStack  = createStackNavigator();
const MoreStack  = createStackNavigator();

const Tab = createBottomTabNavigator();

const SecondTabScreen = () => {
	const tabBarListeners = ({ navigation, route }) => ({
		tabPress: () => {
			if(route.name === 'Job Matching'){
				console.log(route.name);
				navigation.navigate(route.name);
			}
		},
	});

    return (
        <Tab.Navigator 
            initialRouteName="Dashboard"
            tabBarOptions={{
                activeTintColor: ThemeColor.BtnColor,
            }}>
            <Tab.Screen
                name="Dashboard"
                component={DashboardStackScreen}
				listeners={tabBarListeners}
                activeColor="red"
                options={{
                    headerShown: false,
                    tabBarLabel: 'Dashboard',
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="speedometer-outline" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="Timesheet"
                component={TimesheetStackScreen}
                options={{
                    headerShown: false,
                    tabBarLabel: 'Timesheets',
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="ios-calendar-sharp" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="Messages"
                component={MessageStackScreen}
                options={{
                tabBarLabel: 'Messages',
                tabBarIcon: ({ color, size }) => (
                    <Icon name="ios-mail-outline" color={color} size={size} />
                ),
                }}
            />
            <Tab.Screen
                name="ReferInvite"
                component={ReferInviteStackScreen}
                options={{
                    headerShown: false,
                    tabBarLabel: 'My referral',
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="ios-people" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="More"
                component={MoreStackScreen}
                options={{
                    headerShown: false,
                    tabBarLabel: 'More',
                    tabBarIcon: ({ color, size }) => (
                        <FeatherIcons name="more-horizontal" color={color} size={size} />
                    ),
                }}
            />
        </Tab.Navigator>
      );
};

export default SecondTabScreen;

const DashboardStackScreen = ({navigation})  => {
    return(
        <DashboardStack.Navigator screenOptions={{
            headerStyle: {
                backgroundColor: ThemeColor.NavColor,
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
                fontSize:18
            },
           
            headerBackTitleVisible: false
            }}>
            <DashboardStack.Screen name="Dashboard" component={DashboardScreen} options={{}} />
            <DashboardStack.Screen name="Profile" component={MyProfileScreen} options={{}} />
            <DashboardStack.Screen name="ChatBot" component={ChatBotScreen} />
            <DashboardStack.Screen name="DocumentViewer" component={DocumentViewerScreen}/>
            <DashboardStack.Screen name="Timesheets" component={TumesheetsScreen} options={{}}/>
            <DashboardStack.Screen name="Interviews" component={InterviewScreen}/>
            <DashboardStack.Screen name="Messages" component={MessageHomeScreen}/>
            <DashboardStack.Screen name="Conversassions" component={ConversassionScreen}/>
            <DashboardStack.Screen name="ChatScreen1" component={ChatScreen}/>
            <DashboardStack.Screen name="CreateMessage" component={CreateMessageScreen}/>
            <DashboardStack.Screen name="ChatAttachments" component={ChatAttachmentScreen}/>    

            {/* 
            */}

        </DashboardStack.Navigator>
    );
 };
 const TimesheetStackScreen = ({navigation})  => {
    return(
        <TimesheetStack.Navigator screenOptions={{
            headerStyle: {
                backgroundColor: ThemeColor.NavColor,
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
                fontFamily: 'Lato-Regular', fontSize:18
            },
            headerBackTitleVisible: false,
            }}>
            <TimesheetStack.Screen name="Timesheets" component={TumesheetsScreen} options={{}}/>
            <TimesheetStack.Screen name="ChatScreen" component={ChatScreen}/>
            <TimesheetStack.Screen name="TsWorkFlow" component={TimesheetWorkflowScreen} options={{}}/>
            <TimesheetStack.Screen name="SelectProject" component={SelectProjectScreen} options={{}}/>
            <TimesheetStack.Screen name="EditTimesheet" component={EditTimesheetScreen}/>
            <TimesheetStack.Screen name="ViewTimesheet" component={ViewTimesheetScreen}/>
            <TimesheetStack.Screen name="TimesheetFrequency" component={TimesheetFrequencyScreen}/>
            <TimesheetStack.Screen name="CreateMessage" component={CreateMessageScreen}/>
            <TimesheetStack.Screen name="RequestTimeoff" component={RequestTimeoffScreen}/>
            <TimesheetStack.Screen name="CheckInOutTimesheet" component={CheckInOutTimesheetScreen} options={{}}/>
            <TimesheetStack.Screen name="CheckInOutEdit" component={CheckInOutScreen} options={{}}/>

        </TimesheetStack.Navigator>
    );
};
 
const MessageStackScreen = ({navigation})  => {
    return(
        <MessageStack.Navigator screenOptions={{
            headerStyle: {
                backgroundColor: ThemeColor.NavColor,
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
                fontFamily: 'Lato-Regular', fontSize:18
            },
            headerBackTitleVisible: false,

            }}>
            <MessageStack.Screen name="MessageHome" component={MessageHomeScreen} options={{}}/>
            <MessageStack.Screen name="ChatScreens" component={ChatScreen}/>
            <MessageStack.Screen name="Conversassions" component={ConversassionScreen}/>
            <MessageStack.Screen name="ChatScreen" component={ChatScreen}/>
            <MessageStack.Screen name="ChatAttachments" component={ChatAttachmentScreen}/>   
            <MessageStack.Screen name="CreateMessage" component={CreateMessageScreen}/>
            <MessageStack.Screen name="RequestTimeoff" component={RequestTimeoffScreen}/>

        </MessageStack.Navigator>
    );
};
const ReferInviteStackScreen = ({navigation})  => {

    return(
        <ReferInviteStack.Navigator screenOptions={{
            headerStyle: {
                backgroundColor: ThemeColor.NavColor,
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
                fontFamily: 'Lato-Regular', fontSize:18
            }
            }}>
            <ReferInviteStack.Screen name="ReferralsAndInvite" component={ReferralsAndInviteScreen} options={{}}/>
            <ReferInviteStack.Screen name="ReferFriend" component={ReferFriendScreen}/>
            <ReferInviteStack.Screen name="ReferContact" component={ReferContactScreen}/>
            <ReferInviteStack.Screen name="InviteFriend" component={InviteFriendScreen}/>
            <ReferInviteStack.Screen name="EmailInvite" component={EmailInviteScreen}/>
            <ReferInviteStack.Screen name="ReferClient" component={ReferClientScreen}/>
            <ReferInviteStack.Screen name="ActivityHome" component={ActivityHomeScreen}/>
            <ReferInviteStack.Screen name="PayPalAccount" component={PayPalAccountScreen}/>
            <ReferInviteStack.Screen name="RequestTimeoff" component={RequestTimeoffScreen}/>

        </ReferInviteStack.Navigator>
    );
};
 
const MoreStackScreen = ({navigation})  => {
    return(
        <MoreStack.Navigator screenOptions={{
            headerStyle: {
                backgroundColor: ThemeColor.NavColor,
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
                fontSize:18
            },
            headerBackTitleVisible: false
            }}>
            <MoreStack.Screen name="More" component={MoreScreen} options={{ }} />            
            <MoreStack.Screen name="Profile" component={MyProfileScreen} options={{}} />
            <MoreStack.Screen name="Jobs" component={JobsHomeScreen} options={{}} />
            <MoreStack.Screen name="FindJobs" component={JobSearchScreen} options={{}}/>
            <MoreStack.Screen name="JobsList" component={JobSearchResult}  options={{
                headerRight: () => (
                    <TouchableOpacity style={{marginRight:16}}>
                        <Image style={{ width: 25,height: 25,tintColor:'white'}} source={require('../assets/Images/icon_filter.png')} /> 
                    </TouchableOpacity>
                    ),
            }}/>
            <MoreStack.Screen name="JobDetails" component={JobDetailScreen} options={{}}/>
            <MoreStack.Screen name="Job refer" component={JobReferScreen} options={{}}/>
            <MoreStack.Screen name="Job apply" component={JobApplyScreen} options={{}}/>
            {/* <MoreStack.Screen name="AttendanceHome" component={AttendanceHomeScreen}/> */}
            <MoreStack.Screen name="ChangePassword" component={ChangePasswordScreen}/>
            <MoreStack.Screen name="AlertSetting" component={AlertSettingScreen}/>
            <MoreStack.Screen name="PrivacyAndTerms" component={PrivacyAndTermsScreen} />
            <MoreStack.Screen name="HelpAndSupport" component={HelpAndSupportScreen}/>
            <MoreStack.Screen name="CallSupport" component={CallSupportScreen}/>
            <MoreStack.Screen name="EmailSupport" component={EmailSupportScreen}/>
            <MoreStack.Screen name="ReportBug" component={ReportBugScreen}/>
            <MoreStack.Screen name="ChatBot" component={ChatBotScreen} />
            <MoreStack.Screen name="ResourceHome" component={ResourceHomeScreen}/>
            <MoreStack.Screen name="InterviewTips" component={InterviewTipsScreen} />
            <MoreStack.Screen name="FormsAndPolicy" component={FormsAndPolicyScreen} />
            <MoreStack.Screen name="NewsScreen" component={NewsScreen}/>
            <MoreStack.Screen name="HolidaySchedule" component={HolidayScheduleScreen} />
            <MoreStack.Screen name="HrHome" component={HrHomeScreen} />
            <MoreStack.Screen name="HrBenefit" component={HrBenefitScreen}/>
            <MoreStack.Screen name="ImmigrationHome" component={ImmigrationHomeScreen}/>
            <MoreStack.Screen name="ImmigrationDesk" component={ImmigrationDeskScreen}/>
            <MoreStack.Screen name="LegalFilings" component={LegalFilingsScreen}/>
            <MoreStack.Screen name="EditLCA" component={NewLCAScreen}/>
            <MoreStack.Screen name="LegalDocument" component={LegalDocumentScreen}/>
            <MoreStack.Screen name="ChooseLcaType" component={ChooseLcaTypeScreen}/>
            <MoreStack.Screen name="AddLCADetails" component={AddLCADetailsScreen}/> 
            <MoreStack.Screen name="ViewLCADetails" component={ViewLCADetailsScreen}/>
            <MoreStack.Screen name="LCAScreen" component={LCAScreen} />
            <MoreStack.Screen name="NewLcaDocument" component={NewLcaDocumentScreen}/>
            <MoreStack.Screen name="ProjectHome" component={ProjectHomeScreen}/>
            <MoreStack.Screen name="TimesheetPayroll" component={TimesheetPayrollHomeScreen} />
            <MoreStack.Screen name="PayrollInformation" component={PayrollInformationScreen} />
            <MoreStack.Screen name="PayrollCalender" component={PayrollCalenderScreen}/>
            <MoreStack.Screen name="ExpenceScreen" component={ExpenceScreen}/>
            <MoreStack.Screen name="AddExpence" component={AddExpenceScreen}/>
            <MoreStack.Screen name="RequestTimeoff" component={RequestTimeoffScreen}/>
            <MoreStack.Screen name="AddTimeoffRequest" component={AddTimeoffRequestScreen}/>
            <MoreStack.Screen name="PaymentStatus" component={PaymentStatusSCreen}/>
            <MoreStack.Screen name="DocumentViewer" component={DocumentViewerScreen}/>
            <MoreStack.Screen name="Timesheets" component={TumesheetsScreen} options={{}}/>
            <MoreStack.Screen name="ViewTimesheet" component={ViewTimesheetScreen}/>
            <MoreStack.Screen name="TsWorkFlow" component={TimesheetWorkflowScreen} options={{}}/>
            <MoreStack.Screen name="EditTimesheet" component={EditTimesheetScreen}/>
            <MoreStack.Screen name="CheckInOutTimesheet" component={CheckInOutTimesheetScreen} options={{}}/>
            <MoreStack.Screen name="CheckInOutEdit" component={CheckInOutScreen} options={{}}/>
            <MoreStack.Screen name="InterviewScreen" component={InterviewScreen}/>
            <MoreStack.Screen name="ReferralsAndInvite" component={ReferralsAndInviteScreen}/>
            <MoreStack.Screen name="ReferFriend" component={ReferFriendScreen}/>
            <MoreStack.Screen name="ReferContact" component={ReferContactScreen}/>
            <MoreStack.Screen name="InviteFriend" component={InviteFriendScreen}/>
            <MoreStack.Screen name="EmailInvite" component={EmailInviteScreen}/>
            <MoreStack.Screen name="ReferClient" component={ReferClientScreen}/>
            <MoreStack.Screen name="PayPalAccount" component={PayPalAccountScreen}/>
            <MoreStack.Screen name="ActivityHome" component={ActivityHomeScreen}/>
            <MoreStack.Screen name="MessageHome" component={MessageHomeScreen}/>
            <MoreStack.Screen name="Conversassions" component={ConversassionScreen}/>
            <MoreStack.Screen name="ChatScreen" component={ChatScreen}/>
            <MoreStack.Screen name="CreateMessage" component={CreateMessageScreen}/>
            <MoreStack.Screen name="ChatAttachments" component={ChatAttachmentScreen}/>    
        </MoreStack.Navigator>
    );
};

 

const GuestDashboard = ({navigation})  => {
	const { signOut } = React.useContext(AuthContext);
    return (
      <View style={styles.container}>
        <Image
            key={'blurryImage'}
            resizeMode='stretch'
            source={require('../assets/Images/BlurDashboard.png')}
            style={styles.absolute}
        />
        {/* <BlurView
          style={styles.absolute}
          blurType="light"
          blurAmount={10}
          reducedTransparencyFallbackColor="white"
        /> */}
        <Text style={{fontSize: 16, textAlign:'center'}}>LOG IN or SIGN UP to continue.</Text>
        <TouchableOpacity style={styles.btnFill} onPress={() => {signOut()}}>
            <Text style={{color:ThemeColor.BtnColor,fontSize:16 }}>CONTINUE</Text>
        </TouchableOpacity>
      </View>
    );
};
const GuestMatchingJob = ({navigation})  => {
	const { signOut } = React.useContext(AuthContext);
    return (
      <View style={styles.container}>
        <Image
            key={'blurryImage'}
            resizeMode='stretch'
            source={require('../assets/Images/BlurMatching.png')}
            style={styles.absolute}
        />
        {/* <BlurView
          style={styles.absolute}
          blurType="light"
          blurAmount={10}
          reducedTransparencyFallbackColor="white"
        /> */}
        <Text style={{fontSize: 16, textAlign:'center'}}>LOG IN or SIGN UP to continue.</Text>
        <TouchableOpacity style={styles.btnFill} onPress={() => {signOut()}}>
            <Text style={{color:ThemeColor.BtnColor,fontSize:16 }}>CONTINUE</Text>
        </TouchableOpacity>
      </View>
    );
};
const GuestMyApplication = ({navigation})  => {
	const { signOut } = React.useContext(AuthContext);
    return (
      <View style={styles.container}>
        <Image
            key={'blurryImage'}
            resizeMode='stretch'
            source={require('../assets/Images/BlurApplication.png')}
            style={styles.absolute}
        />
        {/* <BlurView
          style={styles.absolute}
          blurType="light"
          blurAmount={10}
          reducedTransparencyFallbackColor="white"
        /> */}
        <Text style={{fontSize: 16, textAlign:'center'}}>LOG IN or SIGN UP to continue.</Text>
        <TouchableOpacity style={styles.btnFill} onPress={() => {signOut()}}>
            <Text style={{color:ThemeColor.BtnColor, fontSize:16 }}>CONTINUE</Text>
        </TouchableOpacity>
      </View>
    );
};
const GuestMore = ({navigation})  => {
	const { signOut } = React.useContext(AuthContext);
    return (
      <View style={styles.container}>
        <Image
            key={'blurryImage'}
            resizeMode='stretch'
            source={require('../assets/Images/BlurMore.png')}
            style={styles.absolute}
        />
        {/* <BlurView
          style={styles.absolute}
          blurType="light"
          blurAmount={10}
          reducedTransparencyFallbackColor="white"
        /> */}
        <Text style={{fontSize: 16, textAlign:'center'}}>LOG IN or SIGN UP to continue.</Text>
        <TouchableOpacity style={styles.btnFill} onPress={() => {signOut()}}>
            <Text style={{color:ThemeColor.BtnColor,fontSize:16 }}>CONTINUE</Text>
        </TouchableOpacity>
      </View>
    );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      padding:16,
    },btnFill:{
      height:40,
      justifyContent:"center",
      alignItems:'center',
    },absolute: {
        position: "absolute",
        top: 0,
        left: 0,
        bottom: 0,
        right: 0
      }
  });
