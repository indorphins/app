const host = "https://dev.api.indorphins.com";

export async function createUser(
	firstName,
	lastName,
	email,
	phone,
	type,
	firebaseUid
) {
	const properties = {
		first_name: firstName,
		last_name: lastName,
		email: email,
		phone_number: phone,
		user_type: type,
		firebase_uid: firebaseUid,
	};
	const options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(properties),
	};

	const url = host + '/users';

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

	const url = host + `/users/${id}`;

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

	const url = host + `/users`;

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

export async function loginUser(token) {
	const options = {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
	};

	console.log('TOKEN IS ', token);

	const url = host + '/users/login';

	return fetch(url, options)
		.then((response) => {
			return response.json();
		})
		.catch((error) => {
			console.log('UsersController - createUser - Error is ', error);
			throw error;
		});
}

export async function getUser(token) {
	const options = {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
	};
	const url = host + `/users/user`;

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

	const url = host + `/users/update/${id}`;

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
	const options = {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify(c),
	};
	const url = host + `/users/addClass`;
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

export async function getScheduledClassesForId(token) {
	const options = {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
	};
	const url =
		host + `/users/getScheduledClasses`;
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
