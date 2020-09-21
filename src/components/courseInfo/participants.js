import React, { useState, useEffect } from 'react';
import {
  Card,
  Grid,
  Tooltip,
  Typography,
  makeStyles,
} from '@material-ui/core';
import { People } from '@material-ui/icons';
import { isSameDay, isWithinInterval, sub, add } from 'date-fns';

import { BdayIcon } from '../../components/icon/bday';
import { ClassesTakenIcon } from '../icon/classesTaken';

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

    let data = [].concat(course.participants).map(item => {
      if (item.birthday) {
        // Check range extending to 8 days on either side of today to ensure time differences 
        // don't miss a valid birthday
        const bday = new Date(item.birthday);
        const start = sub(new Date(course.start_date), {days: 8});
        const end = add(new Date(course.start_date), {days: 8});
        bday.setFullYear(start.getFullYear());
  
        if (isSameDay(bday, new Date(course.start_date)) || isWithinInterval(bday, {start: start, end: end})) {
          item.showBirthday = true;
        } else {
          item.showBirthday = false;
        }
      }
      
      let titleText = {
        title: `${item.username}`
      };
      
      if (item.classesTaken >= 0) {
        titleText.title += `: ${item.classesTaken} classes taken`;
      }

      if (item.weeklyStreak > 0) {
        titleText.title += ` ${item.weeklyStreak} week streak`;
      }

      item = Object.assign({}, titleText, item);

      return item;
    });

    let sorted = data.sort((a, b) => {
      if (a.username.toLowerCase() === b.username.toLowerCase()) {
        return 0;
      } else if (a.username.toLowerCase() > b.username.toLowerCase()) {
        return 1;
      } else {
        return -1;
      }
    });

    setParticipantList(sorted);
  }, [course]);

  let list = [];

  if (participantList && participantList.length > 0) { 
    list = participantList
  }

  let participantsContent = list.map(item => (
    <Grid key={item.id} item xs={6}>
      <Grid
        container
        direction='row'
        alignItems='center'
        alignContent="center"
        style={{flexWrap: "nowrap"}}
        spacing={1}
      >
        <Grid item style={{whiteSpace: "nowrap", overflow: "hidden"}}>
          <Tooltip 
            title={item.title}
            placement='top'
            arrow
          >
            <Typography 
              variant="body1" 
              style={{overflow: "hidden", textOverflow: "ellipsis"}}
            >
              {item.username}
            </Typography>
          </Tooltip>
        </Grid>
        <Grid item style={{whiteSpace: "nowrap", display: "flex", alignContent:"center", alignItems: "center"}}>
          <BdayIcon bday={item.birthday} showBirthday={item.showBirthday} />
          <ClassesTakenIcon count={item.classesTaken} />
        </Grid>
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
      <Grid container direction="row" justify="flex-start" spacing={1}>
        {participantsContent}
      </Grid>
    </Card>
  );
}