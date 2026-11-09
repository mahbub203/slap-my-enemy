import * as THREE from 'three';
import type { ScenarioId } from '../../types';

export interface EnvironmentSceneResult {
  group: THREE.Group;
  dispose: () => void;
  update?: (delta: number) => void;
}

export function createBangladeshEnvironment(
  scene: THREE.Scene,
  scenario: ScenarioId,
  _quality: 'low' | 'medium' | 'high'
): EnvironmentSceneResult {
  const envGroup = new THREE.Group();
  scene.add(envGroup);

  const disposables: (THREE.BufferGeometry | THREE.Material)[] = [];
  let updateFn: ((delta: number) => void) | undefined;

  // Track textures and materials for cleanup
  const track = <T extends THREE.BufferGeometry | THREE.Material>(res: T): T => {
    disposables.push(res);
    return res;
  };

  switch (scenario) {
    case 'dhaka-street':
      buildDhakaStreet(envGroup, track);
      break;

    case 'village':
      buildVillage(envGroup, track);
      break;

    case 'campus':
      buildCampus(envGroup, track);
      break;

    case 'bazar':
      buildBazar(envGroup, track);
      break;

    case 'rooftop':
      buildRooftop(envGroup, track);
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

// ==========================================
// SCENARIO A: DHAKA CITY STREET
// ==========================================
function buildDhakaStreet(
  parent: THREE.Group,
  track: <T extends THREE.BufferGeometry | THREE.Material>(res: T) => T
) {
  // 1. Asphalt Road Floor
  const roadGeom = track(new THREE.PlaneGeometry(16, 16));
  const roadMat = track(new THREE.MeshStandardMaterial({
    color: 0x181a20,
    roughness: 0.8,
    metalness: 0.1
  }));
  const roadMesh = new THREE.Mesh(roadGeom, roadMat);
  roadMesh.rotation.x = -Math.PI / 2;
  roadMesh.receiveShadow = true;
  parent.add(roadMesh);

  // Yellow road lane dividers
  for (let z = -6; z <= 6; z += 3) {
    const lineGeom = track(new THREE.PlaneGeometry(0.25, 1.4));
    const lineMat = track(new THREE.MeshBasicMaterial({ color: 0xfacc15 }));
    const lineMesh = new THREE.Mesh(lineGeom, lineMat);
    lineMesh.rotation.x = -Math.PI / 2;
    lineMesh.position.set(0, 0.01, z);
    parent.add(lineMesh);
  }

  // 2. Concrete Sidewalk Curb
  const curbGeom = track(new THREE.BoxGeometry(16, 0.25, 2.5));
  const curbMat = track(new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.7 }));
  const curbMesh = new THREE.Mesh(curbGeom, curbMat);
  curbMesh.position.set(0, 0.1, -4.5);
  parent.add(curbMesh);

  // 3. Iconic Bangladeshi Rickshaw (Left background)
  const rickshaw = new THREE.Group();
  rickshaw.position.set(-2.8, 0, -2.5);
  rickshaw.rotation.y = 0.5;
  parent.add(rickshaw);

  // Rickshaw Frame & Hood
  const hoodGeom = track(new THREE.CylinderGeometry(0.65, 0.65, 0.8, 16, 1, false, 0, Math.PI));
  const hoodMat = track(new THREE.MeshStandardMaterial({
    color: 0xef4444, // Vibrant Dhaka rickshaw red
    roughness: 0.4
  }));
  const hoodMesh = new THREE.Mesh(hoodGeom, hoodMat);
  hoodMesh.rotation.z = Math.PI / 2;
  hoodMesh.position.set(0, 1.1, 0.2);
  rickshaw.add(hoodMesh);

  // Rickshaw Seat
  const seatGeom = track(new THREE.BoxGeometry(0.75, 0.35, 0.5));
  const seatMat = track(new THREE.MeshStandardMaterial({ color: 0x10b981 })); // Green seat
  const seatMesh = new THREE.Mesh(seatGeom, seatMat);
  seatMesh.position.set(0, 0.65, 0.2);
  rickshaw.add(seatMesh);

  // Rickshaw Spoke Wheels
  const wheelGeom = track(new THREE.TorusGeometry(0.38, 0.04, 8, 24));
  const wheelMat = track(new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6 }));
  const leftWheel = new THREE.Mesh(wheelGeom, wheelMat);
  leftWheel.position.set(-0.45, 0.38, 0.2);
  leftWheel.rotation.y = Math.PI / 2;
  rickshaw.add(leftWheel);

  const rightWheel = leftWheel.clone();
  rightWheel.position.x = 0.45;
  rickshaw.add(rightWheel);

  const frontWheel = leftWheel.clone();
  frontWheel.position.set(0, 0.38, -0.9);
  rickshaw.add(frontWheel);

  // 4. Traditional Tea Stall (Tong er Dokan) on Right
  const teaStall = new THREE.Group();
  teaStall.position.set(3.0, 0, -3.2);
  parent.add(teaStall);

  // Wooden counter
  const stallGeom = track(new THREE.BoxGeometry(1.4, 0.9, 0.7));
  const stallMat = track(new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 }));
  const stallMesh = new THREE.Mesh(stallGeom, stallMat);
  stallMesh.position.set(0, 0.45, 0);
  teaStall.add(stallMesh);

  // Blue / Orange tarpaulin roof
  const roofGeom = track(new THREE.ConeGeometry(1.2, 0.6, 4));
  const roofMat = track(new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.5 }));
  const roofMesh = new THREE.Mesh(roofGeom, roofMat);
  roofMesh.position.set(0, 1.6, 0);
  roofMesh.rotation.y = Math.PI / 4;
  teaStall.add(roofMesh);

  // Metal Tea Kettle (Ketli)
  const kettleGeom = track(new THREE.CylinderGeometry(0.12, 0.15, 0.28, 12));
  const kettleMat = track(new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.2 }));
  const kettle = new THREE.Mesh(kettleGeom, kettleMat);
  kettle.position.set(-0.25, 1.04, 0);
  teaStall.add(kettle);

  // 5. Bengali Signboard Billboard
  const signGeom = track(new THREE.PlaneGeometry(1.8, 0.7));
  const signCanvas = document.createElement('canvas');
  signCanvas.width = 512;
  signCanvas.height = 200;
  const sCtx = signCanvas.getContext('2d');
  if (sCtx) {
    sCtx.fillStyle = '#065f46';
    sCtx.fillRect(0, 0, 512, 200);
    sCtx.fillStyle = '#facc15';
    sCtx.font = 'bold 52px system-ui';
    sCtx.textAlign = 'center';
    sCtx.fillText('চায়ের টং ও নাস্তা', 256, 90);
    sCtx.font = '28px system-ui';
    sCtx.fillStyle = '#ffffff';
    sCtx.fillText('খাঁটি গরুর দুধের চা', 256, 145);
  }
  const signTex = new THREE.CanvasTexture(signCanvas);
  const signMat = track(new THREE.MeshBasicMaterial({ map: signTex }));
  const signMesh = new THREE.Mesh(signGeom, signMat);
  signMesh.position.set(3.0, 1.9, -3.2);
  parent.add(signMesh);

  // 6. Street Lamppost with warm amber light
  const postGeom = track(new THREE.CylinderGeometry(0.06, 0.08, 4.2, 8));
  const postMat = track(new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7 }));
  const postMesh = new THREE.Mesh(postGeom, postMat);
  postMesh.position.set(-3.8, 2.1, -1.8);
  parent.add(postMesh);

  const streetLight = new THREE.PointLight(0xfbbf24, 18, 8);
  streetLight.position.set(-3.8, 4.0, -1.5);
  parent.add(streetLight);
}

// ==========================================
// SCENARIO B: BANGLADESHI VILLAGE
// ==========================================
function buildVillage(
  parent: THREE.Group,
  track: <T extends THREE.BufferGeometry | THREE.Material>(res: T) => T
) {
  // 1. Lush Green Earth / Courtyard
  const groundGeom = track(new THREE.PlaneGeometry(16, 16));
  const groundMat = track(new THREE.MeshStandardMaterial({
    color: 0x15803d, // Lush Bangladeshi paddy green
    roughness: 0.9
  }));
  const groundMesh = new THREE.Mesh(groundGeom, groundMat);
  groundMesh.rotation.x = -Math.PI / 2;
  groundMesh.receiveShadow = true;
  parent.add(groundMesh);

  // Earthy courtyard circle in center
  const yardGeom = track(new THREE.CircleGeometry(3.5, 32));
  const yardMat = track(new THREE.MeshStandardMaterial({
    color: 0x854d0e, // Warm Bengal mud clay courtyard
    roughness: 0.95
  }));
  const yardMesh = new THREE.Mesh(yardGeom, yardMat);
  yardMesh.rotation.x = -Math.PI / 2;
  yardMesh.position.y = 0.01;
  parent.add(yardMesh);

  // 2. Rural Tin-roof Hut (Gramer Ghor) in background
  const hut = new THREE.Group();
  hut.position.set(0, 0, -4.2);
  parent.add(hut);

  // Wooden walls
  const wallGeom = track(new THREE.BoxGeometry(3.2, 1.6, 2.2));
  const wallMat = track(new THREE.MeshStandardMaterial({ color: 0xa16207, roughness: 0.85 }));
  const wallMesh = new THREE.Mesh(wallGeom, wallMat);
  wallMesh.position.y = 0.8;
  hut.add(wallMesh);

  // Corrugated Tin Roof (Pitched)
  const roofGeom = track(new THREE.ConeGeometry(2.6, 1.2, 4));
  const roofMat = track(new THREE.MeshStandardMaterial({
    color: 0x94a3b8, // Tin silver/grey
    metalness: 0.6,
    roughness: 0.4
  }));
  const roofMesh = new THREE.Mesh(roofGeom, roofMat);
  roofMesh.position.y = 2.1;
  roofMesh.rotation.y = Math.PI / 4;
  hut.add(roofMesh);

  // 3. Coconut Trees (Narikel Gach) on sides
  const makePalmTree = (x: number, z: number) => {
    const tree = new THREE.Group();
    tree.position.set(x, 0, z);

    // Trunk with slight bend
    const trunkGeom = track(new THREE.CylinderGeometry(0.12, 0.2, 4.2, 8));
    const trunkMat = track(new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 }));
    const trunk = new THREE.Mesh(trunkGeom, trunkMat);
    trunk.position.y = 2.1;
    trunk.rotation.z = (Math.random() - 0.5) * 0.15;
    tree.add(trunk);

    // Palm fronds crown
    for (let i = 0; i < 7; i++) {
      const angle = (i / 7) * Math.PI * 2;
      const frondGeom = track(new THREE.ConeGeometry(0.4, 2.0, 4));
      const frondMat = track(new THREE.MeshStandardMaterial({ color: 0x166534 }));
      const frond = new THREE.Mesh(frondGeom, frondMat);
      frond.position.set(Math.cos(angle) * 0.7, 4.2, Math.sin(angle) * 0.7);
      frond.rotation.x = Math.PI / 2 + 0.3;
      frond.rotation.y = angle;
      tree.add(frond);
    }
    parent.add(tree);
  };

  makePalmTree(-3.8, -2.5);
  makePalmTree(3.8, -2.8);

  // 4. Village Pond (Pukur) on right side
  const pondGeom = track(new THREE.CircleGeometry(2.0, 24));
  const pondMat = track(new THREE.MeshPhysicalMaterial({
    color: 0x0284c7,
    roughness: 0.1,
    transmission: 0.7,
    thickness: 0.5,
    reflectivity: 0.8
  }));
  const pond = new THREE.Mesh(pondGeom, pondMat);
  pond.rotation.x = -Math.PI / 2;
  pond.position.set(4.2, 0.02, 1.2);
  parent.add(pond);
}

// ==========================================
// SCENARIO C: UNIVERSITY CAMPUS
// ==========================================
function buildCampus(
  parent: THREE.Group,
  track: <T extends THREE.BufferGeometry | THREE.Material>(res: T) => T
) {
  // 1. Campus Paved Plaza & Red Brick Paths
  const plazaGeom = track(new THREE.PlaneGeometry(16, 16));
  const plazaMat = track(new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 }));
  const plazaMesh = new THREE.Mesh(plazaGeom, plazaMat);
  plazaMesh.rotation.x = -Math.PI / 2;
  plazaMesh.receiveShadow = true;
  parent.add(plazaMesh);

  // Red Brick Walkway (inspired by DU Curzon Hall)
  const walkGeom = track(new THREE.PlaneGeometry(4.0, 16));
  const walkMat = track(new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.75 }));
  const walkMesh = new THREE.Mesh(walkGeom, walkMat);
  walkMesh.rotation.x = -Math.PI / 2;
  walkMesh.position.y = 0.01;
  parent.add(walkMesh);

  // 2. Colonnade Red Brick Pillars (DU Architecture)
  for (let i = -3; i <= 3; i += 2) {
    const pillarGeom = track(new THREE.CylinderGeometry(0.2, 0.25, 4.0, 12));
    const pillarMat = track(new THREE.MeshStandardMaterial({
      color: 0xb91c1c, // Crimson colonial brick red
      roughness: 0.6
    }));
    const pillar = new THREE.Mesh(pillarGeom, pillarMat);
    pillar.position.set(i * 1.5, 2.0, -4.5);
    parent.add(pillar);
  }

  // Architrave header beam
  const beamGeom = track(new THREE.BoxGeometry(12, 0.4, 0.6));
  const beamMat = track(new THREE.MeshStandardMaterial({ color: 0xf1f5f9 }));
  const beamMesh = new THREE.Mesh(beamGeom, beamMat);
  beamMesh.position.set(0, 4.0, -4.5);
  parent.add(beamMesh);

  // 3. Concrete Campus Benches for student adda
  const makeBench = (x: number, z: number, rot: number) => {
    const bench = new THREE.Group();
    bench.position.set(x, 0, z);
    bench.rotation.y = rot;

    const slabGeom = track(new THREE.BoxGeometry(1.6, 0.12, 0.5));
    const slabMat = track(new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.5 }));
    const slab = new THREE.Mesh(slabGeom, slabMat);
    slab.position.y = 0.45;
    bench.add(slab);

    const legGeom = track(new THREE.BoxGeometry(0.15, 0.45, 0.45));
    const leg1 = new THREE.Mesh(legGeom, slabMat);
    leg1.position.set(-0.6, 0.22, 0);
    const leg2 = leg1.clone();
    leg2.position.x = 0.6;
    bench.add(leg1);
    bench.add(leg2);

    parent.add(bench);
  };

  makeBench(-3.2, -1.0, 0.4);
  makeBench(3.2, -1.0, -0.4);

  // 4. Shaheed Minar Monument Silhouette in distance
  const minarGroup = new THREE.Group();
  minarGroup.position.set(0, 0, -6.5);
  parent.add(minarGroup);

  // Central column with tilt
  const colGeom = track(new THREE.BoxGeometry(0.3, 3.8, 0.1));
  const colMat = track(new THREE.MeshBasicMaterial({ color: 0xf8fafc }));
  const centerCol = new THREE.Mesh(colGeom, colMat);
  centerCol.position.y = 1.9;
  minarGroup.add(centerCol);

  // Red circle background
  const sunGeom = track(new THREE.CircleGeometry(1.0, 32));
  const sunMat = track(new THREE.MeshBasicMaterial({ color: 0xef4444 }));
  const sunMesh = new THREE.Mesh(sunGeom, sunMat);
  sunMesh.position.set(0, 2.2, -0.2);
  minarGroup.add(sunMesh);
}

// ==========================================
// SCENARIO D: LOCAL BAZAR (KACHA BAZAR)
// ==========================================
function buildBazar(
  parent: THREE.Group,
  track: <T extends THREE.BufferGeometry | THREE.Material>(res: T) => T
) {
  // 1. Wet stone floor
  const floorGeom = track(new THREE.PlaneGeometry(16, 16));
  const floorMat = track(new THREE.MeshStandardMaterial({
    color: 0x1f2937,
    roughness: 0.4,
    metalness: 0.3
  }));
  const floorMesh = new THREE.Mesh(floorGeom, floorMat);
  floorMesh.rotation.x = -Math.PI / 2;
  floorMesh.receiveShadow = true;
  parent.add(floorMesh);

  // 2. Vegetable Stalls (Shobji Dokan)
  const makeStall = (x: number, z: number, canopyColor: number) => {
    const stall = new THREE.Group();
    stall.position.set(x, 0, z);

    // Wooden table
    const tableGeom = track(new THREE.BoxGeometry(2.0, 0.8, 1.1));
    const tableMat = track(new THREE.MeshStandardMaterial({ color: 0x713f12, roughness: 0.9 }));
    const table = new THREE.Mesh(tableGeom, tableMat);
    table.position.y = 0.4;
    stall.add(table);

    // Colorful canopy awning
    const canopyGeom = track(new THREE.BoxGeometry(2.2, 0.1, 1.3));
    const canopyMat = track(new THREE.MeshStandardMaterial({ color: canopyColor, roughness: 0.5 }));
    const canopy = new THREE.Mesh(canopyGeom, canopyMat);
    canopy.position.set(0, 1.8, 0);
    stall.add(canopy);

    // Crates of tomatoes and greens
    const crateGeom = track(new THREE.BoxGeometry(0.5, 0.25, 0.4));
    const redMat = track(new THREE.MeshStandardMaterial({ color: 0xef4444 })); // Tomato crate
    const crate1 = new THREE.Mesh(crateGeom, redMat);
    crate1.position.set(-0.5, 0.92, 0.1);
    stall.add(crate1);

    const greenMat = track(new THREE.MeshStandardMaterial({ color: 0x22c55e })); // Spinach / Greens
    const crate2 = new THREE.Mesh(crateGeom, greenMat);
    crate2.position.set(0.3, 0.92, -0.1);
    stall.add(crate2);

    parent.add(stall);
  };

  makeStall(-3.2, -2.5, 0xef4444); // Red stall
  makeStall(3.2, -2.5, 0x10b981);  // Green stall

  // 3. Bengali Bazar Signboard
  const signGeom = track(new THREE.PlaneGeometry(2.4, 0.7));
  const signCanvas = document.createElement('canvas');
  signCanvas.width = 512;
  signCanvas.height = 160;
  const ctx = signCanvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#b91c1c';
    ctx.fillRect(0, 0, 512, 160);
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 50px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('ভাই ভাই কাঁচাবাজার', 256, 75);
    ctx.font = '26px system-ui';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('তাজা শাকসবজি ও ফলমূলের পাইকারি আড়ত', 256, 125);
  }
  const signTex = new THREE.CanvasTexture(signCanvas);
  const signMat = track(new THREE.MeshBasicMaterial({ map: signTex }));
  const sign = new THREE.Mesh(signGeom, signMat);
  sign.position.set(0, 2.8, -4.5);
  parent.add(sign);
}

// ==========================================
// SCENARIO E: DHAKA ROOFTOP (SUNSET)
// ==========================================
function buildRooftop(
  parent: THREE.Group,
  track: <T extends THREE.BufferGeometry | THREE.Material>(res: T) => T
) {
  // 1. Terracotta Rooftop Floor Tiles
  const roofGeom = track(new THREE.PlaneGeometry(16, 16));
  const roofMat = track(new THREE.MeshStandardMaterial({
    color: 0x9a3412, // Rust terracotta red rooftop tiles
    roughness: 0.75
  }));
  const roofMesh = new THREE.Mesh(roofGeom, roofMat);
  roofMesh.rotation.x = -Math.PI / 2;
  roofMesh.receiveShadow = true;
  parent.add(roofMesh);

  // Perimeter Parapet Railing Wall
  const wallGeom = track(new THREE.BoxGeometry(16, 0.9, 0.3));
  const wallMat = track(new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.7 }));
  const backWall = new THREE.Mesh(wallGeom, wallMat);
  backWall.position.set(0, 0.45, -5.5);
  parent.add(backWall);

  // 2. Iconic Black Rooftop Water Tank (Gazi Tank)
  const tank = new THREE.Group();
  tank.position.set(-3.2, 0, -4.0);
  parent.add(tank);

  const tankBodyGeom = track(new THREE.CylinderGeometry(0.7, 0.7, 1.6, 20));
  const tankMat = track(new THREE.MeshStandardMaterial({
    color: 0x0f172a, // Black plastic tank
    roughness: 0.3,
    metalness: 0.2
  }));
  const tankBody = new THREE.Mesh(tankBodyGeom, tankMat);
  tankBody.position.y = 1.0;
  tank.add(tankBody);

  // Tank stand
  const standGeom = track(new THREE.BoxGeometry(1.6, 0.3, 1.6));
  const standMat = track(new THREE.MeshStandardMaterial({ color: 0x475569 }));
  const stand = new THREE.Mesh(standGeom, standMat);
  stand.position.y = 0.15;
  tank.add(stand);

  // 3. Clothesline with drying clothes
  const poleGeom = track(new THREE.CylinderGeometry(0.04, 0.04, 2.2, 8));
  const poleMat = track(new THREE.MeshStandardMaterial({ color: 0x475569 }));
  const p1 = new THREE.Mesh(poleGeom, poleMat);
  p1.position.set(1.5, 1.1, -4.2);
  const p2 = p1.clone();
  p2.position.set(4.5, 1.1, -4.2);
  parent.add(p1);
  parent.add(p2);

  // Hanging shirts / lungi
  const lungiGeom = track(new THREE.PlaneGeometry(0.8, 0.9));
  const lungiMat = track(new THREE.MeshStandardMaterial({
    color: 0x0284c7, // Traditional blue checkered lungi
    side: THREE.DoubleSide
  }));
  const lungi = new THREE.Mesh(lungiGeom, lungiMat);
  lungi.position.set(2.4, 1.4, -4.2);
  parent.add(lungi);

  const shirtMat = track(new THREE.MeshStandardMaterial({
    color: 0xf43f5e,
    side: THREE.DoubleSide
  }));
  const shirt = new THREE.Mesh(lungiGeom, shirtMat);
  shirt.position.set(3.6, 1.4, -4.2);
  parent.add(shirt);
}

// ==========================================
// SCENARIO F: EID FESTIVAL (EID MELA)
// ==========================================
function buildEidFestival(
  parent: THREE.Group,
  track: <T extends THREE.BufferGeometry | THREE.Material>(res: T) => T
) {
  // 1. Festive Stage Floor
  const stageGeom = track(new THREE.CylinderGeometry(5.0, 5.2, 0.3, 32));
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
  const ringGeom = track(new THREE.TorusGeometry(4.8, 0.05, 16, 64));
  ringGeom.rotateX(Math.PI / 2);
  const ringMat = track(new THREE.MeshBasicMaterial({ color: 0x10b981 })); // Islamic emerald green
  const ring = new THREE.Mesh(ringGeom, ringMat);
  ring.position.y = 0.02;
  parent.add(ring);

  // 2. Giant Glowing Golden Crescent Moon & Star (Eid Mubarak)
  const crescentGroup = new THREE.Group();
  crescentGroup.position.set(0, 3.2, -4.2);
  parent.add(crescentGroup);

  // Crescent Torus segment
  const moonGeom = track(new THREE.TorusGeometry(1.2, 0.16, 16, 32, Math.PI * 1.5));
  const goldMat = track(new THREE.MeshBasicMaterial({ color: 0xfacc15 }));
  const moon = new THREE.Mesh(moonGeom, goldMat);
  moon.rotation.z = Math.PI * 0.25;
  crescentGroup.add(moon);

  // Glowing Star
  const starGeom = track(new THREE.OctahedronGeometry(0.3, 0));
  const star = new THREE.Mesh(starGeom, goldMat);
  star.position.set(0.6, 0.3, 0);
  crescentGroup.add(star);

  // 3. Eid Festive Multi-Color Fairy Lights
  const lightSpheres: THREE.Mesh[] = [];
  const colors = [0xef4444, 0x10b981, 0x3b82f6, 0xfacc15, 0xec4899];

  for (let i = 0; i < 18; i++) {
    const angle = (i / 18) * Math.PI * 2;
    const x = Math.cos(angle) * 4.4;
    const z = Math.sin(angle) * 4.4;
    const y = 2.4 + Math.sin(i * 1.2) * 0.4;

    const bulbGeom = track(new THREE.SphereGeometry(0.08, 8, 8));
    const bulbMat = track(new THREE.MeshBasicMaterial({ color: colors[i % colors.length] }));
    const bulb = new THREE.Mesh(bulbGeom, bulbMat);
    bulb.position.set(x, y, z);
    parent.add(bulb);
    lightSpheres.push(bulb);
  }

  // Animation callback for pulsing lights
  return (delta: number) => {
    crescentGroup.rotation.y += delta * 0.5;
    ring.rotation.z += delta * 0.2;
  };
}
