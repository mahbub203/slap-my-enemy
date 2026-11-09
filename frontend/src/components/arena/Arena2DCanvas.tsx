import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useSettingsStore } from '../../store/settingsStore';
import type { GameActionType, ScenarioId } from '../../types';

interface Arena2DCanvasProps {
  onCharacterClick?: (action: 'slap' | 'punch', coords: { x: number; y: number }) => void;
}

interface Pedestrian2D {
  x: number;
  y: number;
  speed: number;
  dir: 1 | -1;
  minX: number;
  maxX: number;
  walkPhase: number;
  shirtColor: string;
  pantsColor: string;
  hasLungi?: boolean;
  hasCap?: boolean;
  hasBag?: boolean;
  scale: number;
}

interface MovingVehicle2D {
  x: number;
  y: number;
  speed: number;
  wheelRotation: number;
}

interface Particle2D {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  type: 'spark' | 'water' | 'tomato' | 'star' | 'steam';
}

interface AttackAnimation2D {
  type: GameActionType;
  startTime: number;
  duration: number;
  targetX: number;
  targetY: number;
  impactFired: boolean;
}

export const Arena2DCanvas: React.FC<Arena2DCanvasProps> = ({ onCharacterClick }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    character,
    currentAnimation,
    recentAction,
    selectedScenario,
    triggerAction
  } = useGameStore();

  const { particlesEnabled } = useSettingsStore();

  // Loaded avatar photo element
  const avatarImgRef = useRef<HTMLImageElement | null>(null);

  // Character Ragdoll state
  const ragdollRef = useRef({
    headOffset: { x: 0, y: 0, rot: 0 },
    torsoOffset: { x: 0, y: 0, rot: 0 },
    leftArmRot: 0.2,
    rightArmRot: -0.2,
    hitTime: 0,
    hasSlapMark: 0, // opacity 0-1
    hasPunchBandage: 0,
    hasTomatoSplat: false,
    dizzyTime: 0,
    wobble: 0
  });

  // Dynamic strike banner
  const [activeBanner, setActiveBanner] = useState<{
    id: number;
    titleEn: string;
    titleBn: string;
    icon: string;
    color: string;
  } | null>(null);

  // Active First-Person attack
  const activeAttackRef = useRef<AttackAnimation2D | null>(null);

  // Active 2D particles
  const particlesRef = useRef<Particle2D[]>([]);

  // Pedestrians
  const pedestriansRef = useRef<Pedestrian2D[]>([]);

  // Moving CNG Auto-Rickshaw
  const cngRef = useRef<MovingVehicle2D>({
    x: 900,
    y: 0,
    speed: 180,
    wheelRotation: 0
  });

  // Steam particles for tea stall
  const steamRef = useRef<{ x: number; y: number; vy: number; alpha: number; size: number }[]>([]);

  // Touch & Swipe tracking
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  // Load avatar image when character changes
  useEffect(() => {
    const src = character.faceTextureUrl || character.originalImage;
    if (src && (src.startsWith('data:') || src.startsWith('http') || src.startsWith('/'))) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        avatarImgRef.current = img;
      };
      img.src = src;
    } else {
      avatarImgRef.current = null;
    }
  }, [character]);

  // Spawn pedestrians based on scenario
  const initPedestrians = useCallback((width: number, baseY: number) => {
    pedestriansRef.current = [
      {
        x: width * 0.15,
        y: baseY - 12,
        speed: 45,
        dir: 1,
        minX: -60,
        maxX: width + 60,
        walkPhase: 0,
        shirtColor: '#f8fafc', // Muxrubbi white panjabi
        pantsColor: '#0284c7', // Lungi
        hasLungi: true,
        hasCap: true,
        scale: 0.72
      },
      {
        x: width * 0.8,
        y: baseY - 8,
        speed: 55,
        dir: -1,
        minX: -60,
        maxX: width + 60,
        walkPhase: Math.PI,
        shirtColor: '#06b6d4', // Teal youth
        pantsColor: '#1e293b',
        scale: 0.75
      },
      {
        x: width * 0.45,
        y: baseY - 4,
        speed: 48,
        dir: 1,
        minX: -60,
        maxX: width + 60,
        walkPhase: Math.PI * 0.5,
        shirtColor: '#eab308', // Bazar shopper
        pantsColor: '#334155',
        hasBag: true,
        scale: 0.7
      },
      {
        x: width * 0.95,
        y: baseY - 15,
        speed: 52,
        dir: -1,
        minX: -60,
        maxX: width + 60,
        walkPhase: Math.PI * 1.5,
        shirtColor: '#ef4444', // Student in red
        pantsColor: '#0f172a',
        scale: 0.74
      }
    ];
  }, []);

  // Handle Action Trigger
  useEffect(() => {
    if (!recentAction) return;

    const rd = ragdollRef.current;
    rd.hitTime = performance.now();

    const bannerMap: Record<GameActionType, { en: string; bn: string; icon: string; color: string }> = {
      slap: { en: 'SLAP!', bn: 'থাপ্পড়!', icon: '✋', color: 'from-rose-600 to-pink-500' },
      punch: { en: 'PUNCH!', bn: 'ঘুষি!', icon: '🥊', color: 'from-red-600 to-amber-600' },
      push: { en: 'PUSH!', bn: 'ধাক্কা!', icon: '👐', color: 'from-cyan-600 to-blue-600' },
      tomato: { en: 'TOMATO SPLAT!', bn: 'টমেটো!', icon: '🍅', color: 'from-red-600 to-orange-500' },
      water: { en: 'WATER BLAST!', bn: 'পানি ছিটানো!', icon: '💦', color: 'from-sky-500 to-cyan-500' },
      tickle: { en: 'TICKLE!', bn: 'সুরসুরি!', icon: '🪶', color: 'from-amber-400 to-yellow-500' },
      reset: { en: 'RESET!', bn: 'রিসেট!', icon: '🔄', color: 'from-purple-600 to-indigo-600' }
    };

    if (recentAction !== 'reset') {
      setActiveBanner({
        id: Date.now(),
        titleEn: bannerMap[recentAction].en,
        titleBn: bannerMap[recentAction].bn,
        icon: bannerMap[recentAction].icon,
        color: bannerMap[recentAction].color
      });

      const timer = setTimeout(() => setActiveBanner(null), 700);

      // Start First-person Player Attack Animation
      const canvas = canvasRef.current;
      const targetX = canvas ? canvas.width / (window.devicePixelRatio || 1) / 2 : 400;
      const targetY = canvas ? (canvas.height / (window.devicePixelRatio || 1)) * 0.48 : 300;

      activeAttackRef.current = {
        type: recentAction,
        startTime: performance.now(),
        duration: recentAction === 'tomato' ? 480 : (recentAction === 'slap' ? 350 : 380),
        targetX,
        targetY: recentAction === 'slap' || recentAction === 'tomato' ? targetY - 50 : targetY + 20,
        impactFired: false
      };

      if (recentAction === 'slap') {
        rd.hasSlapMark = 1.0;
      } else if (recentAction === 'punch') {
        rd.hasPunchBandage = 1.0;
        rd.dizzyTime = 2.0;
      } else if (recentAction === 'tomato') {
        rd.hasTomatoSplat = true;
      }

      return () => clearTimeout(timer);
    } else {
      rd.hasTomatoSplat = false;
      rd.hasSlapMark = 0;
      rd.hasPunchBandage = 0;
      rd.dizzyTime = 0;
      rd.headOffset = { x: 0, y: 0, rot: 0 };
      rd.torsoOffset = { x: 0, y: 0, rot: 0 };
    }
  }, [recentAction]);

  // Main Canvas Render Loop (60fps)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastTime = performance.now();

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      initPedestrians(rect.width, rect.height * 0.68);
      cngRef.current.y = rect.height * 0.74;
    };

    resize();
    window.addEventListener('resize', resize);

    const render = (now: number) => {
      animId = requestAnimationFrame(render);
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      // 1. Draw 2D Environment (Dhaka Street / Scenarios)
      drawEnvironment2D(ctx, width, height, selectedScenario, delta);

      // 2. Draw Animated Walking Pedestrians
      drawPedestrians2D(ctx, delta);

      // 3. Draw Moving Dhaka Green CNG
      if (selectedScenario === 'dhaka-street') {
        drawMovingCNG2D(ctx, delta, width);
      }

      // 4. Update Ragdoll Physics
      updateRagdoll(delta, now);

      // 5. Draw Stylized 2D Human Character (Guaranteed headroom, crisp photo)
      drawCharacter2D(ctx, width, height);

      // 6. Draw 2D Particles (Hit sparks, water, tomatoes, stars)
      if (particlesEnabled) {
        drawParticles2D(ctx, delta);
      }

      // 7. Draw First-Person Player Attack Hands / Weapons
      drawPlayerAttack2D(ctx, now);

      ctx.restore();
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, [selectedScenario, particlesEnabled, initPedestrians]);

  // =========================================================================
  // Ragdoll Physics Updates
  // =========================================================================
  const updateRagdoll = (delta: number, now: number) => {
    const rd = ragdollRef.current;
    const elapsedSinceHit = (now - rd.hitTime) / 1000;

    // Slap mark fade
    if (rd.hasSlapMark > 0) {
      rd.hasSlapMark = Math.max(0, rd.hasSlapMark - delta * 0.4);
    }
    if (rd.hasPunchBandage > 0) {
      rd.hasPunchBandage = Math.max(0, rd.hasPunchBandage - delta * 0.3);
    }
    if (rd.dizzyTime > 0) {
      rd.dizzyTime = Math.max(0, rd.dizzyTime - delta);
    }

    if (elapsedSinceHit < 0.6) {
      const p = elapsedSinceHit / 0.6;
      const spring = Math.sin(p * Math.PI * 3) * Math.exp(-p * 3.5);

      if (currentAnimation === 'SLAP_REACTION') {
        rd.headOffset.rot = spring * 0.42;
        rd.headOffset.x = spring * 35;
        rd.torsoOffset.rot = -spring * 0.15;
        rd.leftArmRot = 0.2 + spring * 0.6;
        rd.rightArmRot = -0.2 - spring * 0.6;
      } else if (currentAnimation === 'PUNCH_REACTION') {
        rd.headOffset.rot = -spring * 0.35;
        rd.headOffset.y = -Math.abs(spring) * 25;
        rd.torsoOffset.y = Math.abs(spring) * 18;
        rd.leftArmRot = 0.2 + spring * 0.8;
        rd.rightArmRot = -0.2 - spring * 0.8;
      } else if (currentAnimation === 'PUSH_REACTION') {
        rd.torsoOffset.x = -spring * 45;
        rd.headOffset.x = -spring * 30;
        rd.leftArmRot = Math.sin(now * 0.015) * 0.7;
        rd.rightArmRot = -Math.sin(now * 0.015) * 0.7;
      } else if (currentAnimation === 'TOMATO_REACTION') {
        rd.headOffset.rot = Math.sin(now * 0.02) * 0.2 * Math.exp(-p * 2);
      } else if (currentAnimation === 'WATER_REACTION') {
        rd.headOffset.x = Math.sin(now * 0.04) * 8 * Math.exp(-p * 2);
        rd.torsoOffset.x = -rd.headOffset.x * 0.5;
      } else if (currentAnimation === 'TICKLE_REACTION') {
        rd.wobble = Math.sin(now * 0.035) * 12;
        rd.headOffset.y = Math.abs(Math.sin(now * 0.03)) * 8;
        rd.leftArmRot = Math.sin(now * 0.025) * 0.5;
        rd.rightArmRot = Math.sin(now * 0.025 + Math.PI) * 0.5;
      }
    } else {
      // Idle breathing sway
      const idle = Math.sin(now * 0.0025);
      rd.headOffset.rot = idle * 0.02;
      rd.headOffset.x = idle * 2;
      rd.headOffset.y = Math.sin(now * 0.005) * 2;
      rd.torsoOffset.rot = idle * 0.01;
      rd.torsoOffset.y = Math.sin(now * 0.005) * 3;
      rd.leftArmRot = 0.15 + idle * 0.03;
      rd.rightArmRot = -0.15 - idle * 0.03;
      rd.wobble = 0;
    }
  };

  // =========================================================================
  // 1. Draw 2D Scenarios & Visual Dhaka Street
  // =========================================================================
  const drawEnvironment2D = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    scenario: ScenarioId,
    delta: number
  ) => {
    const horizonY = height * 0.65;
    const roadY = height * 0.7;

    // Sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
    if (scenario === 'dhaka-street') {
      skyGrad.addColorStop(0, '#090a14');
      skyGrad.addColorStop(0.7, '#1e1b4b');
      skyGrad.addColorStop(1, '#431407'); // Dusk orange glow
    } else if (scenario === 'village') {
      skyGrad.addColorStop(0, '#0c4a6e');
      skyGrad.addColorStop(0.8, '#164e63');
      skyGrad.addColorStop(1, '#065f46');
    } else {
      skyGrad.addColorStop(0, '#0f172a');
      skyGrad.addColorStop(1, '#1e293b');
    }
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, horizonY);

    // Dhaka Skyline Silhouette in background
    ctx.fillStyle = '#0f1020';
    for (let x = 0; x < width; x += 45) {
      const bH = 60 + Math.sin(x * 12.3) * 40;
      ctx.fillRect(x, horizonY - bH, 38, bH);
      // Yellow lit windows
      ctx.fillStyle = 'rgba(250, 204, 21, 0.4)';
      for (let wy = horizonY - bH + 8; wy < horizonY - 10; wy += 14) {
        if ((x + wy) % 7 === 0) {
          ctx.fillRect(x + 8, wy, 6, 6);
          ctx.fillRect(x + 22, wy, 6, 6);
        }
      }
      ctx.fillStyle = '#0f1020';
    }

    if (scenario === 'dhaka-street') {
      // 1. Concrete Sidewalk
      ctx.fillStyle = '#334155';
      ctx.fillRect(0, horizonY, width, roadY - horizonY);

      // Sidewalk Curb with stone blocks
      ctx.fillStyle = '#475569';
      ctx.fillRect(0, roadY - 6, width, 6);
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      for (let cx = 0; cx < width; cx += 50) {
        ctx.beginPath();
        ctx.moveTo(cx, roadY - 6);
        ctx.lineTo(cx, roadY);
        ctx.stroke();
      }

      // 2. Asphalt Road
      ctx.fillStyle = '#181a24';
      ctx.fillRect(0, roadY, width, height - roadY);

      // Yellow dashed lane divider
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 4;
      ctx.setLineDash([35, 25]);
      ctx.beginPath();
      ctx.moveTo(0, height * 0.88);
      ctx.lineTo(width, height * 0.88);
      ctx.stroke();
      ctx.setLineDash([]);

      // 3. Bold White Zebra Crossing (জেব্রা ক্রসিং)
      ctx.fillStyle = '#f8fafc';
      const zebraStartX = width * 0.35;
      const zebraEndX = width * 0.65;
      for (let zx = zebraStartX; zx < zebraEndX; zx += 32) {
        ctx.fillRect(zx, roadY, 18, height - roadY);
      }

      // 4. Traditional Tong Tea Stall (টংয়ের দোকান) on Right
      const stallX = width - 180;
      const stallY = roadY - 70;
      // Counter
      ctx.fillStyle = '#78350f';
      ctx.fillRect(stallX, stallY, 140, 70);
      // Blue tarpaulin canopy
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.moveTo(stallX - 15, stallY);
      ctx.lineTo(stallX + 70, stallY - 45);
      ctx.lineTo(stallX + 155, stallY);
      ctx.closePath();
      ctx.fill();

      // Signboard
      ctx.fillStyle = '#065f46';
      ctx.fillRect(stallX + 10, stallY - 30, 120, 24);
      ctx.fillStyle = '#facc15';
      ctx.font = 'bold 12px "Hind Siliguri", system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('চায়ের টং ও নাস্তা', stallX + 70, stallY - 14);

      // Kettle (কেতলি)
      const kettleX = stallX + 35;
      const kettleY = stallY - 14;
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.arc(kettleX, kettleY, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(kettleX - 10, kettleY - 16, 20, 5);

      // Kettle Steam
      if (Math.random() < 0.3) {
        steamRef.current.push({
          x: kettleX + (Math.random() - 0.5) * 6,
          y: kettleY - 16,
          vy: 20 + Math.random() * 15,
          alpha: 0.6,
          size: 4 + Math.random() * 4
        });
      }

      for (let i = steamRef.current.length - 1; i >= 0; i--) {
        const s = steamRef.current[i];
        s.y -= s.vy * delta;
        s.x += Math.sin(s.y * 0.1) * 0.5;
        s.alpha -= delta * 0.5;
        s.size += delta * 6;
        if (s.alpha <= 0) {
          steamRef.current.splice(i, 1);
        } else {
          ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 5. Classic Parked Cycle Rickshaw on Left
      const rickshawX = 65;
      const rickshawY = roadY - 45;
      // Hood
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(rickshawX + 25, rickshawY + 15, 32, Math.PI, 0);
      ctx.fill();
      // Rickshaw Art panel
      ctx.fillStyle = '#facc15';
      ctx.fillRect(rickshawX, rickshawY + 15, 50, 18);
      ctx.fillStyle = '#065f46';
      ctx.font = 'bold 9px system-ui';
      ctx.fillText('ঢাকা রিকশা', rickshawX + 25, rickshawY + 28);
      // Wheels
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(rickshawX + 8, rickshawY + 45, 18, 0, Math.PI * 2);
      ctx.arc(rickshawX + 45, rickshawY + 45, 18, 0, Math.PI * 2);
      ctx.stroke();

      // 6. Street Lamp with warm ambient cone
      const lampX = 180;
      ctx.fillStyle = '#475569';
      ctx.fillRect(lampX, roadY - 140, 6, 140);
      ctx.beginPath();
      ctx.arc(lampX + 3, roadY - 140, 10, 0, Math.PI * 2);
      ctx.fillStyle = '#fbbf24';
      ctx.fill();
      // Warm light cone
      const coneGrad = ctx.createRadialGradient(lampX + 3, roadY - 140, 10, lampX + 3, roadY, 160);
      coneGrad.addColorStop(0, 'rgba(251, 191, 36, 0.25)');
      coneGrad.addColorStop(1, 'rgba(251, 191, 36, 0)');
      ctx.fillStyle = coneGrad;
      ctx.beginPath();
      ctx.moveTo(lampX + 3, roadY - 140);
      ctx.lineTo(lampX - 90, roadY + 40);
      ctx.lineTo(lampX + 90, roadY + 40);
      ctx.closePath();
      ctx.fill();
    } else {
      // Generic Bangladesh Scenario Ground
      ctx.fillStyle = '#15803d';
      ctx.fillRect(0, horizonY, width, height - horizonY);
    }
  };

  // =========================================================================
  // 2. Draw Animated Walking Pedestrians (মানুষের হাঁটাচলা)
  // =========================================================================
  const drawPedestrians2D = (ctx: CanvasRenderingContext2D, delta: number) => {
    for (const p of pedestriansRef.current) {
      // Move
      p.x += p.dir * p.speed * delta;
      if (p.dir > 0 && p.x > p.maxX) {
        p.x = p.minX;
      } else if (p.dir < 0 && p.x < p.minX) {
        p.x = p.maxX;
      }

      p.walkPhase += delta * 6;
      const legSwing = Math.sin(p.walkPhase) * 16;
      const bob = Math.abs(Math.sin(p.walkPhase * 2)) * 3;

      ctx.save();
      ctx.translate(p.x, p.y - bob);
      ctx.scale(p.scale * p.dir, p.scale);

      // Head
      ctx.fillStyle = '#dfa070';
      ctx.beginPath();
      ctx.arc(0, -52, 11, 0, Math.PI * 2);
      ctx.fill();

      // Cap or Hair
      if (p.hasCap) {
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.arc(0, -56, 11.5, Math.PI, 0);
        ctx.fill();
      } else {
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(0, -54, 11.5, Math.PI * 0.8, Math.PI * 0.2);
        ctx.fill();
      }

      // Torso
      ctx.fillStyle = p.shirtColor;
      ctx.fillRect(-9, -40, 18, 30);

      // Lungi or Pants
      if (p.hasLungi) {
        ctx.fillStyle = p.pantsColor;
        ctx.fillRect(-10, -10, 20, 22);
      }

      // Legs
      ctx.strokeStyle = p.pantsColor;
      ctx.lineWidth = 5;
      ctx.beginPath();
      // Left leg
      ctx.moveTo(-4, -10);
      ctx.lineTo(-4 + legSwing, 15);
      // Right leg
      ctx.moveTo(4, -10);
      ctx.lineTo(4 - legSwing, 15);
      ctx.stroke();

      // Arms
      ctx.strokeStyle = p.shirtColor;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, -34);
      ctx.lineTo(-legSwing * 0.7, -15);
      ctx.stroke();

      // Shopping bag
      if (p.hasBag) {
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(-legSwing * 0.7 - 5, -15, 10, 14);
      }

      ctx.restore();
    }
  };

  // =========================================================================
  // 3. Draw Moving Dhaka Green CNG Auto-Rickshaw (সিএনজি)
  // =========================================================================
  const drawMovingCNG2D = (ctx: CanvasRenderingContext2D, delta: number, width: number) => {
    const cng = cngRef.current;
    cng.x -= cng.speed * delta;
    if (cng.x < -180) {
      cng.x = width + 140;
    }
    cng.wheelRotation += delta * 15;

    ctx.save();
    ctx.translate(cng.x, cng.y);

    // Green Cage Body
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.roundRect(0, -45, 110, 42, [8, 14, 4, 4]);
    ctx.fill();

    // Yellow Roof
    ctx.fillStyle = '#facc15';
    ctx.fillRect(-5, -55, 120, 12);

    // Black Wire mesh cage
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    for (let gx = 15; gx < 95; gx += 12) {
      ctx.beginPath();
      ctx.moveTo(gx, -45);
      ctx.lineTo(gx, -18);
      ctx.stroke();
    }

    // Front Windshield & Headlight
    ctx.fillStyle = '#bae6fd';
    ctx.fillRect(0, -42, 18, 22);

    // Headlight Beam on the road
    ctx.fillStyle = 'rgba(254, 240, 138, 0.28)';
    ctx.beginPath();
    ctx.moveTo(0, -18);
    ctx.lineTo(-120, 12);
    ctx.lineTo(-110, 32);
    ctx.lineTo(0, -8);
    ctx.closePath();
    ctx.fill();

    // 3 Black Wheels
    ctx.fillStyle = '#1f2937';
    ctx.beginPath();
    ctx.arc(20, 0, 13, 0, Math.PI * 2);
    ctx.arc(88, 0, 13, 0, Math.PI * 2);
    ctx.fill();

    // Silver Hubcaps
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.arc(20, 0, 5, 0, Math.PI * 2);
    ctx.arc(88, 0, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  // =========================================================================
  // 4. Draw Full Stylized 2D Human Character (Guaranteed Headroom & Crisp Photo)
  // =========================================================================
  const drawCharacter2D = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    const rd = ragdollRef.current;

    // Character Base Center Position
    // Feet planted at height * 0.82, Head center at height * 0.46
    // Guaranteed 140px+ clearance from the top HUD!
    const charX = width / 2 + rd.torsoOffset.x + rd.wobble;
    const charY = height * 0.78 + rd.torsoOffset.y;

    const bodyScale = Math.min(width / 700, 1.0) * 1.05;

    ctx.save();
    ctx.translate(charX, charY);
    ctx.scale(bodyScale, bodyScale);

    // 1. Shadow beneath feet
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(0, 5, 65, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Legs & Shoes
    const legWidth = 20;
    const legHeight = 90;

    // Left Leg
    ctx.fillStyle = '#1e293b'; // Slate trousers
    ctx.fillRect(-32, -90, legWidth, legHeight);
    // Left Shoe (Modern Sneaker)
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(-42, -5, 34, 15, [6, 6, 2, 2]);
    ctx.fill();
    ctx.fillStyle = '#ffffff'; // White rubber sole
    ctx.fillRect(-42, 5, 34, 5);

    // Right Leg
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(12, -90, legWidth, legHeight);
    // Right Shoe
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(8, -5, 34, 15, [6, 6, 2, 2]);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(8, 5, 34, 5);

    // 3. Torso (Bangladeshi Panjabi / Tailored Shirt)
    ctx.save();
    ctx.rotate(rd.torsoOffset.rot);

    // Belt
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-36, -100, 72, 12);
    // Golden Buckle
    ctx.fillStyle = '#facc15';
    ctx.fillRect(-8, -101, 16, 14);

    // Panjabi / Shirt Body
    ctx.fillStyle = character.accentColor || '#ec4899';
    ctx.beginPath();
    ctx.roundRect(-42, -185, 84, 90, [12, 12, 4, 4]);
    ctx.fill();

    // Center Placket & Golden Buttons
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.fillRect(-7, -185, 14, 75);
    ctx.fillStyle = '#facc15';
    for (let b = 0; b < 3; b++) {
      ctx.beginPath();
      ctx.arc(0, -170 + b * 20, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Collar
    ctx.fillStyle = character.accentColor || '#ec4899';
    ctx.fillRect(-18, -192, 36, 10);

    // Neck
    ctx.fillStyle = '#f5caa6';
    ctx.fillRect(-12, -205, 24, 18);

    // Arms
    // Left Arm
    ctx.save();
    ctx.translate(-42, -175);
    ctx.rotate(rd.leftArmRot);
    ctx.fillStyle = character.accentColor || '#ec4899';
    ctx.fillRect(-10, 0, 20, 70); // sleeve
    // Forearm & Hand
    ctx.fillStyle = '#f5caa6';
    ctx.fillRect(-8, 70, 16, 25);
    ctx.beginPath();
    ctx.arc(0, 100, 12, 0, Math.PI * 2); // palm
    ctx.fill();
    ctx.restore();

    // Right Arm
    ctx.save();
    ctx.translate(42, -175);
    ctx.rotate(rd.rightArmRot);
    ctx.fillStyle = character.accentColor || '#ec4899';
    ctx.fillRect(-10, 0, 20, 70);
    ctx.fillStyle = '#f5caa6';
    ctx.fillRect(-8, 70, 16, 25);
    ctx.beginPath();
    ctx.arc(0, 100, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.restore(); // end torso rotation

    // 4. Head & Crystal Clear Photo (Zero Clipping, 100% Crisp)
    ctx.save();
    ctx.translate(rd.headOffset.x, -210 + rd.headOffset.y);
    ctx.rotate(rd.headOffset.rot);

    const headW = 120;
    const headH = 136;

    // Hair Background / Frame
    ctx.fillStyle = '#241d1a';
    ctx.beginPath();
    ctx.roundRect(-headW / 2 - 4, -headH / 2 - 8, headW + 8, headH + 12, [35, 35, 12, 12]);
    ctx.fill();

    // Ears on sides
    ctx.fillStyle = '#f5caa6';
    ctx.beginPath();
    ctx.arc(-headW / 2 - 4, 0, 11, 0, Math.PI * 2);
    ctx.arc(headW / 2 + 4, 0, 11, 0, Math.PI * 2);
    ctx.fill();

    // Clip Face region cleanly
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(-headW / 2, -headH / 2, headW, headH, [28, 28, 22, 22]);
    ctx.clip();

    // Render Uploaded Photo with 100% native clarity
    if (avatarImgRef.current && avatarImgRef.current.complete) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(avatarImgRef.current, -headW / 2, -headH / 2, headW, headH);
    } else {
      // Fallback stylized cartoon boss face
      ctx.fillStyle = '#f5caa6';
      ctx.fillRect(-headW / 2, -headH / 2, headW, headH);

      // Eyes
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-22, -10, 14, 0, Math.PI * 2);
      ctx.arc(22, -10, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(-20, -10, 6, 0, Math.PI * 2);
      ctx.arc(24, -10, 6, 0, Math.PI * 2);
      ctx.fill();

      // Eyebrows
      ctx.strokeStyle = '#241d1a';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-35, -28);
      ctx.lineTo(-10, -24);
      ctx.moveTo(10, -24);
      ctx.lineTo(35, -30);
      ctx.stroke();

      // Smug mouth
      ctx.beginPath();
      ctx.moveTo(-18, 30);
      ctx.quadraticCurveTo(5, 38, 22, 26);
      ctx.stroke();
    }

    ctx.restore(); // end face clipping

    // 5. Dynamic Hit Damage Overlays (Translucent, NOT covering the face!)
    // Slap red cartoon handprint on cheek
    if (rd.hasSlapMark > 0) {
      ctx.save();
      ctx.globalAlpha = rd.hasSlapMark * 0.75;
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(28, 8, 14, 0, Math.PI * 2); // palm
      ctx.fill();
      for (let f = 0; f < 4; f++) {
        ctx.beginPath();
        ctx.ellipse(18 + f * 7, -6, 3, 10, 0.1, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // Punch Comic Band-aid & Bump
    if (rd.hasPunchBandage > 0) {
      ctx.save();
      ctx.translate(-30, -38);
      ctx.fillStyle = '#fef08a'; // yellow band-aid
      ctx.fillRect(-12, -4, 24, 8);
      ctx.fillRect(-4, -12, 8, 24);
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Tomato Splat on face
    if (rd.hasTomatoSplat) {
      ctx.save();
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(10, -5, 20, 0, Math.PI * 2);
      ctx.fill();
      // Tomato drips
      ctx.fillRect(8, 10, 6, 26);
      ctx.fillRect(-2, 8, 5, 18);
      ctx.restore();
    }

    // Orbiting Dizzy Stars
    if (rd.dizzyTime > 0) {
      const starPhase = performance.now() * 0.006;
      ctx.fillStyle = '#facc15';
      for (let i = 0; i < 4; i++) {
        const a = starPhase + (i * Math.PI) / 2;
        const sx = Math.cos(a) * 58;
        const sy = -headH / 2 - 18 + Math.sin(a) * 12;
        ctx.beginPath();
        ctx.arc(sx, sy, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore(); // end head
    ctx.restore(); // end character root
  };

  // =========================================================================
  // 5. Draw First-Person Player Attack Hands & Weapons ("martsi je ami eita dekhabe")
  // =========================================================================
  const drawPlayerAttack2D = (ctx: CanvasRenderingContext2D, now: number) => {
    const attack = activeAttackRef.current;
    if (!attack) return;

    const elapsed = now - attack.startTime;
    const p = Math.min(1, elapsed / attack.duration);

    if (p >= 0.5 && !attack.impactFired) {
      attack.impactFired = true;
      spawnHitParticles(attack.type, attack.targetX, attack.targetY);
    }

    ctx.save();

    if (attack.type === 'slap') {
      // 1. SLAP: Giant Player Hand swoops in from bottom right with wind trail
      const swingProg = p < 0.5 ? Math.pow(p / 0.5, 2) : 1 - (p - 0.5) / 0.5;
      const hx = attack.targetX + (1 - swingProg) * 280;
      const hy = attack.targetY + 40 - swingProg * 40;

      // Speed blur trail
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.4)';
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.arc(attack.targetX, attack.targetY, 120, 0, Math.PI * 0.4 * swingProg);
      ctx.stroke();

      // Player Open Hand
      ctx.save();
      ctx.translate(hx, hy);
      ctx.rotate(-0.4 + swingProg * 0.8);
      ctx.scale(1.4, 1.4);

      // Sleeve
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(15, 20, 35, 120);
      // Palm
      ctx.fillStyle = '#e0a97a';
      ctx.beginPath();
      ctx.roundRect(-25, -20, 50, 55, [14, 14, 10, 10]);
      ctx.fill();
      // 4 Fingers
      for (let i = 0; i < 4; i++) {
        ctx.fillRect(-22 + i * 11, -50, 9, 34);
      }
      // Thumb
      ctx.fillRect(22, -15, 12, 22);

      ctx.restore();

      // Comic Impact Starburst at impact point
      if (p > 0.4 && p < 0.75) {
        drawComicImpact(ctx, attack.targetX, attack.targetY, 'চড়! SLAP!', '#f43f5e');
      }

    } else if (attack.type === 'punch') {
      // 2. PUNCH: Giant Boxing Fist lunges straight from bottom center into target
      const punchProg = p < 0.45 ? Math.pow(p / 0.45, 3) : 1 - (p - 0.45) / 0.55;
      const px = attack.targetX;
      const py = attack.targetY + (1 - punchProg) * 260;

      ctx.save();
      ctx.translate(px, py);
      ctx.scale(1.2 + punchProg * 0.4, 1.2 + punchProg * 0.4);

      // Clenched Boxing Glove
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.roundRect(-35, -40, 70, 75, [22, 22, 16, 16]);
      ctx.fill();
      // White knuckle wrap
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-30, -10, 60, 14);
      // Forearm sleeve
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-24, 30, 48, 110);

      ctx.restore();

      if (p > 0.4 && p < 0.75) {
        drawComicImpact(ctx, attack.targetX, attack.targetY, 'ঘুষি! POW!', '#ef4444');
      }

    } else if (attack.type === 'push') {
      // 3. PUSH: TWO Player Hands push forward together
      const pushProg = p < 0.5 ? Math.pow(p / 0.5, 2) : 1 - (p - 0.5) / 0.5;
      const pushY = attack.targetY + 80 + (1 - pushProg) * 180;

      // Left Hand
      ctx.save();
      ctx.translate(attack.targetX - 75, pushY);
      ctx.fillStyle = '#e0a97a';
      ctx.fillRect(-20, -35, 40, 60);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-18, 25, 36, 100);
      ctx.restore();

      // Right Hand
      ctx.save();
      ctx.translate(attack.targetX + 75, pushY);
      ctx.fillStyle = '#e0a97a';
      ctx.fillRect(-20, -35, 40, 60);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-18, 25, 36, 100);
      ctx.restore();

      if (p > 0.45 && p < 0.8) {
        drawComicImpact(ctx, attack.targetX, attack.targetY + 60, 'ধাক্কা! PUSH!', '#06b6d4');
      }

    } else if (attack.type === 'tomato') {
      // 4. THROW TOMATO: Parabolic flying tomato explodes on face
      const t = p;
      const startX = attack.targetX + 160;
      const startY = attack.targetY + 300;
      const currentX = (1 - t) * startX + t * attack.targetX;
      const currentY = (1 - t) * startY + t * attack.targetY - Math.sin(t * Math.PI) * 140;

      if (p < 0.85) {
        ctx.save();
        ctx.translate(currentX, currentY);
        ctx.rotate(t * 12);
        // Tomato
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(0, 0, 18, 0, Math.PI * 2);
        ctx.fill();
        // Stem
        ctx.fillStyle = '#15803d';
        ctx.fillRect(-3, -24, 6, 8);
        ctx.restore();
      } else {
        drawComicImpact(ctx, attack.targetX, attack.targetY, 'টমেটো! SPLAT!', '#ea580c');
      }

    } else if (attack.type === 'water') {
      // 5. WATER SPLASH: High-pressure stream blasting into character
      ctx.save();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
      ctx.lineWidth = 18;
      ctx.beginPath();
      ctx.moveTo(attack.targetX + 180, attack.targetY + 250);
      ctx.quadraticCurveTo(
        attack.targetX + 60,
        attack.targetY + 100,
        attack.targetX,
        attack.targetY
      );
      ctx.stroke();
      ctx.restore();

      if (p > 0.3 && p < 0.8) {
        drawComicImpact(ctx, attack.targetX, attack.targetY, 'পানি! SPLASH!', '#38bdf8');
      }

    } else if (attack.type === 'tickle') {
      // 6. TICKLE: Two wiggling hands on sides
      const wiggle = Math.sin(now * 0.04) * 12;

      ctx.fillStyle = '#e0a97a';
      // Left tickler
      ctx.fillRect(attack.targetX - 95 + wiggle, attack.targetY + 50, 35, 18);
      // Right tickler
      ctx.fillRect(attack.targetX + 60 - wiggle, attack.targetY + 50, 35, 18);

      if (p > 0.2 && p < 0.85) {
        drawComicImpact(ctx, attack.targetX, attack.targetY + 40, 'সুরসুরি! HEHE!', '#facc15');
      }
    }

    ctx.restore();

    if (p >= 1) {
      activeAttackRef.current = null;
    }
  };

  // Comic Impact Badge
  const drawComicImpact = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    text: string,
    color: string
  ) => {
    ctx.save();
    ctx.translate(x, y);

    // Spiky Starburst
    ctx.fillStyle = color;
    ctx.beginPath();
    const spikes = 10;
    for (let i = 0; i < spikes * 2; i++) {
      const r = i % 2 === 0 ? 55 : 28;
      const angle = (i / (spikes * 2)) * Math.PI * 2;
      const sx = Math.cos(angle) * r;
      const sy = Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.closePath();
    ctx.fill();

    // Text
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 16px "Hind Siliguri", system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 6;
    ctx.fillText(text, 0, 0);

    ctx.restore();
  };

  // Spawn Hit Particles
  const spawnHitParticles = (type: GameActionType, x: number, y: number) => {
    const parts = particlesRef.current;
    const count = type === 'punch' || type === 'tomato' ? 22 : 14;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 180;
      let pType: Particle2D['type'] = 'spark';
      let color = '#facc15';

      if (type === 'water') {
        pType = 'water';
        color = Math.random() > 0.5 ? '#38bdf8' : '#0284c7';
      } else if (type === 'tomato') {
        pType = 'tomato';
        color = '#ef4444';
      } else if (type === 'slap') {
        color = '#f43f5e';
      }

      parts.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 50,
        life: 0.5 + Math.random() * 0.4,
        maxLife: 0.7,
        size: 3 + Math.random() * 6,
        color,
        type: pType
      });
    }
  };

  // Draw 2D Particles
  const drawParticles2D = (ctx: CanvasRenderingContext2D, delta: number) => {
    const parts = particlesRef.current;
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.x += p.vx * delta;
      p.y += p.vy * delta;
      p.vy += 320 * delta; // gravity
      p.life -= delta;

      if (p.life <= 0) {
        parts.splice(i, 1);
        continue;
      }

      const alpha = p.life / p.maxLife;
      ctx.fillStyle = p.color;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;
    }
  };

  // Pointer & Gesture handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    touchStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      time: performance.now()
    };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!touchStartRef.current) return;

    const dx = e.clientX - touchStartRef.current.x;
    const dy = e.clientY - touchStartRef.current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const duration = performance.now() - touchStartRef.current.time;

    if (dist > 35 && duration < 380) {
      if (Math.abs(dx) > Math.abs(dy)) {
        triggerAction('slap', { x: e.clientX, y: e.clientY });
      } else {
        triggerAction('punch', { x: e.clientX, y: e.clientY });
      }
    } else if (dist < 12) {
      if (onCharacterClick) {
        onCharacterClick('slap', { x: e.clientX, y: e.clientY });
      } else {
        const action = Math.random() > 0.4 ? 'slap' : 'punch';
        triggerAction(action, { x: e.clientX, y: e.clientY });
      }
    }

    touchStartRef.current = null;
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      className="relative w-full h-full select-none cursor-grab active:cursor-grabbing overflow-hidden touch-none"
      title="Swipe to Slap or Punch! Click to hit the character."
    >
      <canvas ref={canvasRef} className="block w-full h-full" />

      {/* Dynamic Comic Strike Action Badge */}
      {activeBanner && (
        <div className="absolute top-28 left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-bounce">
          <div
            className={`px-6 py-2.5 rounded-full bg-gradient-to-r ${activeBanner.color} text-white font-black text-xl md:text-2xl shadow-2xl flex items-center gap-3 border-2 border-white/40 backdrop-blur-md scale-110 tracking-wider`}
          >
            <span className="text-3xl drop-shadow-md">{activeBanner.icon}</span>
            <div className="flex flex-col text-left leading-none">
              <span className="text-sm font-bold opacity-90">{activeBanner.titleBn}</span>
              <span className="text-xl font-extrabold uppercase drop-shadow-md">
                {activeBanner.titleEn}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
