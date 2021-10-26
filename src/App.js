/* eslint-disable react-native/no-inline-styles */
import React, {createRef, useRef, useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Animated,
  Dimensions,
  StatusBar,
  Easing,
  View,
  Image,
  Text,
  TextInput,
  Keyboard,
  Pressable,
  Linking,
  Alert,
} from 'react-native';
import axios from 'axios';
import './IMLocalize';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import {createAppContainer} from 'react-navigation';
import {createBottomTabNavigator} from 'react-navigation-tabs';

import messaging from '@react-native-firebase/messaging';
import * as notifications from './notifications.js';
import DialogBox from 'react-native-dialogbox';
import styles from './styles';

import PayView from './Pay';
import CommentView from './Comment';
import ChatView from './Chat';
import WorkView from './Work';
import ProfileView from './Profile';

import {ip} from './constant';
import {useTranslation} from 'react-i18next';
import Topbar from './Topbar';
import Dialog from 'react-native-dialog';
import {ScrollView} from 'react-native-gesture-handler';

const FadeInView = props => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        Animated.timing(slideUp, {
          toValue: -Dimensions.get('window').height,
          easing: Easing.back(),
          duration: 1000,
          useNativeDriver: true,
        }).start();
      }, 2000);
    });
  }, [fadeAnim, slideUp]);

  return (
    <Animated.View
      style={{
        ...props.style,
        opacity: fadeAnim,
        transform: [{translateY: slideUp}],
      }}>
      {props.children}
    </Animated.View>
  );
};

const LoadingView = props => {
  const fadeOut = useRef(new Animated.Value(1)).current;
  const [done, setDone] = useState(false);

  const showAnnouncement = () => {
    if (props.token) {
      axios({
        url: `http://${ip}/api/v1/announcement/fetch-announcement`,
        method: 'GET',
        headers: {
          authorization: 'Token ' + props.token,
        },
      })
        .then(res => {
          console.log(res.data);
          if (res.data.length) {
            props.setVisible(true);
            props.setContent(
              res.data.map(({title, content}) => (
                <>
                  <Dialog.Description
                    style={{
                      color: '#141414',
                      fontFamily: 'Poppins-Medium',
                      fontSize: wp(4.6),
                    }}>
                    {title}
                  </Dialog.Description>
                  <Dialog.Description
                    style={{
                      color: '#141414',
                      fontFamily: 'Poppins-Regular',
                      fontSize: wp(3.6),
                      marginTop: 0,
                      marginBottom: 20,
                    }}>
                    {content}
                  </Dialog.Description>
                </>
              )),
            );
          }
        })
        .catch(err => console.log(err));
    }
  };

  React.useEffect(() => {
    setTimeout(() => {
      Animated.timing(fadeOut, {
        toValue: 0,
        easing: Easing.sin,
        duration: 1000,
        useNativeDriver: true,
      }).start(() => {
        setDone(true);
      });
    }, 4000);
  }, [fadeOut]);

  React.useEffect(() => {
    if (done && props.token) {
      showAnnouncement();
    }
  }, [done, props.token]);

  return (
    <Animated.View
      style={{
        ...props.style,
        opacity: fadeOut,
        zIndex: done ? -1 : 1,
      }}>
      {props.children}
    </Animated.View>
  );
};

const LoginView = props => {
  const {t, i18n} = useTranslation();
  const [username, onChangeUsername] = useState('');
  const [password, onChangePassword] = useState('');
  const dialogbox = createRef();

  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      },
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, [isKeyboardVisible]);

  const checkCredentials = () => {
    const fetchToken = async () => {
      const token = await axios({
        method: 'POST',
        url: `http://${ip}/api/v1/auth/login`,
        data: {
          username: username,
          password: password,
        },
      }).catch(e => {
        dialogbox.current.tip({
          title: 'Login Failed',
          content:
            'Please enter a correct username and password. Note that both fields may be case-sensitive.',
          btn: {
            style: {
              color: '#e64d00',
            },
          },
        });
        Keyboard.dismiss();
      });
      if (token) {
        await AsyncStorage.setItem('@auth_token', token.data.token);
        notifications.requestUserPermission(token.data.token);
        props.setToken(token.data.token);
      }
    };
    fetchToken();
  };

  const changePassword = () => {
    Linking.openURL(`http://${ip}/password-reset/`);
  };

  return (
    <View
      style={{
        ...styles.loginView,
        ...(isKeyboardVisible ? styles.loginViewKeyboard : {}),
      }}>
      <Image
        source={require('./assets/image/yuan.png')}
        style={styles.navLogo}
      />
      <TextInput
        placeholder={t('common:username')}
        placeholderTextColor="#aaaaaa"
        style={styles.loginInput}
        value={username}
        onChangeText={onChangeUsername}
      />
      <TextInput
        placeholder={t('common:password')}
        secureTextEntry={true}
        placeholderTextColor="#aaaaaa"
        style={styles.loginInput}
        value={password}
        onChangeText={onChangePassword}
      />
      <Pressable style={styles.fpBtn} onPress={changePassword}>
        <Text style={styles.fpBtnText}>{t('common:forgotPassword')}</Text>
      </Pressable>
      <Pressable style={styles.loginBtn} onPress={checkCredentials}>
        <Text style={styles.loginBtnText}>{t('common:login')}</Text>
      </Pressable>
      <DialogBox ref={dialogbox} />
    </View>
  );
};

const TabNav = [
  ['Profile', ProfileView, 'home-outline'],
  ['Work', WorkView, 'notebook-outline'],
  ['Comment', CommentView, 'calendar-month'],
  ['Chat', ChatView, 'comment-text-multiple-outline'],
  ['Pay', PayView, 'credit-card-outline'],
];

const bottomTabNavigator = (token, setToken) =>
  createBottomTabNavigator(
    Object.fromEntries(
      TabNav.map(([label, component, icon]) => [
        label,
        {
          screen: navprops => component(token, setToken, navprops),
          navigationOptions: {
            tabBarIcon: ({tintColor}) => (
              <Icon name={icon} size={26} color={tintColor} />
            ),
          },
        },
      ]),
    ),
    {
      initialRouteName: 'Profile',
      tabBarOptions: {
        activeTintColor: '#e64d00',
        showLabel: false,
        style: {
          elevation: 8,
          borderTopWidth: 0,
          height: 60,
        },
      },
    },
  );

const AppContainer = (token, setToken) => {
  const Container = createAppContainer(bottomTabNavigator(token, setToken));
  return <Container />;
};

const App = () => {
  const [token, setToken] = useState(null);
  const [needLoad, setNeedLoad] = useState(true);
  const [visible, setVisible] = useState(false);
  const [content, setContent] = useState(null);

  useEffect(() => {
    const getToken = async () => {
      const [[, auth_token], [, fcm_token]] = await AsyncStorage.multiGet([
        '@auth_token',
        '@fcm_token',
      ]);
      if (auth_token !== null) {
        setToken(auth_token);
        return [auth_token, fcm_token];
      }
    };
    getToken().then(([auth_token, fcm_token]) => {
      if (!fcm_token) {
        if (auth_token) {
          notifications.requestUserPermission(auth_token);
        }
      }
    });
    const unsubscribe = messaging().onMessage(async remoteMessage => {});

    // Check whether an initial notification is available
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          setNeedLoad(false);
        }
      });

    return unsubscribe;
  }, []);

  return (
    <View
      style={{
        backgroundColor: 'white',
        width: '100%',
        height: '100%',
      }}>
      <StatusBar backgroundColor="#b33c00" />
      {token === null ? (
        <LoginView setToken={setToken} />
      ) : (
        <>{AppContainer(token, setToken)}</>
      )}
      {needLoad && (
        <LoadingView
          style={styles.loadingStyle}
          token={token}
          setVisible={setVisible}
          setContent={setContent}>
          <FadeInView style={{alignItems: 'center'}}>
            <Image
              source={require('./assets/image/yuan.png')}
              style={styles.tinyLogo}
            />
            <Text style={styles.title}> 缘学苑 </Text>
            <Text
              style={{
                fontFamily: 'Poppins-Medium',
                fontSize: wp(4),
                marginTop: 10,
                color: 'white',
                textAlign: 'center',
              }}>
              Pusat Tuisyen Pintar Belajar Gemilang
            </Text>
          </FadeInView>
          <Text style={styles.copyright}>
            Copyright &copy; 2021 All rights reserved.
          </Text>
        </LoadingView>
      )}
      <Dialog.Container visible={visible}>
        <Dialog.Title
          style={{
            color: '#e64d00',
            fontFamily: 'Poppins-Medium',
            fontSize: wp(4.8),
          }}>
          Announcement
        </Dialog.Title>
        <View style={{height: hp(50)}}>
          <ScrollView style={{marginLeft: 10}}>
            {content || (
              <Dialog.Description
                style={{
                  color: '#141414',
                  fontFamily: 'Poppins-Regular',
                  fontSize: wp(4),
                }}>
                No announcement today
              </Dialog.Description>
            )}
          </ScrollView>
        </View>
        <Dialog.Button
          style={{
            color: '#e64d00',
            fontFamily: 'Poppins-Medium',
            fontSize: wp(4),
            marginBottom: -5,
            textTransform: null,
          }}
          label="Close"
          onPress={() => setVisible(false)}
        />
      </Dialog.Container>
    </View>
  );
};

export default App;
