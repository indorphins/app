import React, { useState, useEffect } from 'react';
import { Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import VideoContainer from './videoContainer';
import VideoDOMElement from './videoDOMElement';
import log from '../../../log';


const gridStyles = makeStyles((theme) => ({
  root: {
    height:"100%", 
    overflow: "hidden",
    background: theme.palette.common.background,
  },
  video: {
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

const breaks = {
  1: [1,1],
  2: [2,1],
  3: [2,2],
  4: [2,2],
  5: [3,2],
  6: [3,2],
  7: [3,3],
  8: [3,3],
  9: [3,3],
  10: [4,3],
  11: [4,3],
  12: [4,3],
  13: [4,4],
  14: [4,4],
  15: [4,4],
  16: [4,4],
  17: [5,4],
  18: [5,4],
  19: [5,4],
  20: [5,4],
  21: [5,5],
  22: [5,5],
  23: [5,5],
  24: [5,5],
  25: [5,5],
  26: [6,5],
  27: [6,5],
  28: [6,5],
  29: [6,5],
  30: [6,5],
  31: [6,6],
  32: [6,6],
  33: [6,6],
  34: [6,6],
  35: [6,6],
  36: [6,6],
}

export default function GridView(props) {

  const classes = gridStyles();
  const { session, subs, user } = props;
  const [ vids, setVids ] = useState([]);
  const [ w, setW ] = useState(1);
  const [ h, setH ] = useState(1); 

  useEffect(() => {
    if (subs) {
      let filtered = subs.filter(item => {
        return item.video && item.videoElement && !item.disabled;
      });

      log.debug("OPENTOK:: filtered videos", filtered);

      setVids(filtered);
    }
  }, [subs]);

  useEffect(() => {
    if (vids.length <= 0) return;
    let brk = breaks[vids.length];
    if (brk) {
      setW(brk[0]);
      setH(brk[1]);
    }
  }, [vids]);


  let vidContent = null
  
  if (vids.length) {
    vidContent = (
      <React.Fragment>
        {vids.map(item => (
          <VideoContainer 
            key={item.user.id}
            id={item.user.id}
            username={item.user.username}
            user={user}
            session={session}
            className={classes.video}
            classes={classes}
            style={{
              width: `calc(100% / ${w})`,
              height: `calc(100% / ${h})`,
            }}
          >
            <VideoDOMElement element={item.videoElement} />
          </VideoContainer>
        ))}
      </React.Fragment>
    );
  }

  return (
    <Grid xs item className={classes.root}>
      <Grid
        container
        direction="row"
        justify="flex-start"
        style={{height:"100%", overflow: "hidden"}}
      >
        {vidContent}
      </Grid>
    </Grid>
  );
}