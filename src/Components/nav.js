import React from "react";
import AppBar from '@material-ui/core/AppBar';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

import UserPill from "./userPill";

const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(3),
    paddingRight: theme.spacing(5),
    paddingLeft: theme.spacing(5),
    marginBottom: theme.spacing(4),
  },
  userPill: {
    float: "right",
  }
}));

export default function(props) {
  const classes = useStyles();

  return (
    <Box>
      <AppBar position="static" className={classes.root}>
        <Grid
          container
          direction="row"
          justify="space-between"
          alignItems="center"
        >
          <Box>
            <Typography variant="h1" color="secondary">SGF</Typography>
          </Box>
          <UserPill className={classes.userPill} />
        </Grid>
      </AppBar>
      {props.children}
    </Box>
  );
};