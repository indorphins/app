import React, { useState, useEffect } from 'react';
import { Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import VideoContainer from './videoContainer';
import VideoDOMElement from './videoDOMElement';
import log from '../../../log';

const verticalStyles = makeStyles((theme) => ({
  full: {
    height: "100%",
    width: "100%",
    position: "relative",
    background: theme.palette.grey[50],
  },
  split: {
    height: "50%",
    width: "100%",
    position: "relative",
    background: theme.palette.grey[50],
  },
  subscriberItem: {
    height: "25%",
    background: theme.palette.grey[50],
    position: "relative",
    width: "calc(100% / 3)",
  },
  subscriberItemAlt: {
    height: "33.33%",
    width: "50%",
    position: "relative",
    background: theme.palette.grey[50],
  },
  subscriberFeature: {
    height: "75%",
    width: "100%",
    background: theme.palette.grey[50],
    position: "relative"
  },
  subscriberFeatureAlt: {
    height: "66.66%",
    width: "100%",
    position: "relative",
    background: theme.palette.grey[50],
  },
  subscriberLabelBox: {
    position: 'relative',
    bottom: '50px',
  },
  subscriberLabel: {
    fontSize: "2rem",
    color: theme.palette.grey[800],
  },
  emoteBtn: {
    position: "absolute",
    zIndex: 999,
    bottom: "10px",
    right: "10px"
  }
}));

const horizontalStyles = makeStyles((theme) => ({
  full: {
    height: "100%",
    width: "100%",
    position: "relative",
  },
  split: {
    height: "100%",
    width: "50%",
    position: "relative",
  },
  subscriberItem: {
    width: "25%",
    background: theme.palette.grey[50],
    position: "relative",
    height: "calc(100% / 3)"
  },
  subscriberItemAlt: {
    width: "33.33%",
    height: "calc(100% / 2)",
    position: "relative",
  },
  subscriberFeature: {
    width: "75%",
    height: "100%",
    background: theme.palette.grey[50],
    position: "relative"
  },
  subscriberFeatureAlt: {
    width: "66.66%",
    height: "100%",
    position: "relative",
  },
  subscriberLabelBox: {
    position: 'relative',
    bottom: '50px',
  },
  subscriberLabel: {
    fontSize: "2rem",
    color: theme.palette.grey[800],
  },
  emoteBtn: {
    position: "absolute",
    zIndex: 999,
    bottom: "10px",
    right: "10px"
  }
}));

export default function Default(props) {

  const horizontalClasses = horizontalStyles();
  const verticalClasses = verticalStyles();
  const { session, subs, user } = props;
  const [ classes, setClasses ]  = useState(horizontalClasses);
  const [ featureVid, setFeatureVid ] = useState(null);
  const [ regularVid, setRegularVid ] = useState([]);
  const [ direction, setDirection ] = useState("column");
  const [ max, setMax ] = useState(4);

  useEffect(() => {
    if (subs) {
      let filtered = subs.filter(item => {
        return item.video && item.videoElement && !item.disabled;
      }).slice(0, max);

      log.debug("DEFAULT LAYOUT:: filtered subscriber videos", filtered);

      if (filtered[0]) {
        setFeatureVid(filtered[0]);
      } else {
        setFeatureVid(null);
      }
      if (filtered.length > 1) {
        setRegularVid([].concat(filtered.slice(1)));
      } else {
        setRegularVid([]);
      }
    }
  }, [subs]);

  useEffect(() => {
    if (props.max) {
      setMax(props.max);
    }

    if (props.layout) {
      if (props.layout === "vertical") { 
        setDirection("row");
        setClasses(verticalClasses);
      }
      if (props.layout === "horizontal") {
        setDirection("column");
        setClasses(horizontalClasses);
      }
    }
  }, [props]);

  let featureClasses = null;
  let regularClasses = null;

  if (featureVid && regularVid.length === 0) {
    featureClasses = classes.full;
  } else if (regularVid.length === 1) {
    featureClasses = classes.split;
    regularClasses = classes.split;
  } else if (regularVid.length === 2) {
    featureClasses = classes.subscriberFeatureAlt;
    regularClasses = classes.subscriberItemAlt;
  } else {
    featureClasses = classes.subscriberFeature;
    regularClasses = classes.subscriberItem;
  }


  let featureVidContent = null;
  if (featureVid) {
    featureVidContent = (
      <VideoContainer
        id={featureVid.user.id}
        username={featureVid.user.username}
        user={user}
        session={session}
        className={featureClasses}
        classes={classes}
      >
        <VideoDOMElement element={featureVid.videoElement} />
      </VideoContainer>
    )
  }

  let videoContent = null;
  if (regularVid) {
    videoContent = (
      <React.Fragment>
        {regularVid.map(item => (
          <VideoContainer 
            key={item.user.id}
            id={item.user.id}
            username={item.user.username}
            user={user}
            session={session}
            className={regularClasses}
            classes={classes}
          >
            <VideoDOMElement element={item.videoElement} />
          </VideoContainer>
        ))}
      </React.Fragment>
    );
  }

  return (
    <Grid xs item style={{height:"100%", overflow: "hidden"}}>
      <Grid
        container
        direction={direction}
        justify="flex-start"
        style={{height:"100%", overflow: "hidden"}}
      >
        {featureVidContent}
        {videoContent}
      </Grid>
    </Grid>
  );
}