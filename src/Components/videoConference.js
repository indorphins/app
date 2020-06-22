import React, {useState, useEffect} from 'react';
import { Box, Button, Grid, IconButton, Checkbox, Paper, Chip, Typography, TextField } from '@material-ui/core';
import { VideocamOffOutlined, VideocamOutlined, MicNone, MicOffOutlined, VolumeOff, VolumeUp } from '@material-ui/icons';
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
  chatField: {
    width: '100%',
  },
  chatMsg: {
    display: "inline",
  },
  chatContainer: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  shown: {
    display: "block",
  },
  hidden: {
    display: "none",
  }
}));

function MuteButton(props) {

  const [isChecked, setChecked] = useState(props.checked);

  useEffect(() => {
    log.info('set checked');
    setChecked(props.checked);
  }, [props.checked]);

  let soundBtn = (<VolumeOff />);

  if (isChecked) {
    soundBtn = (<VolumeUp />);
  }

  return (
    <IconButton name={props.name} onClick={(evt) => props.onClick(evt)}>
      {soundBtn}
    </IconButton>
  );
}

export default function(props) {

  const classes = useStyles();
  const [user, setUser] = useState(null);
  const [streams, setStreams] = useState([]);
  const [subs, setSubs] = useState([]);
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
    setSubs(subs => subs.filter(item => item.user.username !== data.username));
  }


  function streamCreated(event) {

    let data = JSON.parse(event.stream.connection.data);
    log.debug('OPENTOK:: stream created event', event, data);
    let subscriber = null;

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
      subscriber = session.subscribe(event.stream, 'feature', props, handleError);
      return;
    }
    
    setStreams(streams => [...streams, {user: data, stream: event.stream}]);
    subscriber = session.subscribe(event.stream, data.username, props, handleError);

    setSubs(subs => [...subs, {user: data, subscriber: subscriber, audio: props.subscribeToAudio, video: props.subscribeToVideo, className: classes.shown}]);
  }

  function toggleSubscriberVideo(evt) {
    let data = evt.target.name;

    setSubs(subs.map(item => {
      if (item.user.username === data) {
        if (item.video) {
          item.video = false;
          item.className = classes.hidden;
          item.subscriber.subscribeToVideo(false);
        } else {
          item.video = true;
          item.className = classes.shown;
          item.subscriber.subscribeToVideo(true);
        }
      }
      return item;
    }));
  }

  function toggleSubscriberAudio(evt) {
    let data = evt.target.name;

    setSubs(subs.map(item => {
      if (item.user.username === data) {
        if (item.audio) {
          item.audio = false;
          item.subscriber.subscribeToAudio(false);
        } else {
          item.audio = true;
          item.subscriber.subscribeToAudio(true);
        }
      }
      return item;
    }));
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
      setChatHistory(chatHistory => [data, ...chatHistory]);
    }
  };

  function sendChat() {

    if (!chatMsg || chatMsg.trim() === "") return;

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

    setChatMsg('');
  }

  function chatFormHandler(e) {
    e.preventDefault();
    sendChat();
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

      });
    }

    return function disconnect() {
      // disconnect the event listeners
      session.off('streamCreated');
      session.off('streamDestroyed');
      session.off('signal');

      // destroy publisher object
      //publisher.destroy();

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

  let chatWindow = (
    <Grid>
      <form onSubmit={chatFormHandler}>
        <Grid container direction="row" justify="flex-start" alignContent="center" alignItems="flex-end">
          <Grid item xs>
            <TextField 
              color="secondary" 
              type="text" 
              label="Message" 
              variant="standard" 
              onChange={chatMsgHandler} 
              value={chatMsg} 
              className={classes.chatField} 
            />
          </Grid>
          <Grid item>
            <Button type="submit" color="secondary">Send</Button>
          </Grid>
        </Grid>
      </form>
      <Grid container direction="column">
        {chatHistory.map(message => (
          <Grid item key={(Math.random() * 1000000)} className={classes.chatContainer}>
            <Typography variant="body2" className={classes.chatMsg}>{message.username}: </Typography>
            <Typography variant="body1" className={classes.chatMsg}>{message.message}</Typography>
          </Grid>
        ))}
      </Grid>
    </Grid>
  );

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

  let combined = streams.map(strm => {
    let existing = subs.filter(s => {
      return s.user.username === strm.user.username;
    });

    if (existing && existing[0]) strm.className = existing[0].className;
    return strm;
  });

  let participantsControls = (
    <Grid>
      {subs.map(item => (
        <Box key={item.user.username}>
          <Checkbox name={item.user.username} checked={item.video} onClick={toggleSubscriberVideo} />
          <Chip label={item.user.username} />
          <MuteButton name={item.user.username} checked={item.audio} onClick={toggleSubscriberAudio} />
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
      {participantsControls}
    </Grid>
  );

  let participantsVideo = (
    <Grid container direction="row" justify="flex-start" className={classes.subscriberGrid}>
      {combined.map(item => (
        <Grid key={item.user.username} item className={`${classes.subscriberItem} ${item.className}`}>
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
          <Grid container direction="column">
            <Grid item>
              {featurePanel}
            </Grid>
            <Grid item>
              {chatWindow}
            </Grid>
          </Grid>
        </Grid>
        <Grid item>
          {participantsVideo}
        </Grid>
        {videoControls}
      </Grid>
    </Box>
  );
}