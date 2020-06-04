import React, { useEffect, useState } from "react";
import { AppBar, Button, Box, Grid, Typography } from '@material-ui/core';
import { Brightness5Rounded, Brightness4Rounded } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';

import UserAvatar from "./userAvatar";
import { store, actions } from '../store';

const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(3),
    paddingRight: theme.spacing(5),
    paddingLeft: theme.spacing(5),
    marginBottom: theme.spacing(4),
    //boxShadow: "none",
    '@media (max-width: 600px)': {
      paddingTop: theme.spacing(1),
      paddingBottom: theme.spacing(2),
      paddingRight: theme.spacing(2),
      paddingLeft: theme.spacing(2),
      marginBottom: theme.spacing(3),
    }
  },
  userMenu: {
    float: "right",
  },
  themeBtn: {
    padding: theme.spacing(0.5),
    marginRight: theme.spacing(2),
  }
}));

const getThemeSelector = createSelector([state => state.theme], (theme) => {
  return theme;
});

export default function(props) {
  const classes = useStyles();
  const theme = useSelector(state => getThemeSelector(state));
  const [themeButton, setThemeButton] = useState(null);

  const toggleTheme = async function() {
    console.log("toggle theme");
    console.log(theme);
    if (theme === "light") {
      await store.dispatch(actions.theme.setDarkMode());
    } else {
      await store.dispatch(actions.theme.setLightMode());
    }
  }

  let lightButton = (<Brightness4Rounded onClick={toggleTheme} />);

  let darkButton = (<Brightness5Rounded onClick={toggleTheme} />);


  useEffect(() => {
    if (theme === 'light') {
      setThemeButton(lightButton);
    } else {
      setThemeButton(darkButton);
    }
  }, [theme])

  return (
    <Box>
      <AppBar position="static" className={classes.root}>
        <Grid
          container
          direction="row"
          justify="space-between"
          alignItems="center"
        >
          <Grid item>
            <Typography variant="h1" color="secondary">SGF</Typography>
          </Grid>
          <Grid item>
            <Grid container direction='row' justify='flex-end'>
              <Button className={classes.themeBtn} color="secondary">
                {themeButton}
              </Button>
              <UserAvatar className={classes.userMenu} />
            </Grid>
          </Grid>
        </Grid>
      </AppBar>
      {props.children}
    </Box>
  );
};