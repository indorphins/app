import React, { useState, useEffect } from 'react';
import { Grid, Checkbox, Chip } from '@material-ui/core';

import Emote from './emote';
import MuteButton from './mute';

export default function ParticipantControls(props) {

  const { user, session, videoHandler, audioHandler, loopMode } = props;
  const [subs, setSubs] = useState([]);

  useEffect(() => {
    if (props.subs) {
      setSubs([].concat(props.subs.sort((a, b) => {
        if (a.user.username === b.user.username) {
          return 0;
        } else if (a.user.username > b.user.username) {
          return 1;
        } else {
          return -1;
        }
      })));
    }
  }, [props]);

  let content = null;

  if (session && user) {
    content = (
      <Grid container direction="column" justify="flex-start" alignItems="flex-start">
        {subs.map(item => (
          <Grid item key={item.user.id}>
            <Checkbox disabled={loopMode} name={item.user.id} checked={item.video} onClick={videoHandler} />
            <Chip label={item.user.username} />
            <MuteButton name={item.user.id} checked={item.audio} onClick={audioHandler} />
            <Emote userId={item.user.id} username={user.username} session={session} />
          </Grid>
        ))}
      </Grid>
    );
  }

  return content;
}