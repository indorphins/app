import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import { Grid, TextField, Button, LinearProgress } from '@material-ui/core';
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
    width: 400,
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
  const [bdayErr, setBdayErr] = useState('');
  const [loader, setLoader] = useState(false);

  let content;

  useEffect(() => {

    if (currentUser.id) {
      setUsername(currentUser.username);
      setFirst(currentUser.first_name);
      setLast(currentUser.last_name);

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
        setBday(currentUser.birthday)
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
    setBday(date);
  }

  const bdayFocusHandler = function() {
    setBdayErr(null);
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

    if (bday.toString() === 'Invalid Date') {
      setBdayErr("Invalid Birthday")
      return
    }
    const now = new Date();
    let birthday = new Date(bday);
    if (now.getFullYear() - bday.getFullYear() < 18) {
      setBdayErr("Must be 18 or older")
      return
    }
    birthday = bday.toISOString();

    setLoader(true);

    let userData = {
      username: username,
      first_name: firstname,
      last_name: lastname,
      phone_number: phone,
      photo_url: photoUrl,
      bio: bio,
      birthday: birthday
    };

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

  const formContent = (
    <form onSubmit={formHandler}>
      <Grid container direction="column" spacing={2}>
        <Grid item>
          <TextField className={classes.input} disabled={loader} required autoComplete="username" color="secondary" variant="outlined" type="text" id="username" label="Nickname" value={username} onChange={usernameHandler} />
        </Grid>
        <Grid item>
          <TextField className={classes.input} disabled={loader} required autoComplete="given_name" color="secondary" variant="outlined" type="text" id="first" label="First Name" value={firstname} onChange={firstHandler} />
        </Grid>
        <Grid item>
          <TextField className={classes.input} disabled={loader} required autoComplete="family_name" color="secondary" variant="outlined" type="text" id="last" label="Last Name" value={lastname} onChange={lastHandler} />
        </Grid>
        <Grid item>
          <TextField className={classes.input} disabled={loader} autoComplete="tel" color="secondary" variant="outlined" type="tel" id="phone" label="Phone Number" value={phone} onChange={phoneHandler} />
        </Grid>
        <Grid item>
          <TextField className={classes.input} disabled={loader} autoComplete="tel" color="secondary" variant="outlined" type="text" id="instagram" label="Instagram Handle" value={instagram} onChange={instaHandler} />
        </Grid>
        <Grid item>
          <TextField className={classes.input} disabled={loader} color="secondary" variant="outlined" type="text" id="photo" label="Profile Photo URL" value={photoUrl} onChange={photoHandler} />
        </Grid>
        <Grid item>
          <Birthday classStyle={classes.input} loader={loader} val={bday} focus={bdayFocusHandler} change={birthdayHandler} err={bdayErr} />
        </Grid>
        <Grid item>
          <Editor label="Bio" value={bioContent} onChange={editorHandler} onSave={editorSaveHandler} />
        </Grid>
        {progress}
        <Grid item>
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