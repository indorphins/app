
function getClassesTaughtCount(sessions, instructor) {
  let items = sessions.filter(item => {
    return item.instructor_id === instructor;
  });

  return items.length;
}

export default function(sessions, user) {
  const classesTaught = getClassesTaughtCount(sessions, user.id);

  let data = {
    title: 'LFG',
    label: 'Teach your first class!',
    max: 1,
    value: classesTaught,
    lvl: 0,
    type: "instructor"
  }

  if (classesTaught >= 1) {
    data.title = 'Sweating Balls';
    data.label = 'Teach 5 classes';
    data.max = 5;
    data.lvl = 1;
  }

  if (classesTaught >= 5) {
    data.title = '10/10';
    data.label = 'Teach 10 classes';
    data.max = 10;
    data.lvl = 2;
  }

  if (classesTaught >= 10) {
    data.title = 'shamWow';
    data.label = 'Teach 25 classes';
    data.max = 25;
    data.lvl = 3;
  }

  if (classesTaught >= 25) {
    data.title = '💯';
    data.label = 'Teach 100 classes';
    data.max = 100;
    data.lvl = 4;
  }

  if (classesTaught >= 100) {
    data.value = 100;
    data.lvl = "max";
  }

  return data
}