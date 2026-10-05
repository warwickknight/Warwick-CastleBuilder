// Main Coordinator for WARWICK: Castle Builder
// Ties together 3D Scene, Avon River Bluff, Chibi Leader, Stations, Raids, and 60 FPS Loop
(function() {
  'use strict';

  const canvas = document.getElementById('webgl-canvas');
  const gameCamera = new GameCamera(canvas);
  const scene = gameCamera.scene;
  const bubbleContainer = document.getElementById('bubble-container');
  const actionRing = document.getElementById('action-ring');
  const actionProgressPath = document.getElementById('action-ring-progress');

  // --- 1. Atmospheric Lighting & River Sky ---
  scene.background = new THREE.Color(0x38bdf8); // English river morning sky
  scene.fog = new THREE.FogExp2(0x38bdf8, 0.012);

  const ambientLight = new THREE.AmbientLight(0xfffbeb, 0.85);
  scene.add(ambientLight);

  // Soft sky/ground hemisphere light for rich 3D shading & depth
  const hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x14532d, 0.45);
  scene.add(hemiLight);

  const sun = new THREE.DirectionalLight(0xfef3c7, 1.25);
  sun.position.set(18, 34, 16);
  sun.castShadow = true;
  sun.shadow.mapSize.width = 1024;
  sun.shadow.mapSize.height = 1024;
  sun.shadow.camera.near = 0.5;
  sun.shadow.camera.far = 70;
  const d = 20;
  sun.shadow.camera.left = -d;
  sun.shadow.camera.right = d;
  sun.shadow.camera.top = d;
  sun.shadow.camera.bottom = -d;
  sun.shadow.bias = -0.0005;
  scene.add(sun);

  // --- 2. Environment: Dynamic 3D Warwick Sandstone Bluff & River Avon Gorge ---
  const terrainData = WarwickTerrain.createWarwickTerrain(scene);
  const riverTex = terrainData.riverTex;
  window.WarwickTerrain.terrainMesh = terrainData.terrainMesh;

  // Boundary obstacles to keep player inside the enlarged 120x96 world
  window.collisionSystem.addBox(-60, 60, 26, 50);   // Deep River Avon south boundary (beyond dock/shallows)
  window.collisionSystem.addBox(-60, 60, -50, -46); // North world perimeter behind Motte hill
  window.collisionSystem.addBox(-60, -56, -50, 26); // West deep oak woodland perimeter
  window.collisionSystem.addBox(56, 60, -50, 26);   // East sandstone bluff perimeter

  // --- 3. Player: Æthelflæd, Lady of the Mercians ---
  const player = ChibiLeader.create(scene, {
    scale: 1.0,
    bodyColor: 0x15803d, // Mercian green
    capeColor: 0x1e3a8a  // Royal blue
  });
  const startY = WarwickTerrain.getTerrainHeight(0, 2.0);
  player.root.position.set(0, startY, 2.0);

  function syncPlayerStackVisuals() {
    ChibiLeader.updateStackVisuals(player, state.playerCarrying, state.carryingType);
  }

  // --- 4. Stations, Stockpiles & Free Placement Systems ---
  const stationMgr = new StationManager(scene, window.collisionSystem);
  stationMgr.initResourceSources();
  stationMgr.initStockpiles();
  stationMgr.initWorkshops();
  stationMgr.initHiringRings();
  stationMgr.initPlacedStructures();

  // --- 5. Natural World Resources: Interactive Trees, Stumps & Quarry Rocks ---
  const resourceMgr = new ResourceManager(scene, window.collisionSystem);
  resourceMgr.initResources();
  window.resourceManager = resourceMgr;

  const buildingPlacement = new BuildingPlacement(scene, gameCamera, stationMgr, window.collisionSystem, player);
  window.buildingPlacement = buildingPlacement;

  // --- 6. Wildlife & Hunting System (Deer, Rabbits, Wolves) ---
  const wildlifeMgr = new WildlifeManager(scene);
  wildlifeMgr.initWildlife();
  window.wildlifeManager = wildlifeMgr;

  // --- 6. Garrison & Raids ---
  const raidMgr = new RaidManager(scene, stationMgr);
  raidMgr.initGarrison();

  // Start with clean unobstructed view (Player can open chronicles at any time via 📜 icon)


  // --- 6. UI Helpers ---
  function showFloatingText(worldPos, text, color = '#ffffff') {
    const el = document.createElement('div');
    el.className = 'float-text';
    el.innerText = text;
    el.style.color = color;

    const tempV = new THREE.Vector3().copy(worldPos);
    tempV.y += 1.8;
    tempV.project(gameCamera.camera);
    el.style.left = `${(tempV.x * 0.5 + 0.5) * window.innerWidth}px`;
    el.style.top = `${(-(tempV.y * 0.5) + 0.5) * window.innerHeight}px`;

    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1300);
  }

  function updateActionRing(progress, worldPos) {
    if (!actionRing) return;
    if (progress <= 0 || progress >= 1) {
      actionRing.style.display = 'none';
      return;
    }
    actionRing.style.display = 'block';
    const tempV = new THREE.Vector3().copy(worldPos);
    tempV.y += 2.0;
    tempV.project(gameCamera.camera);
    actionRing.style.left = `${(tempV.x * 0.5 + 0.5) * window.innerWidth}px`;
    actionRing.style.top = `${(-(tempV.y * 0.5) + 0.5) * window.innerHeight}px`;

    if (actionProgressPath) {
      const pct = Math.min(100, Math.max(0, Math.round(progress * 100)));
      actionProgressPath.setAttribute('stroke-dasharray', `${pct}, 100`);
    }
  }

  function updateHUD() {
    const elSilver = document.getElementById('hud-silver');
    const elCarry = document.getElementById('hud-carrying');
    const elMax = document.getElementById('hud-carry-max');
    const elType = document.getElementById('hud-carry-type');
    const elTimber = document.getElementById('hud-timber');
    const elStone = document.getElementById('hud-stone');
    const elIron = document.getElementById('hud-iron');
    const elGrain = document.getElementById('hud-grain');
    const elMorale = document.getElementById('hud-morale');
    const elCompletion = document.getElementById('hud-completion');
    const elIcon = document.getElementById('hud-carry-icon');

    if (elSilver) elSilver.innerText = state.silver.toFixed(2);
    if (elCarry) elCarry.innerText = state.playerCarrying;
    if (elMax) elMax.innerText = state.maxCarryCapacity;
    if (elTimber) elTimber.innerText = state.timber;
    if (elStone) elStone.innerText = state.stone;
    if (elIron) elIron.innerText = state.iron;
    if (elGrain) elGrain.innerText = state.grain;
    if (elMorale) elMorale.innerText = state.morale;
    if (elCompletion) elCompletion.innerText = window.gameState.getCompletionPercentage();

    const elGuards = document.getElementById('hud-guards');
    const elHousing = document.getElementById('hud-housing');
    if (elGuards) elGuards.innerText = (state.garrison.armedLevies || 0) + (state.garrison.archers || 0);
    if (elHousing) elHousing.innerText = state.garrison.housingCapacity || 1;

    if (elType) {
      if (state.playerCarrying === 0) {
        elType.innerText = '(Empty)';
        if (elIcon) elIcon.innerText = '📦';
      } else {
        const icons = { timber: '🪵', stone: '🪨', spear: '⚔️', grain: '🌾' };
        elType.innerText = `(${state.carryingType || 'Item'})`;
        if (elIcon) elIcon.innerText = icons[state.carryingType] || '📦';
      }
    }

    // Day / Night Cycle Status
    const elDayText = document.getElementById('hud-day-text');
    const elCyclePhase = document.getElementById('hud-cycle-phase');
    const elNightThreat = document.getElementById('hud-night-threat');
    const elDayIcon = document.getElementById('hud-daynight-icon');

    if (elDayText) elDayText.innerText = `Day ${state.dayNumber || 1}`;

    const threatNames = [
      "1 Wolf",
      "2 Wolves",
      "1 Danish Scout",
      "2 Danish Raiders",
      "Danish Warband"
    ];
    const threatIdx = Math.min(threatNames.length - 1, Math.max(0, (state.nightThreatLevel || 1) - 1));

    if (state.isNight) {
      if (elCyclePhase) {
        elCyclePhase.innerText = 'Nightfall';
        elCyclePhase.className = 'text-red-400 font-semibold';
      }
      if (elDayIcon) elDayIcon.innerText = '🌙';
      if (elNightThreat) {
        elNightThreat.innerText = `Attack: ${threatNames[threatIdx]}`;
        elNightThreat.className = 'text-red-300 font-bold';
      }
    } else {
      const tod = state.timeOfDay || 0;
      let phase = 'Morning';
      if (tod > 0.45) phase = 'Dusk';
      else if (tod > 0.18) phase = 'Midday';

      if (elCyclePhase) {
        elCyclePhase.innerText = phase;
        elCyclePhase.className = 'text-amber-400 font-semibold';
      }
      if (elDayIcon) elDayIcon.innerText = tod > 0.45 ? '🌅' : '☀️';
      if (elNightThreat) {
        elNightThreat.innerText = `Tonight: ${threatNames[threatIdx]}`;
        elNightThreat.className = 'text-amber-300';
      }
    }
  }


  // --- 7. Main 60 FPS Game Loop ---
  let lastTime = performance.now();
  let actionTimer = 0;
  let currentActiveZone = null;
  let saveClock = 0;
  let lastPlayerStrikeTime = 0;
  let dropOffClock = 0;

  function animate(now) {
    requestAnimationFrame(animate);
    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;

    // A. Day / Night Cycle & Dynamic Environmental Atmosphere
    state.timeOfDay = ((state.timeOfDay || 0.15) + (dt / (state.dayCycleDuration || 75))) % 1.0;
    const tod = state.timeOfDay;

    // Smooth lighting & sky tint transitions across the day
    let skyColor = new THREE.Color();
    let sunColor = new THREE.Color();
    let ambientColor = new THREE.Color();
    let sunIntensity = 1.25;

    if (tod < 0.20) {
      // Dawn to Morning: Peach pink/gold sunrise warming into bright river sky
      const t = tod / 0.20;
      skyColor.copy(new THREE.Color(0xf472b6)).lerp(new THREE.Color(0x38bdf8), t);
      sunColor.copy(new THREE.Color(0xfde047)).lerp(new THREE.Color(0xfef3c7), t);
      ambientColor.copy(new THREE.Color(0xfed7aa)).lerp(new THREE.Color(0xfffbeb), t);
      sunIntensity = 0.8 + t * 0.45;
    } else if (tod < 0.50) {
      // Full Daylight: Brilliant English morning/midday sun
      skyColor.setHex(0x38bdf8);
      sunColor.setHex(0xfef3c7);
      ambientColor.setHex(0xfffbeb);
      sunIntensity = 1.25;
    } else if (tod < 0.65) {
      // Dusk: Deep orange/crimson twilight over the Avon River Gorge
      const t = (tod - 0.50) / 0.15;
      skyColor.copy(new THREE.Color(0x38bdf8)).lerp(new THREE.Color(0x9a3412), t);
      sunColor.copy(new THREE.Color(0xfef3c7)).lerp(new THREE.Color(0xf97316), t);
      ambientColor.copy(new THREE.Color(0xfffbeb)).lerp(new THREE.Color(0x78350f), t);
      sunIntensity = 1.25 - t * 0.75;
    } else if (tod < 0.90) {
      // Nightfall: Midnight blue atmosphere with cold silvery moonlight
      skyColor.setHex(0x090d16);
      sunColor.setHex(0x93c5fd); // Moon beam
      ambientColor.setHex(0x1e293b);
      sunIntensity = 0.45;
    } else {
      // Pre-dawn twilight shifting toward pink sunrise
      const t = (tod - 0.90) / 0.10;
      skyColor.copy(new THREE.Color(0x090d16)).lerp(new THREE.Color(0xf472b6), t);
      sunColor.copy(new THREE.Color(0x93c5fd)).lerp(new THREE.Color(0xfde047), t);
      ambientColor.copy(new THREE.Color(0x1e293b)).lerp(new THREE.Color(0xfed7aa), t);
      sunIntensity = 0.45 + t * 0.35;
    }

    scene.background.copy(skyColor);
    if (scene.fog) scene.fog.color.copy(skyColor);
    sun.color.copy(sunColor);
    sun.intensity = sunIntensity;
    ambientLight.color.copy(ambientColor);

    // Escalating Night Threat Trigger: Night 1 (1 Wolf) -> Night 2 (2 Wolves) -> Night 3 (Danish Scout) -> Night 4 (Raiders) -> Warband
    if (tod >= 0.65 && !state.nightSpawned) {
      state.nightSpawned = true;
      state.isNight = true;
      const level = state.nightThreatLevel || 1;

      if (level === 1) {
        // Night 1: 1 hungry wolf attacking the settlement
        wildlifeMgr.spawnNightWolf(-14, -6);
        if (window.audio) window.audio.wolfHowl();
      } else if (level === 2) {
        // Night 2: 2 wolves attacking from dark woods
        wildlifeMgr.spawnNightWolf(-14, -6);
        wildlifeMgr.spawnNightWolf(14, -6);
        if (window.audio) window.audio.wolfHowl();
      } else if (level === 3) {
        // Night 3: 1 Danish scout creeps up from the Avon
        raidMgr.spawnDanishScout(-6, 14);
      } else if (level === 4) {
        // Night 4: 2 Danish raiders attack
        raidMgr.spawnDanishRaiders(2);
      } else {
        // Night 5+: Full Danish warband attack
        raidMgr.spawnDanishRaiders(3);
      }
    } else if (tod < 0.10 && state.nightSpawned) {
      // Dawn breaks: Settlement survived the night!
      state.nightSpawned = false;
      state.isNight = false;
      state.dayNumber = (state.dayNumber || 1) + 1;
      state.nightThreatLevel = (state.nightThreatLevel || 1) + 1;
      state.morale = Math.min(100, state.morale + 10);
      if (window.audio) window.audio.fanfare();
    }

    // B. Flowing River Avon & Forge Flame Animation
    if (riverTex) {
      riverTex.offset.x += dt * 0.04;
      riverTex.offset.y += dt * 0.015;
    }

    if (stationMgr.forgeLight) {
      stationMgr.forgeLight.intensity = 1.0 + Math.sin(now * 0.012) * 0.4 + Math.random() * 0.1;
    }

    // C. Player Input & Movement
    const move = window.GameInput.getMovementVector();
    const mag = Math.hypot(move.x, move.y);
    const speed = 5.6;
    const pPos = player.root.position;

    if (mag > 0.05) {
      const dirX = move.x / mag;
      const dirZ = move.y / mag;
      player.root.position.x += dirX * speed * dt;
      player.root.position.z += dirZ * speed * dt;
      player.root.position.y = WarwickTerrain.getTerrainHeight(player.root.position.x, player.root.position.z);
      player.root.rotation.y = Math.atan2(dirX, dirZ);

      ChibiLeader.updateAnimation(player, true, dt);
    } else {
      player.root.position.y = WarwickTerrain.getTerrainHeight(player.root.position.x, player.root.position.z);
      ChibiLeader.updateAnimation(player, false, dt);
    }

    // D. Collision Resolution
    window.collisionSystem.resolve(player.root.position, 0.45);
    player.root.position.y = WarwickTerrain.getTerrainHeight(player.root.position.x, player.root.position.z);

    // E. Player Combat & Hunting (Auto-Attack with Saxon Seax Sword)
    // Automatically attacks whenever within range (2.6m) of hostiles (Danish raiders, wolves) or wild game (deer, rabbits)
    const attackRequested = window.GameInput.isAttackTriggered();
    let shouldAutoStrike = attackRequested;

    // Check targets in range (2.6m)
    const inRangeRaiders = raidMgr.raiders.filter(r => r.root.position.distanceTo(pPos) <= 2.6);
    const inRangeWolves = (wildlifeMgr.predators || []).filter(w => w.mesh.position.distanceTo(pPos) <= 2.6);
    const inRangeGame = (wildlifeMgr.wildlife || []).filter(g => g.mesh.position.distanceTo(pPos) <= 2.5);

    if (inRangeRaiders.length > 0 || inRangeWolves.length > 0 || inRangeGame.length > 0) {
      shouldAutoStrike = true;
    }

    if (shouldAutoStrike && (now - lastPlayerStrikeTime > 500)) {
      lastPlayerStrikeTime = now;
      ChibiLeader.triggerAttack(player);

      let hitSomething = false;

      // 1. Auto-strike Danish raiders
      inRangeRaiders.forEach(raider => {
        raider.health -= 35;
        hitSomething = true;
        if (window.audio) window.audio.combatClash();
      });

      // 2. Auto-strike Night Predators (Wolves)
      inRangeWolves.forEach(wolf => {
        wolf.health -= 35;
        hitSomething = true;
        if (window.audio) window.audio.combatClash();
      });

      // 3. Auto-hunt Wild Animals (Deer & Rabbits)
      inRangeGame.forEach(wild => {
        wild.health -= 35;
        hitSomething = true;
        if (window.audio) window.audio.combatClash();
      });

      if (!hitSomething && window.audio) {
        window.audio.swordSwing();
      }
    }

    // F. Automated Workers Simulation (Active Tree-Felling & Stone Quarrying)
    if (window.activeWorkers && window.resourceMgr) {
      window.activeWorkers.forEach(worker => {
        worker.root.position.y = WarwickTerrain.getTerrainHeight(worker.root.position.x, worker.root.position.z);

        // --- 1. Automated Woodcutter AI ---
        if (worker.workerType === 'woodcutter') {
          // If no target tree or target tree was already chopped down, find nearest living tree
          if (!worker.targetTree || worker.targetTree.isChopped) {
            let nearest = null;
            let minDist = 999;
            const trees = resourceMgr.trees;
            for (let i = 0; i < trees.length; i++) {
              const t = trees[i];
              if (t.isChopped) continue;
              const d = Math.hypot(t.x - worker.root.position.x, t.z - worker.root.position.z);
              if (d < minDist) {
                minDist = d;
                nearest = t;
              }
            }
            worker.targetTree = nearest;
          }

          if (worker.targetTree) {
            const tx = worker.targetTree.x;
            const tz = worker.targetTree.z;
            const dx = tx - worker.root.position.x;
            const dz = tz - worker.root.position.z;
            const dist = Math.hypot(dx, dz);

            if (dist > 1.5) {
              // Walk toward the targeted oak tree
              const walkSpeed = 2.4 * dt;
              worker.root.position.x += (dx / dist) * walkSpeed;
              worker.root.position.z += (dz / dist) * walkSpeed;
              worker.root.rotation.y = Math.atan2(dx, dz);
              ChibiSoldier.updateAnimation(worker, true, dt);
              worker.chopClock = 0;
            } else {
              // Stand at tree trunk and swing felling axe
              worker.root.rotation.y = Math.atan2(dx, dz);
              ChibiSoldier.updateAnimation(worker, false, dt);

              worker.chopClock = (worker.chopClock || 0) + dt;
              worker.soundClock = (worker.soundClock || 0) + dt;

              // Rhythmic felling axe swing
              if (worker.soundClock >= 0.55) {
                worker.soundClock = 0;
                ChibiSoldier.triggerAttack(worker);
                if (window.audio && typeof window.audio.woodChop === 'function') {
                  window.audio.woodChop();
                }
              }

              // After 2.4s of chopping, FELL TREE INTO REALISTIC STUMP!
              if (worker.chopClock >= 2.4) {
                worker.chopClock = 0;
                const felled = worker.targetTree;
                felled.isChopped = true;
                felled.trunkGroup.visible = false;
                felled.canopyGroup.visible = false;
                felled.stumpGroup.visible = true;
                if (felled.obstacle) felled.obstacle.active = false;

                if (window.audio && typeof window.audio.treeFall === 'function') {
                  window.audio.treeFall();
                }

                state.timber += 2;
                state.totalTimberHarvested += 2;
                showFloatingText(worker.root.position, "+2 Timber", "#22c55e");
                worker.targetTree = null; // Seek next unchopped tree
              }
            }
          } else {
            // Idle if all trees felled (waiting for regrowth)
            ChibiSoldier.updateAnimation(worker, false, dt);
          }
        }

        // --- 2. Automated Stonemason AI ---
        else if (worker.workerType === 'mason') {
          if (!worker.targetRock || worker.targetRock.isDepleted) {
            let nearest = null;
            let minDist = 999;
            const rocks = resourceMgr.rocks;
            for (let i = 0; i < rocks.length; i++) {
              const r = rocks[i];
              if (r.isDepleted) continue;
              const d = Math.hypot(r.x - worker.root.position.x, r.z - worker.root.position.z);
              if (d < minDist) {
                minDist = d;
                nearest = r;
              }
            }
            worker.targetRock = nearest;
          }

          if (worker.targetRock) {
            const rx = worker.targetRock.x;
            const rz = worker.targetRock.z;
            const dx = rx - worker.root.position.x;
            const dz = rz - worker.root.position.z;
            const dist = Math.hypot(dx, dz);

            if (dist > 1.8) {
              const walkSpeed = 2.2 * dt;
              worker.root.position.x += (dx / dist) * walkSpeed;
              worker.root.position.z += (dz / dist) * walkSpeed;
              worker.root.rotation.y = Math.atan2(dx, dz);
              ChibiSoldier.updateAnimation(worker, true, dt);
              worker.quarryClock = 0;
            } else {
              worker.root.rotation.y = Math.atan2(dx, dz);
              ChibiSoldier.updateAnimation(worker, false, dt);

              worker.quarryClock = (worker.quarryClock || 0) + dt;
              worker.soundClock = (worker.soundClock || 0) + dt;

              if (worker.soundClock >= 0.55) {
                worker.soundClock = 0;
                ChibiSoldier.triggerAttack(worker);
                if (window.audio && typeof window.audio.stoneChisel === 'function') {
                  window.audio.stoneChisel();
                }
              }

              if (worker.quarryClock >= 2.6) {
                worker.quarryClock = 0;
                const mined = worker.targetRock;
                mined.isDepleted = true;
                mined.boulderGroup.visible = false;
                mined.rubbleGroup.visible = true;
                if (mined.obstacle) mined.obstacle.active = false;

                if (window.audio && typeof window.audio.rockBreak === 'function') {
                  window.audio.rockBreak();
                }

                state.stone += 2;
                state.totalStoneQuarried += 2;
                showFloatingText(worker.root.position, "+2 Stone", "#f59e0b");
                worker.targetRock = null;
              }
            }
          } else {
            ChibiSoldier.updateAnimation(worker, false, dt);
          }
        }
      });
    }

    // G. Stations, Gathering & Drop-Off Stockpile Interactions
    let standingInZone = false;

    for (let i = 0; i < stationMgr.stations.length; i++) {
      const st = stationMgr.stations[i];
      const dist = pPos.distanceTo(st.group.position);
      const triggerRadius = st.type.startsWith('dropoff') ? 2.0 : 2.2;

      if (dist < triggerRadius) {
        standingInZone = true;
        currentActiveZone = st;

        // 1. Drop-Off at Timber Stockpile
        if (st.type === 'dropoff_timber') {
          if (state.playerCarrying > 0 && state.carryingType === 'timber') {
            dropOffClock += dt;
            if (dropOffClock >= 0.16) {
              dropOffClock = 0;
              state.playerCarrying--;
              state.timber++;
              state.totalTimberHarvested++;
              if (state.playerCarrying <= 0) state.carryingType = null;
              syncPlayerStackVisuals();
              if (window.audio) window.audio.place();
            }
          } else {
            dropOffClock = 0;
          }
        }
        // 2. Drop-Off at Stone Stockpile
        else if (st.type === 'dropoff_stone') {
          if (state.playerCarrying > 0 && state.carryingType === 'stone') {
            dropOffClock += dt;
            if (dropOffClock >= 0.16) {
              dropOffClock = 0;
              state.playerCarrying--;
              state.stone++;
              state.totalStoneQuarried++;
              if (state.playerCarrying <= 0) state.carryingType = null;
              syncPlayerStackVisuals();
              if (window.audio) window.audio.place();
            }
          } else {
            dropOffClock = 0;
          }
        }
        // 3. Sift Bog Iron at River Avon Shallows
        else if (st.type === 'gather_iron') {
          actionTimer += dt / 1.3;
          updateActionRing(actionTimer, pPos);
          if (actionTimer >= 1.0) {
            actionTimer = 0;
            state.iron++;
            if (window.audio) window.audio.pickup();
          }
        }
        // 4. Communal Food Store & Granary
        else if (st.type === 'granary_rations') {
          if (state.playerCarrying > 0 && (state.carryingType === 'grain' || state.carryingType === 'meat')) {
            dropOffClock += dt;
            if (dropOffClock >= 0.16) {
              dropOffClock = 0;
              state.playerCarrying--;
              state.grain += 2;
              state.morale = Math.min(100, state.morale + 5);
              if (state.playerCarrying <= 0) state.carryingType = null;
              syncPlayerStackVisuals();
              if (window.audio) window.audio.place();
            }
          } else {
            actionTimer += dt / 1.0;
            updateActionRing(actionTimer, pPos);
            if (actionTimer >= 1.0) {
              actionTimer = 0;
              state.morale = Math.min(100, state.morale + 10);
              if (window.audio) window.audio.coin();
            }
          }
        }
        // 7. Forge Spear (Requires 1 Iron + 1 Timber)
        else if (st.type === 'forge_spear') {
          if (state.iron >= 1 && state.timber >= 1) {
            actionTimer += dt / 1.4;
            updateActionRing(actionTimer, pPos);
            if (actionTimer >= 1.0) {
              actionTimer = 0;
              state.iron--;
              state.timber--;
              state.garrison.storedSpears++;
              if (window.audio) window.audio.anvilStrike();
              showFloatingText(st.group.position, "+1 Spear Forged! ⚔️", "#f97316");
            }
          } else {
            updateActionRing(0, pPos);
          }
        }
        // 8. Arm Saxon Peasant Levy
        else if (st.type === 'arm_levy') {
          const currentLevies = state.garrison.armedLevies;
          const maxCapacity = state.garrison.housingCapacity || 1;

          if (currentLevies >= maxCapacity) {
            actionTimer = 0;
            updateActionRing(0, pPos);
            if (!st.warnCooldown || (now - st.warnCooldown) > 2500) {
              st.warnCooldown = now;
              showFloatingText(st.group.position, `Need Barracks! (${currentLevies}/${maxCapacity} Beds)`, "#ef4444");
              if (window.audio) window.audio.warning();
            }
          } else if (state.garrison.storedSpears >= 1) {
            actionTimer += dt / 1.0;
            updateActionRing(actionTimer, pPos);
            if (actionTimer >= 1.0) {
              actionTimer = 0;
              state.garrison.storedSpears--;
              state.garrison.armedLevies++;
              raidMgr.spawnLevyGuard(3.5, 3.4);
              if (window.audio) window.audio.fanfare();
              showFloatingText(st.group.position, `+1 Guard on Patrol! (${state.garrison.armedLevies}/${maxCapacity} Beds)`, "#10b981");
            }
          } else {
            updateActionRing(0, pPos);
          }
        }
        break;
      }
    }

    // H. Natural Interactive Resources (Chop Trees -> Cut Stumps, Quarry Sandstone Boulders -> Rubble)
    if (!standingInZone) {
      const harvestResult = resourceMgr.update(dt, pPos, mag > 0.05);
      if (harvestResult) {
        standingInZone = true;
        if (harvestResult.full) {
          updateActionRing(0, pPos);
          if (!resourceMgr.fullWarn || (now - resourceMgr.fullWarn) > 2800) {
            resourceMgr.fullWarn = now;
            if (window.audio && typeof window.audio.warning === 'function') window.audio.warning();
          }
        } else if (harvestResult.completed) {
          updateActionRing(0, pPos);
          syncPlayerStackVisuals();
        } else if (harvestResult.progress !== undefined) {
          // Æthelflæd swings tool rhythmically while chopping/chiseling
          if (now - lastPlayerStrikeTime > 460) {
            lastPlayerStrikeTime = now;
            ChibiLeader.triggerAttack(player);
          }
          updateActionRing(harvestResult.progress, harvestResult.pos);
        }
      }
    }

    // I. Worker Hiring Notice Boards & Archer Recruitment Posts
    if (!standingInZone) {
      for (let i = 0; i < stationMgr.hireZones.length; i++) {
        const hz = stationMgr.hireZones[i];
        if (hz.hireData && hz.hireData.id === 'archer') {
          const maxHires = hz.hireData.maxHires || 4;
          const currentArchers = (state.garrison && state.garrison.archers) || 0;
          if (currentArchers < maxHires) {
            hz.group.visible = true;
          }
        }
        if (!hz.group.visible) continue;
        const dist = pPos.distanceTo(hz.group.position);

        if (dist < 1.8) {
          standingInZone = true;
          const h = hz.hireData;

          // Check building prerequisite (e.g. Archer requires Archery Range)
          if (h.requiresBuilding && (!state.structures[h.requiresBuilding] || state.structures[h.requiresBuilding] === 0)) {
            updateActionRing(0, pPos);
            if (Math.random() < 0.03) {
              showFloatingText(hz.group.position, "🎯 Build Archery Range first!", "#facc15");
            }
            break;
          }

          // Check max capacity for repeatable hires
          if (h.repeatable && h.maxHires && (state.garrison.archers || 0) >= h.maxHires) {
            updateActionRing(0, pPos);
            if (Math.random() < 0.03) {
              showFloatingText(hz.group.position, `Max Archers (${h.maxHires}/${h.maxHires})`, "#94a3b8");
            }
            break;
          }

          if (state.silver >= h.costSilver) {
            actionTimer += dt / 1.2;
            updateActionRing(actionTimer, pPos);
            if (actionTimer >= 1.0) {
              actionTimer = 0;
              state.silver -= h.costSilver;
              if (h.id === 'archer') {
                state.garrison.archers = (state.garrison.archers || 0) + 1;
                if ((state.garrison.archers || 0) >= (h.maxHires || 4)) {
                  hz.group.visible = false;
                  if (hz.propMesh) hz.propMesh.visible = false;
                }
              } else {
                state.workers[h.id] = true;
                hz.group.visible = false;
                if (hz.propMesh) hz.propMesh.visible = false;
              }
              h.onHire();

              if (window.audio) window.audio.fanfare();
              showFloatingText(hz.group.position, `${h.name}!`, "#a855f7");
            }
          } else {
            updateActionRing(0, pPos);
            if (Math.random() < 0.02) {
              showFloatingText(hz.group.position, `Need ${h.costSilver} 🪙`, "#f87171");
            }
          }
          break;
        }
      }
    }

    // J. River Avon Dock Raid Expedition
    if (!standingInZone && state.structures.riverDock > 0) {
      const dockY = window.WarwickTerrain ? window.WarwickTerrain.getTerrainHeight(-7, 14) : 0.2;
      const dockPos = new THREE.Vector3(-7, dockY, 14);
      if (pPos.distanceTo(dockPos) < 2.4) {
        standingInZone = true;
        if (!raidMgr.expeditionActive && state.garrison.armedLevies >= 1) {
          actionTimer += dt / 1.5;
          updateActionRing(actionTimer, pPos);
          if (actionTimer >= 1.0) {
            actionTimer = 0;
            raidMgr.launchExpedition(showFloatingText);
          }
        }
      }
    }

    if (!standingInZone) {
      actionTimer = 0;
      updateActionRing(0, pPos);
    }

    // K. Wildlife & Hunting AI Simulation (Deer grazing/fleeing, Rabbits hopping, Wolves stalking)
    wildlifeMgr.update(dt, player.root.position, null);

    // L. Raids & Combat Simulation
    raidMgr.update(dt, player.root.position, null);

    // M. Camera Follow & HUD Updates
    gameCamera.updateFollow(player.root.position, dt);
    updateHUD();

    // N. Auto-Save periodically (every 5 seconds)
    saveClock += dt;
    if (saveClock >= 5.0) {
      saveClock = 0;
      window.gameState.save();
    }

    // O. Free Placement Ghost Animation
    if (window.buildingPlacement) {
      window.buildingPlacement.update(dt);
    }

    // P. Render Scene
    gameCamera.render();
  }

  // Start Animation Loop
  requestAnimationFrame(animate);
})();

