import React, { useEffect, useState, useContext } from 'react';
import Toolbar from '../Components/Toolbar';
import Button from '../Components/Button';
import { AppStateContext } from '../App2';
import { useHistory } from 'react-router-dom';
import Profile from '../Classes/Profile';

import _isEmpty from 'lodash/isEmpty';
import ClassView from './ClassView';

import {
	createRoom,
	createToken,
	deleteRoom,
	getRoom
} from '../Controllers/DailycoController';

const InstructorView = props => {
	const { state, dispatch } = useContext(AppStateContext);
	const history = useHistory();

	useEffect(() => {
		if (!state.inClass) {
			endClassHandler();
		}
	}, [state.inClass]);

	// FOR TESTING
	useEffect(() => {
		if (_isEmpty(state.myProfile)) {
			console.log('no profile - load instructor one for testing');
			dispatch({
				type: 'updateProfile',
				payload: new Profile('Alex', 'instructor')
			});
		}
	}, []);

	// Updates state.inClass to true and change url to load ClassView
	const startClassHandler = async () => {
		console.log('Start Class!');
		dispatch({
			type: 'updateInClass',
			payload: true
		});
	};

	// Redundant update to state (class toolbar does it first)
	const endClassHandler = () => {
		dispatch({
			type: 'updateInClass',
			payload: false
		});
	};

	return (
		<div>
			{!state.inClass ? (
				<div>
					<Toolbar
						text='Toolbar'
						menuClicked={() => console.log('menu clicked')}
					/>

					<div id='start-class-container' className='text-center'>
						<p>Press start to begin your class</p>
						<Button
							text='Start Class'
							id='start-class-btn'
							clicked={startClassHandler}
						/>
					</div>
				</div>
			) : (
				<ClassView />
			)}
		</div>
	);
};

export default InstructorView;
