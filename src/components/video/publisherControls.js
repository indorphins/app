import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  IconButton,
  makeStyles,
} from '@material-ui/core';
import { 
  VideocamOffOutlined, 
  VideocamOutlined, 
  MicNone, 
  MicOffOutlined, 
} from '@material-ui/icons';

import log from '../../log';
import LeaveSession from './leaveSession';

const useStyles = makeStyles((theme) => ({
  publisher: {
    height: 240,
    width: 320,
    background: theme.palette.grey[100],
  },
  buttons: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  }
}));

export default function PublisherControls(props) {

  const { session, publisher, user, course } = props
  const classes = useStyles();
  const [publishVideo, setPublishVideo] = useState(true);
  const [publishAudio, setPublishAudio] = useState(false);

  useEffect(() => {
    if (user && course && user.id === course.instructor.id) {
      setPublishAudio(true);
    }
  }, [user, course]);


  function toggleAudio(evt) {
    let disabled = evt;

    setPublishAudio(!disabled);
    publisher.publishAudio(!disabled);

    session.signal(
      {
        type: "microphone",
        data: JSON.stringify({
          id: user.id,
          disabled: disabled,
          date: new Date().toISOString(),
        }),
      },
      function(error) {
        if (error) {
          log.error("OPENTOK:: user signal error" + error.message);
        }
      }
    );
  }

  function toggleVideo(evt) {
    let disabled = evt;

    setPublishVideo(!disabled);
    publisher.publishVideo(!disabled);

    session.signal(
      {
        type: "camera",
        data: JSON.stringify({
          id: user.id,
          disabled: disabled,
          date: new Date().toISOString(),
        }),
      },
      function(error) {
        if (error) {
          log.error("OPENTOK:: user signal error" + error.message);
        }
      }
    );
  }

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

  let content = (
    <Box>
      <Grid container direction="row" spacing={1} className={classes.buttons}>
        <Grid item>
          <IconButton title={videoTitle} onClick={() => toggleVideo(publishVideo)}>
            {videoBtn}
          </IconButton>
        </Grid>
        <Grid item>
          <IconButton title={micTitle} onClick={() => toggleAudio(publishAudio)}>
            {micBtn}
          </IconButton>
        </Grid>
        <Grid item>
          <LeaveSession course={props.course} />
        </Grid>
      </Grid>
    </Box>
  );

  return content;
}