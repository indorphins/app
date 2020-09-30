import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Grid, TextField, Button, Typography, makeStyles } from '@material-ui/core';

import log from '../../log';

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  chatField: {
    width: "100%",
  },
  chatMsg: {
    display: "inline",
    paddingLeft: theme.spacing(1),
  },
  chatUsername: {
    display: "inline",
    fontWeight: "bold",
  },
  chatContainer: {
    width: '100%',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
}));

export default function Chat(props) {

  const classes = useStyles();
  const { session, user } = props;
  const [history, setHistory] = useState([]);
  const [chatMsg, setChatMsg] = useState('');

  useEffect(() => {
    if (session && session.on) {
      session.on('signal', handleSignal);
    }

    return function() {
      if (session && session.off) {
        session.off('signal');
      }
    }
  }, [session]);

  const handleSignal = function(event) {
    
    if (event.type === "signal:chat") {
      log.debug('OPENTOK:: got chat msg from client', event);
      let data = JSON.parse(event.data);
      setHistory(history => [data, ...history]);
    }
  };

  const sendChat = async function() {
    if (!chatMsg || chatMsg.trim() === "") return;

    session.signal(
      {
        type: "chat",
        data: JSON.stringify({
          username: user.username,
          message: chatMsg,
          date: new Date().toISOString(),
        }),
      },
      function(error) {
        if (error) {
          log.error("OPENTOK:: user signal error" + error.message);
        }
      }
    );

    setChatMsg('');
  }

  const chatFormHandler = function(e) {
    e.preventDefault();
    sendChat();
  }

  const chatMsgHandler = function(evt) {
    setChatMsg(evt.target.value);
  }

  if (session && user) {
    return (
      <Grid className={classes.root}>
        <form onSubmit={chatFormHandler}>
          <Grid container direction="row" justify="flex-start" alignContent="center" alignItems="flex-end">
            <Grid item xs>
              <TextField 
                color="primary" 
                type="text" 
                label="Message" 
                variant="standard" 
                onChange={chatMsgHandler} 
                value={chatMsg} 
                className={classes.chatField} 
              />
            </Grid>
            <Grid item>
              <Button type="submit" color="primary">Send</Button>
            </Grid>
          </Grid>
        </form>
        <Grid container direction="column">
          {history.map(message => (
            <Grid item key={(Math.random() * 1000000)} className={classes.chatContainer}>
              <Typography variant="body2" className={classes.chatUsername}>
                {message.username} [{format(new Date(message.date), 'h:mm aa')}]: 
              </Typography>
              <Typography variant="body1" className={classes.chatMsg}>{message.message}</Typography>
            </Grid>
          ))}
        </Grid>
      </Grid>
    );
  }

  return (<Grid></Grid>)
}