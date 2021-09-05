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
      {!props.plusContact ? (
        <Icon
          style={{color: 'white', width: wp(7)}}
          name={
            title === 'Settings' || !props.navigation ? null : 'cog-outline'
          }
          size={wp(7)}
          onPress={
            props.navigation
              ? () => props.navigation.navigate('Settings')
              : () => {}
          }
        />
      ) : (
        <Icon
          style={{color: 'white', width: wp(7)}}
          name="message-plus-outline"
          size={wp(7)}
          onPress={props.plusContact}
        />
      )}
    </View>
  );
};

export default Topbar;
