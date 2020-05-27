import React from 'react';
import { Switch, Route } from 'react-router-dom';

import CourseRouter from './course';

import LoginView from '../pages/login';
import OpentokView from '../pages/opentok';

export default function() {
  return (
    <Switch>
      <Route path='/test'>
        <OpentokView />
      </Route>
      <Route path='/profile' component={LoginView} />
      <Route path='/login'>
        <LoginView />
      </Route>
      <Route path='/'>
        <CourseRouter />
      </Route>
    </Switch>
  );
};