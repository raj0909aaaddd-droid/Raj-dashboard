import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';

// 1. Setup Scene, Camera, and Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1.5, 5); // Position camera a bit high and back

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Optimized for mobile screens
document.body.appendChild(renderer.domElement);

// 2. Add Lighting (Crucial for 3D realism)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); // Soft base light
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// 3. Variables for our Robot, Animation, and Touch Tracking
let robot;
let mixer; // Handles the animations
const clock = new THREE.Clock();

// Target rotation coordinates based on touch
let targetRotationX = 0;
let targetRotationY = 0;

// 4. Load the Robot GLB Model
const loader = new GLTFLoader();
loader.load('robot.glb', function (gltf) {
    robot = gltf.scene;
    
    // Scale and position the robot (adjust these numbers if your robot is too big/small)
    robot.scale.set(1, 1, 1);
    robot.position.set(0, -1, 0); 
    scene.add(robot);

    // Play the first animation found in the file
    if (gltf.animations && gltf.animations.length > 0) {
        mixer = new THREE.AnimationMixer(robot);
        const action = mixer.clipAction(gltf.animations[0]);
        action.play();
    }
}, undefined, function (error) {
    console.error('Error loading the robot model:', error);
});

// 5. Mobile Touch Controls (Look at finger)
function onTouchMove(event) {
    // Get the first finger touching the screen
    const touch = event.touches[0];
    
    // Calculate how far the finger is from the center of the screen
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;
    
    // Convert touch position to rotation angles
    targetRotationY = (touch.clientX - windowHalfX) * 0.005; 
    targetRotationX = (touch.clientY - windowHalfY) * 0.002;
}

// Listen for finger dragging
window.addEventListener('touchmove', onTouchMove, { passive: false });
window.addEventListener('touchstart', onTouchMove, { passive: false });

// Handle phone rotation / screen resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// 6. The Animation Loop
function animate() {
    requestAnimationFrame(animate);

    // Update the animation frame
    const delta = clock.getDelta();
    if (mixer) {
        mixer.update(delta);
    }

    // Smoothly rotate the robot towards the target touch rotation
    if (robot) {
        // Smoothly interpolate current rotation to target rotation
        robot.rotation.y += (targetRotationY - robot.rotation.y) * 0.1;
        
        // Optional: slight up/down tilt (remove if it looks weird for your specific model)
        robot.rotation.x += (targetRotationX - robot.rotation.x) * 0.1; 
    }

    renderer.render(scene, camera);
}

// Start the loop
animate();
