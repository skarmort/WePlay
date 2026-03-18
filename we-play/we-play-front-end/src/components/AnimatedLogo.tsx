import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface OrbitingObject {
  id: number;
  angle: number;
  speed: number;
  radiusX: number;
  radiusY: number;
  radiusZ: number;
  inclination: number;
  color: string;
}

const AnimatedLogo: React.FC = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const planetRef = useRef<THREE.Mesh | null>(null);
  const objectsRef = useRef<THREE.Mesh[]>([]);
  const frameRef = useRef<number | null>(null);
  const animationIdRef = useRef<number | null>(null); // Added for animation loop

  const objects = useRef<OrbitingObject[]>([
    { id: 1, angle: 0, speed: 0.02, radiusX: 2.5, radiusY: 1.8, radiusZ: 1.5, inclination: 0, color: '#ff6b6b' },
    { id: 2, angle: 120, speed: 0.015, radiusX: 3.2, radiusY: 2.5, radiusZ: 2.0, inclination: Math.PI / 4, color: '#4ecdc4' },
    { id: 3, angle: 240, speed: 0.025, radiusX: 2.8, radiusY: 2.0, radiusZ: 1.2, inclination: -Math.PI / 6, color: '#45b7d1' },
    { id: 4, angle: 60, speed: 0.018, radiusX: 3.5, radiusY: 2.8, radiusZ: 2.2, inclination: Math.PI / 3, color: '#f9ca24' },
  ]).current;

  useEffect(() => {
    // Early return if mountRef is not available
    if (!mountRef.current) {
      console.error('mountRef is null');
      return;
    }

    // Clear any existing content
    if (mountRef.current.children.length > 0) {
      console.log('Clearing existing children');
      while (mountRef.current.firstChild) {
        mountRef.current.removeChild(mountRef.current.firstChild);
      }
    }

    // 1. Create scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Create camera with proper aspect ratio
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    cameraRef.current = camera;

    // 3. Create renderer with pixel ratio and correct sizing
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true,
      preserveDrawingBuffer: true // Helps with certain browsers
    });
    rendererRef.current = renderer;
    
    // Set size based on container
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Append to DOM
    mountRef.current.appendChild(renderer.domElement);
    console.log('Renderer initialized with size:', width, 'x', height);

    // 4. Create planet with simplified material (removed texture for debugging)
    const planetGeometry = new THREE.SphereGeometry(0.8, 32, 32);
    const planetMaterial = new THREE.MeshPhongMaterial({
      color: 0x4a90e2,
      shininess: 100,
      transparent: true,
      opacity: 0.95
    });
    
    const planet = new THREE.Mesh(planetGeometry, planetMaterial);
    planet.castShadow = true;
    planet.receiveShadow = true;
    scene.add(planet);
    planetRef.current = planet;

    // 5. Create orbiting objects
    const orbitingObjects: THREE.Mesh[] = [];
    objects.forEach((obj, index) => {
      let geometry: THREE.BufferGeometry;
      
      switch (index) {
        case 0:
          geometry = new THREE.SphereGeometry(0.12, 16, 16);
          break;
        case 1:
          geometry = new THREE.SphereGeometry(0.13, 16, 16);
          break;
        case 2:
          geometry = new THREE.SphereGeometry(0.1, 16, 16);
          geometry.scale(1, 1, 1.5);
          break;
        case 3:
          geometry = new THREE.BoxGeometry(0.15, 0.15, 0.2);
          break;
        default:
          geometry = new THREE.SphereGeometry(0.12, 16, 16);
      }
      
      const material = new THREE.MeshPhongMaterial({
        color: obj.color,
        shininess: 100,
        transparent: true,
        opacity: 0.9
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
      orbitingObjects.push(mesh);
    });
    objectsRef.current = orbitingObjects;

    // 6. Lights (CRITICAL - without lights, objects appear black)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Increased intensity
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0x64b5f6, 0.8, 100); // Increased intensity
    pointLight.position.set(0, 0, 4);
    scene.add(pointLight);

    // 7. Camera position
    camera.position.set(2, 1, 6);
    camera.lookAt(0, 0, 0);

    // 8. Animation loop - FIXED VERSION
    let time = 0;
    
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      time += 0.008;

      // Rotate planet
      if (planetRef.current) {
        planetRef.current.rotation.y += 0.003;
        planetRef.current.rotation.x = Math.sin(time * 0.2) * 0.1;
      }

      // Move orbiting objects
      objects.forEach((obj, index) => {
        const mesh = orbitingObjects[index];
        if (mesh) {
          const orbitalAngle = (time * obj.speed) + (obj.angle * Math.PI / 180);
          const inclinationMatrix = new THREE.Matrix4().makeRotationX(obj.inclination);
          
          const x = Math.cos(orbitalAngle) * obj.radiusX;
          const y = Math.sin(orbitalAngle) * obj.radiusY;
          const z = Math.sin(orbitalAngle) * obj.radiusZ * 0.3;
          
          const position = new THREE.Vector3(x, y, z);
          position.applyMatrix4(inclinationMatrix);
          mesh.position.copy(position);
          
          // Add individual rotation based on type
          switch (index) {
            case 0:
              mesh.rotation.x += 0.05;
              mesh.rotation.y += 0.03;
              break;
            case 1:
              mesh.rotation.z += 0.04;
              mesh.scale.y = 1 + Math.sin(time * 3) * 0.1;
              break;
            case 2:
              mesh.rotation.x += 0.06;
              mesh.rotation.z += 0.02;
              break;
            case 3:
              mesh.rotation.y += 0.08;
              mesh.scale.x = 1 + Math.sin(time * 4) * 0.15;
              break;
          }
        }
      });

      // Move camera in a gentle orbit
      const cameraRadius = 6;
      camera.position.x = Math.cos(time * 0.1) * cameraRadius * 0.3 + 2;
      camera.position.y = Math.sin(time * 0.15) * cameraRadius * 0.2 + 1;
      camera.position.z = Math.sin(time * 0.05) * 1 + 6;
      camera.lookAt(0, 0, 0);

      // RENDER - This is critical!
      renderer.render(scene, camera);
    };

    // Start animation
    animate();

    // 9. Handle resize
    const handleResize = () => {
      if (mountRef.current && camera && renderer) {
        const newWidth = mountRef.current.clientWidth;
        const newHeight = mountRef.current.clientHeight;
        
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    // 10. Cleanup
    return () => {
      console.log('Cleaning up Three.js scene');
      
      // Stop animation
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      
      // Remove renderer from DOM
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      // Dispose of resources
      renderer.dispose();
      planetGeometry.dispose();
      planetMaterial.dispose();
      
      orbitingObjects.forEach(obj => {
        obj.geometry.dispose();
        (obj.material as THREE.Material).dispose();
      });
      
      // Remove event listener
      window.removeEventListener('resize', handleResize);
    };
  }, []); // Empty dependency array - runs once on mount

  return (
    <div className="relative w-20 h-20 cursor-pointer transform hover:scale-110 transition-transform duration-300 overflow-hidden rounded-full bg-gray-900">
      <div 
        ref={mountRef} 
        className="w-full h-full"
        style={{ 
          filter: 'drop-shadow(0 4px 20px rgba(59, 130, 246, 0.5))',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-600/20 to-pink-500/20 rounded-full pointer-events-none" />
    </div>
  );
};

export default AnimatedLogo;
