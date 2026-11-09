import * as THREE from 'three';
import type { GameActionType } from '../../types';

/**
 * First-Person Visual Player Attack System
 * Displays the player's own hands, fists, tomatoes, and water weapons
 * striking the enemy in 3D right from the player's perspective.
 */
export class PlayerAttackManager {
  public group: THREE.Group;
  public camera: THREE.Camera;

  // Active attacks
  private activeAttack: {
    type: GameActionType;
    mesh: THREE.Group;
    startTime: number;
    duration: number;
    onUpdate: (progress: number) => void;
    onComplete?: () => void;
  } | null = null;

  // Materials (cached for performance)
  private skinMaterial: THREE.MeshStandardMaterial;
  private gloveMaterial: THREE.MeshStandardMaterial;
  private shirtMaterial: THREE.MeshStandardMaterial;

  constructor(camera: THREE.Camera) {
    this.camera = camera;
    this.group = new THREE.Group();

    this.skinMaterial = new THREE.MeshStandardMaterial({
      color: 0xe0a97a, // Warm South Asian skin tone
      roughness: 0.5,
      metalness: 0.05
    });

    this.gloveMaterial = new THREE.MeshStandardMaterial({
      color: 0xdc2626, // Red boxing wrap / glove
      roughness: 0.35,
      metalness: 0.1
    });

    this.shirtMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.7
    });
  }

  /**
   * Trigger first-person attack animation
   */
  public triggerAttack(action: GameActionType, targetWorldPos: THREE.Vector3, onImpact?: () => void) {
    // Clean up any ongoing attack
    this.clearCurrentAttack();

    switch (action) {
      case 'slap':
        this.playSlapAttack(targetWorldPos, onImpact);
        break;

      case 'punch':
        this.playPunchAttack(targetWorldPos, onImpact);
        break;

      case 'push':
        this.playPushAttack(targetWorldPos, onImpact);
        break;

      case 'tomato':
        this.playTomatoThrow(targetWorldPos, onImpact);
        break;

      case 'water':
        this.playWaterBlast(targetWorldPos, onImpact);
        break;

      case 'tickle':
        this.playTickleAttack(targetWorldPos, onImpact);
        break;

      default:
        break;
    }
  }

  // =========================================================================
  // 1. SLAP (থাপ্পড়) - High-velocity 3D player hand swinging across the screen
  // =========================================================================
  private playSlapAttack(target: THREE.Vector3, onImpact?: () => void) {
    const handGroup = this.createOpenHandMesh(true);
    this.group.add(handGroup);

    // Start position: lower-right foreground (off-screen / close to camera)
    const startPos = new THREE.Vector3(1.8, -0.6, 2.5);
    // Strike position: right at the enemy's cheek
    const hitPos = new THREE.Vector3(target.x + 0.1, target.y + 0.15, target.z + 0.35);
    // Follow-through end position: swept across to the left
    const endPos = new THREE.Vector3(-1.6, 0.4, 1.8);

    handGroup.position.copy(startPos);
    handGroup.rotation.set(-0.2, 0.5, 0.4);

    let impactFired = false;
    const duration = 380; // ms

    this.activeAttack = {
      type: 'slap',
      mesh: handGroup,
      startTime: performance.now(),
      duration,
      onUpdate: (p) => {
        if (p < 0.5) {
          // Swing forward with ease-in
          const t = p / 0.5;
          const ease = t * t;
          handGroup.position.lerpVectors(startPos, hitPos, ease);
          handGroup.rotation.z = 0.4 - ease * 0.7;
          handGroup.rotation.y = 0.5 - ease * 0.9;
          handGroup.scale.setScalar(1.2 - ease * 0.2);
        } else {
          if (!impactFired) {
            impactFired = true;
            if (onImpact) onImpact();
          }
          // Follow-through and retract
          const t = (p - 0.5) / 0.5;
          const ease = Math.sin(t * (Math.PI / 2));
          handGroup.position.lerpVectors(hitPos, endPos, ease);
          handGroup.rotation.z = -0.3 - ease * 0.4;
          handGroup.scale.setScalar(1.0 - ease * 0.3);
        }
      },
      onComplete: () => {
        this.group.remove(handGroup);
        this.disposeGroup(handGroup);
      }
    };
  }

  // =========================================================================
  // 2. PUNCH (ঘুষি) - Heavy player fist lunging straight from camera center
  // =========================================================================
  private playPunchAttack(target: THREE.Vector3, onImpact?: () => void) {
    const fistGroup = this.createClenchedFistMesh();
    this.group.add(fistGroup);

    // Start position: lower center camera foreground
    const startPos = new THREE.Vector3(0.3, -0.6, 3.2);
    // Strike position: straight into the enemy's jaw / chest
    const hitPos = new THREE.Vector3(target.x, target.y - 0.05, target.z + 0.35);

    fistGroup.position.copy(startPos);
    fistGroup.rotation.set(0.1, -0.15, 0.2);

    let impactFired = false;
    const duration = 360; // ms

    this.activeAttack = {
      type: 'punch',
      mesh: fistGroup,
      startTime: performance.now(),
      duration,
      onUpdate: (p) => {
        if (p < 0.45) {
          // Powerful punch extension forward
          const t = p / 0.45;
          const ease = Math.pow(t, 2.5);
          fistGroup.position.lerpVectors(startPos, hitPos, ease);
          fistGroup.rotation.z = 0.2 + ease * 0.4; // corkscrew rotation punch
          fistGroup.scale.setScalar(1.3 - ease * 0.3);
        } else if (p < 0.6) {
          // Impact pause / vibration shock
          if (!impactFired) {
            impactFired = true;
            if (onImpact) onImpact();
          }
          const jitter = (Math.random() - 0.5) * 0.04;
          fistGroup.position.set(hitPos.x + jitter, hitPos.y + jitter, hitPos.z);
        } else {
          // Rapid snap recoil back
          const t = (p - 0.6) / 0.4;
          const ease = t * t;
          fistGroup.position.lerpVectors(hitPos, startPos, ease);
          fistGroup.scale.setScalar(1.0 + (1 - ease) * 0.1);
        }
      },
      onComplete: () => {
        this.group.remove(fistGroup);
        this.disposeGroup(fistGroup);
      }
    };
  }

  // =========================================================================
  // 3. PUSH (ধাক্কা) - TWO player hands shove the enemy back violently
  // =========================================================================
  private playPushAttack(target: THREE.Vector3, onImpact?: () => void) {
    const twoHands = new THREE.Group();

    const leftHand = this.createOpenHandMesh(false);
    leftHand.position.set(-0.55, 0, 0);
    leftHand.rotation.set(-0.3, 0.3, -0.2);
    twoHands.add(leftHand);

    const rightHand = this.createOpenHandMesh(true);
    rightHand.position.set(0.55, 0, 0);
    rightHand.rotation.set(-0.3, -0.3, 0.2);
    twoHands.add(rightHand);

    this.group.add(twoHands);

    const startPos = new THREE.Vector3(0, -0.7, 3.0);
    const hitPos = new THREE.Vector3(target.x, target.y - 0.2, target.z + 0.4);
    twoHands.position.copy(startPos);

    let impactFired = false;
    const duration = 440; // ms

    this.activeAttack = {
      type: 'push',
      mesh: twoHands,
      startTime: performance.now(),
      duration,
      onUpdate: (p) => {
        if (p < 0.5) {
          const t = p / 0.5;
          const ease = t * t;
          twoHands.position.lerpVectors(startPos, hitPos, ease);
        } else {
          if (!impactFired) {
            impactFired = true;
            if (onImpact) onImpact();
          }
          // Push follow-through deeper then drop down
          const t = (p - 0.5) / 0.5;
          const pushPos = new THREE.Vector3(hitPos.x, hitPos.y, hitPos.z - 0.4);
          twoHands.position.lerpVectors(hitPos, pushPos, t);
          twoHands.position.y -= t * 0.4;
        }
      },
      onComplete: () => {
        this.group.remove(twoHands);
        this.disposeGroup(twoHands);
      }
    };
  }

  // =========================================================================
  // 4. THROW TOMATO (টমেটো) - Player hand hurls a ripe juicy 3D tomato
  // =========================================================================
  private playTomatoThrow(target: THREE.Vector3, onImpact?: () => void) {
    const throwGroup = new THREE.Group();

    // Hand holding tomato
    const hand = this.createOpenHandMesh(true);
    hand.scale.setScalar(0.8);
    throwGroup.add(hand);

    // Tomato Mesh
    const tomatoGeom = new THREE.SphereGeometry(0.16, 16, 16);
    tomatoGeom.scale(1.1, 0.95, 1.1);
    const tomatoMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      roughness: 0.25,
      metalness: 0.1
    });
    const tomatoMesh = new THREE.Mesh(tomatoGeom, tomatoMat);
    tomatoMesh.position.set(0, 0.28, 0.1);
    throwGroup.add(tomatoMesh);

    // Tomato green calyx / stem
    const stemGeom = new THREE.ConeGeometry(0.04, 0.08, 5);
    const stemMat = new THREE.MeshStandardMaterial({ color: 0x15803d });
    const stem = new THREE.Mesh(stemGeom, stemMat);
    stem.position.set(0, 0.44, 0.1);
    throwGroup.add(stem);

    this.group.add(throwGroup);

    const startPos = new THREE.Vector3(0.5, -0.6, 2.8);
    const throwReleasePos = new THREE.Vector3(0.2, 0.4, 2.2);
    const hitPos = new THREE.Vector3(target.x, target.y + 0.1, target.z + 0.35);

    throwGroup.position.copy(startPos);

    let tomatoDetached = false;
    let impactFired = false;
    const duration = 520; // ms

    this.activeAttack = {
      type: 'tomato',
      mesh: throwGroup,
      startTime: performance.now(),
      duration,
      onUpdate: (p) => {
        if (p < 0.3) {
          // Hand winds up and throws forward
          const t = p / 0.3;
          throwGroup.position.lerpVectors(startPos, throwReleasePos, t * t);
          throwGroup.rotation.x = -t * 0.4;
        } else {
          // Tomato detaches and flies in parabola
          if (!tomatoDetached) {
            tomatoDetached = true;
            // Detach tomato into world coordinates
            throwGroup.remove(tomatoMesh);
            throwGroup.remove(stem);
            this.group.add(tomatoMesh);
            this.group.add(stem);
            // Hide player hand
            hand.visible = false;
          }

          const t = (p - 0.3) / 0.7;
          // Parabolic trajectory
          const currentX = (1 - t) * throwReleasePos.x + t * hitPos.x;
          const currentY = (1 - t) * throwReleasePos.y + t * hitPos.y + Math.sin(t * Math.PI) * 0.45;
          const currentZ = (1 - t) * throwReleasePos.z + t * hitPos.z;

          tomatoMesh.position.set(currentX, currentY, currentZ);
          stem.position.set(currentX, currentY + 0.14, currentZ);
          tomatoMesh.rotation.x += 0.25;
          tomatoMesh.rotation.y += 0.18;

          if (t >= 0.95 && !impactFired) {
            impactFired = true;
            if (onImpact) onImpact();
            this.group.remove(tomatoMesh);
            this.group.remove(stem);
          }
        }
      },
      onComplete: () => {
        this.group.remove(throwGroup);
        this.disposeGroup(throwGroup);
      }
    };
  }

  // =========================================================================
  // 5. WATER SPLASH (পানি ছিটানো) - Water Spray Nozzle / Pichkari Blaster
  // =========================================================================
  private playWaterBlast(target: THREE.Vector3, onImpact?: () => void) {
    const blasterGroup = new THREE.Group();

    // Colorful water nozzle / pichkari
    const tubeGeom = new THREE.CylinderGeometry(0.08, 0.12, 0.9, 12);
    const tubeMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.3 });
    const tube = new THREE.Mesh(tubeGeom, tubeMat);
    tube.rotation.x = Math.PI / 2.5;
    blasterGroup.add(tube);

    // Tip ring
    const tipGeom = new THREE.TorusGeometry(0.09, 0.03, 8, 16);
    const tipMat = new THREE.MeshStandardMaterial({ color: 0xfacc15 });
    const tip = new THREE.Mesh(tipGeom, tipMat);
    tip.position.set(0, 0.35, -0.4);
    blasterGroup.add(tip);

    // Water jet particles
    const particleCount = 45;
    const waterGeom = new THREE.BufferGeometry();
    const waterPos = new Float32Array(particleCount * 3);
    const waterVelocities: { x: number; y: number; z: number }[] = [];

    for (let i = 0; i < particleCount; i++) {
      waterPos[i * 3] = 0;
      waterPos[i * 3 + 1] = 0;
      waterPos[i * 3 + 2] = 0;
      waterVelocities.push({
        x: (Math.random() - 0.5) * 0.4,
        y: (Math.random() - 0.5) * 0.4,
        z: -6.5 - Math.random() * 2
      });
    }

    waterGeom.setAttribute('position', new THREE.BufferAttribute(waterPos, 3));
    const waterMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.14,
      transparent: true,
      opacity: 0.9
    });
    const waterStream = new THREE.Points(waterGeom, waterMat);
    blasterGroup.add(waterStream);

    this.group.add(blasterGroup);

    blasterGroup.position.set(0.7, -0.6, 2.6);
    blasterGroup.lookAt(target.x, target.y + 0.1, target.z);

    let impactFired = false;
    const duration = 550; // ms

    this.activeAttack = {
      type: 'water',
      mesh: blasterGroup,
      startTime: performance.now(),
      duration,
      onUpdate: (p) => {
        // Jitter nozzle from recoil
        blasterGroup.position.x = 0.7 + (Math.random() - 0.5) * 0.03;
        blasterGroup.position.y = -0.6 + (Math.random() - 0.5) * 0.03;

        // Animate water spray particles flying forward
        const posAttr = waterGeom.attributes.position as THREE.BufferAttribute;
        const arr = posAttr.array as Float32Array;

        for (let i = 0; i < particleCount; i++) {
          const streamProg = (p * 2 + i / particleCount) % 1;
          arr[i * 3] = (Math.random() - 0.5) * 0.15 * streamProg;
          arr[i * 3 + 1] = 0.35 + (Math.random() - 0.5) * 0.15 * streamProg;
          arr[i * 3 + 2] = -streamProg * 2.8;
        }
        posAttr.needsUpdate = true;

        if (p > 0.4 && !impactFired) {
          impactFired = true;
          if (onImpact) onImpact();
        }
      },
      onComplete: () => {
        this.group.remove(blasterGroup);
        this.disposeGroup(blasterGroup);
      }
    };
  }

  // =========================================================================
  // 6. TICKLE (সুরসুরি) - Cartoon wiggling tickle fingers on enemy ribs
  // =========================================================================
  private playTickleAttack(target: THREE.Vector3, onImpact?: () => void) {
    const tickleGroup = new THREE.Group();

    const leftHand = this.createOpenHandMesh(false);
    leftHand.scale.setScalar(0.7);
    leftHand.position.set(target.x - 0.48, target.y - 0.1, target.z + 0.2);
    leftHand.rotation.set(0.2, 0.4, 0.5);
    tickleGroup.add(leftHand);

    const rightHand = this.createOpenHandMesh(true);
    rightHand.scale.setScalar(0.7);
    rightHand.position.set(target.x + 0.48, target.y - 0.1, target.z + 0.2);
    rightHand.rotation.set(0.2, -0.4, -0.5);
    tickleGroup.add(rightHand);

    this.group.add(tickleGroup);

    let impactFired = false;
    const duration = 600; // ms

    this.activeAttack = {
      type: 'tickle',
      mesh: tickleGroup,
      startTime: performance.now(),
      duration,
      onUpdate: (p) => {
        const wiggle = Math.sin(p * 35) * 0.12;
        leftHand.position.x = target.x - 0.45 + wiggle;
        rightHand.position.x = target.x + 0.45 - wiggle;
        leftHand.rotation.z = 0.5 + wiggle * 2;
        rightHand.rotation.z = -0.5 - wiggle * 2;

        if (!impactFired && p > 0.2) {
          impactFired = true;
          if (onImpact) onImpact();
        }
      },
      onComplete: () => {
        this.group.remove(tickleGroup);
        this.disposeGroup(tickleGroup);
      }
    };
  }

  // =========================================================================
  // Mesh Generators
  // =========================================================================

  /**
   * Creates an articulated, stylized human open hand with palm, thumb, and 4 fingers
   */
  private createOpenHandMesh(isRightHand: boolean = true): THREE.Group {
    const hand = new THREE.Group();

    // Forearm / Sleeve
    const sleeveGeom = new THREE.CylinderGeometry(0.18, 0.22, 0.9, 16);
    const sleeveMesh = new THREE.Mesh(sleeveGeom, this.shirtMaterial);
    sleeveMesh.position.y = -0.65;
    hand.add(sleeveMesh);

    // Wrist
    const wristGeom = new THREE.CylinderGeometry(0.14, 0.16, 0.25, 12);
    const wristMesh = new THREE.Mesh(wristGeom, this.skinMaterial);
    wristMesh.position.y = -0.2;
    hand.add(wristMesh);

    // Main Palm
    const palmGeom = new THREE.BoxGeometry(0.38, 0.36, 0.12);
    const palmMesh = new THREE.Mesh(palmGeom, this.skinMaterial);
    palmMesh.position.y = 0.08;
    hand.add(palmMesh);

    // 4 Fingers
    const fingerHeights = [0.28, 0.34, 0.32, 0.25]; // index, middle, ring, pinky
    const fingerSpacing = 0.085;
    const startX = -0.125;

    for (let i = 0; i < 4; i++) {
      const fGeom = new THREE.CylinderGeometry(0.04, 0.045, fingerHeights[i], 10);
      const finger = new THREE.Mesh(fGeom, this.skinMaterial);
      finger.position.set(startX + i * fingerSpacing, 0.26 + fingerHeights[i] / 2, 0);
      hand.add(finger);

      // Fingertip round cap
      const tipGeom = new THREE.SphereGeometry(0.04, 8, 8);
      const tip = new THREE.Mesh(tipGeom, this.skinMaterial);
      tip.position.set(startX + i * fingerSpacing, 0.26 + fingerHeights[i], 0);
      hand.add(tip);
    }

    // Thumb
    const thumbGeom = new THREE.CylinderGeometry(0.045, 0.05, 0.26, 10);
    const thumb = new THREE.Mesh(thumbGeom, this.skinMaterial);
    const side = isRightHand ? -1 : 1;
    thumb.position.set(side * 0.24, 0.05, 0.04);
    thumb.rotation.z = side * 0.75;
    thumb.rotation.x = 0.2;
    hand.add(thumb);

    if (!isRightHand) {
      hand.scale.x = -1;
    }

    return hand;
  }

  /**
   * Creates a solid clenched player fist with curled fingers and wrist wrap
   */
  private createClenchedFistMesh(): THREE.Group {
    const fist = new THREE.Group();

    // Forearm
    const armGeom = new THREE.CylinderGeometry(0.2, 0.24, 1.1, 16);
    const armMesh = new THREE.Mesh(armGeom, this.shirtMaterial);
    armMesh.position.y = -0.7;
    fist.add(armMesh);

    // Red Boxing Glove / Wrap
    const gloveGeom = new THREE.SphereGeometry(0.32, 18, 18);
    gloveGeom.scale(1.15, 1.0, 1.25);
    const gloveMesh = new THREE.Mesh(gloveGeom, this.gloveMaterial);
    gloveMesh.position.y = 0.05;
    fist.add(gloveMesh);

    // White thumb wrap
    const thumbGeom = new THREE.CylinderGeometry(0.09, 0.11, 0.28, 12);
    const thumbMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
    const thumbMesh = new THREE.Mesh(thumbGeom, thumbMat);
    thumbMesh.position.set(-0.25, -0.02, 0.12);
    thumbMesh.rotation.z = 0.6;
    thumbMesh.rotation.x = 0.4;
    fist.add(thumbMesh);

    // Knuckle ridges
    for (let i = 0; i < 4; i++) {
      const ridgeGeom = new THREE.SphereGeometry(0.07, 8, 8);
      const ridgeMat = new THREE.MeshStandardMaterial({ color: 0x991b1b });
      const ridge = new THREE.Mesh(ridgeGeom, ridgeMat);
      ridge.position.set(-0.18 + i * 0.12, 0.18, 0.26);
      fist.add(ridge);
    }

    return fist;
  }

  // =========================================================================
  // Render Loop Update
  // =========================================================================
  public update(_delta: number) {
    if (!this.activeAttack) return;

    const now = performance.now();
    const elapsed = now - this.activeAttack.startTime;
    const progress = Math.min(1, elapsed / this.activeAttack.duration);

    this.activeAttack.onUpdate(progress);

    if (progress >= 1) {
      if (this.activeAttack.onComplete) {
        this.activeAttack.onComplete();
      }
      this.activeAttack = null;
    }
  }

  private clearCurrentAttack() {
    if (this.activeAttack) {
      this.group.remove(this.activeAttack.mesh);
      this.disposeGroup(this.activeAttack.mesh);
      this.activeAttack = null;
    }
  }

  private disposeGroup(group: THREE.Group) {
    group.traverse((obj) => {
      if (obj instanceof THREE.Mesh || obj instanceof THREE.Points) {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      }
    });
  }

  public dispose() {
    this.clearCurrentAttack();
    this.skinMaterial.dispose();
    this.gloveMaterial.dispose();
    this.shirtMaterial.dispose();
  }
}
