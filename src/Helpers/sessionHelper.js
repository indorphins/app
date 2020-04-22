/**
 * creates a key/value pair in session storage w/ key and stringified storeMe value
 * @param {string} key
 * @param {*} storeMe
 */
export const storeInSession = (key, storeMe) => {
	console.log('Store in session : ', key, storeMe);
	sessionStorage.setItem(key, JSON.stringify(storeMe));
};

/**
 * Returns the parsed value stored in session at key or false if key not found
 * @param {string} key
 */
export const getFromSession = (key) => {
	const value = sessionStorage.getItem(key);
	if (!value || value === 'undefined') {
		// console.log('got nothing @ ', key);
		return false;
	} else {
		// console.log('Get from session: ', JSON.parse(value));

		return JSON.parse(value);
	}
};

export const removeItemFromSession = (key) => {
	console.log('remove from session: ', key);
	sessionStorage.removeItem(key);
};

// TODO make helpers for each session key
