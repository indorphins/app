import React, {useState, useEffect} from 'react';
import { Avatar, Box, Grid, IconButton, Radio, Paper, Chip, Typography } from '@material-ui/core';
import { VideocamOffOutlined, VideocamOutlined, MicNone, MicOffOutlined } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';

import * as OT from '@opentok/client';

import log from '../log';

const useStyles = makeStyles((theme) => ({
  publisher: {
    height: 150,
    width: 250,
    background: theme.palette.grey[200],
  },
  subscriberGrid: {
    width: "100%",
    maxWidth: 300
  },
  subscriberItem: {
    //padding: theme.spacing(1),
  },
  subscriber: {
    height: 200,
    width: 300,
    background: theme.palette.grey[200],
  },
  subscriberLabelBox: {
    background: theme.palette.primary.main,
    padding: theme.spacing(1),
  },
  subscriberLabel: {
    fontSize: "0.9rem",
    color: theme.palette.primary.contrastText,
  },
  instructor: {
    height: 500,
    width: 700,
    background: theme.palette.grey[200],
  },
}));

export default function(props) {

  const classes = useStyles();
  const [user, setUser] = useState(null);
  const [courseLabel, setCourseLabel] = useState(null);
  const [course, setCourse] = useState(null);
  const [credentials, setCredentials] = useState(null);
  const [session, setSession] = useState(null);
  const [publisher, setPublisher] = useState(null);
  const [publishVideo, setPublishVideo] = useState(true);
  const [publishAudio, setPublishAudio] = useState(true);

  function handleError(err) {
    if (err) {
      log.error("OPENTOK::", err);
    }
  }

  async function initializeSession(apiKey, sessionId) {
    let session = OT.initSession(apiKey, sessionId);
    setSession(session);

    OT.getDevices(function(error, devices) {
      log.debug("OPENTOK:: system devices", devices);
    });
  
    // Create a publisher
    let publisher = OT.initPublisher('publisher', {
      insertMode: 'append',
      width: '100%',
      height: '100%',
      name: session.data,
    }, handleError);
    setPublisher(publisher);
  }

  function streamDestroyed(event) {
    log.debug('OPENTOK:: stream destroyed', event);
  }

  function streamCreated(event) {

    let data = JSON.parse(event.stream.connection.data);
    log.debug('OPENTOK:: stream created event', event, data);

    if (data.instructor) {
      session.subscribe(event.stream, 'instructor', {
        insertMode: 'append',
        width: '100%',
        height: '100%'
      }, handleError);
    } else {
      session.subscribe(event.stream, 'subscriber', {
        insertMode: 'append',
        width: '100%',
        height: '100%'
      }, handleError);
    }
  }

  function connectionCreated(event) {
    //log.debug('OPENTOK:: connection created', event);
  }

  function connectionDestroyed(event) {
    //log.debug('OPENTOK:: connection destroyed', event);
  }

  function handleSignal(event) {
    log.debug('OPENTOK:: got signal from client', event);
  };

  function toggleAudio() {
    if (publishAudio) {
      if (publisher) publisher.publishAudio(false);
      setPublishAudio(false);
    } else {
      if (publisher) publisher.publishAudio(true);
      setPublishAudio(true);
    }
  }

  function toggleVideo() {
    if (publishVideo) {
      if (publisher) publisher.publishVideo(false);
      setPublishVideo(false);
    } else {
      if (publisher) publisher.publishVideo(true);
      setPublishVideo(true);
    }
  }

  useEffect(() => {
    setCredentials(props.credentials);
    setCourse(props.course);
    setUser(props.user);
  }, [props]);

  useEffect(() => {
    if (course && course.instructor) {
      setCourseLabel(course.title + " with " + course.instructor.first_name + " " + course.instructor.last_name);
    }
  }, [course]);

  useEffect(() => {
    if (!credentials) return;

    if (credentials.apiKey && credentials.sessionId) {
      initializeSession(credentials.apiKey, credentials.sessionId);
    }
  }, [credentials]);

  useEffect(() => {

    if (!session) return;

    log.debug("OPENTOK:: session object", session);

    // Subscribe to stream events
    if (session.on) {
      session.on('streamCreated', streamCreated);
      session.on('streamDestroyed', streamDestroyed);
      session.on('connectionCreated', connectionCreated);
      session.on('connectionDestroyed', connectionDestroyed);
      session.on('signal', handleSignal);
    }
    
    // connect to session if a connection does not already exist
    if (session.connect && !session.connection) {
      // Connect to the session
      session.connect(credentials.token, function(error) {
        // If the connection is successful, initialize a publisher and publish to the session
        if (error) {
          return handleError(error);
        }

        if (session.capabilities.publish === 1) {
          log.debug("OPENTOK:: publish local media", publisher);
          session.publish(publisher, handleError);
        }

        /*session.connections.forEach(element => {

          if (element.id !== session.connectionId) {
            let userInfo = JSON.parse(element.data);

            log.debug('OPENTOK:: user connection data', element, userInfo);
          }
        });*/

        /*session.signal(
          {
            type: "user",
            data: JSON.stringify({
              username: user.username,
              type: user.type,
            }),
          },
          function(error) {
            if (error) {
              log.error("OPENTOK:: user signal error" + error.message);
            }
          }
        );*/

      });
    }

    return function disconnect() {
      // disconnect the event listeners
      session.off('streamCreated');
      session.off('streamDestroyed');
      session.off('connectionCreated');
      session.off('connectionDestroyed');
      session.off('signal');

      // destroy publisher object
      publisher.destroy();

      // disconnect local session
      session.disconnect();
      log.debug('OPENTOK:: disconnected from video session');
    }
  }, [session, publisher]);

  let videoBtn = null;
  let micBtn = null;

  if (publishVideo) {
    videoBtn = (
      <IconButton onClick={toggleVideo}>
        <VideocamOutlined />
      </IconButton>
    );
  } else {
    videoBtn = (
      <IconButton onClick={toggleVideo}>
        <VideocamOffOutlined />
      </IconButton>
    );
  }

  if (publishAudio) {
    micBtn = (
      <IconButton onClick={toggleAudio}>
        <MicNone />
      </IconButton>
    );
  } else {
    micBtn = (
      <IconButton onClick={toggleAudio}>
        <MicOffOutlined />
      </IconButton>
    );
  }

  let videoControls = (
    <Grid item>
      <Grid id="publisher" className={classes.publisher}></Grid>
      {videoBtn}
      {micBtn}
      <Typography variant="h5">Participants</Typography>
      <Grid>
        <Box>
          <Radio /><Chip avatar={<Avatar>U</Avatar>}  label="username" />
        </Box>
        <Box>
          <Radio /><Chip avatar={<Avatar>U</Avatar>}  label="username" />
        </Box>
      </Grid>
    </Grid>
  );

  let instructorPanel = (
    <Grid item>
      <Paper>
        <Box id="instructor" className={classes.instructor} />
      </Paper>
    </Grid>
  );

  if (user && course && user.id === course.instructor.id) {
    instructorPanel = null;
  }

  return (
    <Box>
      <Typography variant="h2">{courseLabel}</Typography>
      <Grid container direction="row" spacing={2} justify="flex-start">
        {instructorPanel}
        <Grid item>
          <Grid container direction="row" justify="flex-start" className={classes.subscriberGrid}>
            <Grid item className={classes.subscriberItem}>
              <Box id="subscriber" className={classes.subscriber} />
              <Box className={classes.subscriberLabelBox}>
                <Typography align="center" variant="h5" className={classes.subscriberLabel}>username</Typography>
              </Box>
            </Grid>
          </Grid>
        </Grid>
        {videoControls}
      </Grid>
    </Box>
  );
}