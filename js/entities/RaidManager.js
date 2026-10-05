// Entities: RaidManager & Garrison Combat AI for WARWICK: Castle Builder
// Handles dynamic soldier patrols, aggressive incursion interceptions, and Avon skiff expeditions
(function(window) {
  'use strict';

  // 4 Tactical Patrol Routes along the enlarged Warwick Hill Fort & River Avon
  const PATROL_ROUTES = [
    // Route 0: South Gate Ramparts & Palisade Crest
    [
      { x: 0, z: 10.5 },
      { x: 5.5, z: 9.5 },
      { x: 0, z: 10.5 },
      { x: -5.5, z: 9.5 }
    ],
    // Route 1: River Cliff Path (Descending from South Gate towards Avon River Dock)
    [
      { x: 0, z: 10.5 },
      { x: -5.0, z: 15.0 },
      { x: -10.0, z: 20.5 },
      { x: -5.0, z: 15.0 }
    ],
    // Route 2: Central Burh, Barracks & Archery Range
    [
      { x: 0, z: 0.0 },
      { x: 8.5, z: 2.5 },
      { x: 8.5, z: -4.5 },
      { x: 0, z: 0.0 }
    ],
    // Route 3: North Motte Earthworks & Mound Crest
    [
      { x: 0, z: -6.0 },
      { x: -6.0, z: -14.0 },
      { x: 0.0, z: -20.0 },
      { x: 6.0, z: -14.0 }
    ]
  ];

  class RaidManager {
    constructor(scene, stationManager) {
      this.scene = scene;
      this.stationManager = stationManager;
      this.raiders = [];
      this.garrisonLevies = [];
      this.corpses = [];
      this.arrows = [];
      this.warningSoundPlayed = false;
      this.expeditionActive = false;
      this.playerAttackClock = 0;
    }

    createArrowMesh() {
      const arrow = new THREE.Group();
      const shaft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.015, 0.75, 5),
        new THREE.MeshStandardMaterial({ color: 0xc8a165, roughness: 0.8 })
      );
      shaft.rotation.x = Math.PI / 2;
      arrow.add(shaft);

      const tip = new THREE.Mesh(
        new THREE.ConeGeometry(0.04, 0.14, 5),
        new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.8, roughness: 0.3 })
      );
      tip.rotation.x = Math.PI / 2;
      tip.position.z = 0.43;
      arrow.add(tip);

      const featherMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, side: THREE.DoubleSide });
      [0, Math.PI / 2].forEach(r => {
        const feather = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 0.16), featherMat);
        feather.rotation.set(0, Math.PI / 2, r);
        feather.position.z = -0.32;
        arrow.add(feather);
      });
      return arrow;
    }

    // Launch a visible arrow from an archer; damage is applied on impact
    spawnArrow(archer, target, isPredator, damage, showFloatingTextCallback) {
      const mesh = this.createArrowMesh();
      const from = archer.root.position.clone();
      from.y += 1.15;
      mesh.position.copy(from);
      this.scene.add(mesh);

      const getTargetPos = () => (isPredator ? target.mesh.position : target.root.position);
      const endPos = getTargetPos();
      const dist = Math.hypot(endPos.x - from.x, endPos.z - from.z);

      this.arrows.push({
        mesh,
        from,
        target,
        getTargetPos,
        damage,
        showFloatingTextCallback,
        t: 0,
        duration: Math.max(0.3, dist / 22),
        arc: Math.min(3.0, 0.4 + dist * 0.12),
        last: from.clone(),
        stuckTimer: -1
      });
    }

    updateArrows(dt) {
      for (let a = this.arrows.length - 1; a >= 0; a--) {
        const arrow = this.arrows[a];

        // Landed: stay stuck briefly, then remove
        if (arrow.stuckTimer >= 0) {
          arrow.stuckTimer -= dt;
          if (arrow.stuckTimer <= 0) {
            this.scene.remove(arrow.mesh);
            this.arrows.splice(a, 1);
          }
          continue;
        }

        arrow.t = Math.min(1, arrow.t + dt / arrow.duration);
        const end = arrow.getTargetPos().clone();
        end.y += 0.9;

        const pos = arrow.from.clone().lerp(end, arrow.t);
        pos.y += Math.sin(Math.PI * arrow.t) * arrow.arc;

        const dir = pos.clone().sub(arrow.last);
        if (dir.lengthSq() > 1e-6) {
          arrow.mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir.normalize());
        }
        arrow.mesh.position.copy(pos);
        arrow.last.copy(pos);

        if (arrow.t >= 1) {
          // Impact
          if (arrow.target.health > 0) {
            arrow.target.health -= arrow.damage;
            if (arrow.showFloatingTextCallback) {
              arrow.showFloatingTextCallback(end, `-${arrow.damage}`, "#f87171");
            }
          }
          if (window.audio && typeof window.audio.arrowHit === 'function') {
            window.audio.arrowHit();
          }
          arrow.stuckTimer = 1.5;
        }
      }
    }

    spawnCorpse(entityRoot, type = 'human') {
      if (!entityRoot) return;

      // Stop walking/moving animations and drop to ground
      entityRoot.rotation.z = (Math.random() > 0.5 ? 1 : -1) * (Math.PI / 2);
      entityRoot.rotation.x = (Math.random() - 0.5) * 0.4;
      const ty = window.WarwickTerrain ? window.WarwickTerrain.getTerrainHeight(entityRoot.position.x, entityRoot.position.z) : 0;
      entityRoot.position.y = Math.max(0.04, ty + 0.12);

      // Clone materials so fading doesn't affect living units
      entityRoot.traverse(child => {
        if (child.isMesh && child.material) {
          child.material = child.material.clone();
        }
      });

      this.corpses.push({
        root: entityRoot,
        decayTimer: 6.5,
        type
      });
    }

    initGarrison() {
      // Spawn guards according to saved/recruited armedLevies and archers
      const count = (window.state && window.state.garrison) ? window.state.garrison.armedLevies || 0 : 0;
      for (let i = 0; i < count; i++) {
        this.spawnLevyGuard(0, 10.5);
      }
      const archerCount = (window.state && window.state.garrison) ? window.state.garrison.archers || 0 : 0;
      for (let i = 0; i < archerCount; i++) {
        this.spawnGarrisonArcher();
      }
    }

    spawnLevyGuard(x, z) {
      const levy = ChibiSoldier.create(this.scene, 'levy', 0.95);
      const ty = window.WarwickTerrain ? window.WarwickTerrain.getTerrainHeight(x, z) : 0;
      levy.root.position.set(x, ty, z);

      // Assign one of the 4 patrol routes
      levy.routeIndex = this.garrisonLevies.length % PATROL_ROUTES.length;
      levy.patrolRoute = PATROL_ROUTES[levy.routeIndex];
      levy.waypointIdx = 0;
      levy.waitTimer = 1.0 + Math.random() * 2.0;
      levy.state = 'patrolling';
      levy.attackClock = 0;
      levy.health = 100;
      levy.maxHealth = 100;

      this.garrisonLevies.push(levy);
      return levy;
    }

    spawnGarrisonArcher(x, z) {
      if (x === undefined || z === undefined) {
        // Spawn near archery range if placed, or central bailey
        const range = (window.state && window.state.placedStructures)
          ? window.state.placedStructures.find(s => s.type === 'archery')
          : null;
        if (range) {
          x = range.x + (Math.random() - 0.5) * 2.5;
          z = range.z + (Math.random() - 0.5) * 2.5;
        } else {
          x = 4.5 + (Math.random() - 0.5) * 3.0;
          z = -4.0 + (Math.random() - 0.5) * 3.0;
        }
      }

      const archer = ChibiSoldier.create(this.scene, 'archer', 0.95);
      const ty = window.WarwickTerrain ? window.WarwickTerrain.getTerrainHeight(x, z) : 0;
      archer.root.position.set(x, ty, z);
      archer.routeIndex = this.garrisonLevies.length % PATROL_ROUTES.length;
      archer.patrolRoute = PATROL_ROUTES[archer.routeIndex];
      archer.waypointIdx = 0;
      archer.waitTimer = 1.0 + Math.random() * 2.0;
      archer.state = 'patrolling';
      archer.attackClock = 0;
      archer.shootCooldown = 0;
      archer.health = 80;
      archer.maxHealth = 80;

      this.garrisonLevies.push(archer);
      return archer;
    }

    update(dt, playerPos, showFloatingTextCallback) {
      const state = window.state;

      // --- 1. Incursion Timer & War Horn Alert ---
      state.raidTimer -= dt;

      // 15-second War Horn Warning
      if (state.raidTimer <= 15 && !this.warningSoundPlayed) {
        state.raidWarning = true;
        this.warningSoundPlayed = true;
        if (window.audio) window.audio.warHorn();
        const banner = document.getElementById('raid-warning-banner');
        if (banner) banner.classList.remove('hidden');
      }

      // Raid Trigger: Longship landing
      if (state.raidTimer <= 0) {
        state.raidTimer = 90; // Reset timer for next raid cycle
        state.raidWarning = false;
        this.warningSoundPlayed = false;
        const banner = document.getElementById('raid-warning-banner');
        if (banner) banner.classList.add('hidden');

        this.triggerDanishInvasion(showFloatingTextCallback);
      }

      // Update raid warning countdown in UI
      const timerEl = document.getElementById('hud-raid-timer');
      if (timerEl) {
        timerEl.innerText = Math.max(0, Math.ceil(state.raidTimer));
      }

      // --- 2. Garrison Soldiers: Patrol & Combat AI ---
      this.garrisonLevies.forEach((levy, lIdx) => {
        // Find nearest Danish raider or hostile night predator (wolf)
        let nearestTarget = null;
        let minTargetDist = 999;
        let isPredatorTarget = false;

        this.raiders.forEach(r => {
          const d = levy.root.position.distanceTo(r.root.position);
          if (d < minTargetDist) {
            minTargetDist = d;
            nearestTarget = r;
            isPredatorTarget = false;
          }
        });

        if (!nearestTarget && window.wildlifeManager && window.wildlifeManager.predators) {
          window.wildlifeManager.predators.forEach(p => {
            const d = levy.root.position.distanceTo(p.mesh.position);
            if (d < minTargetDist) {
              minTargetDist = d;
              nearestTarget = p;
              isPredatorTarget = true;
            }
          });
        }

        // A. Combat Engagement Mode (Hostiles detected within range)
        const engageRange = (levy.type === 'archer') ? 22.0 : 20.0;
        if (nearestTarget && minTargetDist < engageRange) {
          const targetPos = isPredatorTarget ? nearestTarget.mesh.position : nearestTarget.root.position;
          const dx = targetPos.x - levy.root.position.x;
          const dz = targetPos.z - levy.root.position.z;
          const dist = Math.hypot(dx, dz);

          // --- ARCHER RANGED COMBAT ---
          if (levy.type === 'archer') {
            levy.root.rotation.y = Math.atan2(dx, dz);
            levy.shootCooldown = (levy.shootCooldown || 0) + dt;

            if (dist > 12.0) {
              // Advance to shooting range
              const runSpeed = 2.8;
              levy.root.position.x += (dx / dist) * runSpeed * dt;
              levy.root.position.z += (dz / dist) * runSpeed * dt;
              if (window.collisionSystem) {
                window.collisionSystem.resolve(levy.root.position, 0.45);
              }
              levy.root.position.y = window.WarwickTerrain ? window.WarwickTerrain.getTerrainHeight(levy.root.position.x, levy.root.position.z) : 0;
              ChibiSoldier.updateAnimation(levy, true, dt);
              levy.state = 'advancing';
            } else if (dist < 3.8) {
              // Kiting retreat if enemy gets too close
              const backSpeed = 1.8;
              levy.root.position.x -= (dx / dist) * backSpeed * dt;
              levy.root.position.z -= (dz / dist) * backSpeed * dt;
              if (window.collisionSystem) {
                window.collisionSystem.resolve(levy.root.position, 0.45);
              }
              levy.root.position.y = window.WarwickTerrain ? window.WarwickTerrain.getTerrainHeight(levy.root.position.x, levy.root.position.z) : 0;
              ChibiSoldier.updateAnimation(levy, true, dt);
              levy.state = 'kiting';
            } else {
              // Stationary firing stance
              ChibiSoldier.updateAnimation(levy, false, dt);
              levy.state = 'shooting';
            }

            // Nocked arrow is only visible while drawing the next shot
            if (levy.nockedArrow) {
              levy.nockedArrow.visible = levy.shootCooldown > 0.5;
            }

            // Release arrow every 1.3s
            if (levy.shootCooldown >= 1.3) {
              levy.shootCooldown = 0;
              ChibiSoldier.triggerAttack(levy);
              if (levy.nockedArrow) levy.nockedArrow.visible = false;
              if (window.audio && typeof window.audio.bowRelease === 'function') {
                window.audio.bowRelease();
              }

              // Loose a visible arrow; damage is applied when it lands
              this.spawnArrow(levy, nearestTarget, isPredatorTarget, 30, showFloatingTextCallback);
            }
            return;
          }

          // --- SPEARMAN LEVY MELEE COMBAT ---
          if (dist > 1.3) {
            // Charge at full speed towards hostile
            const runSpeed = 3.2;
            levy.root.position.x += (dx / dist) * runSpeed * dt;
            levy.root.position.z += (dz / dist) * runSpeed * dt;
            if (window.collisionSystem) {
              window.collisionSystem.resolve(levy.root.position, 0.45);
            }
            levy.root.position.y = window.WarwickTerrain ? window.WarwickTerrain.getTerrainHeight(levy.root.position.x, levy.root.position.z) : 0;
            levy.root.rotation.y = Math.atan2(dx, dz);
            ChibiSoldier.updateAnimation(levy, true, dt);
            levy.state = 'charging';
          } else {
            // Melee Attack Range
            levy.root.rotation.y = Math.atan2(dx, dz);
            ChibiSoldier.updateAnimation(levy, false, dt);
            levy.state = 'attacking';
            levy.attackClock = (levy.attackClock || 0) + dt;

            // Animated spear thrust
            if (levy.rightArm) {
              levy.rightArm.rotation.x = -1.2 + Math.sin(levy.attackClock * 14) * 0.7;
            }
            if (levy.leftArm) {
              levy.leftArm.rotation.x = -0.9; // Raise shield
            }

            if (levy.attackClock >= 0.85) {
              levy.attackClock = 0;
              nearestTarget.health -= 35;
              if (window.audio) window.audio.combatClash();
            }
          }
        }

        // B. Peaceful Patrol Mode (No raiders in range)
        else {
          levy.state = 'patrolling';
          if (!levy.patrolRoute || levy.patrolRoute.length === 0) return;

          const targetWp = levy.patrolRoute[levy.waypointIdx];
          const dx = targetWp.x - levy.root.position.x;
          const dz = targetWp.z - levy.root.position.z;
          const dist = Math.hypot(dx, dz);

          if (levy.waitTimer > 0) {
            // Pausing at sentry post
            levy.waitTimer -= dt;
            ChibiSoldier.updateAnimation(levy, false, dt);
          } else if (dist > 0.6) {
            // Walking along patrol route
            const patrolSpeed = 1.9;
            levy.root.position.x += (dx / dist) * patrolSpeed * dt;
            levy.root.position.z += (dz / dist) * patrolSpeed * dt;
            if (window.collisionSystem) {
              window.collisionSystem.resolve(levy.root.position, 0.45);
            }
            levy.root.position.y = window.WarwickTerrain ? window.WarwickTerrain.getTerrainHeight(levy.root.position.x, levy.root.position.z) : 0;
            levy.root.rotation.y = Math.atan2(dx, dz);
            ChibiSoldier.updateAnimation(levy, true, dt);
          } else {
            // Reached sentry waypoint: pause and scan horizon
            levy.waitTimer = 2.0 + Math.random() * 2.5;
            levy.waypointIdx = (levy.waypointIdx + 1) % levy.patrolRoute.length;
            ChibiSoldier.updateAnimation(levy, false, dt);
          }
        }
      });

      // --- 3. Danish Raiders AI & Attack Loop ---
      for (let i = this.raiders.length - 1; i >= 0; i--) {
        const raider = this.raiders[i];

        // Target: South Gate (0, 10.5), Granary (2.5, 0.5), or nearest defender/player
        let targetX = 0;
        let targetZ = 10.5;

        // Check if player is near
        const distToPlayer = raider.root.position.distanceTo(playerPos);
        if (distToPlayer < 4.0) {
          targetX = playerPos.x;
          targetZ = playerPos.z;
        }

        // Check nearest levy guard
        let nearestLevy = null;
        let minLevyDist = 999;
        this.garrisonLevies.forEach(l => {
          const d = raider.root.position.distanceTo(l.root.position);
          if (d < minLevyDist) {
            minLevyDist = d;
            nearestLevy = l;
          }
        });

        if (nearestLevy && minLevyDist < 6.0) {
          targetX = nearestLevy.root.position.x;
          targetZ = nearestLevy.root.position.z;
        }

        const dx = targetX - raider.root.position.x;
        const dz = targetZ - raider.root.position.z;
        const dist = Math.hypot(dx, dz);

        if (dist > 1.2) {
          // Storming up the hill fort
          const speed = 2.4;
          raider.root.position.x += (dx / dist) * speed * dt;
          raider.root.position.z += (dz / dist) * speed * dt;
          if (window.collisionSystem) {
            window.collisionSystem.resolve(raider.root.position, 0.45);
          }
          raider.root.position.y = window.WarwickTerrain ? window.WarwickTerrain.getTerrainHeight(raider.root.position.x, raider.root.position.z) : 0;
          raider.root.rotation.y = Math.atan2(dx, dz);
          ChibiSoldier.updateAnimation(raider, true, dt);
        } else {
          // Raider attack range
          ChibiSoldier.updateAnimation(raider, false, dt);
          raider.attackClock = (raider.attackClock || 0) + dt;

          if (raider.rightArm) {
            raider.rightArm.rotation.x = -1.2 + Math.sin(raider.attackClock * 12) * 0.7;
          }

          if (raider.attackClock >= 1.1) {
            raider.attackClock = 0;
            if (window.audio) window.audio.combatClash();

            // Damage nearest levy
            if (nearestLevy && minLevyDist <= 1.5) {
              nearestLevy.health -= 25;
              if (nearestLevy.health <= 0) {
                this.spawnCorpse(nearestLevy.root, nearestLevy.type);
                const lIdx = this.garrisonLevies.indexOf(nearestLevy);
                if (lIdx !== -1) this.garrisonLevies.splice(lIdx, 1);
                if (nearestLevy.type === 'archer') {
                  state.garrison.archers = Math.max(0, (state.garrison.archers || 0) - 1);
                } else {
                  state.garrison.armedLevies = Math.max(0, (state.garrison.armedLevies || 0) - 1);
                }
              }
            } else if (distToPlayer <= 1.6) {
              // Player struck
              state.morale = Math.max(10, state.morale - 5);
            }
          }
        }

        // Raider defeated
        if (raider.health <= 0) {
          this.spawnCorpse(raider.root, 'raider');
          this.raiders.splice(i, 1);
          state.silver += 15.0;
          state.iron += 2;
          state.garrison.raidsRepelled++;
          state.morale = Math.min(100, state.morale + 10);

          if (window.audio) window.audio.fanfare();
          if (showFloatingTextCallback) {
            showFloatingTextCallback(raider.root.position, "+15 Silver & Iron Loot!", "#f59e0b");
          }
        }
      }

      // --- 4. Player (Æthelflæd) Direct Combat Support ---
      if (this.raiders.length > 0) {
        this.raiders.forEach(raider => {
          const dToPlayer = raider.root.position.distanceTo(playerPos);
          if (dToPlayer < 2.0) {
            this.playerAttackClock += dt;
            if (this.playerAttackClock >= 0.8) {
              this.playerAttackClock = 0;
              raider.health -= 30;
              if (window.audio) window.audio.combatClash();
            }
          }
        });
      }

      // --- 5. Arrow Flight ---
      this.updateArrows(dt);

      // --- 6. Corpse Decay & Fade Cycle ---
      for (let c = this.corpses.length - 1; c >= 0; c--) {
        const corpse = this.corpses[c];
        corpse.decayTimer -= dt;

        // In final 1.8 seconds, gently sink into terrain and fade opacity
        if (corpse.decayTimer <= 1.8) {
          const fadeProgress = Math.max(0, corpse.decayTimer / 1.8);
          corpse.root.position.y -= dt * 0.12;
          corpse.root.traverse(child => {
            if (child.isMesh && child.material) {
              child.material.transparent = true;
              child.material.opacity = fadeProgress;
            }
          });
        }

        if (corpse.decayTimer <= 0) {
          this.scene.remove(corpse.root);
          this.corpses.splice(c, 1);
        }
      }

      state.garrison.activeRaiders = this.raiders.length;
    }

    spawnDanishScout(x = -10, z = 21) {
      if (window.audio) window.audio.warHorn();
      const scout = ChibiSoldier.create(this.scene, 'raider', 0.88);
      const ry = window.WarwickTerrain ? window.WarwickTerrain.getTerrainHeight(x, z) : 0.2;
      scout.root.position.set(x, ry, z);
      scout.health = 55;
      scout.isScout = true;
      this.raiders.push(scout);
      return scout;
    }

    spawnDanishRaiders(count = 2) {
      if (window.audio) window.audio.warHorn();
      for (let i = 0; i < count; i++) {
        const raider = ChibiSoldier.create(this.scene, 'raider', 1.0);
        const rx = -10 - i * 1.8;
        const rz = 21 + i * 0.8;
        const ry = window.WarwickTerrain ? window.WarwickTerrain.getTerrainHeight(rx, rz) : 0.2;
        raider.root.position.set(rx, ry, rz);
        raider.health = 80;
        this.raiders.push(raider);
      }
    }

    triggerDanishInvasion(showFloatingTextCallback) {
      this.spawnDanishRaiders(2 + Math.floor(Math.random() * 2), showFloatingTextCallback);
    }


    // Launch Expedition across River Avon
    launchExpedition(showFloatingTextCallback) {
      const state = window.state;
      if (this.expeditionActive) return;
      if (state.garrison.armedLevies < 1) {
        if (showFloatingTextCallback) {
          showFloatingTextCallback(new THREE.Vector3(0, 2, 0), "Need 1+ Armed Levy to Raid!", "#ef4444");
        }
        return;
      }

      this.expeditionActive = true;
      if (window.audio) window.audio.warHorn();

      // Temporary dispatch one levy on the skiff
      state.garrison.armedLevies--;
      if (showFloatingTextCallback) {
        showFloatingTextCallback(new THREE.Vector3(-7, 1, 14), "⛵ Expedition Dispatched!", "#38bdf8");
      }

      // Returns in 10 seconds with rich spoils
      setTimeout(() => {
        this.expeditionActive = false;
        state.garrison.armedLevies++;
        state.silver += 35.0;
        state.timber += 15;
        state.stone += 8;
        state.garrison.expeditionsWon++;
        state.morale = Math.min(100, state.morale + 15);

        if (window.audio) window.audio.fanfare();
        if (showFloatingTextCallback) {
          showFloatingTextCallback(new THREE.Vector3(-7, 1, 14), "🏆 Raid Spoils: +35 Silver, +15 Timber, +8 Stone!", "#f59e0b");
        }
      }, 10000);
    }
  }

  window.RaidManager = RaidManager;
})(window);
