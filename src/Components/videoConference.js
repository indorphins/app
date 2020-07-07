import React, {useState, useEffect, useRef} from 'react';
import { 
  Box, 
  Button, 
  Grid, 
  IconButton, 
  Checkbox, 
  Paper, 
  Chip, 
  Typography, 
  TextField, 
  ExpansionPanel, 
  ExpansionPanelSummary, 
  ExpansionPanelDetails,
  Switch,
} from '@material-ui/core';
import { 
  VideocamOffOutlined, 
  VideocamOutlined, 
  MicNone, 
  MicOffOutlined, 
  VolumeOff, 
  VolumeUp, 
  ExpandMoreOutlined,
} from '@material-ui/icons';
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
    maxWidth: 320
  },
  subscriberGridAlt: {
    //height: "100%",
  },
  subscriberItem: {
    height: 240,
    width: 320,
    background: theme.palette.grey[200],
  },
  subscriberItemAlt: {
    height: 240,
    width: "calc(100% / 4)",
    background: theme.palette.grey[200],
  },
  subscriberFeatureVid: {
    height: "calc(100% - 35px)",
  },  
  subscriberFeature: {
    height: 500,
    width: "100%",
    background: theme.palette.grey[200],
    '@media (min-width: 1500px)': {
      height: 700,
    },
    '@media (min-width: 1600px)': {
      height: 750,
    },
    '@media (min-width: 1700px)': {
      height: 800,
    },
    '@media (min-width: 1800px)': {
      height: 850,
    },
    '@media (min-width: 1900px)': {
      height: 900,
    },
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
    width: "100%",
    background: theme.palette.grey[200],
    '@media (min-width: 1500px)': {
      height: 700,
    },
    '@media (min-width: 1600px)': {
      height: 750,
    },
    '@media (min-width: 1700px)': {
      height: 850,
    },
    '@media (min-width: 1800px)': {
      height: 900,
    },
    '@media (min-width: 1900px)': {
      height: 1000,
    },
  },
  videoControls: {
    width: 400,
    '@media (max-width: 800px)': {
      width: 350,
    },
  },
  chat: {
    width: "100%",
  },
  chatField: {
    width: "100%",
  },
  chatMsg: {
    display: "inline",
  },
  chatContainer: {
    width: '100%',
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

  let looper = null;
  const loopTime = 20000;
  const classes = useStyles();
  const [maxStreams, setMaxStreams] = useState(3)
  const [user, setUser] = useState(null);
  const [streams, setStreams] = useState([]);
  const [videoSubsCount, setVideoSubsCount] = useState(0);
  const [subs, setSubs] = useState([]);
  const [course, setCourse] = useState(null);
  const [credentials, setCredentials] = useState(null);
  const [session, setSession] = useState(null);
  const [publisher, setPublisher] = useState(null);
  const [publishVideo, setPublishVideo] = useState(true);
  const [publishAudio, setPublishAudio] = useState(true);
  const [chatMsg, setChatMsg] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loopMode, setLoopMode] = useState(true);
  const userRef = useRef();
  const courseRef = useRef();
  const subsRef = useRef();
  const videoSubsCountRef = useRef();
  const maxStreamsRef = useRef();

  userRef.current = user;
  courseRef.current = course;
  subsRef.current = subs;
  videoSubsCountRef.current = videoSubsCount;
  maxStreamsRef.current = maxStreams;

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
      resolution: "1280x720",
      audioBitrate: 96000,
      enableStereo: false,
      maxResolution: {width: 1280, height: 720},
    }, handleError);
    setPublisher(publisher);
  }

  function streamDestroyed(event) {
    log.debug('OPENTOK:: stream destroyed', event);
    let data = JSON.parse(event.stream.connection.data);
    let doSetup = false;

    subsRef.current.forEach(item => {
      if (item.video && item.user.id === data.id) {
        doSetup = true;
      }
    });

    setStreams(streams => streams.filter(item => item.user.id !== data.id));
    setSubs(subs => subs.filter(item => item.user.id !== data.id));
    if (doSetup) {
      setupLoopMode();
    }
  }

  function streamCreated(event) {

    let data = JSON.parse(event.stream.connection.data);
    log.debug('OPENTOK:: stream created event', event, data);
    let subscriber = null;

    let props = {
      insertMode: 'append',
      width: '100%',
      height: '100%',
      preferredResolution: {width: 1920, height: 1080},
      showControls: false,
      subscribeToAudio: false,
      subscribeToVideo: false,
    };

    if (data.instructor) {
      props.subscribeToAudio = true;
      props.subscribeToVideo = true;
      //props.preferredResolution = {width: 1920, height: 1080};
      subscriber = session.subscribe(event.stream, 'feature', props, handleError);
      return;
    }
    
    setStreams(streams => [...streams, {user: data, stream: event.stream}]);

    let classname = `${classes.subscriberItem} ${classes.hidden}`;

    if (event.stream.hasVideo && videoSubsCountRef.current < maxStreamsRef.current) {
      if (videoSubsCountRef.current === 0 && userRef.current.id === courseRef.current.instructor.id) {
        classname = `${classes.subscriberFeature} ${classes.shown}`;
      } else if (videoSubsCountRef.current !== 0 && userRef.current.id === courseRef.current.instructor.id) {
        classname = `${classes.subscriberItemAlt} ${classes.shown}`;
      } else {
        classname = `${classes.subscriberItem} ${classes.shown}`;
      }
      props.subscribeToVideo = true;
      setVideoSubsCount(videoSubsCountRef.current + 1);
    }

    if (event.stream.hasAudio) {
      props.subscribeToAudio = true;
    }

    subscriber = session.subscribe(event.stream, data.id, props, handleError);

    setSubs(subs => [...subs, {
      user: data, 
      subscriber: subscriber, 
      audio: props.subscribeToAudio, 
      video: props.subscribeToVideo, 
      className: classname,
      order: subs.length + 1,
    }]);
  }

  async function loop() {
    
    if (!loopMode || subsRef.current.length <= maxStreamsRef.current) {
      return;
    }

    if (subsRef.current.length < videoSubsCountRef.current) {
      setupLoopMode();
      return;
    }

    let updated = subsRef.current;

    let first = updated.shift();

    first.video = false;
    first.className = `${classes.subscriberItem} ${classes.hidden}`;
    first.subscriber.subscribeToVideo(false);

    updated.push(first);

    for (var i = 0; i < updated.length; i++) {
      if (i < maxStreamsRef.current) {
        if (i === 0 && props.user.id === props.course.instructor.id) {
          updated[i].className = `${classes.subscriberFeature} ${classes.shown}`;
        } else if (i !== 0 && props.user.id === props.course.instructor.id) {
          updated[i].className = `${classes.subscriberItemAlt} ${classes.shown}`;
        } else {
          updated[i].className = `${classes.subscriberItem} ${classes.shown}`;
        }
        updated[i].video = true;
        updated[i].subscriber.subscribeToVideo(true);
      } else {
        updated[i].className = `${classes.subscriberItem} ${classes.hidden}`;
        updated[i].video = false;
        updated[i].subscriber.subscribeToVideo(false);
      }
      updated[i].order = Number(i) + 1;
    }

    setSubs(updated.concat([]));
  }

  async function setupLoopMode() {
    let updated = subsRef.current;
    let count = 0;

    for (var i = 0; i < updated.length; i++) {
      if (i < maxStreamsRef.current) {
        if (i === 0 && props.user.id === props.course.instructor.id) {
          updated[i].className = `${classes.subscriberFeature} ${classes.shown}`;
        } else if (i !== 0 && props.user.id === props.course.instructor.id) {
          updated[i].className = `${classes.subscriberItemAlt} ${classes.shown}`;
        } else {
          updated[i].className = `${classes.subscriberItem} ${classes.shown}`;
        }
        updated[i].video = true;
        updated[i].subscriber.subscribeToVideo(true);
        count = count + 1;
      } else {
        updated[i].video = false;
        updated[i].className = `${classes.subscriberItem} ${classes.hidden}`;
        updated[i].subscriber.subscribeToVideo(false);
      }
    }

    setVideoSubsCount(count);
    setSubs(updated.concat([]));
  }

  async function toggleLoopMode() {
    if (loopMode) {
      setLoopMode(false);
    } else {
      setLoopMode(true);
      setupLoopMode();
    }
  }

  async function toggleSubscriberVideo(evt) {
    let data = evt.target.name;

    setSubs(subs.map(item => {
      if (item.user.id === data) {
        if (item.video) {
          item.video = false;
          item.className = `${classes.subscriberItem} ${classes.hidden}`
          item.subscriber.subscribeToVideo(false);
          setVideoSubsCount(videoSubsCountRef.current - 1);
        } else {
          if (videoSubsCountRef.current < maxStreams) {
            if (videoSubsCountRef.current === 0 && props.user.id === props.course.instructor.id) {
              item.className = `${classes.subscriberFeature} ${classes.shown}`;
            } else if (videoSubsCountRef.current !== 0 && props.user.id === props.course.instructor.id) {
              item.className = `${classes.subscriberItemAlt} ${classes.shown}`;
            } else {
              item.className = `${classes.subscriberItem} ${classes.shown}`;
            }
            item.video = true;
            item.subscriber.subscribeToVideo(true);
            setVideoSubsCount(videoSubsCountRef.current + 1);
          }
        }
      }
      return item;
    }));
  }

  function toggleSubscriberAudio(evt) {
    let data = evt.target.name;

    setSubs(subs.map(item => {
      if (item.user.id === data) {
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

  async function sendChat() {

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
    if (loopMode) {
      loop();
      looper = setInterval(loop, loopTime);
    } else {
      clearInterval(looper);
    }

    return function() {
      clearInterval(looper);
    };
  }, [loopMode]);

  useEffect(() => {
    if (props.user.id === props.course.instructor.id) setMaxStreams(5);
    setCredentials(props.credentials);
    setCourse(props.course);
    setUser(props.user);
  }, [props]);

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

    return function() {
      // disconnect the event listeners
      session.off('streamCreated');
      session.off('streamDestroyed');
      session.off('signal');

      setSubs(subs.map(sub => {
        sub.subscriber.subscribeToVideo(false);
        sub.subscriber.subscribeToAudio(false);
        session.unsubscribe(sub.subscriber);
        return sub;
      }));

      // destroy publisher object
      publisher.publishVideo(false);
      publisher.publishAudio(false);
      publisher.destroy();

      // disconnect local session
      if (session.connection) session.disconnect();
      log.debug('OPENTOK:: disconnected from video session');
    }
  }, [session, publisher]);

  let chatWindow = (
    <Grid className={classes.chat}>
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
    <Grid xs item>
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
      return s.user.id === strm.user.id;
    });

    if (existing && existing[0]) {
      strm.className = existing[0].className;
      strm.order = existing[0].order;
    }
    return strm;
  });

  let participantsControls = (
    <Grid>
      {subs.map(item => (
        <Box key={item.user.id}>
          <Checkbox disabled={loopMode} name={item.user.id} checked={item.video} onClick={toggleSubscriberVideo} />
          <Chip label={item.user.username} />
          <MuteButton name={item.user.id} checked={item.audio} onClick={toggleSubscriberAudio} />
        </Box>
      ))}
    </Grid>
  );

  let videoBtn = (<VideocamOffOutlined />);
  if (publishVideo) {
    videoBtn = (<VideocamOutlined />);
  }

  let micBtn = (<MicOffOutlined />);
  if (publishAudio) {
    micBtn = (<MicNone />);
  }

  let videoControls = (
    <Grid item className={classes.videoControls}>
      <Box>
        <Grid id="publisher" className={classes.publisher}></Grid>
        <IconButton onClick={toggleVideo}>
          {videoBtn}
        </IconButton>
        <IconButton onClick={toggleAudio}>
          {micBtn}
        </IconButton>
      </Box>
      <Box>
        <ExpansionPanel defaultExpanded>
          <ExpansionPanelSummary expandIcon={<ExpandMoreOutlined />}>
            <Typography variant="h5">Participants</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <Grid container direction="column">
              <Grid item container direction="row" justify="flex-end" alignItems="center" style={{width: "100%"}}>
                <Grid item>
                  <Switch checked={loopMode} onChange={toggleLoopMode} name="Loop" />
                </Grid>
                <Grid item>
                  <Typography variant="subtitle1">Loop</Typography>
                </Grid>
              </Grid>
              <Grid item container style={{width: "100%"}}>
                {participantsControls}
              </Grid>
            </Grid>
          </ExpansionPanelDetails>
        </ExpansionPanel>
        <ExpansionPanel>
          <ExpansionPanelSummary expandIcon={<ExpandMoreOutlined />}>
          <Typography variant="h5">Chat</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            {chatWindow}
          </ExpansionPanelDetails>
        </ExpansionPanel>
      </Box>
    </Grid>
  );

  let containerClass = classes.subscriberGrid;

  if (course && user && user.id === course.instructor.id) {
    containerClass = classes.subscriberGridAlt;
  }

  let participantsVideo = (
    <Grid xs item>
      <Grid container direction="row" justify="flex-start" className={containerClass}>
        {combined.map(item => (
          <Grid key={item.user.id} item className={item.className} style={{order: item.order}}>
            <Box id={item.user.id} className={classes.subscriberFeatureVid} />
            <Box className={classes.subscriberLabelBox}>
              <Typography align="center" variant="h5" className={classes.subscriberLabel}>{item.user.username}</Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Grid>
  );

  let participantsVideoContent = (
    <Grid item>
      {participantsVideo}
    </Grid>
  );

  if (course && user && user.id === course.instructor.id) {
    participantsVideoContent = (
      <Grid item xs>
        {participantsVideo}
      </Grid>
    );
  }

  if (subsRef.current.length === 0) {
    participantsVideo = null;
  }

  return (
    <Grid container direction="row" justify="flex-start">
      <Grid container direction="row" spacing={2} justify="flex-start">
        {featurePanel}
        {participantsVideoContent}
        {videoControls}
      </Grid>
    </Grid>
  );
}