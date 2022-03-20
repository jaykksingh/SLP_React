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
import JobSearchScreen from './Jobs/JobSearchScreen';
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
            initialRouteName="Job Search"
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
                name="Job Matching"
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
            <JobMatchingStack.Screen name="Job Matches" component={GuestMatchingJob} options={{ }} />
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
            {/* <JobSearchStack.Screen name="Applications" component={GuestMyApplication} options={{  }} /> */}

            <JobSearchStack.Screen name="FindJobs" component={JobSearchScreen} options={{}}/>
            <JobSearchStack.Screen name="FontList" component={FontListScreen} options={{}}/>

            
            {/* <JobSearchStack.Screen name="JobsList" component={JobSearchResultScreen}  options={{
                headerRight: () => (
                    <TouchableOpacity style={{marginRight:16}}>
                        <Image style={{ width: 25,height: 25,tintColor:'white'}} source={require('../../assets/Images/icon_filter.png')} /> 
                    </TouchableOpacity>
                    ),
            }}/>
            <JobSearchStack.Screen name="Filter" component={SavedFileterScreen} options={{}}/>
            <JobSearchStack.Screen name="JobDetails" component={JobDetailScreen} options={{}}/>
            <JobSearchStack.Screen name="Job apply" component={JobApplyScreen} options={{}}/>
            <JobSearchStack.Screen name="Job refer" component={JobReferScreen} options={{}}/>
            <JobSearchStack.Screen name="ChatScreen" component={ChatScreen}/>
            <JobSearchStack.Screen name="PreScreenings" component={PreScreeningScreen}/>
            <JobSearchStack.Screen name="CreateMessage" component={CreateMessageScreen}/> */}

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
            <MyApplicationStack.Screen name="Applications" component={GuestMyApplication} options={{}} />

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
            <MoreStack.Screen name="More" component={GuestMore} options={{ }} />            
            
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
