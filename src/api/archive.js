import config from '../config';
import callAPI from './helper';

const url = config.host + '/archive';

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

  return callAPI(url, options, true);
}

// Takes in a valid opentok session ID and starts the archive
export async function startArchive(sessionId) {
  const options = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    }
  }

  const u = url + `/${sessionId}`;

  return callAPI(u, options, true);
}

// Takes in a valid opentok archive ID and stops the archive
export async function stopArchive(archiveId) {
  const options = {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    }
  }

  const u = url + `/${archiveId}`;

  return callAPI(u, options, true);
}