// Import Three.js directly from a CDN
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

// --- 1. SETUP SCENE, CAMERA, RENDERER ---
const canvas = document.querySelector('#webgl-canvas');
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
// Start camera at Scene 1 position
camera.position.set(0, 1, 5); 

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// --- 2. LIGHTING ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(2, 5, 2);
scene.add(directionalLight);

// --- 3. 3D OBJECTS (PLACEHOLDERS) ---
// Scene 1: The Computer
const computerGeometry = new THREE.BoxGeometry(2, 1.5, 0.2);
const computerMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
const computer = new THREE.Mesh(computerGeometry, computerMaterial);
scene.add(computer);

// Scene 2: The LLM Hologram Node (Pushed back in Z-axis)
const llmGeometry = new THREE.SphereGeometry(1, 16, 16);
const llmMaterial = new THREE.MeshStandardMaterial({ color: 0x00ffcc, wireframe: true });
const llmNode = new THREE.Mesh(llmGeometry, llmMaterial);
llmNode.position.set(0, 0, -5);
scene.add(llmNode);

// Scene 3: Education/Skills Node (Panned Right)
const skillsGeometry = new THREE.OctahedronGeometry(1);
const skillsMaterial = new THREE.MeshStandardMaterial({ color: 0xff00cc, wireframe: true });
const skillsNode = new THREE.Mesh(skillsGeometry, skillsMaterial);
skillsNode.position.set(8, 0, -5);
scene.add(skillsNode);

// --- 4. SCROLL TRACKING ---
let scrollProgress = 0;

function calculateScroll() {
    // Calculate how far down the user has scrolled as a decimal from 0 to 1
    const scrollY = window.scrollY;
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    scrollProgress = Math.max(0, Math.min(1, scrollY / maxScroll));
}

window.addEventListener('scroll', calculateScroll);

// --- 5. ANIMATION & CAMERA RIG ---
// We use target vectors to smoothly "lerp" (glide) the camera
const currentCameraPos = new THREE.Vector3(0, 1, 5);
const targetCameraPos = new THREE.Vector3(0, 1, 5);
const currentLookAt = new THREE.Vector3(0, 0, 0);
const targetLookAt = new THREE.Vector3(0, 0, 0);

function animate() {
    requestAnimationFrame(animate);

    // Make the wireframe objects spin slowly
    llmNode.rotation.y += 0.005;
    skillsNode.rotation.x += 0.005;
    skillsNode.rotation.y += 0.005;

    // SCROLL LOGIC (The same 4 scenes we mapped out)
    const r = scrollProgress;

    // Scene 1: Orbiting the Computer (0% - 25%)
    if (r < 0.25) {
        const angle = r * Math.PI * 2;
        targetCameraPos.set(Math.sin(angle) * 5, 1, Math.cos(angle) * 5);
        targetLookAt.set(0, 0, 0);
    } 
    // Scene 2: Dive into the Monitor / LLM Focus (25% - 50%)
    else if (r >= 0.25 && r < 0.5) {
        const progress = (r - 0.25) * 4;
        targetCameraPos.set(0, 0, 5 - (progress * 10));
        targetLookAt.set(0, 0, -5);
    }
    // Scene 3: Pan Right to Education / Codebase (50% - 75%)
    else if (r >= 0.5 && r < 0.75) {
        const progress = (r - 0.5) * 4;
        targetCameraPos.set(progress * 8, 0, -5);
        targetLookAt.set(8, 0, -5);
    }
    // Scene 4: Look Down at Project Folders (75% - 100%)
    else {
        const progress = (r - 0.75) * 4;
        targetCameraPos.set(8, -progress * 5, -5);
        targetLookAt.set(8, -10, -5);
    }

    // Smoothly glide (lerp) current positions towards the target positions
    currentCameraPos.lerp(targetCameraPos, 0.05);
    currentLookAt.lerp(targetLookAt, 0.05);

    // Apply the positions to the actual camera
    camera.position.copy(currentCameraPos);
    camera.lookAt(currentLookAt);

    renderer.render(scene, camera);
}

// Handle window resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start the loop
animate();
  
