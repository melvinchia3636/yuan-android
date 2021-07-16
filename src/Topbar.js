/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {View, Text, Alert, Pressable} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

import styles from './styles';

const Topbar = ({title, goback, navSettings, ...props}) => {
  return (
    <View style={{...styles.topbar, zIndex: 9999}}>
      {goback ? (
        <Pressable
          onPress={goback}
          style={{
            paddding: 8,
          }}>
          <Icon
            style={{color: 'white', marginLeft: -wp(1.5)}}
            name="chevron-left"
            size={wp(8)}
          />
        </Pressable>
      ) : null}
      <Text style={styles.topbarTitle}>{title}</Text>
      <Icon
        style={{color: 'white'}}
        name="cog-outline"
        size={wp(7)}
        onPress={
          props.navigation
            ? () => props.navigation.navigate('Settings')
            : () => {
                Alert.alert('Facebook Button Clicked');
              }
        }
      />
    </View>
  );
};

export default Topbar;
