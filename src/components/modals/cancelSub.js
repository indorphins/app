import React, { useState } from 'react';
import { Grid, Modal, Fade, Paper, Typography, Button, CircularProgress, makeStyles } from '@material-ui/core';
import * as Subscription from '../../api/subscription';
import log from '../../log';
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
}))

/**
 * Cancels a user's subscription and displays their refund amount after
 * requires props - openModal, closeModalHandler, showRefund
 * @param {*} props 
 */
export default function CancelSubscriptionModal (props) {
  const [refund, setRefund] = useState(false);
  const [refundCost, setRefundCost] = useState();
  const [loader, setLoader] = useState(false);
  const [err, setErr] = useState();
  const classes = useStyles();

  const isInteger = (n) => {
    return n === +n && n === (n|0);
  }

  const cancelSubHandler = () => {
    setLoader(true);
    Subscription.cancel()
      .then(result => {
        store.dispatch(actions.user.setSubscription(result.sub));
        props.showRefund(true);
        setRefund(true);
        if (result.refund === 0) {
          setRefundCost(0);
        } else {
          let c = result.refund / 100;
          setRefundCost("$" + c.toFixed(2) + ' ');

          if (isInteger(c)) {
            setRefundCost("$" + c + ' ');
          }
        }
        setLoader(false);
      }).catch(err => {
        log.warn("CANCEL SUB:: error ", err);
        setLoader(false);
        setErr(err.message);
      })
  }

  let loaderContent = (
    <Paper className={classes.modalContent}>
      <Grid container direction="row" justify="center" alignItems="center" className={classes.loader}>
        <CircularProgress color="primary" />
      </Grid>
    </Paper>
  );

  let refundText;
  if (!refundCost) {
    refundText = `We’ve gone ahead and removed you from any classes you were booked into.`
  } else {
    refundText = `We’ve refunded you ${refundCost}
    for the remaining days in your 
    monthly subscription and removed you from any classes you were booked into.`
  }

  let refundContent = (
    <Paper className={classes.modalContent}>
      <Typography variant="body1">
        We’re sorry to see you go. {refundText}
      </Typography>
      <br />
      <Grid container id='modal-description' justify='center'>
        <Button
          onClick={props.closeModalHandler}
          variant="contained"
          color="primary"
          className={classes.modalBtn}
        >
          Close
        </Button>
      </Grid>
      <Grid container id='error-container' justify='center'>
        {err ? 
          <Typography variant="body2">{err}</Typography> 
        : null}
      </Grid>
    </Paper>
  )

  let cancelContent = (
    <Paper className={classes.modalContent}>
      <Typography variant="body1">Are you sure you want to cancel your membership?</Typography>
      <br />
      <Grid container id='modal-description' justify='center'>
        <Button
          onClick={props.closeModalHandler}
          variant="contained"
          color="primary"
          className={classes.modalBtn}
        >
          No
        </Button>
        <Button onClick={cancelSubHandler} variant="contained" className={classes.modalBtn}>Yes</Button>
      </Grid>
      <Grid container id='error-container' justify='center'>
        {err ? 
          <Typography variant="body2">{err}</Typography> 
        : null}
      </Grid>
    </Paper>
  )

  let content = cancelContent;

  if (refund) {
    content = refundContent;
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
  );
}