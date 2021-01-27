import React, { useEffect, useState } from 'react';
import { Button, Grid, Modal, Fade, Paper, Typography, makeStyles } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import { getCostString } from '../../utils/index';
import path from '../../routes/path';
import StartTrialModal from '../modals/startTrial';
import ResumeSubscriptionModal from '../modals/resumeSub';
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
    padding: theme.spacing(4),
    maxWidth: 600,
    outline: 0
  },
  modalBtn: {
    width: '40%',
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    marginTop: theme.spacing(1)
  },
}));

const subscriptionSelector = createSelector([state => state.user], user => {
  return user.subscription;
})

export default function Signup(props) {

  const { currentUser, course, size } = props;
  const classes = useStyles();
  const history = useHistory();
  const [ signupBtn, setSignup ] = useState(null);
  const [ confirmLeave, setConfirmLeave ] = useState(false);
  const [ isEnrolled, setIsEnrolled ] = useState(false);
  const [ startSubscription, setStartSubscription] = useState(false);
  const [ subModal, setSubModal] = useState();
  const [ sub, setSub ] = useState();
  const [ activeSub, setActiveSub ] = useState(false);
  const [ trialButton, setTrialButton ] = useState();
  let subscription = useSelector(state => subscriptionSelector(state));

  useEffect(() => {

    if(!currentUser.id || !course.id) {
      setSignup(null);
      return;
    }

    let enrolled = course.participants.filter(item => {
      return item.id === currentUser.id
    });

    if (enrolled.length > 0 && currentUser.id !== course.instructor.id) {
      setIsEnrolled(true);
    } else {
      setIsEnrolled(false);
    }
  }, [currentUser, course]);

  useEffect(() => {
    if (subscription) {
      setSub(subscription);
      if (subscription.status === 'ACTIVE' || subscription.status === 'TRIAL') {
        setActiveSub(true);
      }
    }
  }, [subscription])

  useEffect(() => {

    if (!course || !currentUser.id || isEnrolled) return;

    if (course.available_spots > 0 || currentUser.type !== "standard") {
      let handler, label;
      let subEmpty = Object.entries(subscription).length === 0;

      if (!subEmpty && activeSub) {
        label = "Book Class Free";
        handler = props.freeHandler; 

        setTrialButton(null);
      } else {
        label = `Book for $`
        if (course.cost) {
          let costString = getCostString(course.cost);
          label = `Book for ${costString}`;
        }
        handler = props.paidHandler;

        if (!subEmpty && !activeSub) {
          setTrialButton(
            <Grid item xs={size}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => { showSubscriptionModalHandler(false); }}
                style={{width:"100%"}}
              >
                Resume Subscription
              </Button>
            </Grid>
          );
        } else {
          setTrialButton(
            <Grid item xs={size}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => { showSubscriptionModalHandler(true); }}
                style={{width:"100%"}}
              >
                View Trial Details
              </Button>
            </Grid>
          );
        }
      }

      setSignup(
        <Button
          variant="contained"
          color="primary"
          onClick={() => { handler(); setSignup(null);}}
          style={{width:"100%"}}
        >
          {label}
        </Button>
      );
    }
  }, [currentUser, course, isEnrolled, subscription]);

  useEffect(() => {
    if (isEnrolled) {
      setSignup(
        <Button
          variant="contained"
          color="primary"
          onClick={() => { setConfirmLeave(true); }}
          style={{width:"100%"}}
        >
          Leave Class
        </Button>
      );
      setTrialButton(null);
    }
  }, [isEnrolled]);

  useEffect(() => {
    // Has never has a subscription
    if (currentUser && (!sub || Object.entries(sub).length === 0)) {
      let label = `Book for $`
      if (course.cost) {
        let costString = getCostString(course.cost);
        label = `Book for ${costString}`;
      }
      const handler = props.paidHandler;
      setSignup(
        <Button
          variant="contained"
          color="primary"
          onClick={() => { handler(); setSignup(null); }}
          style={{width:"100%"}}
        >
          {label}
        </Button>
      );
      setTrialButton(
        <Grid item xs={size}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => { showSubscriptionModalHandler(true); }}
            style={{width:"100%"}}
          >
            View Trial Details
          </Button>
        </Grid>
      );
    } else if (currentUser && sub && !activeSub) {
      // Has had a prior subscription that is no longer active
      setSignup(
        <Button
          variant="contained"
          color="primary"
          onClick={() => { showSubscriptionModalHandler(false); }}
          style={{width:"100%"}}
        >
          Resume Subscription
        </Button>
      );
      setTrialButton(null);
    }
  }, [sub, currentUser])

  useEffect(() => {

    if (!currentUser.id && course.available_spots > 0) {
      setSignup(
        <Button
          variant="contained"
          color="primary"
          onClick={() => { goToLogin(); }}
          style={{width:"100%"}}
        >
          Login to Book Class
        </Button>
      );

      setTrialButton(
        <Grid item xs={size}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => { startTrialHandler(); }}
            style={{width:"100%"}}
          >
            Create Account
          </Button>
        </Grid>
      )
    }

    if (currentUser && course && currentUser.id === course.instructor.id) {
      setSignup(null);
    }

  }, [currentUser, course]);

  const leaveHandler = async function() {
    closeHandler()
    if (props.leaveHandler) {
      props.leaveHandler();
    }
  }

  const goToLogin = async function() {
    history.push(`${path.login}?redirect=${path.courses}/${course.id}`);
  }

  const startTrialHandler = () => {
    history.push(`${path.signup}?redirect=${path.courses}/${course.id}`);
  }

  const closeHandler = () => {
    setConfirmLeave(false);
  }

  const showSubscriptionModalHandler = (trial) => {
    let m = trial ? 'start' : 'resume';
    setSubModal(m);
    setStartSubscription(true);
  }

  const closeSubModalHandler = (s) => {
    setStartSubscription(false);
    subscription = s;
    setSub(s);
    if (subscription.status === 'ACTIVE' || subscription.status === 'TRIAL') {
      setActiveSub(true);
    }
  }

  let leaveText = 'Are you sure you want to leave this class?';
  if (!activeSub) {
    let refundWindow = new Date(course.start_date);
    refundWindow.setDate(refundWindow.getDate() - 1);
    const now = new Date();

    leaveText = `Since you’re canceling 24 hours+ ahead of the class start time, 
    we can offer you a full refund for this class. Are you sure you want to leave?`

    if (now >= refundWindow && now.toISOString() < course.start_date) {
      leaveText = `We can remove you from class to open up a spot for another participant, 
      but in order to properly take care of our instructors, we require 24 hours notice for a refund to be made. 
      Are you sure you want to leave the class?`;
    }
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
          <Typography variant="body1">{leaveText}</Typography>
          <Grid container id='modal-description' justify='center'>
            <Button
              onClick={closeHandler}
              variant="contained"
              color="primary"
              className={classes.modalBtn}
            >
              No
            </Button>
            <Button onClick={leaveHandler} variant="contained" className={classes.modalBtn}>Yes</Button>
          </Grid>
        </Paper>
      </Fade>
    </Modal>
  );

  let resumeSubModal = (
    <ResumeSubscriptionModal 
      closeModalHandler={closeSubModalHandler}
      openModal={startSubscription} 
    />
  );
  let startTrialModal = 
    <StartTrialModal 
      closeModalHandler={closeSubModalHandler}
      openModal={startSubscription} 
      currentCourse={course}
    />;

  let content = null;
  let modalContent = null;

  if (confirmLeave) {
    modalContent = modal;
  }

  if (startSubscription) {
    if (subModal === 'start') {
      modalContent = startTrialModal;
    } else {
      modalContent = resumeSubModal;
    }
  }

  if (signupBtn) {
    content = (
      <React.Fragment>
        <Grid item xs={size}>
          {signupBtn}
        </Grid>
        {trialButton}
      </React.Fragment>
    )
  }

  return (
    <React.Fragment>
      {content}
      {modalContent}
    </React.Fragment>
  );
}