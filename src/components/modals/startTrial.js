import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import { Button, Grid, Modal, Fade, Paper, Typography, CircularProgress, makeStyles } from '@material-ui/core';
import log from '../../log';
import { create } from '../../api/subscription';
import { store, actions } from '../../store';

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
 */
export default function StartTrialModal (props) {
  const [err, setErr] = useState();
  const [cost, setCost] = useState();
  const [trialLength, setTrialLength] = useState();
  const [loader, setLoader] = useState(false)
  const classes = useStyles();
  const products = useSelector(state => getProductsSelector(state));
  const defaultPaymentMethod = useSelector(state => getDefaultPaymentMethod(state));

  function isInteger(n) {
    return n === +n && n === (n|0);
  }

  useEffect(() => {
    if (products && products.price && products.price.length > 0) {

      let c = products.price[0].amount / 100;
      let costText = "$" + c.toFixed(2);

      if (isInteger(c)) {
        costText = "$" + c;
      }
      
      setCost(costText)
    }

    if (products && products.product) {
      setTrialLength(products.product.trial_length);
    }
  }, [products]);

  const startTrialHandler = () => {
    if (!defaultPaymentMethod) {
      setErr("Add a payment method to subscribe")
      return
    }

    if (!products || !products.product || !products.price || products.price.length === 0) {
      log.warn("No products in redux store");
      setErr("No subscription data available")
      return;
    }

    setLoader(true);

    create(products.product.id, products.price[0].id)
      .then(sub => {
        log.info("SUBSCRIPTION:: created ", sub);
        store.dispatch(actions.user.setSubscription(sub));
        setErr(null);
        setLoader(false);
        props.closeModalHandler();
      }).catch(err => {
        log.warn("SUBSCRIPTION:: error creating ", err);
        setLoader(false);
        setErr(err.message);
      });
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
          <Button onClick={props.closeModalHandler} variant="contained" color="primary" className={classes.modalBtn}>
            Go Back
          </Button>
        </Grid>
      </Paper>
    )
  } else {
    let trialContent = '';
    if (trialLength && trialLength > 0) {
      trialContent = `${trialLength} Days Free, then `
    }

    let trialDescContent = `Your subscription starts when you click the button below. 
      Your payment method on file will be charged ${cost} monthly at the end of each billing cycle until you cancel. 
      You can cancel anytime online through your account. At all times, Terms and Conditions apply.`

    if (trialLength && trialLength > 0) {
      trialDescContent = `OFFER TERMS: Your ${trialLength} day trial starts when you click the button 
      below and ends ${trialLength} days later. If you don’t cancel during the trial period, you will 
      automatically continue to a paid plan (currently ${cost}/mo) and your payment method on file will 
      be charged monthly until you cancel. You can cancel anytime online through your account. 
      At all times, Terms and Conditions apply.`
    }

    content = (
      <Paper className={classes.modalContent}>
        <Grid container id='modal-description' justify='center'>
          <Typography variant="h3" style={{ textAlign: 'center'}}>
            {trialContent}{cost}/mo for unlimited classes!
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
          <Button onClick={startTrialHandler} variant="contained" color="primary" className={classes.modalBtn}>
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

  return (
    <Modal
      open={props.openModal}
      onClose={props.closeModalHandler}
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

