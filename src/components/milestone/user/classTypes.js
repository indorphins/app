function getClasses(sessions, user) {
  return sessions.filter(session => {
    return session.users_joined && session.users_joined.includes(user.id) &&
    session.instructor_id !== user.id;
  });
}

function classTypesTaken(sessions, user) {
  let list = getClasses(sessions, user);
  
  let mapped = list.map(item => {
    return item.type;
  });

  return Array.from(new Set(mapped));
}

export default function(sessions, user) {
  const classTypes = classTypesTaken(sessions, user);
  const count = classTypes.length;

  let data = {
    title: 'Stretch',
    label: 'Try two different class types',
    value: count,
    max: 2,
    lvl: 0,
    type: "standard"
  }

  if (count >= 2) {
    data.max = 3;
    data.title = 'Grow'
    data.label = 'Try three different class types';
    data.lvl = 1;
  }

  if (count >= 3) {
    data.value = 3;
    data.lvl = "max";
  }

  return data;
}