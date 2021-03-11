import React, { useState } from "react";
import { useHistory } from 'react-router-dom';
import { Drawer, Divider, IconButton, Grid, Typography, makeStyles } from '@material-ui/core';
import { Menu } from '@material-ui/icons';
import { createSelector } from 'reselect';
import { useSelector } from 'react-redux';

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
    color: theme.palette.common.black,
  },
  drawerLink: {
    fontWeight: 400,
  },
  clickable: {
    cursor: "pointer",
  }
}));

const getUserSelector = createSelector([state => state.user.data], (user) => {
  return user;
});

export default function AppDrawer(props) {

  const classes = useStyles();
  const history = useHistory();
  const user = useSelector(state => getUserSelector(state));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navigate = function(path) {
    history.push(path);
    setDrawerOpen(false);
  }

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  let milestones = null;
  if (user && user.id) {
    milestones = (
      <React.Fragment>
        {/* <Grid item className={classes.clickable} onClick={() => navigate(path.referFriend)}>
          <Typography variant='h5' className={classes.drawerLink}>Refer &amp; Earn</Typography>
        </Grid> */}
        {/* <Divider /> */}
        <Grid item className={classes.clickable} onClick={() => navigate(path.milestone)}>
          <Typography variant='h5' className={classes.drawerLink}>Milestones</Typography>
        </Grid>
        <Divider />
      </React.Fragment>
    )
  }

  let trialButton;
  if (!user || Object.entries(user).length === 0) {
    trialButton = (
      <Grid item className={classes.clickable} onClick={() => navigate(path.signup)}>
        <Typography variant='h5' className={classes.drawerLink}>Start Free Trial</Typography>
      </Grid>
    )
  }

  return (
    <React.Fragment>
      <IconButton onClick={toggleDrawer} className={classes.button}>
        <Menu />
      </IconButton>
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer} classes={{paper: classes.container}}>
        <Grid container direction="column" spacing={3}>
          <Divider />
          <Grid item className={classes.clickable} onClick={() => navigate(path.home)}>
            <Typography variant='h5' className={classes.drawerLink}>Home</Typography>
          </Grid>
          <Divider />
          <Grid item className={classes.clickable} onClick={() => navigate(path.courses)}>
            <Typography variant='h5' className={classes.drawerLink}>Classes</Typography>
          </Grid>
          <Divider />
          <Grid item className={classes.clickable} onClick={() => navigate(path.instructors)}>
            <Typography variant='h5' className={classes.drawerLink}>Instructors</Typography>
          </Grid>
          <Divider />
          {milestones}
          {trialButton}
        </Grid>
      </Drawer>
    </React.Fragment>
  )
}