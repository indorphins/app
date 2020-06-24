import React, { useState, useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { Grid, Button, Checkbox, Typography, LinearProgress, Modal } from '@material-ui/core';
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
  btnContainer: {
    width: "100%",
    overflow: "hidden",
    justifyContent: "center",
    paddingTop: theme.spacing(2),
  },
  lgnBtn: {
    float: "right",
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  headerText: {
    fontWeight: "bold",
    marginBottom: theme.spacing(1.5)
  },
  rowItem: {
    paddingTop: theme.spacing(2),
  },
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
  const currentUser = useSelector((state) => getUserSelector(state))
  const classes = useStyles();
  const [loader, setLoader] = useState(false);
  const [checked, setChecked] = useState(false);
  const [serverErr, setServerErr] = useState(null);
  const [cardAdded, setCardAdded] = useState(false);
  const [pMethod, setPMethod] = useState(null);
  const editBtnRef = useRef();
  const history = useHistory();
  const stripe = useStripe();
  const elements = useElements();

  useEffect(() => {
    const editBtn = document.getElementById('edit-profile-btn');
    if (editBtn) {
      editBtnRef.current = editBtn;
      editBtn.style.display = 'none'
    }
  })

  const handleCheck = (event) => {
    setChecked(!checked)
  }

  const formHandler = async (event) => {
    event.preventDefault();
    if (!checked) {
      setServerErr("Must give permission to add card")
      return;
    }
    setLoader(true);
    // Create stripe customer for user if none exists then add payment method
    return Stripe.createCustomer(currentUser.email)
      .then(result => {
        const cardElement = elements.getElement(CardElement);
        return createPaymentMethod(cardElement)
      }).then(result => {
        log.info("ADD_PAYMENT_METHOD:: success ", result);
        setLoader(false);
        setCardAdded(true);
        setServerErr(null);
      }).catch(err => {
        setLoader(false);
        log.error("ADD_PAYMENT_METHOD:: ", err);
        setServerErr(err.message);
      })
  };

  const createPaymentMethod = (cardElement) => {
    return stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    }).then((result) => {
      if (result.error) {
        log.error("ADD_PAYMENT_METHOD:: ", result.error);
        throw result.error;
      } else {
        setPMethod({ type: result.paymentMethod.card.brand, last4: result.paymentMethod.card.last4 });
        return Stripe.createPaymentMethod(result.paymentMethod.id);
      }
    }).then(result => {
      return result;
    }).catch(err => {
      throw err;
    })
  }

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
    <Grid>
      <Grid container direction="row" justify="flex-end">
        <Grid item>
          <Button id='edit-profile-btn' className={classes.btn} variant="contained" color="secondary" onClick={(() => props.backHandler(pMethod))}>Back</Button>
        </Grid>
      </Grid>

      <Grid container direction='column' alignItems='center'>
        <Grid item className={classes.rowItem}>
          <Typography className={classes.headerText}>
            Class payments support your community
        </Typography>
        </Grid>
        <Grid item className={classes.rowItem}>
          <form id='login-form' onSubmit={formHandler} alignItems="center">
            <Grid className={classes.cardBg}>
              <CardElement options={CARD_ELEMENT_OPTIONS} />
            </Grid>
            <Grid container alignItems="center" className={classes.rowItem}>
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
            {serverErr ?
              <Grid item className={classes.rowItem}>
                {errContent}
              </Grid>
              : null
            }
            <Grid className={classes.btnContainer} container>
              <Button disabled={loader} color="primary" type="submit" variant="contained">Add & Enable Card</Button>
            </Grid>
          </form>
          {cardAdded ?
            <Grid container className={classes.rowItem} justify='center'>
              <Typography>
                Card successfully added
          </Typography>
            </Grid>
            : null
          }
        </Grid>
      </Grid>
    </Grid>
  );


  return formcontent;
};
