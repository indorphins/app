import React, { useState, useContext, useEffect } from 'react';
import Toolbar from '../Components/Toolbar';
import { useHistory } from 'react-router-dom';
import Profile from '../Classes/Profile';
import { getExpiryHoursFromNow } from '../Helpers/utils';
import { useCookies } from 'react-cookie';
import { AppStateContext } from '../App';
import { loginUser } from '../Controllers/UsersController';
import Firebase from '../Controllers/Firebase';

const LoginView = (props) => {
	const [userName, setUserName] = useState('');
	const [password, setPassword] = useState('');
	const [cookies, setCookie] = useCookies('profile');
	const { state, dispatch } = useContext(AppStateContext);
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
		// make api call to get user and store in cookies
		await loginUser(token)
			.then((response) => {
				if (response.success) {
					const user = response.data.user;
					// create user's profile and store in cookies
					const userProfile = new Profile(
						user.first_name,
						user.last_name,
						user.user_type === 1 ? 'instructor' : 'participant',
						user.user_id,
						user.email,
						user.phone_number
					);
					setCookie('profile', userProfile, {
						expires: getExpiryHoursFromNow(3),
					});
					dispatch({
						type: 'updateProfile',
						payload: userProfile,
					});
					if (user.user_type === 1) {
						history.push(`/instructor`);
					} else {
						history.push(`/classes`);
					}
				} else {
					if (!response.user) {
						window.alert('No user with that login - please create an account');
						return;
					}
					window.alert('Invalid Login. Please try again.');
				}
			})
			.catch((error) => {
				console.log('Login submit error : ', error);
			});
	};

	const loadSignUpForm = () => {
		history.push('/register');
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
