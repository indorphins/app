import React, { useEffect, useState, useRef, useContext } from 'react';
import { AppStateContext } from '../App';
import _ from 'lodash';
import { getRandomInt } from '../Helpers/utils';

const VideoFrame = (props) => {
	const { state, dispatch } = useContext(AppStateContext);
	const [instructor, setInstructor] = useState();
	const [participantIndex, setParticipantIndex] = useState();
	const [instructorLive, setInstructorLive] = useState(true);
	const [isInstructor, setIsInstructor] = useState(true);

	useEffect(() => {
		setIsInstructor(state.myProfile.type === 'instructor');
	}, [state.myProfile]);

	// Don't start call until url and token are passed in TODO type check props these 2 are required
	useEffect(() => {
		if (!props.url || !props.token) {
			return;
		} else {
			run();
		}
	}, [props.url, props.token]);

	// Set up rotating participant views
	useEffect(() => {
		if (!_.isEmpty(state.myCallFrame)) {
			updatePiP();
			const interval = setInterval(() => {
				updatePiP();
			}, 30000);
			return () => clearInterval(interval);
		}
	});

	const showEvent = (e) => {
		console.log('video call event -->', e);
	};

	const participantJoined = (e) => {
		console.log('participant joined -->', e);
		if (Object.keys(state.myCallFrame.participants()).length === 2) {
			updatePiP();
		}
		// TODO add participant name to list in view
		// Add sound effect
	};

	const participantLeft = (e) => {
		console.log('participant left -->', e);
		// Add sound effect
	};

	const run = async () => {
		const cFrame = _.get(state, 'myCallFrame', false);

		if (!cFrame) {
			return errorHandler({
				errorMsg: 'No Call Frame Initialized',
			});
		}
		const url = props.url
			? props.url
			: window.location.hash
			? window.location.hash.substr(1)
			: false;
		const token = props.token ? props.token : '';

		if (!url) {
			return errorHandler({
				errorMsg: 'No class url',
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

		await cFrame.load({
			url: url,
			token: token,
		});

		await cFrame.join({
			url: url,
			token: token,
		});

		// TODO Update class name to url WHEN CLASSES FLOW IS FINISHED
		window.location = '#' + props.url;
		return cFrame;
	};

	const errorHandler = (e) => {
		// Duplicate code in classToolbar
		const myCallFrame = state.myCallFrame;

		// change route back to classes/instructor page
		const profType = _.get(state.myProfile, 'type', 'PARTICIPANT');
		const name = _.get(state.myProfile, 'name', '');
		if (profType === 'INSTRUCTOR') {
			window.location.pathname = `/instructor#${name}`;
		} else {
			window.location.pathname = `/classes#${name}`;
		}
		window.alert(e.errorMsg);
		window.location.reload();

		if (!_.isEmpty(myCallFrame)) {
			myCallFrame.destroy();
		}

		dispatch({
			type: 'updateInClass',
			payload: false,
		});
	};

	const updatePiP = () => {
		const participants = state.myCallFrame.participants();
		const participantIds = Object.keys(participants);

		let index = participantIndex ? participantIndex : 1; // start at index one to avoid local
		let newId = participantIds[index];

		// If only instructor don't show PiP
		if (participantIds.length <= 1) {
			return;
		}

		if (participants[newId].owner || !participants[newId].videoTrack) {
			index = index + 1 >= participantIds.length ? 0 : index + 1;
			newId = participantIds[index];
		}
		index = index + 1 >= participantIds.length ? 0 : index + 1;
		setParticipantIndex(index);
		loadParticipantPiP(participants[newId]);
	};

	// Hides or shows the participant's picture in picture based on toggleOn input boolean
	const togglePiP = (toggleOn) => {
		const container = document.getElementById('picture-in-picture');
		const attrs = container.attributes;
		const isHidden = attrs.hidden ? attrs.hidden.value : false;

		if (isHidden && toggleOn) {
			container.removeAttribute('hidden');
		} else if (!toggleOn) {
			container.setAttribute('hidden', true);
		}
	};

	const loadParticipantPiP = (participant) => {
		const container = document.getElementById('picture-in-picture');
		togglePiP(true); // unhide PiP

		let vid = findPiPVideo();
		if (participant.videoTrack) {
			if (!vid) {
				vid = document.createElement('video');
				vid.session_id = 'pip-video';
				vid.style.width = '100%';
				vid.autoplay = true;
				vid.playsInline = true;
				container.appendChild(vid);
			}
			vid.srcObject = new MediaStream([participant.videoTrack]);
		}
	};

	const updateParticipantVideos = () => {
		// TODO add check for owner (don't add owner to participant vids)

		// if 4 or less participants, don't update
		const participants = state.myCallFrame.participants();

		const mediaList = getParticipantMedia();

		const participantIds = Object.keys(participants);

		if (participantIds.length <= 5) {
			return;
		}
		// get current participant id's

		const currParticipants = [];
		const vidList = [];
		const audioList = [];

		mediaList.forEach((media) => {
			if (media.nodeName === 'AUDIO') {
				audioList.push(media);
			} else if (media.type === 'VIDEO') {
				vidList.push(media);
				currParticipants.push(media.session_id);
			}
		});

		// create new vid sources for other participants
		const newIds = getNewIds(participantIds, currParticipants);
		let i = 0;
		while (i < vidList.length && i < newIds.length && i < audioList.length) {
			vidList[i].srcObject = new MediaStream([
				participants[newIds[i]].videoTrack,
			]);
			audioList[i].srcObject = new MediaStream(
				[participants[newIds[i]]].audioTrack
			);
			i++;
		}
	};

	// Get 4 new ids that from the list of all ids
	const getNewIds = (allIds, usedIds) => {
		const newIds = [];

		while (newIds.length < 4) {
			let i = getRandomInt(allIds.length);
			if (!newIds.includes(allIds[i])) {
				// could check for usedIds.includes if more than 9 participants
				newIds.push(allIds[i]);
			}
		}
		return newIds;
	};

	// Find and return the room owner else return false
	const getOwner = () => {
		// todo maybe take in participant list
		const callFrame = state.myCallFrame;
		const participants = callFrame.participants();
		participants.forEach((p) => {
			if (p.owner) {
				return p;
			}
			if (p.session_id === 'local' && state.myProfile.type === 'INSTRUCTOR') {
				return p;
			}
		});
		return false;
	};

	const getParticipantMedia = () => {
		const container = document.getElementById('participant-feeds');
		return container.childNodes;
	};

	const getInstructorMedia = () => {
		const container = document.getElementById('instructor-video');
		return container.childNodes;
	};

	const trackStarted = (e) => {
		if (e.participant.owner) {
			setInstructor(e.participant);
		}
		// set instructor when their tracks start
		showEvent(e);

		if (!(e.track && (e.track.kind === 'video' || e.track.kind == 'audio'))) {
			return;
		}

		let audioContainer = document.getElementById('participant-feeds');
		let videoContainer = document.getElementById('self-picture-in-picture');
		if (e.participant.owner) {
			audioContainer = document.getElementById('instructor-video');
			videoContainer = document.getElementById('instructor-video');
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

		// Only add instructor video feed
		if (
			(e.participant.owner || e.participant.local) &&
			e.track &&
			e.track.kind === 'video'
		) {
			let vid = findVideoForParticipant(e.participant.session_id);
			if (!vid) {
				vid = document.createElement('video');
				vid.session_id = e.participant.session_id;
				vid.style.width = '100%';
				vid.autoplay = true;
				vid.playsInline = true;
				videoContainer.appendChild(vid);
			}
			vid.srcObject = new MediaStream([e.track]);
		}
	};

	const trackStopped = (e) => {
		showEvent(e);
		let vids = findVideosForTrack(e.track && e.track.id);
		if (vids.length > 0) {
			vids.forEach((vid) => {
				if (vid.parentNode.id === 'picture-in-picture') {
					togglePiP(false);
				}
				vid.remove();
			});
		}
		let audio = findAudioForTrack(e.track && e.track.id);
		if (audio) {
			audio.remove();
		}
	};

	const findAudioForParticipant = (session_id) => {
		for (const audio of document.getElementsByTagName('audio')) {
			if (audio.session_id === session_id) {
				return audio;
			}
		}
	};

	const findPiPVideo = () => {
		for (const audio of document.getElementsByTagName('video')) {
			if (audio.session_id === 'pip-video') {
				return audio;
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

	return (
		<div>
			<div id='videos' />
			<div id='call-container' className='block text-center'>
				<div id='instructor-video' className='' />
				<div id='participants-container' className='inline-block'>
					<div id='participant-feeds' className='grid grid-cols-4 col-gap-2' />
				</div>
			</div>
			<div id='side-container'>
				{!isInstructor ? (
					<div
						id='self-picture-in-picture'
						className='fixed w-1/4 bottom-0 border-2 border-black left-0'
					/>
				) : null}
				<div
					id='picture-in-picture'
					className='fixed w-1/4 bottom-0 border-2 border-black right-0'
				/>
			</div>
		</div>
	);
};

export default VideoFrame;
