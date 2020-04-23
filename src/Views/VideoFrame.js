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

const VideoFrame = (props) => {
	const { state, dispatch } = useContext(AppStateContext);
	const [trackCount, setTrackCount] = useState(0);
	const PIP_ID_TOP = 'picture-in-picture-top';
	const PIP_ID_MID = 'picture-in-picture-middle';
	const PIP_ID_BOTTOM = 'picture-in-picture-bottom';

	// Don't start call until url and token are passed in TODO type check props these 2 are required
	useEffect(() => {
		// console.log('*** V FRAME Effect *** w/ loaded: ', props.loaded);
		// console.log('daily class ', getFromSession('dailyClass'));
		// console.log('curr class : ', getFromSession('currentClass'));
		// console.log('call Frame ', state.myCallFrame);
		if (
			!getFromSession('dailyClass') ||
			!getFromSession('currentClass') ||
			_.isEmpty(state.myCallFrame)
		) {
			// console.log(
			// 	'Video Frame use effect - no daily or curr class or callframe'
			// );
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
		// console.log('cFrame on run = ', cFrame);
		// console.log('cFrame on is ', cFrame.on);
		// console.log('CFrame loaded ', cFrame._loaded);

		if (_.isEmpty(cFrame) || cFrame === 'undefined') {
			return errorHandler({
				errorMsg: 'No Call Frame Initialized',
			});
		}
		// storeInSession('callFrame', cFrame); don't store
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
		const profType = _.get(state.myProfile, 'type', 'PARTICIPANT');
		if (profType === 'instructor') {
			window.location.pathname = `/instructor`;
		} else {
			window.location.pathname = `/classes`;
		}
		window.alert(e.errorMsg);

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
			loadParticipantPiP(evenParticipant, PIP_ID_BOTTOM);
		}
		if (oddParticipant) {
			loadParticipantPiP(oddParticipant, PIP_ID_TOP);
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
		const container = document.getElementById(pipId);
		if (!container) {
			return;
		}
		togglePiP(true, pipId); // unhide PiP

		let vid = findParticipantPiPVideo(pipId);
		if (participant.videoTrack) {
			if (!vid) {
				vid = document.createElement('video');
				vid.session_id = `${pipId}-video`;
				vid.style.width = 'inherit';
				vid.style.border = 'solid 2px black';
				vid.autoplay = true;
				vid.playsInline = true;
				container.appendChild(vid);
			}
			vid.srcObject = new MediaStream([participant.videoTrack]);
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
			let vid = findVideoForParticipant(e.participant.session_id);
			if (!vid) {
				vid = document.createElement('video');
				vid.session_id = e.participant.session_id;
				vid.style.width = '100%';
				if (e.participant.local && !e.participant.owner) {
					vid.style.border = 'solid 2px black';
				}
				vid.autoplay = true;
				vid.playsInline = true;
				videoContainer.appendChild(vid);
			}
			vid.srcObject = new MediaStream([e.track]);
		}
		if (
			e.participant.local &&
			!e.participant.owner &&
			e.track &&
			e.track.kind === 'video'
		) {
			loadParticipantPiP(e.participant, PIP_ID_MID);
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
					togglePiP(false, vid.parentNode.id);
				}
				vid.remove();
			});
		}
		let audio = findAudioForTrack(e.track && e.track.id);
		if (audio) {
			audio.remove();
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
			if (video.parentNode.id === PIP_ID_MID) {
				return video;
			}
		}
	};

	const findParticipantPiPVideo = (id) => {
		for (const video of document.getElementsByTagName('video')) {
			if (video.parentNode.id === id) {
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

	const leftMeeting = (e) => {
		showEvent(e);
		document.getElementById('instructor-video').innerHTML = '';
	};

	const gridStyle = {
		display: 'grid',
		gridTemplateColumns: '3fr 1fr',
		height: '98vh',
	};

	return (
		<div style={gridStyle}>
			<div id='call-container' className='block text-center'>
				<ClassToolbar />
				<div id='instructor-video' className='' />
				<div id='participant-audio' className='grid grid-cols-4' />
			</div>
			<div id='side-container' className=''>
				<div id={PIP_ID_TOP} style={{ height: '33%' }} />
				<div id={PIP_ID_MID} style={{ height: '33%' }} />
				<div id={PIP_ID_BOTTOM} style={{ height: '33%' }} />
			</div>
		</div>
	);
};

export default VideoFrame;
