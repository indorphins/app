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

	const url = process.env.REACT_APP_AWS_SERVER_DOMAIN + '/users';

	return fetch(url, options)
		.then((response) => {
			return response.json();
		})
		.catch((error) => {
			console.log('UsersController - createUser - Error is ', error);
			throw error;
		});
}

export async function deleteUser(id) {
	const options = {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
		},
	};

	const url = process.env.REACT_APP_AWS_SERVER_DOMAIN + `/users/${id}`;

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

export async function getAllUsers() {
	const options = {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
	};

	const url = process.env.REACT_APP_AWS_SERVER_DOMAIN + `/users`;

	return fetch(url, options)
		.then((response) => {
			return response.json();
		})
		.then((result) => {
			return result;
		})
		.catch((error) => {
			console.log('UsersController - getAllUsers - Error is ', error);
			throw error;
		});
}

export async function loginUser(email, password) {
	const properties = {
		email: email,
		password: password,
	};
	const options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(properties),
	};

	const url = process.env.REACT_APP_AWS_SERVER_DOMAIN + '/users/login';

	return fetch(url, options)
		.then((response) => {
			return response.json();
		})
		.catch((error) => {
			console.log('UsersController - createUser - Error is ', error);
			throw error;
		});
}

export async function getUser(id) {
	const options = {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
	};
	const url = process.env.REACT_APP_AWS_SERVER_DOMAIN + `/users/user/${id}`;

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

export async function updateUser(id) {
	const options = {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
		},
	};

	const url = process.env.REACT_APP_AWS_SERVER_DOMAIN + `/users/update/${id}`;

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

export async function scheduleClassForId(c, id) {
	const options = {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(c),
	};
	const url = process.env.REACT_APP_AWS_SERVER_DOMAIN + `/users/addClass/${id}`;
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

export async function getScheduledClassesForId(id) {
	const options = {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
	};
	const url =
		process.env.REACT_APP_AWS_SERVER_DOMAIN +
		`/users/getScheduledClasses/${id}`;
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
