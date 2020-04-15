// TODO add duration
export const createClass = async (
	status,
	instructor_name,
	chat_room_name,
	total_spots,
	user_type,
	user_id
) => {
	const body = {
		status: status,
		instructor_name: instructor_name,
		chat_room_name: chat_room_name,
		total_spots: total_spots,
		user_type: user_type,
		user_id: user_id,
	};
	const options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(body),
	};
	const url = process.env.REACT_APP_AWS_SERVER_DOMAIN + '/classes';

	try {
		const response = await fetch(url, options);
		console.log('ClassesController - createClass - success');
		return response.json();
	} catch (error) {
		console.log('ClassesController - createClass - error: ', error);
		throw error;
	}
};

export const getClasses = async () => {
	const options = {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
	};
	const url = process.env.REACT_APP_AWS_SERVER_DOMAIN + '/classes';

	try {
		const response = await fetch(url, options);
		console.log('ClassesController - getClasses - success');
		return response.json();
	} catch (error) {
		console.log('ClassesController - createClass - error: ', error);
		throw error;
	}
};

export const endClass = async (class_id) => {
	const options = {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			class_id: class_id,
		}),
	};
	const url = process.env.REACT_APP_AWS_SERVER_DOMAIN + '/classes';
	try {
		const response = await fetch(url, options);
		console.log('ClassesController - endClass - success');
		return response.json();
	} catch (error) {
		console.log('ClassesController - endClass - error: ', error);
		throw error;
	}
};
