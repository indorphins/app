import React, { useState, useEffect } from 'react';
import { Box, Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { format, startOfWeek, parse, getDay } from 'date-fns';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import '../../node_modules/react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': require('date-fns/locale/en-US'),
}
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

const useStyles = makeStyles((theme) => ({
  calendar: {
    width: "100%",
    height: 600,

  },
  calContainer: {
    width: "100%",
    marginTop: theme.spacing(5),
    marginBottom: theme.spacing(5),
  },
  header: {
    color: theme.palette.text.disabled,
  }
}));

const views = ['month', 'week'];

export default function(props) {

  const classes = useStyles();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    let start = new Date(props.course.start_date);
    let end = new Date(props.course.start_date);
    end.setMinutes(end.getMinutes() + props.course.duration);

    console.log(end);


    let data =  {
      title: props.course.title,
      start: start,
      end: end,
    }

    console.log("event data", data)

    setEvents([data]);
  }, [props.course])


  return (
    <Grid container m={12}>
      <Typography className={classes.header} variant="h2">
        {props.header}
      </Typography>
      <Box className={classes.calContainer}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          defaultView="week"
          views={views}
          className={classes.calendar}
          step={60}
        />
      </Box>
    </Grid>
  );
}