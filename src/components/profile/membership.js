import React, { useEffect, useState } from 'react';
import { Grid, Modal, Fade, Paper, Typography, Button, makeStyles } from '@material-ui/core';
import * as Subscription from '../../api/subscription';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import log from '../../log';
import { store, actions } from '../../store';

const getSubscriptionSelector = createSelector([state => state.user], data => {
  return data.subscription;
});

const paymentDataSelector = createSelector([state => state.user], (data) => {
  return data.paymentData;
});

const getDefaultPaymentMethod = createSelector(
  paymentDataSelector,
  pd => pd.methods.filter(item => item.default)
);

const getProductsSelector = createSelector([state => state.products], products => {
  return products;
});

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'block',
  },
  text: {
    paddingBottom: 5,
    paddingTop: 5
  },
  button: {
    paddingLeft: 0,
    paddingRight: 0
  },
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
}))

export default function Membership (props) {
  const [memStatus, setMemStatus] = useState('Inactive');
  const [payPeriod, setPayPeriod] = useState();
  const [pMethod, setPMethod] = useState();
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [err, setErr] = useState();
  const subscription = useSelector(state => getSubscriptionSelector(state));
  const defaultPaymentMethod = useSelector(state => getDefaultPaymentMethod(state));
  const products = useSelector(state => getProductsSelector(state));
  const classes = useStyles();

  useEffect(() => {
    if (subscription) {
      if (subscription.status === 'ACTIVE' || subscription.status === 'TRIAL') {
        setMemStatus('Active');
      } else {
        setMemStatus('Inactive');
      }

      if (subscription.period_end) {
        const end = new Date(subscription.period_end).toLocaleDateString();
        const text = `Current Period: Subscription active until ${end}`;
        setPayPeriod((
          <Typography variant='body2' className={classes.text}>{text}</Typography>
        ))
      }
    }
  }, [subscription]);

  useEffect(() => {
    if (defaultPaymentMethod && defaultPaymentMethod[0] &&
      defaultPaymentMethod[0].brand && defaultPaymentMethod[0].last4) {
      const text = `Payment Method: ${defaultPaymentMethod[0].brand.toUpperCase()} 
        **** ${defaultPaymentMethod[0].last4}`;
      setPMethod((
        <Typography variant='body2' className={classes.text}>{text}</Typography>
      ))
    }
  }, [defaultPaymentMethod]);

  const isInteger = (n) => {
    return n === +n && n === (n|0);
  }

  const cancelSubHandler = () => {
    Subscription.cancel()
      .then(sub => {
        setMemStatus("Inactive");
        store.dispatch(actions.user.setSubscription(sub));
        setConfirmLeave(false);
      }).catch(err => {
        log.warn("CANCEL SUB:: error ", err);
        setErr(err.message);
      })
  }

  const closeHandler = () => {
    setConfirmLeave(false);
  }

  const openModalHandler = () => {
    setConfirmLeave(true);
  }

  const resumeSubHandler = () => {
    if (!defaultPaymentMethod) {
      setErr("Add a payment method to subscribe")
      return
    }

    if (!products || !products.product || !products.price || products.price.length === 0 ||
      !products.product.id || !products.price[0].id) {
      log.warn("No products in redux store");
      setErr("No subscription data available")
      return;
    }

    Subscription.create(products.product.id, products.price[0].id)
      .then(sub => {
        log.info("SUBSCRIPTION:: created ", sub);
        store.dispatch(actions.user.setSubscription(sub));
        setErr(null);
        setMemStatus("Active");
      }).catch(err => {
        log.warn("SUBSCRIPTION:: error creating ", err);
        setErr(err.message);
      });
  }


  let modal = (
    <Modal
      open={confirmLeave}
      onClose={closeHandler}
      className={classes.modal}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <Fade in={confirmLeave}>
        <Paper className={classes.modalContent}>
          <Typography variant="body1">Are you sure you want to cancel your membership?</Typography>
          <Grid container id='modal-description' justify='center'>
            <Button
              onClick={closeHandler}
              variant="contained"
              color="primary"
              className={classes.modalBtn}
            >
              No
            </Button>
            <Button onClick={cancelSubHandler} variant="contained" className={classes.modalBtn}>Yes</Button>
          </Grid>
        </Paper>
      </Fade>
    </Modal>
  );

  let modalContent = null;

  if (confirmLeave) {
    modalContent = modal;
  }

  let buttonContent;
  if (memStatus && memStatus === 'Active') {
    buttonContent = (
      <Button onClick={openModalHandler} className={classes.button}>Cancel Subscription</Button>
    )
  } else {
    let text = 'Resume Subscription';
    if (subscription && subscription.cost && subscription.cost.amount) {
      let c = products.price[0].amount / 100;
      let costText = "$" + c.toFixed(2);

      if (isInteger(c)) {
        costText = "$" + c;
      }

      text += ` for ${costText}/mo`;
    }
    buttonContent = (
      <Button onClick={resumeSubHandler} className={classes.button}>{text}</Button>
    )
  }

  return (
    <Grid container className={classes.container}>
      <Typography variant="h1">Membership</Typography>
      <Typography variant='body2' className={classes.text}>Status: {memStatus}</Typography>
      { memStatus === 'Active' ? payPeriod : null }
      { pMethod }
      { buttonContent }
      {err ? 
        <Typography variant="body2">{err}</Typography> 
      : null}
      {modalContent}
    </Grid>
  )
}