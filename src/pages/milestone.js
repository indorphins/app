import React, { useEffect, useState } from 'react';
import { Container, Grid } from '@material-ui/core';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import Milestone from '../components/milestone';
import * as utils from '../utils/milestones';
import log from '../log';

const getSessionsSelector = createSelector([state => state.user.sessions], (sessions) => {
  return sessions;
});

const getUserSelector = createSelector([state => state.user.data], (user) => {
  return user;
})

export default function Milestones(props) {
  const sessions = useSelector(state => getSessionsSelector(state));
  const user = useSelector(state => getUserSelector(state));
  const [ milestones, setMilestones ] = useState(utils.getMilestonesHit([], null));
  const [ warriorStone, setWarriorStone ] = useState(utils.getWarriorLevel([], null));
  const [ typesTakenStone, setTypesTakenStone ] = useState(utils.getTypesTakenLevel([], null));
  const [ weekStreakStone, setWeekStreakStone ] = useState(utils.getWeekStreakLevel([], null));
  const [ uniqueInstructorStone, setUniqueInstructorStone ] = useState(utils.getUniqueInstructorsLevel([], null));
  const [ doubleUpStone, setDoubleUpStone ] = useState(utils.getDoubleUpLevel([], null));
  const [ triItStone, setTriItStone ] = useState(utils.getTriItLevel([], null));
  const [ allDayStone, setAllDayStone ] = useState(utils.getAllDayEveryDayLevel([], null));
  const [ twoADaysStone, setTwoADaysStone ] = useState(utils.getTwoADaysLevel([], null));
  const [ rideOrDieStone, setRideOrDieStone ] = useState(utils.getRideOrDieLevel([], null));
  const [ everyDayStone, setEveryDayStone ] = useState(utils.getEveryDayLevel([], null));
  const [ indoorphinsHighStone, setIndoorphinsHighStone ] = useState(utils.getIndoorphinsHighLevel([]));

  useEffect(() => {
    if (user && sessions.length > 0) {
      log.debug("MILESTONES:: user and sessions history", user, sessions)
      setMilestones(utils.getMilestonesHit(sessions, user));
      setWarriorStone(utils.getWarriorLevel(sessions, user));
      setTypesTakenStone(utils.getTypesTakenLevel(sessions, user));
      setWeekStreakStone(utils.getWeekStreakLevel(sessions, user));
      setUniqueInstructorStone(utils.getUniqueInstructorsLevel(sessions, user));
      setDoubleUpStone(utils.getDoubleUpLevel(sessions, user));
      setTriItStone(utils.getTriItLevel(sessions, user));
      setAllDayStone(utils.getAllDayEveryDayLevel(sessions, user));
      setTwoADaysStone(utils.getTwoADaysLevel(sessions, user));
      setRideOrDieStone(utils.getRideOrDieLevel(sessions, user));
      setEveryDayStone(utils.getEveryDayLevel(sessions, user));
      setIndoorphinsHighStone(utils.getIndoorphinsHighLevel(milestones));
    }
  }, [user, sessions]);

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
    <Container>
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
