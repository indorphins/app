import React, { useContext, useState } from 'react';
import styles from '../Styles/Toolbar.module.css';
import Menu from './Menu';
import Button from './Button';
import { AppStateContext } from '../App';
import _isEmpty from 'lodash/isEmpty';
import _get from 'lodash/get';
import { useHistory } from 'react-router-dom';

const AUDIO_OFF_TEXT = 'Toggle Microphone Off';
const AUDIO_ON_TEXT = 'Toggle Microphone On';
const VIDEO_OFF_TEXT = 'Toggle Video Off';
const VIDEO_ON_TEXT = 'Toggle Video On';

// Differs from regular toolbar by replacing the logo w/ class name and adding leave class button
const Toolbar = (props) => {
	const { state, dispatch } = useContext(AppStateContext);
	const [videoOn, setVideoOn] = useState(true);
	const [audioOn, setAudioOn] = useState(true);
	const history = useHistory();

	const leaveClassHandler = () => {
		const myCallFrame = state.myCallFrame;
		if (!_isEmpty(myCallFrame)) {
			myCallFrame.destroy();
		}
		// change route back to classes/instructor page
		const profType = _get(state.myProfile, 'type', 'participant');
		const name = _get(state.myProfile, 'name', '');
		if (profType === 'instructor') {
			history.replace(`/instructor#${name}`);
		} else {
			history.replace(`/classes#${name}`);
		}
		dispatch({
			type: 'updateInClass',
			payload: false,
		});
		window.location.reload();
	};

	const toggleVideoHandler = () => {
		console.log('toggle video handler');
		if (_isEmpty(state.myCallFrame)) {
			return; // Throw error?
		}
		setVideoOn(!videoOn);
		state.myCallFrame.setLocalVideo(!state.myCallFrame.localVideo());
	};

	const toggleMicrophoneHandler = () => {
		console.log('toggle microphone handler');
		if (_isEmpty(state.myCallFrame)) {
			return; // Throw error?
		}
		setAudioOn(!audioOn);
		state.myCallFrame.setLocalAudio(!state.myCallFrame.localAudio());
	};

	const name = !_isEmpty(state.myProfile) ? state.myProfile.name : 'Instructor';

	return (
		<header className={styles.Toolbar}>
			<Menu
				clicked={
					props.menuClicked
						? props.menuClicked
						: () => {
								console.log('default memu clicked fxn');
						  }
				}
			/>
			<div className='text-xl'>
				<p>In Class</p>
			</div>
			<div id='toggle-mic-container' className='flex-auto text-right'>
				<Button
					clicked={toggleMicrophoneHandler}
					text={audioOn ? AUDIO_OFF_TEXT : AUDIO_ON_TEXT}
					id='toggle-mic-btn'
					bgcolor='green'
				/>
			</div>
			<div id='toggle-video-container' className='flex-auto text-right'>
				<Button
					clicked={toggleVideoHandler}
					text={videoOn ? VIDEO_OFF_TEXT : VIDEO_ON_TEXT}
					id='toggle-video-btn'
					bgcolor='teal'
				/>
			</div>
			<div id='leave-class-container' className='flex-auto text-right'>
				<Button
					clicked={leaveClassHandler}
					text='Leave Class'
					id='leave-class-btn'
					bgcolor='red'
				/>
			</div>
			<nav className={styles.DesktopOnly}>{/* <NavigationItems /> */}</nav>
		</header>
	);
};

export default Toolbar;
