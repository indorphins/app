import * as later from 'later';
import * as dateFns from 'date-fns';
import { Component, Property } from 'immutable-ics';
import path from '../routes/path';

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

/**
 * Takes in a date and returns the date numWeeks after
 * If duration is passed, adds duration to the time of the new date
 * @param {Date} start 
 * @param {Number} numWeeks 
 * @param {Number} duration (optional) duration of class
 * @returns {Date}
 */
export function getDateWeeksLater(start, numWeeks, duration=0) {
  let d = new Date(start);
  d = dateFns.addWeeks(d, numWeeks);
  d.setMinutes(d.getMinutes() + duration);
  return d;
}

export function getClassDataOverWeeks(classData, seriesLength) {
  let courses = [classData]
  for (let i = 1; i < seriesLength; i++) {
    let courseData = {...classData}
    courseData.start_date = getDateWeeksLater(classData.start_date, i).toISOString();
    courses.push(courseData);
  }
  return courses;
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

export function getNextSession(now, c, /*optional*/ win) {
  let sw = sessionWindow;
  if (win) sw = win;
  let start = new Date(c.start_date);
  let end = new Date(c.start_date);
  end.setMinutes(end.getMinutes() + c.duration);
  let startWindow = new Date(start);
  startWindow = startWindow.setMinutes(startWindow.getMinutes() - sw);
  let endWindow = new Date(end);
  endWindow = endWindow.setMinutes(endWindow.getMinutes() + sw);

  // if it's a recurring class and the first class is in the past
  if (c.recurring && now > endWindow) {

    // get the previous event date for the recurring class in case there is an
    // active session right now
    start = getPrevDate(c.recurring, 1, now);
    end = new Date(start);
    end.setMinutes(end.getMinutes() + c.duration);
    startWindow = new Date(start);
    startWindow = startWindow.setMinutes(startWindow.getMinutes() - sw);
    endWindow = new Date(end);
    endWindow = endWindow.setMinutes(endWindow.getMinutes() + sw);

    // if the prev session is over then get the next session
    if (now > endWindow) {
      start = getNextDate(c.recurring, 1, now);
      end = new Date(start);
      end.setMinutes(end.getMinutes() + c.duration);
      startWindow = new Date(start);
      startWindow = startWindow.setMinutes(startWindow.getMinutes() - sw);
      endWindow = new Date(end);
      endWindow = endWindow.setMinutes(endWindow.getMinutes() + sw);
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
  return `${window.location.origin}${path.login}?redirect=${path.courses}/${classId}`;
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

function isInteger(n) {
  return n === +n && n === (n|0);
}

/**
 * Takes in a number and converts it to a dollar string
 * like $10 or $12.50
 * @param {Number} c 
 * @returns {String}
 */
export function getCostString(c) {
  let costText = "$" + c.toFixed(2);

  if (isInteger(c)) {
    costText = "$" + c;
  }
  return costText
}

/**
 * Returns the cost string for input price like $XX.XX
 * returns -1 if unable to grab price from input object
 * @param {Object} price 
 */
export function getSubscriptionCostString(price) {
  if (price && price.length > 0 && price[0].amount) {
      
    let c = price[0].amount / 100;
    let costText = "$" + c.toFixed(2);

    if (isInteger(c)) {
      costText = "$" + c;
    }
    
    return costText
  }
  return -1;
}