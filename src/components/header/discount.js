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

const getUserSelector = createSelector([state => state.user.data], (user) => {
  return user.referrerId;
});

const campaignSelector = createSelector([state => state.campaign], (c) => {
  return c;
});

const getSessions = createSelector([state => state.milestone.sessions], (sessions) => {
  return sessions.length;
});

export default function Discount() {

  const classes = useStyles();
  const user = useSelector(state => getUserSelector(state));
  const sessions = useSelector(state => getSessions(state));
  const campaign = useSelector(state => campaignSelector(state));
  const [content, setContent] = useState(null);

  function close() {
    setContent(null);
  }

  useEffect(() => {
    if (campaign && (campaign.discountAmount || campaign.discountRate)) {
      if (campaign.newUser && (sessions <= 0 && user)) {
        return content;
      }

      setContent(
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
  }, [campaign]);

  return content;
}