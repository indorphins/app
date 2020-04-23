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

const AUDIO_OFF_TEXT = 'Turn Mic Off';
const AUDIO_ON_TEXT = 'Turn Mic On';
const VIDEO_OFF_TEXT = 'Turn Video Off';
const VIDEO_ON_TEXT = 'Turn Video On';

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

	const toggleSelfPiP = () => {
		const container = document.getElementById('picture-in-picture-middle');
		if (!container) {
			return;
		}
		const attrs = container.attributes;
		const isHidden = attrs.hidden ? attrs.hidden.value : false;

		if (isHidden) {
			container.removeAttribute('hidden');
		} else {
			container.setAttribute('hidden', true);
		}
	};

	return (
		<header className={styles.ClassToolbar}>
			<div className='text-xl float-left pt-1'>
				<p>Indorphins</p>
			</div>
			<div id='btn-container' className='inline-flex float-right'>
				{/* {!isInstructor ? (
            <div id='toggle-pip-container' className='flex-auto text-right pr-4'>
              <button
                onClick={toggleSelfPiP}
                id='toggle-pip-btn'
                className='bg-transparent p-2 border-black border-2 rounded-full inline-block'
              >
                Toggle Self View
              </button>
            </div>
          ) : null} */}
				<div id='toggle-mic-container' className='flex-auto text-right pr-4'>
					<button
						onClick={toggleMicrophoneHandler}
						id='toggle-mic-btn'
						className='bg-transparent p-2 border-black border-2 rounded-full inline-block'
					>
						{audioOn ? AUDIO_OFF_TEXT : AUDIO_ON_TEXT}
					</button>
				</div>
				<div id='toggle-video-container' className='flex-auto text-right pr-4'>
					<button
						onClick={toggleVideoHandler}
						id='toggle-video-btn'
						className='bg-transparent p-2 border-black border-2 rounded-full inline-block'
					>
						{videoOn ? VIDEO_OFF_TEXT : VIDEO_ON_TEXT}
					</button>
				</div>
				<div id='leave-class-container' className='flex-auto text-right'>
					{isInstructor ? (
						<button
							onClick={finishClass}
							id='leave-class-btn'
							className='bg-transparent p-2 border-black border-2 rounded-full inline-block'
						>
							End Class
						</button>
					) : (
						<button
							onClick={leaveClass}
							id='leave-class-btn'
							className='bg-transparent p-2 border-black border-2 rounded-full inline-block'
						>
							Leave Class
						</button>
					)}
				</div>
			</div>

			<nav className={styles.DesktopOnly}>{/* <NavigationItems /> */}</nav>
		</header>
	);
};

export default Toolbar;
