import React from 'react';
import { Grid, Typography, useMediaQuery } from '@material-ui/core';
import { daysMed, daysSmall, daysLarge } from '../../utils/constants';

export default function Weekdays(props) {
  const { classes } = props;
  const sm = useMediaQuery('(max-width:600px)');
  const med = useMediaQuery('(max-width:900px)');

  let content = null;
  let days = [];
  let i = 0

  if (sm) {
    days = daysSmall;
  } else if (med) {
    days = daysMed;
  } else {
    days = daysLarge;
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
