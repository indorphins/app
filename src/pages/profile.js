import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { Container, Grid, CircularProgress, Fab, Typography } from '@material-ui/core';
import { Create, Clear, AccountBalanceOutlined } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';

import { store, actions } from '../store';
import CourseSchedule from '../components/courseSchedule';
import ProfileEdit from '../components/form/editProfile';
import UserData from '../components/userData';
import Cards from '../components/cards';
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

const userSchedSelector = createSelector([state => state.user.schedule], (items) => {
  return items;
});

export default function Profile() {

  const history = useHistory();
  const classes = useStyles();
  const currentUser = useSelector(state => getUserSelector(state));
  const paymentData = useSelector(state => getPaymentDataSelector(state));
  const schedule = useSelector(state => userSchedSelector(state));
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
  const [createStripe, setCreateStripe] = useState(false);

  useEffect(() => {

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
    if (paymentData && !paymentData.accountId && (currentUser.type === 'instructor' || currentUser.type === 'admin')) {
      setCreateStripe(true);
    } else {
      setCreateStripe(false);
    }
  }, [paymentData]);


  const toggleEditForm = function() {
    if (editForm) {
      setEditForm(false);
    } else {
      setEditForm(true);
    }
  }

  const linkBankAccount = async function() {
    let url = await Stripe.getAccountLinkURL(path.home);
    log.debug("REDIRECT to", url);
    window.location = url;
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
      <Fab 
        color="secondary"
        aria-label="edit profile"
        className={classes.fab}
        onClick={toggleEditForm}
        title="Edit your profile info"
      >
        <Create />
      </Fab>
    );

    if (editForm) {
      editButtonContent = (
        <Fab color="primary" aria-label="cancel" className={classes.fab} onClick={toggleEditForm}>
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
      <Grid container direction="column" spacing={1}>
        <Grid item>
          {controlsContent}
        </Grid>
        <Grid item>
          <ProfileEdit />
        </Grid>
      </Grid>
    );
  }
  
  let userContent = (
    <Grid container direction="column" spacing={2} style={{flexWrap: "nowrap"}}>
      <Grid item>
        {controlsContent}
      </Grid>
      <Grid item>
        <UserData 
          header={username}
          email={email}
          photo={photo}
          phone={phone}
          firstName={firstName}
          lastName={lastName}
          bio={bio}
          instagram={insta}
          showContactInfo={true}
        />
      </Grid>
      <Grid item>
        <Grid container direction="column" spacing={2} style={{flexWrap: "nowrap"}}>
          <Grid item>
            <Typography variant="h2">Cards</Typography>
          </Grid>
          <Grid item>
            <Cards collapseAdd={true} />
          </Grid>
        </Grid>
      </Grid>
      <Grid item>
        <Grid container direction="column" spacing={2}>
          <Grid item>
            <Typography variant="h2">Schedule</Typography>
          </Grid>
          <Grid item>
            <CourseSchedule course={schedule} />
          </Grid>
        </Grid>
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
}