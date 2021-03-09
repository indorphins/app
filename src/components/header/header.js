import React from "react";
import { Button, Grid, Typography, Container, useMediaQuery } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import path from '../../routes/path';
import { useHistory } from 'react-router-dom';

import AppDrawer from './appDrawer';
import UserAvatar from "./userAvatar";
import Navigation from './nav';

let useStyles = makeStyles((theme) => ({
  logo: {
    display: 'inline',
    color: theme.palette.common.black,
    '@media (max-width: 400px)': {
      fontSize: '1.1rem',
    },
    cursor: "pointer"
  },
  appbar: {
    backgroundColor: theme.palette.header.background,
    position: "sticky",
    top: 0,
    zIndex: 5,
  },
  appBarFiller: {
    backgroundColor: theme.palette.header.background,
    position: "sticky",
    top: -1,
    height: 1,
    zIndex: 5,
  },
  toolbar: {
    alignItems: "center",
    paddingLeft: 0,
  },
  container: {
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    '@media (max-width: 900px)': {
      paddingRight: theme.spacing(1),
      paddingLeft: 0,
      paddingTop: 0,
      paddingBottom: 0
    },
  },
  themeButton: {
    color: theme.palette.common.white,
  },
  trialButton: {
    backgroundColor: theme.palette.common.background,
    color: theme.palette.common.black,
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    marginLeft: theme.spacing(2)
  }
}));

function AppBar(props) {
  const classes = useStyles();

  return (
    <React.Fragment>
      <Grid className={classes.appBarFiller} />
      <Grid className={classes.appbar}>
        {props.children}
      </Grid>
    </React.Fragment>
  )
}

const getUserSelector = createSelector([state => state.user.data], (user) => {
  return user;
});

export default function Header(props) {

  if (props.className) {
    useStyles = props.className;
  }
  const med = useMediaQuery('(max-width:900px)');
  const classes = useStyles();
  const history = useHistory();
  const currentUser = useSelector(state => getUserSelector(state));

  const goHomeHandler = () => {
    history.push(path.courses);
  }

  const goToSignup = () => {
    history.push(path.signup);
  }

  let layout = {
    appBarPosition: "sticky",
    direction: "row",
    spacing: 2,
    alignItems: "center"
  }
  
  if (med) {
    layout = {
      appBarPosition: "sticky",
      direction: "row",
      spacing: 0,
      alignItems: "center"
    }
  } else {
    layout = {
      appBarPosition: "sticky",
      direction: "row",
      spacing: 2,
      alignItems: "center"
    }
  }

  let drawer = null;
  let tabs = null;

  if (med) {
    drawer = (
      <Grid item>
        <AppDrawer user={currentUser} />
      </Grid>
    );
  } else {
    tabs = (
      <Grid item>
        <Navigation user={currentUser} />
      </Grid>
    );
  }

  let nav = (
    <React.Fragment>
      <Grid 
        container
        direction={layout.direction}
        justify="flex-start"
        alignItems={layout.alignItems}
        spacing={layout.spacing}
        style={{
          flexWrap: "nowrap"
        }}
      >
        {drawer}
        <Grid item>
          <Typography variant="h2" className={classes.logo} onClick={goHomeHandler}>INDOORPHINS</Typography>
        </Grid>
        {tabs}
      </Grid>
    </React.Fragment>
  );

  let trialButton;
  if ((!currentUser || Object.entries(currentUser).length === 0) && !med) {
    trialButton = (
      <Grid item>
        <Button className={classes.trialButton} onClick={goToSignup}>Create Account</Button>
      </Grid>
    )
  }

  let avatar = (
    <Grid container direction='row' alignItems="center">
      <Grid item style={{paddingLeft: 10}}>
        <UserAvatar edge="end" user={currentUser} />
      </Grid>
      {trialButton}
    </Grid>
  );

  let toolbar = (
    <Container className={classes.container}>
      <Grid container direction="row" justify="space-between" alignItems={layout.alignItems} >
        <Grid item>
          {nav}
        </Grid>
        <Grid item>
          {avatar}
        </Grid>
      </Grid>
    </Container>
  );

  return (
    <Grid style={{height: "100%"}}>
      <AppBar className={classes.appbar}>
        {toolbar}
      </AppBar>
      {props.children}
    </Grid>
  );
}