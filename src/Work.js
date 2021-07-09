/* eslint-disable react-native/no-inline-styles */
import React, {useState, useEffect} from 'react';
import {View, Text, ScrollView, Pressable} from 'react-native';
import Topbar from './Topbar';
import styles from './styles';
import axios from 'axios';
import {ip} from './constant';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import Entypo from 'react-native-vector-icons/Entypo';

import SlidingPanel from 'react-native-sliding-up-down-panels';
import DocumentPicker from 'react-native-document-picker';

const WorkStack = createStackNavigator();
const EachWorkStack = createStackNavigator();

function choose(choices) {
  var index = Math.floor(Math.random() * choices.length);
  return choices[index];
}

function WorkView(token, setToken, navprops) {
  return (
    <>
      <NavigationContainer>
        <WorkStack.Navigator headerMode="none">
          <WorkStack.Screen name="WorkIndex">
            {props => (
              <>
                <Topbar title="Work" />
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
                        />
                        <Work {...props} token={token} />
                      </>
                    )}
                  </WorkStack.Screen>
                  <WorkStack.Screen name="EachWork">
                    {props => (
                      <>
                        <Topbar
                          title="Class Work"
                          goback={props.navigation.goBack}
                        />
                        <EachWork {...props} token={token} />
                      </>
                    )}
                  </WorkStack.Screen>
                </WorkStack.Navigator>
              </>
            )}
          </WorkStack.Screen>
        </WorkStack.Navigator>
      </NavigationContainer>
    </>
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

  useEffect(() => {
    fetchClassRooms().then(res => setClassRooms(res));
  }, []);

  return (
    <>
      <ScrollView
        style={{
          margin: 8,
        }}>
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
        margin: 8,
      }}>
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
      {classWork.map(e => (
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
      ))}
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

const EachWork = ({token, id, ...props}) => {
  const [workDetails, setWorkDetails] = useState({});
  const [isExpand, setExpand] = useState(false);
  const [myWorks, setMyWorks] = useState([]);
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
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });
      if (!myWorks.map(e => e.name).includes(res.name)) {
        setMyWorks(myWorks.concat([res]));
      }
      this.uploadAPICall(res);
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('error -----', err);
      } else {
      }
    }
  };

  const handInWork = () => {
    console.log(myWorks);
  };

  useEffect(() => {
    fetchWorkDetails().then(res => setWorkDetails(res));
  }, []);

  return (
    <View
      style={{
        backgroundColor: 'white',
        height: '100%',
      }}>
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
          fontFamily: 'Poppins-Regular',
          color: '#141414',
        }}>
        {workDetails.details}
      </Text>
      <SlidingPanel
        headerLayoutHeight={wp(myWorks.length > 0 ? 70 : 55)}
        AnimationSpeed={300}
        allowDragging={false}
        onAnimationStart={() => {
          setExpand(!isExpand);
        }}
        headerLayout={() => (
          <View
            style={{
              backgroundColor: 'white',
              width: wp(100),
              height: hp(100),
              borderRadius: 25,
              elevation: 15,
              paddingHorizontal: 20,
              paddingVertical: 15,
              borderWidth: 1,
              borderColor: 'rgba(0, 0, 0, 0.08)',
            }}>
            <View
              style={{
                width: '100%',
                alignItems: 'center',
              }}>
              <Entypo
                name={`chevron-${isExpand ? 'down' : 'up'}`}
                size={wp(5)}
                color="#999999"
                width={100}
              />
            </View>
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
              <View style={{marginBottom: 20}}>
                {myWorks.map(e => (
                  <View
                    style={{
                      paddingVertical: 5,
                      paddingHorizontal: 15,
                      borderRadius: 100,
                      borderWidth: 1,
                      borderColor: 'rgba(0, 0, 0, 0.1)',
                      marginBottom: 5,
                    }}>
                    <Text
                      numberOfLines={1}
                      style={{
                        fontFamily: 'Poppins-Medium',
                        color: '#333333',
                        lineHeight: wp(5),
                      }}>
                      {e.name}
                    </Text>
                  </View>
                ))}
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
                    ? myWorks[0].name
                    : myWorks.length + ' attachments'}
                </Text>
              </View>
            ) : null}
            {isExpand ? (
              <View>
                <AddWorkButton askForFile={askForFile} hollow={true} />
                <HandInButton handInFunc={handInWork} />
              </View>
            ) : (
              <View>
                {myWorks.length <= 0 ? (
                  <AddWorkButton askForFile={askForFile} />
                ) : (
                  <HandInButton  handInFunc={handInWork} />
                )}
              </View>
            )}
          </View>
        )}
        allowAnimation={true}
      />
    </View>
  );
};

export default WorkView;
