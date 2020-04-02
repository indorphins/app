import React, { createContext, useState, useReducer } from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import Landing from './Views/Landing';
import InstructorView from './Views/InstructorView';
import ParticipantView from './Views/ParticipantView';
import AppReducer from './Reducers/AppReducer';

export const AppStateContext = createContext({
	state: {},
	setState: () => {}
});

const App = () => {
	// setup initial state
	const [state, dispatch] = useReducer(AppReducer, {
		classes: {},
		myCallFrame: {},
		myProfile: {},
		inClass: false
	});

	return (
		<AppStateContext.Provider value={{ state, dispatch }}>
			<Router>
				<Switch>
					<Route path='/instructor' component={InstructorView} />
					<Route path='/classes' component={ParticipantView} />
					<Route path='/' component={Landing} />
				</Switch>
			</Router>
		</AppStateContext.Provider>
	);
};

export default App;
