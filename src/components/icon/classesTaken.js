import React from 'react';
import { Tooltip } from '@material-ui/core';
import DirectionsRun from '@material-ui/icons/DirectionsRun';

export function ClassesTakenIcon(props) {
  if (props.classes && props.classes > 0) {
    return (
      <Tooltip title={`${props.classes} classes`} placement='top' arrow>
        <DirectionsRun />
      </Tooltip>
    );
  }

  return null;
}