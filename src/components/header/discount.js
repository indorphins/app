import React from 'react';
import { Container, Grid, makeStyles, Typography } from '@material-ui/core';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';

const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
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

  let content = (<Grid />);

  if (campaign.id && (campaign.discountAmount || campaign.discountRate)) {
    if (campaign.newUser && (sessions <= 0 && user)) {
      return content;
    }

    let text = "";
    let amount;

    if (campaign.discountAmount) {
      amount = campaign.discountAmount / 100;
      text = text + `Book a class now for $${amount} off your next`;

      if (campaign.discountMultiplier > 1) {
        text = text + ` ${campaign.discountMultiplier} classes`
      } else {
        text = text + " class";
      }
    }

    content = (
      <Container className={classes.root}>
        <Grid container direction="row" justify="center" alignContent="center" alignItems="center" spacing={2}>
          <Grid item>
            <img alt="present" src="/img/presentArt.png" style={{maxHeight: 32}} />
          </Grid>
          <Grid item>
            <Typography variant="h4">
              {text}
            </Typography>
          </Grid>
        </Grid>
      </Container>
    );
  }

  return content;
}