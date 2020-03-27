import React, { useContext, useEffect, useState } from 'react';
import { AppStateContext } from '../App2';
import DailyIframe from '@daily-co/daily-js';
import Toolbar from '../Components/Toolbar';

const ParticipantView = props => {
	const { state, dispatch } = useContext(AppStateContext);
	const { classes } = state;
	const [joinedClass, setJoinedClass] = useState(false);
	const [name, setName] = useState();

	let classListItems = [];

	// Fetch name from url
	useEffect(() => {
		let participantName = 'Participant';
		if (window.location.hash) {
			participantName = window.location.hash.substring(1);
		}
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
	}, [classes]);

	const joinClassHandler = id => {
		// Get Class
		const c = classes[id];
		console.log('joinClass - got class ', c);
		// Setup call
		const callFrame = DailyIframe.createFrame({
			url: c.url
		});
		callFrame.join();
		window.location = '#' + c.url;

		// add participant to class
		c.addParticipant(name);
		dispatch({
			type: 'updateClass',
			payload: {
				id: c.id,
				class: c
			}
		});
		setJoinedClass(true);
	};

	return (
		<div id='participant-view-container'>
			<Toolbar text='Toolbar' menuClicked={() => console.log('menu clicked')} />
			{!joinedClass ? (
				<div id='class-list-container'>
					<div>Classes</div>
					<ul id='class-list'>{classListItems}</ul>
				</div>
			) : (
				<div id='participant-in-class-container'>
					<div id='participant-list-container'>
						<div>Participants</div>
						<div id='participant-list'>
							<ul>
								<li>{name}</li>
								<li>Myself</li>
								<li>I</li>
							</ul>
						</div>
						You're in the class!
					</div>
				</div>
			)}
		</div>
	);
};

export default ParticipantView;
