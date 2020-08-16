import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Grid, 
  Typography, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails,
  Switch,
} from '@material-ui/core';
import { 
  ExpandMoreOutlined,
  Loop,
} from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { Alert } from '@material-ui/lab';
import * as OT from '@opentok/client';
import { isSafari, isMobile, fullBrowserVersion } from 'react-device-detect';
import compareVersions from 'compare-versions';
import { useSnackbar } from 'notistack';

import Chat from './video/chat';
import Drawer from './video/drawer';
import PermissionsError from './video/permissionsError';
import ParticipantControls from './video/participantControls';
import PublisherControls from './video/publisherControls';
import log from '../log';

import Vertical from './video/layout/vertical';

const useStyles = makeStyles((theme) => ({
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
  videoControls: {},
}));

export default function VideoConference(props) {

  let looper = null;
  const loopTime = 5000;
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const [maxStreams, setMaxStreams] = useState(4);
  const [user, setUser] = useState(null);
  const [course, setCourse] = useState(null);
  const [credentials, setCredentials] = useState(null);
  const [session, setSession] = useState(null);
  const [publisher, setPublisher] = useState(null);
  const [subs, setSubs] = useState([]);
  const [subsShown, setSubsShown] = useState([]);
  const [loopMode, setLoopMode] = useState(true);
  const [displayMsg, setDisplayMsg] = useState(null);
  const [permissionsError, setPermissionsError] = useState(false);
  const subsRef = useRef();
  subsRef.current = subs;

  async function handleError(err) {
    if (err) {
      log.error("OPENTOK::", err);

      if (err.name === 'OT_HARDWARE_UNAVAILABLE') {
        setDisplayMsg({
          severity: "error",
          message: "We cannot access your camera or microphone, they are already in use by another application."
        });
        return;
      }

      if (err.name === 'OT_NOT_SUPPORTED') {
        setDisplayMsg({severity: "error", message: "Device not supported."});
        return;
      }

      if (err.name === 'OT_TIMEOUT' || err.name === 'OT_MEDIA_ERR_NETWORK') {
        setDisplayMsg({
          severity: "warning",
          message: `Network connection slow. Disabling participant video. 
          Try moving closer to your router if possible, or check your internet speed, and then refresh this page.`
        });
        setMaxStreams(1);
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
      setDisplayMsg({
        severity: "warning",
        message: "Indoorphins classes are not yet optimized for mobile devices. Apologies for the inconvenience."
      });
      valid = false;
    }

    if (isSafari) {
      let compare = compareVersions(fullBrowserVersion, '12.1.0');
      if (compare === -1) {
        setDisplayMsg({
          severity: "error",
          message: "This version of Safari is not supported. Please update your system."
        });
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
      //mirror: true,
      mirror: false,
      showControls: false,
      insertDefaultUI: true,
      publishAudio: false,
      publishVideo: true,
      resolution: "640x480",
      frameRate: 30,
      audioBitrate: 20000,
      enableStereo: false,
      //maxResolution: {width: 640, height: 480},
      maxResolution: {width: 320, height: 240},
    };

    if (user.id === course.instructor.id) {
      settings.resolution = "1280x720";
      settings.audioBitrate = 96000;
      settings.disableAudioProcessing = false;
      settings.publishAudio = true;
      //settings.maxResolution = {width: 1280, height: 720};
      settings.maxResolution = {width: 640, height: 480};
    }

    if (credentials.apiKey && credentials.sessionId) {
      initializeSession(credentials.apiKey, credentials.sessionId, settings);
    }
  }, [credentials, user, course]);


  function streamDestroyed(event) {
    log.debug('OPENTOK:: stream destroyed', event);
    let data = JSON.parse(event.stream.connection.data);
    setSubs(subs => subs.filter(item => item.user.id !== data.id));
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
      insertDefaultUI: false,
      subscribeToAudio: true,
      subscribeToVideo: false,
    };

    if (data.instructor) {
      props.subscribeToVideo = true;
      props.preferredResolution = {width: 640, height: 480};
    }

    try {
      subscriber = await session.subscribe(event.stream, null, props, handleError);
    } catch (err) {
      log.error("Subscribe to stream", err);
    }

    log.debug("Created subscriber", subscriber);

    let subData = {
      user: data, 
      subscriber: subscriber,
      audio: props.subscribeToAudio,
      video: props.subscribeToVideo,
      videoElement: null,
      disabled: false,
    };

    if (data.instructor) {
      setSubs(subs => [subData, ...subs]);
    } else {
      setSubs(subs => [...subs, subData]);
    }

    subscriber.on('videoElementCreated', (event) => {

      log.debug("Got subscriber video element", event);

      let videoElement = event.element;
      videoElement.style.height = "100%";
      videoElement.style.width = "100%";
      videoElement.style.objectFit = "cover";
      videoElement.style.objectPosition = "center";

      setSubs(subs => subs.map(item => {
        if (item.user.id === data.id) {
          item.videoElement = videoElement;
        }
        return item;
      }));
    });

    subscriber.on('videoDisabled', (event) => {
      log.debug("subscriber video disabled", event);
      if (event.reason === "publishVideo") {
        setSubs(subs => subs.map(item => {
          if (item.user.id === data.id) {
            item.disabled = true;
            item.subscriber.subscribeToVideo(false);
          }
          return item;
        }));
      }
    });

    subscriber.on('videoEnabled', (event) => {
      log.debug("subscriber video enabled", event);
      if (event.reason === "publishVideo") {
        setSubs(subs => subs.map(item => {
          if (item.user.id === data.id) {
            item.disabled = false;
            if (item.video) {
              item.subscriber.subscribeToVideo(true);
            }
          }
          return item;
        }));
      }
    });
  }

  useEffect(() => {
    if (subs.length && subs.length > 0) {

      let enabled = [];
      let dis = [];

      if (loopMode) {

        enabled = subs.filter(item => {
          return !item.disabled;
        }).slice(0, maxStreams - 1);

        dis = subs.filter(item => {
          return !item.disabled;
        }).slice(maxStreams - 1);

      } else {

        enabled = subs.filter(item => {
          return !item.disabled && item.video;
        }).slice(0, maxStreams - 1);

        dis = subs.filter(item => {
          return !item.disabled && item.video;
        }).slice(maxStreams - 1);
      }
      
      log.debug("enabled", enabled);
      enabled.map(item => {
        item.video = true;
        item.subscriber.subscribeToVideo(true);
        return item;
      });

      log.debug("disabled", dis);
      dis.map(item => {
        item.video = false;
        item.subscriber.subscribeToVideo(false);
        return item;
      })

      setSubsShown([...enabled]);
    }
  }, [subs, loopMode]);

  useEffect(() => {
    if (loopMode) {
      looper = setInterval(() => {
        loop(subs, user, course);
      }, loopTime);
    } else {
      clearInterval(looper);
    }

    return function() {
      clearInterval(looper);
    };
  }, [subs, loopMode, user, course]);

  async function loop(subs, user, course) {
    if (subs && subs.length > 1) {
      let expired = null;
      if (user.id === course.instructor.id) {
        expired = subs.splice(0,1)[0];
      } else {
        expired = subs.splice(1,1)[0];
      }

      if (expired) {
        log.debug("set new loop order", [...subs, expired]);
        setSubs([...subs, expired]);
      }
    }
  }

  async function toggleLoopMode() {
    setLoopMode(!loopMode);
  }

  async function toggleSubscriberVideo(evt) {
    let data = evt.target.name;
    let index = subsRef.current.findIndex(item => {
      return item.user.id === data;
    });

    if (index < 0) return;

    let items = subsRef.current;
    let item = items.splice(index, 1)[0];

    if (item) {
      log.debug("toggle item", item);

      if (item.video) {
        item.video = false;
        item.subscriber.subscribeToVideo(false);
        setSubs([...items, item]);
      } else {
        item.video = true;
        item.subscriber.subscribeToVideo(true);
        setSubs([item, ...items]);
      }
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
  }

  useEffect(() => {
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

  let accor = (
    <Box>
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreOutlined />}>
          <Typography variant="h5">Participants</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container direction="column">
            <Grid
              item
              container
              direction="row"
              justify="flex-end"
              alignItems="center"
              alignContent="center"
              style={{width: "100%"}}
            >
              <Grid item>
                <Loop />
              </Grid>
              <Grid item>
                <Switch checked={loopMode} onChange={toggleLoopMode} title="Rotate participants viewed" name="loop" />
              </Grid>
            </Grid>
            <Grid item style={{width: "100%"}}>
              <ParticipantControls
                user={user}
                course={course}
                session={session}
                subs={subs}
                loopMode={loopMode}
                audioHandler={toggleSubscriberAudio}
                videoHandler={toggleSubscriberVideo} 
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreOutlined />}>
          <Typography variant="h5">Chat</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Chat session={session} user={user} />
        </AccordionDetails>
      </Accordion>
    </Box>
  )

  let videoControls = (
    <Grid className={classes.videoControls}>
      <PublisherControls publisher={publisher} user={user} course={course} />
      {accor}
    </Grid>
  );

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
          <Vertical user={user} subs={subsShown} session={session} max={maxStreams} />
          <Drawer>
            {videoControls}
          </Drawer>
        </Grid>
      </Grid>
    </Grid>
  );
}