import config from '../config';
import callAPI from './helper';

const url = config.host + '/milestone';

/**
 * Update user's milestone using class data
 * @param {String} classId
 */
export async function update(classId) {

  let options = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  let u = url + `/${classId}`;

  return callAPI(u, options, true);
}

/**
 * Fetches a user's milestone
 */
export async function get() {
  let options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  let u = url;

  return callAPI(u, options, true);
}