// Adapted from code at https://github.com/socketio/socket.io/blob/master/examples/chat/index.js

const express = require('express');
const app = express();
const http = require('http');
//const fs = require('fs');
const socketIO = require('socket.io');

const server = http.createServer(app);
const io = socketIO(server)

const port = process.env.PORT || 3000;

// Routing
app.use(express.static(__dirname + '/client'));

io.on('connection', socket => {
  let addedUser = false;

  // when client emits add-user 
  socket.on('add-user', pseudoname => {
    if(addedUser) return;

    // Store the username in the socket session of the client
    socket.pseudoname = pseudoname;
    addedUser = true;

    socket.emit('login', {
      addedUser : addedUser
    });

    // send message globally that this client connected
    socket.broadcast.emit('user-joined', {
      username : socket.pseudoname,
      conn : 1
    });
  });

  //  when client emits disconnected / when client gets disconnected 
  socket.on('disconnect', () => {
    if( addedUser ){
      // send message globally that this client disconnected
      socket.broadcast.emit('user-left', {
        username : socket.pseudoname,
        conn : 0
      });
    }  
  });

  // when posenet data is loaded/sended ??
  socket.on('from-client', netData => {
    console.log(netData);
    socket.broadcast.emit('from-client', {
      data: netData
    });
  });
});

server.listen(port, () => {
  console.log(`server listening at port ${port}`);
});
