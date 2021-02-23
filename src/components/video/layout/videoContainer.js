import React from 'react';
import { 
  Box, 
  Grid, 
  Typography,
} from '@material-ui/core';
import LeaveSession from '../leaveSession';

import Emote from '../emote';

export default function VideoContainer(props) {
  const { classes, style, isMobile = false, course, className} = props;

  let styles = Object.assign({
    backgroundColor: "black",
  }, style)

  let endCallButton;
  if (isMobile) {
    endCallButton = (
      <Grid className={classes.endCallBtn}>
        <LeaveSession course={course} />
      </Grid>
    )
  }

  return (
    <Grid item className={className} style={styles}>
      {props.children}
      <Box className={classes.subscriberLabelBox}>
        <Typography
          align="center"
          variant="h4"
          className={classes.subscriberLabel}
        >
          {props.username}
        </Typography>
      </Box>
      {endCallButton}
      <Grid className={classes.emoteBtn}>
        <Emote userId={props.id} username={props.user.username} session={props.session} />
      </Grid>
    </Grid>
  );
}