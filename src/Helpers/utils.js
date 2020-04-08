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

module.exports = {
	findGetParameter: findGetParameter,
	getRandomInt: getRandomInt,
	getExpiryHoursFromNow: getExpiryHoursFromNow,
};
