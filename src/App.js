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
} from 'react-native';
import axios from 'axios';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import {createAppContainer} from 'react-navigation';
import {createBottomTabNavigator} from 'react-navigation-tabs';

import messaging from '@react-native-firebase/messaging';
import * as notifications from './notifications.js';
import DialogBox from 'react-native-dialogbox';

import styles from './styles';
import CommentView from './Comment';
import Topbar from './Topbar';
import ChatView from './Chat';
import WorkView from './Work';
import ProfileView from './Profile.js';
import {ip} from './constant';

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
        console.log(e);
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
        placeholder="Username"
        placeholderTextColor="#aaaaaa"
        style={styles.loginInput}
        value={username}
        onChangeText={onChangeUsername}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry={true}
        placeholderTextColor="#aaaaaa"
        style={styles.loginInput}
        value={password}
        onChangeText={onChangePassword}
      />
      <Pressable style={styles.fpBtn}>
        <Text style={styles.fpBtnText}>Forgot password?</Text>
      </Pressable>
      <Pressable style={styles.loginBtn} onPress={checkCredentials}>
        <Text style={styles.loginBtnText}>LOG IN</Text>
      </Pressable>
      <DialogBox ref={dialogbox} />
    </View>
  );
};

const PaymentView = () => {
  return (
    <>
      <Topbar title="Payment" />
      <View style={styles.settingsView}>
        <Text
          style={{
            fontFamily: 'Poppins-Medium',
            fontSize: 24,
          }}>
          Payment
        </Text>
      </View>
    </>
  );
};

const TabNav = [
  ['Profile', ProfileView, 'account-outline'],
  ['Work', WorkView, 'notebook-outline'],
  ['Comment', CommentView, 'comment-quote-outline'],
  ['Chat', ChatView, 'comment-text-multiple-outline'],
  ['Payment', PaymentView, 'credit-card-outline'],
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
      {needLoad ? (
        <LoadingView style={styles.loadingStyle}>
          <FadeInView style={{alignItems: 'center'}}>
            <Image
              source={require('./assets/image/yuan.png')}
              style={styles.tinyLogo}
            />
            <Text style={styles.title}> 缘学苑 </Text>
          </FadeInView>
          <Text style={styles.copyright}>
            Copyright &copy; 2021 All rights reserved.
          </Text>
        </LoadingView>
      ) : null}
    </View>
  );
};

export default App;
