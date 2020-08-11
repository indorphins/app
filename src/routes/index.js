import React from 'react';
import { Switch, Route } from 'react-router-dom';
import path from './path';
import Header from '../components/header';
import loadable from '@loadable/component'

const AsyncPage = loadable(props => import(`../pages/${props.page}`), {
  cacheKey: props => props.page,
})

const ClassRouter = loadable(/* webpackChunkName: "course" */ () => import(`./course`), {
  cacheKey: () => 'ClassRouter',
});

export default function() {

  return (
    <Switch>
      <Route exact path={path.signup}>
        <AsyncPage page="signup" />
      </Route>
      <Route exact path={path.login}>
        <AsyncPage page="login" />
      </Route>
      <Route exact path={path.courseJoinSession}>
        <AsyncPage page="course/session" />
      </Route>
      <Header>
        <Route exact path={path.profile}>
          <AsyncPage page="profile" />
        </Route>
        <Route exact path={path.schedule}>
          <AsyncPage page="schedule" />
        </Route>
        <Route exact path={path.instructorProfile}>
          <AsyncPage page="instructor" />
        </Route>
        <Route path={path.home}>
          <ClassRouter />
        </Route>
      </Header>
    </Switch>
  );
};