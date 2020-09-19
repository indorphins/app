import React from 'react';
import { 
  Box, 
  Grid, 
  Typography,
} from '@material-ui/core';

import Emote from '../emote';

export default function VideoContainer(props) {
  const { classes } = props;

  return (
    <Grid item className={props.className} style={props.style}>
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
      <Grid className={classes.emoteBtn}>
        <Emote userId={props.id} username={props.user.username} session={props.session} />
      </Grid>
    </Grid>
  );
}