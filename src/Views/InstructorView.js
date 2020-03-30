import React, { useEffect, useState, useContext } from 'react';
import Toolbar from '../Components/Toolbar';
import Button from '../Components/Button';
import { AppStateContext } from '../App2';
import DailyIframe from '@daily-co/daily-js';
import { get } from 'https';
import { createRoomEndpoint } from '../constants';
import Class from '../Classes/Class';
import '../Styles/css-grid.css';
import ClassView from './ClassView';
import VideoFrame from './VideoFrame';
import CallFrame from '../Classes/CallFrame';
import ClassToolbar from '../Components/ClassToolbar';
import { findGetParameter } from '../Helpers/utils';

var __html = require('./InstructorView2.html.js');
var template = { __html: __html };

const InstructorView = props => {
	const [name, setName] = useState();
	const [myClass, setMyClass] = useState({});
	const [participants, setParticipants] = useState([]);
	const { state, dispatch } = useContext(AppStateContext);
	const [classUrl, setClassUrl] = useState();
	let room, ownerLink, callFrame;

	useEffect(() => {
		createClassUrl();
		setupCallObject();
	}, []);

	useEffect(() => {
		console.log('INSTUCTOR VIEW- inClass? useEffect ', state.inClass);
		if (!state.inClass) {
			endClassHandler();
		}
	}, [state.inClass]);

	const startClassHandler = () => {
		console.log('Start Class!');
		dispatch({
			type: 'updateInClass',
			payload: true
		});
	};

	const endClassHandler = () => {
		// Redundant update to state (class toolbar does it first)
		dispatch({
			type: 'updateInClass',
			payload: false
		});
	};

	const setupCallObject = () => {
		console.log('setup call obj');
		const callObj = DailyIframe.createCallObject({
			dailyConfig: {
				experimentalChromeVideoMuteLightOff: true
			}
		});
		dispatch({
			type: 'updateCallFrame',
			payload: callObj
		});
	};

	const getClassUrl = () => {
		// can check if class is stored in classes based on instructor name in case of refresh
		if (!!myClass) {
			return myClass.url;
		}
		get(createRoomEndpoint, response => {
			console.log('fetched response', response);

			response.on('data', data => {
				const roomData = JSON.parse(data);
				const url = roomData.url;
				return url;
			});
		}).catch(e => {
			console.log('error getting chat room url - ', e);
		});
	};

	// const callFrameProperties = {
	//   url: <required: url of the meeting to join>
	//   token: <optional: meeting join token>,
	//   lang: <optional: 'en' | 'fr' | 'user'>,
	//   showLeaveButton: <optional: show the "leave call" button in the bottom menu bar>
	//   showFullscreenButton: <optional: show a floating "full screen" button on supported browsers>
	//   iframeStyle: <optional: used only by `createFrame()`>
	//   customLayout: <optional: use a custom in-call UI>
	//   cssFile: <optional: for a custom UI, an external css stylesheet to load>
	//   cssText: <optional: for a custom UI, an inline css style text to load>
	//   bodyClass: <optional: for a custom UI, class attributes to apply to the iframe body element>
	// };

	const showEvent = e => {
		console.log('Show event ', e);
	};

	const joinedCall = e => {
		console.log('joined call');
		showEvent(e);
	};

	const leftCall = e => {
		console.log('left call ');
		showEvent(e);
	};

	const updateEvent = e => {
		console.log('update event');
		showEvent(e);
	};

	const newRoomEndpoint =
			'https://fu6720epic.execute-api.us-west-2.amazonaws.com/default/dailyWwwApiDemoNewCall',
		tokenEndpoint =
			'https://dwdd5s2bp7.execute-api.us-west-2.amazonaws.com/default/dailyWWWApiDemoToken';

	async function createMtgRoom() {
		try {
			let response = await fetch(createRoomEndpoint),
				room = await response.json();
			return room.url;
		} catch (e) {
			console.error(e);
		}
	}

	async function createMtgLinkWithToken(room, properties = {}) {
		try {
			let response = await fetch(tokenEndpoint, {
				method: 'POST',
				body: JSON.stringify({
					properties: {
						room_name: room.name,
						...properties
					}
				})
			});
			let token = await response.text();
			console.log('TOKEN text is ', token);
			return `${room.url}?t=${token}`;
		} catch (e) {
			console.error(e);
		}
	}

	async function createClassUrl() {
		try {
			room = await createMtgRoom();
			console.log('GOT ROOM as ', room);
			setClassUrl(room);
		} catch (e) {
			console.log('url fetch failed - retrying in 2s: ', e);
			setTimeout(() => createClassUrl(), 2000);
		}
	}

	return (
		<div>
			{state.inClass ? (
				<ClassToolbar />
			) : (
				<Toolbar
					text='Toolbar'
					menuClicked={() => console.log('menu clicked')}
				/>
			)}
			{/* Make 2 columns */}
			{state.inClass ? (
				<VideoFrame url={classUrl} viewerType='instructor' />
			) : (
				<div id='start-class-container'>
					<p>Press start to begin your class</p>
					<Button
						text='Start Class'
						id='start-class-btn'
						clicked={startClassHandler}
					/>
				</div>
			)}
			<div id='footer' className='h-50px bg-gray-300' />
		</div>
	);
};

export default InstructorView;
