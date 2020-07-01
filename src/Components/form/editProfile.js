import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import { Grid, TextField, Button, LinearProgress, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import AddPaymentMethod from './addPaymentMethod';
import * as User from '../../api/user';
import * as Stripe from '../../api/stripe';
import log from '../../log';
import { store, actions } from '../../store';
import Editor from '../editor';


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
  const [loader, setLoader] = useState(false);
  const [addPaymentMethod, setAddPaymentMethod] = useState(false);
  const [pMethod, setPMethod] = useState();

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
    }

  }, [currentUser])

  useEffect(async () => {
    if (currentUser.id) {
      getPaymentMethods()
    }
  }, [currentUser.id])


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

  const editorHandler = function (e) {
    setBio(e);
  }

  async function getPaymentMethods() {
    let pMethods;

    try {
      pMethods = await Stripe.getPaymentMethods();
    } catch (err) {
      log.error("EDIT_PROFILE:: ", err);
      return;
    }

    // Show the default payment method
    if (pMethods && Array.isArray(pMethods.data)) {
      setPMethod(Stripe.getDefaultPaymentMethod(pMethods.data))
    }
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

  const addPaymentMethodHandler = function () {
    setAddPaymentMethod(true);
  }

  const backButtonHandler = (paymentMethod) => {
    setAddPaymentMethod(false);
    setPMethod(paymentMethod)
  }

  const removePaymentMethodHandler = function () {
    Stripe.deletePaymentMethod(pMethod.id)
      .then(result => {
        if (result.statusCode >= 400) {
          throw Error("Payment method removal failed");
        } else {
          log.info("EDIT_PROFILE:: remove payment method success: ", result);
          setPMethod(null);
        }
      }).catch(err => {
        log.error("EDIT_PROFILE:: remove payment method failure: ", err);
        // TODO Display error
      })
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

    if (bio) {
      userData.bio = bio;
    }

    if (!bio && currentUser.bio) {
      userData.bio = currentUser.bio;
    }

    if (instaHandler) {
      if (!userData.social) userData.social = {};
      userData.social.instagram = instagram;
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
      <Grid>
        <TextField className={classes.input} disabled={loader} required autoComplete="username" color="secondary" variant="outlined" type="text" id="username" label="Nickname" value={username} onChange={usernameHandler} />
      </Grid>
      <Grid>
        <TextField className={classes.input} disabled={loader} required autoComplete="given_name" color="secondary" variant="outlined" type="text" id="first" label="First Name" value={firstname} onChange={firstHandler} />
      </Grid>
      <Grid>
        <TextField className={classes.input} disabled={loader} required autoComplete="family_name" color="secondary" variant="outlined" type="text" id="last" label="Last Name" value={lastname} onChange={lastHandler} />
      </Grid>
      <Grid>
        <TextField className={classes.input} disabled={loader} autoComplete="tel" color="secondary" variant="outlined" type="tel" id="phone" label="Phone Number" value={phone} onChange={phoneHandler} />
      </Grid>
      <Grid>
        <TextField className={classes.input} disabled={loader} autoComplete="tel" color="secondary" variant="outlined" type="text" id="instagram" label="Instagram Handle" value={instagram} onChange={instaHandler} />
      </Grid>
      <Grid>
        <TextField className={classes.input} disabled={loader} color="secondary" variant="outlined" type="text" id="photo" label="Profile Photo URL" value={photoUrl} onChange={photoHandler} />
      </Grid>
      <Grid>
        <Editor label="Bio" value={bioContent} onChange={editorHandler} onSave={editorSaveHandler} />
      </Grid>
      <Grid>
        {pMethod ?
          <Grid>
            <label for='payment-method-type'>Payment Method</label>
            <Grid container display='row' justify='space-between' alignItems='center'>
              <Typography id='payment-method-type' label='Payment Method'>
                {`${pMethod.type.toUpperCase()} Card ending in ${pMethod.last4}`}
              </Typography>
              <Button className={classes.btn} disabled={loader} variant="contained" color="primary" type="button" onClick={removePaymentMethodHandler}>
                Remove Payment Method
              </Button>

            </Grid>
          </Grid>
          :
          <Grid>
            <label for='payment-method-type'>Payment Method</label>
            <Grid container display='row' justify='space-between' alignItems='center'>
              <Typography label='Payment Method'>
                {`Add a Payment Method`}
              </Typography>
              <Button className={classes.btn} disabled={loader} variant="contained" color="primary" type="button" onClick={addPaymentMethodHandler}>
                Add Payment Method
              </Button>
            </Grid>
          </Grid>
        }
      </Grid>
      {progress}
      <Grid>
        <Button className={classes.btn} disabled={loader} variant="contained" color="primary" type="submit">Update</Button>
      </Grid>
    </form>
  )

  const addPMethodContent = (
    <AddPaymentMethod backHandler={backButtonHandler} />
  )

  if (addPaymentMethod) {
    content = addPMethodContent;
  } else {
    content = formContent;
  }

  return (
    <Grid>
      {content}
    </Grid>
  );
}