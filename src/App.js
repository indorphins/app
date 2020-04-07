import React, { createContext, useEffect, useReducer } from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import Landing from './Views/Landing';
import InstructorView from './Views/InstructorView';
import ParticipantView from './Views/ParticipantView';
import AppReducer from './Reducers/AppReducer';
import LoginView from './Views/LoginView';
import SignupView from './Views/SignupView';

export const AppStateContext = createContext({
	state: {},
	setState: () => {},
});

const App = () => {
	// setup initial state
	const [state, dispatch] = useReducer(AppReducer, {
		classes: {},
		myCallFrame: {},
		myProfile: {},
		inClass: false,
	});

	// fetch cookies - only render state change on profile for now
	const [cookies, setCookies] = useCookies('profile');

	console.log('DOMAIN - ', process.env.REACT_APP_AWS_SERVER_DOMAIN);
	console.log('ENV VARS- ', process.env);

	useEffect(() => {
		console.log('App - cookies are ', cookies);
		if (cookies.profile) {
			dispatch({
				type: 'updateProfile',
				payload: cookies.profile,
			});
		}
	}, []);

	return (
		<AppStateContext.Provider value={{ state, dispatch }}>
			<Router>
				<Switch>
					<Route path='/instructor' component={InstructorView} />
					<Route path='/classes' component={ParticipantView} />
					<Route path='/login' component={LoginView} />
					<Route path='/register' component={SignupView} />
					<Route path='/' component={Landing} />
				</Switch>
			</Router>
		</AppStateContext.Provider>
	);
};

export default App;
