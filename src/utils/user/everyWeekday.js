import { getDay } from 'date-fns';
import log from '../../log';

function getClasses(sessions, user) {
  return sessions.filter(session => {
    return session.users_joined && session.users_joined.includes(user.id) &&
    session.instructor_id !== user.id;
  });
}

function classDaysOfWeek(sessions, user) {
  let temp = getClasses(sessions, user);

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
    value: 0
  }

  if (days && days.length === 7) {
    data.value = 7;
  }
  
  if (days && days.length < 7) {
    data.value = days.length;
  }

  return data;
}