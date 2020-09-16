import { getDayOfYear, getYear } from 'date-fns';

function getUniqueUsersByDay(sessions, instructor) {
  let total = {};
  let final = [];
  let instructed = sessions.filter(item => {
    return item.instructor_id === instructor
  });

  let items = instructed.map(item => {
    let d = new Date(item.start_date)
    return {
      index: getDayOfYear(d) + getYear(d),
      users_joined: item.users_joined.filter(item => item !== instructor),
    };
  });

  items.forEach(item => {
    if (!total[item.index]) {
      total[item.index] = item.users_joined;
    } else {
      total[item.index] = [...total[item.index], ...item.users_joined];
    }
  });

  for (const key in total) {
    let unique = Array.from(new Set(total[key]));
    final.push(unique.length);
  }

  return final.sort((a, b) => b - a);
}

export default function(sessions, user) {
  const daysChangedCounts = getUniqueUsersByDay(sessions, user.id);
  const daysChanged = daysChangedCounts[0];

  let data = {
    title: 'Rock',
    label: "Change 10 people's days through movement",
    max: 10,
    value: 0,
    lvl: 0,
    type: "instructor"
  }

  if (daysChanged) {
    data.value = daysChanged;
  }

  if (daysChanged >= 10) {
    data.title = 'Pillar';
    data.label = "Change 25 people's days through movement";
    data.max = 25;
    data.lvl = 1;
  }
    
  if (daysChanged >= 25) {
    data.title = 'Backbone';
    data.label = "Change 50 people's days through movement";
    data.max = 50;
    data.lvl = 2;
  } 
  
  if (daysChanged >= 50) {
    data.title = 'Upholder';
    data.label = "Change 100 people's days through movement";
    data.max = 100;
    data.lvl = 3;
  } 

  if (daysChanged >= 100) {
    data.title = 'Champion';
    data.label = "Change 250 people's days through movement";
    data.max = 250;
    data.lvl = 4;
  } 

  if (daysChanged >= 250) {
    data.value = 250;
    data.lvl = "max";
  }

  return data;
}