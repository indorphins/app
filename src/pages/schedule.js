import React from 'react';
import { Container } from '@material-ui/core';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';

import CourseSchedule from '../components/courseSchedule';

const userSchedSelector = createSelector([state => state.user.schedule], (items) => {
  return items;
});

export default function Schedule() {

  const schedule = useSelector(state => userSchedSelector(state));

  return (
    <Container>
      <CourseSchedule course={schedule} />
    </Container>
  );
}
