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

/**
 * Fetches a report of all users and classes taken by users with 
 * the input domain in their emails
 * @param {String} domain 
 */
export async function getReportByDomain(domain) {
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  }

  const u = url + '/domain/' + domain;
  return callAPI(u, options, true);
}

/**
 * Fetches a report of a user and classes taken by the user with given email
 * @param {String} userEmail 
 */
export async function getReportByUserEmail(userEmail) {
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  }

  const u = url + '/user/' + userEmail;
  return callAPI(u, options, true);
}