import React, { useContext, useEffect, useState } from 'react';
import Toolbar from '../Components/Toolbar';
import { AppStateContext } from '../App';
import { formatPhone } from '../Helpers/utils';
import { useCookies } from 'react-cookie';
import _isEmpty from 'lodash/isEmpty';
import { useHistory } from 'react-router-dom';

const ProfileView = (props) => {
	const { state, dispatch } = useContext(AppStateContext);
	const [formattedPhone, setFormattedPhone] = useState();
	const [fullName, setFullName] = useState('');
	const [email, setEmail] = useState('');
	const [removeCookie] = useCookies();
	const history = useHistory();

	useEffect(() => {
		if (!_isEmpty(state.myProfile) && state.myProfile.phone) {
			setFormattedPhone(formatPhone(state.myProfile.phone));
		}
		if (
			!_isEmpty(state.myProfile) &&
			state.myProfile.firstName &&
			state.myProfile.lastName
		) {
			setFullName(`${state.myProfile.firstName} ${state.myProfile.lastName}`);
		}
		if (!_isEmpty(state.myProfile) && state.myProfile.email) {
			setEmail(state.myProfile.email);
		}
	}, [state.myProfile]);

	const logoutHandler = () => {
		dispatch({
			type: 'removeProfile',
			payload: null,
		});
		removeCookie('profile');
		history.push('/login');
	};

	return (
		<div>
			<Toolbar />
			<div
				id='profile-view-container'
				className='border-gray-400 rounded shadow mx-auto w-7/12'
			>
				<div
					id='profile-items-container'
					className='border-gray-400 rounded shadow'
				>
					<div
						id='name-container'
						className='border-gray-400  border-b w-full py-5 inline-flex justify-between'
					>
						<label for='name' className='ml-5'>
							Name:
						</label>
						<div id='name' className='mr-5'>
							{fullName}
						</div>
					</div>
					<div
						id='email-container'
						className='border-gray-400  border-b w-full py-5 inline-flex justify-between'
					>
						<label for='email' className='ml-5'>
							Email:
						</label>
						<div id='email' className='mr-5'>
							{email}
						</div>
					</div>
					<div
						id='phone-container'
						className='border-gray-400  w-full py-5 inline-flex justify-between'
					>
						<label for='phone' className='ml-5'>
							Phone Number:
						</label>
						<div id='phone' className='mr-5'>
							{formattedPhone}
						</div>
					</div>
				</div>
			</div>
			<div id='logout-btn-container' className='mt-5 text-center'>
				<button
					id='logout-btn'
					className='rounded bg-red-600 p-3'
					onClick={logoutHandler}
				>
					Logout
				</button>
			</div>
		</div>
	);
};

export default ProfileView;
