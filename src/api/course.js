import config from '../config';
import callAPI from './helper';

const url = config.host + '/class/';

export async function create(data) {

	const options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(data),
	};

	return callAPI(url, options, true);
};

export async function query(filter, order) {
	const options = {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
	};

	return callAPI(url, options, false);
};

export async function get(id) {
	const options = {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
	};

	let u = url + "/" + id;

	return callAPI(u, options, true);
}

export async function remove(id) {
	const options = {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
		},
	};

	let u = url + "/" + id;

	return callAPI(u, options, true);
};

export async function update(id, data) {
	const options = {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(data),
	};

	let u = url + "/" + id;

	return callAPI(u, options, true);
}
