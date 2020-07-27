import React from 'react';
import { Grid, makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  link: {
    color: theme.palette.primary.main,
    textDecoration: "none",
  }
}));

export default function legal() {
  const classes = useStyles();

  return (
    <Grid container direction="row" justify="space-between">
      <Grid item>
        <a className={classes.link} href="/PP.html" target="_blank">Privacy Policy</a>
      </Grid>
      <Grid item>
        <a className={classes.link} href="/TOS.html" target="_blank">Terms of Service</a>
      </Grid>
    </Grid>
  )
}