import * as later from 'later';
import { Component, Property } from 'immutable-ics';
import config from '../config'


const sessionWindow = 5;

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

export function getNextSession(now, c) {
  let start = new Date(c.start_date);
  let end = new Date(c.start_date);
  end.setMinutes(end.getMinutes() + c.duration);
  let startWindow = new Date(start);
  startWindow = startWindow.setMinutes(startWindow.getMinutes() - sessionWindow);
  let endWindow = new Date(end);
  endWindow = endWindow.setMinutes(endWindow.getMinutes() + sessionWindow);

  // if it's a recurring class and the first class is in the past
  if (c.recurring && now > endWindow) {

    // get the previous event date for the recurring class in case there is an
    // active session right now
    start = getPrevDate(c.recurring, 1, now);
    end = new Date(start);
    end.setMinutes(end.getMinutes() + c.duration);
    startWindow = new Date(start);
    startWindow = startWindow.setMinutes(startWindow.getMinutes() - sessionWindow);
    endWindow = new Date(end);
    endWindow = endWindow.setMinutes(endWindow.getMinutes() + sessionWindow);

    // if the prev session is over then get the next session
    if (now > endWindow) {
      start = getNextDate(c.recurring, 1, now);
      end = new Date(start);
      end.setMinutes(end.getMinutes() + c.duration);
      startWindow = new Date(start);
      startWindow = startWindow.setMinutes(startWindow.getMinutes() - sessionWindow);
      endWindow = new Date(end);
      endWindow = endWindow.setMinutes(endWindow.getMinutes() + sessionWindow);
    }
  }

  if (now > endWindow) {
    return null;
  }

  return {
    date: start,
    start: startWindow,
    end: endWindow,
  };
}

function getClassUrl(classId) {
  return `${config.host}/${classId}`;
}

export function createCalenderEvent(subject, organizer, id, begin, end, recurring) {
  const classUrl = getClassUrl(id);
  const description = `You'll take class here: ${classUrl}`

  // TODO Add recurring functionality for subscription classes 

  const calendar = new Component({
    name: 'VCALENDAR',
    properties: [
      new Property({ name: 'VERSION', value: 2 })
    ],
    components: [
      new Component({
        name: 'VEVENT',
        properties: [
          new Property({
            name: 'DTSTART',
            parameters: { VALUE: 'DATETIME' },
            value: begin
          }),
          new Property({
            name: 'DTEND',
            parameters: { VALUE: 'DATETIME' },
            value: end
          }),
          new Property({
            name: 'DTSTAMP',
            parameters: { VALUE: 'DATETIME' },
            value: new Date()
          }),
          new Property({
            name: 'DESCRIPTION',
            parameters: { VALUE: 'STRING' },
            value: description
          }),
          new Property({
            name: 'SUMMARY',
            parameters: { VALUE: 'STRING' },
            value: subject
          }),
          new Property({
            name: 'ORGANIZER',
            parameters: { CN: organizer },
            value: "indoorphins@indoorphins.fit"
          }),
        ]
      })
    ]
  })

  return calendar;
}