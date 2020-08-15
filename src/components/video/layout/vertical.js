import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import Emote from '../emote';
import VideoDOMElement from './videoDOMElement';

const useStyles = makeStyles((theme) => ({
  subscriberGridAlt: {
    height: "100%",
  },
  subscriberItemAlt: {
    height: "25%",
    background: theme.palette.grey[100],
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
    <Grid item className={props.className}>
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
        <Emote userId={props.id} username={props.username} session={props.session} />
      </Grid>
    </Grid>
  );
}

export default function Vertical(props) {

  const { session } = props;
  const classes = useStyles();
  const [ featureVid, setFeatureVid ] = useState(null);
  const [ regularVid, setRegularVid ] = useState([]);
  const [ max, setMax ] = useState(3);

  useEffect(() => {
    if (props.feature) {
      setFeatureVid(props.feature);
    }

    if (props.small) {
      setRegularVid([].concat(props.small.slice(0, max - 1)));
    }

    if (props.maxSmall) {
      setMax(3);
    }
  }, [props]);


  let featureVidContent = null;
  if (featureVid) {
    featureVidContent = (
      <VideoContainer
        id={featureVid.id}
        username={featureVid.username}
        session={session}
        className={classes.subscriberFeature}
      >
        <VideoDOMElement element={featureVid.element} />
      </VideoContainer>
    )
  }

  let videoContent = null;
  if (regularVid) {
    videoContent = (
      <React.Fragment>
        {regularVid.map(item => (
          <VideoContainer 
            key={item.id}
            id={item.id}
            username={item.username}
            session={session}
            className={classes.subscriberItemAlt}
            style={{width: `calc(100% / ${max})`}}
          >
            <VideoDOMElement element={item.element} />
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