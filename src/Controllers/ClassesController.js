// TODO add duration
export const createClass = async (
	status,
	instructor_id,
	instructor_name,
	chat_room_name,
	total_spots
) => {
	const body = {
		status: status,
		instructor_id: instructor_id,
		instructor_name: instructor_name,
		chat_room_name: chat_room_name,
		total_spots: total_spots,
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
		return response.json();
	} catch (error) {
		console.log('ClassesController - createClass - error: ', error);
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
		return response.json();
	} catch (error) {
		console.log('ClassesController - createClass - error: ', error);
	}
};
