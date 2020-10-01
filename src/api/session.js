import config from '../config';
import callAPI from './helper';

const url = config.host + '/session';

/**
 * Updates the session object with data
 * @param {String} classId
 */
export async function update(classId, sessionId) {

  const options = {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  const u = url + `/${classId}/${sessionId}`;

  return callAPI(u, options, true);
}

/**
 * Fetches the session
 */
export async function get(classId, sessionId) {
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  const u = url + `/${classId}/${sessionId}`;

  return callAPI(u, options, true);
}

/**
 * Deletes a session
 */
export async function remove(classId, sessionId) {
  const options = {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  const u = url + `/${classId}/${sessionId}`;

  return callAPI(u, options, true);
}

/**
 * Creates a new session with instructorId and startDate
 */
export async function create(classId, sessionId, data) {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  };
  
  const u = url + `/${classId}/${sessionId}`;

  return callAPI(u, options, true);
}

/**
 * Fetches all the class sessions the user was apart of
 */
export async function getAll() {
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const u = url;

  return callAPI(u, options, true);
}

/**
 * Returns the opentok archive for the input sessionId
 * @param {String} sessionId 
 */
export async function fetchArchive(sessionId) {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ sessionId: sessionId })
  };

  const u = url + `/archive`; ///${sessionId}`;

  return callAPI(u, options, true);
}

/**
 * Returns the last 10 Sessions where the instructor was the input instructorId
 * @param {String} instructorId 
 */
export async function getInstructorSessions(instructorId) {
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  }

  const u = url + `/${instructorId}`;

  return callAPI(u, options, true);
}