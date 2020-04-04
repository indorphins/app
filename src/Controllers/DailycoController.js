const DAILY_CO_SERVER_DOMAIN =
	process.env.REACT_APP_AWS_SERVER_DOMAIN + '/dailyco'; //'http://localhost:3001/dailco';

// create room properties are { name: '', privacy: '', properties: {} }
export async function createRoom(properties) {
	const options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(properties),
	};
	const url = DAILY_CO_SERVER_DOMAIN + '/room';
	console.log('*****');
	console.log('URL - ', url);
	console.log('options are ', options);
	return fetch(url, options)
		.then((response) => {
			return response.json();
		})
		.then((result) => {
			return result;
		})
		.catch((e) => {
			console.log('ERROR is ', e);
		});
}

// get room by name
export async function getRoom(name) {
	const options = {
		method: 'GET',
	};
	const url = DAILY_CO_SERVER_DOMAIN + '/room?name=' + name;
	return fetch(url, options)
		.then((response) => {
			return response.json();
		})
		.then((result) => {
			return result;
		})
		.catch((e) => {
			console.log('ERROR is ', e);
		});
}

export async function deleteRoom(name) {
	const options = {
		method: 'DELETE',
	};
	const url = DAILY_CO_SERVER_DOMAIN + '/room?name=' + name;
	return fetch(url, options)
		.then((response) => {
			return response.json();
		})
		.then((result) => {
			return result;
		})
		.catch((e) => {
			console.log('ERROR is ', e);
		});
}

// create a token with input properties
export async function createToken(properties) {
	const options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(properties),
	};
	const url = DAILY_CO_SERVER_DOMAIN + '/token';
	return fetch(url, options)
		.then((response) => {
			return response.json();
		})
		.then((result) => {
			return result;
		})
		.catch((e) => {
			console.log('ERROR is ', e);
		});
}
