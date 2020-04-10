import React from 'react';

// Will only have pages that can be accessed when logged in
const UserRouter = (props) => {
	useEffect(() => {
		console.log('I View start w/ profile ', state.myProfile);
		if (_isEmpty(state.myProfile)) {
			// Send them to login page
			console.log('return login');
			// window.location = '/login'; USE HISTORY
		}
	}, [state.myProfile, cookies.profile]);

	return (
		<Router>
			<Switch>
				<Route path='/instructor' component={InstructorView} />
				<Route path='/classes' component={ParticipantView} />
			</Switch>
		</Router>
	);
};

export default RouUserRouterter;
