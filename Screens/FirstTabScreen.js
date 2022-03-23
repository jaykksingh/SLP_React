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
import CreateMessageScreen from './Messaging/CreateMessageScreen';
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


// import JobSearchResultScreen from '../JobSearch/JobSearchResult';
// import SavedFileterScreen from '../JobSearch/SavedFileterScreen';
// import JobDetailScreen from '../JobSearch/JobDetailScreen';
// import JobApplyScreen from '../JobSearch/JobApplyScreen';
// import JobReferScreen from '../JobSearch/JobReferScreen';
// import ChatScreen from '../Messages/ChatScreen';
// import CreateMessageScreen from '../Messages/CreateMessageScreen';
// import PreScreeningScreen from '../PreScreenings/PreScreeningScreen';

import FontListScreen from './FontListScreen';

const DashboardStack  = createStackNavigator();
const JobMatchingStack  = createStackNavigator();
const JobSearchStack  = createStackNavigator();
const MyApplicationStack  = createStackNavigator();
const MoreStack  = createStackNavigator();

const Tab = createBottomTabNavigator();

const FirstTabScreen = () => {
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
                name="JobMatching"
                component={JobMatchingStackScreen}
                options={{
                    headerShown: false,
                    tabBarLabel: 'Job Matches',
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="stop-circle-outline" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="Job Search"
                component={JobSearchStackScreen}
                options={{
                    headerShown: false,
                    tabBarLabel: 'Jobs search',
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="search-outline" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="Application"
                component={MyApplicationStackScreen}
                options={{
                headerShown: false,
                tabBarLabel: 'Applications',
                tabBarIcon: ({ color, size }) => (
                    <Icon name="folder-open-outline" color={color} size={size} />
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

export default FirstTabScreen;

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
            <JobSearchStack.Screen name="PreScreenings" component={PreScreeningScreen}/>
            <JobSearchStack.Screen name="SimilarJobs" component={SimilarJobScreen}/>
            <JobSearchStack.Screen name="ChatBot" component={ChatBotScreen} />

            {/* 
            
            <JobSearchStack.Screen name="Filter" component={SavedFileterScreen} options={{}}/>
            <JobSearchStack.Screen name="ChatScreen" component={ChatScreen}/>
            */}

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

            {/* 
            */}

            
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
