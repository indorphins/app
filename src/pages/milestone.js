import React, { useState, useEffect } from 'react';
import { Container, Grid } from '@material-ui/core';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import ClassesTaken from '../components/milestones/classesTaken';
import WeeklyStreak from '../components/milestones/weeklyStreak';
import * as Session from '../api/session';
import log from '../log';

const getUserSelector = createSelector([state => state.user.data], (user) => {
  return user;
});

export default function Milestones(props) {
  const user = useSelector(state => getUserSelector(state));
  const [sessions, setSessions] = useState();

  useEffect(() => {
    getSessions();
  }, [user])

  async function getSessions() {
    Session.getAll()
      .then(all => {
        if (all && all.sessions){
          setSessions(all.sessions);
        }
      }).catch(err => {
        log.error("MILESTONES:: fetching all sessions ", err);
      })
  }

  return (
    <Container>
      <Grid container direction="column" spacing={4}>
        <Grid item>
          <ClassesTaken sessions={sessions} />
        </Grid>
        <Grid item>
          <WeeklyStreak sessions={sessions} />
        </Grid>
      </Grid>
    </Container>
  );
}
