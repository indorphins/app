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

// Router for pages accessed once user's Profile is loaded
const AuthRouter = (props) => {
	const history = useHistory();
	const [cookies, setCookie] = useCookies('profile');
	const { state, dispatch } = useContext(AppStateContext);

	useEffect(() => {
		if (_isEmpty(state.myProfile)) {
			if (!_isEmpty(cookies.profile) && cookies.profile !== 'undefined') {
				dispatch({
					type: 'updateProfile',
					payload: cookies.profile,
				});
			} else {
				// Send them to login page
				history.push('/login');
			}
		}
	}, [state.myProfile, cookies.profile]);

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
