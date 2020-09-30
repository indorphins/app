import React, { useEffect, useRef } from 'react';
import { Grid } from '@material-ui/core';
import log from '../../../log';

export default function VideoDOMElement(props) {

  const { element } = props;
  const gridRef = useRef(null);

  useEffect(() => {
    if (element) {
      log.debug("VIDEO ELEMENT:: element changed", element);
      gridRef.current.innerHTML = "";
      element.setAttribute("playsinline", "");
      element.setAttribute("autoplay", "");
      gridRef.current.appendChild(element);
    }
  }, [element])

  return (
    <Grid 
      container
      style={{width:"100%", height: "100%"}}
      ref={gridRef}
    />
  )
}