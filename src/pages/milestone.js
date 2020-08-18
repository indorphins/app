import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid } from '@material-ui/core';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import * as Milestone from '../api/milestone';
import log from '../log';

// TODO store milestones in state?
// const userMilestoneSelector = createSelector([state => state.user.milestone], (items) => {
//   return items;
// });

const getUserSelector = createSelector([state => state.user.data], (user) => {
  return user;
});

export default function Milestones(props) {
  const user = useSelector(state => getUserSelector(state));
  const [milestones, setMilestones] = useState(null);

  // const milestones = useSelector(state => userMilestoneSelector(state));

  useEffect(() => {
    try {
      let stones = Milestone.get();
      console.log("Got stones ", stones);
      setMilestones(stones);
    } catch (err) {
      log.warn("Error fetching milestones ", err);
    }
  }, [user])

  let content = (
    <Grid>
      <Typography>Login to view your milestones</Typography>
    </Grid>
  )

  if (milestones) {
    content = (
      <Grid>
        MILESTONES!
      </Grid>
    )
  }

  return (
    <Container>
      {content}
    </Container>
  );
}
