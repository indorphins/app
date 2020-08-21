import config from '../config';
import callAPI from './helper';

const url = config.host + '/session';

/**
 * Updates the session object with data
 * @param {String} classId
 */
export async function update(classId, sessionId, data) {

  let options = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  };
  
  let u = url + `/${classId}/${sessionId}`;

  return callAPI(u, options, true);
}

/**
 * Fetches the session
 */
export async function get(classId, sessionId) {
  let options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  let u = url + `/${classId}/${sessionId}`;

  return callAPI(u, options, true);
}

/**
 * Deletes a session
 */
export async function remove(classId, sessionId) {
  let options = {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  let u = url + `/${classId}/${sessionId}`;

  return callAPI(u, options, true);
}

/**
 * Creates a new session with instructorId and startDate
 */
export async function create(classId, sessionId, data) {
  let options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  };
  
  let u = url + `/${classId}/${sessionId}`;

  return callAPI(u, options, true);
}

/**
 * Fetches all the class sessions the user was apart of
 */
export async function getAll() {
  let options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  let u = url;

  return callAPI(u, options, true);
}