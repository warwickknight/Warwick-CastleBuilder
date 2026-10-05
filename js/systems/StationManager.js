// Systems: StationManager & Construction Zones for Warwick: Castle Builder
// Manages gathering spots, processing benches, build pads, and upgrade rings
(function(window) {
  'use strict';

  class StationManager {
    constructor(scene, collisionSystem) {
      this.scene = scene;
      this.collision = collisionSystem;
      this.stations = [];
      this.stockpiles = [];
      this.buildZones = [];
      this.hireZones = [];
      this.props = [];
    }

    // Helper to register 3D solid obstacle with terrain elevation and rotation
    addPropWithObstacle(mesh, x, z, w, d, rotY = 0) {
      const ty = window.WarwickTerrain ? window.WarwickTerrain.getTerrainHeight(x, z) : 0;
      mesh.position.set(x, (mesh.position.y || 0) + ty, z);
      if (rotY) mesh.rotation.y = rotY;
      this.scene.add(mesh);
      this.props.push(mesh);
      if (this.collision && w && d) {
        const cos = Math.abs(Math.cos(rotY));
        const sin = Math.abs(Math.sin(rotY));
        const bw = w * cos + d * sin;
        const bd = w * sin + d * cos;
        this.collision.addCenteredBox(x, z, bw, bd);
      }
      return mesh;
    }

    setZoneAtTerrain(zone, x, z) {
      const ty = window.WarwickTerrain ? window.WarwickTerrain.getTerrainHeight(x, z) : 0;
      zone.group.position.set(x, ty + 0.04, z);
    }

    // 1. Gather & Resource Source Visual Locations (NO FLOOR CIRCLES, NO FLOATING TEXT BILLBOARDS)
    initResourceSources() {
      // Bog Iron Shallows (Down by the River Avon bend, South-West: -14, 20.5)
      // Visual clues: River mud bank with dark bog iron nuggets
      const ironZone = ZoneManager.createGroundZoneRing(
        this.scene, 2.2, 0x64748b, "BOG IRON", "Sift Riverbed Iron", { noFloorRings: true, showLabel: false, yOffset: 0.04 }
      );
      this.setZoneAtTerrain(ironZone, -14, 20.5);
      ironZone.type = 'gather_iron';
      this.stations.push(ironZone);
    }

    // 2. Resource Storage Depots (Built freely by player via Build Fort menu, not from the outset)
    initStockpiles() {
      // Clean start: Wood, Rock, and Food Stores are now placed by the player via the Build Fort menu!
    }

    // 3. Crafting & Processing Stations (Central hill kept completely open for free placement)
    initWorkshops() {
      // Kept clean on start so player can build freely
    }

    // 4. Free Placement Dispatcher & Saved Structure Reconstruction
    createStructureMesh(type) {
      switch(type) {
        case 'woodStore': return this.createTimberStockpileMesh();
        case 'rockStore': return this.createStoneStockpileMesh();
        case 'foodStore': return this.createFoodStoreModel();
        case 'campfire': return this.createCampfireModel();
        case 'tent': return this.createTentModel();
        case 'spikes': return this.createSpikesModel();
        case 'trench': return this.createTrenchModel();
        case 'fence': return this.createFenceModel();
        case 'archery': return this.createArcheryRangeModel();
        case 'smallHut': return this.createSmallHutModel();
        case 'palisadeSouth': return this.createSouthPalisadeGateModel();
        case 'watchtower': return this.createTimberWatchtowerModel();
        case 'barracks': return this.createWarriorBarracksModel();
        case 'riverDock': return this.createRiverDockModel();
        case 'motteMound': return this.createMotteMoundModel();
        default: return new THREE.Group();
      }
    }

    placeStructure(type, x, z, rotY = 0) {
      switch(type) {
        case 'woodStore': return this.buildWoodStore(x, z, rotY);
        case 'rockStore': return this.buildRockStore(x, z, rotY);
        case 'foodStore': return this.buildFoodStore(x, z, rotY);
        case 'campfire': return this.buildCampfire(x, z, rotY);
        case 'tent': return this.buildTent(x, z, rotY);
        case 'spikes': return this.buildSpikes(x, z, rotY);
        case 'trench': return this.buildTrench(x, z, rotY);
        case 'fence': return this.buildFence(x, z, rotY);
        case 'archery': return this.buildArcheryRange(x, z, rotY);
        case 'smallHut': return this.buildSmallHut(x, z, rotY);
        case 'palisadeSouth': return this.buildSouthPalisadeGate(x, z, rotY);
        case 'watchtower': return this.buildTimberWatchtower(x, z, rotY);
        case 'barracks': return this.buildWarriorBarracks(x, z, rotY);
        case 'riverDock': return this.buildRiverDock(x, z, rotY);
        case 'motteMound': return this.buildMotteMound(x, z, rotY);
        default:
          console.warn('Unknown structure type:', type);
          return null;
      }
    }

    // Builders for Player-Placed Storage Depots:
    buildWoodStore(x, z, rotY = 0) {
      const mesh = this.createTimberStockpileMesh();
      this.addPropWithObstacle(mesh, x, z, 2.6, 2.0, rotY);

      const dropZone = ZoneManager.createGroundZoneRing(
        this.scene, 2.4, 0x92400e, "WOOD STORE", "Drop-Off Timber", { noFloorRings: true, showLabel: false, yOffset: 0.04 }
      );
      this.setZoneAtTerrain(dropZone, x, z);
      dropZone.type = 'dropoff_timber';
      this.stockpiles.push(dropZone);
      this.stations.push(dropZone);
      return mesh;
    }

    buildRockStore(x, z, rotY = 0) {
      const mesh = this.createStoneStockpileMesh();
      this.addPropWithObstacle(mesh, x, z, 2.4, 2.0, rotY);

      const dropZone = ZoneManager.createGroundZoneRing(
        this.scene, 2.4, 0xd97706, "ROCK STORE", "Drop-Off Sandstone", { noFloorRings: true, showLabel: false, yOffset: 0.04 }
      );
      this.setZoneAtTerrain(dropZone, x, z);
      dropZone.type = 'dropoff_stone';
      this.stockpiles.push(dropZone);
      this.stations.push(dropZone);
      return mesh;
    }

    buildFoodStore(x, z, rotY = 0) {
      const mesh = this.createFoodStoreModel();
      this.addPropWithObstacle(mesh, x, z, 2.4, 2.4, rotY);

      const foodZone = ZoneManager.createGroundZoneRing(
        this.scene, 2.4, 0xeab308, "FOOD STORE", "Grain & Game", { noFloorRings: true, showLabel: false, yOffset: 0.04 }
      );
      this.setZoneAtTerrain(foodZone, x, z);
      foodZone.type = 'granary_rations';
      this.stations.push(foodZone);
      return mesh;
    }

    // 3D Elevated Anglo-Saxon Food Store & Granary Model
    createFoodStoreModel() {
      const group = new THREE.Group();

      const woodMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.88 });
      const stoneMat = new THREE.MeshStandardMaterial({ color: 0xa8a29e, roughness: 0.85 });
      const wattleMat = new THREE.MeshStandardMaterial({ color: 0x785535, roughness: 0.92 });
      const thatchMat = new THREE.MeshStandardMaterial({ color: 0xca8a04, roughness: 0.9 });
      const sackMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.85 });

      // 4 Stilt posts with rounded rodent-proof staddle stone caps
      [-0.8, 0.8].forEach(px => {
        [-0.8, 0.8].forEach(pz => {
          const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.7, 6), woodMat);
          post.position.set(px, 0.35, pz);
          post.castShadow = true;
          group.add(post);

          const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.12, 0.10, 8), stoneMat);
          cap.position.set(px, 0.72, pz);
          cap.castShadow = true;
          group.add(cap);
        });
      });

      // Elevated wooden platform
      const floor = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.12, 2.1), woodMat);
      floor.position.y = 0.82;
      floor.castShadow = true;
      floor.receiveShadow = true;
      group.add(floor);

      // Wattle and daub storage shed body
      const shed = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.1, 1.6), wattleMat);
      shed.position.set(0, 1.42, 0);
      shed.castShadow = true;
      group.add(shed);

      // Thatch pyramid / hipped roof
      const roof = new THREE.Mesh(new THREE.ConeGeometry(1.5, 1.1, 4), thatchMat);
      roof.rotation.y = Math.PI / 4;
      roof.position.set(0, 2.45, 0);
      roof.castShadow = true;
      group.add(roof);

      // Grain sacks on the porch platform
      [-0.45, 0.45].forEach(sx => {
        const sack = new THREE.Mesh(new THREE.DodecahedronGeometry(0.18), sackMat);
        sack.scale.set(1, 1.25, 0.9);
        sack.position.set(sx, 0.98, 0.75);
        sack.castShadow = true;
        group.add(sack);
      });

      // Small timber access ramp / ladder
      const ramp = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.06, 0.95), woodMat);
      ramp.position.set(0, 0.42, 1.25);
      ramp.rotation.x = 0.65;
      ramp.castShadow = true;
      group.add(ramp);

      return group;
    }

    initPlacedStructures() {
      if (window.state && Array.isArray(window.state.placedStructures)) {
        window.state.placedStructures.forEach(item => {
          this.placeStructure(item.type, item.x, item.z, item.rotY || 0);
        });
      }
    }

    initConstructionZones() {
      // Rebuild any structures previously placed freely by player
      this.initPlacedStructures();
    }

    updateBuildZonesVisibility() {
      // Kept for backward compatibility
    }

    // 4. Hiring Notice Boards & 3D Recruitment Posts for Workers & Archers
    createHiringPostModel(type) {
      const group = new THREE.Group();
      const woodMat = new THREE.MeshStandardMaterial({ color: 0x573c24, roughness: 0.85 });
      const signMat = new THREE.MeshStandardMaterial({ color: 0xd4a373, roughness: 0.7 });

      // Base post
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.10, 1.2, 6), woodMat);
      post.position.y = 0.6;
      post.castShadow = true;
      group.add(post);

      // Sign board
      const sign = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.40, 0.08), signMat);
      sign.position.set(0, 1.15, 0.06);
      sign.castShadow = true;
      group.add(sign);

      if (type === 'woodcutter') {
        // Chopping stump with axe
        const stump = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 0.45, 6), woodMat);
        stump.position.set(0.42, 0.22, 0);
        stump.castShadow = true;
        group.add(stump);

        const axeBlade = new THREE.Mesh(
          new THREE.BoxGeometry(0.18, 0.14, 0.04),
          new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 })
        );
        axeBlade.position.set(0.42, 0.48, 0);
        group.add(axeBlade);
      } else if (type === 'stonemason') {
        // Dressed stone block with pickaxe
        const block = new THREE.Mesh(
          new THREE.BoxGeometry(0.45, 0.35, 0.4),
          new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.9 })
        );
        block.position.set(0.45, 0.18, 0);
        block.castShadow = true;
        group.add(block);

        const pick = new THREE.Mesh(
          new THREE.BoxGeometry(0.28, 0.05, 0.05),
          new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8 })
        );
        pick.position.set(0.45, 0.40, 0);
        group.add(pick);
      } else if (type === 'archer') {
        // Straw target butt
        const target = new THREE.Mesh(
          new THREE.CylinderGeometry(0.32, 0.32, 0.12, 12),
          new THREE.MeshStandardMaterial({ color: 0xca8a04, roughness: 0.9 })
        );
        target.rotation.x = Math.PI / 2;
        target.position.set(0.45, 0.55, 0);
        target.castShadow = true;
        group.add(target);

        const bullseye = new THREE.Mesh(
          new THREE.CylinderGeometry(0.12, 0.12, 0.13, 10),
          new THREE.MeshStandardMaterial({ color: 0xb91c1c })
        );
        bullseye.rotation.x = Math.PI / 2;
        bullseye.position.set(0.45, 0.55, 0.01);
        group.add(bullseye);
      }

      return group;
    }

    initHiringRings() {
      const hires = [
        {
          id: 'woodcutter',
          name: 'HIRE WOODCUTTER',
          sub: '25 Silver (Auto-Chop)',
          costSilver: 25,
          type: 'woodcutter',
          pos: { x: -20.0, z: -6.0 },
          onHire: () => this.spawnWorkerNPC('woodcutter', -20, -8)
        },
        {
          id: 'stonemason',
          name: 'HIRE STONEMASON',
          sub: '35 Silver (Auto-Quarry)',
          costSilver: 35,
          type: 'stonemason',
          pos: { x: 20.0, z: -6.0 },
          onHire: () => this.spawnWorkerNPC('mason', 20, -8)
        }
      ];

      hires.forEach(h => {
        const ring = ZoneManager.createGroundZoneRing(
          this.scene, 1.4, 0xa855f7, h.name, h.sub, { noFloorRings: true, showLabel: false, yOffset: 0.04 }
        );
        this.setZoneAtTerrain(ring, h.pos.x, h.pos.z);
        ring.hireData = h;

        // Visual 3D prop so the player can see the recruitment spot
        const prop = this.createHiringPostModel(h.type);
        const py = window.WarwickTerrain ? window.WarwickTerrain.getTerrainHeight(h.pos.x, h.pos.z) : 0;
        prop.position.set(h.pos.x, py, h.pos.z);
        this.scene.add(prop);
        ring.propMesh = prop;

        if (window.state.workers[h.id]) {
          h.onHire();
          ring.group.visible = false;
          if (ring.propMesh) ring.propMesh.visible = false;
        }

        this.hireZones.push(ring);
      });
    }

    // Spawn an automated NPC worker
    spawnWorkerNPC(type, x, z) {
      const npc = ChibiSoldier.create(this.scene, type, 0.9);
      const ty = window.WarwickTerrain ? window.WarwickTerrain.getTerrainHeight(x, z) : 0;
      npc.root.position.set(x, ty, z);
      npc.workerType = type;
      npc.actionClock = 0;
      npc.chopClock = 0;
      npc.quarryClock = 0;
      npc.soundClock = 0;
      npc.targetTree = null;
      npc.targetRock = null;
      if (!window.activeWorkers) window.activeWorkers = [];
      window.activeWorkers.push(npc);
    }

    // Visual Builders for Constructed Castle Elements:

    // 1. Camp Fire Hearth
    createCampfireModel() {
      const camp = new THREE.Group();
      // Stone ring (circle of river rocks)
      const stoneMat = new THREE.MeshStandardMaterial({ color: 0x78716c, roughness: 0.9 });
      for (let i = 0; i < 8; i++) {
        const ang = (i / 8) * Math.PI * 2;
        const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.18 + (i % 2) * 0.04), stoneMat);
        rock.position.set(Math.cos(ang) * 0.7, 0.12, Math.sin(ang) * 0.7);
        rock.castShadow = true;
        camp.add(rock);
      }

      // Crossed charred logs
      const logMat = new THREE.MeshStandardMaterial({ color: 0x271e16, roughness: 0.95 });
      for (let i = 0; i < 3; i++) {
        const log = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 1.1, 6), logMat);
        log.rotation.z = Math.PI / 3;
        log.rotation.y = (i * Math.PI) / 3;
        log.position.y = 0.22;
        log.castShadow = true;
        camp.add(log);
      }

      // Glowing campfire embers
      const emberMat = new THREE.MeshStandardMaterial({
        color: 0xef4444,
        emissive: 0xf97316,
        emissiveIntensity: 1.2
      });
      const embers = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), emberMat);
      embers.position.y = 0.22;
      embers.scale.set(1.1, 0.6, 1.1);
      camp.add(embers);

      // Flickering fire light
      const fireLight = new THREE.PointLight(0xf97316, 1.5, 9);
      fireLight.position.set(0, 0.8, 0);
      camp.add(fireLight);

      // Wooden log seat / stool
      const seat = new THREE.Mesh(
        new THREE.CylinderGeometry(0.24, 0.26, 0.45, 8),
        new THREE.MeshStandardMaterial({ color: 0x5c3d2e, roughness: 0.85 })
      );
      seat.position.set(1.1, 0.22, 0.4);
      seat.castShadow = true;
      camp.add(seat);

      // Iron cooking spit & pot
      const spitMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, metalness: 0.8 });
      [-0.55, 0.55].forEach(sx => {
        const stake = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.9, 4), spitMat);
        stake.position.set(sx, 0.45, 0);
        camp.add(stake);
      });
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 1.2, 4), spitMat);
      bar.rotation.z = Math.PI / 2;
      bar.position.set(0, 0.82, 0);
      camp.add(bar);

      const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.14, 0.24, 8), spitMat);
      pot.position.set(0, 0.62, 0);
      camp.add(pot);

      return camp;
    }

    buildCampfire(x, z, rotY = 0) {
      const camp = this.createCampfireModel();
      return this.addPropWithObstacle(camp, x, z, 1.8, 1.8, rotY);
    }

    // 2. Singular Command Tent
    createTentModel() {
      const tentGroup = new THREE.Group();
      const timberMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.85 });
      const canvasMat = new THREE.MeshStandardMaterial({ color: 0xf1e8d4, roughness: 0.85, side: THREE.DoubleSide });
      const trimMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8, side: THREE.DoubleSide });
      const ropeMat = new THREE.MeshStandardMaterial({ color: 0xb89b6a, roughness: 0.95 });
      const L = 3.0; // tent length (z)
      const hw = 1.35; // half width
      const H = 2.1;  // ridge height

      // Canvas A-frame prism (extruded triangle along Z)
      const tri = new THREE.Shape();
      tri.moveTo(-hw, 0);
      tri.lineTo(hw, 0);
      tri.lineTo(0, H);
      tri.lineTo(-hw, 0);
      const prismGeo = new THREE.ExtrudeGeometry(tri, { depth: L, bevelEnabled: false });
      prismGeo.translate(0, 0, -L / 2);
      const prism = new THREE.Mesh(prismGeo, canvasMat);
      prism.castShadow = true;
      prism.receiveShadow = true;
      tentGroup.add(prism);

      // Coloured Mercian trim skirt along both bottom edges and ridge
      [-1, 1].forEach(s => {
        const skirt = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.32, L + 0.04), trimMat);
        skirt.position.set(s * (hw - 0.09), 0.16, 0);
        skirt.rotation.z = s * -0.0;
        tentGroup.add(skirt);
      });

      // Dark interior opening at the front with pulled-back door flaps
      const doorW = 0.9, doorH = 1.35;
      const doorShape = new THREE.Shape();
      doorShape.moveTo(-doorW / 2, 0);
      doorShape.lineTo(doorW / 2, 0);
      doorShape.lineTo(0, doorH);
      doorShape.lineTo(-doorW / 2, 0);
      const door = new THREE.Mesh(
        new THREE.ShapeGeometry(doorShape),
        new THREE.MeshStandardMaterial({ color: 0x1c1410, roughness: 1.0, side: THREE.DoubleSide })
      );
      door.position.set(0, 0.02, L / 2 + 0.012);
      tentGroup.add(door);

      [-1, 1].forEach(s => {
        const flap = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.3, 0.55), canvasMat);
        flap.position.set(s * 0.72, 0.68, L / 2 + 0.2);
        flap.rotation.set(0, s * 0.55, s * 0.12);
        flap.castShadow = true;
        tentGroup.add(flap);
      });

      // Ridge pole with finials, front & rear uprights
      const ridge = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, L + 0.9, 6), timberMat);
      ridge.rotation.x = Math.PI / 2;
      ridge.position.set(0, H + 0.02, 0);
      tentGroup.add(ridge);
      [-1, 1].forEach(s => {
        const upright = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, H, 6), timberMat);
        upright.position.set(0, H / 2, s * (L / 2 + 0.42));
        upright.castShadow = true;
        tentGroup.add(upright);
        const finial = new THREE.Mesh(
          new THREE.SphereGeometry(0.08, 8, 8),
          new THREE.MeshStandardMaterial({ color: 0xd4a017, metalness: 0.6, roughness: 0.4 })
        );
        finial.position.set(0, H + 0.04, s * (L / 2 + 0.42));
        tentGroup.add(finial);
      });

      // Mercian pennant flying from the front peak
      const bannerPole = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 1.1, 6), timberMat);
      bannerPole.position.set(0, H + 0.6, -L / 2 - 0.42);
      tentGroup.add(bannerPole);
      const pennantShape = new THREE.Shape();
      pennantShape.moveTo(0, 0);
      pennantShape.lineTo(0.85, 0.17);
      pennantShape.lineTo(0, 0.38);
      pennantShape.lineTo(0, 0);
      const pennant = new THREE.Mesh(
        new THREE.ShapeGeometry(pennantShape),
        new THREE.MeshStandardMaterial({ color: 0x15803d, side: THREE.DoubleSide })
      );
      pennant.position.set(0.02, H + 0.75, -L / 2 - 0.42);
      pennant.rotation.y = Math.PI / 2;
      tentGroup.add(pennant);

      // Guy ropes with pegs at each corner
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => {
        const px = sx * (hw + 0.75);
        const pz = sz * (L / 2 + 0.55);
        const peg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.3, 5), timberMat);
        peg.position.set(px, 0.12, pz);
        peg.rotation.z = sx * -0.4;
        tentGroup.add(peg);

        const from = new THREE.Vector3(sx * (hw - 0.05), 0.45, sz * (L / 2 - 0.1));
        const to = new THREE.Vector3(px, 0.2, pz);
        const len = from.distanceTo(to);
        const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, len, 4), ropeMat);
        rope.position.copy(from).lerp(to, 0.5);
        rope.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), to.clone().sub(from).normalize());
        tentGroup.add(rope);
      });

      // Camp chest with iron bands
      const chest = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 0.42, 0.45),
        new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.7 })
      );
      chest.position.set(1.65, 0.21, 0.9);
      chest.rotation.y = -0.3;
      chest.castShadow = true;
      tentGroup.add(chest);
      const lid = new THREE.Mesh(
        new THREE.CylinderGeometry(0.225, 0.225, 0.7, 10, 1, false, 0, Math.PI),
        new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.7 })
      );
      lid.rotation.set(0, -0.3, Math.PI / 2);
      lid.position.set(1.65, 0.42, 0.9);
      tentGroup.add(lid);

      // Water barrel
      const barrel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.28, 0.24, 0.6, 10),
        new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.8 })
      );
      barrel.position.set(-1.7, 0.3, 0.7);
      barrel.castShadow = true;
      tentGroup.add(barrel);
      [0.15, 0.45].forEach(by => {
        const hoop = new THREE.Mesh(
          new THREE.TorusGeometry(0.265, 0.018, 5, 14),
          new THREE.MeshStandardMaterial({ color: 0x374151, metalness: 0.5, roughness: 0.5 })
        );
        hoop.rotation.x = Math.PI / 2;
        hoop.position.set(-1.7, by, 0.7);
        tentGroup.add(hoop);
      });

      // Shield & spear stand beside the door
      const shield = new THREE.Mesh(
        new THREE.CylinderGeometry(0.34, 0.34, 0.05, 14),
        new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.6 })
      );
      shield.rotation.x = Math.PI / 2 - 0.25;
      shield.position.set(-1.45, 0.55, L / 2 + 0.55);
      shield.castShadow = true;
      tentGroup.add(shield);
      const boss = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0x9ca3af, metalness: 0.7, roughness: 0.35 })
      );
      boss.position.set(-1.45, 0.58, L / 2 + 0.6);
      tentGroup.add(boss);
      const spear = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 2.0, 5), timberMat);
      spear.position.set(-1.1, 1.0, L / 2 + 0.5);
      spear.rotation.z = -0.08;
      tentGroup.add(spear);
      const spearTip = new THREE.Mesh(
        new THREE.ConeGeometry(0.05, 0.22, 5),
        new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.8, roughness: 0.3 })
      );
      spearTip.position.set(-1.1 - 0.08 * 1.0, 2.1, L / 2 + 0.5);
      tentGroup.add(spearTip);

      // Hanging lantern glow at the entrance
      const lantern = new THREE.Mesh(
        new THREE.SphereGeometry(0.09, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xf59e0b, emissiveIntensity: 1.2 })
      );
      lantern.position.set(0.7, 1.55, L / 2 + 0.42);
      tentGroup.add(lantern);

      return tentGroup;
    }

    buildTent(x, z, rotY = 0) {
      const tentGroup = this.createTentModel();
      return this.addPropWithObstacle(tentGroup, x, z, 3.2, 3.4, rotY);
    }

    // 3. Defensive Wooden Spikes (Sharpened stakes)
    createSpikesModel() {
      const spikesGroup = new THREE.Group();
      const woodMat = new THREE.MeshStandardMaterial({ color: 0x7c4a21, roughness: 0.9 });
      const darkWoodMat = new THREE.MeshStandardMaterial({ color: 0x4a2a12, roughness: 0.9 });
      const charMat = new THREE.MeshStandardMaterial({ color: 0x2b1a0e, roughness: 0.95 });
      const ropeMat = new THREE.MeshStandardMaterial({ color: 0xb89b6a, roughness: 0.95 });
      const dirtMat = new THREE.MeshStandardMaterial({ color: 0x5b4330, roughness: 1.0 });

      // Earth mound packed around the base
      const mound = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), dirtMat);
      mound.scale.set(2.3, 0.22, 0.75);
      mound.receiveShadow = true;
      spikesGroup.add(mound);

      // Sharpened stake with charred tip, tilted towards attackers (+Z)
      const makeStake = (x, z, tiltX, tiltZ, h) => {
        const stake = new THREE.Group();
        const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, h, 6), woodMat);
        shaft.position.y = h / 2;
        shaft.castShadow = true;
        stake.add(shaft);
        const tip = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.4, 6), charMat);
        tip.position.y = h + 0.18;
        tip.castShadow = true;
        stake.add(tip);
        stake.position.set(x, 0.05, z);
        stake.rotation.set(tiltX, 0, tiltZ);
        spikesGroup.add(stake);
      };

      // Front row angled hard forward, 8 stakes with varied heights
      for (let i = 0; i < 8; i++) {
        const x = -1.9 + i * 0.54;
        const h = 1.0 + ((i * 37) % 5) * 0.06;
        makeStake(x, 0.3, 0.62 + ((i * 13) % 3) * 0.04, ((i % 3) - 1) * 0.05, h);
      }
      // Back row leaning the other way so stakes form crossing pairs
      for (let i = 0; i < 7; i++) {
        const x = -1.63 + i * 0.54;
        makeStake(x, -0.3, -0.5, ((i % 2) ? 0.06 : -0.06), 1.05);
      }

      // Horizontal binding beams front and back, lashed with rope
      [[0.12, 0.38], [-0.1, -0.22]].forEach(([bz, by]) => {
        const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 4.4, 6), darkWoodMat);
        beam.rotation.z = Math.PI / 2;
        beam.position.set(0, by + 0.18, bz);
        beam.castShadow = true;
        spikesGroup.add(beam);
      });
      for (let i = 0; i < 8; i++) {
        const lash = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.02, 4, 8), ropeMat);
        lash.position.set(-1.9 + i * 0.54, 0.62, 0.17);
        lash.rotation.x = Math.PI / 2 - 0.5;
        spikesGroup.add(lash);
      }

      // Cross braces (X frames) at the ends and middle
      [-2.0, 0, 2.0].forEach(x => {
        [-0.6, 0.6].forEach(rz => {
          const brace = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.5, 5), darkWoodMat);
          brace.position.set(x, 0.55, 0);
          brace.rotation.x = rz;
          brace.rotation.z = 0;
          brace.castShadow = true;
          spikesGroup.add(brace);
        });
      });

      return spikesGroup;
    }

    buildSpikes(x, z, rotY = 0) {
      const spikesGroup = this.createSpikesModel();
      return this.addPropWithObstacle(spikesGroup, x, z, 4.2, 1.4, rotY);
    }

    // 4. Dry Trench & Earthwork Berm
    createTrenchModel() {
      const trenchGroup = new THREE.Group();
      const dirtMat = new THREE.MeshStandardMaterial({ color: 0x6b4f35, roughness: 1.0 });
      const darkDirtMat = new THREE.MeshStandardMaterial({ color: 0x4a3524, roughness: 1.0 });
      const mudMat = new THREE.MeshStandardMaterial({ color: 0x2b2018, roughness: 0.45, metalness: 0.1 });

      // Trampled dirt ground patch so the trench reads as cut into the earth
      const patch = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.04, 2.0), dirtMat);
      patch.position.y = 0.02;
      patch.receiveShadow = true;
      trenchGroup.add(patch);

      // Raised dirt lips along both long sides and the ends
      [-0.82, 0.82].forEach(lz => {
        const lip = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), dirtMat);
        lip.scale.set(2.25, 0.22, 0.3);
        lip.position.set(0, 0.03, lz);
        lip.castShadow = true;
        lip.receiveShadow = true;
        trenchGroup.add(lip);
      });
      [-2.0, 2.0].forEach(ex => {
        const endLip = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), dirtMat);
        endLip.scale.set(0.35, 0.2, 0.85);
        endLip.position.set(ex, 0.03, 0);
        endLip.receiveShadow = true;
        trenchGroup.add(endLip);
      });

      // Sloped inner walls dropping down to the trench floor
      [-1, 1].forEach(side => {
        const wall = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.04, 0.5), darkDirtMat);
        wall.position.set(0, 0.1, side * 0.5);
        wall.rotation.x = side * -0.7;
        wall.receiveShadow = true;
        trenchGroup.add(wall);
      });

      // Wet mud at the bottom with a couple of glossy puddles
      const mud = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.03, 0.62), mudMat);
      mud.position.set(0, 0.045, 0);
      mud.receiveShadow = true;
      trenchGroup.add(mud);
      const puddleMat = new THREE.MeshStandardMaterial({ color: 0x4a6478, roughness: 0.1, metalness: 0.35, transparent: true, opacity: 0.8 });
      [[-1.1, 0.5], [0.9, 0.38]].forEach(([px, pw]) => {
        const puddle = new THREE.Mesh(new THREE.CircleGeometry(0.3, 14), puddleMat);
        puddle.rotation.x = -Math.PI / 2;
        puddle.scale.set(pw * 2.4, pw, 1);
        puddle.position.set(px, 0.065, 0);
        trenchGroup.add(puddle);
      });

      return trenchGroup;
    }

    buildTrench(x, z, rotY = 0) {
      const trenchGroup = this.createTrenchModel();
      return this.addPropWithObstacle(trenchGroup, x, z, 4.5, 2.0, rotY);
    }

    // 5. Timber Palisade Fence Line
    createFenceModel() {
      const fenceGroup = new THREE.Group();
      const woodMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.85 });

      // 4 upright timber posts
      for (let i = -1.5; i <= 1.5; i++) {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 1.8, 6), woodMat);
        post.position.set(i * 1.2, 0.9, 0);
        post.castShadow = true;
        fenceGroup.add(post);
      }

      // 3 horizontal split-log rails
      [0.4, 0.9, 1.4].forEach(ry => {
        const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 4.2, 6), woodMat);
        rail.rotation.z = Math.PI / 2;
        rail.position.set(0, ry, 0);
        fenceGroup.add(rail);
      });

      return fenceGroup;
    }

    buildFence(x, z, rotY = 0) {
      const fenceGroup = this.createFenceModel();
      return this.addPropWithObstacle(fenceGroup, x, z, 4.4, 1.0, rotY);
    }

    // 6. Archery Practice Range
    createArcheryRangeModel() {
      const rangeGroup = new THREE.Group();
      const strawMat = new THREE.MeshStandardMaterial({ color: 0xca8a04, roughness: 0.9 });
      const frameMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.85 });

      // 2 Round straw archery butts
      [-1.1, 1.1].forEach(tx => {
        // Tripod legs
        [-0.3, 0.3].forEach(lx => {
          const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.6, 4), frameMat);
          leg.position.set(tx + lx, 0.8, -0.15);
          leg.rotation.z = lx > 0 ? -0.2 : 0.2;
          leg.rotation.x = -0.2;
          rangeGroup.add(leg);
        });
        const backLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.6, 4), frameMat);
        backLeg.position.set(tx, 0.8, -0.4);
        backLeg.rotation.x = 0.3;
        rangeGroup.add(backLeg);

        // Round straw target face
        const target = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.16, 16), strawMat);
        target.rotation.x = Math.PI / 2;
        target.position.set(tx, 1.1, 0);
        target.castShadow = true;
        rangeGroup.add(target);

        // Painted red bullseye ring
        const bullseye = new THREE.Mesh(
          new THREE.CylinderGeometry(0.2, 0.2, 0.17, 12),
          new THREE.MeshStandardMaterial({ color: 0xb91c1c })
        );
        bullseye.rotation.x = Math.PI / 2;
        bullseye.position.set(tx, 1.1, 0.01);
        rangeGroup.add(bullseye);
      });

      // Wooden bow rack with 2 bows
      const rack = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.9, 0.35), frameMat);
      rack.position.set(0, 0.45, 1.2);
      rack.castShadow = true;
      rangeGroup.add(rack);

      return rangeGroup;
    }

    buildArcheryRange(x, z, rotY = 0) {
      const rangeGroup = this.createArcheryRangeModel();
      const mesh = this.addPropWithObstacle(rangeGroup, x, z, 3.4, 2.2, rotY);

      // Create / attach Archer Recruitment zone directly at this placed shooting range!
      // In front of the archery butts & bow rack
      const hireX = Number((x + Math.sin(rotY) * 1.6).toFixed(2));
      const hireZ = Number((z + Math.cos(rotY) * 1.6).toFixed(2));

      // Remove any previous archer hire zone to prevent duplicate zones
      this.hireZones = this.hireZones.filter(hz => {
        if (hz.hireData && hz.hireData.id === 'archer') {
          this.scene.remove(hz.group);
          if (hz.propMesh) this.scene.remove(hz.propMesh);
          return false;
        }
        return true;
      });

      const ring = ZoneManager.createGroundZoneRing(
        this.scene, 1.6, 0xa855f7, "RECRUIT ARCHER", "15 Silver (Bowman)", { noFloorRings: true, showLabel: false, yOffset: 0.04 }
      );
      this.setZoneAtTerrain(ring, hireX, hireZ);

      ring.hireData = {
        id: 'archer',
        name: 'RECRUIT ARCHER',
        sub: '15 Silver (Bowman)',
        costSilver: 15,
        type: 'archer',
        repeatable: true,
        maxHires: 4,
        requiresBuilding: 'archery',
        pos: { x: hireX, z: hireZ },
        rangePos: { x, z },
        onHire: () => {
          if (window.raidManager) {
            window.raidManager.spawnGarrisonArcher(hireX, hireZ);
          }
        }
      };

      // Check current archer count vs max
      const currentArchers = (window.state && window.state.garrison) ? (window.state.garrison.archers || 0) : 0;
      if (currentArchers >= ring.hireData.maxHires) {
        ring.group.visible = false;
      }

      this.hireZones.push(ring);
      return mesh;
    }

    // 7. Small Saxon Living Hut (+2 beds)
    createSmallHutModel() {
      const hutGroup = new THREE.Group();

      // Wattle-and-daub timber walls
      const walls = new THREE.Mesh(
        new THREE.BoxGeometry(3.2, 1.8, 2.6),
        new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.85 })
      );
      walls.position.y = 0.9;
      walls.castShadow = true;
      walls.receiveShadow = true;
      hutGroup.add(walls);

      // Thatched gabled roof
      const roof = new THREE.Mesh(
        new THREE.ConeGeometry(2.8, 1.4, 4),
        new THREE.MeshStandardMaterial({ color: 0xca8a04, roughness: 0.9 })
      );
      roof.scale.set(1.1, 1.0, 0.95);
      roof.rotation.y = Math.PI / 4;
      roof.position.y = 2.3;
      roof.castShadow = true;
      hutGroup.add(roof);

      // Low timber door
      const door = new THREE.Mesh(
        new THREE.BoxGeometry(0.75, 1.3, 0.15),
        new THREE.MeshStandardMaterial({ color: 0x271e16 })
      );
      door.position.set(0, 0.65, 1.32);
      hutGroup.add(door);

      return hutGroup;
    }

    buildSmallHut(x, z, rotY = 0) {
      const hutGroup = this.createSmallHutModel();
      return this.addPropWithObstacle(hutGroup, x, z, 3.6, 3.0, rotY);
    }

    // 8. South Gatehouse & Timber Palisade
    createSouthPalisadeGateModel() {
      const gateGroup = new THREE.Group();
      // Two massive log gateposts
      [-1.8, 1.8].forEach(px => {
        const post = new THREE.Mesh(
          new THREE.CylinderGeometry(0.4, 0.45, 4.0, 10),
          new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 })
        );
        post.position.set(px, 2.0, 0);
        post.castShadow = true;
        gateGroup.add(post);
      });

      // Cross lintel beam
      const lintel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.35, 4.2, 8),
        new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.7 })
      );
      lintel.rotation.z = Math.PI / 2;
      lintel.position.set(0, 3.8, 0);
      lintel.castShadow = true;
      gateGroup.add(lintel);

      // Wooden palisade wall wings extending outwards
      [-3.5, 3.5].forEach(wx => {
        for (let i = 0; i < 4; i++) {
          const log = new THREE.Mesh(
            new THREE.CylinderGeometry(0.24, 0.28, 3.2, 8),
            new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.85 })
          );
          const offset = (wx > 0 ? 1 : -1) * (1.8 + i * 0.52);
          log.position.set(offset, 1.6, 0);
          log.castShadow = true;
          gateGroup.add(log);
        }
      });

      // Mercian Banner flying above gate
      const bannerPole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 2.0, 6),
        new THREE.MeshStandardMaterial({ color: 0x451a03 })
      );
      bannerPole.position.set(0, 4.8, 0);
      const flag = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 0.7, 0.04),
        new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.5 })
      );
      flag.position.set(0.6, 4.8, 0);
      gateGroup.add(bannerPole);
      gateGroup.add(flag);

      return gateGroup;
    }

    buildSouthPalisadeGate(x, z, rotY = 0) {
      const gateGroup = this.createSouthPalisadeGateModel();
      return this.addPropWithObstacle(gateGroup, x, z, 7.5, 1.2, rotY);
    }

    buildRiverPalisade(x, z, rotY = 0) {
      const palGroup = new THREE.Group();
      for (let i = -5; i <= 5; i++) {
        const log = new THREE.Mesh(
          new THREE.CylinderGeometry(0.25, 0.28, 3.0, 8),
          new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 })
        );
        log.position.set(0, 1.5, i * 0.55);
        log.castShadow = true;
        palGroup.add(log);
      }
      return this.addPropWithObstacle(palGroup, x, z, 1.2, 6.2, rotY);
    }

    buildEastPalisade(x, z, rotY = 0) {
      const palGroup = new THREE.Group();
      for (let i = -5; i <= 5; i++) {
        const log = new THREE.Mesh(
          new THREE.CylinderGeometry(0.25, 0.28, 3.0, 8),
          new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 })
        );
        log.position.set(0, 1.5, i * 0.55);
        log.castShadow = true;
        palGroup.add(log);
      }
      return this.addPropWithObstacle(palGroup, x, z, 1.2, 6.2, rotY);
    }

    // 9. Timber Watchtower
    createTimberWatchtowerModel() {
      const tower = new THREE.Group();
      // 4 heavy timber stilts
      const stiltOffsets = [
        [-1, -1], [1, -1], [-1, 1], [1, 1]
      ];
      stiltOffsets.forEach(([sx, sz]) => {
        const leg = new THREE.Mesh(
          new THREE.CylinderGeometry(0.22, 0.26, 5.0, 8),
          new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 })
        );
        leg.position.set(sx, 2.5, sz);
        leg.castShadow = true;
        tower.add(leg);
      });

      // Upper platform
      const deck = new THREE.Mesh(
        new THREE.BoxGeometry(2.8, 0.3, 2.8),
        new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.7 })
      );
      deck.position.y = 5.0;
      tower.add(deck);

      // Guardrail parapet
      const rail = new THREE.Mesh(
        new THREE.BoxGeometry(2.8, 1.0, 2.8),
        new THREE.MeshStandardMaterial({ color: 0x78350f, wireframe: false, roughness: 0.8 })
      );
      rail.position.y = 5.6;
      tower.add(rail);

      // Thatched canopy roof
      const roof = new THREE.Mesh(
        new THREE.ConeGeometry(2.4, 1.6, 4),
        new THREE.MeshStandardMaterial({ color: 0xca8a04, roughness: 0.9 })
      );
      roof.rotation.y = Math.PI / 4;
      roof.position.y = 7.0;
      roof.castShadow = true;
      tower.add(roof);

      return tower;
    }

    buildTimberWatchtower(x, z, rotY = 0) {
      const tower = this.createTimberWatchtowerModel();
      return this.addPropWithObstacle(tower, x, z, 3.2, 3.2, rotY);
    }

    // 10. River Avon Dock
    createRiverDockModel() {
      const dock = new THREE.Group();
      // Timber pier platform into Avon
      const pier = new THREE.Mesh(
        new THREE.BoxGeometry(4.0, 0.3, 2.5),
        new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.7 })
      );
      pier.position.y = 0.25;
      dock.add(pier);

      // Moored Saxon river skiff
      const skiff = new THREE.Mesh(
        new THREE.CylinderGeometry(0.8, 0.6, 3.2, 8),
        new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 })
      );
      skiff.scale.set(0.6, 0.4, 1);
      skiff.rotation.x = Math.PI / 2;
      skiff.position.set(0, 0.2, 2.2);
      dock.add(skiff);

      return dock;
    }

    buildRiverDock(x, z, rotY = 0) {
      const dock = this.createRiverDockModel();
      return this.addPropWithObstacle(dock, x, z, 4.4, 3.5, rotY);
    }

    // 11. Great Earthen Motte Mound
    createMotteMoundModel() {
      const mound = new THREE.Group();
      // Earthen stepped mound
      const baseMound = new THREE.Mesh(
        new THREE.CylinderGeometry(5.0, 7.0, 2.5, 16),
        new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.9 })
      );
      baseMound.position.y = 1.25;
      baseMound.receiveShadow = true;
      baseMound.castShadow = true;
      mound.add(baseMound);

      // Upper tier
      const topMound = new THREE.Mesh(
        new THREE.CylinderGeometry(3.5, 5.0, 2.0, 16),
        new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.9 })
      );
      topMound.position.y = 3.25;
      topMound.castShadow = true;
      mound.add(topMound);

      return mound;
    }

    buildMotteMound(x, z, rotY = 0) {
      const mound = this.createMotteMoundModel();
      return this.addPropWithObstacle(mound, x, z, 7.5, 7.5, rotY);
    }

    // 12. Warrior Barracks Hall
    createWarriorBarracksModel() {
      const barracksGroup = new THREE.Group();
      // Main hall building (timber and wattle)
      const walls = new THREE.Mesh(
        new THREE.BoxGeometry(4.2, 2.2, 3.2),
        new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.8 })
      );
      walls.position.y = 1.1;
      walls.castShadow = true;
      walls.receiveShadow = true;
      barracksGroup.add(walls);

      // Thatched gabled roof
      const roof = new THREE.Mesh(
        new THREE.ConeGeometry(3.6, 1.8, 4),
        new THREE.MeshStandardMaterial({ color: 0xca8a04, roughness: 0.9 })
      );
      roof.scale.set(1.2, 1, 1.0);
      roof.rotation.y = Math.PI / 4;
      roof.position.y = 2.9;
      roof.castShadow = true;
      barracksGroup.add(roof);

      // Doorway
      const door = new THREE.Mesh(
        new THREE.BoxGeometry(1.0, 1.6, 0.2),
        new THREE.MeshStandardMaterial({ color: 0x291e13, roughness: 0.9 })
      );
      door.position.set(0, 0.8, 1.65);
      barracksGroup.add(door);

      // Two warrior shields mounted on front facade
      [-1.2, 1.2].forEach((sx, idx) => {
        const shield = new THREE.Mesh(
          new THREE.CylinderGeometry(0.38, 0.38, 0.08, 14),
          new THREE.MeshStandardMaterial({ color: idx === 0 ? 0x15803d : 0xb91c1c, roughness: 0.5 })
        );
        shield.rotation.x = Math.PI / 2;
        shield.position.set(sx, 1.4, 1.65);
        barracksGroup.add(shield);
      });

      return barracksGroup;
    }

    buildWarriorBarracks(x, z, rotY = 0) {
      const barracksGroup = this.createWarriorBarracksModel();
      return this.addPropWithObstacle(barracksGroup, x, z, 4.6, 3.6, rotY);
    }

    // Oak Trees
    createOakTrees(x, z) {
      const tree = new THREE.Group();
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.5, 2.4, 8),
        new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9 })
      );
      trunk.position.y = 1.2;
      trunk.castShadow = true;
      tree.add(trunk);

      const foliage = new THREE.Mesh(
        new THREE.DodecahedronGeometry(1.6),
        new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.8 })
      );
      foliage.position.y = 3.0;
      foliage.castShadow = true;
      tree.add(foliage);

      this.addPropWithObstacle(tree, x, z, 1.2, 1.2);
    }

    // Sandstone Rock Outcrop
    createSandstoneRocks(x, z) {
      const rockGroup = new THREE.Group();
      for (let i = 0; i < 3; i++) {
        const rock = new THREE.Mesh(
          new THREE.DodecahedronGeometry(0.8 + Math.random() * 0.4),
          new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.85 })
        );
        rock.position.set((i - 1) * 0.7, 0.6, (i % 2) * 0.4);
        rock.castShadow = true;
        rockGroup.add(rock);
      }
      this.addPropWithObstacle(rockGroup, x, z, 1.8, 1.4);
    }

    // 3D Timber Stockpile Model (Wooden Log Cradle)
    createTimberStockpileMesh() {
      const group = new THREE.Group();
      // Sawdust & tamped earth pad
      const pad = new THREE.Mesh(
        new THREE.BoxGeometry(2.6, 0.08, 2.0),
        new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.95 })
      );
      pad.position.y = 0.04;
      pad.receiveShadow = true;
      group.add(pad);

      // 4 heavy upright timber cradle posts
      [-1.1, 1.1].forEach(px => {
        [-0.8, 0.8].forEach(pz => {
          const post = new THREE.Mesh(
            new THREE.CylinderGeometry(0.1, 0.12, 1.4, 6),
            new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.85 })
          );
          post.position.set(px, 0.7, pz);
          post.castShadow = true;
          group.add(post);
        });
      });

      // Side timber rails
      [-0.8, 0.8].forEach(pz => {
        const rail = new THREE.Mesh(
          new THREE.CylinderGeometry(0.08, 0.08, 2.3, 6),
          new THREE.MeshStandardMaterial({ color: 0x5c3d2e, roughness: 0.8 })
        );
        rail.rotation.z = Math.PI / 2;
        rail.position.set(0, 0.35, pz);
        group.add(rail);
      });

      // Stacked cylindrical logs in cradle
      const logMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.75 });
      for (let row = 0; row < 3; row++) {
        for (let col = -1; col <= 1; col++) {
          const log = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 1.9, 8), logMat);
          log.rotation.z = Math.PI / 2;
          log.position.set(col * 0.34, 0.2 + row * 0.26, 0);
          log.castShadow = true;
          group.add(log);
        }
      }

      // Wooden drop-off signpost
      const signpost = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.05, 1.2, 6),
        new THREE.MeshStandardMaterial({ color: 0x451a03 })
      );
      signpost.position.set(1.4, 0.6, 0.8);
      group.add(signpost);

      const sign = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.45, 0.06),
        new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 })
      );
      sign.position.set(1.4, 1.0, 0.8);
      group.add(sign);

      return group;
    }

    // 3D Sandstone Stockpile Model (Masonry Plinth & Ashlar Blocks)
    createStoneStockpileMesh() {
      const group = new THREE.Group();
      // Sandstone slab base
      const pad = new THREE.Mesh(
        new THREE.BoxGeometry(2.4, 0.16, 2.0),
        new THREE.MeshStandardMaterial({ color: 0x78716c, roughness: 0.9 })
      );
      pad.position.y = 0.08;
      pad.receiveShadow = true;
      group.add(pad);

      // Stacked cut sandstone ashlar blocks
      const stoneMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.85 });
      [
        [-0.6, 0.28, -0.4], [0.0, 0.28, -0.4], [0.6, 0.28, -0.4],
        [-0.6, 0.28, 0.4], [0.0, 0.28, 0.4], [0.6, 0.28, 0.4],
        [-0.3, 0.58, -0.2], [0.3, 0.58, -0.2],
        [-0.3, 0.58, 0.2], [0.3, 0.58, 0.2],
        [0.0, 0.88, 0.0]
      ].forEach(([sx, sy, sz]) => {
        const block = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.5), stoneMat);
        block.position.set(sx, sy, sz);
        block.castShadow = true;
        group.add(block);
      });

      // Wooden drop-off signpost
      const signpost = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.05, 1.2, 6),
        new THREE.MeshStandardMaterial({ color: 0x451a03 })
      );
      signpost.position.set(-1.3, 0.6, 0.8);
      group.add(signpost);

      const sign = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.45, 0.06),
        new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 })
      );
      sign.position.set(-1.3, 1.0, 0.8);
      group.add(sign);

      return group;
    }
  }

  window.StationManager = StationManager;
})(window);

