import * as later from 'later';

// js day of week index is different from unix cron format so adjusting with this map
const cronDayMap = {
  0: 7,
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
}

export function getWeeklyCronRule(date) {
  let d = new Date(date);
  let day = d.getUTCDay();
  let hour = d.getUTCHours();
  let min = d.getUTCMinutes();
  let rule = `${min} ${hour} * * ${cronDayMap[day]} *`;

  return rule;
}

export function getNextDate(rule, count, refDate) {
  later.date.UTC();
  let sched = later.parse.cron(rule);
  return later.schedule(sched).next(count, refDate);
}

export function getPrevDate(rule, count, refDate) {
  later.date.UTC();
  let sched = later.parse.cron(rule);
  return later.schedule(sched).prev(count, refDate);
}