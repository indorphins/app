import React, { useState } from 'react';
import { Grid, Modal, Fade, Paper, Typography, Button, CircularProgress, makeStyles } from '@material-ui/core';
import * as Subscription from '../../api/subscription';
import log from '../../log';
import { store, actions } from '../../store';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';

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

const getSubscriptionSelector = createSelector([state => state.user], data => {
  return data.subscription;
});

/**
 * Cancels a user's subscription and displays their refund amount after
 * requires props - openModal, closeModalHandler, showRefund
 * @param {*} props 
 */
export default function CancelSubscriptionModal (props) {
  const [refund, setRefund] = useState(false);
  const [loader, setLoader] = useState(false);
  const [err, setErr] = useState();
  const classes = useStyles();
  const activeSub = useSelector(state => getSubscriptionSelector(state));

  const cancelSubHandler = () => {
    setLoader(true);
    Subscription.cancel()
      .then(result => {
        store.dispatch(actions.user.setSubscription(result.sub));
        props.showRefund(true);
        setRefund(true);
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

  let refundText = `Your membership will stop at the end of your billing period. 
  You’ll have until then to take classes. 
  If there’s anything else we can do, please email us at hello@indoorphins.fit`

  let periodEndDate = activeSub ? new Date(activeSub.period_end).toLocaleDateString() : null;
  let endDateText = '';
  if (periodEndDate) {
    endDateText = `We’ll stop your membership on ${periodEndDate}, 
    so you’ll have until then to take unlimited classes.`

    refundText = `Your membership will stop ${periodEndDate}. You’ll have until then to take classes. 
    If there’s anything else we can do, please email us at hello@indoorphins.fit`;
  }

  let refundContent = (
    <Paper className={classes.modalContent}>
      <Typography variant="body1">
        {refundText}
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
      <Typography variant="body1">
        {`Sad to see you go! ${endDateText} 
         Are you sure you’d like to stop your membership then?`}
      </Typography>
      <br />
      <Grid container id='modal-description' justify='center'>
        <Button
          onClick={props.closeModalHandler}
          variant="contained"
          color="primary"
          className={classes.modalBtn}
        >
          {`I'm no quitter`}
        </Button>
        <Button onClick={cancelSubHandler} variant="contained" className={classes.modalBtn}>
          {`Yes, I'm sure`}
        </Button>
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