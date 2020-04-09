import React, { useState, useContext } from 'react';
import Toolbar from '../Components/Toolbar';
import { createUser } from '../Controllers/UsersController';
import Profile from '../Classes/Profile';
import { getExpiryHoursFromNow } from '../Helpers/utils';
import { useCookies } from 'react-cookie';
import { useHistory } from 'react-router-dom';
import { AppStateContext } from '../App';
import { emailRegex, phoneRegex } from '../Helpers/regex';

const SignupView = (props) => {
	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [phone, setPhone] = useState('');
	const [cookies, setCookie] = useCookies('profile');
	const { dispatch } = useContext(AppStateContext);
	const history = useHistory();

	const firstNameHandler = (event) => {
		setFirstName(event.target.value);
	};

	const lastNameHandler = (event) => {
		setLastName(event.target.value);
	};

	const emailHandler = (event) => {
		setEmail(event.target.value);
	};

	const passwordHandler = (event) => {
		setPassword(event.target.value);
	};

	const accountTypeHandler = (event) => {
		console.log('acct type event: ', event.target.value);
	};

	const phoneHandler = (event) => {
		setPhone(event.target.value);
	};

	const validateEmail = () => {
		console.log('validate email: ', email);
		console.log('email valid: ', emailRegex.test(email));
		if (!emailRegex.test(email)) {
			window.alert('Email must be in example@email.com format');
			return false;
		}
		return true;
	};

	const formatPhone = () => {
		if (phone.includes('-')) {
			const newPhone = phone.replace(/-/g, '');
			console.log('removed - in phone ', newPhone);
			setPhone(newPhone);
		}
	};

	const validatePhone = () => {
		console.log('Validate phone - ', phone, ' len: ', typeof phone);
		console.log('valid? ', /^d{10}$/.test(phone));
		if (!phoneRegex.test(phone)) {
			window.alert('Phone Number must be 10 digits');
			return false;
		}
		return true;
	};

	const validatePassword = () => {
		// TODO add stricter pw requirements
		if (password.length === 0) {
			window.alert('Password cannot be blank');
			return false;
		}
		return true;
	};

	const validateForm = () => {
		if (firstName.length === 0) {
			window.alert('First Name cannot be blank');
			return false;
		}
		if (lastName.length === 0) {
			window.alert('Last Name cannot be blank');
			return false;
		}
		return validatePhone() && validateEmail() && validatePassword();
	};

	const formSubmittedHandler = async (event) => {
		event.preventDefault();
		// Validate form fields

		if (validateForm()) {
			await createUser(firstName, lastName, email, password, phone, 0)
				.then((response) => {
					if (response.success) {
						const userProfile = new Profile(firstName, 'participant');
						setCookie('profile', userProfile, {
							expires: getExpiryHoursFromNow(3),
						}); // three hours before cookie expiry and login needed
						dispatch({
							type: 'updateProfile',
							payload: userProfile,
						});

						history.push(`/classes#${firstName}`);
					} else {
						if (response.error === 'duplicate_email') {
							window.alert('That email already exists with a user');
						} else if (response.error === 'duplicate_phone') {
							window.alert('That phone number already exists with a user');
						} else {
							window.alert(
								'Sign up failed. Please check that all fields are filled.'
							);
						}
					}
				})
				.catch((error) => {
					console.log('error submitting sign up ', error);
				});
		}
	};

	return (
		<div id='signup-view'>
			<Toolbar />
			<div
				id='signup-form-container'
				className=' max-w-xl mx-auto border-2 border-gray-400 rounded p-6 shadow'
			>
				<form
					id='signup-form'
					onSubmit={formSubmittedHandler}
					// className='inline-block'
				>
					<div id='first-name-container'>
						<div>First Name:</div>
						<input
							type='text'
							placeholder='John'
							onChange={firstNameHandler}
							className='w-full h-7 p-3 border rounded color-gray-300 shadow'
						/>
					</div>
					<div id='last-name-container'>
						<div>Last Name:</div>
						<input
							type='text'
							placeholder='Doe'
							onChange={lastNameHandler}
							className='w-full h-7 p-3 border rounded color-gray-300 shadow'
						/>
					</div>
					<div id='email-container'>
						<div>Email:</div>
						<input
							type='text'
							placeholder='example@email.com'
							onChange={emailHandler}
							className='w-full h-7 p-3 border rounded color-gray-300 shadow'
						/>
					</div>
					<div id='password-container'>
						<div>Password:</div>
						<input
							type='password'
							placeholder='password'
							onChange={passwordHandler}
							className='w-full h-7 p-3 border rounded color-gray-300 shadow'
						/>
					</div>
					<br />
					<div id='phone-container'>
						<div>Phone Number:</div>
						<input
							type='tel'
							placeholder='123-456-7890'
							onChange={phoneHandler}
							onBlur={formatPhone}
							className='w-full h-7 p-3 border rounded color-gray-300 shadow'
						/>
					</div>
					{/* <div
						id='account-type-container'
						className='pl-3 border rounded border-gray-300'
					>
						<span className='pr-8'>Which kind of user are you?</span>
						<input
							type='radio'
							id='participant'
							name='acct-type'
							value='1'
							onChange={accountTypeHandler}
						/>
						<label for='participant' className='pr-3'>
							Participant
						</label>
						<input
							type='radio'
							id='instructor'
							name='acct-type'
							value='0'
							onChange={accountTypeHandler}
							className='pl-1'
						/>
						<label for='instructor'>Instructor</label>
					</div> */}
					<br />
					<div className='text-center'>
						<input
							type='submit'
							value='Create Account'
							className='bg-blue-500 p-2 px-5 rounded text-white shadow'
						/>
					</div>
				</form>
			</div>
		</div>
	);
};

export default SignupView;
