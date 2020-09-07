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

const useStyles = makeStyles((theme) => ({
  publisher: {
    height: 240,
    width: 320,
    background: theme.palette.grey[100],
  },
}));

export default function PublisherControls(props) {

  const { session, user, course } = props
  const classes = useStyles();
  const [publisher, setPublisher] = useState(null);
  const [publishVideo, setPublishVideo] = useState(true);
  const [publishAudio, setPublishAudio] = useState(false);

  useEffect(() => {
    if (props.publisher) {
      setPublisher(props.publisher);
    }

    if (user && course && user.id === course.instructor.id) {
      setPublishAudio(true);
    }
  }, [props, user, course]);

  useEffect(() => {
    if (publisher) publisher.publishVideo(publishVideo);
  }, [publishVideo]);

  useEffect(() => {
    if (publisher) publisher.publishAudio(publishAudio);
  }, [publishAudio]);

  function toggleAudio() {
    let disabled = false;
    if (publishAudio) {
      disabled = true;
    }

    setPublishAudio(!publishAudio);

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

  function toggleVideo() {
    let disabled = false;
    if (publishVideo) {
      disabled = true;
    }

    setPublishVideo(!publishVideo);

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
      <Grid id="publisher" className={classes.publisher}></Grid>
      <IconButton title={videoTitle} onClick={toggleVideo}>
        {videoBtn}
      </IconButton>
      <IconButton title={micTitle} onClick={toggleAudio}>
        {micBtn}
      </IconButton>
    </Box>
  );

  return content;
}