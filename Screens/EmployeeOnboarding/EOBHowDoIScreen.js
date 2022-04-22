import 'react-native-gesture-handler';
import React ,{useEffect}from 'react';
import { View ,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Alert,
	Image,
    Text} from 'react-native';
	
import Feather from 'react-native-vector-icons/Feather';
import PagerView from 'react-native-pager-view';

import { AuthContext } from '../../Components/context';
import { StaticMessage, ThemeColor , FontName} from '../../_helpers/constants';
import Loader from '../../Components/Loader';


const EOBHowDoIScreen = ({navigation})  => {
    const { signOut } = React.useContext(AuthContext);
    let [isLoading, setIsLoading] = React.useState(false);

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                 <TouchableOpacity style={{marginRight:16}} onPress={() => showLogOutAlert()}>
                   <Feather name="more-vertical" color={'white'} size={25} />
                </TouchableOpacity>
            ),
			title: 'Manage timesheets',
        });
    }, [navigation]);
    const showLogOutAlert = () =>{
        console.log('Log Out')
        Alert.alert('Are you sure want to log out?',null,
            [{
              text: 'Cancel',
            },{
                text: 'Log out',
                onPress: () => signOut()
              }]
          )
    }
    const SessionExpiredAlert = () =>{
  
        Alert.alert(StaticMessage.AppName,StaticMessage.SessionExpired,
            [{
              text: 'Ok',
              onPress: () => signOut()
          }]
      ) 
  }

    useEffect(() => {
        navigation.addListener('focus', () => {
		});
    },[]);
    
    
   
    return (
      <SafeAreaView style={styles.container}>
			  <PagerView style={styles.pagerView} initialPage={0}>
					<View key="1" styles={{backgroundColor:'red', flex:1}}>
            <View style={{flexDirection:'row',justifyContent: 'center',alignItems: 'center', marginTop:32}}>
              <View style={{width:10, height:10, borderRadius:5, backgroundColor:ThemeColor.NavColor, marginRight:8, borderColor:ThemeColor.NavColor, borderWidth:1}}/>
              <View style={{width:10, height:10, borderRadius:5, backgroundColor:'#fff', marginRight:8, borderColor:ThemeColor.NavColor, borderWidth:1}}/>
            </View>
            <Text style={{fontFamily:FontName.Regular, fontSize:18, color:ThemeColor.TextColor, textAlign:'center',marginTop:24}}>Fill a timesheet</Text>
						<Image resizeMode='contain' style={{width:'100%'}} source={require('../../assets/Images/CorrectATimesheet.gif')} />
					</View>
					<View key="2">
              <View style={{flexDirection:'row',justifyContent: 'center',alignItems: 'center', marginTop:32}}>
                <View style={{width:10, height:10, borderRadius:5, backgroundColor:'#fff', marginRight:8, borderColor:ThemeColor.NavColor, borderWidth:1}}/>
                <View style={{width:10, height:10, borderRadius:5, backgroundColor:ThemeColor.NavColor, marginRight:8, borderColor:ThemeColor.NavColor, borderWidth:1}}/>
              </View>
              <Text style={{fontFamily:FontName.Regular, fontSize:18, color:ThemeColor.TextColor, textAlign:'center',marginTop:24}}>Correct a timesheet</Text>

						<Image resizeMode='contain' style={{width:'100%'}} source={require('../../assets/Images/FillATimesheet.gif')} />
					</View>
				</PagerView>
        <TouchableOpacity style={[styles.btnFill]} onPress={() => {navigation.navigate('InviteAFriend',{isFromEOB:true})}}>
					<Text style={{color:'#53962E',fontFamily: FontName.Regular, fontSize:14, color:'#fff' }}>NEXT</Text>
				</TouchableOpacity>
        <Loader isLoading={isLoading} />

    	</SafeAreaView>
		
    );
  };

export default EOBHowDoIScreen;


const styles = StyleSheet.create({
    container: {
		flex: 1,
		padding: 16
	},btnFill:{
		height:50,
    margin:16,
		justifyContent:"center",
		backgroundColor: ThemeColor.BtnColor ,
		alignItems:'center',
		borderRadius:5
	  },pagerView: {
		flex: 1,
	  }
  });

    