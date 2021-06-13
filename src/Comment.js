/* eslint-disable react-native/no-inline-styles */
import React, {useState} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {Text, View, Pressable} from 'react-native';
import styles from './styles';

import Topbar from './Topbar';
require('intl'); // import intl object
require('intl/locale-data/jsonp/en-IN'); // load the required locale details

const CommentStack = createStackNavigator();

function CommentView() {
  const [title, setTitle] = useState('Comment');
  return (
    <>
      <Topbar title={title} />
      <NavigationContainer>
        <CommentStack.Navigator headerMode="none">
          <CommentStack.Screen name="Comment">
            {props => <InnerCommentView {...props} setTitle={setTitle} />}
          </CommentStack.Screen>
          <CommentStack.Screen name="Chat">
            {props => <ChatRoomListView {...props} setTitle={setTitle} />}
          </CommentStack.Screen>
        </CommentStack.Navigator>
      </NavigationContainer>
    </>
  );
}

const ChatRoomListView = props => {
  React.useEffect(() => {
    props.setTitle('Chat');
    const unsubscribe = props.navigation.addListener('transitionStart', e => {
      if (e.data.closing) {
        props.setTitle('Comment');
      }
    });

    return unsubscribe;
  }, [props]);

  return (
    <>
      <View>
        <Text
          style={{
            fontFamily: 'Poppins-Medium',
            fontSize: 24,
          }}>
          Chat room hell yeah
        </Text>
      </View>
    </>
  );
};

const InnerCommentView = props => {
  React.useEffect(() => {
    const unsubscribe = props.navigation.addListener('transitionStart', e => {
      console.log('erhewths');
    });

    return unsubscribe;
  }, [props.navigation]);

  return (
    <>
      <View style={styles.commentView}>
        <View style={styles.monthContainer}>
          <Ionicons name="chevron-back" style={{color: '#141414'}} size={27} />
          {(() => {
            const date = new Date();
            const month = date.toLocaleString('default', {month: 'long'});
            const year = date.getFullYear();
            return (
              <Text style={styles.monthText}>
                {month} {year}
              </Text>
            );
          })()}
          <Ionicons
            name="chevron-forward"
            style={{color: '#141414'}}
            size={27}
          />
        </View>
        <View style={styles.calendar}>
          <View style={styles.weekdayContainer}>
            <Text style={{...styles.weekday, color: '#e65400'}}>SUN</Text>
            <Text style={styles.weekday}>MON</Text>
            <Text style={styles.weekday}>TUE</Text>
            <Text style={styles.weekday}>WED</Text>
            <Text style={styles.weekday}>THU</Text>
            <Text style={styles.weekday}>FRI</Text>
            <Text style={styles.weekday}>SAT</Text>
          </View>
          <View style={styles.dayContainer}>
            {(() => {
              // eslint-disable-next-line no-extend-native
              Array.prototype.chunk = function (chunk_size) {
                if (!this.length) {
                  return [];
                }

                return [this.slice(0, chunk_size)].concat(
                  this.slice(chunk_size).chunk(chunk_size),
                );
              };
              //<View style={styles.todayContainer}><Text style={{...styles.day, ...styles.today}}>9</Text></View>
              let date_list = [];
              const date = new Date(
                new Date().getFullYear(),
                new Date().getMonth(),
                1,
              );
              const day_in_month = new Date(
                new Date().getFullYear(),
                new Date().getMonth(),
                0,
              ).getDate();
              const diff = date.getDay();
              for (let i = 1; i <= diff; i++) {
                const d = new Date(date.setDate(date.getDate() - 1));
                date_list.push(d.getDate() + 'p');
              }
              date.setDate(date.getDate() + diff + 1);
              date_list.reverse();
              date_list = date_list
                .concat(
                  Array(day_in_month)
                    .fill(0)
                    .map((_, i) => i + 1 + ''),
                )
                .chunk(7);
              const last_row = date_list[date_list.length - 1];
              if (last_row.length) {
                date_list[date_list.length - 1] = last_row.concat(
                  Array(7 - last_row.length)
                    .fill(0)
                    .map((_, i) => i + 1 + 'p'),
                );
              }
              date_list = date_list.filter(e => e.length > 0);
              return (
                <View style={styles.calendar}>
                  {date_list.map(r => (
                    <View style={styles.dayRow} key={Math.random()}>
                      {r.map(d => (
                        <Text
                          style={{
                            ...styles.day,
                            color: d.includes('p') ? '#999999' : '#141414',
                          }}
                          key={Math.random()}>
                          {d.replace('p', '')}
                        </Text>
                      ))}
                    </View>
                  ))}
                </View>
              );
            })()}
          </View>
        </View>
        <View style={{marginBottom: 30, marginTop: 10}}>
          <Text style={styles.homepageSectionHeader}>Today's Lesson</Text>
          <View style={styles.homepageSectionHeaderSeperator} />
          <Text style={styles.homepageSectionContent}>English</Text>
          <Text style={styles.homepageSectionContentSub}>
            2.00p.m. - 3.00p.m.
          </Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}>
          <Text style={styles.homepageSectionHeader}>Today's Comment</Text>
          <Text style={styles.viewCommentBtn}>View</Text>
        </View>
        <View style={{...styles.homepageSectionHeaderSeperator, height: 3}} />
        <Text style={styles.homepageComment}>
          This is the comment for today. This is the comment from your teacher.
          The comment can be as long as you want. You can add ...
        </Text>
        <Text style={{...styles.homepageCommentAuthor, textAlign: 'left'}}>
          - Teacher's Name
        </Text>
        <Pressable
          style={styles.chatButton}
          onPress={() => props.navigation.navigate('Chat')}>
          <Ionicons name="chatbox-outline" style={{color: 'white'}} size={27} />
        </Pressable>
      </View>
    </>
  );
};

export default CommentView;
