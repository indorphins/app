import React, { useState, useRef } from 'react';
import { IconButton, Grid, Menu, MenuItem, makeStyles } from '@material-ui/core';
import { InsertEmoticon } from '@material-ui/icons';

import log from '../../log';

const useStyles = makeStyles((theme) => ({
  emoteMenu: {
    columns: 2,
  }
}));

export default function Emote(props) {

  const { session } = props;
  const classes = useStyles();
  const btn = useRef(null);
  const [anchorEl, setAnchorEl] = useState(null);

  const sendEmote = function(event) {
    log.debug('emote event', event);

    session.signal(
      {
        type: "emote",
        data: JSON.stringify({
          userId: event.id,
          message: event.value,
          date: new Date().toISOString(),
        }),
      },
      function(error) {
        if (error) {
          log.error("OPENTOK:: user signal error" + error.message);
        }
      }
    );
  }

  const handleClick = () => {
    setAnchorEl(btn.current);
  };

  const handleClose = function() {
    setAnchorEl(null);
  }

  const handleSelect = function(event) {
    sendEmote({id: props.userId, value: event});
    setAnchorEl(null);
  }

  return (
    <Grid style={{display: "inline"}}>
      <IconButton ref={btn} onClick={handleClick} title="Send an emote"><InsertEmoticon color="primary" /></IconButton>
      <Menu
        keepMounted
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        classes={{list: classes.emoteMenu}}
      >
        <MenuItem value="👍" title="Send a thumbs-up" onClick={() => handleSelect(`${props.username}: 👍`)}>
          <span aria-label="thumbs-up" role="img">👍</span>
        </MenuItem>
        <MenuItem value="✋" title="Give them a high-five" onClick={() => handleSelect(`${props.username}: ✋`)}>
          <span aria-label="high-five" role="img">✋</span>
        </MenuItem>
        <MenuItem value="👋" title="Wave hello" onClick={() => handleSelect(`${props.username}: 👋`)}>
          <span aria-label="hand-wave" role="img">👋</span>
        </MenuItem>
        <MenuItem value="✊" title="Fist bump" onClick={() => handleSelect(`${props.username}: ✊`)}>
          <span aria-label="fist-bump" role="img">✊</span>
        </MenuItem>
        <MenuItem value="🤣" title="That was hilarious" onClick={() => handleSelect(`${props.username}: 🤣`)}>
          <span aria-label="loved-that" role="img">🤣</span>
        </MenuItem>
        <MenuItem value="😍" title="Let them know you loved that" onClick={() => handleSelect(`${props.username}: 😍`)}>
          <span aria-label="loved-that" role="img">😍</span>
        </MenuItem>
        <MenuItem 
          value="🥵"
          title="Let them know you are exhausted"
          onClick={() => handleSelect(`${props.username}: 🥵`)}
        >
          <span aria-label="worn-out" role="img">🥵</span>
        </MenuItem>
        <MenuItem value="🔥" title="You are on fire" onClick={() => handleSelect(`${props.username}: 🔥`)}>
          <span aria-label="on-fire" role="img">🔥</span>
        </MenuItem>     
      </Menu>
    </Grid>
  )
}
