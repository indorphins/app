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

export default function LoginView() {
	const [userName, setUserName] = useState('');
	const [password, setPassword] = useState('');
	const [loader, setLoader] = useState(false);
	const history = useHistory();

	const usernameHandler = (event) => {
		setUserName(event.target.value);
	};

	const passwordHandler = (event) => {
		setPassword(event.target.value);
	};

	const googleSignInFlow = async () => {
		return Firebase.loginWithGoogle()
			.then((user) => {
				console.log(user);
				return Firebase.getToken();
			})
			.then((token) => {
				//signInFlowHelper(token);
				console.log(token);
			});
	};

	const formHandler = async (event) => {
		event.preventDefault();
		setLoader(true);
		Firebase.clearListeners();
		Firebase.signInWithEmailPassword(userName, password)
			.then(() => {
				return User.get();
			})
			.then((user) => {
				return store.dispatch(actions.user.set(user.data))
			})
			.then(() => {
				setLoader(false);
				history.push('/');
			})
			.catch((error) => {
				setLoader(false);
				return log.error('Error firebase signin email pw ', error);
			});
	};

	const loadSignUpForm = () => {
		history.push('/register');
	};

	let formcontent = (
		<Box>
			<form id='login-form' onSubmit={formHandler}>
				<Box>
					<TextField required id="email" type="email" label="Email" variant="outlined" onChange={usernameHandler}/>
				</Box>
				<Box>
					<TextField required id="password" type="password" label="Password" variant="outlined" onChange={passwordHandler}/>
				</Box>
				<Box>
					<Button type="submit" variant="contained">Log In</Button>
				</Box>
			</form>
			<Box>
				<Button onClick={googleSignInFlow}>
					Sign in with Google
				</Button>
				<Button onClick={loadSignUpForm} >
					Create an account
				</Button>
			</Box>
		</Box>
	);

	let progress = (
		<Box>
			<CircularProgress />
		</Box>
	)

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
