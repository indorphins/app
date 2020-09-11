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
  const [ warriorStone, setWarriorStone ] = useState(utils.getWarriorLevel([], null));
  const [ typesTakenStone, setTypesTakenStone ] = useState(utils.getTypesTakenLevel([], null));
  const [ weekStreakStone, setWeekStreakStone ] = useState(utils.getWeekStreakLevel([], null));
  const [ uniqueInstructorStone, setUniqueInstructorStone ] = useState(utils.getUniqueInstructorsLevel([], null));
  const [ doubleUpStone, setDoubleUpStone ] = useState(utils.getDoubleUpLevel([], null));
  const [ triItStone, setTriItStone ] = useState(utils.getTriItLevel([], null));
  const [ allDayStone, setAllDayStone ] = useState(utils.getAllDayEveryDayLevel([], null));
  const [ rideOrDieStone, setRideOrDieStone ] = useState(utils.getRideOrDieLevel([], null));
  const [ everyDayStone, setEveryDayStone ] = useState(utils.getEveryDayLevel([], null));

  useEffect(() => {
    if (user && sessions.length > 0) {
      log.debug("MILESTONES:: user and sessions history", user, sessions)
      setWarriorStone(utils.getWarriorLevel(sessions, user));
      setTypesTakenStone(utils.getTypesTakenLevel(sessions, user));
      setWeekStreakStone(utils.getWeekStreakLevel(sessions, user));
      setUniqueInstructorStone(utils.getUniqueInstructorsLevel(sessions, user));
      setDoubleUpStone(utils.getDoubleUpLevel(sessions, user));
      setTriItStone(utils.getTriItLevel(sessions, user));
      setAllDayStone(utils.getAllDayEveryDayLevel(sessions, user));
      setRideOrDieStone(utils.getRideOrDieLevel(sessions, user));
      setEveryDayStone(utils.getEveryDayLevel(sessions, user));
    }
  }, [user, sessions]);

  let classesTaughtStone, daysChangedStone, livesChangedStone,
    classesTaughtContent, daysChangedContent, livesChangedContent;

  if (user && user.type === 'instructor') {
    classesTaughtStone = utils.getClassesTaughtLevel(sessions, user);
    daysChangedStone = utils.getDaysChangedLevel(sessions, user);
    livesChangedStone = utils.getLivesChangedLevel(sessions, user);
    
    classesTaughtContent = (
      <Grid item>
        <Milestone title={classesTaughtStone.title} label={classesTaughtStone.label}
          max={classesTaughtStone.max} value={classesTaughtStone.value}
        />
      </Grid>
    )
    daysChangedContent = (
      <Grid item>
        <Milestone title={daysChangedStone.title} label={daysChangedStone.label} 
          max={daysChangedStone.max} value={daysChangedStone.value}
        />
      </Grid>
    )
    livesChangedContent = (
      <Grid item>
        <Milestone title={livesChangedStone.title} label={livesChangedStone.label} 
          max={livesChangedStone.max} value={livesChangedStone.value}
        />
      </Grid>
    )
  }


  return (
    <Container>
      <Grid container direction="column">
        {classesTaughtContent}
        {daysChangedContent}
        {livesChangedContent}
        <Grid item>
          <Milestone title={warriorStone.title} label={warriorStone.label} 
            max={warriorStone.max} value={warriorStone.value}
          />
        </Grid>
        <Grid item>
          <Milestone title={typesTakenStone.title} label={typesTakenStone.label} 
            max={typesTakenStone.max} value={typesTakenStone.value}
          />
        </Grid>
        <Grid item>
          <Milestone title={weekStreakStone.title} label={weekStreakStone.label} 
            max={weekStreakStone.max} value={weekStreakStone.value}
          />
        </Grid>
        <Grid item>
          <Milestone title={uniqueInstructorStone.title} label={uniqueInstructorStone.label}
            max={uniqueInstructorStone.max} value={uniqueInstructorStone.value}
          />
        </Grid>
        <Grid item>
          <Milestone title={doubleUpStone.title} label={doubleUpStone.label} 
            max={doubleUpStone.max} value={doubleUpStone.value}
          />
        </Grid>
        <Grid item>
          <Milestone title={triItStone.title} label={triItStone.label} 
            max={triItStone.max} value={triItStone.value}
          />
        </Grid>
        <Grid item>
          <Milestone title={allDayStone.title} label={allDayStone.label}
            max={allDayStone.max} value={allDayStone.value}
          />
        </Grid>
        <Grid item>
          <Milestone title={rideOrDieStone.title} label={rideOrDieStone.label} 
            max={rideOrDieStone.max} value={rideOrDieStone.value}
          />
        </Grid>
        <Grid item>
          <Milestone title={everyDayStone.title} label={everyDayStone.label} 
            max={everyDayStone.max} value={everyDayStone.value}
          />
        </Grid>
      </Grid>
    </Container>
  );
}
