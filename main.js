import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';

// 1. Setup Scene, Camera, and Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 1.2, 4); // Adjusted for a dramatic close-up

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

// 2. CINEMATIC STUDIO LIGHTING (For the "Phantom" Look)
// A soft base light so shadows aren't pitch black
scene.add(new THREE.AmbientLight(0xffffff, 0.2));

// Key Light: The main bright light from the front-right
const keyLight = new THREE.DirectionalLight(0xffffff, 3);
keyLight.position.set(2, 3, 2);
scene.add(keyLight);

// Rim Light: Shines from behind to create a glowing white outline around the robot
const rimLight = new THREE.DirectionalLight(0xffffff, 5);
rimLight.position.set(-2, 3, -4);
scene.add(rimLight);

// Fill Light: A slight blueish tint from the left to add depth
const fillLight = new THREE.DirectionalLight(0x88bbff, 1.5);
fillLight.position.set(-3, 1, 2);
scene.add(fillLight);

// 3. Variables for the Robot and Interaction
let robot;
let targetRotationX = 0;
let targetRotationY = 0;

// 4. Load the Robot GLB Model
const loader = new GLTFLoader();
loader.load('robot.glb', function (gltf) {
    robot = gltf.scene;
    
    // Scale down if necessary. You might need to change 1 to 0.5 or 2 depending on the model's base size!
    robot.scale.set(1, 1, 1);
    robot.position.set(0, -1, 0); 

    // FORCE REALISTIC METALLIC MATERIALS
    robot.traverse((child) => {
        if (child.isMesh && child.material) {
            // This forces the robot to be smooth and highly reflective
            child.material.metalness = 0.7; // 0 is plastic, 1 is pure metal
            child.material.roughness = 0.2; // 0 is a mirror, 1 is matte
            child.material.needsUpdate = true;
        }
    });

    scene.add(robot);
}, undefined, function (error) {
    console.error('Error loading the robot model:', error);
});

// 5. Track Mouse and Touch to make the robot look around
function onPointerMove(event) {
    // Check if it's a touch screen or a mouse
    let clientX = event.touches ? event.touches[0].clientX : event.clientX;
    let clientY = event.touches ? event.touches[0].clientY : event.clientY;

    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;
    
    // Calculate how far the input is from the center (adjusted for smoother turning)
    targetRotationY = (clientX - windowHalfX) * 0.003; 
    targetRotationX = (clientY - windowHalfY) * 0.002;
}

// Listen for both desktop mouse moves and mobile finger drags
window.addEventListener('mousemove', onPointerMove);
window.addEventListener('touchmove', onPointerMove, { passive: false });
window.addEventListener('touchstart', onPointerMove, { passive: false });

// Handle screen resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// 6. The Animation Loop
function animate() {
    requestAnimationFrame(animate);

    // Smoothly rotate the robot towards the target touch/mouse rotation
    if (robot) {
        // The 0.05 controls the "lag" speed. Lower number = heavier, slower robot movement
        robot.rotation.y += (targetRotationY - robot.rotation.y) * 0.05;
        robot.rotation.x += (targetRotationX - robot.rotation.x) * 0.05; 
    }

    renderer.render(scene, camera);
}

// Start the loop
animate();
