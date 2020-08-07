import React from 'react';
import { Tooltip } from '@material-ui/core';
import BdayCakeIcon from '@material-ui/icons/Cake';

export const BdayIcon = (props) => {
  const formatDate = (date) => {
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  const bday = formatDate(new Date(props.bday));

  return (
    <Tooltip title={bday} placement='top' arrow>
      <BdayCakeIcon />
    </Tooltip>
  )
}