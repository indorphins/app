import React from 'react';
import { Tooltip } from '@material-ui/core';
import Whatshot from '@material-ui/icons/Whatshot';

export function WeekStreakIcon(props) {
  if (props.weeks && props.weeks > 0) {
    return (
      <Tooltip title={`${props.weeks} weeks`} placement='top' arrow>
        <Whatshot />
      </Tooltip>
    );
  }

  return null;
}