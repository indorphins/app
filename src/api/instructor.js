import config from '../config';
import callAPI from './helper';

const url = config.host + '/instructor/';

/**
 * Get current user data. Requires valid firebase token.
 * @param {string} token - deprecated
 */
export async function getAll(limit, page) {

	let options = {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
  };
  
  let u = url;

  if (limit) {
    u = u + "?limit=" + limit;
  }

  if (page) {
    u = u + "?page=" + page;
  }

	return callAPI(u, options, false);
}