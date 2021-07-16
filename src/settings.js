/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {View, Text, Pressable} from 'react-native';
import styles from './styles';
import Topbar from './Topbar';
import {ip} from './constant'

const SettingsView = ({token, setToken}) => {
  const signOut = () => {
    const _signOut = async () => {
      const fcm_token = await AsyncStorage.getItem('@fcm_token');
      const result = await axios({
        method: 'POST',
        url: `http://${ip}/api/v1/auth/logout`,
        headers: {
          Authorization: 'Token ' + token,
        },
        data: {
          fcm_token: fcm_token,
        },
      }).catch(err => console.log(err));
      if (result) {
        await AsyncStorage.removeItem('@fcm_token');
        await AsyncStorage.removeItem('@auth_token');
        setToken(null);
      }
    };
    _signOut();
  };

  return (
    <>
      <View style={styles.settingsView}>
        <Text
          style={{
            fontFamily: 'Poppins-Medium',
            fontSize: 24,
          }}>
          Settings
        </Text>
        <Pressable
          style={{
            borderRadius: 60,
            overflow: 'hidden',
            marginTop: 20,
          }}
          onPress={signOut}>
          <Text
            style={{
              backgroundColor: '#e64d00',
              textAlign: 'center',
              color: 'white',
              fontSize: 16,
              width: 300,
              paddingVertical: 5,
              paddingTop: 7,
              fontFamily: 'Poppins-Medium',
            }}>
            Sign Out
          </Text>
        </Pressable>
      </View>
    </>
  );
};

export default SettingsView;
