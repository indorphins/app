import { getISOWeek } from 'date-fns';
import log from '../../log';

function getClasses(sessions, user) {
  return sessions.filter(session => {
    return session.users_joined && session.users_joined.includes(user.id) &&
    session.instructor_id !== user.id;
  });
}

function getClassWeeks(sessions, user) {
  let items = getClasses(sessions, user);
  
  return items.map(item => {
    return getISOWeek(new Date(item.start_date));
  });
}

function getWeeklyStreak(sessions, user) {
  let list = getClassWeeks(sessions, user);
  let prev;
  let streak = 0;
  let prevStreak = 0;

  log.debug("classes by week", list);

  list.forEach(item => {

    if (!prev || prev - item === 1 || item - prev === 51) {
      streak = streak + 1;
    } else if (prev - item === 0) {
      // do nothing in the case class was on the same day
    } else {
      prevStreak = Number(streak);
      streak = 1;
    }

    prev = item;
  });

  if (prevStreak > streak) {
    return prevStreak;
  }
  
  return streak;
}

export default function(sessions, user) {
  let streak = getWeeklyStreak(sessions, user);

  let data = {
    title: 'Back to back',
    label: 'Take classes 2 weeks in a row',
    max: 2,
    value: streak,
  };

  if (streak > 2) {
    data.title = 'Fivepeat';
    data.label = 'Take classes 5 weeks in a row';
    data.max = 5;
  }

  if (streak > 5) {
    data.title = '10 Weeks? you wild';
    data.label = "You're a real one. Go for 10 weeks in a row";
    data.max = 10;
  } 

  if (streak >= 10) {
    data.value = 10
  }

  return data;
}