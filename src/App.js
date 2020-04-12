import React, { createContext, useEffect, useReducer } from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import AppReducer from './Reducers/AppReducer';
import LoginView from './Views/LoginView';
import SignupView from './Views/SignupView';
import AuthRouter from './AuthRouter';
import Profile from './Classes/Profile';

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

	// testing
	// const [cookies, setCookie] = useCookies();

	// console.log('DOMAIN - ', process.env.REACT_APP_AWS_SERVER_DOMAIN);
	// console.log('ENV VARS- ', process.env);

	// useEffect(() => {
	// 	const p = new Profile('First', 'Last', 0, 1, 'email@test.co', '8004206969');
	// 	// console.log('App set test profile as ', p);
	// 	dispatch({
	// 		type: 'updateProfile',
	// 		payload: p,
	// 	});
	// 	setCookie('profile', p);
	// }, []);

	return (
		<AppStateContext.Provider value={{ state, dispatch }}>
			<Router>
				<Switch>
					{/* <Route component={AuthRouter} /> */}
					<Route exact path='/instructor' component={AuthRouter} />
					<Route exact path='/classes' component={AuthRouter} />
					<Route path='/profile' component={AuthRouter} />
					<Route path='/login' component={LoginView} />
					<Route path='/register' component={SignupView} />
					<Route path='/' component={LoginView} />
				</Switch>
			</Router>
		</AppStateContext.Provider>
	);
};

export default App;
