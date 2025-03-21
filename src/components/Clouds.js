import * as THREE from 'three';

function createCloudTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
        const value = Math.random() * 0.3 + 0.7;
        data[i] = data[i + 1] = data[i + 2] = value * 255;
        data[i + 3] = (value - 0.7) * 255 * 2; // Adjust alpha for subtle effect
    }
    
    ctx.putImageData(imageData, 0, 0);
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    return texture;
}

export function createClouds() {
    const clouds = [];
    const cloudConfigs = [
        { size: 20, y: 8, speed: 0.0002 },
        { size: 15, y: 10, speed: 0.0003 },
        { size: 25, y: 12, speed: 0.0001 }
    ];

    cloudConfigs.forEach(config => {
        const geometry = new THREE.PlaneGeometry(config.size, config.size);
        const material = new THREE.MeshBasicMaterial({
            map: createCloudTexture(),
            transparent: true,
            opacity: 0.15,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        const cloud = new THREE.Mesh(geometry, material);
        cloud.position.set(
            Math.random() * 30 - 15,
            config.y,
            Math.random() * 10 - 5
        );
        cloud.rotation.x = -Math.PI / 2;
        cloud.userData.speed = config.speed;

        clouds.push(cloud);
    });

    return clouds;
}

export function updateClouds(cloudLayers, deltaTime) {
    cloudLayers.forEach(cloud => {
        cloud.material.map.offset.x += cloud.userData.speed;
        cloud.material.map.offset.y += cloud.userData.speed * 0.5;
        cloud.material.map.needsUpdate = true;
    });
} 