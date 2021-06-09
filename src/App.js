import React, { createRef, useRef, useEffect, useState, useLayoutEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Animated,
  Dimensions,
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
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; 
import MaterialIcons from 'react-native-vector-icons/MaterialIcons' 
import Ionicons from 'react-native-vector-icons/Ionicons'

import { createAppContainer } from 'react-navigation';
import { createBottomTabNavigator } from 'react-navigation-tabs'
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';

import messaging from '@react-native-firebase/messaging'
import * as notifications from './notifications.js'
import DialogBox from 'react-native-dialogbox'

let ScreenHeight = Dimensions.get("window").height;
let ScreenWidth = Dimensions.get("window").width;

const raw_styles = require('./styles.json')

const styles = StyleSheet.create(JSON.parse(JSON.stringify(raw_styles).replace(/"ScreenWidth"/gm, ScreenWidth).replace(/"ScreenHeight"/gm, ScreenHeight)));

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
  const [done, setDone] = useState(false)

  React.useEffect(() => {
    setTimeout(() => {
      Animated.timing(fadeOut, {
        toValue: 0,
        easing: Easing.sin,
        duration: 1000,
        useNativeDriver: true
      }).start(()=> {
        setDone(true)
      });
    }, 4000)
  }, [fadeOut])

  return (
    <Animated.View 
      style={{
        ...props.style,
        opacity: fadeOut,
        zIndex: done ? -1 : 1
      }}>
      {props.children}
    </Animated.View>
  )
}

const MessageText = (props) => {
  const fade = useRef(new Animated.Value(0)).current
  const done = useState(false)

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
            setDone(true)
          });
        }, 2000)
      });
  }, [fade])

  return (<>
    {!done ? <Animated.Text
      style={{
        ...styles.messageText,
        opacity: fade,
      }}>
      {props.children}
    </Animated.Text>: null}
  </>)
}

const LoginView = (props) => {
  const [username, onChangeUsername] = useState('')
  const [password, onChangePassword] = useState('')
  const dialogbox = createRef();

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
        url: 'http://60.53.166.67:9595/api/v1/auth/login',
        data: {
          username: username, 
          password: password
        }
      }).catch(err => {
        
        dialogbox.current.tip({
          title: 'Login Failed',
          content: 'Please enter a correct username and password. Note that both fields may be case-sensitive.',
          btn: {
              style: {
                color: '#e64d00'
            }
          }
        })
        Keyboard.dismiss();
      })
      if (token) {
        await AsyncStorage.setItem('@auth_token', token.data.token)
        props.setToken(token.data.token)
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
      <DialogBox ref={dialogbox}/>
    </View>
  )
}

const HomepageView = (token, setToken) => {

  const [data, setData] = useState(null)

  useEffect(() => {
    const fetchUserData = async () => {
      const response = await axios({
        method: 'GET',
        url: 'http://60.53.166.67:9595/api/v1/user/fetch-user',
        headers: {
          Authorization: 'Token '+token
        }
      }).catch(async err => {
        await AsyncStorage.removeItem('@auth_token')
        setToken(null)
      })
      if (response) setData(response.data)
    };

    if (!data) fetchUserData()
  }, [token])

  return (<>
  <Topbar title="Home"/>
    <View style={styles.homepageView}>
      <View style={styles.homepageContentContainer}>
        <View style={styles.avatarWrapper}>
          <Image style={styles.avatar} source={{
            uri: 'http://60.53.166.67:9595' + (data ? data.avatar : ''),
          }}/>
        </View>
        <Text style={styles.usernameText}>{data? data.name : ""}</Text>
        <Text style={styles.roleText}>{data ? data.role : ""}</Text>
        {data && data.role === 'student' ? <><View style={styles.homepageInnerContentContainer}>
          <Text style={styles.homepageSectionHeader}>Today's Lesson</Text>
          <View style={styles.homepageSectionHeaderSeperator}></View>
          <Text style={styles.homepageSectionContent}>Mathematics</Text>
          <Text style={styles.homepageSectionContentSub}>11.00a.m. - 12.00a.m.</Text>
        </View>
        <View style={styles.homepageInnerContentContainer}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between'
          }}>
            <Text style={styles.homepageSectionHeader}>Today's Comment</Text>
            <Text style={{fontFamily: 'Poppins-Medium'}}>View</Text>
          </View>
          <View style={{...styles.homepageSectionHeaderSeperator, height: 3}}></View>
          <Text style={styles.homepageComment}>This is the comment for today. This is the comment from your teacher. The comment can be as long as you want. You can add ...</Text>
          <Text style={styles.homepageCommentAuthor}>- Teacher's Name</Text>
        </View></> : null}
      </View>
    </View>
  </>)
}

const WorkView = () => {
  return (<>
  <Topbar title="Work"/>
    <View style={
      styles.settingsView
    }><Text style={{
      fontFamily: 'Poppins-Medium',
      fontSize: 24
    }}>Work</Text></View>
  </>)
}

const CommentStack = createStackNavigator();

function CommentView() {
  const [title, setTitle] = useState('Comment')
  return (
    <>
    <Topbar title={title}/>
    <NavigationContainer>
      <CommentStack.Navigator headerMode='none'>
        <CommentStack.Screen name="Comment">
          {props => <InnerCommentView {...props} setTitle={setTitle}/>}
        </CommentStack.Screen>
        <CommentStack.Screen name="Chat">
          {props => <ChatRoomListView {...props} setTitle={setTitle}/>}
        </CommentStack.Screen>
      </CommentStack.Navigator>
    </NavigationContainer>
  </>);
}

const ChatRoomListView = (props) => {
  React.useEffect(() => {
    props.setTitle('Chat')
    const unsubscribe = props.navigation.addListener('transitionStart', (e) => {
      if (e.data.closing) props.setTitle('Comment')
    });
  
    return unsubscribe;
  }, [props.navigation]);

  return (<>
    <View>
      <Text style={{
        fontFamily: 'Poppins-Medium',
        fontSize: 24
      }}>Chat room hell yeah</Text>
    </View>
  </>)
}

const InnerCommentView = (props) => {
  React.useEffect(() => {
    const unsubscribe = props.navigation.addListener('transitionStart', (e) => {
      console.log('erhewths')
    });
  
    return unsubscribe;
  }, [props.navigation]);
  return (<>
    <View style={
      styles.settingsView
    }>
      <Text style={{
        fontFamily: 'Poppins-Medium',
        fontSize: 24
      }}>Comment</Text>
      <Pressable style={styles.chatButton} onPress={()=>props.navigation.navigate('Chat')}>
        <Ionicons name='chatbox-outline' style={{color: 'white'}} size={27}></Ionicons>
      </Pressable>
    </View>
  </>)
}

const PaymentView = () => {
  return (<>
  <Topbar title="Payment"/>
  <View style={
    styles.settingsView
  }><Text style={{
    fontFamily: 'Poppins-Medium',
    fontSize: 24
  }}>Payment</Text></View>
  </>)
}

const SettingsView = (token, setToken) => {
  const signOut = () => {
    const _signOut = async () => {
      const result = await axios({
        method: 'POST',
        url: 'http://60.53.166.67:9595/api/v1/auth/logout',
        headers: {
          Authorization: 'Token '+token
        }
      }).catch(err => console.log(err))
      if (result) {
        await AsyncStorage.removeItem('@auth_token')
        setToken(null)
      }
    }
    _signOut()
  }

  return (<>
    <Topbar title="Settings"/>
    <View style={
      styles.settingsView
    }>
      <Text style={{
        fontFamily: 'Poppins-Medium',
        fontSize: 24
      }}>Settings</Text>
      <Pressable style={{
        borderRadius: 60,
        overflow: 'hidden',
        marginTop: 20,
      }} onPress={signOut}>
        <Text style={{
          backgroundColor: '#e64d00',
          textAlign: 'center',
          color: 'white', 
          fontSize: 16,
          width: 300,
          paddingVertical: 5,
          paddingTop: 7,
          fontFamily: 'Poppins-Medium'
        }}>Sign Out</Text>
      </Pressable>
    </View>
  </>)
}

const Topbar = ({ title }) => {
  return (
    <View style={styles.topbar}>
      <Icon style={{color: 'white'}} name="menu" size={36} onPress={()=>{Alert.alert("Facebook Button Clicked")}}></Icon>
      <Text style={styles.topbarTitle}>{title}</Text>
      <MaterialIcons style={{color: 'white'}} name="notifications-none" size={30} onPress={()=>{Alert.alert("Facebook Button Clicked")}}></MaterialIcons>
    </View>
  )
}

const TabNav = [
  ['Home', HomepageView, 'home-outline'],
  ['Work', WorkView, 'notebook-outline'],
  ['Comment', CommentView, 'comment-multiple-outline'],
  ['Payment', PaymentView, 'credit-card-outline'],
  ['Settings', SettingsView, 'account-outline'],
]

const bottomTabNavigator = (token, setToken) => createBottomTabNavigator(
  Object.fromEntries(TabNav.map(([label, component, icon]) => [label, {
    screen: ()=>component(token, setToken),
    navigationOptions: {
      tabBarIcon: ({ tintColor }) => (
        <Icon name={icon} size={26} color={tintColor} />
      )
    }
  }])),
  {
    initialRouteName: 'Home',
    tabBarOptions: {
      activeTintColor: '#e64d00',
      showLabel: false,
      style: {
        elevation: 8,
        borderTopWidth: 0,
        height: 60
      }
    }
  }
);

const AppContainer = (token, setToken) => {
  const Container = createAppContainer(bottomTabNavigator(token, setToken))
  return <Container/>
};

const App = () => {
  const [token, setToken] = useState(null)

  useEffect(() => {
    notifications.requestUserPermission();
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
   }, [])

  return (
    <View style={{
      backgroundColor: 'white',
      width: '100%',
      height: '100%'
    }}>
      <StatusBar backgroundColor='#e64d00' />
      {token === null?
      <LoginView setToken={setToken}/> :
      (<>
        {AppContainer(token, setToken)}
      </>)}
      <LoadingView style={styles.loadingStyle}>
        <FadeInView style={{alignItems: 'center'}}>
          <Image source={require('./assets/image/yuan.png')} style={styles.tinyLogo}/>
          <Text style={styles.title}> 缘学苑 </Text>  
        </FadeInView>
        <Text style={styles.copyright}>Copyright &copy; 2021 All rights reserved.</Text>
      </LoadingView>
    </View>
  );
};

export default App;
