import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { Container, Divider, Grid, CircularProgress, Fab, Typography } from '@material-ui/core';
import { Create, Clear, AccountBalanceOutlined } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';

import { store, actions } from '../store';
import CourseSchedule from '../components/courseSchedule';
import ProfileEdit from '../components/form/editProfile';
import UserData from '../components/userData';
import Cards from '../components/cards';
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
  header: {
    color: theme.palette.text.disabled,
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
  },
  masked: {
    fontSize: "0.6rem",
    display: "inline",
  },
}));

const getUserSelector = createSelector([state => state.user.data], (user) => {
  return user;
});

const getPaymentDataSelector = createSelector([state => state.user.paymentData], (data) => {
  return data;
});

export default function () {

  const history = useHistory();
  const classes = useStyles();
  const currentUser = useSelector(state => getUserSelector(state));
  const paymentData = useSelector(state => getPaymentDataSelector(state));
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
  const [createStripe, setCreateStripe] = useState(false);

  useEffect(() => {

    setCourses([]);

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
      getUserSchedule(currentUser.id);
    } else {

      history.push(path.login);
    }

  }, [currentUser, params]);

  useEffect(() => {
    if (currentUser.id) {
      setEditButton(true);
    } else {
      setEditButton(false);
    }
  }, [currentUser.userId])


  useEffect(() => {

    if (!currentUser.id) {
      return;
    }

    if (paymentData.id) { 
      return;
    }

    Stripe.getPaymentMethods().then(result => {
      return store.dispatch(actions.user.setPaymentData(result));
    })
    .catch(err => {
      log.error("PROFILE:: update user payment data", err);
    });

  }, [paymentData.id, currentUser.id]);

  useEffect(() => {
    if (paymentData && !paymentData.accountId) {
      setCreateStripe(true);
    }
    
    if (paymentData && paymentData.accountId) {
      setCreateStripe(false);
    }
  }, [paymentData]);

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

  async function getUserSchedule(userId) {
    let now = new Date();
    now.setHours(now.getHours() - 24);
    let schedFilter = {
      '$and': [
        {'$or': [
          {instructor: userId},
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
      <UserData header={username} email={email} photo={photo} phone={phone} firstName={firstName} lastName={lastName} bio={bio} instagram={insta} />
      <Divider className={classes.divider} />
      <Typography variant="h2" className={classes.header}>Cards</Typography>
      <Cards />
      <Divider className={classes.divider} />
      <CourseSchedule header="My Schedule" course={courses} view="month" />
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
}