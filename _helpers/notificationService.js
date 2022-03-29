import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import './global';


export async function requestUserPermission() {
    const authStatus = await messaging().requestPermission();
    const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
        console.log('Authorization status:', authStatus);
        getFCMToken();
    }
}

const getFCMToken = async () => {
    let fcmToken = await AsyncStorage.getItem('fcmToken');
    console.log(fcmToken, "The old token");
    if (!fcmToken) {
        fcmToken = await messaging().getToken();
        try {
            if (fcmToken) {
                console.log(fcmToken, 'The new genrated token');
                await AsyncStorage.setItem('fcmToken', fcmToken);
            }
        } catch (error) {
            console.log(error, "error raised in fcmToken")
        }
    }else{
        global.pushToken = fcmToken;
    }
}