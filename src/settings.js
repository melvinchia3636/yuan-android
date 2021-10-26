/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {View, Text, Pressable} from 'react-native';
import styles from './styles';
import Topbar from './Topbar';
import {ip} from './constant';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {useTranslation} from 'react-i18next';
import {useState, useEffect} from 'react';
import DropDownPicker from 'react-native-dropdown-picker';

const LANGUAGES = [
  {code: 'en', label: 'English'},
  {code: 'zh_Hans', label: '中文'},
  {code: 'my', label: 'Malayu'},
];

const SettingsView = ({token, setToken}) => {
  const {t, i18n} = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const selectedLanguageCode = i18n.language;
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

  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(
    LANGUAGES.map(({code, label}) => ({label, value: code})),
  );

  useEffect(() => {
    setSelectedLanguage(selectedLanguageCode);
  }, []);

  useEffect(() => {
    i18n.changeLanguage(selectedLanguage);
  }, [selectedLanguage]);

  return (
    <>
      <View style={styles.settingsView}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
          }}>
          <Text
            style={{
              color: '#141414',
              fontSize: wp(4),
              marginTop: 3,
              fontFamily: 'Poppins-Medium',
            }}>
            {t('common:languageLabel')}
          </Text>
          <DropDownPicker
            open={open}
            value={selectedLanguage}
            items={items}
            setOpen={setOpen}
            setValue={setSelectedLanguage}
            setItems={setItems}
            style={{
              borderColor: '#141414',
              marginTop: 5,
            }}
            containerStyle={{
              width: wp(50),
            }}
            textStyle={{
              fontFamily: 'Poppins-Regular',
              marginTop: 3,
              marginLeft: 5,
            }}
          />
        </View>
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
            {t('common:signout')}
          </Text>
        </Pressable>
      </View>
    </>
  );
};

export default SettingsView;
