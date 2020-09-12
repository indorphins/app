import { getDayOfYear } from 'date-fns';
import log from '../../log';

function getClasses(sessions, user) {
  return sessions.filter(session => {
    return session.users_joined && session.users_joined.includes(user.id) &&
    session.instructor_id !== user.id;
  });
}

function getDaysOfYear(sessions, user) {
  let items = getClasses(sessions, user);
  
  return items.map(item => {
    return getDayOfYear(new Date(item.start_date));
  });
}

function getClassCountByDay(sessions, user) {
  let items = getDaysOfYear(sessions, user);
  let total = {};
  let final = [];

  items.forEach(item => {
    if (!total[item]) {
      total[item] = 1;
    } else {
      total[item] += 1;
    }
  });

  for (const key in total) {
    final.push(total[key]);
  }

  return final.sort((a, b) => b - a);
}

export default function(sessions, user) {

  let classCount = getClassCountByDay(sessions, user);

  log.debug("class by day counts", classCount);

  let count = classCount[0];
  let data = {
    title: 'Double Down',
    label: 'Take 2 classes in 1 day',
    max: 2,
    value: 0,
    lvl: 0,
    type: "standard"
  }

  if (count) {
    data.value = count;

    /*if (count >= 2) {
      data.title = "Triple Play";
      data.label = "Take 3 classes in 1 day";
      data.max = 3;
    }*/

    if (count >= 2) {
      data.value = 2;
      data.lvl = "max";
    }
  }

  return data;
}