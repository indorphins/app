import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Grid, Button, Checkbox, Typography, LinearProgress } from '@material-ui/core';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import Alert from '@material-ui/lab/Alert';
import { makeStyles } from '@material-ui/core/styles';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import * as Stripe from '../../api/stripe';

import log from '../../log';
import path from '../../routes/path';
import { store, actions } from '../../store';

const getUserSelector = createSelector([state => state.user.data], (user) => {
  return user;
});

const useStyles = makeStyles((theme) => ({
  btnContainer: {
    display: "block",
    width: "100%",
    overflow: "hidden",
  },
  lgnBtn: {
    float: "right",
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  txtField: {
    width: 350,
  },
}));

export default function () {
  const currentUser = useSelector((state) => getUserSelector(state))
  const classes = useStyles();
  const [loader, setLoader] = useState(false);
  const [checked, setChecked] = useState(false);
  const [serverErr, setServerErr] = useState(null);
  const [cardAdded, setCardAdded] = useState(false);
  const history = useHistory();
  const stripe = useStripe();
  const elements = useElements();

  const handleCheck = (event) => {
    setChecked(!checked)
  }

  const formHandler = async (event) => {
    event.preventDefault();
    setLoader(true);
    console.log("Current user is ", currentUser)
    // Create stripe customer for user if none exists then add payment method
    return Stripe.createCustomer(currentUser.email)
      .then(result => {
        const cardElement = elements.getElement(CardElement);
        console.log("create customer success ", result);
        return createPaymentMethod(cardElement)
      }).then(result => {
        setLoader(false);
        setCardAdded(true);
        log.info("ADD_PAYMENT_METHOD:: success ", result);
      }).catch(err => {
        setLoader(false);
        log.error("ADD_PAYMENT_METHOD:: ", err);
        setServerErr(err.message);
      })
  };

  const createPaymentMethod = (cardElement) => {
    console.log("Create p method start w stripe ", stripe.createPaymentMethod)
    return stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    }).then((result) => {
      console.log("P method result ", result);
      if (result.error) {
        // display error?
        log.error("ADD_PAYMENT_METHOD:: ", result.error);
        throw result.error;
      } else {
        // Attach to our backend
        console.log("Created p method with stripe ", result);
        return Stripe.createPaymentMethod(result.paymentMethod.id);
      }
    }).then(result => {
      return result;
    }).catch(err => {
      throw err;
    })
  }

  const CARD_ELEMENT_OPTIONS = {
    style: {
      base: {
        color: '#32325d',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a',
      },
    },
  };


  let errContent;

  if (serverErr) {
    errContent = (
      <Alert severity="error" className={classes.txtField}>{serverErr}</Alert>
    )
  }

  let progress = null;

  if (loader) {
    progress = (
      <Grid>
        <LinearProgress color="secondary" />
      </Grid>
    )
  }

  let formcontent = (
    <Grid container direction='column'>
      <Grid>
        {errContent}
      </Grid>
      <Grid>
        <Typography>
          $10 Class payments support your community
        </Typography>
      </Grid>
      <form id='login-form' onSubmit={formHandler} alignItems="center">
        <CardElement options={CARD_ELEMENT_OPTIONS} />
        <Grid container alignItems="center">
          <Checkbox
            checked={checked}
            onChange={handleCheck}
            inputProps={{ 'aria-label': 'primary checkbox' }}
          />
          <Typography>
            I give permission to charge my card before any class I book.
          </Typography>
        </Grid>
        {progress}
        <Grid className={classes.btnContainer}>
          <Button disabled={loader} className={classes.lgnBtn} color="primary" type="submit" variant="contained">Add & Enable Card</Button>
        </Grid>
      </form>
      {cardAdded ?
        <Typography>
          Card successfully added
        </Typography> :
        null
      }
    </Grid>
  );


  return formcontent;
};
