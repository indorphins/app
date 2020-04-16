import React, { useEffect, useState, useRef, useContext } from 'react';
import { AppStateContext } from '../App';
import _ from 'lodash';
import { getRandomInt } from '../Helpers/utils';

const VideoFrame = (props) => {
	const { state, dispatch } = useContext(AppStateContext);
	const [instructor, setInstructor] = useState();
	const [participantIndex, setParticipantIndex] = useState();
	const [instructorLive, setInstructorLive] = useState(true);
	const [timerIndex, setTimerIndex] = useState(0);
	const [participantList, setParticipantList] = useState([]);

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
		const interval = setInterval(() => {
			// if (timerIndex === 3) {
			// 	console.log('Interval - bring I back');
			// 	updateMainFeed(); // bring Instructor back to main view
			// } else if (timerIndex === 2) {
			// 	console.log('interval - set P view as main');
			// 	updateMainFeed(); // bring Participant to main view
			// }
			// const newIndex = timerIndex === 3 ? 0 : timerIndex + 1;
			// setTimerIndex(newIndex);
			updatePiP();
		}, 10000);
		return () => clearInterval(interval);
	});

	const showEvent = (e) => {
		console.log('video call event -->', e);
	};

	const participantJoined = (e) => {
		console.log('participant joined -->', e);
		// TODO add participant name to list in view
	};

	const participantLeft = (e) => {
		console.log('participant left -->', e);
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

		let index = participantIndex ? participantIndex : 0;
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

	const updateMainFeed = () => {
		const participants = state.myCallFrame.participants();
		const participantIds = Object.keys(participants);

		// Do nothing if only one person in class
		if (participantIds.length <= 1) {
			return;
		}

		// If Instructor is live, set view to be a participant
		if (instructorLive) {
			setInstructorLive(false);
			let index = participantIndex;
			let newId = participantIds[index];
			// If participant is you, skip update. If it's instructor, get a new participant. If they have no video, skip
			if (participants[newId].owner || !participants[newId].videoTrack) {
				index = index + 1 >= participantIds.length ? 0 : index + 1;
				newId = participantIds[index];
			}
			setParticipantIndex(index);
			const participant = participants[newId];
			if (!participants[newId].local) {
				const mainFeed = getInstructorMedia();
				mainFeed.forEach((feed) => {
					if (feed.nodeName === 'AUDIO' && participants[newId].audioTrack) {
						feed.srcObject = new MediaStream([participants[newId].audioTrack]);
					} else if (feed.nodeName === 'VIDEO') {
						feed.srcObject = new MediaStream([participants[newId].videoTrack]);
					}
				});
				togglePiP();
			}
		} else {
			// Set Instructor back in main view
			const mainFeed = getInstructorMedia();
			mainFeed.forEach((feed) => {
				if (feed.nodeName === 'AUDIO') {
					feed.srcObject = new MediaStream([instructor.audioTrack]);
				} else if (feed.nodeName === 'VIDEO') {
					feed.srcObject = new MediaStream([instructor.videoTrack]);
				}
			});
			setInstructorLive(true);
			togglePiP();
		}
	};

	const togglePiP = () => {
		const container = document.getElementById('picture-in-picture');
		const attrs = container.attributes;
		const isHidden = attrs.hidden ? attrs.hidden.value : false;
		const toggleTo = isHidden === 'false' ? 'true' : 'false';

		const pipAudio = findPiPAudio();
		if (pipAudio) {
			pipAudio.setAttribute('muted', toggleTo);
		}
		if (isHidden) {
			container.removeAttribute('hidden');
		} else {
			container.setAttribute('hidden', true);
		}
	};

	const loadParticipantPiP = (participant) => {
		const container = document.getElementById('picture-in-picture');

		const video = findPiPVideo();
		if (!video && participant.videoTrack) {
			const vid = document.createElement('video');
			vid.session_id = 'pip-video';
			vid.style.width = '100%';
			vid.autoplay = true;
			vid.playsInline = true;
			container.appendChild(vid);
			vid.srcObject = new MediaStream([participant.videoTrack]);
		} else {
			video.srcObject = new MediaStream([participant.videoTrack]);
		}

		const audio = findPiPAudio();
		if (!audio && participant.audioTrack) {
			const audio = document.createElement('audio');
			audio.session_id = 'pip-audio';
			audio.autoplay = true;
			container.appendChild(audio);
			audio.srcObject = new MediaStream([participant.audioTrack]);
			audio.muted = participant.local; // Mute your own audio track
		} else {
			audio.srcObject = new MediaStream([participant.audioTrack]);
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

	const randomPickFromIds = (ids) => {
		return ids[getRandomInt(ids.length)];
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
		const container = document.getElementById('participant-videos');
		return container.childNodes;
	};

	const getInstructorMedia = () => {
		const container = document.getElementById('instructor-video');
		return container.childNodes;
	};

	const trackStarted = (e) => {
		if (!e.participant.owner) {
			// Don't add participants to main view
			return;
		}
		// set instructor when their tracks start
		setInstructor(e.participant);
		showEvent(e);

		if (!(e.track && (e.track.kind === 'video' || e.track.kind == 'audio'))) {
			return;
		}

		// Only show instructor
		const container = document.getElementById('instructor-video');

		if (e.track && e.track.kind === 'audio') {
			let audio = findAudioForParticipant(e.participant.session_id);
			if (container.childNodes.length < 4) {
				if (!audio) {
					if (container.childNodes.length < 4) {
						audio = document.createElement('audio');
						audio.session_id = e.participant.session_id;
						audio.autoplay = true;
						container.appendChild(audio);
						audio.srcObject = new MediaStream([e.track]);
						audio.muted = e.participant.local; // Mute your own audio track
					}
				} else {
					audio.srcObject = new MediaStream([e.track]);
				}
			}
		}

		if (e.track && e.track.kind === 'video') {
			let vid = findVideoForParticipant(e.participant.session_id);
			if (!vid) {
				// Only create a new video element if less than 5 exist
				if (container.childNodes.length < 4) {
					vid = document.createElement('video');
					vid.session_id = e.participant.session_id;
					vid.style.width = '100%';
					vid.autoplay = true;
					vid.playsInline = true;
					container.appendChild(vid);
					vid.srcObject = new MediaStream([e.track]);
				}
			} else {
				vid.srcObject = new MediaStream([e.track]);
			}
		}
	};

	const trackStopped = (e) => {
		showEvent(e);
		let vid = findVideoForTrack(e.track && e.track.id);
		if (vid) {
			vid.remove();
		}
		let audio = findAudioForTrack(e.track && e.track.id);
		if (audio) {
			audio.remove();
		}
		const pipAudio = findPiPAudio();
		if (pipAudio) {
			pipAudio.remove();
		}
		const pipVideo = findPiPVideo();
		if (pipVideo) {
			pipVideo.remove();
		}
	};

	const findAudioForParticipant = (session_id) => {
		for (const audio of document.getElementsByTagName('audio')) {
			if (audio.session_id === session_id) {
				return audio;
			}
		}
	};

	const findPiPAudio = () => {
		for (const audio of document.getElementsByTagName('audio')) {
			if (audio.session_id === 'pip-audio') {
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

	const findVideoForTrack = (trackId) => {
		for (const vid of document.getElementsByTagName('video')) {
			if (
				vid.srcObject &&
				vid.srcObject.getTracks().find((t) => t.id === trackId)
			) {
				return vid;
			}
		}
	};

	const leftMeeting = (e) => {
		showEvent(e);
		document.getElementById('instructor-video').innerHTML = '';
	};

	return (
		<div>
			<div id='videos' />
			<div id='call-container' className='block text-center'>
				<div
					id='instructor-video'
					className='inline-block max-w-6xl px-1 w-11/12'
				/>
				{/* <div
					id='participants-container'
					className='inline-block max-w-6xl border-t border-blue-800 w-11/12 pt-2 mx-6'
				>
					<div id='participant-videos' className='grid grid-cols-4 col-gap-2' />
				</div> */}
			</div>
			<div id='side-container'>
				{/* <div id='participant-list'>
					<ul>Participants:</ul>
				</div> */}
				<div
					id='picture-in-picture'
					className='fixed w-1/4 bottom-0 pb-4 pr-4 right-0'
				/>
			</div>
		</div>
	);
};

export default VideoFrame;
