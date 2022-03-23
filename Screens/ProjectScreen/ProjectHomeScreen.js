import React,{useEffect} from 'react';
import {StyleSheet,TouchableOpacity} from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import CurrectProjectScreen from './CurrectProjectScreen';
import PastProjectScreen from './PastProjectScreen';
import MovableView from 'react-native-movable-view';
import Icon from 'react-native-vector-icons/Ionicons';

import { ThemeColor, FontName } from '../../_helpers/constants';

const Tab = createMaterialTopTabNavigator();

const ProjectHomeScreen = ({navigation}) =>{

	React.useLayoutEffect(() => {
		navigation.setOptions({
			title:'Projects'
		});
	}, [navigation]);

	useEffect(() => {
		if(navigation.dangerouslyGetParent){
			const parent = navigation.dangerouslyGetParent();
			parent.setOptions({
			  tabBarVisible: true
			});
			return () =>
			  parent.setOptions({
				tabBarVisible: true
			  });
		  }
	},[]);
	return(
		<>
		<Tab.Navigator
		  tabBarOptions={{
			labelStyle: { fontSize: 14, tintColor:ThemeColor.BtnColor,textTransform:'capitalize' },
			activeTintColor: ThemeColor.BtnColor,
			inactiveTintColor:ThemeColor.TextColor,
			indicatorStyle:{backgroundColor: ThemeColor.BtnColor},
			tabStyle: {  },
			style: { }
			}}
		>
			<Tab.Screen name="Current project" component={CurrectProjectScreen} />
			<Tab.Screen name="Past projects" component={PastProjectScreen} />
			
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
		</>
	);
}

export default ProjectHomeScreen;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor:'#E5E9EB',
	},
});

