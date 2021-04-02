import config from '../config';
import callAPI from './helper';

const url = config.host + '/user/';

/**
 * Create a new user. Requires a valid firebase token.
 * @param {string} firstName
 * @param {string} lastName 
 * @param {string} email 
 * @param {string} phone
 */
export async function create(username, firstName, lastName, email, phone, birthday, firebaseUid) {

  let properties = {
    username: username,
    first_name: firstName,
    last_name: lastName,
    email: email,
    birthday: birthday
  };

  if (firebaseUid) {
    properties.firebase_uid = firebaseUid;
  }

  if (phone) {
    properties.phone_number = phone;
  }

  let options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(properties),
  }

  return callAPI(url, options, true);
}

/**
 * Delete a user record from the database. Requires valid firebase token.
 * @param {string} token
 */
export async function remove() {

  let options = {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  return callAPI(url, options, true);
}

/**
 * Get current user data. Requires valid firebase token.
 * @param {string} token - deprecated
 */
export async function get() {

  let options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  return callAPI(url, options, true);
}

/**
 * Patch the current user's metadata. Requires a valid firebase token.
 * @param {*} id - deprecated
 */
export async function update(userData) {

  let options = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  };

  return callAPI(url, options, true);
}

/**
 * Creates a refer a friend campaign for the logged in user
 */
export async function referFriend() {
  let options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const u = url + 'referFriend';

  return callAPI(u, options, true);
}