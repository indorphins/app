import { differenceInDays, differenceInWeeks, differenceInCalendarWeeks,
   isEqual, isWeekend, isSunday, isMonday, isTuesday, isWednesday,
    isThursday, isFriday, isSaturday, getHours } from 'date-fns';

export function isWarriorOne(sessions) {
  return sessions.length >= 1;
}

export function isWarriorTwo(sessions) {
  return sessions.length >= 5;
}

export function isWarriorThree(sessions) {
  return sessions.length >= 10;
}

export function isWarriorFour(sessions) {
  return sessions.length >= 25;
}

function isWarriorFive(sessions) {
  return sessions.length >= 100;
}

export function isDiscover(sessions) {
  let types = [];
  sessions.forEach(session => {
    if (types.indexOf(session.type) < 0) {
      types.push(session.type);
    }
  })
  return types.length >= 2;
}

export function isStretch(sessions) {
  let types = [];
  sessions.forEach(session => {
    if (types.indexOf(session.type) < 0) {
      types.push(session.type);
    }
  })
  return types.length >= 3;
}

export function isGrow(sessions) {
  let types = [];
  sessions.forEach(session => {
    if (types.indexOf(session.type) < 0) {
      types.push(session.type);
    }
  })
  return types.length >= 4;
}

export function isDoubleUp(sessions) {
  let last;
  let hit = false;
  sessions.forEach(session => {
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
  })
  return hit;
}

export function isQuadWeek(sessions) {
  let first;
  let count = 0;
  let hit = false;
  sessions.forEach(session => {
    if (!first) {
      count = 1;
      first = new Date(session.start_date);
    } else {
      const sessionDate = new Date(session);
      if (differenceInCalendarWeeks(first, sessionDate) < 1) {
        count += 1;
        if (count >= 4) {
          hit = true;
        }
      } else {
        first = sessionDate;
        count = 1;
      }
    }
  })
  return hit;
}

// 2 classes per day for 7 days
export function isTwoADay(sessions) {
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
      if (sessionsPerDay(sessions, first) >= 2) {
        count += 1;
      }
    }
    
    if (differenceInDays(first, sessionDate) === 1 && sessionsPerDay(sessions, sessionDate) >= 2) {
      count += 1;
      if (count >= 7) {
        hit = true;
      }
      first = sessionDate;
    } else if (differenceInDays(first, sessionDate) > 1 || sessionsPerDay(sessions, sessionDate) < 2) {
      count = 0;
      first = sessionDate;
    }
  })
  return hit;
}

// 1 class every day for 7 days
export function isAllDayEveryDay(sessions) {
  let hit = false;
  let count = 1;
  let first;

  if (sessions.length < 7) {
    return false;
  } 

  sessions.forEach(session => {
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
  })
  return hit;
}

/**
 * Returns the number of sessions on a given day
 * @param {Array} sessions 
 * @param {Date} date 
 * @returns {Number}
 */
function sessionsPerDay(sessions, date) {
  let count = 0;
  sessions.forEach(session => {
    let sessionDate = new Date(session.start_date);
    if (isEqual(sessionDate, date)) {
      count += 1;
    }
  })
  return count;
}

function getLongestStreak(sessions) {
  if (sessions.length < 2) {
    return 0;
  }

  let longest = 0;
  let start, last;

  sessions.forEach(session => {
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
  })

  return longest
}

function isBackToBack(sessions) {
  return getLongestStreak(sessions) >= 2;
}

function isFivepeat(sessions) {
  return getLongestStreak(sessions) >= 5;
}

function isTenWeeksYouWild(sessions) {
  return getLongestStreak(sessions) >= 10;
}

function isWeekendWarrior(sessions) {
  let hit = false;
  sessions.forEach(session => {
    if (isWeekend(new Date(session.start_date))) {
      hit = true;
    }
  })
  return hit;
}

function isWeekdayWarrior(sessions) {
  let hit = false;
  sessions.forEach(session => {
    if (!isWeekend(new Date(session.start_date))) {
      hit = true;
    }
  })
  return hit;
}

function isEveryDay(sessions) {
  let hitSun = false;
  let hitMon = false;
  let hitTues = false;
  let hitWed = false;
  let hitThurs = false;
  let hitFri = false;
  let hitSat = false;

  sessions.forEach(session => {
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
  })

  return hitSun && hitMon && hitTues && hitWed && hitThurs && hitFri && hitSat;
}

function isMorning(sessions) {
  let hit = false;
  sessions.forEach(session => {
    if (getHours(new Date(session.start_date)) <= 11) {
      hit = true;
    }
  })
  return hit;
}

function isMidday(sessions) {
  let hit = false;
  sessions.forEach(session => {
    if (getHours(new Date(session.start_date)) > 11 && getHours(new Date(session.start_date)) < 16) {
      hit = true;
    }
  })
  return hit;
}

function isEvening(sessions) {
  let hit = false;
  sessions.forEach(session => {
    if (getHours(new Date(session.start_date)) >= 16) {
      hit = true;
    }
  })
  return hit;
}

export function getMilestonesHit(sessions) {

}