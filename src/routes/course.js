import React from 'react';
import { Switch, Route } from 'react-router-dom';

import path from './path';
import CourseInfo from '../pages/course/info';
import CourseList from '../pages/course';

export default function CourseRoutes() {
  return (
    <Switch>
      <Route exact path={path.courseDetail}>
        <CourseInfo />
      </Route>
      <Route exact path={path.courses}>
        <CourseList />
      </Route>
      <Route exact path="/">
        <CourseList />
      </Route>
    </Switch>
  );
}