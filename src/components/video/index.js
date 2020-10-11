/* eslint max-lines: 0*/
import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Grid, 
  Typography, 
  //Switch,
  Tabs,
  Tab,
  makeStyles,
} from '@material-ui/core';
/*import {
  Loop,
  ViewArray
} from '@material-ui/icons';*/
import { Alert } from '@material-ui/lab';
import * as OT from '@opentok/client';
import { useSnackbar } from 'notistack';
import { ThemeProvider } from '@material-ui/core/styles';
import { light } from '../../styles/theme';
import { startArchive, stopArchive } from '../../api/archive';

import PermissionsError from './permissionsError';
import Chat from './chat';
import Drawer from './drawer';
import ParticipantControls from './participantControls';

import log from '../../log';
import DevicePicker from './devicePicker';
import GridView from './layout/gridView';
import Default from './layout/default';
//import LayoutPicker from './layout/picker';

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100%",
  },
  settingsIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "48px",
    height: "48px",
    color: theme.palette.secondary.main,
  },
  enabled: {
    color: theme.palette.secondary.main,
  },
  disabled: {
    color: theme.palette.grey[500],
  },
  tabs: {
    borderBottom: `1px solid ${theme.palette.text.disabled}`,
    marginBottom: theme.spacing(1),
  },
  tab: {
    minWidth: 0,
  },
  selectedTab: {
    fontWeight: "bold",
  },
  videoSetting: {
    border: `1px solid ${theme.palette.grey[500]}`,
    borderRadius: '4px',
    padding: theme.spacing(1),
    cursor: "pointer",
    color: theme.palette.common.black,
  },
  selectedSetting: {
    background: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  videoSettingTitle: {
    fontSize: '1.2rem',
    fontWeight: 600,
    color: "inherit",
  },
}));

const loopTime = 15000;
const max = 4;
const vidProps = {
  preferredFrameRate: 30,
  preferredResolution: {width: 320, height: 240},
  showControls: false,
  insertDefaultUI: false,
  subscribeToAudio: true,
  subscribeToVideo: true,
};

const pubSettings = {
  //mirror: true,
  showControls: false,
  insertDefaultUI: false,
  publishAudio: true,
  publishVideo: true,
  //resolution: "320x240",
  resolution: "640x480",
  frameRate: 30,
  audioBitrate: 44000,
  enableStereo: false,
  maxResolution: {width: 640, height: 480},
};

export default function Video(props) {

  const classes = useStyles();
  let looper = null;
  const { enqueueSnackbar } = useSnackbar();
  const [maxStreams, setMaxStreams] = useState(max);
  const { credentials, course, user } = props;
  const [session, setSession] = useState(null);
  const [publisher, setPublisher] = useState(null);
  const [subs, setSubs] = useState([]);
  const [loopMode, setLoopMode] = useState(true);
  const [displayMsg, setDisplayMsg] = useState(null);
  const [ videoElement, setVideoElement ] = useState(null);
  const [videoLayout, setVideoLayout] = useState("horizontal");
  const [permissionsError, setPermissionsError] = useState(false);
  const [joined, setJoined] = useState(false);
  const [tab, setTab] = useState(0);
  const [chatHistory, setChatHistory] = useState([]);
  //const [cover, setCover] = useState(true);
  const cover = true;
  const subsRef = useRef();
  const sessionRef = useRef();
  const loopModeRef = useRef();
  const maxStreamsRef = useRef();
  const coverRef = useRef();
  const publisherRef = useRef();
  subsRef.current = subs;
  sessionRef.current = session;
  loopModeRef.current = loopMode;
  maxStreamsRef.current = maxStreams;
  coverRef.current = cover;
  publisherRef.current = publisher;

  async function handleError(err) {
    if (err) {
      log.error("OPENTOK:: handleError", err);

      if (err.name === 'OT_HARDWARE_UNAVAILABLE') {
        return setDisplayMsg({
          severity: "error",
          message: "We cannot access your camera or microphone, they are already in use by another application."
        });
      }

      if (err.name === 'OT_NOT_SUPPORTED') {
        return setDisplayMsg({severity: "error", message: "Device not supported."});
      }

      if (err.name === 'OT_TIMEOUT' || err.name === 'OT_MEDIA_ERR_NETWORK') {
        return setDisplayMsg({
          severity: "warning",
          message: `Network connection slow.
          Try moving closer to your router if possible, or check your internet speed, and then refresh this page.`
        });
      }
    }
  }

  async function initializeSession(apiKey, token, sessionId) {

    log.debug("OPENTOK:: Initializing session");

    let sess = OT.initSession(apiKey, sessionId);

    if (sess.capabilities.publish !== 0) {
      log.warn("not allowed to publish")
      return;
    }

    if (sess) {
      sess.connect(token, (err) => {
        log.debug("OPENTOK:: Connected to session", err);
        sess.on('connectionCreated', connectionCreated);
        sess.on('connectionDestroyed', connectionDestroyed);
        sess.on('streamCreated', streamCreated);
        sess.on('streamDestroyed', streamDestroyed);
        sess.on('signal', handleSignal);
        setSession(sess);

        return sess;
      });
    }
  }

  async function handleJoin() { 
    await initializeSession(credentials.apiKey, credentials.token, credentials.sessionId);
    setJoined(true);
  }

  function publisherVideoElementCreated(event) {
    log.debug("OPENTOK:: publisher video element created", event);

    let videoElement = event.element;
    videoElement.style.cssText = `transform: rotateY(180deg);`;
    videoElement.style.objectFit = "contained";
    videoElement.style.objectPosition = "center";
    videoElement.style.height = "100%";
    videoElement.style.width = "100%";

    setVideoElement(videoElement);
  }

  function initPublisher(settings) {
    let publisher = OT.initPublisher(null, settings, handleError);
    log.info("OPENTOK:: publisher created", publisher);
    setPublisher(publisher);

    publisher.on({
      accessAllowed: () => setPermissionsError(false),
      accessDenied: () => setPermissionsError(true),
      videoElementCreated: publisherVideoElementCreated,
    });
  }

  // Start archiving the session, if user is instructor
  useEffect(() => {
    let archive;
    if (session && user && course && course.instructor && course.instructor.id === user.id) {
      startArchive(session.id).then(response => {
        archive = response;
        log.info("INSTRUCTOR STARTED ARCHIVE ", archive);
      }).catch(err => {
        log.warn("ERROR STARTING ARCHIVE ", err);
      })
    }

    return () => {
      if (archive) {
        return stopArchive(archive.id).then(response => {
          log.info("Stopped archive ", response);
        }).catch(err => {
          log.warn("Error stopping archive ", err);
        })
      }
    }
  }, [session, user, course])

  useEffect(() => {

    if (user.id && course.id) {
      let settings = pubSettings;

      if (user.id === course.instructor.id) {
        settings.publishAudio = true;
        settings.audioBitrate = 96000;
      }

      initPublisher(settings);

      return function() {
        if (publisherRef.current) {
          publisherRef.current.off('accessAllowed');
          publisherRef.current.off('accessDenied');
          publisherRef.current.off('videoElementCreated');
          publisherRef.current.off('audioLevelUpdated');
        }
      }
    }
  }, [user, course]);

  useEffect(() => {
    if (course && user && course.instructor.id === user.id) {
      setVideoLayout("grid");
    }
  }, [course, user]);

  useEffect(() => {
    return function() {
      if (publisher) {
        log.debug("OPENTOK:: disconnect and destroy publisher", publisher);
        if (sessionRef.current) {
          sessionRef.current.unpublish(publisher);
        }
        publisher.destroy();
      }
    }
  }, [publisher]);

  useEffect(() => {
    return function() {
      if (session) {
        log.debug("OPENTOK:: disconnect from session", session);
        // disconnect the event listeners
        session.off('connectionCreated');
        session.off('connectionDestroyed');
        session.off('streamCreated');
        session.off('streamDestroyed');
        session.off('signal');
        session.disconnect();
      }
    }

  }, [session]);


  function connectionCreated(event) {
    log.info("OPENTOK:: connection created", event);

    let data = JSON.parse(event.connection.data);

    if (data.id === user.id) {
      return;
    }

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

    if (!candidate.stream || !sessionRef.current.subscribe) return;

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

    log.debug("OPENTOK:: enable candidate stream", candidate);

    try {
      subscriber = await sessionRef.current.subscribe(candidate.stream, null, props, handleError);
    } catch (err) {
      log.error("Subscribe to stream", err);
    }

    if (subscriber) {
      log.debug("OPENTOK:: created subscriber", subscriber);
      subscriber.on('videoElementCreated', (event) => { videoElementCreated(event, candidate.user.id) });

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
        if (item.subscriber) sessionRef.current.unsubscribe(item.subscriber);
        item.subscriber = null;
        item.stream = null;
        item.videoElement = null;

        if (item.video) {
          item.video = false;
          item.audio = false;
        }
      }
      return item;
    }));
  }

  function videoElementCreated(event, id) {
    log.debug("OPENTOK:: subscriber video element created", event);

    let videoElement = event.element;
    videoElement.style.height = "100%";
    videoElement.style.width = "100%";
    videoElement.style.objectFit = "cover";
    videoElement.style.objectPosition = "center";

    if (!coverRef.current) {
      videoElement.style.objectFit = "contain";
    }

    setSubs(subs => subs.map(item => {
      if (item.user.id === id) {
        item.videoElement = videoElement;
      }
      return item;
    }));
  }

  function videoDisabled(event) {
    log.debug("OPENTOK:: subscriber video disabled", event);

    setSubs(subs => subs.map(item => {
      if (item.user.id === event.id) {
        if (item.subscriber) {
          item.subscriber.off('videoElementCreated');
          sessionRef.current.unsubscribe(item.subscriber);
        }
        item.disabled = true;
        item.videoElement = null;
        item.audio = false;
      }
      return item;
    }));
  }

  async function videoEnabled(event) {
    log.debug("OPENTOK:: subscriber video enabled", event);
    let id = event.id

    let match = subsRef.current.find(item => {
      return item.user.id === id
    });

    if (!match) return log.warn("OPENTOK:: enabled video not matched");
    
    if (match.video) {

      let subscriber = null;
      let props = vidProps;

      if (match.user.id === course.instructor.id) {
        props.preferredResolution = {width: 640, height: 480};
      }

      try {
        subscriber = await sessionRef.current.subscribe(match.stream, null, props, handleError);
      } catch (err) {
        log.error("Subscribe to stream", err);
      }

      if (subscriber) {
        log.debug("OPENTOK:: created subscriber", subscriber);

        setSubs(subs => subs.map(item => {
          if (item.user.id === match.user.id) {
            item.disabled = false;
            item.audio = true;
            item.video = true;
            item.subscriber = subscriber;
          }
          return item;
        }));

        subscriber.on('videoElementCreated', (event) => { videoElementCreated(event, id) });
      }
    } else {

      setSubs(subs => subs.map(item => {
        if (item.user.id === match.user.id) {
          item.disabled = false;
          item.audio = false;
          item.video = false;
        }
        return item;
      }));
    }
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

    if ((current.length < maxStreamsRef.current && loopModeRef.current) || data.instructor) {

      let subscriber = null;
      subData.video = true;
      subData.audio = true;

      if (data.instructor) {
        props.preferredResolution = {width: 640, height: 480};
      }

      setSubs(subs => subs.map(item => {
        if (item.user.id === data.id) {
          let updated = Object.assign(item, subData);
          return updated;
        }
        return item;
      }));

      try {
        subscriber = await sessionRef.current.subscribe(event.stream, null, props, handleError);
      } catch (err) {
        log.error("Subscribe to stream", err);
      }

      if (subscriber) {
        log.debug("OPENTOK:: created subscriber", subscriber);
        subscriber.on('videoElementCreated', (event) => { videoElementCreated(event, data.id) });
        subData.subscriber = subscriber;
      }
    }

    setSubs(subs => subs.map(item => {
      if (item.user.id === data.id) {
        let updated = Object.assign(item, subData);
        return updated;
      }
      return item;
    }));
  }

  useEffect(() => {
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
    if (subs && subs.length <= 1) return;

    let current = subs.filter(item => { return item.video && !item.disabled });
    let expired = null;

    if (user.id === course.instructor.id) {
      expired = current[0];
    } else {
      expired = current[1];
    }
    
    if (subs.length > maxStreamsRef.current) {

      let next = subs.filter(i => { return !i.video && !i.disabled && i.stream})[0];

      if (next && expired) {
        log.debug("OPENTOK:: set new video and expire old", next, expired);

        next.audio = true;
        next.video = true;

        let subscriber = null;
        try {
          subscriber = await sessionRef.current.subscribe(next.stream, null, vidProps, handleError);
        } catch (err) {
          log.error("Subscribe to stream", err);
        }

        if (subscriber) {
          log.debug("OPENTOK:: created subscriber", subscriber);
          subscriber.on('videoElementCreated', (event) => { videoElementCreated(event, next.user.id) });
          next.subscriber = subscriber;          

          setSubs(subs => subs.map(item => {
            if (item.user.id === next.userid) {
              return next;
            }
            return item;
          }));
        }

        if (expired.subscriber) sessionRef.current.unsubscribe(expired.subscriber);
        expired.audio = false;
        expired.video = false;
        expired.subscriber = null;
      }
    }

    if (expired) {
      setSubs([
        ...subs.filter(i => i.user.id !== expired.user.id),
        expired
      ]);
    }
  }

  useEffect(() => {

    let current = subs.filter(item => { return item.video && !item.disabled });

    if (loopMode) {

      if (current.length < maxStreams) {

        let diff = maxStreams - current.length;
        let candidates = subs.filter(i => { return !i.video && !i.disabled }).slice(0, diff);

        candidates.forEach(item => {
          enableCandidate(item);
        });
      }
    }

    if (current.length > maxStreams) {
      killExcessVideos(maxStreams);
    }
    
  }, [subs, maxStreams, loopMode]);

  useEffect(() => {
    
    if (videoLayout === 'grid') {
      if (course.instructor.id === user.id) {
        setMaxStreams(40);
      } else {
        setMaxStreams(max);
      }
    } else if (videoLayout === 'fullscreen') {
      setMaxStreams(1);
    } else {
      setMaxStreams(max);
    }

  }, [videoLayout, course, user])

  /*async function toggleLayout(evt) {
    setVideoLayout(evt);
  }

  async function toggleLoopMode() {
    setLoopMode(!loopMode);
  }*/

  function killExcessVideos(start) {

    let old = subsRef.current.filter(i => { return i.video && !i.disabled }).slice(start);

    log.debug("OPENTOK:: excess videos", old);

    if (old && old.length > 0) {
      setSubs(subs => subs.map(item => {
        let match = old.findIndex(oldItem => {
          return oldItem.user.id === item.user.id && item.user.id !== course.instructor.id
        });

        if (match > -1) {
          old[match].video = false;
          old[match].audio = false;
          if (old[match].subscriber) sessionRef.current.unsubscribe(old[match].subscriber);
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
        item.videoElement = null;
        if (item.subscriber) sessionRef.current.unsubscribe(item.subscriber);
        item.subscriber = null;
        setSubs([
          ...subsRef.current.filter(i => i.user.id !== item.user.id),
          item
        ]);

      } else {

        let subscriber = null;

        try {
          subscriber = await sessionRef.current.subscribe(item.stream, null, vidProps, handleError);
        } catch (err) {
          log.error("Subscribe to stream", err);
          return;
        }
        
        if (subscriber) {
          subscriber.on('videoElementCreated', (event) => { videoElementCreated(event, data); });
          item.subscriber = subscriber;
          item.video = true;
          item.audio = true;
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

  /*function toggleCover() {
    let updated = !cover;
    setCover(updated);
    setSubs(subs =>  subs.map(item => {
      if (item.videoElement) {
        if (updated) {
          item.videoElement.style.objectFit = "cover"
        } else {
          item.videoElement.style.objectFit = "contain"
        }
      }
      return item;
    }));
  }*/

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

    if (event.type === "signal:chat") {
      log.debug('OPENTOK:: got chat msg from client', event);
      let data = JSON.parse(event.data);
      setChatHistory(history => [data, ...history]);
    }
  }

  /*let textColor;
  let iconColor;
  let settingsText;

  if (loopMode) {
    textColor = classes.disabled;
    iconColor = classes.enabled;
    settingsText = `You'll see a rotating view of the community. 
    To workout with friends or just ${course.instructor.username}, go to settings.`;

  } else {
    textColor = classes.enabled;
    iconColor = classes.disabled;

    if (maxStreams === 1) {
      settingsText = "Connect with the community via emojis and chat!"
    } else {
      settingsText = "Select your friends below.";
    }
  }

  if (user.id === course.instructor.id) {
    if (videoLayout === 'grid') {
      settingsText = "When you're ready to start, switch to class view";
    } else {
      settingsText = "When class is over, switch back to Pre/Post class view to see & hear everyone";
    }
  }*/

  /*let coverText = "Zoom";
  let coverClasses = classes.disabled;
  let cIconClasses = classes.enabled;

  if (cover) {
    coverText = "Zoom"
    coverClasses = classes.enabled;
    cIconClasses = classes.disabled;
  }*/
  
  /*let settings = (
    <Grid container direction="column">
      <Grid
        container
        direction="column"
        justify="center"
        alignItems="center"
        alignContent="center"
        style={{paddingLeft:24, paddingRight: 24}}
      >
        <Grid item>
          <Typography variant="subtitle2">{settingsText}</Typography>
        </Grid>
      </Grid>
      <Grid item container direction="row" alignItems="center" alignContent="center">
        <Grid item className={classes.settingsIcon}>
          <LayoutPicker layout={videoLayout} onSelect={(evt) => toggleLayout(evt)} />
        </Grid>
        <Grid item xs>
          <Typography color="primary">Display</Typography>
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
          <Loop className={iconColor} />
        </Grid>
        <Grid item xs>
          <Typography className={textColor}>Pin friends to view</Typography>
        </Grid>
        <Grid item>
          <Switch 
            checked={!loopMode}
            color="primary"
            onChange={toggleLoopMode}
            title="Rotate videos / pin friends"
            name="loop"
          />
        </Grid>
        <Grid item container direction="row" justify="space-between" alignItems="center" alignContent="center">
          <Grid item className={classes.settingsIcon}>
            <ViewArray className={cIconClasses} />
          </Grid>
          <Grid item xs>
            <Typography className={coverClasses}>{coverText}</Typography>
          </Grid>
          <Grid item>
            <Switch
              checked={cover}
              color="primary"
              onChange={toggleCover}
              name="cover"
            />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );*/



  const [vidSettings, setVidSettings] = useState([
    {
      value: "community",
      className: `${classes.videoSetting} ${classes.selectedSetting}`,
      selected: true,
      title: "Community",
      subTitle: "Rotating view of everyone in class.",
    },
    {
      value: "friends",
      className: classes.videoSetting,
      selected: false,
      title: "With Friends",
      subTitle: "Pin friends to workout with.",
    },
    {
      value: "instructor",
      className: classes.videoSetting,
      selected: false,
      title: "1:1",
      subTitle: "View just the instructor.",
    }
  ]);

  useEffect(() => {

    if (user.id === course.instructor.id) {
      setVidSettings([
        {
          value: "grid",
          className: `${classes.videoSetting} ${classes.selectedSetting}`,
          selected: true,
          title: "View All",
          subTitle: "View and hear everyone at once.",
        },
        {
          value: "class",
          className: classes.videoSetting,
          selected: false,
          title: "Class View",
          subTitle: "4 rotating participants.",
        },
      ])
    }
  }, [user, course]);

  useEffect(() => {

    let set = vidSettings.filter(item => item.selected)[0];

    if (set) {
      if (set.value === 'community' || set.value === 'class') {
        setLoopMode(true);
        setVideoLayout('horizontal');
      }

      if (set.value === 'friends') {
        setLoopMode(false);
        setVideoLayout('horizontal');
        setTab(0);
      }

      if (set.value === 'instructor') {
        setLoopMode(false);
        setVideoLayout('fullscreen')
      }

      if (set.value === 'grid') {
        setLoopMode(true);
        setVideoLayout('grid')
      }
    }
  }, [vidSettings])

  function handleChangeView(evt) {

    let value = evt;

    setVidSettings(vidSettings => vidSettings.map(item => {
      if (item.selected && item.value !== value) {
        item.selected = false;
        item.className = classes.videoSetting;
      }

      if (item.value === value) {
        item.selected = true;
        item.className = `${classes.videoSetting} ${classes.selectedSetting}`;
      }

      return item;
    }));
  }


  let settings = (
    <React.Fragment>
      <Grid container direction="column" spacing={1} style={{padding: 16}}>
        {vidSettings.map(item => (
          <Grid item key={item.value}>
            <Grid
              className={item.className}
              container
              direction="column"
              justify="center"
              alignItems="center"
              onClick={() => handleChangeView(item.value)}
            >
              <Grid item>
                <Typography className={classes.videoSettingTitle}>{item.title}</Typography>
              </Grid>
              <Grid item>
                <Typography variant="subtitle1">{item.subTitle}</Typography>
              </Grid>
            </Grid>
          </Grid>
        ))}  
      </Grid>
    </React.Fragment>
  )

  let controlsGrid = (
    <Grid container direction="column">
      <Grid item style={{width: "100%"}}>
        <ParticipantControls
          user={user}
          course={course}
          session={session}
          subs={subs}
          loopMode={loopMode}
          videoLayout={videoLayout}
          maxStreams={maxStreams}
          audioHandler={toggleSubscriberAudio}
          videoHandler={toggleSubscriberVideo} 
        />
      </Grid>
    </Grid>
  )

  let chatContent = (
    <Container style={{paddingLeft:6, paddingRight: 6}}>
      <Chat session={session} user={user} chatHistory={chatHistory} />
    </Container>
  );

  let tabContent = controlsGrid;

  if (tab === 1) {
    tabContent = chatContent;
  }

  if (tab === 2) {
    tabContent = settings;
  }

  let accor = (
    <ThemeProvider theme={light}>
      <Tabs
        value={tab}
        onChange={(evt, newValue) => setTab(newValue)}
        variant="fullWidth"
        textColor="primary"
        indicatorColor="primary"
        className={classes.tabs}
      >
        <Tab label="Group" value={0} classes={{root: classes.tab, selected: classes.selectedTab}} />
        <Tab label="Chat" value={1} classes={{root: classes.tab, selected: classes.selectedTab}} />
        <Tab label="Settings" value={2} classes={{root: classes.tab, selected: classes.selectedTab}} />
      </Tabs>
      {tabContent}
    </ThemeProvider>
  )

  let displayMsgContent = null;
  
  if (displayMsg) {
    displayMsgContent = (
      <Alert severity={displayMsg.severity}>{displayMsg.message}</Alert>
    )
  }

  let devicePickContent = null
  
  if (publisher) {
    devicePickContent = (
      <Grid container direction="row" justify="flex-start" alignItems="flex-start" className={classes.root}>
        <DevicePicker
          publisher={publisher}
          course={course}
          user={user}
          videoElement={videoElement}
          initPublisher={initPublisher}
          onJoined={handleJoin}
        />
      </Grid>
    );
  }

  if (permissionsError) {
    return (
      <PermissionsError />
    );
  }

  if (!joined || !session) {

    return devicePickContent;

  } else {

    let vidsLayout = (
      <Default user={user} subs={subs} session={session} max={maxStreams} layout={videoLayout} />
    )

    if (videoLayout === "grid") {
      vidsLayout = (
        <GridView user={user} subs={subs} session={session} />
      )
    }

    return (
      <Grid style={{width: "100%", height: "100%", overflow: "hidden"}}>
        {displayMsgContent}
        <Grid container direction="row" justify="flex-start" style={{height:"100%", overflow: "hidden"}}>
          <Grid
            container
            direction="row"
            spacing={0}
            justify="flex-start"
            style={{height: "100%", overflow: "hidden"}}
          >
            {vidsLayout}
            <Drawer>
              <Grid container direction="row" justify="flex-start" alignItems="flex-start">
                <DevicePicker
                  session={session}
                  publisher={publisher}
                  course={course}
                  user={user}
                  videoElement={videoElement}
                />
              </Grid>
              {accor}
            </Drawer>
          </Grid>
        </Grid>
      </Grid>
    );
  }
}