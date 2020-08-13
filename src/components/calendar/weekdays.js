import React from 'react';
import { Grid, Typography, useMediaQuery } from '@material-ui/core';

export default function Weekdays(props) {
  const { classes } = props;
  const sm = useMediaQuery('(max-width:600px)');
  const med = useMediaQuery('(max-width:900px)');

  let content = null;
  let days = [];
  let i = 0

  if (sm) {
    days = ["S", "M", "T", "W", "T", "F", "S"];
  } else if (med) {
    days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  } else {
    days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  }

  content = (
    <Grid container direction="row">
      {days.map(d => (
        <Grid item key={d + i++} className={classes.header}>
          <Typography variant="body1">{d}</Typography>
        </Grid>
      ))}                                                                          
    </Grid>
  );

  return content;
}
