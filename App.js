import messaging from '@react-native-firebase/messaging'
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useRef, useEffect, useState } from 'react';
import {
  Animated,
  Dimensions,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Easing,
  View,
  Alert,
  Image,
  Text,
  TextInput,
  Keyboard,
  Pressable
} from 'react-native';
import axios from 'axios'

let ScreenHeight = Dimensions.get("window").height;
let ScreenWidth = Dimensions.get("window").width;

const styles = StyleSheet.create({
  mainPage: {
    backgroundColor: 'white'
  },
  loadingStyle: {
    backgroundColor: '#e64d00',
    height: ScreenHeight,
    width: ScreenWidth,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    left: 0
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  title: {
    color: 'white',
    fontSize: 48,
    fontFamily: 'bodang-xingkai',
    lineHeight: 56
  },
  tinyLogo: {
    width: 96,
    height: 96,
  },
  copyright: {
    bottom: 10,
    position: 'absolute',
    color: '#ff9966',
    fontFamily: 'Poppins-Light'
  },
  mainView: {
    height: ScreenHeight,
    width: ScreenWidth,
    backgroundColor: '#f6f5f7',
    alignItems: 'center',
    zIndex: -1
  },
  navLogo: {
    width: 128,
    height: 128,
    marginBottom: 40
  },
  menuBtn: {
    width: 28,
    height: 28,
    marginTop: 5
  },
  loginView: {
    justifyContent: 'center',
    width: ScreenWidth-150,
    height: '100%',
    alignItems: 'center',
    marginTop: -30
  },
  loginViewKeyboard: {
    justifyContent: 'flex-start',
    marginTop: 30
  },
  loginHeader: {
    fontSize: 36,
    fontFamily: 'Poppins-Medium',
    paddingBottom: 10,
  },
  loginInput: {
    width: '100%',
    paddingLeft: 10,
    paddingRight: 10,
    color: 'black',
    borderBottomWidth: 1.5,
    borderColor: '#aaaaaa',
    fontFamily: 'Poppins-Regular',
    paddingBottom: 5,
    fontSize: 16,
    marginTop: 20,
  },
  loginBtn: {
    width: '100%',
    backgroundColor: '#e64d00',
    padding: 10,
    borderRadius: 30,
  },
  loginBtnText: {
    color: 'white',
    fontFamily: 'Poppins-Medium',
    textAlign: 'center',
    marginTop: 2,
  },
  fpBtn: {
    marginTop: 40,
    marginBottom: 10
  },
  fpBtnText: {
    color: '#141414',
    fontFamily: 'Poppins-Medium'
  },
  homepageView: {
    width: ScreenWidth-150,
    justifyContent: 'center',
    height: ScreenHeight
  },
  errorText: {
    backgroundColor: '#e64d00',
    position: 'absolute',
    bottom: 25,
    width: ScreenWidth-50,
    padding: 10,
    color: 'white',
    textAlign: 'center',
    fontFamily: 'Poppins-Light',
    borderRadius: 10
  }
});

const FadeInView = (props) => {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideUp = useRef(new Animated.Value(0)).current

  React.useEffect(() => {
    Animated.timing(
      fadeAnim,
      {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true
      }
    ).start(() => {
      setTimeout(() => {
        Animated.timing(slideUp, {
          toValue: -ScreenHeight,
          easing: Easing.back(),
          duration: 1000,
          useNativeDriver: true
        }).start();
      }, 2000)
    });
  }, [fadeAnim])

  return (
    <Animated.View               // Special animatable View
      style={{
        ...props.style,
        opacity: fadeAnim, 
        transform: [{translateY: slideUp}]
      }}>
      {props.children}
    </Animated.View>
  )
}

const LoadingView = (props) => {
  const fadeOut = useRef(new Animated.Value(1)).current

  React.useEffect(() => {
    setTimeout(() => {
      Animated.timing(fadeOut, {
        toValue: 0,
        easing: Easing.sin,
        duration: 1000,
        useNativeDriver: true
      }).start(()=> {
        console.log(props.children[0].props.changeLoaded(true))
      });
    }, 4000)
  }, [fadeOut])

  return (
    <Animated.View 
      style={{
        ...props.style,
        opacity: fadeOut,
      }}>
      {props.children}
    </Animated.View>
  )
}

const MainView = (props) => {
  return (
    <View style={styles.mainView}>
      {props.children}
    </View>
  )
}

const MessageText = (props) => {
  const fade = useRef(new Animated.Value(0)).current

  React.useEffect(() => {
   Animated.timing(fade, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true
      }).start(()=> {
        setTimeout(()=> {
          Animated.timing(fade, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true
          }).start(()=> {
            props.setMessage(null)
          });
        }, 2000)
      });
  }, [fade])

  return (
    <Animated.Text
      style={{
        ...styles.errorText,
        opacity: fade,
      }}>
      {props.children}
    </Animated.Text>
  )
}

const LoginView = (props) => {
  const [username, onChangeUsername] = useState('')
  const [password, onChangePassword] = useState('')

  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
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
        url: 'http://60.51.103.27:9595/api/v1/auth/login',
        data: {
          username: username, 
          password: password
        }
      }).catch(err => {
        console.log(err)
        Keyboard.dismiss();
        props.setMessage('Please enter a correct username and password. Note that both fields may be case-sensitive.')
      })
      if (token) {
        await AsyncStorage.setItem('@auth_token', token.data.token)
        props.setToken(token.data.token)
        props.setMessage('Login successfully')
      }
    }
    fetchToken()
  }

  return (
    <View style={{...styles.loginView, ...(isKeyboardVisible ? styles.loginViewKeyboard : {})}}>
      <Image source={require('./assets/image/yuan.png')} style={styles.navLogo}/>
      <TextInput placeholder='Username' placeholderTextColor="#aaaaaa" style={styles.loginInput} value={username} onChangeText={onChangeUsername}/>
      <TextInput placeholder='Password' secureTextEntry={true} placeholderTextColor="#aaaaaa" style={styles.loginInput} value={password} onChangeText={onChangePassword}/>
      <Pressable style={styles.fpBtn}>
        <Text style={styles.fpBtnText}>Forgot password?</Text>
      </Pressable>
      <Pressable style={styles.loginBtn} onPress={checkCredentials}>
        <Text style={styles.loginBtnText}>LOG IN</Text>
      </Pressable>
    </View>
  )
}

const HomepageView = (props) => {
  const token = props.token
  const signOut = () => {
    const _signOut = async () => {
      const result = await axios({
        method: 'POST',
        url: 'http://60.51.103.27:9595/api/v1/auth/logout',
        headers: {
          Authorization: 'Token '+token
        }
      }).catch(err => console.log(err))
      if (result) {
        await AsyncStorage.removeItem('@auth_token')
        props.setToken(null)
        props.setMessage('Logout successfully')
      }
    }
    _signOut()
  }

  return (
    <View style={styles.homepageView}>
      <Pressable style={{
        borderRadius: 60,
        overflow: 'hidden'
      }} onPress={signOut}>
        <Text style={{
          backgroundColor: '#e64d00',
          textAlign: 'center',
          color: 'white', 
          fontSize: 20,
          width: '100%',
          paddingVertical: 5,
          paddingTop: 7,
          fontFamily: 'Poppins-Medium'
        }}>Sign Out</Text>
      </Pressable>
    </View>
  )
}

const requestUserPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    if (enabled) {
      getFcmToken() //<---- Add this
      console.log('Authorization status:', authStatus);
    }
  }

const getFcmToken = async () => {
    const fcmToken = await messaging().getToken();
    if (fcmToken) {
     console.log(fcmToken);
    } else {
     console.log("Failed", "No token received");
    }
  }

messaging().setBackgroundMessageHandler(
  async remoteMessage => {
    Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
  }
);

const App = () => {
  const [loaded, setLoaded] = useState(false)
  const [token, setToken] = useState(null)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    requestUserPermission();
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
    });
    return unsubscribe;
   }, []);

   useEffect(() => {
      const getToken = async () => {
        token_in_storage = await AsyncStorage.getItem('@auth_token')
        if (token_in_storage !== null) setToken(token_in_storage)
      }
      getToken()
   })

  return (
    <SafeAreaView style={styles.mainPage}>
      <StatusBar backgroundColor='#e64d00' />
      <MainView>
        {token==null?
        <LoginView setToken={setToken} setMessage={setMessage}/> :
        <HomepageView token={token} setToken={setToken} setMessage={setMessage}/>}
        {message!==null?<MessageText setMessage={setMessage}>{message}</MessageText>:null}
      </MainView>
      {!loaded ? <LoadingView style={styles.loadingStyle}>
        <FadeInView style={{alignItems: 'center'}} changeLoaded={setLoaded}>
          <Image source={require('./assets/image/yuan.png')} style={styles.tinyLogo}/>
          <Text style={styles.title}> 缘学苑 </Text>  
        </FadeInView>
        <Text style={styles.copyright}>Copyright &copy; 2021 All rights reserved.</Text>
      </LoadingView> : null}
    </SafeAreaView>
  );
};

export default App;
