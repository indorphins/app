import React from 'react';
import { Switch, Route } from 'react-router-dom';

import course from '../pages/course';
import courses from '../pages/courses';

export default () => {
  return (
    <Switch>
      <Route exact path='/class/:id' component={course} />
      <Route exact path='/class' component={courses} />
      <Route exact path='/' component={courses} />
    </Switch>
  );
};