import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Button,
  Container,
  Grid,
  makeStyles,
  useMediaQuery,
  Typography,
  Zoom
} from '@material-ui/core';
import { FileCopyOutlined } from '@material-ui/icons';
import { createSelector } from 'reselect';
import { useSelector } from 'react-redux';

import path from '../routes/path';
import log from '../log';
import * as User from '../api/user';
import { store, actions } from '../store';

const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(4),
  },
  content: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  link: {
    border: "1px solid",
    borderColor: theme.palette.primary.main,
    background: theme.palette.primary.contrastText,
  },
  linkText: {
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
  },
  presentIn: {
    animation: "dropbounce 0.5s",
  },
}));

const getUserSelector = createSelector([state => state.user.data], (user) => {
  return user;
});

export default function ReferBonus() {
  const classes = useStyles();
  const history = useHistory();
  const user = useSelector(state => getUserSelector(state));
  const [ referrerId, setReffererId ] = useState("");
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
    document.title="Refer & Earn";
  }, []);

  useEffect(() => {
    if (user && user.id) {
      if (user.referrerId) {
        setReffererId(user.referrerId);
      } else {
        getReferLink();
      }
    } else {
      history.push(path.courses)
    }
  }, [user]);

  function copy() {
    navigator.clipboard.writeText(linkUrl).then(function() {
      /* clipboard successfully set */
    }, function() {
      /* clipboard write failed */
    });
  }

  async function getReferLink() {
    let campaign;

    //TODO: wait for user data before calling this and check for an existing link before making a new one

    try {
      campaign = await User.referFriend();
    } catch(err) {
      return log.error("generate referrer link", err);
    }

    log.debug("got campaign result", campaign)

    if (campaign) {
      //setReffererId(campaign.id);
      store.dispatch(actions.user.setReferFriend({referrerId: campaign.id}))
    }
  }

  let linkUrl = window.location.origin + "?cid=" + referrerId;

  return (
    <Container className={classes.root}>
      <Grid container direction="column" justify="center" alignContent="center">
        <Grid item
          xs={layout.descWidth}
          container
          spacing={2}
          direction="column"
          justify="center"
          alignItems="center"
          alignContent="center"
          className={classes.content}
        >
          <Grid item>
            <img alt="present" src="/img/presentArt.png" className={classes.presentIn} />
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
          className={classes.content}
        >
          <Grid item>
            <Typography variant="h4">Share Your Link</Typography>
          </Grid>
          <Zoom in={true}>
            <Grid item container direction="row" alignItems="center" justify="center" spacing={2}>
              <Grid item className={classes.link}>
                <Typography variant="body1" className={classes.linkText}>{linkUrl}</Typography>
              </Grid>
              <Grid item>
                <Button onClick={copy} startIcon={<FileCopyOutlined />}>Copy Link</Button>
              </Grid>
            </Grid>
          </Zoom>
        </Grid>
        <Grid item
          xs={layout.descWidth}
          container
          spacing={2}
          direction="column"
          justify="center"
          alignItems="center"
          alignContent="center"
          className={classes.content}
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