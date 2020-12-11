import React from 'react';
import { Button, Grid, Modal, Fade, Paper, Typography, makeStyles } from '@material-ui/core';

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

// pull in subscription price and product data + user payment method data

/**
 * Modal that will create a subscription without free trial if user chooses to resume subscription
 * Also has button to "switch payment method" that sends the user to their profile page
 * requires props - openModal, closeModalHandler
 */
export default function ResumeSubscriptionModal (props) {
  const classes = useStyles();

  const swapPaymentHandler = () => {
    // console.log("Swap p method!");
  }

  const resumeSubHandler = () => {
    // console.log("REsume sub!");
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
        <Paper className={classes.modalContent}>
          <Grid container id='modal-description' justify='center'>
            <Typography variant="h3">Unlimited Classes for just $XX.XX/mo!</Typography>
            <br />
            <br />
            <Typography variant="body2">
              OFFER TERMS: take as many classes as you’d like across our platform for just $49.99/mo. 
              You’ll be billed automatically each month. Terms & Services apply across all classes.
            </Typography>
          </Grid>
          <br />
          <Typography variant="body2">Payment method: VISA XXX2PRO</Typography>
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
        </Paper>
      </Fade>
    </Modal>
  )
}

