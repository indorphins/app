import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import { Grid, TextField, Button, LinearProgress, useMediaQuery } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import * as User from '../../api/user';
import log from '../../log';
import { store, actions } from '../../store';
import Editor from '../editor';
import { Birthday } from '../birthday';

const useStyles = makeStyles((theme) => ({
  btn: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  input: {
    width: "100%",
  }
}));

const getUserSelector = createSelector([state => state.user.data], (user) => {
  return user;
});

export default function () {

  const classes = useStyles();
  const currentUser = useSelector((state) => getUserSelector(state));
  const [username, setUsername] = useState('');
  const [firstname, setFirst] = useState('');
  const [lastname, setLast] = useState('');
  const [phone, setPhone] = useState('');
  const [photoUrl, setPhoto] = useState('');
  const [instagram, setInstagram] = useState('');
  const [bio, setBio] = useState('');
  const [bioContent, setBioContent] = useState('<p></p>');
  const [bday, setBday] = useState(null);
  const [bdayErr, setBdayErr] = useState(null);
  const [loader, setLoader] = useState(false);

  const sm = useMediaQuery('(max-width:600px)');
  const med = useMediaQuery('(max-width:900px)');

  let content;

  useEffect(() => {

    if (currentUser.id) {
      setUsername(currentUser.username);

      if (currentUser.first_name) setFirst(currentUser.first_name);
      
      if (currentUser.last_name) setLast(currentUser.last_name);

      if (currentUser.phone_number) {
        setPhone(currentUser.phone_number);
      }

      if (currentUser.photo_url) {
        setPhoto(currentUser.photo_url);
      }

      if (currentUser.bio) {
        setBioContent(currentUser.bio);
      }

      if (currentUser.social && currentUser.social.instagram) {
        setInstagram(currentUser.social.instagram);
      }

      if (currentUser.birthday) {
        setBday(new Date(currentUser.birthday))
      }
    }

  }, [currentUser]);

  const usernameHandler = function (e) {
    setUsername(e.target.value);
  }

  const firstHandler = function (e) {
    setFirst(e.target.value);
  }

  const lastHandler = function (e) {
    setLast(e.target.value);
  }

  const phoneHandler = function (e) {
    setPhone(e.target.value);
  }

  const photoHandler = function (e) {
    setPhoto(e.target.value);
  }

  const instaHandler = function (e) {
    setInstagram(e.target.value);
  }

  const birthdayHandler = function (date) {
    setBdayErr(null);
    setBday(date);
  }

  const editorHandler = function (e) {
    setBio(e);
  }

  const editorSaveHandler = async function (e) {
    setLoader(true);

    let userData = {
      bio: bio,
    };

    try {
      await User.update(userData);
    } catch (err) {
      // TODO: display error
      return log.error("PROFILE:: update user data", err);
    }

    try {
      await store.dispatch(actions.user.set(userData));
    } catch (err) {
      // TODO: display error
      return log.error("PROFILE:: update redux store", err);
    }

    setLoader(false);
  }

  const formHandler = async function (e) {
    e.preventDefault();

    setLoader(true);

    let userData = {
      username: username,
      first_name: firstname,
      last_name: lastname,
      phone_number: phone,
      photo_url: photoUrl,
      bio: bio,
    };

    if (bday) {
      bday.setUTCHours(0,0,0,0);
      userData.birthday = bday.toISOString();
    } else {
      setLoader(false);
      return setBdayErr("missing");
    }

    if (bio) {
      userData.bio = bio;
    }

    if (!bio && currentUser.bio) {
      userData.bio = currentUser.bio;
    }

    if (instagram) {
      if (!userData.social) userData.social = {};
      let insta = instagram;
      if (instagram.charAt(0) === '@') { insta = instagram.slice(1); }
      userData.social.instagram = insta;
    }

    try {
      await User.update(userData);
    } catch (err) {
      // TODO: display error
      return log.error("PROFILE:: update user data", err);
    }

    try {
      await store.dispatch(actions.user.set(userData));
    } catch (err) {
      // TODO: display error
      return log.error("PROFILE:: update redux store", err);
    }

    setLoader(false);
  }

  let progress = null;

  if (loader) {
    progress = (
      <Grid>
        <LinearProgress color="secondary" />
      </Grid>
    );
  }

  let layout = null;

  if (sm) {
    layout = {
      full: 12,
      half: 12,
      quarter: 12,
    }
  } else if (med) {
    layout = {
      full: 12,
      half: 6,
      quarter: 6,
    }
  } else {
    layout = {
      full: 12,
      half: 6,
      quarter: 4,
    }
  }

  const formContent = (
    <form onSubmit={formHandler}>
      <Grid container direction="row" spacing={2}>
        <Grid item xs={layout.half}>
          <TextField className={classes.input} disabled={loader} required autoComplete="username" color="secondary" variant="outlined" type="text" id="username" label="Nickname" value={username} onChange={usernameHandler} />
        </Grid>
        <Grid item xs={layout.half} style={{padding: 0}}></Grid>
        <Grid item xs={layout.half}>
          <TextField className={classes.input} disabled={loader} autoComplete="given_name" color="secondary" variant="outlined" type="text" id="first" label="First Name" value={firstname} onChange={firstHandler} />
        </Grid>
        <Grid item xs={layout.half}>
          <TextField className={classes.input} disabled={loader} autoComplete="family_name" color="secondary" variant="outlined" type="text" id="last" label="Last Name" value={lastname} onChange={lastHandler} />
        </Grid>
        <Grid item xs={layout.half}>
          <TextField className={classes.input} disabled={loader} required autoComplete="tel" color="secondary" variant="outlined" type="tel" id="phone" label="Phone Number" value={phone} onChange={phoneHandler} />
        </Grid>
        <Grid item xs={layout.half}>
          <TextField className={classes.input} disabled={loader} autoComplete="tel" color="secondary" variant="outlined" type="text" id="instagram" label="Instagram Handle" value={instagram} onChange={instaHandler} />
        </Grid>
        <Grid item xs={layout.full}>
          <TextField className={classes.input} disabled={loader} color="secondary" variant="outlined" type="text" id="photo" label="Profile Photo URL" value={photoUrl} onChange={photoHandler} />
        </Grid>
        <Grid item xs={layout.quarter}>
          <Birthday required={true} loader={loader} date={bday} onChange={birthdayHandler} error={bdayErr} />
        </Grid>
        <Grid item xs={layout.full}>
          <Editor label="Bio" value={bioContent} onChange={editorHandler} onSave={editorSaveHandler} />
          {progress}
        </Grid>
        <Grid item xs={layout.full}>
          <Button className={classes.btn} disabled={loader} variant="contained" color="primary" type="submit">Update</Button>
        </Grid>
      </Grid>
    </form>
  )

  content = formContent;

  return (
    <Grid>
      {content}
    </Grid>
  );
}