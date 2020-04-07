const USERS_DOMAIN = process.env.REACT_APP_AWS_SERVER_DOMAIN + '/users';

export async function createUser(properties) {
	const options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(properties),
	};

	return fetch(USERS_DOMAIN, options)
		.then((response) => {
			return response.json();
		})
		.then((result) => {
			return result;
		})
		.catch((e) => {
			console.log('UsersController - createUser - Error is ', e);
		});
}

export async function deleteUser(id) {
	const options = {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(properties),
	};

	const url = USERS_DOMAIN + `?id=${id}`;

	return fetch(url, options)
		.then((response) => {
			return response.json();
		})
		.then((result) => {
			return result;
		})
		.catch((e) => {
			console.log('UsersController - deleteUser - Error is ', e);
		});
}

export async function getAllUsers(properties) {
	const options = {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(properties),
	};

	return fetch(USERS_DOMAIN, options)
		.then((response) => {
			return response.json();
		})
		.then((result) => {
			return result;
		})
		.catch((e) => {
			console.log('UsersController - getAllUsers - Error is ', e);
		});
}

export async function getUser(id) {
	const options = {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(properties),
	};
	const url = USERS_DOMAIN + `?id=${id}`;

	return fetch(url, options)
		.then((response) => {
			return response.json();
		})
		.then((result) => {
			return result;
		})
		.catch((e) => {
			console.log('UsersController - getUser - Error is ', e);
		});
}

export async function updateUser(id) {
	const options = {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(properties),
	};

	const url = USERS_DOMAIN + `?id=${id}`;

	return fetch(url, options)
		.then((response) => {
			return response.json();
		})
		.then((result) => {
			return result;
		})
		.catch((e) => {
			console.log('UsersController - updateUser - Error is ', e);
		});
}
