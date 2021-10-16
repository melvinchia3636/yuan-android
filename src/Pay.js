/* eslint-disable react-native/no-inline-styles */
import React, {useState} from 'react';
import {View, Pressable, Image} from 'react-native';
import {ip} from './constant';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Topbar from './Topbar';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';

const PayStack = createStackNavigator();

function PayView(token, setToken, navprops) {
  const [title, setTitle] = useState('Pay');
  return (
    <>
      <NavigationContainer>
        <PayStack.Navigator
          screenOptions={{
            headerShown: false,
          }}>
          <PayStack.Screen name="PayIndex">
            {props => (
              <>
                <Topbar title={title} notSettings={[() => {}, '']} />
                <PayIndex
                  {...props}
                  setTitle={setTitle}
                  token={token}
                  navprops={navprops}
                />
              </>
            )}
          </PayStack.Screen>
          <PayStack.Screen name="TouchNGo">
            {props => (
              <>
                <Topbar title="TNG" goback={props.navigation.goBack} />
                <TouchNGo />
              </>
            )}
          </PayStack.Screen>
          <PayStack.Screen name="DuitNow">
            {props => (
              <>
                <Topbar title="DN" goback={props.navigation.goBack} />
                <DuitNow />
              </>
            )}
          </PayStack.Screen>
        </PayStack.Navigator>
      </NavigationContainer>
    </>
  );
}

const PayIndex = props => {
  return (
    <View
      style={{
        width: '100%',
        height: hp(100),
        backgroundColor: 'white',
        alignItems: 'center',
        padding: 20,
      }}>
      <Pressable
        onPress={() => props.navigation.navigate('DuitNow')}
        style={{
          backgroundColor: 'white',
          width: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
          borderRadius: 8,
          elevation: 6,
        }}>
        <Image
          source={require('./assets/image/dn.png')}
          style={{
            width: wp(32),
            height: wp(32),
          }}
        />
      </Pressable>
      <Pressable
        onPress={() => props.navigation.navigate('TouchNGo')}
        style={{
          backgroundColor: 'white',
          width: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
          borderRadius: 8,
          elevation: 6,
          marginTop: 10,
        }}>
        <Image
          source={require('./assets/image/tng.png')}
          style={{
            width: wp(32),
            height: wp(32),
          }}
        />
      </Pressable>
    </View>
  );
};

const TouchNGo = () => {
  return (
    <>
      <View style={{width: '100%', height: '90%', padding: 20}}>
        <Image
          source={{
            uri:
              'https://' +
              ip +
              '/static/980aadbd-a2d9-4661-b838-ede65a599ca5.jpeg',
          }}
          style={{
            flex: 1,
            width: null,
            height: null,
            resizeMode: 'contain',
            borderRadius: 10,
          }}
        />
      </View>
    </>
  );
};

const DuitNow = () => {
  return (
    <>
      <View style={{width: '100%', height: '90%', padding: 20}}>
        <Image
          source={{
            uri:
              'https://' +
              ip +
              '/static/8dc61863-5739-4864-aaf0-00a6ef8516d1.jpg',
          }}
          style={{
            flex: 1,
            width: null,
            height: null,
            resizeMode: 'contain',
            borderRadius: 10,
          }}
        />
      </View>
    </>
  );
};

export default PayView;
