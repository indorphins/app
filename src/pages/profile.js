import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { Button, Container, Divider, Grid, CircularProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/core';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';

import ProfileEdit from '../components/form/editProfile';
import UserData from '../components/userData';
import * as Instructor from '../api/instructor';
import log from '../log';
import path from '../routes/path';

const useStyles = makeStyles((theme) => ({
  divider: {
    margin: theme.spacing(2),
  },
  btn: {
    marginBottom: theme.spacing(2),
  },
  loader: {
    minHeight: 300,
  }
}));

const getUserSelector = createSelector([state => state.user.data], (user) => {
  return user;
});

export default function() {

  const history = useHistory();
  const classes = useStyles();
  const currentUser = useSelector(state => getUserSelector(state));
  const params = useParams();
  const [photo, setPhoto] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [insta, setInsta] = useState('');
  const [bio, setBio] = useState('');
  const [loader, setLoader] = useState(true);
  const [editButton, setEditButton] = useState(false);
  const [editForm, setEditForm] = useState(false);

  useEffect(() => {

    async function getInstructor(id) {
      let instructor;

      try {
        instructor = await Instructor.get(id);
      } catch(err) {
        // redirect to user's profile
        log.error("PROFILE::", err);
        history.push(path.profile);

      }

      if (!instructor || !instructor.data) {
        // redirect to user's profile
        history.push(path.profile);
      }
      
      if (instructor && instructor.data) {
        setUsername(instructor.data.username);
        setEmail(instructor.data.email);
        setFirstName(instructor.data.first_name);
        setLastName(instructor.data.last_name);
        setPhoto(instructor.data.photo_url);
        setPhone(instructor.data.phone_number)
        setBio(instructor.data.bio);
        if (instructor.data.social && instructor.data.social.instagram) setInsta(instructor.data.social.instagram);
        setLoader(false);
      }
    }

    if (params.id) {
      getInstructor(params.id);
      return;
    }
    
    if (currentUser.id) {
      setUsername(currentUser.username);
      setEmail(currentUser.email);
      setFirstName(currentUser.first_name);
      setLastName(currentUser.last_name);
      setPhoto(currentUser.photo_url);
      setPhone(currentUser.phone_number)
      setBio(currentUser.bio);
      if (currentUser.social && currentUser.social.instagram) setInsta(currentUser.social.instagram);
      setLoader(false);
    } else {
      history.push(path.login);
    }
  }, [currentUser, params]);

  useEffect(() => {
    if (currentUser.id === params.id || !params.id)  {
      setEditButton(true);
    } else {
      setEditButton(false);
    }
  }, [currentUser.id, params.id])

  const toggleEditForm = function() {
    if (editForm) {
      setEditForm(false);
    } else {
      setEditForm(true);
    }
  }

  let editContent = null;
  let editButtonContent = null;
  let loaderContent = (
    <Grid container direction="row" justify="center" alignItems="center" className={classes.loader}>
      <CircularProgress color="secondary" />
    </Grid>
  );

  if (editButton) {
    editButtonContent = (
      <Grid container direction="row" justify="flex-end">
        <Grid item>
          <Button className={classes.btn} variant="contained" color="secondary" onClick={toggleEditForm}>Edit</Button>
        </Grid>
      </Grid>
    );
  }

  if (editForm) {
    editContent = (
      <Grid>
        {editButtonContent}
        <ProfileEdit />
        <Divider className={classes.divider} />
      </Grid>
    );
  }

  let userContent = (
    <Grid>
      {editButtonContent}
      <UserData header={username} email={email} photo={photo} phone={phone} firstName={firstName} lastName={lastName} bio={bio} instagram={insta} />
      <Divider className={classes.divider} />
    </Grid>
  );

  let content = loaderContent;

  if (!loader) {
    content = userContent;

    if (editForm) {
      content = editContent;
    }
  }

  return (
    <Container>
      {content}
    </Container>
  );
};