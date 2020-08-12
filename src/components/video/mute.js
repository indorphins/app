import React, { useState, useEffect } from 'react';
import { IconButton } from '@material-ui/core';
import { VolumeUp, VolumeOff } from '@material-ui/icons';

export default function MuteButton(props) {

  const [isChecked, setChecked] = useState(props.checked);

  useEffect(() => {
    setChecked(props.checked);
  }, [props.checked]);

  let soundBtn = (<VolumeOff />);
  let title = "Unmute this participant";

  if (isChecked) {
    soundBtn = (<VolumeUp />);
    title = "Mute this participant";
  }

  return (
    <IconButton name={props.name} title={title} onClick={() => props.onClick(props.name)}>
      {soundBtn}
    </IconButton>
  );
}