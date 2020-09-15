import React, { useEffect, useState } from 'react';
import { Container, Grid, makeStyles } from '@material-ui/core';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import MilestoneItem from '../components/milestone/milestoneItem';

const milestonesSelector = createSelector([state => state.milestone.hits], (sessions) => {
  return sessions;
});

const getUserSelector = createSelector([state => state.user.data], (user) => {
  return user;
});

const useStyles = makeStyles((theme) => ({
  container: {
    backgroundColor: theme.palette.common.background,
    borderRadius: 5,
    width: '90%'
  }
}))

export default function() {
  const classes = useStyles();
  const user = useSelector(state => getUserSelector(state));
  const milestoneHits = useSelector(state => milestonesSelector(state));
  const [ milestonesData, setMilestonesData ] = useState([]);

  useEffect(() => {

    let standard = milestoneHits.filter(item => {
      return item.type === 'standard'
    });

    let completed = standard.filter(item => {
      return item.lvl === 'max';
    });

    let allMilestone = {
      title: 'Indoorphins High',
      label: 'Complete all milestones',
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
    <Container className={classes.container}>
      <Grid container direction="column">
        {milestonesData.map(item => (
          <Grid item key={item.title}>
            <MilestoneItem title={item.title} label={item.label}
              max={item.max} value={item.value}
            />
          </Grid>
        ))}
      </Grid>
    </Container>
  )

  return content;
}
