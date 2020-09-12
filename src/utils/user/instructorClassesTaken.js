import log from '../../log';

function getClasses(sessions, user) {
  return sessions.filter(session => {
    return session.users_joined && session.users_joined.includes(user.id) &&
    session.instructor_id !== user.id;
  });
}

function getInstructorCount(sessions, instructorId) {
  let items = sessions.filter(item => {
    return item.instructor_id === instructorId
  });

  return items.length;
}

function classesByInstructor(sessions, user) {
  let temp = getClasses(sessions, user);

  let mapped = temp.map(item => {
    return getInstructorCount(sessions, item.instructor_id);
  });
  
  return mapped.sort().reverse();
}

export default function(sessions, user) {

  let counts = classesByInstructor(sessions, user);

  log.debug("classes taken by instructor counts", counts);

  let data = {
    title: 'Ride or Die',
    label: 'Take a class from the same instructor 5 times',
    max: 5,
    value: 0,
    lvl: 0,
    type: "standard"
  }

  if (counts && counts[0] > 0 && counts[0] <= 5) {
    data.value = counts[0];
  }
  
  if (counts && counts[0] > 5) {
    data.value = 5
    data.lvl = "max";
  }

  return data;
}