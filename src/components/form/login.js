import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Grid, TextField, Button, Link, Typography, LinearProgress } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import { makeStyles } from '@material-ui/core/styles';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';

import * as User from '../../api/user';
import Firebase from '../../Firebase';
import log from '../../log';
import path from '../../routes/path';
import { store, actions } from '../../store';

const getUserSelector = createSelector([state => state.user.data], (user) => {
  return user;
});

const useStyles = makeStyles((theme) => ({
  btnContainer: {
    display: "block",
    width: "100%",
    overflow: "hidden",
  },
  lgnBtn: {
    float: "right",
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  txtField: {
    minWidth: 300,
    width: "100%",
  },
  googBtn: {
    marginTop: theme.spacing(3),
  }
}));

export default function() {
  const currentUser = useSelector((state) => getUserSelector(state))
  const classes = useStyles();
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [loader, setLoader] = useState(false);
  const [loginMode, setLoginMode] = useState(true);
  const [serverErr, setServerErr] = useState(null);
  const [info, setInfo] = useState(null);
  const history = useHistory();

  useEffect(() => {
    if (currentUser.id) {
      history.push(path.home);
    } 
  }, [currentUser]);


  const usernameHandler = (event) => {
    setServerErr(null);
    setUserName(event.target.value);
  };

  const passwordHandler = (event) => {
    setServerErr(null);
    setPassword(event.target.value);
  };

  const googleSignInFlow = async () => {
    return Firebase.loginWithGoogle();
  };

	// TODO: depending on mode do password reset email
  const formHandler = async (event) => {
    event.preventDefault();
    setLoader(true);

    if (loginMode) {
      Firebase.clearListeners();
      Firebase.signInWithEmailPassword(userName, password)
				.then((user) => {
  return User.get();
})
				.then((user) => {
  return store.dispatch(actions.user.set(user.data))
})
				.then(() => {
  setLoader(false);
  history.push(path.home);
})
				.catch((error) => {
  setLoader(false);

  if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
    setServerErr("Incorrect email or password")
  } else {
    setServerErr(error.message);
  }

  return log.error('Error firebase signin email pw ', error);
});
    } else {
      Firebase.sendPasswordResetEmail(userName).then(result => {
        setLoader(false);
        setUserName('');
        setInfo("Password reset email sent");
      }).catch(err => {
        setLoader(false);
        setServerErr(err.message);
      });
    }
  };

  let submitText;
  let linkText;
  let fields;

  if (loginMode) {
    submitText = "Log in";
    linkText =  "Forgot your password?";
    fields = (
      <Grid>
        <TextField
      disabled={loader}
      color="secondary"
      value={password}
      autoComplete="current-password"
      className={classes.txtField}
      required
      id="password"
      type="password"
      label="Password"
      variant="outlined"
      onChange={passwordHandler}
        />
      </Grid>
		);
  } else {
    submitText = "Send Reset"
    linkText =  "Cancel";
    fields = null;
  }

  const switchMode = function() {
    setServerErr(null);
    setInfo(null);
    if (loginMode) {
      setLoginMode(false);
    } else {
      setLoginMode(true);
    }
  };

  const loadSignUpForm = () => {
    history.push(path.signup);
  };

  let errContent;

  if (serverErr) {
    errContent = (
      <Alert severity="error" className={classes.txtField}>{serverErr}</Alert>
		)
  }


  let progress = null;

  if (loader) {
    progress = (
      <LinearProgress color="secondary" />
		)
  }

  let infoContent = null;
  if (info) {
    infoContent = (
      <Grid>
        <Alert severity="info">{info}</Alert>
      </Grid>
		)
  }

  let formcontent = (
    <Grid>
      {infoContent}
      <Grid>
        {errContent}
      </Grid>
      <form id='login-form' onSubmit={formHandler}>
        <input autoComplete="username" id="_email" type="hidden" value={userName} />
        <input autoComplete="current-password" id="_password" type="hidden" value={password} />
        <Grid container direction="column" spacing={2}>
          <Grid item>
            <TextField
            disabled={loader}
            autoFocus={true}
            color="secondary"
            value={userName}
            autoComplete="username"
            className={classes.txtField}
            required
            id="email"
            type="email"
            label="Email"
            variant="outlined"
            onChange={usernameHandler}
            />
          </Grid>
          <Grid item>
            {fields}
            {progress}
          </Grid>
          <Grid item className={classes.btnContainer}>
            <Button
            disabled={loader}
            className={classes.lgnBtn}
            color="primary"
            type="submit"
            variant="contained"
            >
              {submitText}
            </Button>
          </Grid>
        </Grid>
      </form>
      <Grid container direction="row" justify="space-between">
        <Grid item>
          <Typography>
            <Link color="secondary" onClick={loadSignUpForm}>Need an account?</Link>
          </Typography>
        </Grid>
        <Grid item>
          <Typography>
            <Link color="secondary" onClick={switchMode}>{linkText}</Link>
          </Typography>
        </Grid>
      </Grid>
      <Grid container direction="row" justify="center">
        <Grid item>
          <Button color="inherit" disableElevation className={classes.googBtn} onClick={googleSignInFlow}>
            Sign in with Google
          </Button>
        </Grid>
      </Grid>
    </Grid>
	);

  return formcontent;
}
