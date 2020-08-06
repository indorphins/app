import React, {useState, useEffect, useRef} from 'react';
import { 
  Box, 
  Grid, 
  Chip,
  IconButton, 
  Checkbox,  
  Typography, 
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
  ExpandMoreOutlined,
  Loop,
  ChevronLeft,
  ChevronRight,
  Person,
  Group,
} from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { Alert } from '@material-ui/lab';
import * as OT from '@opentok/client';
import { isSafari, isMobile, fullBrowserVersion } from 'react-device-detect';
import compareVersions from 'compare-versions';
import { useSnackbar } from 'notistack';

import Chat from './video/chat';
import Emote from './video/emote';
import MuteButton from './video/mute';
import PermissionsError from './video/permissionsError';
import log from '../log';

const useStyles = makeStyles((theme) => ({
  publisher: {
    height: 240,
    width: 320,
    background: theme.palette.grey[100],
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
    height: "calc(100% / 3)",
    background: theme.palette.grey[100],
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
    width: "calc(100% / 3)",
    background: theme.palette.grey[100],
  },
  subscriberFeatureVid: {
    height: "100%",
  },  
  subscriberFeature: {
    height: "75%",
    width: "100%",
    background: theme.palette.grey[50],
  },
  subscriberLabelBox: {
    position: 'relative',
    bottom: '50px',
  },
  subscriberLabel: {
    fontSize: "2rem",
    color: theme.palette.grey[800],
  },
  instructor: {
    height: "100%",
    width: "100%",
    background: theme.palette.grey[50],
  },
  videoControls: {},
  drawer: {
    height: "100%",
    overflowY: "scroll",
    overflowX: "hidden",
    backgroundColor: "#0e0e0e",
  },
  drawerBtn: {
    position: 'relative',
    top: '10px',
    right: '50px',
    zIndex: '9999',
  },
  shown: {
    display: "block",
  },
  hidden: {
    display: "none",
  },
}));

export default function(props) {

  let looper = null;
  const loopTime = 20000;
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const [maxStreams, setMaxStreams] = useState(3)
  const [user, setUser] = useState(null);
  const [videoSubsCount, setVideoSubsCount] = useState(0);
  const [subs, setSubs] = useState([]);
  const [course, setCourse] = useState(null);
  const [credentials, setCredentials] = useState(null);
  const [session, setSession] = useState(null);
  const [publisher, setPublisher] = useState(null);
  const [publishVideo, setPublishVideo] = useState(true);
  const [publishAudio, setPublishAudio] = useState(false);
  const [loopMode, setLoopMode] = useState(true);
  const [fullscreenMode, setFullscreenMode] = useState(false);
  const [displayMsg, setDisplayMsg] = useState(null);
  const [permissionsError, setPermissionsError] = useState(false);
  const subsRef = useRef();
  const videoSubsCountRef = useRef();
  const fullscreenRef = useRef();

  subsRef.current = subs;
  videoSubsCountRef.current = videoSubsCount;
  fullscreenRef.current = fullscreenMode;

  async function handleError(err) {
    if (err) {
      log.error("OPENTOK::", err);

      if (err.name === 'OT_HARDWARE_UNAVAILABLE') {
        setDisplayMsg({severity: "error", message: "We cannot access your camera or microphone, they are already in use by another application."});
        return;
      }

      if (err.name === 'OT_NOT_SUPPORTED') {
        setDisplayMsg({severity: "error", message: "Device not supported."});
        return;
      }

      if (err.name === 'OT_TIMEOUT' || err.name === 'OT_MEDIA_ERR_NETWORK') {
        setDisplayMsg({severity: "warning", message: "Network connection slow. Disabling participant video. Try moving closer to your router if possible, or check your internet speed, and then refresh this page."});
        setSubs(subs.map(item => {
          if (item.video) {
            item.video = false;
            item.className = `${classes.subscriberItem} ${classes.hidden}`
            item.subscriber.subscribeToVideo(false);
            setVideoSubsCount(videoSubsCountRef.current - 1);
          }
          return item;
        }));
        setFullscreenMode(true);
        setLoopMode(false);
        return;
      }
    }
  }

  async function initializeSession(apiKey, sessionId, settings) {

    let session = OT.initSession(apiKey, sessionId);
    

    log.debug("session publish", session.capabilities.publish);

    if (session.capabilities.publish !== 0) {
      setDisplayMsg({severity: "error", message: "Not allowed to publish to session"});
      return;
    }

    setSession(session);

    settings.name = session.data;
  
    // Create a publisher
    let publisher = OT.initPublisher('publisher', settings, handleError);
    setPublisher(publisher);

    publisher.on({
      accessDenied: function accessDeniedHandler(event) {
        setPermissionsError(true);
      }
    });
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
      mirror: true,
      showControls: false,
      insertDefaultUI: true,
      publishAudio: false,
      publishVideo: true,
      resolution: "640x480",
      frameRate: 30,
      audioBitrate: 20000,
      enableStereo: false,
      maxResolution: {width: 1280, height: 720},
    };

    if (user.id === course.instructor.id) {
      settings.resolution = "1280x720";
      settings.audioBitrate = 96000;
      settings.disableAudioProcessing = true;
      settings.publishAudio = true;
      setPublishAudio(true);
    }

    if (credentials.apiKey && credentials.sessionId) {
      initializeSession(credentials.apiKey, credentials.sessionId, settings);
    }
  }, [credentials, user, course]);


  function streamDestroyed(event) {
    log.debug('OPENTOK:: stream destroyed', event);
    let data = JSON.parse(event.stream.connection.data);

    setSubs(subs => subs.filter(item => item.user.id !== data.id));
    if (loopMode) {
      setupLoopMode();
    }
  }

  async function streamCreated(event) {

    let data = JSON.parse(event.stream.connection.data);
    log.debug('OPENTOK:: stream created event', event, data);
    let subscriber = null;

    let props = {
      insertMode: 'append',
      width: '100%',
      height: '100%',
      preferredFrameRate: 30,
      preferredResolution: {width: 320, height: 240},
      showControls: false,
      insertDefaultUI: true,
      subscribeToAudio: true,
      subscribeToVideo: false,
      fitMode: "cover",
    };

    if (data.instructor) {
      props.preferredFrameRate = 30;
      props.preferredResolution = {width: 1280, height: 720};
      props.subscribeToVideo = true;
      subscriber = await session.subscribe(event.stream, 'feature', props, handleError);
      return;
    }

    let classname = `${classes.subscriberItem} ${classes.hidden}`;
    let order = 0;

    if (event.stream.hasVideo && videoSubsCountRef.current < maxStreams && !fullscreenRef.current) {
      if (videoSubsCountRef.current === 0 && user.id === course.instructor.id) {
        props.preferredResolution = {width: 1280, height: 720};
        props.preferredFrameRate = 30;
        classname = `${classes.subscriberFeature} ${classes.shown}`;
      } else if (videoSubsCountRef.current !== 0 && user.id === course.instructor.id) {
        classname = `${classes.subscriberItemAlt} ${classes.shown}`;
      } else {
        classname = `${classes.subscriberItem} ${classes.shown}`;
      }

      props.subscribeToVideo = true;
      order = videoSubsCountRef.current + 1;
      setVideoSubsCount(order);
    }

    setSubs(subs => [...subs, {
      user: data, 
      stream: event.stream,
      audio: props.subscribeToAudio,
      video: props.subscribeToVideo,
      className: classname,
      order: order,
    }]);

    try {
      subscriber = await session.subscribe(event.stream, data.id, props, handleError);
    } catch (err) {
      log.error("Subscribe to stream", err);
    }

    log.debug("Created subscriber", subscriber);

    setSubs(subs => subs.map(item => {
      if (item.user.id === data.id) {
        item.subscriber = subscriber;
      }
      return item;
    }));
  }

  async function loop() {
    
    if (!loopMode || subsRef.current.length <= maxStreams) {
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
      if (i < maxStreams) {
        if (i === 0 && props.user.id === props.course.instructor.id) {
          updated[i].subscriber.preferredResolution = {width: 640, height: 480};
          updated[i].subscriber.preferredFrameRate = 30;
          updated[i].className = `${classes.subscriberFeature} ${classes.shown}`;
        } else if (i !== 0 && props.user.id === props.course.instructor.id) {
          updated[i].subscriber.preferredResolution = {width: 320, height: 240};
          updated[i].subscriber.preferredFrameRate = 15;
          updated[i].className = `${classes.subscriberItemAlt} ${classes.shown}`;
        } else {
          updated[i].className = `${classes.subscriberItem} ${classes.shown}`;
        }
        updated[i].video = true;
        updated[i].order = i;
        updated[i].subscriber.subscribeToVideo(true);
      } else {
        updated[i].className = `${classes.subscriberItem} ${classes.hidden}`;
        updated[i].video = false;
        updated[i].order = 0;
        updated[i].subscriber.subscribeToVideo(false);
      }
    }

    setSubs(updated.concat([]));
  }

  async function setupLoopMode() {
    let updated = subsRef.current;
    let count = 0;

    for (var i = 0; i < updated.length; i++) {
      if (i < maxStreams) {
        if (i === 0 && props.user.id === props.course.instructor.id) {
          updated[i].subscriber.preferredResolution = {width: 640, height: 480};
          updated[i].subscriber.preferredFrameRate = 30;
          updated[i].className = `${classes.subscriberFeature} ${classes.shown}`;
        } else if (i !== 0 && props.user.id === props.course.instructor.id) {
          updated[i].subscriber.preferredResolution = {width: 320, height: 240};
          updated[i].subscriber.preferredFrameRate = 15;
          updated[i].className = `${classes.subscriberItemAlt} ${classes.shown}`;
        } else {
          updated[i].className = `${classes.subscriberItem} ${classes.shown}`;
        }
        updated[i].video = true;
        updated[i].subscriber.subscribeToVideo(true);
        updated[i].order = count;
        count = count + 1;
      } else {
        updated[i].video = false;
        updated[i].className = `${classes.subscriberItem} ${classes.hidden}`;
        updated[i].subscriber.subscribeToVideo(false);
        updated[i].order = 0;
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

  async function toggleFullscreenMode() {
    if (fullscreenMode) {
      setFullscreenMode(false);
      setLoopMode(true);
      setupLoopMode();
    } else {
      setSubs(subs.map(item => {
        if (item.video) {
          item.video = false;
          item.className = `${classes.subscriberItem} ${classes.hidden}`
          item.subscriber.subscribeToVideo(false);
          setVideoSubsCount(videoSubsCountRef.current - 1);
        }
        return item;
      }));
      setFullscreenMode(true);
      setLoopMode(false);
    }

    if (drawer) {
      toggleDrawer();
    }
  }

  async function toggleSubscriberVideo(evt) {
    let data = evt.target.name;
    
    let disabled = false;
    let current = subsRef.current.filter(item => { return item.user.id === data });

    if (current[0].video) {
      current[0].video = false;
      current[0].className = `${classes.subscriberItem} ${classes.hidden}`
      current[0].subscriber.subscribeToVideo(false);
      current[0].order = 0;
      disabled = true;
      setVideoSubsCount(videoSubsCountRef.current - 1);
    } else {
      if (videoSubsCountRef.current < maxStreams) {
        if (user.id === course.instructor.id) {
          current[0].className = `${classes.subscriberFeature} ${classes.shown}`;
        } else {
          current[0].className = `${classes.subscriberItem} ${classes.shown}`;
        }
        current[0].video = true;
        current[0].order = 1;
        current[0].subscriber.subscribeToVideo(true);
        setVideoSubsCount(videoSubsCountRef.current + 1);
      }
    }

    if (user.id === course.instructor.id) {
      let index = 2;

      setSubs(subs.map(item => {
        if (item.user.id === data) {
          return current[0];
        }

        if (item.video) {
          item.order = index;
          if (disabled && index === 2) {
            item.className = `${classes.subscriberFeature} ${classes.shown}`;
          } else {
            item.className = `${classes.subscriberItemAlt} ${classes.shown}`;
          }
          index++;
        } else {
          item.className = `${classes.subscriberItemAlt} ${classes.hidden}`;
        }

        return item;
      }));
    }
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

    if (event.type === "signal:emote") {
      let data = JSON.parse(event.data);
      if (data.userId === user.id) {
        enqueueSnackbar(data.message, {
          persist: false,
          autoHideDuration: 5000,
          anchorOrigin: { horizontal: "left", vertical: "top" }
        });
      }
    }
  };

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
    if (props.user.id === props.course.instructor.id) setMaxStreams(4);
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

  let chatWindow = (<Grid></Grid>);

  if (session && user) {
    chatWindow = (
      <Chat session={session} user={user} />
    );
  }

  let fullscreenBtn = null;
  if (user && course && user.id !== course.instructor.id) {
    if (fullscreenMode) {
      fullscreenBtn = (
        <IconButton title="Watch instructor and class participants" onClick={toggleFullscreenMode}>
          <Group />
        </IconButton>
      );
    } else {
      fullscreenBtn = (
        <IconButton title="Watch instructor only" onClick={toggleFullscreenMode}>
          <Person />
        </IconButton>
      );
    }
  }

  let featurePanel = (
    <Grid xs item style={{height: "100%", overflow: "hidden", position: "relative"}}></Grid>
  );

  if (course && session && user) {
    featurePanel = (
      <Grid xs item style={{height: "100%", overflow: "hidden", position: "relative"}}>
        <Box id="feature" className={classes.instructor} />
        <Grid style={{position: "absolute", zIndex: 999, bottom: "10px", right: "10px"}}>
          <Emote userId={course.instructor.id} username={user.username} session={session} />
        </Grid>
        <Grid style={{position: "absolute", zIndex: 999, top: "10px", left: "20px"}}>
          {fullscreenBtn}
        </Grid>
      </Grid>
    );
  }

  if (user && course && user.id === course.instructor.id) {
    featurePanel = null;
  }

  let participantsControls = (
    <Grid container direction="column" justify="flex-start" alignItems="flex-start">
      {subs.map(item => (
        <Grid item key={item.user.id}>
          <Checkbox disabled={loopMode} name={item.user.id} checked={item.video} onClick={toggleSubscriberVideo} />
          <Chip label={item.user.username} />
          <MuteButton name={item.user.id} checked={item.audio} onClick={toggleSubscriberAudio} />
          <Emote userId={item.user.id} username={user.username} session={session} />
        </Grid>
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
    <Grid className={classes.videoControls}>
      <Box>
        <Grid id="publisher" className={classes.publisher}></Grid>
        <IconButton title={videoTitle} onClick={toggleVideo}>
          {videoBtn}
        </IconButton>
        <IconButton title={micTitle} onClick={toggleAudio}>
          {micBtn}
        </IconButton>
        {fullscreenBtn}
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
              <Grid item style={{width: "100%"}}>
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

  if (user && course && user.id === course.instructor.id) {
    participantsClass = classes.subscriberGridAlt;
  }

  let participantsVideo = (
    <Grid xs item style={{height:"100%", overflow: "hidden"}}>
      <Grid container direction="row" justify="flex-start" className={participantsClass} style={{height:"100%", overflow: "hidden"}}>
        {subs.map(item => (
          <Grid key={item.user.id} item className={item.className} style={{order: item.order, position: "relative"}}>
            <Box id={item.user.id} className={classes.subscriberFeatureVid} />
            <Box className={classes.subscriberLabelBox}>
              <Typography align="center" variant="h5" className={classes.subscriberLabel}>{item.user.username}</Typography>
            </Box>
            <Grid style={{position: "absolute", zIndex: 999, bottom: "10px", right: "10px"}}>
              <Emote userId={item.user.id} username={user.username} session={session} />
            </Grid>
          </Grid>
        ))}
      </Grid>
    </Grid>
  );

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

  if (permissionsError) {
    return (
      <Grid style={{width: "100%", height: "100%", overflow: "hidden"}}>
        <PermissionsError />      
      </Grid>
    );
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