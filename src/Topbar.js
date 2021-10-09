/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {View, Text, Alert, Pressable} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

import {useTranslation} from 'react-i18next';

import styles from './styles';

const Topbar = ({title, goback, navSettings, ...props}) => {
  const {t, i18n} = useTranslation();
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
      <Text style={styles.topbarTitle}>
        {title.includes('common:comment_date')
          ? (() => {
              const [label, date] = title.split(' ');
              const [day, month, year] = JSON.parse(date);
              return `${day} ${month} ${year}`;
            })()
          : t('common:' + title.toLowerCase() + 'Title')}
      </Text>
      {!props.notSettings ? (
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
      ) : props.notSettings[1] ? (
        <Icon
          style={{color: 'white'}}
          size={wp(7)}
          name={props.notSettings[1]}
          onPress={props.notSettings[0]}
        />
      ) : null}
    </View>
  );
};

export default Topbar;
