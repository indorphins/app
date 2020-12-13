import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import { useHistory } from "react-router-dom";
import { Button, Grid, Modal, Fade, Paper, Typography, makeStyles } from '@material-ui/core';
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
    padding: theme.spacing(4),
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
export default function ResumeSubscriptionModal (props) {
  const [err, setErr] = useState();
  const [cost, setCost] = useState();
  const [pMethod, setPMethod] = useState('No Payment Method Added');
  const classes = useStyles();
  const history = useHistory();
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
  }, [products]);

  useEffect(() => {
    if (defaultPaymentMethod && defaultPaymentMethod.length > 0) {
      setPMethod(`Payment Method: ${defaultPaymentMethod[0].brand.toUpperCase()} ${defaultPaymentMethod[0].last4}`)
    }
  }, [defaultPaymentMethod])

  const swapPaymentHandler = () => {
    setErr(null);
    history.push('/profile');
  }

  const resumeSubHandler = () => {
    if (!defaultPaymentMethod) {
      setErr("Add a payment method to subscribe")
      return
    }

    if (!products || !products.product || !products.price || products.price.length === 0) {
      log.warn("No products in redux store");
      setErr("No subscription data available")
      return;
    }

    create(products.product.id, products.price[0].id)
      .then(sub => {
        log.info("SUBSCRIPTION:: created ", sub);
        store.dispatch(actions.user.setSubscription(sub));
        setErr(null);
        props.closeModalHandler();
      }).catch(err => {
        log.warn("SUBSCRIPTION:: error creating ", err);
        setErr(err.message);
      });
  }

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
    content = (
      <Paper className={classes.modalContent}>
        <Grid container id='modal-description' justify='center'>
          <Typography variant="h3">Unlimited Classes for just {cost}</Typography>
          <br />
          <br />
          <Typography variant="body2">
            OFFER TERMS: take as many classes as you’d like across our platform for just {cost}/mo. 
            You’ll be billed automatically each month. Terms & Services apply across all classes.
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
            Swap Payment Method
          </Button>
          <Button onClick={resumeSubHandler} variant="contained" color="primary" className={classes.modalBtn}>
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

