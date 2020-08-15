import React from 'react';
import { Grid } from '@material-ui/core';

export default function VideoDOMElement(props) {

  if (props.element) {
    return (
      <Grid 
        container
        style={{width:"100%", height: "100%"}}
        ref={(nodeRef) => {
          (function(nodeRef) { 
            if (!nodeRef) return; 
            nodeRef.innerHTML=""; 
            nodeRef.appendChild(props.element);
          })(nodeRef);
        }}
      />
    )
  } else {
    return null;
  }
}