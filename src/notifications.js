import messaging from '@react-native-firebase/messaging';
import {Alert} from 'react-native';

const requestUserPermission = async () => {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;
  if (enabled) {
    getFcmToken(); //<---- Add this
    console.log('Authorization status:', authStatus);
  }
};

const getFcmToken = async () => {
  const fcmToken = await messaging().getToken();
  if (fcmToken) {
    console.log(fcmToken);
  } else {
    console.log('Failed', 'No token received');
  }
};

messaging().setBackgroundMessageHandler(async remoteMessage => {
  Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
});

export {requestUserPermission};
