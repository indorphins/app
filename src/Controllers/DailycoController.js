//TODO move this to server side
var request = require('request');
const dailyCoUrl = 'https://api.daily.co';

// create room properties are { name: '', privacy: '', properties: {} }
async function createRoom(properties) {
	try {
		var url = dailyCoUrl + '/v1/rooms';
		var body = properties;

		var options = {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
				authorization: `Bearer C9dc8ed6d58c6e656319cd7bb105f36057c598d3d8d613adc14344c6b7a4cb7c`
			},
			body: JSON.stringify(body)
		};

		const response = await fetch(url, options);
		const json = await response.json();
		return json;
	} catch (e) {
		console.log('createRoom error: ', e);
		throw new Error(e);
	}
}

// get room by name
async function getRoom(name) {
	try {
		var url = dailyCoUrl + '/v1/rooms/' + name;

		var options = {
			method: 'GET',
			headers: {
				'content-type': 'application/json',
				authorization: `Bearer C9dc8ed6d58c6e656319cd7bb105f36057c598d3d8d613adc14344c6b7a4cb7c`
			}
		};

		const response = await fetch(url, options);
		const json = await response.json();
		console.log('GET ROOM returned - ', json);
		return json;
	} catch (e) {
		console.log('getRoom error: ', e);
		throw new Error(e);
	}
}

async function deleteRoom(properties) {}

// create a token with input properties
async function createToken(properties) {
	try {
		var url = dailyCoUrl + '/v1/meeting-tokens';
		var body = { properties: properties };

		var options = {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
				authorization: `Bearer C9dc8ed6d58c6e656319cd7bb105f36057c598d3d8d613adc14344c6b7a4cb7c`
			},
			body: JSON.stringify(body)
		};

		const response = await fetch(url, options);
		const json = await response.json();
		return json;
	} catch (e) {
		console.log('createToken error: ', e);
		throw new Error(e);
	}
}

module.exports = {
	createRoom: createRoom,
	createToken: createToken,
	getRoom: getRoom
};
