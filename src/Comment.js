/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState, useRef} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import SlidingUpPanel from 'rn-sliding-up-panel';
import {OutlinedTextField} from 'rn-material-ui-textfield';
import Toast from 'react-native-tiny-toast';
import DocumentPicker from 'react-native-document-picker';
import AnimatedLoader from 'react-native-animated-loader';
import DatePicker from 'react-native-date-picker';
import DropDownPicker from 'react-native-dropdown-picker';

import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';

import {
  Text,
  View,
  Pressable,
  ScrollView,
  Image,
  TextInput,
  Keyboard,
  Linking,
  Alert,
} from 'react-native';
import styles from './styles';
import axios from 'axios';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

import SettingsView from './Settings';
import Topbar from './Topbar';
import {ip} from './constant';
import {useTranslation} from 'react-i18next';
import {downloadFile} from './Work';

require('intl'); // import intl object
require('intl/locale-data/jsonp/en-IN'); // load the required locale details

const getComments = async (date, token) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const comments = await axios({
    url: `https://${ip}/api/v1/comments/fetch-comments/auto/${year}/${month}`,
    method: 'GET',
    headers: {
      Authorization: 'Token ' + token,
    },
  }).catch(err => console.log(err));
  return JSON.parse(comments.data);
};

const getStudentsComment = async (date, token) => {
  const comments = await axios({
    url: `https://${ip}/api/v1/comments/fetch-students-comment/${date.getFullYear()}-${
      date.getMonth() + 1
    }-${date.getDate()}`,
    method: 'GET',
    headers: {
      Authorization: 'Token ' + token,
    },
  }).catch(err => console.log(err));
  return comments.data;
};

const CommentStack = createStackNavigator();

function CommentView(token, setToken) {
  const [title, setTitle] = useState('Calendar');
  return (
    <>
      <NavigationContainer>
        <CommentStack.Navigator
          screenOptions={{
            headerShown: false,
          }}>
          <CommentStack.Screen name="Calendar">
            {props => (
              <>
                <CalendarView {...props} setTitle={setTitle} token={token} />
              </>
            )}
          </CommentStack.Screen>
          <CommentStack.Screen name="EachComment">
            {props => (
              <>
                <EachCommentView
                  {...props}
                  title={title}
                  setTitle={setTitle}
                  token={token}
                />
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
          <CommentStack.Screen name="AddComment">
            {props => (
              <>
                <AddComment {...props} token={token} />
              </>
            )}
          </CommentStack.Screen>
          <CommentStack.Screen name="AddEvent">
            {props => (
              <>
                <AddEvent {...props} token={token} />
              </>
            )}
          </CommentStack.Screen>
          <CommentStack.Screen name="AddAnnouncement">
            {props => (
              <>
                <AddAnnouncement {...props} token={token} />
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
  const panelRef = useRef();
  const [panelHideToggle, setPanelHideToggle] = useState(false);
  !panelHideToggle && panelRef.current?.hide();
  const [comments, setComments] = useState(null);
  const [studentsComment, setStudentsComment] = useState([]);
  const [editable, setEditable] = useState(false);

  React.useEffect(() => {
    props.navigation.addListener('focus', () => {
      fetchEvent(choosenDate);
      getStudentsComment(choosenDate, props.token).then(r =>
        setStudentsComment(r),
      );
    });
  }, []);

  React.useEffect(() => {
    getComments(new Date(new Date().getFullYear(), month, 1), props.token).then(
      r => {
        setComments(r.data);
        setEditable(r.editable);
      },
    );
    if (editable) {
      getStudentsComment(choosenDate, props.token).then(r =>
        setStudentsComment(r),
      );
    }
  }, [month, props.token, editable]);

  React.useEffect(() => {
    if (editable) {
      getStudentsComment(choosenDate, props.token).then(r =>
        setStudentsComment(r),
      );
    }
  }, [choosenDate]);

  const fetchEvent = date => {
    const day = date.getDay() - 1 >= 0 ? date.getDay() - 1 : 6;
    axios({
      url: `https://${ip}/api/v1/events/fetch-event/${date.getFullYear()}-${
        date.getMonth() + 1
      }-${date.getDate()}`,
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
      <Topbar
        title="Calendar"
        notSettings={
          editable
            ? [
                () => {
                  panelRef.current.show();
                  setPanelHideToggle(true);
                },
                'plus',
              ]
            : ''
        }
      />
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
                            !d.includes('p') && (
                              <Text
                                style={{
                                  ...{
                                    textAlign: 'center',
                                    marginTop: -20,
                                    fontSize: 20,
                                    borderRadius: 100,
                                    fontFamily: 'Poppins-Regular',
                                  },
                                  ...(parseInt(d, 10) ===
                                    choosenDate.getDate() &&
                                  month === choosenDate.getMonth() + 1 &&
                                  !d.includes('p')
                                    ? {
                                        color: 'white',
                                      }
                                    : {}),
                                }}>
                                ·
                              </Text>
                            )}
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
        )[0] && (
          <Pressable
            style={{marginBottom: 20}}
            onPress={() =>
              props.navigation.navigate('EachComment', {
                choosenDate: choosenDate.toDateString(),
              })
            }>
            <Text style={styles.viewCommentBtn}>
              {t('common:viewCommentBtn')}
            </Text>
          </Pressable>
        )}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <Text style={styles.homepageSectionHeader}>{t('common:hello')}</Text>
        </View>
        <View
          style={{
            ...styles.homepageSectionHeaderSeperator,
          }}
        />
        {event?.class?.length > 0 || event?.activity?.length > 0 ? (
          <View
            style={{
              marginBottom: 20,
            }}>
            {event.class?.map(e => (
              <View
                style={{
                  marginBottom: 20,
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
            {event.activity?.map(e => (
              <View
                style={{
                  marginBottom: 20,
                }}>
                <Text
                  style={{
                    fontFamily: 'Poppins-Medium',
                    fontSize: wp(6),
                  }}>
                  {e.start_time.split(':').slice(0, 2).join(':')} -{' '}
                  {e.end_time.split(':').slice(0, 2).join(':')}
                </Text>
                <Text
                  style={{
                    fontFamily: 'Poppins-Medium',
                    color: '#141414',
                  }}>
                  {e.content}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Text
            style={{
              color: '#141414',
              fontFamily: 'Poppins-Regular',
              marginBottom: 20,
            }}>
            {t('common:noEvent')}
          </Text>
        )}
        {editable && (
          <View
            style={{
              paddingBottom: 40,
              marginHorizontal: 3,
            }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
              <Text style={styles.homepageSectionHeader}>
                {t('common:todayCommentTitle')}
              </Text>
            </View>
            <View
              style={{
                ...styles.homepageSectionHeaderSeperator,
              }}
            />
            {studentsComment.length ? (
              studentsComment.map(({id, author, content, student, avatar}) => (
                <Pressable
                  onPress={() =>
                    props.navigation.navigate('EachComment', {
                      id,
                      choosenDate: choosenDate.toDateString(),
                    })
                  }
                  style={{
                    width: '100%',
                    padding: 10,
                    elevation: 2,
                    borderRadius: 6,
                    backgroundColor: 'white',
                    marginBottom: 10,
                  }}>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <View
                      style={{
                        borderRadius: 100,
                        elevation: 1,
                        background: 'white',
                      }}>
                      <Image
                        source={{uri: 'https://' + ip + avatar}}
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 100,
                        }}
                      />
                    </View>
                    <Text
                      style={{
                        fontFamily: 'Poppins-Medium',
                        color: '#141414',
                        padddingTop: 3,
                        marginLeft: 10,
                        fontSize: wp(4),
                      }}>
                      {student}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontFamily: 'Poppins-Medium',
                      color: '#141414',
                      padddingTop: 3,
                      marginTop: 10,
                      fontSize: wp(3),
                    }}>
                    {content}
                  </Text>
                  <Text
                    style={{
                      fontFamily: 'Poppins-Medium',
                      textAlign: 'right',
                      fontSize: wp(3),
                    }}>
                    - {author}
                  </Text>
                </Pressable>
              ))
            ) : (
              <Text style={{color: '#141414', fontFamily: 'Poppins-Regular'}}>
                {t('common:noCommentCreated')}
              </Text>
            )}
          </View>
        )}
      </ScrollView>
      {editable && (
        <>
          {panelHideToggle && (
            <Pressable
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: hp(100),
                backgroundColor: 'black',
                opacity: 0.4,
              }}
              onPress={() => {
                panelRef.current?.hide();
                setPanelHideToggle(false);
              }}
            />
          )}
          <SlidingUpPanel
            draggableRange={{top: hp(26), bottom: -200}}
            allowDragging={false}
            showBackdrop={false /*For making it modal-like*/}
            ref={panelRef}
            onBottomReached={() => setPanelHideToggle(false)}
            friction={0.25}>
            <View
              style={{
                backgroundColor: 'white',
                width: wp(100),
                height: hp(90),
                borderRadius: 25,
                elevation: 15,
                paddingHorizontal: 28,
                paddingVertical: 15,
                borderWidth: 1,
                borderColor: 'rgba(0, 0, 0, 0.08)',
              }}>
              <Text
                style={{
                  fontSize: wp(5.6),
                  fontFamily: 'Poppins-Regular',
                  color: '#363636',
                  textAlign: 'center',
                }}>
                {t('common:titleCreate')}
              </Text>
              <View style={{marginTop: 20}}>
                <Pressable
                  onPress={() => {
                    panelRef.current?.hide();
                    setPanelHideToggle(false);
                    setTimeout(() => {
                      props.navigation.navigate('AddComment');
                    }, 120);
                  }}
                  style={{
                    flexDirection: 'row',
                  }}>
                  <Feather name="message-square" size={24} color="#363636" />
                  <Text
                    style={{
                      fontFamily: 'Poppins-Medium',
                      color: '#363636',
                      fontSize: wp(4),
                      marginLeft: 10,
                    }}>
                    {t('common:btnComment')}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    panelRef.current?.hide();
                    setPanelHideToggle(false);
                    setTimeout(() => {
                      props.navigation.navigate('AddEvent');
                    }, 100);
                  }}
                  style={{
                    flexDirection: 'row',
                    marginTop: 20,
                  }}>
                  <Feather name="calendar" size={24} color="#363636" />
                  <Text
                    style={{
                      fontFamily: 'Poppins-Medium',
                      color: '#363636',
                      fontSize: wp(4),
                      marginLeft: 10,
                    }}>
                    {t('common:btnEvent')}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    panelRef.current?.hide();
                    setPanelHideToggle(false);
                    setTimeout(() => {
                      props.navigation.navigate('AddAnnouncement');
                    }, 100);
                  }}
                  style={{
                    flexDirection: 'row',
                    marginTop: 20,
                  }}>
                  <Feather name="bell" size={24} color="#363636" />
                  <Text
                    style={{
                      fontFamily: 'Poppins-Medium',
                      color: '#363636',
                      fontSize: wp(4),
                      marginLeft: 10,
                    }}>
                    {t('common:btnAnnouncement')}
                  </Text>
                </Pressable>
              </View>
            </View>
          </SlidingUpPanel>
        </>
      )}
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
      url: `https://${ip}/api/v1/comments/fetch-replies/${
        props.route.params.id || 'auto'
      }/${data.id}`,
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
        url: `https://${ip}/api/v1/comments/add-reply/${comment.id}`,
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
      url: `https://${ip}/api/v1/comments/fetch-comment/${
        props.route.params.id || 'auto'
      }/${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`,
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
      /((?:https|ftp|httpss):\/\/(?:[\w_-]+(?:(?:\.[\w_-]+)+))(?:[\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-]))/g;
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

  const deleteComment = () => {
    Alert.alert(
      'Are your sure?',
      'Are you sure you want to delete this comment?',
      [
        // The "Yes" button
        {
          text: 'Yes',
          onPress: () => {
            axios({
              url: `https://${ip}/api/v1/comments/delete-comment/${comment.id}`,
              method: 'POST',
              headers: {
                authorization: 'Token ' + props.token,
              },
            }).then(() => props.navigation.navigate('Calendar'));
          },
        },
        {
          text: 'No',
        },
      ],
    );
  };

  return (
    <>
      <Topbar
        title={props.title}
        goback={props.navigation.goBack}
        notSettings={[() => deleteComment(), 'delete']}
      />
      <ScrollView
        style={{
          backgroundColor: 'white',
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
        {comment.attachment && (
          <Text
            style={{
              fontSize: wp(4.2),
              paddingBottom: 20,
              fontFamily: 'Poppins-Regular',
              color: '#999999',
            }}>
            {t('common:attachment')}
          </Text>
        )}
        <View
          style={{
            marginBottom: 20,
          }}>
          {comment.attachment &&
            JSON.parse(comment.attachment).map((e, i) => (
              <Pressable
                onPress={() =>
                  Linking.openURL('https://' + ip + '/media/' + e.path)
                }
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 15,
                  borderWidth: 1,
                  borderColor: 'rgba(0, 0, 0, 0.1)',
                  borderRadius: 30,
                  marginBottom: 5,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                <Text
                  numberOfLines={1}
                  style={{
                    fontFamily: 'Poppins-Medium',
                    color: '#333333',
                    lineHeight: wp(5),
                    maxWidth: '90%',
                  }}>
                  {e.name}
                </Text>
                <Pressable
                  onPress={() => {
                    downloadFile(e.path);
                  }}>
                  <MaterialIcon name="download" size={wp(4.6)} />
                </Pressable>
              </Pressable>
            ))}
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
            {replies.content &&
              replies.content.map(e => (
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
                      uri: 'https://' + ip + e.avatar,
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
              ))}
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
              backgroundColor: '#f8f8f8',
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
            <Feather
              name="send"
              size={wp(6)}
              style={{transform: [{rotate: '45deg'}]}}
            />
          </Pressable>
        </View>
      </ScrollView>
    </>
  );
};

const AddComment = props => {
  const [content, setContent] = useState('');
  const [isError, setIsError] = useState(false);
  const [attachment, setAttachment] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [date, setDate] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [open2, setOpen2] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentChoice, setStudentChoice] = useState([]);
  const {t, i18n} = useTranslation();

  const submitContent = () => {
    if (content.trim() && selectedStudent !== null) {
      const body = new FormData();
      const attachments = attachment.filter(e => e.type === 'new');

      attachments.forEach(item => body.append('file[]', item.content));
      body.append('content', content.trim());
      body.append(
        'date',
        `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`,
      );
      body.append('student', selectedStudent);

      setLoading(true);
      axios({
        url: `https://${ip}/api/v1/comments/create-comment`,
        method: 'POST',
        headers: {
          authorization: 'Token ' + props.token,
        },
        data: body,
      })
        .then(() => {
          Toast.show('Comment created successfully', {
            containerStyle: {
              backgroundColor: 'rgba(0, 0, 0, .5)',
              paddingHorizontal: 20,
              borderRadius: 30,
            },
          });
          props.navigation.navigate('Calendar');
        })
        .catch(err => console.log(err));
    } else {
      if (!content.trim()) {
        setIsError(true);
      }
      if (selectedStudent === null) {
        Toast.show('Please select a student', {
          containerStyle: {
            backgroundColor: 'rgba(0, 0, 0, .5)',
            paddingHorizontal: 20,
            borderRadius: 30,
          },
        });
      }
    }
  };

  const askForFile = async () => {
    try {
      const ress = await DocumentPicker.pickMultiple({
        type: [DocumentPicker.types.allFiles],
      });
      const work = [];
      for (let res of ress) {
        if (!attachment.map(e => e.content.name).includes(res.name)) {
          work.push({type: 'new', content: res});
        }
      }
      setAttachment(attachment.concat(work));
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('error -----', err);
      } else {
      }
    }
  };

  useEffect(() => {
    axios({
      url: `https://${ip}/api/v1/comments/fetch-students/${date.getFullYear()}-${
        date.getMonth() + 1
      }-${date.getDate()}`,
      method: 'GET',
      headers: {
        Authorization: 'Token ' + props.token,
      },
    })
      .then(res => {
        setSelectedStudent(null);
        setStudentChoice(
          res.data.map(([value, label]) => ({
            label,
            value,
          })),
        );
      })
      .catch(err => console.log(err));
  }, [date]);

  return (
    <>
      <Topbar
        title={'addComment'}
        goback={props.navigation.goBack}
        {...props}
        notSettings={[submitContent, 'send']}
      />
      <View style={{backgroundColor: 'white', height: hp(100)}}>
        <ScrollView
          style={{
            paddingHorizontal: 20,
            paddingVertical: 20,
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
            }}>
            <OutlinedTextField
              label={t('common:date')}
              tintColor="#f64d00"
              defaultValue={date.toLocaleDateString('zh-hanz')}
              containerStyle={{marginTop: 10, width: '90%'}}
              onChangeText={t => setDate(t)}
              labelTextStyle={{fontFamily: 'Poppins-Medium', paddingTop: 3}}
              editable={false}
              style={{color: '#363636', fontFamily: 'Poppins-Medium'}}
            />
            <Pressable onPress={() => setOpen(true)}>
              <Feather name="calendar" size={wp(6)} />
            </Pressable>
          </View>
          <DatePicker
            modal
            open={open}
            date={date}
            textColor="#141414"
            mode="date"
            onConfirm={date => {
              setOpen(false);
              setDate(date);
            }}
            onCancel={() => {
              setOpen(false);
            }}
          />
          <DropDownPicker
            open={open2}
            value={selectedStudent}
            items={studentChoice}
            setOpen={setOpen2}
            setValue={setSelectedStudent}
            setItems={setStudentChoice}
            placeholder={t('common:dropdownPlaceholder')}
            style={{
              borderColor: 'rgba(0, 0, 0, .38)',
              marginTop: 9,
              borderRadius: 4,
            }}
            containerStyle={{
              width: '100%',
            }}
            textStyle={{
              fontFamily: 'Poppins-Regular',
              marginTop: 3,
              fontSize: wp(3.6),
            }}
          />
          <OutlinedTextField
            label={t('common:content')}
            tintColor="#f64d00"
            characterRestriction={1000}
            containerStyle={{marginTop: 18}}
            onChangeText={t => {
              setContent(t);
              setIsError(false);
            }}
            error={isError ? 'Required' : ''}
            labelTextStyle={{fontFamily: 'Poppins-Medium', paddingTop: 3}}
            multiline
            style={{fontFamily: 'Poppins-Regular', fontSize: wp(3.6)}}
          />
          <View style={{paddingBottom: 180, marginTop: 30}}>
            <View style={{marginBottom: 10}}>
              {attachment.map((e, i) => (
                <Pressable
                  style={{
                    paddingVertical: 5,
                    paddingHorizontal: 15,
                    marginBottom: 5,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                  <Text
                    numberOfLines={1}
                    style={{
                      fontFamily: 'Poppins-Medium',
                      color: '#333333',
                      lineHeight: wp(5),
                      maxWidth: '90%',
                    }}>
                    {e.content.name}
                  </Text>
                  <Pressable
                    onPress={() => {
                      setAttachment(
                        attachment.filter((_, index) => index !== i),
                      );
                    }}>
                    <Feather name="x" size={18} color="#141414" />
                  </Pressable>
                </Pressable>
              ))}
            </View>
            <Pressable
              onPress={askForFile}
              style={{
                backgroundColor: 'white',
                padding: 5,
                paddingTop: 8,
                borderRadius: 5,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: 'rgba(0, 0, 0, 0.38)',
              }}>
              <Feather
                name="paperclip"
                style={{
                  color: '#e64d00',
                  marginTop: -3,
                  marginRight: 5,
                }}
                size={wp(4.5)}
              />
              <Text
                style={{
                  color: '#e64d00',
                  textAlign: 'center',
                  fontFamily: 'Poppins-Medium',
                  fontSize: wp(3.5),
                }}>
                {t('common:addAttachment')}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
        <AnimatedLoader
          visible={isLoading}
          overlayColor="rgba(255,255,255,.9)"
          source={require('./loader.json')}
          animationStyle={{
            width: 100,
            height: 100,
          }}
          speed={1}>
          <Text
            style={{
              fontFamily: 'Poppins-Regular',
              fontSize: wp(4),
            }}>
            Uploading ...
          </Text>
        </AnimatedLoader>
      </View>
    </>
  );
};

const AddAnnouncement = props => {
  const [content, setContent] = useState('');
  const [isError, setIsError] = useState(false);
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [open2, setOpen2] = useState(false);
  const [open3, setOpen3] = useState(false);
  const [title, setTitle] = useState('');
  const [isTitleError, setIsTitleError] = useState(false);
  const {t, i18n} = useTranslation();

  const submitContent = () => {
    if (content.trim() && title.trim()) {
      axios({
        url: `https://${ip}/api/v1/announcement/create-announcement`,
        method: 'POST',
        data: {
          startTime: startTime.toLocaleDateString('en'),
          endTime: endTime.toLocaleDateString('en'),
          title,
          content,
        },
        headers: {
          authorization: 'Token ' + props.token,
        },
      })
        .then(() => {
          Toast.show('Announcement created successfully', {
            containerStyle: {
              backgroundColor: 'rgba(0, 0, 0, .5)',
              paddingHorizontal: 20,
              borderRadius: 30,
            },
          });
          props.navigation.navigate('Calendar');
        })
        .catch(err => console.log(err));
    } else {
      if (!content.trim()) {
        setIsError(true);
      }

      if (!title.trim()) {
        setIsTitleError(true);
      }
    }
  };

  return (
    <>
      <Topbar
        title={'addAnnouncement'}
        goback={props.navigation.goBack}
        {...props}
        notSettings={[submitContent, 'send']}
      />
      <View style={{backgroundColor: 'white', height: hp(100)}}>
        <ScrollView
          style={{
            paddingHorizontal: 20,
            paddingVertical: 20,
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
            }}>
            <OutlinedTextField
              label={t('common:startTime')}
              tintColor="#f64d00"
              defaultValue={startTime.toLocaleDateString('zh-hanz')}
              containerStyle={{marginTop: 10, width: '90%'}}
              labelTextStyle={{fontFamily: 'Poppins-Medium', paddingTop: 3}}
              editable={false}
              style={{color: '#363636', fontFamily: 'Poppins-Medium'}}
            />
            <Pressable onPress={() => setOpen2(true)}>
              <Feather name="clock" size={wp(6)} />
            </Pressable>
          </View>
          <DatePicker
            modal
            open={open2}
            date={startTime}
            textColor="#141414"
            mode="date"
            onConfirm={time => {
              setOpen2(false);
              setStartTime(time);
            }}
            onCancel={() => {
              setOpen2(false);
            }}
          />
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
            }}>
            <OutlinedTextField
              label={t('common:endTime')}
              tintColor="#f64d00"
              defaultValue={endTime.toLocaleDateString('zh-hanz')}
              containerStyle={{marginTop: 10, width: '90%'}}
              labelTextStyle={{fontFamily: 'Poppins-Medium', paddingTop: 3}}
              editable={false}
              style={{color: '#363636', fontFamily: 'Poppins-Medium'}}
            />
            <Pressable onPress={() => setOpen3(true)}>
              <Feather name="clock" size={wp(6)} />
            </Pressable>
          </View>
          <DatePicker
            modal
            open={open3}
            date={endTime}
            textColor="#141414"
            mode="date"
            onConfirm={time => {
              setOpen3(false);
              setEndTime(time);
            }}
            onCancel={() => {
              setOpen3(false);
            }}
          />
          <OutlinedTextField
            label={t('common:announcementTitle')}
            tintColor="#f64d00"
            characterRestriction={200}
            containerStyle={{marginTop: 18}}
            onChangeText={t => {
              setTitle(t);
              setIsTitleError(false);
            }}
            error={isTitleError ? 'Required' : ''}
            labelTextStyle={{fontFamily: 'Poppins-Medium', paddingTop: 3}}
            style={{fontFamily: 'Poppins-Regular', fontSize: wp(3.6)}}
          />
          <OutlinedTextField
            label={t('common:announcementDesc')}
            tintColor="#f64d00"
            characterRestriction={1000}
            containerStyle={{marginTop: 18}}
            onChangeText={t => {
              setContent(t);
              setIsError(false);
            }}
            error={isError ? 'Required' : ''}
            labelTextStyle={{fontFamily: 'Poppins-Medium', paddingTop: 3}}
            multiline
            style={{fontFamily: 'Poppins-Regular', fontSize: wp(3.6)}}
          />
        </ScrollView>
      </View>
    </>
  );
};

const AddEvent = props => {
  const [content, setContent] = useState('');
  const [isError, setIsError] = useState(false);
  const [date, setDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [open2, setOpen2] = useState(false);
  const [open3, setOpen3] = useState(false);
  const {t, i18n} = useTranslation();

  const submitContent = () => {
    if (content.trim()) {
      axios({
        url: `https://${ip}/api/v1/activity/create-activity`,
        method: 'POST',
        data: {
          date: date.toDateString(),
          startTime: startTime.toLocaleTimeString('en', {
            hour12: false,
            hour: 'numeric',
            minute: 'numeric',
          }),
          endTime: endTime.toLocaleTimeString('en', {
            hour12: false,
            hour: 'numeric',
            minute: 'numeric',
          }),
          content,
        },
        headers: {
          authorization: 'Token ' + props.token,
        },
      })
        .then(() => {
          Toast.show('Event created successfully', {
            containerStyle: {
              backgroundColor: 'rgba(0, 0, 0, .5)',
              paddingHorizontal: 20,
              borderRadius: 30,
            },
          });
          props.navigation.navigate('Calendar');
        })
        .catch(err => console.log(err));
    } else {
      if (!content.trim()) {
        setIsError(true);
      }
    }
  };

  return (
    <>
      <Topbar
        title={'addEvent'}
        goback={props.navigation.goBack}
        {...props}
        notSettings={[submitContent, 'send']}
      />
      <View style={{backgroundColor: 'white', height: hp(100)}}>
        <ScrollView
          style={{
            paddingHorizontal: 20,
            paddingVertical: 20,
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
            }}>
            <OutlinedTextField
              label={t('common:date')}
              tintColor="#f64d00"
              defaultValue={date.toLocaleDateString('zh-hanz')}
              containerStyle={{marginTop: 10, width: '90%'}}
              labelTextStyle={{fontFamily: 'Poppins-Medium', paddingTop: 3}}
              editable={false}
              style={{color: '#363636', fontFamily: 'Poppins-Medium'}}
            />
            <Pressable onPress={() => setOpen(true)}>
              <Feather name="calendar" size={wp(6)} />
            </Pressable>
          </View>
          <DatePicker
            modal
            open={open}
            date={date}
            textColor="#141414"
            mode="date"
            onConfirm={date => {
              setOpen(false);
              setDate(date);
            }}
            onCancel={() => {
              setOpen(false);
            }}
          />
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
            }}>
            <OutlinedTextField
              label={t('common:startTime')}
              tintColor="#f64d00"
              defaultValue={startTime.toLocaleTimeString('zh-hanz', {
                minute: 'numeric',
                hour: 'numeric',
              })}
              containerStyle={{marginTop: 10, width: '90%'}}
              labelTextStyle={{fontFamily: 'Poppins-Medium', paddingTop: 3}}
              editable={false}
              style={{color: '#363636', fontFamily: 'Poppins-Medium'}}
            />
            <Pressable onPress={() => setOpen2(true)}>
              <Feather name="clock" size={wp(6)} />
            </Pressable>
          </View>
          <DatePicker
            modal
            open={open2}
            date={startTime}
            textColor="#141414"
            mode="time"
            onConfirm={time => {
              setOpen2(false);
              setStartTime(time);
            }}
            onCancel={() => {
              setOpen2(false);
            }}
          />
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
            }}>
            <OutlinedTextField
              label={t('common:endTime')}
              tintColor="#f64d00"
              defaultValue={endTime.toLocaleTimeString('zh-hanz', {
                minute: 'numeric',
                hour: 'numeric',
              })}
              containerStyle={{marginTop: 10, width: '90%'}}
              labelTextStyle={{fontFamily: 'Poppins-Medium', paddingTop: 3}}
              editable={false}
              style={{color: '#363636', fontFamily: 'Poppins-Medium'}}
            />
            <Pressable onPress={() => setOpen3(true)}>
              <Feather name="clock" size={wp(6)} />
            </Pressable>
          </View>
          <DatePicker
            modal
            open={open3}
            date={endTime}
            textColor="#141414"
            mode="time"
            onConfirm={time => {
              setOpen3(false);
              setEndTime(time);
            }}
            onCancel={() => {
              setOpen3(false);
            }}
          />
          <OutlinedTextField
            label={t('common:eventDesc')}
            tintColor="#f64d00"
            characterRestriction={1000}
            containerStyle={{marginTop: 18}}
            onChangeText={t => {
              setContent(t);
              setIsError(false);
            }}
            error={isError ? 'Required' : ''}
            labelTextStyle={{fontFamily: 'Poppins-Medium', paddingTop: 3}}
            multiline
            style={{fontFamily: 'Poppins-Regular', fontSize: wp(3.6)}}
          />
        </ScrollView>
      </View>
    </>
  );
};

export default CommentView;
