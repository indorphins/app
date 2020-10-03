import React, { useState, useEffect } from 'react';
import { Switch, Route, useLocation } from 'react-router-dom';
import path from './path';
import Header from '../components/header/header';
import loadable from '@loadable/component';
import queryString from 'query-string';
import Login from '../pages/login';
import Signup from '../pages/signup';

const AsyncPage = loadable(props => import(`../pages/${props.page}`), {
  cacheKey: props => props.page,
})

const ClassRouter = loadable(/* webpackChunkName: "course" */ () => import(`./course`), {
  cacheKey: () => 'ClassRouter',
});

export default function Routes() {

  let location = useLocation();
  const [ query, setQuery ] = useState(null);

  useEffect(() => {
    if (location.search) {
      setQuery(queryString.parse(location.search));
    }
  }, [location]);

  return (
    <Switch>
      <Route exact path={path.signup}>
        <Signup query={query} />
      </Route>
      <Route exact path={path.login}>
        <Login query={query} />
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
          <AsyncPage page="instructor/info" />
        </Route>
        <Route exact path={path.instructors}>
          <AsyncPage page='instructor/index' />
        </Route>
        <Route exact path={path.milestone}>
          <AsyncPage page="milestone" />
        </Route>
        <Route path={path.home}>
          <ClassRouter />
        </Route>
      </Header>
    </Switch>
  );
}