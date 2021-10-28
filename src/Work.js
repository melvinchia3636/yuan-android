/* eslint-disable react-native/no-inline-styles */
import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  RefreshControl,
  PermissionsAndroid,
  Platform,
  Linking,
} from 'react-native';
import axios from 'axios';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {ip} from './constant';
import styles from './styles';
import Topbar from './Topbar';
import SettingsView from './Settings';

import Feather from 'react-native-vector-icons/Feather';
import Entypo from 'react-native-vector-icons/Entypo';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';

import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';

import SlidingUpPanel from 'rn-sliding-up-panel';
import DocumentPicker from 'react-native-document-picker';
import AnimatedLoader from 'react-native-animated-loader';

import {useTranslation} from 'react-i18next';

import {OutlinedTextField} from 'rn-material-ui-textfield';
import Toast from 'react-native-tiny-toast';
import RNFetchBlob from 'rn-fetch-blob';

const downloadFile = async url => {
  const getFileExtention = fileUrl => {
    // To get the file extension
    return /[.]/.exec(fileUrl) ? /[^.]+$/.exec(fileUrl) : undefined;
  };

  const _downloadFile = () => {
    let date = new Date();
    let FILE_URL = 'https://' + ip + '/media/' + url;
    let file_ext = getFileExtention(FILE_URL);

    file_ext = '.' + file_ext[0];

    const {config, fs} = RNFetchBlob;
    let RootDir = fs.dirs.PictureDir;
    let options = {
      fileCache: true,
      addAndroidDownloads: {
        path:
          RootDir +
          '/yuan_' +
          Math.floor(date.getTime() + date.getSeconds() / 2) +
          file_ext,
        description: 'downloading file...',
        notification: true,
        useDownloadManager: true,
      },
    };
    config(options)
      .fetch('GET', FILE_URL)
      .then(res => {
        console.log('res -> ', JSON.stringify(res));
      });
  };

  if (Platform.OS === 'ios') {
    downloadFile();
  } else {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Storage Permission Required',
          message: 'Application needs access to your storage to download File',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        _downloadFile();
        Toast.show('Downloading file...', {
          containerStyle: {
            backgroundColor: 'rgba(0, 0, 0, .5)',
            paddingHorizontal: 20,
            borderRadius: 30,
          },
        });
        console.log('Storage Permission Granted.');
      }
    } catch (err) {
      console.log('++++' + err);
    }
  }
};

const WorkStack = createStackNavigator();

function WorkView(token, setToken, navprops) {
  const {t, i18n} = useTranslation();
  return (
    <NavigationContainer>
      <WorkStack.Navigator
        screenOptions={{
          headerShown: false,
        }}>
        <WorkStack.Screen name="WorkIndex">
          {props => (
            <>
              <Topbar
                title={'Classroom'}
                notSettings={[() => {}, '']}
                {...props}
              />
              <WorkIndex {...props} token={token} navprops={navprops} />
            </>
          )}
        </WorkStack.Screen>
        <WorkStack.Screen name="Work">
          {props => (
            <>
              <WorkStack.Navigator
                screenOptions={{
                  headerShown: false,
                }}>
                <WorkStack.Screen name="WorkView">
                  {() => (
                    <>
                      <Topbar
                        title="Classroom"
                        notSettings={[() => {}, '']}
                        goback={props.navigation.goBack}
                        {...props}
                      />
                      <Work {...props} token={token} />
                    </>
                  )}
                </WorkStack.Screen>
                <WorkStack.Screen name="EachWork">
                  {propss => (
                    <>
                      <Topbar
                        title="Classwork"
                        notSettings={[() => {}, '']}
                        goback={() => props.navigation.navigate('WorkView')}
                        {...propss}
                      />
                      <EachWork {...propss} token={token} />
                    </>
                  )}
                </WorkStack.Screen>
                <WorkStack.Screen name="EachWorkTeacher">
                  {propss => (
                    <>
                      <Topbar
                        title="Classwork"
                        notSettings={[() => {}, '']}
                        goback={() => props.navigation.navigate('WorkView')}
                        {...propss}
                      />
                      <EachWorkTeacher {...propss} token={token} />
                    </>
                  )}
                </WorkStack.Screen>
              </WorkStack.Navigator>
            </>
          )}
        </WorkStack.Screen>
        <WorkStack.Screen name="AddWork">
          {props => (
            <>
              <AddWork {...props} token={token} notSettings={[() => {}, '']} />
            </>
          )}
        </WorkStack.Screen>
      </WorkStack.Navigator>
    </NavigationContainer>
  );
}

const WorkIndex = ({token, navprops, ...props}) => {
  const fetchClassRooms = async () => {
    const lang = await AsyncStorage.getItem('user-language');
    const response = await axios({
      url: `https://${ip}/api/v1/classroom/fetch-classroom-list/${lang || 'en'}`,
      headers: {
        authorization: 'Token ' + token,
      },
    }).catch(err => console.log(err));
    return response ? response.data : [];
  };

  const [classRooms, setClassRooms] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchClassRooms()
      .then(res => setClassRooms(res))
      .then(setRefreshing(false));
  }, []);

  useEffect(() => {
    fetchClassRooms().then(res => setClassRooms(res));
    navprops.navigation.addListener('didFocus', () =>
      fetchClassRooms().then(res => setClassRooms(res)),
    );
  }, []);

  return (
    <>
      <ScrollView
        style={{
          margin: 8,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#e64d00']}
          />
        }>
        {classRooms.map(e => (
          <Pressable
            style={{
              backgroundColor: e.background,
              width: '100%',
              height: hp(16),
              padding: 8,
              paddingHorizontal: 16,
              marginVertical: 4,
              borderRadius: 10,
              justifyContent: 'space-between',
            }}
            key={e.id}
            onPress={() => props.navigation.navigate('Work', {classroom: e})}>
            <Text
              style={{
                color: 'white',
                fontFamily: 'Poppins-Medium',
                fontSize: wp(5),
              }}>
              {e.subject_name}
            </Text>
            <Text style={{color: 'white', fontFamily: 'Poppins-Regular'}}>
              {e.admin_username}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </>
  );
};

const Work = ({token, ...props}) => {
  const classroom = props.route.params.classroom;
  const [classWork, setClassWork] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const {t, i18n} = useTranslation();

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchClassWorks()
      .then(res => {
        res.data = res.data.reverse();
        setClassWork(res);
      })
      .then(setRefreshing(false));
  }, []);

  const fetchClassWorks = async () => {
    const response = await axios({
      url: `https://${ip}/api/v1/classroom/fetch-classworks/${classroom.id}`,
      headers: {
        authorization: 'Token ' + token,
      },
    }).catch(err => console.log(err));
    return response ? response.data : [];
  };

  useEffect(() => {
    fetchClassWorks().then(res => {
      res.data = res.data.reverse();
      setClassWork(res);
    });

    props.navigation.addListener('focus', () => {
      fetchClassWorks().then(res => {
        res.data = res.data.reverse();
        setClassWork(res);
      });
      panelRef.current?.hide();
    });
  }, []);

  const panelRef = useRef();
  const [panelHideToggle, setPanelHideToggle] = useState(false);

  !panelHideToggle && panelRef.current?.hide();

  return (
    <>
      <ScrollView
        style={{
          padding: 8,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#e64d00']}
          />
        }>
        <View
          style={{
            backgroundColor: classroom.background,
            width: '100%',
            height: hp(20),
            padding: 8,
            paddingHorizontal: 16,
            marginVertical: 4,
            borderRadius: 10,
            justifyContent: 'space-between',
          }}>
          <Text
            style={{
              color: 'white',
              fontFamily: 'Poppins-Regular',
              fontSize: wp(6),
            }}>
            {classroom.subject_name}
          </Text>
          <Text style={{color: 'white', fontFamily: 'Poppins-Regular'}}>
            {classroom.admin_username}
          </Text>
        </View>
        <ScrollView
          contentContainerStyle={{
            justifyContent: !classWork.data?.length ? 'center' : 'flex-start',
            minHeight: hp(60),
            marginBottom: 16,
          }}>
          {classWork?.data?.length > 0 ? (
            classWork.data.map(e => (
              <Pressable
                key={e.id}
                style={{
                  backgroundColor: 'white',
                  padding: 16,
                  marginVertical: 4,
                  borderRadius: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
                onPress={() => {
                  props.navigation.navigate(
                    'EachWork' + (classWork.editable ? 'Teacher' : ''),
                    {id: e.id},
                  );
                }}>
                <Feather
                  name={e.type === 'assignment' ? 'clipboard' : 'book'}
                  size={32}
                  color="#999999"
                  style={{marginRight: 16}}
                />
                <View>
                  <Text
                    style={{
                      fontFamily: 'Poppins-Medium',
                      fontSize: wp(4),
                      width: wp(76),
                      color: '#666666',
                    }}
                    numberOfLines={1}>
                    {e.title}
                  </Text>
                  <Text
                    style={{
                      color: '#666666',
                      fontFamily: 'Poppins-Regular',
                      fontSize: wp(3),
                    }}>
                    {new Date(e.time).toLocaleString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
              </Pressable>
            ))
          ) : (
            <Text
              style={{
                textAlign: 'center',
                fontFamily: 'Poppins-Regular',
                fontSize: wp(5),
                color: '#999999',
              }}>
              {t('common:nothing')}
            </Text>
          )}
        </ScrollView>
      </ScrollView>
      {classWork.editable && (
        <>
          {panelHideToggle ? (
            <Pressable
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: hp(100),
                backgroundColor: 'black',
                opacity: 0.4,
              }}
              onPress={() => {
                panelRef.current?.hide();
                setPanelHideToggle(false);
              }}
            />
          ) : (
            <Pressable
              onPress={() => {
                panelRef.current.show();
                setPanelHideToggle(true);
              }}
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
              }}>
              <Feather name="plus" size={24} color="white" />
            </Pressable>
          )}
          <SlidingUpPanel
            draggableRange={{top: 180, bottom: -200}}
            allowDragging={false}
            showBackdrop={false /*For making it modal-like*/}
            ref={panelRef}
            onBottomReached={() => setPanelHideToggle(false)}
            friction={0.4}>
            <View
              style={{
                backgroundColor: 'white',
                width: wp(100),
                height: hp(90),
                borderRadius: 25,
                elevation: 15,
                paddingHorizontal: 28,
                paddingVertical: 15,
                borderWidth: 1,
                borderColor: 'rgba(0, 0, 0, 0.08)',
              }}>
              <Text
                style={{
                  fontSize: wp(5.6),
                  fontFamily: 'Poppins-Regular',
                  color: '#363636',
                  textAlign: 'center',
                }}>
                {t('common:titleCreate')}
              </Text>
              <View style={{marginTop: 20}}>
                <Pressable
                  onPress={() => {
                    panelRef.current?.hide();
                    setPanelHideToggle(false);
                    setTimeout(() => {
                      props.navigation.navigate('AddWork', {
                        classroom: classroom.id,
                        type: 'material',
                      });
                    }, 120);
                  }}
                  style={{
                    flexDirection: 'row',
                  }}>
                  <Feather name="book" size={24} color="#363636" />
                  <Text
                    style={{
                      fontFamily: 'Poppins-Medium',
                      color: '#363636',
                      fontSize: wp(4),
                      marginLeft: 10,
                    }}>
                    {t('common:btnMaterial')}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    panelRef.current?.hide();
                    setPanelHideToggle(false);
                    setTimeout(() => {
                      props.navigation.navigate('AddWork', {
                        classroom: classroom.id,
                        type: 'assignment',
                      });
                    }, 100);
                  }}
                  style={{
                    flexDirection: 'row',
                    marginTop: 20,
                  }}>
                  <Feather name="clipboard" size={24} color="#363636" />
                  <Text
                    style={{
                      fontFamily: 'Poppins-Medium',
                      color: '#363636',
                      fontSize: wp(4),
                      marginLeft: 10,
                    }}>
                    {t('common:btnAssignment')}
                  </Text>
                </Pressable>
              </View>
            </View>
          </SlidingUpPanel>
        </>
      )}
    </>
  );
};

const AddWorkButton = ({askForFile, hollow}) => {
  const {t, i18n} = useTranslation();
  return (
    <Pressable
      onPress={askForFile}
      style={{
        backgroundColor: hollow ? 'white' : '#e64d00',
        padding: 5,
        paddingTop: 8,
        borderRadius: 5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: hollow ? 10 : 0,
        borderWidth: 1,
        borderColor: hollow ? 'rgba(0, 0, 0, 0.15)' : 'white',
      }}>
      <Entypo
        name="plus"
        style={{
          color: hollow ? '#e64d00' : 'white',
          marginTop: -3,
          marginRight: 5,
        }}
        size={wp(4.5)}
      />
      <Text
        style={{
          color: hollow ? '#e64d00' : 'white',
          textAlign: 'center',
          fontFamily: 'Poppins-Medium',
          fontSize: wp(3.5),
        }}>
        {t('common:addWork')}
      </Text>
    </Pressable>
  );
};

const HandInButton = ({handInFunc}) => {
  const {t, i18n} = useTranslation();
  return (
    <Pressable
      onPress={handInFunc}
      style={{
        backgroundColor: '#e64d00',
        padding: 5,
        paddingTop: 8,
        borderRadius: 5,
      }}>
      <Text
        style={{
          color: 'white',
          textAlign: 'center',
          fontFamily: 'Poppins-Medium',
          fontSize: wp(3.5),
        }}>
        {t('common:handIn')}
      </Text>
    </Pressable>
  );
};

const UnsubmitButton = ({unsubmitFunc}) => {
  const {t, i18n} = useTranslation();
  return (
    <Pressable
      onPress={unsubmitFunc}
      style={{
        backgroundColor: 'white',
        padding: 5,
        paddingTop: 8,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.1)',
      }}>
      <Text
        style={{
          color: '#e64d00',
          textAlign: 'center',
          fontFamily: 'Poppins-Medium',
          fontSize: wp(3.5),
        }}>
        {t('common:unsubmit')}
      </Text>
    </Pressable>
  );
};

const EachWork = ({token, id, ...props}) => {
  const [workDetails, setWorkDetails] = useState({});
  const [isExpand, setExpand] = useState(false);
  const [isSubmitted, setSubmitted] = useState(false);
  const slidePanel = useRef();
  const [isLoading, setLoading] = useState(false);
  const [myWorks, setMyWorks] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const {t, i18n} = useTranslation();

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchWorkDetails()
      .then(res => setWorkDetails(res))
      .then(setRefreshing(false));
  }, []);

  const fetchWorkDetails = async () => {
    const response = await axios({
      url: `https://${ip}/api/v1/classroom/fetch-classwork/${props.route.params.id}`,
      headers: {
        authorization: 'Token ' + token,
      },
    }).catch(err => console.log(err));
    return response ? response.data : {};
  };

  const askForFile = async () => {
    try {
      const ress = await DocumentPicker.pickMultiple({
        type: [DocumentPicker.types.allFiles],
      });
      const work = [];
      for (let res of ress) {
        if (!myWorks.map(e => e.content.name).includes(res.name)) {
          work.push({type: 'new', content: res});
        }
      }
      setMyWorks(myWorks.concat(work));
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('error -----', err);
      } else {
      }
    }
  };

  const handInWork = () => {
    const body = new FormData();
    const works = myWorks.filter(e => e.type === 'new');

    works.forEach(item => body.append('file[]', item.content));
    setLoading(true);

    fetch(`https://${ip}/api/v1/classroom/upload/${props.route.params.id}`, {
      headers: {
        authorization: 'Token ' + token,
      },
      method: 'POST',
      body: works.length > 0 && body,
    })
      .then(res => {
        setSubmitted(true);
        setLoading(false);
      })
      .catch(err => console.log(err));
  };

  const unsubmitWork = () => {
    axios({
      url: `https://${ip}/api/v1/classroom/unsubmit/${props.route.params.id}`,
      headers: {
        authorization: 'Token ' + token,
      },
      method: 'POST',
    })
      .then(() => {
        setSubmitted(false);
        setMyWorks([]);
      })
      .catch(err => console.log(err));
  };

  useEffect(() => {
    fetchWorkDetails().then(res => {
      if (res) {
        setWorkDetails(res);
        const media =
          typeof res.media === 'string' ? JSON.parse(res.media) : res.media;
        if (media && media.length > 0) {
          setMyWorks(media);
          setSubmitted(true);
        }
        const attachments = res.attachment && JSON.parse(res.attachment);
        if (attachments && attachments.length > 0) {
          setAttachment(attachments);
        }
      }
    });
    slidePanel.current?.hide();
  }, []);

  return (
    <>
      <ScrollView
        style={{
          backgroundColor: 'white',
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#e64d00']}
          />
        }>
        <AnimatedLoader
          visible={isLoading}
          overlayColor="rgba(255,255,255,.9)"
          source={require('./loader.json')}
          animationStyle={{
            width: 100,
            height: 100,
          }}
          speed={1}>
          <Text
            style={{
              fontFamily: 'Poppins-Regular',
              fontSize: wp(4),
            }}>
            Uploading ...
          </Text>
        </AnimatedLoader>
        <Text
          style={{
            fontSize: wp(3.5),
            paddingTop: 20,
            paddingHorizontal: 20,
            fontFamily: 'Poppins-Medium',
          }}>
          {workDetails.time &&
            new Date(workDetails.time).toLocaleString('en-GB', {
              day: 'numeric',
              month: 'short',
              hour: 'numeric',
              minute: 'numeric',
            })}
        </Text>
        <Text
          style={{
            fontFamily: 'Poppins-Medium',
            fontSize: wp(6.8),
            paddingHorizontal: 20,
            color: '#141414',
            lineHeight: wp(8),
            marginBottom: 10,
          }}>
          {workDetails.title}
        </Text>
        <Text
          style={{
            borderTopWidth: 1,
            marginHorizontal: 20,
            fontSize: wp(3.5),
            paddingVertical: 20,
            fontFamily: 'Poppins-Regular',
            color: '#141414',
          }}>
          {workDetails.details}
        </Text>
        {attachment && (
          <Text
            style={{
              marginHorizontal: 20,
              fontSize: wp(4.2),
              paddingTop: 20,
              paddingBottom: 10,
              fontFamily: 'Poppins-Regular',
              color: '#999999',
            }}>
            {t('common:attachment')}
          </Text>
        )}
        <View
          style={{
            paddingHorizontal: 20,
            marginBottom:
              workDetails.type === 'assignment' && workDetails.isStudent
                ? hp(28)
                : 20,
          }}>
          {attachment?.map((e, i) => (
            <Pressable
              onPress={() =>
                Linking.openURL('https://' + ip + '/media/' + e.path)
              }
              style={{
                paddingVertical: 8,
                paddingHorizontal: 15,
                borderWidth: 1,
                borderColor: 'rgba(0, 0, 0, 0.1)',
                borderRadius: 30,
                marginBottom: 5,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <Text
                numberOfLines={1}
                style={{
                  fontFamily: 'Poppins-Medium',
                  color: '#333333',
                  lineHeight: wp(5),
                  maxWidth: '90%',
                }}>
                {e.name}
              </Text>
              <Pressable
                onPress={() => {
                  downloadFile(e.path);
                }}>
                <MaterialIcon name="download" size={wp(4.6)} />
              </Pressable>
            </Pressable>
          ))}
        </View>
      </ScrollView>
      {workDetails.type === 'assignment' && workDetails.isStudent && (
        <SlidingUpPanel
          ref={slidePanel}
          backdropOpacity={0}
          onDragStart={position => {
            if (position > hp(30)) {
              setExpand(true);
            }
            if (position < hp(60)) {
              setExpand(false);
            }
          }}
          onBottomReached={() => setExpand(false)}
          draggableRange={{
            top: hp(80),
            bottom: myWorks.length > 0 ? hp(25) : hp(20),
          }}
          friction={0.6}
          allowDragging={false}>
          <View style={styles.container}>
            <View
              style={{
                backgroundColor: 'white',
                width: wp(100),
                height: hp(90),
                borderRadius: 25,
                elevation: 15,
                paddingHorizontal: 20,
                paddingVertical: 15,
                borderWidth: 1,
                borderColor: 'rgba(0, 0, 0, 0.08)',
              }}>
              <Pressable
                style={{
                  width: '100%',
                  alignItems: 'center',
                  paddingVertical: 10,
                }}
                onPress={() => {
                  !isExpand
                    ? slidePanel.current.show()
                    : slidePanel.current?.hide();
                  setExpand(true);
                }}>
                <Entypo
                  name={`chevron-${isExpand ? 'down' : 'up'}`}
                  size={wp(5)}
                  color="#999999"
                  width={100}
                />
              </Pressable>
              <Text
                style={{
                  color: '#141414',
                  fontSize: wp(5),
                  fontFamily: 'Poppins-Regular',
                  marginBottom: 10,
                }}>
                {t('common:yourWorkTitle')}
              </Text>
              {isExpand ? (
                <View style={{maxHeight: hp(55)}}>
                  <ScrollView style={{marginBottom: 20}}>
                    {myWorks.map((e, i) => (
                      <Pressable
                        style={{
                          paddingVertical: 5,
                          paddingHorizontal: 15,
                          borderRadius: 100,
                          borderWidth: 1,
                          borderColor: 'rgba(0, 0, 0, 0.1)',
                          marginBottom: 5,
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}>
                        <Text
                          numberOfLines={1}
                          style={{
                            fontFamily: 'Poppins-Medium',
                            color: '#333333',
                            lineHeight: wp(5),
                            maxWidth: '90%',
                          }}>
                          {e.content.name}
                        </Text>
                        {!isSubmitted && (
                          <Pressable
                            onPress={() => {
                              setMyWorks(
                                myWorks.filter((_, index) => index !== i),
                              );
                            }}>
                            <Feather name="x" size={18} color="#141414" />
                          </Pressable>
                        )}
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              ) : (
                myWorks.length > 0 && (
                  <View
                    style={{
                      paddingVertical: 5,
                      paddingHorizontal: 15,
                      borderRadius: 100,
                      borderWidth: 1,
                      borderColor: 'rgba(0, 0, 0, 0.1)',
                      marginBottom: 20,
                    }}>
                    <Text
                      numberOfLines={1}
                      style={{
                        fontFamily: 'Poppins-Medium',
                        color: '#333333',
                      }}>
                      {myWorks.length === 1
                        ? myWorks[0].content.name
                        : myWorks.length + ' attachments'}
                    </Text>
                  </View>
                )
              )}
              {isExpand ? (
                <View>
                  {isSubmitted ? (
                    <>
                      <UnsubmitButton unsubmitFunc={unsubmitWork} />
                    </>
                  ) : (
                    <>
                      <AddWorkButton askForFile={askForFile} hollow={true} />
                      <HandInButton handInFunc={handInWork} />
                    </>
                  )}
                </View>
              ) : (
                <View>
                  {!isSubmitted ? (
                    myWorks.length <= 0 ? (
                      <AddWorkButton askForFile={askForFile} />
                    ) : (
                      <HandInButton handInFunc={handInWork} />
                    )
                  ) : (
                    <UnsubmitButton unsubmitFunc={unsubmitWork} />
                  )}
                </View>
              )}
            </View>
          </View>
        </SlidingUpPanel>
      )}
    </>
  );
};

const AddWork = props => {
  const classroom = props.route.params.classroom;
  const type = props.route.params.type;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isError, setIsError] = useState(false);
  const [attachment, setAttachment] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const {t, i18n} = useTranslation();

  const submitContent = () => {
    if (title.trim()) {
      const body = new FormData();
      const attachments = attachment.filter(e => e.type === 'new');

      attachments.forEach(item => body.append('file[]', item.content));
      body.append('title', title.trim());
      body.append('description', description.trim());
      body.append('type', type);
      setLoading(true);
      axios({
        url: `https://${ip}/api/v1/classroom/create-classwork/${classroom}`,
        method: 'POST',
        headers: {
          authorization: 'Token ' + props.token,
        },
        data: body,
      })
        .then(() => {
          Toast.show(
            type[0].toUpperCase() + type.slice(1) + ' created successfully',
            {
              containerStyle: {
                backgroundColor: 'rgba(0, 0, 0, .5)',
                paddingHorizontal: 20,
                borderRadius: 30,
              },
            },
          );
          props.navigation.goBack();
        })
        .catch(err => console.log(err));
    } else {
      setIsError(true);
    }
  };

  const askForFile = async () => {
    try {
      const ress = await DocumentPicker.pickMultiple({
        type: [DocumentPicker.types.allFiles],
      });
      const work = [];
      for (let res of ress) {
        if (!attachment.map(e => e.content.name).includes(res.name)) {
          work.push({type: 'new', content: res});
        }
      }
      setAttachment(attachment.concat(work));
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('error -----', err);
      } else {
      }
    }
  };

  return (
    <>
      <Topbar
        title={'add' + type}
        goback={props.navigation.goBack}
        {...props}
        notSettings={[submitContent, 'send']}
      />
      <View style={{backgroundColor: 'white', height: hp(100)}}>
        <ScrollView
          style={{
            paddingHorizontal: 20,
            paddingVertical: 20,
          }}>
          <OutlinedTextField
            label={t('common:titleTitle')}
            tintColor="#f64d00"
            error={isError ? 'Required' : ''}
            characterRestriction={200}
            containerStyle={{marginTop: 10}}
            onChangeText={t => {
              setTitle(t);
              setIsError(false);
            }}
            labelTextStyle={{fontFamily: 'Poppins-Medium', paddingTop: 3}}
            style={{fontFamily: 'Poppins-Medium'}}
          />
          <OutlinedTextField
            label={t('common:description')}
            tintColor="#f64d00"
            characterRestriction={1000}
            containerStyle={{marginTop: 10}}
            onChangeText={t => setDescription(t)}
            labelTextStyle={{fontFamily: 'Poppins-Medium', paddingTop: 3}}
            multiline
            style={{fontFamily: 'Poppins-Medium'}}
          />
          <View style={{paddingBottom: 180, marginTop: 30}}>
            <View style={{marginBottom: 10}}>
              {attachment.map((e, i) => (
                <Pressable
                  style={{
                    paddingVertical: 5,
                    paddingHorizontal: 15,
                    marginBottom: 5,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                  <Text
                    numberOfLines={1}
                    style={{
                      fontFamily: 'Poppins-Medium',
                      color: '#333333',
                      lineHeight: wp(5),
                      maxWidth: '90%',
                    }}>
                    {e.content.name}
                  </Text>
                  <Pressable
                    onPress={() => {
                      setAttachment(
                        attachment.filter((_, index) => index !== i),
                      );
                    }}>
                    <Feather name="x" size={18} color="#141414" />
                  </Pressable>
                </Pressable>
              ))}
            </View>
            <Pressable
              onPress={askForFile}
              style={{
                backgroundColor: 'white',
                padding: 5,
                paddingTop: 8,
                borderRadius: 5,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: 'rgba(0, 0, 0, 0.38)',
              }}>
              <Feather
                name="paperclip"
                style={{
                  color: '#e64d00',
                  marginTop: -3,
                  marginRight: 5,
                }}
                size={wp(4.5)}
              />
              <Text
                style={{
                  color: '#e64d00',
                  textAlign: 'center',
                  fontFamily: 'Poppins-Medium',
                  fontSize: wp(3.5),
                }}>
                {t('common:addAttachment')}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
        <AnimatedLoader
          visible={isLoading}
          overlayColor="rgba(255,255,255,.9)"
          source={require('./loader.json')}
          animationStyle={{
            width: 100,
            height: 100,
          }}
          speed={1}>
          <Text
            style={{
              fontFamily: 'Poppins-Regular',
              fontSize: wp(4),
            }}>
            Uploading ...
          </Text>
        </AnimatedLoader>
      </View>
    </>
  );
};

const Tab = createMaterialTopTabNavigator();

const StudentsWork = props => {
  const [works, setWorks] = useState([]);

  useEffect(() => {
    axios({
      url: `https://${ip}/api/v1/classroom/fetch-students-work/${props.route.params.id}`,
      headers: {
        authorization: 'Token ' + props.token,
      },
    })
      .then(res => setWorks(res.data))
      .catch(err => console.log(err));
  }, []);

  return (
    <View style={{width: '100%', height: hp(100), backgroundColor: 'white'}}>
      {works?.map(({user, files}) => (
        <View style={{padding: 20}}>
          <Text
            style={{
              fontSize: wp(4.2),
              paddingTop: 10,
              paddingBottom: 10,
              fontFamily: 'Poppins-Regular',
              color: '#999999',
            }}>
            {user}
          </Text>
          {files?.map((e, i) => (
            <Pressable
              onPress={() =>
                Linking.openURL('https://' + ip + '/media/' + e.path)
              }
              style={{
                paddingVertical: 8,
                paddingHorizontal: 15,
                borderWidth: 1,
                borderColor: 'rgba(0, 0, 0, 0.1)',
                borderRadius: 30,
                marginBottom: 5,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <Text
                numberOfLines={1}
                style={{
                  fontFamily: 'Poppins-Medium',
                  color: '#333333',
                  lineHeight: wp(5),
                  maxWidth: '90%',
                }}>
                {e.name}
              </Text>
              <Pressable
                onPress={() => {
                  downloadFile(e.path);
                }}>
                <MaterialIcon name="download" size={wp(4.6)} />
              </Pressable>
            </Pressable>
          ))}
        </View>
      ))}
    </View>
  );
};

const EachWorkTeacher = props => {
  const {t, i18n} = useTranslation();
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarIndicatorStyle: {backgroundColor: '#e64d00'},
        tabBarLabelStyle: {
          fontFamily: 'Poppins-SemiBold',
          paddingTop: 3,
          textTransform: 'none',
          fontSize: wp(3.2),
        },
      }}>
      <Tab.Screen name={t('common:descriptions')}>
        {propss => <EachWork {...propss} {...props} />}
      </Tab.Screen>
      <Tab.Screen name={t('common:studentWorks')}>
        {propss => <StudentsWork {...propss} {...props} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

export default WorkView;
export {downloadFile};
