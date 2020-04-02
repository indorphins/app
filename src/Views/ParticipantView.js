import React, { useContext, useEffect, useState } from 'react';
import { AppStateContext } from '../App2';
import Toolbar from '../Components/Toolbar';
import ClassView from './ClassView';

const ParticipantView = props => {
	const { state, dispatch } = useContext(AppStateContext);
	const { classes } = state;
	const [joinedClass, setJoinedClass] = useState(false);
	const [roomName, setRoomName] = useState('');

	let classListItems = [];

	// Load classes from API on mount
	useEffect(() => {
		// TODO fetch classes + store on client side
	}, []);

	// set up class tile elements with room names
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
	}, [classes]);

	const inputChangedHandler = event => {
		setRoomName(event.target.value);
	};

	const joinClassHandler = event => {
		console.log('submit room name: ', roomName);
		event.preventDefault();
		dispatch({
			type: 'updateInClass',
			payload: true
		});
	};

	console.log('Rendered participant view with inClass ', state.inClass);

	return (
		<div id='participant-view-container' className='text-center'>
			{!state.inClass ? (
				<div>
					<Toolbar
						text='Toolbar'
						menuClicked={() => console.log('menu clicked')}
					/>
					<div id='class-list-container'>
						<div>Classes</div>
						<form onSubmit={joinClassHandler}>
							<input
								type='text'
								value={roomName}
								onChange={inputChangedHandler}
								placeholder='input class name here'
							></input>
							<input type='submit' value='Submit'></input>
						</form>
						{/* <ul id='class-list'>{classListItems}</ul> */}
					</div>
				</div>
			) : (
				<ClassView roomName={roomName} />
			)}
		</div>
	);
};

export default ParticipantView;
