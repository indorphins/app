import config from '../config';
import callAPI from './helper';

const url = config.host + '/campaign';

export async function get(id) {

  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const u = url + `/id/${id}`;

  return callAPI(u, options, false);
}