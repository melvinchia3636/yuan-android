import React, { useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons'
import { Text, View, Pressable } from 'react-native'
import styles from './styles'

import Topbar from './Topbar'

const CommentStack = createStackNavigator();

function CommentView() {
	const [title, setTitle] = useState('Comment')
	return (<>
		<Topbar title={title}/>
		<NavigationContainer>
			<CommentStack.Navigator headerMode='none'>
				<CommentStack.Screen name="Comment">
					{props => <InnerCommentView {...props} setTitle={setTitle}/>}
				</CommentStack.Screen>
				<CommentStack.Screen name="Chat">
					{props => <ChatRoomListView {...props} setTitle={setTitle}/>}
				</CommentStack.Screen>
			</CommentStack.Navigator>
		</NavigationContainer>
	</>);
	}

const ChatRoomListView = (props) => {
	React.useEffect(() => {
		props.setTitle('Chat')
		const unsubscribe = props.navigation.addListener('transitionStart', (e) => {
			if (e.data.closing) props.setTitle('Comment')
		});
	
		return unsubscribe;
	}, [props.navigation]);

	return (<>
		<View>
			<Text style={{
				fontFamily: 'Poppins-Medium',
				fontSize: 24
			}}>Chat room hell yeah</Text>
		</View>
	</>)
	}

const InnerCommentView = (props) => {
	React.useEffect(() => {
		const unsubscribe = props.navigation.addListener('transitionStart', (e) => {
			console.log('erhewths')
		});
	
		return unsubscribe;
	}, [props.navigation]);

	return (<>
		<View style={
		styles.commentView
		}>
			<View style={styles.monthContainer}>
				<Ionicons name='chevron-back' style={{color: '#141414'}} size={27}></Ionicons>
				<Text style={styles.monthText}>June 2021</Text>
				<Ionicons name='chevron-forward' style={{color: '#141414'}} size={27}></Ionicons>
			</View>
			<View style={styles.calendar}>
				<View style={styles.weekdayContainer}>
					<Text style={{...styles.weekday, "color": '#e65400'}}>SUN</Text>
					<Text style={styles.weekday}>MON</Text>
					<Text style={styles.weekday}>TUE</Text>
					<Text style={styles.weekday}>WED</Text>
					<Text style={styles.weekday}>THU</Text>
					<Text style={styles.weekday}>FRI</Text>
					<Text style={styles.weekday}>SAT</Text>
				</View>
				<View style={styles.dayContainer}>
					<View style={styles.dayRow}>
						<Text style={{...styles.day, "color": "#999999"}}>30</Text>
						<Text style={{...styles.day, "color": "#999999"}}>31</Text>
						<Text style={styles.day}>1</Text>
						<Text style={styles.day}>2</Text>
						<Text style={styles.day}>3</Text>
						<Text style={styles.day}>4</Text>
						<Text style={styles.day}>5</Text>
					</View>
					<View style={{...styles.dayRow, marginVertical: 2.5}}>
						<Text style={styles.day}>6</Text>
						<Text style={styles.day}>7</Text>
						<Text style={styles.day}>8</Text>
						<View style={styles.todayContainer}><Text style={{...styles.day, ...styles.today}}>9</Text></View>
						<Text style={styles.day}>10</Text>
						<Text style={styles.day}>11</Text>
						<Text style={styles.day}>12</Text>
					</View>
					<View style={styles.dayRow}>
						<Text style={styles.day}>13</Text>
						<Text style={styles.day}>14</Text>
						<Text style={styles.day}>15</Text>
						<Text style={styles.day}>16</Text>
						<Text style={styles.day}>17</Text>
						<Text style={styles.day}>18</Text>
						<Text style={styles.day}>19</Text>
					</View>
					<View style={styles.dayRow}>
						<Text style={styles.day}>20</Text>
						<Text style={styles.day}>21</Text>
						<Text style={styles.day}>22</Text>
						<Text style={styles.day}>23</Text>
						<Text style={styles.day}>24</Text>
						<Text style={styles.day}>25</Text>
						<Text style={styles.day}>26</Text>
					</View>
					<View style={styles.dayRow}>
						<Text style={styles.day}>27</Text>
						<Text style={styles.day}>28</Text>
						<Text style={styles.day}>29</Text>
						<Text style={styles.day}>30</Text>
						<Text style={{...styles.day, "color": "#999999"}}>1</Text>
						<Text style={{...styles.day, "color": "#999999"}}>2</Text>
						<Text style={{...styles.day, "color": "#999999"}}>3</Text>
					</View>
				</View>
			</View>
			<View style={{marginBottom: 30, marginTop: 10}}>
				<Text style={styles.homepageSectionHeader}>Today's Lesson</Text>
				<View style={styles.homepageSectionHeaderSeperator}></View>
				<Text style={styles.homepageSectionContent}>English</Text>
				<Text style={styles.homepageSectionContentSub}>2.00p.m. - 3.00p.m.</Text>
			</View>
			<View style={{
				flexDirection: 'row',
				justifyContent: 'space-between'
			}}>
				<Text style={styles.homepageSectionHeader}>Today's Comment</Text>
				<Text style={styles.viewCommentBtn}>View</Text>
			</View>
			<View style={{...styles.homepageSectionHeaderSeperator, height: 3}}></View>
			<Text style={styles.homepageComment}>This is the comment for today. This is the comment from your teacher. The comment can be as long as you want. You can add ...</Text>
			<Text style={{...styles.homepageCommentAuthor, textAlign: 'left'}}>- Teacher's Name</Text>
			<Pressable style={styles.chatButton} onPress={()=>props.navigation.navigate('Chat')}>
				<Ionicons name='chatbox-outline' style={{color: 'white'}} size={27}></Ionicons>
			</Pressable>
		</View>
	</>)
}

export default CommentView