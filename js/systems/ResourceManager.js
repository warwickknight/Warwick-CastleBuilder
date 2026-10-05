// Systems: Natural Resource Manager for WARWICK: Castle Builder
// Spawns 40+ interactive trees that become realistic cut stumps when chopped,
// and 20+ quarryable sandstone boulders across the entire landscape.
(function(window) {
  'use strict';

  class ResourceManager {
    constructor(scene, collisionSystem) {
      this.scene = scene;
      this.collision = collisionSystem;
      this.trees = [];
      this.rocks = [];
      this.activeTarget = null;
      this.harvestTimer = 0;
      this.soundTimer = 0;
      this.windClock = 0;

      // Shared reusable materials for graphical efficiency and rich medieval rendering
      this.barkMat = new THREE.MeshStandardMaterial({
        color: 0x3d2010,
        roughness: 0.92,
        metalness: 0.05
      });
      this.stumpTopMat = new THREE.MeshStandardMaterial({
        color: 0xd4a373, // Fresh-cut heartwood with annual growth ring tone
        roughness: 0.75,
        metalness: 0.02
      });
      this.leafMat1 = new THREE.MeshStandardMaterial({
        color: 0x14532d, // Deep English oak forest green
        roughness: 0.78,
        flatShading: true
      });
      this.leafMat2 = new THREE.MeshStandardMaterial({
        color: 0x15803d, // Lush mid-canopy foliage
        roughness: 0.75,
        flatShading: true
      });
      this.leafMat3 = new THREE.MeshStandardMaterial({
        color: 0x22c55e, // Sun-dappled canopy highlights
        roughness: 0.70,
        flatShading: true
      });
      this.sandstoneMat1 = new THREE.MeshStandardMaterial({
        color: 0xc26d2e, // Warm stratified Warwick sandstone
        roughness: 0.85,
        flatShading: true
      });
      this.sandstoneMat2 = new THREE.MeshStandardMaterial({
        color: 0xb45309, // Deep weathered ironstone layer
        roughness: 0.88,
        flatShading: true
      });
      this.rubbleMat = new THREE.MeshStandardMaterial({
        color: 0x9a3412, // Chipped quarry fragments & stone dust
        roughness: 0.95,
        flatShading: true
      });

      // --- E. Plant Life Shared Materials (Optimized for Mobile WebGL) ---
      this.plants = [];
      this.poppyMat = new THREE.MeshStandardMaterial({
        color: 0xdc2626, // English field poppy crimson
        roughness: 0.55,
        flatShading: true
      });
      this.buttercupMat = new THREE.MeshStandardMaterial({
        color: 0xfacc15, // Golden buttercup
        roughness: 0.5,
        flatShading: true
      });
      this.daisyMat = new THREE.MeshStandardMaterial({
        color: 0xf8fafc, // Field daisy pure white
        roughness: 0.6,
        flatShading: true
      });
      this.flowerStemMat = new THREE.MeshStandardMaterial({
        color: 0x3f6212, // Slender green stalk
        roughness: 0.8,
        flatShading: true
      });
      this.flowerCenterMat = new THREE.MeshStandardMaterial({
        color: 0x713f12, // Warm seed center
        roughness: 0.9,
        flatShading: true
      });
      this.fernMat = new THREE.MeshStandardMaterial({
        color: 0x166534, // Lush deep forest fern
        roughness: 0.72,
        flatShading: true
      });
      this.tallGrassMat = new THREE.MeshStandardMaterial({
        color: 0x65a30d, // Spring meadow grass blade
        roughness: 0.75,
        flatShading: true
      });
      this.heatherBushMat = new THREE.MeshStandardMaterial({
        color: 0x27431c, // Dense wild moorland shrub foliage
        roughness: 0.85,
        flatShading: true
      });
      this.heatherBlossomMat = new THREE.MeshStandardMaterial({
        color: 0xa855f7, // Rich purple English heather
        roughness: 0.6,
        flatShading: true
      });
      this.gorseBlossomMat = new THREE.MeshStandardMaterial({
        color: 0xfbbf24, // Bright yellow/gold gorse bloom
        roughness: 0.6,
        flatShading: true
      });
      this.reedStemMat = new THREE.MeshStandardMaterial({
        color: 0x4d7c0f, // River reed stalk
        roughness: 0.75,
        flatShading: true
      });
      this.cattailMat = new THREE.MeshStandardMaterial({
        color: 0x451a03, // Velvety dark brown bulrush spike
        roughness: 0.95,
        flatShading: true
      });
    }

    // 1. Procedural High-Quality Oak Tree Model
    createTreeModel(scale = 1.0, variation = 0) {
      const group = new THREE.Group();
      group.scale.set(scale, scale, scale);

      // --- A. Trunk & Canopy (Living Tree) ---
      const trunkGroup = new THREE.Group();
      const canopyGroup = new THREE.Group();

      // Root flares at the base (anchors trunk naturally into uneven terrain)
      for (let r = 0; r < 4; r++) {
        const rootAng = (r / 4) * Math.PI * 2 + variation * 0.4;
        const root = new THREE.Mesh(
          new THREE.CylinderGeometry(0.12, 0.28, 0.7, 5),
          this.barkMat
        );
        root.rotation.z = 0.42;
        root.rotation.y = rootAng;
        root.position.set(Math.cos(rootAng) * 0.42, 0.22, Math.sin(rootAng) * 0.42);
        root.castShadow = true;
        trunkGroup.add(root);
      }

      // Main weathered oak trunk
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.32, 0.48, 2.7, 8),
        this.barkMat
      );
      trunk.position.y = 1.35;
      trunk.castShadow = true;
      trunk.receiveShadow = true;
      trunkGroup.add(trunk);

      // Outward reaching boughs / branches
      const branch1 = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.18, 1.4, 5),
        this.barkMat
      );
      branch1.position.set(0.45, 2.2, 0.2);
      branch1.rotation.z = -0.65;
      branch1.castShadow = true;
      trunkGroup.add(branch1);

      const branch2 = new THREE.Mesh(
        new THREE.CylinderGeometry(0.10, 0.16, 1.2, 5),
        this.barkMat
      );
      branch2.position.set(-0.4, 2.3, -0.3);
      branch2.rotation.z = 0.58;
      branch2.castShadow = true;
      trunkGroup.add(branch2);

      // Lush 4-tier clustered canopy
      const f1 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.65), this.leafMat1);
      f1.position.set(0, 3.2, 0);
      f1.castShadow = true;
      canopyGroup.add(f1);

      const f2 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.35), this.leafMat2);
      f2.position.set(0.65, 3.5, 0.35);
      f2.castShadow = true;
      canopyGroup.add(f2);

      const f3 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.25), this.leafMat2);
      f3.position.set(-0.6, 3.4, -0.4);
      f3.castShadow = true;
      canopyGroup.add(f3);

      const f4 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.1), this.leafMat3);
      f4.position.set(0, 4.3, 0);
      f4.castShadow = true;
      canopyGroup.add(f4);

      group.add(trunkGroup);
      group.add(canopyGroup);

      // --- B. Cut Stump (Visible when tree is chopped) ---
      const stumpGroup = new THREE.Group();
      stumpGroup.visible = false; // Hidden until chopped

      // Short stump trunk cylinder
      const stumpCyl = new THREE.Mesh(
        new THREE.CylinderGeometry(0.42, 0.48, 0.42, 8),
        this.barkMat
      );
      stumpCyl.position.y = 0.21;
      stumpCyl.castShadow = true;
      stumpGroup.add(stumpCyl);

      // Flat fresh-cut heartwood top with growth rings
      const cutDisc = new THREE.Mesh(
        new THREE.CircleGeometry(0.41, 16),
        this.stumpTopMat
      );
      cutDisc.rotation.x = -Math.PI / 2;
      cutDisc.position.y = 0.425;
      stumpGroup.add(cutDisc);

      // Axe notch chip wedge on top edge
      const notch = new THREE.Mesh(
        new THREE.ConeGeometry(0.12, 0.22, 4),
        this.stumpTopMat
      );
      notch.rotation.z = Math.PI / 4;
      notch.position.set(0.32, 0.41, 0);
      stumpGroup.add(notch);

      // Woodchips scattered on the ground around the stump
      for (let c = 0; c < 5; c++) {
        const chipAng = (c / 5) * Math.PI * 2 + 0.3;
        const chipDist = 0.65 + (c % 3) * 0.25;
        const chip = new THREE.Mesh(
          new THREE.BoxGeometry(0.14, 0.04, 0.09),
          this.stumpTopMat
        );
        chip.position.set(Math.cos(chipAng) * chipDist, 0.03, Math.sin(chipAng) * chipDist);
        chip.rotation.y = chipAng * 1.5;
        stumpGroup.add(chip);
      }

      group.add(stumpGroup);

      return { group, trunkGroup, canopyGroup, stumpGroup };
    }

    // 2. Procedural High-Quality Sandstone Rock Formation
    createRockModel(scale = 1.0, variation = 0) {
      const group = new THREE.Group();
      group.scale.set(scale, scale, scale);

      // --- A. Boulders (Quarryable State) ---
      const boulderGroup = new THREE.Group();

      // Main dominant sandstone boulder
      const mainRock = new THREE.Mesh(
        new THREE.DodecahedronGeometry(1.0 + (variation % 3) * 0.15),
        this.sandstoneMat1
      );
      mainRock.position.set(0, 0.75, 0);
      mainRock.rotation.set(variation * 0.3, variation * 0.8, variation * 0.2);
      mainRock.castShadow = true;
      mainRock.receiveShadow = true;
      boulderGroup.add(mainRock);

      // Secondary flanking layered boulder
      const secRock = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.72),
        this.sandstoneMat2
      );
      secRock.position.set(0.75, 0.5, 0.3);
      secRock.rotation.set(0.4, 0.2, 0.8);
      secRock.castShadow = true;
      boulderGroup.add(secRock);

      // Smaller base boulder
      const baseRock = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.48),
        this.sandstoneMat1
      );
      baseRock.position.set(-0.65, 0.32, -0.4);
      baseRock.castShadow = true;
      boulderGroup.add(baseRock);

      group.add(boulderGroup);

      // --- B. Depleted Quarry Rubble (Visible when mined) ---
      const rubbleGroup = new THREE.Group();
      rubbleGroup.visible = false; // Hidden until quarried

      // Chipped stone slabs and flat fragmented tailings
      for (let s = 0; s < 5; s++) {
        const slabAng = (s / 5) * Math.PI * 2;
        const slabDist = 0.45 + (s % 3) * 0.25;
        const slab = new THREE.Mesh(
          new THREE.BoxGeometry(0.55 + (s % 2) * 0.2, 0.12, 0.45),
          this.rubbleMat
        );
        slab.position.set(Math.cos(slabAng) * slabDist, 0.06, Math.sin(slabAng) * slabDist);
        slab.rotation.set(Math.sin(s) * 0.15, slabAng, Math.cos(s) * 0.15);
        slab.castShadow = true;
        rubbleGroup.add(slab);
      }

      group.add(rubbleGroup);

      return { group, boulderGroup, rubbleGroup };
    }

    // 3. Plant Life Models (Low-poly, vibrant English flora)
    createWildflowerMesh(type = 'poppy', scale = 1.0, seed = 0) {
      const group = new THREE.Group();
      group.scale.set(scale, scale, scale);

      let petalMat = this.poppyMat;
      let centerMat = this.flowerCenterMat;
      let flowerCount = 4;
      if (type === 'buttercup') {
        petalMat = this.buttercupMat;
        flowerCount = 4;
      } else if (type === 'daisy') {
        petalMat = this.daisyMat;
        centerMat = this.buttercupMat;
        flowerCount = 5;
      }

      for (let i = 0; i < flowerCount; i++) {
        const ang = (i / flowerCount) * Math.PI * 2 + (seed + i) * 0.45;
        const dist = 0.08 + ((seed + i) % 3) * 0.05;
        const stemHeight = 0.28 + ((seed + i) % 4) * 0.06;

        const stem = new THREE.Mesh(
          new THREE.CylinderGeometry(0.012, 0.018, stemHeight, 4),
          this.flowerStemMat
        );
        stem.position.set(Math.cos(ang) * dist, stemHeight * 0.5, Math.sin(ang) * dist);
        stem.rotation.z = Math.cos(ang) * 0.15;
        stem.rotation.x = Math.sin(ang) * 0.15;
        group.add(stem);

        // Petals disc/cylinder
        const petals = new THREE.Mesh(
          new THREE.CylinderGeometry(type === 'poppy' ? 0.11 : (type === 'daisy' ? 0.10 : 0.08), 0.03, 0.03, 5),
          petalMat
        );
        petals.position.set(Math.cos(ang) * dist, stemHeight + 0.01, Math.sin(ang) * dist);
        petals.rotation.set(Math.sin(i) * 0.2, ang, Math.cos(i) * 0.2);
        group.add(petals);

        // Center eye
        const eye = new THREE.Mesh(
          new THREE.SphereGeometry(0.03, 4, 3),
          centerMat
        );
        eye.position.set(Math.cos(ang) * dist, stemHeight + 0.025, Math.sin(ang) * dist);
        group.add(eye);
      }

      return group;
    }

    createFernMesh(scale = 1.0, seed = 0) {
      const group = new THREE.Group();
      group.scale.set(scale, scale, scale);

      const frondCount = 6;
      for (let i = 0; i < frondCount; i++) {
        const ang = (i / frondCount) * Math.PI * 2 + (seed * 0.3);
        const frondLen = 0.55 + (i % 3) * 0.12;

        const frond = new THREE.Mesh(
          new THREE.BoxGeometry(0.12, 0.018, frondLen),
          this.fernMat
        );
        frond.position.set(Math.cos(ang) * (frondLen * 0.4), 0.12, Math.sin(ang) * (frondLen * 0.4));
        frond.rotation.y = -ang + Math.PI / 2;
        frond.rotation.x = 0.45;
        frond.rotation.z = (Math.sin(i) * 0.1);
        group.add(frond);
      }

      return group;
    }

    createGrassTuftMesh(scale = 1.0, seed = 0) {
      const group = new THREE.Group();
      group.scale.set(scale, scale, scale);

      const bladeCount = 6;
      for (let i = 0; i < bladeCount; i++) {
        const ang = (i / bladeCount) * Math.PI * 2 + (seed + i) * 0.35;
        const bladeH = 0.38 + ((seed + i) % 4) * 0.09;
        const blade = new THREE.Mesh(
          new THREE.ConeGeometry(0.035, bladeH, 3),
          this.tallGrassMat
        );
        blade.position.set(Math.cos(ang) * 0.08, bladeH * 0.48, Math.sin(ang) * 0.08);
        blade.rotation.z = Math.cos(ang) * 0.28;
        blade.rotation.x = Math.sin(ang) * 0.28;
        group.add(blade);
      }

      return group;
    }

    createHeatherBushMesh(type = 'heather', scale = 1.0, seed = 0) {
      const group = new THREE.Group();
      group.scale.set(scale, scale, scale);

      // Base leafy mound
      const mound = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.38, 1),
        this.heatherBushMat
      );
      mound.scale.set(1.2, 0.55, 1.1);
      mound.position.y = 0.18;
      group.add(mound);

      // Tiny blossom clusters
      const blossomMat = type === 'heather' ? this.heatherBlossomMat : this.gorseBlossomMat;
      const numBlooms = 8;
      for (let i = 0; i < numBlooms; i++) {
        const phi = (i / numBlooms) * Math.PI * 2 + (seed * 0.4);
        const rad = 0.24 + (i % 3) * 0.08;
        const bloom = new THREE.Mesh(
          new THREE.SphereGeometry(0.07, 4, 3),
          blossomMat
        );
        bloom.position.set(Math.cos(phi) * rad, 0.28 + (i % 2) * 0.06, Math.sin(phi) * rad);
        group.add(bloom);
      }

      return group;
    }

    createBulrushMesh(scale = 1.0, seed = 0) {
      const group = new THREE.Group();
      group.scale.set(scale, scale, scale);

      const stalkCount = 4;
      for (let i = 0; i < stalkCount; i++) {
        const ang = (i / stalkCount) * Math.PI * 2 + (seed + i) * 0.4;
        const dist = 0.06 + (i % 2) * 0.05;
        const stalkH = 0.95 + (i % 3) * 0.2;

        // Slender reed stalk
        const stalk = new THREE.Mesh(
          new THREE.CylinderGeometry(0.015, 0.022, stalkH, 4),
          this.reedStemMat
        );
        stalk.position.set(Math.cos(ang) * dist, stalkH * 0.5, Math.sin(ang) * dist);
        stalk.rotation.z = Math.cos(ang) * 0.08;
        group.add(stalk);

        // Brown velvety cattail head on taller stalks
        if (i < 3) {
          const cattail = new THREE.Mesh(
            new THREE.CylinderGeometry(0.045, 0.045, 0.26, 5),
            this.cattailMat
          );
          cattail.position.set(Math.cos(ang) * dist, stalkH * 0.82, Math.sin(ang) * dist);
          group.add(cattail);
        }

        // Tapered leaf blade
        const leaf = new THREE.Mesh(
          new THREE.BoxGeometry(0.02, stalkH * 0.7, 0.012),
          this.reedStemMat
        );
        leaf.position.set(Math.cos(ang + 0.3) * (dist + 0.06), stalkH * 0.35, Math.sin(ang + 0.3) * (dist + 0.06));
        leaf.rotation.z = Math.cos(ang) * 0.24;
        group.add(leaf);
      }

      return group;
    }

    // 4. Distribute Plant Life across all ecological zones
    initPlantLife() {
      // Clear existing plants if any
      this.plants.forEach(p => this.scene.remove(p.mesh));
      this.plants = [];

      const plantSpecs = [];

      // 1. Red Poppies (South Gate verges, courtyard margins, sunny embankments)
      const poppyCoords = [
        { x: -5, z: 4 }, { x: -7, z: 6 }, { x: -3, z: 8 }, { x: 4, z: 5 }, { x: 7, z: 7 },
        { x: 5, z: 9 }, { x: -10, z: 2 }, { x: -12, z: 5 }, { x: 10, z: 3 }, { x: 12, z: 6 },
        { x: -2, z: 12 }, { x: 2, z: 12 }, { x: -6, z: 10 }, { x: 8, z: 11 }, { x: -14, z: 8 },
        { x: 15, z: 8 }, { x: -4, z: 14 }, { x: 3, z: 14 }, { x: -8, z: 13 }, { x: 6, z: 13 },
        { x: -16, z: 11 }, { x: 17, z: 10 }, { x: -1, z: 6 }, { x: 2, z: 3 }, { x: -3, z: 1 }
      ];
      poppyCoords.forEach((c, idx) => {
        plantSpecs.push({ type: 'poppy', category: 'flower', x: c.x, z: c.z, scale: 0.95 + (idx % 3) * 0.1, swayAmp: 0.08 });
      });

      // 2. Golden Buttercups (Inner Bailey meadow, gentle green swathes)
      const buttercupCoords = [
        { x: -8, z: -4 }, { x: -11, z: -2 }, { x: -6, z: -7 }, { x: -10, z: -8 }, { x: -14, z: -4 },
        { x: 6, z: -3 }, { x: 9, z: -6 }, { x: 12, z: -2 }, { x: 8, z: -9 }, { x: 14, z: -6 },
        { x: -3, z: -6 }, { x: 3, z: -7 }, { x: -4, z: -11 }, { x: 2, z: -12 }, { x: -7, z: -13 },
        { x: 5, z: -14 }, { x: -12, z: -11 }, { x: 11, z: -12 }, { x: -1, z: -15 }, { x: 1, z: -16 }
      ];
      buttercupCoords.forEach((c, idx) => {
        plantSpecs.push({ type: 'buttercup', category: 'flower', x: c.x, z: c.z, scale: 0.9 + (idx % 3) * 0.12, swayAmp: 0.07 });
      });

      // 3. Field Daisies (Eastern sandstone bluff & Motte foothills)
      const daisyCoords = [
        { x: 16, z: -6 }, { x: 18, z: -10 }, { x: 19, z: -3 }, { x: 21, z: -6 }, { x: 17, z: -14 },
        { x: 15, z: -18 }, { x: 18, z: -21 }, { x: 14, z: -24 }, { x: 10, z: -25 }, { x: 7, z: -26 },
        { x: -6, z: -24 }, { x: -9, z: -26 }, { x: -14, z: -22 }, { x: -15, z: -18 }, { x: -17, z: -15 },
        { x: 23, z: 2 }, { x: 25, z: 6 }, { x: 27, z: -1 }, { x: 24, z: -8 }, { x: 27, z: -13 }
      ];
      daisyCoords.forEach((c, idx) => {
        plantSpecs.push({ type: 'daisy', category: 'flower', x: c.x, z: c.z, scale: 0.92 + (idx % 3) * 0.1, swayAmp: 0.075 });
      });

      // 4. Woodland Ferns (Western ancient oak forest floor & shady knolls)
      const fernCoords = [
        { x: -19, z: -10 }, { x: -21, z: -14 }, { x: -24, z: -8 }, { x: -27, z: -12 }, { x: -23, z: -19 },
        { x: -28, z: -16 }, { x: -31, z: -11 }, { x: -17, z: -20 }, { x: -22, z: -26 }, { x: -26, z: -22 },
        { x: -29, z: -24 }, { x: -33, z: -18 }, { x: -21, z: -5 }, { x: -25, z: -3 }, { x: -28, z: 4 },
        { x: -32, z: 1 }, { x: -23, z: 6 }, { x: -27, z: 9 }, { x: -31, z: 7 }, { x: -34, z: 10 },
        { x: -19, z: 1 }, { x: -22, z: 10 }, { x: -16, z: -6 }, { x: -30, z: -6 }
      ];
      fernCoords.forEach((c, idx) => {
        plantSpecs.push({ category: 'fern', x: c.x, z: c.z, scale: 1.0 + (idx % 3) * 0.15, swayAmp: 0.05 });
      });

      // 5. Tall Grass Tufts (Scattered across fields, slopes, and ridges)
      const grassCoords = [
        { x: -11, z: 8 }, { x: -13, z: 13 }, { x: -9, z: 16 }, { x: -5, z: 17 }, { x: 11, z: 8 },
        { x: 13, z: 13 }, { x: 9, z: 16 }, { x: 5, z: 17 }, { x: -15, z: -2 }, { x: -17, z: -12 },
        { x: 15, z: -2 }, { x: 17, z: -12 }, { x: -8, z: -18 }, { x: 8, z: -18 }, { x: -4, z: -22 },
        { x: 4, z: -22 }, { x: 0, z: -26 }, { x: -5, z: -30 }, { x: 5, z: -30 }, { x: 0, z: -38 },
        { x: -10, z: -34 }, { x: 10, z: -34 }, { x: -14, z: -30 }, { x: 14, z: -30 }, { x: -18, z: -34 },
        { x: 18, z: -34 }, { x: -22, z: -32 }, { x: 22, z: -32 }, { x: -26, z: 14 }, { x: 26, z: 14 },
        { x: -18, z: 15 }, { x: 18, z: 16 }, { x: -2, z: 9 }, { x: 2, z: 9 }, { x: -10, z: -15 }
      ];
      grassCoords.forEach((c, idx) => {
        plantSpecs.push({ category: 'grass', x: c.x, z: c.z, scale: 0.95 + (idx % 4) * 0.14, swayAmp: 0.11 });
      });

      // 6. Moorland Heather & Gorse Bushes (Sandstone quarry ridge and motte crest)
      const bushCoords = [
        { x: 21, z: -12, type: 'heather' }, { x: 25, z: -16, type: 'gorse' }, { x: 29, z: -14, type: 'heather' },
        { x: 23, z: -18, type: 'gorse' }, { x: 27, z: -18, type: 'heather' }, { x: 31, z: -10, type: 'gorse' },
        { x: 25, z: 2, type: 'heather' }, { x: 29, z: 6, type: 'gorse' }, { x: 33, z: 1, type: 'heather' },
        { x: -11, z: -38, type: 'heather' }, { x: -5, z: -40, type: 'gorse' }, { x: 0, z: -42, type: 'heather' },
        { x: 5, z: -40, type: 'gorse' }, { x: 11, z: -38, type: 'heather' }, { x: -3, z: -46, type: 'gorse' },
        { x: 3, z: -46, type: 'heather' }
      ];
      bushCoords.forEach((c, idx) => {
        plantSpecs.push({ category: 'bush', type: c.type, x: c.x, z: c.z, scale: 0.95 + (idx % 3) * 0.15, swayAmp: 0.04 });
      });

      // 7. River Avon Bulrushes & Reeds (Along riverbank and water margin)
      const reedCoords = [
        { x: -22, z: 17 }, { x: -19, z: 18 }, { x: -17, z: 16 }, { x: -14, z: 18 }, { x: -11, z: 19 },
        { x: -7, z: 19 }, { x: -4, z: 20 }, { x: -1, z: 20 }, { x: 2, z: 20 }, { x: 5, z: 19 },
        { x: 8, z: 19 }, { x: 11, z: 18 }, { x: 14, z: 18 }, { x: 17, z: 17 }, { x: 20, z: 18 },
        { x: 23, z: 17 }, { x: 25, z: 18 }, { x: -15, z: 21 }, { x: 0, z: 22 }, { x: 15, z: 21 }
      ];
      reedCoords.forEach((c, idx) => {
        plantSpecs.push({ category: 'bulrush', x: c.x, z: c.z, scale: 0.95 + (idx % 3) * 0.12, swayAmp: 0.12 });
      });

      // Instantiate all plant life
      plantSpecs.forEach((spec, idx) => {
        let mesh;
        if (spec.category === 'flower') {
          mesh = this.createWildflowerMesh(spec.type, spec.scale, idx);
        } else if (spec.category === 'fern') {
          mesh = this.createFernMesh(spec.scale, idx);
        } else if (spec.category === 'grass') {
          mesh = this.createGrassTuftMesh(spec.scale, idx);
        } else if (spec.category === 'bush') {
          mesh = this.createHeatherBushMesh(spec.type, spec.scale, idx);
        } else if (spec.category === 'bulrush') {
          mesh = this.createBulrushMesh(spec.scale, idx);
        }

        if (mesh) {
          const ty = window.WarwickTerrain ? window.WarwickTerrain.getTerrainHeight(spec.x, spec.z) : 2.4;
          mesh.position.set(spec.x, ty, spec.z);
          this.scene.add(mesh);

          this.plants.push({
            mesh: mesh,
            x: spec.x,
            z: spec.z,
            swayAmp: spec.swayAmp || 0.07,
            phase: (idx * 0.37) % (Math.PI * 2)
          });
        }
      });
    }

    // 5. Populate All Harvestable Trees & Rocks Across the 120x96 World
    initResources() {
      // Clear any existing
      this.trees.forEach(t => this.scene.remove(t.group));
      this.rocks.forEach(r => this.scene.remove(r.group));
      this.trees = [];
      this.rocks = [];

      // --- A. 42 Oak Trees across distinct ecological woodland zones ---
      const treeCoordinates = [
        // 1. Western Ancient Oak Forest (20 trees)
        { x: -18, z: -8, s: 1.05 }, { x: -22, z: -12, s: 1.15 }, { x: -26, z: -10, s: 0.95 },
        { x: -20, z: -16, s: 1.10 }, { x: -25, z: -18, s: 1.20 }, { x: -29, z: -14, s: 1.00 },
        { x: -18, z: -22, s: 0.92 }, { x: -24, z: -24, s: 1.12 }, { x: -30, z: -20, s: 1.08 },
        { x: -34, z: -12, s: 1.18 }, { x: -32, z: -26, s: 0.98 }, { x: -28, z: -6, s: 1.05 },
        { x: -35, z: -4, s: 1.15 }, { x: -22, z: -2, s: 0.95 }, { x: -26, z: 2, s: 1.00 },
        { x: -30, z: 0, s: 1.22 }, { x: -34, z: 6, s: 1.05 }, { x: -20, z: 4, s: 0.90 },
        { x: -24, z: 8, s: 1.10 }, { x: -28, z: 12, s: 1.15 },

        // 2. Northern Motte Foothills & Ridge Copse (10 trees)
        { x: -12, z: -28, s: 1.00 }, { x: -6, z: -32, s: 1.10 }, { x: 0, z: -35, s: 1.25 },
        { x: 6, z: -32, s: 1.08 }, { x: 12, z: -28, s: 0.95 }, { x: -16, z: -36, s: 1.15 },
        { x: 16, z: -36, s: 1.05 }, { x: -8, z: -42, s: 0.92 }, { x: 0, z: -44, s: 1.18 },
        { x: 8, z: -42, s: 1.02 },

        // 3. River Avon Alder & Willow Grove (6 trees along riverside shallows)
        { x: -24, z: 16, s: 0.95 }, { x: -20, z: 18, s: 1.05 }, { x: -16, z: 17, s: 0.88 },
        { x: 12, z: 17, s: 0.92 }, { x: 16, z: 18, s: 1.00 }, { x: 22, z: 16, s: 1.10 },

        // 4. Eastern Copse & Woodland Fringe (6 trees)
        { x: 28, z: -6, s: 1.05 }, { x: 32, z: -4, s: 1.12 }, { x: 36, z: -10, s: 0.95 },
        { x: 30, z: 2, s: 1.00 }, { x: 35, z: -1, s: 1.18 }, { x: 40, z: -8, s: 1.08 }
      ];

      treeCoordinates.forEach((coord, idx) => {
        const treeData = this.createTreeModel(coord.s, idx);
        const ty = window.WarwickTerrain ? window.WarwickTerrain.getTerrainHeight(coord.x, coord.z) : 2.4;
        treeData.group.position.set(coord.x, ty, coord.z);
        this.scene.add(treeData.group);

        // Solid trunk obstacle collision
        const obstacle = this.collision.addCenteredBox(coord.x, coord.z, 0.95, 0.95);

        this.trees.push({
          id: `tree_${idx}`,
          x: coord.x,
          z: coord.z,
          y: ty,
          group: treeData.group,
          trunkGroup: treeData.trunkGroup,
          canopyGroup: treeData.canopyGroup,
          stumpGroup: treeData.stumpGroup,
          obstacle: obstacle,
          isChopped: false,
          respawnTimer: 0,
          scale: coord.s
        });
      });

      // --- B. 22 Sandstone Outcrops across the quarry, Avon gorge cliffs, and ridges ---
      const rockCoordinates = [
        // 1. Eastern Sandstone Quarry Bluff (10 formations)
        { x: 20, z: -8, s: 1.15 }, { x: 24, z: -12, s: 1.25 }, { x: 22, z: -16, s: 0.95 },
        { x: 28, z: -10, s: 1.10 }, { x: 26, z: -14, s: 1.20 }, { x: 30, z: -16, s: 1.05 },
        { x: 22, z: -4, s: 0.90 }, { x: 26, z: -2, s: 1.15 }, { x: 30, z: 4, s: 1.00 },
        { x: 34, z: -4, s: 1.08 },

        // 2. River Avon Sandstone Gorge Cliff Outcrops (8 formations)
        { x: -14, z: 12, s: 1.05 }, { x: -8, z: 14, s: 1.15 }, { x: 4, z: 13, s: 1.10 },
        { x: 8, z: 14, s: 0.95 }, { x: 14, z: 12, s: 1.20 }, { x: 18, z: 15, s: 1.00 },
        { x: -4, z: 18, s: 0.88 }, { x: 10, z: 19, s: 0.92 },

        // 3. Northern Motte Sandstone Outcrops (4 formations)
        { x: -10, z: -22, s: 1.10 }, { x: 10, z: -22, s: 1.05 },
        { x: -4, z: -30, s: 0.95 }, { x: 4, z: -30, s: 1.00 }
      ];

      rockCoordinates.forEach((coord, idx) => {
        const rockData = this.createRockModel(coord.s, idx);
        const ty = window.WarwickTerrain ? window.WarwickTerrain.getTerrainHeight(coord.x, coord.z) : 2.4;
        rockData.group.position.set(coord.x, ty, coord.z);
        this.scene.add(rockData.group);

        // Solid rock boulder obstacle collision
        const obstacle = this.collision.addCenteredBox(coord.x, coord.z, 1.4, 1.4);

        this.rocks.push({
          id: `rock_${idx}`,
          x: coord.x,
          z: coord.z,
          y: ty,
          group: rockData.group,
          boulderGroup: rockData.boulderGroup,
          rubbleGroup: rockData.rubbleGroup,
          obstacle: obstacle,
          isDepleted: false,
          respawnTimer: 0,
          scale: coord.s
        });
      });

      // --- C. Populate Plant Life (Wildflowers, Ferns, Tall Grass, Heather, Bulrushes) ---
      this.initPlantLife();
    }

    // 6. Update Loop: Canopy breeze sway, plant sway, harvest interactions, and stump regrowth
    update(dt, playerPos, isPlayerMoving) {
      this.windClock += dt * 1.5;

      // A. Subtle canopy breeze sway for natural organic beauty
      this.trees.forEach(t => {
        if (!t.isChopped && t.canopyGroup) {
          const sway = Math.sin(this.windClock + t.x * 0.2 + t.z * 0.3) * 0.035;
          t.canopyGroup.rotation.z = sway;
          t.canopyGroup.rotation.x = sway * 0.6;
        }

        // Regrowth of stumps into living trees (80 seconds)
        if (t.isChopped) {
          t.respawnTimer += dt;
          if (t.respawnTimer >= 80.0) {
            t.isChopped = false;
            t.respawnTimer = 0;
            t.trunkGroup.visible = true;
            t.canopyGroup.visible = true;
            t.stumpGroup.visible = false;
            // Reactivate trunk collision
            if (t.obstacle) t.obstacle.active = true;
          }
        }
      });

      // B. Breeze sway for vibrant plant life (wildflowers, ferns, grasses, reeds)
      const plantLen = this.plants.length;
      for (let i = 0; i < plantLen; i++) {
        const p = this.plants[i];
        const sway = Math.sin(this.windClock * 2.2 + p.x * 0.35 + p.z * 0.45 + p.phase) * p.swayAmp;
        p.mesh.rotation.z = sway;
        p.mesh.rotation.x = sway * 0.45;
      }

      // C. Regrowth of depleted sandstone rocks (80 seconds)
      this.rocks.forEach(r => {
        if (r.isDepleted) {
          r.respawnTimer += dt;
          if (r.respawnTimer >= 80.0) {
            r.isDepleted = false;
            r.respawnTimer = 0;
            r.boulderGroup.visible = true;
            r.rubbleGroup.visible = false;
            if (r.obstacle) r.obstacle.active = true;
          }
        }
      });

      // C. Interactive Tree Chopping & Rock Quarrying Detection
      // If player is moving, reset active harvesting
      if (isPlayerMoving) {
        this.activeTarget = null;
        this.harvestTimer = 0;
        this.soundTimer = 0;
        return null;
      }

      // Check for closest living tree within 2.0m
      let nearestTree = null;
      let minTreeDist = 2.0;

      for (let i = 0; i < this.trees.length; i++) {
        const t = this.trees[i];
        if (t.isChopped) continue;
        const dist = Math.hypot(playerPos.x - t.x, playerPos.z - t.z);
        if (dist < minTreeDist) {
          minTreeDist = dist;
          nearestTree = t;
        }
      }

      // Check for closest quarryable rock within 2.2m
      let nearestRock = null;
      let minRockDist = 2.2;

      for (let i = 0; i < this.rocks.length; i++) {
        const r = this.rocks[i];
        if (r.isDepleted) continue;
        const dist = Math.hypot(playerPos.x - r.x, playerPos.z - r.z);
        if (dist < minRockDist) {
          minRockDist = dist;
          nearestRock = r;
        }
      }

      const state = window.state;

      // 1. Tree Chopping
      if (nearestTree) {
        if (this.activeTarget !== nearestTree) {
          this.activeTarget = nearestTree;
          this.harvestTimer = 0;
          this.soundTimer = 0;
        }

        // Pack capacity check
        if (state.playerCarrying >= state.maxCarryCapacity) {
          return { type: 'tree', full: true, pos: nearestTree.group.position };
        }

        // Progress tree chop (2.2s felling time)
        const maxChopTime = 2.2;
        this.harvestTimer += dt;
        this.soundTimer += dt;

        if (this.soundTimer >= 0.52) {
          this.soundTimer = 0;
          if (window.audio && typeof window.audio.woodChop === 'function') {
            window.audio.woodChop();
          }
        }

        const progress = Math.min(1.0, this.harvestTimer / maxChopTime);

        // Tree fully chopped down!
        if (progress >= 1.0) {
          this.harvestTimer = 0;
          nearestTree.isChopped = true;
          nearestTree.trunkGroup.visible = false;
          nearestTree.canopyGroup.visible = false;
          nearestTree.stumpGroup.visible = true;

          // Deactivate collision so player can walk past stump
          if (nearestTree.obstacle) {
            nearestTree.obstacle.active = false;
          }

          // Sound & Haptic
          if (window.audio && typeof window.audio.treeFall === 'function') {
            window.audio.treeFall();
          }

          // Yield 2 Timber Logs onto player's back
          state.playerCarrying = Math.min(state.maxCarryCapacity, state.playerCarrying + 2);
          state.carryingType = 'timber';
          this.activeTarget = null;

          return { type: 'tree', completed: true, pos: nearestTree.group.position };
        }

        return { type: 'tree', progress: progress, pos: nearestTree.group.position };
      }

      // 2. Sandstone Rock Quarrying
      else if (nearestRock) {
        if (this.activeTarget !== nearestRock) {
          this.activeTarget = nearestRock;
          this.harvestTimer = 0;
          this.soundTimer = 0;
        }

        // Pack capacity check
        if (state.playerCarrying >= state.maxCarryCapacity) {
          return { type: 'rock', full: true, pos: nearestRock.group.position };
        }

        // Progress quarry chiseling (2.6s quarry time)
        const maxQuarryTime = 2.6;
        this.harvestTimer += dt;
        this.soundTimer += dt;

        if (this.soundTimer >= 0.54) {
          this.soundTimer = 0;
          if (window.audio && typeof window.audio.stoneChisel === 'function') {
            window.audio.stoneChisel();
          }
        }

        const progress = Math.min(1.0, this.harvestTimer / maxQuarryTime);

        // Rock fully quarried!
        if (progress >= 1.0) {
          this.harvestTimer = 0;
          nearestRock.isDepleted = true;
          nearestRock.boulderGroup.visible = false;
          nearestRock.rubbleGroup.visible = true;

          // Deactivate collision
          if (nearestRock.obstacle) {
            nearestRock.obstacle.active = false;
          }

          // Sound & Haptic
          if (window.audio && typeof window.audio.rockBreak === 'function') {
            window.audio.rockBreak();
          }

          // Yield 2 Sandstone Blocks onto player's back
          state.playerCarrying = Math.min(state.maxCarryCapacity, state.playerCarrying + 2);
          state.carryingType = 'stone';
          this.activeTarget = null;

          return { type: 'rock', completed: true, pos: nearestRock.group.position };
        }

        return { type: 'rock', progress: progress, pos: nearestRock.group.position };
      }

      // Not near any harvestable resource
      this.activeTarget = null;
      this.harvestTimer = 0;
      this.soundTimer = 0;
      return null;
    }
  }

  window.ResourceManager = ResourceManager;
})(window);
