import React ,{useEffect} from "react";
import { StyleSheet, 
    Text,
    TouchableOpacity,
    View,
    FlatList} from "react-native";
import Loader from '../../../components/Loader';
import { ThemeColor, FontName } from '../../../_helpers/constants';
import Feather from 'react-native-vector-icons/Feather';


const TimesheetFrequencyScreen = ({route,navigation}) => {
	const [isLoading,setIsLoading] = React.useState(false);
	
	const { projectDetail } = route.params;
	const { timesheetDetails } = route.params;

  
	const  frequencyArray  = ['Bi-Weekly','Date Range','Monthly','Semi-Monthly','Special Cycle','Weekly'];
	const [data,setData] = React.useState({
		selectedFrequency: '',
	});

	React.useLayoutEffect(() => {
		navigation.setOptions({
			title: 'Frequency change request',
	  	});
	}, [navigation]);
  
  
  useEffect(() => {
    console.log('timesheetDetails',timesheetDetails);
    setData({...data,selectedFrequency:projectDetail.timeSheetCycle});
    if(navigation.dangerouslyGetParent()){
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
 
  const handleRequestChangeBtn = () =>{
    navigation.goBack();
    route.params.onClickEvent(data.selectedFrequency);
  }
  return (
    <View style={styles.container}>
    	<FlatList style={{}}
			data={frequencyArray}
			keyExtractor={(item, index) => index.toString()}
			renderItem={({item}) => 
				<View style={{ paddingLeft:16, backgroundColor:'#fff'}}>
					<TouchableOpacity style={{ height:40,flexDirection:'row', alignItems:'center', paddingRight:16}} onPress={() => {setData({...data,selectedFrequency:item})}}>
						<Text style={{fontFamily: FontName.Regular, fontSize:14, color:ThemeColor.TextColor, flex:1}}>{item}</Text>
						{data.selectedFrequency == item && <Feather name="check" color={ThemeColor.BtnColor} size={20,20} /> }
					</TouchableOpacity>
					<View style={{backgroundColor:ThemeColor.BorderColor, height:1}}/>
				</View>
			}
		/> 
		<View style={{flexDirection:'row',borderRadius:5,marginTop:8, marginLeft:16,marginRight:16, marginBottom:34}}>
			<TouchableOpacity style={styles.btnFill} onPress = {() => {handleRequestChangeBtn()}}>
				<Text style={{color:'#53962E',fontFamily: FontName.Regular, fontSize:16, color:'#fff' }}>CHANGE REQUEST</Text>
			</TouchableOpacity>
		</View>
        
        <Loader isLoading={isLoading} />
	</View>
	);
}

export default TimesheetFrequencyScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:'#E5E9EB',
  },inputText:{
    flex: 1,
    height:40,
    color:'black',
    fontSize:16,
    fontFamily: FontName.Regular,
    marginLeft:8,
    alignContent:'stretch',
  },
  labelText:{
    flex: 1,
    color:'black',
    fontSize:16,
    fontFamily: FontName.Regular,
    marginLeft:8,
    alignContent:'stretch',
  },btnFill:{
    flex: 1,
    height:50,
    justifyContent:"center",
    backgroundColor: ThemeColor.BtnColor ,
    alignItems:'center',
    borderRadius:5
  },chipTitle: {
    fontSize: 14,
    paddingLeft:8,
    paddingRight:8
  },chipItem: {
    padding: 4,
    marginVertical: 4,
    marginHorizontal: 8,
    borderRadius:20,
    borderColor:ThemeColor.BtnColor,
    borderWidth:1,
  },footer: {
    position:'absolute',
    bottom:0,
    flex: 1,
    backgroundColor: ThemeColor.ViewBgColor,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingBottom:16,
    height:'80%',
    width:'100%', 
    borderColor:ThemeColor.ViewBgColor,
    borderWidth:1,
    alignItems:'center',
  },
  containerContent: {marginTop: 140, height:200},
  containerHeader: {
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    backgroundColor: 'green',
    marginTop:100
  },
  headerContent:{
    marginTop: 0,
  },

}); 