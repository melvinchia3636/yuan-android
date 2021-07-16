/* eslint-disable react-native/no-inline-styles */
import React, {useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {View, Image, Text, ScrollView} from 'react-native';
import axios from 'axios';

import SettingsView from './Settings';
import Topbar from './Topbar';
import styles from './styles';
import {ip} from './constant';

import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';

const ProfileStack = createStackNavigator();

const ProfileView = (token, setToken) => {
  return (
    <NavigationContainer>
      <ProfileStack.Navigator headerMode={false}>
        <ProfileStack.Screen name="Profile">
          {props => (
            <>
              <Topbar title="Home" {...props} />
              <MainProfileView token={token} setToken={setToken} {...props} />
            </>
          )}
        </ProfileStack.Screen>
        <ProfileStack.Screen name="Settings">
          {props => (
            <>
              <Topbar title="Settings" goback={props.navigation.goBack} />
              <SettingsView {...props} token={token} setToken={setToken} />
            </>
          )}
        </ProfileStack.Screen>
      </ProfileStack.Navigator>
    </NavigationContainer>
  );
};

const MainProfileView = ({token, setToken, ...props}) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const response = await axios({
        method: 'GET',
        url: `http://${ip}/api/v1/user/fetch-user`,
        headers: {
          Authorization: 'Token ' + token,
        },
      }).catch(async () => {
        await AsyncStorage.removeItem('@auth_token');
        setToken(null);
      });
      if (response) {
        setData(response.data);
      }
    };

    if (!data) {
      fetchUserData();
    }
  }, [token, data, setToken]);

  return (
    <>
      <View style={styles.homepageView}>
        <View style={styles.homepageContentContainer}>
          <View style={styles.avatarWrapper}>
            <Image
              style={styles.avatar}
              source={{
                uri: 'http://' + ip + (data ? data.avatar : ''),
              }}
            />
          </View>
          <Text style={styles.usernameText}>{data ? data.name : ''}</Text>
          <Text style={styles.roleText}>{data ? data.role : ''}</Text>
          {data && data.role === 'student' ? (
            <ScrollView style={{marginBottom: 100}}>
              <View style={styles.homepageInnerContentContainer}>
                <Text style={styles.homepageSectionHeader}>Today's Lesson</Text>
                <View style={styles.homepageSectionHeaderSeperator} />
                <Text style={styles.homepageSectionContent}>Mathematics</Text>
                <Text style={styles.homepageSectionContentSub}>
                  11.00a.m. - 12.00a.m.
                </Text>
              </View>
              <View style={styles.homepageInnerContentContainer}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}>
                  <Text style={styles.homepageSectionHeader}>
                    Today's Comment
                  </Text>
                  <Text style={{fontFamily: 'Poppins-Medium'}}>View</Text>
                </View>
                <View
                  style={{
                    ...styles.homepageSectionHeaderSeperator,
                  }}
                />
                <Text style={styles.homepageComment}>
                  This is the comment for today. This is the comment from your
                  teacher. The comment can be as long as you want. You can add
                  ...
                </Text>
                <Text style={styles.homepageCommentAuthor}>
                  - Teacher's Name
                </Text>
              </View>
            </ScrollView>
          ) : null}
        </View>
      </View>
    </>
  );
};

export default ProfileView;
