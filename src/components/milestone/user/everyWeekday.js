import { getDay } from 'date-fns';
import { GetClasses } from '../common';
import log from '../../../log';

function classDaysOfWeek(sessions, user) {
  let temp = GetClasses(sessions, user);

  let dayList = temp.map(item => {
    return getDay(new Date(item.start_date));
  });

  return Array.from(new Set(dayList))
}

export default function(sessions, user) {

  let days = classDaysOfWeek(sessions, user);

  log.debug("class days of week", days);

  let data = {
    title: 'Every Day',
    label: 'Take a class each day of the week',
    max: 7,
    value: 0,
    lvl: 0,
    type: "standard"
  }

  if (days && days.length === 7) {
    data.value = 7;
    data.lvl = "max";
  }
  
  if (days && days.length < 7) {
    data.value = days.length;
  }

  return data;
}