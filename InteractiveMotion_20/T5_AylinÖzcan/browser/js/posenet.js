// Adapted from code at https://github.com/ionif/posenetToThreejs/blob/6768b874f378084fd9b2717084c8e75917ef6b6a/posenet/demos/camera.js

import * as posenet from '@tensorflow-models/posenet';
import io from 'socket.io-client';
  
const socket = io.connect(':3000');

const width = 600;
const height = 500;

  // Check on the device that you are viewing it from
  const isAndroid = () => {
    return /Android/i.test( navigator.userAgent );
  }

  const isiOS = () => {
    return /iPhone|iPad|iPod/i.test( navigator.userAgent );
    }

  const isMobile = () => {
    return isAndroid() || isiOS();
  }

  // Load camera
  async function setupCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Browser API navigator.mediaDevices.getUserMedia not available');
    }
  
    const video = document.getElementById( 'video') ;
    video.width = width;
    video.height = height;
  
    const mobile = isMobile();
    const stream = await navigator.mediaDevices.getUserMedia({
      'audio': false,
      'video': {
        facingMode: 'user',
        width: mobile ? undefined : width,
        height: mobile ? undefined : height,
      },
    });
  
    video.srcObject = stream;
  
    return new Promise((resolve) => {
      video.onloadedmetadata = () => resolve( video );
    });
  }
  
  async function loadVideo() {
    const video = await setupCamera();
      video.play();
  
    return video;
  }

  // Net will hold the posenet model
  let net; 

  function detectPoseInRealTime( video, net ){
    const canvas = document.getElementById( 'output' );
    const ctx = canvas.getContext( '2d' );

    canvas.width = width;
    canvas.height = hieght;

    async function detect(){
      net = await posenet.load();

      // Store all the poses
      let poses = [];

      const pose = await net.estimateSinglePose( video, {
        imageScaleFactor : 0.75,
        flipHorizontal : false,
        outputStride: 32
      });
  
      poses.push(pose);

      ctx.clearRect(0, 0, videoWidth, videoHeight);

      const showVideo = true;

      if (showVideo) {
        ctx.save();
        ctx.scale(-1, 1);
        ctx.translate( - v, 0);
        ctx.filter = 'blur(3px) grayscale(100%)';
        ctx.drawImage( video, 0, 0, width, height );
        ctx.restore();
      }


      // Show a pose if the confidence is above 0.2
      const minPoseConfidence = 0.50;
      // Show a body part if confidence is above 0.3
      //const minPartConfidence = 0.50;


      poses.forEach(({ score, keypoints }) => {
        if (score >= minPoseConfidence) {
          // Send keypoints to websocket server
          socket.emit('from-client', JSON.stringify( keypoints ));

          //drawKeypoints(keypoints, minPartConfidence, ctx);
          //drawSkeleton(keypoints, minPartConfidence, ctx);
        }
      });

      requestAnimationFrame( detect );
    }

    detect();
  }

/**
 * Kicks off the demo by loading the posenet model, finding and loading
 * available camera devices, and setting off the detectPoseInRealTime function.
 */
async function bindPage() {
  const net = await posenet.load();

  let video;

  try {
    video = await loadVideo();
  } catch (e) {
    let info = document.getElementById( 'info' );
    info.innerText = 'this browser does not support video capture,' +
        'or this device does not have a camera';
    //.style.display = 'block';
    throw e;
  }

  detectPoseInRealTime(video, net);
}

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

// kick off the demo
bindPage();

