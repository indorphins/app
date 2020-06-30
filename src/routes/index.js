import React from 'react';
import { Switch, Route } from 'react-router-dom';
import path from './path';
import ClassRouter from './course';
import Profile from '../pages/profile'
import LoginView from '../pages/login';
import Register from '../pages/signup';
import Schedule from '../pages/schedule';
import Header from '../components/header';
import CourseSession from '../pages/course/session';

export default function() {

  return (
    <Switch>
      <Route exact path={path.signup} component={Register} />
      <Route exact path={path.login}>
        <LoginView />
      </Route>
      <Route exact path={path.courseJoinSession}>
        <CourseSession />
      </Route>
      <Header>
        <Route exact path={path.profile}>
          <Profile />
        </Route>
        <Route exact path={path.schedule}>
          <Schedule />
        </Route>
        <Route exact path={path.instructorProfile}>
          <Profile />
        </Route>
        <Route path={path.home}>
          <ClassRouter />
        </Route>
      </Header>

    </Switch>
  );
};