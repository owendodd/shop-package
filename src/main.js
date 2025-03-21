import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import './styles/main.css';
import { createBox } from './components/Box.js';

// Grain shader
const GrainShader = {
    uniforms: {
        tDiffuse: { value: 0.2 },
        time: { value: 0 },
        nIntensity: { value: 0.02 },
        sIntensity: { value: 0.1 },
        sCount: { value: 206 }
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float time;
        uniform float nIntensity;
        uniform float sIntensity;
        uniform float sCount;
        uniform sampler2D tDiffuse;
        varying vec2 vUv;

        float random(vec2 co) {
            return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 23758.5453);
        }

        void main() {
            vec4 color = texture2D(tDiffuse, vUv);
            
            // Add noise with opacity
            float noise = random(vUv + time * 0.1);
            vec4 noiseColor = vec4(noise, noise, noise, nIntensity);
            color = mix(color, noiseColor, nIntensity);
            
            // Add scanlines
            float scanline = sin(vUv.y * sCount) * sIntensity;
            color.rgb += scanline;
            
            gl_FragColor = color;
        }
    `
};

// Create sky gradient texture
function createSkyTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#B3D9FF'); // More saturated light blue at top
    gradient.addColorStop(0.5, '#CCE6FF'); // More saturated middle blue
    gradient.addColorStop(1, '#E6F2FF'); // More saturated bottom blue

    // Fill background
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Create a temporary canvas for clouds
    const cloudCanvas = document.createElement('canvas');
    cloudCanvas.width = canvas.width;
    cloudCanvas.height = canvas.height;
    const cloudCtx = cloudCanvas.getContext('2d');

    // Set up blur filter
    cloudCtx.filter = 'blur(20px)';

    // Draw multiple layers of clouds with different opacities
    for (let layer = 0; layer < 3; layer++) {
        const opacity = 0.05 + (layer * 0.05); // Increasing opacity for each layer
        cloudCtx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        
        for (let i = 0; i < 15; i++) {
            const x = Math.random() * cloudCanvas.width;
            const y = Math.random() * cloudCanvas.height;
            const size = 150 + Math.random() * 250;
            cloudCtx.beginPath();
            cloudCtx.arc(x, y, size, 0, Math.PI * 2);
            cloudCtx.fill();
        }
    }

    // Draw blurred clouds onto main canvas
    ctx.drawImage(cloudCanvas, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
}

// Scene setup
const scene = new THREE.Scene();
scene.background = createSkyTexture();
scene.environment = null; // Ensure no environment map is set
scene.fog = new THREE.Fog(0xF0F8FF, 5, 15); // Light blue fog, starting at 5 units, fully opaque at 15 units
const renderContainer = document.querySelector('.render-container');
const camera = new THREE.OrthographicCamera(
    renderContainer.clientWidth / -200,
    renderContainer.clientWidth / 200,
    renderContainer.clientHeight / 200,
    renderContainer.clientHeight / -200,
    0.1,
    1000
);

const renderer = new THREE.WebGLRenderer({ 
    antialias: true,
    alpha: true 
});
renderer.setSize(renderContainer.clientWidth, renderContainer.clientHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderContainer.appendChild(renderer.domElement);

// Post-processing setup
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const grainPass = new ShaderPass(GrainShader);
grainPass.uniforms.nIntensity.value = 0.15; // Reduced from 0.5 to 0.15 for more subtle grain
grainPass.uniforms.sIntensity.value = 0.0; // Removed scanlines completely
grainPass.uniforms.sCount.value = 4096;
composer.addPass(grainPass);

// Lighting
scene.clear();

// Soft ambient light
const ambientLight = new THREE.AmbientLight(0xfff1e6, 4.5);
scene.add(ambientLight);

// Main directional light for shadows
const mainLight = new THREE.DirectionalLight(0xfff1e6, 6.5);
mainLight.position.set(5, 3, 5);
mainLight.castShadow = true;
mainLight.shadow.radius = 2;
mainLight.shadow.bias = -0.001;
scene.add(mainLight);

// Fill light for softer shadows
const fillLight = new THREE.DirectionalLight(0xffe4d6, 2.8);
fillLight.position.set(-5, 3, -5);
scene.add(fillLight);

// Rim light for edge definition
const rimLight = new THREE.DirectionalLight(0xffffff, 1.8);
rimLight.position.set(0, -5, 5);
scene.add(rimLight);

// Add purple accent light for cross lighting
const purpleLight = new THREE.DirectionalLight(0xFCCAFF, 1.8);
purpleLight.position.set(-3, 3, 3);
scene.add(purpleLight);

// Add second purple cross light with more saturation
const saturatedPurpleLight = new THREE.DirectionalLight(0xE6B3FF, 2.0);
saturatedPurpleLight.position.set(3, -6, -3);
scene.add(saturatedPurpleLight);

// Add mouse rotation handling
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let targetRotation = { x: 0, y: 0 };
let currentRotation = { x: 0, y: 0 };

renderContainer.addEventListener('mousedown', (e) => {
    isDragging = true;
    previousMousePosition = {
        x: e.clientX,
        y: e.clientY
    };
});

renderContainer.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    const deltaMove = {
        x: e.clientX - previousMousePosition.x,
        y: e.clientY - previousMousePosition.y
    };

    targetRotation.y += deltaMove.x * 0.01;
    targetRotation.x += deltaMove.y * 0.1;

    // Limit vertical rotation
    targetRotation.x = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, targetRotation.x));

    previousMousePosition = {
        x: e.clientX,
        y: e.clientY
    };
});

renderContainer.addEventListener('mouseup', () => {
    isDragging = false;
});

renderContainer.addEventListener('mouseleave', () => {
    isDragging = false;
});

// Create box
let box = createBox(2, 2, 2, renderer);
box.position.y = 0.8; // Set initial position higher
scene.add(box);

// Set up isometric camera position
const distance = 8;
const angle = Math.PI / 4; // 45 degrees
camera.position.set(
    distance * Math.cos(angle),
    distance * 0.3,
    distance * Math.sin(angle)
);
camera.lookAt(0, 0.2, 0);

// Animation variables
let time = 0;
const baseBounceHeight = 0.1;
const baseBounceSpeed = 2;
const rotationSpeed = 0.5;

// Controls
const lengthInput = document.getElementById('length');
const widthInput = document.getElementById('width');
const heightInput = document.getElementById('height');
const weightInput = document.getElementById('weight');

// Update display values
function updateDisplayValues() {
    const length = parseFloat(lengthInput.value);
    const width = parseFloat(widthInput.value);
    const height = parseFloat(heightInput.value);
    const weight = parseFloat(weightInput.value);

    // Convert kg to lbs (1 kg = 2.20462 lbs)
    const weightInLbs = (weight * 2.20462).toFixed(1);
    document.getElementById('weight-display').textContent = `${weight.toFixed(1)} kg / ${weightInLbs} lbs`;
    document.getElementById('dimensions-display').textContent = 
        `${(length * 10).toFixed(0)} x ${(width * 10).toFixed(0)} x ${(height * 10).toFixed(0)} cm`;
}

function updateBox() {
    const length = parseFloat(lengthInput.value);
    const width = parseFloat(widthInput.value);
    const height = parseFloat(heightInput.value);
    
    scene.remove(box);
    box = createBox(length, height, width, renderer);
    box.position.y = 0.8; // Set base position higher
    scene.add(box);
    updateDisplayValues();
}

lengthInput.addEventListener('input', updateBox);
widthInput.addEventListener('input', updateBox);
heightInput.addEventListener('input', updateBox);
weightInput.addEventListener('input', updateDisplayValues);

// Initial update
updateDisplayValues();

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    time += 0.016;

    // Update grain shader time
    grainPass.uniforms.time.value = time * 0.00001; // Slowed down significantly

    // Smooth rotation interpolation
    if (!isDragging) {
        currentRotation.x += (targetRotation.x - currentRotation.x) * 0.1;
        currentRotation.y += (targetRotation.y - currentRotation.y) * 0.1;
    }

    // Apply rotations
    box.rotation.x = currentRotation.x;
    box.rotation.y = currentRotation.y + (rotationSpeed * time);

    // Weight-based bounce
    const weight = parseFloat(weightInput.value);
    const bounceHeight = baseBounceHeight * (weight / 5);
    const bounceSpeed = baseBounceSpeed * (1 + (weight - 5) / 10);
    const t = time * bounceSpeed;
    const bounce = Math.sin(t) * bounceHeight;
    const weightFactor = Math.sin(t + Math.PI/2) * 0.3;
    box.position.y = 0.8 + bounce + weightFactor * (weight / 10);

    // Use composer instead of renderer
    composer.render();
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.left = renderContainer.clientWidth / -200;
    camera.right = renderContainer.clientWidth / 200;
    camera.top = renderContainer.clientHeight / 200;
    camera.bottom = renderContainer.clientHeight / -200;
    camera.updateProjectionMatrix();
    renderer.setSize(renderContainer.clientWidth, renderContainer.clientHeight);
    composer.setSize(renderContainer.clientWidth, renderContainer.clientHeight);
});

animate(); 