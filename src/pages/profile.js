import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { Container, Grid, CircularProgress, Fab } from '@material-ui/core';
import { Create, Clear } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';

import CourseSchedule from '../components/courseSchedule';
import ProfileEdit from '../components/form/editProfile';
import UserData from '../components/userData';
import * as Instructor from '../api/instructor';
import * as Course from '../api/course';
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
  },
  extendedBtn: {
    marginRight: theme.spacing(1),
  },
  fab: {
    fontWeight: "bold",
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
  const [courses, setCourses] = useState([]);
  const [editButton, setEditButton] = useState(false);
  const [editForm, setEditForm] = useState(false);


  async function getInstructor(id) {
    let instructor;

    try {
      instructor = await Instructor.get(id);
    } catch(err) {
      // redirect to user's profile
      log.error("PROFILE::", err);
      history.push(path.profile);
      return;

    }

    if (!instructor || !instructor.data) {
      // redirect to user's profile
      history.push(path.profile);
      return;
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
      getInstructorSchedule(instructor.data._id);
    }
  }

  async function getSchedule(filter) {
    let result;

    try {
      result = await Course.query(filter, {}, 500);
    } catch(err) {
      throw err;
    }

    log.debug("PROFILE:: course schedule result", result);

    if (result && result.data) {
      setCourses(result.data);
    }
  }

  async function getUserSchedule(userId, mongoId) {
    let now = new Date();
    now.setHours(now.getHours() - 24);
    let schedFilter = {
      '$and': [
        {'$or': [
          {instructor: mongoId},
          {participants: { $elemMatch: { id: userId }}},
        ]},
        {'$or': [ 
          { start_date: {"$gte" : now.toISOString() }},
          { recurring: { '$exists': true }}
        ]},
      ],
      start_date: { '$exists': true },
    };

    log.debug("PROFILE:: user schedule filter", schedFilter);

    return getSchedule(schedFilter);
  }

  async function getInstructorSchedule(mongoId) {
    let now = new Date();
    now.setHours(now.getHours() - 24);
    let schedFilter = { 
      instructor: mongoId,
      '$or': [ 
          { start_date: {"$gte" : now.toISOString() }},
          { recurring: { '$exists': true }}
      ],
      start_date: { '$exists': true },
    };

    return getSchedule(schedFilter);
  } 

  useEffect(() => {
    
    setCourses([]);

    if (params.id) {
      getInstructor(params.id);

    } else {
      
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
        getUserSchedule(currentUser.id, currentUser._id);
        return;
      }

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
    let btn = (
      <Fab color="secondary" aria-label="edit profile" className={classes.fab} onClick={toggleEditForm}>
        <Create />
      </Fab>
    );

    if (editForm) {
      btn = (
        <Fab color="primary" aria-label="cancel" onClick={toggleEditForm} className={classes.fab}>
          <Clear />
        </Fab>
      )
    }

    editButtonContent = (
      <Grid  container direction="row" justify="flex-end" alignItems="center">
        {btn}
      </Grid>
    )
  }

  if (editForm) {
    editContent = (
      <Grid>
        {editButtonContent}
        <ProfileEdit />
      </Grid>
    );
  }

  let userContent = (
    <Grid container direction="column" spacing={2}>
      <Grid item>
        {editButtonContent}
      </Grid>
      <Grid item>
        <UserData header={username} email={email} photo={photo} phone={phone} firstName={firstName} lastName={lastName} bio={bio} instagram={insta} showContactInfo={true} />
      </Grid>
      <Grid item>
        <CourseSchedule course={courses} view="month" />
      </Grid>
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