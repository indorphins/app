import React from 'react';
import { FiberNew } from '@material-ui/icons';

export function ClassesTakenIcon(props) {
  const { count } = props;

  if (count === 0) {
    return (
      <FiberNew style={{fontSize: '1.2rem'}} />
    );
  } else {

    return null;
  }
}