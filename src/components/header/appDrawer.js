import React, { useState } from "react";
import { useHistory } from 'react-router-dom';
import { Drawer, Divider, IconButton, Grid, Typography, makeStyles } from '@material-ui/core';
import { Menu } from '@material-ui/icons';

import path from '../../routes/path';

let useStyles = makeStyles((theme) => ({
  container: {
    padding:"24px 8px",
    minWidth: 220,
    width: "40%",
    maxWidth: 500,
    overflow: "hidden",
  },
  button: {
    color: theme.palette.common.white,
  },
  drawerLink: {
    fontWeight: 400,
  },
  clickable: {
    cursor: "pointer",
  }
}));

export default function AppDrawer(props) {

  const { user } = props;
  const classes = useStyles();
  const history = useHistory();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navigate = function(path) {
    history.push(path);
    setDrawerOpen(false);
  }

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  let schedule = null;

  if (user && user.id) {
    schedule = (
      <React.Fragment>
        <Grid item className={classes.clickable} onClick={() => navigate(path.schedule)}>
          <Typography variant='h5' className={classes.drawerLink}>My Schedule</Typography>
        </Grid>
        <Divider />
      </React.Fragment>
    )
  }

  return (
    <React.Fragment>
      <IconButton onClick={toggleDrawer} className={classes.button}>
        <Menu />
      </IconButton>
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer} classes={{paper: classes.container}}>
        <Grid container direction="column" spacing={3} >
          <Divider />
          <Grid item className={classes.clickable} onClick={() => navigate(path.home)}>
            <Typography variant='h5' className={classes.drawerLink}>Classes</Typography>
          </Grid>
          <Divider />
          <Grid item className={classes.clickable} onClick={() => navigate(path.milestone)}>
            <Typography variant='h5' className={classes.drawerLink}>Milestones</Typography>
          </Grid>
          <Divider />
          {schedule}
        </Grid>
      </Drawer>
    </React.Fragment>
  )
}