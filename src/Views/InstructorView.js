import React, { useEffect, useState, useContext } from 'react';
import Toolbar from '../Components/Toolbar';
import Button from '../Components/Button';
import { AppStateContext } from '../App2';
import DailyIframe from '@daily-co/daily-js';
import { get } from 'https';
import { createRoomEndpoint } from '../constants';
import Class from '../Classes/Class';

const InstructorView = props => {
	const [name, setName] = useState();
	const [startClass, setStartClass] = useState(false);
	const [myClass, setMyClass] = useState({});
	const [participants, setParticipants] = useState([]);
	const { state, dispatch } = useContext(AppStateContext);

	useEffect(() => {
		if (window.location.hash) {
			setName(window.location.hash.substring(1));
		} else {
			setName('Instructor');
		}
		return;
	}, []);

	const startClassHandler = () => {
		console.log('Start Class!');
		setStartClass(true);
		// TODO send alert about not refreshing/backing out etc.
		createClass();
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

	async function createClass() {
		try {
			const response = await fetch(createRoomEndpoint);
			console.log('got response ', response);
			const data = await response.json();
			const url = data.url;
			const callFrame = DailyIframe.createFrame({
				url: url
			});
			callFrame.join();
			window.location = '#' + url;
			const c = new Class(url, name);
			console.log('Created Instructor class ', c);
			setMyClass(c);
			dispatch({
				type: 'addClass',
				payload: c
			});
		} catch (e) {
			console.log('url fetch failed - retrying in 2s: ', e);
			setTimeout(() => createClass(), 2000);
		}
	}

	return (
		<div>
			<Toolbar text='Toolbar' menuClicked={() => console.log('menu clicked')} />
			{/* Make 2 columns */}
			{startClass ? (
				<div id='instructor-view-container' className='grid grid-cols-2'>
					<div id='participant-list-container'>
						<div>Participants</div>
						<div id='participant-list'>
							<ul>
								<li>Me</li>
								<li>Myself</li>
								<li>I</li>
							</ul>
						</div>
					</div>
					<div id='video-container'>{/* Insert Iframe w/in div */}</div>
				</div>
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
		</div>
	);
};

export default InstructorView;
