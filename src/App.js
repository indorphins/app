import React from 'react';
import { BrowserRouter} from 'react-router-dom';

import Firebase from './Firebase';
import Routes from './routes/index';

import { store, actions } from './store';

export default function App() {

	async function listener(user) {
		console.log("got firebase user in listener", user);

		let token;

		try {
			token = await Firebase.getToken();
		} catch(err) {
			console.error(err);
		}

		let result;
		try {
			result = await store.dispatch(actions.session.setToken(token));
		} catch (err) {
			console.error(err);
		}

		console.log(result);
	}

	Firebase.addListener(listener)

	let user = Firebase.getUser();

	if (user) {
		console.log("got firebase user", user);
	}



	return (
		<BrowserRouter>
			<Routes />
		</BrowserRouter>
	);
};
