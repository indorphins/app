import { GetClasses } from '../common';

function classTypesTaken(sessions, user) {
  let list = GetClasses(sessions, user);
  
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