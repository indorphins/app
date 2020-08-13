import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Grid, Typography, useMediaQuery } from '@material-ui/core';
import { ChevronRight, ExpandMore } from '@material-ui/icons';

export default function Extras(props) {
  const { classes, events, toggle, open } = props;
  const sm = useMediaQuery('(max-width:600px)');
  let eventsContent = null;

  if (!sm && events && events.length > 0) {
    let smlEventsData = events.slice(0,2);
    let more = null;
    let count = events.length - smlEventsData.length;

    if (count > 0) {
      more = (
        <Typography variant="subtitle1" className={`${classes.timeLbl} ${classes.timeLblSml}`}>
          +{count} more
        </Typography>
      )
    }

    let expandBtn = (
      <ChevronRight onClick={toggle} style={{cursor:"pointer"}} />
    )

    if (open) {
      expandBtn = (
        <ExpandMore onClick={toggle} style={{cursor:"pointer"}} />
      );
    }

    eventsContent = (
      <React.Fragment>
        {smlEventsData.map(evt => (
          <Grid item container key={evt.start}>
            <Link to={evt.url} className={classes.link}>
              <Card className={`${classes.eventCard} ${classes.eventCardSml}`}>
                <Grid container direction="column">
                  <Grid item container>
                    <Typography variant="body2" className={`${classes.timeLbl} ${classes.timeLblSml}`}>
                      {evt.startTime} - {evt.endTime}:
                    </Typography>
                  </Grid>
                  <Grid item container>
                    <Typography variant="body2" className={`${classes.titleLbl} ${classes.titleLblSml}`}>
                      {evt.title}
                    </Typography>
                  </Grid>
                </Grid>
              </Card>
            </Link>
          </Grid>
        ))}
        <Grid item container>
          <Grid container direction="row" justify="space-between" alignItems="center" alignContent="center">
            <Grid item xs>
              {more}
            </Grid>
            <Grid item>
              {expandBtn}
            </Grid>
          </Grid>
        </Grid>
      </React.Fragment>
    );
  }

  return eventsContent;
}