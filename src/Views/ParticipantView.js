import React, { useContext, useEffect, useState } from 'react';
import { AppStateContext } from '../App2';
import DailyIframe from '@daily-co/daily-js';
import Toolbar from '../Components/Toolbar';
import ClassToolbar from '../Components/ClassToolbar';
import VideoFrame from './VideoFrame';

const ParticipantView = props => {
	const { state, dispatch } = useContext(AppStateContext);
	const { classes } = state;
	const [joinedClass, setJoinedClass] = useState(false);
	const [name, setName] = useState();
	const [classUrl, setClassUrl] = useState('');

	let classListItems = [];

	// Fetch name from url
	useEffect(() => {
		let participantName = 'Participant';
		if (window.location.hash) {
			participantName = window.location.hash.substring(1);
		}
		setupCallObject();
		setName(participantName);
		return;
	}, []);

	// Load classes from API on mount
	useEffect(() => {
		// TODO fetch classes + store on client side
	}, []);

	useEffect(() => {
		classListItems = [];
		console.log('iterating over classes - ', classes);
		const keys = Object.keys(classes);
		keys.forEach(id => {
			const c = classes[id];
			console.log('class is ', c);
			// Todo create Class components
			classListItems.push(
				<li
					id={`class_${c.id}`}
					onClick={() => {
						joinClassHandler(c.id);
					}}
				>
					{`${c.instructor()}'s Class`}
				</li>
			);
		});
		const inputClass = (
			<form onSubmit={() => joinClassHandler(classUrl)}>
				<input
					type='text'
					value={classUrl}
					placeholder='input class url here'
				></input>
				<input type='submit'>Join</input>
			</form>
		);
		classListItems.push(inputClass);
	}, [classes]);

	const inputChangedHandler = event => {
		setClassUrl(event.target.value);
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

	const joinClassHandler = id => {
		// Get Class
		const c = classes[id] ? classes[id] : null;

		const url = c ? c : id;
		console.log('joinClass - got url ', url);
		setClassUrl(url);

		window.location = '#' + url;
		setJoinedClass(true);
	};

	const submitFormHandler = event => {
		console.log('submit: event:', event, '  - url: ', classUrl);
		event.preventDefault();
		joinClassHandler(classUrl);
	};

	return (
		<div id='participant-view-container'>
			{state.inClass ? (
				<ClassToolbar />
			) : (
				<Toolbar
					text='Toolbar'
					menuClicked={() => console.log('menu clicked')}
				/>
			)}
			{!joinedClass ? (
				<div id='class-list-container'>
					<div>Classes</div>
					<form onSubmit={submitFormHandler}>
						<input
							type='text'
							value={classUrl}
							onChange={inputChangedHandler}
							placeholder='input class url here'
						></input>
						<input type='submit' value='Submit'></input>
					</form>
					{/* <ul id='class-list'>{classListItems}</ul> */}
				</div>
			) : (
				<VideoFrame url={classUrl} viewerType='participant' />
				// <div id='participant-in-class-container'>
				// 	<div id='participant-list-container'>
				// 		<div>Participants</div>
				// 		<div id='participant-list'>
				// 			<ul>
				// 				<li>{name}</li>
				// 				<li>Myself</li>
				// 				<li>I</li>
				// 			</ul>
				// 		</div>
				// 		You're in the class!
				// 	</div>
				// </div>
			)}
		</div>
	);
};

export default ParticipantView;
