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

//connections
let numUsers = 0;

io.on('connection', socket => {
  let addedUser = false;

  // when client emits add-user 
  socket.on('add-user', pseudoname => {
    if(addedUser) return;

    // Store the username in the socket session of the client
    socket.username = pseudoname;
    ++numUsers
    addedUser = true;

    // send message globally that this client connected
    socket.broadcast.emit('user-joined', {
      username : socket.username
    });
  });

  //  when client emits disconnected / when client gets disconnected 
  socket.on('disconnect', () => {
    if(addedUser) --numUsers;
    // send message globally that this client disconnected
    socket.broadcast.emit('user-left', {
      username : socket.username,
    });
  });

  socket.on('reconnect', () => {
    //reconnect after deconnection ( must be auto when entering a new pseudo/hitting enter/submitbutton)
  })

  // when posenet data is loaded/sended ??
  socket.on('from-client', netData => {
    console.log(netData);
    socket.broadcast.emit('from-client', {
      data: netData
    });
  })
});

server.listen(port, () => {
  console.log(`server listening at port ${port}`)
});
