import React from 'react';
import { Tooltip } from '@material-ui/core';
import BdayCakeIcon from '@material-ui/icons/Cake';

export function BdayIcon(props) {
  const formatDate = (date) => {
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  const bday = formatDate(new Date(props.bday));

  if (props.showBirthday) {
    return (
      <Tooltip title={bday} placement='top' arrow>
        <BdayCakeIcon />
      </Tooltip>
    );
  }

  return null;
}