import React, { useState, useEffect } from 'react';
import { Button, Modal, Paper, Fade, Grid, Typography, makeStyles } from '@material-ui/core';

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

export default function Cancel(props) {

  const classes = useStyles()
  const { currentUser, course, onCancel, size } = props;
  const [cancelBtn, setCancelBtn] = useState(null);
  const [confirmCancel, setConfirmCancel] = useState(false);

  useEffect(() => {

    if (!course.id) return;

    let instructor = course.instructor;

    if (currentUser.id === instructor.id || currentUser.type === 'admin') {
      setCancelBtn(
        <Button
          variant="contained"
          color="primary"
          onClick={confirmCancelHandler}
          style={{width:"100%"}}
        >
          Cancel Class
        </Button>
      )
    }

  }, [currentUser, course]);

  const confirmCancelHandler = () => {
    setConfirmCancel(true)
  }

  const closeModalHandler = () => {
    setConfirmCancel(false);
  }

  let modal = (
    <Modal
      open={confirmCancel}
      onClose={closeModalHandler}
      className={classes.modal}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <Fade in={confirmCancel}>
        <Paper className={classes.modalContent}>
          <Typography variant="body1">Are you sure you want to cancel this class?</Typography>
          <Grid container id='modal-description' justify='center'>
            <Button
              onClick={closeModalHandler}
              variant="contained"
              color="primary"
              className={classes.modalBtn}
            >
              No
            </Button>
            <Button onClick={onCancel} variant="contained" className={classes.modalBtn}>Yes</Button>
          </Grid>
        </Paper>
      </Fade>
    </Modal>
  );

  let content = null;

  if (cancelBtn) {
    content = (
      <Grid item xs={size}>
        {cancelBtn}
      </Grid>
    )
  }

  if (confirmCancel) {
    content = modal;
  }

  return content;
}