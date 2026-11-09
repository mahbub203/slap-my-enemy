import * as THREE from 'three';
import type { AnimationState, CharacterData } from '../../types';

export class CharacterModel3D {
  public group: THREE.Group;

  // Skeletal Hierarchy & Body Parts
  private rootBone: THREE.Group;
  private hips: THREE.Group;
  private torso: THREE.Group;
  private chest: THREE.Group;
  private neck: THREE.Group;
  private head: THREE.Group;
  private leftShoulder: THREE.Group;
  private rightShoulder: THREE.Group;
  private leftArm: THREE.Group;
  private rightArm: THREE.Group;
  private leftForearm: THREE.Group;
  private rightForearm: THREE.Group;
  private leftHand: THREE.Group;
  private rightHand: THREE.Group;
  private leftLeg: THREE.Group;
  private rightLeg: THREE.Group;
  private leftShin: THREE.Group;
  private rightShin: THREE.Group;
  private leftFoot: THREE.Group;
  private rightFoot: THREE.Group;

  // Face, Damage & Effects
  private faceMesh: THREE.Mesh;
  private faceMaterial: THREE.MeshStandardMaterial;
  private tomatoSplatMesh: THREE.Mesh;
  private slapMarkMesh: THREE.Mesh;
  private punchBandageMesh: THREE.Mesh;
  private dizzyStarsGroup: THREE.Group;
  private sweatDropsGroup: THREE.Group;

  // Materials
  private skinMat: THREE.MeshStandardMaterial;
  private shirtMat: THREE.MeshStandardMaterial;
  private pantsMat: THREE.MeshStandardMaterial;
  private shoeMat: THREE.MeshStandardMaterial;
  private hairMat: THREE.MeshStandardMaterial;

  // State
  private currentState: AnimationState = 'IDLE';
  private animTime: number = 0;
  private hitTime: number = 0;
  private slapMarkTimer: number = 0;
  private punchMarkTimer: number = 0;
  private characterData: CharacterData | null = null;
  private textureLoader: THREE.TextureLoader = new THREE.TextureLoader();
  private originalFaceImage: string | null = null;

  constructor(accentColor: string = '#ec4899') {
    this.group = new THREE.Group();

    // 1. Root Anchor
    this.rootBone = new THREE.Group();
    this.group.add(this.rootBone);

    // 2. High-Quality Stylized Materials
    this.skinMat = new THREE.MeshStandardMaterial({
      color: 0xf5caa6, // Natural South Asian warm skin tone
      roughness: 0.45,
      metalness: 0.05
    });

    this.shirtMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(accentColor),
      roughness: 0.5,
      metalness: 0.15
    });

    this.pantsMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b, // Modern slate dark trousers
      roughness: 0.65,
      metalness: 0.08
    });

    this.shoeMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a, // Dark sneakers with white sole
      roughness: 0.4
    });

    this.hairMat = new THREE.MeshStandardMaterial({
      color: 0x241d1a, // Dark natural hair
      roughness: 0.8
    });

    // =========================================================================
    // 3. FULL HUMAN SKELETON & BODY CONSTRUCTION
    // =========================================================================

    // Hips / Pelvis
    this.hips = new THREE.Group();
    this.hips.position.y = 0.95;
    this.rootBone.add(this.hips);

    const pelvisGeom = new THREE.CylinderGeometry(0.24, 0.22, 0.22, 16);
    pelvisGeom.scale(1.15, 1.0, 0.85);
    const pelvisMesh = new THREE.Mesh(pelvisGeom, this.pantsMat);
    pelvisMesh.castShadow = true;
    this.hips.add(pelvisMesh);

    // Belt
    const beltGeom = new THREE.CylinderGeometry(0.25, 0.25, 0.06, 16);
    beltGeom.scale(1.16, 1.0, 0.86);
    const beltMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 });
    const beltMesh = new THREE.Mesh(beltGeom, beltMat);
    beltMesh.position.y = 0.08;
    this.hips.add(beltMesh);

    // Belt Buckle (Gold accent)
    const buckleGeom = new THREE.BoxGeometry(0.08, 0.06, 0.03);
    const buckleMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.8, roughness: 0.2 });
    const buckleMesh = new THREE.Mesh(buckleGeom, buckleMat);
    buckleMesh.position.set(0, 0.08, 0.22);
    this.hips.add(buckleMesh);

    // Torso / Abdomen
    this.torso = new THREE.Group();
    this.torso.position.y = 0.12;
    this.hips.add(this.torso);

    const abGeom = new THREE.CylinderGeometry(0.28, 0.24, 0.32, 16);
    abGeom.scale(1.18, 1.0, 0.82);
    const abMesh = new THREE.Mesh(abGeom, this.shirtMat);
    abMesh.position.y = 0.16;
    abMesh.castShadow = true;
    this.torso.add(abMesh);

    // Lower Panjabi Hem extending over hips
    const hemGeom = new THREE.CylinderGeometry(0.26, 0.31, 0.32, 16);
    hemGeom.scale(1.2, 1.0, 0.85);
    const hemMesh = new THREE.Mesh(hemGeom, this.shirtMat);
    hemMesh.position.y = -0.05;
    this.torso.add(hemMesh);

    // Chest / Upper Torso
    this.chest = new THREE.Group();
    this.chest.position.y = 0.32;
    this.torso.add(this.chest);

    const chestGeom = new THREE.CylinderGeometry(0.33, 0.28, 0.42, 16);
    chestGeom.scale(1.22, 1.0, 0.82);
    const chestMesh = new THREE.Mesh(chestGeom, this.shirtMat);
    chestMesh.position.y = 0.21;
    chestMesh.castShadow = true;
    this.chest.add(chestMesh);

    // Bangladeshi Panjabi / Shirt Button Placket
    const placketGeom = new THREE.BoxGeometry(0.06, 0.52, 0.02);
    const placketMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(accentColor).offsetHSL(0, 0, -0.15)
    });
    const placketMesh = new THREE.Mesh(placketGeom, placketMat);
    placketMesh.position.set(0, 0.22, 0.22);
    this.chest.add(placketMesh);

    // Small Golden Panjabi Buttons
    for (let b = 0; b < 3; b++) {
      const btnGeom = new THREE.SphereGeometry(0.016, 8, 8);
      const btnMesh = new THREE.Mesh(btnGeom, buckleMat);
      btnMesh.position.set(0, 0.12 + b * 0.12, 0.235);
      this.chest.add(btnMesh);
    }

    // Collar
    const collarGeom = new THREE.CylinderGeometry(0.16, 0.18, 0.12, 16);
    const collarMesh = new THREE.Mesh(collarGeom, this.shirtMat);
    collarMesh.position.y = 0.44;
    this.chest.add(collarMesh);

    // Neck
    this.neck = new THREE.Group();
    this.neck.position.y = 0.44;
    this.chest.add(this.neck);

    const neckGeom = new THREE.CylinderGeometry(0.12, 0.13, 0.18, 16);
    const neckMesh = new THREE.Mesh(neckGeom, this.skinMat);
    neckMesh.position.y = 0.09;
    this.neck.add(neckMesh);

    // =========================================================================
    // 4. HEAD, CLEAR FACE PHOTO & EXPRESSIVE FEATURES
    // =========================================================================
    this.head = new THREE.Group();
    this.head.position.y = 0.22;
    this.neck.add(this.head);

    // Base Skull (Oval cranium)
    const skullGeom = new THREE.SphereGeometry(0.34, 32, 32);
    skullGeom.scale(0.92, 1.15, 0.94);
    const skullMesh = new THREE.Mesh(skullGeom, this.skinMat);
    skullMesh.castShadow = true;
    this.head.add(skullMesh);

    // Chin & Jaw definition
    const jawGeom = new THREE.CylinderGeometry(0.16, 0.22, 0.18, 12);
    jawGeom.scale(1.0, 1.0, 0.85);
    const jawMesh = new THREE.Mesh(jawGeom, this.skinMat);
    jawMesh.position.set(0, -0.22, 0.06);
    this.head.add(jawMesh);

    // Stylized Hair (Placed strictly on the BACK, TOP, and SIDES - NEVER FRONT!)
    // Using thetaLength = Math.PI * 0.42 and positioned slightly backward so it NEVER intersects the face plane
    const hairGeom = new THREE.SphereGeometry(0.355, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.42);
    hairGeom.scale(0.94, 1.16, 0.96);
    const hairMesh = new THREE.Mesh(hairGeom, this.hairMat);
    hairMesh.position.set(0, 0.06, -0.06);
    this.head.add(hairMesh);

    // Sideburns
    const sideburnGeom = new THREE.BoxGeometry(0.04, 0.18, 0.1);
    const leftSideburn = new THREE.Mesh(sideburnGeom, this.hairMat);
    leftSideburn.position.set(-0.31, 0.04, -0.02);
    this.head.add(leftSideburn);

    const rightSideburn = leftSideburn.clone();
    rightSideburn.position.x = 0.31;
    this.head.add(rightSideburn);

    // Ears
    const earGeom = new THREE.SphereGeometry(0.08, 12, 12);
    earGeom.scale(0.4, 1.0, 0.7);
    const leftEar = new THREE.Mesh(earGeom, this.skinMat);
    leftEar.position.set(-0.32, 0.0, 0.02);
    this.head.add(leftEar);

    const rightEar = leftEar.clone();
    rightEar.position.x = 0.32;
    this.head.add(rightEar);

    // =========================================================================
    // CLEAR FACE MESH: Smooth curved front panel with zero clipping
    // =========================================================================
    // Using a subtle curved plane with polygonOffset so it ALWAYS renders proudly and cleanly in front
    const faceGeom = new THREE.PlaneGeometry(0.54, 0.62, 8, 8);
    // Subtle cylindrical curvature to hug the face
    const pos = faceGeom.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      pos.setZ(i, -x * x * 0.2); // curve backwards at the edges
    }
    faceGeom.computeVertexNormals();

    this.faceMaterial = new THREE.MeshStandardMaterial({
      transparent: true,
      roughness: 0.35,
      metalness: 0.02,
      polygonOffset: true,
      polygonOffsetFactor: -3,
      polygonOffsetUnits: -3,
      depthWrite: true
    });

    this.faceMesh = new THREE.Mesh(faceGeom, this.faceMaterial);
    // Positioned safely forward at z = 0.33 so NOTHING clips through it!
    this.faceMesh.position.set(0, 0.03, 0.33);
    this.head.add(this.faceMesh);

    // Initial default high-res procedural face
    this.renderProceduralFace('neutral');

    // =========================================================================
    // DYNAMIC DAMAGE OVERLAYS ON FACE
    // =========================================================================

    // 1. Red Cartoon Slap Handprint Decal
    const slapCanvas = document.createElement('canvas');
    slapCanvas.width = 256;
    slapCanvas.height = 256;
    const sCtx = slapCanvas.getContext('2d');
    if (sCtx) {
      sCtx.fillStyle = 'rgba(239, 68, 68, 0.85)';
      // Palm
      sCtx.beginPath();
      sCtx.arc(128, 140, 42, 0, Math.PI * 2);
      sCtx.fill();
      // 4 Fingers
      for (let f = 0; f < 4; f++) {
        sCtx.beginPath();
        sCtx.ellipse(90 + f * 26, 75, 10, 32, -0.1 + f * 0.08, 0, Math.PI * 2);
        sCtx.fill();
      }
      // Thumb
      sCtx.beginPath();
      sCtx.ellipse(62, 140, 11, 24, -0.6, 0, Math.PI * 2);
      sCtx.fill();
    }
    const slapTex = new THREE.CanvasTexture(slapCanvas);
    const slapMat = new THREE.MeshStandardMaterial({
      map: slapTex,
      transparent: true,
      opacity: 0,
      polygonOffset: true,
      polygonOffsetFactor: -4
    });
    this.slapMarkMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.32), slapMat);
    this.slapMarkMesh.position.set(0.12, -0.02, 0.34);
    this.head.add(this.slapMarkMesh);

    // 2. Punch Comic Band-Aid & Swell Bump
    const punchGroup = new THREE.Group();
    // Cross Band-aid
    const bandMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.6 });
    const b1 = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.04, 0.01), bandMat);
    b1.rotation.z = Math.PI / 4;
    const b2 = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.04, 0.01), bandMat);
    b2.rotation.z = -Math.PI / 4;
    punchGroup.add(b1);
    punchGroup.add(b2);
    // Swell bump
    const bump = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 })
    );
    bump.scale.set(1, 1, 0.4);
    bump.position.z = -0.01;
    punchGroup.add(bump);
    this.punchBandageMesh = punchGroup as unknown as THREE.Mesh;
    punchGroup.position.set(-0.16, 0.16, 0.34);
    punchGroup.visible = false;
    this.head.add(punchGroup);

    // 3. Tomato Splat Decal
    const splatCanvas = this.createTomatoSplatTexture();
    const splatTex = new THREE.CanvasTexture(splatCanvas);
    const splatMat = new THREE.MeshStandardMaterial({
      map: splatTex,
      transparent: true,
      polygonOffset: true,
      polygonOffsetFactor: -5
    });
    this.tomatoSplatMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.48, 0.48), splatMat);
    this.tomatoSplatMesh.position.set(0.02, 0.05, 0.345);
    this.tomatoSplatMesh.visible = false;
    this.head.add(this.tomatoSplatMesh);

    // 4. Dizzy Orbiting Stars
    this.dizzyStarsGroup = new THREE.Group();
    this.dizzyStarsGroup.position.y = 0.55;
    this.dizzyStarsGroup.visible = false;
    this.head.add(this.dizzyStarsGroup);

    const starGeom = new THREE.OctahedronGeometry(0.07, 0);
    const starMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    for (let i = 0; i < 4; i++) {
      const star = new THREE.Mesh(starGeom, starMat);
      const angle = (i / 4) * Math.PI * 2;
      star.position.set(Math.cos(angle) * 0.45, 0, Math.sin(angle) * 0.45);
      this.dizzyStarsGroup.add(star);
    }

    // 5. Sweat Drops (Cartoon distress)
    this.sweatDropsGroup = new THREE.Group();
    this.sweatDropsGroup.position.set(0.35, 0.22, 0.2);
    this.sweatDropsGroup.visible = false;
    this.head.add(this.sweatDropsGroup);

    const dropGeom = new THREE.ConeGeometry(0.04, 0.12, 8);
    const dropMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.85 });
    const drop = new THREE.Mesh(dropGeom, dropMat);
    drop.rotation.z = Math.PI * 0.8;
    this.sweatDropsGroup.add(drop);

    // =========================================================================
    // 5. ARMS & HANDS WITH MODELED FINGERS
    // =========================================================================

    // Left Shoulder & Arm
    this.leftShoulder = new THREE.Group();
    this.leftShoulder.position.set(-0.46, 0.34, 0);
    this.chest.add(this.leftShoulder);

    const shoulderGeom = new THREE.SphereGeometry(0.14, 12, 12);
    const leftShoulderMesh = new THREE.Mesh(shoulderGeom, this.shirtMat);
    this.leftShoulder.add(leftShoulderMesh);

    this.leftArm = new THREE.Group();
    this.leftShoulder.add(this.leftArm);

    const upperArmGeom = new THREE.CylinderGeometry(0.09, 0.08, 0.36, 12);
    const leftUpperArm = new THREE.Mesh(upperArmGeom, this.shirtMat);
    leftUpperArm.position.y = -0.18;
    leftUpperArm.castShadow = true;
    this.leftArm.add(leftUpperArm);

    // Forearm
    this.leftForearm = new THREE.Group();
    this.leftForearm.position.y = -0.36;
    this.leftArm.add(this.leftForearm);

    const forearmGeom = new THREE.CylinderGeometry(0.08, 0.07, 0.36, 12);
    const leftForearmMesh = new THREE.Mesh(forearmGeom, this.skinMat);
    leftForearmMesh.position.y = -0.18;
    leftForearmMesh.castShadow = true;
    this.leftForearm.add(leftForearmMesh);

    // Modeled Hand (Palm, Thumb, 4 Fingers)
    this.leftHand = this.createHandMesh(false);
    this.leftHand.position.y = -0.38;
    this.leftForearm.add(this.leftHand);

    // Right Shoulder & Arm
    this.rightShoulder = new THREE.Group();
    this.rightShoulder.position.set(0.46, 0.34, 0);
    this.chest.add(this.rightShoulder);

    const rightShoulderMesh = leftShoulderMesh.clone();
    this.rightShoulder.add(rightShoulderMesh);

    this.rightArm = new THREE.Group();
    this.rightShoulder.add(this.rightArm);

    const rightUpperArm = leftUpperArm.clone();
    this.rightArm.add(rightUpperArm);

    this.rightForearm = new THREE.Group();
    this.rightForearm.position.y = -0.36;
    this.rightArm.add(this.rightForearm);

    const rightForearmMesh = leftForearmMesh.clone();
    this.rightForearm.add(rightForearmMesh);

    this.rightHand = this.createHandMesh(true);
    this.rightHand.position.y = -0.38;
    this.rightForearm.add(this.rightHand);

    // =========================================================================
    // 6. LEGS & DETAILED SHOES
    // =========================================================================

    // Left Thigh
    this.leftLeg = new THREE.Group();
    this.leftLeg.position.set(-0.18, -0.12, 0);
    this.hips.add(this.leftLeg);

    const thighGeom = new THREE.CylinderGeometry(0.12, 0.1, 0.46, 14);
    const leftThighMesh = new THREE.Mesh(thighGeom, this.pantsMat);
    leftThighMesh.position.y = -0.23;
    leftThighMesh.castShadow = true;
    this.leftLeg.add(leftThighMesh);

    // Left Shin / Calf
    this.leftShin = new THREE.Group();
    this.leftShin.position.y = -0.46;
    this.leftLeg.add(this.leftShin);

    const shinGeom = new THREE.CylinderGeometry(0.1, 0.085, 0.46, 14);
    const leftShinMesh = new THREE.Mesh(shinGeom, this.pantsMat);
    leftShinMesh.position.y = -0.23;
    leftShinMesh.castShadow = true;
    this.leftShin.add(leftShinMesh);

    // Left Foot / Sneaker
    this.leftFoot = this.createShoeMesh();
    this.leftFoot.position.set(0, -0.46, 0.06);
    this.leftShin.add(this.leftFoot);

    // Right Thigh
    this.rightLeg = new THREE.Group();
    this.rightLeg.position.set(0.18, -0.12, 0);
    this.hips.add(this.rightLeg);

    const rightThighMesh = leftThighMesh.clone();
    this.rightLeg.add(rightThighMesh);

    // Right Shin
    this.rightShin = new THREE.Group();
    this.rightShin.position.y = -0.46;
    this.rightLeg.add(this.rightShin);

    const rightShinMesh = leftShinMesh.clone();
    this.rightShin.add(rightShinMesh);

    // Right Foot
    this.rightFoot = this.createShoeMesh();
    this.rightFoot.position.set(0, -0.46, 0.06);
    this.rightShin.add(this.rightFoot);

    // Initial natural idle arm stance
    this.leftArm.rotation.z = 0.18;
    this.rightArm.rotation.z = -0.18;
  }

  // =========================================================================
  // Hand & Shoe Generators
  // =========================================================================

  private createHandMesh(isRight: boolean): THREE.Group {
    const hand = new THREE.Group();

    // Palm
    const palmGeom = new THREE.BoxGeometry(0.11, 0.12, 0.05);
    const palm = new THREE.Mesh(palmGeom, this.skinMat);
    palm.position.y = -0.06;
    hand.add(palm);

    // Fingers
    const fingerHeights = [0.09, 0.11, 0.1, 0.08];
    const fingerStartX = -0.04;
    for (let i = 0; i < 4; i++) {
      const fGeom = new THREE.CylinderGeometry(0.013, 0.014, fingerHeights[i], 8);
      const finger = new THREE.Mesh(fGeom, this.skinMat);
      finger.position.set(fingerStartX + i * 0.026, -0.12 - fingerHeights[i] / 2, 0);
      hand.add(finger);
    }

    // Thumb
    const thumbGeom = new THREE.CylinderGeometry(0.015, 0.016, 0.08, 8);
    const thumb = new THREE.Mesh(thumbGeom, this.skinMat);
    const side = isRight ? -1 : 1;
    thumb.position.set(side * 0.065, -0.07, 0.02);
    thumb.rotation.z = side * 0.6;
    hand.add(thumb);

    return hand;
  }

  private createShoeMesh(): THREE.Group {
    const shoe = new THREE.Group();

    // Upper shoe
    const upperGeom = new THREE.BoxGeometry(0.16, 0.12, 0.32);
    const upper = new THREE.Mesh(upperGeom, this.shoeMat);
    upper.castShadow = true;
    shoe.add(upper);

    // White rubber sole
    const soleGeom = new THREE.BoxGeometry(0.17, 0.04, 0.34);
    const soleMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
    const sole = new THREE.Mesh(soleGeom, soleMat);
    sole.position.y = -0.07;
    sole.castShadow = true;
    shoe.add(sole);

    // Red sneaker stripe accent
    const stripeGeom = new THREE.BoxGeometry(0.172, 0.02, 0.14);
    const stripeMat = new THREE.MeshStandardMaterial({ color: 0xef4444 });
    const stripe = new THREE.Mesh(stripeGeom, stripeMat);
    stripe.position.set(0, 0.01, 0.02);
    shoe.add(stripe);

    return shoe;
  }

  // =========================================================================
  // Set Character & Texture Handling
  // =========================================================================

  public getCharacterData(): CharacterData | null {
    return this.characterData;
  }

  public setCharacter(data: CharacterData) {
    this.characterData = data;
    this.originalFaceImage = data.faceTextureUrl || data.originalImage || null;

    if (data.accentColor) {
      this.shirtMat.color.set(data.accentColor);
    }

    this.updateFaceTexture(this.originalFaceImage, data.expression);
  }

  public setAnimationState(state: AnimationState) {
    this.currentState = state;
    this.hitTime = 0;

    if (state === 'SLAP_REACTION') {
      this.slapMarkTimer = 1.6;
      (this.slapMarkMesh.material as THREE.MeshStandardMaterial).opacity = 0.9;
      this.sweatDropsGroup.visible = true;
    } else if (state === 'PUNCH_REACTION') {
      this.punchMarkTimer = 2.0;
      this.punchBandageMesh.visible = true;
      this.dizzyStarsGroup.visible = true;
    } else if (state === 'PUSH_REACTION') {
      this.sweatDropsGroup.visible = true;
    } else if (state === 'TOMATO_REACTION') {
      this.tomatoSplatMesh.visible = true;
      this.tomatoSplatMesh.rotation.z = (Math.random() - 0.5) * 0.8;
      this.sweatDropsGroup.visible = true;
    } else if (state === 'WATER_REACTION') {
      this.sweatDropsGroup.visible = true;
    } else if (state === 'CELEBRATE') {
      this.tomatoSplatMesh.visible = false;
      this.dizzyStarsGroup.visible = false;
      this.punchBandageMesh.visible = false;
      this.sweatDropsGroup.visible = false;
      (this.slapMarkMesh.material as THREE.MeshStandardMaterial).opacity = 0;
    }

    if (state === 'DIZZY') {
      this.dizzyStarsGroup.visible = true;
    } else if (state === 'IDLE') {
      if (this.punchMarkTimer <= 0) this.dizzyStarsGroup.visible = false;
      this.sweatDropsGroup.visible = false;
    }
  }

  public clearTomatoSplat() {
    this.tomatoSplatMesh.visible = false;
    this.punchBandageMesh.visible = false;
    this.dizzyStarsGroup.visible = false;
    this.sweatDropsGroup.visible = false;
    (this.slapMarkMesh.material as THREE.MeshStandardMaterial).opacity = 0;
    this.updateFaceTexture(this.originalFaceImage, 'neutral');
  }

  // =========================================================================
  // Update Animation Loop (60fps)
  // =========================================================================

  public update(delta: number) {
    this.animTime += delta;
    this.hitTime += delta;

    // Decay slap mark opacity
    if (this.slapMarkTimer > 0) {
      this.slapMarkTimer -= delta;
      const mat = this.slapMarkMesh.material as THREE.MeshStandardMaterial;
      mat.opacity = Math.max(0, this.slapMarkTimer / 1.6);
    }

    // Decay punch mark
    if (this.punchMarkTimer > 0) {
      this.punchMarkTimer -= delta;
      if (this.punchMarkTimer <= 0) {
        this.punchBandageMesh.visible = false;
        if (this.currentState === 'IDLE') this.dizzyStarsGroup.visible = false;
      }
    }

    // Orbit dizzy stars
    if (this.dizzyStarsGroup.visible) {
      this.dizzyStarsGroup.rotation.y += delta * 4.5;
    }

    // Sweat drops subtle bob
    if (this.sweatDropsGroup.visible) {
      this.sweatDropsGroup.position.y = 0.22 + Math.sin(this.animTime * 12) * 0.04;
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

  // --- Dynamic Animation Math ---

  private animateIdle() {
    const t = this.animTime * 2.2;
    const breath = Math.sin(t) * 0.025;

    // Subtle breathing
    this.chest.position.y = THREE.MathUtils.lerp(this.chest.position.y, 0.32 + breath, 0.1);
    this.chest.rotation.x = THREE.MathUtils.lerp(this.chest.rotation.x, Math.sin(t) * 0.015, 0.1);
    this.torso.rotation.z = THREE.MathUtils.lerp(this.torso.rotation.z, Math.sin(t * 0.5) * 0.015, 0.1);
    this.hips.position.y = THREE.MathUtils.lerp(this.hips.position.y, 0.95, 0.1);

    // Head gentle micro-movement
    this.head.rotation.y = THREE.MathUtils.lerp(this.head.rotation.y, Math.sin(t * 0.4) * 0.04, 0.1);
    this.head.rotation.x = THREE.MathUtils.lerp(this.head.rotation.x, Math.sin(t * 0.8) * 0.02, 0.1);
    this.head.rotation.z = THREE.MathUtils.lerp(this.head.rotation.z, 0, 0.1);

    // Natural arm breathing sway
    this.leftArm.rotation.z = THREE.MathUtils.lerp(this.leftArm.rotation.z, 0.18 + Math.sin(t) * 0.03, 0.1);
    this.rightArm.rotation.z = THREE.MathUtils.lerp(this.rightArm.rotation.z, -0.18 - Math.sin(t) * 0.03, 0.1);
    this.leftArm.rotation.x = THREE.MathUtils.lerp(this.leftArm.rotation.x, 0, 0.1);
    this.rightArm.rotation.x = THREE.MathUtils.lerp(this.rightArm.rotation.x, 0, 0.1);

    // Root clamp
    this.rootBone.position.set(0, 0, 0);
    this.rootBone.rotation.set(0, 0, 0);
  }

  private animateSlapReaction() {
    // Sharp whip to the side with snappy recoil
    const p = Math.min(1, this.hitTime / 0.65);
    const curve = Math.sin(p * Math.PI) * Math.exp(-p * 3.2);

    this.head.rotation.y = 0.95 * curve;
    this.head.rotation.z = -0.45 * curve;
    this.neck.rotation.y = 0.3 * curve;
    this.chest.rotation.z = -0.25 * curve;
    this.leftArm.rotation.z = 0.5 * curve + 0.18;
    this.rightArm.rotation.z = -0.7 * curve - 0.18;
  }

  private animatePunchReaction() {
    // Violently knocked backward
    const p = Math.min(1, this.hitTime / 0.8);
    const curve = Math.sin(p * Math.PI) * Math.exp(-p * 2.8);

    this.head.rotation.x = -0.85 * curve;
    this.chest.rotation.x = -0.5 * curve;
    this.torso.position.z = -0.5 * curve;
    this.hips.position.z = -0.25 * curve;
    this.leftArm.rotation.x = 0.7 * curve;
    this.rightArm.rotation.x = 0.7 * curve;
    this.leftArm.rotation.z = 0.4 * curve + 0.18;
    this.rightArm.rotation.z = -0.4 * curve - 0.18;
  }

  private animatePushReaction() {
    // Stagger back on heels, windmilling arms desperately
    const p = Math.min(1, this.hitTime / 0.85);
    const curve = Math.sin(p * Math.PI);

    this.chest.rotation.x = -0.6 * curve;
    this.torso.position.z = -0.7 * curve;
    this.hips.position.z = -0.4 * curve;
    this.head.rotation.x = 0.35 * curve;

    // Windmilling arms
    const spin = this.hitTime * 15;
    this.leftArm.rotation.x = Math.sin(spin) * 0.9;
    this.rightArm.rotation.x = -Math.sin(spin) * 0.9;
  }

  private animateTomatoReaction() {
    const p = Math.min(1, this.hitTime / 0.75);
    const curve = Math.sin(p * Math.PI) * Math.exp(-p * 3.0);

    this.head.rotation.x = -0.45 * curve;
    // Rapid head shake
    this.head.rotation.y = Math.sin(this.hitTime * 24) * 0.25 * curve;
    this.chest.rotation.x = -0.2 * curve;
    // Raise hands as if wiping tomato
    this.leftArm.rotation.x = 0.6 * curve;
    this.rightArm.rotation.x = 0.6 * curve;
  }

  private animateWaterReaction() {
    // Shivering like a wet dog
    const p = Math.min(1, this.hitTime / 0.75);
    const decay = 1 - p;
    const shimmy = Math.sin(this.hitTime * 40) * 0.5 * decay;

    this.head.rotation.y = shimmy;
    this.head.rotation.z = Math.cos(this.hitTime * 40) * 0.3 * decay;
    this.chest.rotation.y = -shimmy * 0.35;
    this.leftArm.rotation.z = 0.35 + Math.abs(shimmy) * 0.6;
    this.rightArm.rotation.z = -0.35 - Math.abs(shimmy) * 0.6;
  }

  private animateTickleReaction() {
    const p = Math.min(1, this.hitTime / 0.7);
    const decay = 1 - p;
    const vibration = Math.sin(this.hitTime * 42) * 0.2 * decay;

    this.torso.position.y = 0.12 + Math.abs(Math.sin(this.hitTime * 32)) * 0.14 * decay;
    this.head.rotation.z = vibration;
    this.head.rotation.x = 0.18 + vibration * 0.6;
    this.leftArm.rotation.x = Math.sin(this.hitTime * 28) * 0.5;
    this.rightArm.rotation.x = Math.sin(this.hitTime * 28 + Math.PI) * 0.5;
  }

  private animateCelebrate() {
    const p = Math.min(1, this.hitTime / 1.0);
    const jump = Math.sin(p * Math.PI) * 0.65;

    this.rootBone.position.y = jump;
    this.rootBone.rotation.y = p * Math.PI * 2;
    this.leftArm.rotation.z = 2.4 * Math.sin(p * Math.PI);
    this.rightArm.rotation.z = -2.4 * Math.sin(p * Math.PI);
  }

  private animateDizzy() {
    const t = this.animTime * 3;
    this.head.rotation.y = Math.cos(t) * 0.35;
    this.head.rotation.x = Math.sin(t) * 0.22;
    this.chest.rotation.z = Math.sin(t * 0.5) * 0.12;
  }

  // =========================================================================
  // Face Texture Mapping & Rendering ("pic clear thakbe")
  // =========================================================================

  public updateFaceTexture(imageUrl: string | null, expression: CharacterData['expression'] = 'neutral') {
    if (imageUrl && (imageUrl.startsWith('data:image') || imageUrl.startsWith('http') || imageUrl.startsWith('/'))) {
      this.textureLoader.load(imageUrl, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.generateMipmaps = true;

        this.faceMaterial.map = tex;
        this.faceMaterial.needsUpdate = true;
      }, undefined, () => {
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

    ctx.clearRect(0, 0, 512, 512);

    // Warm peach skin base oval
    ctx.fillStyle = '#f5caa6';
    ctx.beginPath();
    ctx.ellipse(256, 260, 205, 235, 0, 0, Math.PI * 2);
    ctx.fill();

    // Rosy cheeks
    ctx.fillStyle = 'rgba(244, 63, 94, 0.22)';
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
      // Joyful curved squinted eyes
      ctx.beginPath();
      ctx.arc(175, 220, 40, Math.PI * 1.2, Math.PI * 1.8);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(337, 220, 40, Math.PI * 1.2, Math.PI * 1.8);
      ctx.stroke();

      // Wide open grin
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
      // Default Smug / Neutral face
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(175, 210, 40, 46, 0, 0, Math.PI * 2);
      ctx.ellipse(337, 210, 40, 46, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

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

      // Eyebrows
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
    ctx.arc(128, 128, 52, 0, Math.PI * 2);
    ctx.fill();

    // Radiating droplets
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 + Math.random() * 0.4;
      const d = 58 + Math.random() * 48;
      const r = 10 + Math.random() * 16;
      ctx.beginPath();
      ctx.arc(128 + Math.cos(a) * d, 128 + Math.sin(a) * d, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Dripping stream
    ctx.fillRect(118, 140, 22, 70);
    ctx.beginPath();
    ctx.arc(129, 212, 16, 0, Math.PI * 2);
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
    return this.chest.getWorldPosition(target);
  }

  public dispose() {
    this.faceMaterial.dispose();
    if (this.faceMaterial.map) this.faceMaterial.map.dispose();
    this.skinMat.dispose();
    this.shirtMat.dispose();
    this.pantsMat.dispose();
    this.shoeMat.dispose();
    this.hairMat.dispose();
  }
}
