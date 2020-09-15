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
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
    marginLeft: theme.spacing(8),
    color: theme.palette.secondary.main,
    '@media (max-width: 900px)': {
      marginLeft: theme.spacing(1),
    }
  },
  appbar: {
    paddingRight: theme.spacing(5),
    paddingLeft: theme.spacing(2),
    paddingTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    backgroundColor: theme.palette.header.background,
    '@media (max-width: 900px)': {
      paddingRight: theme.spacing(1),
      paddingLeft: theme.spacing(0),
      paddingTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
    }
  },
  toolbar: {
    '@media (max-width: 900px)': {
      padding: 0,
    },
  },
  container: {
    position: "relative",
    '@media (max-width: 900px)': {
      padding: 0,
    },
  },
  beta: {
    display: 'inline',
    position: 'absolute',
    border: "solid 1px",
    borderColor: theme.palette.secondary.main,
    color: theme.palette.primary.main,
    padding: theme.spacing(.5),
    borderRadius: '10px',
    marginLeft: theme.spacing(1),
    fontSize: '14px'
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

  let headerJustify = 'flex-start';
  let appBarPosition = "static"

  if (med) {
    headerJustify = 'flex-start';
    appBarPosition = "static"
  }

  return (
    <Box className={classes.root}>
      <AppBar position={appBarPosition} className={classes.appbar}>
        <Toolbar className={classes.toolbar} variant="regular">
          <Container className={classes.container}>
            <Grid container direction="row" justify={headerJustify}>
              <Grid item>
                <Typography variant="h2" color="secondary" className={classes.logo}>INDOORPHINS</Typography>
              </Grid>
            </Grid>
            <Grid container direction="row" justify="space-between" alignItems="flex-end">
              <Grid item>
                <Navigation user={currentUser} />
              </Grid>
            </Grid>
            <Grid style={{display:"inline-block", position: "absolute", top: 0, right: 0}}>
              <Grid container>
                <Grid container direction='row' alignItems="center">
                  <Grid item>
                    <IconButton edge="end" onClick={toggleTheme} color="secondary">
                      {themeButton}
                    </IconButton>
                  </Grid>
                  <Grid item style={{paddingLeft: 10}}>
                    <UserAvatar edge="end" user={currentUser} />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Container>
        </Toolbar>

      </AppBar>
      {props.children}
    </Box>
  );
}