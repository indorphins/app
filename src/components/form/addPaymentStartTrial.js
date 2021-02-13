import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Grid, Button, LinearProgress, Typography, Link } from '@material-ui/core';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import Alert from '@material-ui/lab/Alert';
import { makeStyles } from '@material-ui/core/styles';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import log from '../../log';
import * as StripeAPI from '../../api/stripe';
import { create } from '../../api/subscription';
import path from '../../routes/path';
import { store, actions } from '../../store';
import { getSubscriptionCostString } from '../../utils/index';

const getProductsSelector = createSelector([state => state.products], products => {
  return products;
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
  container: {
    color: theme.palette.common.white,
  },
  btnContainer: {
    display: "block",
    overflow: "hidden",
  },  
  btn: {
    width: '100%',
    color: theme.palette.primaryColor.contrastText,
    backgroundColor: theme.palette.primaryColor.main,
    "&:hover": {
      color: theme.palette.primary.contrastText,
      backgroundColor: theme.palette.primary.main,
    }
  },
  cardBg: {
    backgroundColor: '#e3e3e3',
    paddingTop: theme.spacing(1.5),
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    paddingBottom: theme.spacing(1.5),
    marginBottom: theme.spacing(1),
    marginRight: theme.spacing(1),
    marginLeft: theme.spacing(1),
    borderRadius: "2px"
  },
  txtField: {
    width: "100%",
  },
  text: {
    color: theme.palette.primary.main
  },
}));

export default function AddPaymentStartTrial (props) {
  const products = useSelector((state) => getProductsSelector(state));
  const classes = useStyles();
  const [loader, setLoader] = useState(false);
  const [serverErr, setServerErr] = useState(null);
  const [redirectUrl, setRedirectUrl] = useState(null);
  const [termsText, setTermsText] = useState();
  const [productId, setProductId] = useState();
  const [priceId, setPriceId] = useState();
  const history = useHistory();
  const stripe = useStripe();
  const elements = useElements();

  useEffect(() => {
    if (products && products.product && products.product.trial_length 
      && products.price && products.price.length > 0 && products.price[0].amount) {

      if (products.product.id && products.price[0].id) {
        setProductId(products.product.id);
        setPriceId(products.price[0].id);
      }

      let cost = getSubscriptionCostString(products.price);
      if (cost !== -1) {
        return setTermsText(`OFFER TERMS: My ${products.product.trial_length} day trial starts when 
        I click the button below and ends ${products.product.trial_length} days later. 
        If I don’t cancel during the trial period, I will automatically 
        continue to a paid plan (currently ${cost}/mo) 
        and my payment method on file will be charged monthly until I cancel. 
        I can cancel anytime online through my account. 
        At all times, Terms and Conditions apply. Free trial is available to new members only.`)
      }
    }
    
    setTermsText("No active subscription plans are available for purchase");
  }, [products]);

  useEffect(() => {
    if (props.query && props.query.redirect && !redirectUrl) {
      log.debug("ADD_PAYMENT_START_TRIAL:: set redirect URL", props.query.redirect);
      setRedirectUrl(props.query.redirect);
    }
  }, [props, redirectUrl]);

  const goHome = () => {
    log.debug('ADD_PAYMENT_START_TRIAL:: skip to home', path.courses);
    history.push(path.courses);
  }

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
      log.error("ADD_PAYMENT_START_TRIAL:: ", err);
      setLoader(false);
      setServerErr(err.message);
      return;
    }

    log.debug('paymentMethodRef', paymentMethodRef);

    if (!paymentMethodRef) {
      setLoader(false);
      return setServerErr("Invalid card information");
    }

    let paymentData = null;
    try {
      paymentData = await StripeAPI.addPaymentMethod(paymentMethodRef);
    } catch(err) {
      log.error("ADD_PAYMENT_START_TRIAL:: ", err);
      setLoader(false);
      setServerErr(err.message);
      return;
    }

    await store.dispatch(actions.user.setPaymentData(paymentData));

    if (!productId || ! priceId) {
      log.warn("No products in redux store");
      setLoader(false);
      setServerErr("No subscription data available to start trial")
      return;
    }

    setLoader(true);

    let sub;
    try {
      sub = await create(productId, priceId);
    } catch (err) {
      log.warn("ADD_PAYMENT_START_TRIAL:: error creating ", err);
      setLoader(false);
      setServerErr(err.message);
      return;
    }
    
    log.debug("ADD_PAYMENT_START_TRIAL:: created ", sub);
    store.dispatch(actions.user.setSubscription(sub));
    setServerErr(null);

    log.debug("ADD_PAYMENT_START_TRIAL:: success ", paymentMethodRef);
    cardElement.clear();
    setLoader(false);
    if (props.onCreate) props.onCreate(paymentData);

    if (redirectUrl) {
      log.debug('ADD_PAYMENT_START_TRIAL:: redirect to', redirectUrl);
      history.push(redirectUrl);
    } else {
      log.debug('ADD_PAYMENT_START_TRIAL:: redirect to home', path.courses);
      history.push(path.courses);
    }
  };

  let errContent;

  if (serverErr) {
    errContent = (
      <Grid item>
        <Alert severity="error" className={classes.txtField}>{serverErr}</Alert>
      </Grid>
		)
  }

  let progress = null;

  if (loader) {
    progress = (
      <LinearProgress color="primary" />
		)
  }

  let formcontent = (
    <Grid className={classes.container}>
      <form id='add-payment-start-trial-form' onSubmit={formHandler}>
        <Grid container direction="column" spacing={2}>
          {errContent}
          <Grid className={classes.cardBg}>
            <CardElement required options={CARD_ELEMENT_OPTIONS} />
          </Grid>
          <Grid item>
            <Typography variant='body2' color="primary">{termsText}</Typography>
          </Grid>
          <Grid item>
            {progress}
          </Grid>
          <Grid item className={classes.btnContainer}>
            <Button
              disabled={loader}
              type="submit"
              className={classes.btn}
              variant="contained"
            >
              Start Trial
            </Button>
          </Grid>
          <Grid item>
            <Typography variant='body2' style={{textAlign: 'center'}}>
              <Link color="secondary" className={classes.text} onClick={goHome}>Continue to view classes</Link>
            </Typography>
          </Grid>
        </Grid>
      </form>
    </Grid>
	);

  return formcontent;
}
