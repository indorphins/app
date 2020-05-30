import React from "react";

import AppBar from '@material-ui/core/AppBar';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(4),
  },
}));

export default function(props) {
  const classes = useStyles();

  return (
    <Box>
      <AppBar position="static" className={classes.root}>
        <Typography variant="h1" color="secondary">SGF</Typography>
      </AppBar>
      {props.children}
    </Box>
  );
};