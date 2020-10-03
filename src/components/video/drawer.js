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
    minWidth: 360,
    maxWidth: "27.5%",
    width: "calc(100% / 4)",
    height: "100%",
    overflowY: "scroll",
    overflowX: "hidden",
    backgroundColor: theme.palette.backgroundColor,
    transition: "all 175ms cubic-bezier(0.725, 0.005, 0.320, 0.990)",
  },
  hidden: {
    width: 0,
    minWidth: 0,
    maxWidth: 0,
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

  let drawerClasses = `${classes.drawer} ${classes.hidden}`;


  if (drawer) {
    drawerClasses = classes.drawer;
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
      <Grid item className={drawerClasses}>
        {props.children}
      </Grid>
    </React.Fragment>
  )
}