import React,{useEffect,createRef} from "react";
import { 
	Text, 
    TouchableOpacity,
    StyleSheet, 
    View,
	SafeAreaView,
	Platform,
} from "react-native";
import Feather from 'react-native-vector-icons/Feather';
import {Picker} from '@react-native-picker/picker';
import ActionSheet from "react-native-actions-sheet";
import { ThemeColor, FontName } from '../../../_helpers/constants';
import Loader from '../../../Components/Loader';

const projectRef = createRef();


const SelectProjectScreen = ({route,navigation}) => {
	const [isLoading, setIsLoading] = React.useState(false);

	const [data,setData] = React.useState({
		projectName:'',
		projectId:'',
        selectedIndex:0
	});
	const { timesheetsArray } = route.params;
	const { onClickEvent } = route.params;

	
	const [projectDetail, setProjectDetail] = React.useState({});

	React.useLayoutEffect(() => {
		navigation.setOptions({
			  title: 'Select project',
		});
	}, [navigation]);

    useEffect(() => {
		console.log(onClickEvent);
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
//    navigation.navigate('EditTimesheet',{preTimesheetDetails:item,preProjectDetail:timesheetsArray[index]})

    const handleNextClick = () => {
        console.log(`Selected Project: ${JSON.stringify(data)}`);
		navigation.goBack();
		route.params.onClickEvent(timesheetsArray[data.selectedIndex]);
    }

	
	return(
		<SafeAreaView style={styles.container}>
			<View style={{flex:1}}>
			{Platform.OS === 'ios' ? 
				<View style={{marginTop:12}}>
                    <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:16}}>Project</Text>
                    <TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}} onPress={() => {projectRef.current?.setModalVisible()}}>
                        <Text style={[styles.labelText,{color:data.projectName.length > 0 ? 'black' : ThemeColor.PlaceHolderColor}]}>{data.projectName.length >0 ? data.projectName : 'Select project'}</Text>
                        <Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22,22} />
                    </TouchableOpacity>
                </View> :

				<View style={{marginTop:12}}>
                    <Text style ={{color:ThemeColor.SubTextColor, fontSize:14,height:22, fontFamily:FontName.Regular, paddingLeft:16}}>Project</Text>
                    <TouchableOpacity style={{backgroundColor:'white', height:40, borderRadius:5, flexDirection:'row', alignItems:'center', paddingRight:8}}>
						<Picker
							style={{backgroundColor: 'white',flex:1,fontSize:14, fontFamily: FontName.Regular}}
							itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
							selectedValue={data.projectId}
							onValueChange={(itemValue, index) =>{
								let selectedObj = timesheetsArray[index];
								setData({...data,projectId:selectedObj.projectDetailId,projectName:selectedObj.projectName,selectedIndex:index});
							}}>
							{timesheetsArray && timesheetsArray.map((item, index) => {
								return (<Picker.Item label={item.projectName} value={item.projectDetailId} key={index}/>) 
							})}
						</Picker>                        
						<Feather name="chevron-right" color={ThemeColor.SubTextColor} size={22,22} />
                    </TouchableOpacity>
                </View> }
            </View>
            {data.projectName.length > 0 ?
            <View style={{flexDirection:'row',borderRadius:5, marginTop:8, marginLeft:16, marginRight:16,}}>
				<TouchableOpacity style={styles.btnFill} onPress={() => {handleNextClick()}}>
				<Text style={{color:'#53962E',fontFamily: FontName.Regular, fontSize:16, color:'#fff' }}>NEXT</Text>
				</TouchableOpacity>
			</View> : null }
			<Loader isLoading={isLoading} />
			<ActionSheet ref={projectRef} containerStyle={{backgroundColor:ThemeColor.ViewBgColor}}>
				<View style={{height:300}}>
					<View style={{height:60, flexDirection:'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft:16,paddingRight:16}}>
					<TouchableOpacity onPress={() => {projectRef.current?.setModalVisible()}}>
						<Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Cancel</Text>
					</TouchableOpacity>
					<Text style={{color:ThemeColor.TextColor, fontSize:16, fontFamily: 'Lato-Bold'}}>Select project</Text>
					<TouchableOpacity onPress={() => {
						data.projectName.length == 0 ? setData({...data,projectId:timesheetsArray[0].projectDetailId,projectName:timesheetsArray[0].projectName,selectedIndex:0}) : '';
						projectRef.current?.setModalVisible()}
					}>
						<Text style={{color:ThemeColor.BtnColor, fontSize:16, fontFamily: FontName.Regular}}>Done</Text>
					</TouchableOpacity>
					</View>
					<Picker
						style={{backgroundColor: 'white',flex:1,fontSize:14, fontFamily: FontName.Regular}}
						itemStyle={{fontSize:16, fontFamily:FontName.Regular}}
						selectedValue={data.projectId}
						onValueChange={(itemValue, index) =>{
							let selectedObj = timesheetsArray[index];
                            setData({...data,projectId:selectedObj.projectDetailId,projectName:selectedObj.projectName,selectedIndex:index});
						}}>
						{timesheetsArray && timesheetsArray.map((item, index) => {
							return (<Picker.Item label={item.projectName} value={item.projectDetailId} key={index}/>) 
						})}
					</Picker>
				</View>
			</ActionSheet>      
		</SafeAreaView>
	);
}

export default SelectProjectScreen;

const styles = StyleSheet.create({
    container: {
		flex: 1,
		backgroundColor:ThemeColor.ViewBgColor,
	},
	inputView:{
        flexDirection:'row',
        paddingLeft:16,
        paddingRight:16,
        height:40,
        alignItems:"center", 
        backgroundColor:ThemeColor.BorderColor
    },
    inputText:{
		flex: 1,
		height:40,
		color:'black',
		fontSize:14,
		fontFamily: FontName.Regular,
		marginLeft:8,
		alignContent:'stretch',
	},inputHour:{
		flex:1,
		color:ThemeColor.TextColor,
		fontSize:12,
		fontFamily: FontName.Regular,
		marginLeft:8,
		textAlign: 'center'
	},labelText:{
		flex: 1,
		color:'black',
		fontSize:14,
		fontFamily: FontName.Regular,
		marginLeft:16,
		alignContent:'stretch',
	},btnUpload:{
		flex: 1,
		height:45,
		justifyContent:"center",
		backgroundColor: ThemeColor.BtnColor ,
		alignItems:'center',
	},btnFill:{
		flex: 1,
		height:45,
		justifyContent:"center",
		backgroundColor: ThemeColor.BtnColor ,
		alignItems:'center',
        borderRadius:5,
		marginBottom:8
	}
  });