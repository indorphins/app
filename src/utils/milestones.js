/* eslint max-depth: 0*/
import { 
  differenceInDays,
  differenceInWeeks,
  isEqual,
} from 'date-fns';

import ClassesPerWeek from './user/classesPerWeek';
import ClassesPerDay from './user/classesPerDay';
import UniqueInstructor from './user/uniqueInstructor';
import FiveDaysConsecutive from './user/fiveDaysConsecutive';
import EveryWeekday from './user/everyWeekday';
import ClassesTaken from './user/classesTaken';
import InstructorClassesTaken from './user/instructorClassesTaken';
import ClassTypes from './user/classTypes';
//import log from '../log';

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

// Get the tri-it progress. If user hasn't reached it, 
// count the number of classes taken in the week of their last session
export function getTriItLevel(sessions, user) {
  return ClassesPerWeek(sessions, user);
}

export function getDoubleUpLevel(sessions, user) {
  return ClassesPerDay(sessions, user);
}

export function getUniqueInstructorsLevel(sessions, user) {
  return UniqueInstructor(sessions, user);
}

export function getAllDayEveryDayLevel(sessions, user) {
  return FiveDaysConsecutive(sessions, user);
}

export function getRideOrDieLevel(sessions, user) {
  return InstructorClassesTaken(sessions, user);
}

export function getEveryDayLevel(sessions, user) {
  return EveryWeekday(sessions, user);
}

export function getWarriorLevel(sessions, user) {
  return ClassesTaken(sessions, user);
}

export function getTypesTakenLevel(sessions, user) {
  return ClassTypes(sessions, user);
}
