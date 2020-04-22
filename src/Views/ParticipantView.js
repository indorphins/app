import React, { useContext, useEffect, useState } from 'react';
import { AppStateContext } from '../App';
import Toolbar from '../Components/Toolbar';
import _isEmpty from 'lodash/isEmpty';
import { useCookies } from 'react-cookie';
import Button from '../Components/Button';
import { getClasses } from '../Controllers/ClassesController';
import ClassTile from '../Components/ClassTile';
import { storeInSession } from '../Helpers/sessionHelper';
import { useHistory } from 'react-router-dom';

const ParticipantView = (props) => {
	const { state, dispatch } = useContext(AppStateContext);
	const { classes } = state;
	const [roomName, setRoomName] = useState('');
	const [classTiles, setClassTiles] = useState([]);
	const history = useHistory();

	// Load classes from API on mount
	useEffect(() => {
		// TODO fetch classes + store on client side
		getClasses()
			.then((response) => {
				// returns array of class objects with fields instructor_name, chat_room_name, class_id, participants, total_spots, duration
				if (response.success) {
					const classListItems = [];
					console.log('Classes fetched response ', response);
					response.classes.forEach((c) => {
						// Only show active classes
						if (c.status === 'active') {
							dispatch({
								type: 'addClass',
								payload: c,
							});
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
						}
					});
					setClassTiles(classListItems);
				}
			})
			.catch((error) => {
				console.log('ParticipantView - error fetching classes: ', error);
			});
	}, []);

	useEffect(() => {
		// if instructor redirect to instructor page
		if (state.myProfile && state.myProfile.type === 'instructor') {
			history.push('/instructor');
		}
	}, [state.myProfile]);

	// set up class tile elements with room names
	useEffect(() => {
		// const classListItems = [];
		// const keys = Object.keys(classes);
		// keys.forEach((id) => {
		// 	const c = classes[id];
		// 	classListItems.push(
		// 		<ClassTile
		// 			id={c.class_id}
		// 			classCode={c.chat_room_name}
		// 			instructor={c.instructor_name}
		// 			totalSpots={c.total_spots}
		// 			participants={c.participants}
		// 			clicked={() => {
		// 				joinClassHandler(c);
		// 			}}
		// 		/>
		// 	);
		// 	setClassTiles(classListItems);
		// });
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
		storeInSession('currentClass', c);
		storeInSession('inClass', true);
		history.push(`/class`);
	};

	const oldJoinClassHandler = (event) => {
		console.log('');
		event.preventDefault();
		history.push(`/class#`);
		storeInSession('inClass', true);
		// TODO Find class API call to get this working, then set to currentClass
		storeInSession('inClass', true);
		history.push(`/class`);
	};

	return (
		<div id='participant-view-container' className='text-center'>
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
		</div>
	);
};

export default ParticipantView;
