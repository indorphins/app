import React, { useContext, useEffect } from 'react';
import { Switch, Route } from 'react-router-dom';
import { useHistory } from 'react-router-dom';
import { AppStateContext } from './App';
import _isEmpty from 'lodash/isEmpty';
import Firebase from './actions/Firebase';

// Router for pages accessed once user's Profile is loaded
const AuthRouter = (props) => {
	const history = useHistory();
	const { state, dispatch } = useContext(AppStateContext);

	// grab and store user info into state
	useEffect(() => {
		if (_isEmpty(state.myProfile)) {
			// Grab firebase user
			Firebase.getToken().then((token) => {
				// fetch user from back end and store in state
				console.log('Got firebase token - ', token);
				// TODO: fetch user from API call
			});
		} else {
			// Send them to login page
			history.push('/login');
		}
	}, [state.myProfile]);

	return (
		<Switch>
			<Route path='/profile' component={} />
			<Route exact path='/' component={} />
			<Route path='/class/:id' component={ClassView} />
		</Switch>
	);
};

export default AuthRouter;
