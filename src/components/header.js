import React, { useEffect, useState } from "react";
import { AppBar, IconButton, Box, Grid, Toolbar, Typography, Container, useMediaQuery } from '@material-ui/core';
import { Brightness5Rounded, Brightness4Rounded } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';

import UserAvatar from "./userAvatar";
import Navigation from './nav';
import { store, actions } from '../store';

let useStyles = makeStyles((theme) => ({
  root: {
    height: "100%",
  },
  logo: {
    display: 'inline',
    fontWeight: 900,
    color: theme.palette.common.white,
  },
  appbar: {
    marginBottom: theme.spacing(2),
    backgroundColor: theme.palette.common.black,
    '@media (max-width: 900px)': {
      marginBottom: theme.spacing(1),
    }
  },
  toolbar: {
    alignItems: "flex-end",
  },
  container: {
    position: "relative",
    '@media (max-width: 900px)': {
      padding: 0,
    },
  },
  themeButton: {
    color: theme.palette.common.white,
  }
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

  let lightButton = (<Brightness4Rounded />);
  let darkButton = (<Brightness5Rounded />);

  useEffect(() => {
    if (theme === 'light') {
      setThemeButton(lightButton);
    } else {
      setThemeButton(darkButton);
    }
  }, [theme])

  let layout = {
    appBarPosition: "sticky",
    direction: "row",
    spacing: 2,
  }
  
  if (med) {
    layout = {
      appBarPosition: "sticky",
      direction: "column",
      spacing: 0,
    }
  } else {
    layout = {
      appBarPosition: "sticky",
      direction: "row",
      spacing: 2,
    }
  }

  let nav = (
    <React.Fragment>
      <Grid container direction={layout.direction} justify="flex-start" alignItems="baseline" spacing={layout.spacing}>
        <Grid item>
          <Typography variant="h2" className={classes.logo}>INDOORPHINS</Typography>
        </Grid>
        <Grid item>
          <Navigation user={currentUser} />
        </Grid>
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
    <Toolbar className={classes.toolbar} variant="regular">
      <Container className={classes.container}>
        <Grid container direction="row" justify="space-between">
          <Grid item>
            {nav}
          </Grid>
          <Grid item>
            {avatar}
          </Grid>
        </Grid>
      </Container>
    </Toolbar>
  );

  return (
    <Box className={classes.root}>
      <AppBar position={layout.appBarPosition} className={classes.appbar}>
        {toolbar}
      </AppBar>
      {props.children}
    </Box>
  );
}