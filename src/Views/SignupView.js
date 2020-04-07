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
			<div id='signup-form-container'>
				<form id='signup-form' onSubmit={formSubmittedHandler}>
					<div id='first-name-container'>
						<div>First Name:</div>
						<input type='text' placeholder='John' onChange={firstNameHandler} />
					</div>
					<div id='last-name-container'>
						<div>Last Name:</div>
						<input type='text' placeholder='Doe' onChange={lastNameHandler} />
					</div>
					<div id='first-name-container'>
						<div>Email:</div>
						<input
							type='text'
							placeholder='example@email.com'
							onChange={emailHandler}
						/>
					</div>
					<div id='first-name-container'>
						<div>Password:</div>
						<input
							type='password'
							placeholder='password'
							onChange={passwordHandler}
						/>
					</div>
					<div id='account-type-container'>
						<span>What kind of user are you?</span>
						<input
							type='radio'
							id='participant'
							name='acct-type'
							value='0'
							onChange={accountTypeHandler}
						/>
						<label for='participant'>Participant</label>
						<input
							type='radio'
							id='instructor'
							name='acct-type'
							value='1'
							onChange={accountTypeHandler}
						/>
						<label for='instructor'>Instructor</label>
					</div>
					<input type='submit' value='Finish'>
						Submit
					</input>
				</form>
			</div>
		</div>
	);
};

export default SignupView;
