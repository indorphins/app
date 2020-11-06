import Firebase from '../Firebase';
import log from '../log';

export default async function callAPI(url, options, sendToken) {

  if (sendToken) {
    let token;

    try {
      //log.debug("API:: fetch firbase token")
      token = await Firebase.getToken();
    } catch(err) {
      log.error("AUTH:: error fetching firebase token", err);
      throw err;
    }

    if (!token) {
      return null;
    }

    options.headers.Authorization = `Bearer ${token}`;
  }

  log.info("API:: request", url, options);
  let status;

  return fetch(url, options)
  .then((response) => {
    log.info("API:: response status code", response.status);
    status = response.status;
    return response.json();
  })
  .then((data) => {

    if (status !== 201 && status !== 200) {
      if (data.message.raw && data.message.raw.message) {
        throw Error(data.message.raw.message);
      }

      throw Error(data.message);
    }

    return data;
  })
  .catch((error) => {
    log.error("API:: response", url, error);
    throw error;
  });
}