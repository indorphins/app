import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import Emote from '../emote';
import VideoDOMElement from './videoDOMElement';
import log from '../../../log';

const useStyles = makeStyles((theme) => ({
  subscriberGridAlt: {
    height: "100%",
  },
  subscriberItemAlt: {
    height: "25%",
    background: theme.palette.grey[50],
    position: "relative",
  },
  subscriberFeatureVid: {
    height: "100%",
  },  
  subscriberFeature: {
    height: "75%",
    width: "100%",
    background: theme.palette.grey[50],
    position: "relative"
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

function VideoContainer(props) {
  const classes = useStyles();

  return (
    <Grid item className={props.className} style={props.style}>
      {props.children}
      <Box className={classes.subscriberLabelBox}>
        <Typography
          align="center"
          variant="h5"
          className={classes.subscriberLabel}
        >
          {props.username}
        </Typography>
      </Box>
      <Grid className={classes.emoteBtn}>
        <Emote userId={props.id} username={props.user.username} session={props.session} />
      </Grid>
    </Grid>
  );
}

export default function Vertical(props) {

  const { session, subs, user } = props;
  const classes = useStyles();
  const [ featureVid, setFeatureVid ] = useState(null);
  const [ regularVid, setRegularVid ] = useState([]);
  const [ max, setMax ] = useState(4);

  useEffect(() => {
    if (subs) {
      let filtered = subs.filter(item => {
        return item.videoElement;
      }).slice(0, max);

      log.debug("got filtered subscriber videos", filtered);

      setFeatureVid(filtered[0])
      setRegularVid([].concat(filtered.slice(1)));
    }
  }, [subs]);

  useEffect(() => {
    if (props.max) {
      setMax(props.max);
    }
  }, [props]);


  let featureVidContent = null;
  if (featureVid) {
    featureVidContent = (
      <VideoContainer
        id={featureVid.user.id}
        username={featureVid.user.username}
        user={user}
        session={session}
        className={classes.subscriberFeature}
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
            session={session}
            className={classes.subscriberItemAlt}
            style={{width: `calc(100% / ${max - 1})`}}
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
        direction="column"
        justify="flex-start"
        style={{height:"100%", overflow: "hidden"}}
      >
        {featureVidContent}
        {videoContent}
      </Grid>
    </Grid>
  );
}