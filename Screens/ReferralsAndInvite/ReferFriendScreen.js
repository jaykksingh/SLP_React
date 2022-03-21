import React ,{useEffect,useState}from 'react';
import { View ,
    useWindowDimensions,
    TouchableOpacity,
    StyleSheet,
    Image,
    Alert,
	SafeAreaView,
    Text} from 'react-native';
import {ThemeColor } from '../../_helpers/constants';
import Feather from 'react-native-vector-icons/Feather';
import Icon from 'react-native-vector-icons/Ionicons';
import MovableView from 'react-native-movable-view';

const ReferFriendScreen = ({navigation})  => {

	React.useLayoutEffect(() => {
		navigation.setOptions({
		  title: "Refer a friend",
		});
	}, [navigation]);
	useEffect(() => {
		if(navigation.dangerouslyGetParent()){
		  const parent = navigation.dangerouslyGetParent();
		  parent.setOptions({
			tabBarVisible: false
		  });
		  return () =>
			parent.setOptions({
			tabBarVisible: true
		  });
		}

	},[])
	const howMuchFit = 1;
	const subText = 'Note: Simply invite your contacts to receive a payment when your referral gets the job. Any contacts you share will be kept secure and never sold, shared or spammed. ';
	return(
		<SafeAreaView style={styles.container}>
			<View style={{justifyContent:'center', alignItems: 'center', padding:16,flex:1}}>
				<Image style={{ width:60, height:60 }} source={require('../../assets/Images/icon-phone-book.png')} />
				<Text style={{color:ThemeColor.TextColor,fontFamily: 'Lato-Regular',fontSize:16, marginTop:16}}>Get paid when those you refer get hired</Text>
				<Text style={{color:ThemeColor.SubTextColor,fontFamily: 'Lato-Italic',fontSize:14, marginTop:8, textAlign: 'center',}}>{subText}</Text>
				<View style={{ marginTop:32, flexDirection:'row',width:'100%',}}>
					<View style={{backgroundColor:'gray', height:1, width:'80%', position:'absolute', top:30, marginLeft:32, marginRight:32}}/>
					<View style={{ flex:1,justifyContent: 'center',alignItems: 'center'}}>
						<View style={{ backgroundColor:'gray', height:34, width:34, borderRadius:17, justifyContent: 'center',alignItems: 'center',marginTop:12}}>
							<Text style={{color:'white',fontFamily: 'Lato-Regular',fontSize:16}}>1</Text>
						</View>
						<Text style={{color:ThemeColor.TextColor,fontFamily: 'Lato-Regular',fontSize:12, textAlign: 'center', marginTop:4}}>Refer your contact</Text>

					</View>
					<View style={{ flex:1, justifyContent: 'center',alignItems: 'center'}}>
						<View style={{ backgroundColor:'gray', height:34, width:34, borderRadius:17, justifyContent: 'center',alignItems: 'center',marginTop:12}}>
							<Text style={{color:'white',fontFamily: 'Lato-Regular',fontSize:16}}>2</Text>
						</View>
						<Text style={{color:ThemeColor.TextColor,fontFamily: 'Lato-Regular',fontSize:12, textAlign: 'center', marginTop:4}}>Job offered to contact</Text>
					</View>
					<View style={{ flex:1,justifyContent: 'center',alignItems: 'center'}}>
						<View style={{ backgroundColor:'gray', height:34, width:34, borderRadius:17, justifyContent: 'center',alignItems: 'center'}}>
							<Text style={{color:'white',fontFamily: 'Lato-Regular',fontSize:16}}>3</Text>
						</View>
						<Text style={{color:ThemeColor.TextColor,fontFamily: 'Lato-Regular',fontSize:12, textAlign: 'center', marginTop:4}}>Contact get hired</Text>

					</View>
					<View style={{ flex:1,justifyContent: 'center',alignItems: 'center'}}>
						<View style={{ backgroundColor:'gray', height:34, width:34, borderRadius:17, justifyContent: 'center',alignItems: 'center'}}>
							<Text style={{color:'white',fontFamily: 'Lato-Regular',fontSize:16}}>4</Text>
						</View>
						<Text style={{color:ThemeColor.TextColor,fontFamily: 'Lato-Regular',fontSize:12, marginTop:4}}>You get paid </Text>

					</View>
				</View>
				<TouchableOpacity style={styles.btnFill} onPress={() => navigation.navigate('ReferContact')}>
					<Text style={{color:'white',fontFamily: 'Lato-Regular', fontSize:16, color:'#fff' }}>GET STARTED</Text>
				</TouchableOpacity>
			</View>
			<MovableView>
				<TouchableOpacity style={{
					position: 'absolute',
					margin: 16,
					right: 0,
					bottom:100,
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

export default ReferFriendScreen;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:'#E5E9EB' ,
	  justifyContent: 'center',
	  alignItems: 'center',
    },btnFill:{
        width:200,
        marginTop: 32,
		marginBottom:48,
        height:40,
        justifyContent:"center",
        backgroundColor:'#fff' ,
        alignItems:'center',
        borderRadius:5,
		backgroundColor:ThemeColor.BtnColor
      }
  });
