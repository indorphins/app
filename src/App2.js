import React, { createContext, useState } from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import Landing from './Views/Landing';
import InstructorView from './Views/InstructorView';

export const ClassContext = createContext({
	classes: [],
	updateClasses: () => {}
});

const App = () => {
	const [classes, setClasses] = useState([]);

	const updateClasses = c => {
		setClasses([...classes, c]);
	};

	return (
		<ClassContext.Provider value={{ classes, updateClasses }}>
			<Router>
				<Switch>
					<Route path='/instructor'>
						<InstructorView />
					</Route>
					{/* <Route path='/classes'>
						<Home />
					</Route> */}

					<Route path='/'>
						<Landing />
					</Route>
				</Switch>
			</Router>
		</ClassContext.Provider>
	);
};

export default App;
