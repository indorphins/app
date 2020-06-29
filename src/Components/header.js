import React, { useEffect, useState } from "react";
import { AppBar, IconButton, Box, Grid, Toolbar, Typography } from '@material-ui/core';
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
  },
  logo2: {
    display: 'inline',
    marginRight: theme.spacing(5),
    color: theme.palette.grey[200],
  },
  appbar: {
    paddingTop: theme.spacing(2),
    paddingRight: theme.spacing(5),
    paddingLeft: theme.spacing(2),
    marginBottom: theme.spacing(2),
    '@media (max-width: 600px)': {
      paddingTop: theme.spacing(1),
      paddingRight: theme.spacing(2),
      paddingLeft: theme.spacing(1),
      marginBottom: theme.spacing(1),
    }
  },
  toolbar: {
    minHeight: 0,
  },
  themeBtn: {
    padding: theme.spacing(1),
    marginRight: theme.spacing(2),
    '@media (max-width: 600px)': {
      marginRight: theme.spacing(1),
    }
  },
}));

const getThemeSelector = createSelector([state => state.theme], (theme) => {
  return theme;
});

const getUserSelector = createSelector([state => state.user.data], (user) => {
  return user;
});

export default function(props) {

  if (props.className) {
    useStyles = props.className;
  }
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

  return (
    <Box className={classes.root}>
      <AppBar position="static" className={classes.appbar}>
        <Toolbar className={classes.toolbar} variant="regular">
          <Grid container direction="row" alignContent="center" alignItems="center" justify="space-between">
            <Grid item>
              <Grid container direction="row" justify="flex-start">
                <Grid>
                  <Typography variant="h2" color="secondary" className={classes.logo}>indor</Typography>
                  <Typography variant="h2" className={classes.logo2}>phins</Typography>
                </Grid>
                <Grid style={{display: "flex", alignItems: "flex-end"}}>
                  <Navigation user={currentUser} />
                </Grid>
              </Grid>
            </Grid>
            <Grid item>
              <Grid container direction='row' alignItems="center">
                <IconButton edge="end" onClick={toggleTheme} className={classes.themeBtn} color="secondary">
                  {themeButton}
                </IconButton>
                <UserAvatar edge="end" className={classes.userMenu} user={currentUser} />
              </Grid>
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
      {props.children}
    </Box>
  );
};