import React, { useState, useEffect } from 'react';
import { Switch, Route, useLocation } from 'react-router-dom';
import {Alert} from '@material-ui/lab';
import { Container, Grid } from '@material-ui/core';

import path from './path';
import Header from '../components/header/header';
import Footer from '../components/footer/footer';
import loadable from '@loadable/component';
import queryString from 'query-string';
import Login from '../pages/login';
import Signup from '../pages/signup';
import AddPayment from '../pages/addPayment';
import log from '../log';
import CampaignParser from '../components/campaign/campaignParser';

const AsyncPage = loadable(props => import(`../pages/${props.page}`), {
  cacheKey: props => props.page,
})

const ClassRouter = loadable(/* webpackChunkName: "course" */ () => import(`./course`), {
  cacheKey: () => 'ClassRouter',
});


export default function Routes() {

  let location = useLocation();
  const [ query, setQuery ] = useState(null);
  const [ err, setError] = useState(null);

  useEffect(() => {
    if (location) {
      let params = queryString.parse(location.search);
      log.info("QUERY STRING::", params);
      if (params) setQuery(params);

      if (params && params.error) {
        setError(params.error);
      } else {
        setError(null);
      }
    }
  }, [location]);

  let errcontent;

  if (err) {
    errcontent = (
      <Container>
        <Grid container direction="row" spacing={2}>
          <Grid item xs>
            <Alert severity="error" onClose={() => setError(null)}>{err}</Alert>
          </Grid>
        </Grid>
      </Container>
    )
  }

  return (
    <CampaignParser query={query}>
      <Switch>
        <Route exact path={path.signup}>
          <Signup query={query} />
        </Route>
        <Route exact path={path.login}>
          <Login query={query} />
        </Route>
        <Route exact path={path.addPayment}>
          <AddPayment query={query} />
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
          <Route exact path={path.admin}>
            <AsyncPage page='admin' />
          </Route>
          <Route exact path={path.referFriend}>
            <AsyncPage page='referBonus' />
          </Route>
          <Route path={path.courses}>
            {errcontent}
            <ClassRouter />
          </Route>
          <Route exact path="/">
            <AsyncPage page="home" />
          </Route>
          <Footer />
        </Header>
      </Switch>
    </CampaignParser>
  );
}