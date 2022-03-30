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


const Stack  = createStackNavigator();
const DashboardStack  = createStackNavigator();
const JobMatchingStack  = createStackNavigator();
const JobSearchStack  = createStackNavigator();
const MyApplicationStack  = createStackNavigator();
const MoreStack  = createStackNavigator();

const Tab = createBottomTabNavigator();

const FirstTabScreen = () => {
	
    // return (
    //     <Tab.Navigator 
    //         initialRouteName="Dashboard"
    //         tabBarOptions={{
    //             activeTintColor: ThemeColor.BtnColor,
    //         }}>
    //         <Tab.Screen
    //             name="Dashboard"
    //             component={DashboardStackScreen}
    //             activeColor="red"
    //             options={{
    //                 headerShown: false,
    //                 tabBarLabel: 'Dashboard',
    //                 tabBarIcon: ({ color, size }) => (
    //                     <Icon name="speedometer-outline" color={color} size={size} />
    //                 ),
    //             }}
    //         />
    //         <Tab.Screen
    //             name="JobMatching"
    //             component={JobMatchingStackScreen}
    //             options={{
    //                 headerShown: false,
    //                 tabBarLabel: 'Job Matches',
    //                 tabBarIcon: ({ color, size }) => (
    //                     <Icon name="stop-circle-outline" color={color} size={size} />
    //                 ),
    //             }}
    //         />
    //         <Tab.Screen
    //             name="Job Search"
    //             component={JobSearchStackScreen}
    //             options={{
    //                 headerShown: false,
    //                 tabBarLabel: 'Jobs search',
    //                 tabBarIcon: ({ color, size }) => (
    //                     <Icon name="search-outline" color={color} size={size} />
    //                 ),
    //             }}
    //         />
    //         <Tab.Screen
    //             name="Application"
    //             component={MyApplicationStackScreen}
    //             options={{
    //             headerShown: false,
    //             tabBarLabel: 'Applications',
    //             tabBarIcon: ({ color, size }) => (
    //                 <Icon name="folder-open-outline" color={color} size={size} />
    //             ),
    //             }}
    //         />
    //         <Tab.Screen
    //             name="More"
    //             component={MoreStackScreen}
    //             options={{
    //                 headerShown: false,
    //                 tabBarLabel: 'More',
    //                 tabBarIcon: ({ color, size }) => (
    //                     <FeatherIcons name="more-horizontal" color={color} size={size} />
    //                 ),
    //             }}
    //         />
    //     </Tab.Navigator>
    //   );
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
            <Stack.Screen name="Timesheets" component={TumesheetsScreen} options={{}}/>
            <Stack.Screen name="ViewTimesheet" component={ViewTimesheetScreen}/>
            <Stack.Screen name="TsWorkFlow" component={TimesheetWorkflowScreen} options={{}}/>
            <Stack.Screen name="EditTimesheet" component={EditTimesheetScreen}/>
            <Stack.Screen name="CheckInOutTimesheet" component={CheckInOutTimesheetScreen} options={{}}/>
            <Stack.Screen name="CheckInOutEdit" component={CheckInOutScreen} options={{}}/>
            <Stack.Screen name="SelectProject" component={SelectProjectScreen} options={{}}/>
            <Stack.Screen name="TimesheetFrequency" component={TimesheetFrequencyScreen}/>
            <Stack.Screen name="InterviewScreen" component={InterviewScreen}/>
            <Stack.Screen name="ReferralsAndInvite" component={ReferralsAndInviteScreen}/>
            <Stack.Screen name="ReferFriend" component={ReferFriendScreen}/>
            <Stack.Screen name="ReferContact" component={ReferContactScreen}/>
            <Stack.Screen name="InviteFriend" component={InviteFriendScreen}/>
            <Stack.Screen name="EmailInvite" component={EmailInviteScreen}/>
            <Stack.Screen name="ReferClient" component={ReferClientScreen}/>
            <Stack.Screen name="PayPalAccount" component={PayPalAccountScreen}/>
            <Stack.Screen name="ActivityHome" component={ActivityHomeScreen}/>
            <Stack.Screen name="MessageHome" component={MessageHomeScreen}/>
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
            <Stack.Screen name="MatchingJob" component={JobMatchingScreen} />
            <Stack.Screen name="Applications" component={MyApplicationScreen} />
            <Stack.Screen name="SimilarJobs" component={SimilarJobScreen}/>
            <Stack.Screen name="LeaveHome" component={LeaveHomeScreen}/>
            <Stack.Screen name="LeaveDetails" component={LeaveDetailsScreen}/>
            <Stack.Screen name="AddLeave" component={AddLeaveScreen}/>
            <Stack.Screen name="AttendanceHome" component={AttendanceHomeScreen}/>
            <Stack.Screen name="AddRegularization" component={AddRegularizationScreen}/>
            <Stack.Screen name="Interviews" component={InterviewScreen}/>
        </Stack.Navigator>
    );
}

export default FirstTabScreen;

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
                name="JobMatching"
                component={JobMatchingScreen}
                options={{
                    headerStyle: {
                        backgroundColor: ThemeColor.NavColor,
                    },
                    headerTintColor: '#fff',
                    headerTitleStyle: {
                        fontSize:18
                    },        
                    headerShown: true,
                    tabBarLabel: 'Job Matches',
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="stop-circle-outline" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="FindJobs"
                component={JobSearchScreen}
                options={{
                    headerShown: true,
                    headerStyle: {
                        backgroundColor: ThemeColor.NavColor,
                    },
                    headerTintColor: '#fff',
                    headerTitleStyle: {
                        fontSize:18
                    },        
                    tabBarLabel: 'Jobs search',
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="search-outline" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="Application"
                component={MyApplicationScreen}
                options={{
                headerShown: true,
                headerStyle: {
                    backgroundColor: ThemeColor.NavColor,
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                    fontSize:18
                },        
                tabBarLabel: 'Applications',
                tabBarIcon: ({ color, size }) => (
                    <Icon name="folder-open-outline" color={color} size={size} />
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
            <DashboardStack.Screen name="Interviews" component={InterviewScreen}/>
            <DashboardStack.Screen name="Messages" component={MessageHomeScreen}/>
            <DashboardStack.Screen name="Conversassions" component={ConversassionScreen}/>
            <DashboardStack.Screen name="ChatScreen1" component={ChatScreen}/>
            <DashboardStack.Screen name="CreateMessage" component={CreateMessageScreen}/>
            <DashboardStack.Screen name="ChatAttachments" component={ChatAttachmentScreen}/>    
            <DashboardStack.Screen name="Skill" component={AddSkillScreen} />
            <DashboardStack.Screen name="ProjectEndDate" component={ProjectEndingScreen} />
            <DashboardStack.Screen name="More" component={MoreScreen} options={{}}/>
            <DashboardStack.Screen name="Timesheets" component={TumesheetsScreen} options={{}}/>
            <DashboardStack.Screen name="CheckInOutTimesheet" component={CheckInOutTimesheetScreen} options={{}}/>
            <DashboardStack.Screen name="CheckInOutEdit" component={CheckInOutScreen} options={{}}/>
            <DashboardStack.Screen name="FindJobs" component={JobSearchScreen} options={{}}/>
            <DashboardStack.Screen name="JobsList" component={JobSearchResult}  options={{
                headerRight: () => (
                    <TouchableOpacity style={{marginRight:16}}>
                        <Image style={{ width: 25,height: 25,tintColor:'white'}} source={require('../assets/Images/icon_filter.png')} /> 
                    </TouchableOpacity>
                    ),
            }}/>
            <DashboardStack.Screen name="JobDetails" component={JobDetailScreen} options={{}}/>
            <DashboardStack.Screen name="Job refer" component={JobReferScreen} options={{}}/>
            <DashboardStack.Screen name="Job apply"  component={JobApplyScreen} />
            <DashboardStack.Screen name="PreScreenings" component={PreScreeningScreen}/>
            <DashboardStack.Screen name="SimilarJobs" component={SimilarJobScreen}/>
            <DashboardStack.Screen name="ReferClient" component={ReferClientScreen}/>
            <DashboardStack.Screen name="RequestTimeoff" component={RequestTimeoffScreen}/>

            

        </DashboardStack.Navigator>
    );
 };

 const JobMatchingStackScreen = ({navigation})  => {
    return(
        <JobMatchingStack.Navigator screenOptions={{
            headerStyle: {
                backgroundColor: ThemeColor.NavColor,
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
                fontSize:18
            },
            }}>
            <JobMatchingStack.Screen name="Job Matches" component={JobMatchingScreen} options={{ }} />
            <JobMatchingStack.Screen name="ChatBot" component={ChatBotScreen} />
            <JobMatchingStack.Screen name="DocumentViewer" component={DocumentViewerScreen}/>
            <JobMatchingStack.Screen name="ChatScreen" component={ChatScreen}/>
            <JobMatchingStack.Screen name="Skill" component={AddSkillScreen} />
            <JobMatchingStack.Screen name="Edit profile" component={EditProfileScreen} />  
            <JobMatchingStack.Screen name="Speciality" component={SpecialityScreen} options={{}}/>
            <JobMatchingStack.Screen name="Desired employeement" component={DesiredEmploymentScreen} />
            <JobMatchingStack.Screen name="Job apply" component={JobApplyScreen} options={{}}/>
            <JobMatchingStack.Screen name="PreScreenings" component={PreScreeningScreen}/>
            <JobMatchingStack.Screen name="SimilarJobs" component={SimilarJobScreen}/>
            <JobMatchingStack.Screen name="RequestTimeoff" component={RequestTimeoffScreen}/>

        </JobMatchingStack.Navigator>
    );
 };
 const JobSearchStackScreen = ({navigation})  => {
    return(
        <JobSearchStack.Navigator screenOptions={{
            headerStyle: {
                backgroundColor: ThemeColor.NavColor,
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
                fontSize:18
            },
            headerBackTitleVisible: false

            }}>
            <JobSearchStack.Screen name="FindJobs" component={JobSearchScreen} options={{}}/>
            <JobSearchStack.Screen name="JobsList" component={JobSearchResult}  options={{
                headerRight: () => (
                    <TouchableOpacity style={{marginRight:16}}>
                        <Image style={{ width: 25,height: 25,tintColor:'white'}} source={require('../assets/Images/icon_filter.png')} /> 
                    </TouchableOpacity>
                    ),
            }}/>
            <JobSearchStack.Screen name="JobDetails" component={JobDetailScreen} options={{}}/>
            <JobSearchStack.Screen name="Job refer" component={JobReferScreen} options={{}}/>
            <JobSearchStack.Screen name="Job apply"  component={JobApplyScreen} />
            <JobSearchStack.Screen name="CreateMessage" component={CreateMessageScreen}/> 
            <JobSearchStack.Screen name="ChatScreen" component={ChatScreen}/>
            <JobSearchStack.Screen name="PreScreenings" component={PreScreeningScreen}/>
            <JobSearchStack.Screen name="SimilarJobs" component={SimilarJobScreen}/>
            <JobSearchStack.Screen name="ChatBot" component={ChatBotScreen} />
            <JobSearchStack.Screen name="DocumentViewer" component={DocumentViewerScreen}/>
            <JobSearchStack.Screen name="RequestTimeoff" component={RequestTimeoffScreen}/>

        </JobSearchStack.Navigator>
    );
 };
 const MyApplicationStackScreen = ({navigation})  => {
    return(
        <MyApplicationStack.Navigator screenOptions={{
            headerStyle: {
                backgroundColor: ThemeColor.NavColor,
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
                fontSize:18
            },
            
            headerBackTitleVisible: false

            }}>
            <MyApplicationStack.Screen name="Applications" component={MyApplicationScreen} options={{}} />
            <MyApplicationStack.Screen name="JobDetails" component={JobDetailScreen} options={{}}/>
            <MyApplicationStack.Screen name="CreateMessage" component={CreateMessageScreen}/> 
            <MyApplicationStack.Screen name="PreScreenings" component={PreScreeningScreen}/>
            <MyApplicationStack.Screen name="SimilarJobs" component={SimilarJobScreen}/>
            <MyApplicationStack.Screen name="ChatBot" component={ChatBotScreen} />
            <MyApplicationStack.Screen name="DocumentViewer" component={DocumentViewerScreen}/>
            <MyApplicationStack.Screen name="ChatScreen" component={ChatScreen}/>
            <MyApplicationStack.Screen name="RequestTimeoff" component={RequestTimeoffScreen}/>

        </MyApplicationStack.Navigator>
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
            <MoreStack.Screen name="SelectProject" component={SelectProjectScreen} options={{}}/>
            <MoreStack.Screen name="TimesheetFrequency" component={TimesheetFrequencyScreen}/>
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
            <MoreStack.Screen name="Modify profile" component={ProfileDetailScreen} />
            <MoreStack.Screen name="Edit profile" component={EditProfileScreen} />  
            <MoreStack.Screen name="Domain" component={DomainScreen} />
            <MoreStack.Screen name="Funtional area" component={FuntionalAreaScreen} />
            <MoreStack.Screen name="Desired employeement" component={DesiredEmploymentScreen} />
            <MoreStack.Screen name="Desired salary" component={DesiredSalaryScreen} />
            <MoreStack.Screen name="Skill" component={AddSkillScreen} />
            <MoreStack.Screen name="Experience" component={AddExperienceScreen} />
            <MoreStack.Screen name="AddEducation" component={AddEducationScreen} />
            <MoreStack.Screen name="AddDocument" component={ResumeDocumentScreen} />
            <MoreStack.Screen name="Speciality" component={SpecialityScreen} options={{}}/>
            <MoreStack.Screen name="PreScreenings" component={PreScreeningScreen}/>
            <MoreStack.Screen name="MatchingJob" component={JobMatchingScreen} />
            <MoreStack.Screen name="Applications" component={MyApplicationScreen} />
            <MoreStack.Screen name="SimilarJobs" component={SimilarJobScreen}/>
            <MoreStack.Screen name="LeaveHome" component={LeaveHomeScreen}/>
            <MoreStack.Screen name="LeaveDetails" component={LeaveDetailsScreen}/>
            <MoreStack.Screen name="AddLeave" component={AddLeaveScreen}/>
            <MoreStack.Screen name="AttendanceHome" component={AttendanceHomeScreen}/>
            <MoreStack.Screen name="AddRegularization" component={AddRegularizationScreen}/>
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
