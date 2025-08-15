import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

interface OceanBackgroundProps {
  className?: string;
}

const OceanBackground: React.FC<OceanBackgroundProps> = ({ className = '' }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true,
      powerPreference: "high-performance"
    });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    mountRef.current.appendChild(renderer.domElement);

    // Create multiple ocean layers for depth
    const createOceanLayer = (depth: number, scale: number, speed: number) => {
      const geometry = new THREE.PlaneGeometry(100, 100, 50, 50);
      
      const material = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          depth: { value: depth },
          scale: { value: scale },
          speed: { value: speed },
          waveHeight: { value: 0.3 },
          waveFrequency: { value: 1.5 }
        },
        vertexShader: `
          uniform float time;
          uniform float depth;
          uniform float scale;
          uniform float speed;
          uniform float waveHeight;
          uniform float waveFrequency;
          
          varying vec3 vPosition;
          varying vec3 vNormal;
          varying float vDepth;
          
          void main() {
            vec3 pos = position;
            
            // Create multiple wave patterns
            float wave1 = sin(pos.x * waveFrequency + time * speed) * 
                         cos(pos.z * waveFrequency * 0.7 + time * speed * 0.8) * waveHeight;
            
            float wave2 = sin(pos.x * waveFrequency * 2.0 + time * speed * 1.2) * 
                         cos(pos.z * waveFrequency * 1.5 + time * speed * 0.6) * waveHeight * 0.5;
            
            float wave3 = sin(pos.x * waveFrequency * 0.5 + time * speed * 0.4) * 
                         cos(pos.z * waveFrequency * 1.2 + time * speed * 1.0) * waveHeight * 0.3;
            
            pos.y += (wave1 + wave2 + wave3) * scale;
            
            // Calculate normal for lighting
            vec3 tangent = vec3(1.0, waveFrequency * cos(pos.x * waveFrequency + time * speed), 0.0);
            vec3 bitangent = vec3(0.0, waveFrequency * cos(pos.z * waveFrequency + time * speed), 1.0);
            vNormal = normalize(cross(tangent, bitangent));
            
            vPosition = pos;
            vDepth = depth;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `,
        fragmentShader: `
          varying vec3 vPosition;
          varying vec3 vNormal;
          varying float vDepth;
          
          void main() {
            // Create ocean color gradient based on depth
            vec3 deepOcean = vec3(0.0, 0.1, 0.3);
            vec3 surfaceOcean = vec3(0.0, 0.4, 0.8);
            vec3 foamColor = vec3(0.8, 0.9, 1.0);
            
            float depthFactor = smoothstep(-50.0, 50.0, vPosition.y);
            vec3 oceanColor = mix(deepOcean, surfaceOcean, depthFactor);
            
            // Add foam effect
            float foam = smoothstep(0.8, 1.0, depthFactor);
            oceanColor = mix(oceanColor, foamColor, foam * 0.3);
            
            // Lighting
            vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
            float diffuse = max(dot(vNormal, lightDir), 0.0);
            vec3 color = oceanColor * (0.4 + 0.6 * diffuse);
            
            // Add depth variation
            float depthVariation = smoothstep(-50.0, 50.0, vPosition.y);
            color = mix(color * 0.6, color, depthVariation);
            
            // Transparency based on depth
            float alpha = 0.9 - vDepth * 0.1;
            
            gl_FragColor = vec4(color, alpha);
          }
        `,
        transparent: true,
        side: THREE.DoubleSide
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.y = depth;
      return { mesh, material };
    };

    // Create multiple ocean layers
    const oceanLayers = [
      createOceanLayer(0, 1.0, 0.5),    // Surface layer
      createOceanLayer(-5, 0.7, 0.3),   // Mid layer
      createOceanLayer(-10, 0.4, 0.2),  // Deep layer
    ];

    oceanLayers.forEach(layer => {
      scene.add(layer.mesh);
    });

    // Create atmospheric particles (like bubbles and light rays)
    const createAtmosphericParticles = () => {
      const particleCount = 300;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const sizes = new Float32Array(particleCount);
      const colors = new Float32Array(particleCount * 3);
      const speeds = new Float32Array(particleCount);

      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 200;
        positions[i * 3 + 1] = Math.random() * 100 - 50;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 200;
        
        sizes[i] = Math.random() * 3 + 1;
        speeds[i] = Math.random() * 0.5 + 0.1;
        
        // Vary colors between blue and cyan
        const colorVariation = Math.random();
        colors[i * 3] = 0.0 + colorVariation * 0.2;     // R
        colors[i * 3 + 1] = 0.5 + colorVariation * 0.5; // G
        colors[i * 3 + 2] = 0.8 + colorVariation * 0.2; // B
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      geometry.setAttribute('speed', new THREE.BufferAttribute(speeds, 1));

      const material = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 }
        },
        vertexShader: `
          attribute float size;
          attribute vec3 color;
          attribute float speed;
          uniform float time;
          varying vec3 vColor;
          varying float vAlpha;
          
          void main() {
            vec3 pos = position;
            
            // Create floating motion
            pos.y += sin(time * speed + position.x * 0.01) * 2.0;
            pos.x += cos(time * speed * 0.7 + position.z * 0.01) * 1.0;
            
            // Create breathing effect
            vAlpha = 0.3 + 0.7 * sin(time * speed + position.x * 0.1);
            
            vColor = color;
            
            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            gl_PointSize = size * (300.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          varying vec3 vColor;
          varying float vAlpha;
          
          void main() {
            vec2 center = gl_PointCoord - vec2(0.5);
            float dist = length(center);
            
            if (dist > 0.5) discard;
            
            float alpha = smoothstep(0.5, 0.0, dist) * vAlpha;
            gl_FragColor = vec4(vColor, alpha * 0.6);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });

      const particles = new THREE.Points(geometry, material);
      return particles;
    };

    const atmosphericParticles = createAtmosphericParticles();
    scene.add(atmosphericParticles);

    // Create light rays effect
    const createLightRays = () => {
      const rayCount = 20;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(rayCount * 6); // 2 points per ray
      const colors = new Float32Array(rayCount * 6);

      for (let i = 0; i < rayCount; i++) {
        const x = (Math.random() - 0.5) * 200;
        const z = (Math.random() - 0.5) * 200;
        
        // Ray start point (above)
        positions[i * 6] = x;
        positions[i * 6 + 1] = 50;
        positions[i * 6 + 2] = z;
        
        // Ray end point (below)
        positions[i * 6 + 3] = x + (Math.random() - 0.5) * 20;
        positions[i * 6 + 4] = -50;
        positions[i * 6 + 5] = z + (Math.random() - 0.5) * 20;
        
        // Color gradient
        const alpha = 0.1 + Math.random() * 0.2;
        colors[i * 6] = 0.7;     // R
        colors[i * 6 + 1] = 0.9; // G
        colors[i * 6 + 2] = 1.0; // B
        colors[i * 6 + 3] = 0.7; // R
        colors[i * 6 + 4] = 0.9; // G
        colors[i * 6 + 5] = 1.0; // B
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const material = new THREE.LineBasicMaterial({
        color: 0x7ee8fa,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending
      });

      const lightRays = new THREE.LineSegments(geometry, material);
      return lightRays;
    };

    const lightRays = createLightRays();
    scene.add(lightRays);

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0x7ee8fa, 1, 100);
    pointLight.position.set(0, 30, 0);
    scene.add(pointLight);

    // Camera setup
    camera.position.set(0, 20, 30);
    camera.lookAt(0, 0, 0);

    // Animation loop
    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      
      time += 0.01;
      
      // Update ocean layers
      oceanLayers.forEach(layer => {
        layer.material.uniforms.time.value = time;
      });
      
      // Update atmospheric particles
      atmosphericParticles.material.uniforms.time.value = time;
      
      // Gentle camera movement
      camera.position.x = Math.sin(time * 0.1) * 5;
      camera.position.z = 30 + Math.cos(time * 0.1) * 5;
      camera.lookAt(0, 0, 0);
      
      renderer.render(scene, camera);
    };

    animate();
    setIsLoading(false);

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className={`fixed inset-0 z-0 ${className}`}>
      <div ref={mountRef} className="w-full h-full" />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-900 to-slate-900">
          <div className="text-white text-lg">Loading Ocean...</div>
        </div>
      )}
    </div>
  );
};

export default OceanBackground; 