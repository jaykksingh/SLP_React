import { logedUser } from '../_helpers/logedinUser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'
import './global'

export async function getAuthorizationToken() {

  let user = await AsyncStorage.getItem('loginDetails');  
  let parsed = JSON.parse(user);  
  let userAuthToken = 'StaffLine@2017:' + parsed.userAuthToken;
  var encoded = base64.encode(userAuthToken);
  console.log('Authorization Token:',encoded);

  return encoded;

}


export function authHeader() {
  return {
    "content-type": "application/json",
    "Authorization": "U3RhZmZMaW5lQDIwMTc=",
    "OS": "iOS",
    "Deviceid": global.pushToken,
    "Version": "2.5.27",
    "Platform": "Mobile",
    "GeoLat": "1",
    "GeoLong": "1"
  };
}
export function getAuthHeader(authToken) {
  return {
    "content-type": "application/json",
    "Authorization": authToken,
    "OS": "iOS",
    "Deviceid": global.pushToken,
    "Version": "2.5.27",
    "Platform": "Mobile",
    "GeoLat": "1",
    "GeoLong": "1"
  };
}
export function getElasticHeader() {
  return {
    "content-type": "application/json",
    "Authorization": "sda43WfR797sWQE",
    "sdSecKey": "sda43WfR797sWQE"
  };
}
export function authFreeHeader() {
  console.log('Get Auth Token');
  return {
    "content-type": "application/json",
    "Authorization": "U3RhZmZMaW5lQDIwMTc=",
    "OS": "iOS",
    "Deviceid": global.pushToken,
    "Version": "2.5.27",
    "Platform": "Mobile",
    "GeoLat": "1",
    "GeoLong": "1"
  };
}
export function getUserID() {
  // return authorization header with basic auth credentials
  let user = JSON.parse(localStorage.getItem('user'));
  if (user && user.user.id) {
    return user.user.id;
  } else {
      return {};
  }
}

export function authHeaderMultipart() {
  // return authorization header with basic auth credentials
  let user = JSON.parse(localStorage.getItem('user'));

  if (user && user.accessToken) {
    return { 'Content-Type': 'multipart/form-data', 'x-access-token':user.accessToken };
  } else {
      return {};
  }
}

export function accessToken() {
  // return authorization header with basic auth credentials
  let user = JSON.parse(localStorage.getItem('user'));
  if (user && user.accessToken) {
      return { 'Content-Type': 'application/json', 'x-access-token':user.accessToken };
  } else {
      return {};
  }
}


