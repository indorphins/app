import { GetClasses, GetDaysOfYear } from '../common';

function getDailyStreak(sessions, user) {
  let classes = GetClasses(sessions, user)
  let list = GetDaysOfYear(classes);
  let prev;
  let streak = 0;
  let prevStreak = 0;

  list.forEach(item => {

    if (!prev || prev - item === 1 || item - prev === 364) {
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
  let streak = getDailyStreak(sessions, user);

  let data =  {
    title: 'All Day Every Day',
    label: 'Take a class for 5 days straight',
    max: 5,
    value: streak,
    lvl: 0,
    type: "standard"
  }

  if (streak >= 5) {
    data.value = 5;
    data.lvl = "max";
  }

  return data;
}