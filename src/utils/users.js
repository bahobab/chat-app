const users = [];

// addUser, removeUser, getUser, getUsersInRoom

const addUser = ({id, username, room}) => {
  username = username
    .trim()
    .toLowerCase();
  room = room
    .trim()
    .toLowerCase()

  // validate the data
  if (!username || !room) 
    return {error: 'Username and room are required'};
  
  // check for existing user. avoid duplicate username
  const existingUser = users.find(user => user.room === room && user.username === username);

  // validate username
  if (existingUser) 
    return {error: 'Username already taken! Please pick a different name.'};
  
  // Store username
  const user = {
    id,
    username,
    room
  };
  users.push(user);
  return {user};
}

const removeUser = (id) => {
  const userIndex = users.findIndex(user => user.id === id);
  // filter will keep searching for ALL matches

  if (userIndex !== -1) 
    return users.splice(userIndex, 1)[0];
    // splice is mutable - users
  };

const getUser = (id) => {
  return users.find(user => user.id === id);
};

getUsersInRoom = room => {
  return users.filter(user => user.room === room);
}

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
};
