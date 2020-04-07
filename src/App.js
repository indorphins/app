import React, { createContext, useEffect, useReducer } from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
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

	// TODO store and load local storage correctly
	// useEffect(() => {
	// 	console.log('App Use Effect for local storage');
	// 	if (window.localStorage.getItem('myProfile')) {
	// 		console.log(
	// 			'I have local storage myProfile! ',
	// 			window.localStorage.getItem('myProfile')
	// 		);
	// 		dispatch({
	// 			type: 'updateProfile',
	// 			payload: window.localStorage.getItem('myProfile')
	// 		});
	// 	}
	// 	if (window.localStorage.getItem('inClass')) {
	// 		console.log(
	// 			'I have local storage inClass! ',
	// 			window.localStorage.getItem('inClass')
	// 		);
	// 		dispatch({
	// 			type: 'updateInClass',
	// 			payload: window.localStorage.getItem('inClass')
	// 		});
	// 	}
	// 	console.log('profile is ', JSON.stringify(state.myProfile));
	// }, []);

	return (
		<AppStateContext.Provider value={{ state, dispatch }}>
			<Router>
				<Switch>
					<Route path='/instructor' component={InstructorView} />
					<Route path='/classes' component={ParticipantView} />
					<Route path='/login' component={LoginView} />
					<Route path='/register' component={SignupView} />
					<Route path='/' component={LoginView} />
				</Switch>
			</Router>
		</AppStateContext.Provider>
	);
};

export default App;
