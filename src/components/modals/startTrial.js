/* eslint complexity: ["error", { "max": 13 }]*/
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import { Button, Grid, Modal, Fade, Paper, Typography, CircularProgress, makeStyles } from '@material-ui/core';
import log from '../../log';
import { create } from '../../api/subscription';
import { store, actions } from '../../store';
import { useHistory } from "react-router-dom";
import { getSubscriptionCostString } from '../../utils/index';
import path from '../../routes/path';

const useStyles = makeStyles((theme) => ({
  modal: {
    display: 'flex',
    padding: theme.spacing(1),
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalContent: {
    padding: theme.spacing(5),
    outline: 0,
    maxWidth: 600,
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalBtn: {
    width: '45%',
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    marginTop: theme.spacing(1)
  },
  loader: {
    minHeight: 300,
  },
}));  

const getProductsSelector = createSelector([state => state.products], products => {
  return products;
});

const paymentDataSelector = createSelector([state => state.user], (data) => {
  return data.paymentData;
});

const getDefaultPaymentMethod = createSelector(
  paymentDataSelector,
  pd => pd.methods.filter(item => item.default)
);

/**
 * Modal that will create a subscription without free trial if user chooses to resume subscription
 * Also has button to "switch payment method" that sends the user to their profile page
 * requires props - openModal, closeModalHandler
 * optional props - currentCourse
 */
export default function StartTrialModal (props) {
  const [err, setErr] = useState();
  const [cost, setCost] = useState();
  const [trialLength, setTrialLength] = useState();
  const [loader, setLoader] = useState(false)
  const [needsPMethod, setNeedsPMethod] = useState(true);
  const [success, setSuccess] = useState(false);
  const [sub, setSub] = useState();
  const history = useHistory();
  const classes = useStyles();
  const products = useSelector(state => getProductsSelector(state));
  const defaultPaymentMethod = useSelector(state => getDefaultPaymentMethod(state));

  useEffect(() => {
    if (products) {
      if (products.price && products.price.length > 0) {
        let cost = getSubscriptionCostString(products.price);
        if (cost !== -1) {
          setCost(cost)
        }
      }
      
      if (products.product && products.product.trial_length) {
        setTrialLength(products.product.trial_length);
      }
    }
  }, [products]);

  useEffect(() => {
    if (defaultPaymentMethod && defaultPaymentMethod.length > 0) {
      setNeedsPMethod(false);
    } else {
      setNeedsPMethod(true);
    }
  }, [defaultPaymentMethod])

  const swapPaymentHandler = () => {
    setErr(null);
    if (props.currentCourse) {
      history.push(`${path.addPayment}?redirect=${path.courses}/${props.currentCourse.id}`);
    } else {
      history.push(`${path.addPayment}`);
    }
  }

  const startTrialHandler = () => {
    if (!defaultPaymentMethod) {
      setErr("Add a payment method to subscribe")
      return
    }

    if (!products || !products.product || !products.price || 
      products.price.length === 0 || !products.product.id || !products.price[0].id) {
      log.warn("No products in redux store");
      setErr("No subscription data available")
      return;
    }

    setLoader(true);

    create(products.product.id, products.price[0].id)
      .then(sub => {
        log.info("SUBSCRIPTION:: created ", sub);
        setErr(null);
        setLoader(false);
        setSuccess(true);
        setSub(sub);
      }).catch(err => {
        log.warn("SUBSCRIPTION:: error creating ", err);
        setLoader(false);
        setErr(err.message);
      });
  }

  const subscriptionCreatedHandler = () => {
    store.dispatch(actions.user.setSubscription(sub));
    props.closeModalHandler(sub);
  }

  let loaderContent = (
    <Paper className={classes.modalContent}>
      <Grid container direction="row" justify="center" alignItems="center" className={classes.loader}>
        <CircularProgress color="primary" />
      </Grid>
    </Paper>
  );

  let content;

  if (!products || !products.product || !products.price || products.price.length === 0) {
    content = (
      <Paper className={classes.modalContent}>
        <Grid container id='modal-description' justify='center'>
          <Typography variant="h3">Subscription Data Unavailable</Typography>
        </Grid> 
        <br />
        <Grid container id='modal-description2' justify='center'>
          <Typography variant="body2">Try again later</Typography>  
        </Grid>
        <br />
        <Grid container id='modal-buttons' justify='center'>
          <Button 
            onClick={() => props.closeModalHandler(null)} 
            variant="contained" color="primary" 
            className={classes.modalBtn}
          >
            Go Back
          </Button>
        </Grid>
      </Paper>
    )
  } else {
    let trialContent = '';
    let trialDescContent = `Your subscription starts when you click the button below. 
      Your payment method on file will be charged ${cost} monthly at the end of each billing cycle until you cancel. 
      You can cancel anytime online through your account. At all times, Terms and Conditions apply.`

    if (trialLength && trialLength > 0) {
      trialContent = `${trialLength} Days Free, then `
      trialDescContent = `OFFER TERMS: Your ${trialLength} day trial starts when you click the button 
      below and ends ${trialLength} days later. If you don’t cancel during the trial period, you will 
      automatically continue to a paid plan (currently ${cost}/mo) and your payment method on file will 
      be charged monthly until you cancel. You can cancel anytime online through your account. 
      At all times, Terms and Conditions apply.`
    }

    let paymentMethodBtn;
    if (needsPMethod) {
      paymentMethodBtn = (
        <Button
          onClick={swapPaymentHandler}
          variant="contained"
          className={classes.modalBtn}
        >
          Add Payment Method
        </Button>
      );
    }

    content = (
      <Paper className={classes.modalContent}>
        <Grid container id='modal-description' justify='center'>
          <Typography variant="h3" style={{ textAlign: 'center'}}>
            {trialContent}{cost}/mo to help support your instructors!
          </Typography>
        </Grid>
        <Grid container id='modal-description'>
          <br />
          <Typography variant="body2">
            {trialDescContent}
          </Typography>
        </Grid>
        <br />
        <Grid container id='modal-buttons' justify='center'>
          {paymentMethodBtn}
          <Button
            onClick={startTrialHandler}
            variant="contained" 
            color="primary" 
            disabled={needsPMethod} 
            className={classes.modalBtn}
          >
            {trialLength > 0 ? "Start Trial" : "Start Subscription"}
          </Button>
        </Grid>
        <br />
        <Grid container id='error-container' justify='center'>
          {err ? 
            <Typography variant="body2">{err}</Typography> 
          : null}
        </Grid>
      </Paper>
    )
  }

  if (loader) {
    content = loaderContent;
  }

  if (success) {
    content = (
      <Paper className={classes.modalContent}>
        <Grid container id='modal-description' justify='center'>
          <Typography 
          variant="body1" 
          style={{ textAlign: 'center'}}
          >
            You’re set! Book a class and have the time of your life.
          </Typography>
          <br />
          <Grid container id='modal-buttons' justify='center'>
            <Button 
            onClick={subscriptionCreatedHandler} 
            variant="contained" 
            color="primary" 
            className={classes.modalBtn}
            >
              {`Let's go`}
            </Button>
          </Grid>
        </Grid>
      </Paper>
    )
  }

  let closeHandler = () => props.closeModalHandler(null);
  if (sub) {
    closeHandler = subscriptionCreatedHandler;
  }

  return (
    <Modal
      open={props.openModal}
      onClose={closeHandler}
      className={classes.modal}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <Fade in={props.openModal}>
        {content}
      </Fade>
    </Modal>
  )
}

