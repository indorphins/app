import React from 'react';
import { Grid } from '@material-ui/core';

export default function VideoDOMElement(props) {

  if (props.element) {
    return (
      <Grid 
        container
        style={{width:"100%", height: "100%"}}
        ref={(nodeRef) => {
          if (nodeRef) {
            nodeRef.innerHTML= "";
            nodeRef.appendChild(props.element);
          }
        }}
      />
    )
  } else {
    return null;
  }
}