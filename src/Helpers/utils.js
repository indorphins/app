const findGetParameter = (parameterName) => {
	var result = null,
		tmp = [];
	var items = window.location.search.substr(1).split('&');
	for (var index = 0; index < items.length; index++) {
		tmp = items[index].split('=');
		if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
	}
	return result;
};

const getRandomInt = (max) => {
	return Math.floor(Math.random() * Math.floor(max));
};

const getExpiryHoursFromNow = (hours) => {
	const date = new Date();
	date.setTime(date.getTime() + hours * 60 * 60 * 1000);
	return date;
};

const formatPhone = (phone) => {
	if (phone.length !== 10) {
		console.log('formatPhone - Phone must be 10 digits to format');
		return phone;
	}
	return `${phone.slice(0, 3)}-${phone.slice(3, 6)}-${phone.slice(6, 10)}`;
};

module.exports = {
	findGetParameter: findGetParameter,
	getRandomInt: getRandomInt,
	getExpiryHoursFromNow: getExpiryHoursFromNow,
	formatPhone: formatPhone,
};
