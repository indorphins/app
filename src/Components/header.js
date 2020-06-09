import React, { useEffect, useState } from "react";
import { AppBar, IconButton, Box, Grid, Toolbar, Typography } from '@material-ui/core';
import { Brightness5Rounded, Brightness4Rounded } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';

import UserAvatar from "./userAvatar";
import { store, actions } from '../store';

let useStyles = makeStyles((theme) => ({
  root: {
    height: "100%",
  },
  logo: {},
  appbar: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    paddingRight: theme.spacing(5),
    paddingLeft: theme.spacing(5),
    marginBottom: theme.spacing(4),
    '@media (max-width: 600px)': {
      paddingTop: theme.spacing(1),
      paddingBottom: theme.spacing(1),
      paddingRight: theme.spacing(2),
      paddingLeft: theme.spacing(2),
      marginBottom: theme.spacing(3),
    }
  },
  toolbar: {},
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

export default function(props) {

  if (props.className) {
    useStyles = props.className;
  }
  const classes = useStyles();
  const theme = useSelector(state => getThemeSelector(state));
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
              <Typography edge="start" variant="h1" color="secondary" className={classes.logo}>SGF</Typography>
            </Grid>
            <Grid item>
              <Grid container direction='row' alignItems="center">
                <IconButton edge="end" onClick={toggleTheme} className={classes.themeBtn} color="secondary">
                  {themeButton}
                </IconButton>
                <UserAvatar edge="end" className={classes.userMenu} />
              </Grid>
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
      {props.children}
    </Box>
  );
};