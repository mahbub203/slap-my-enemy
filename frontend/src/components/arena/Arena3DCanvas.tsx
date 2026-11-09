import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useGameStore } from '../../store/gameStore';
import { useSettingsStore } from '../../store/settingsStore';
import { CharacterModel3D } from './CharacterModel3D';
import { ParticleSystemManager } from './ParticleEffects3D';
import { createBangladeshEnvironment } from './BangladeshEnvironments';
import type { EnvironmentSceneResult } from './BangladeshEnvironments';
import { PlayerAttackManager } from './PlayerAttackVFX';
import type { GameActionType } from '../../types';

interface Arena3DCanvasProps {
  onCharacterClick?: (action: 'slap' | 'punch', coords: { x: number; y: number }) => void;
}

interface ActionSplashBanner {
  id: number;
  action: GameActionType;
  titleEn: string;
  titleBn: string;
  icon: string;
  color: string;
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
  const playerAttackRef = useRef<PlayerAttackManager | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const envRef = useRef<EnvironmentSceneResult | null>(null);

  // Dynamic visual action strike banner
  const [activeBanner, setActiveBanner] = useState<ActionSplashBanner | null>(null);

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
    scene.fog = new THREE.FogExp2(0x07080e, 0.04);

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
    const ambientLight = new THREE.AmbientLight(0x333348, 1.3);
    scene.add(ambientLight);

    // Key Spotlight on character
    const spotLight = new THREE.SpotLight(0xffffff, 48, 16, Math.PI / 4, 0.4, 1.2);
    spotLight.position.set(0, 6, 3);
    spotLight.target.position.set(0, 1, 0);
    spotLight.castShadow = graphicsQuality !== 'low';
    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;
    scene.add(spotLight);
    scene.add(spotLight.target);

    // Purple rim light (left-back)
    const purpleLight = new THREE.PointLight(0xa855f7, 30, 12);
    purpleLight.position.set(-3, 3, -2);
    scene.add(purpleLight);

    // Crimson rim light (right-back)
    const redLight = new THREE.PointLight(0xef4444, 30, 12);
    redLight.position.set(3, 3, -2);
    scene.add(redLight);

    // Under-glow arena light
    const underLight = new THREE.PointLight(0x6366f1, 16, 8);
    underLight.position.set(0, 0.2, 0);
    scene.add(underLight);

    // 5. Bangladesh Authentically Themed 3D Environment with Pedestrians & Traffic
    const envResult = createBangladeshEnvironment(scene, selectedScenario, graphicsQuality);
    envRef.current = envResult;

    // 6. First-Person Player Attack VFX Manager
    const playerAttack = new PlayerAttackManager(camera);
    scene.add(playerAttack.group);
    playerAttackRef.current = playerAttack;

    // 7. Full Stylized 3D Human Character Model
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

    // 10. Animation Loop (60fps)
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

      // Update First-Person Player Attack Hands & Weapons
      if (playerAttack) {
        playerAttack.update(delta);
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

      // Update Bangladesh Environment animation (pedestrians, CNGs, steam, fairy lights)
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
      playerAttack.dispose();
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

  // Trigger First-Person Player Attacks, Particles & Visual Strike Banners
  useEffect(() => {
    if (!recentAction || !characterRef.current || !particleManagerRef.current || !playerAttackRef.current) return;

    const pm = particleManagerRef.current;
    const char = characterRef.current;
    const playerAttack = playerAttackRef.current;

    const headPos = new THREE.Vector3();
    const torsoPos = new THREE.Vector3();
    char.getHeadWorldPosition(headPos);
    char.getTorsoWorldPosition(torsoPos);

    const bannerData: Record<GameActionType, { en: string; bn: string; icon: string; color: string }> = {
      slap: { en: 'SLAP!', bn: 'থাপ্পড়!', icon: '✋', color: 'from-rose-600 to-pink-500' },
      punch: { en: 'PUNCH!', bn: 'ঘুষি!', icon: '🥊', color: 'from-red-600 to-amber-600' },
      push: { en: 'PUSH!', bn: 'ধাক্কা!', icon: '👐', color: 'from-cyan-600 to-blue-600' },
      tomato: { en: 'TOMATO SPLAT!', bn: 'টমেটো নিক্ষেপ!', icon: '🍅', color: 'from-red-600 to-orange-500' },
      water: { en: 'WATER BLAST!', bn: 'পানি ছিটানো!', icon: '💦', color: 'from-sky-500 to-cyan-500' },
      tickle: { en: 'TICKLE ATTACK!', bn: 'সুরসুরি!', icon: '🪶', color: 'from-amber-400 to-yellow-500' },
      reset: { en: 'RESET!', bn: 'রিসেট!', icon: '🔄', color: 'from-purple-600 to-indigo-600' }
    };

    if (recentAction !== 'reset') {
      setActiveBanner({
        id: Date.now(),
        action: recentAction,
        titleEn: bannerData[recentAction].en,
        titleBn: bannerData[recentAction].bn,
        icon: bannerData[recentAction].icon,
        color: bannerData[recentAction].color
      });

      const timer = setTimeout(() => {
        setActiveBanner(null);
      }, 700);

      // Trigger the 3D first-person player hand / weapon attack!
      const targetPos = (recentAction === 'slap' || recentAction === 'tomato') ? headPos : torsoPos;
      playerAttack.triggerAttack(recentAction, targetPos, () => {
        // Impact callback: trigger 3D burst particles & splashes
        if (recentAction === 'slap') {
          pm.spawnHitSparks(headPos, false);
        } else if (recentAction === 'punch') {
          pm.spawnHitSparks(torsoPos, true);
        } else if (recentAction === 'push') {
          pm.spawnHitSparks(torsoPos, false);
        } else if (recentAction === 'tomato') {
          pm.spawnTomatoSplat(headPos);
        } else if (recentAction === 'water') {
          pm.spawnWaterSplash(headPos);
        } else if (recentAction === 'tickle') {
          pm.spawnTickleSparkles(torsoPos);
        }
      });

      return () => clearTimeout(timer);
    } else {
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

    // Quick swipe detected -> trigger SLAP or PUNCH
    if (dist > 35 && duration < 380) {
      const clickCoords = { x: e.clientX, y: e.clientY };
      if (Math.abs(dx) > Math.abs(dy)) {
        triggerAction('slap', clickCoords);
      } else {
        triggerAction('punch', clickCoords);
      }
    } else if (dist < 10) {
      // Direct click / tap
      const clickCoords = { x: e.clientX, y: e.clientY };
      if (onCharacterClick) {
        onCharacterClick('slap', clickCoords);
      } else {
        const action = Math.random() > 0.4 ? 'slap' : 'punch';
        triggerAction(action, clickCoords);
      }
    }

    touchStartRef.current = null;
    if (mouseDragRef.current) mouseDragRef.current.isDragging = false;
  };

  const handleDoubleClick = () => {
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
    >
      {/* Dynamic Comic Strike Action Flash (User visibly sees their attack) */}
      {activeBanner && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-bounce">
          <div className={`px-6 py-2.5 rounded-full bg-gradient-to-r ${activeBanner.color} text-white font-black text-xl md:text-2xl shadow-2xl flex items-center gap-3 border-2 border-white/40 backdrop-blur-md scale-110 tracking-wider`}>
            <span className="text-3xl drop-shadow-md">{activeBanner.icon}</span>
            <div className="flex flex-col text-left leading-none">
              <span className="text-sm font-bold opacity-90">{activeBanner.titleBn}</span>
              <span className="text-xl font-extrabold uppercase drop-shadow-md">{activeBanner.titleEn}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
