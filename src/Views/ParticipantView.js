import React, { useContext, useEffect, useState } from 'react';
import { AppStateContext } from '../App';
import Toolbar from '../Components/Toolbar';
import _isEmpty from 'lodash/isEmpty';
import ClassView from './ClassView';
import { useCookies } from 'react-cookie';
import Profile from '../Classes/Profile';
import Button from '../Components/Button';
import { getClasses } from '../Controllers/ClassesController';
import ClassTile from '../Components/ClassTile';
import { getExpiryHoursFromNow } from '../Helpers/utils';

const ParticipantView = (props) => {
	const { state, dispatch } = useContext(AppStateContext);
	const { classes } = state;
	const [roomName, setRoomName] = useState('');
	const [classTiles, setClassTiles] = useState([]);
	const [cookies, setCookie] = useCookies('profile');

	// FOR TESTING
	// useEffect(() => {
	// 	console.log('I View start w/ profile ', state.myProfile);
	// 	console.log('no state profile - load from cookies profile');
	// 	// For testing
	// 	const p = new Profile('BOB', 'SHNEIDER', 'participant');
	// 	console.log('Updated Participant Profile');
	// 	setCookie('profile', p);
	// 	// if (cookies.profile) {
	// 	// 	console.log('Cookies profile is ', cookies.profile);
	// 	dispatch({
	// 		type: 'updateProfile',
	// 		payload: p,
	// 	});
	// 	// } else {
	// 	// 	// Send them to login page
	// 	// 	history.push('/login');
	// 	// }
	// }, []);

	// Load classes from API on mount
	useEffect(() => {
		// TODO fetch classes + store on client side
		getClasses()
			.then((response) => {
				// returns array of class objects with fields instructor_name, chat_room_name, class_id, participants, total_spots, duration
				if (response.success) {
					response.classes.forEach((c) => {
						// Only show active classes
						if (c.status === 'active') {
							dispatch({
								type: 'addClass',
								payload: c,
							});
						}
					});
				}
			})
			.catch((error) => {
				console.log('ParticipantView - error fetching classes: ', error);
			});
	}, []);

	// set up class tile elements with room names
	useEffect(() => {
		const classListItems = [];
		const keys = Object.keys(classes);
		keys.forEach((id) => {
			const c = classes[id];
			classListItems.push(
				<ClassTile
					id={c.class_id}
					classCode={c.chat_room_name}
					instructor={c.instructor_name}
					totalSpots={c.total_spots}
					participants={c.participants}
					clicked={() => {
						joinClassHandler(c);
					}}
				/>
			);
			setClassTiles(classListItems);
		});
	}, [classes]);

	const inputChangedHandler = (event) => {
		setRoomName(event.target.value);
	};

	const joinClassHandler = (c) => {
		console.log('Join Class -', c);
		dispatch({
			type: 'updateCurrentClass',
			payload: c,
		});
		setCookie('currentClass', c);
		setRoomName(c.chat_room_name);
		dispatch({
			type: 'updateInClass',
			payload: true,
		});
	};

	const oldJoinClassHandler = (event) => {
		console.log('');
		event.preventDefault();
		dispatch({
			type: 'updateInClass',
			payload: true,
		});
	};

	return (
		<div id='participant-view-container' className='text-center'>
			{!state.inClass ? (
				<div>
					<Toolbar
						text='Toolbar'
						menuClicked={() => console.log('menu clicked')}
					/>
					<div className='text-center'>
						<div
							id='class-list-container'
							className='bg-gray-300 w-11/12 m-auto rounded block justify-center items-center h-auto'
						>
							{classTiles}
						</div>
						<div id='beta-class-list-container'>
							<p>Enter your room code below</p>
							<br />

							<input
								type='text'
								value={roomName}
								className='border border-gray-400 pl-1 mr-1 h-10'
								onChange={inputChangedHandler}
								placeholder='Room Code...'
							></input>
							<Button
								id='join-class-btn'
								clicked={oldJoinClassHandler}
								text='Join'
							/>
							{/* <ul id='class-list'>{classListItems}</ul> */}
						</div>
					</div>
				</div>
			) : (
				<ClassView roomName={roomName} />
			)}
		</div>
	);
};

export default ParticipantView;
