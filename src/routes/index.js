import React, { useState, useEffect } from 'react';
import { Switch, Route, useLocation } from 'react-router-dom';
import {Alert} from '@material-ui/lab';
import { Container, Grid } from '@material-ui/core';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';

import path from './path';
import Header from '../components/header/header';
import loadable from '@loadable/component';
import queryString from 'query-string';
import Login from '../pages/login';
import Signup from '../pages/signup';
import log from '../log';
import * as CampaignAPI from '../api/campaign';
import { store, actions } from '../store';

const AsyncPage = loadable(props => import(`../pages/${props.page}`), {
  cacheKey: props => props.page,
})

const ClassRouter = loadable(/* webpackChunkName: "course" */ () => import(`./course`), {
  cacheKey: () => 'ClassRouter',
});

const getUserSelector = createSelector([state => state.user.data], (user) => {
  return user;
});

const getSavedCampaigns = createSelector([state => state.user.data], (user) => {
  return user.campaigns ? user.campaigns : [];
});

export default function Routes() {

  let location = useLocation();
  const [ query, setQuery ] = useState(null);
  const [ err, setError] = useState(null);
  const [ campaign, setCampaign] = useState(null);
  const user = useSelector(state => getUserSelector(state));
  const savedCampaigns = useSelector(state => getSavedCampaigns(state));

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

  useEffect(() => {
    if (campaign && campaign.active) {

      let exists = savedCampaigns.find(item => item.campaignId === campaign.id);

      if (!exists) {
        getCampaignData(campaign, user);
      } else {
        if (exists.remaining > 0) {
          getCampaignData(campaign, user, exists.remaining);
        } else {
          setCampaign(null);
          store.dispatch(actions.campaign.clear());
        }
      }

    } else {

      let saved = savedCampaigns.find(item => item.remaining > 0);

      if (saved && saved[0]) {
        getCampaign(saved[0].campaignId);
      }
    }
  }, [campaign, savedCampaigns, user])

  useEffect(() => {
    if (query && query.cid) {
      getCampaign(query.cid);
    }
  }, [query]);

  async function getCampaign(id) {
    let c;
    try {
      c = await CampaignAPI.get(id);
    } catch(err) {
      log.warn("get campaign", err);
    }

    if (c) setCampaign(c);
  }

  function getCampaignData(campaign, user, /*optional*/ remaining) {
    let text;
    let amount;
    let discountRate;
    let discountAmount;
    let discountMultiplier;
    let displayData;

    if (user.id !== campaign.referrerId && (campaign.discountAmount || campaign.discountRate)) {
      discountRate = campaign.discountRate;
      discountAmount = campaign.discountAmount;
      discountMultiplier = campaign.discountMultiplier;
    }

    if (user.id === campaign.referrerId && (campaign.referrerDiscountAmount || campaign.referrerDiscountRate)) {
      discountRate = campaign.referrerDiscountRate;
      discountAmount = campaign.referrerDiscountAmount;
      discountMultiplier = campaign.referrerDiscountMultiplier;
    }
    
    displayData = {
      id: campaign.id,
    }

    if (discountRate) {
      amount = (campaign.discountRate * 100) + "%";
      displayData.discountRate = discountRate;
    }

    if (discountAmount) {
      amount = "$" + (campaign.discountAmount / 100);
      displayData.discountAmount = discountAmount;
    }

    if (amount) {

      if (remaining) {
        discountMultiplier = remaining;
        text = `${amount} off`;
      } else {
        text = `Book a class now for ${amount} off`;
      }

      if (discountMultiplier > 1) {
        text = `${text} your next ${discountMultiplier} classes`;
      } else {
        text = `${text} your next class`;
      }

      displayData.description = text;
    }

    store.dispatch(actions.campaign.set(displayData));
  }

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
        <Route exact path={path.admin}>
          <AsyncPage page='admin' />
        </Route>
        <Route exact path={path.referFriend}>
          <AsyncPage page='referBonus' />
        </Route>
        <Route path={path.home}>
          {errcontent}
          <ClassRouter />
        </Route>
      </Header>
    </Switch>
  );
}