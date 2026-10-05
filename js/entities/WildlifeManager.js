// Entities: Wildlife & Hunting System for WARWICK: Castle Builder
// Spawns deer, rabbits, and night predators (wolves/boars) using Three.js primitives
(function(window) {
  'use strict';

  class WildlifeManager {
    constructor(scene) {
      this.scene = scene;
      this.wildlife = []; // Peaceful huntable animals (deer, rabbits)
      this.predators = []; // Night attacking beasts (wolves, boars)
      this.corpses = [];
    }

    spawnCorpse(mesh, type = 'wildlife') {
      if (!mesh) return;

      // Drop gently on its side
      mesh.rotation.z = (Math.random() > 0.5 ? 1 : -1) * (Math.PI / 2);
      mesh.rotation.x = (Math.random() - 0.5) * 0.3;
      const ty = window.WarwickTerrain ? window.WarwickTerrain.getTerrainHeight(mesh.position.x, mesh.position.z) : 0;
      mesh.position.y = Math.max(0.04, ty + (type === 'rabbit' ? 0.08 : 0.18));

      // Clone materials so fading doesn't affect living creatures
      mesh.traverse(child => {
        if (child.isMesh && child.material) {
          child.material = child.material.clone();
        }
      });

      this.corpses.push({
        mesh,
        decayTimer: 6.0,
        type
      });
    }

    // 1. Procedural Deer Model
    createDeerMesh() {
      const deerGroup = new THREE.Group();

      // Body (slender brown cylinder)
      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.32, 0.38, 1.2, 10),
        new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.8 })
      );
      body.rotation.z = Math.PI / 2;
      body.position.y = 0.85;
      body.castShadow = true;
      deerGroup.add(body);

      // Neck & Head
      const neck = new THREE.Mesh(
        new THREE.CylinderGeometry(0.14, 0.20, 0.7, 8),
        new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.8 })
      );
      neck.rotation.z = -0.55;
      neck.position.set(0.65, 1.2, 0);
      deerGroup.add(neck);

      const head = new THREE.Mesh(
        new THREE.ConeGeometry(0.18, 0.45, 8),
        new THREE.MeshStandardMaterial({ color: 0x7c2d12, roughness: 0.8 })
      );
      head.rotation.z = -Math.PI / 2;
      head.position.set(0.95, 1.45, 0);
      deerGroup.add(head);

      // Branched Antlers
      const antlerMat = new THREE.MeshStandardMaterial({ color: 0xd6d3d1, roughness: 0.6 });
      [-0.12, 0.12].forEach(az => {
        const mainBeam = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 0.5, 6), antlerMat);
        mainBeam.position.set(0.85, 1.7, az);
        mainBeam.rotation.x = az > 0 ? 0.3 : -0.3;
        mainBeam.rotation.z = -0.3;
        deerGroup.add(mainBeam);

        const tine = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.02, 0.25, 6), antlerMat);
        tine.position.set(0.92, 1.78, az * 1.3);
        tine.rotation.z = 0.4;
        deerGroup.add(tine);
      });

      // 4 slender legs
      const legMat = new THREE.MeshStandardMaterial({ color: 0x7c2d12, roughness: 0.9 });
      [
        [-0.4, -0.15], [-0.4, 0.15],
        [0.4, -0.15], [0.4, 0.15]
      ].forEach(([lx, lz]) => {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.8, 6), legMat);
        leg.position.set(lx, 0.4, lz);
        leg.castShadow = true;
        deerGroup.add(leg);
      });

      return deerGroup;
    }

    // 2. Procedural Rabbit Model
    createRabbitMesh() {
      const rabbitGroup = new THREE.Group();

      // Rounded body
      const body = new THREE.Mesh(
        new THREE.SphereGeometry(0.24, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0xe7e5e4, roughness: 0.85 })
      );
      body.scale.set(1.2, 0.9, 0.9);
      body.position.y = 0.22;
      body.castShadow = true;
      rabbitGroup.add(body);

      // Head
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.14, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0xe7e5e4, roughness: 0.85 })
      );
      head.position.set(0.22, 0.32, 0);
      rabbitGroup.add(head);

      // Long Ears
      [-0.06, 0.06].forEach(ez => {
        const ear = new THREE.Mesh(
          new THREE.CylinderGeometry(0.02, 0.04, 0.28, 6),
          new THREE.MeshStandardMaterial({ color: 0xf5d0fe, roughness: 0.7 })
        );
        ear.rotation.z = -0.3;
        ear.position.set(0.20, 0.50, ez);
        rabbitGroup.add(ear);
      });

      // Fluffy Tail
      const tail = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 6, 6),
        new THREE.MeshStandardMaterial({ color: 0xffffff })
      );
      tail.position.set(-0.30, 0.25, 0);
      rabbitGroup.add(tail);

      return rabbitGroup;
    }

    // 3. Procedural Night Predator (Wolf / Wild Boar)
    createWolfMesh() {
      const wolfGroup = new THREE.Group();

      // Muscular grey/charcoal body
      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.42, 1.2, 10),
        new THREE.MeshStandardMaterial({ color: 0x3f3f46, roughness: 0.85 })
      );
      body.rotation.z = Math.PI / 2;
      body.position.y = 0.65;
      body.castShadow = true;
      wolfGroup.add(body);

      // Head with glowing red predatory eyes
      const head = new THREE.Mesh(
        new THREE.ConeGeometry(0.24, 0.55, 8),
        new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.8 })
      );
      head.rotation.z = -Math.PI / 2;
      head.position.set(0.85, 0.95, 0);
      wolfGroup.add(head);

      // Glowing night eyes
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
      [-0.08, 0.08].forEach(ez => {
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 6), eyeMat);
        eye.position.set(0.88, 1.05, ez);
        wolfGroup.add(eye);
      });

      // Pointy ears
      [-0.12, 0.12].forEach(ez => {
        const ear = new THREE.Mesh(
          new THREE.ConeGeometry(0.06, 0.18, 4),
          new THREE.MeshStandardMaterial({ color: 0x18181b })
        );
        ear.position.set(0.68, 1.25, ez);
        wolfGroup.add(ear);
      });

      // 4 legs
      const legMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.9 });
      [
        [-0.4, -0.2], [-0.4, 0.2],
        [0.4, -0.2], [0.4, 0.2]
      ].forEach(([lx, lz]) => {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.06, 0.65, 6), legMat);
        leg.position.set(lx, 0.32, lz);
        leg.castShadow = true;
        wolfGroup.add(leg);
      });

      return wolfGroup;
    }

    // Populate Initial Wildlife further afield across expanded 120x96 world
    initWildlife() {
      // 4 Deer in northern meadows, eastern ridges, and western forest fringes
      const deerCoords = [
        { x: -18, z: -28 },
        { x: 14, z: -28 },
        { x: 34, z: -6 },
        { x: -34, z: -6 }
      ];
      deerCoords.forEach(c => {
        const mesh = this.createDeerMesh();
        const y = window.WarwickTerrain ? window.WarwickTerrain.getTerrainHeight(c.x, c.z) : 2.4;
        mesh.position.set(c.x, y, c.z);
        this.scene.add(mesh);
        this.wildlife.push({
          type: 'deer',
          mesh,
          health: 50,
          wanderAngle: Math.random() * Math.PI * 2,
          wanderClock: 0,
          speed: 1.2
        });
      });

      // 6 Rabbits hopping near woodland perimeter and outer fields
      const rabbitCoords = [
        { x: -26, z: -14 },
        { x: -32, z: 6 },
        { x: 28, z: 8 },
        { x: 32, z: -18 },
        { x: -10, z: -32 },
        { x: 18, z: -25 }
      ];
      rabbitCoords.forEach(c => {
        const mesh = this.createRabbitMesh();
        const y = window.WarwickTerrain ? window.WarwickTerrain.getTerrainHeight(c.x, c.z) : 2.4;
        mesh.position.set(c.x, y, c.z);
        this.scene.add(mesh);
        this.wildlife.push({
          type: 'rabbit',
          mesh,
          health: 20,
          hopClock: Math.random() * 2,
          wanderAngle: Math.random() * Math.PI * 2,
          speed: 1.8
        });
      });
    }

    // Spawn a Night Predator (Wolf)
    spawnNightWolf(x, z) {
      const mesh = this.createWolfMesh();
      const y = window.WarwickTerrain ? window.WarwickTerrain.getTerrainHeight(x, z) : 2.4;
      mesh.position.set(x, y, z);
      this.scene.add(mesh);

      const wolf = {
        type: 'wolf',
        mesh,
        health: 60,
        attackClock: 0,
        speed: 2.8
      };
      this.predators.push(wolf);
      return wolf;
    }

    update(dt, playerPos, showFloatingTextCallback) {
      // 1. Peaceful Wildlife AI (Grazing, wandering, hopping away from player)
      for (let i = this.wildlife.length - 1; i >= 0; i--) {
        const w = this.wildlife[i];
        const distToPlayer = w.mesh.position.distanceTo(playerPos);

        // Flee if player runs close
        if (distToPlayer < 4.0) {
          const fleeX = w.mesh.position.x - playerPos.x;
          const fleeZ = w.mesh.position.z - playerPos.z;
          const fDist = Math.hypot(fleeX, fleeZ) || 1;
          w.mesh.position.x += (fleeX / fDist) * w.speed * 2.2 * dt;
          w.mesh.position.z += (fleeZ / fDist) * w.speed * 2.2 * dt;
          if (window.collisionSystem) {
            window.collisionSystem.resolve(w.mesh.position, 0.35);
          }
          w.mesh.rotation.y = Math.atan2(fleeX, fleeZ);
        } else {
          // Leisurely wander
          w.wanderClock = (w.wanderClock || 0) + dt;
          if (w.wanderClock > 3.0) {
            w.wanderClock = 0;
            w.wanderAngle += (Math.random() - 0.5) * 1.5;
          }
          if (w.type === 'rabbit') {
            w.hopClock = (w.hopClock || 0) + dt * 6;
            w.mesh.position.y = (window.WarwickTerrain ? window.WarwickTerrain.getTerrainHeight(w.mesh.position.x, w.mesh.position.z) : 2.4) + Math.abs(Math.sin(w.hopClock)) * 0.15;
          }
          w.mesh.position.x += Math.sin(w.wanderAngle) * w.speed * 0.4 * dt;
          w.mesh.position.z += Math.cos(w.wanderAngle) * w.speed * 0.4 * dt;
          if (window.collisionSystem) {
            window.collisionSystem.resolve(w.mesh.position, 0.35);
          }
          w.mesh.rotation.y = w.wanderAngle;
        }

        // Clamp height
        if (w.type !== 'rabbit') {
          w.mesh.position.y = window.WarwickTerrain ? window.WarwickTerrain.getTerrainHeight(w.mesh.position.x, w.mesh.position.z) : 2.4;
        }

        // Check if killed by player or soldiers
        if (w.health <= 0) {
          this.spawnCorpse(w.mesh, w.type);
          this.wildlife.splice(i, 1);
          const meatReward = w.type === 'deer' ? 8 : 3;
          window.state.grain += meatReward; // Fresh game rations
          window.state.morale = Math.min(100, window.state.morale + 5);
          if (window.audio) window.audio.coin();

          // Respawn wildlife after 40 seconds further afield
          setTimeout(() => {
            const rx = (Math.random() > 0.5 ? 1 : -1) * (20 + Math.random() * 18);
            const rz = (Math.random() > 0.5 ? -1 : 1) * (14 + Math.random() * 18);
            const nMesh = w.type === 'deer' ? this.createDeerMesh() : this.createRabbitMesh();
            nMesh.position.set(rx, window.WarwickTerrain ? window.WarwickTerrain.getTerrainHeight(rx, rz) : 2.4, rz);
            this.scene.add(nMesh);
            this.wildlife.push({
              type: w.type,
              mesh: nMesh,
              health: w.type === 'deer' ? 50 : 20,
              wanderAngle: Math.random() * Math.PI * 2,
              wanderClock: 0,
              speed: w.type === 'deer' ? 1.2 : 1.8
            });
          }, 40000);
        }
      }


      // 2. Night Predators AI (Wolves stalking towards camp/player)
      for (let p = this.predators.length - 1; p >= 0; p--) {
        const pred = this.predators[p];
        const dx = playerPos.x - pred.mesh.position.x;
        const dz = playerPos.z - pred.mesh.position.z;
        const dist = Math.hypot(dx, dz);

        if (dist > 1.2) {
          // Stalk towards player or gate
          pred.mesh.position.x += (dx / dist) * pred.speed * dt;
          pred.mesh.position.z += (dz / dist) * pred.speed * dt;
          if (window.collisionSystem) {
            window.collisionSystem.resolve(pred.mesh.position, 0.45);
          }
          pred.mesh.position.y = window.WarwickTerrain ? window.WarwickTerrain.getTerrainHeight(pred.mesh.position.x, pred.mesh.position.z) : 2.4;
          pred.mesh.rotation.y = Math.atan2(dx, dz) - Math.PI / 2;
        } else {
          // Bite attack
          pred.attackClock = (pred.attackClock || 0) + dt;
          if (pred.attackClock >= 1.2) {
            pred.attackClock = 0;
            window.state.morale = Math.max(10, window.state.morale - 4);
            if (window.audio) window.audio.combatClash();
          }
        }

        // Predator defeated
        if (pred.health <= 0) {
          this.spawnCorpse(pred.mesh, pred.type);
          this.predators.splice(p, 1);
          window.state.silver += 8.0; // Wolf pelt bounty
          window.state.grain += 4;
          window.state.morale = Math.min(100, window.state.morale + 6);
          if (window.audio) window.audio.fanfare();
        }
      }

      // 3. Corpse Decay & Sinking Fade
      for (let c = this.corpses.length - 1; c >= 0; c--) {
        const corpse = this.corpses[c];
        corpse.decayTimer -= dt;

        // In final 1.8 seconds, sink gently and fade
        if (corpse.decayTimer <= 1.8) {
          const fadeProgress = Math.max(0, corpse.decayTimer / 1.8);
          corpse.mesh.position.y -= dt * 0.10;
          corpse.mesh.traverse(child => {
            if (child.isMesh && child.material) {
              child.material.transparent = true;
              child.material.opacity = fadeProgress;
            }
          });
        }

        if (corpse.decayTimer <= 0) {
          this.scene.remove(corpse.mesh);
          this.corpses.splice(c, 1);
        }
      }
    }
  }

  window.WildlifeManager = WildlifeManager;
})(window);
