import React, { useEffect, useState } from 'react';
import { Grid, Typography, Button, makeStyles } from '@material-ui/core';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import ResumeSubscriptionModal from '../modals/resumeSub';
import StartTrialModal from '../modals/startTrial';
import CancelSubscriptionModal from '../modals/cancelSub';

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
    height: '73vh'
  },
  text: {
    paddingBottom: 5,
    paddingTop: 5
  },
  button: {
    marginTop: theme.spacing(2)
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
  loader: {
    minHeight: 300,
  },
}))

// Takes in a setNavTab prop that can set the nav tab
export default function Membership (props) {
  const { setNavTab } = props;
  const [memStatus, setMemStatus] = useState('Inactive');
  const [payPeriod, setPayPeriod] = useState();
  const [pMethod, setPMethod] = useState();
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [startTrial, setStartTrial] = useState(true);
  const [refund, setRefund] = useState(false);
  const defaultPaymentMethod = useSelector(state => getDefaultPaymentMethod(state));
  const products = useSelector(state => getProductsSelector(state));
  const classes = useStyles();
  let subscription = useSelector(state => getSubscriptionSelector(state));

  useEffect(() => {
    if (subscription && Object.entries(subscription).length > 0) {
      if (subscription.status === 'ACTIVE' || subscription.status === 'TRIAL') {
        subscription.cancel_at_period_end ? setMemStatus('Canceled') : setMemStatus('Active');

        if (subscription.period_end) {
          const end = new Date(subscription.period_end);
          const dateStr = getPeriodEndString(end);
          const trialOrSub = subscription.status === 'TRIAL' ? 'Trial' : 'Subscription';
          const text = `Current Period: ${trialOrSub} active until ${dateStr}`;
          setPayPeriod((
            <Typography variant='body2' className={classes.text}>{text}</Typography>
          ))
        }
      } else {
        if (subscription.status === 'PAYMENT_FAILED') {
          setMemStatus('Inactive - Payment Failed');
        } else {
          setMemStatus('Inactive');
        }
        setPayPeriod(null);
      }

      setStartTrial(false);
    } else {
      setStartTrial(true)
      setMemStatus("Inactive");
      setPayPeriod(null);
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

  /**
   * Gets the formatted date string for displaying subscription period end
   * @param {Date} periodEndDate 
   */
  const getPeriodEndString = (periodEndDate) => {
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];
    
    return `${monthNames[periodEndDate.getMonth()]} ${periodEndDate.getDate()}, ${periodEndDate.getFullYear()}`
  };

  const closeHandler = (sub) => {
    setRefund(false);
    setConfirmLeave(false);
    if (sub && Object.entries(sub).length > 0) {
      subscription = sub;
    }
  }

  const openModalHandler = () => {
    setConfirmLeave(true);
  }

  let modalContent = null;

  if (confirmLeave) {
    modalContent = startTrial ? 
      <StartTrialModal 
      openModal={confirmLeave} 
      closeModalHandler={closeHandler} 
      /> 
      : <ResumeSubscriptionModal 
      openModal={confirmLeave} 
      closeModalHandler={closeHandler} 
      profilePageHandler={setNavTab}
        />

    if (memStatus === 'Active' || refund) {
      modalContent = 
        <CancelSubscriptionModal 
          showRefund={setRefund} 
          openModal={confirmLeave}
          closeModalHandler={closeHandler}
        />;
    }
  }

  let buttonContent;

  if (memStatus && memStatus === 'Active') {
    buttonContent = (
      <Button onClick={openModalHandler} variant="contained" className={classes.button}>Cancel Subscription</Button>
    )
  } else {
    let text = 'Resume Subscription';

    if (subscription && subscription.cost && subscription.cost.amount) {
      let c = products.price[0].amount / 100;
      let costText = "$" + c.toFixed(2);

      text += ` for ${costText}/mo`;
    } else if (!subscription || Object.entries(subscription).length === 0) {
      text = 'Start Trial';
    }

    buttonContent = (
      <Button onClick={openModalHandler} variant="contained" className={classes.button}>{text}</Button>
    )
  }

  let memberContent = (
    <Grid>
      <Typography variant='body2' className={classes.text}>Status: {memStatus}</Typography>
      { payPeriod }
      { pMethod }
      { buttonContent }
      { modalContent }
    </Grid>
  )

  return (
    <Grid container className={classes.container}>
      <Typography variant="h1">Membership</Typography>
      {memberContent}
    </Grid>
  )
}