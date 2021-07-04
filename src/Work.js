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
import Icon from 'react-native-vector-icons/Feather';

const WorkStack = createStackNavigator();

function choose(choices) {
  var index = Math.floor(Math.random() * choices.length);
  return choices[index];
}

function WorkView(token, setToken, navprops) {
  const [title, setTitle] = useState('Work');
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
                <Topbar title={title} goback={props.navigation.goBack} />
                <Work {...props} setTitle={setTitle} token={token} />
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
  const fetchClassWorks = async () => {
    const response = await axios({
      url: `http://${ip}/api/v1/classroom/fetch-classworks/${classroom.id}`,
      headers: {
        authorization: 'Token ' + token,
      },
    }).catch(err => console.log(err));
    return response ? response.data : [];
  };

  const [classWork, setClassWork] = useState([]);

  useEffect(() => {
    props.setTitle('');
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
        <View
          key={e.id}
          style={{
            backgroundColor: 'white',
            padding: 16,
            marginVertical: 4,
            borderRadius: 8,
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <Icon
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
        </View>
      ))}
    </ScrollView>
  );
};

export default WorkView;
