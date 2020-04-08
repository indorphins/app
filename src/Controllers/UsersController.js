const USERS_DOMAIN = process.env.REACT_APP_AWS_SERVER_DOMAIN;

export async function createUser(firstName, lastName, email, pw, phone, type) {
	const properties = {
		first_name: firstName,
		last_name: lastName,
		email: email,
		password: pw,
		phone_number: phone,
		user_type: type,
	};
	const options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(properties),
	};

	const url = process.env.REACT_APP_AWS_SERVER_DOMAIN + '/signup';

	return fetch(url, options)
		.then((response) => {
			return response.json();
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

export async function getAllUsers() {
	const options = {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
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

export async function loginUser(email, password) {
	const properties = {
		username: email,
		password: password,
	};
	const options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(properties),
	};

	const url = process.env.REACT_APP_AWS_SERVER_DOMAIN + '/login';

	return fetch(url, options)
		.then((response) => {
			return response.json();
		})
		.catch((e) => {
			console.log('UsersController - createUser - Error is ', e);
		});
}

export async function getUser(id) {
	const options = {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
	};
	const url = USERS_DOMAIN + `?id=${id}`;

	// '/profile  '

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
