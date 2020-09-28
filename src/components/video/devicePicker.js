import React, { useEffect, useState, useRef } from 'react';
import { Button, Container, Grid, MenuItem, Select, Typography, makeStyles } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import * as OT from '@opentok/client';

import PermissionsError from './permissionsError';
import log from '../../log';
import VideoDOMElement from './layout/videoDOMElement';
import PublisherControls from './publisherControls';

const useStyles = makeStyles((theme) => ({
  select: {
    width: 200,
  },
  audioLvlContainer: {
    width: "100%",
    height: 6, 
    background: theme.palette.grey[100],
    borderRadius: 3,
    overflow: "hidden",
  },
  audioLvl: {
    height: 6,
    background: theme.palette.common.white,
  }
}));

const pubSettings = {
  usePreviousDeviceSelection: true,
  mirror: true,
  showControls: false,
  insertDefaultUI: false,
  publishAudio: true,
  publishVideo: true,
  resolution: "640x480",
  frameRate: 30,
  audioBitrate: 44000,
  enableStereo: false,
  maxResolution: {width: 640, height: 480},
};

export default function DevicePicker(props) {
  const classes = useStyles();
  const { course, session, user, onChange } = props;
  const [displayMsg, setDisplayMsg] = useState(null);
  const [permissionsError, setPermissionsError] = useState(false);
  const [ publisher, setPublisher ] = useState(null);
  const [ videoDevices, setVideoDevices ] = useState([]);
  const [ audioDevices, setAudioDevices ] = useState([]);
  const [ videoElement, setVideoElement ] = useState(null);
  const [ audioLevel, setAudioLevel ] = useState(0);
  const [ joined, setJoined ] = useState(false);

  const publisherRef = useRef()
  publisherRef.current = publisher;
  const sessionRef = useRef()
  sessionRef.current = session;

  async function handleError(err) {
    if (err) {
      log.error("OPENTOK::", err);

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

  useEffect(() => {
    let settings = pubSettings;
    initPublisher(settings);

    return function() {
      log.debug("kill publisher")
      if (publisherRef.current && sessionRef.current) {
        sessionRef.current.unpublish(publisherRef.current);
        publisherRef.current.destroy();
      }
    }
  }, [])

  function getDevices() {
    OT.getDevices((err, result) => {
      log.debug("Hardware devices", result);
      let video = result.filter(item => {
        return item.kind === "audioInput";
      })
      setAudioDevices(video);

      let audio = result.filter(item => {
        return item.kind === "videoInput";
      })
      setVideoDevices(audio);
    });
  }

  function videoElementCreated(event) {
    log.debug("OPENTOK:: publisher video element created", event);

    let videoElement = event.element;
    videoElement.style.height = "100%";
    videoElement.style.width = "100%";
    videoElement.style.objectFit = "contained";
    videoElement.style.objectPosition = "center";

    setVideoElement(videoElement);
  }

  function initPublisher(settings) {
    let publisher = OT.initPublisher(null, settings, handleError);
    log.info("OPENTOK:: publisher created", publisher);
    setPublisher(publisher);

    publisher.on({
      accessAllowed: getDevices,
      accessDenied: function accessDeniedHandler(event) {
        setPermissionsError(true);
      },
      videoElementCreated: videoElementCreated,
      audioLevelUpdated: audioLevelHandler,
    });
  }

  function joinSession(publisher, session) {
    session.publish(publisher, (err) => {
      log.debug("publish to session", err);
      if (err) return handleError(err);
      setJoined(true);
      publisher.off('audioLevelUpdated');
      onChange(publisher)
    });
  }

  function audioLevelHandler(event) {
    let lvl = Math.floor(100 * Number(event.audioLevel));
    setAudioLevel(lvl);
  }

  function updateAudio(evt) {
    let id = evt.target.value;
    let settings = pubSettings;
    settings.audioSource = id;
    initPublisher(settings);
  }

  function updateVideo(evt) {
    let id = evt.target.value;
    let settings = pubSettings;
    settings.videoSource = id;
    initPublisher(settings);
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

  let audioContent = null;

  if (audioDevices.length > 0) {
    audioContent = (
      <Grid item container direction="row" spacing={2} justify="center" alignContent="center" alignItems="center">
        <Grid item style={{width: 110}}>
          <Typography color="primary">Microphone</Typography>
          <Grid className={classes.audioLvlContainer}>
            <Grid className={classes.audioLvl} style={{width: `${audioLevel}%`}} />
          </Grid>
        </Grid>
        <Grid item>
          <Select
            id="audioDevice"
            defaultValue={audioDevices[0].deviceId}
            onChange={updateAudio}
            className={classes.select}
          >
            {audioDevices.map(device => (
              <MenuItem value={device.deviceId} key={device.deviceId} name={device.label}>
                {device.label}
              </MenuItem>
            ))}
          </Select>
        </Grid>
      </Grid>
    )
  }

  let videoContent = null;
  
  if (videoDevices.length > 0) {
    videoContent = (
      <Grid item container direction="row" spacing={2} justify="center" alignContent="center" alignItems="center">
        <Grid item style={{width: 110}}>
          <Typography color="primary">Camera</Typography>
        </Grid>
        <Grid item>
          <Select
            id="videoDevice"
            defaultValue={videoDevices[0].deviceId}
            onChange={updateVideo}
            className={classes.select}
          >
            {videoDevices.map(device => (
              <MenuItem value={device.deviceId} key={device.deviceId} name={device.label}>
                {device.label}
              </MenuItem>
            ))}
          </Select>
        </Grid>
      </Grid>
    )
  }

  let pubWindow = null;

  if (videoElement) {
    pubWindow = (
      <Grid item>
        <VideoDOMElement element={videoElement} />
      </Grid>
    );
  }

  let content = null;

  if (pubWindow) {
    content = (
      <React.Fragment>
        {pubWindow}
        {videoContent}
        {audioContent}
      </React.Fragment>
    )
  } else {
    content = (
      <Grid item>
        <Typography color="primary" variant="h5">Accessing camera and microphone...</Typography>
      </Grid>
    )
  }

  if (joined) {
    return (
      <React.Fragment>
        {pubWindow}
        <PublisherControls publisher={publisher} user={user} course={course} session={session} />
      </React.Fragment>
    )
  }

  if (course && course.title) {
    return (
      <Container>
        {displayMsgContent}
        <Grid container direction="row" justify="center" spacing={4} style={{paddingTop: 16, paddingBottom: 16}}>
          <Grid item container direction="column" justify="center" alignItems="center" spacing={2}>
            {content}
          </Grid>
          <Grid item>
            <Button
              onClick={() => {joinSession(publisher, session);}}
              variant="contained"
              color="primary"
              style={{fontWeight: 'bold'}}
            >
              Join
            </Button>
          </Grid>
        </Grid>
      </Container>
    );
  }

  return null;
}