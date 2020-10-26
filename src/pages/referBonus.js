import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Button,
  Container,
  Grid,
  makeStyles,
  useMediaQuery,
  Typography
} from '@material-ui/core';
import { FileCopyOutlined } from '@material-ui/icons';
import { createSelector } from 'reselect';
import { useSelector } from 'react-redux';

import path from '../routes/path';

const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(4),
  },
  link: {
    border: "1px solid",
    borderColor: theme.palette.common.black,
    background: theme.palette.common.white,
  }
}));

const getSessions = createSelector([state => state.milestone.sessions], (sessions) => {
  return sessions.length;
});


export default function ReferBonus() {
  const classes = useStyles();
  const history = useHistory();
  const sessions = useSelector(state => getSessions(state));
  const [ referrerId, setReffererId ] = useState("blah");
  const sml = useMediaQuery('(max-width:600px)');
  const med = useMediaQuery('(max-width:900px)');

  let layout = null;
  if (sml) {
    layout = {
      descWidth: 12,
      txtWidth: 12
    };
  } else if (med) {
    layout = {
      descWidth: 8,
      txtWidth: 9
    }
  } else {
    layout = {
      descWidth: 6,
      txtWidth: 9
    }
  }

  useEffect(() => {
    if (!sessions || sessions <= 0) {
      history.push(path.courses);
    }
  }, [sessions])

  useEffect(() => {
    setReffererId("asdf");
  }, []);

  let linkUrl = window.location.origin + "?cid=" + referrerId;

  function copy() {
    navigator.clipboard.writeText(linkUrl).then(function() {
      /* clipboard successfully set */
    }, function() {
      /* clipboard write failed */
    });
  }


  return (
    <Container className={classes.root}>
      <Grid container direction="column" justify="center" alignContent="center" spacing={8}>
        <Grid item
          xs={layout.descWidth}
          container
          spacing={2}
          direction="column"
          justify="center"
          alignItems="center"
          alignContent="center"
        >
          <Grid item>
            <img alt="present" src="/img/presentArt.png" />
          </Grid>
          <Grid item>
            <Typography variant="h2">Give $20, Get $10</Typography>
          </Grid>
          <Grid item xs={layout.txtWidth}>
            <Typography variant="body1" align="center">
              Get $10 in credits when someone signs up using your referral link and books their first paid class.
              Your friend also gets $20 off ($5 off their next 4 classes)
            </Typography>
          </Grid>
        </Grid>
        <Grid item
          xs={layout.descWidth}
          container
          spacing={2}
          direction="column"
          justify="center"
          alignItems="center"
          alignContent="center"
        >
          <Grid item>
            <Typography variant="h4">Share Your Link</Typography>
          </Grid>
          <Grid item container direction="row" alignItems="center" justify="center" spacing={2}>
            <Grid item className={classes.link}>
              <Typography variant="body1">{linkUrl}</Typography>
            </Grid>
            <Grid item>
              <Button onClick={copy} startIcon={<FileCopyOutlined />}>Copy Link</Button>
            </Grid>
          </Grid>
        </Grid>
        <Grid item
          xs={layout.descWidth}
          container
          spacing={2}
          direction="column"
          justify="center"
          alignItems="center"
          alignContent="center"
        >
          <Grid item>
            <Typography variant="h4">Pro tips:</Typography>
          </Grid>
          <Grid item xs={layout.txtWidth}>
            <Typography variant="body1" align="center">
              Send this link directly to your friends &amp; post it on your social accounts
            </Typography>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  )
}