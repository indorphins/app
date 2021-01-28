import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import { useHistory } from "react-router-dom";
import { Button, Grid, Modal, Fade, Paper, Typography, CircularProgress, makeStyles } from '@material-ui/core';
import log from '../../log';
import { create } from '../../api/subscription';
import { store, actions } from '../../store';
import { getSubscriptionCostString } from '../../utils/index';

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

const subscriptionSelector = createSelector([state => state.user], user => {
  return user.subscription;
})

/**
 * Modal that will create a subscription without free trial if user chooses to resume subscription
 * Also has button to "switch payment method" that sends the user to their profile page
 * requires props - openModal, closeModalHandler
 * optional props - profilePageHandler (used when resumeSubModal is presented 
 * on the profile page and payment method is changed)
 */
export default function ResumeSubscriptionModal (props) {
  const [err, setErr] = useState();
  const [cost, setCost] = useState();
  const [pMethod, setPMethod] = useState('No Payment Method Added');
  const [needsPMethod, setNeedsPMethod] = useState(true);
  const [loader, setLoader] = useState(false);
  const [success, setSuccess] = useState(false);
  const [sub, setSub] = useState();
  const classes = useStyles();
  const history = useHistory();
  const products = useSelector(state => getProductsSelector(state));
  const defaultPaymentMethod = useSelector(state => getDefaultPaymentMethod(state));
  const subscription = useSelector(state => subscriptionSelector(state));

  useEffect(() => {
    if (products && products.price && products.price.length > 0 && products.price[0].amount) {
      
      let cost = getSubscriptionCostString(products.price);
      if (cost !== -1) {
        setCost(cost)
      }
    }
  }, [products]);

  useEffect(() => {
    if (defaultPaymentMethod && defaultPaymentMethod.length > 0 
    && defaultPaymentMethod[0].brand && defaultPaymentMethod[0].last4) {
      setPMethod(`Payment Method: ${defaultPaymentMethod[0].brand.toUpperCase()} ${defaultPaymentMethod[0].last4}`)
      setNeedsPMethod(false);
    } else {
      setPMethod(`No Payment Method Added`);
      setNeedsPMethod(true);
    }
  }, [defaultPaymentMethod])

  const swapPaymentHandler = () => {
    setErr(null);
    if (window.location.pathname === '/profile' && props.profilePageHandler) {
      props.profilePageHandler('Profile');
    } else {
      history.push('/profile');
    }
  }

  const resumeSubHandler = () => {
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
            variant="contained" 
            color="primary" 
            className={classes.modalBtn}
          >
            Go Back
          </Button>
        </Grid>
      </Paper>
    )
  } else {
    let addPMethodText = needsPMethod ? 
      "Add payment method" : "Swap payment method";

    let offerText = `OFFER TERMS: take as many classes as you’d like across our platform for just ${cost}/mo. 
    You’ll be billed automatically each month. Terms & Services apply across all classes.`

    if (subscription.cancel_at_period_end && subscription.status !== 'CANCELED') {
      const endDate = new Date(subscription.period_end).toLocaleDateString();
      offerText = `If you want to restart your subscription, great! 
      We’ll resume your billing cycle on ${endDate}, and you’ll be fully back in business`
    }
    content = (
      <Paper className={classes.modalContent}>
        <Grid container id='modal-description' justify='center'>
          <Typography variant="h3" style={{ textAlign: 'center'}}>Unlimited Classes for just {cost}</Typography>
          <br />
          <br />
          <Typography variant="body2">
            {offerText}
          </Typography>
        </Grid>
        <br />
        <Typography variant="body2">{pMethod}</Typography>
        <br />
        <Grid container id='modal-buttons' justify='center'>
          <Button
            onClick={swapPaymentHandler}
            variant="contained"
            className={classes.modalBtn}
          >
            {addPMethodText}
          </Button>
          <Button onClick={resumeSubHandler}
            variant="contained" 
            disabled={needsPMethod} 
            color="primary" 
            className={classes.modalBtn}
          >
            Resume Subscription
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

