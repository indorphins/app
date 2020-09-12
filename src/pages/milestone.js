import React, { useEffect, useState } from 'react';
import { Container, Grid } from '@material-ui/core';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import Milestone from '../components/milestone';
import * as utils from '../utils/milestones';
import log from '../log';
import { store, actions } from '../store';

const getSessionsSelector = createSelector([state => state.milestone.sessions], (sessions) => {
  return sessions;
});

const milestonesSelector = createSelector([state => state.milestone.hits], (sessions) => {
  return sessions;
});

const getUserSelector = createSelector([state => state.user.data], (user) => {
  return user;
});

export default function() {
  const sessions = useSelector(state => getSessionsSelector(state));
  const user = useSelector(state => getUserSelector(state));
  const milestoneHits = useSelector(state => milestonesSelector(state));
  const [ milestonesData, setMilestonesData ] = useState([]);

  useEffect(() => {
    log.debug("MILESTONES:: user and sessions history", user, sessions);
    let all = utils.getAll(sessions, user);
    store.dispatch(actions.milestone.setHits(all));
  }, [user, sessions]);

  useEffect(() => {

    let standard = milestoneHits.filter(item => {
      return item.type === 'standard'
    });

    let completed = standard.filter(item => {
      return item.lvl === 'max';
    });

    let allMilestone = {
      title: 'Master Indoorphiner',
      label: 'Achieve all milestones',
      max: standard.length,
      value: completed.length,
      type: "standard"
    }

    if (!user.type || user.type === 'standard') {
      setMilestonesData([...standard, allMilestone]);
    } else {
      setMilestonesData([...milestoneHits, allMilestone]);
    }

  }, [milestoneHits, user])

  let content = (
    <Container>
      <Grid container direction="column">
        {milestonesData.map(item => (
          <Grid item key={item.title}>
            <Milestone title={item.title} label={item.label}
              max={item.max} value={item.value}
            />
          </Grid>
        ))}
      </Grid>
    </Container>
  )

  return content;
}
