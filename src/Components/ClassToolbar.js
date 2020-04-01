import React, { useContext } from 'react';
import styles from '../Styles/Toolbar.module.css';
// import NavigationItems from '../NavigationItems/NavigationItems';
import Menu from './Menu';
import Logo from './Logo';
import Button from './Button';
import { AppStateContext } from '../App2';
import _isEmpty from 'lodash/isEmpty';
import _get from 'lodash/get';
import { useHistory } from 'react-router-dom';

// Differs from regular toolbar by replacing the logo w/ class name and adding leave class button
const Toolbar = props => {
	const { state, dispatch } = useContext(AppStateContext);
	const history = useHistory();

	const leaveClassHandler = () => {
		const myCallFrame = state.myCallFrame;
		if (!_isEmpty(myCallFrame)) {
			myCallFrame.destroy();
		}
		// change route back to classes/instructor page
		const profType = _get(state.myProfile, 'type', 'PARTICIPANT');
		const name = _get(state.myProfile, 'name', '');
		if (profType === 'INSTRUCTOR') {
			history.replace(`/instructor#${name}`);
		} else {
			history.replace(`/classes#${name}`);
		}
		dispatch({
			type: 'updateInClass',
			payload: false
		});
		window.location.reload();
	};

	const name = !_isEmpty(state.myProfile) ? state.myProfile.name : 'Instructor';

	return (
		<header className={styles.Toolbar}>
			<Menu
				clicked={
					props.menuClicked
						? props.menuClicked
						: () => {
								console.log('default memu clicked fxn');
						  }
				}
			/>
			<div className='text-xl'>
				<p>{name}'s Class</p>
			</div>
			<div id='leave-class-container' className='flex-auto text-right'>
				<Button
					clicked={leaveClassHandler}
					text='Leave Class'
					id='leave-class-btn'
					bgcolor='red'
				/>
			</div>
			<nav className={styles.DesktopOnly}>{/* <NavigationItems /> */}</nav>
		</header>
	);
};

export default Toolbar;
