import UniqueUsers from './instructor/uniqueUsers';
import UniqueUsersByDay from './instructor/uniqueUsersByDay';
import ClassesTaught from './instructor/classesTaught';

import WeeklyConsecutive from './user/weeklyConsecutive';
import ClassesPerWeek from './user/classesPerWeek';
import ClassesPerDay from './user/classesPerDay';
import UniqueInstructor from './user/uniqueInstructor';
import DaysConsecutive from './user/daysConsecutive';
import EveryWeekday from './user/everyWeekday';
import ClassesTaken from './user/classesTaken';
import InstructorClassesTaken from './user/instructorClassesTaken';
import ClassTypes from './user/classTypes';

export function getDaysChangedLevel(sessions, user) {
  return UniqueUsersByDay(sessions, user)
}

export function getLivesChangedLevel(sessions, user) {
  return UniqueUsers(sessions, user);
}

export function getClassesTaughtLevel(sessions, user) {
  return ClassesTaught(sessions, user);
}


export function getWeekStreakLevel(sessions, user) {
  return WeeklyConsecutive(sessions, user);
}

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
  return DaysConsecutive(sessions, user);
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
