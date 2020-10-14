import config from '../config';
import callAPI from './helper';

const url = config.host + '/report';

/**
 * Fetch reports from newest to oldest
 */
export async function get() {
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  }

  return callAPI(url, options, true);
}