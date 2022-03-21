import React ,{useEffect,useState}from 'react';
import { View ,
    useWindowDimensions,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Alert,
    Text} from 'react-native';
import {ThemeColor , FontName} from '../../_helpers/constants';
import Feather from 'react-native-vector-icons/Feather';
import Icon from 'react-native-vector-icons/Ionicons';
import { AuthContext } from '../../Components/context';
import MovableView from 'react-native-movable-view';

const InviteFriendScreen = ({navigation, route})  => {

	const {isFromEOB} = route.params;
    const { skipEOB } = React.useContext(AuthContext);

	React.useLayoutEffect(() => {
		navigation.setOptions({
		  title: "Invite a friend",
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

	},[])

	const handleDoItLater = () => {

	}
	const howMuchFit = 1;
	const subText = 'Invite your contacts in a single step to refer friends and colleagues. All contact information is kept secure and never sold or distributed.';
	return(
		<SafeAreaView style={styles.container}>
			<View style={{justifyContent:'center', alignItems: 'center', padding:16, flex: 1}}>
				<Text style={{color:ThemeColor.TextColor,fontFamily: FontName.Regular,fontSize:18, marginTop:16, textAlign: 'center'}}>Invite your contacts and get paid when they are hired!</Text>
				<Text style={{color:ThemeColor.SubTextColor,fontFamily: FontName.Italic,fontSize:14, marginTop:8, textAlign: 'center',}}>{subText}</Text>
				
				<TouchableOpacity style={styles.btnFill} onPress={() => navigation.navigate('EmailInvite')}>
					<Text style={{color:'white',fontFamily: FontName.Regular, fontSize:16, color:'#fff' }}>GET STARTED</Text>
				</TouchableOpacity>
			</View>
			{isFromEOB && 
				<TouchableOpacity style={[styles.btnDoItLater]} onPress={() => {skipEOB()}}>
					<Text	Text style={{color:ThemeColor.BtnColor,fontFamily: FontName.Regular, fontSize:14 }}>DO IT LATER</Text>
				</TouchableOpacity>
			}
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

export default InviteFriendScreen;

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
      },btnDoItLater:{
		width:'90%',
		height:50,
		margin:16,
		justifyContent:"center",
		backgroundColor: '#fff', 
		alignItems:'center',
		borderRadius:5
	  }
  });
