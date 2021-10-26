/* eslint-disable react-native/no-inline-styles */
import React, {useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {View, Image, Text, ScrollView, Pressable, Alert} from 'react-native';
import axios from 'axios';

import SettingsView from './Settings';
import Topbar from './Topbar';
import styles from './styles';
import {ip} from './constant';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';

import {useTranslation} from 'react-i18next';

const ProfileStack = createStackNavigator();

const ProfileView = (token, setToken, navprops) => {
  const {t, i18n} = useTranslation();
  return (
    <NavigationContainer>
      <ProfileStack.Navigator
        screenOptions={{
          headerShown: false,
        }}>
        <ProfileStack.Screen name="Profile">
          {props => (
            <>
              <Topbar title={'Home'} {...props} />
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
  const {t, i18n} = useTranslation();

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

  useEffect(() => {
    fetchUserData();
    props.navigation.addListener('focus', () => {
      fetchUserData();
    });
    navprops.navigation.addListener('didFocus', () => {
      fetchUserData();
    });
  }, []);

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
              <Text style={styles.homepageSectionHeader}>
                {t('common:hello')}
              </Text>
              <View style={styles.homepageSectionHeaderSeperator} />
              {data?.event?.class?.length > 0 ||
              data?.event?.activity?.length > 0 ? (
                <View
                  style={{
                    marginBottom: 20,
                  }}>
                  {data?.event.class?.map(e => (
                    <View
                      style={{
                        marginBottom: 20,
                      }}>
                      <Text
                        style={{
                          fontFamily: 'Poppins-Medium',
                          fontSize: wp(6),
                        }}>
                        {e.start} - {e.end}
                      </Text>
                      <Text
                        style={{
                          fontFamily: 'Poppins-Medium',
                          fontSize: wp(4),
                          color: '#141414',
                        }}>
                        {e.class_name}
                      </Text>
                    </View>
                  ))}
                  {data?.event.activity?.map(e => (
                    <View
                      style={{
                        marginBottom: 20,
                      }}>
                      <Text
                        style={{
                          fontFamily: 'Poppins-Medium',
                          fontSize: wp(6),
                        }}>
                        {e.start_time.split(':').slice(0, 2).join(':')} -{' '}
                        {e.end_time.split(':').slice(0, 2).join(':')}
                      </Text>
                      <Text
                        style={{
                          fontFamily: 'Poppins-Medium',
                          color: '#141414',
                        }}>
                        {e.content}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text
                  style={{
                    color: '#141414',
                    fontFamily: 'Poppins-Regular',
                  }}>
                  {t('common:noEvent')}
                </Text>
              )}
            </View>
            <View style={styles.homepageInnerContentContainer}>
              <Text style={styles.homepageSectionHeader}>
                {t('common:announcementsTitle')}
              </Text>
              <View style={styles.homepageSectionHeaderSeperator} />
              {data?.announcement?.length ? (
                <View
                  style={{
                    marginBottom: 20,
                  }}>
                  {data.announcement.map(e => (
                    <View
                      style={{
                        marginBottom: 20,
                      }}>
                      <Text
                        style={{
                          fontFamily: 'Poppins-Medium',
                          fontSize: wp(5),
                        }}>
                        {e.title}
                      </Text>
                      <Text
                        style={{
                          color: '#141414',
                          fontFamily: 'Poppins-Regular',
                        }}>
                        {e.content}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text
                  style={{
                    color: '#141414',
                    fontFamily: 'Poppins-Regular',
                    marginBottom: 20,
                  }}>
                  {t('common:noAnnouncements')}
                </Text>
              )}
            </View>
            {data && data.role === 'student' && (
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
                    {t('common:todayCommentTitle')}
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
                    : t('common:noCommentToday')}
                </Text>
                {data.comment && (
                  <>
                    <Text style={styles.homepageCommentAuthor}>
                      - {data.comment.author}
                    </Text>
                    <Pressable
                      onPress={() => navprops.navigation.navigate('Comment')}>
                      <Text style={styles.viewCommentBtn}>
                        {t('common:viewCommentBtn')}
                      </Text>
                    </Pressable>
                  </>
                )}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </>
  );
};

export default ProfileView;
