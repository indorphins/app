import React, { useEffect, useState, useContext } from 'react';
import Toolbar from '../Components/Toolbar';
import Button from '../Components/Button';
import { AppStateContext } from '../App';
import { useHistory } from 'react-router-dom';
import _isEmpty from 'lodash/isEmpty';
import { storeInSession, getFromSession } from '../Helpers/sessionHelper';

const InstructorView = (props) => {
	const { state, dispatch } = useContext(AppStateContext);
	const history = useHistory();

	useEffect(() => {
		// if not an instructor redirect away from page
		if (!state.myProfile || state.myProfile.type !== 'instructor') {
			history.push('/classes');
		}
	}, [state.myProfile]);

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
