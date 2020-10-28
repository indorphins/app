import React, { useEffect, useState } from "react";
import { AppBar, IconButton, Grid, Typography, Container, useMediaQuery } from '@material-ui/core';
import { Brightness5Rounded, Brightness4Rounded } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import path from '../../routes/path';
import { useHistory } from 'react-router-dom';

import AppDrawer from './appDrawer';
import UserAvatar from "./userAvatar";
import Navigation from './nav';
import Discount from './discount';
import { store, actions } from '../../store';


let useStyles = makeStyles((theme) => ({
  logo: {
    display: 'inline',
    color: theme.palette.common.white,
    '@media (max-width: 400px)': {
      fontSize: '1.1rem',
    },
    cursor: "pointer"
  },
  appbar: {
    marginBottom: theme.spacing(2),
    backgroundColor: theme.palette.common.black,
    '@media (max-width: 900px)': {
      marginBottom: theme.spacing(1),
    }
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
}));

const getThemeSelector = createSelector([state => state.theme], (theme) => {
  return theme;
});

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
  const theme = useSelector(state => getThemeSelector(state));
  const currentUser = useSelector(state => getUserSelector(state));
  const [themeButton, setThemeButton] = useState(null);

  const toggleTheme = async function() {
    if (theme === "light") {
      await store.dispatch(actions.theme.setDarkMode());
    } else {
      await store.dispatch(actions.theme.setLightMode());
    }
  }

  const goHomeHandler = () => {
    history.push(path.home);
  }

  let lightButton = (<Brightness4Rounded />);
  let darkButton = (<Brightness5Rounded />);

  useEffect(() => {
    if (theme === 'light') {
      setThemeButton(lightButton);
    } else {
      setThemeButton(darkButton);
    }
  }, [theme]);

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

  let avatar = (
    <Grid container direction='row' alignItems="center">
      <Grid item>
        <IconButton edge="end" onClick={toggleTheme} className={classes.themeButton}>
          {themeButton}
        </IconButton>
      </Grid>
      <Grid item style={{paddingLeft: 10}}>
        <UserAvatar edge="end" user={currentUser} />
      </Grid>
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
      <Discount />
      <AppBar position={layout.appBarPosition} className={classes.appbar}>
        {toolbar}
      </AppBar>
      {props.children}
    </Grid>
  );
}