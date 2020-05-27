const host = "https://dev.api.indorphins.com";

export const createClass = async (
	status,
	instructor_name,
	chat_room_name,
	total_spots,
	user_type,
	user_id,
	duration,
	start_time,
	instructor_img
) => {
	const body = {
		status: status,
		instructor_name: instructor_name,
		chat_room_name: chat_room_name,
		total_spots: total_spots,
		user_type: user_type,
		user_id: user_id,
		duration: duration,
		start_time: start_time,
		instructor_img: instructor_img,
	};
	const options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(body),
	};
	const url = host + '/classes';

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
	const url = host + '/classes';

	try {
		const response = await fetch(url, options);
		console.log('ClassesController - getClasses - success');
		return response.json();
	} catch (error) {
		console.log('ClassesController - createClass - error: ', error);
		throw error;
	}
};

export const getAllScheduledClasses = async () => {
	const options = {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
	};
	const url = host + '/classes/scheduled';

	try {
		const response = await fetch(url, options);
		console.log('ClassesController - getClasses - success');
		return response.json();
	} catch (error) {
		console.log('ClassesController - createClass - error: ', error);
		throw error;
	}
};

export const cancelClass = async (class_id) => {
	const options = {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
		},
	};
	const url =
		host + '/classes/cancel/' + class_id;
	try {
		const response = await fetch(url, options);
		console.log('ClassesController - endClass - success');
		return response.json();
	} catch (error) {
		console.log('ClassesController - endClass - error: ', error);
		throw error;
	}
};
