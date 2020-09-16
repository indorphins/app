import { getISOWeek, getYear } from 'date-fns';
import { GetClasses } from '../common';
import log from '../../../log';

function getClassWeeks(sessions, user) {
  let items = GetClasses(sessions, user);
  
  return items.map(item => {
    let d = new Date(item.start_date);
    return getISOWeek(d) + getYear(d);
  });
}

function getClassCountByWeek(sessions, user) {
  let items = getClassWeeks(sessions, user);
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

  let weeksCount = getClassCountByWeek(sessions, user)

  log.debug("classes by week counts", weeksCount);

  let count = weeksCount[0];

  let data = {
    title: 'Tri It',
    label: 'Take 3 classes in the same week',
    max: 3,
    value: 0,
    lvl: 0,
    type: "standard"
  }

  if (count) {
    data.value = count;

    if (count >= 3) {
      data.value = 3;
      data.lvl = "max"
    }
  }

  return data;
}