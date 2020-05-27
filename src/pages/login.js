import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import Firebase from '../actions/Firebase';

const LoginView = (props) => {
	const [userName, setUserName] = useState('');
	const [password, setPassword] = useState('');
	const history = useHistory();

	const userNameInputHandler = (event) => {
		setUserName(event.target.value);
	};

	const passwordInputHandler = (event) => {
		setPassword(event.target.value);
	};

	const googleSignInFlow = async () => {
		return Firebase.loginWithGoogle()
			.then((user) => {
				return Firebase.getToken();
			})
			.then((token) => {
				signInFlowHelper(token);
			});
	};

	const formSubmittedHandler = async (event) => {
		event.preventDefault();
		Firebase.signInWithEmailPassword(userName, password).catch((error) => {
			console.log('Error firebase signin email pw ', error);
			window.alert(error.message);
			return;
		});
		Firebase.getToken().then((token) => {
			signInFlowHelper(token);
		});
	};

	/**
	 * Takes in a firebase token and fetches the user from back end. Store user's profile in cookie
	 * @param {string} token
	 */
	const signInFlowHelper = async (token) => {

	};

	const loadSignUpForm = () => {
		history.push('/register');
	};

	return (
		<div id='login-view'>
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
							className='w-full h-7 p-3 border rounded color-gray-300 shadow'
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
							className='w-full h-7 p-3 border rounded color-gray-300 shadow'
						/>
					</div>
					<br />
					<div id='login-container' className='text-center'>
						<input
							type='submit'
							value='Login'
							className='bg-green-500 p-2 px-5 rounded shadow text-white'
						/>
					</div>
				</form>
				<br />
				<div id='signin-google-container' className='text-center'>
					<button
						onClick={googleSignInFlow}
						className='text-center text-blue-400 underline'
					>
						Sign in with Google
					</button>
				</div>
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
