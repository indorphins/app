import React, {useState, useEffect} from 'react';
import { Avatar, Box, Button, Grid, IconButton, Radio, Paper, Chip, Typography, TextField } from '@material-ui/core';
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
  const [participants, setParticipants] = useState([]);
  const [streams, setStreams] = useState([]);
  const [courseLabel, setCourseLabel] = useState(null);
  const [course, setCourse] = useState(null);
  const [credentials, setCredentials] = useState(null);
  const [session, setSession] = useState(null);
  const [publisher, setPublisher] = useState(null);
  const [publishVideo, setPublishVideo] = useState(true);
  const [publishAudio, setPublishAudio] = useState(true);
  const [chatMsg, setChatMsg] = useState('');
  const [chatHistory, setChatHistory] = useState([]);

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
      mirror: false,
      showControls: false,
      publishAudio: true,
      publishVideo: true,
      maxResolution: {width: 1920, height: 1080},
    }, handleError);
    setPublisher(publisher);
  }

  function streamDestroyed(event) {
    log.debug('OPENTOK:: stream destroyed', event);
    let data = JSON.parse(event.stream.connection.data);
    setStreams(streams => streams.filter(item => item.user.username !== data.username));
  }


  function streamCreated(event) {
    log.debug('OPENTOK:: stream created event', event, data);
    let data = JSON.parse(event.stream.connection.data);
    //let subscriber = null;

    let props = {
      insertMode: 'append',
      width: '100%',
      height: '100%',
      preferredResolution: {width: 320, height: 240},
      showControls: false,
      subscribeToAudio: false,
      subscribeToVideo: false,
    };

    if (event.stream.hasAudio) {
      props.subscribeToAudio = true;
    }

    if (event.stream.hasVideo) {
      props.subscribeToVideo = true;
    }

    if (data.instructor) {
      props.preferredResolution = {width: 1920, height: 1080};
      session.subscribe(event.stream, 'feature', props, handleError);
      return;
    }

    setStreams(streams => [...streams, {user: data, stream: event.stream}]);
    session.subscribe(event.stream, data.username, props, handleError);
  }

  function connectionCreated(event) {
    if (event.connection.id === session.connection.connectionId) return;

    log.debug('OPENTOK:: connection created', event);
    let data = JSON.parse(event.connection.data);
    setParticipants(participants => [...participants, data.username]);
  }

  function connectionDestroyed(event) {
    if (event.connection.id === session.connection.connectionId) return;

    log.debug('OPENTOK:: connection destroyed', event);
    let data = JSON.parse(event.connection.data);
    setParticipants(participants => participants.filter(item => item !== data.username));
  }

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

  function handleSignal(event) {
    log.debug('OPENTOK:: got signal from client', event);
    
    if (event.type === "signal:chat") {
      let data = JSON.parse(event.data);
      setChatHistory(chatHistory => [...chatHistory, data]);
    }
  };

  function sendChat() {
    session.signal(
      {
        type: "chat",
        data: JSON.stringify({
          username: user.username,
          message: chatMsg,
        }),
      },
      function(error) {
        if (error) {
          log.error("OPENTOK:: user signal error" + error.message);
        }
      }
    );

    log.debug('clear chat input');
    setChatMsg('');
  }

  function chatMsgHandler(evt) {
    setChatMsg(evt.target.value);
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

      session.on("streamPropertyChanged", function (event) {
        log.debug("stream property changed", event);
      });
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

  let participantsContent = (
    <Grid>
      {participants.map(user => (
        <Box key={user}>
          <Radio name={user} checked={true} /><Chip avatar={<Avatar>U</Avatar>} label={user} />
        </Box>
      ))}
    </Grid>
  );

  let videoControls = (
    <Grid item>
      <Grid id="publisher" className={classes.publisher}></Grid>
      {videoBtn}
      {micBtn}
      <Typography variant="h5">Participants</Typography>
      {participantsContent}
    </Grid>
  );

  let chatWindow = (
    <Grid container direction="row" justify="flex-start" alignContent="flex-end">
      <Grid item>
        <TextField type="text" label="Chat Message" variant="standard" onChange={chatMsgHandler} value={chatMsg} />
        <Button onClick={sendChat}>Send</Button>
      </Grid>
      <Grid item>
        {chatHistory.map(message => (
          <Box key={(Math.random() * 1000000)}>
            <Typography variant="subtitle2">{message.username}</Typography>
            <Typography variant="subtitle2">{message.message}</Typography>
          </Box>
        ))}
      </Grid>
    </Grid>
  )

  let featurePanel = (
    <Grid>
      <Paper>
        <Box id="feature" className={classes.instructor} />
      </Paper>
    </Grid>
  );

  if (user && course && user.id === course.instructor.id) {
    featurePanel = null;
  }

  let subscriberContent = (
    <Grid container direction="row" justify="flex-start" className={classes.subscriberGrid}>
      {streams.map(item => (
        <Grid key={item.user.username} item className={classes.subscriberItem}>
          <Box id={item.user.username} className={classes.subscriber} />
          <Box className={classes.subscriberLabelBox}>
            <Typography align="center" variant="h5" className={classes.subscriberLabel}>{item.user.username}</Typography>
          </Box>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Box>
      <Typography variant="h2">{courseLabel}</Typography>
      <Grid container direction="row" spacing={2} justify="flex-start">
        <Grid item>
          {featurePanel}
          {chatWindow}
        </Grid>
        <Grid item>
          {subscriberContent}
        </Grid>
        {videoControls}
      </Grid>
    </Box>
  );
}