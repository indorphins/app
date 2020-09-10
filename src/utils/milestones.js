/* eslint max-depth: 0*/
import { differenceInDays, differenceInWeeks, differenceInCalendarWeeks,
   isEqual, isWeekend, isSunday, isMonday, isTuesday, isWednesday,
    isThursday, isFriday, isSaturday, getHours } from 'date-fns';

import log from '../log';

/* Classes Taken */
function getClasses(sessions, user) {
  return sessions.filter(session => {
    return session.users_joined && session.users_joined.includes(user.id);
  });
}

/* Classes taken count */
function getClassesTaken(sessions, user) {
  let list = getClasses(sessions, user);
  return list.length;
}

/* Class Types Taken */
function getClassTypesTaken(sessions, user) {
  let list = getClasses(sessions, user);
  
  let mapped = list.map(item => {
    return item.type;
  });

  return mapped;
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

// 2 classes per day for 7 days
function isTwoADays(sessions, user) {
  let hit = false;
  let count = 0;
  let first;

  if (sessions.length < 14) {
    return false;
  } 

  sessions.forEach(session => {
    const sessionDate = new Date(session.start_date);
    if (!first) {
      first = sessionDate;
      if (sessionsPerDay(sessions, first, user) >= 2) {
        count += 1;
      }
    }
    
    if (differenceInDays(first, sessionDate) === 1 && sessionsPerDay(sessions, sessionDate, user) >= 2) {
      count += 1;
      if (count >= 7) {
        hit = true;
      }
      first = sessionDate;
    } else if (differenceInDays(first, sessionDate) > 1 || sessionsPerDay(sessions, sessionDate, user) < 2) {
      count = 0;
      first = sessionDate;
    }
  })
  return hit;
}

// 1 class every day for 7 days
function isAllDayEveryDay(sessions, user) {
  let hit = false;
  let count = 1;
  let first;

  if (sessions.length < 7) {
    return false;
  } 

  sessions.forEach(session => {
    if (session.users_joined.includes(user.id)) {
      const sessionDate = new Date(session.start_date);
      if (!first) {
        first = sessionDate;
      }

      if (differenceInDays(first, sessionDate) === 1) {
        count += 1;
        if (count >= 7) {
          hit = true;
        }
      } else if (differenceInDays(first, sessionDate) > 1) {
        count = 0;
      }
      first = sessionDate;
    }
  })
  return hit;
}

// Take one class 5 times
function isRideOrDie(sessions, user) {
  let temp = getClasses(sessions, user);
  
  let filtered = temp.filter(item => {
    return getInstructorCount(sessions, item.instructor_id) >= 5
  })
  
  let mapped = filtered.map(item => {
    return getInstructorCount(sessions, item.instructor_id);
  });
  
  return mapped.sort().reverse();
}

function getInstructorCount(sessions, instructorId) {
  let items = sessions.filter(item => {
    return item.instructor_id === instructorId
  });

  return items.length;
}

/**
 * Returns the number of sessions on a given day the user took
 * @param {Array} sessions 
 * @param {Date} date 
 * @returns {Number}
 */
function sessionsPerDay(sessions, date, user) {
  let count = 0;
  sessions.forEach(session => {
    if (session.users_joined.includes(user.id)) {
      let sessionDate = new Date(session.start_date);
      if (isEqual(sessionDate, date)) {
        count += 1;
      }
    }
  })
  return count;
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

// Gets the number of days in a row user has taken class starting at their last session
function daysInARowSinceLastSession(sessions, user) {
  let count = 0;
  let first;

  for (let i = 0; i < sessions.length; i++) {
    const session = sessions[i];
    if (session.users_joined.includes(user.id)) {
      const sessionDate = new Date(session.start_date);
      if (!first) {
        first = sessionDate;
        count = 1;
      }

      if (differenceInDays(first, sessionDate) === 1) {
        count += 1;
      } else if (differenceInDays(first, sessionDate) > 1) {
        return count;
      }
      first = sessionDate;
    }
  }
  return count;
}

// get the number of days in a row since their last session where the user took 2 classes 
function numberOfTwoADaysSinceLastSession(sessions, user) {
  let count = 0;
  let first;

  for (let i = 0; i < sessions.length; i++) {
    const session = sessions[i];
    const sessionDate = new Date(session.start_date);
    if (!first) {
      first = sessionDate;
      if (sessionsPerDay(sessions, first, user) >= 2) {
        count += 1;
      }
    }
    
    if (differenceInDays(first, sessionDate) === 1 && sessionsPerDay(sessions, sessionDate, user) >= 2) {
      count += 1;
      first = sessionDate;
    } else if (differenceInDays(first, sessionDate) > 1 || sessionsPerDay(sessions, sessionDate, user) < 2) {
      return count;
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

// Return the number of unique days of the week the user has taken class on
function numberOfDaysOfTheWeekTaken(sessions, user) {
  let hitSun = false;
  let hitMon = false;
  let hitTues = false;
  let hitWed = false;
  let hitThurs = false;
  let hitFri = false;
  let hitSat = false;

  sessions.forEach(session => {
    if (session.users_joined.includes(user.id)) {
      const sessionDate = new Date(session.start_date);
      if (isSunday(sessionDate)) {
        hitSun = true;
      } else if (isMonday(sessionDate)) {
        hitMon = true;
      } else if (isTuesday(sessionDate)) {
        hitTues = true;
      } else if (isWednesday(sessionDate)) {
        hitWed = true;
      } else if (isThursday(sessionDate)) {
        hitThurs = true;
      } else if (isFriday(sessionDate)) {
        hitFri = true;
      } else if (isSaturday(sessionDate)) {
        hitSat = true;
      }
    }
  })

  let count = 0;
  if (hitSun) {
    count ++;
  } if (hitMon) {
    count++;
  } if (hitTues) {
    count++;
  } if (hitWed) {
    count++;
  } if (hitThurs) {
    count++;
  } if (hitFri) {
    count++;
  } if (hitSat) {
    count++;
  }
  return count;
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

/* One-off milestones related to time/days */

function isWeekendWarrior(sessions, user) {
  for (let i = 0; i < sessions.length; i++) {
    const session = sessions[i];
    if (isWeekend(new Date(session.start_date)) && session.users_joined.includes(user.id)) {
      return true;
    }
  }
  return false;
}

function isWeekdayWarrior(sessions, user) {
  for (let i = 0; i < sessions.length; i++) {
    const session = sessions[i];
    if (!isWeekend(new Date(session.start_date)) && session.users_joined.includes(user.id)) {
      return true;
    }
  }
  return false;
}

function isEveryDay(sessions, user) {
  let hitSun = false;
  let hitMon = false;
  let hitTues = false;
  let hitWed = false;
  let hitThurs = false;
  let hitFri = false;
  let hitSat = false;

  sessions.forEach(session => {
    if (session.users_joined.includes(user.id)) {
      const sessionDate = new Date(session.start_date);
      if (isSunday(sessionDate)) {
        hitSun = true;
      } else if (isMonday(sessionDate)) {
        hitMon = true;
      } else if (isTuesday(sessionDate)) {
        hitTues = true;
      } else if (isWednesday(sessionDate)) {
        hitWed = true;
      } else if (isThursday(sessionDate)) {
        hitThurs = true;
      } else if (isFriday(sessionDate)) {
        hitFri = true;
      } else if (isSaturday(sessionDate)) {
        hitSat = true;
      }
    }
  })

  return hitSun && hitMon && hitTues && hitWed && hitThurs && hitFri && hitSat;
}

function isRooster(sessions, user) {
  for (let i = 0; i < sessions.length; i++) {
    const session = sessions[i];
    if (getHours(new Date(session.start_date)) <= 11 && session.users_joined.includes(user.id)) {
      return true;
    }
  }
  return false;
}

function isAfternoonDelight(sessions, user) {
  for (let i = 0; i < sessions.length; i++) {
    const session = sessions[i];
    if (session.users_joined.includes(user.id) && getHours(new Date(session.start_date)) > 11
      && getHours(new Date(session.start_date)) < 16) {
      return true;
    }
  }
  return false;
}

function isNightOwl(sessions, user) {
  for (let i = 0; i < sessions.length; i++) {
    const session = sessions[i];
    if (session.users_joined.includes(user.id) && getHours(new Date(session.start_date)) >= 16) {
      return true;
    }
  }
  return false;
}

/* Instructor Milestones */

/* Classes Taught */

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

/* Unique users instructed */

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

/* All Milestones */

export function getMilestonesHit(sessions, user) {

  const classTypesTaken = getClassTypesTaken(sessions, user);
  const longestWeeklyStreak = getLongestStreak(sessions, user);
  const uniqueInstructorsTaken = getUniqueInstructorsTaken(sessions, user);
  const classesTaken = getClassesTaken(sessions, user);

  const milestones = {
    warriorOne: classesTaken >= 1,
    warriorTwo: classesTaken >= 5,
    warriorThree: classesTaken >= 10,
    warriorFour: classesTaken >= 25,
    warriorFive: classesTaken >= 100,
    discover: classTypesTaken >= 1,
    stretch: classTypesTaken >= 2,
    grow: classTypesTaken >= 3,
    backToBack: longestWeeklyStreak >= 2,
    fivepeat: longestWeeklyStreak >= 5,
    tenWeeksYouWild: longestWeeklyStreak >= 10,
    loveTriangle: uniqueInstructorsTaken >= 2,
    threesACrowd: uniqueInstructorsTaken >= 3,
    theMoreTheMerrier: uniqueInstructorsTaken >= 4,
    doubleUp: isDoubleUp(sessions, user),
    triIt: isTriIt(sessions, user),
    allDayEveryDay: isAllDayEveryDay(sessions, user),
    twoADays: isTwoADays(sessions, user),
    rideOrDie: isRideOrDie(sessions, user),
    rooster: isRooster(sessions, user),
    afternoonDelight: isAfternoonDelight(sessions, user),
    nightOwl: isNightOwl(sessions, user),
    weekendWarrior: isWeekendWarrior(sessions, user),
    weekdayWarrior: isWeekdayWarrior(sessions, user),
    everyDay: isEveryDay(sessions, user)
  };

  milestones.indoorphinsHigh = hasAllMilestones(milestones);

  if (user && user.type === 'instructor') {
    const classesTaught = getClassesTaught(sessions, user.id);
    const daysChanged = getDaysChanged(sessions, user.id);
    const livesChanged = getUniqueUsersInstructed(sessions, user.id);

    milestones.lfg = classesTaught >= 1;
    milestones.sweatingBalls = classesTaught >= 5;
    milestones.tenOutOfTen = classesTaught >= 10;
    milestones.shamWow = classesTaught >= 25;
    milestones.oneHunnid = classesTaught >= 100;
    milestones.rock = daysChanged >= 10;
    milestones.pillar = daysChanged >= 25;
    milestones.backbone = daysChanged >= 50;
    milestones.upholder = daysChanged >= 100;
    milestones.champion = daysChanged >= 250;
    milestones.impact = livesChanged >= 1;
    milestones.sway = livesChanged >= 25;
    milestones.influence = livesChanged >= 50;
    milestones.leader = livesChanged >= 100;
    milestones.lifeChanger = livesChanged >= 200;

    milestones.indoorphinsJedi = hasAllInstructorMilestones(milestones);
  }

  return milestones;
}

/**
 * Takes in the milestones object and returns if all (user milestones only) values are true
 * @param {Object} milestones 
 */
function hasAllMilestones(milestones) {
  return hasAllWarriors(milestones) && hasAllTypes(milestones)
    && hasAllWeeklyStreaks(milestones) && hasAllUniqueInstructors(milestones)
    && hasAllCombos(milestones) && hasAllOneOffs(milestones);
}

function hasAllWarriors(milestones) {
  return milestones.warriorOne && milestones.warriorTwo
    && milestones.warriorThree && milestones.warriorFour && milestones.warriorFive;
}

function hasAllTypes(milestones) {
  return milestones.discover && milestones.stretch && milestones.grow;
}

function hasAllWeeklyStreaks(milestones) {
  return milestones.backToBack && milestones.fivepeat && milestones.tenWeeksYouWild;
}

function hasAllUniqueInstructors(milestones) {
  return milestones.loveTriangle && milestones.threesACrowd && milestones.theMoreTheMerrier;
}

function hasAllCombos(milestones) {
  return milestones.doubleUp && milestones.triIt &&
    milestones.allDayEveryDay && milestones.twoADays && milestones.rideOrDie;
}

function hasAllOneOffs(milestones) {
  return milestones.rooster && milestones.afternoonDelight
    && milestones.nightOwl && milestones.weekendWarrior
    && milestones.weekdayWarrior && milestones.isEveryDay;
}

/**
 * Takes in the milestones object and returns if all instructor milestones have been hit
 * @param {Object} milestones 
 */
function hasAllInstructorMilestones(milestones) {
  return hasAllClassesTaught(milestones) && hasAllDaysChanged(milestones) && hasAllLivesChanged(milestones);
}

function hasAllClassesTaught(milestones) {
  return milestones.lfg && milestones.sweatingBalls 
    && milestones.tenOutOfTen && milestones.shamWow && milestones.oneHunnid;
}

function hasAllDaysChanged(milestones) {
  return milestones.rock && milestones.pillar && milestones.backbone
    && milestones.upholder && milestones.champion;
}
function hasAllLivesChanged(milestones) {
  return milestones.impact && milestones.sway 
    && milestones.influence && milestones.leader && milestones.lifeChanger;
}

function getMilestonesHitCount(milestones) {
  let count = 0;
  Object.keys(milestones).forEach(key => {
    if (milestones[key]) {
      count++;
    }
  })
  return count;
}

/* Milestone Creation Helpers */

export function getWarriorLevel(sessions, user) {
  const classesTaken = getClassesTaken(sessions, user)
  if (classesTaken > 25) {
    return {
      title: 'Warrior 5',
      label: 'Take 100 clases, you weapon',
      max: 100,
      value: classesTaken
    }
  } if (classesTaken > 10) {
    return {
      title: 'Warrior 4',
      label: 'Take 25 Classes',
      max: 25,
      value: classesTaken
    }
  } if (classesTaken > 5) {
    return {
      title: 'Warrior 4',
      label: 'Take 25 Classes',
      max: 10,
      value: classesTaken
    }
  } if (classesTaken > 1) {
    return {
      title: 'Warrior 4',
      label: 'Take 25 Classes',
      max: 5,
      value: classesTaken
    }
  } else {
    return {
      title: 'Warrior 1',
      label: 'Take your first Indoorphins class!',
      max: 1,
      value: classesTaken
    }
  }
}

export function getTypesTakenLevel(sessions, user) {
  const classTypesTaken = getClassTypesTaken(sessions, user);

  if (classTypesTaken > 2) {
    return {
      title: 'Grow',
      label: 'Try three different disciplines',
      max: 3,
      value: classTypesTaken
    }
  } if (classTypesTaken > 1) {
    return {
      title: 'Stretch',
      label: 'Try two different disciplines',
      max: 2,
      value: classTypesTaken
    }
  } else {
    return {
      title: 'Discover',
      label: '',
      max: 1,
      value: classTypesTaken
    }
  }
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
  if (isAllDayEveryDay(sessions, user)) {
    return {
      title: 'All Day Every Day',
      label: 'Take class for 5 days straight',
      max: 5,
      value: 5
    }
  } else {
    const count = daysInARowSinceLastSession(sessions, user);
    return {
      title: 'All Day Every Day',
      label: 'Take class for 5 days straight',
      max: 5,
      value: count
    }
  }
}

// Get the two-a-days progress. If user hasn't reached it, 
// count the number of days they've taken 2 classes starting at the last 2 class day
export function getTwoADaysLevel(sessions, user) {
  if (isTwoADays(sessions, user)) {
    return {
      title: 'Two a Days',
      label: 'Take 2 classes per day for 5 days straight',
      max: 5,
      value: 5
    }
  } else {
    let count = numberOfTwoADaysSinceLastSession(sessions, user);
    return {
      title: 'Two a Days',
      label: 'Take 2 classes per day for 5 days straight',
      max: 5,
      value: count
    }
  }
}

// Get the ride-or-die progress. If user hasn't reached it, 
// count the number of times they took the last class
export function getRideOrDieLevel(sessions, user) {

  let counts = isRideOrDie(sessions, user);

  log.debug("Ride or die counts", sessions, counts);

  if (counts && counts[0] > 0 && counts <= 5) {
    return {
      title: 'Ride or Die',
      label: 'Take a class from the same instructor 5 times',
      max: 5,
      value: counts[0]
    }
  } else if (counts && counts[0] > 5) {
    return {
      title: 'Ride or Die',
      label: 'Take a class from the same instructor 5 times',
      max: 5,
      value: 5
    }
  } else {
    return {
      title: 'Ride or Die',
      label: 'Take a class from the same instructor 5 times',
      max: 5,
      value: 0
    }
  }
}

// Get the every-day progress. If user hasn't reached it, 
// count the number of classes taken on unique days of the week
export function getEveryDayLevel(sessions, user) {
  if (isEveryDay(sessions, user)) {
    return {
      title: 'Every Day',
      label: 'Take class each day of the week',
      max: 7,
      value: 7
    }
  } else {
    const count = numberOfDaysOfTheWeekTaken(sessions, user);
    return {
      title: 'Every Day',
      label: 'Take class each day of the week',
      max: 7,
      value: count
    }
  }
}

export function getIndoorphinsHighLevel(milestones) {
  if (hasAllMilestones(milestones)) {
    return {
      title: 'Indoorphins High',
      label: 'Complete all milestones',
      max: 11,
      value: 11
    }
  } else {
    const count = getMilestonesHitCount(milestones);
    return {
      title: 'Indoorphins High',
      label: 'Complete all milestones',
      max: 11,
      value: count
    }
  }
}