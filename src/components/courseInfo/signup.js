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

  useEffect(() => {

    if (!course.id) return;

    let handler = goToLogin;
    let label = "Login to Book Class";
    let enrolled = false;

    if (course.participants.length > 0) {
      
      for (var i = 0; i < course.participants.length; i++) {
        if (course.participants[i].id === currentUser.id) {
          enrolled = true;
        }
      }

      if (enrolled) {
        handler = () => { setConfirmLeave(true); };
        label = "Leave Class";
      }
    }

    if (course.available_spots > 0 && !enrolled && currentUser.id) {
      label = "Book Class";
      if (course.cost && course.cost > 0) {
        handler = props.paidHandler
      } else {
        handler = props.freeHandler
      }
    }

    if (currentUser.id !== course.instructor.id) {
      setSignup(
        <Button
          variant="contained"
          color="secondary"
          onClick={() => { handler(); setSignup(null);}}
          style={{width:"100%"}}
        >
          {label}
        </Button>
      );
    } else {
      setSignup(null);
    }

  }, [currentUser, course, confirmLeave]);

  const leaveHandler = async function() {
    closeHandler()
    if (props.leaveHandler) {
      props.leaveHandler();
    }
  }

  const goToLogin = async function() {
    history.push(`${path.login}?redirect=${path.courses}/${course.id}`);
  }

  const confirmLeaveHandler = () => {
    setConfirmLeave(true)
  }

  const closeHandler = () => {
    setConfirmLeave(false);
  }

  let modal = (
    <Modal
      open={confirmLeaveHandler}
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
              color="secondary"
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