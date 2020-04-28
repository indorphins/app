import React, { useEffect, useState, useRef, useContext } from 'react';
import { AppStateContext } from '../App';
import _ from 'lodash';
import {
	storeInSession,
	getFromSession,
	removeItemFromSession,
} from '../Helpers/sessionHelper';
import ClassToolbar from '../Components/ClassToolbar';
import { endClass } from '../Controllers/ClassesController';
import { deleteRoom } from '../Controllers/DailycoController';
import { getClosestOddNum, getClosestEvenNum } from '../Helpers/utils';
import userBgImg from '../assets/pipPlaceholder.png';
import sgfIcon from '../assets/sgfWhite.png';

const VideoFrame = (props) => {
	const { state, dispatch } = useContext(AppStateContext);
	const [trackCount, setTrackCount] = useState(0);
	const PIP_ID_TOP = 'picture-in-picture-top';
	const PIP_ID_MID = 'picture-in-picture-middle';
	const PIP_ID_BOTTOM = 'picture-in-picture-bottom';
	const PIP_TOP_LABEL = 'pip-top-label';
	const PIP_MID_LABEL = 'pip-mid-label';
	const PIP_BOT_LABEL = 'pip-bot-label';
	const PIP_TOP_VID = 'pip-top-vid';
	const PIP_MID_VID = 'pip-mid-vid';
	const PIP_BOT_VID = 'pip-bot-vid';

	// Don't start call until url and token are passed in TODO type check props these 2 are required
	useEffect(() => {
		if (
			!getFromSession('dailyClass') ||
			!getFromSession('currentClass') ||
			_.isEmpty(state.myCallFrame)
		) {
			return;
		} else {
			if (!state.myCallFrame.on) {
				return;
			}
			// console.log('V Frame use effect has daily and curr class and callFrame');
			run();
		}
	}, [state.myCallFrame, props.loaded]);

	// Set up rotating participant views
	useEffect(() => {
		const interval = setInterval(() => {
			updatePiP();
		}, 30000);
		return () => clearInterval(interval);
	});

	const showEvent = (e) => {
		console.log('video call event -->', e);
	};

	const participantJoined = (e) => {
		console.log('participant joined -->', e);
		// TODO add participant name to list in view
		// Add sound effect
	};

	const participantLeft = (e) => {
		console.log('participant left -->', e);
		// Add sound effect
	};

	const run = async () => {
		const cFrame = state.myCallFrame;

		if (_.isEmpty(cFrame) || cFrame === 'undefined') {
			return errorHandler({
				errorMsg: 'No Call Frame Initialized',
			});
		}
		const dailyClass = getFromSession('dailyClass');

		if (!dailyClass) {
			return errorHandler({
				errorMsg: 'No daily class loaded',
			});
		}

		cFrame
			.on('track-started', trackStarted)
			.on('track-stopped', trackStopped)
			.on('left-meeting', leftMeeting)
			.on('loading', showEvent)
			.on('loaded', showEvent)
			.on('started-camera', showEvent)
			.on('camera-error', showEvent)
			.on('joining-meeting', showEvent)
			.on('joined-meeting', showEvent)
			.on('participant-joined', participantJoined)
			.on('participant-updated', participantLeft)
			.on('participant-left', showEvent)
			.on('error', errorHandler)
			.on('network-connection', showEvent);

		// console.log('Daily class is ', dailyClass);
		// console.log('Url is ', dailyClass.url);
		await cFrame.load({
			url: dailyClass.url,
			token: dailyClass.token,
		});

		await cFrame.join({
			url: dailyClass.url,
			token: dailyClass.token,
		});

		window.location = '#' + dailyClass.name;
		return cFrame;
	};

	const errorHandler = (e) => {
		console.log('VideoFrame - error - ', e);
		// Duplicate code in classToolbar
		const myCallFrame = state.myCallFrame;

		// change route back to classes/instructor page
		if (state.myProfile) {
			const profType = _.get(state.myProfile, 'type', 'PARTICIPANT');
			if (profType === 'instructor') {
				window.location.pathname = `/instructor`;
			} else {
				window.location.pathname = `/classes`;
			}
		} else {
			window.location.pathname = '/classes';
		}
		window.alert(e.errorMsg);

		// If class ended + instructor, set flag to endClass
		if (
			state.myProfile &&
			state.myProfile.type === 'instructor' &&
			e.errorMsg === 'Meeting has ended'
		) {
			storeInSession('instructorEndClass', true);
			dispatch({
				type: 'removeCallFrame',
			});
			storeInSession('inClass', false);

			if (!_.isEmpty(myCallFrame)) {
				myCallFrame.destroy();
			}
			return;
		}

		removeItemFromSession('dailyClass');
		removeItemFromSession('currentClass');
		dispatch({
			type: 'removeCallFrame',
		});
		storeInSession('inClass', false);

		if (!_.isEmpty(myCallFrame)) {
			myCallFrame.destroy();
		}
	};

	// Gets the 30s index since class start time
	const getNextRotatingIndex = () => {
		const currentClass = getFromSession('currentClass');
		if (!currentClass) {
			return;
		}
		const startTime = currentClass.start_time; //TODO refactor to use start_time once added to db
		const startDate = new Date(startTime);
		const now = new Date();

		const diff = Math.abs(now - startDate);
		const index = Math.floor(diff / 30000);
		return index;
	};

	const updatePiP = () => {
		const callFrame = state.myCallFrame;
		if (!callFrame || !callFrame.participants) {
			return;
		}
		const nextIndex = getNextRotatingIndex();
		const oddParticipant = getNextParticipant(nextIndex, true);
		const evenParticipant = getNextParticipant(nextIndex, false);

		if (evenParticipant) {
			loadParticipantPiP(evenParticipant, PIP_TOP_VID);
		}
		if (oddParticipant) {
			loadParticipantPiP(oddParticipant, PIP_BOT_VID);
		}
	};

	/**
	 * Gets the next participant at an even or odd index based on input bool "odd" that has video feed and isn't instructor
	 * Returns false if no valid indices found
	 */
	const getNextParticipant = (index, odd) => {
		const callFrame = state.myCallFrame;
		if (!callFrame || !callFrame.participants) {
			return false;
		}
		const participants = callFrame.participants();
		const participantIds = Object.keys(participants);

		// If only instructor don't show PiP
		if (participantIds.length <= 1) {
			return false;
		}
		// If only instructor and 2 others, load both of them
		if (participantIds.length === 3) {
			if (participants[participantIds[1]].owner) {
				if (odd) return participants[participantIds[0]];
				else return participants[participantIds[2]];
			}
		}

		if (index >= participantIds.length) {
			index = index % participantIds.length;
		}
		let newIndex = odd ? index * 2 + 1 : index * 2;
		newIndex = newIndex % participantIds.length;
		if (odd) {
			newIndex = getClosestOddNum(newIndex);
		} else {
			newIndex = getClosestEvenNum(newIndex);
		}

		let newId = participantIds[newIndex];
		let count = 0;

		while (participants[newId].owner || !participants[newId].video) {
			newIndex =
				newIndex + 2 >= participantIds.length ? (odd ? 1 : 0) : newIndex + 2;
			newId = participantIds[newIndex];
			count = count + 2; // add by two since we're doing even/odd indices
			if (count > participantIds.length) {
				// break out of loop if cycled through everyone and found nobody valid
				return false;
			}
		}
		return participants[newId];
	};

	// Hides or shows the picture in picture found at id based on toggleOn input boolean
	const togglePiP = (toggleOn, id) => {
		const container = document.getElementById(id);
		if (!container) {
			return;
		}
		const attrs = container.attributes;
		const isHidden = attrs.hidden ? attrs.hidden.value : false;

		if (isHidden && toggleOn) {
			container.removeAttribute('hidden');
		} else if (!toggleOn) {
			container.setAttribute('hidden', true);
		}
	};

	// Load an input participant's video feed into pip located at pipId
	const loadParticipantPiP = (participant, pipId) => {
		if (participant.owner) {
			return;
		}
		let vid = document.getElementById(pipId);
		if (!vid) {
			return;
		}
		togglePiP(true, pipId); // unhide PiP

		if (participant.videoTrack && participant.video) {
			if (!vid) {
				vid = document.createElement('video');
				const parent = getParentIDFromPipVideo(pipId);
				if (!parent) {
					return;
				}
				document
					.getElementById(getParentIDFromPipVideo(pipId))
					.appendChild(vid);
			}
			vid.session_id = `${pipId}-video`;
			vid.autoplay = true;
			vid.playsInline = true;
			vid.srcObject = new MediaStream([participant.videoTrack]);
			const labelId = getPiPLabelFromParentId(pipId);
			if (labelId) {
				document.getElementById(labelId).innerHTML = participant.user_name
					? participant.user_name
					: '';
			}
		}
	};

	const getParentIDFromPipVideo = (pipId) => {
		switch (pipId) {
			case PIP_BOT_VID:
				return PIP_ID_BOTTOM;
			case PIP_MID_VID:
				return PIP_ID_MID;
			case PIP_TOP_VID:
				return PIP_TOP_VID;
			default:
				return;
		}
	};

	const getPiPLabelFromParentId = (id) => {
		switch (id) {
			case PIP_TOP_VID:
			case PIP_ID_TOP:
				return PIP_TOP_LABEL;
			case PIP_MID_VID:
			case PIP_ID_MID:
				return PIP_MID_LABEL;
			case PIP_BOT_VID:
			case PIP_ID_BOTTOM:
				return PIP_BOT_LABEL;
			default:
				return '';
		}
	};

	const trackStarted = (e) => {
		// set instructor when their tracks start
		showEvent(e);

		if (!(e.track && (e.track.kind === 'video' || e.track.kind == 'audio'))) {
			return;
		}

		setTrackCount(trackCount + 1);

		let audioContainer = document.getElementById('participant-audio');
		let videoContainer = document.getElementById('instructor-video');
		if (e.participant.owner) {
			audioContainer = document.getElementById('instructor-video');
		}

		if (e.track && e.track.kind === 'audio') {
			let audio = findAudioForParticipant(e.participant.session_id);
			if (!audio) {
				audio = document.createElement('audio');
				audio.session_id = e.participant.session_id;
				audio.autoplay = true;
				audio.muted = e.participant.local; // Mute your own audio track
				audioContainer.appendChild(audio);
			}
			audio.srcObject = new MediaStream([e.track]);
		}

		// Only add instructor or self video feed
		if (e.participant.owner && e.track && e.track.kind === 'video') {
			let vid = document.getElementById('instructor-video');
			if (!vid) {
				vid = document.createElement('video');
				videoContainer.appendChild(vid);
			}
			vid.style.width = '100%';
			vid.autoplay = true;
			vid.playsInline = true;
			vid.session_id = e.participant.session_id;
			vid.srcObject = new MediaStream([e.track]);
		}
		if (
			e.participant.local &&
			!e.participant.owner &&
			e.track &&
			e.track.kind === 'video'
		) {
			loadParticipantPiP(e.participant, PIP_MID_VID);
		}

		const topPiP = document.getElementById(PIP_ID_TOP);
		const botPiP = document.getElementById(PIP_ID_BOTTOM);
		if (!botPiP.childNodes || !topPiP.childNodes) {
			updatePiP();
		}
	};

	const trackStopped = (e) => {
		showEvent(e);
		let vids = findVideosForTrack(e.track && e.track.id);
		if (vids.length > 0) {
			vids.forEach((vid) => {
				if (vid.parentNode.id.includes('picture-in-picture')) {
					togglePiP(false, vid.id);
					clearLabelForPiPId(vid.parentNode.id);
				}
				vid.srcObject = null;
			});
		}
		let audio = findAudioForTrack(e.track && e.track.id);
		if (audio) {
			audio.srcObject = null;
		}
		setTrackCount(trackCount - 1);
	};

	const findAudioForParticipant = (session_id) => {
		for (const audio of document.getElementsByTagName('audio')) {
			if (audio.session_id === session_id) {
				return audio;
			}
		}
	};

	const findSelfPiPVideo = () => {
		for (const video of document.getElementsByTagName('video')) {
			if (video.id === PIP_MID_VID) {
				return video;
			}
		}
	};

	const findParticipantPiPVideo = (id) => {
		for (const video of document.getElementsByTagName('video')) {
			if (video.id === id) {
				return video;
			}
		}
	};

	const findAudioForTrack = (trackId) => {
		for (const audio of document.getElementsByTagName('audio')) {
			if (
				audio.srcObject &&
				audio.srcObject.getTracks().find((t) => t.id === trackId)
			) {
				return audio;
			}
		}
	};

	const findVideoForParticipant = (session_id) => {
		for (const vid of document.getElementsByTagName('video')) {
			if (vid.session_id === session_id) {
				return vid;
			}
		}
	};

	const findVideosForTrack = (trackId) => {
		const vids = [];
		for (const vid of document.getElementsByTagName('video')) {
			if (
				vid.srcObject &&
				vid.srcObject.getTracks().find((t) => t.id === trackId)
			) {
				vids.push(vid);
			}
		}
		return vids;
	};

	const clearLabelForPiPId = (pipId) => {
		const labelId = getPiPLabelFromParentId(pipId);
		console.log('GOT LABEL ID ', labelId);
		if (labelId) {
			document.getElementById(labelId).innerHTML = '';
		}
	};

	const leftMeeting = (e) => {
		showEvent(e);
		document.getElementById('instructor-video').innerHTML = '';
	};

	const gridStyle = {
		display: 'grid',
		gridTemplateColumns: '3fr 1fr',
		height: '98vh',
	};

	const callContainerStyle = {
		margin: '0',
		position: 'absolute',
		top: '50%',
		msTransform: 'translateY(-50%)',
		transform: 'translateY(-50%)',
		backgroundColor: 'black',
		width: 'calc(100vw - 60vh)',
		height: '100vh',
		display: 'flex',
		alignItems: 'center',
	};

	const pipStyle = {
		height: '33vh',
		width: '59vh',
	};

	const pipLabelStyle = {
		position: 'absolute',
		left: '5px',
		width: '100%',
		fontSize: '30px',
		color: 'white',
	};

	const pipVidStyle = {
		width: '100%',
		height: '100%',
		background: `transparent url(${userBgImg}) no-repeat 0 0`,
		webkitBackgroundSize: 'cover',
		mozBackgroundSize: 'cover',
		oBackgroundSize: 'cover',
		backgrounSize: 'cover',
	};

	const logoStyle = {
		position: 'absolute',
		top: '0',
		width: '45px',
		marginLeft: '50px',
		marginTop: '50px',
	};

	return (
		<div>
			<div
				id='call-container'
				className='block text-center left-0 fixed'
				style={callContainerStyle}
			>
				<img src={sgfIcon} alt='SGF' style={logoStyle} />
				<div id='instructor-video-container' className='w-full'>
					<video id='instructor-video' />
				</div>
				<div id='participant-audio' className='grid grid-cols-4' />
				<ClassToolbar />
			</div>
			<div
				id='side-container'
				className='h-full right-0 top-0 fixed bg-gray-400'
				style={{ width: '60vh' }}
			>
				<div
					id={PIP_ID_TOP}
					style={{
						height: '34vh',
						top: '0',
					}}
				>
					<p id={PIP_TOP_LABEL} style={pipLabelStyle} />
					<video id={PIP_TOP_VID} style={pipVidStyle} />
				</div>
				<div
					id={PIP_ID_MID}
					style={{
						height: '33vh',
						top: '34vh',
					}}
				>
					<p id={PIP_MID_LABEL} style={pipLabelStyle}></p>

					<video id={PIP_MID_VID} />
				</div>
				<div
					id={PIP_ID_BOTTOM}
					style={{
						height: '34vh',
						top: '68vh',
					}}
				>
					<p id={PIP_BOT_LABEL} style={pipLabelStyle}></p>
					<video id={PIP_BOT_VID} style={pipVidStyle} />
				</div>
			</div>
		</div>
	);
};

export default VideoFrame;
