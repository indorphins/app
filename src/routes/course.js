import React from 'react';
import { Switch, Route } from 'react-router-dom';

import path from './path';
import courseSession from '../pages/course/session';
import course from '../pages/course/info';
import courses from '../pages/course';

export default function() {
  return (
    <Switch>
      <Route exact path={path.courseJoinSession} component={courseSession} />
      <Route path={path.courseDetail} component={course} />
      <Route path={path.courses} component={courses} />
      <Route path={path.courses} component={courses} />
      <Route component={courses} />
    </Switch>
  );
};