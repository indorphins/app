function findGetParameter(parameterName) {
	var result = null,
		tmp = [];
	var items = window.location.search.substr(1).split('&');
	for (var index = 0; index < items.length; index++) {
		tmp = items[index].split('=');
		if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
	}
	return result;
}

function getRandomInt(max) {
	return Math.floor(Math.random() * Math.floor(max));
}

module.exports = {
	findGetParameter: findGetParameter,
	getRandomInt: getRandomInt
};
