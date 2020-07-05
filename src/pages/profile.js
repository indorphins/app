import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { Container, Divider, Grid, CircularProgress, Fab } from '@material-ui/core';
import { Create, Clear, AccountBalanceOutlined } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';

import CourseSchedule from '../components/courseSchedule';
import ProfileEdit from '../components/form/editProfile';
import UserData from '../components/userData';
import * as Instructor from '../api/instructor';
import * as Course from '../api/course';
import * as Stripe from '../api/stripe';
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
    marginLeft: theme.spacing(2),
    marginBottom: theme.spacing(2),
  }
}));

const getUserSelector = createSelector([state => state.user.data], (user) => {
  return user;
});

export default function () {

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
  const [coursesLabel, setCoursesLabel] = useState("Class Schedule");
  const [editButton, setEditButton] = useState(false);
  const [editForm, setEditForm] = useState(false);
  const [pMethod, setPMethod] = useState();
  const [createStripe, setCreateStripe] = useState(false);

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

        setCoursesLabel("Your Schedule");
        if (currentUser.type === 'instructor') {
          getInstructorSchedule(currentUser._id);
        } else {
          getUserSchedule(currentUser.id);
        }
        return;
      }

      history.push(path.login);
    }

  }, [currentUser, params]);

  useEffect(() => {
    if (currentUser.id === params.id || !params.id) {
      setEditButton(true);
    } else {
      setEditButton(false);
    }
  }, [currentUser.id, params.id])

  useEffect(() => {
    if (currentUser.id === params.id || !params.id) {
      getPaymentMethods()
    }
  }, [currentUser.id, params.id])
  

  async function getInstructor(id) {
    let instructor;

    try {
      instructor = await Instructor.get(id);
    } catch (err) {
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
      setCoursesLabel("Instructor Schedule");
      getInstructorSchedule(instructor.data._id);
    }
  }

  async function getPaymentMethods() {
    let data;

    try {
      data = await Stripe.getPaymentMethods();
    } catch (err) {
      return log.error("PROFILE:: ", err);
    }

    if (!data) return;

    let methods = [];

    if (data.methods) methods = [];

    setPMethod(methods.concat([]));

    if (!data.accountId) {
      setCreateStripe(true);
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

        setCoursesLabel("Your Schedule");
        getUserSchedule(currentUser.id, currentUser._id);
        return;
      }
    }
  }, [params, currentUser]);

  const toggleEditForm = function () {
    if (editForm) {
      setEditForm(false);
    } else {
      setEditForm(true);
    }
  }

  const linkBankAccount = async function() {
    window.location = await Stripe.getAccountLinkURL(path.home);
  }

  let redirectContent = null
  let editContent = null;
  let editButtonContent = null;
  let controlsContent = null;
  let createStripeButtonContent = null;
  let loaderContent = (
    <Grid container direction="row" justify="center" alignItems="center" className={classes.loader}>
      <CircularProgress color="secondary" />
    </Grid>
  );

  if (editButton) {
    editButtonContent = (
      <Fab color="secondary" aria-label="edit profile" className={classes.fab} onClick={toggleEditForm} title="Edit your profile info">
        <Create />
      </Fab>
    );

    if (editForm) {
      editButtonContent = (
        <Fab color="primary" aria-label="cancel" onClick={toggleEditForm}>
          <Clear />
        </Fab>
      )
    }
  }

  if (createStripe) {
    createStripeButtonContent = (
      <Fab color="secondary" aria-label="add bank account" onClick={linkBankAccount} title="Link your bank account">
        <AccountBalanceOutlined />
      </Fab>
    )
  }

  controlsContent = (
    <Grid container direction="row" justify="flex-end">
      <Grid item>
        {createStripeButtonContent}
      </Grid>
      <Grid item>
        {editButtonContent}
      </Grid>
    </Grid>
  );

  if (editForm) {
    editContent = (
      <Grid>
        {controlsContent}
        <ProfileEdit />
      </Grid>
    );
  }

  let userContent = (
    <Grid>
      {controlsContent}
      <UserData header={username} email={email} photo={photo} phone={phone} firstName={firstName} lastName={lastName} bio={bio} instagram={insta} paymentMethod={pMethod} />
      <Divider className={classes.divider} />
      <CourseSchedule header={coursesLabel} course={courses} view="month" />
    </Grid>
  );

  let content = loaderContent;

  if (!loader) {
    content = userContent;

    if (editForm) {
      content = editContent;
    }
  }

  if (redirectContent) {
    content = redirectContent;
  }

  return (
    <Container>
      {content}
    </Container>
  );
}