import React, { useEffect, useState } from 'react';
import { Container, Grid, makeStyles, Typography, IconButton } from '@material-ui/core';
import { Close } from '@material-ui/icons';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';

const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  description: {
    '@media (max-width: 600px)': {
      maxWidth: "70%",
    },
  },
  text: {
    '@media (max-width: 900px)': {
      fontSize: '1.1rem',
    },
    '@media (max-width: 600px)': {
      fontSize: '1rem',
    }
  },
  container: {
    justifyContent: "center",
    '@media (max-width: 600px)': {
      justifyContent: "flex-start",
    },
  },
  close: {
    position: "absolute",
    top: 2,
    right: 6,
  }
}));

const campaignSelector = createSelector([state => state.campaign], (c) => {
  return c;
});


export default function Discount() {

  const classes = useStyles();
  const campaign = useSelector(state => campaignSelector(state));
  const [display, setDisplay] = useState(true);

  function close() {
    setDisplay(false);
  }

  useEffect(() => {
    if (campaign && campaign.id) {
      setDisplay(true);
    }
  }, [campaign])

  let displayed = null;

  if (campaign.description && display) {
    displayed = (
      <Grid style={{position: "relative"}}>
        <Container className={classes.root}>
          <Grid
            container
            direction="row"
            justify="center"
            alignContent="center"
            alignItems="center"
            spacing={2}
            className={classes.container}
          >
            <Grid item>
              <img alt="present" src="/img/presentArt.png" style={{maxHeight: 32}} />
            </Grid>
            <Grid item className={classes.description}>
              <Typography variant="h4" className={classes.text}>
                {campaign.description}
              </Typography>
            </Grid>
          </Grid>
        </Container>
        <IconButton onClick={close} className={classes.close}>
          <Close />
        </IconButton>
      </Grid>
    );
  }

  return displayed;
}