import React, { useContext } from 'react';
import Toolbar from '../Components/Toolbar';
import { AppStateContext } from '../App';

const ProfileView = (props) => {
	const { state, dispatch } = useContext(AppStateContext);
	console.log('Profile view - State is ', state);
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
							{`${state.myProfile.firstName} ${state.myProfile.lastName}`}
						</div>
					</div>
					<div
						id='email-container'
						className='border-gray-400  border-b w-full py-5 inline-flex justify-between'
					>
						<label for='email' className='ml-5'>
							Email:
						</label>
						<div id='email' className='mr-5'>{`${state.myProfile.email}`}</div>
					</div>
					<div
						id='phone-container'
						className='border-gray-400  w-full py-5 inline-flex justify-between'
					>
						<label for='phone' className='ml-5'>
							Phone Number:
						</label>
						<div id='phone' className='mr-5'>{`${state.myProfile.phone}`}</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ProfileView;
