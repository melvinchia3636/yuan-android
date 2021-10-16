import messaging from '@react-native-firebase/messaging';
import {Alert} from 'react-native';
import axios from 'axios';
import {ip} from './constant';
import AsyncStorage from '@react-native-async-storage/async-storage';

const requestUserPermission = async token => {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;
  if (enabled) {
    getFcmToken(token); //<---- Add this
    console.log('Authorization status:', authStatus);
  }
};

const getFcmToken = async token => {
  const fcmToken = await messaging().getToken();
  if (fcmToken) {
    axios({
      url: `https://${ip}/api/v1/notifications/add-token`,
      method: 'PUT',
      headers: {
        Authorization: 'Token ' + token,
      },
      data: {
        token: fcmToken,
      },
    }).catch(err => console.log(err));
    AsyncStorage.setItem('@fcm_token', fcmToken);
  } else {
    console.log('Failed', 'No token received');
  }
};

messaging().setBackgroundMessageHandler(async remoteMessage => {
  Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
});

export {requestUserPermission};
