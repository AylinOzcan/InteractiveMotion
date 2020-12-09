import * as THREE from 'https://unpkg.com/three@0.119.1/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.119.1/examples/jsm/loaders/GLTFLoader.js';

console.log(keypoints);
// GLOBAL VARIABLES
let camera, 
  scene, 
  renderer;
let rightArm, 
  rightElbow, 
  rightHand;
let leftArm,
  leftElbow,
  leftHand;

// INITIALISE
function init(){
  // Camera
  camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.01, 10 );
  camera.position.set( 2, 2, - 2 );

  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0xffcc99 );

  // Light
  const light = new THREE.HemisphereLight( 0xbbbbff, 0x444422 );
	light.position.set( 0, 1, 0 );
	scene.add( light );
  
  // Model
  const loader = new GLTFLoader();
  loader.load( './asset/character_f01.glb', function ( gltf ) {

    const model = gltf.scene;

    // Right arm
    rightArm = model.getObjectByName( 'mixamorigRightArm' );
    rightElbow = model.getObjectByName( 'mixamorigRightForeArm' );
    rightHand = model.getObjectByName( 'mixamorigRightHand' );
  
    // Left arm
    leftArm = model.getObjectByName( 'mixamorigLeftArm' );
    leftElbow = model.getObjectByName( 'mixamorigLeftForeArm' );
    leftHand = model.getObjectByName( 'mixamorigLeftHand' );

    // Right leg
    rightUpLeg = model.getObjectByName( 'mixamorigRightUpLeg' );
    rightLeg = model.getObjectByName( 'mixamorigRightLeg' );
    rightFoot = model.getObjectByName( 'mixamorigRightFoot' );

    // Left Leg
    leftUpLeg = model.getObjectByName( 'mixamorigLeftUpLeg' );
    leftLeg = model.getObjectByName( 'mixamorigLeftLeg' );
    leftFoot = model.getObjectByName( 'mixamorigLeftFoot' );
  
    scene.add( model );
  });

  // Renderer
  renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );

	window.addEventListener( 'resize', onWindowResize, false );
}

// RENDER
function render(){
  requestAnimationFrame( render );
  moveModel();
  renderer.render( scene, camera );
}

// MOUVEMENT OF MODEL
const moveModel = () => {
  if(keypoints != null){
    
    // Right arm
    if(rightArm){
      if(rightElbow){
        if(keypoints[7].score > 0.50){
          if(keypoints[5].score > 0.50){
            let diagX = keypoints[5].position.x - keypoints[7].position.x;
            let diagY = keypoints[5].position.y - keypoints[7].position.y;
            let diagDist = Math.sqrt( diagX * diagX + diagY * diagY ) ;

            let normX = keypoints[5].position.x - keypoints[7].position.x;
            let normDist = Math.sqrt( normX * normX );

            rightArm.rotation.z = Math.acos( normDist / diagDist );
          }
        }
        if(rightHand){
          if (keypoints[9].score > 0.50) {
            let diagX = keypoints[7].position.x - keypoints[9].position.x;
            let diagY = keypoints[7].position.y - keypoints[9].position.y;
            let diagDist = Math.sqrt( diagX * diagX + diagY * diagY );

            let normX = keypoints[7].position.x - keypoints[9].position.x;
            let normDist = Math.sqrt( normX * normX );

            rightElbow.rotation.z = Math.acos( normDist / diagDist );
          }
        }
      }
    }
  }
  // Left arm
  if(leftArm){
    if(leftElbow){
      if(keypoints[8] > 0.50){
        if(keypoints[6] > 0.50){
          let diagX = keypoints[6].position.x - keypoints[8].position.x;
          let diagY = keypoints[6].position.y - keypoints[8].position.y;
          let diagDist = Math.sqrt(diagX * diagX + diagY * diagY);

          let normX = keypoints[6].position.x - keypoints[8].position.x;
          let normDist = Math.sqrt(normX * normX);

          leftArm.rotation.z = Math.acos(normDist / diagDist);
        }
        if(leftHand){
          if(keypoints[10] > 0.50){
            let diagX = keypoints[8].position.x - keypoints[10].position.x;
            let diagY = keypoints[8].position.y - keypoints[10].position.y;
            let diagDist = Math.sqrt(diagX * diagX + diagY * diagY);

            let normX = keypoints[8].position.x - keypoints[10].position.x;
            let normDist = Math.sqrt(normX * normX);

            leftElbow.rotation.z = Math.acos(normDist / diagDist);
          }
        }
      }
    }
  }

  // Right leg

  // Left leg

  // Head

  // Spine / Schoulders (?)

}

// RESIZE ON WINDOW
const onWindowResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );
}

init();
render();