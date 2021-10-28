/* eslint-disable react-native/no-inline-styles */
import React, {useState, useEffect} from 'react';
import {View, Pressable, Image, ScrollView, Text} from 'react-native';
import {ip} from './constant';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Topbar from './Topbar';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

import Feather from 'react-native-vector-icons/Feather';
import Toast from 'react-native-tiny-toast';

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
          <PayStack.Screen name="NotifyPayment">
            {props => (
              <>
                <Topbar
                  title="Notify"
                  notSettings={[() => {}, '']}
                  goback={props.navigation.goBack}
                />
                <NotifyPayment
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
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios({
      url: `https://${ip}/api/v1/pay/fetch-reminder-contacts`,
      method: 'GET',
      headers: {
        Authorization: 'Token ' + props.token,
      },
    })
      .then(r => setUsers(r.data))
      .catch(err => err);
  }, []);

  return (
    <ScrollView
      style={{
        width: '100%',
      }}
      contentContainerStyle={{
        width: '100%',
        height: '100%',
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
      {Boolean(users.length) && (
        <Pressable
          onPress={() => props.navigation.navigate('NotifyPayment', {users})}
          style={{
            backgroundColor: '#e64d00',
            width: 64,
            height: 64,
            borderRadius: 64,
            alignItems: 'center',
            justifyContent: 'center',
            position: 'absolute',
            bottom: 12,
            right: 12,
            elevation: 6,
            zIndex: 9999,
          }}>
          <Feather name="bell" size={24} color="white" />
        </Pressable>
      )}
    </ScrollView>
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

const NotifyPayment = props => {
  const notifyUser = async id => {
    const lang = await AsyncStorage.getItem('user-language');
    axios({
      url: `https://${ip}/api/v1/pay/create-reminder/${id}/${lang}`,
      method: 'POST',
      headers: {
        Authorization: 'Token ' + props.token,
      },
    })
      .then(r => {
        Toast.show('Reminder sent', {
          containerStyle: {
            backgroundColor: 'rgba(0, 0, 0, .5)',
            paddingHorizontal: 20,
            borderRadius: 30,
          },
        });
      })
      .catch(err => err);
  };

  return (
    <ScrollView>
      {props.route.params?.users.map(e => (
        <Pressable
          key={e.id}
          style={{
            flexDirection: 'row',
            paddingHorizontal: wp(4),
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'white',
            elevation: 5,
          }}
          onPress={() => notifyUser(e.id)}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: wp(4),
              borderBottomColor: '#F5F5F5',
              borderBottomWidth: 1.8,
              width: '100%',
            }}>
            <Image
              style={{
                width: wp(12),
                height: wp(12),
                borderRadius: 100,
                marginRight: 10,
              }}
              source={{
                uri: 'https://' + ip + e.avatar,
              }}
            />
            <View>
              <Text
                style={{
                  fontSize: wp(4),
                  color: '#141414',
                  marginTop: 3,
                  fontFamily: 'Poppins-Medium',
                }}>
                {e.username}
              </Text>
            </View>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
};

export default PayView;
