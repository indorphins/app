/* eslint max-depth: 0*/
import { 
  differenceInDays,
  differenceInWeeks,
  differenceInCalendarWeeks,
  isEqual,
  isSameDay,
} from 'date-fns';

import FiveDaysConsecutive from './user/fiveDaysConsecutive';
import EveryWeekday from './user/everyWeekday';
import Warrior from './user/warrior';
import RideOrDie from './user/rideOrDie';
import ClassTypes from './user/classTypes';
//import log from '../log';

/* Classes Taken */
function getClasses(sessions, user) {
  return sessions.filter(session => {
    return session.users_joined && session.users_joined.includes(user.id) &&
    session.instructor_id !== user.id;
  });
}

/* Combo classes taken in select time frames */

// 2 classes in 1 day
function isDoubleUp(sessions, user) {
  let last;
  let hit = false;
  sessions.forEach(session => {
    if (session.users_joined.includes(user.id)) {
      if (!last) {
        last = new Date(session.start_date);
      } else {
        const sessionDate = new Date(session);
        if (isEqual(last, sessionDate)) {
          hit = true;
        } else {
          last = sessionDate;
        }
      }
    }
  })
  return hit;
}

// 3 classes in the same week
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

/**
 * Returns the number of sessions on a given day the user took
 * @param {Array} sessions 
 * @param {Date} date 
 * @returns {Number}
 */
function sessionsPerDay(sessions, date, user) {
  let temp = getClasses(sessions, user);

  let filtered = temp.filter(item => {
    return isSameDay(date, new Date(item.start_date));
  });

  return filtered.length;
}

// Gets the number of classes taken since the user's last session
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

/* Weekly Streaks */

function getLongestStreak(sessions, user) {
  if (sessions.length < 2) {
    return 0;
  }

  let longest = 0;
  let start, last;

  sessions.forEach(session => {
    if (session.users_joined.includes(user.id)) {
      let sessionDate = new Date(session.start_date);
      if (!start) {
        start = sessionDate;
      }
      if (!last) {
        last = sessionDate;
      }

      if (!isEqual(last, sessionDate)) {
        let weekDiff = differenceInWeeks(last, sessionDate)
        if (weekDiff > 1) {
          start = sessionDate;
        } else {
          weekDiff = differenceInWeeks(start, sessionDate);
          if (weekDiff > longest) {
            longest = weekDiff;
          }
        }
        last = sessionDate;
      }
    }
  })

  return longest
}

/* Unique instructors taken milestones */
function getUniqueInstructorsTaken(sessions, user) {
  const instructors = [];
  sessions.forEach(session => {
    if (!instructors.includes(session.instructor_id) && session.users_joined.includes(user.id)) {
      instructors.push(session.instructor_id);
    }
  })
  return instructors.length;
}

/**
 * Returns the number of sessions with instructor as instructor
 * @param {Array} sessions 
 * @param {String} instructor 
 */
function getClassesTaught(sessions, instructor) {
  let count = 0;
  sessions.forEach(session => {
    if (session.instructor_id === instructor) {
      count++;
    }
  })
  return count;
}

/* Unique users per day */

/**
 * For each day, counts the number of unique users taught by instructor in sessions
 * Returns the total users taught uniquely each day 
 * @param {Array} sessions 
 * @param {String} instructor 
 */
function getDaysChanged(sessions, instructor) {
  let todaysClass = [];
  let count = 0;
  let today;

  sessions.forEach(session => {
    if (session.instructor_id === instructor) {
      const sessionDate = new Date(session.start_date);
      if (!today) {
        today = sessionDate;
      }

      if (differenceInDays(today, sessionDate) === 0) {
        session.users_joined.forEach(user => {
          if (!todaysClass.includes(user)) {
            todaysClass.push(user);
          }
        })
      } else {
        count += todaysClass.length;
        todaysClass = [];
      }
    }
  });

  return count;
}

/**
 * Returns the number of unique users instructor has taught in sessions
 * @param {Array} sessions 
 * @param {String} instructor 
 */
function getUniqueUsersInstructed(sessions, instructor) {
  let allUsers = [];

  sessions.forEach(session => {
    if (session.instructor_id === instructor) {
      session.users_joined.forEach(user => {
        if (!allUsers.includes(user)) {
          allUsers.push(user);
        }
      })
    }
  });

  return allUsers.length;
}

export function getWeekStreakLevel(sessions, user) {
  const longestWeeklyStreak = getLongestStreak(sessions, user);

  if (longestWeeklyStreak > 5) {
    return {
      title: '10 Weeks? you wild',
      label: "You're a real one. Go for 10 weeks in a row",
      max: 10,
      value: longestWeeklyStreak
    }
  } if (longestWeeklyStreak > 2) {
    return {
      title: 'Fivepeat',
      label: 'Take classes 5 weeks in a row',
      max: 5,
      value: longestWeeklyStreak
    }
  } else {
    return {
      title: 'Back to back',
      label: 'Take classes 2 weeks in a row',
      max: 2,
      value: longestWeeklyStreak
    }
  }
}

export function getUniqueInstructorsLevel(sessions, user) {
  const uniqueInstructorsTaken = getUniqueInstructorsTaken(sessions, user);

  if (uniqueInstructorsTaken > 3) {
    return {
      title: 'The more the merrier',
      label: 'Take classes with 4 different instructors',
      max: 4,
      value: uniqueInstructorsTaken
    }
  } if (uniqueInstructorsTaken > 2) {
    return {
      title: "Three's a crows",
      label: 'Take classes with 3 different instructors',
      max: 3,
      value: uniqueInstructorsTaken
    }
  } else {
    return {
      title: 'Love Triangle',
      label: 'Take classes with 2 different instructors',
      max: 2,
      value: uniqueInstructorsTaken
    }
  }
}

export function getClassesTaughtLevel(sessions, user) {
  const classesTaught = getClassesTaught(sessions, user.id);

  if (classesTaught > 25) {
    return {
      title: 'one hunnid', // TODO make this the 100 emoji
      label: 'Teach one hunnid classes',
      max: 100,
      value: classesTaught
    }
  } if (classesTaught > 10) {
    return {
      title: 'shamWow',
      label: 'Teach 25 classes',
      max: 25,
      value: classesTaught
    }
  }  if (classesTaught > 5) {
    return {
      title: '10/10',
      label: 'Teach 10 classes',
      max: 10,
      value: classesTaught
    }
  }  if (classesTaught > 1) {
    return {
      title: 'Sweating Balls',
      label: 'Teach 5 classes',
      max: 5,
      value: classesTaught
    }
  } else {
    return {
      title: 'LFG',
      label: 'Teach your first class!',
      max: 1,
      value: classesTaught
    }
  }
}

export function getDaysChangedLevel(sessions, user) {
  const daysChanged = getDaysChanged(sessions, user.id);

  if (daysChanged > 100) {
    return {
      title: 'Champion',
      label: "Change 250 people's days through movement",
      max: 250,
      value: daysChanged
    }
  } if (daysChanged > 50) {
    return {
      title: 'Upholder',
      label: "Change 100 people's days through movement",
      max: 100,
      value: daysChanged
    }
  } if (daysChanged > 25) {
    return {
      title: 'Backbone',
      label: "Change 50 people's days through movement",
      max: 50,
      value: daysChanged
    }
  } if (daysChanged > 10) {
    return {
      title: 'Pillar',
      label: "Change 25 people's days through movement",
      max: 25,
      value: daysChanged
    }
  } else {
    return {
      title: 'Rock',
      label: "Change 10 people's days through movement",
      max: 10,
      value: daysChanged
    }
  }
}

export function getLivesChangedLevel(sessions, user) {
  const livesChanged = getUniqueUsersInstructed(sessions, user.id);

  if (livesChanged > 100) {
    return {
      title: 'Life Changer',
      label: "Change 200 people's lives through connection",
      max: 200,
      value: livesChanged
    }
  } if (livesChanged > 50) {
    return {
      title: 'Leader',
      label: "Change 100 people's lives through connection",
      max: 100,
      value: livesChanged
    }
  } if (livesChanged > 25) {
    return {
      title: 'Influence',
      label: "Change 50 people's lives through connection",
      max: 50,
      value: livesChanged
    }
  } if (livesChanged > 1) {
    return {
      title: 'Sway',
      label: "Change 25 people's lives through connection",
      max: 25,
      value: livesChanged
    }
  } else {
    return {
      title: 'Impact',
      label: "Change someone's life through connection",
      max: 1,
      value: livesChanged
    }
  }
}

// Get the double-up progress. If user hasn't reached it, 
// count the number of classes they took today and display in progress
export function getDoubleUpLevel(sessions, user) {
  if (isDoubleUp(sessions, user)) {
    return {
      title: 'Double Up',
      label: 'Take 2 classes in 1 day',
      max: 2,
      value: 2
    }
  } else {
    const now = new Date()
    const sessionsToday = sessionsPerDay(sessions, now, user);
    return {
      title: 'Double Up',
      label: 'Take 2 classes in 1 day',
      max: 2,
      value: sessionsToday
    }
  }
}

// Get the tri-it progress. If user hasn't reached it, 
// count the number of classes taken in the week of their last session
export function getTriItLevel(sessions, user) {
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

// Get the all-day-every-day progress. If user hasn't reached it, 
// count the number of classes taken in a row in the week of their last session
export function getAllDayEveryDayLevel(sessions, user) {
  return FiveDaysConsecutive(sessions, user);
}

// Get the ride-or-die progress. If user hasn't reached it, 
// count the number of times they took the last class
export function getRideOrDieLevel(sessions, user) {
  return RideOrDie(sessions, user);
}

// Get the every-day progress. If user hasn't reached it, 
// count the number of classes taken on unique days of the week
export function getEveryDayLevel(sessions, user) {
  return EveryWeekday(sessions, user);
}

export function getWarriorLevel(sessions, user) {
  return Warrior(sessions, user);
}

export function getTypesTakenLevel(sessions, user) {
  return ClassTypes(sessions, user);
}
