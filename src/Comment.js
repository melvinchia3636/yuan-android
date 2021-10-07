/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState, useRef} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FeatherIcons from 'react-native-vector-icons/Feather';
import {
  Text,
  View,
  Pressable,
  ScrollView,
  Image,
  TextInput,
  Keyboard,
  Linking,
} from 'react-native';
import styles from './styles';
import axios from 'axios';
import {widthPercentageToDP as wp} from 'react-native-responsive-screen';

import SettingsView from './Settings';
import Topbar from './Topbar';
import {ip} from './constant';
import {useTranslation} from 'react-i18next';

require('intl'); // import intl object
require('intl/locale-data/jsonp/en-IN'); // load the required locale details

const getComments = async (date, token) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const comments = await axios({
    url: `http://${ip}/api/v1/comments/fetch-comments/auto/${year}/${month}`,
    method: 'GET',
    headers: {
      Authorization: 'Token ' + token,
    },
  }).catch(err => console.log(err));
  return JSON.parse(comments.data);
};

const CommentStack = createStackNavigator();

function CommentView(token, setToken) {
  const [title, setTitle] = useState('Calendar');
  return (
    <>
      <NavigationContainer>
        <CommentStack.Navigator headerMode="none">
          <CommentStack.Screen name="Calendar">
            {props => (
              <>
                <Topbar title="Calendar" />
                <CalendarView {...props} setTitle={setTitle} token={token} />
              </>
            )}
          </CommentStack.Screen>
          <CommentStack.Screen name="EachComment">
            {props => (
              <>
                <Topbar title={title} goback={props.navigation.goBack} />
                <EachCommentView {...props} setTitle={setTitle} token={token} />
              </>
            )}
          </CommentStack.Screen>
          <CommentStack.Screen name="Settings">
            {props => (
              <>
                <Topbar title="Settings" goback={props.navigation.goBack} />
                <SettingsView {...props} token={token} setToken={setToken} />
              </>
            )}
          </CommentStack.Screen>
        </CommentStack.Navigator>
      </NavigationContainer>
    </>
  );
}

const CalendarView = props => {
  const {t, i18n} = useTranslation();
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [choosenDate, setChoosenDate] = useState(new Date());
  const [event, setEvent] = useState([]);
  React.useEffect(() => {
    getComments(new Date(new Date().getFullYear(), month, 1), props.token).then(
      r => setComments(r),
    );
  }, [month, props.token]);
  const [comments, setComments] = useState(null);

  const fetchEvent = date => {
    const day = date.getDay() - 1 >= 0 ? date.getDay() - 1 : 6;
    axios({
      url: `http://${ip}/api/v1/events/fetch-event/${day}`,
      method: 'GET',
      headers: {
        Authorization: 'Token ' + props.token,
      },
    })
      .then(e => setEvent(e.data))
      .catch(err => console.log(err));
  };

  return (
    <>
      <ScrollView style={styles.commentView}>
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
            const month_text = t(
              'common:' +
                date.toLocaleString('default', {month: 'long'}).toLowerCase(),
            );
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
            <Text style={{...styles.weekday, color: '#e65400'}}>
              {t('common:sunday')}
            </Text>
            <Text style={styles.weekday}>{t('common:monday')}</Text>
            <Text style={styles.weekday}>{t('common:tuesday')}</Text>
            <Text style={styles.weekday}>{t('common:wednesday')}</Text>
            <Text style={styles.weekday}>{t('common:thursday')}</Text>
            <Text style={styles.weekday}>{t('common:friday')}</Text>
            <Text style={styles.weekday}>{t('common:saturday')}</Text>
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
                              fetchEvent(
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
        {comments?.filter(
          e => new Date(e.date).getDate() === choosenDate.getDate(),
        )[0] ? (
          <Pressable
            onPress={() =>
              props.navigation.navigate('EachComment', {
                choosenDate: choosenDate.toDateString(),
              })
            }>
            <Text style={styles.viewCommentBtn}>
              {t('common:viewCommentBtn')}
            </Text>
          </Pressable>
        ) : null}
        <View
          style={{
            marginBottom: 20,
          }}>
          {event.map(e => (
            <View
              style={{
                marginBottom: 10,
                marginTop: 20,
              }}>
              <Text
                style={{
                  fontFamily: 'Poppins-Medium',
                  fontSize: wp(6),
                }}>
                {e.start} - {e.end}
              </Text>
              <Text
                style={{
                  fontFamily: 'Poppins-Medium',
                  fontSize: wp(4),
                  color: '#141414',
                }}>
                {e.class_name}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </>
  );
};

const EachCommentView = props => {
  const date = new Date(props.route.params.choosenDate);
  const {t, i18n} = useTranslation();

  props.setTitle(
    'common:comment_date ' +
      JSON.stringify([
        date.getDate(),
        t(
          'common:' +
            date.toLocaleString('default', {month: 'long'}).toLowerCase(),
        ),
        date.getFullYear(),
      ]),
  );

  const [comment, setComment] = useState({});
  const [replies, setReplies] = useState({});
  const [message, setMessage] = useState('');
  const scrollViewRef = useRef();

  const updateReplies = data => {
    axios({
      url: `http://${ip}/api/v1/comments/fetch-replies/auto/${data.id}`,
      method: 'GET',
      headers: {
        Authorization: 'Token ' + props.token,
      },
    })
      .then(res => {
        setReplies(res.data);
      })
      .catch(err => console.log(err));
  };

  const sendReply = () => {
    if (message) {
      axios({
        url: `http://${ip}/api/v1/comments/add-reply/${comment.id}`,
        method: 'PUT',
        data: {
          reply: message,
        },
        headers: {
          Authorization: 'Token ' + props.token,
        },
      }).then(() => {
        updateReplies(comment);
        setMessage('');
        scrollViewRef.current.scrollToEnd({animated: true});
      });
    }
  };

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        scrollViewRef.current
          ? scrollViewRef.current.scrollToEnd({animated: true})
          : '';
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        scrollViewRef.current
          ? scrollViewRef.current.scrollToEnd({animated: true})
          : '';
      },
    );
    axios({
      url: `http://${ip}/api/v1/comments/fetch-comment/auto/${date.getFullYear()}/${
        date.getMonth() + 1
      }/${date.getDate()}`,
      method: 'GET',
      headers: {
        Authorization: 'Token ' + props.token,
      },
    })
      .then(res => {
        const data = JSON.parse(res.data);
        setComment(data);
        updateReplies(data);
      })
      .catch(err => console.log(err));

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatURL = content => {
    const urlPattern =
      /((?:http|ftp|https):\/\/(?:[\w_-]+(?:(?:\.[\w_-]+)+))(?:[\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-]))/g;
    return (
      <>
        {content?.split(urlPattern)?.map(e => {
          let url = e.match(urlPattern);
          return url ? (
            <Text
              style={{color: '#e64d00'}}
              onPress={() => Linking.openURL(url[0])}>
              {e}
            </Text>
          ) : (
            <Text>{e}</Text>
          );
        })}
      </>
    );
  };

  return (
    <ScrollView
      style={{
        paddingHorizontal: wp(6),
        paddingTop: wp(6),
      }}
      ref={scrollViewRef}
      contentContainerStyle={{flexDirection: 'column'}}>
      <View style={{flexDirection: 'row'}}>
        <Text
          style={{
            fontSize: wp(16),
            fontFamily: 'Poppins-Regular',
            marginTop: -wp(5),
            marginRight: 10,
          }}>
          “
        </Text>
        <Text
          style={{
            fontSize: wp(4),
            fontFamily: 'Poppins-Regular',
            width: wp(78),
            color: 'black',
            marginBottom: wp(8),
          }}>
          {formatURL(comment.content)}
        </Text>
      </View>
      <View>
        <Text
          style={{
            color: 'black',
            fontSize: wp(6),
            fontFamily: 'Poppins-Medium',
          }}>
          {t('common:replyTitle')}
        </Text>
        <Text
          style={{
            fontFamily: 'Poppins-Medium',
            color: '#888888',
            marginBottom: 20,
          }}>
          {replies.count || 0} {t('common:replyCount')}
        </Text>
        <View style={{marginBottom: wp(4)}}>
          {replies.content
            ? replies.content.map(e => (
                <View
                  style={{flexDirection: 'row', marginBottom: 20}}
                  key={e.id}>
                  <Image
                    style={{
                      width: wp(12),
                      height: wp(12),
                      borderRadius: 100,
                      marginRight: 10,
                      marginTop: 5,
                    }}
                    source={{
                      uri: 'http://' + ip + e.avatar,
                    }}
                  />
                  <View style={{width: '84%'}}>
                    <Text
                      style={{
                        fontFamily: 'Poppins-Medium',
                      }}>
                      {e.author}
                    </Text>
                    <Text
                      style={{
                        fontFamily: 'Poppins-Regular',
                        color: '#141414',
                      }}>
                      {e.content}
                    </Text>
                  </View>
                </View>
              ))
            : null}
        </View>
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: wp(12),
        }}>
        <TextInput
          style={{
            backgroundColor: 'white',
            color: '#141414',
            paddingBottom: 8,
            paddingHorizontal: 20,
            fontFamily: 'Poppins-Regular',
            borderRadius: 100,
            width: '90%',
          }}
          placeholderTextColor="#999999"
          placeholder={t('common:typeReply')}
          value={message}
          onChangeText={setMessage}
        />
        <Pressable onPress={sendReply} style={{marginLeft: 4, padding: 5}}>
          <FeatherIcons
            name="send"
            size={wp(6)}
            style={{transform: [{rotate: '45deg'}]}}
          />
        </Pressable>
      </View>
    </ScrollView>
  );
};

export default CommentView;
