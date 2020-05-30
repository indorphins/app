import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import { makeStyles } from '@material-ui/core/styles';

import * as User from '../../api/user';
import Firebase from '../../Firebase';
import log from '../../log';
import { store, actions } from '../../store';

const useStyles = makeStyles((theme) => ({
	txtField: {
		width: 400,
	},
}));

export default function(props) {
  const classes = useStyles();
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
  
  let tooltips = {
    username: "The nickname you want to appear to other class participants. It can be changed at any time in your profile. (Required)",
    phone: "Not required but can be used for class notifications."
  }

	let formcontent = (
		<Box>
			<form onSubmit={formHandler}>
				<Box>
					<TextField color="secondary" className={classes.txtField} title={tooltips.username} required id="username" type="text" label="Nickname" variant="outlined" onChange={usernameHandler}/>
				</Box>
				<Box>
					<TextField color="secondary" className={classes.txtField} required id="email" type="email" label="Email" variant="outlined" onChange={emailHandler}/>
				</Box>
				<Box>
					<TextField color="secondary" className={classes.txtField} required id="password" type="password" label="Password" variant="outlined" onChange={passwordHandler}/>
				</Box>
				<Box>
					<TextField color="secondary" className={classes.txtField} required id="passwordConfirm" type="password" label="Confirm Password" variant="outlined" onChange={confirmHandler}/>
				</Box>
				<Box>
					<TextField color="secondary" className={classes.txtField} required id="firstName" type="text" label="First Name" variant="outlined" onChange={firstNameHandler}/>
				</Box>
				<Box>
					<TextField color="secondary" className={classes.txtField} required id="lastName" type="text" label="Last Name" variant="outlined" onChange={lastNameHandler}/>
				</Box>
				<Box>
					<TextField color="secondary" className={classes.txtField} title={tooltips.phone} id="phone" type="tel" label="Phone Number" helperText={phoneErr} variant="outlined" onChange={phoneHandler}/>
				</Box>
				<Box>
					<Button variant="contained" type="submit" color="primary">Create</Button>
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
		<Box>
			{content}
		</Box>
	);
};
