import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Grid, 
  Typography, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails,
  Switch,
  makeStyles,
} from '@material-ui/core';
import { 
  ExpandMoreOutlined,
  Loop,
} from '@material-ui/icons';
import { Alert } from '@material-ui/lab';
import * as OT from '@opentok/client';
import { isSafari, isMobile, fullBrowserVersion } from 'react-device-detect';
import compareVersions from 'compare-versions';
import { useSnackbar } from 'notistack';

//import { store, actions } from '../../store';
import Chat from './chat';
import Drawer from './drawer';
import PermissionsError from './permissionsError';
import ParticipantControls from './participantControls';
import PublisherControls from './publisherControls';
import log from '../../log';

import Default from './layout/default';
import LayoutPicker from './layout/picker';

const useStyles = makeStyles((theme) => ({
  settingsIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "48px",
    height: "48px",
  }
}));

export default function Video(props) {

  const classes = useStyles();
  let looper = null;
  const loopTime = 15000;
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
  const [videoLayout, setVideoLayout] = useState("horizontal");
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

    if (session.capabilities.publish !== 0) {
      setDisplayMsg({severity: "error", message: "Not allowed to publish to session"});
      return;
    }

    setSession(session);
    settings.name = session.data;
  
    let publisher = OT.initPublisher('publisher', settings, handleError);
    log.info("OPENTOK:: publisher created", publisher);
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
    if (credentials && user && course) {

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
        resolution: "320x240",
        frameRate: 30,
        audioBitrate: 20000,
        enableStereo: false,
        maxResolution: {width: 640, height: 480},
      };

      if (user.id === course.instructor.id) {
        settings.audioBitrate = 96000;
        settings.disableAudioProcessing = false;
        settings.publishAudio = true;
        settings.frameRate = 30;
        settings.resolution = "640x480";
        settings.maxResolution = {width: 1280, height: 720};
      } /*else {
        store.dispatch(actions.feedback.setCourse(course));
        store.dispatch(actions.feedback.setShow(true));
      }*/

      if (credentials.apiKey && credentials.sessionId) {
        initializeSession(credentials.apiKey, credentials.sessionId, settings);
      }
    }
  }, [credentials, user, course]);

  useEffect(() => {

    if (!session) return;

    log.debug("OPENTOK:: session object", session);

    // Subscribe to stream events
    if (session.on) {
      session.on('connectionCreated', connectionCreated);
      session.on('connectionDestroyed', connectionDestroyed);
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
          session.publish(publisher, handleError);
        }

      });
    }

    return function() {
      // disconnect the event listeners
      session.off('connectionCreated');
      session.off('connectionDestroyed');
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
      if (session && session.connection) session.disconnect();
      log.debug('OPENTOK:: disconnected from video session');
    }
  }, [session, publisher]);

  function connectionCreated(event) {
    log.info("OPENTOK:: connection created", event);
  }

  function connectionDestroyed(event) {
    log.info("OPENTOK:: connection destroyed", event);
    let data = JSON.parse(event.connection.data);
    setSubs(subs => subs.filter(item => item.user.id !== data.id));
  }

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
      subscribeToVideo: true,
    };

    if (data.instructor) {
      props.preferredFrameRate = 30;
      props.subscribeToVideo = true;
      props.preferredResolution = {width: 1280, height: 720};
    }

    try {
      subscriber = await session.subscribe(event.stream, null, props, handleError);
    } catch (err) {
      log.error("Subscribe to stream", err);
    }

    log.debug("OPENTOK:: created subscriber", subscriber);

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

      log.debug("OPENTOK:: subscriber video element created", event);

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
      log.debug("OPENTOK:: subscriber video disabled", event);
      if (event.reason === "publishVideo") {
        setSubs(subs => subs.map(item => {
          if (item.user.id === data.id) {
            item.disabled = true;
          }
          return item;
        }));
      }
    });

    subscriber.on('videoEnabled', (event) => {
      log.debug("OPENTOK:: subscriber video enabled", event);
      if (event.reason === "publishVideo") {
        setSubs(subs => subs.map(item => {
          if (item.user.id === data.id) {
            item.disabled = false;
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
        }).slice(0, maxStreams);

        dis = subs.filter(item => {
          return !item.disabled;
        }).slice(maxStreams);

      } else {

        enabled = subs.filter(item => {
          return !item.disabled && item.video;
        }).slice(0, maxStreams);

        dis = subs.filter(item => {
          return !item.disabled && item.video;
        }).slice(maxStreams);
      }
      
      log.debug("enabled", enabled);
      enabled.map(item => {
        if (!item.video) {
          item.video = true;
          //item.subscriber.subscribeToVideo(true);
        }
        return item;
      });

      log.debug("disabled", dis);
      dis.map(item => {
        if (item.video) {
          item.video = false;
          //item.subscriber.subscribeToVideo(false);
        }
        return item;
      });

      setSubsShown([...enabled]);
    }
  }, [subs, loopMode, maxStreams]);

  useEffect(() => {
    if (loopMode) {
      looper = setInterval(() => {
        if (subs && subs.length > 1) {
          let expired = null;

          if (user.id === course.instructor.id) {
            expired = subs[0];
          } else {
            expired = subs[1];
          }
    
          if (expired) {
            setSubs([
              ...subs.filter(i => i.user.id !== expired.user.id),
              expired
            ])
          }
        }
      }, loopTime);
    } else {
      clearInterval(looper);
    }

    return function() {
      clearInterval(looper);
    };
  }, [subs, loopMode, user, course]);

  async function toggleLayout(evt) {
    if (evt === "fullscreen") {
      setMaxStreams(1);
    } else {
      setMaxStreams(4);
    }
    setVideoLayout(evt);
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

    let item = subsRef.current[index];

    if (item) {
      log.debug("toggle item", item);

      if (item.video) {
        item.video = false;
        item.subscriber.subscribeToVideo(false);
        setSubs([...subsRef.current.filter(i => i.user.id !== item.user.id), item]);
      } else {
        item.video = true;
        item.subscriber.subscribeToVideo(true);

        if (user.id === course.instructor.id) {
          setSubs([item, ...subsRef.current.filter(i => i.user.id !== item.user.id)]);
        } else {
          setSubs([
            ...subsRef.current.filter(i => i.user.id === course.instructor.id),
            item,
            ...subsRef.current.filter(i => i.user.id !== item.user.id && i.user.id !== course.instructor.id)
          ])
        }
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
    if (props.credentials) setCredentials(props.credentials);
    if (props.course) setCourse(props.course);
    if (props.user) setUser(props.user);
  }, [props]);

  let settings = (
    <Grid container direction="column">
      <Grid item container direction="row" alignItems="center" alignContent="center">
        <Grid item className={classes.settingsIcon}>
          <LayoutPicker layout={videoLayout} onSelect={(evt) => toggleLayout(evt)} />
        </Grid>
        <Grid item xs>
          <Typography>Display</Typography>
        </Grid>
      </Grid>
      <Grid
        item
        container
        direction="row"
        justify="space-between"
        alignItems="center"
        alignContent="center"
      >
        <Grid item className={classes.settingsIcon}>
          <Loop />
        </Grid>
        <Grid item xs>
          <Typography>Rotate Videos</Typography>
        </Grid>
        <Grid item>
          <Switch checked={loopMode} onChange={toggleLoopMode} title="Rotate participants viewed" name="loop" />
        </Grid>
      </Grid>
    </Grid>
  );

  let controlsGrid = (
    <Grid container direction="column">
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
  )

  let accor = (
    <Box>
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreOutlined />}>
          <Typography variant="h5">Settings</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {settings}
        </AccordionDetails>
      </Accordion>
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreOutlined />}>
          <Typography variant="h5">Participants</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {controlsGrid}
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
          <Default user={user} subs={subsShown} session={session} max={maxStreams} layout={videoLayout} />
          <Drawer>
            <PublisherControls publisher={publisher} user={user} course={course} />
            {accor}
          </Drawer>
        </Grid>
      </Grid>
    </Grid>
  );
}