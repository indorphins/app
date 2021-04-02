import config from '../config';
import callAPI from './helper';

const url = config.host + '/message/';

export async function classJoined(datetime, classId, calendar) {
  let data = {
    class_date: datetime,
  };

  if (calendar) {
    data.cal_link = calendar;
  }

  const options = {
    method: 'POST',

    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  };

  const u = url + classId + '/joined';

  return callAPI(u, options, true);
}

export async function accountCreated(email, pw) {
  let data = {
    email: email,
    password: pw
  };

  const options = {
    method: 'POST',

    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  };

  const u = url + 'accountCreated';

  return callAPI(u, options, true);
}