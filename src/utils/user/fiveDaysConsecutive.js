import { getDayOfYear } from 'date-fns';
import log from '../../log';

function getDaysOfYear(sessions) {
  return sessions.map(item => {
    return getDayOfYear(new Date(item.start_date));
  });
}

function getDailyStreak(sessions) {
  let list = getDaysOfYear(sessions);
  let prev;
  let streak = 0;
  let prevStreak = 0;

  log.debug("days of year list", list);

  list.forEach(item => {

    if (!prev) {
      streak = streak + 1;
    } else if (prev - item === 1 || item - prev === 364) {
      streak = streak + 1;
    } else if (prev - item === 0) {
      // do nothing in the case class was on the same day
    } else {
      log.debug("reset streak count")
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

// Get the all-day-every-day progress. If user hasn't reached it, 
// count the number of classes taken in a row in the week of their last session
export default function(sessions, user) {

  let streak = getDailyStreak(sessions, user);

  return {
    title: 'All Day Every Day',
    label: 'Take a class for 5 days straight',
    max: 5,
    value: streak
  }
}