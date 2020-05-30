import config from '../config';
import log from '../log';

import Firebase from '../Firebase'

const url = config.host + '/user/';

async function callAPI(url, options) {

	let token;

	try {
		log.debug("API:: fetch firbase token")
		token = await Firebase.getToken();
	} catch(err) {
		return log.error("AUTH:: error fetching firebase token", err);
	}

	if (!token) {
		return null;
	}

	options.headers.Authorization = `Bearer ${token}`;

	log.info("API:: request", url, options);

	return fetch(url, options)
		.then((response) => {
			log.info("API:: response status code", response.status);
			return response.json();
		})
		.then((data) => {
			return data;
		})
		.catch((error) => {
			log.error("API:: response", url, error);
			throw error;
		});
};

/**
 * Create a new user. Requires a valid firebase token.
 * @param {string} firstName
 * @param {string} lastName 
 * @param {string} email 
 * @param {string} phone
 */
export async function create(username, firstName, lastName, email, phone) {

	let properties = {
		username: username,
		first_name: firstName,
		last_name: lastName,
		email: email,
	};

	if (phone) {
		properties.phone_number = phone;
	}

	let options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(properties),
	}

	return callAPI(url, options);
}

/**
 * Delete a user record from the database. Requires valid firebase token.
 * @param {string} token
 */
export async function remove() {

	let options = {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
		},
	};

	return callAPI(url, options);
}

/**
 * Get current user data. Requires valid firebase token.
 * @param {string} token - deprecated
 */
export async function get() {

	let options = {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
	};

	return callAPI(url, options);
}

/**
 * Patch the current user's metadata. Requires a valid firebase token.
 * @param {*} id - deprecated
 */
export async function update(userData) {

	let options = {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(userData),
	};

	return callAPI(url, options);
}
