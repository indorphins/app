import React, { useEffect, useState } from 'react';
import { Button, Container, Grid, MenuItem, Select, Typography, makeStyles } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import * as OT from '@opentok/client';
import { isSafari, isMobile, fullBrowserVersion } from 'react-device-detect';
import compareVersions from 'compare-versions';

import PermissionsError from './permissionsError';
import log from '../../log';
import VideoDOMElement from './layout/videoDOMElement';

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
  const { course, credentials, onChange } = props;
  const [displayMsg, setDisplayMsg] = useState(null);
  const [permissionsError, setPermissionsError] = useState(false);
  const [session, setSession] = useState(null);
  const [publisher, setPublisher] = useState(null);
  const [ videoDevices, setVideoDevices ] = useState([]);
  const [ audioDevices, setAudioDevices ] = useState([]);
  const [ camera, setCamera] = useState(null);
  const [ videoElement, setVideoElement ] = useState(null);
  const [ audioLevel, setAudioLevel ] = useState(0);
  const [ mic, setMic] = useState(null);
  const [ join, setJoin ]= useState(false);

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
    if (onChange && typeof onChange === 'function') {
      onChange({
        cameraId: camera,
        micId: mic,
        join: join,
      });
    }
  }, [camera, mic, join, onChange]);

  useEffect(() => {
    if (!credentials) return;

    init(credentials.apiKey, credentials.sessionId, pubSettings);

  }, [credentials]);

  useEffect(() => {
    return function() {
      if (publisher) publisher.destroy();
      if (session) session.disconnect();
    }
  }, [publisher, session]);

  async function init(apiKey, sessionId, settings) {

    let session = OT.initSession(apiKey, sessionId);

    if (session.capabilities.publish !== 0) {
      setDisplayMsg({severity: "error", message: "Not allowed to publish to session"});
      return;
    }

    setSession(session);
    settings.name = session.data;
  
    initPublisher(settings);
  }

  useEffect(() => {

    let valid = validateBrowserVersion();

    if (!valid) return;
  }, []);

  function getDevices() {
    OT.getDevices((err, result) => {
      log.debug("Hardware devices", result);
      let video = result.filter(item => {
        return item.kind === "audioInput";
      })
      setAudioDevices(video);
      setCamera(video[0].deviceId)

      let audio = result.filter(item => {
        return item.kind === "videoInput";
      })
      setVideoDevices(audio);
      setMic(audio[0].deviceId);
    });
  }

  function videoElementCreated(event) {
    log.debug("OPENTOK:: subscriber video element created", event);

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

  function audioLevelHandler(event) {
    let lvl = Math.floor(100 * Number(event.audioLevel));
    setAudioLevel(lvl);
  }

  function updateAudio(evt) {
    let id = evt.target.value;
    setMic(id);

    let settings = pubSettings;
    settings.audioSource = id;
    initPublisher(settings);
  }

  function updateVideo(evt) {
    let id = evt.target.value;
    setCamera(id);

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

  return (
    <Container>
      {displayMsgContent}
      <Grid container direction="row" justify="center" spacing={4} style={{paddingTop: 16}}>
        <Grid item container direction="column" justify="center" alignItems="center" spacing={2}>
          <Grid item>
            <Typography variant="h3">Get setup for {course.title}</Typography>
          </Grid>
          {content}
        </Grid>
        <Grid item>
          <Button
            onClick={() => {
              publisher.destroy();
              session.disconnect();
              log.debug('OPENTOK:: disconnected from video session');
              setJoin(true);
            }}
            variant="contained"
            color="primary"
            style={{fontWeight: 'bold'}}
          >
            Join Class
          </Button>
        </Grid>
      </Grid>
    </Container>
  )
}