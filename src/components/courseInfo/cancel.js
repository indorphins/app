import React, { useState, useEffect } from 'react';
import { Button, Modal, Fade, Grid, makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  modal: {
    display: 'flex',
    padding: theme.spacing(1),
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalContent: {
    background: 'white',
    borderRadius: '4px',
    padding: theme.spacing(2),
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
        <Grid item xs={size}>
          <Button
            variant="contained"
            color="secondary"
            onClick={confirmCancelHandler}
            style={{width:"100%"}}
          >
            Cancel Class
          </Button>
        </Grid>
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
        <div className={classes.modalContent}>
          <span id='modal-title'>Are you sure you want to cancel?</span>
          <Grid container id='modal-description' justify='center'>
            <Button
              onClick={closeModalHandler}
              variant="contained"
              color="secondary"
              className={classes.modalBtn}
            >
              No
            </Button>
            <Button onClick={onCancel} variant="contained" className={classes.modalBtn}>Yes</Button>
          </Grid>
        </div>
      </Fade>
    </Modal>
  );

  let content = cancelBtn;

  if (confirmCancel) {
    content = modal;
  }

  return content;
}