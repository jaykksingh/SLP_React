import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'

export function parseErrorMessage(errorObject) {
    console.log(errorObject);
    let message = '';
    const msgList = Object.values(errorObject);
    console.log(msgList);

    for(i=1 ; i <= msgList.length ; i++) {
      let newMsg = `${i}. ${msgList[i-1]}`;
      message = `${message} ${message.length > 0 ? '\n' : ''} ${newMsg}`;
    }
    return message;
}
export function parseErrorATS(errorObject) {
  console.log(errorObject);
  let message = '';
  const msgList = Object.values(errorObject);
  console.log(msgList);

  for(i=1 ; i <= msgList.length ; i++) {
    let newMsg = `${i}. ${msgList[i-1]}`;
    message = `${message} ${message.length > 0 ? '\n' : ''} ${newMsg}`;
  }
  return message;
}

export async function isLoggedIn() {
  let user =  AsyncStorage.getItem('loginDetails'); 
  if(user){
    console.log('User Logged In');
    return true;
  }else{
    console.log('NOT Logged In');
    return false;
  } 

}

