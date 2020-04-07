import React, { useState } from 'react';
import Toolbar from '../Components/Toolbar';

const SignupView = (props) => {
	const [firstName, setFirstName] = useState();
	const [lastName, setLastName] = useState();
	const [email, setEmail] = useState();
	const [password, setPassword] = useState();

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
		console.log('acct type event: ', event.target);
	};

	const formSubmittedHandler = (event) => {
		console.log('Sign Up Form submitted event: ', event);
		// check if user exists already
	};

	// Validates username and pw
	const validateForm = () => {};

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
					<div
						id='account-type-container'
						className='pl-3 border rounded border-gray-300'
					>
						<span className='pr-8'>Which kind of user are you?</span>
						<input
							type='radio'
							id='participant'
							name='acct-type'
							value='0'
							onChange={accountTypeHandler}
						/>
						<label for='participant' className='pr-3'>
							Participant
						</label>
						<input
							type='radio'
							id='instructor'
							name='acct-type'
							value='1'
							onChange={accountTypeHandler}
							className='pl-1'
						/>
						<label for='instructor'>Instructor</label>
					</div>
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
