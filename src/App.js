import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

import AppTheme from './styles';
import log from './log';
import Firebase from './Firebase';
import Routes from './routes/index';
import * as User from './api/user';
import { store, actions } from './store';
import config from './config'

const getUserSelector = createSelector([(state) => state.user.data], (user) => {
  return user;
});

const stripePromise = loadStripe(config.stripe_public_key);

export default function App() {
  const currentUser = useSelector((state) => getUserSelector(state));

  async function listener(firebaseUserData) {
    // user logged out or session expired
    if (!firebaseUserData) {
      log.debug('AUTH:: firebase user null');
      if (currentUser.id) {
        await store.dispatch(actions.user.clear());
      }
      return;
    }

    log.debug('AUTH:: got firebase user data', firebaseUserData);
    let user;

    // try to fetch indorphins user data
    try {
      user = await User.get();
    } catch (err) {
      return log.error('AUTH:: Call User.get', err);
    }

    if (user && user.data) {
      log.debug('AUTH:: got indorphins user data', user.data);

      try {
        return await store.dispatch(actions.user.set(user.data));
      } catch (err) {
        return log.error('AUTH:: save user to store', err);
      }
    }

    // TODO: if we don't have a user then we should redirect to the signup flow to get a username
    // before creating the user but for now we will just auto populate the username
    let firstname = firebaseUserData.displayName.split(' ')[0];
    let lastname = firebaseUserData.displayName.split(' ')[1];

    try {
      user = await User.create(
        firebaseUserData.displayName,
        firstname,
        lastname,
        firebaseUserData.email,
        firebaseUserData.phoneNumber
      );
    } catch (err) {
      return log.warn(
        'AUTH:: error creating user account from firebase token',
        err
      );
    }

    if (!user.data) {
      return log.warn('AUTH:: user creation failed');
    }

    log.debug(
      'AUTH:: user automatically created from firebase login',
      user.data
    );

    try {
      await store.dispatch(actions.user.set(user.data));
    } catch (err) {
      return log.error('AUTH:: save user to store', err);
    }
  }

  useEffect(() => {
    Firebase.clearListeners();
    Firebase.addListener(listener);
  });

  return (
    <Elements stripe={stripePromise}>
      <AppTheme>
        <BrowserRouter>
          <Routes />
        </BrowserRouter>
      </AppTheme>
    </Elements>
  );
}
