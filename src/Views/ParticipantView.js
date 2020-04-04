import React, { useContext, useEffect, useState } from 'react';
import { AppStateContext } from '../App';
import Toolbar from '../Components/Toolbar';
import ClassView from './ClassView';
import Button from '../Components/Button';

const ParticipantView = props => {
	const { state, dispatch } = useContext(AppStateContext);
	const { classes } = state;
	const [roomName, setRoomName] = useState('');

	let classListItems = [];

	// Load classes from API on mount
	useEffect(() => {
		// TODO fetch classes + store on client side
	}, []);

	// set up class tile elements with room names
	useEffect(() => {
		classListItems = [];
		const keys = Object.keys(classes);
		keys.forEach(id => {
			const c = classes[id];
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
		event.preventDefault();
		dispatch({
			type: 'updateInClass',
			payload: true
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
					<div id='class-list-container'>
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
							clicked={joinClassHandler}
							text='Join'
						/>
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
