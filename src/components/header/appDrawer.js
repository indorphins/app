import React, { useState } from "react";
import { useHistory } from 'react-router-dom';
import { Drawer, IconButton, Grid, Typography, makeStyles } from '@material-ui/core';
import { Menu } from '@material-ui/icons';

import path from '../../routes/path';

let useStyles = makeStyles((theme) => ({
  themeButton: {
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
      <Grid item className={classes.clickable} onClick={() => navigate(path.schedule)}>
        <Typography variant='h5' className={classes.drawerLink}>My Schedule</Typography>
      </Grid>
    )
  }

  return (
    <React.Fragment>
      <IconButton onClick={toggleDrawer} className={classes.themeButton}>
        <Menu />
      </IconButton>
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer}>
        <Grid container direction="column" spacing={3} style={{padding:"24px 8px", minWidth: 220}}>
          <Grid item className={classes.clickable} onClick={() => navigate(path.home)}>
            <Typography variant='h5' className={classes.drawerLink}>Classes</Typography>
          </Grid>
          <Grid item className={classes.clickable} onClick={() => navigate(path.milestone)}>
            <Typography variant='h5' className={classes.drawerLink}>Milestones</Typography>
          </Grid>
          {schedule}
        </Grid>
      </Drawer>
    </React.Fragment>
  )
}