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
import ProfileDetailScreen from './Profile/ProfileDetailScreen';
import DomainScreen from './Profile/DomainScreen';
import FuntionalAreaScreen from './Profile/FuntionalAreaScreen';
import DesiredSalaryScreen from './Profile/DesiredSalaryScreen';
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
import SelectProjectScreen from './TimesheetPayroll/Timesheets/SelectProjectScreen';
import TimesheetFrequencyScreen from './TimesheetPayroll/Timesheets/TimesheetFrequencyScreen';
import CheckInOutTimesheetScreen from './TimesheetPayroll/Timesheets/CheckInOutTimesheetScreen';
import CheckInOutScreen from './TimesheetPayroll/Timesheets/CheckInOutScreen';
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
import AddSkillScreen from './Profile/AddSkillScreen';
import ProjectEndingScreen from './Dashboard/ProjectEndingScreen';
import EditProfileScreen from './Profile/EditProfileScreen';
import DesiredEmploymentScreen from './Profile/DesiredEmploymentScreen';
import SpecialityScreen from './Profile/SpecialityScreen';
import AddExperienceScreen from './Profile/AddWorkExperienceScreen';
import AddEducationScreen from './Profile/AddEducationScreen';
import ResumeDocumentScreen from './Profile/ResumeDocumentScreen';
import LeaveHomeScreen from './Leave/LeaveHomeScreen';
import LeaveDetailsScreen from './Leave/LeaveDetailsScreen';
import AddLeaveScreen from './Leave/AddLeaveScreen'
import AttendanceHomeScreen from './Attendance/AttendanceHomeScreen';
import AddRegularizationScreen from './Attendance/AddRegularizationScreen';
import ViewClockInOutTimesheetScreen from './TimesheetPayroll/Timesheets/ViewClockInOutTimesheetScreen';
import ViewClockInOutScreen from './TimesheetPayroll/Timesheets/ViewClockInOutScreen';
import StaffContactScreen from './StaffContactScreen/StaffContactScreen'

const Stack  = createStackNavigator();

const Tab = createBottomTabNavigator();

const SecondTabScreen = () => {
    return (
        <Stack.Navigator screenOptions={{
            headerStyle: {
                backgroundColor: ThemeColor.NavColor,
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
                fontSize:18
            },
           
            headerBackTitleVisible: false
        }}>
            <Stack.Screen name="Home" component={HomeTabs} options={{headerShown: false}}/>
            <Stack.Screen name="Profile" component={MyProfileScreen} options={{}} />
            <Stack.Screen name="Jobs" component={JobsHomeScreen} options={{}} />
            <Stack.Screen name="FindJobs" component={JobSearchScreen} options={{}}/>
            <Stack.Screen name="JobsList" component={JobSearchResult}  options={{
                headerRight: () => (
                    <TouchableOpacity style={{marginRight:16}}>
                        <Image style={{ width: 25,height: 25,tintColor:'white'}} source={require('../assets/Images/icon_filter.png')} /> 
                    </TouchableOpacity>
                    ),
            }}/>
            <Stack.Screen name="JobDetails" component={JobDetailScreen} options={{}}/>
            <Stack.Screen name="Job refer" component={JobReferScreen} options={{}}/>
            <Stack.Screen name="Job apply" component={JobApplyScreen} options={{}}/>
            <Stack.Screen name="ChangePassword" component={ChangePasswordScreen}/>
            <Stack.Screen name="AlertSetting" component={AlertSettingScreen}/>
            <Stack.Screen name="PrivacyAndTerms" component={PrivacyAndTermsScreen} />
            <Stack.Screen name="HelpAndSupport" component={HelpAndSupportScreen}/>
            <Stack.Screen name="CallSupport" component={CallSupportScreen}/>
            <Stack.Screen name="EmailSupport" component={EmailSupportScreen}/>
            <Stack.Screen name="ReportBug" component={ReportBugScreen}/>
            <Stack.Screen name="ChatBot" component={ChatBotScreen} />
            <Stack.Screen name="ResourceHome" component={ResourceHomeScreen}/>
            <Stack.Screen name="InterviewTips" component={InterviewTipsScreen} />
            <Stack.Screen name="FormsAndPolicy" component={FormsAndPolicyScreen} />
            <Stack.Screen name="NewsScreen" component={NewsScreen}/>
            <Stack.Screen name="HolidaySchedule" component={HolidayScheduleScreen} />
            <Stack.Screen name="HrHome" component={HrHomeScreen} />
            <Stack.Screen name="HrBenefit" component={HrBenefitScreen}/>
            <Stack.Screen name="ImmigrationHome" component={ImmigrationHomeScreen}/>
            <Stack.Screen name="ImmigrationDesk" component={ImmigrationDeskScreen}/>
            <Stack.Screen name="LegalFilings" component={LegalFilingsScreen}/>
            <Stack.Screen name="EditLCA" component={NewLCAScreen}/>
            <Stack.Screen name="LegalDocument" component={LegalDocumentScreen}/>
            <Stack.Screen name="ChooseLcaType" component={ChooseLcaTypeScreen}/>
            <Stack.Screen name="AddLCADetails" component={AddLCADetailsScreen}/> 
            <Stack.Screen name="ViewLCADetails" component={ViewLCADetailsScreen}/>
            <Stack.Screen name="LCAScreen" component={LCAScreen} />
            <Stack.Screen name="NewLcaDocument" component={NewLcaDocumentScreen}/>
            <Stack.Screen name="ProjectHome" component={ProjectHomeScreen}/>
            <Stack.Screen name="TimesheetPayroll" component={TimesheetPayrollHomeScreen} />
            <Stack.Screen name="PayrollInformation" component={PayrollInformationScreen} />
            <Stack.Screen name="PayrollCalender" component={PayrollCalenderScreen}/>
            <Stack.Screen name="ExpenceScreen" component={ExpenceScreen}/>
            <Stack.Screen name="AddExpence" component={AddExpenceScreen}/>
            <Stack.Screen name="RequestTimeoff" component={RequestTimeoffScreen}/>
            <Stack.Screen name="AddTimeoffRequest" component={AddTimeoffRequestScreen}/>
            <Stack.Screen name="PaymentStatus" component={PaymentStatusSCreen}/>
            <Stack.Screen name="DocumentViewer" component={DocumentViewerScreen}/>
            <Stack.Screen name="ViewTimesheet" component={ViewTimesheetScreen}/>
            <Stack.Screen name="TsWorkFlow" component={TimesheetWorkflowScreen} options={{}}/>
            <Stack.Screen name="EditTimesheet" component={EditTimesheetScreen}/>
            <Stack.Screen name="CheckInOutTimesheet" component={CheckInOutTimesheetScreen} options={{}}/>
            <Stack.Screen name="CheckInOutEdit" component={CheckInOutScreen} options={{}}/>
            <Stack.Screen name="SelectProject" component={SelectProjectScreen} options={{}}/>
            <Stack.Screen name="TimesheetFrequency" component={TimesheetFrequencyScreen}/>
            <Stack.Screen name="InterviewScreen" component={InterviewScreen}/>
            <Stack.Screen name="ReferFriend" component={ReferFriendScreen}/>
            <Stack.Screen name="ReferContact" component={ReferContactScreen}/>
            <Stack.Screen name="InviteFriend" component={InviteFriendScreen}/>
            <Stack.Screen name="EmailInvite" component={EmailInviteScreen}/>
            <Stack.Screen name="ReferClient" component={ReferClientScreen}/>
            <Stack.Screen name="PayPalAccount" component={PayPalAccountScreen}/>
            <Stack.Screen name="ActivityHome" component={ActivityHomeScreen}/>
            <Stack.Screen name="Conversassions" component={ConversassionScreen}/>
            <Stack.Screen name="ChatScreen" component={ChatScreen}/>
            <Stack.Screen name="CreateMessage" component={CreateMessageScreen}/>
            <Stack.Screen name="ChatAttachments" component={ChatAttachmentScreen}/>    
            <Stack.Screen name="Modify profile" component={ProfileDetailScreen} />
            <Stack.Screen name="Edit profile" component={EditProfileScreen} />  
            <Stack.Screen name="Domain" component={DomainScreen} />
            <Stack.Screen name="Funtional area" component={FuntionalAreaScreen} />
            <Stack.Screen name="Desired employeement" component={DesiredEmploymentScreen} />
            <Stack.Screen name="Desired salary" component={DesiredSalaryScreen} />
            <Stack.Screen name="Skill" component={AddSkillScreen} />
            <Stack.Screen name="Experience" component={AddExperienceScreen} />
            <Stack.Screen name="AddEducation" component={AddEducationScreen} />
            <Stack.Screen name="AddDocument" component={ResumeDocumentScreen} />
            <Stack.Screen name="Speciality" component={SpecialityScreen} options={{}}/>
            <Stack.Screen name="PreScreenings" component={PreScreeningScreen}/>
            <Stack.Screen name="JobMatching" component={JobMatchingScreen} />
            <Stack.Screen name="Application" component={MyApplicationScreen} />
            <Stack.Screen name="SimilarJobs" component={SimilarJobScreen}/>
            <Stack.Screen name="LeaveHome" component={LeaveHomeScreen}/>
            <Stack.Screen name="LeaveDetails" component={LeaveDetailsScreen}/>
            <Stack.Screen name="AddLeave" component={AddLeaveScreen}/>
            <Stack.Screen name="AttendanceHome" component={AttendanceHomeScreen}/>
            <Stack.Screen name="AddRegularization" component={AddRegularizationScreen}/>
            <Stack.Screen name="Interviews" component={InterviewScreen}/>
            <Stack.Screen name="ViewClockInOutTimesheet" component={ViewClockInOutTimesheetScreen}/>
            <Stack.Screen name="ViewClockInOut" component={ViewClockInOutScreen}/>
            <Stack.Screen name="ProjectEndDate" component={ProjectEndingScreen}/>
            <Stack.Screen name="StaffContact" component={StaffContactScreen}/>

        </Stack.Navigator>
      );
};

export default SecondTabScreen;
const HomeTabs = ({navigation})  => {
    return (
        <Tab.Navigator 
            initialRouteName="Dashboard"
            tabBarOptions={{
                activeTintColor: ThemeColor.BtnColor,
            }}>
            <Tab.Screen
                name="Dashboard"
                component={DashboardScreen}
                activeColor="red"
                options={{
                    headerStyle: {
                        backgroundColor: ThemeColor.NavColor,
                    },
                    headerTintColor: '#fff',
                    headerTitleStyle: {
                        fontSize:18
                    },        
                    headerShown: true,
                    tabBarLabel: 'Dashboard',
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="speedometer-outline" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="Timesheets"
                component={TumesheetsScreen}
                options={{
                    headerStyle: {
                        backgroundColor: ThemeColor.NavColor,
                    },
                    headerTintColor: '#fff',
                    headerTitleStyle: {
                        fontSize:18
                    },        
                    headerShown: true,                    
                    tabBarLabel: 'Timesheets',
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="ios-calendar-sharp" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="MessageHome"
                component={MessageHomeScreen}
                options={{
                    headerStyle: {
                        backgroundColor: ThemeColor.NavColor,
                    },
                    headerTintColor: '#fff',
                    headerTitleStyle: {
                        fontSize:18
                    },        
                    headerShown: true,
                    tabBarLabel: 'Messages',
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="ios-mail-outline" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="ReferralsAndInvite"
                component={ReferralsAndInviteScreen}
                options={{
                    headerStyle: {
                        backgroundColor: ThemeColor.NavColor,
                    },
                    headerTintColor: '#fff',
                    headerTitleStyle: {
                        fontSize:18
                    },        
                    headerShown: true,
                    tabBarLabel: 'My referral',
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="ios-people" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="More"
                component={MoreScreen}
                options={{
                    headerShown: true,
                    headerStyle: {
                        backgroundColor: ThemeColor.NavColor,
                    },
                    headerTintColor: '#fff',
                    headerTitleStyle: {
                        fontSize:18
                    },        
                    tabBarLabel: 'More',
                    tabBarIcon: ({ color, size }) => (
                        <FeatherIcons name="more-horizontal" color={color} size={size} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
}

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
