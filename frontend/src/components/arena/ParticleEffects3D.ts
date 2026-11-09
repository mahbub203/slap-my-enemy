import * as THREE from 'three';

export interface Particle {
  mesh: THREE.Mesh | THREE.Sprite;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
  rotationSpeed?: number;
}

export class ParticleSystemManager {
  private scene: THREE.Scene;
  private particles: Particle[] = [];

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  // Tomato splat particles (red chunks and juicy droplets)
  public spawnTomatoSplat(position: THREE.Vector3) {
    const count = 35;
    const colors = [0xdc2626, 0xef4444, 0x991b1b, 0xf87171, 0x15803d]; // red with occasional green stem bit

    for (let i = 0; i < count; i++) {
      const size = 0.04 + Math.random() * 0.08;
      const geom = new THREE.SphereGeometry(size, 6, 6);
      const color = colors[Math.floor(Math.random() * colors.length)];
      const mat = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.3,
        metalness: 0.1
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.copy(position);

      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 4.5,
        Math.random() * 3.5 + 1.0,
        (Math.random() - 0.5) * 4.5 + 1.0
      );

      this.scene.add(mesh);
      this.particles.push({
        mesh,
        velocity: vel,
        life: 0,
        maxLife: 0.8 + Math.random() * 0.5,
        rotationSpeed: (Math.random() - 0.5) * 10
      });
    }
  }

  // Water splash particles (glistening blue droplets)
  public spawnWaterSplash(position: THREE.Vector3) {
    const count = 45;
    const colors = [0x38bdf8, 0x0284c7, 0x7dd3fc, 0xbae6fd];

    for (let i = 0; i < count; i++) {
      const size = 0.03 + Math.random() * 0.06;
      const geom = new THREE.SphereGeometry(size, 6, 6);
      const color = colors[Math.floor(Math.random() * colors.length)];
      const mat = new THREE.MeshPhysicalMaterial({
        color,
        roughness: 0.1,
        transmission: 0.8,
        thickness: 0.5,
        transparent: true,
        opacity: 0.85
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.copy(position);

      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 5.0,
        Math.random() * 4.0 + 1.2,
        (Math.random() - 0.5) * 5.0
      );

      this.scene.add(mesh);
      this.particles.push({
        mesh,
        velocity: vel,
        life: 0,
        maxLife: 0.9 + Math.random() * 0.4
      });
    }
  }

  // Impact stars and comic hit sparks
  public spawnHitSparks(position: THREE.Vector3, isPunch: boolean = false) {
    const count = isPunch ? 25 : 18;
    const colors = [0xfacc15, 0xf97316, 0xef4444, 0xffffff];

    for (let i = 0; i < count; i++) {
      const size = isPunch ? 0.06 + Math.random() * 0.07 : 0.04 + Math.random() * 0.05;
      const geom = new THREE.BoxGeometry(size, size, size);
      const color = colors[Math.floor(Math.random() * colors.length)];
      const mat = new THREE.MeshBasicMaterial({
        color
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.copy(position);

      const speed = isPunch ? 5.5 : 4.0;
      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * speed,
        (Math.random() - 0.2) * speed,
        (Math.random() - 0.5) * speed + 1.5
      );

      this.scene.add(mesh);
      this.particles.push({
        mesh,
        velocity: vel,
        life: 0,
        maxLife: 0.4 + Math.random() * 0.3,
        rotationSpeed: (Math.random() - 0.5) * 20
      });
    }
  }

  // Playful tickle sparkles
  public spawnTickleSparkles(position: THREE.Vector3) {
    const count = 15;
    const colors = [0xfde047, 0xf472b6, 0xa855f7, 0x34d399];

    for (let i = 0; i < count; i++) {
      const size = 0.04 + Math.random() * 0.04;
      const geom = new THREE.OctahedronGeometry(size, 0);
      const color = colors[Math.floor(Math.random() * colors.length)];
      const mat = new THREE.MeshBasicMaterial({ color });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.set(
        position.x + (Math.random() - 0.5) * 0.8,
        position.y + (Math.random() - 0.5) * 0.8,
        position.z + (Math.random() - 0.5) * 0.5
      );

      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 1.5,
        Math.random() * 2.0 + 0.8,
        (Math.random() - 0.5) * 1.5
      );

      this.scene.add(mesh);
      this.particles.push({
        mesh,
        velocity: vel,
        life: 0,
        maxLife: 0.7 + Math.random() * 0.4,
        rotationSpeed: (Math.random() - 0.5) * 12
      });
    }
  }

  public update(delta: number) {
    const gravity = -9.8;
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += delta;

      if (p.life >= p.maxLife) {
        this.scene.remove(p.mesh);
        p.mesh.geometry.dispose();
        if (Array.isArray(p.mesh.material)) {
          p.mesh.material.forEach((m) => m.dispose());
        } else {
          p.mesh.material.dispose();
        }
        this.particles.splice(i, 1);
        continue;
      }

      // Physics update
      p.velocity.y += gravity * delta;
      p.mesh.position.addScaledVector(p.velocity, delta);

      // Floor bounce / clamp
      if (p.mesh.position.y < 0) {
        p.mesh.position.y = 0;
        p.velocity.y *= -0.3;
        p.velocity.x *= 0.6;
        p.velocity.z *= 0.6;
      }

      // Rotation
      if (p.rotationSpeed) {
        p.mesh.rotation.x += p.rotationSpeed * delta;
        p.mesh.rotation.y += p.rotationSpeed * delta;
      }

      // Scale shrink towards end of life
      const progress = p.life / p.maxLife;
      const scale = Math.max(0.001, 1 - progress);
      p.mesh.scale.set(scale, scale, scale);
    }
  }

  public clearAll() {
    for (const p of this.particles) {
      this.scene.remove(p.mesh);
      p.mesh.geometry.dispose();
      if (Array.isArray(p.mesh.material)) {
        p.mesh.material.forEach((m) => m.dispose());
      } else {
        p.mesh.material.dispose();
      }
    }
    this.particles = [];
  }
}
