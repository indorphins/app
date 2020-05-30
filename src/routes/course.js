import React from 'react';
import { Switch, Route } from 'react-router-dom';

import courseSession from '../pages/course/session';
import course from '../pages/course/info';
import courses from '../pages/course';

export default function() {
  return (
    <Switch>
      <Route exact path='/class/:id/join' component={courseSession} />
      <Route path='/class/:id' component={course} />
      <Route path='/class' component={courses} />
      <Route path='/' component={courses} />
      <Route component={courses} />
    </Switch>
  );
};