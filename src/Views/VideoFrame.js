import React, { useEffect, useState, useRef, useContext } from 'react';
import { AppStateContext } from '../App2';
import _ from 'lodash';
import { useHistory } from 'react-router-dom';
import { getRandomInt } from '../Helpers/utils';

const VideoFrame = props => {
	const { state, dispatch } = useContext(AppStateContext);
	const history = useHistory();

	// Don't start call until url and token are passed in TODO type check props these 2 are required
	useEffect(() => {
		if (!props.url || !props.token) {
			console.error('please set REACT_APP_DAILY_ROOM_URL env variable!');
			return;
		} else {
			run();
		}
	}, [props.url, props.token]);

	// Set up rotating participant views
	useEffect(() => {
		const interval = setInterval(() => {
			updateParticipantVideos();
		}, 10000);
		return () => clearInterval(interval);
	});

	const showEvent = e => {
		console.log('video call event -->', e);
	};

	const run = async () => {
		const cFrame = _.get(state, 'myCallFrame', false);

		if (!cFrame) {
			return errorHandler({
				errorMsg: 'No Call Frame Initialized'
			});
		}
		console.log('RUN - props: ', props);
		const url = props.url
			? props.url
			: window.location.hash
			? window.location.hash.substr(1)
			: false;
		const token = props.token ? props.token : '';

		if (!url) {
			return errorHandler({
				errorMsg: 'No class url'
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
			.on('participant-joined', showEvent)
			.on('participant-updated', showEvent)
			.on('participant-left', showEvent)
			.on('error', errorHandler)
			.on('network-connection', showEvent);

		await cFrame.load({
			url: url,
			token: token
		});

		await cFrame.join({
			url: url,
			token: token
		});

		// TODO Update class name to url WHEN CLASSES FLOW IS FINISHED
		window.location = '#' + props.url;
		console.log('VideoFrame - callFrame run is ', cFrame);
		return cFrame;
	};

	const errorHandler = e => {
		// Duplicate code in classToolbar
		const myCallFrame = state.myCallFrame;

		// change route back to classes/instructor page
		const profType = _.get(state.myProfile, 'type', 'PARTICIPANT');
		const name = _.get(state.myProfile, 'name', '');
		if (profType === 'INSTRUCTOR') {
			history.push(`/instructor#${name}`);
		} else {
			history.push(`/classes#${name}`);
		}
		window.alert(e.errorMsg);
		window.location.reload();

		if (!_.isEmpty(myCallFrame)) {
			myCallFrame.destroy();
		}

		dispatch({
			type: 'updateInClass',
			payload: false
		});
	};

	const updateParticipantVideos = () => {
		// TODO add check for owner (don't add owner to participant vids)

		console.log('updateParVids start');
		// if 4 or less participants, don't update
		const participants = state.myCallFrame.participants();

		const participantIds = Object.keys(participants);
		console.log('parIds ', participantIds);

		if (participantIds.length <= 5) {
			console.log(' 5 or less participants');
			return;
		}
		// get current participant id's

		const vidList = getParticipantVideos();
		const currParticipants = [];

		vidList.forEach(vid => {
			currParticipants.push(vid.session_id);
		});

		console.log();

		// create new vid sources for other participants
		const newIds = getNewIds(participantIds, currParticipants);
		console.log('got new ids ', newIds);
		let i = 0;
		console.log(
			'vidlist length ',
			vidList.length,
			' - newIds len ',
			newIds.length
		);
		while (i < vidList.length && i < newIds.length) {
			let newSource = new MediaStream([participants[newIds[i]].videoTrack]);
			vidList[i].srcObject = newSource;
			i++;
		}
		console.log('finished while update vid sources');
	};

	// Get 4 new ids that from the list of all ids
	const getNewIds = (allIds, usedIds) => {
		const newIds = [];
		console.log('getNewIds from all ', allIds);

		while (newIds.length < 4) {
			let i = getRandomInt(allIds.length);
			if (!newIds.includes(allIds[i])) {
				// could check for usedIds.includes if more than 9 participants
				newIds.push(allIds[i]);
			}
		}
		console.log('returning new ids ', newIds);
		return newIds;
	};

	// Find and return the room owner else return false
	const getOwner = () => {
		// todo maybe take in participant list
		const callFrame = state.myCallFrame;
		const participants = callFrame.participants();
		participants.forEach(p => {
			if (p.owner) {
				return p;
			}
			if (p.session_id === 'local' && state.myProfile.type === 'INSTRUCTOR') {
				return p;
			}
		});
		return false;
	};

	const getParticipantVideos = () => {
		const container = document.getElementById('participant-videos');
		console.log('Container - ', container);
		const children = container.childNodes;
		console.log('CHildren - ', children);
		return children;
	};

	const trackStarted = e => {
		const callFrame = state.myCallFrame;
		showEvent(e);
		if (!(e.track && e.track.kind === 'video')) {
			return;
		}

		const participants = callFrame.participants();
		let vidsContainer = !e.participant.owner
			? document.getElementById('participant-videos')
			: document.getElementById('instructor-video');

		// Only add if space allows
		// local + 4 others
		let vid = findVideoForParticipant(e.participant.session_id);
		if (!vid) {
			// Only create a new video element if less than 5 exist
			if (vidsContainer.childNodes.length < 4) {
				vid = document.createElement('video');
				vid.session_id = e.participant.session_id;
				vid.style.width = '100%';
				vid.autoplay = true;
				vid.muted = true;
				vid.playsInline = true;
				vidsContainer.appendChild(vid);
				vid.srcObject = new MediaStream([e.track]);
			}
		} else {
			vid.srcObject = new MediaStream([e.track]);
		}
	};

	const trackStopped = e => {
		showEvent(e);
		let vid = findVideoForTrack(e.track && e.track.id);
		if (vid) {
			vid.remove();
		}
	};

	const findVideoForParticipant = session_id => {
		for (const vid of document.getElementsByTagName('video')) {
			if (vid.session_id === session_id) {
				return vid;
			}
		}
	};

	const findVideoForTrack = trackId => {
		for (const vid of document.getElementsByTagName('video')) {
			if (
				vid.srcObject &&
				vid.srcObject.getTracks().find(t => t.id === trackId)
			) {
				return vid;
			}
		}
	};

	const leftMeeting = e => {
		showEvent(e);
		document.getElementById('instructor-video').innerHTML = '';
	};

	return (
		<div>
			<div id='videos' />
			<div id='call-container' className='block text-center'>
				<div id='instructor-video' className='inline-block max-w-3xl pt-6' />
				<div id='participants-container' className='inline-block max-w-3xl'>
					<div id='participant-videos' className='grid grid-cols-4 col-gap-2' />
				</div>
			</div>
		</div>
	);
};

export default VideoFrame;
