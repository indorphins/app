import React, { useEffect, useState, useRef } from 'react';
import { 
  IconButton,
  Fab,
  Container,
  Grid,
  MenuItem,
  Select,
  Typography,
  makeStyles,
  useMediaQuery
} from '@material-ui/core';
import { ArrowBack } from '@material-ui/icons';
import { Alert } from '@material-ui/lab';
import { useHistory } from 'react-router-dom';
import * as OT from '@opentok/client';
import { ThemeProvider } from '@material-ui/core/styles';
import { light } from '../../styles/theme';

import log from '../../log';
import VideoDOMElement from './layout/videoDOMElement';
import PublisherControls from './publisherControls';
import path from '../../routes/path';

const useStyles = makeStyles((theme) => ({
  select: {
    width: "100%",
  },
  audioLvlContainer: {
    width: "100%",
    height: 6, 
    background: theme.palette.grey[100],
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    overflow: "hidden",
  },
  btn: {
    background: theme.palette.secondaryColor.main,
    color: theme.palette.secondaryColor.contrastText,
    fontWeight: "bold",
  },
  audioLvl: {
    height: 6,
    background: theme.palette.secondaryColor.main,
  }
}));

const pubSettings = {
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
  const history = useHistory();

  const med = useMediaQuery('(max-width:900px)');

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

  function back() {
    history.push(`${path.courses}/${course.id}`);
  }

  let displayMsgContent = null;
  
  if (displayMsg) {
    displayMsgContent = (
      <Grid item>
        <Alert severity={displayMsg.severity}>{displayMsg.message}</Alert>
      </Grid>
    )
  }

  let audioContent = null;

  if (audioDevices.length > 0) {
    audioContent = (
      <Grid item>
        <Select
          id="audioDevice"
          defaultValue={audioDevices[0].deviceId}
          onChange={updateAudio}
          className={classes.select}
          variant="outlined"
          style={{borderBottomLeftRadius: 0, borderBottomRightRadius: 0}}
        >
          {audioDevices.map(device => (
            <MenuItem value={device.deviceId} key={device.deviceId} name={device.label}>
              {device.label}
            </MenuItem>
          ))}
        </Select>
        <Grid className={classes.audioLvlContainer}>
          <Grid className={classes.audioLvl} style={{width: `${audioLevel}%`}} />
        </Grid>
      </Grid>
    )
  }

  let videoContent = null;
  
  if (videoDevices.length > 0) {
    videoContent = (
      <Grid item>
        <Select
          id="videoDevice"
          defaultValue={videoDevices[0].deviceId}
          onChange={updateVideo}
          className={classes.select}
          variant="outlined"
        >
          {videoDevices.map(device => (
            <MenuItem value={device.deviceId} key={device.deviceId} name={device.label}>
              {device.label}
            </MenuItem>
          ))}
        </Select>
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

  let text = `Thanks for joining us, ${user.username}`;

  if (user.id === course.instructor.id) {
    text = `Let's get that bread, ${user.username}`;
  }

  let layout = {
    direction: 'row',
    width: 6,
    align: "center"
  }

  if (med) {
    layout.direction = "column-reverse";
    layout.width = "auto";
    layout.align = "flex-start";
  }

  if (pubWindow) {
    content = (
      <Grid item container direction={layout.direction} spacing={2}>
        <Grid
          item
          xs={layout.width}
          container
          direction='column'
          spacing={2}
          justify="center"
          alignItems="center"
          alignContent="center"
        >
          <Grid item container direction="row" spacing={4} justify="center" alignItems="center" alignContent="center">
            <Grid item>
              <Typography variant="h3" align="center">{text}</Typography>
            </Grid>
            <Grid item>
              <Typography variant="subtitle1">First, make sure you&apos;re good to go</Typography>
            </Grid>
          </Grid>
          <Grid item style={{maxWidth:400, width: "100%"}}>
            {videoContent}
          </Grid>
          <Grid item style={{maxWidth:400, width: "100%"}}>
            {audioContent}
          </Grid>
          <Grid item>
            <Fab
              onClick={joinSession}
              color="primary"
              className={classes.btn}
              variant="extended"
            >
              Enter room
            </Fab>
          </Grid>
        </Grid>
        <Grid
          item
          xs={layout.width}
          container 
          direction={layout.direction}
          spacing={1}
          justify="center"
          alignContent="center"
        >
          <Grid item>
            {pubWindow}
          </Grid>
          <Grid item>
            <Typography variant="subtitle1" align="center" style={{fontWeight: "bold"}}>
              Try to be seen head to toe!
            </Typography>
          </Grid>
        </Grid>
      </Grid>
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
        <Grid
          container
          style={{
            width: "100%",
            minHeight:240,
            maxHeight: 320,
            position: "relative",
            background: "black"
          }}
        >
          {pubWindow}
          <Grid container justify="center" style={{position: "absolute", bottom: 0}}>
            <PublisherControls publisher={publisher} user={user} course={course} session={session} />
          </Grid>
        </Grid>
      </Grid>
    )
  } else {

    return (
      <ThemeProvider theme={light}>
        <IconButton onClick={back} style={{position: "absolute", top: 5, left: 5}}>
          <ArrowBack />
        </IconButton>
        <Container style={{height:"100%"}}>
          {displayMsgContent}
          <Grid
            container
            direction="column"
            justify={layout.align}
            alignContent="center"
            alignItems="center"
            spacing={2}
            style={{height:"100%"}}
          >
            {content}
          </Grid>
        </Container>
      </ThemeProvider>
    );
  }
}