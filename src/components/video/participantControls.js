import React, { useState, useEffect } from 'react';
import { Grid, Checkbox, Chip, Typography, makeStyles } from '@material-ui/core';
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
          item.color = "primary";
          item.icon = null;

          if (loopMode || !item.stream) {
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
            <Checkbox
              color="primary"
              disabled={item.buttonDisabled}
              name={item.user.id}
              checked={item.video}
              onClick={videoHandler}
            />
          );
        }

        return item;
      }));
    }
  }, [props]);

  let content = null;

  if (session && user && subs.length > 0) {

    let text;

    if (loopMode) {
      text = "Rotating class members viewed. View the settings tab to pin a friend's video";
      if (user.id === course.instructor.id) {
        text = "Rotating class members viewed. View the settings tab to pin a friend's video";
      }
    } else {
      text = "Select up to three class members to view, the instructor's video is permanently pinned";
      if (user.id === course.instructor.id) {
        text = "Select up to four class members to view. In Grid mode you can view everyone all at once";
      }
    }

    content = (
      <React.Fragment>
        <Grid container direction="column" justify="center" alignContent="center">
          <Grid item style={{paddingLeft: 24, paddingRight: 24}}>
            <Typography variant="subtitle2">{text}</Typography>
          </Grid>
        </Grid>
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
      </React.Fragment>
    );
  } else {
    content = (
      <Grid container direction="column" justify="center" alignContent="center">
        <Grid item>
          <Typography variant="subtitle2">Class empty</Typography>
        </Grid>
      </Grid>
    );
  }

  return content;
}