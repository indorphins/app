import React, { useState, useEffect } from 'react';
import { OTSession, OTPublisher, OTStreams, OTSubscriber } from 'opentok-react';
import { Grid, Button } from '@material-ui/core';
require('@opentok/client');

export default function(props) {

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

  const onSubscribeError = (error) => {
    setError(error);
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
      <Grid container>
        {error ? (
          <div className="error">
            <strong>Error:</strong> {error}
          </div>
        ) : null}
        <OTSession
          apiKey={credentials.apiKey}
          sessionId={credentials.sessionId}
          token={credentials.token}
          onError={onSessionError}
          eventHandlers={sessionEventHandlers}
        >
          <Button variant="contained" color="secondary" id="videoButton" onClick={toggleVideo}>
            {publishVideo ? 'Disable' : 'Enable'} Camera
          </Button>
          <OTPublisher
            properties={{ publishVideo, width: 300, height: 200, }}
            onPublish={onPublish}
            onError={onPublishError}
            eventHandlers={publisherEventHandlers}
          />
          <OTStreams>
            <OTSubscriber
              properties={{ width: 750, height: 500 }}
              onSubscribe={onSubscribe}
              onError={onSubscribeError}
              eventHandlers={subscriberEventHandlers}
            />
          </OTStreams>
        </OTSession>
      </Grid>
    );
  }

  return (
    <Grid>
      {content}
    </Grid>
  )
}