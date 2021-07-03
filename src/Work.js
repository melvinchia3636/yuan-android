/* eslint-disable react-native/no-inline-styles */
import React, {useState, useEffect} from 'react';
import {View, Text, ScrollView} from 'react-native';
import Topbar from './Topbar';
import styles from './styles';
import axios from 'axios';
import {ip} from './constant';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const fetchClassRooms = async token => {
  const response = await axios({
    url: `http://${ip}/api/v1/classroom/fetch-classroom-list`,
    headers: {
      authorization: 'Token ' + token,
    },
  }).catch(err => console.log(err));
  return response ? response.data : null;
};

const WorkView = token => {
  const [classRooms, setClassRooms] = useState([]);
  useEffect(() => {
    fetchClassRooms(token).then(res => setClassRooms(res));
  }, []);
  return (
    <>
      <Topbar title="Work" />
      <ScrollView
        style={{
          padding: 8,
        }}>
        {classRooms.map(e => (
          <View
            style={{
              backgroundColor: '#e64d00',
              width: '100%',
              height: hp(20),
              padding: 8,
              paddingHorizontal: 16,
              marginVertical: 4,
              borderRadius: 10,
							justifyContent: 'space-between',
            }}
            key={e.id}>
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
          </View>
        ))}
      </ScrollView>
    </>
  );
};

export default WorkView;
