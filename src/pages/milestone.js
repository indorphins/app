import React from 'react';
import { Container, Grid, makeStyles } from '@material-ui/core';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import Milestone from '../components/milestone';
import * as utils from '../utils/milestones';

const getSessionsSelector = createSelector([state => state.user.sessions], (sessions) => {
  return sessions;
});

const getUserSelector = createSelector([state => state.user], (user) => {
  return user;
})

const useStyles = makeStyles((theme) => ({
  container: {
    backgroundColor: theme.palette.common.background,
    borderRadius: 5,
    width: '90%'
  }
}))

export default function Milestones(props) {
  const sessions = useSelector(state => getSessionsSelector(state));
  const user = useSelector(state => getUserSelector(state));
  const classes = useStyles();

  const milestones = utils.getMilestonesHit(sessions, user);
  const warriorStone = utils.getWarriorLevel(sessions, user);
  const typesTakenStone = utils.getTypesTakenLevel(sessions, user);
  const weekStreakStone = utils.getWeekStreakLevel(sessions, user);
  const uniqueInstructorStone = utils.getUniqueInstructorsLevel(sessions, user);
  const doubleUpStone = utils.getDoubleUpLevel(sessions, user);
  const triItStone = utils.getTriItLevel(sessions, user);
  const allDayStone = utils.getAllDayEveryDayLevel(sessions, user);
  const twoADaysStone = utils.getTwoADaysLevel(sessions, user);
  const rideOrDieStone = utils.getRideOrDieLevel(sessions, user)
  const everyDayStone = utils.getEveryDayLevel(sessions, user);
  const indoorphinsHighStone = utils.getIndoorphinsHighLevel(milestones);

  let classesTaughtStone, daysChangedStone, livesChangedStone,
    classesTaughtContent, daysChangedContent, livesChangedContent;

  if (user && user.type === 'instructor') {
    classesTaughtStone = utils.getClassesTaughtLevel(sessions, user);
    daysChangedStone = utils.getDaysChangedLevel(sessions, user);
    livesChangedStone = utils.getLivesChangedLevel(sessions, user);
    
    classesTaughtContent = (
      <Grid container direction="column" >
        <Milestone title={classesTaughtStone.title} label={classesTaughtStone.label}
          max={classesTaughtStone.max} value={classesTaughtStone.value}
        />
      </Grid>
    )
    daysChangedContent = (
      <Grid container direction="column" >
        <Milestone title={daysChangedStone.title} label={daysChangedStone.label} 
          max={daysChangedStone.max} value={daysChangedStone.value}
        />
      </Grid>
    )
    livesChangedContent = (
      <Grid container direction="column" >
        <Milestone title={livesChangedStone.title} label={livesChangedStone.label} 
          max={livesChangedStone.max} value={livesChangedStone.value}
        />
      </Grid>
    )
  }


  return (
    <Container className={classes.container}>
      {classesTaughtContent}
      {daysChangedContent}
      {livesChangedContent}
      <Grid container direction="column" >
        <Milestone title={warriorStone.title} label={warriorStone.label} 
          max={warriorStone.max} value={warriorStone.value}
        />
      </Grid>
      <Grid container direction="column" >
        <Milestone title={typesTakenStone.title} label={typesTakenStone.label} 
          max={typesTakenStone.max} value={typesTakenStone.value}
        />
      </Grid>
      <Grid container direction="column" >
        <Milestone title={weekStreakStone.title} label={weekStreakStone.label} 
          max={weekStreakStone.max} value={weekStreakStone.value}
        />
      </Grid>
      <Grid container direction="column" >
        <Milestone title={uniqueInstructorStone.title} label={uniqueInstructorStone.label}
          max={uniqueInstructorStone.max} value={uniqueInstructorStone.value}
        />
      </Grid>
      <Grid container direction="column" >
        <Milestone title={doubleUpStone.title} label={doubleUpStone.label} 
          max={doubleUpStone.max} value={doubleUpStone.value}
        />
      </Grid>
      <Grid container direction="column" >
        <Milestone title={triItStone.title} label={triItStone.label} 
          max={triItStone.max} value={triItStone.value}
        />
      </Grid>
      <Grid container direction="column" >
        <Milestone title={allDayStone.title} label={allDayStone.label}
          max={allDayStone.max} value={allDayStone.value}
        />
      </Grid>
      <Grid container direction="column" >
        <Milestone title={twoADaysStone.title} label={twoADaysStone.label} 
          max={twoADaysStone.max} value={twoADaysStone.value}
        />
      </Grid>
      <Grid container direction="column" >
        <Milestone title={rideOrDieStone.title} label={rideOrDieStone.label} 
          max={rideOrDieStone.max} value={rideOrDieStone.value}
        />
      </Grid>
      <Grid container direction="column" >
        <Milestone title={everyDayStone.title} label={everyDayStone.label} 
          max={everyDayStone.max} value={everyDayStone.value}
        />
      </Grid>
      <Grid container direction="column" >
        <Milestone title={indoorphinsHighStone.title} label={indoorphinsHighStone.label} 
          max={indoorphinsHighStone.max} value={indoorphinsHighStone.value}
        />
      </Grid>
    </Container>
  );
}
