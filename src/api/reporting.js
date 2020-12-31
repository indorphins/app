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

/**
 * Fetch instructor reports from newest to oldest
 */
export async function getInstructors() {
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  }

  const u = url + '/instructor';

  return callAPI(u, options, true);
}

/**
 * Get instructor payouts for date range
 * @param {Date} startDate 
 * @param {Date} endDate 
 */
export async function getPayouts(startDate, endDate) {
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  }

  const s = startDate.toISOString();
  const e = endDate.toISOString();

  const u = url + '/payouts/' + s + '/' + e;

  return callAPI(u, options, true);
}