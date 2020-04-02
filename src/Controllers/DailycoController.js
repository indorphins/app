const fetch = require('node-fetch');
const dailyCoUrl = 'https://api.daily.co';
const DAILY_CO_SERVER_DOMAIN = 'http://localhost:3001/dailco';
// process.env.REACT_APP_AWS_SERVER_DOMAIN + '/dailyco';

// create room properties are { name: '', privacy: '', properties: {} }
async function createRoom(properties) {
	const options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(properties)
	};
	const url = DAILY_CO_SERVER_DOMAIN + '/room';
	return fetch(url, options)
		.then(response => {
			return response.json();
		})
		.then(result => {
			return result;
		})
		.catch(e => {
			console.log('ERROR is ', e);
		});
}

// get room by name
async function getRoom(name) {
	const options = {
		method: 'GET'
	};
	const url = DAILY_CO_SERVER_DOMAIN + '/room?name=' + name;
	return fetch(url, options)
		.then(response => {
			return response.json();
		})
		.then(result => {
			return result;
		})
		.catch(e => {
			console.log('ERROR is ', e);
		});
}

async function deleteRoom(name) {
	const options = {
		method: 'DELETE'
	};
	const url = DAILY_CO_SERVER_DOMAIN + '/room?name=' + name;
	return fetch(url, options)
		.then(response => {
			return response.json();
		})
		.then(result => {
			return result;
		})
		.catch(e => {
			console.log('ERROR is ', e);
		});
}

// create a token with input properties
async function createToken(properties) {
	const options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(properties)
	};
	const url = DAILY_CO_SERVER_DOMAIN + '/token';
	return fetch(url, options)
		.then(response => {
			return response.json();
		})
		.then(result => {
			return result;
		})
		.catch(e => {
			console.log('ERROR is ', e);
		});
}

module.exports = {
	createRoom: createRoom,
	createToken: createToken,
	getRoom: getRoom,
	deleteRoom: deleteRoom
};
