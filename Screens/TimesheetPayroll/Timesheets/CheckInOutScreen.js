import React,{useEffect} from "react";
import { 
	StyleSheet, 
    SafeAreaView,
    View,
    Text,
    FlatList,
} from "react-native";
import { ThemeColor , FontName} from '../../../_helpers/constants';
import moment from 'moment';

const CheckInOutScreen = ({route,navigation}) => {
    const { timesheetDetails } = route.params;
	const { projectDetail } = route.params;
    const { dayDetails } = route.params;
    const {hoursArray, setHoursArray} = React.useState([]);
    const {hoursUpdated, setHoursUpdated} = React.useState(false);

	React.useLayoutEffect(() => {
		navigation.setOptions({
			  title: "Clock hours",
		});
	}, [navigation]);
	useEffect(() => {
		navigation.addListener('focus', () => {
		})		
	},[]);
    useEffect(() => {
		if(navigation.dangerouslyGetParent){
		  const parent = navigation.dangerouslyGetParent();
		  parent.setOptions({
			tabBarVisible: false
		  });
		  return () =>
			parent.setOptions({
			tabBarVisible: false
		  });
		}
		
	},[])
    const getFormatedDate=(dateValue) =>{
		let momentStartDate = moment(dateValue, 'YYYY-MM-DD');
		let startDateString = moment(momentStartDate).format('ddd, MMM DD, yyyy')
		return `${startDateString}`;
	}
    const getTotalHours = () => {
        let totalHours =  parseFloat(dayDetails.regHrs) + parseFloat(dayDetails.otHrs) + parseFloat(dayDetails.dtHrs);
        let total =  '' + totalHours;
        return total.length > 1 ? total : `${total}.00`
    }
	
	console.log('Day Detail: ', hoursArray);

	return(
		<SafeAreaView style={{flex:1}}>
            <View style={{flexDirection:'row',margin:16}}>
                <Text style={{fontSize:16, fontFamily:FontName.Bold, color:ThemeColor.TextColor, flex:1}}>{getFormatedDate(dayDetails.day)}</Text>
                <View style={{flexDirection:'row'}}>
                    <Text style={{fontSize:16, fontFamily:FontName.Regular, color:ThemeColor.SubTextColor}}>Total hours: </Text>
                    <Text style={{fontSize:16, fontFamily:FontName.Bold, color:ThemeColor.TextColor}}>{getTotalHours()}</Text>
                </View>
            </View>
            <View style ={{backgroundColor:'white', marginBottom:16}}>
                <View style ={{flexDirection:'row', marginBottom:1, justifyContent: 'center', alignItems: 'center', alignContent:'center'}}>
                    <View style={{height:30, width:80, flexDirection:'row',justifyContent: 'center',alignItems: 'center'}}>
                        <Text style={{color:ThemeColor.SubTextColor,fontSize:12, textAlign: 'center', flex: 1}}>IN</Text>
                        <View style={{backgroundColor:ThemeColor.BorderColor, height:30, width:1}}/>
                    </View>
                    <View style={{height:30, width:80, flexDirection:'row',justifyContent: 'center',alignItems: 'center'}}>
                        <Text style={{color:ThemeColor.SubTextColor,fontSize:12, textAlign: 'center', flex: 1}}>OUT</Text>
                        <View style={{backgroundColor:ThemeColor.BorderColor, height:30, width:1}}/>
                    </View>
                    <View style={{height:30, width:80, flexDirection:'row',justifyContent: 'center',alignItems: 'center'}}>
                        <Text style={{color:ThemeColor.SubTextColor,fontSize:12, textAlign: 'center', flex: 1}}>Type</Text>
                        <View style={{backgroundColor:ThemeColor.BorderColor, height:30, width:1}}/>
                    </View>
                    <View style={{height:30, flex:1, flexDirection:'row',justifyContent: 'center',alignItems: 'center'}}>
                        <Text style={{color:ThemeColor.SubTextColor,fontSize:12, textAlign: 'center', flex: 1}}>NOTES</Text>
                        <View style={{backgroundColor:ThemeColor.BorderColor, height:30, width:1}}/>
                    </View>
                </View>
                <View style={{backgroundColor:ThemeColor.BorderColor, height:1}}/> 
            </View>
            <FlatList
                style={{flex: 1}}
                data={hoursArray}
                scrollEnabled={false}
                keyExtractor={(item, index) => index.toString()}
                randomUpdateProp={hoursUpdated}
                renderItem={({item, index}) => 
                <View>
                     <View style={{height:30, width:80, flexDirection:'row',justifyContent: 'center',alignItems: 'center'}}>
                            <Text style={{color:ThemeColor.SubTextColor,fontSize:12, textAlign: 'center', flex: 1}}>IN</Text>
                            <View style={{backgroundColor:ThemeColor.BorderColor, height:30, width:1}}/>
                        </View> 
                </View>
            }/>	
		</SafeAreaView>
	);
}

export default CheckInOutScreen;

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