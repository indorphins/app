import React, { useState, useEffect, Fragment } from 'react';
import { useHistory } from 'react-router-dom';
import { Divider, Grid, TextField, Button, Link, Typography, LinearProgress } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import { makeStyles } from '@material-ui/core/styles';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';

import * as User from '../../api/user';
import Firebase from '../../Firebase';
import log from '../../log';
import path from '../../routes/path';
import { store, actions } from '../../store';
import GoogleIcon from '../icon/google';
import AppleIcon from '../icon/apple';

const getUserSelector = createSelector([state => state.user.data], (user) => {
  return user;
});

const useStyles = makeStyles((theme) => ({
  container: {
    color: theme.palette.common.white,
  },
  btnContainer: {
    display: "block",
    overflow: "hidden",
  },
  lgnBtn: {
    width: '100%',
    marginBottom: theme.spacing(2),
    color: theme.palette.secondaryColor.contrastText,
    backgroundColor: theme.palette.secondaryColor.main,
    "&:hover": {
      color: theme.palette.primary.contrastText,
      backgroundColor: theme.palette.primary.main,
    }
  },
  medBtn: {
    color: theme.palette.primaryColor.contrastText,
    backgroundColor: theme.palette.primaryColor.main,
    "&:hover": {
      color: theme.palette.primary.contrastText,
      backgroundColor: theme.palette.primary.main,
    }
  },
  txtField: {
    minWidth: 300,
    width: "100%",
  },
  text: {
    color: theme.palette.primary.main
  },
  googBtn: {
    cursor: 'pointer',
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.primary.main,
    width: '100%',
    borderRadius: 5,
    boxShadow: `0 0 4px -1px ${theme.palette.grey[500]}`,
    "&:hover": { 
      backgroundColor: theme.palette.grey[300],
    }
  },
  googIcon: {
    paddingRight: theme.spacing(2),
    marginTop: 3
  },
  appleBtn: {
    cursor: 'pointer',
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    width: '100%',
    borderRadius: 5,
    boxShadow: `0 0 4px -1px ${theme.palette.grey[500]}`,
    "&:hover": { 
      backgroundColor: theme.palette.grey[300],
      color: theme.palette.secondary.contrastText,
    }
  },
  appleIcon: {
    fill: theme.palette.primary.contrastText,
    /*"&:hover": { 
      fill: theme.palette.secondary.contrastText,
    }*/
  }
}));

export default function Login(props) {
  const currentUser = useSelector((state) => getUserSelector(state))
  const classes = useStyles();
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [loader, setLoader] = useState(false);
  const [loginMode, setLoginMode] = useState(true);
  const [serverErr, setServerErr] = useState(null);
  const [info, setInfo] = useState(null);
  const [redirectUrl, setRedirectUrl] = useState(null);
  const history = useHistory();

  useEffect(() => {
    if (currentUser.id) {
      if (redirectUrl) {
        log.debug('LOGIN:: redirect to', redirectUrl);
        history.push(redirectUrl);
      } else {
        log.debug('LOGIN:: redirect to home', path.home);
        history.push(path.home);
      }
    } 
  }, [currentUser, redirectUrl]);

  useEffect(() => {
    if (props.query && props.query.redirect && !redirectUrl) {
      log.debug("LOGIN:: set redirect URL", props.query.redirect);
      setRedirectUrl(props.query.redirect);
    }
  }, [props, redirectUrl]);

  useEffect(() => {
    setLoader(true);
    Firebase.getRedirectResult().then((result) => {
      if (result.user) {
        return User.get();
      }

      return null;
    }).then((user) => {
      if (user && user.data) store.dispatch(actions.user.set(user.data))
      setLoader(false);
    })
    .catch((error) => {
      setLoader(false);
      return log.error('Error firebase signin email pw ', error);
    });
  }, [])


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

  const appleSignInFlow = async () => {
    return Firebase.loginWithApple();
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
        if (redirectUrl) {
          log.debug('LOGIN:: redirect to', redirectUrl);
          history.push(redirectUrl);
        } else {
          log.debug('LOGIN:: redirect to home', path.home);
          history.push(path.home);
        }
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
      value={password}
      autoComplete="current-password"
      className={classes.txtField}
      required
      id="password"
      type="password"
      variant="outlined"
      label='Password'
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
    if (redirectUrl) {
      history.push(path.signup + "?redirect=" + redirectUrl);
    } else {
      history.push(path.signup);
    }
  };

  let errContent;

  if (serverErr) {
    errContent = (
      <Grid item>
        <Alert severity="error" className={classes.txtField}>{serverErr}</Alert>
      </Grid>
		)
  }


  let progress = null;

  if (loader) {
    progress = (
      <LinearProgress color="primary" />
		)
  }

  let infoContent = null;
  if (info) {
    infoContent = (
      <Grid item>
        <Alert severity="info">{info}</Alert>
      </Grid>
		)
  }

  let createAcctContent = null;
  if (loginMode) {
    createAcctContent = (
      <Grid item>
        <Button
          disabled={loader}
          className={classes.medBtn}
          onClick={loadSignUpForm}
          type="submit"
          variant="contained"
          color="primary"
        >
          Create New Account
        </Button>
      </Grid>
    )
  }

  let googleContent;
  if (loginMode) {
    googleContent = (
      <Fragment>
        <Grid container justify='center'>
          <Grid item>
            <Typography className={classes.text} variant='body1'>or</Typography>
          </Grid>
        </Grid>
        <Grid item>
          <Grid container direciton="row" justify="center"
            alignItems='center' className={classes.googBtn} onClick={googleSignInFlow}
          >
            <Grid item className={classes.googIcon}>
              <GoogleIcon />
            </Grid>
            <Grid item>
              <Typography variant='button'>Sign in with Google</Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid item>
          <Grid container direciton="row" justify="center" 
            alignItems='center' className={classes.appleBtn} onClick={appleSignInFlow}
          >
            <Grid item className={classes.googIcon}>
              <AppleIcon className={classes.appleIcon} />
            </Grid>
            <Grid item>
              <Typography variant='button'>Sign in with Apple</Typography>
            </Grid>
          </Grid>
        </Grid>
      </Fragment>
    )
  }

  let formcontent = (
    <Grid className={classes.container}>
      <form id='login-form' onSubmit={formHandler}>
        <input autoComplete="username" id="_email" type="hidden" value={userName} />
        <input autoComplete="current-password" id="_password" type="hidden" value={password} />
        <Grid container direction="column" spacing={2}>
          {infoContent}
          {errContent}
          <Grid item>
            <TextField
            disabled={loader}
            autoFocus={true}
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
              type="submit"
              variant="contained"
              color="primary"
            >
              {submitText}
            </Button>
          </Grid>
          {googleContent}
        </Grid>
      </form>
      <Divider style={{margin: "16px 0px"}} />
      <Grid container direction="column" alignItems='center' justify="center" spacing={2}> 
        {createAcctContent}
        <Grid item>
          <Typography>
            <Link color="secondary" className={classes.text} onClick={switchMode}>{linkText}</Link>
          </Typography>
        </Grid>
      </Grid>
    </Grid>
	);

  return formcontent;
}
