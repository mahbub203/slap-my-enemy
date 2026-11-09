import * as THREE from 'three';
import type { ScenarioId } from '../../types';

export interface EnvironmentSceneResult {
  group: THREE.Group;
  dispose: () => void;
  update?: (delta: number) => void;
}

interface AnimatedEntity {
  update: (delta: number) => void;
}

type ResourceTracker = <T extends THREE.BufferGeometry | THREE.Material | THREE.Texture>(res: T) => T;

export function createBangladeshEnvironment(
  scene: THREE.Scene,
  scenario: ScenarioId,
  _quality: 'low' | 'medium' | 'high'
): EnvironmentSceneResult {
  const envGroup = new THREE.Group();
  scene.add(envGroup);

  const disposables: (THREE.BufferGeometry | THREE.Material | THREE.Texture)[] = [];
  let updateFn: ((delta: number) => void) | undefined;

  // Track textures and materials for cleanup
  const track = <T extends THREE.BufferGeometry | THREE.Material | THREE.Texture>(res: T): T => {
    disposables.push(res);
    return res;
  };

  switch (scenario) {
    case 'dhaka-street':
      updateFn = buildDhakaStreet(envGroup, track);
      break;

    case 'village':
      updateFn = buildVillage(envGroup, track);
      break;

    case 'campus':
      updateFn = buildCampus(envGroup, track);
      break;

    case 'bazar':
      updateFn = buildBazar(envGroup, track);
      break;

    case 'rooftop':
      updateFn = buildRooftop(envGroup, track);
      break;

    case 'eid-festival':
      updateFn = buildEidFestival(envGroup, track);
      break;
  }

  return {
    group: envGroup,
    dispose: () => {
      scene.remove(envGroup);
      for (const res of disposables) {
        res.dispose();
      }
    },
    update: updateFn
  };
}

// =========================================================================
// PROCEDURAL ANIMATED BANGLADESHI PEDESTRIAN BUILDER
// =========================================================================
function createAnimatedPedestrian(
  parent: THREE.Group,
  track: ResourceTracker,
  config: {
    startX: number;
    z: number;
    speed: number;
    direction: 1 | -1;
    minX: number;
    maxX: number;
    shirtColor: number;
    pantsColor: number;
    hasLungi?: boolean;
    hasCap?: boolean;
    hasBag?: boolean;
    scale?: number;
  }
): AnimatedEntity {
  const ped = new THREE.Group();
  const s = config.scale || 0.85;
  ped.scale.set(s, s, s);
  ped.position.set(config.startX, 0, config.z);
  parent.add(ped);

  const skinMat = track(new THREE.MeshStandardMaterial({ color: 0xdfa070, roughness: 0.6 }));
  const shirtMat = track(new THREE.MeshStandardMaterial({ color: config.shirtColor, roughness: 0.7 }));
  const pantsMat = track(new THREE.MeshStandardMaterial({ color: config.pantsColor, roughness: 0.8 }));
  const hairMat = track(new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.9 }));

  // Root container for walking bob
  const bodyRoot = new THREE.Group();
  ped.add(bodyRoot);

  // Torso
  const torsoGeom = track(new THREE.CylinderGeometry(0.2, 0.17, 0.65, 12));
  torsoGeom.scale(1.15, 1.0, 0.75);
  const torso = new THREE.Mesh(torsoGeom, shirtMat);
  torso.position.y = 1.05;
  bodyRoot.add(torso);

  // If Lungi, lower part extends
  if (config.hasLungi) {
    const lungiGeom = track(new THREE.CylinderGeometry(0.18, 0.22, 0.55, 12));
    const lungi = new THREE.Mesh(lungiGeom, pantsMat);
    lungi.position.y = 0.62;
    bodyRoot.add(lungi);
  }

  // Head
  const headGeom = track(new THREE.SphereGeometry(0.18, 14, 14));
  const head = new THREE.Mesh(headGeom, skinMat);
  head.position.y = 1.55;
  bodyRoot.add(head);

  // Hair or Prayer Cap (Topi)
  if (config.hasCap) {
    const capGeom = track(new THREE.CylinderGeometry(0.17, 0.18, 0.12, 14));
    const capMat = track(new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 }));
    const cap = new THREE.Mesh(capGeom, capMat);
    cap.position.y = 1.68;
    bodyRoot.add(cap);
  } else {
    const hairGeom = track(new THREE.SphereGeometry(0.19, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.45));
    const hair = new THREE.Mesh(hairGeom, hairMat);
    hair.position.y = 1.58;
    bodyRoot.add(hair);
  }

  // Left Arm
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.28, 1.3, 0);
  bodyRoot.add(leftArm);
  const armGeom = track(new THREE.CylinderGeometry(0.06, 0.05, 0.55, 8));
  const leftArmMesh = new THREE.Mesh(armGeom, shirtMat);
  leftArmMesh.position.y = -0.25;
  leftArm.add(leftArmMesh);

  // Right Arm
  const rightArm = new THREE.Group();
  rightArm.position.set(0.28, 1.3, 0);
  bodyRoot.add(rightArm);
  const rightArmMesh = leftArmMesh.clone();
  rightArm.add(rightArmMesh);

  // Optional Bazar shopping bag in hand
  if (config.hasBag) {
    const bagGeom = track(new THREE.BoxGeometry(0.16, 0.25, 0.08));
    const bagMat = track(new THREE.MeshStandardMaterial({ color: 0xef4444 }));
    const bag = new THREE.Mesh(bagGeom, bagMat);
    bag.position.set(0, -0.45, 0.05);
    rightArm.add(bag);
  }

  // Left Leg
  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.12, 0.75, 0);
  ped.add(leftLeg);
  const legGeom = track(new THREE.CylinderGeometry(0.07, 0.06, 0.75, 8));
  const leftLegMesh = new THREE.Mesh(legGeom, pantsMat);
  leftLegMesh.position.y = -0.375;
  leftLeg.add(leftLegMesh);

  // Right Leg
  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.12, 0.75, 0);
  ped.add(rightLeg);
  const rightLegMesh = leftLegMesh.clone();
  rightLeg.add(rightLegMesh);

  // Facing direction
  ped.rotation.y = config.direction > 0 ? Math.PI / 2 : -Math.PI / 2;

  let currentX = config.startX;
  let dir = config.direction;
  let walkPhase = Math.random() * Math.PI * 2;

  return {
    update: (delta: number) => {
      // Advance position
      currentX += dir * config.speed * delta;
      if (dir > 0 && currentX > config.maxX) {
        dir = -1;
        ped.rotation.y = -Math.PI / 2;
      } else if (dir < 0 && currentX < config.minX) {
        dir = 1;
        ped.rotation.y = Math.PI / 2;
      }
      ped.position.x = currentX;

      // Leg & Arm swinging
      walkPhase += config.speed * delta * 5.5;
      const legSwing = Math.sin(walkPhase) * 0.55;
      leftLeg.rotation.x = legSwing;
      rightLeg.rotation.x = -legSwing;

      leftArm.rotation.x = -legSwing * 0.7;
      rightArm.rotation.x = legSwing * 0.7;

      // Vertical body bobbing
      bodyRoot.position.y = Math.abs(Math.sin(walkPhase * 2)) * 0.04;
    }
  };
}

// =========================================================================
// PROCEDURAL MOVING DHAKA GREEN CNG AUTO-RICKSHAW
// =========================================================================
function createMovingCNG(
  parent: THREE.Group,
  track: ResourceTracker
): AnimatedEntity {
  const cng = new THREE.Group();
  cng.position.set(12, 0, -2.8);
  parent.add(cng);

  // 1. Green Cage Body
  const bodyGeom = track(new THREE.BoxGeometry(2.4, 1.2, 1.4));
  const bodyMat = track(new THREE.MeshStandardMaterial({
    color: 0x15803d, // Dhaka CNG green
    roughness: 0.4,
    metalness: 0.2
  }));
  const body = new THREE.Mesh(bodyGeom, bodyMat);
  body.position.y = 0.9;
  cng.add(body);

  // 2. Yellow Canvas Roof
  const roofGeom = track(new THREE.BoxGeometry(2.5, 0.2, 1.5));
  const roofMat = track(new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.5 }));
  const roof = new THREE.Mesh(roofGeom, roofMat);
  roof.position.y = 1.6;
  cng.add(roof);

  // 3. Black Safety Wire Mesh (Rear & sides)
  const cageGeom = track(new THREE.BoxGeometry(2.35, 0.6, 1.38));
  const cageMat = track(new THREE.MeshBasicMaterial({ color: 0x0f172a, wireframe: true }));
  const cage = new THREE.Mesh(cageGeom, cageMat);
  cage.position.y = 1.15;
  cng.add(cage);

  // 4. Front Windshield & Headlight
  const glassGeom = track(new THREE.PlaneGeometry(0.8, 0.6));
  const glassMat = track(new THREE.MeshPhysicalMaterial({ color: 0xe0f2fe, transmission: 0.8, roughness: 0.1 }));
  const windshield = new THREE.Mesh(glassGeom, glassMat);
  windshield.position.set(-1.21, 1.15, 0);
  windshield.rotation.y = -Math.PI / 2;
  cng.add(windshield);

  // Headlight (Yellow glow)
  const headlightGeom = track(new THREE.SphereGeometry(0.12, 8, 8));
  const headlightMat = track(new THREE.MeshBasicMaterial({ color: 0xfef08a }));
  const headlight = new THREE.Mesh(headlightGeom, headlightMat);
  headlight.position.set(-1.22, 0.6, 0);
  cng.add(headlight);

  const lightGlow = new THREE.PointLight(0xfef08a, 4, 6);
  lightGlow.position.set(-1.5, 0.6, 0);
  cng.add(lightGlow);

  // 5. Wheels
  const wheelGeom = track(new THREE.CylinderGeometry(0.3, 0.3, 0.18, 16));
  const wheelMat = track(new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.8 }));

  // Front wheel
  const frontWheel = new THREE.Mesh(wheelGeom, wheelMat);
  frontWheel.rotation.x = Math.PI / 2;
  frontWheel.position.set(-0.85, 0.3, 0);
  cng.add(frontWheel);

  // Left Rear
  const rearLeft = new THREE.Mesh(wheelGeom, wheelMat);
  rearLeft.rotation.x = Math.PI / 2;
  rearLeft.position.set(0.75, 0.3, -0.7);
  cng.add(rearLeft);

  // Right Rear
  const rearRight = rearLeft.clone();
  rearRight.position.z = 0.7;
  cng.add(rearRight);

  const wheels = [frontWheel, rearLeft, rearRight];

  let currentX = 12;
  const speed = 4.2;

  return {
    update: (delta: number) => {
      currentX -= speed * delta;
      if (currentX < -14) {
        currentX = 14;
      }
      cng.position.x = currentX;

      // Slight road vibration
      cng.position.y = Math.sin(currentX * 12) * 0.015;

      // Rotate wheels
      for (const w of wheels) {
        w.rotation.z += delta * 14;
      }
    }
  };
}

// =========================================================================
// SCENARIO A: DHAKA CITY STREET (BUSTLING URBAN ROAD)
// =========================================================================
function buildDhakaStreet(
  parent: THREE.Group,
  track: ResourceTracker
): (delta: number) => void {
  const animatedEntities: AnimatedEntity[] = [];

  // 1. Broad Asphalt Road
  const roadGeom = track(new THREE.PlaneGeometry(24, 16));
  const roadMat = track(new THREE.MeshStandardMaterial({
    color: 0x181a20,
    roughness: 0.85,
    metalness: 0.1
  }));
  const roadMesh = new THREE.Mesh(roadGeom, roadMat);
  roadMesh.rotation.x = -Math.PI / 2;
  roadMesh.receiveShadow = true;
  parent.add(roadMesh);

  // Yellow dashed lane dividers
  for (let z = -5; z <= 5; z += 2.8) {
    const lineGeom = track(new THREE.PlaneGeometry(0.24, 1.4));
    const lineMat = track(new THREE.MeshBasicMaterial({ color: 0xfacc15 }));
    const lineMesh = new THREE.Mesh(lineGeom, lineMat);
    lineMesh.rotation.x = -Math.PI / 2;
    lineMesh.position.set(0, 0.01, z);
    parent.add(lineMesh);
  }

  // 2. Pedestrian Zebra Crossing (সাদা জেব্রা ক্রসিং)
  for (let i = -5; i <= 5; i += 1.2) {
    const stripeGeom = track(new THREE.PlaneGeometry(0.65, 3.8));
    const stripeMat = track(new THREE.MeshBasicMaterial({ color: 0xf8fafc }));
    const stripe = new THREE.Mesh(stripeGeom, stripeMat);
    stripe.rotation.x = -Math.PI / 2;
    stripe.position.set(i, 0.012, -0.6);
    parent.add(stripe);
  }

  // 3. Concrete Sidewalk Curb
  const curbGeom = track(new THREE.BoxGeometry(24, 0.22, 3.2));
  const curbMat = track(new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.7 }));
  const curbMesh = new THREE.Mesh(curbGeom, curbMat);
  curbMesh.position.set(0, 0.11, -4.6);
  parent.add(curbMesh);

  // 4. Traditional Tea Stall (Tong er Dokan) on Right
  const teaStall = new THREE.Group();
  teaStall.position.set(3.4, 0, -3.8);
  parent.add(teaStall);

  const stallGeom = track(new THREE.BoxGeometry(1.6, 0.95, 0.8));
  const stallMat = track(new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 }));
  const stallMesh = new THREE.Mesh(stallGeom, stallMat);
  stallMesh.position.set(0, 0.475, 0);
  teaStall.add(stallMesh);

  // Blue tarpaulin roof
  const roofGeom = track(new THREE.ConeGeometry(1.3, 0.65, 4));
  const roofMat = track(new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.5 }));
  const roofMesh = new THREE.Mesh(roofGeom, roofMat);
  roofMesh.position.set(0, 1.65, 0);
  roofMesh.rotation.y = Math.PI / 4;
  teaStall.add(roofMesh);

  // Metal Tea Kettle (Ketli)
  const kettleGeom = track(new THREE.CylinderGeometry(0.12, 0.16, 0.3, 12));
  const kettleMat = track(new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.2 }));
  const kettle = new THREE.Mesh(kettleGeom, kettleMat);
  kettle.position.set(-0.25, 1.05, 0);
  teaStall.add(kettle);

  // Animated Kettle Steam Particles
  const steamCount = 18;
  const steamGeom = track(new THREE.BufferGeometry());
  const steamPos = new Float32Array(steamCount * 3);
  for (let i = 0; i < steamCount; i++) {
    steamPos[i * 3] = -0.25 + (Math.random() - 0.5) * 0.1;
    steamPos[i * 3 + 1] = 1.25 + (i / steamCount) * 0.5;
    steamPos[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
  }
  steamGeom.setAttribute('position', new THREE.BufferAttribute(steamPos, 3));
  const steamMat = track(new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.08,
    transparent: true,
    opacity: 0.5
  }));
  const steam = new THREE.Points(steamGeom, steamMat);
  teaStall.add(steam);

  // 5. Bengali Signboard Billboard
  const signGeom = track(new THREE.PlaneGeometry(2.0, 0.8));
  const signCanvas = document.createElement('canvas');
  signCanvas.width = 512;
  signCanvas.height = 200;
  const sCtx = signCanvas.getContext('2d');
  if (sCtx) {
    sCtx.fillStyle = '#065f46';
    sCtx.fillRect(0, 0, 512, 200);
    sCtx.fillStyle = '#facc15';
    sCtx.font = 'bold 50px system-ui';
    sCtx.textAlign = 'center';
    sCtx.fillText('চায়ের টং ও নাস্তা', 256, 85);
    sCtx.font = '28px system-ui';
    sCtx.fillStyle = '#ffffff';
    sCtx.fillText('খাঁটি গরুর দুধের স্পেশাল চা', 256, 145);
  }
  const signTex = track(new THREE.CanvasTexture(signCanvas));
  const signMat = track(new THREE.MeshBasicMaterial({ map: signTex }));
  const signMesh = new THREE.Mesh(signGeom, signMat);
  signMesh.position.set(3.4, 2.05, -3.8);
  parent.add(signMesh);

  // 6. Street Lampposts with warm amber light
  const postGeom = track(new THREE.CylinderGeometry(0.06, 0.08, 4.2, 8));
  const postMat = track(new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7 }));
  const post1 = new THREE.Mesh(postGeom, postMat);
  post1.position.set(-4.5, 2.1, -2.5);
  parent.add(post1);

  const light1 = new THREE.PointLight(0xfbbf24, 18, 10);
  light1.position.set(-4.5, 4.0, -2.3);
  parent.add(light1);

  // =========================================================================
  // 7. MULTIPLE ANIMATED PEDESTRIANS WALKING ON THE ROAD & SIDEWALK
  // =========================================================================

  // Pedestrian 1: Elder uncle in white Panjabi, lungi, and topi walking on the sidewalk
  animatedEntities.push(
    createAnimatedPedestrian(parent, track, {
      startX: -5,
      z: -4.4,
      speed: 1.1,
      direction: 1,
      minX: -8,
      maxX: 8,
      shirtColor: 0xf8fafc, // White Panjabi
      pantsColor: 0x0284c7, // Blue checkered lungi
      hasLungi: true,
      hasCap: true,
      scale: 0.85
    })
  );

  // Pedestrian 2: Young commuter in teal t-shirt and jeans walking in opposite direction
  animatedEntities.push(
    createAnimatedPedestrian(parent, track, {
      startX: 4,
      z: -4.8,
      speed: 1.4,
      direction: -1,
      minX: -8,
      maxX: 8,
      shirtColor: 0x06b6d4, // Teal
      pantsColor: 0x1e293b, // Dark jeans
      scale: 0.88
    })
  );

  // Pedestrian 3: Bazar shopper in yellow/mustard kurta carrying grocery bag across the sidewalk
  animatedEntities.push(
    createAnimatedPedestrian(parent, track, {
      startX: -2,
      z: -3.8,
      speed: 1.25,
      direction: 1,
      minX: -8,
      maxX: 8,
      shirtColor: 0xeab308, // Mustard kurta
      pantsColor: 0x334155,
      hasBag: true,
      scale: 0.84
    })
  );

  // Pedestrian 4: Student in crimson polo shirt walking along the street
  animatedEntities.push(
    createAnimatedPedestrian(parent, track, {
      startX: 6,
      z: -5.1,
      speed: 1.3,
      direction: -1,
      minX: -8,
      maxX: 8,
      shirtColor: 0xe11d48, // Crimson polo
      pantsColor: 0x0f172a,
      scale: 0.82
    })
  );

  // =========================================================================
  // 8. MOVING DHAKA GREEN CNG AUTO-RICKSHAW ON THE ROAD
  // =========================================================================
  animatedEntities.push(createMovingCNG(parent, track));

  // Return render loop update
  return (delta: number) => {
    for (const ent of animatedEntities) {
      ent.update(delta);
    }

    // Animate rising tea steam
    const pos = steamGeom.attributes.position as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;
    for (let i = 0; i < steamCount; i++) {
      arr[i * 3 + 1] += delta * 0.4;
      arr[i * 3] += Math.sin(arr[i * 3 + 1] * 10) * 0.005;
      if (arr[i * 3 + 1] > 1.8) {
        arr[i * 3 + 1] = 1.25;
      }
    }
    pos.needsUpdate = true;
  };
}

// =========================================================================
// SCENARIO B: BANGLADESHI VILLAGE (SOBUJ GRAM)
// =========================================================================
function buildVillage(
  parent: THREE.Group,
  track: ResourceTracker
): (delta: number) => void {
  const animatedEntities: AnimatedEntity[] = [];

  // Ground
  const groundGeom = track(new THREE.PlaneGeometry(24, 16));
  const groundMat = track(new THREE.MeshStandardMaterial({
    color: 0x15803d, // Paddy green
    roughness: 0.9
  }));
  const groundMesh = new THREE.Mesh(groundGeom, groundMat);
  groundMesh.rotation.x = -Math.PI / 2;
  groundMesh.receiveShadow = true;
  parent.add(groundMesh);

  // Courtyard
  const yardGeom = track(new THREE.CircleGeometry(3.8, 32));
  const yardMat = track(new THREE.MeshStandardMaterial({
    color: 0x854d0e,
    roughness: 0.95
  }));
  const yardMesh = new THREE.Mesh(yardGeom, yardMat);
  yardMesh.rotation.x = -Math.PI / 2;
  yardMesh.position.y = 0.01;
  parent.add(yardMesh);

  // Rural Tin-roof Hut
  const hut = new THREE.Group();
  hut.position.set(0, 0, -4.5);
  parent.add(hut);

  const wallGeom = track(new THREE.BoxGeometry(3.4, 1.7, 2.4));
  const wallMat = track(new THREE.MeshStandardMaterial({ color: 0xa16207, roughness: 0.85 }));
  const wallMesh = new THREE.Mesh(wallGeom, wallMat);
  wallMesh.position.y = 0.85;
  hut.add(wallMesh);

  const roofGeom = track(new THREE.ConeGeometry(2.8, 1.3, 4));
  const roofMat = track(new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    metalness: 0.6,
    roughness: 0.4
  }));
  const roofMesh = new THREE.Mesh(roofGeom, roofMat);
  roofMesh.position.y = 2.2;
  roofMesh.rotation.y = Math.PI / 4;
  hut.add(roofMesh);

  // Coconut Palm Trees
  const makePalmTree = (x: number, z: number) => {
    const tree = new THREE.Group();
    tree.position.set(x, 0, z);

    const trunkGeom = track(new THREE.CylinderGeometry(0.12, 0.2, 4.4, 8));
    const trunkMat = track(new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 }));
    const trunk = new THREE.Mesh(trunkGeom, trunkMat);
    trunk.position.y = 2.2;
    tree.add(trunk);

    for (let i = 0; i < 7; i++) {
      const angle = (i / 7) * Math.PI * 2;
      const frondGeom = track(new THREE.ConeGeometry(0.42, 2.2, 4));
      const frondMat = track(new THREE.MeshStandardMaterial({ color: 0x166534 }));
      const frond = new THREE.Mesh(frondGeom, frondMat);
      frond.position.set(Math.cos(angle) * 0.75, 4.4, Math.sin(angle) * 0.75);
      frond.rotation.x = Math.PI / 2 + 0.3;
      frond.rotation.y = angle;
      tree.add(frond);
    }
    parent.add(tree);
  };

  makePalmTree(-4.2, -2.8);
  makePalmTree(4.2, -3.2);

  // Village Pedestrians walking by the courtyard
  animatedEntities.push(
    createAnimatedPedestrian(parent, track, {
      startX: -4,
      z: -4.0,
      speed: 1.0,
      direction: 1,
      minX: -7,
      maxX: 7,
      shirtColor: 0x22c55e, // Green genji
      pantsColor: 0x854d0e, // Lungi
      hasLungi: true,
      scale: 0.82
    })
  );

  animatedEntities.push(
    createAnimatedPedestrian(parent, track, {
      startX: 3,
      z: -4.8,
      speed: 1.15,
      direction: -1,
      minX: -7,
      maxX: 7,
      shirtColor: 0xf97316, // Orange kurta
      pantsColor: 0xf8fafc,
      hasCap: true,
      scale: 0.8
    })
  );

  return (delta: number) => {
    for (const ent of animatedEntities) {
      ent.update(delta);
    }
  };
}

// =========================================================================
// SCENARIO C: UNIVERSITY CAMPUS
// =========================================================================
function buildCampus(
  parent: THREE.Group,
  track: ResourceTracker
): (delta: number) => void {
  const animatedEntities: AnimatedEntity[] = [];

  const plazaGeom = track(new THREE.PlaneGeometry(24, 16));
  const plazaMat = track(new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 }));
  const plazaMesh = new THREE.Mesh(plazaGeom, plazaMat);
  plazaMesh.rotation.x = -Math.PI / 2;
  plazaMesh.receiveShadow = true;
  parent.add(plazaMesh);

  // Red Brick Walkway
  const walkGeom = track(new THREE.PlaneGeometry(5.0, 16));
  const walkMat = track(new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.75 }));
  const walkMesh = new THREE.Mesh(walkGeom, walkMat);
  walkMesh.rotation.x = -Math.PI / 2;
  walkMesh.position.y = 0.01;
  parent.add(walkMesh);

  // Red Brick Colonial Pillars (Curzon Hall style)
  for (let i = -3; i <= 3; i += 2) {
    const pillarGeom = track(new THREE.CylinderGeometry(0.22, 0.26, 4.2, 12));
    const pillarMat = track(new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.6 }));
    const pillar = new THREE.Mesh(pillarGeom, pillarMat);
    pillar.position.set(i * 1.6, 2.1, -4.8);
    parent.add(pillar);
  }

  // Header beam
  const beamGeom = track(new THREE.BoxGeometry(13, 0.45, 0.65));
  const beamMat = track(new THREE.MeshStandardMaterial({ color: 0xf1f5f9 }));
  const beamMesh = new THREE.Mesh(beamGeom, beamMat);
  beamMesh.position.set(0, 4.2, -4.8);
  parent.add(beamMesh);

  // Walking students
  animatedEntities.push(
    createAnimatedPedestrian(parent, track, {
      startX: -4,
      z: -4.2,
      speed: 1.35,
      direction: 1,
      minX: -7,
      maxX: 7,
      shirtColor: 0x3b82f6, // Blue shirt
      pantsColor: 0x1e293b,
      scale: 0.85
    })
  );

  animatedEntities.push(
    createAnimatedPedestrian(parent, track, {
      startX: 3,
      z: -4.5,
      speed: 1.25,
      direction: -1,
      minX: -7,
      maxX: 7,
      shirtColor: 0xec4899, // Pink polo
      pantsColor: 0x334155,
      scale: 0.82
    })
  );

  return (delta: number) => {
    for (const ent of animatedEntities) {
      ent.update(delta);
    }
  };
}

// =========================================================================
// SCENARIO D: LOCAL BAZAR (KACHA BAZAR)
// =========================================================================
function buildBazar(
  parent: THREE.Group,
  track: ResourceTracker
): (delta: number) => void {
  const animatedEntities: AnimatedEntity[] = [];

  const floorGeom = track(new THREE.PlaneGeometry(24, 16));
  const floorMat = track(new THREE.MeshStandardMaterial({
    color: 0x1f2937,
    roughness: 0.4,
    metalness: 0.3
  }));
  const floorMesh = new THREE.Mesh(floorGeom, floorMat);
  floorMesh.rotation.x = -Math.PI / 2;
  floorMesh.receiveShadow = true;
  parent.add(floorMesh);

  // Stalls
  const makeStall = (x: number, z: number, color: number) => {
    const stall = new THREE.Group();
    stall.position.set(x, 0, z);

    const tableGeom = track(new THREE.BoxGeometry(2.0, 0.8, 1.1));
    const tableMat = track(new THREE.MeshStandardMaterial({ color: 0x713f12, roughness: 0.9 }));
    const table = new THREE.Mesh(tableGeom, tableMat);
    table.position.y = 0.4;
    stall.add(table);

    const canopyGeom = track(new THREE.BoxGeometry(2.2, 0.1, 1.3));
    const canopyMat = track(new THREE.MeshStandardMaterial({ color, roughness: 0.5 }));
    const canopy = new THREE.Mesh(canopyGeom, canopyMat);
    canopy.position.set(0, 1.8, 0);
    stall.add(canopy);

    parent.add(stall);
  };

  makeStall(-3.4, -2.8, 0xef4444);
  makeStall(3.4, -2.8, 0x10b981);

  // Bazar shoppers with bags
  animatedEntities.push(
    createAnimatedPedestrian(parent, track, {
      startX: -4,
      z: -4.0,
      speed: 1.2,
      direction: 1,
      minX: -7,
      maxX: 7,
      shirtColor: 0x6366f1,
      pantsColor: 0x1e293b,
      hasBag: true,
      scale: 0.84
    })
  );

  return (delta: number) => {
    for (const ent of animatedEntities) {
      ent.update(delta);
    }
  };
}

// =========================================================================
// SCENARIO E: DHAKA ROOFTOP
// =========================================================================
function buildRooftop(
  parent: THREE.Group,
  track: ResourceTracker
): (delta: number) => void {
  const roofGeom = track(new THREE.PlaneGeometry(24, 16));
  const roofMat = track(new THREE.MeshStandardMaterial({
    color: 0x9a3412,
    roughness: 0.75
  }));
  const roofMesh = new THREE.Mesh(roofGeom, roofMat);
  roofMesh.rotation.x = -Math.PI / 2;
  roofMesh.receiveShadow = true;
  parent.add(roofMesh);

  // Railing
  const wallGeom = track(new THREE.BoxGeometry(24, 0.9, 0.3));
  const wallMat = track(new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.7 }));
  const backWall = new THREE.Mesh(wallGeom, wallMat);
  backWall.position.set(0, 0.45, -5.5);
  parent.add(backWall);

  // Black Water Tank
  const tank = new THREE.Group();
  tank.position.set(-3.2, 0, -4.2);
  parent.add(tank);

  const tankBodyGeom = track(new THREE.CylinderGeometry(0.7, 0.7, 1.6, 20));
  const tankMat = track(new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.2 }));
  const tankBody = new THREE.Mesh(tankBodyGeom, tankMat);
  tankBody.position.y = 1.0;
  tank.add(tankBody);

  return () => {};
}

// =========================================================================
// SCENARIO F: EID FESTIVAL
// =========================================================================
function buildEidFestival(
  parent: THREE.Group,
  track: ResourceTracker
): (delta: number) => void {
  const stageGeom = track(new THREE.CylinderGeometry(5.2, 5.4, 0.3, 32));
  const stageMat = track(new THREE.MeshStandardMaterial({
    color: 0x1e1b4b,
    roughness: 0.3,
    metalness: 0.6
  }));
  const stage = new THREE.Mesh(stageGeom, stageMat);
  stage.position.y = -0.15;
  stage.receiveShadow = true;
  parent.add(stage);

  // Glowing Green & Gold Rings
  const ringGeom = track(new THREE.TorusGeometry(5.0, 0.05, 16, 64));
  ringGeom.rotateX(Math.PI / 2);
  const ringMat = track(new THREE.MeshBasicMaterial({ color: 0x10b981 }));
  const ring = new THREE.Mesh(ringGeom, ringMat);
  ring.position.y = 0.02;
  parent.add(ring);

  // Giant Crescent Moon
  const crescentGroup = new THREE.Group();
  crescentGroup.position.set(0, 3.2, -4.5);
  parent.add(crescentGroup);

  const moonGeom = track(new THREE.TorusGeometry(1.2, 0.16, 16, 32, Math.PI * 1.5));
  const goldMat = track(new THREE.MeshBasicMaterial({ color: 0xfacc15 }));
  const moon = new THREE.Mesh(moonGeom, goldMat);
  moon.rotation.z = Math.PI * 0.25;
  crescentGroup.add(moon);

  const starGeom = track(new THREE.OctahedronGeometry(0.3, 0));
  const star = new THREE.Mesh(starGeom, goldMat);
  star.position.set(0.6, 0.3, 0);
  crescentGroup.add(star);

  return (delta: number) => {
    crescentGroup.rotation.y += delta * 0.5;
    ring.rotation.z += delta * 0.2;
  };
}
