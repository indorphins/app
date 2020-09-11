function getClasses(sessions, user) {
  return sessions.filter(session => {
    return session.users_joined && session.users_joined.includes(user.id) &&
    session.instructor_id !== user.id;
  });
}

function getUniqueInstructorsTaken(sessions, user) {

  let items = getClasses(sessions, user)

  let instructors = items.map(item => {
    return item.instructor_id;
  });

  let unique = Array.from(new Set(instructors));

  return unique.length;
}

export default function(sessions, user) {
  const uniqueInstructorsTaken = getUniqueInstructorsTaken(sessions, user);

  let data = {
    title: 'Love Triangle',
    label: 'Take a class with 2 different instructors',
    max: 2,
    value: uniqueInstructorsTaken
  }

  if (uniqueInstructorsTaken > 2) {
    data.title = "Three's a crows";
    data.label = 'Take a class with 3 different instructors';
    data.max = 3;
  }
  
  if (uniqueInstructorsTaken > 3) {
    data.title = 'The more the merrier';
    data.label = 'Take a class with 4 different instructors';
    data.max = 4;
  }

  if (uniqueInstructorsTaken >= 4) {
    data.value = 4
  }

  return data;
}