import React, { useState } from 'react';
import {
  Grid,
  IconButton,
  makeStyles 
} from '@material-ui/core';
import {
  ChevronLeft,
  ChevronRight,
} from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
  drawer: {
    height: "100%",
    overflowY: "scroll",
    overflowX: "hidden",
    backgroundColor: "#0e0e0e",
  },
  drawerBtn: {
    position: 'relative',
    top: '10px',
    right: '50px',
    zIndex: '9999',
  },
}));

export default function Drawer(props) {

  const classes = useStyles();
  const [drawer, setDrawer] = useState(true);
  function toggleDrawer() {
    if (drawer) {
      setDrawer(false);
    } else {
      setDrawer(true);
    }
  }

  let drawerBtn = (
    <IconButton title="Expand video controls" onClick={toggleDrawer} className={classes.drawerBtn}>
      <ChevronLeft />
    </IconButton>
  );
  let drawerContent = (
    <Grid item className={classes.drawer} style={{ display: "none"}}>
      {props.children}
    </Grid>
  );

  if (drawer) {
    drawerContent = (
      <Grid item xs={3} className={classes.drawer}>
        {props.children}
      </Grid>
    );
    drawerBtn = (
      <IconButton title="Collapse video controls" onClick={toggleDrawer} className={classes.drawerBtn}>
        <ChevronRight />
      </IconButton>
    );
  }

  return (
    <React.Fragment>
      <Grid item style={{width: 0}}>
        {drawerBtn}
      </Grid>
      {drawerContent}
    </React.Fragment>
  )
}