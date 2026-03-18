import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface SportObject3DProps {
  sport: string;
  animationType: 'dribble' | 'shoot' | 'run' | 'punch' | 'game';
  color: string;
}

const SportObject3D: React.FC<SportObject3DProps> = ({ sport, animationType, color }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const objectRef = useRef<THREE.Mesh | null>(null);
  const secondGloveRef = useRef<THREE.Mesh | null>(null); // Added for boxing gloves
  const animationIdRef = useRef<number | null>(null);
  
  // Track Three.js objects for cleanup
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const geometryRef = useRef<THREE.BufferGeometry | null>(null);
  const materialRef = useRef<THREE.MeshPhongMaterial | null>(null);

  useEffect(() => {
    console.log(`Initializing SportObject3D for ${sport} with ${animationType} animation`);
    
    // Early return if mountRef is not available
    if (!mountRef.current) {
      console.error('mountRef is null for SportObject3D');
      return;
    }

    // Clear any existing content
    if (mountRef.current.children.length > 0) {
      console.log('Clearing existing children in SportObject3D');
      while (mountRef.current.firstChild) {
        mountRef.current.removeChild(mountRef.current.firstChild);
      }
    }

    // 1. Create scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Get container dimensions
    const container = mountRef.current;
    const width = container.clientWidth || 320; // Fallback to 320px
    const height = container.clientHeight || 320; // Fallback to 320px
    
    // 3. Create camera with proper aspect ratio
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    cameraRef.current = camera;

    // 4. Create renderer
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true,
      preserveDrawingBuffer: true
    });
    rendererRef.current = renderer;
    
    // Set renderer size
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit for performance
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Append to DOM
    container.appendChild(renderer.domElement);
    console.log(`SportObject3D renderer initialized: ${width}x${height}`);

    // 5. Create geometry and material based on animation type
    let geometry: THREE.BufferGeometry;
    let material: THREE.MeshPhongMaterial;

    switch (animationType) {
      case 'dribble':
        geometry = new THREE.SphereGeometry(1.2, 32, 32);
        material = new THREE.MeshPhongMaterial({
          color: '#ffffff',
          shininess: 100,
          specular: 0x111111
        });
        break;
      case 'shoot':
        geometry = new THREE.SphereGeometry(1.3, 32, 32);
        material = new THREE.MeshPhongMaterial({
          color: '#ff6b35',
          shininess: 80,
          specular: 0x222222
        });
        break;
      case 'run':
        geometry = new THREE.SphereGeometry(1.0, 24, 24);
        geometry.scale(1, 1, 1.6);
        material = new THREE.MeshPhongMaterial({
          color: '#8B4513',
          shininess: 60,
          specular: 0x111111
        });
        break;
      case 'punch':
        geometry = new THREE.BoxGeometry(1.5, 1.2, 2.0);
        material = new THREE.MeshPhongMaterial({
          color: '#e74c3c',
          shininess: 40,
          specular: 0x222222
        });
        break;
      case 'game':
        geometry = new THREE.BoxGeometry(2.0, 1.2, 0.6);
        material = new THREE.MeshPhongMaterial({
          color: '#333333',
          shininess: 90,
          specular: 0x444444
        });
        break;
      default:
        geometry = new THREE.SphereGeometry(1.2, 32, 32);
        material = new THREE.MeshPhongMaterial({
          color: color,
          shininess: 100,
          specular: 0x111111
        });
    }

    // Store for cleanup
    geometryRef.current = geometry;
    materialRef.current = material;

    // 6. Create main sport object
    const sportObject = new THREE.Mesh(geometry, material);
    sportObject.castShadow = true;
    sportObject.receiveShadow = true;
    scene.add(sportObject);
    objectRef.current = sportObject;

    // 7. Create second glove for boxing (if needed)
    if (animationType === 'punch') {
      const secondGloveGeometry = geometry.clone();
      const secondGloveMaterial = material.clone();
      const secondGlove = new THREE.Mesh(secondGloveGeometry, secondGloveMaterial);
      secondGlove.position.set(3, 0, 0);
      secondGlove.castShadow = true;
      scene.add(secondGlove);
      secondGloveRef.current = secondGlove;
    }

    // 8. LIGHTS - CRITICAL!
    // Ambient light - fills in shadows
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // Main directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    scene.add(directionalLight);

    // Colored accent light
    const pointLight = new THREE.PointLight(color, 1.0, 100);
    pointLight.position.set(-3, 3, 3);
    scene.add(pointLight);

    // Fill light from opposite side
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
    fillLight.position.set(-5, -5, -5);
    scene.add(fillLight);

    // 9. Ground plane for shadows
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.ShadowMaterial({ 
      opacity: 0.3,
      transparent: true
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -2;
    ground.receiveShadow = true;
    scene.add(ground);

    // 10. Position camera
    camera.position.set(0, 2, 5);
    camera.lookAt(0, 0, 0);

    // 11. Animation loop
    let time = 0;
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      time += 0.016; // ~60fps

      // Animate based on type
      if (objectRef.current) {
        switch (animationType) {
          case 'dribble':
            objectRef.current.rotation.x += 0.02;
            objectRef.current.rotation.y += 0.03;
            objectRef.current.position.y = Math.sin(time * 3) * 0.5;
            break;
          case 'shoot':
            objectRef.current.rotation.y += 0.04;
            objectRef.current.rotation.z += 0.01;
            const scale = 1 + Math.sin(time * 2) * 0.1;
            objectRef.current.scale.set(scale, scale, scale);
            break;
          case 'run':
            objectRef.current.rotation.x += 0.05;
            objectRef.current.rotation.z += 0.03;
            objectRef.current.position.y = Math.sin(time * 2) * 0.3;
            objectRef.current.position.x = Math.cos(time * 1.5) * 0.2;
            break;
          case 'punch':
            objectRef.current.rotation.y += 0.02;
            objectRef.current.position.x = Math.sin(time * 4) * 0.5;
            objectRef.current.position.z = Math.cos(time * 4) * 0.3;
            
            // Animate second glove
            if (secondGloveRef.current) {
              secondGloveRef.current.position.x = 3 + Math.sin(time * 4 + Math.PI) * 0.5;
              secondGloveRef.current.position.z = Math.cos(time * 4 + Math.PI) * 0.3;
              secondGloveRef.current.rotation.y += 0.02;
            }
            break;
          case 'game':
            objectRef.current.rotation.x = Math.sin(time * 1.5) * 0.1;
            objectRef.current.rotation.y += 0.01;
            objectRef.current.position.y = Math.sin(time * 0.8) * 0.1;
            break;
        }
      }

      // Move camera in a gentle circular motion
      camera.position.x = Math.cos(time * 0.2) * 5;
      camera.position.z = Math.sin(time * 0.2) * 5;
      camera.lookAt(0, 0, 0);

      // Render the scene
      renderer.render(scene, camera);
    };

    // Start animation
    animate();

    // 12. Handle window resize
    const handleResize = () => {
      if (container && camera && renderer) {
        const newWidth = container.clientWidth;
        const newHeight = container.clientHeight;
        
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    // 13. Cleanup function
    return () => {
      console.log(`Cleaning up SportObject3D for ${sport}`);
      
      // Stop animation
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      
      // Remove renderer from DOM
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      
      // Dispose of Three.js resources
      renderer.dispose();
      
      if (geometryRef.current) geometryRef.current.dispose();
      if (materialRef.current) materialRef.current.dispose();
      
      if (objectRef.current) {
        objectRef.current.geometry.dispose();
        (objectRef.current.material as THREE.Material).dispose();
      }
      
      if (secondGloveRef.current) {
        secondGloveRef.current.geometry.dispose();
        (secondGloveRef.current.material as THREE.Material).dispose();
      }
      
      // Clear refs
      objectRef.current = null;
      secondGloveRef.current = null;
      sceneRef.current = null;
      rendererRef.current = null;
      cameraRef.current = null;
      geometryRef.current = null;
      materialRef.current = null;
      
      // Remove event listener
      window.removeEventListener('resize', handleResize);
    };
  }, [sport, animationType, color]); // Re-run if props change

  return (
    <div className="flex justify-center items-center">
      <div className="relative">
        <div 
          ref={mountRef} 
          className="w-80 h-80 rounded-full overflow-hidden bg-gray-900"
          style={{ 
            background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, rgba(147,51,234,0.1) 100%)',
            filter: 'drop-shadow(0 10px 30px rgba(59, 130, 246, 0.3))',
          }}
        />
        <div className="absolute -top-4 -right-4 w-16 h-16 bg-yellow-400 rounded-full animate-bounce delay-100"></div>
        <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-pink-400 rounded-full animate-bounce delay-200"></div>
      </div>
    </div>
  );
};

export default SportObject3D;