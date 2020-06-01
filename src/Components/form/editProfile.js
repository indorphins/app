import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';

import * as User from '../../api/user';
import log from '../../log';
import { store, actions } from '../../store';
import Editor from '../editor';


const getUserSelector = createSelector([state => state.user.data], (user) => {
  return user;
});

export default function() {

  const currentUser = useSelector((state) => getUserSelector(state));
  const [username, setUsername] = useState('');
  const [firstname, setFirst] = useState('');
  const [lastname, setLast] = useState('');
  const [phone, setPhone] = useState('');
  const [photoUrl, setPhoto] = useState('');
  const [bio, setBio] = useState('');
  const [loader, setLoader] = useState(false);
  const [bioContent, setBioContent] = useState('<p></p>');

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
    }

  }, [currentUser])
  

  const usernameHandler = function(e) {
    setUsername(e.target.value);
  }

  const firstHandler = function(e) {
    setFirst(e.target.value);
  }

  const lastHandler = function(e) {
    setLast(e.target.value);
  }

  const phoneHandler = function(e) {
    setPhone(e.target.value);
  }

  const photoHandler = function(e) {
    setPhoto(e.target.value);
  }

  const editorHandler = function(e) {
    setBio(e);
  }

  const formHandler = async function(e) {
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

    try {
      await User.update(userData);
    } catch(err) {
      // TODO: display error
      return log.error("PROFILE:: update user data", err);
    }

    try {
      await store.dispatch(actions.user.set(userData));
    } catch(err) {
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

  return (
    <Grid>
      <form onSubmit={formHandler}>
        <Grid>
          <TextField disabled={loader} required autoComplete="username" color="secondary" variant="outlined" type="text" id="username" label="Nickname" value={username} onChange={usernameHandler} />
        </Grid>
        <Grid>
          <TextField disabled={loader} required autoComplete="given_name" color="secondary" variant="outlined" type="text" id="first" label="First Name" value={firstname} onChange={firstHandler} />
        </Grid>
        <Grid>
          <TextField disabled={loader} required autoComplete="family_name" color="secondary" variant="outlined" type="text" id="last" label="Last Name" value={lastname} onChange={lastHandler} />
        </Grid>
        <Grid>
          <TextField disabled={loader} autoComplete="tel" color="secondary" variant="outlined" type="tel" id="phone" label="Phone Number" value={phone} onChange={phoneHandler} />
        </Grid>
        <Grid>
          <TextField disabled={loader} color="secondary" variant="outlined" type="text" id="photo" label="Profile Photo URL" value={photoUrl} onChange={photoHandler} />
        </Grid>
        <Grid>
          <Editor label="Bio:" value={bioContent} onChange={editorHandler} />
        </Grid>
        {progress}
        <Grid>
          <Button disabled={loader} variant="contained" color="primary" type="submit">Update</Button>
        </Grid>
      </form>
    </Grid>
  );
}