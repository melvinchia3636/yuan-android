/* eslint-disable react-native/no-inline-styles */
import React, {useState} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {Text, View, Pressable} from 'react-native';
import styles from './styles';
import axios from 'axios';
import {widthPercentageToDP as wp} from 'react-native-responsive-screen';

import Topbar from './Topbar';
require('intl'); // import intl object
require('intl/locale-data/jsonp/en-IN'); // load the required locale details

const getComments = async (date, token) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const comments = await axios({
    url: `http://147.158.216.19:9595/api/v1/comments/fetch-comments/auto/${year}/${month}`,
    method: 'GET',
    headers: {
      Authorization: 'Token ' + token,
    },
  }).catch(err => console.log(err));
  return JSON.parse(comments.data);
};

const CommentStack = createStackNavigator();

function CommentView(token) {
  const [title, setTitle] = useState('Comment');
  return (
    <>
      <Topbar title={title} />
      <NavigationContainer>
        <CommentStack.Navigator headerMode="none">
          <CommentStack.Screen name="Comment">
            {props => (
              <InnerCommentView {...props} setTitle={setTitle} token={token} />
            )}
          </CommentStack.Screen>
        </CommentStack.Navigator>
      </NavigationContainer>
    </>
  );
}

const InnerCommentView = props => {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [choosenDate, setChoosenDate] = useState(new Date());
  React.useEffect(() => {
    getComments(new Date(new Date().getFullYear(), month, 1), props.token).then(
      r => setComments(r),
    );
  }, [month, props.token]);
  const [comments, setComments] = useState(null);
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
          <Pressable style={{padding: 15}} onPress={() => setMonth(month - 1)}>
            <Ionicons
              name="chevron-back"
              style={{color: '#141414'}}
              size={27}
            />
          </Pressable>
          {(() => {
            const date = new Date(new Date().getFullYear(), month, 0);
            const month_text = date.toLocaleString('default', {month: 'long'});
            const year = date.getFullYear();
            return (
              <Text style={styles.monthText}>
                {month_text} {year}
              </Text>
            );
          })()}
          <Pressable style={{padding: 15}} onPress={() => setMonth(month + 1)}>
            <Ionicons
              name="chevron-forward"
              style={{color: '#141414'}}
              size={27}
            />
          </Pressable>
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
              let date_list = [];
              const date = new Date(new Date().getFullYear(), month - 1, 1);

              const gotComment = (comments || []).map(e =>
                new Date(e.date).getDate(),
              );
              const day_in_month = new Date(
                new Date().getFullYear(),
                month,
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
                        <Pressable
                          style={{
                            ...(parseInt(d, 10) === choosenDate.getDate() &&
                            month === choosenDate.getMonth() + 1 &&
                            !d.includes('p')
                              ? styles.todayContainer
                              : {}),
                            height: wp(9),
                          }}
                          key={Math.random()}
                          onPress={e => {
                            const element =
                              e._dispatchInstances.memoizedProps.children[0][0]
                                .props;
                            if (element.style.color === '#141414') {
                              setChoosenDate(
                                new Date(
                                  new Date().getFullYear(),
                                  month - 1,
                                  parseInt(element.children, 10),
                                ),
                              );
                            }
                          }}>
                          <Text
                            style={{
                              ...styles.day,
                              color: d.includes('p') ? '#999999' : '#141414',
                              ...(parseInt(d, 10) === choosenDate.getDate() &&
                              month === choosenDate.getMonth() + 1 &&
                              !d.includes('p')
                                ? {...styles.day, ...styles.today}
                                : {}),
                            }}
                            key={Math.random()}>
                            {d.replace('p', '')}
                          </Text>
                          {gotComment.includes(parseInt(d, 10)) &&
                          !d.includes('p') ? (
                            <Text
                              style={{
                                ...{
                                  textAlign: 'center',
                                  marginTop: -20,
                                  fontSize: 20,
                                  borderRadius: 100,
                                  fontFamily: 'Poppins-Regular',
                                },
                                ...(parseInt(d, 10) === choosenDate.getDate() &&
                                month === choosenDate.getMonth() + 1 &&
                                !d.includes('p')
                                  ? {
                                      color: 'white',
                                    }
                                  : {}),
                              }}>
                              ·
                            </Text>
                          ) : null}
                        </Pressable>
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
        <Text style={styles.homepageComment} numberOfLines={1}>
          {comments
            ? comments.filter(
                e => new Date(e.date).getDate() === choosenDate.getDate(),
              )[0]?.content
            : ''}
        </Text>
        <Text style={{...styles.homepageCommentAuthor, textAlign: 'left'}}>
          -{' '}
          {comments
            ? comments.filter(
                e => new Date(e.date).getDate() === choosenDate.getDate(),
              )[0]?.author_name
            : ''}
        </Text>
      </View>
    </>
  );
};

export default CommentView;
