// Engine: Dynamic Height Terrain & Avon River Gorge for WARWICK: Castle Builder
// Generates the 3D Warwick Sandstone Bluff, Motte Mound, Winding River Path, and River Avon.
(function(window) {
  'use strict';

  // --- Player-dug trenches carve the terrain (registered via addTrench) ---
  const TRENCH_DEPTH = 0.5;
  const TRENCH_HALF_LEN = 2.1;
  const TRENCH_FLOOR_HALF_WID = 0.45; // flat mud floor half-width
  const TRENCH_RIM_HALF_WID = 1.05;   // where the sloped walls meet original ground
  const trenches = []; // { x, z, rotY, floorY }
  let terrainGeo = null;
  let baseColorArray = null;

  function smoothstepScalar(e0, e1, v) {
    const t = Math.max(0, Math.min(1, (v - e0) / (e1 - e0)));
    return t * t * (3 - 2 * t);
  }

  // Returns { w: carve weight 0..1, wf: mud floor weight 0..1 } for a point relative to a trench
  function trenchWeights(tr, x, z) {
    const dx = x - tr.x;
    const dz = z - tr.z;
    if (dx * dx + dz * dz > 16) return null; // quick reject (> 4m away)
    const c = Math.cos(tr.rotY);
    const s = Math.sin(tr.rotY);
    const lx = Math.abs(dx * c - dz * s);
    const lz = Math.abs(dx * s + dz * c);
    const endFade = 1 - smoothstepScalar(TRENCH_HALF_LEN - 0.8, TRENCH_HALF_LEN, lx);
    const w = (1 - smoothstepScalar(TRENCH_FLOOR_HALF_WID, TRENCH_RIM_HALF_WID, lz)) * endFade;
    if (w <= 0) return null;
    const wf = (1 - smoothstepScalar(TRENCH_FLOOR_HALF_WID * 0.6, TRENCH_FLOOR_HALF_WID * 1.3, lz)) * endFade;
    return { w, wf };
  }

  // 1. Analytic Terrain Height Function
  // Returns precise elevation Y for any world (X, Z) coordinate across enlarged 120x96 world
  function getTerrainHeight(x, z) {
    // A. Northern Motte Earthwork Hill (Centered at x=0, z=-20)
    const distToMotte = Math.hypot(x - 0, z - (-20));
    let motteElevation = 0;
    if (distToMotte < 9.0) {
      // High motte rising +4.0m above plateau
      motteElevation = Math.max(0, (1 - (distToMotte / 9.0)) * 4.0);
    }

    // B. Eastern Sandstone Quarry Ridge (x > 14, z < 8)
    let quarryElevation = 0;
    if (x > 12 && z < 10) {
      const qDist = Math.hypot(x - 22, z - (-8));
      if (qDist < 12.0) {
        quarryElevation = Math.max(0, (1 - (qDist / 12.0)) * 1.5);
      }
    }

    // C. The High Hill Fort Plateau Base (Courtyard)
    // Plateau height = 2.4m
    const plateauHeight = 2.4;

    // D. Southern River Bluff Drop towards the River Avon
    // Plateau extends until z = 9.5, then slopes down to river level (y = 0.2) at z = 20.0
    let baseHeight = plateauHeight;

    if (z > 9.0) {
      // Check if inside the Winding River Ramp / Path
      // Ramp path starts at South Gate (x=0, z=9.5) and curves southwest towards River Dock (x=-10, z=20.0)
      const t = Math.min(1.0, Math.max(0.0, (z - 9.0) / 11.0));
      const pathCenterX = 0 + t * (-10.0);
      const distToPath = Math.abs(x - pathCenterX);

      if (distToPath < 2.8 && z <= 21.5) {
        // Inside the carved path cutting: smooth downward gradient
        baseHeight = plateauHeight * (1.0 - t * 0.90); // Smooth descent from 2.4 to ~0.25m
      } else {
        // Outside the path: steep rocky cliff drop into the Avon gorge
        if (z < 18.0) {
          const dropFactor = (z - 9.0) / 9.0;
          baseHeight = plateauHeight * (1.0 - Math.pow(dropFactor, 1.4));
        } else {
          baseHeight = 0.18; // Low riverside marsh / mudbank
        }
      }
    }

    // E. River Avon Water Basin (z >= 20.5)
    if (z >= 20.5) {
      const riverDepth = Math.min(0.9, (z - 20.5) * 0.12);
      baseHeight = Math.max(-0.7, 0.18 - riverDepth);
    }

    // Gentle micro-elevation noise for realistic medieval ground
    const microUndulation = Math.sin(x * 0.25) * Math.cos(z * 0.25) * 0.08;

    let height = baseHeight + motteElevation + quarryElevation + microUndulation;

    // Player-dug trenches: cut down to a level floor with sloped walls
    for (let i = 0; i < trenches.length; i++) {
      const tr = trenches[i];
      const tw = trenchWeights(tr, x, z);
      if (tw && height > tr.floorY) {
        height -= tw.w * (height - tr.floorY);
      }
    }
    return height;
  }

  // Register a new trench, carve the terrain mesh and return the floor height
  function addTrench(x, z, rotY = 0) {
    const floorY = getTerrainHeight(x, z) - TRENCH_DEPTH;
    trenches.push({ x, z, rotY, floorY });
    refreshTerrainNear(x, z, TRENCH_HALF_LEN + 2.0);
    return floorY;
  }

  // Re-sculpt and recolour terrain vertices near a point
  function refreshTerrainNear(cx, cz, radius) {
    if (!terrainGeo || !baseColorArray) return;
    const pos = terrainGeo.attributes.position;
    const col = terrainGeo.attributes.color;
    const dirt = new THREE.Color(0x6b4f35);
    const mud = new THREE.Color(0x261b13);
    const tmp = new THREE.Color();

    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vz = pos.getZ(i);
      if (Math.abs(vx - cx) > radius || Math.abs(vz - cz) > radius) continue;

      pos.setY(i, getTerrainHeight(vx, vz));

      tmp.setRGB(baseColorArray[i * 3], baseColorArray[i * 3 + 1], baseColorArray[i * 3 + 2]);
      for (let t = 0; t < trenches.length; t++) {
        const tw = trenchWeights(trenches[t], vx, vz);
        if (!tw) continue;
        tmp.lerp(dirt, Math.min(1, tw.w * 1.3));
        tmp.lerp(mud, tw.wf);
      }
      col.setXYZ(i, tmp.r, tmp.g, tmp.b);
    }
    pos.needsUpdate = true;
    col.needsUpdate = true;
    terrainGeo.computeVertexNormals();
  }

  // 2. Terrain Mesh Generator
  function createWarwickTerrain(scene) {
    const width = 120;
    const depth = 96;
    const segX = 192;
    const segZ = 152;

    const geo = new THREE.PlaneGeometry(width, depth, segX, segZ);
    geo.rotateX(-Math.PI / 2); // Orient horizontal (X-Z plane)

    // Position attributes
    const pos = geo.attributes.position;
    const colors = [];

    // Helper: Hermite smoothstep for organic gradient blending
    function smoothstep(edge0, edge1, x) {
      const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
      return t * t * (3 - 2 * t);
    }

    // Color swatches for rich terrain vertex painting:
    const cHighGrass   = new THREE.Color(0x22c55e); // Bright sunlit meadow grass
    const cSpringGrass = new THREE.Color(0x16a34a); // Lush spring turf
    const cDeepGrass   = new THREE.Color(0x15803d); // Deep emerald turf
    const cForestFloor = new THREE.Color(0x14532d); // Shaded oak forest floor
    const cSandstone   = new THREE.Color(0xd97706); // Exposed Warwick sandstone cliff
    const cDarkStone   = new THREE.Color(0xb45309); // Weathered rock strata
    const cPath        = new THREE.Color(0x78350f); // Trodden earth / dirt trail
    const cRiverbank   = new THREE.Color(0x5c3d18); // Riverside towpath & moist loam
    const cShoreSilt   = new THREE.Color(0x2d3a29); // Wet river silt & sand margin
    const cRiverbed    = new THREE.Color(0x0c4a6e); // Deep submerged river stones

    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vz = pos.getZ(i);

      // Compute precise dynamic height
      const vy = getTerrainHeight(vx, vz);
      pos.setY(i, vy);

      // 1. Base meadow tone with organic gentle variation
      const patch = Math.sin(vx * 0.45 + vz * 0.4) * Math.cos(vx * 0.3 - vz * 0.5);
      let vertexColor = cSpringGrass.clone();
      if (patch > 0.35) {
        vertexColor.lerp(cHighGrass, (patch - 0.35) * 1.8);
      } else if (patch < -0.35) {
        vertexColor.lerp(cDeepGrass, (-patch - 0.35) * 1.8);
      }

      // 2. Western Ancient Oak forest (shaded deep turf & leaf litter)
      if (vx < -12.0) {
        const forestFactor = smoothstep(-12.0, -22.0, vx);
        vertexColor.lerp(cForestFloor, forestFactor * 0.85);
      }

      // 3. Eastern Sandstone Quarry Bluff
      if (vx > 13.0 && vz < 9.0) {
        const qDist = Math.hypot(vx - 22, vz - (-8));
        const quarryFactor = 1.0 - smoothstep(4.0, 13.0, qDist);
        vertexColor.lerp(cSandstone, quarryFactor * 0.8);
      }

      // 4. Exposed Sandstone river gorge cliff faces
      if (vz > 9.5 && vz < 18.5 && vy < 2.1) {
        const cliffFactor = smoothstep(2.1, 0.4, vy);
        vertexColor.lerp(cSandstone, cliffFactor * 0.85);
        if (Math.sin(vx * 1.8 + vz * 1.2) > 0.15) {
          vertexColor.lerp(cDarkStone, cliffFactor * 0.45);
        }
      }

      // 5. Trodden trail from South Gate to River Dock
      if (vz >= 8.0 && vz <= 19.5) {
        const t = (vz - 8.0) / 11.5;
        const pathX = t * (-10.0);
        const distToPath = Math.abs(vx - pathX);
        if (distToPath < 2.4) {
          const pathFactor = 1.0 - smoothstep(0.8, 2.4, distToPath);
          vertexColor.lerp(cPath, pathFactor * 0.75);
        }
      }

      // 6. Seamless Multi-Stage River Avon Transition
      // Organic shoreline noise eliminates mechanical straight lines across grid rows
      const shoreNoise = Math.sin(vx * 0.4) * 0.85 + Math.cos(vx * 0.9) * 0.4;
      const riverZ = vz + shoreNoise;

      if (riverZ > 16.5) {
        // Stage A: Grass & path gently blend into moist riverbank loam & towpath (16.5 -> 19.2)
        const bankFactor = smoothstep(16.5, 19.2, riverZ);
        vertexColor.lerp(cRiverbank, bankFactor);

        // Stage B: Riverbank blends into wet shoreline sand & silt (19.2 -> 21.0)
        if (riverZ > 19.2) {
          const siltFactor = smoothstep(19.2, 21.0, riverZ);
          vertexColor.lerp(cShoreSilt, siltFactor);
        }

        // Stage C: Water margin smoothly descends into submerged riverbed stones (21.0 -> 23.5)
        if (riverZ > 21.0) {
          const bedFactor = smoothstep(21.0, 23.5, riverZ);
          vertexColor.lerp(cRiverbed, bedFactor);
        }
      }

      colors.push(vertexColor.r, vertexColor.g, vertexColor.b);
    }

    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    terrainGeo = geo;
    baseColorArray = new Float32Array(colors);

    // Material combining vertex colors with canvas turf detail and tactile bump map
    const grassTex = CastleTextures.createGrassBluffTexture();
    grassTex.repeat.set(16, 12);
    const bumpTex = CastleTextures.createGrassBumpTexture();
    bumpTex.repeat.set(16, 12);

    const terrainMat = new THREE.MeshStandardMaterial({
      map: grassTex,
      bumpMap: bumpTex,
      bumpScale: 0.035,
      vertexColors: true,
      roughness: 0.82,
      metalness: 0.04
    });

    const terrainMesh = new THREE.Mesh(geo, terrainMat);
    terrainMesh.receiveShadow = true;
    terrainMesh.castShadow = true;
    scene.add(terrainMesh);

    // 3. Flowing River Avon Water Plane
    // Sits at water level y = 0.06 across the southern boundary
    const riverObj = CastleTextures.createRiverTexture();
    const riverTex = riverObj.tex;
    riverTex.repeat.set(8, 3);

    const waterMat = new THREE.MeshStandardMaterial({
      map: riverTex,
      roughness: 0.12,
      metalness: 0.35,
      transparent: true,
      opacity: 0.80,
      depthWrite: false, // Prevents z-fighting and harsh clipping against shoreline quads
      color: 0x0284c7
    });

    const waterGeo = new THREE.PlaneGeometry(130, 36);
    waterGeo.rotateX(-Math.PI / 2);
    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.position.set(0, 0.06, 32.0);
    waterMesh.receiveShadow = true;
    scene.add(waterMesh);

    // 4. Exposed Sandstone Bluff Rock Formations
    const boulderMat = new THREE.MeshStandardMaterial({
      map: CastleTextures.createSandstoneTexture(),
      roughness: 0.85
    });

    const cliffBoulders = [
      { x: -7, z: 12.5, s: 1.6 },
      { x: 4, z: 11.5, s: 2.0 },
      { x: 9, z: 12.0, s: 2.3 },
      { x: 16, z: 11.0, s: 2.7 },
      { x: -14, z: 13.0, s: 1.8 },
      { x: 22, z: -4.0, s: 2.2 },
      { x: 20, z: 4.0, s: 2.1 }
    ];

    cliffBoulders.forEach(b => {
      const bGeo = new THREE.DodecahedronGeometry(b.s);
      const bMesh = new THREE.Mesh(bGeo, boulderMat);
      const by = getTerrainHeight(b.x, b.z);
      bMesh.position.set(b.x, by - b.s * 0.25, b.z);
      bMesh.rotation.set(Math.random() * 0.5, Math.random() * Math.PI, Math.random() * 0.4);
      bMesh.castShadow = true;
      bMesh.receiveShadow = true;
      scene.add(bMesh);
      if (window.collisionSystem) {
        window.collisionSystem.addCenteredBox(b.x, b.z, b.s * 1.5, b.s * 1.5);
      }
    });

    // 5. River Reeds and Bulrushes along water's edge
    const reedMat = new THREE.MeshStandardMaterial({ color: 0x4d7c0f, roughness: 0.7 });
    [-22, -16, -11, -4, 3, 10, 18, 26].forEach(rx => {
      const reedGroup = new THREE.Group();
      for (let r = 0; r < 5; r++) {
        const stalk = new THREE.Mesh(
          new THREE.CylinderGeometry(0.04, 0.05, 1.4 + Math.random() * 0.5, 6),
          reedMat
        );
        stalk.position.set((r - 2) * 0.18, 0.7, (r % 2) * 0.2);
        reedGroup.add(stalk);
      }
      reedGroup.position.set(rx, 0.08, 20.8 + Math.random() * 1.5);
      scene.add(reedGroup);
    });


    return {
      terrainMesh,
      waterMesh,
      riverTex,
      getTerrainHeight
    };
  }

  window.WarwickTerrain = {
    getTerrainHeight,
    addTrench,
    createWarwickTerrain
  };
})(window);
