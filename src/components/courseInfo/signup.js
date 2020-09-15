import React, { useEffect, useState } from 'react';
import { Button, Grid, Modal, Fade, Paper, Typography, makeStyles } from '@material-ui/core';
import { useHistory } from 'react-router-dom';

import path from '../../routes/path';

const useStyles = makeStyles((theme) => ({
  modal: {
    display: 'flex',
    padding: theme.spacing(1),
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalContent: {
    padding: theme.spacing(4),
    outline: 0
  },
  modalBtn: {
    width: '40%',
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    marginTop: theme.spacing(1)
  },
}));

export default function Signup(props) {

  const { currentUser, course, size } = props;
  const classes = useStyles();
  const history = useHistory();
  const [ signupBtn, setSignup ] = useState(null);
  const [ confirmLeave, setConfirmLeave ] = useState(false);
  const [ isEnrolled, setIsEnrolled ] = useState(false);

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

    if (!course || !currentUser.id || isEnrolled) return;

    let handler = null;
    let label = null;

    if (course.available_spots > 0 || currentUser.type !== "standard") {
      label = "Book Class";

      if (course.cost && course.cost > 0 && currentUser.type === "standard") {
        handler = props.paidHandler
      } else {
        handler = props.freeHandler
      }
    }

    if (handler && label) {
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
  }, [currentUser, course, isEnrolled]);

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
    }
  }, [isEnrolled]);

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

  const closeHandler = () => {
    setConfirmLeave(false);
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
          <Typography variant="body1">Are you sure you want to leave this class?</Typography>
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

  let content = null;
  let modalContent = null;

  if (confirmLeave) {
    modalContent = modal;
  }

  if (signupBtn) {
    content = (
      <Grid item xs={size}>
        {signupBtn}
      </Grid>
    )
  }

  return (
    <React.Fragment>
      {content}
      {modalContent}
    </React.Fragment>
  );
}