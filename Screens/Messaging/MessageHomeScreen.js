import React ,{useEffect,useState}from 'react';
import { View ,
    useWindowDimensions,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Alert,
    Text} from 'react-native';
import {ThemeColor } from '../../_helpers/constants';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import ChatGroupScreen from './ChatGroupScreen';
import NotificationScreen from './NotificationScreen';

const Tab = createMaterialTopTabNavigator();

const MessageHomeScreen = ({navigation})  => {
  let [selectedIndex, setSelectedIndex] = React.useState(0);


	React.useLayoutEffect(() => {
		navigation.setOptions({
			headerRight: () => (
        
				<TouchableOpacity style={{marginRight:16}} onPress = {() => {navigation.navigate('CreateMessage',{groupName:''})}}>
				  <Ionicons name="create-outline" color={'white'} size={25,25} />
				</TouchableOpacity>
			),
      title: 'Messages'
		});
	}, [navigation]);
  

  const showActionButton = () => {
  Alert.alert('sdfsf'  , null, [
    {
      text: 'Upload client timesheet', 
      onPress: () => console.log('Ask me later pressed')
    },
    {
      text: 'Enter hours',
      onPress: () => navigation.navigate('profile')
    },{
      text: 'Timesheet workflow',
      onPress: () => navigation.navigate('profile')
    }
  ]);   
}
  const handleIndexChange = (index) => {
		setSelectedIndex(index);
		console.log("Index:", index);
		if(index == 1){
			getCalenderDetails('archive');
		}else{
			getCalenderDetails('active');
		}
	}
	const getCalenderDetails = () =>{

	}
	
	return(
		<Tab.Navigator
		  tabBarOptions={{
        labelStyle: { fontSize: 14, tintColor:ThemeColor.BtnColor,textTransform:'capitalize' },
        activeTintColor: ThemeColor.BtnColor,
        inactiveTintColor:ThemeColor.TextColor,
        indicatorStyle:{backgroundColor: ThemeColor.BtnColor},
        tabStyle: {  },
        style: { tintColor:ThemeColor.BtnColor},
		  }}
		>
			<Tab.Screen name="Messages" component={ChatGroupScreen} />
			<Tab.Screen name="Notifications" component={NotificationScreen} />
		</Tab.Navigator>
	);
}

export default MessageHomeScreen;

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
