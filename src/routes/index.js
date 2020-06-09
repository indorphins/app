import React from 'react';
import { Switch, Route } from 'react-router-dom';
import path from './path';
import ClassRouter from './course';
import Profile from '../pages/profile'
import LoginView from '../pages/login';
import Register from '../pages/signup';
import Header from '../components/header';

export default function() {

  return (
    <Switch>
      <Route exact path={path.profile}>
        <Header>
          <Profile />
        </Header>
      </Route>
      <Route exact path={path.instructorProfile}>
        <Header>
          <Profile />
        </Header>
      </Route>
      <Route path={path.signup} component={Register} />
      <Route path={path.login}>
        <LoginView />
      </Route>
      <Route path={path.home}>
        <ClassRouter />
      </Route>
    </Switch>
  );
};