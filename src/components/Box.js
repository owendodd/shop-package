import * as THREE from 'three';
import { DecalGeometry } from 'three/examples/jsm/geometries/DecalGeometry.js';


export function createBox(length, width, height, renderer) {
    const group = new THREE.Group();
    
    // Create simple box geometry
    const geometry = new THREE.BoxGeometry(length, height, width);
    geometry.computeVertexNormals();

    // Load all textures
    const textureLoader = new THREE.TextureLoader();
    const albedoTexture = textureLoader.load('/textures/cardboard-albedo.jpg');
    const heightTexture = textureLoader.load('/textures/cardboard-height.jpg');
    const normalTexture = textureLoader.load('/textures/cardboard-normal.jpg');
    const roughnessTexture = textureLoader.load('/textures/cardboard-roughness.jpg');

    // Configure all textures
    [albedoTexture, heightTexture, normalTexture, roughnessTexture].forEach(texture => {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(16, 16); // Reduced repeat for larger texture scale
        texture.colorSpace = THREE.SRGBColorSpace;
    });

    const material = new THREE.MeshPhysicalMaterial({
        color: 0xf5e6d3,
        roughness: 0.1, // Reduced roughness for more visible texture
        metalness: 0.0,
        reflectivity: 0, // Increased reflectivity
        clearcoat: 0, // Increased clearcoat
        clearcoatRoughness: 0.2,
        map: albedoTexture,
        bumpMap: heightTexture,
        bumpScale: 0.8, // Increased bump scale
        normalMap: normalTexture,
        normalScale: new THREE.Vector2(1.5, 1.5), // Increased normal scale
        roughnessMap: roughnessTexture,
        envMapIntensity: 1.5 // Increased environment map intensity
    });

    const box = new THREE.Mesh(geometry, material);
    box.castShadow = true;
    box.receiveShadow = true;
    group.add(box);

    // Add label with texture
    const labelSize = 0.4;
    const labelTexture = textureLoader.load('/images/label.png');
    labelTexture.colorSpace = THREE.SRGBColorSpace;
    const labelMaterial = new THREE.MeshPhysicalMaterial({
        map: labelTexture,
        transparent: true,
        roughness: 0.2,
        metalness: 0.0,
        reflectivity: 0.15,
        clearcoat: 0.3,
        clearcoatRoughness: 0.2,
        depthTest: true,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -4,
        side: THREE.DoubleSide
    });
    const label = new THREE.Mesh(
        new DecalGeometry(box, new THREE.Vector3(-length/2 + 0.15 + labelSize/2, height/2 - 0.15 - labelSize/2, width/2), new THREE.Euler(0, 0, 0), new THREE.Vector3(labelSize, labelSize, labelSize)),
        labelMaterial
    );
    group.add(label);

    // Add Fragile sticker
    const stickerSize = 0.4;
    const stickerTexture = textureLoader.load('/images/fragile.png');
    stickerTexture.colorSpace = THREE.SRGBColorSpace;
    const stickerMaterial = new THREE.MeshPhysicalMaterial({
        map: stickerTexture,
        transparent: true,
        roughness: 0.3,
        metalness: 0.0,
        reflectivity: 0.2,
        clearcoat: 0.4,
        clearcoatRoughness: 0.2,
        depthTest: true,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -4,
        side: THREE.DoubleSide
    });
    const sticker = new THREE.Mesh(
        new DecalGeometry(box, new THREE.Vector3(length/2, height/2 - 0.4, width/2 - 0.4), new THREE.Euler(0, Math.PI / 2, Math.PI / 12), new THREE.Vector3(stickerSize, stickerSize * 0.6, stickerSize)),
        stickerMaterial
    );
    group.add(sticker);

    // Add logo decal
    const logoWidth = 1.4;
    const logoHeight = logoWidth * 0.25;
    const logoTexture = textureLoader.load('/images/logo.png');
    logoTexture.colorSpace = THREE.SRGBColorSpace;
    logoTexture.minFilter = THREE.LinearFilter;
    logoTexture.magFilter = THREE.LinearFilter;
    logoTexture.generateMipmaps = true;
    logoTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    const logoMaterial = new THREE.MeshPhysicalMaterial({
        map: logoTexture,
        transparent: true,
        roughness: 0.6,
        metalness: 0.0,
        reflectivity: 0.1,
        clearcoat: 0.1,
        clearcoatRoughness: 0.1,
        depthTest: true,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        side: THREE.DoubleSide
    });
    const logo = new THREE.Mesh(
        new DecalGeometry(box, new THREE.Vector3(-length/2, 0, 0), new THREE.Euler(0, -Math.PI / 2, 0), new THREE.Vector3(logoWidth, logoHeight, logoWidth)),
        logoMaterial
    );
    group.add(logo);

    // Add tape decals
    const tapeHeight = 0.3;
    
    // Load tape textures
    const tapeAlbedoTexture = textureLoader.load('/textures/tape-albedo.jpg');
    const tapeHeightTexture = textureLoader.load('/textures/tape-height.jpg');
    const tapeNormalTexture = textureLoader.load('/textures/tape-normal.jpg');
    const tapeRoughnessTexture = textureLoader.load('/textures/tape-roughness.jpg');

    // Configure tape textures
    [tapeAlbedoTexture, tapeHeightTexture, tapeNormalTexture, tapeRoughnessTexture].forEach(texture => {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(4, 4);
        texture.colorSpace = THREE.SRGBColorSpace;
    });

    const tapeMaterial = new THREE.MeshPhysicalMaterial({
        map: tapeAlbedoTexture,
        bumpMap: tapeHeightTexture,
        bumpScale: 0.02,
        normalMap: tapeNormalTexture,
        normalScale: new THREE.Vector2(0.5, 0.5),
        roughnessMap: tapeRoughnessTexture,
        roughness: 0.7,
        metalness: 0.0,
        reflectivity: 0.1,
        clearcoat: 0.2,
        clearcoatRoughness: 0.3,
        transparent: true,
        opacity: 0.3,
        depthTest: true,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -4,
        side: THREE.DoubleSide
    });

    // Top cross tape
    const topTape = new THREE.Mesh(
        new DecalGeometry(box, new THREE.Vector3(0, height/2, 0), new THREE.Euler(Math.PI / 2, Math.PI / 1.5, 0), new THREE.Vector3(length, tapeHeight, length)),
        tapeMaterial
    );
    group.add(topTape);

    const perpendicularTape = new THREE.Mesh(
        new DecalGeometry(box, new THREE.Vector3(0, height/2, 0), new THREE.Euler(Math.PI / 1.5, 0, Math.PI / 2), new THREE.Vector3(width, tapeHeight, width)),
        tapeMaterial
    );
    group.add(perpendicularTape);


    return group;
} 