import React, { createContext, useState, useReducer } from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import Landing from './Views/Landing';
import InstructorView from './Views/InstructorView';
import ParticipantView from './Views/ParticipantView';
import AppReducer from './Reducers/AppReducer';

// export const ClassContext = createContext({
// 	classes: [],
// 	updateClasses: () => {}
// });

export const AppStateContext = createContext({
	state: {},
	setState: () => {}
});

const App = () => {
	// setup initial state
	const [state, dispatch] = useReducer(AppReducer, {
		classes: {}
	});

	return (
		<AppStateContext.Provider value={{ state, dispatch }}>
			<Router>
				<Switch>
					<Route path='/instructor'>
						<InstructorView />
					</Route>
					<Route path='/classes'>
						<ParticipantView />
					</Route>

					<Route path='/'>
						<Landing />
					</Route>
				</Switch>
			</Router>
		</AppStateContext.Provider>
	);
};

export default App;
