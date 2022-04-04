import 'react-native-gesture-handler';
import React from 'react';
import {Text, View ,StyleSheet,TouchableOpacity ,Image,Alert} from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';
import FeatherIcons from 'react-native-vector-icons/Feather';
import { ThemeColor ,StaticMessage} from '../_helpers/constants';
import { AuthContext } from '../Components/context';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import JobSearchScreen from './Jobs/JobSearchScreen';
import DocumentViewerScreen from './DocumentViewer/DocumentViewerScreen';
import JobSearchResult from './Jobs/JobSearchResult';
import JobDetailScreen from './Jobs/JobDetailScreen';
import JobReferScreen from './Jobs/JobReferScreen';
import JobApplyScreen from './Jobs/JobApplyScreen';
import CreateMessageScreen from './Messaging/CreateMessageScreen';
import PreScreeningScreen from './PreScreening/PreScreeningScreen'
import SimilarJobScreen from './PreScreening/SimilarJobScreen';
import ChatScreen from './Messaging/ChatScreen';
import ChatBotScreen from './ChatBot/ChatBotScreen';

const Stack  = createStackNavigator();

const Tab = createBottomTabNavigator();

const SkipTabScreen = () => {
	
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
            <Stack.Screen name="FindJobs" component={JobSearchScreen} options={{}}/>
            <Stack.Screen name="DocumentViewer" component={DocumentViewerScreen}/>
            <Stack.Screen name="JobsList" component={JobSearchResult}  options={{
                headerRight: () => (
                    <TouchableOpacity style={{marginRight:16}}>
                        <Image style={{ width: 25,height: 25,tintColor:'white'}} source={require('../assets/Images/icon_filter.png')} /> 
                    </TouchableOpacity>
                    ),
            }}/>
            <Stack.Screen name="JobDetails" component={JobDetailScreen} options={{}}/>
            <Stack.Screen name="Job apply" component={JobApplyScreen} options={{}}/>
            <Stack.Screen name="Job refer" component={JobReferScreen} options={{}}/>
            <Stack.Screen name="ChatScreen" component={ChatScreen}/>
            <Stack.Screen name="PreScreenings" component={PreScreeningScreen}/>
            <Stack.Screen name="CreateMessage" component={CreateMessageScreen}/>
            <Stack.Screen name="SimilarJobs" component={SimilarJobScreen}/>
            <Stack.Screen name="ChatBot" component={ChatBotScreen} />
            
        </Stack.Navigator>
      );
};

export default SkipTabScreen;
const HomeTabs = ({navigation})  => {
    return (
        <Tab.Navigator 
            initialRouteName="FindJobs"
            tabBarOptions={{
                activeTintColor: ThemeColor.BtnColor,
            }}>
            <Tab.Screen
                name="Dashboard"
                component={GuestDashboard}
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
                name="Job Matches"
                component={GuestMatchingJob}
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
                component={GuestMyApplication}
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
                component={GuestMore}
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
