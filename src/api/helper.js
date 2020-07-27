import Firebase from '../Firebase';
import log from '../log';

export default async function callAPI(url, options, sendToken) {

  if (sendToken) {
	  let token;

    try {
      log.debug("API:: fetch firbase token")
      token = await Firebase.getToken();
    } catch(err) {
      return log.error("AUTH:: error fetching firebase token", err);
    }

    if (!token) {
      return null;
    }

    options.headers.Authorization = `Bearer ${token}`;
  }

	log.info("API:: request", url, options);

	return fetch(url, options)
		.then((response) => {
			log.info("API:: response status code", response.status);
			if (response.status !== 201 && response.status !== 200) {
				return response.json().then(result => {

					if (result.message.raw && result.message.raw.message) {
						throw Error(result.message.raw.message);
					}

					throw Error(result.message);
				})
			}
			return response.json();
		})
		.then((data) => {
			return data;
		})
		.catch((error) => {
			log.error("API:: response", url, error);
			throw error;
		});
};