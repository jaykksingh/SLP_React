import React,{useEffect} from 'react';
import {StyleSheet} from 'react-native';
import { ThemeColor, FontName } from '../../../_helpers/constants';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import ContactReferralsScreen from './ContactReferralsScreen';
import InvitesScreen from './InvitesScreen';
import JobReferralsScreen from './JobReferralsScreen';

const Tab = createMaterialTopTabNavigator();

const ActivityHomeScreen = ({navigation}) =>{

	React.useLayoutEffect(() => {
		navigation.setOptions({
			title:'Activity'
		});
	}, [navigation]);

	useEffect(() => {
		if(navigation.dangerouslyGetParent){
			const parent = navigation.dangerouslyGetParent();
			parent.setOptions({
			  tabBarVisible: false
			});
			return () =>
			  parent.setOptions({
				tabBarVisible: true
			  });
		  }
	},[]);
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
			<Tab.Screen name="Referrals" component={ContactReferralsScreen} />
			<Tab.Screen name="Invite" component={InvitesScreen} />
			<Tab.Screen name="Job Referrals" component={JobReferralsScreen} />
		</Tab.Navigator>
	);
}

export default ActivityHomeScreen;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor:'#E5E9EB',
	},
});

