import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface AtmosphericEffectsProps {
  className?: string;
}

const AtmosphericEffects: React.FC<AtmosphericEffectsProps> = ({ className = '' }) => {
  const mountRef = useRef<HTMLDivElement>(null);

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
    mountRef.current.appendChild(renderer.domElement);

    // Create floating organic particles
    const createOrganicParticles = () => {
      const particleCount = 150;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const sizes = new Float32Array(particleCount);
      const colors = new Float32Array(particleCount * 3);
      const speeds = new Float32Array(particleCount);
      const phases = new Float32Array(particleCount);

      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 300;
        positions[i * 3 + 1] = Math.random() * 200 - 100;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 300;
        
        sizes[i] = Math.random() * 4 + 2;
        speeds[i] = Math.random() * 0.3 + 0.1;
        phases[i] = Math.random() * Math.PI * 2;
        
        // Organic colors - whites, light blues, and cyans
        const colorType = Math.random();
        if (colorType < 0.3) {
          // White particles
          colors[i * 3] = 1.0;
          colors[i * 3 + 1] = 1.0;
          colors[i * 3 + 2] = 1.0;
        } else if (colorType < 0.6) {
          // Light blue particles
          colors[i * 3] = 0.7;
          colors[i * 3 + 1] = 0.9;
          colors[i * 3 + 2] = 1.0;
        } else {
          // Cyan particles
          colors[i * 3] = 0.0;
          colors[i * 3 + 1] = 0.8;
          colors[i * 3 + 2] = 0.8;
        }
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      geometry.setAttribute('speed', new THREE.BufferAttribute(speeds, 1));
      geometry.setAttribute('phase', new THREE.BufferAttribute(phases, 1));

      const material = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 }
        },
        vertexShader: `
          attribute float size;
          attribute vec3 color;
          attribute float speed;
          attribute float phase;
          uniform float time;
          varying vec3 vColor;
          varying float vAlpha;
          
          void main() {
            vec3 pos = position;
            
            // Create organic floating motion
            float breathing = sin(time * speed + phase) * 0.5 + 0.5;
            pos.y += sin(time * speed * 0.7 + phase) * 3.0;
            pos.x += cos(time * speed * 0.5 + phase) * 2.0;
            pos.z += sin(time * speed * 0.3 + phase) * 2.0;
            
            // Breathing effect
            vAlpha = 0.2 + 0.8 * breathing;
            
            vColor = color;
            
            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            gl_PointSize = size * (400.0 / -mvPosition.z) * breathing;
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
            gl_FragColor = vec4(vColor, alpha * 0.4);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });

      const particles = new THREE.Points(geometry, material);
      return particles;
    };

    const organicParticles = createOrganicParticles();
    scene.add(organicParticles);

    // Create light shafts
    const createLightShafts = () => {
      const shaftCount = 15;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(shaftCount * 6);
      const colors = new Float32Array(shaftCount * 6);

      for (let i = 0; i < shaftCount; i++) {
        const x = (Math.random() - 0.5) * 400;
        const z = (Math.random() - 0.5) * 400;
        
        // Shaft start point (above)
        positions[i * 6] = x;
        positions[i * 6 + 1] = 100;
        positions[i * 6 + 2] = z;
        
        // Shaft end point (below)
        positions[i * 6 + 3] = x + (Math.random() - 0.5) * 30;
        positions[i * 6 + 4] = -100;
        positions[i * 6 + 5] = z + (Math.random() - 0.5) * 30;
        
        // Color gradient
        colors[i * 6] = 0.8;     // R
        colors[i * 6 + 1] = 0.95; // G
        colors[i * 6 + 2] = 1.0; // B
        colors[i * 6 + 3] = 0.6; // R
        colors[i * 6 + 4] = 0.8; // G
        colors[i * 6 + 5] = 1.0; // B
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const material = new THREE.LineBasicMaterial({
        color: 0x7ee8fa,
        transparent: true,
        opacity: 0.2,
        blending: THREE.AdditiveBlending
      });

      const lightShafts = new THREE.LineSegments(geometry, material);
      return lightShafts;
    };

    const lightShafts = createLightShafts();
    scene.add(lightShafts);

    // Create floating bubbles
    const createBubbles = () => {
      const bubbleCount = 50;
      const geometry = new THREE.SphereGeometry(1, 8, 8);
      const material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.1,
        side: THREE.DoubleSide
      });

      const bubbles = new THREE.Group();

      for (let i = 0; i < bubbleCount; i++) {
        const bubble = new THREE.Mesh(geometry, material.clone());
        bubble.position.set(
          (Math.random() - 0.5) * 200,
          Math.random() * 100 - 50,
          (Math.random() - 0.5) * 200
        );
        bubble.scale.setScalar(Math.random() * 2 + 1);
        bubbles.add(bubble);
      }

      return bubbles;
    };

    const bubbles = createBubbles();
    scene.add(bubbles);

    // Camera setup
    camera.position.set(0, 0, 50);
    camera.lookAt(0, 0, 0);

    // Animation loop
    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      
      time += 0.005;
      
      // Update organic particles
      organicParticles.material.uniforms.time.value = time;
      
      // Animate bubbles
      bubbles.children.forEach((bubble, index) => {
        bubble.position.y += 0.1;
        bubble.rotation.y += 0.01;
        
        if (bubble.position.y > 50) {
          bubble.position.y = -50;
        }
      });
      
      // Gentle camera movement
      camera.position.x = Math.sin(time * 0.2) * 10;
      camera.position.z = 50 + Math.cos(time * 0.2) * 10;
      camera.lookAt(0, 0, 0);
      
      renderer.render(scene, camera);
    };

    animate();

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
    <div className={`fixed inset-0 z-10 pointer-events-none ${className}`}>
      <div ref={mountRef} className="w-full h-full" />
    </div>
  );
};

export default AtmosphericEffects; 