// ============================================================
//  SKELETON CREATURE — Realistic 3D Bone Snake with Legs
//  Touch/Mouse Follow | Procedural Animation | Three.js
// ============================================================

import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';

// ─── SCENE SETUP ────────────────────────────────────────────
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0f);
scene.fog = new THREE.FogExp2(0x0a0a0f, 0.018);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 500);
camera.position.set(0, 18, 40);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// ─── LIGHTING ───────────────────────────────────────────────
const ambientLight = new THREE.AmbientLight(0x112244, 0.6);
scene.add(ambientLight);

const moonLight = new THREE.DirectionalLight(0x8899ff, 1.2);
moonLight.position.set(20, 40, 20);
moonLight.castShadow = true;
moonLight.shadow.mapSize.set(2048, 2048);
moonLight.shadow.camera.far = 200;
scene.add(moonLight);

const rimLight = new THREE.DirectionalLight(0x4422aa, 0.8);
rimLight.position.set(-20, 10, -20);
scene.add(rimLight);

const glowLight = new THREE.PointLight(0x00ffcc, 2, 30);
glowLight.position.set(0, 5, 0);
scene.add(glowLight);

// ─── GROUND ─────────────────────────────────────────────────
const groundGeo = new THREE.PlaneGeometry(200, 200, 60, 60);
const groundMat = new THREE.MeshStandardMaterial({
  color: 0x080810,
  roughness: 0.95,
  metalness: 0.05,
  wireframe: false,
});
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// subtle grid
const gridHelper = new THREE.GridHelper(200, 80, 0x112233, 0x0a1122);
gridHelper.position.y = 0.01;
scene.add(gridHelper);

// ─── MATERIALS ──────────────────────────────────────────────
const boneMat = new THREE.MeshStandardMaterial({
  color: 0xe8e0d0,
  roughness: 0.35,
  metalness: 0.08,
  envMapIntensity: 0.5,
});

const jointMat = new THREE.MeshStandardMaterial({
  color: 0xd4c8b0,
  roughness: 0.3,
  metalness: 0.15,
});

const skullMat = new THREE.MeshStandardMaterial({
  color: 0xf0e8d8,
  roughness: 0.25,
  metalness: 0.1,
});

const eyeGlowMat = new THREE.MeshStandardMaterial({
  color: 0x00ffcc,
  emissive: 0x00ffcc,
  emissiveIntensity: 3,
  roughness: 0,
  metalness: 0,
});

// ─── GEOMETRY HELPERS ───────────────────────────────────────
function makeBone(length, radius) {
  const geo = new THREE.CylinderGeometry(radius * 0.6, radius * 0.6, length, 8);
  // taper ends
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    const t = Math.abs(y) / (length / 2);
    const s = 1 - t * 0.3;
    pos.setX(i, pos.getX(i) * s);
    pos.setZ(i, pos.getZ(i) * s);
  }
  geo.computeVertexNormals();
  return new THREE.Mesh(geo, boneMat);
}

function makeJoint(r) {
  const geo = new THREE.SphereGeometry(r, 10, 8);
  return new THREE.Mesh(geo, jointMat);
}

function makeVertebra(scale) {
  const group = new THREE.Group();
  // main body
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(scale * 1.6, scale * 0.9, scale * 1.1, 2, 2, 2),
    boneMat
  );
  group.add(body);
  // dorsal spine
  const spine = new THREE.Mesh(
    new THREE.ConeGeometry(scale * 0.15, scale * 1.0, 6),
    boneMat
  );
  spine.position.y = scale * 0.9;
  spine.castShadow = true;
  group.add(spine);
  // transverse processes (side protrusions)
  [-1, 1].forEach(side => {
    const proc = new THREE.Mesh(
      new THREE.CylinderGeometry(scale * 0.08, scale * 0.12, scale * 1.1, 6),
      boneMat
    );
    proc.rotation.z = Math.PI / 2;
    proc.position.set(side * scale * 1.1, scale * 0.05, 0);
    proc.castShadow = true;
    group.add(proc);
  });
  group.castShadow = true;
  return group;
}

// ─── SKULL ──────────────────────────────────────────────────
function makeSkull(scale) {
  const g = new THREE.Group();

  // cranium
  const cranium = new THREE.Mesh(
    new THREE.SphereGeometry(scale * 1.4, 12, 10),
    skullMat
  );
  cranium.scale.set(1, 0.85, 1.1);
  cranium.castShadow = true;
  g.add(cranium);

  // snout / jaw base
  const snout = new THREE.Mesh(
    new THREE.BoxGeometry(scale * 0.9, scale * 0.5, scale * 1.4),
    skullMat
  );
  snout.position.set(0, -scale * 0.55, scale * 0.8);
  snout.castShadow = true;
  g.add(snout);

  // lower jaw
  const jaw = new THREE.Mesh(
    new THREE.BoxGeometry(scale * 0.85, scale * 0.25, scale * 1.2),
    skullMat
  );
  jaw.position.set(0, -scale * 0.9, scale * 0.75);
  jaw.castShadow = true;
  g.add(jaw);

  // teeth (upper)
  for (let i = -2; i <= 2; i++) {
    const tooth = new THREE.Mesh(
      new THREE.ConeGeometry(scale * 0.1, scale * 0.3, 5),
      skullMat
    );
    tooth.position.set(i * scale * 0.2, -scale * 0.75, scale * 1.35);
    tooth.rotation.x = Math.PI;
    g.add(tooth);
  }

  // eye sockets
  [-1, 1].forEach(side => {
    const socket = new THREE.Mesh(
      new THREE.SphereGeometry(scale * 0.38, 10, 8),
      new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 1 })
    );
    socket.position.set(side * scale * 0.55, scale * 0.1, scale * 1.0);
    socket.scale.z = 0.5;
    g.add(socket);

    const eye = new THREE.Mesh(
      new THREE.SphereGeometry(scale * 0.22, 8, 8),
      eyeGlowMat
    );
    eye.position.set(side * scale * 0.55, scale * 0.1, scale * 1.15);
    g.add(eye);

    // eye point light
    const eyeLight = new THREE.PointLight(0x00ffcc, 1.5, 8);
    eyeLight.position.copy(eye.position);
    g.add(eyeLight);
  });

  // nasal holes
  [-1, 1].forEach(side => {
    const nasal = new THREE.Mesh(
      new THREE.SphereGeometry(scale * 0.12, 6, 6),
      new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 1 })
    );
    nasal.position.set(side * scale * 0.18, -scale * 0.25, scale * 1.35);
    nasal.scale.z = 0.5;
    g.add(nasal);
  });

  // cheekbones
  [-1, 1].forEach(side => {
    const cheek = new THREE.Mesh(
      new THREE.SphereGeometry(scale * 0.28, 8, 6),
      skullMat
    );
    cheek.scale.set(0.6, 0.5, 1);
    cheek.position.set(side * scale * 1.1, -scale * 0.1, scale * 0.5);
    g.add(cheek);
  });

  return g;
}

// ─── LEG SEGMENT ────────────────────────────────────────────
function makeLeg(scale) {
  const g = new THREE.Group();

  // upper leg (femur)
  const upper = new THREE.Group();
  const femur = makeBone(scale * 2.2, scale * 0.22);
  femur.position.y = -scale * 1.1;
  femur.castShadow = true;
  upper.add(femur);
  upper.add(makeJoint(scale * 0.28));

  // lower leg (tibia)
  const lower = new THREE.Group();
  const tibia = makeBone(scale * 1.8, scale * 0.16);
  tibia.position.y = -scale * 0.9;
  tibia.castShadow = true;
  lower.add(tibia);
  const knee = makeJoint(scale * 0.22);
  lower.add(knee);

  // foot
  const foot = new THREE.Group();
  const footBone = new THREE.Mesh(
    new THREE.BoxGeometry(scale * 0.18, scale * 0.12, scale * 0.65),
    boneMat
  );
  footBone.position.set(0, 0, scale * 0.2);
  foot.add(footBone);
  // toes
  for (let t = -1; t <= 1; t++) {
    const toe = new THREE.Mesh(
      new THREE.ConeGeometry(scale * 0.07, scale * 0.4, 5),
      boneMat
    );
    toe.rotation.x = Math.PI / 2;
    toe.position.set(t * scale * 0.12, -scale * 0.04, scale * 0.55);
    foot.add(toe);
  }

  lower.add(foot);
  lower.position.y = -scale * 2.2;
  foot.position.y = -scale * 1.8;

  upper.add(lower);
  g.add(upper);

  g.upper = upper;
  g.lower = lower;
  g.foot = foot;
  g.knee = knee;

  return g;
}

// ─── SKELETON CREATURE ──────────────────────────────────────
const NUM_SEGMENTS = 22;
const SEGMENT_SPACING = 2.2;
const LEG_PAIRS = 8; // pairs of legs along the body

class SkeletonCreature {
  constructor() {
    this.root = new THREE.Group();
    scene.add(this.root);

    this.segments = [];       // vertebra meshes
    this.positions = [];      // world positions of each segment
    this.rotations = [];      // world Y-rotations
    this.segmentPitch = [];   // up/down tilt per segment
    this.velocity = new THREE.Vector3();

    this.target = new THREE.Vector3(0, 0, 0);
    this.headPos = new THREE.Vector3(0, 3, 0);
    this.headDir = new THREE.Vector3(0, 0, 1);
    this.speed = 0;
    this.time = 0;

    this.legs = [];           // [{group, side, segIdx, phase, lastStep, currentPos, targetPos}]

    this._buildBody();
    this._buildLegs();
  }

  _buildBody() {
    // Skull
    this.skull = makeSkull(1.4);
    this.skull.position.set(0, 3, 0);
    scene.add(this.skull);

    // Neck connector
    this.neckBone = makeBone(1.8, 0.2);
    scene.add(this.neckBone);

    // Vertebrae
    for (let i = 0; i < NUM_SEGMENTS; i++) {
      const t = i / NUM_SEGMENTS;
      const scale = 1.0 - t * 0.45; // tapers toward tail
      const v = makeVertebra(scale);
      v.castShadow = true;
      v.receiveShadow = true;
      scene.add(v);

      // joint spheres between vertebrae
      const jt = makeJoint(scale * 0.32);
      scene.add(jt);

      const z = -(i + 1) * SEGMENT_SPACING;
      this.positions.push(new THREE.Vector3(0, 3, z));
      this.rotations.push(0);
      this.segmentPitch.push(0);

      this.segments.push({ mesh: v, joint: jt, scale });
    }

    // Tail tip
    this.tailTip = new THREE.Mesh(
      new THREE.ConeGeometry(0.12, 1.4, 6),
      boneMat
    );
    scene.add(this.tailTip);

    // Initialize head position
    this.headPos.set(0, 3, 0);
    for (let i = 0; i < NUM_SEGMENTS; i++) {
      this.positions[i].set(0, 3, -(i + 1) * SEGMENT_SPACING);
    }
  }

  _buildLegs() {
    // Place leg pairs at specific vertebrae
    const legSegments = [];
    const spacing = Math.floor(NUM_SEGMENTS / (LEG_PAIRS + 1));
    for (let i = 0; i < LEG_PAIRS; i++) {
      legSegments.push(Math.floor(spacing * (i + 0.7)));
    }

    legSegments.forEach((segIdx, pairI) => {
      [-1, 1].forEach((side, si) => {
        const legGroup = makeLeg(0.72 - segIdx * 0.015);
        legGroup.castShadow = true;
        scene.add(legGroup);

        const phase = (pairI * 0.37 + si * 0.5) % 1.0;
        const startPos = this.positions[segIdx].clone();
        startPos.x += side * 3;
        startPos.y = 0;

        this.legs.push({
          group: legGroup,
          side,
          segIdx,
          phase,
          lastStepTime: -phase * 0.8,
          currentPos: startPos.clone(),
          targetPos: startPos.clone(),
          planted: startPos.clone(),
          lifting: false,
          liftT: 0,
        });
      });
    });
  }

  setTarget(x, z) {
    this.target.set(x, 0, z);
  }

  update(dt) {
    this.time += dt;

    // ── Head follows target ──────────────────────────────────
    const toTarget = new THREE.Vector3(
      this.target.x - this.headPos.x,
      0,
      this.target.z - this.headPos.z
    );
    const dist = toTarget.length();

    const maxSpeed = 12;
    const accel = 14;

    if (dist > 1.5) {
      toTarget.normalize();
      const desiredVel = toTarget.multiplyScalar(Math.min(dist * 2.5, maxSpeed));
      this.velocity.lerp(desiredVel, accel * dt);
    } else {
      this.velocity.lerp(new THREE.Vector3(), 8 * dt);
    }

    this.speed = this.velocity.length();

    // Move head
    this.headPos.x += this.velocity.x * dt;
    this.headPos.z += this.velocity.z * dt;

    // Bobbing
    const bobAmt = Math.min(this.speed / maxSpeed, 1);
    this.headPos.y = 3.2 + Math.sin(this.time * 8 * bobAmt) * 0.25 * bobAmt;

    // Head direction
    if (this.speed > 0.5) {
      const newDir = this.velocity.clone().normalize();
      this.headDir.lerp(newDir, 8 * dt);
      this.headDir.normalize();
    }

    // Orient skull
    const headAngle = Math.atan2(this.headDir.x, this.headDir.z);
    this.skull.position.copy(this.headPos);
    this.skull.rotation.y = headAngle;

    // Head pitch based on speed
    const pitchTarget = -this.speed * 0.03;
    this.skull.rotation.x += (pitchTarget - this.skull.rotation.x) * 6 * dt;

    // ── Spine chain (follow-the-leader) ─────────────────────
    let prevPos = this.headPos.clone();
    let prevAngle = headAngle;

    for (let i = 0; i < NUM_SEGMENTS; i++) {
      const seg = this.segments[i];
      const target = this.positions[i];
      const scale = seg.scale;

      // Pull toward previous with fixed distance
      const diff = new THREE.Vector3().subVectors(prevPos, target);
      const d = diff.length();
      if (d > SEGMENT_SPACING) {
        diff.normalize().multiplyScalar(d - SEGMENT_SPACING);
        target.add(diff);
      }

      // Vertical: sine wave undulation
      const waveAmt = Math.min(this.speed / maxSpeed, 1);
      const waveOffset = i * 0.38;
      target.y = 3.0
        - i * 0.03  // gradual droop
        + Math.sin(this.time * 7 * waveAmt + waveOffset) * 0.18 * waveAmt
        + Math.sin(this.time * 3.5 + i * 0.2) * 0.08;

      // Compute angle from prev to this
      const dx = prevPos.x - target.x;
      const dz = prevPos.z - target.z;
      let angle = Math.atan2(dx, dz);

      // Smooth rotation
      let dAngle = angle - this.rotations[i];
      while (dAngle > Math.PI) dAngle -= Math.PI * 2;
      while (dAngle < -Math.PI) dAngle += Math.PI * 2;
      this.rotations[i] += dAngle * Math.min(18 * dt, 1);

      // Place mesh
      seg.mesh.position.copy(target);
      seg.mesh.rotation.y = this.rotations[i];

      // Lateral undulation
      const lateralAmt = Math.min(this.speed / maxSpeed, 1);
      seg.mesh.rotation.z = Math.sin(this.time * 7 * lateralAmt + i * 0.4) * 0.06 * lateralAmt;

      // Joint between this and next
      if (i < NUM_SEGMENTS - 1) {
        const nextTarget = this.positions[i + 1];
        seg.joint.position.lerpVectors(target, nextTarget, 0.5);
        seg.joint.position.y = (target.y + nextTarget.y) / 2;
      }

      prevPos = target.clone();
      prevAngle = angle;
    }

    // Neck bone between skull and first vertebra
    const neckMid = new THREE.Vector3().lerpVectors(this.headPos, this.positions[0], 0.5);
    this.neckBone.position.copy(neckMid);
    const neckDiff = new THREE.Vector3().subVectors(this.positions[0], this.headPos);
    this.neckBone.rotation.y = Math.atan2(neckDiff.x, neckDiff.z);
    this.neckBone.rotation.x = Math.atan2(neckDiff.y, Math.sqrt(neckDiff.x ** 2 + neckDiff.z ** 2));

    // Tail tip
    const lastPos = this.positions[NUM_SEGMENTS - 1];
    const secondLastPos = this.positions[NUM_SEGMENTS - 2];
    this.tailTip.position.copy(lastPos);
    const tailDir = new THREE.Vector3().subVectors(lastPos, secondLastPos).normalize();
    this.tailTip.rotation.y = Math.atan2(tailDir.x, tailDir.z);
    this.tailTip.rotation.x = Math.atan2(tailDir.y, Math.sqrt(tailDir.x ** 2 + tailDir.z ** 2)) + Math.PI / 2;

    // ── Leg Animation ────────────────────────────────────────
    this._updateLegs(dt);

    // Glow follows head
    glowLight.position.set(this.headPos.x, this.headPos.y + 2, this.headPos.z);
  }

  _updateLegs(dt) {
    const stepDist = 3.2;
    const stepSpeed = 0.18;
    const liftHeight = 2.2;
    const speedFactor = Math.min(this.speed / 6, 1.5);

    this.legs.forEach((leg, li) => {
      const segPos = this.positions[leg.segIdx];
      const segAngle = this.rotations[leg.segIdx];

      // Body-relative hip position
      const sideOffset = leg.side * 2.4;
      const hip = new THREE.Vector3(
        segPos.x + Math.cos(segAngle) * sideOffset,
        segPos.y,
        segPos.z + Math.sin(segAngle) * sideOffset
      );
      // Rotate hip perpendicular to spine
      const perpAngle = segAngle + Math.PI / 2;
      hip.x = segPos.x + Math.cos(perpAngle) * sideOffset;
      hip.z = segPos.z + Math.sin(perpAngle) * sideOffset;

      // Ideal foot position (in front of hip based on movement)
      const strideLen = Math.min(this.speed * 0.35, 1.8);
      const idealFoot = new THREE.Vector3(
        hip.x + this.headDir.x * strideLen * (li % 2 === 0 ? 1 : -0.3),
        0,
        hip.z + this.headDir.z * strideLen * (li % 2 === 0 ? 1 : -0.3)
      );

      // Decide if we need to step
      const distFromPlanted = idealFoot.distanceTo(leg.planted);
      const shouldStep = distFromPlanted > stepDist * (0.6 + speedFactor * 0.5) && !leg.lifting;

      if (shouldStep) {
        leg.lifting = true;
        leg.liftT = 0;
        leg.targetPos.copy(idealFoot);
      }

      // Animate step
      if (leg.lifting) {
        leg.liftT += dt * (3.5 + speedFactor * 3.5);
        const t = Math.min(leg.liftT, 1);

        // Smooth step arc
        leg.currentPos.lerpVectors(leg.planted, leg.targetPos, t);
        leg.currentPos.y = Math.sin(t * Math.PI) * liftHeight;

        if (t >= 1) {
          leg.lifting = false;
          leg.planted.copy(leg.targetPos);
          leg.currentPos.copy(leg.targetPos);
          leg.currentPos.y = 0;
        }
      } else {
        leg.currentPos.copy(leg.planted);
        leg.currentPos.y = 0;
      }

      // ── IK: Position leg group ───────────────────────────
      const legGroup = leg.group;
      legGroup.position.copy(hip);
      legGroup.position.y = segPos.y;

      // Orient hip toward foot
      const toFoot = new THREE.Vector3().subVectors(leg.currentPos, hip);
      toFoot.y = 0;
      legGroup.rotation.y = Math.atan2(toFoot.x, toFoot.z) + Math.PI;

      // IK: two-bone (upper + lower leg)
      const upperLen = 2.2 * 0.72;
      const lowerLen = 1.8 * 0.72;
      const footTarget = new THREE.Vector3().subVectors(leg.currentPos, hip);
      const footDist = Math.min(footTarget.length(), upperLen + lowerLen - 0.01);
      footTarget.y = leg.currentPos.y - hip.y;

      // Solve IK
      const a = upperLen;
      const b = lowerLen;
      const c = Math.sqrt(footDist * footDist + footTarget.y * footTarget.y);

      let upperAngle = 0;
      let kneeAngle = 0;

      if (c > 0.01) {
        const cosA = Math.max(-1, Math.min(1, (a * a + c * c - b * b) / (2 * a * c)));
        const cosB = Math.max(-1, Math.min(1, (a * a + b * b - c * c) / (2 * a * b)));
        const angleA = Math.acos(cosA);
        const angleB = Math.acos(cosB);
        const baseAngle = Math.atan2(-footTarget.y, footDist);
        upperAngle = -(baseAngle + angleA);
        kneeAngle = Math.PI - angleB;
      }

      leg.group.upper.rotation.x = upperAngle;
      leg.group.lower.rotation.x = kneeAngle;

      // Foot always flat on ground
      if (leg.group.foot) {
        leg.group.foot.rotation.x = -(upperAngle + kneeAngle);
      }
    });
  }
}

// ─── PARTICLES (bone dust / ambient) ─────────────────────────
const particleCount = 400;
const particleGeo = new THREE.BufferGeometry();
const pPositions = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount; i++) {
  pPositions[i * 3] = (Math.random() - 0.5) * 80;
  pPositions[i * 3 + 1] = Math.random() * 15;
  pPositions[i * 3 + 2] = (Math.random() - 0.5) * 80;
}
particleGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
const particleMat = new THREE.PointsMaterial({
  color: 0x334466,
  size: 0.12,
  transparent: true,
  opacity: 0.6,
});
const particles = new THREE.Points(particleGeo, particleMat);
scene.add(particles);

// ─── RAYCASTING FOR TOUCH / MOUSE ──────────────────────────
const raycaster = new THREE.Raycaster();
const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const mouse = new THREE.Vector2();
let targetWorld = new THREE.Vector3(0, 0, 0);
let hasTarget = false;

function updateTarget(clientX, clientY) {
  mouse.x = (clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const hit = new THREE.Vector3();
  raycaster.ray.intersectPlane(groundPlane, hit);
  if (hit) {
    targetWorld.copy(hit);
    hasTarget = true;
  }
}

window.addEventListener('mousemove', e => updateTarget(e.clientX, e.clientY));
window.addEventListener('touchmove', e => {
  e.preventDefault();
  updateTarget(e.touches[0].clientX, e.touches[0].clientY);
}, { passive: false });
window.addEventListener('touchstart', e => {
  updateTarget(e.touches[0].clientX, e.touches[0].clientY);
}, { passive: false });
window.addEventListener('click', e => updateTarget(e.clientX, e.clientY));

// ─── TARGET MARKER ──────────────────────────────────────────
const markerGeo = new THREE.RingGeometry(0.4, 0.65, 32);
const markerMat = new THREE.MeshBasicMaterial({
  color: 0x00ffcc,
  transparent: true,
  opacity: 0.5,
  side: THREE.DoubleSide,
});
const marker = new THREE.Mesh(markerGeo, markerMat);
marker.rotation.x = -Math.PI / 2;
marker.position.y = 0.05;
scene.add(marker);

// ─── CREATURE INSTANCE ──────────────────────────────────────
const creature = new SkeletonCreature();

// ─── RESIZE ─────────────────────────────────────────────────
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ─── CAMERA ORBIT ────────────────────────────────────────────
let camAngle = 0;
let camRadius = 42;
let camHeight = 20;
const camTarget = new THREE.Vector3();

// ─── RENDER LOOP ────────────────────────────────────────────
let lastTime = performance.now();

function animate() {
  requestAnimationFrame(animate);
  const now = performance.now();
  const dt = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;

  // Update target
  if (hasTarget) {
    creature.setTarget(targetWorld.x, targetWorld.z);
    marker.position.set(targetWorld.x, 0.05, targetWorld.z);
    marker.material.opacity = 0.45 + Math.sin(now * 0.005) * 0.25;
    marker.rotation.z += dt * 1.2;
  }

  creature.update(dt);

  // Camera smoothly follows head
  const headPos = creature.headPos;
  camTarget.lerp(headPos, 2.5 * dt);

  // Gentle orbit
  camAngle += dt * 0.05;
  camera.position.x = camTarget.x + Math.sin(camAngle) * camRadius;
  camera.position.z = camTarget.z + Math.cos(camAngle) * camRadius;
  camera.position.y = camTarget.y + camHeight;
  camera.lookAt(camTarget.x, camTarget.y + 2, camTarget.z);

  // Drift particles
  const pPos = particleGeo.attributes.position;
  for (let i = 0; i < particleCount; i++) {
    pPos.setY(i, pPos.getY(i) + Math.sin(now * 0.001 + i) * 0.004);
    if (pPos.getY(i) > 15) pPos.setY(i, 0.1);
  }
  pPos.needsUpdate = true;

  renderer.render(scene, camera);
}

animate();
