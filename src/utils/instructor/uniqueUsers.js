function getUniqueUsersInstructed(sessions, instructor) {
  let combined = [];
  let instructed = sessions.filter(item => {
    return item.instructor_id === instructor
  });

  instructed.forEach(item => {
    combined = combined.concat(item.users_joined);
  });

  let unique = Array.from(new Set(combined));
  return unique.length;
}

export default function(sessions, user) {

  const livesChanged = getUniqueUsersInstructed(sessions, user.id);

  let data = {
    title: 'Impact',
    label: "Change someone's life through connection",
    max: 1,
    value: livesChanged
  }

  if (livesChanged > 100) {
    data.title = 'Life Changer';
    data.label = "Change 200 people's lives through connection";
    data.max = 200;
    return data;
  } 
  
  if (livesChanged > 50) {
    data.title = 'Leader';
    data.label = "Change 100 people's lives through connection";
    data.max = 100;
    return data;
  } 
  
  if (livesChanged > 25) {
    data.title = 'Influence';
    data.label = "Change 50 people's lives through connection";
    data.max = 50;
    return data;
  } 
  
  if (livesChanged > 1) {
    data.title = 'Sway';
    data.label = "Change 25 people's lives through connection";
    data.max = 25;
  }

  return data;
}
