let keypoints;    // Posenet keypoints
$(() => {
  'use strict';
  console.log('DOM Ready!');

  // SELECTORS
  const window = $('window');
  const pseudoInput = $('#pseudoInput');   // pseudoname input of user
  const formButton = $('#formButton');   // Button from form 
  const loginPage = $('#login-page');    // Login page
  const connectPage = $('#connect-page');    // Connect page

  // GLOBAL VARIABLES
  let pseudoname;
  let connected = true;
  let switched = false;
  
  connectPage.hide();

  // WEBSOCKET
  let socket = io();

  // Message to show to this user when other user(s) join/leave
  const addUserMessage = data => {
    let message = '<p class="message">';
    if(data.numUsers == 1){
      message += `${data.username} joined.`;
    }else{
      message += `${data.username} left.`;
    }
    message += '</p>';
    connectPage.append(message);
  }

  // Message to show this user when he disconnects
  const addDisconnectedMessage = () => {
    let message = '<p class="message">';
    message += 'You have been disconnected.';
    message += '</p>';
    loginPage.append(message);
  }

  const changeModelMessage = () => {
    let message = "<p class='model'>";
    if(switched == true){
      message += "Press C to see the other user's character.";
    }
    if(switched == false){
      message += "Press C to see your character.";
    }
    message += "</p>";
    connectPage.append(message);
  }

  // Sets the client's pseudoname
  const setPseudoname = (e) => {
    e.preventDefault();
    pseudoname = pseudoInput.val();

    switchPages();

    if (pseudoname) {   // If the pseudoname is valid
      socket.emit('add-user', pseudoname);    // Send pseudoname to the server
    }
  }

  // Switch which page to show
  const switchPages = () => {
    if(connected == false){
      connectPage.fadeOut('fast');
      loginPage.show('slow');
    }else if(connected == true){
      loginPage.fadeOut('fast');
      connectPage.show('slow');
    }
  }

  // Switch which three.js character model to show (this users / the other users)
  const keyPressed = (e) => {
    if(e.keyCode == 67){    // If the pressed key is 'C'
      if(switched == true){
        switched == false;
        switchModel(switched);
      }
      if(switched == false){
        switched == true;
        switchModel();
      }
    }
  }

  const switchModel = (switched) => {
    //if true -> show my model & switchModel change text
    //if false -> show others model
    // >> select canvas ? 
    changeModelMessage(switched);
  }

  // Click event on button of form
  formButton.click(setPseudoname, false);
  
  // Keyboard event on key C 
  window.keydown(keyPressed);
  
  // When server emits 'user-joined', data = users pseudoname
  socket.on('user-joined', data => {
    addUserMessage(data); 
    
    console.log('message:', message);  
  })

  // When server emits 'user-left, data = users pseudoname
  socket.on('user-left', data => {
    addUserMessage(data);

    console.log('message:', message);
  })

  // When user gets disconnected
  socket.on('disconnect', function () {
    connected = false;
    switchPages()
    addDisconnectedMessage()
  });

  //need a reconnect 

  // When server emits 'from-client', data = PoseNet keypoints
  socket.on('from-client', netData => {
    keypoints = JSON.parse(netData.data);
  })

  console.log(keypoints);
});