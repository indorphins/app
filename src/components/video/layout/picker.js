import React, { useState, useRef, useEffect } from 'react';
import { IconButton, Grid, Menu, MenuItem } from '@material-ui/core';

import FullscreenIcon from '../../icon/fullscreen';
import GridIcon from '../../icon/grid';
import SplitGridIcon from '../../icon/splitGrid';

export default function LayoutPicker(props) {

  const btn = useRef(null);
  const [layout, setLayout] = useState("horizontal");
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    if (props.layout) setLayout(props.layout);
  }, [props])

  const handleClick = () => {
    setAnchorEl(btn.current);
  };

  const handleClose = function() {
    setAnchorEl(null);
  }

  const handleSelect = function(layout) {
    handleClose();
    setLayout(layout);
    if (props.onSelect) props.onSelect(layout);
  }

  let btnContent = (<FullscreenIcon color="primary" />)

  if (layout === "grid") {
    btnContent = (<GridIcon color="primary" width="20" height="20" />);
  }

  if (layout === "vertical") {
    btnContent = (
      <SplitGridIcon color="primary" width="20" height="20" style={{ transform: "rotate(90deg)"}} />
    );
  }
  
  if (layout === "horizontal") {
    btnContent = (<SplitGridIcon color="primary" width="20" height="20" />);
  } 
  
  if (layout === "fullscreen") {
    btnContent = (<FullscreenIcon color="primary" width="20" height="20" />);
  }

  return (
    <Grid>
      <IconButton ref={btn} onClick={handleClick} title="Video layout">
        {btnContent}
      </IconButton>
      <Menu
        keepMounted
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
      >
        <MenuItem title="Fullscreen" onClick={() => { handleSelect("fullscreen"); }}>
          <FullscreenIcon color="primary" />
        </MenuItem>
        <MenuItem title="Grid" onClick={() => { handleSelect("grid"); }}>
          <GridIcon color="primary" />
        </MenuItem>
        <MenuItem title="Horizontal" onClick={() => { handleSelect("horizontal"); }}>
          <SplitGridIcon color="primary" />
        </MenuItem>
        <MenuItem title="Vertical" onClick={() => { handleSelect("vertical"); }}>
          <SplitGridIcon color="primary" style={{ transform: "rotate(90deg)"}} />
        </MenuItem> 
      </Menu>
    </Grid>
  )
}
