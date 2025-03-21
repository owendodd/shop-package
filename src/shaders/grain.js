export const vertexShader = `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    
    void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

export const fragmentShader = `
    uniform float time;
    uniform vec3 baseColor;
    uniform sampler2D grainTexture;
    uniform float grainScale;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
        // Base color with lighting
        vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
        float diffuse = max(dot(vNormal, lightDir), 0.0);
        vec3 color = baseColor * (diffuse * 0.7 + 0.3);

        // Animated grain effect
        vec2 grainUv = vUv * 8.0 + vec2(time * 0.1);
        vec4 grainColor = texture2D(grainTexture, grainUv);
        
        // Mix grain with base color
        color = mix(color, color * grainColor.rgb, grainScale);

        // Add subtle rim lighting
        float rimLight = 1.0 - max(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0);
        color += vec3(1.0) * pow(rimLight, 3.0) * 0.3;

        gl_FragColor = vec4(color, 1.0);
    }
`; 