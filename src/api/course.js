import config from '../config';
import callAPI from './helper';

const url = config.host + '/class/';

export async function create(data) {

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  };

  return callAPI(url, options, true);
};

export async function query(filter, order, limit, page) {
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  let f = JSON.stringify(filter);
  f = btoa(f);

  let u = `${url}?filter=${f}`;

  if (order && typeof order === "object") {
    let o = JSON.stringify(order);
    o = btoa(o);
    u = `${u}&order=${o}`;
  }

  if (Number(limit)) {
    u = `${u}&limit=${limit}`
  }

  if (Number(page)) {
    u = `${u}&page=${page}`
  }

  return callAPI(u, options, false);
};

export async function get(id) {
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  let u = url + id;

  return callAPI(u, options, false);
}

export async function remove(id) {
  const options = {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  let u = url + id;

  return callAPI(u, options, true);
};

export async function update(id, data) {
  const options = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  };

  let u = url + id;

  return callAPI(u, options, true);
}

export async function addParticipant(id) {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    }
  };

  let u = url + id + "/participants";

  return callAPI(u, options, true);
}

export async function removeParticipant(id) {
  const options = {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    }
  };

  let u = url + id + "/participants";

  return callAPI(u, options, true);
}

export async function getSessionInfo(id) {
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  };

  let u = url + id + "/session";

  return callAPI(u, options, true);
}

/**
 * Takes in a 
 * @param {String} html 
 * @param {String} classId 
 */
export function sendClassEmail(html, id) {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      html: html
    })
  }

  let u = url + id + '/email';

  return callAPI(u, options, true);
}
