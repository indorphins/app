import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Box, Card, Grid, Typography, useMediaQuery } from '@material-ui/core';
import { format } from 'date-fns';

import Extras from './extras';

export default function Day(props) {
  const { classes, date } = props;
  const [open, setOpen] = useState(false);
  const eventsAgenda = useRef(null);
  const dayRef = useRef(null);
  const sm = useMediaQuery('(max-width:600px)');

  function toggleEventsAgenda() {
    if (!eventsAgenda.current) return;

    if (open) {
      setOpen(false);
      eventsAgenda.current.className = `${classes.agenda} ${classes.hidden}`;
      dayRef.current.className = `${props.className}`;
    } else {
      setOpen(true);
      eventsAgenda.current.className = `${classes.agenda}`;
      dayRef.current.className = `${props.className} ${classes.selected}`;
    }
  }

  useEffect(() => {
    return function() {
      if (dayRef && dayRef.current) dayRef.current.className = `${props.className}`;
      setOpen(false);
    }
  }, [])

  let layout = {
    direction: "row",
    justify: "flex-start",
    align: "center",
    spacing: 1,
    eventSpacing: 1,
    agendaSize: 6,
    agendaDirection: "row",
  }
  let style = {};

  if (sm) {
    layout = {
      direction: "column",
      justify: "center",
      align: "center",
      spacing: 0,
      eventSpacing: 1,
      agendaSize: 12,
      agendaDirection: "column",
    }

    style = {
      display: "flex",
      alignItems: "flex-start",
    }
  }

  let indicator = null;
  let eventsContent = null;
  let wrapper = null;

  if (props.events && props.events.length > 0) {
    props.events.sort(function(a,b) {
      return a.start.getTime() - b.start.getTime();
    });
    indicator = (
      <Grid item style={style}>
        <Box className={classes.eventIndicator}></Box>
      </Grid>
    );

    eventsContent = (
      <Grid
        container
        direction={layout.agendaDirection}
        spacing={layout.eventSpacing}
        className={classes.eventCardList}
      >
        {props.events.map(evt => (
          <Grid item container key={evt.start} xs={layout.agendaSize}>
            <Link to={evt.url} className={classes.link}>
              <Card className={classes.eventCard}>
                <Grid container direction="row" spacing={1}>
                  <Grid item container>
                    <Typography variant="body2" className={classes.timeLbl}>
                      {evt.startTime} - {evt.endTime}:
                    </Typography>
                  </Grid>
                  <Grid item container>
                    <Typography variant="body2" className={classes.titleLbl}>
                      {evt.title}
                    </Typography>
                  </Grid>
                </Grid>
              </Card>
            </Link>
          </Grid>
        ))}
      </Grid>
    );

    let wkday = date.getDay();
    let wkdayBufTiles = null;

    if (wkday < 6 && open && eventsAgenda.current) {
      let wkdayMap = [];
      for (var i = 0; i < wkday + 1; i++) {
        wkdayMap.push(i);
      }

      wkdayBufTiles = (
        <React.Fragment>
          {wkdayMap.map(w => (
            <Grid key={w} item className={`${classes.day} ${classes.noday}`}></Grid>
          ))}
        </React.Fragment>
      )
    }

    let formatted = format(props.date, "iiii, MMMM do");
    wrapper = (
      <React.Fragment>
        <Grid container className={`${classes.agenda} ${classes.hidden}`} ref={eventsAgenda}>
          <Typography variant="h4" className={classes.dateLbl}>{formatted}</Typography>
          {eventsContent}
        </Grid>
        {wkdayBufTiles}
      </React.Fragment>
    );
  }

  let smHandler = null;
  let classNames = props.className;

  if (sm) {
    smHandler = toggleEventsAgenda;
  }

  if (open && dayRef.current) {
    classNames = `${props.className} ${classes.selected}`;
  }

  return (
    <React.Fragment>
      <Grid item className={classNames} onClick={smHandler} ref={dayRef}>
        <Grid
          container
          direction={layout.direction}
          justify={layout.justify}
          alignItems={layout.align}
          spacing={layout.spacing}
        >
          <Grid item>
            <Typography variant="body2" className={classes.number}>{props.day}</Typography>
          </Grid>
          {indicator}
          <Extras events={props.events} classes={classes} toggle={toggleEventsAgenda} open={open} />
        </Grid>
      </Grid>
      {wrapper}
    </React.Fragment>
  );
}