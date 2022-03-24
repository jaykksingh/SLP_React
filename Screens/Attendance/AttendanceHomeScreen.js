import React ,{useEffect}from 'react';
import { View ,
	TouchableOpacity,
	StyleSheet,
	Alert} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { ThemeColor } from '../../_helpers/constants';

import MyregularizationScreen from './MyregularizationScreen';
import LeaveCalenderScreen from '../Leave/LeaveCalenderScreen';
import AttendancePendingScreen from './AttendancePendingScreen';

const Tab = createMaterialTopTabNavigator();

const AttendanceHomeScreen = ({navigation})  => {
	let [selectedIndex, setSelectedIndex] = React.useState(0);

	React.useLayoutEffect(() => {
		navigation.setOptions({
			headerRight: () => (
				<View style={{flexDirection:'row'}}>
					<TouchableOpacity style={{marginRight:16}} onPress={() => {navigation.navigate('AddRegularization')}}>
						<Feather name="plus" color={'white'} size={25,25} />
					</TouchableOpacity>
				</View>
			),
			title :'Attendance'
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
			swipeEnabled={false}
			tabBarOptions={{
				labelStyle: { fontSize: 12, tintColor:ThemeColor.BtnColor,textTransform:'capitalize' },
				activeTintColor: ThemeColor.BtnColor,
				inactiveTintColor:ThemeColor.TextColor,
				indicatorStyle:{backgroundColor: ThemeColor.BtnColor},
				tabStyle: {  },
				style: { tintColor:ThemeColor.BtnColor},
			}}
		>
			<Tab.Screen name="My Regularization" component={MyregularizationScreen} />
			<Tab.Screen name="Calendar" component={LeaveCalenderScreen} />
			<Tab.Screen name="Pending my approvals" component={AttendancePendingScreen} />
		</Tab.Navigator>
	);
}

export default AttendanceHomeScreen;

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
