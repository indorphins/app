import React, { useEffect, useState, useContext } from 'react';
import Toolbar from '../Components/Toolbar';
import Button from '../Components/Button';
import { AppStateContext } from '../App';
import { useHistory } from 'react-router-dom';
import Profile from '../Classes/Profile';
import _isEmpty from 'lodash/isEmpty';
import ClassView from './ClassView';

const InstructorView = props => {
	const { state, dispatch } = useContext(AppStateContext);
	const history = useHistory();

	useEffect(() => {
		if (!state.inClass) {
			endClassHandler();
		}
	}, [state.inClass]);

	// Load default instructor name
	useEffect(() => {
		if (_isEmpty(state.myProfile)) {
			console.log('no profile - load instructor default profile');
			dispatch({
				type: 'updateProfile',
				payload: new Profile('Instructor', 'instructor')
			});
		}
	}, []);

	// Updates state.inClass to true and change url to load ClassView
	const startClassHandler = async () => {
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
						<p>Press start to begin your class and get your room code</p>
						<p>Classes will last 60 minutes.</p>
						<br />
						<Button
							text='Start Class'
							id='start-class-btn'
							clicked={startClassHandler}
						/>
						<br />
						<br />
						<p>The room code is needed for participants to join.</p>
						<p>Please don't refresh or you won't be able to join back in.</p>
						<p>
							If a participant leaves they may use the room code to join back
							in.
						</p>
					</div>
				</div>
			) : (
				<ClassView />
			)}
		</div>
	);
};

export default InstructorView;
