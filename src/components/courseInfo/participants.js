import React, { useState, useEffect } from 'react';
import {
  Card,
  Grid,
  Typography,
  makeStyles,
} from '@material-ui/core';
import { People } from '@material-ui/icons';
import { isSameDay, isWithinInterval, sub, add } from 'date-fns';

import { BdayIcon } from '../../components/icon/bday';
import { ClassesTakenIcon } from '../icon/classesTaken';
import { WeekStreakIcon } from '../icon/weekStreak';

const useStyles = makeStyles((theme) => ({
  participantContainer: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    cursor: "default",
    backgroundColor: theme.palette.grey[200],
  },
}));

export default function Participants(props) {

  const classes = useStyles();
  const { course } = props;
  const [participantList, setParticipantList] = useState([]);


  useEffect(() => {
    if (!course.participants) {
      return;
    }

    let data = course.participants.map(item => {
      if (item.birthday) {
        // Check range extending to 8 days on either side of today to ensure time differences 
        // don't miss a valid birthday
        const bday = new Date(item.birthday);
        const start = sub(new Date(course.start_date), {days: 8});
        const end = add(new Date(course.start_date), {days: 8});
        bday.setFullYear(start.getFullYear());
  
        if (isSameDay(bday, new Date(course.start_date)) || isWithinInterval(bday, {start: start, end: end})) {
          item.bday = true;
        } else {
          item.bday = false;
        }
      }
      return item;
    });

    let sorted = data.sort((a, b) => {
      if (a.username === b.username) {
        return 0;
      } else if (a.username > b.username) {
        return 1;
      } else {
        return -1;
      }
    })

    setParticipantList(sorted);
  }, [course]);

  let list = [];

  if (participantList && participantList.length > 0) { 
    list = participantList
  }

  let participantsContent = list.map(item => (
    <Grid key={item.id} item xs={6}>
      <Grid container display='inline' direction='row' alignItems='center'>
        <Typography variant="body1">{item.username}</Typography>
        <BdayIcon bday={item.birthday} showBirthday={item.showBirthday} />
        <ClassesTakenIcon classes={item.classesTaken} />
        <WeekStreakIcon weeks={item.weeklyStreak} />
      </Grid>
    </Grid>
  ))

  return (
    <Card className={classes.participantContainer}>
      <Grid container direction="row" justify="flex-start" alignItems="center" alignContent="center" spacing={2}>
        <Grid item>
          <People color="primary" />
        </Grid>
        <Grid item>
          <Typography variant="h5">
            Participants
          </Typography>
        </Grid>
      </Grid>
      <Grid container direction="row" justify="flex-start">
        {participantsContent}
      </Grid>
    </Card>
  );
}