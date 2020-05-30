import React from 'react';
import { Switch, Route } from 'react-router-dom';

import ClassRouter from './course';
import Profile from '../pages/profile'
import LoginView from '../pages/login';
import Register from '../pages/signup';
import Nav from '../components/nav';

export default function() {

  return (
    <Switch>
      <Route path='/profile'>
        <Nav>
          <Profile />
        </Nav>
      </Route>
      <Route path='/register' component={Register} />
      <Route path='/login'>
        <LoginView />
      </Route>
      <Route>
        <Nav>
          <ClassRouter />
        </Nav>
      </Route>
    </Switch>
  );
};