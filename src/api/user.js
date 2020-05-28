import config from '../config';
import firebase from '../Firebase';

const url = config.host + '/user/';

/**
 * Create a new user. Requires a valid firebase token.
 * @param {string} firstName
 * @param {string} lastName 
 * @param {string} email 
 * @param {string} phone
 */
export async function createUser(firstName, lastName, email, phone) {

	let token;

	try {
		token = firebase.getToken();
	} catch (e) {
		console.error(e);
		throw e;
	}

	const properties = {
		first_name: firstName,
		last_name: lastName,
		email: email,
		phone_number: phone,
	};

	const options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify(properties),
	}

	return fetch(url, options)
		.then((response) => {
			return response.json();
		})
		.catch((error) => {
			console.error('UsersController - createUser - Error is ', error);
			throw error;
		});
}

/**
 * Delete a user record from the database. Requires valid firebase token.
 * @param {string} id - Deprecated 
 */
export async function deleteUser(id) {

	let token;

	try {
		token = firebase.getToken();
	} catch (e) {
		console.error(e);
		throw e;
	}

	const options = {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
	};

	return fetch(url, options)
		.then((response) => {
			return response.json();
		})
		.then((result) => {
			return result;
		})
		.catch((error) => {
			console.log('UsersController - deleteUser - Error is ', error);
			throw error;
		});
}

/**
 * Get current user data. Requires valid firebase token.
 * @param {string} token - deprecated
 */
export async function getUser(token) {

	let token;

	try {
		token = firebase.getToken();
	} catch (e) {
		console.error(e);
		throw e;
	}

	const options = {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
	};

	return fetch(url, options)
		.then((response) => {
			return response.json();
		})
		.then((result) => {
			return result;
		})
		.catch((error) => {
			console.log('UsersController - getUser - Error is ', error);
			throw error;
		});
}

/**
 * Patch the current user's metadata. Requires a valid firebase token.
 * @param {*} id - deprecated
 */
export async function updateUser(id) {

	let token;

	try {
		token = firebase.getToken();
	} catch (e) {
		console.error(e);
		throw e;
	}

	const options = {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
	};

	const url = config.host + `/users/getClass`;

	return fetch(url, options)
		.then((response) => {
			return response.json();
		})
		.then((result) => {
			return result;
		})
		.catch((error) => {
			console.log('UsersController - updateUser - Error is ', error);
			throw error;
		});
}

export async function scheduleClassForId(c, token) {

	let token;

	try {
		token = firebase.getToken();
	} catch (e) {
		console.error(e);
		throw e;
	}

	const options = {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify(c),
	};

	const url = config.host + `/users/addClass`;

	return fetch(url, options)
		.then((result) => {
			console.log('UsersController - scheduleClassForId success: ', result);
			return result;
		})
		.catch((error) => {
			console.log('UsersController - scheduleClassForId error: ', error);
			throw error;
		});
}

export async function getScheduledClassesForUser(token) {
	const options = {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
	};

	const url = config.host + `/users/getScheduledClasses`;

	return fetch(url, options)
		.then((result) => {
			console.log(
				'UsersController - getScheduledClassesForId success: ',
				result
			);
			return result;
		})
		.catch((error) => {
			console.log('UsersController - getScheduledClassesForId error: ', error);
			throw error;
		});
}
