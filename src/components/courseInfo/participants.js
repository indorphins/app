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
import * as Course from '../../api/course';
import log from '../../log';

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
  const { currentUser, course } = props;
  const [participantList, setParticipantList] = useState(null);

  useEffect(() => {
    if (!course.participants) {
      return;
    }

    if (!course.instructor || !course.instructor.id || !currentUser.id || !currentUser.type) {
      setParticipantList(course.participants);
      return;
    }

    if (course.instructor.id === currentUser.id || currentUser.type === 'admin') {
      Course.getParticipants(course.id).then(list => {
        setParticipantList(list);
      }).catch (err => {
        log.warn("COURSE INFO:: unable to fetch list of participants");
      })
    } else {
      setParticipantList(course.participants);
    }
  }, [course, currentUser]);


  const birthdayHelper = function (user) {
    if (user.birthday) {
      // Check range extending to 8 days on either side of today to ensure time differences don't miss a valid birthday
      const bday = new Date(user.birthday);
      const start = sub(new Date(course.start_date), {days: 8});
      const end = add(new Date(course.start_date), {days: 8});
      bday.setFullYear(start.getFullYear());

      if (isSameDay(bday, new Date(course.start_date)) || isWithinInterval(bday, {start: start, end: end})) {
        return true;
      }
    }
    return false;
  }

  let participantsContent = null

  if (participantList && participantList.length) { 
    let participants = participantList.map(item => (
      <Grid key={item.username} item xs={6}>
        <Grid container display='inline' direction='row' alignItems='center'>
          <Typography variant="body1">{item.username}</Typography>
          {(currentUser.id === course.instructor.id || currentUser.type === 'admin') && birthdayHelper(item) ? 
            <BdayIcon bday={item.birthday} /> :
            null
          }
        </Grid>
      </Grid>
    ))

    participantsContent = (
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
          {participants}
        </Grid>
      </Card>
    )
  }

  return participantsContent;
}