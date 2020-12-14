// Adapted from code at https://github.com/ionif/posenetToThreejs/blob/master/server/index.html and https://github.com/socketio/socket.io/blob/4e6d40493da3a6858f122fa5b09c4974195b868b/examples/cluster-haproxy/server/public/main.js

// POSENET KEYPOINTs
let keypoints;

$(() => {
  'use strict';
  console.log( 'Ready!' );

// SELECTORS
  const pseudoInput = $( '#pseudoInput' );   // pseudoname input of user
  const formButton = $( '#formButton' );   // Button from form 
  const loginPage = $( '#login-page' );    // Login page
  const loginMessage = $( '#loginMessage' );
  const connectPage = $( '#connect-page' );    // Connect page
  const connectMessage = $( '#connectMessage' );
  const switchMessage = $( '#message' );
  const threeCanvas = $( 'canvas' );

// GLOBAL VARIABLES
  let pseudoname;
  let connected = false;
  let switched = false;
  
  connectPage.hide();

// WEBSOCKET
  let socket = io();

// MESSAGES
  // Message to show to this user when other user(s) join/leave
  const addUserMessage = data => {
    connectMessage.fadeOut( 'slow' );

    let message = '';
    if( data.conn == 1 ){
      message += `${data.username} joined.`;
    }else{
      message += `${data.username} left.`;
    }

    connectMessage.text( message );
    connectMessage.fadeIn( 'slow' );
  }

  // Message to show this user when he disconnects
  const addDisconnectedMessage = () => {
    loginMessage.fadeOut( 'slow' );

    let message = '';
    message += 'You have been disconnected.';

    loginMessage.text( message );
    loginMessage.fadeIn( 'slow' );
  }

  // Message hat shows this user if he view his or the other users character
  const changeModelMessage = () => {
    switchMessage.fadeOut( 'slow' );

    let message = '';
    if( switched == true ){
      message += "Press C to see the other user's character.";
    }else{
      message += "Press C to see your character.";
    }

    switchMessage.text( message );
    switchMessage.fadeIn( 'slow' );
  }

// FUNCTIONS
  // Sets the client's pseudoname
  const setPseudoname = ( e ) => {
    e.preventDefault();
    pseudoname = pseudoInput.val();

    switchPages();
    changeModelMessage();
    addUser( pseudoname );
  }

  // Switch which page to show
  const switchPages = () => {
    if( connected == false ){
      loginPage.fadeIn( 'slow' );
      connectPage.fadeOut( 'fast' );
      threeCanvas.fadeOut( 'fast' );
    }else 
    if( connected == true ){
      loginPage.fadeOut( 'fast' );
      connectPage.fadeIn( 'slow' );
      threeCanvas.fadeIn( 'slow' ); 
    }
  }

  // When key 'c' is pressed
  const keyPressed = ( e ) => {
    let keycode = ( e.keyCode ? e.keyCode : e.which );
    if( keycode == '67' ){    // If the pressed key is 'C'
      if( pseudoname ){
        if( switched == true ){
          switched == false;
        }else{
          switched == true;
        }
        switchModel();
      }
    }
  }

  // Switch which three.js character model to show (this users / the other users)
  const switchModel = () => {
    if( switched == true ){
//if true -> show MY model & switchModel change text
    }else{
//if false -> show OTHERS model & switchModel change text
    }
    changeModelMessage();
  }

// EVENTHANDLERS
  // Click event on button of form
  formButton.click(setPseudoname);
  
  // Keyboard event on key C 
  $('document').keypress( keyPressed );
  

// WEBSOCKET
  // Whenever the server emits 'login', data = addedUser : true
  socket.on('login', function (data) {
    connected = data.addedUser;
    switchPages();
  });

  const addUser = ( pseudoname ) => {
    if( pseudoname ){
      // Send pseudoname to the server
      socket.emit('add-user', pseudoname);
    }
  }

  // When server emits 'user-joined', data = username, conn : 1
  socket.on('user-joined', data => {
    addUserMessage(data);
    console.log(`${data.username} joined. ${data.conn}`); 
  });

  // When server emits 'user-left, data = username, conn : 0
  socket.on('user-left', data => {
    addUserMessage(data);
    console.log(`${data.username} left. ${data.conn}`);
  })

  // When user gets disconnected
  socket.on('disconnect', () => {
    connected = false;
    switchPages();
    addDisconnectedMessage();
    console.log(`You've been disconnected`);
  });

  // When user gets auto reconnected
  socket.on('reconnect', function () {
    console.log(`you've been reconnected`);
    addUser( pseudoname );
  });

  // When reconnection error
  socket.on('reconnect_error', function () {
    console.log(`attempt to reconnect has failed`);
  });

  // When server emits 'from-client', data = PoseNet keypoints
  socket.on('from-client', netData => {
    keypoints = JSON.parse(netData.data);
  });

  //console.log(keypoints);
});