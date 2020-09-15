import { getDayOfYear } from 'date-fns';

export function GetClasses(sessions, user) {
  return sessions.filter(session => {
    return session.users_joined && session.users_joined.includes(user.id) &&
    session.instructor_id !== user.id;
  });
}

export function GetDaysOfYear(items) {
  return items.map(item => {
    return getDayOfYear(new Date(item.start_date));
  });
}
