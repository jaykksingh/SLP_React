import React,{useEffect} from "react";
import { 
	StyleSheet, 
    SafeAreaView,
    View,
    Text,
    ScrollView,
} from "react-native";
import { ThemeColor , FontName} from '../../../_helpers/constants';
import Entypo from 'react-native-vector-icons/Entypo';

const TimesheetWorkflowScreen = ({route,navigation}) => {
	React.useLayoutEffect(() => {
		navigation.setOptions({
			  title: `Timesheet workflow `,
		});
	}, [navigation]);

	
	useEffect(() => {
		navigation.addListener('focus', () => {
		})		
	},[]);
    useEffect(() => {
		
	},[])
	
	
	return(
		<SafeAreaView style={{flex:1, margin:16}}>
            <ScrollView>
                <View style={{borderRadius:5, borderWidth:1, borderColor:ThemeColor.BorderColor, height:140}}>
                    <View style={{backgroundColor:'#D9534F', height:40, justifyContent:'center', borderTopLeftRadius:5,borderTopRightRadius:5, borderBottomLeftRadius:3, borderBottomRightRadius:3}}>
                        <Text style={{color:'white', fontFamily:FontName.Regular, fontSize:18, alignSelf:'center'}}>Pending/Draft</Text>
                    </View>
                    <View style={{flex:1, justifyContent:'center',paddingLeft:8, paddingRight:8}}>
                        <Text style={{color:ThemeColor.TextColor, fontFamily:FontName.Regular, fontSize:16, alignSelf:'center', textAlign:'center'}}>{"Pending/Draft timesheets must be submitted by you and are typically due at the end of each week"}</Text>
                    </View>
                </View>
                <View style={{justifyContent:'center', alignItems:'center'}}>
                    <Entypo name="arrow-down" color={ThemeColor.BorderColor} size={40,40} />
                </View>
                <View style={{borderRadius:5, borderWidth:1, borderColor:ThemeColor.BorderColor, height:280}}>
                    <View style={{backgroundColor:'#F8AC59', height:40, justifyContent:'center', borderTopLeftRadius:5,borderTopRightRadius:5, borderBottomLeftRadius:3, borderBottomRightRadius:3}}>
                        <Text style={{color:'white', fontFamily:FontName.Regular, fontSize:18, alignSelf:'center'}}>Upload timesheet</Text>
                    </View>
                    <View style={{flex:1, justifyContent:'center',paddingLeft:8, paddingRight:8}}>
                        <Text style={{color:ThemeColor.TextColor, fontFamily:FontName.Regular, fontSize:16, alignSelf:'center', textAlign:'center'}}>{"Upload Client/Manager approved timesheet"}</Text>
                    </View>
                    <View style={{ borderColor:ThemeColor.BorderColor, height:140}}>
                        <View style={{backgroundColor:'#F8AC59', height:40, justifyContent:'center',borderBottomLeftRadius:3, borderBottomRightRadius:3 }}>
                            <Text style={{color:'white', fontFamily:FontName.Regular, fontSize:18, alignSelf:'center'}}>Submitted hours</Text>
                        </View>
                        <View style={{flex:1, justifyContent:'center',paddingLeft:8, paddingRight:8}}>
                            <Text style={{color:ThemeColor.TextColor, fontFamily:FontName.Regular, fontSize:16, alignSelf:'center', textAlign:'center'}}>{"You have an option to enter hours even if the client has yet to provide an approved timesheet Upload approved timesheets to complete the submission process"}</Text>
                        </View>
                    </View>
                </View>
            
                <View style={{justifyContent:'center', alignItems:'center'}}>
                    <Entypo name="arrow-down" color={ThemeColor.BorderColor} size={40,40} />
                </View>
                <View style={{borderRadius:5, borderWidth:1, borderColor:ThemeColor.BorderColor, height:140}}>
                    <View style={{backgroundColor:'#1AB394', height:40, justifyContent:'center', borderTopLeftRadius:5,borderTopRightRadius:5, borderBottomLeftRadius:3, borderBottomRightRadius:3}}>
                        <Text style={{color:'white', fontFamily:FontName.Regular, fontSize:18, alignSelf:'center'}}>Approved</Text>
                    </View>
                    <View style={{flex:1, justifyContent:'center',paddingLeft:8, paddingRight:8}}>
                        <Text style={{color:ThemeColor.TextColor, fontFamily:FontName.Regular, fontSize:16, alignSelf:'center', textAlign:'center'}}>{"Your timesheet has been approved and submitted for billing"}</Text>
                    </View>
                </View>
            </ScrollView>
		</SafeAreaView>
	);
}

export default TimesheetWorkflowScreen;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
    },inputView:{
        flexDirection:'row',
        paddingLeft:16,
        paddingRight:16,
        height:40,
        alignItems:"center", 
        backgroundColor:ThemeColor.BorderColor
    
      },
      bottomView:{
        flexDirection:'row',
        paddingLeft:16,
        paddingRight:16,
        height:40,
        backgroundColor:'#fff',
        alignItems:"center",
    
      }
  });