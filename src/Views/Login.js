import React, { useState } from 'react';
import Toolbar from '../Components/Toolbar';

const LoginView = (props) => {
	const [userName, setUserName] = useState('');
	const [password, setPassword] = useState('');

	const userNameInputHandler = (event) => {
		setUserName(event.target.value);
	};

	const passwordInputHandler = (event) => {
		setPassword(event.target.value);
	};

	const formSubmittedHandler = (event) => {
		console.log('Login Form submitted event: ', event);
		// make api call to get user and store in cookies
	};

	const loadSignUpForm = () => {
		console.log('Load sign up form');
	};

	return (
		<div id='login-view'>
			<Toolbar />
			<div
				id='login-container'
				className=' max-w-md mx-auto border-2 border-gray-400 rounded p-6 shadow'
			>
				<div id='title-text' className='text-center'>
					<p className='text-xl'>Login to start working out!</p>
				</div>
				<form id='login-form' onSubmit={formSubmittedHandler}>
					<div id='username-container' className='w-11/12'>
						<label for='email'>Email:</label>
						<br />
						<input
							id='email'
							type='text'
							placeholder='example@email.com'
							onChange={userNameInputHandler}
							className='w-full h-7 p-3'
						/>
					</div>
					<br />
					<div id='password-container' className='w-11/12'>
						<label for='pwd'>Password:</label>
						<br />
						<input
							id='pwd'
							type='password'
							placeholder='password'
							onChange={passwordInputHandler}
							className='w-full h-7 p-3'
						/>
					</div>
					<br />
					<div id='login-container' className='text-center'>
						<input
							type='submit'
							value='Login'
							className='bg-green-500 p-2 w-2/6 rounded'
						/>
					</div>
				</form>
				<br />
				<div id='signup-link-container' className='text-center'>
					<button
						onClick={loadSignUpForm}
						className='text-center text-blue-400 underline'
					>
						Not a member? Sign up here
					</button>
				</div>
			</div>
		</div>
	);
};

export default LoginView;
