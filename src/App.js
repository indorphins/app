import React, { createContext, useEffect, useReducer } from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import AppReducer from './Reducers/AppReducer';
import LoginView from './Views/LoginView';
import SignupView from './Views/SignupView';
import AuthRouter from './AuthRouter';
import OpentokView from './Views/OpentokView';

export const AppStateContext = createContext({
	state: {},
	setState: () => {},
});

const App = () => {
	// setup initial state
	const [state, dispatch] = useReducer(AppReducer, {
		classes: {},
		myProfile: {},
		myCallFrame: {},
	});

	return (
		<AppStateContext.Provider value={{ state, dispatch }}>
			<Router>
				<Switch>
					{/* <Route component={AuthRouter} /> */}
					<Route exact path='/videotest' component={OpentokView} />
					<Route exact path='/instructor' component={AuthRouter} />
					<Route exact path='/classes' component={AuthRouter} />
					<Route path='/class' component={AuthRouter} />
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
