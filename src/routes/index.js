import React from 'react';
import { Switch, Route } from 'react-router-dom';
import path from './path';
import ClassRouter from './course';
import Profile from '../pages/profile'
import LoginView from '../pages/login';
import Register from '../pages/signup';
import Nav from '../components/nav';

export default function() {

  return (
    <Switch>
      <Route exact path={path.profile}>
        <Nav>
          <Profile />
        </Nav>
      </Route>
      <Route exact path={path.instructorProfile}>
        <Nav>
          <Profile />
        </Nav>
      </Route>
      <Route path={path.signup} component={Register} />
      <Route path={path.login}>
        <LoginView />
      </Route>
      <Route path={path.home}>
        <Nav>
          <ClassRouter />
        </Nav>
      </Route>
    </Switch>
  );
};