import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { TextField, Button, LinearProgress, Grid, Checkbox, Typography } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import { makeStyles } from '@material-ui/core/styles';

import * as User from '../../api/user';
import Firebase from '../../Firebase';
import log from '../../log';
import path from '../../routes/path';
import { store, actions } from '../../store';
import { Birthday } from '../birthday';

const useStyles = makeStyles((theme) => ({
  txtField: {
    width: "100%",
  },
  submitBtn: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    width: '100%',
    borderRadius: 5,
    color: theme.palette.primaryColor.contrastText,
    backgroundColor: theme.palette.primaryColor.main,
    "&:hover": {
      color: theme.palette.primary.contrastText,
      backgroundColor: theme.palette.primary.main,
    }
  },
  consentContainer: {
    flexWrap: "nowrap",
    paddingTop: theme.spacing(2),
    fontStyle: "italic",
    fontSize: "0.9rem"
  },
  consentCheck: {
    paddingRight: theme.spacing(1),
    paddingLeft: theme.spacing(0),
    color: theme.palette.secondary.color
  },
  box: {
    marginTop: theme.spacing(2),
    width: "100%",
    border: "1px solid",
    borderColor: theme.palette.secondary.main,
    borderRadius: '4px'
  },
  bdayInput: {
    width: '100%',
  }
}));

export default function(props) {
  const classes = useStyles();
  const [username, setUsername] = useState(null);
  // const [firstName, setFirstName] = useState(null);
  // const [lastName, setLastName] = useState(null);
  const [email, setEmail] = useState(null);
  const [password, setPassword] = useState(null);
  const [passwordErr, setPasswordErr] = useState(null);
  const [passwordConfirm, setConfirm] = useState(null);
  const [passwordConfirmErr, setConfirmErr] = useState(null);
  const [phone, setPhone] = useState(null);
  const [phoneErr, setPhoneErr] = useState(null);
  const [loader, setLoader] = useState(false);
  const [userConsent, setUserConsent] = useState(false)
  const [birthday, setBirthday] = useState(null);
  const [bdayErr, setBdayErr] = useState(null);
  const [serverErr, setServerErr] = useState(null);
  const [redirectUrl, setRedirectUrl] = useState(null);
  const history = useHistory();
  const rx = /^1?[-|\s]?\(?(\d{3})?\)?[-|\s]?(\d{3})[-|\s]?(\d{4})/gm;

  useEffect(() => {
    if (props.query && props.query.redirect && !redirectUrl) {
      log.debug("LOGIN:: set redirect URL", props.query.redirect);
      setRedirectUrl(props.query.redirect);
    }
  }, [props, redirectUrl]);

  const usernameHandler = (event) => {
    setUsername(event.target.value);
  };

  // const firstNameHandler = (event) => {
  //   setFirstName(event.target.value);
  // };

  // const lastNameHandler = (event) => {
  //   setLastName(event.target.value);
  // };

  const emailHandler = (event) => {
    setEmail(event.target.value);
  };

  const passwordHandler = (event) => {
    setConfirmErr(null);
    setPasswordErr(null);
    setPassword(event.target.value);
  };

  const confirmHandler = (event) => {
    setConfirmErr(null);
    setConfirm(event.target.value);
  };

  const phoneHandler = (event) => {
    setPhoneErr(null);
    setPhone(event.target.value);
  };
  
  const consentHandler = () => {
    setUserConsent(!userConsent);
  }

  const birthdayHandler = (date) =>{
    setBdayErr(null);
    setBirthday(date)
  }

  const validatePhone = function() {
	
    if (!phone) {
      return;
    }
		
    rx.lastIndex = 0;
    let match = rx.exec(phone);

    log.debug("CREATE ACCOUNT:: phone validation regex result", match);

    if (!match) {
      setPhoneErr("Invalid phone number");
      throw Error('e');
    }

    if (match.length < 4) {
      setPhoneErr("Invalid phone number");
      throw Error('e');
    }

    if (!match[1]) {
      setPhoneErr("Missing area code");
      throw Error('e');
    }

    return match;
  }

  const validatePassword = function() {

    if (password.length < 6 || passwordConfirm.length < 6) {
      if (password.length < 6) {
        setPasswordErr("6 characters or more required");
      }

      if (passwordConfirm.length < 6) {
        setConfirmErr("6 characters or more required");
      }

      throw Error('e');
    }

    if (password !== passwordConfirm) {
      setConfirmErr("Password values do not match");
      throw Error('e');
    }
  }

  const formHandler = async (event) => {
    event.preventDefault();

    let errs = [];
    try {
      validatePassword();
    } catch(e) {
      errs.push(e);
    }

    let phoneParts;
    let pn = phone;

    try {
      phoneParts = validatePhone();
    } catch(e) {
      errs.push(e);
    }

    if (errs.length > 0) {
      return;
    }

    if (phoneParts) {
      log.debug("CREATE ACCOUNT:: got phone number match", phoneParts);
      pn = phoneParts[1] + phoneParts[2] + phoneParts[3];
    }
    

    let bday = null;
    if (birthday) {
      bday = birthday.toISOString();
    } else {
      return setBdayErr("missing");
    }

    setLoader(true);
    Firebase.clearListeners();
    let user;

    try {
      await Firebase.createAccount(email, password);
    } catch(err) {
      setLoader(false);
      log.error("AUTH:: firebase account create", err);

      if (err.code === "auth/email-already-in-use") {

        return setServerErr({
          severity: "error",
          message: `An account already exists with this email address. If you used 'Sign in with Google' to 
          create your account please use that same option to login to your account, or use the forgot 
          password link to reset/generate the Indoorphins.fit password`,
        });

      } else {
        return setServerErr({
          severity: "error",
          message: err.message,
        });
      }
    }

    log.debug("AUTH:: created new firebase account for user");

    const firstName = null
    const lastName = null;
    
    try {
      user = await User.create( 
        username, 
        firstName, 
        lastName,
        email,
        pn,
        bday
      )
    } catch(err) {
			// TODO: display this error the user?
      setLoader(false);
      log.warn("AUTH:: error creating user account from firebase token", err);

      return setServerErr({
        severity: "error",
        message: err.message,
      });
    }
		
    log.debug("AUTH:: created new user", user);

    await store.dispatch(actions.user.set(user.data));

    setLoader(false);

    if (redirectUrl) {
      history.push(path.home + "?redirect=" + redirectUrl);
    } else {
      history.push(path.home);
    }
  };
  
  let tooltips = {
    username: `The nickname you want to appear to other class participants. 
    It can be changed at any time in your profile.`,
    phone: "US numbers only. Area code and 7 digit number."
  }
	
  let phoneField = (
    <TextField 
			color="primary" 
			required
			disabled={loader} 
			className={classes.txtField} 
			title={tooltips.phone} 
			id="phone" 
			type="tel" 
			label="Phone Number" 
			variant="outlined" 
			autoComplete="tel" 
			onChange={phoneHandler}
    />
	);
  if (phoneErr) {
    phoneField = (
      <TextField 
				error
				required
				color="primary" 
				disabled={loader} 
				className={classes.txtField} 
				title={tooltips.phone} 
				id="phone" 
				type="tel" 
				label="Phone Number" 
				helperText={phoneErr} 
				variant="outlined" 
				autoComplete="tel" 
				onChange={phoneHandler}
      />
		);
  }

  let passwordField = (
    <TextField 
			color="primary" 
			disabled={loader} 
			className={classes.txtField} 
			required id="password" 
			type="password" 
			label="Password" 
			variant="outlined" 
			autoComplete="new-password"
			onChange={passwordHandler}
    />
	);

  if (passwordErr) {
    passwordField = (
      <TextField 
				error
				color="primary"
				disabled={loader}
				className={classes.txtField} 
				required id="password"
				type="password" 
				label="Password" 
				variant="outlined"
				autoComplete="new-password"
				helperText={passwordErr} 
				onChange={passwordHandler}
      />
		);
  }

  let passwordConfirmField = (
    <TextField 
			color="primary" 
			disabled={loader} 
			className={classes.txtField} 
			required id="passwordConfirm" 
			type="password" 
			label="Confirm Password" 
			variant="outlined" 
			autoComplete="new-password"
			onChange={confirmHandler}
    />
	);

  if (passwordConfirmErr) {
    passwordConfirmField = (
      <TextField 
				error
				color="primary" 
				disabled={loader} 
				className={classes.txtField} 
				required id="passwordConfirm" 
				type="password" 
				label="Confirm Password" 
				variant="outlined" 
				autoComplete="new-password" 
				helperText={passwordConfirmErr} 
				onChange={confirmHandler}
      />
		);
  }

  let progress = null;

  if (loader) {
    progress = (
      <LinearProgress color="secondary" />
		);
  }

  let infoContent = null;
  if (serverErr) {
    infoContent = (
      <Grid item>
        <Alert severity={serverErr.severity}>{serverErr.message}</Alert>
      </Grid>
		)
  }

  let formcontent = (
    <form onSubmit={formHandler}>
      <Grid container direction="column" spacing={2}>
        {infoContent}
        <Grid item>
          <TextField
          disabled={loader}
          autoFocus={true}
          color="primary"
          autoComplete="nickname" 
          className={classes.txtField}
          title={tooltips.username}
          required id="username"
          type="text"
          label="Preferred Name"
          variant="outlined"
          onChange={usernameHandler}
          />
        </Grid>
        <Grid item>
          <TextField
          disabled={loader}
          color="primary"
          autoComplete="username"
          className={classes.txtField}
          required
          id="email"
          type="email"
          label="Email"
          variant="outlined"
          onChange={emailHandler}
          />
        </Grid>
        <Grid item>
          {passwordField}
        </Grid>
        <Grid item>
          {passwordConfirmField}
        </Grid>
        {/* <Grid item>
          <TextField
          disabled={loader}
          color="primary"
          autoComplete="given-name"
          className={classes.txtField}
          id="firstName"
          type="text"
          label="First Name"
          variant="outlined"
          onChange={firstNameHandler}
          />
        </Grid>
        <Grid item>
          <TextField
          disabled={loader}
          color="primary"
          autoComplete="family-name"
          className={classes.txtField}
          id="lastName"
          type="text"
          label="Last Name"
          variant="outlined"
          onChange={lastNameHandler}
          />
        </Grid> */}
        <Grid item>
          {phoneField}
        </Grid>
        <Grid item>
          <Birthday required={true} loader={loader} val={birthday} onChange={birthdayHandler} error={bdayErr} />
        </Grid>
        <Grid container direction='row' alignItems='center' className={classes.consentContainer}>
          <Checkbox color='primary' checked={userConsent} onChange={consentHandler} className={classes.consentCheck} />
          <Typography variant='body2'>
            <span>By signing in or signing up, I agree to Indoorphins.fit&apos;s </span>
            <span><a className={classes.link} href="/TOS.html" target="_blank">Terms of Service</a> and </span>
            <span><a className={classes.link} href="/PP.html" target="_blank">Privacy Policy</a>, </span>
            <span>confirm that I am 18 years of age or older, and consent to receiving email and sms </span>
            <span>communication.</span>
          </Typography>
        </Grid>
        {progress}
        <Grid item>
          <Button
          disabled={!userConsent}
          variant="contained"
          type="submit"
          color="primary"
          className={classes.submitBtn}
          >
            Create Account
          </Button>
        </Grid>
      </Grid>
    </form>
	);

  return formcontent
}
