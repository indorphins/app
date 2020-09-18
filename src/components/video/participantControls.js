import React, { useState, useEffect } from 'react';
import { Grid, Checkbox, Chip, makeStyles } from '@material-ui/core';
import { Star, VideocamOffOutlined } from '@material-ui/icons';

import Emote from './emote';
import MuteButton from './mute';

const useStyles = makeStyles((theme) => ({
  camOff: {
    padding: theme.spacing(1),
  },
  camOffIcon: {
    color: theme.palette.error.dark,
  }
}));

export default function ParticipantControls(props) {

  const classes = useStyles();
  const { course, user, session, videoHandler, audioHandler, loopMode } = props;
  const [subs, setSubs] = useState([]);

  useEffect(() => {
    if (props.subs) {
      setSubs([].concat(props.subs).sort((a, b) => {
        if (a.user.username === b.user.username) {
          return 0;
        } else if (a.user.username > b.user.username) {
          return 1;
        } else {
          return -1;
        }
      }).map(item => {
        if (item.user.id === course.instructor.id) {
          item.color = "primary";
          item.icon = (<Star />);
          item.buttonDisabled = true;
        } else {
          item.color = "default";
          item.icon = null;

          if (loopMode) {
            item.buttonDisabled = true;
          } else {
            item.buttonDisabled = false;
          }
        }

        if (item.disabled) {
          item.videoCheckbox =(
            <Grid className={classes.camOff}>
              <VideocamOffOutlined className={classes.camOffIcon} />
            </Grid>
          )
        } else {
          item.videoCheckbox = (
            <Checkbox disabled={item.buttonDisabled} name={item.user.id} checked={item.video} onClick={videoHandler} />
          );
        }

        return item;
      }));
    }
  }, [props]);

  let content = null;

  if (session && user) {

    content = (
      <Grid container direction="column" justify="flex-start" alignItems="flex-start">
        {subs.map(item => (
          <Grid item key={item.user.id}>
            <Grid container direction="row" justify="flex-start" alignItems="center" alignContent="center">
              <Grid item>
                {item.videoCheckbox}
              </Grid>
              <Grid item>
                <Chip icon={item.icon} color={item.color} label={item.user.username} />
              </Grid>
              <Grid item>
                <MuteButton name={item.user.id} checked={item.audio} onClick={audioHandler} />
              </Grid>
              <Grid item>
                <Emote userId={item.user.id} username={user.username} session={session} />
              </Grid>                            
            </Grid>
          </Grid>
        ))}
      </Grid>
    );
  }

  return content;
}