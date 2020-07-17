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
  Loop,
  ChevronLeft,
  ChevronRight,
} from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { Alert } from '@material-ui/lab';
import * as OT from '@opentok/client';
import { format } from 'date-fns';
import { isSafari, isMobile, fullBrowserVersion } from 'react-device-detect';
import compareVersions from 'compare-versions';

import log from '../log';

const useStyles = makeStyles((theme) => ({
  publisher: {
    height: 150,
    width: 250,
    background: theme.palette.grey[200],
  },
  subscriberGrid: {
    height: "100%",
    maxWidth: 240,
    alignContent: "flex-start",
    '@media (min-width: 1200px)': {
      maxWidth: 320
    },
    '@media (min-width: 1600px)': {
      maxWidth: 420
    },
  },
  subscriberGridAlt: {
    height: "100%",
  },
  subscriberItem: {
    height: "calc(100% / 4)",
    background: theme.palette.grey[800],
    width: 240,
    '@media (min-width: 1200px)': {
      width: 320
    },
    '@media (min-width: 1600px)': {
      width: 420
    },
  },
  subscriberItemAlt: {
    height: "25%",
    width: "calc(100% / 4)",
    background: theme.palette.grey[800],
  },
  subscriberFeatureVid: {
    height: "100%",
  },  
  subscriberFeature: {
    height: "75%",
    width: "100%",
    background: theme.palette.grey[700],
  },
  subscriberLabelBox: {
    position: 'relative',
    bottom: '50px',
  },
  subscriberLabel: {
    fontSize: "2rem",
    color: theme.palette.primary.contrastText,
  },
  instructor: {
    height: "100%",
    width: "100%",
    background: theme.palette.grey[900],
  },
  videoControls: {},
  drawer: {
    height: "100%",
    overflowY: "scroll",
    overflowX: "hidden",
    backgroundColor: theme.palette.primary.main,
  },
  drawerBtn: {
    position: 'relative',
    top: '10px',
    right: '50px',
    zIndex: '9999',
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
  chatUsername: {
    display: "inline",
    fontWeight: "bold",
    color: theme.palette.secondary.main
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
  let title = "Unmute this participant";

  if (isChecked) {
    soundBtn = (<VolumeUp />);
    title = "Mute this participant";
  }

  return (
    <IconButton name={props.name} title={title} onClick={() => props.onClick(props.name)}>
      {soundBtn}
    </IconButton>
  );
}

export default function(props) {

  let looper = null;
  const loopTime = 20000;
  const classes = useStyles();
  const [maxStreams, setMaxStreams] = useState(4)
  const [user, setUser] = useState(null);
  const [streams, setStreams] = useState([]);
  const [videoSubsCount, setVideoSubsCount] = useState(0);
  const [subs, setSubs] = useState([]);
  const [course, setCourse] = useState(null);
  const [credentials, setCredentials] = useState(null);
  const [session, setSession] = useState(null);
  const [publisher, setPublisher] = useState(null);
  const [publishVideo, setPublishVideo] = useState(true);
  const [publishAudio, setPublishAudio] = useState(false);
  const [chatMsg, setChatMsg] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loopMode, setLoopMode] = useState(true);
  const [displayMsg, setDisplayMsg] = useState(null);
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

  async function handleError(err) {
    if (err) {
      log.error("OPENTOK::", err);

      if (err.message.match("End-user denied permission to hardware devices")) {
        setDisplayMsg({severity: "error", message: "We cannot access your camera or microphone. Please refresh the page, making sure to 'accept' the request for camera and microphone device access."});
        return;
      }
    }
  }

  async function initializeSession(apiKey, sessionId, settings) {

    let session = OT.initSession(apiKey, sessionId);
    setSession(session);

    settings.name = session.data;
  
    // Create a publisher
    let publisher = OT.initPublisher('publisher', settings, handleError);
    setPublisher(publisher);
  }

  function validateBrowserVersion() {
    let valid = true;

    if (isMobile) {
      setDisplayMsg({severity: "warning", message: "Indoorphins classes are not yet optimized for mobile devices. Apologies for the inconvenience."});
      valid = false;
    }

    if (isSafari) {
      let compare = compareVersions(fullBrowserVersion, '12.1.0');
      if (compare === -1) {
        setDisplayMsg({severity: "error", message: "This version of Safari is not supported. Please update your system."});
        valid = false;
      }
    }
    return valid;
  }

  useEffect(() => {
    if (!credentials) return;

    let valid = validateBrowserVersion();

    if (!valid) return;

    let settings = {
      insertMode: 'append',
      width: '100%',
      height: '100%',
      mirror: false,
      showControls: false,
      publishAudio: false,
      publishVideo: true,
      resolution: "1280x720",
      audioBitrate: 96000,
      enableStereo: false,
      maxResolution: {width: 1280, height: 720},
    };

    if (props.user.id === course.instructor.id) {
      settings.publishAudio = true;
      setPublishAudio(true);
    }

    if (credentials.apiKey && credentials.sessionId) {
      initializeSession(credentials.apiKey, credentials.sessionId, settings);
    }
  }, [credentials, props.user, props.course]);

  function streamDestroyed(event) {
    log.debug('OPENTOK:: stream destroyed', event);
    let data = JSON.parse(event.stream.connection.data);

    setStreams(streams => streams.filter(item => item.user.id !== data.id));
    setSubs(subs => subs.filter(item => item.user.id !== data.id));
    setupLoopMode();
  }

  function streamCreated(event) {

    let data = JSON.parse(event.stream.connection.data);
    log.debug('OPENTOK:: stream created event', event, data);
    let subscriber = null;

    let props = {
      insertMode: 'append',
      width: '100%',
      height: '100%',
      preferredResolution: {width: 1280, height: 720},
      showControls: false,
      subscribeToAudio: true,
      subscribeToVideo: false,
    };

    if (data.instructor) {
      props.subscribeToVideo = true;
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
    let data = evt;

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
            <Typography variant="body2" className={classes.chatUsername}>{message.username} [{format(new Date(message.date), 'h:mm aa')}]: </Typography>
            <Typography variant="body1" className={classes.chatMsg}>{message.message}</Typography>
          </Grid>
        ))}
      </Grid>
    </Grid>
  );

  let featurePanel = (
    <Grid xs item style={{height: "100%", overflow: "hidden"}}>
      <Paper style={{height: "100%", overflow: "hidden"}}>
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
  let videoTitle = "Enable camera";
  if (publishVideo) {
    videoBtn = (<VideocamOutlined />);
    videoTitle = "Disable camera";
  }

  let micBtn = (<MicOffOutlined />);
  let micTitle = "Enable microphone";
  if (publishAudio) {
    micBtn = (<MicNone />);
    micTitle = "Disable microphone"
  }

  let videoControls = (
    <Grid item className={classes.videoControls}>
      <Box>
        <Grid id="publisher" className={classes.publisher}></Grid>
        <IconButton title={videoTitle} onClick={toggleVideo}>
          {videoBtn}
        </IconButton>
        <IconButton title={micTitle} onClick={toggleAudio}>
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
              <Grid item container direction="row" justify="flex-end" alignItems="center" alignContent="center" style={{width: "100%"}}>
                <Grid item>
                  <Loop/>
                </Grid>
                <Grid item>
                  <Switch checked={loopMode} onChange={toggleLoopMode} title="Rotate participants viewed" name="loop" />
                </Grid>
              </Grid>
              <Grid item container style={{width: "100%"}}>
                {participantsControls}
              </Grid>
            </Grid>
          </ExpansionPanelDetails>
        </ExpansionPanel>
        <ExpansionPanel defaultExpanded>
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

  const [drawer, setDrawer] = useState(true);
  function toggleDrawer() {
    if (drawer) {
      setDrawer(false);
    } else {
      setDrawer(true);
    }
  }

  let drawerBtn = (
    <IconButton title="Expand video controls" onClick={toggleDrawer} className={classes.drawerBtn}>
      <ChevronLeft />
    </IconButton>
  );
  let drawerContent = (
    <Grid item className={classes.drawer} style={{ display: "none"}}>
      {videoControls}
    </Grid>
  );
  if (drawer) {
    drawerContent = (
      <Grid item xs={3} className={classes.drawer}>
        {videoControls}
      </Grid>
    );
    drawerBtn = (
      <IconButton title="Collapse video controls" onClick={toggleDrawer} className={classes.drawerBtn}>
        <ChevronRight />
      </IconButton>
    );
  }

  let participantsClass = classes.subscriberGrid;
  let instructor = props.course.instructor;

  if (props.user.id === instructor.id) {
    participantsClass = classes.subscriberGridAlt;
  }

  let participantsVideo = (
    <Grid xs item style={{height:"100%", overflow: "hidden"}}>
      <Grid container direction="row" justify="flex-start" className={participantsClass} style={{height:"100%", overflow: "hidden"}}>
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


  // Instructor example
  /*participantsVideo = (
    <Grid xs item style={{height:"100%", overflow: "hidden"}}>
      <Grid container direction="row" justify="flex-start" className={classes.subscriberGridAlt} style={{height:"100%", overflow: "hidden"}}>
          <Grid key="user1" item className={classes.subscriberFeature} style={{order: 1}}>
            <Box id="user1" className={classes.subscriberFeatureVid} />
            <Box className={classes.subscriberLabelBox}>
              <Typography align="center" variant="h5" className={classes.subscriberLabel}>user 1</Typography>
            </Box>
          </Grid>
          <Grid key="user2" item className={classes.subscriberItemAlt} style={{order: 2, background: "green"}}>
            <Box id="user2" className={classes.subscriberFeatureVid} />
            <Box className={classes.subscriberLabelBox}>
              <Typography align="center" variant="h5" className={classes.subscriberLabel}>user 2</Typography>
            </Box>
          </Grid>
          <Grid key="user3" item className={classes.subscriberItemAlt} style={{order: 3, background: "red"}}>
            <Box id="user3" className={classes.subscriberFeatureVid} />
            <Box className={classes.subscriberLabelBox}>
              <Typography align="center" variant="h5" className={classes.subscriberLabel}>user 3</Typography>
            </Box>
          </Grid>
          <Grid key="user4" item className={classes.subscriberItemAlt} style={{order: 4, background: "blue"}}>
            <Box id="user4" className={classes.subscriberFeatureVid} />
            <Box className={classes.subscriberLabelBox}>
              <Typography align="center" variant="h5" className={classes.subscriberLabel}>user 3</Typography>
            </Box>
          </Grid> 
          <Grid key="user5" item className={classes.subscriberItemAlt} style={{order: 5, background: "yellow"}}>
            <Box id="user5" className={classes.subscriberFeatureVid} />
            <Box className={classes.subscriberLabelBox}>
              <Typography align="center" variant="h5" className={classes.subscriberLabel}>user 5</Typography>
            </Box>
          </Grid>
          <Grid key="user6" item className={classes.subscriberItemAlt} style={{order: 5, background: "yellow", display: "hidden"}}>
            <Box id="user6" className={classes.subscriberFeatureVid} />
            <Box className={classes.subscriberLabelBox}>
              <Typography align="center" variant="h5" className={classes.subscriberLabel}>user 6</Typography>
            </Box>
          </Grid>
      </Grid>
    </Grid>
  );*/

  // Participant example
  /*participantsVideo = (
    <Grid xs item style={{height:"100%", overflow: "hidden"}}>
      <Grid container direction="row" justify="flex-start" className={classes.subscriberGrid} style={{height:"100%", overflow: "hidden"}}>
          <Grid key="user1" item className={classes.subscriberItem} style={{order: 1}}>
            <Box id="user1" className={classes.subscriberFeatureVid} />
            <Box className={classes.subscriberLabelBox}>
              <Typography align="center" variant="h5" className={classes.subscriberLabel}>user 1</Typography>
            </Box>
          </Grid>
          <Grid key="user2" item className={classes.subscriberItem} style={{order: 2, background: "green"}}>
            <Box id="user2" className={classes.subscriberFeatureVid} />
            <Box className={classes.subscriberLabelBox}>
              <Typography align="center" variant="h5" className={classes.subscriberLabel}>user 2</Typography>
            </Box>
          </Grid>          
      </Grid>
    </Grid>
  );*/

  let participantsVideoContent = (
    <Grid item style={{height:"100%", overflow: "hidden"}}>
      {participantsVideo}
    </Grid>
  );

  if (course && user && user.id === course.instructor.id) {
    participantsVideoContent = (
      <Grid item xs style={{height:"100%", overflow: "hidden"}}>
        {participantsVideo}
      </Grid>
    );
  }

  if (subsRef.current.length === 0) {
    participantsVideo = null;
  }

  let displayMsgContent = null;
  
  if (displayMsg) {
    displayMsgContent = (
      <Alert severity={displayMsg.severity}>{displayMsg.message}</Alert>
    )
  }

  return (
    <Grid style={{width: "100%", height: "100%", overflow: "hidden"}}>
      {displayMsgContent}
      <Grid container direction="row" justify="flex-start" style={{height:"100%", overflow: "hidden"}}>
        <Grid container direction="row" spacing={0} justify="flex-start" style={{height: "100%", overflow: "hidden"}} >
          {featurePanel}
          {participantsVideoContent}
          <Grid item style={{width: 0}}>
            {drawerBtn}
          </Grid>
          {drawerContent}
        </Grid>
      </Grid>
    </Grid>
  );
}