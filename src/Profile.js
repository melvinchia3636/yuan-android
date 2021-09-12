/* eslint-disable react-native/no-inline-styles */
import React, {useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {View, Image, Text, ScrollView, Pressable} from 'react-native';
import axios from 'axios';

import SettingsView from './Settings';
import Topbar from './Topbar';
import styles from './styles';
import {ip} from './constant';

import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';

const ProfileStack = createStackNavigator();

const ProfileView = (token, setToken, navprops) => {
  return (
    <NavigationContainer>
      <ProfileStack.Navigator headerMode={false}>
        <ProfileStack.Screen name="Profile">
          {props => (
            <>
              <Topbar title="Home" {...props} />
              <MainProfileView
                token={token}
                setToken={setToken}
                navprops={navprops}
                {...props}
              />
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

const MainProfileView = ({token, setToken, navprops, ...props}) => {
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

          <ScrollView style={{marginBottom: 140}}>
            <View style={styles.homepageInnerContentContainer}>
              <Text style={styles.homepageSectionHeader}>Today's Event</Text>
              <View style={styles.homepageSectionHeaderSeperator} />
              {data && data.event.length ? (
                data.event.map(e => (
                  <View style={{marginBottom: 30}}>
                    <Text style={styles.homepageSectionContent}>
                      {e.class_name}
                    </Text>
                    <Text style={styles.homepageSectionContentSub}>
                      {e.start} - {e.end}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.homepageComment}>No event for today.</Text>
              )}
            </View>
            {data && data.role === 'student' ? (
              <View
                style={{
                  ...styles.homepageInnerContentContainer,
                  marginTop: -8,
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                  <Text style={styles.homepageSectionHeader}>
                    Today's Comment
                  </Text>
                </View>
                <View
                  style={{
                    ...styles.homepageSectionHeaderSeperator,
                  }}
                />
                <Text style={styles.homepageComment} numberOfLines={2}>
                  {data.comment
                    ? data.comment.content
                    : 'No comment for today.'}
                </Text>
                {data.comment ? (
                  <>
                    <Text style={styles.homepageCommentAuthor}>
                      - {data.comment.author}
                    </Text>
                    <Pressable
                      onPress={() => navprops.navigation.navigate('Comment')}>
                      <Text style={styles.viewCommentBtn}>View Comment</Text>
                    </Pressable>
                  </>
                ) : null}
              </View>
            ) : null}
          </ScrollView>
        </View>
      </View>
    </>
  );
};

export default ProfileView;
