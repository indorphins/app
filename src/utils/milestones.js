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

export function getAll(sessions, user) {
  return [
    ClassesTaught(sessions, user),
    UniqueUsers(sessions, user),
    UniqueUsersByDay(sessions, user),
    ClassesTaken(sessions, user),
    ClassTypes(sessions, user),
    WeeklyConsecutive(sessions, user),
    UniqueInstructor(sessions, user),
    ClassesPerDay(sessions, user),
    ClassesPerWeek(sessions, user),
    DaysConsecutive(sessions, user),
    InstructorClassesTaken(sessions, user),
    EveryWeekday(sessions, user)
  ]
}
