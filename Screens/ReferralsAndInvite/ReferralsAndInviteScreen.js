import React ,{useEffect,useState}from 'react';
import { View ,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Alert,
	SafeAreaView,
    Text} from 'react-native';
import {ThemeColor, FontName } from '../../_helpers/constants';
import Feather from 'react-native-vector-icons/Feather';
import MovableView from 'react-native-movable-view';
import Icon from 'react-native-vector-icons/Ionicons';

const ReferralsAndInviteScreen = ({navigation})  => {

	React.useLayoutEffect(() => {
		navigation.setOptions({
		  title: "Referrals and invites",
		});
	}, [navigation]);

	
	return(
		<SafeAreaView style={styles.container}>
			<View style={{flex:1, marginTop:16}}> 
				<View style={{backgroundColor:'#fff', paddingLeft:16}}>
					<TouchableOpacity style={{height:40, alignItems:'center', flexDirection:'row',paddingRight:8}} onPress={() => navigation.navigate('ReferFriend')}>
						<Text style={{flex: 1,fontSize:16, color:ThemeColor.TextColor,fontFamily: FontName.Regular}}>Refer a friend</Text>
						<Feather name="chevron-right" color={ThemeColor.BorderColor} size={22} />
					</TouchableOpacity>
					<View style={{height:1, backgroundColor:ThemeColor.BorderColor, paddingLeft:16}}/>
				</View>
				<View style={{backgroundColor:'#fff', paddingLeft:16}}>
					<TouchableOpacity style={{height:40, alignItems:'center', flexDirection:'row',paddingRight:8}}  onPress={() => navigation.navigate('InviteFriend',{isFromEOB:false})}>
						<Text style={{flex: 1,fontSize:16, color:ThemeColor.TextColor,fontFamily: FontName.Regular}}>Invite a friend</Text>
						<Feather name="chevron-right" color={ThemeColor.BorderColor} size={22} />
					</TouchableOpacity>
					<View style={{height:1, backgroundColor:ThemeColor.BorderColor, paddingLeft:16}}/>
				</View>
				<View style={{backgroundColor:'#fff', paddingLeft:16}}>
					<TouchableOpacity style={{height:40, alignItems:'center', flexDirection:'row',paddingRight:8}}  onPress={() => navigation.navigate('ReferClient')}>
						<Text style={{flex: 1,fontSize:16, color:ThemeColor.TextColor,fontFamily: FontName.Regular}}>Refer a client</Text>
						<Feather name="chevron-right" color={ThemeColor.BorderColor} size={22} />
					</TouchableOpacity>
					<View style={{height:1, backgroundColor:ThemeColor.BorderColor, paddingLeft:16}}/>
				</View>
				<View style={{backgroundColor:'#fff', paddingLeft:16}}>
					<TouchableOpacity style={{height:40,alignItems:'center', flexDirection:'row',paddingRight:8}}  onPress={() =>navigation.navigate('ActivityHome')}>
						<Text style={{flex: 1,fontSize:16, color:ThemeColor.TextColor,fontFamily: FontName.Regular}}>Activity</Text>
						<Feather name="chevron-right" color={ThemeColor.BorderColor} size={22} />
					</TouchableOpacity>
					<View style={{height:1, backgroundColor:ThemeColor.BorderColor, paddingLeft:16}}/>
				</View>
				<View style={{backgroundColor:'#fff', paddingLeft:16}}>
					<TouchableOpacity style={{height:40, alignItems:'center', flexDirection:'row',paddingRight:8}} onPress={() => navigation.navigate('PayPalAccount')}>
						<Text style={{flex: 1,fontSize:16, color:ThemeColor.TextColor,fontFamily: FontName.Regular}}>PayPal account</Text>
						<Feather name="chevron-right" color={ThemeColor.BorderColor} size={22} />
					</TouchableOpacity>
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
		</SafeAreaView>
	);
}

export default ReferralsAndInviteScreen;

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
