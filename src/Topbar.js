/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {View, Text, Alert} from 'react-native';
import styles from './styles';

const Topbar = ({title}) => {
  return (
    <View style={styles.topbar}>
      <Icon
        style={{color: 'white'}}
        name="menu"
        size={36}
        onPress={() => {
          Alert.alert('Facebook Button Clicked');
        }}
      />
      <Text style={styles.topbarTitle}>{title}</Text>
      <MaterialIcons
        style={{color: 'white'}}
        name="notifications-none"
        size={30}
        onPress={() => {
          Alert.alert('Facebook Button Clicked');
        }}
      />
    </View>
  );
};

export default Topbar;
