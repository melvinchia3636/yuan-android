/* eslint-disable react-native/no-inline-styles */
import React, {useState, useRef, useEffect} from 'react';
import axios from 'axios';
import {
  Text,
  View,
  Pressable,
  ScrollView,
  TextInput,
  Image,
  Keyboard,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Topbar from './Topbar';
import {ip} from './constant';
import FeatherIcons from 'react-native-vector-icons/Feather';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import SettingsView from './Settings';
import {useTranslation} from 'react-i18next';

const ChatStack = createStackNavigator();

function ChatView(token, setToken, navprops) {
  const [title, setTitle] = useState('Chat');
  return (
    <>
      <NavigationContainer>
        <ChatStack.Navigator headerMode="none">
          <ChatStack.Screen name="ChatIndex">
            {props => (
              <>
                <Topbar
                  title={title}
                  notSettings={[
                    () => props.navigation.navigate('AddContact'),
                    'message-plus-outline',
                  ]}
                />
                <ChatIndex
                  {...props}
                  setTitle={setTitle}
                  token={token}
                  navprops={navprops}
                />
              </>
            )}
          </ChatStack.Screen>
          <ChatStack.Screen name="AddContact">
            {props => (
              <>
                <Topbar title="AddContact" goback={props.navigation.goBack} />
                <AddContact
                  {...props}
                  setTitle={setTitle}
                  token={token}
                  navprops={navprops}
                />
              </>
            )}
          </ChatStack.Screen>
          <ChatStack.Screen name="Chat">
            {props => (
              <>
                <Topbar title={title} goback={props.navigation.goBack} />
                <Chat
                  {...props}
                  setTitle={setTitle}
                  token={token}
                  navprops={navprops}
                />
              </>
            )}
          </ChatStack.Screen>
          <ChatStack.Screen name="Settings">
            {props => (
              <>
                <Topbar title="Settings" goback={props.navigation.goBack} />
                <SettingsView {...props} token={token} setToken={setToken} />
              </>
            )}
          </ChatStack.Screen>
        </ChatStack.Navigator>
      </NavigationContainer>
    </>
  );
}

const ChatIndex = props => {
  const [chatRoom, setChatRoom] = useState([]);
  const fetchChatRoom = () => {
    axios({
      url: `http://${ip}/api/v1/chat/fetch-chatroom`,
      method: 'GET',
      headers: {
        Authorization: 'Token ' + props.token,
      },
    }).then(res => setChatRoom(res.data));
  };
  useEffect(() => {
    fetchChatRoom();

    props.navigation.addListener('focus', () => {
      fetchChatRoom();
    });
  }, []);

  return (
    <View>
      {chatRoom.map(e => (
        <Pressable
          key={e.id}
          style={{
            flexDirection: 'row',
            padding: wp(4),
            marginBottom: 1,
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'white',
            elevation: 5,
          }}
          onPress={() => props.navigation.navigate('Chat', {room_id: e.id})}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <View style={{elevation: 3}}>
              <Image
                style={{
                  width: wp(12),
                  height: wp(12),
                  borderRadius: 100,
                  marginRight: 10,
                }}
                source={{
                  uri: 'http://' + ip + e.target[0].avatar,
                }}
              />
            </View>
            <View>
              <Text
                style={{
                  fontSize: wp(4.4),
                  marginTop: 3,
                  fontFamily: 'Poppins-Medium',
                }}>
                {e.target.map(e => e.username).join(', ')}
              </Text>
              <Text
                style={{
                  fontFamily: 'Poppins-Regular',
                  color: '#666666',
                  marginTop: -3,
                  fontSize: wp(3.2),
                  maxWidth: wp(60),
                }}
                ellipsizeMode="tail"
                numberOfLines={1}>
                {e.last_message ? e.last_message.content : 'New Contact'}
              </Text>
            </View>
          </View>
          <Text
            style={{
              fontFamily: 'Poppins-Medium',
              color: '#666666',
              fontSize: wp(3),
            }}>
            {e.last_message ? e.last_message.time : ''}
          </Text>
        </Pressable>
      ))}
    </View>
  );
};

const Chat = ({token, navprops, ...props}) => {
  const roomID = props.route.params.room_id;
  const scrollViewRef = useRef();
  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState('');
  let fetchChatInterval;
  const sendMessage = () => {
    if (message) {
      setMessage('');
      axios({
        url: `http://${ip}/api/v1/chat/update-chat/` + roomID,
        method: 'POST',
        headers: {
          Authorization: 'Token ' + token,
        },
        data: {
          message: message,
        },
      })
        .then(() => {
          fetchChat();
        })
        .catch(err => console.log(err));
    }
  };

  const fetchChat = () => {
    axios({
      url: `http://${ip}/api/v1/chat/fetch-chat/` + roomID,
      method: 'GET',
      headers: {
        Authorization: 'Token ' + token,
      },
    })
      .then(r => setChat(r.data))
      .catch(err => err);
  };
  const {t, i18n} = useTranslation();

  React.useEffect(() => {
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
    fetchChat();
    props.navigation.addListener('focus', () => {
      fetchChatInterval = setInterval(() => fetchChat(), 3000);
      props.navigation.addListener('blur', payload => {
        try {
          clearInterval(fetchChatInterval);
        } catch {
          e => console.log(e);
        }
      });
    });
    navprops.navigation.addListener('didBlur', () => {
      props.navigation.navigate('ChatIndex');
      try {
        clearInterval(fetchChatInterval);
      } catch {
        e => console.log(e);
      }
    });
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
      clearInterval(fetchChatInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <View
        style={{
          flex: 1,
          justifyContent: 'flex-end',
          alignItems: 'center',
          paddingBottom: 10,
          backgroundColor: '#f6f5f7',
        }}>
        <ScrollView
          style={{
            width: '100%',
            marginTop: 10,
            marginBottom: 10,
            paddingBottom: 100,
            paddingHorizontal: 20,
          }}
          ref={scrollViewRef}
          onContentSizeChange={() =>
            scrollViewRef.current.scrollToEnd({animated: true})
          }>
          {chat.data
            ? (() => {
                return chat.data.map(e => {
                  return (
                    <View
                      style={{
                        alignSelf:
                          chat.self === e.author.id ? 'flex-end' : 'flex-start',
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginBottom: 20,
                      }}
                      key={e.id}>
                      {chat.self === e.author.id ? (
                        <Text
                          style={{
                            marginRight: 10,
                            fontSize: wp(2.8),
                            color: '#BBBBBB',
                            fontFamily: 'Poppins-Regular',
                            marginTop: 3,
                          }}>
                          {e.time}
                        </Text>
                      ) : null}
                      {chat.self !== e.author.id ? (
                        <Image
                          style={{
                            width: wp(10),
                            height: wp(10),
                            borderRadius: 100,
                            marginRight: 10,
                          }}
                          source={{
                            uri: 'http://' + ip + e.author.avatar,
                          }}
                        />
                      ) : null}
                      <Text
                        style={{
                          paddingBottom: 6,
                          paddingTop: 10,
                          paddingHorizontal: 20,
                          backgroundColor: 'white',
                          borderRadius: 10,
                          maxWidth: '70%',
                          color: '#141414',
                          fontFamily: 'Poppins-Regular',
                          fontSize: wp(3.5),
                        }}>
                        {e.content}
                      </Text>
                      {chat.self === e.author.id ? (
                        <Image
                          style={{
                            width: wp(10),
                            height: wp(10),
                            borderRadius: 100,
                            marginLeft: 10,
                          }}
                          source={{
                            uri: 'http://' + ip + e.author.avatar,
                          }}
                        />
                      ) : null}
                      {chat.self !== e.author.id ? (
                        <Text
                          style={{
                            marginLeft: 10,
                            fontSize: wp(2.8),
                            color: '#BBBBBB',
                            fontFamily: 'Poppins-Regular',
                            marginTop: 3,
                          }}>
                          {e.time}
                        </Text>
                      ) : null}
                    </View>
                  );
                });
              })()
            : null}
        </ScrollView>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            width: wp(90),
          }}>
          <TextInput
            style={{
              width: '90%',
              height: 40,
              backgroundColor: 'white',
              color: 'black',
              borderRadius: 100,
              paddingHorizontal: 15,
              paddingBottom: hp(0.6),
              fontFamily: 'Poppins-Regular',
            }}
            placeholder={t('common:typeMessage')}
            placeholderTextColor="#aaaaaa"
            value={message}
            onChangeText={setMessage}
          />
          <Pressable onPress={sendMessage} style={{marginLeft: 4, padding: 5}}>
            <FeatherIcons
              name="send"
              size={wp(6)}
              style={{transform: [{rotate: '45deg'}]}}
            />
          </Pressable>
        </View>
      </View>
    </>
  );
};

const AddContact = ({token, ...props}) => {
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    axios({
      url: `http://${ip}/api/v1/chat/fetch-contacts`,
      method: 'GET',
      headers: {
        Authorization: 'Token ' + token,
      },
    })
      .then(r => setContacts(r.data))
      .catch(err => err);
  }, []);

  const createContact = id => {
    axios({
      url: `http://${ip}/api/v1/chat/create-contact/${id}`,
      method: 'POST',
      headers: {
        Authorization: 'Token ' + token,
      },
    })
      .then(r => {
        props.navigation.navigate('Chat', {room_id: r.data});
      })
      .catch(err => err);
  };

  return (
    <>
      {contacts.map(e => (
        <Pressable
          key={e.id}
          style={{
            flexDirection: 'row',
            paddingHorizontal: wp(4),
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'white',
            elevation: 5,
          }}
          onPress={() => createContact(e.id)}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: wp(4),
              borderBottomColor: '#F5F5F5',
              borderBottomWidth: 1.8,
              width: '100%',
            }}>
            <Image
              style={{
                width: wp(12),
                height: wp(12),
                borderRadius: 100,
                marginRight: 10,
              }}
              source={{
                uri: 'http://' + ip + e.avatar,
              }}
            />
            <View>
              <Text
                style={{
                  fontSize: wp(4),
                  color: '#141414',
                  marginTop: 3,
                  fontFamily: 'Poppins-Medium',
                }}>
                {e.username}
              </Text>
            </View>
          </View>
        </Pressable>
      ))}
    </>
  );
};

export default ChatView;
