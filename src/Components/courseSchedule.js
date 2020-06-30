import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Box, Grid, Typography, Button, ButtonGroup, Tabs, Tab } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { format, startOfWeek, parse, getDay } from 'date-fns';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import '../../node_modules/react-big-calendar/lib/css/react-big-calendar.css';

import log from '../log';
import path from '../routes/path';
import { getNextDate } from '../utils';

const locales = {
  'en-US': require('date-fns/locale/en-US'),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const useStyles = makeStyles((theme) => ({
  '@global': {
    '.rbc-event-label': {
      display: 'none',
    },
    '.rbc-event': {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      border: 'none !important',
      width: "100%",
      height: "auto !important"
    },
    '.rbc-day-slot': {
      border: "none !important",
    },
    '.rbc-today': {
      backgroundColor: theme.palette.secondary.main,
    }
  },
  calendar: {
    width: "100%",
    height: 700,

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
  const history = useHistory();
  const views = ['month', 'week'];
  const [events, setEvents] = useState([]);
  const [tabValue, setTabValue] = useState(1);
  const [startDate, setStartDate] = useState(new Date());

  useEffect(() => {
    if (props.view === "week") {
      setTabValue(1);
    }
    if (props.view === "month") {
      setTabValue(0);
    }
  }, [props.view]);

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
      setStartDate(data[0].start);
      log.debug("events items", data);
      setEvents(data);
    }

  }, [props.course]);


  const CalendarToolbar = function(toolbar) {

    const goToBack = () => {
      console.log(toolbar);
      if (toolbar.view === 'month') {
        toolbar.date.setMonth(toolbar.date.getMonth() - 1);
      }

      if (toolbar.view === 'week') {
        let d = startDate;
        d.setHours(d.getHours() - 168);
        setStartDate(d);
      }
      toolbar.onNavigate('prev');
    };
  
    const goToNext = () => {
      if (toolbar.view === 'month') {
        toolbar.date.setMonth(toolbar.date.getMonth() + 1);
      }

      if (toolbar.view === 'week') {
        let d = startDate;
        d.setHours(d.getHours() + 168);
        setStartDate(d);
      }
      toolbar.onNavigate('next');
    };

    const setMonthView = function() {
      toolbar.onView('month');
      setTabValue(0);
    }

    const setWeekView = function() {
      toolbar.onView('week');
      setTabValue(1);
    }

    return (
      <Grid container direction="row" justify="space-between" alignItems="center">
        <Grid item>
        <ButtonGroup color="secondary" variant="contained">
          <Button onClick={goToBack}>Prev</Button>
          <Button onClick={goToNext}>Next</Button>
        </ButtonGroup>
        </Grid>
        <Grid item>
          <Tabs value={tabValue} indicatorColor="secondary" textColor="secondary">
            <Tab label="Month" onClick={setMonthView} />
            <Tab label="Week" onClick={setWeekView} />
          </Tabs>
        </Grid>
      </Grid>
    );
  }

  function navigateToCourse(evt) {
    history.push(evt.target.id);
  }

  const EventItem = function(event) {
    return (
      <Grid id={event.event.url} onClick={navigateToCourse}>
        {event.event.time} {event.title}
      </Grid>
    )
  }

  const AgendaEventItem = function(event) {
    return (
      <Grid id={event.event.url} onClick={navigateToCourse}>
        {event.title}
      </Grid>
    )
  }

  const onNavigate = function(e) {
    setStartDate(e);
  }

  let components = {
    toolbar: CalendarToolbar,
    event: EventItem,
    week: {
      event: EventItem,
    },
    agenda: {
      event: AgendaEventItem,
    }
  }

  return (
    <Grid container m={12}>
      <Typography className={classes.header} variant="h2">
        {props.header}
      </Typography>
      <Box className={classes.calContainer}>
        <Calendar
          localizer={localizer}
          events={events}
          date={startDate}
          onNavigate={onNavigate}
          startAccessor="start"
          endAccessor="end"
          defaultView={props.view}
          views={views}
          className={classes.calendar}
          step={120}
          timelots={60}
          components={components}
        />
      </Box>
    </Grid>
  );
}