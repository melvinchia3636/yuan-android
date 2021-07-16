/* eslint-disable react-native/no-inline-styles */
import React, {useState, useEffect, useRef} from 'react';
import {View, Text, ScrollView, Pressable, RefreshControl} from 'react-native';
import axios from 'axios';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

import {ip} from './constant';
import styles from './styles';
import Topbar from './Topbar';
import SettingsView from './Settings';

import Feather from 'react-native-vector-icons/Feather';
import Entypo from 'react-native-vector-icons/Entypo';

import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';

import SlidingUpPanel from 'rn-sliding-up-panel';
import DocumentPicker from 'react-native-document-picker';
import AnimatedLoader from 'react-native-animated-loader';

const WorkStack = createStackNavigator();

function choose(choices) {
  var index = Math.floor(Math.random() * choices.length);
  return choices[index];
}

function WorkView(token, setToken, navprops, settingsNav) {
  return (
    <NavigationContainer>
      <WorkStack.Navigator headerMode="none">
        <WorkStack.Screen name="WorkIndex">
          {props => (
            <>
              <Topbar title="Work" {...props} />
              <WorkIndex {...props} token={token} />
            </>
          )}
        </WorkStack.Screen>
        <WorkStack.Screen name="Work">
          {props => (
            <>
              <WorkStack.Navigator headerMode="none">
                <WorkStack.Screen name="WorkView">
                  {() => (
                    <>
                      <Topbar
                        title="Classroom"
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
                        title="Class Work"
                        goback={props.navigation.goBack}
                        {...propss}
                      />
                      <EachWork {...propss} token={token} />
                    </>
                  )}
                </WorkStack.Screen>
              </WorkStack.Navigator>
            </>
          )}
        </WorkStack.Screen>
        <WorkStack.Screen name="Settings">
          {props => (
            <>
              <Topbar title="Settings" goback={props.navigation.goBack} />
              <SettingsView {...props} token={token} setToken={setToken} />
            </>
          )}
        </WorkStack.Screen>
      </WorkStack.Navigator>
    </NavigationContainer>
  );
}

const WorkIndex = ({token, ...props}) => {
  const fetchClassRooms = async () => {
    const response = await axios({
      url: `http://${ip}/api/v1/classroom/fetch-classroom-list`,
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
              height: hp(20),
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
                fontFamily: 'Poppins-Regular',
                fontSize: wp(6),
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

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchClassWorks()
      .then(res => setClassWork(res))
      .then(setRefreshing(false));
  }, []);

  const fetchClassWorks = async () => {
    const response = await axios({
      url: `http://${ip}/api/v1/classroom/fetch-classworks/${classroom.id}`,
      headers: {
        authorization: 'Token ' + token,
      },
    }).catch(err => console.log(err));
    return response ? response.data : [];
  };

  useEffect(() => {
    fetchClassWorks().then(res => setClassWork(res));
  }, []);

  return (
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
          justifyContent: classWork.length === 0 ? 'center' : 'flex-start',
          minHeight: hp(60),
        }}>
        {classWork.length > 0 ? (
          classWork.map(e => (
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
              onPress={() => props.navigation.navigate('EachWork', {id: e.id})}>
              <Feather
                name={choose(['paperclip', 'clipboard'])}
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
            Nothing Here
          </Text>
        )}
      </ScrollView>
    </ScrollView>
  );
};

const AddWorkButton = ({askForFile, hollow}) => {
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
        Add work
      </Text>
    </Pressable>
  );
};

const HandInButton = ({handInFunc}) => {
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
        Hand In
      </Text>
    </Pressable>
  );
};

const UnsubmitButton = ({unsubmitFunc}) => {
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
        Unsubmit
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

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchWorkDetails()
      .then(res => setWorkDetails(res))
      .then(setRefreshing(false));
  }, []);

  const fetchWorkDetails = async () => {
    const response = await axios({
      url: `http://${ip}/api/v1/classroom/fetch-classwork/${props.route.params.id}`,
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

    fetch(`http://${ip}/api/v1/classroom/upload/${props.route.params.id}`, {
      headers: {
        authorization: 'Token ' + token,
      },
      method: 'POST',
      body: works.length > 0 ? body : null,
    })
      .then(res => {
        setSubmitted(true);
        setLoading(false);
      })
      .catch(err => console.log(err));
  };

  const unsubmitWork = () => {
    axios({
      url: `http://${ip}/api/v1/classroom/unsubmit/${props.route.params.id}`,
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
      }
    });
    slidePanel.current.hide();
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
          {workDetails.time
            ? new Date(workDetails.time).toLocaleString('en-GB', {
                day: 'numeric',
                month: 'short',
                hour: 'numeric',
                minute: 'numeric',
              })
            : null}
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
            paddingTop: 20,
            paddingBottom: hp(24),
            fontFamily: 'Poppins-Regular',
            color: '#141414',
          }}>
          {workDetails.details}
        </Text>
      </ScrollView>
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
                  : slidePanel.current.hide();
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
              Your work
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
                      {!isSubmitted ? (
                        <Pressable
                          onPress={() => {
                            setMyWorks(
                              myWorks.filter((_, index) => index !== i),
                            );
                          }}>
                          <Feather name="x" size={18} color="#141414" />
                        </Pressable>
                      ) : null}
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            ) : myWorks.length > 0 ? (
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
            ) : null}
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
    </>
  );
};

export default WorkView;
