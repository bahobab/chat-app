const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const Filter = require('bad-words');

const {generateLocation, generateMessage} = require('./utils/messages');
const {addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users')

const express = require('express');
const helmet = require('helmet');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const publicPath = path.join(__dirname, '../public')
app.use(express.static(publicPath));

io.on('connection', (socket) => {
  // console.log('A user has joined...')

  socket.on('join', (options, callback) => {
    const {error, user} = addUser({
      id: socket.id,
      ...options
    });

    if (error) 
      return callback(error);
    
    socket.join(user.room);

    socket.emit('welcomeMessage', generateMessage(user.username, `Welcome to the ${user.room} chat room`));
    socket
      .broadcast
      .to(user.room)
      .emit('message', generateMessage(user.username, `${user.username} has joined!`));
    io
      .to(user.room)
      .emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room)
      });

    callback();

    // socket.emit, io.emit, socket.broadcast.emit io.to.emit,
    // socket.broadcast.to.emit
  });

  socket.on('sendMessage', (message, callback) => {
    const filter = new Filter();

    if (filter.isProfane(message)) 
      return callback('Profanities not permitted!');
    
    const user = getUser(socket.id);

    if (!user) 
      return callback(error);
    
    io
      .to(user.room)
      .emit('message', generateMessage(user.username, message));
    callback();
  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if (user) {
      io
        .to(user.room)
        .emit('message', generateMessage(user.username, `${user.username} has left!`));
      io
        .to(user.room)
        .emit('roomData', {
          room: user.room,
          users: getUsersInRoom(user.room)
        });
    }
  });

  socket.on('sendLocation', ({
    latitude,
    longitude
  }, callback) => {
    const user = getUser(socket.id);

    if (!user) 
      return callback(error);
    
    io
      .to(user.room)
      .emit('locationMessage', generateLocation(user.username, latitude, longitude));
    callback('Location shared');
  })
});

const PORT = process.env.PORT || 3004;

server.listen(PORT, () => {
  console.log(`app being served on port ${PORT}`);
});