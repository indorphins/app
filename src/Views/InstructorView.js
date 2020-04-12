import React, { useEffect, useState, useContext } from 'react';
import Toolbar from '../Components/Toolbar';
import Button from '../Components/Button';
import { AppStateContext } from '../App';
import { useHistory } from 'react-router-dom';
import _isEmpty from 'lodash/isEmpty';
import ClassView from './ClassView';
import { useCookies } from 'react-cookie';
import Profile from '../Classes/Profile';

const InstructorView = (props) => {
	const { state, dispatch } = useContext(AppStateContext);
	const [cookies, setCookie] = useCookies('profile');
	const history = useHistory();

	useEffect(() => {
		if (!state.inClass) {
			endClassHandler();
		}
	}, [state.inClass]);

	// Load default instructor name TESTING
	// useEffect(() => {
	// 	console.log('I View start w/ profile ', state.myProfile);
	// 	// if (_isEmpty(state.myProfile)) {
	// 	console.log('no state profile - load from cookies profile');
	// 	// For testing
	// 	const p = new Profile('Alex', 'Lindsay', 'instructor');
	// 	console.log('Updated Instructor Profile');
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
	// 	// }
	// }, []);

	// Updates state.inClass to true and change url to load ClassView
	const startClassHandler = async () => {
		dispatch({
			type: 'updateInClass',
			payload: true,
		});
	};

	// Redundant update to state (class toolbar does it first)
	const endClassHandler = () => {
		dispatch({
			type: 'updateInClass',
			payload: false,
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
