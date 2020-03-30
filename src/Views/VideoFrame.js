import React, { useEffect, useState, useRef, useContext } from 'react';
import DailyIframe from '@daily-co/daily-js';
import Class from '../Classes/Class';
import '../Styles/css-grid.css';
import { AppStateContext } from '../App2';
import _ from 'lodash';

const VideoFrame = props => {
	const { state, dispatch } = useContext(AppStateContext);

	useEffect(() => {
		console.log('in use effect');

		if (!props.url) {
			console.error('please set REACT_APP_DAILY_ROOM_URL env variable!');
			return;
		} else {
			run();
		}
	}, [props.url]);

	const showEvent = e => {
		console.log('video call event -->', e);
	};

	const run = async () => {
		console.log('VIDEO FRAME -run w/ state : ', state);
		console.log('VIDEO FRAME -run w/ url : ', props.url);
		const cFrame = state.myCallFrame;

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
			.on('error', showEvent)
			.on('network-connection', showEvent);

		await cFrame.load({
			url: props.url
		});

		await cFrame.join({
			url: props.url
		});

		window.location = '#' + props.url;
		return cFrame;
	};

	const trackStarted = e => {
		const callFrame = state.myCallFrame;
		showEvent(e);
		if (!(e.track && e.track.kind === 'video')) {
			return;
		}
		console.log('TRACK STARTED');
		const participants = callFrame.participants();
		let vidsContainer =
			!_.isEmpty(participants) && Object.keys(participants).length > 1
				? document.getElementById('participant-videos')
				: document.getElementById('instructor-video');

		let vid = findVideoForParticipant(e.participant.session_id);
		if (!vid) {
			vid = document.createElement('video');
			vid.session_id = e.participant.session_id;
			vid.style.width = '100%';
			vid.autoplay = true;
			vid.muted = true;
			vid.playsInline = true;
		}
		vidsContainer.appendChild(vid);
		vid.srcObject = new MediaStream([e.track]);
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
