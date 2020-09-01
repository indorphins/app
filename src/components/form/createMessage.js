import React, { useState } from 'react';
import Editor from '../editor';
import { Grid, Button, LinearProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { sendClassEmail } from '../../api/course'
import log from '../../log';
import Alert from '@material-ui/lab/Alert';


const useStyles = makeStyles((theme) => ({
  actionBtn: {
    marginTop: theme.spacing(2),
    marginRight: theme.spacing(1)
  },
  alert: {
    marginBottom: theme.spacing(1),
  }
}));

// Expects a props.courseId (String) and props.onSend which functions as a method to remove this component
export default function CreateMessage(props) {
  const classes = useStyles();
  const [message, setMessage] = useState(null);
  const [errMessage, setErrMessage] = useState(null);
  const [loader, setLoader] = useState(false);
  let progress;

  const editorHandler = function (e) {
    setMessage(e);
  }

  const editorSaveHandler = async function (e) {
    setLoader(true);

    try {
      await sendMessage()
    } catch (err) {
      setLoader(false);
      if (err.message === 'no_users_in_class') {
        setErrMessage({ severity: "error", message: "No users have signed up for the class yet" })
      } else {
        setErrMessage({ severity: "error", message: "Email failed to send" })
      }
      return;
    }

    setLoader(false);
    setErrMessage({ severity: "info", message: "Message sent"});

    if (typeof props.onSend === "function") {
      props.onSend();
    }
  }

  const sendMessage = async function () {
    let msg;
    setErrMessage(null);

    try {
      msg = await sendClassEmail(message, props.courseId)
    } catch (err) {
      log.warn("SEND_MESSAGE error: ", err);
      throw err;
    }

    return msg;
  }

  if (loader) {
    progress = (
      <Grid>
        <LinearProgress color="secondary" />
      </Grid>
    );
  }

  let errorContent = null;
  if (errMessage) {
    errorContent = (
      <Grid className={classes.alert}>
        <Alert severity={errMessage.severity} >{errMessage.message}</Alert>
      </Grid>
    );
  }

  return (
    <Grid>
      {errorContent}
      {progress}
      <Editor onChange={editorHandler} onSave={editorSaveHandler} />
      <Button
        className={classes.actionBtn}
        variant='contained'
        color='secondary'
        onClick={editorSaveHandler}
      >
        Send Email
      </Button>
    </Grid>
  )
}