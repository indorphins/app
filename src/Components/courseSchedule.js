import React, { useState, useEffect } from 'react';
import { Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { format } from 'date-fns';

import Calendar from './calendar';
import path from '../routes/path';
import { getNextDate } from '../utils';

const useStyles = makeStyles((theme) => ({
  calContainer: {
    width: "100%",
    marginTop: theme.spacing(5),
    marginBottom: theme.spacing(5),
  },
  header: {
    color: theme.palette.text.disabled,
  },
  toolbar: {
    paddingRight: theme.spacing(2),
    paddingLeft: theme.spacing(2),
  }
}));

const extrapolateRecurringEvents = function(course) {
  let data = [];

  let sched = getNextDate(course.recurring, 50);
  let start = new Date(course.start_date);
  
  sched.forEach(function(d) {

    let end = new Date(d);
    end.setMinutes(end.getMinutes() + course.duration);
    let startTime = format(d, "h:mm");
    let endTime = format(end, "h:mm a");
    let time = startTime + "-" + endTime;

    let item =  {
      title: course.title,
      start: d,
      end: end,
      time: time,
      url: path.courses + "/" + course.id,
    }

    if (d >= start) data.push(item);
  });

  return data;
}

export default function(props) {

  const classes = useStyles();
  const [events, setEvents] = useState([]);

  useEffect(() => {

    if (props.course.length <= 0) {
      setEvents([]);
      return;
    }

    let data = [];

    for (var i = 0; i < props.course.length; i++) {

      if (!props.course[i].id) continue;

      if (props.course[i].recurring) {

        let dates = extrapolateRecurringEvents(props.course[i]);
        data = data.concat(dates);

      } else {

        let start = new Date(props.course[i].start_date);
        let end = new Date(props.course[i].start_date);

        end.setMinutes(end.getMinutes() + props.course[i].duration);
        let startTime = format(start, "h:mm");
        let endTime = format(end, "h:mm a");
        let time = startTime + "-" + endTime;

        let item =  {
          title: props.course[i].title,
          start: start,
          end: end,
          time: time,
          url: path.courses + "/" + props.course[i].id,
        }
      
        data.push(item);
      }
    }

    if (data.length > 0) {
      setEvents(data);
    }

  }, [props.course]);

  return (
    <Grid container m={12}>
      <Typography className={classes.header} variant="h2">
        {props.header}
      </Typography>
      <Calendar events={events} />
    </Grid>
  );
}