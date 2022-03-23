import React ,{useEffect,useState}from 'react';
import { View ,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Alert,
    Text} from 'react-native';
import {ThemeColor , FontName} from '../../_helpers/constants';
import Feather from 'react-native-vector-icons/Feather';
import MovableView from 'react-native-movable-view';
import Icon from 'react-native-vector-icons/Ionicons';

const ResourceHomeScreen = ({navigation})  => {

	React.useLayoutEffect(() => {
		navigation.setOptions({
		  title: "Resources",
		});
	}, [navigation]);

	return(
		<View style={styles.container}>
			<View style={{flex:1}}>
				<View style={{backgroundColor:'#fff', paddingLeft:16, marginTop:16}}>
					<TouchableOpacity style={{height:40, alignItems:'center', flexDirection:'row',paddingRight:8}} onPress={() => navigation.navigate('InterviewTips')}>
						<Text style={{flex: 1,fontSize:16, color:ThemeColor.TextColor,fontFamily: FontName.Regular}}>Interview tips</Text>
						<Feather name="chevron-right" color={ThemeColor.BorderColor} size={22,22} />
					</TouchableOpacity>
					<View style={{height:1, backgroundColor:ThemeColor.BorderColor, paddingLeft:16}}/>
				</View>
				<View style={{backgroundColor:'#fff', paddingLeft:16}}>
					<TouchableOpacity style={{height:40, alignItems:'center', flexDirection:'row',paddingRight:8}} onPress={() => navigation.navigate('FormsAndPolicy')}>
						<Text style={{flex: 1,fontSize:16, color:ThemeColor.TextColor,fontFamily: FontName.Regular}}>Forms & Policies</Text>
						<Feather name="chevron-right" color={ThemeColor.BorderColor} size={22,22} />
					</TouchableOpacity>
					<View style={{height:1, backgroundColor:ThemeColor.BorderColor, paddingLeft:16}}/>
				</View>
				<View style={{backgroundColor:'#fff', paddingLeft:16}}>
					<TouchableOpacity style={{height:40, alignItems:'center', flexDirection:'row',paddingRight:8}} onPress={() => navigation.navigate('HolidaySchedule')}>
						<Text style={{flex: 1,fontSize:16, color:ThemeColor.TextColor,fontFamily: FontName.Regular}}>Holiday schedule</Text>
						<Feather name="chevron-right" color={ThemeColor.BorderColor} size={22,22} />
					</TouchableOpacity>
					<View style={{height:1, backgroundColor:ThemeColor.BorderColor, paddingLeft:16}}/>
				</View>
				<View style={{backgroundColor:'#fff', paddingLeft:16}}>
					<TouchableOpacity style={{height:40, alignItems:'center', flexDirection:'row',paddingRight:8}} onPress={() => navigation.navigate('NewsScreen')}>
						<Text style={{flex: 1,fontSize:16, color:ThemeColor.TextColor,fontFamily: FontName.Regular}}>News</Text>
						<Feather name="chevron-right" color={ThemeColor.BorderColor} size={22,22} />
					</TouchableOpacity>
					<View style={{height:1, backgroundColor:ThemeColor.BorderColor, paddingLeft:16}}/>
				</View>
			</View>
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
		</View>
	);
}

export default ResourceHomeScreen;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:'#E5E9EB' 
    }
  });
