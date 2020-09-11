/* eslint max-depth: 0*/
import { 
  differenceInCalendarWeeks,
} from 'date-fns';

function isTriIt(sessions, user) {
  let first;
  let count = 0;
  let hit = false;
  sessions.forEach(session => {
    if (session.users_joined.includes(user.id)) {
      if (!first) {
        count = 1;
        first = new Date(session.start_date);
      } else {
        const sessionDate = new Date(session);
        if (differenceInCalendarWeeks(first, sessionDate) < 1) {
          count += 1;
          if (count >= 3) {
            hit = true;
          }
        } else {
          first = sessionDate;
          count = 1;
        }
      }
    }
  })
  return hit;
}

function classesPerWeekSinceLastSession(sessions, user) {
  let count = 0;
  let first;

  for (let i = 0; i < sessions.length; i++) {
    const session = sessions[i];
    if (session.users_joined.includes(user.id)) {
      if (!first) {
        count = 1;
        first = new Date(session.start_date);
      } else {
        const sessionDate = new Date(session);
        if (differenceInCalendarWeeks(first, sessionDate) < 1) {
          count += 1;
        } else {
          return count
        }
      }
    }
  }
  return count;
}

export default function(sessions, user) {
  if (isTriIt(sessions, user)) {
    return {
      title: 'Tri It',
      label: 'Take 3 classes in the same week',
      max: 3,
      value: 3
    }
  } else {
    const count = classesPerWeekSinceLastSession(sessions, user);
    return {
      title: 'Tri It',
      label: 'Take 3 classes in the same week',
      max: 3,
      value: count
    }
  }
}