import React from 'react';
import { Tooltip } from '@material-ui/core';
import DirectionsRun from '@material-ui/icons/DirectionsRun';

export function ClassesTakenIcon(props) {
  return (
    <Tooltip title={`${props.classes} classes`} placement='top' arrow>
      <DirectionsRun />
    </Tooltip>
  )
}