import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

import Feedback from './components/feedback';
import AppTheme from './styles';
import log from './log';
import Firebase from './Firebase';
import Routes from './routes/index';
import * as User from './api/user';
import * as Course from './api/course';
import * as Session from './api/session';
import * as Subscription from './api/subscription';
import Notification from './components/notification';
import { getAllMilestones } from './components/milestone';
import { store, actions } from './store';
import config from './config'

const getUserSelector = createSelector([(state) => state.user.data], (user) => {
  return user;
});

const getSessionsSelector = createSelector([state => state.milestone.sessions], (sessions) => {
  return sessions;
});

const getProductsSelector = createSelector([state => state.products], (products => {
  return products;
}))

const stripePromise = loadStripe(config.stripe_public_key);

export default function App() {
  const currentUser = useSelector((state) => getUserSelector(state));
  const sessions = useSelector(state => getSessionsSelector(state));
  const products = useSelector(state => getProductsSelector(state));

  async function getUser(firebaseUserData) {
    let user;

    // try to fetch indorphins user data
    try {
      user = await User.get();
    } catch (err) {
      if (err.message === 'user does not exist') {
        // TODO: if we don't have a user then we should redirect to the signup flow to get a username
        // before creating the user but for now we will just auto populate the username
        let firstname = null;
        let lastname = null;
        let username = null;
        let phone = null;
        
        if (firebaseUserData.displayName) {
          firstname = firebaseUserData.displayName.split(' ')[0];
          lastname = firebaseUserData.displayName.split(' ')[1];
          username = firebaseUserData.displayName;
        } else {
          let re = /(.*)@/gm;
          let match = re.exec(firebaseUserData.email);
          username = match[1];
        }

        if (firebaseUserData.phoneNumber) {
          phone = firebaseUserData.phoneNumber;
        }

        try {
          user = await User.create(
            username,
            firstname,
            lastname,
            firebaseUserData.email,
            phone,
          );
        } catch (err) {
          log.warn(
            'AUTH:: error creating user account from firebase token',
            err
          );

          return user;
        }
      } else {
        throw err;
      }
    }

    return user;
  }

  async function listener(firebaseUserData) {
    // user logged out or session expired
    if (!firebaseUserData) {
      log.debug('AUTH:: firebase user null');
      if (currentUser.id) {
        store.dispatch(actions.milestone.clear());
        store.dispatch(actions.user.clear());
      }
      return;
    }

    log.debug('AUTH:: got firebase user data', firebaseUserData);
    let user;

    // try to fetch indorphins user data
    try {
      user = await getUser(firebaseUserData);
    } catch (err) {
      return log.error('AUTH:: get user data', err);
    }

    if (!user.data) {
      return log.warn('AUTH:: user creation failed');
    }
    
    log.debug('AUTH:: got indorphins user data', user.data);

    try {
      await store.dispatch(actions.user.set(user.data));
    } catch (err) {
      return log.error('AUTH:: save user to store', err);
    }
  }

  async function getSchedule(filter) {
    let result;

    try {
      result = await Course.query(filter, {}, 500);
    } catch(err) {
      throw err;
    }

    if (result && result.data) {
      await store.dispatch(actions.user.setSchedule(result.data));
    }
  }

  async function getUserSchedule(userId) {
    let now = new Date();
    now.setHours(now.getHours() - 48);
    let schedFilter = {
      '$and': [
        {'$or': [
          {instructor: userId},
          {participants: { $elemMatch: { id: userId }}},
        ]},
        {'$or': [ 
          { start_date: {"$gte" : now.toISOString() }},
          { recurring: { '$exists': true }}
        ]},
      ],
      start_date: { '$exists': true },
    };

    return getSchedule(schedFilter);
  }

  async function getUserSessions() {
    let result;

    try {
      result = await Session.getAll();
    } catch (err) {
      throw err;
    }

    if (result && result.sessions) {
      store.dispatch(actions.milestone.setSessions(result.sessions));
    }
  }

  async function getUserSubscription() {
    let result;

    try {
      result = await Subscription.get();
    } catch (err) {
      throw err;
    }
    if (result) {
      store.dispatch(actions.user.setSubscription(result))
    }
  }

  async function getProducts() {
    let result;

    try {
      result = await Subscription.getProducts();
    } catch (err) {
      log.warn("Error fetching stripe subscription ", err);
    }

    if (result) {
      store.dispatch(actions.products.set(result));
    }
  }

  useEffect(() => {
    log.debug("MILESTONES:: session history", sessions);
    let all = getAllMilestones(sessions, currentUser);
    store.dispatch(actions.milestone.setHits(all));
  }, [sessions]);

  useEffect(() => {
    document.title="Indoorphins.fit";
    Firebase.addListener(listener);

    return function() {
      Firebase.clearListeners();
    }
  });

  useEffect(() => {
    getProducts();
  }, []);

  useEffect(() => {
    if (currentUser.id) {
      getUserSchedule(currentUser.id);
      getUserSessions();
      getUserSubscription();
    }
  }, [currentUser]);

  return (
    <Elements stripe={stripePromise}>
      <AppTheme>
        <Notification />
        <Feedback />
        <Routes />
      </AppTheme>
    </Elements>
  );
}
