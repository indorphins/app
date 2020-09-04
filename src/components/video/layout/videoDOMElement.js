import React, { useEffect, useRef } from 'react';
import { Grid } from '@material-ui/core';

export default function VideoDOMElement(props) {

  const gridRef = useRef(null);

  useEffect(() => {
    if (props.element) {
      gridRef.current.innerHTML = "";
      gridRef.current.appendChild(props.element);
    }
  }, [props, gridRef])

  return (
    <Grid 
      container
      style={{width:"100%", height: "100%"}}
      ref={gridRef}
    />
  )
}