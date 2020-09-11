function getClasses(sessions, user) {
  return sessions.filter(session => {
    return session.users_joined && session.users_joined.includes(user.id) &&
    session.instructor_id !== user.id;
  });
}

function getClassesTaken(sessions, user) {
  let list = getClasses(sessions, user);
  return list.length;
}

export default function(sessions, user) {
  const classesTaken = getClassesTaken(sessions, user)

  let data = {
    title: 'Warrior 1',
    label: 'Take your first Indoorphins class!',
    max: 1,
    value: classesTaken
  };

  if (classesTaken >= 25) {
    data.title = 'Warrior 5';
    data.label = 'Take 50 classes, you weapon';
    data.max = 50;
  } else if (classesTaken >= 10) {
    data.title = 'Warrior 4';
    data.label = 'Take 25 classes';
    data.max = 25;
  } else if (classesTaken >= 5) {
    data.title = 'Warrior 3';
    data.label = 'Take 10 classes';
    data.max = 10;
  } else if (classesTaken >= 1) {
    data.title = 'Warrior 2';
    data.label = 'Take 5 classes';
    data.max = 5;
  } else if (classesTaken >= 50) {
    data.title = 'Warrior 5';
    data.max = 50;
    data.label = 'You maxed out amazing!';
    data.value = 50;
  }

  return data
}