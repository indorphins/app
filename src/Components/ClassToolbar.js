import React, { useContext, useState, useEffect } from 'react';
import styles from '../Styles/Toolbar.module.css';
import { AppStateContext } from '../App';
import _isEmpty from 'lodash/isEmpty';
import _get from 'lodash/get';
import { endClass } from '../Controllers/ClassesController';
import { deleteRoom } from '../Controllers/DailycoController';
import {
	storeInSession,
	getFromSession,
	removeItemFromSession,
} from '../Helpers/sessionHelper';
import isEmpty from 'lodash/isEmpty';
import exitAppIcon from '../assets/leaveClass.png';
import micOff from '../assets/micOff.png';
import micOn from '../assets/micOn.png';
import videoOnIcon from '../assets/camOn.png';
import videoOffIcon from '../assets/camOff.png';

// Differs from regular toolbar by replacing the logo w/ class name and adding leave class button
const Toolbar = (props) => {
	const { state, dispatch } = useContext(AppStateContext);
	const [videoOn, setVideoOn] = useState(true);
	const [audioOn, setAudioOn] = useState(true);
	const [myCallFrame, setMyCallFrame] = useState();
	const [isInstructor, setIsInstructor] = useState(true);

	useEffect(() => {
		if (!isEmpty(state.myCallFrame)) {
			setMyCallFrame(state.myCallFrame);
		}
	}, [state.myCallFrame]);

	useEffect(() => {
		setIsInstructor(state.myProfile.type === 'instructor');
		setAudioOn(state.myProfile.type === 'instructor' ? true : false);
		setVideoOn(state.myProfile.type === 'instructor' ? true : true);
	}, [state.myProfile]);

	const leaveClassHandler = () => {
		removeItemFromSession('dailyClass');
		removeItemFromSession('currentClass');

		// change route back to classes/instructor page
		const profType = _get(state.myProfile, 'type', 'participant');
		if (profType === 'instructor') {
			window.location.pathname = `/instructor`;
		} else {
			window.location.pathname = `/classes`;
		}

		if (!_isEmpty(myCallFrame)) {
			myCallFrame.destroy();
		}
	};

	const toggleVideoHandler = () => {
		console.log('toggle video handler');
		if (_isEmpty(myCallFrame)) {
			return; // Throw error?
		}
		setVideoOn(!videoOn);
		myCallFrame.setLocalVideo(!myCallFrame.localVideo());
	};

	const toggleMicrophoneHandler = () => {
		console.log('toggle microphone handler');
		if (_isEmpty(myCallFrame)) {
			return; // Throw error?
		}
		setAudioOn(!audioOn);
		myCallFrame.setLocalAudio(!myCallFrame.localAudio());
	};

	// End class - set class object status to closed and delete Daily room
	const finishClass = async (classId) => {
		const currentClass = getFromSession('currentClass');
		if (!_isEmpty(currentClass)) {
			storeInSession('inClass', false);
			return endClass(currentClass.class_id)
				.then(() => {
					return deleteRoom(currentClass.chat_room_name);
				})
				.then(() => {
					leaveClassHandler();
				})
				.catch((error) => {
					console.log('ClassToolbar - finishClass - error: ', error);
				});
		}
		leaveClassHandler();
	};

	const leaveClass = () => {
		storeInSession('inClass', false);
		leaveClassHandler();
	};

	return (
		<header className={styles.ClassToolbar}>
			<div id='btn-container' className='inline-flex'>
				<div id='toggle-mic-container' className='flex-auto text-right pr-4'>
					<button
						onClick={toggleMicrophoneHandler}
						id='toggle-mic-btn'
						className='bg-transparent p-2 inline-block'
					>
						<img src={audioOn ? micOn : micOff} alt='Mic' />
					</button>
				</div>
				<div id='toggle-video-container' className='flex-auto text-right pr-4'>
					<button
						onClick={toggleVideoHandler}
						id='toggle-video-btn'
						className='bg-transparent p-2 inline-block'
					>
						<img src={videoOn ? videoOnIcon : videoOffIcon} alt='Video' />
					</button>
				</div>
				<div id='leave-class-container' className='flex-auto text-right'>
					<button
						onClick={isInstructor ? finishClass : leaveClass}
						id='leave-class-btn'
						className='bg-transparent p-2 inline-block'
					>
						{<img src={exitAppIcon} alt='Exit App' />}
					</button>
				</div>
			</div>
		</header>
	);
};

export default Toolbar;
