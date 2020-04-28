import React, { useEffect, useState, useContext } from 'react';
import Toolbar from '../Components/Toolbar';
import Button from '../Components/Button';
import { AppStateContext } from '../App';
import { useHistory } from 'react-router-dom';
import _isEmpty from 'lodash/isEmpty';
import {
	storeInSession,
	getFromSession,
	removeItemFromSession,
} from '../Helpers/sessionHelper';
import { endClass } from '../Controllers/ClassesController';
import { deleteRoom } from '../Controllers/DailycoController';

const InstructorView = (props) => {
	const { state, dispatch } = useContext(AppStateContext);
	const history = useHistory();

	useEffect(() => {
		// if not an instructor redirect away from page
		if (!state.myProfile || state.myProfile.type !== 'instructor') {
			history.push('/classes');
		}
	}, [state.myProfile]);

	// If sent back to this page with instructorEndClass set to true, close out the class on the backend
	useEffect(() => {
		const endClassBool = getFromSession('instructorEndClass');
		if (endClassBool) {
			const currentClass = getFromSession('currentClass');
			if (!_isEmpty(currentClass)) {
				return endClass(currentClass.class_id)
					.then(() => {
						return deleteRoom(currentClass.chat_room_name);
					})
					.then(() => {
						removeItemFromSession('dailyClass');
						removeItemFromSession('currentClass');
						removeItemFromSession('instructorEndClass');
						window.location.reload();
					})
					.catch((error) => {
						console.log('InstructorView - endClass - error: ', error);
					});
			}
		}
	});

	// Updates inClass to true and change url to load ClassView
	const startClassHandler = async () => {
		storeInSession('inClass', true);
		history.push('/class');
	};

	return (
		<div>
			<div>
				<Toolbar
					text='Toolbar'
					menuClicked={() => console.log('menu clicked')}
				/>

				<div id='start-class-container' className='text-center'>
					<p>Press start to begin your class</p>
					<p>Classes will last 60 minutes.</p>

					<br />
					<Button
						text='Start Class'
						id='start-class-btn'
						clicked={startClassHandler}
					/>
					<br />
					<br />

					<p>Please make sure your video and audio is turned on</p>
					<p> once you connect to your virtual fitness studio.</p>
				</div>
			</div>
		</div>
	);
};

export default InstructorView;
