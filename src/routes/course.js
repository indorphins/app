import React from 'react';
import { Switch, Route } from 'react-router-dom';

import path from './path';
import CourseSession from '../pages/course/session';
import CourseInfo from '../pages/course/info';
import CourseList from '../pages/course';
import Header from '../components/header';

export default function() {
  return (
    <Switch>
      <Route exact path={path.courseJoinSession}>
        <CourseSession />
      </Route>
      <Route exact path={path.courseDetail}>
        <Header>
          <CourseInfo />
        </Header>
      </Route>
      <Route path={path.courses}>
        <Header>
          <CourseList />
        </Header>
      </Route>
      <Route>
        <Header>
          <CourseList />
        </Header>
      </Route>
    </Switch>
  );
};