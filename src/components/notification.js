import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import { differenceInMinutes } from 'date-fns';
import { Grid, Paper, Typography, Slide, makeStyles, useMediaQuery } from '@material-ui/core';
import { Close, InfoOutlined } from '@material-ui/icons';
import { useHistory } from 'react-router-dom';

import { getNextSession } from '../utils';
import path from '../routes/path';

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    position: "absolute",
    bottom: 0,
    left: 0,
    zIndex:999999,
    padding: theme.spacing(2),
    '@media (max-width:600px)': {
      padding: 0,
    }
  },
  card: {
    padding: theme.spacing(2),
    background: theme.palette.grey[300],
  },
  close: {
    cursor: "pointer",
    float: "right",
  },
  msg: {
    color: theme.palette.grey[700],
    fontWeight: "bold",
    cursor: "pointer",
  },
  icon: {
    cursor: "pointer",
    color: theme.palette.secondaryColor.main,
  },
}));

const userSchedSelector = createSelector([state => state.user.schedule], (items) => {
  return items;
});

export default function Notification() {

  const classes = useStyles();
  const history = useHistory();
  const [messages, setMessages] = useState([]);
  const messagesRef = useRef();
  const schedule = useSelector(state => userSchedSelector(state));
  const sm = useMediaQuery('(max-width:600px)');
  const md = useMediaQuery('(max-width:900px)');

  messagesRef.current = messages;

  useEffect(() => {

    if (schedule && schedule.length > 0) {
      checkUpcomingClass(schedule);
      const interval = setInterval(() => {
        checkUpcomingClass(schedule);
      }, 10000);
      return () => clearInterval(interval);
    }

  }, [schedule]);

  function sendClassMessage(msg) {
    let exists = messagesRef.current.filter(item => {
      return item.url === msg.url;
    });

    if (!exists[0]) {
      setMessages(messages => [msg, ...messages]);
    }
  }

  function checkUpcomingClass(courseList) {
    let now = new Date();
    for (var i = 0; i < courseList.length; i++) {
      let item = courseList[i];
      let next = getNextSession(now, item);

      if (next) {

        if (now > next.start && now < next.end) {
          sendClassMessage({
            id: item.id,
            url: path.courses + "/" + item.id + "/join",
            message: "Class is in session! Click here to join " + item.title,
            open: true,
          });
          continue;
        }

        let diff = differenceInMinutes(next.date, now)
        if (diff < 20 && diff > 0) {
          sendClassMessage({
            id: item.id,
            url: path.courses + "/" + item.id,
            message: item.title + " is starting soon. Click here to view your class.",
            open: true,
          });
        }
      }
    }
  }

  function handleClose(event) {
    setMessages(messages.map(item => {
      if (item.id === event.id) {
        item.open = false;
      }
      return item;
    }))
  }

  function doLink(event) {
    setMessages(messages.map(item => {
      if (item.id === event.id) {
        item.open = false;
      }
      return item;
    }));

    history.push(event.url);
  }

  let displayMsg = messages.filter(item => item.open);
  let layout = {
    containerWidth: 4,
  }

  if (md) {
    layout.containerWidth = 6;
  }

  if (sm) {
    layout.containerWidth = 12;
  }

  return (
    <Grid className={classes.root}>
      <Grid xs={layout.containerWidth} item container direction="column" spacing={2}>
        {displayMsg.map(item => (
          <Slide key={item.message + item.id} direction="right" in={true} mountOnEnter unmountOnExit>
            <Grid item>
              <Paper elevation={4} className={classes.card}>
                <Grid container direction="row" justify="space-between" spacing={1}>
                  <Grid item xs={1}>
                    <InfoOutlined  onClick={() => {doLink(item)}} className={classes.icon} />
                  </Grid>
                  <Grid item xs={10}>
                    <Typography className={classes.msg} onClick={() => {doLink(item)}}>{item.message}</Typography>
                  </Grid>
                  <Grid item xs={1}>
                    <Close className={classes.close} onClick={() => {handleClose(item)}} />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Slide>
        ))}
      </Grid>
    </Grid>
  );
}