import React, { useContext, useEffect } from 'react';
import { Switch, Route } from 'react-router-dom';
import { useHistory } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { AppStateContext } from './App';
import InstructorView from './Views/InstructorView';
import ParticipantView from './Views/ParticipantView';
import _isEmpty from 'lodash/isEmpty';
import Profile from './Classes/Profile';
import ProfileView from './Views/ProfileView';
import isEmpty from 'lodash/isEmpty';
import ClassView from './Views/ClassView';
import Firebase from './Controllers/Firebase';
import { loginUser } from './Controllers/UsersController';

// Router for pages accessed once user's Profile is loaded
const AuthRouter = (props) => {
	const history = useHistory();
	const [cookies, setCookie] = useCookies('profile');
	const { state, dispatch } = useContext(AppStateContext);

	// grab and store user info into state
	useEffect(() => {
		if (_isEmpty(state.myProfile)) {
			// Grab firebase user
			Firebase.getToken().then((token) => {
				// fetch user from back end and store in state
				console.log('Got firebase token - ', token);
				loginUser(token).then((response) => {
					console.log('Got user from backend ', response);
					dispatch({
						type: 'updateProfile',
						payload: response.data,
					});
					// TODO construct user?
				});
			});
		} else {
			// Send them to login page
			history.push('/login');
		}
	}, [state.myProfile]);

	return (
		<Switch>
			<Route path='/profile' component={ProfileView} />
			<Route path='/instructor' component={InstructorView} />
			<Route exact path='/classes' component={ParticipantView} />
			<Route path='/class' component={ClassView} />
		</Switch>
	);
};

export default AuthRouter;
