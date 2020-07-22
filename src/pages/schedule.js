import React, { useEffect, useState } from 'react';
import { Container } from '@material-ui/core';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';

import log from '../log';
import * as Course from '../api/course';
import CourseSchedule from '../components/courseSchedule';

const getUserSelector = createSelector([state => state.user.data], (user) => {
  return user;
});

export default function() {

  const currentUser = useSelector(state => getUserSelector(state));
  const [courses, setCourses] = useState([]);

  async function getSchedule(filter) {
    let result;

    try {
      result = await Course.query(filter, {}, 500);
    } catch(err) {
      throw err;
    }

    log.debug("SCHEDULE:: course schedule result", result);

    if (result && result.data) {
      setCourses(result.data.concat([]));
    }
  }

  async function getUserSchedule(userId, mongoId) {
    let now = new Date();
    now.setHours(now.getHours() - 24);
    let schedFilter = {
      '$and': [
        {'$or': [
          {instructor: mongoId},
          {participants: { $elemMatch: { id: userId }}},
        ]},
        {'$or': [ 
          { start_date: {"$gte" : now.toISOString() }},
          { recurring: { '$exists': true }}
        ]},
      ],
      start_date: { '$exists': true },
    };

    log.debug("SCHEDULE:: user schedule filter", schedFilter);

    return getSchedule(schedFilter);
  }

  useEffect(() => {
    if (currentUser.id) {
      getUserSchedule(currentUser.id, currentUser._id);
    }
  }, [currentUser])

  return (
		<Container>
      <CourseSchedule course={courses} view="week" />
		</Container>
  );
};
