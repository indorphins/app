import React, { useState, useEffect } from 'react';
import { OTSession, OTPublisher, OTStreams, OTSubscriber } from 'opentok-react';
import { Grid, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import log from '../log';

require('@opentok/client');

const useStyles = makeStyles((theme) => ({
  grid: {
    width: '100%',
  },
  participants: {
    marginRight: theme.spacing(1),
  },
  ctrl: {
    width: '200px',
  }
}));

export default function(props) {

  const classes = useStyles();
  const [credentials, setCredentials] = useState({});
  const [error, setError] = useState(null);
  const [publishVideo, setPublishVideo] = useState(true);

  useEffect(() => {
    if (props.credentials && props.credentials.token) {
      setCredentials(props.credentials);
    }
  }, [props.credentials])

  const sessionEventHandlers = {
    sessionConnected: () => {

    },
    sessionDisconnected: () => {

    },
    sessionReconnected: () => {

    },
    sessionReconnecting: () => {
      
    },
  };

  const publisherEventHandlers = {
      accessDenied: () => {
        console.log('User denied access to media source');
      },
      streamCreated: () => {
        console.log('Publisher stream created');
      },
      streamDestroyed: ({ reason }) => {
        console.log(`Publisher stream destroyed because: ${reason}`);
      },
    };

  const subscriberEventHandlers = {
    videoEnabled: () => {
      console.log('Subscriber video enabled');
    },
    videoDisabled: () => {
      console.log('Subscriber video disabled');
    },
  };

  const onSessionError = (error) => {
    setError(error);
  };

  const onPublish = () => {
    console.log('Publish Success');
  };

  const onPublishError = (error) => {
    setError(error);
  };

  const onSubscribe = () => {
    console.log('Subscribe Success');
  };

  const onSubscribeError = (err) => {
    setError(err);
    log.error("opentok session", error);
  };

  const toggleVideo = () => {
    if (publishVideo) {
      setPublishVideo(false);
    } else {
      setPublishVideo(true);
    }
  };

  let content = null;

  if (credentials.token && credentials.apiKey && credentials.sessionId) {

    content = (
      <Grid className={classes.grid}>
        <OTSession
          apiKey={credentials.apiKey}
          sessionId={credentials.sessionId}
          token={credentials.token}
          onError={onSessionError}
          eventHandlers={sessionEventHandlers}
        >
          <Grid container direction='row' justify="flex-start" className={classes.grid}>
            <Grid item xs>
              <Grid container spacing={1} direction='row' justify='flex-start' alignItems='flex-start'>
              <OTStreams>
                <Grid item>
                  <OTSubscriber
                    properties={{ width: 300, height: 168 }}
                    onSubscribe={onSubscribe}
                    onError={onSubscribeError}
                    eventHandlers={subscriberEventHandlers}
                  />
                </Grid>
              </OTStreams>
              </Grid>
            </Grid>
            <Grid item className={classes.ctrl}>
              <Button variant="contained" color="secondary" id="videoButton" onClick={toggleVideo}>
                {publishVideo ? 'Disable' : 'Enable'} Camera
              </Button>
              <OTPublisher
                properties={{ publishVideo, width: 200, height: 112, }}
                onPublish={onPublish}
                onError={onPublishError}
                eventHandlers={publisherEventHandlers}
              />
            </Grid>
          </Grid>
        </OTSession>
      </Grid>
    );
  }

  return content;
}