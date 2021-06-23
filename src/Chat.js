/* eslint-disable react-native/no-inline-styles */
import React, {useState, useRef} from 'react';
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
import FeatherIcons from 'react-native-vector-icons/Feather';

const Chat = (token, setToken, navprops) => {
  const scrollViewRef = useRef();
  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState('');
  const sendMessage = () => {
    if (message) {
      setMessage('');
      axios({
        url: 'http://147.158.196.71:9595/api/v1/chat/update-chat/26e628d4-8f50-47fe-b80f-7b13cd046d88',
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
      url: 'http://147.158.196.71:9595/api/v1/chat/fetch-chat/26e628d4-8f50-47fe-b80f-7b13cd046d88',
      method: 'GET',
      headers: {
        Authorization: 'Token ' + token,
      },
    })
      .then(r => setChat(r.data))
      .catch(err => err);
  };

  React.useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        scrollViewRef.current.scrollToEnd({animated: true});
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        scrollViewRef.current.scrollToEnd({animated: true});
      },
    );
    fetchChat();
    const fetchChatInterval = setInterval(() => fetchChat(), 3000);
    navprops.navigation.addListener('didBlur', payload => {
      try {
        clearInterval(fetchChatInterval);
      } catch {
        e => console.log(e);
      }
    });
    navprops.navigation.addListener('didFocus', payload => {
      const fetchChatInterval = setInterval(() => fetchChat(), 3000);
      navprops.navigation.addListener('didBlur', payload => {
        try {
          clearInterval(fetchChatInterval);
        } catch {
          e => console.log(e);
        }
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Topbar title="Chat" />
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
                            uri: 'http://147.158.196.71:9595' + e.author.avatar,
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
                            uri: 'http://147.158.196.71:9595' + e.author.avatar,
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
            placeholder="Type a message"
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

export default Chat;
