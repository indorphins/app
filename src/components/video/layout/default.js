import React, { useState, useEffect } from 'react';
import { Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import VideoContainer from './videoContainer';
import VideoDOMElement from './videoDOMElement';
import log from '../../../log';
import useWindowSize from '../../../hooks/useWindowSize';

const verticalStyles = makeStyles((theme) => ({
  root: {
    height:"100%", 
    overflow: "hidden",
    background: theme.palette.common.background,
  },
  full: {
    height: "100%",
    width: "100%",
    position: "relative",
    background: theme.palette.grey[50],
  },
  mobileFullClass: {
    height: "100%",
    width: "100%",
    position: "relative",
    '@media (max-width: 900px)': {
      height: '75vw',
      width: '100%'
    }
  },
  rootChild: {
    height:"100%",
    overflow: "hidden",
    '@media (max-width: 900px)': {
      justifyContent: 'center',
      alignContent: 'center'
    }
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
  },
  endCallBtn: {
    position: 'absolute',
    zIndex: 999,
    bottom: "10px",
    left: "10px"
  }
}));

const horizontalStyles = makeStyles((theme) => ({
  root: {
    height:"100%", 
    overflow: "hidden",
    background: theme.palette.common.background,
  },
  full: {
    height: "100%",
    width: "100%",
    position: "relative",
  },
  mobileFullClass: {
    height: "100%",
    width: "100%",
    position: "relative",
    '@media (max-width: 900px)': {
      height: '10%%',
      width: '133vh'
    }
  },
  rootChild: {
    height:"100%",
    overflow: "hidden",
    '@media (max-width: 900px)': {
      justifyContent: 'center',
      alignContent: 'center'
    }
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
  },
  endCallBtn: {
    position: 'absolute',
    zIndex: 999,
    bottom: "10px",
    left: "10px"
  }
}));

export default function Default(props) {

  const horizontalClasses = horizontalStyles();
  const verticalClasses = verticalStyles();
  const { session, subs, user, isMobile, course } = props;
  const [ featureVid, setFeatureVid ] = useState(null);
  const [ regularVid, setRegularVid ] = useState([]);
  const [ direction, setDirection ] = useState("column");
  const [ max, setMax ] = useState(4);
  const [ classes, setClasses ]  = useState(horizontalClasses);
  const [ featureClasses, setFeatureClasses ] = useState(null);
  const [ regularClasses, setRegularClasses ] = useState(null);
  const [ screenWidth, screenHeight ] = useWindowSize();

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
        setRegularVid([]);
      }

      if (filtered.length > 1) {
        setRegularVid([].concat(filtered.slice(1)));
      } else {
        setRegularVid([]);
      }
    }
  }, [subs]);

  useEffect(() => {
    if (isMobile) {
      if (screenWidth > screenHeight) {
        setFeatureClasses(horizontalClasses.mobileFullClass);
      } else {
        setFeatureClasses(verticalClasses.mobileFullClass);
      }
    } else {
      if (featureVid && regularVid.length === 0) {
        setFeatureClasses(classes.full);
      } else if (regularVid.length === 1) {
        setFeatureClasses(classes.split);
        setRegularClasses(classes.split);
      } else if (regularVid.length === 2) {
        setFeatureClasses(classes.subscriberFeatureAlt);
        setRegularClasses(classes.subscriberItemAlt);
      } else {
        setFeatureClasses(classes.subscriberFeature);
        setRegularClasses(classes.subscriberItem);
      } 
    }
  }, [screenWidth, screenHeight, featureVid, regularVid]);

  let featureVidContent = null;
  if (featureVid) {
    featureVidContent = (
      <VideoContainer
        id={featureVid.user.user_id}
        username={featureVid.user.username}
        user={user}
        session={session}
        className={featureClasses}
        classes={classes}
        isMobile={isMobile}
        course={course}
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
            id={item.user.user_id}
            username={item.user.username}
            user={user}
            session={session}
            className={regularClasses}
            classes={classes}
            isMobile={isMobile}
            course={course}
          >
            <VideoDOMElement element={item.videoElement} />
          </VideoContainer>
        ))}
      </React.Fragment>
    );
  }

  return (
    <Grid xs item className={classes.root} style={{height:"100%", overflow: "hidden"}}>
      <Grid
        container
        direction={direction}
        justify="flex-start"
        className={classes.rootChild}
      >
        {featureVidContent}
        {videoContent}
      </Grid>
    </Grid>
  );
}