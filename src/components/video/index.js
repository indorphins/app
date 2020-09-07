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

//const loopTime = 5000;
const max = 2;
const vidProps = {
  preferredFrameRate: 30,
  preferredResolution: {width: 320, height: 240},
  showControls: false,
  insertDefaultUI: false,
  subscribeToAudio: true,
  subscribeToVideo: true,
};

const pubSettings = {
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

export default function Video(props) {

  const classes = useStyles();
  //let looper = null;
  const { enqueueSnackbar } = useSnackbar();
  const [maxStreams, setMaxStreams] = useState(max);
  const [user, setUser] = useState(null);
  const [course, setCourse] = useState(null);
  const [credentials, setCredentials] = useState(null);
  const [session, setSession] = useState(null);
  const [publisher, setPublisher] = useState(null);
  const [subs, setSubs] = useState([]);
  //const [subsShown, setSubsShown] = useState([]);
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

      let settings = pubSettings;

      if (user.id === course.instructor.id) {
        settings.audioBitrate = 96000;
        settings.disableAudioProcessing = false;
        settings.publishAudio = true;
        settings.frameRate = 30;
        settings.resolution = "640x480";
        settings.maxResolution = {width: 1280, height: 720};
      }

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
        if (sub.subscriber) session.unsubscribe(sub.subscriber);
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

    let data = JSON.parse(event.connection.data);

    if (data.id === user.id) return;

    let subData = {
      user: data,
      video: false,
      audio: false,
      disabled: false,
    };

    if (data.instructor) {
      setSubs(subs => [subData, ...subs]);
    } else {
      setSubs(subs => [...subs, subData]);
    }
  }

  function connectionDestroyed(event) {
    log.info("OPENTOK:: connection destroyed", event);
    let data = JSON.parse(event.connection.data);
    setSubs(subs => subs.filter(item => item.user.id !== data.id));
  }

  async function enableCandidate(candidate) {

    if (!candidate.stream) return;

    let props = vidProps;
    candidate.video = true;
    candidate.audio = true;

    let subscriber = null;

    setSubs(subs => subs.map(i => {
      if (i.user.id === candidate.user.id) {
        return candidate;
      }
      return i;
    }));

    try {
      subscriber = await session.subscribe(candidate.stream, null, props, handleError);
    } catch (err) {
      log.error("Subscribe to stream", err);
    }

    if (subscriber) {
      log.debug("OPENTOK:: created subscriber", subscriber);
      subscriber.on('videoElementCreated', (event) => { videoElementCreated(event, candidate.user.id) });
      subscriber.on('videoDisabled', (event) => { videoDisabled(event, candidate.user.id) });
      subscriber.on('videoEnabled', (event) => { videoEnabled(event, candidate.user.id)});

      setSubs(subs => subs.map(item => {
        if (item.user.id === candidate.user.id) {
          item.subscriber = subscriber;
        }
        return item;
      }));
    }
  }

  async function streamDestroyed(event) {
    log.debug('OPENTOK:: stream destroyed', event);
    let data = JSON.parse(event.stream.connection.data);

    setSubs(subs => subs.map(item => {
      if (item.user.id === data.id) {
        if (item.subscriber) session.unsubscribe(item.subscriber);
        item.subscriber = null;
        item.stream = null;

        if (item.video) {
          item.video = false;
          item.audio = false;
        }
      }
      return item;
    }));

    if (loopMode) {
      let current = subsRef.current.filter(i => { return i.video });

      if (current && current.length < maxStreams) {
        let diff = maxStreams - current.length;
        let candidates = subsRef.current.filter(i => { return !i.video && !i.disabled }).slice(0, diff);

        candidates.forEach(item => {
          enableCandidate(item);
        })
      }
    }
  }

  function videoElementCreated(event, id) {
    log.debug("OPENTOK:: subscriber video element created", event);

    let videoElement = event.element;
    videoElement.style.height = "100%";
    videoElement.style.width = "100%";
    videoElement.style.objectFit = "cover";
    videoElement.style.objectPosition = "center";

    setSubs(subs => subs.map(item => {
      if (item.user.id === id) {
        item.videoElement = videoElement;
      }
      return item;
    }));
  }

  function videoDisabled(event) {
    log.debug("OPENTOK:: subscriber video disabled", event);

    let index = subsRef.current.findIndex(item => {
      return item.user.id === event.id
    });

    let match = subsRef.current[index];

    if (!match) return;
    
    if (match.video && match.subscriber) session.unsubscribe(match.subscriber);

    setSubs(subs => subs.map(item => {
      if (item.user.id === event.id) {
        item.disabled = true;
        item.audio = false;
      }
      return item;
    }));
  }

  async function videoEnabled(event) {
    log.debug("OPENTOK:: subscriber video enabled", event);
    let id = event.id

    let index = subsRef.current.findIndex(item => {
      return item.user.id === id
    });

    let match = subsRef.current[index];
    match.disabled = false;

    if (!match) return;
    
    if (match.video) {
      let current = subsRef.current.filter(item => { return item.video });

      if (current.length < maxStreams) {
        match.video = true;
        match.audio = true;
        let subscriber = null;

        try {
          subscriber = await session.subscribe(match.stream, null, vidProps, handleError);
        } catch (err) {
          log.error("Subscribe to stream", err);
        }
  
        log.debug("OPENTOK:: created subscriber", subscriber);
        subscriber.on('videoElementCreated', (event) => { videoElementCreated(event, id) });

        setSubs(subs => subs.map(item => {
          if (item.user.id === id) {
            item.subscriber = subscriber;
          }
          return item;
        }));

      } else {
        match.video = false;
      }
    }

    setSubs(subs => subs.map(item => {
      if (item.user.id === id) {
        return match;
      }
      return item;
    }));
  }

  async function streamCreated(event) {

    log.debug('OPENTOK:: stream created event', event);
    let data = JSON.parse(event.stream.connection.data);

    if (data.id === user.id) return;

    let props = vidProps;
    let current = subsRef.current.filter(i => { return i.video });
    let subData = {
      stream: event.stream,
    };

    if (data.instructor && current.length >= maxStreams) {
      killExcessVideos();
    }

    if ((current.length < maxStreams && loopMode) || data.instructor) {

      let subscriber = null;
      subData.video = true;
      subData.audio = true;

      if (data.instructor) {
        props.preferredResolution = {width: 1280, height: 720};
      }

      setSubs(subs => subs.map(item => {
        if (item.user.id === data.id) {
          let updated = Object.assign(item, subData);
          return updated;
        }
        return item;
      }));

      try {
        subscriber = await session.subscribe(event.stream, null, props, handleError);
      } catch (err) {
        log.error("Subscribe to stream", err);
      }

      log.debug("OPENTOK:: created subscriber", subscriber);
      subscriber.on('videoElementCreated', (event) => { videoElementCreated(event, data.id) });
      subData.subscriber = subscriber;
    }

    setSubs(subs => subs.map(item => {
      if (item.user.id === data.id) {
        let updated = Object.assign(item, subData);
        return updated;
      }
      return item;
    }));
  }

  /*useEffect(() => {
    if (loopMode) {
      looper = setInterval(() => {
        loopVideo(subs, course, user)
      }, loopTime);
    } else {
      clearInterval(looper);
    }

    return function() {
      clearInterval(looper);
    };
  }, [subs, loopMode, user, course]);

  async function loopVideo(subs, course, user) {
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
  }*/

  async function toggleLayout(evt) {
    if (evt === "fullscreen") {
      setMaxStreams(1);
    } else {
      setMaxStreams(max);
    }
    setVideoLayout(evt);
  }

  async function toggleLoopMode() {
    setLoopMode(!loopMode);
  }

  function killExcessVideos() {
    let old = subsRef.current.filter(i => { return i.video && !i.disabled }).slice(maxStreams - 1);

    if (old && old.length > 0) {
      setSubs(subs => subs.map(item => {

        let match = old.findIndex(oldItem => {
          return oldItem.user.id === item.user.id 
        });
        
        if (match > -1) {
          old[match].video = false;
          old[match].audio = false;
          if (old[match].subscriber) session.unsubscribe(old[match].subscriber);
          return old[match];
        }

        return item;
      }));
    }
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
        item.audio = false;
        session.unsubscribe(item.subscriber);
        item.subscriber = null;
        setSubs([
          ...subsRef.current.filter(i => i.user.id !== item.user.id),
          item
        ]);

      } else {

        killExcessVideos()

        item.video = true;
        item.audio = true;
        let subscriber = null;

        try {
          subscriber = await session.subscribe(item.stream, null, vidProps, handleError);
        } catch (err) {
          log.error("Subscribe to stream", err);
          return;
        }
        
        if (subscriber) {
          subscriber.on('videoElementCreated', (event) => { videoElementCreated(event, data); });
          item.subscriber = subscriber;
        }

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
          if (item.subscriber) item.subscriber.subscribeToAudio(false);
        } else {
          item.audio = true;
          if (item.subscriber) item.subscriber.subscribeToAudio(true);
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

    if (event.type === "signal:camera") {
      let data = JSON.parse(event.data);
      log.debug("camera event", data);

      if (data.id !== user.id) {
        if (data.disabled) {
          videoDisabled(data);
        } else {
          videoEnabled(data);
        }
      }
    }

    if (event.type === "signal:microphone") {
      let data = JSON.parse(event.data);
      log.debug("mic event", data);
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
          <Default user={user} subs={subs} session={session} max={maxStreams} layout={videoLayout} />
          <Drawer>
            <PublisherControls publisher={publisher} user={user} course={course} session={session} />
            {accor}
          </Drawer>
        </Grid>
      </Grid>
    </Grid>
  );
}