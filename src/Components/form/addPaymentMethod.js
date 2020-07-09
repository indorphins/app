import React, { useState } from 'react';
import { Grid, Button, LinearProgress } from '@material-ui/core';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import Alert from '@material-ui/lab/Alert';
import { makeStyles } from '@material-ui/core/styles';

import * as StripeAPI from '../../api/stripe';
import {store, actions} from '../../store';
import log from '../../log';

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#696969',
      fontColor: '#545454',
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#8c8c8c',
      },
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a',
    },
  },
};

const useStyles = makeStyles((theme) => ({
  cardBg: {
    backgroundColor: '#e3e3e3',
    paddingTop: theme.spacing(1.5),
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    paddingBottom: theme.spacing(1.5),
    borderRadius: "2px"
  }
}));

export default function (props) {
  const classes = useStyles();
  const [loader, setLoader] = useState(false);
  const [serverErr, setServerErr] = useState(null);
  const stripe = useStripe();
  const elements = useElements();

  const formHandler = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoader(true);
    setServerErr(null);
    let paymentMethodRef = null;
    const cardElement = elements.getElement(CardElement);
    
    try {
      const { err, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });
      if (err) log.warn(err);
      paymentMethodRef = paymentMethod;
    } catch(err) {
      log.error("ADD_PAYMENT_METHOD:: ", err);
      setLoader(false);
      setServerErr({type:"error", message: err.message});
      return;
    }

    log.debug('paymentMethodRef', paymentMethodRef);

    if (!paymentMethodRef) {
      setLoader(false);
      return setServerErr({
        type: "error",
        message: "Invalid card information"
      });
    }

    let paymentData = null;
    try {
      paymentData = await StripeAPI.addPaymentMethod(paymentMethodRef);
    } catch(err) {
      log.error("ADD_PAYMENT_METHOD:: ", err);
      setLoader(false);
      setServerErr({type:"error", message: err.message});
      return;
    }

    await store.dispatch(actions.user.setPaymentData(paymentData));

    log.info("ADD_PAYMENT_METHOD:: success ", paymentMethodRef);
    cardElement.clear();
    setLoader(false);
    if (props.onCreate) props.onCreate(paymentData);
  };

  let errContent;

  if (serverErr) {
    errContent = (
      <Alert severity={serverErr.type}>{serverErr.message}</Alert>
    )
  }

  let progress = null;

  if (loader) {
    progress = (
      <Grid>
        <LinearProgress color="secondary" />
      </Grid>
    );
  }

  let formContent = (
    <form onSubmit={formHandler} >
      <Grid container direction='column' spacing={2}>
        <Grid item>
          {errContent}
        </Grid>
        <Grid item>
          <Grid className={classes.cardBg}>
            <CardElement required options={CARD_ELEMENT_OPTIONS} />
          </Grid>
          {progress}
        </Grid>
        <Grid item>
          <Grid container direction="row" justify="flex-end">
            <Grid item>
              <Button color="primary" type="submit" variant="contained">Add Card</Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </form>
  );

  let content = formContent;

  return content;
};
