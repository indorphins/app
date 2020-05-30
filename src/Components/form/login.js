import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import { makeStyles } from '@material-ui/core/styles';

import * as User from '../../api/user';
import Firebase from '../../Firebase';
import log from '../../log';

import { store, actions } from '../../store';

const useStyles = makeStyles((theme) => ({
  googBtn: {
    '&:hover': {
      backgroundColor: theme.palette.secondary.main,
    }
	},
  btnContainer: {
    display: "block",
    width: "100%",
    overflow: "hidden",
  },
  lgnBtn: {
    float: "right",
	},
	txtField: {
		width: 350,
	},
}));

export default function() {
	const classes = useStyles();
	const [userName, setUserName] = useState('');
	const [password, setPassword] = useState('');
	const [loader, setLoader] = useState(false);
	const [loginMode, setLoginMode] = useState(true);
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

	let submitText;
	let linkText;
	let fields;

	if (loginMode) {
		submitText = "Log in";
		linkText =  "Forgot your password?";
		fields = (
			<Box>
				<Box>
					<TextField color="secondary" className={classes.txtField} required id="email" type="email" label="Email" variant="outlined" onChange={usernameHandler}/>
				</Box>
				<Box>
					<TextField color="secondary" className={classes.txtField} required id="password" type="password" label="Password" variant="outlined" onChange={passwordHandler}/>
				</Box>
			</Box>
		);
	} else {
		submitText = "Send Reset"
		linkText =  "Cancel";
		fields = (
			<Box>
				<Box>
					<TextField color="secondary" className={classes.txtField} required id="email" type="email" label="Email" variant="outlined" onChange={usernameHandler}/>
				</Box>
			</Box>
		);
	}

	const switchMode = function() {
		if (loginMode) {
			setLoginMode(false);
		} else {
			setLoginMode(true);
		}
	};

	const loadSignUpForm = () => {
		history.push('/register');
	};

	

	let formcontent = (
		<Box>
			<form id='login-form' onSubmit={formHandler}>
				{fields}
				<Box className={classes.btnContainer}>
					<Button className={classes.lgnBtn} color="primary" type="submit" variant="contained">{submitText}</Button>
				</Box>
			</form>
			<Box>
				<Typography>
					<Link color="secondary" onClick={loadSignUpForm}>Need an account?</Link>
				</Typography>
				<Typography>
					<Link color="secondary" onClick={switchMode}>{linkText}</Link>
				</Typography>
			</Box>
			<Box>
				<Button color="primary" disableElevation className={classes.googBtn} onClick={googleSignInFlow}>
					Sign in with Google
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
    <Box>
			{content}
    </Box>
	);
};
