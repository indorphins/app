import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import CircularProgress from '@material-ui/core/CircularProgress';

import * as User from '../api/user';
import Firebase from '../Firebase';
import log from '../log';

import { store, actions } from '../store';

export default function(props) {
	const [username, setUsername] = useState('');
	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [passwordConfirm, setConfirm] = useState('');
	const [phone, setPhone] = useState('');
	const [phoneErr, setPhoneErr] = useState('');
	const [loader, setLoader] = useState(false);
	const history = useHistory();

	const usernameHandler = (event) => {
		setUsername(event.target.value);
	};

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

	const confirmHandler = (event) => {
		setConfirm(event.target.value);
	};

	const phoneHandler = (event) => {
		setPhone(event.target.value);
		console.log(phone);
	};

	const formHandler = async (event) => {
		event.preventDefault();
		setLoader(true);
		Firebase.clearListeners();
		let user;

		try {
			await Firebase.createAccount(email, password);
		} catch(err) {
			// TODO: display this error to the user
			setLoader(false);
			return log.error("AUTH:: firebase account create", err);
		}

		log.debug("AUTH:: created new firebase account for user");

		try {
      user = await User.create( 
        username, 
        firstName, 
        lastName,
        email,
        phone
      )
    } catch(err) {
			// TODO: display this error the user?
			setLoader(false);
      return log.warn("AUTH:: error creating user account from firebase token", err);
		}
		
		log.debug("AUTH:: created new user", user);

		await store.dispatch(actions.user.set(user.data));

		setLoader(false);
		history.push('/');
	};

	let formcontent = (
		<Box>
			<form onSubmit={formHandler}>
				<Box>
					<TextField required id="username" type="text" label="Nickname" variant="outlined" onChange={usernameHandler}/>
				</Box>
				<Box>
					<TextField required id="email" type="email" label="Email" variant="outlined" onChange={emailHandler}/>
				</Box>
				<Box>
					<TextField required id="password" type="password" label="Password" variant="outlined" onChange={passwordHandler}/>
				</Box>
				<Box>
					<TextField required id="passwordConfirm" type="password" label="Confirm Password" variant="outlined" onChange={confirmHandler}/>
				</Box>
				<Box>
					<TextField required id="firstName" type="text" label="First Name" variant="outlined" onChange={firstNameHandler}/>
				</Box>
				<Box>
					<TextField required id="lastName" type="text" label="Last Name" variant="outlined" onChange={lastNameHandler}/>
				</Box>
				<Box>
					<TextField id="phone" type="tel" label="Phone Number" helperText={phoneErr} variant="outlined" onChange={phoneHandler}/>
				</Box>
				<Box>
					<Button variant="contained" type="submit">Create Account</Button>
				</Box>
			</form>
		</Box>
	);

	let progress = (
		<Box>
			<CircularProgress />
		</Box>
	);

	let content = progress;

	if (!loader) {
		content = formcontent;
	}

	return (
		<Container>
			<Grid>
				{content}
			</Grid>
		</Container>
	);
};
