import * as THREE from 'three';
import type { AnimationState, CharacterData } from '../../types';

export class CharacterModel3D {
  public group: THREE.Group;

  // Joints and parts
  private rootBone: THREE.Group;
  private torso: THREE.Group;
  private head: THREE.Group;
  private neck: THREE.Group;
  private leftArm: THREE.Group;
  private rightArm: THREE.Group;
  private leftHand: THREE.Mesh;
  private rightHand: THREE.Mesh;
  private leftLeg: THREE.Group;
  private rightLeg: THREE.Group;
  private faceMesh: THREE.Mesh;
  private faceMaterial: THREE.MeshStandardMaterial;
  private tomatoSplatMesh: THREE.Mesh;
  private dizzyStarsGroup: THREE.Group;

  // Animation state
  private currentState: AnimationState = 'IDLE';
  private animTime: number = 0;
  private hitTime: number = 0;
  private characterData: CharacterData | null = null;
  private textureLoader: THREE.TextureLoader = new THREE.TextureLoader();

  constructor(accentColor: string = '#ec4899') {
    this.group = new THREE.Group();

    // Base root container
    this.rootBone = new THREE.Group();
    this.group.add(this.rootBone);

    // Torso Material
    const bodyMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(accentColor),
      roughness: 0.4,
      metalness: 0.15
    });

    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xfbd0b0, // warm cartoon peach
      roughness: 0.5,
      metalness: 0.05
    });

    const pantsMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b, // slate dark pants
      roughness: 0.6,
      metalness: 0.1
    });

    const shoeMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9, // white sneakers with red stripe
      roughness: 0.3
    });

    // 1. Torso
    this.torso = new THREE.Group();
    this.torso.position.y = 1.0;
    this.rootBone.add(this.torso);

    const chestGeom = new THREE.CylinderGeometry(0.38, 0.3, 0.75, 16);
    chestGeom.scale(1.2, 1, 0.75);
    const chestMesh = new THREE.Mesh(chestGeom, bodyMat);
    chestMesh.castShadow = true;
    this.torso.add(chestMesh);

    // Belt / Tie accent
    const tieGeom = new THREE.BoxGeometry(0.1, 0.45, 0.04);
    const tieMat = new THREE.MeshStandardMaterial({ color: 0xef4444 });
    const tieMesh = new THREE.Mesh(tieGeom, tieMat);
    tieMesh.position.set(0, 0.05, 0.28);
    this.torso.add(tieMesh);

    // 2. Neck & Head
    this.neck = new THREE.Group();
    this.neck.position.y = 0.45;
    this.torso.add(this.neck);

    const neckGeom = new THREE.CylinderGeometry(0.12, 0.14, 0.2, 12);
    const neckMesh = new THREE.Mesh(neckGeom, skinMat);
    this.neck.add(neckMesh);

    this.head = new THREE.Group();
    this.head.position.y = 0.35;
    this.neck.add(this.head);

    // Head base (slightly oversized cartoon head)
    const headGeom = new THREE.SphereGeometry(0.42, 24, 24);
    headGeom.scale(1.0, 1.15, 0.95);
    const headMesh = new THREE.Mesh(headGeom, skinMat);
    headMesh.castShadow = true;
    this.head.add(headMesh);

    // Hair
    const hairGeom = new THREE.SphereGeometry(0.44, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.55);
    hairGeom.scale(1.02, 1.18, 0.98);
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x3b2f2f, roughness: 0.7 });
    const hairMesh = new THREE.Mesh(hairGeom, hairMat);
    hairMesh.position.set(0, 0.02, -0.02);
    this.head.add(hairMesh);

    // Cartoon Ears
    const earGeom = new THREE.SphereGeometry(0.1, 8, 8);
    earGeom.scale(0.5, 1, 0.8);
    const leftEar = new THREE.Mesh(earGeom, skinMat);
    leftEar.position.set(-0.42, 0.0, 0);
    const rightEar = leftEar.clone();
    rightEar.position.set(0.42, 0.0, 0);
    this.head.add(leftEar);
    this.head.add(rightEar);

    // Front Face Plane for dynamic caricature / avatar texture
    const facePlaneGeom = new THREE.PlaneGeometry(0.55, 0.65);
    this.faceMaterial = new THREE.MeshStandardMaterial({
      transparent: true,
      roughness: 0.4,
      metalness: 0.05
    });
    this.faceMesh = new THREE.Mesh(facePlaneGeom, this.faceMaterial);
    this.faceMesh.position.set(0, 0.02, 0.38);
    this.head.add(this.faceMesh);

    // Initialize with a high-res default funny procedural face
    this.updateFaceTexture(null, 'neutral');

    // Tomato Splat Decal Mesh (initially hidden)
    const splatGeom = new THREE.PlaneGeometry(0.45, 0.45);
    const splatCanvas = this.createTomatoSplatTexture();
    const splatTex = new THREE.CanvasTexture(splatCanvas);
    const splatMat = new THREE.MeshStandardMaterial({
      map: splatTex,
      transparent: true,
      roughness: 0.2
    });
    this.tomatoSplatMesh = new THREE.Mesh(splatGeom, splatMat);
    this.tomatoSplatMesh.position.set(0.04, 0.06, 0.40);
    this.tomatoSplatMesh.visible = false;
    this.head.add(this.tomatoSplatMesh);

    // Dizzy Orbiting Stars
    this.dizzyStarsGroup = new THREE.Group();
    this.dizzyStarsGroup.position.y = 0.55;
    this.dizzyStarsGroup.visible = false;
    this.head.add(this.dizzyStarsGroup);

    const starGeom = new THREE.OctahedronGeometry(0.08, 0);
    const starMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    for (let i = 0; i < 4; i++) {
      const star = new THREE.Mesh(starGeom, starMat);
      const angle = (i / 4) * Math.PI * 2;
      star.position.set(Math.cos(angle) * 0.45, 0, Math.sin(angle) * 0.45);
      this.dizzyStarsGroup.add(star);
    }

    // 3. Left Arm
    this.leftArm = new THREE.Group();
    this.leftArm.position.set(-0.52, 0.28, 0);
    this.torso.add(this.leftArm);

    const armGeom = new THREE.CylinderGeometry(0.1, 0.09, 0.65, 12);
    const leftArmMesh = new THREE.Mesh(armGeom, bodyMat);
    leftArmMesh.position.y = -0.32;
    leftArmMesh.castShadow = true;
    this.leftArm.add(leftArmMesh);

    const handGeom = new THREE.SphereGeometry(0.13, 12, 12);
    handGeom.scale(1, 1.2, 0.9);
    this.leftHand = new THREE.Mesh(handGeom, skinMat);
    this.leftHand.position.y = -0.68;
    this.leftArm.add(this.leftHand);

    // 4. Right Arm
    this.rightArm = new THREE.Group();
    this.rightArm.position.set(0.52, 0.28, 0);
    this.torso.add(this.rightArm);

    const rightArmMesh = leftArmMesh.clone();
    this.rightArm.add(rightArmMesh);

    this.rightHand = new THREE.Mesh(handGeom, skinMat);
    this.rightHand.position.y = -0.68;
    this.rightArm.add(this.rightHand);

    // 5. Left Leg
    this.leftLeg = new THREE.Group();
    this.leftLeg.position.set(-0.2, -0.38, 0);
    this.torso.add(this.leftLeg);

    const legGeom = new THREE.CylinderGeometry(0.12, 0.1, 0.75, 12);
    const leftLegMesh = new THREE.Mesh(legGeom, pantsMat);
    leftLegMesh.position.y = -0.37;
    leftLegMesh.castShadow = true;
    this.leftLeg.add(leftLegMesh);

    const shoeGeom = new THREE.BoxGeometry(0.18, 0.12, 0.35);
    const leftShoe = new THREE.Mesh(shoeGeom, shoeMat);
    leftShoe.position.set(0, -0.75, 0.08);
    leftShoe.castShadow = true;
    this.leftLeg.add(leftShoe);

    // 6. Right Leg
    this.rightLeg = new THREE.Group();
    this.rightLeg.position.set(0.2, -0.38, 0);
    this.torso.add(this.rightLeg);

    const rightLegMesh = leftLegMesh.clone();
    this.rightLeg.add(rightLegMesh);

    const rightShoe = leftShoe.clone();
    this.rightLeg.add(rightShoe);

    // Initial pose
    this.leftArm.rotation.z = 0.15;
    this.rightArm.rotation.z = -0.15;
  }

  public setCharacter(data: CharacterData) {
    this.characterData = data;
    this.updateFaceTexture(data.faceTextureUrl || data.originalImage || null, data.expression);
  }

  public setAnimationState(state: AnimationState) {
    this.currentState = state;
    this.hitTime = 0;

    if (state === 'TOMATO_REACTION') {
      this.tomatoSplatMesh.visible = true;
      this.tomatoSplatMesh.rotation.z = (Math.random() - 0.5) * 0.8;
    } else if (state === 'CELEBRATE') {
      this.tomatoSplatMesh.visible = false;
      this.dizzyStarsGroup.visible = false;
    }

    if (state === 'DIZZY' || (this.characterData && this.characterData.expression === 'dizzy')) {
      this.dizzyStarsGroup.visible = true;
    } else if (state === 'IDLE' && this.characterData?.expression !== 'dizzy') {
      this.dizzyStarsGroup.visible = false;
    }
  }

  public clearTomatoSplat() {
    this.tomatoSplatMesh.visible = false;
  }

  public update(delta: number) {
    this.animTime += delta;
    this.hitTime += delta;

    // Orbit dizzy stars
    if (this.dizzyStarsGroup.visible) {
      this.dizzyStarsGroup.rotation.y += delta * 4;
    }

    // Animation state machine
    switch (this.currentState) {
      case 'IDLE':
        this.animateIdle();
        break;

      case 'SLAP_REACTION':
        this.animateSlapReaction();
        break;

      case 'PUNCH_REACTION':
        this.animatePunchReaction();
        break;

      case 'PUSH_REACTION':
        this.animatePushReaction();
        break;

      case 'TOMATO_REACTION':
        this.animateTomatoReaction();
        break;

      case 'WATER_REACTION':
        this.animateWaterReaction();
        break;

      case 'TICKLE_REACTION':
        this.animateTickleReaction();
        break;

      case 'CELEBRATE':
        this.animateCelebrate();
        break;

      case 'DIZZY':
        this.animateDizzy();
        break;
    }
  }

  // --- Animation State Implementations ---

  private animateIdle() {
    // Smooth sinusoidal breathing & idle swaying
    const t = this.animTime * 2.2;
    const breath = Math.sin(t) * 0.03;

    // Torso subtle breathing
    this.torso.position.y = THREE.MathUtils.lerp(this.torso.position.y, 1.0 + breath, 0.1);
    this.torso.rotation.z = THREE.MathUtils.lerp(this.torso.rotation.z, Math.sin(t * 0.5) * 0.02, 0.1);
    this.torso.rotation.x = THREE.MathUtils.lerp(this.torso.rotation.x, 0, 0.1);
    this.torso.position.z = THREE.MathUtils.lerp(this.torso.position.z, 0, 0.1);

    // Head subtle sway
    this.head.rotation.y = THREE.MathUtils.lerp(this.head.rotation.y, Math.sin(t * 0.4) * 0.05, 0.1);
    this.head.rotation.x = THREE.MathUtils.lerp(this.head.rotation.x, Math.sin(t * 0.8) * 0.02, 0.1);
    this.head.rotation.z = THREE.MathUtils.lerp(this.head.rotation.z, 0, 0.1);

    // Arms gentle bobbing
    this.leftArm.rotation.z = THREE.MathUtils.lerp(this.leftArm.rotation.z, 0.15 + Math.sin(t) * 0.04, 0.1);
    this.rightArm.rotation.z = THREE.MathUtils.lerp(this.rightArm.rotation.z, -0.15 - Math.sin(t) * 0.04, 0.1);
    this.leftArm.rotation.x = THREE.MathUtils.lerp(this.leftArm.rotation.x, 0, 0.1);
    this.rightArm.rotation.x = THREE.MathUtils.lerp(this.rightArm.rotation.x, 0, 0.1);

    // Root clamp
    this.rootBone.position.y = THREE.MathUtils.lerp(this.rootBone.position.y, 0, 0.15);
    this.rootBone.rotation.y = THREE.MathUtils.lerp(this.rootBone.rotation.y, 0, 0.1);
  }

  private animateSlapReaction() {
    // Sharp whip to the side with spring bounce back
    const p = Math.min(1, this.hitTime / 0.65);
    const curve = Math.sin(p * Math.PI) * Math.exp(-p * 3);

    this.head.rotation.y = 0.85 * curve;
    this.head.rotation.z = -0.4 * curve;
    this.torso.rotation.z = -0.2 * curve;
    this.leftArm.rotation.z = 0.4 * curve + 0.15;
    this.rightArm.rotation.z = -0.6 * curve - 0.15;
  }

  private animatePunchReaction() {
    // Head snaps backwards, torso pushed back along Z
    const p = Math.min(1, this.hitTime / 0.8);
    const curve = Math.sin(p * Math.PI) * Math.exp(-p * 2.5);

    this.head.rotation.x = -0.75 * curve;
    this.torso.rotation.x = -0.45 * curve;
    this.torso.position.z = -0.45 * curve;
    this.leftArm.rotation.x = 0.6 * curve;
    this.rightArm.rotation.x = 0.6 * curve;
  }

  private animatePushReaction() {
    // Rock back onto heels, windmilling arms
    const p = Math.min(1, this.hitTime / 0.85);
    const curve = Math.sin(p * Math.PI);

    this.torso.rotation.x = -0.55 * curve;
    this.torso.position.z = -0.6 * curve;
    this.head.rotation.x = 0.3 * curve;

    // Windmill arms
    const spin = this.hitTime * 14;
    this.leftArm.rotation.x = Math.sin(spin) * 0.8;
    this.rightArm.rotation.x = -Math.sin(spin) * 0.8;
  }

  private animateTomatoReaction() {
    const p = Math.min(1, this.hitTime / 0.7);
    const curve = Math.sin(p * Math.PI) * Math.exp(-p * 3.0);

    this.head.rotation.x = -0.4 * curve;
    this.head.rotation.y = (Math.sin(this.hitTime * 20) * 0.15) * curve;
    this.torso.rotation.x = -0.2 * curve;
  }

  private animateWaterReaction() {
    // Rapid dog-like head shimmy
    const p = Math.min(1, this.hitTime / 0.75);
    const decay = 1 - p;
    const shimmy = Math.sin(this.hitTime * 35) * 0.45 * decay;

    this.head.rotation.y = shimmy;
    this.head.rotation.z = Math.cos(this.hitTime * 35) * 0.25 * decay;
    this.torso.rotation.y = -shimmy * 0.3;
    this.leftArm.rotation.z = 0.3 + Math.abs(shimmy) * 0.5;
    this.rightArm.rotation.z = -0.3 - Math.abs(shimmy) * 0.5;
  }

  private animateTickleReaction() {
    // Jittery giggling vibration
    const p = Math.min(1, this.hitTime / 0.7);
    const decay = 1 - p;
    const vibration = Math.sin(this.hitTime * 40) * 0.15 * decay;

    this.torso.position.y = 1.0 + Math.abs(Math.sin(this.hitTime * 30)) * 0.12 * decay;
    this.head.rotation.z = vibration;
    this.head.rotation.x = 0.15 + vibration * 0.5;
    this.leftArm.rotation.x = Math.sin(this.hitTime * 25) * 0.4;
    this.rightArm.rotation.x = Math.sin(this.hitTime * 25 + Math.PI) * 0.4;
  }

  private animateCelebrate() {
    // Jump up, 360 spin, arms raised
    const p = Math.min(1, this.hitTime / 1.0);
    const jump = Math.sin(p * Math.PI) * 0.6;

    this.rootBone.position.y = jump;
    this.rootBone.rotation.y = p * Math.PI * 2;
    this.leftArm.rotation.z = 2.4 * Math.sin(p * Math.PI);
    this.rightArm.rotation.z = -2.4 * Math.sin(p * Math.PI);
  }

  private animateDizzy() {
    const t = this.animTime * 3;
    this.head.rotation.y = Math.cos(t) * 0.3;
    this.head.rotation.x = Math.sin(t) * 0.2;
    this.torso.rotation.z = Math.sin(t * 0.5) * 0.1;
  }

  // --- Dynamic Facial Texture Generator ---

  public updateFaceTexture(imageUrl: string | null, expression: CharacterData['expression'] = 'neutral') {
    if (imageUrl && imageUrl.startsWith('data:image') || imageUrl && imageUrl.startsWith('http') || imageUrl && imageUrl.startsWith('/')) {
      this.textureLoader.load(imageUrl, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        this.faceMaterial.map = tex;
        this.faceMaterial.needsUpdate = true;
      }, undefined, () => {
        // Fallback to procedural face if image fails
        this.renderProceduralFace(expression);
      });
    } else {
      this.renderProceduralFace(expression);
    }
  }

  private renderProceduralFace(expression: CharacterData['expression']) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Transparent background
    ctx.clearRect(0, 0, 512, 512);

    // Warm peach skin base oval
    ctx.fillStyle = '#fbd0b0';
    ctx.beginPath();
    ctx.ellipse(256, 260, 200, 230, 0, 0, Math.PI * 2);
    ctx.fill();

    // Rosy cheeks
    ctx.fillStyle = 'rgba(244, 63, 94, 0.25)';
    ctx.beginPath();
    ctx.ellipse(140, 310, 45, 25, 0, 0, Math.PI * 2);
    ctx.ellipse(372, 310, 45, 25, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eyes & Expressions
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1e1b4b';

    if (expression === 'dizzy') {
      // Spiral cartoon dizzy eyes
      const drawSpiral = (cx: number, cy: number) => {
        ctx.beginPath();
        for (let a = 0; a < 14; a += 0.2) {
          const r = a * 4;
          const x = cx + Math.cos(a) * r;
          const y = cy + Math.sin(a) * r;
          if (a === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      };
      drawSpiral(180, 210);
      drawSpiral(332, 210);

      // Wobbly mouth
      ctx.beginPath();
      ctx.moveTo(190, 380);
      ctx.bezierCurveTo(230, 350, 280, 410, 320, 370);
      ctx.stroke();

    } else if (expression === 'shocked') {
      // Big round wide eyes
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(175, 200, 55, 0, Math.PI * 2);
      ctx.arc(337, 200, 55, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Small pinpoint pupils
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(175, 200, 16, 0, Math.PI * 2);
      ctx.arc(337, 200, 16, 0, Math.PI * 2);
      ctx.fill();

      // High arched brows
      ctx.beginPath();
      ctx.arc(175, 140, 45, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(337, 140, 45, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();

      // Big O-shaped mouth
      ctx.fillStyle = '#1e1b4b';
      ctx.beginPath();
      ctx.ellipse(256, 370, 35, 55, 0, 0, Math.PI * 2);
      ctx.fill();

    } else if (expression === 'funny_smile' || expression === 'crying_laugh') {
      // Squinted joyful curved eyes (^_^)
      ctx.beginPath();
      ctx.arc(175, 220, 40, Math.PI * 1.2, Math.PI * 1.8);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(337, 220, 40, Math.PI * 1.2, Math.PI * 1.8);
      ctx.stroke();

      // Wide cartoon open grin
      ctx.fillStyle = '#7f1d1d';
      ctx.beginPath();
      ctx.arc(256, 350, 70, 0, Math.PI);
      ctx.fill();
      ctx.stroke();

      // White teeth
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(200, 350, 112, 24);

      // Pink tongue
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(256, 405, 30, 0, Math.PI);
      ctx.fill();

    } else {
      // Default Smirking / Neutral cartoon face
      // Whites of eyes
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(175, 210, 40, 46, 0, 0, Math.PI * 2);
      ctx.ellipse(337, 210, 40, 46, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Iris & pupils (looking slightly smug)
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(185, 210, 22, 0, Math.PI * 2);
      ctx.arc(347, 210, 22, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(187, 210, 12, 0, Math.PI * 2);
      ctx.arc(349, 210, 12, 0, Math.PI * 2);
      ctx.fill();

      // Highlights
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(192, 203, 6, 0, Math.PI * 2);
      ctx.arc(354, 203, 6, 0, Math.PI * 2);
      ctx.fill();

      // Eyebrows (cocky raised eyebrow on right)
      ctx.beginPath();
      ctx.moveTo(140, 160);
      ctx.lineTo(210, 155);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(300, 150);
      ctx.lineTo(370, 130);
      ctx.stroke();

      // Smirking mouth
      ctx.beginPath();
      ctx.moveTo(200, 360);
      ctx.quadraticCurveTo(270, 365, 320, 335);
      ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    this.faceMaterial.map = tex;
    this.faceMaterial.needsUpdate = true;
  }

  private createTomatoSplatTexture(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    ctx.clearRect(0, 0, 256, 256);
    ctx.fillStyle = '#dc2626';

    // Central irregular splat
    ctx.beginPath();
    ctx.arc(128, 128, 48, 0, Math.PI * 2);
    ctx.fill();

    // Droplets radiating out
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2 + Math.random() * 0.4;
      const d = 55 + Math.random() * 45;
      const r = 10 + Math.random() * 15;
      ctx.beginPath();
      ctx.arc(128 + Math.cos(a) * d, 128 + Math.sin(a) * d, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Dripping streak
    ctx.fillRect(118, 140, 20, 65);
    ctx.beginPath();
    ctx.arc(128, 205, 15, 0, Math.PI * 2);
    ctx.fill();

    // Dark tomato seed accents
    ctx.fillStyle = '#851a1a';
    ctx.beginPath();
    ctx.ellipse(120, 120, 6, 12, 0.4, 0, Math.PI * 2);
    ctx.ellipse(140, 135, 6, 12, -0.3, 0, Math.PI * 2);
    ctx.fill();

    return canvas;
  }

  public getHeadWorldPosition(target: THREE.Vector3): THREE.Vector3 {
    return this.head.getWorldPosition(target);
  }

  public getTorsoWorldPosition(target: THREE.Vector3): THREE.Vector3 {
    return this.torso.getWorldPosition(target);
  }

  public dispose() {
    this.faceMaterial.dispose();
    if (this.faceMaterial.map) this.faceMaterial.map.dispose();
  }
}
