import React from 'react';
import { Typography } from '@material-ui/core';
import { format, isTomorrow, isToday, differenceInDays } from 'date-fns';

import { getNextSession } from '../../utils';

export default function StartTime(props) {
  const { course, classes } = props;

  let courseTimeContent = null;

  if (course.start_date) {
    let now = new Date();
    let next = getNextSession(now, course);
    let formatted = null;

    if (next) {
      let d = new Date(next.date);
      let dt = format(d, "iiii");
      let time = format(d, "h:mm a");

      if (differenceInDays(d, now) >= 7) {
        dt = format(d, "iiii, MMMM do");
      }

      if (isTomorrow(d)) {
        dt = "Tomorrow";
      }

      if (isToday(d)) {
        dt = "Today";
      }

      formatted = dt + " @ " + time;
      if (course.recurring) {
        formatted = formatted + " - weekly";
      }
    } else {
      formatted = "Class over";
    }

    courseTimeContent = (
      <Typography variant="h3" className={classes.courseTime}>{formatted}</Typography>
    );
  }

  return courseTimeContent;
}