import * as THREE from 'three';

export function createScene() {
    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    // Get container dimensions
    const container = document.querySelector('.render-container');
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Create camera
    const camera = new THREE.OrthographicCamera(
        width / -200,
        width / 200,
        height / 200,
        height / -200,
        0.1,
        1000
    );

    // Set up isometric camera position
    const distance = 8;
    const angle = Math.PI / 4; // 45 degrees
    camera.position.set(
        distance * Math.cos(angle),
        distance * 0.3,
        distance * Math.sin(angle)
    );
    camera.lookAt(0, 0.2, 0);

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true 
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Append to container
    container.appendChild(renderer.domElement);

    return { scene, camera, renderer };
}

export function setupLighting(scene) {
    scene.clear();
    
    // Soft ambient light
    const ambientLight = new THREE.AmbientLight(0xfff1e6, 4.0);
    scene.add(ambientLight);

    // Main directional light for shadows
    const mainLight = new THREE.DirectionalLight(0xfff1e6, 8);
    mainLight.position.set(5, 8, 5);
    mainLight.castShadow = true;
    mainLight.shadow.radius = 2;
    mainLight.shadow.bias = -0.001;
    scene.add(mainLight);

    // Fill light for softer shadows
    const fillLight = new THREE.DirectionalLight(0xffe4d6, 2);
    fillLight.position.set(-5, 3, -5);
    scene.add(fillLight);

    // Rim light for edge definition
    const rimLight = new THREE.DirectionalLight(0xffffff, 4);
    rimLight.position.set(0, -5, 5);
    scene.add(rimLight);

    // Add purple accent light for cross lighting
    const purpleLight = new THREE.DirectionalLight(0xFCCAFF, 8);
    purpleLight.position.set(-3, 3, 3);
    scene.add(purpleLight);

    // Add second purple cross light with more saturation
    const saturatedPurpleLight = new THREE.DirectionalLight(0xE6B3FF, 8);
    saturatedPurpleLight.position.set(3, -6, -3);
    scene.add(saturatedPurpleLight);
}

// Setup rotation-based drag controls
export function setupDragControls(box, camera, renderer) {
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let targetRotation = { x: 0, y: 0 };
    let currentRotation = { x: 0, y: 0 };

    const container = renderer.domElement;

    container.addEventListener('mousedown', (e) => {
        isDragging = true;
        previousMousePosition = {
            x: e.clientX,
            y: e.clientY
        };
    });

    container.addEventListener('mousemove', (e) => {
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

    container.addEventListener('mouseup', () => {
        isDragging = false;
    });

    container.addEventListener('mouseleave', () => {
        isDragging = false;
    });

    return {
        update: () => {
            if (!isDragging) {
                currentRotation.x += (targetRotation.x - currentRotation.x) * 0.1;
                currentRotation.y += (targetRotation.y - currentRotation.y) * 0.1;
            }
            return currentRotation;
        },
        isActive: () => isDragging
    };
} 