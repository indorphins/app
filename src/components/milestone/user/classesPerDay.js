import { GetClasses, GetDaysOfYear } from '../common';
import log from '../../../log';

function getClassCountByDay(sessions, user) {
  let classes = GetClasses(sessions, user);
  let items = GetDaysOfYear(classes);
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