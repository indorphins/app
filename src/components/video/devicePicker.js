import React, { useEffect, useState, useRef } from 'react';
import { Button, Container, Grid, MenuItem, Select, Typography, makeStyles } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import * as OT from '@opentok/client';
import { ThemeProvider } from '@material-ui/core/styles';
import { light } from '../../styles/theme';

import log from '../../log';
import VideoDOMElement from './layout/videoDOMElement';
import PublisherControls from './publisherControls';

const useStyles = makeStyles((theme) => ({
  select: {
    width: "100%",
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
  mirror: true,
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

export default function DevicePicker(props) {
  const classes = useStyles();
  const { course, session, publisher, user, videoElement, initPublisher, onJoined } = props;
  const [displayMsg, setDisplayMsg] = useState(null);
  const [ videoDevices, setVideoDevices ] = useState([]);
  const [ audioDevices, setAudioDevices ] = useState([]);
  const [ audioLevel, setAudioLevel ] = useState(0);

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
    if (session && publisher) {
      session.publish(publisher, (err) => {
        log.debug("OPENTOK:: publish to session", err);
        if (err) return handleError(err);
      });
    }
  }, [session, publisher]);

  useEffect(() => {
    if (publisher && initPublisher) {
      publisher.on('accessAllowed', getDevices)
      publisher.on('audioLevelUpdated', audioLevelHandler);
    }

    return function() {
      publisher.off('audioLevelUpdated');
    }
  }, [publisher, initPublisher])

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


  function joinSession() {
    onJoined();
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

  let audioContent = null;

  if (audioDevices.length > 0) {
    audioContent = (
      <Grid item container direction="row" spacing={2} justify="center" alignContent="center" alignItems="center">
        <Grid item xs={4}>
          <Typography color="primary">Microphone</Typography>
          <Grid className={classes.audioLvlContainer}>
            <Grid className={classes.audioLvl} style={{width: `${audioLevel}%`}} />
          </Grid>
        </Grid>
        <Grid item xs={8}>
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
        <Grid item xs={4}>
          <Typography color="primary">Camera</Typography>
        </Grid>
        <Grid item xs={8}>
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
      <VideoDOMElement element={videoElement} />
    );
  }

  let content = null;

  if (pubWindow) {
    content = (
      <React.Fragment>
        <Grid item>
          {pubWindow}
        </Grid>
        <Grid item>
          {videoContent}
        </Grid>
        <Grid item>
          {audioContent}
        </Grid>
        <Grid item>
          <Button
            onClick={joinSession}
            variant="contained"
            color="primary"
            style={{fontWeight: 'bold'}}
          >
            Join
          </Button>
        </Grid>
      </React.Fragment>
    )
  } else {
    content = (
      <Grid item>
        <Typography color="primary" variant="h5">Accessing camera and microphone...</Typography>
      </Grid>
    )
  }

  if (!onJoined) {
    return (
      <Grid container>
        <Grid style={{width: "100%"}}>
          <Grid style={{maxWidth: 320, height: 240}}>
            {pubWindow}
          </Grid>
        </Grid>
        <PublisherControls publisher={publisher} user={user} course={course} session={session} />
      </Grid>
    )
  } else {

    return (
      <ThemeProvider theme={light}>
        <Container>
          {displayMsgContent}
          <Grid container direction="row" justify="center" spacing={4} style={{paddingTop: 16, paddingBottom: 16}}>
            <Grid item container direction="column" justify="center" alignItems="center" spacing={2}>
              {content}
            </Grid>
          </Grid>
        </Container>
      </ThemeProvider>
    );
  }
}