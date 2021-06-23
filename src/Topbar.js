/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {View, Text, Alert} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

import styles from './styles';

const Topbar = ({title}) => {
  return (
    <View style={styles.topbar}>
      <Icon
        style={{color: 'white'}}
        name="menu"
        size={wp(8)}
        onPress={() => {
          Alert.alert('Facebook Button Clicked');
        }}
      />
      <Text style={styles.topbarTitle}>{title}</Text>
      <Icon
        style={{color: 'white'}}
        name="cog-outline"
        size={wp(7)}
        onPress={() => {
          Alert.alert('Facebook Button Clicked');
        }}
      />
    </View>
  );
};

export default Topbar;
