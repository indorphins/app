import React from 'react';
import { useHistory } from 'react-router-dom';
import { IconButton, makeStyles } from '@material-ui/core';
import { ExitToApp } from '@material-ui/icons';

import path from '../../routes/path';

const useStyles = makeStyles((theme) => ({
  btn: {
    '&:hover': {
      backgroundColor: theme.palette.error.dark,
    }
  },
}));

export default function LeaveSession(props) {

  const { course } = props;
  const classes = useStyles();
  const history = useHistory();

  function end() {
    history.push(`${path.courses}/${course.id}`);
  }

  return (
    <IconButton title="Leave class" onClick={end} className={classes.btn}>
      <ExitToApp />
    </IconButton>
  )
}