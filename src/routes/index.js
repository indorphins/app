import React from 'react';
import { Switch, Route } from 'react-router-dom';

import ClassRouter from './course';
import Profile from '../pages/profile'
import LoginView from '../pages/login';

export default function() {
  return (
    <Switch>
      <Route path='/profile' component={Profile} />
      <Route path='/login'>
        <LoginView />
      </Route>
      <Route path='/'>
        <ClassRouter />
      </Route>
    </Switch>
  );
};