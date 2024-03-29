import React, { useEffect, useState } from 'react';
import { Container, Grid, makeStyles, Slide } from '@material-ui/core';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import MilestoneItem from '../components/milestone/milestoneItem';
import Analytics from '../utils/analytics';

const milestonesSelector = createSelector([state => state.milestone.hits], (sessions) => {
  return sessions;
});

const getUserSelector = createSelector([state => state.user.data], (user) => {
  return user;
});

const useStyles = makeStyles((theme) => ({
  container: {
    paddingBottom: theme.spacing(4),
    backgroundColor: theme.palette.common.backgroundGrey,
    maxWidth: 'inherit',
    paddingTop: theme.spacing(2),
    paddingLeft: theme.spacing(6),
    paddingRight: theme.spacing(6)
  }
}))

export default function Milestone() {
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
      type: "standard",
      lvl: 0,
    }

    if (standard.length === completed.length) {
      allMilestone.lvl = "max";
    }

    if (!user.type || user.type === 'standard') {
      setMilestonesData([...standard, allMilestone]);
    } else {
      setMilestonesData([...milestoneHits, allMilestone]);
    }

  }, [milestoneHits, user]);

  let timeout = 120;

  let content = (
    <Container className={classes.container}>
      <Grid container direction="column" spacing={2}>
        {milestonesData.map((item, i) => (
          <Slide direction="up" in={true} timeout={timeout*(i+1)} key={item.title}>
            <Grid item>
              <MilestoneItem title={item.title} label={item.label}
                max={item.max} value={item.value} lvl={item.lvl}
              />
            </Grid>
          </Slide>
        ))}
      </Grid>
    </Container>
  )

  return (
    <Analytics title="Milestones">
      {content}
    </Analytics>
  );
}
