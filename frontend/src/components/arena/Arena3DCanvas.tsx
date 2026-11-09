import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useGameStore } from '../../store/gameStore';
import { useSettingsStore } from '../../store/settingsStore';
import { CharacterModel3D } from './CharacterModel3D';
import { ParticleSystemManager } from './ParticleEffects3D';
import { createBangladeshEnvironment } from './BangladeshEnvironments';
import type { EnvironmentSceneResult } from './BangladeshEnvironments';

interface Arena3DCanvasProps {
  onCharacterClick?: (action: 'slap' | 'punch', coords: { x: number; y: number }) => void;
}

export const Arena3DCanvas: React.FC<Arena3DCanvasProps> = ({ onCharacterClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { 
    character, 
    currentAnimation, 
    recentAction, 
    selectedScenario,
    triggerAction 
  } = useGameStore();

  const { 
    graphicsQuality, 
    particlesEnabled, 
    cameraTiltEnabled 
  } = useSettingsStore();

  const characterRef = useRef<CharacterModel3D | null>(null);
  const particleManagerRef = useRef<ParticleSystemManager | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const envRef = useRef<EnvironmentSceneResult | null>(null);

  // Active flying projectiles
  const projectileGroupRef = useRef<THREE.Group>(new THREE.Group());

  // Interaction tracking for drag/swipe gestures
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const mouseDragRef = useRef<{ isDragging: boolean; startX: number; startY: number } | null>(null);
  const cameraAngleRef = useRef<{ targetX: number; targetY: number; currentX: number; currentY: number }>({
    targetX: 0,
    targetY: 0,
    currentX: 0,
    currentY: 0
  });

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x07080e);
    scene.fog = new THREE.FogExp2(0x07080e, 0.05);

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 1.35, 4.2);
    camera.lookAt(0, 1.15, 0);

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: graphicsQuality !== 'low',
      powerPreference: 'high-performance',
      alpha: false
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(
      graphicsQuality === 'high' ? Math.min(window.devicePixelRatio, 2) : 1
    );
    renderer.shadowMap.enabled = graphicsQuality !== 'low';
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // 4. Lighting
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x27273a, 1.2);
    scene.add(ambientLight);

    // Key Spotlight on character
    const spotLight = new THREE.SpotLight(0xffffff, 45, 15, Math.PI / 4, 0.4, 1.2);
    spotLight.position.set(0, 6, 3);
    spotLight.target.position.set(0, 1, 0);
    spotLight.castShadow = graphicsQuality !== 'low';
    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;
    scene.add(spotLight);
    scene.add(spotLight.target);

    // Purple rim light (left-back)
    const purpleLight = new THREE.PointLight(0xa855f7, 28, 12);
    purpleLight.position.set(-3, 3, -2);
    scene.add(purpleLight);

    // Crimson rim light (right-back)
    const redLight = new THREE.PointLight(0xef4444, 28, 12);
    redLight.position.set(3, 3, -2);
    scene.add(redLight);

    // Under-glow arena light
    const underLight = new THREE.PointLight(0x6366f1, 15, 8);
    underLight.position.set(0, 0.2, 0);
    scene.add(underLight);

    // 5. Bangladesh Authentically Themed 3D Environment
    const envResult = createBangladeshEnvironment(scene, selectedScenario, graphicsQuality);
    envRef.current = envResult;

    // 6. Projectiles Group
    scene.add(projectileGroupRef.current);

    // 7. Initialize 3D Character Model
    const charModel = new CharacterModel3D(character.accentColor || '#ec4899');
    charModel.setCharacter(character);
    scene.add(charModel.group);
    characterRef.current = charModel;

    // 8. Particle System Manager
    const particleManager = new ParticleSystemManager(scene);
    particleManagerRef.current = particleManager;

    // 9. Resize handler
    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // 10. Animation Loop
    let lastTime = performance.now();
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const now = performance.now();
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // Update 3D Character
      if (charModel) {
        charModel.update(delta);
      }

      // Update Particles
      if (particlesEnabled && particleManager) {
        particleManager.update(delta);
      }

      // Smooth Camera Tilt / Orbit interpolation
      const angles = cameraAngleRef.current;
      angles.currentX += (angles.targetX - angles.currentX) * 0.08;
      angles.currentY += (angles.targetY - angles.currentY) * 0.08;

      if (cameraTiltEnabled) {
        const radius = 4.2;
        camera.position.x = Math.sin(angles.currentX) * radius;
        camera.position.z = Math.cos(angles.currentX) * radius;
        camera.position.y = 1.35 + angles.currentY * 0.8;
        camera.lookAt(0, 1.15, 0);
      }

      // Update Bangladesh Environment animation
      if (envRef.current?.update) {
        envRef.current.update(delta);
      }

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      charModel.dispose();
      particleManager.clearAll();
      if (envRef.current) envRef.current.dispose();
    };
  }, [graphicsQuality, selectedScenario]);

  // Handle character changes
  useEffect(() => {
    if (characterRef.current && character) {
      characterRef.current.setCharacter(character);
    }
  }, [character]);

  // Handle animation state changes
  useEffect(() => {
    if (characterRef.current) {
      characterRef.current.setAnimationState(currentAnimation);
    }
  }, [currentAnimation]);

  // Trigger VFX and Projectiles when recentAction changes
  useEffect(() => {
    if (!recentAction || !characterRef.current || !particleManagerRef.current || !sceneRef.current) return;

    const pm = particleManagerRef.current;
    const char = characterRef.current;
    const headPos = new THREE.Vector3();
    const torsoPos = new THREE.Vector3();
    char.getHeadWorldPosition(headPos);
    char.getTorsoWorldPosition(torsoPos);

    if (recentAction === 'tomato') {
      // Spawn animated tomato projectile
      const tomatoGeom = new THREE.SphereGeometry(0.18, 12, 12);
      const tomatoMat = new THREE.MeshStandardMaterial({
        color: 0xef4444,
        roughness: 0.3
      });
      const tomatoMesh = new THREE.Mesh(tomatoGeom, tomatoMat);
      tomatoMesh.position.set(0, 1.2, 3.8);
      sceneRef.current.add(tomatoMesh);

      const startTime = performance.now();
      const duration = 280; // ms

      const step = () => {
        const elapsed = performance.now() - startTime;
        const t = Math.min(1, elapsed / duration);

        // Parabolic flight towards head
        tomatoMesh.position.x = (1 - t) * 0 + t * headPos.x;
        tomatoMesh.position.y = (1 - t) * 1.2 + t * headPos.y + Math.sin(t * Math.PI) * 0.25;
        tomatoMesh.position.z = (1 - t) * 3.8 + t * (headPos.z + 0.35);

        if (t < 1) {
          requestAnimationFrame(step);
        } else {
          // Impact!
          if (sceneRef.current) sceneRef.current.remove(tomatoMesh);
          tomatoGeom.dispose();
          tomatoMat.dispose();
          pm.spawnTomatoSplat(new THREE.Vector3(headPos.x, headPos.y, headPos.z + 0.35));
        }
      };
      step();

    } else if (recentAction === 'water') {
      pm.spawnWaterSplash(headPos);

    } else if (recentAction === 'punch') {
      pm.spawnHitSparks(torsoPos, true);

    } else if (recentAction === 'slap') {
      pm.spawnHitSparks(headPos, false);

    } else if (recentAction === 'tickle') {
      pm.spawnTickleSparkles(torsoPos);

    } else if (recentAction === 'reset') {
      char.clearTomatoSplat();
    }
  }, [recentAction]);

  // --- Mouse & Touch Gesture Controls ---

  const handlePointerDown = (e: React.PointerEvent) => {
    touchStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      time: performance.now()
    };
    mouseDragRef.current = {
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!mouseDragRef.current || !mouseDragRef.current.isDragging) return;

    const deltaX = (e.clientX - mouseDragRef.current.startX) * 0.005;
    const deltaY = (e.clientY - mouseDragRef.current.startY) * 0.005;

    cameraAngleRef.current.targetX += deltaX;
    cameraAngleRef.current.targetY = Math.max(-0.4, Math.min(0.6, cameraAngleRef.current.targetY + deltaY));

    mouseDragRef.current.startX = e.clientX;
    mouseDragRef.current.startY = e.clientY;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!touchStartRef.current) {
      if (mouseDragRef.current) mouseDragRef.current.isDragging = false;
      return;
    }

    const dx = e.clientX - touchStartRef.current.x;
    const dy = e.clientY - touchStartRef.current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const duration = performance.now() - touchStartRef.current.time;

    // Quick swipe detected -> trigger SLAP or PUNCH depending on direction!
    if (dist > 35 && duration < 380) {
      const clickCoords = { x: e.clientX, y: e.clientY };
      if (Math.abs(dx) > Math.abs(dy)) {
        // Horizontal swipe = SLAP!
        triggerAction('slap', clickCoords);
      } else {
        // Vertical swipe = PUNCH!
        triggerAction('punch', clickCoords);
      }
    } else if (dist < 10) {
      // Direct click / tap on character area
      const clickCoords = { x: e.clientX, y: e.clientY };
      if (onCharacterClick) {
        onCharacterClick('slap', clickCoords);
      } else {
        // Randomly alternate slap and punch on direct click
        const action = Math.random() > 0.4 ? 'slap' : 'punch';
        triggerAction(action, clickCoords);
      }
    }

    touchStartRef.current = null;
    if (mouseDragRef.current) mouseDragRef.current.isDragging = false;
  };

  const handleDoubleClick = () => {
    // Reset camera angle to center
    cameraAngleRef.current.targetX = 0;
    cameraAngleRef.current.targetY = 0;
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onDoubleClick={handleDoubleClick}
      className="relative w-full h-full select-none cursor-grab active:cursor-grabbing overflow-hidden touch-none"
      title="Swipe to Slap or Punch! Click to hit. Drag to rotate camera. Double-click to recenter."
    />
  );
};
