// Systems: Mobile-Friendly Free Placement System for WARWICK: Castle Builder
// Allows free placement and rotation of components on the dynamic Warwick terrain.
(function(window) {
  'use strict';

  const STRUCTURE_CATALOG = [
    {
      id: 'woodStore',
      name: 'Wood Store Depot',
      icon: '🪵',
      desc: 'Log cradle depot to store harvested timber logs',
      cost: { timber: 0, stone: 0 },
      requires: null,
      dims: { w: 2.6, d: 2.0 },
      repeatable: true
    },
    {
      id: 'rockStore',
      name: 'Rock Store Pallet',
      icon: '🪨',
      desc: 'Masonry pallet to store quarried sandstone blocks',
      cost: { timber: 2, stone: 0 },
      requires: null,
      dims: { w: 2.4, d: 2.0 },
      repeatable: true
    },
    {
      id: 'foodStore',
      name: 'Food Store & Granary',
      icon: '🌾',
      desc: 'Elevated wattle larder for grain & hunted game (+Morale)',
      cost: { timber: 3, stone: 0 },
      requires: null,
      dims: { w: 2.4, d: 2.4 },
      repeatable: true
    },
    {
      id: 'campfire',
      name: 'Camp Fire Hearth',
      icon: '🔥',
      desc: 'Central hearth of your Anglo-Saxon camp',
      cost: { timber: 3, stone: 0 },
      requires: null,
      dims: { w: 1.8, d: 1.8 },
      repeatable: false
    },
    {
      id: 'tent',
      name: 'Command Tent',
      icon: '🎪',
      desc: 'Leader command pavilion & strategy charts',
      cost: { timber: 5, stone: 0 },
      requires: 'campfire',
      dims: { w: 3.2, d: 3.4 },
      repeatable: false
    },
    {
      id: 'spikes',
      name: 'Defensive Spikes',
      icon: '🪵',
      desc: 'Sharpened timber stakes to deter wolves & raiders',
      cost: { timber: 4, stone: 0 },
      requires: 'tent',
      dims: { w: 4.2, d: 1.4 },
      repeatable: true
    },
    {
      id: 'trench',
      name: 'Dry Trench & Ditch',
      icon: '⛏️',
      desc: 'Excavated earthwork ditch with timber footbridge',
      cost: { timber: 4, stone: 4 },
      requires: 'spikes',
      dims: { w: 4.5, d: 2.0 },
      repeatable: true
    },
    {
      id: 'fence',
      name: 'Palisade Fence',
      icon: '🛡️',
      desc: 'Split-log perimeter timber barricade line',
      cost: { timber: 6, stone: 2 },
      requires: 'trench',
      dims: { w: 4.4, d: 1.0 },
      repeatable: true
    },
    {
      id: 'archery',
      name: 'Archery Range',
      icon: '🎯',
      desc: 'Training butts for peasant bowmen (Unlocks Archer Recruitment)',
      cost: { timber: 6, stone: 3 },
      requires: 'fence',
      dims: { w: 3.4, d: 2.2 },
      repeatable: false
    },
    {
      id: 'smallHut',
      name: 'Saxon Living Hut',
      icon: '🛖',
      desc: 'Wattle & thatch living dwelling (+2 Beds)',
      cost: { timber: 10, stone: 5 },
      requires: 'archery',
      dims: { w: 3.6, d: 3.0 },
      repeatable: true
    },
    {
      id: 'palisadeSouth',
      name: 'South Gatehouse',
      icon: '🏰',
      desc: 'Massive gateway with Mercian royal banner',
      cost: { timber: 12, stone: 6 },
      requires: 'smallHut',
      dims: { w: 7.5, d: 1.2 },
      repeatable: false
    },
    {
      id: 'watchtower',
      name: 'Timber Watchtower',
      icon: '🗼',
      desc: 'Stilt sentry tower overlooking the Avon Gorge',
      cost: { timber: 14, stone: 6 },
      requires: 'palisadeSouth',
      dims: { w: 3.2, d: 3.2 },
      repeatable: false
    },
    {
      id: 'barracks',
      name: 'Warrior Barracks',
      icon: '🪖',
      desc: 'Fortified hall for your garrison (+4 Beds)',
      cost: { timber: 16, stone: 8 },
      requires: 'watchtower',
      dims: { w: 4.6, d: 3.6 },
      repeatable: true
    },
    {
      id: 'riverDock',
      name: 'Avon River Dock',
      icon: '⛵',
      desc: 'Pier & moored skiff for Avon river expeditions',
      cost: { timber: 15, stone: 10 },
      requires: 'barracks',
      dims: { w: 4.4, d: 3.5 },
      dockWaterOnly: true,
      repeatable: false
    },
    {
      id: 'motteMound',
      name: 'Great Earthen Motte',
      icon: '⛰️',
      desc: 'Monumental stepped hill crown of Warwick Castle',
      cost: { timber: 20, stone: 20 },
      requires: 'riverDock',
      dims: { w: 7.5, d: 7.5 },
      repeatable: false
    }
  ];

  class BuildingPlacement {
    constructor(scene, gameCamera, stationManager, collisionSystem, player) {
      this.scene = scene;
      this.gameCamera = gameCamera;
      this.stationMgr = stationManager;
      this.collision = collisionSystem;
      this.player = player;

      this.isPlacing = false;
      this.selectedDef = null;
      this.previewGroup = null;
      this.footprintMesh = null;
      this.footprintLines = null;
      this.previewPos = new THREE.Vector3(0, 0, 0);
      this.previewRotation = 0;
      this.isValidPlacement = true;
      this.isPointerDown = false;

      this.raycaster = new THREE.Raycaster();
      this.mouse = new THREE.Vector2();
      this.groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

      this.initDomElements();
    }

    initDomElements() {
      this.drawerEl = document.getElementById('build-menu-drawer');
      this.hudEl = document.getElementById('placement-hud');
      this.cardsContainer = document.getElementById('build-cards-container');
      this.btnOpenBuild = document.getElementById('btn-open-build');
      this.statusPill = document.getElementById('placement-status-pill');
      this.statusText = document.getElementById('placement-status-text');
      this.statusIcon = document.getElementById('placement-status-icon');
      this.confirmBtn = document.getElementById('btn-confirm-placement');
      this.confirmText = document.getElementById('btn-confirm-text');
    }

    // --- Build Menu Drawer (Mobile Bottom Sheet) ---
    openBuildMenu() {
      if (window.audio && typeof window.audio.click === 'function') window.audio.click();
      if (this.isPlacing) this.cancelPlacement();

      this.renderBuildMenuCards();
      if (this.drawerEl) {
        this.drawerEl.classList.remove('hidden');
      }
      if (this.btnOpenBuild) {
        this.btnOpenBuild.classList.add('hidden');
      }
    }

    closeBuildMenu() {
      if (window.audio && typeof window.audio.click === 'function') window.audio.click();
      if (this.drawerEl) {
        this.drawerEl.classList.add('hidden');
      }
      if (this.btnOpenBuild) {
        this.btnOpenBuild.classList.remove('hidden');
      }
    }

    renderBuildMenuCards() {
      if (!this.cardsContainer) return;
      this.cardsContainer.innerHTML = '';

      const state = window.state || {};
      const timberEl = document.getElementById('build-drawer-timber');
      const stoneEl = document.getElementById('build-drawer-stone');
      if (timberEl) timberEl.innerText = state.timber || 0;
      if (stoneEl) stoneEl.innerText = state.stone || 0;

      STRUCTURE_CATALOG.forEach(def => {
        const isBuilt = (state.structures && state.structures[def.id] > 0);
        const reqMet = !def.requires || (state.structures && state.structures[def.requires] > 0);
        const canAfford = (state.timber >= def.cost.timber && state.stone >= def.cost.stone);

        // A structure is available if unlocked (prerequisite met) and either repeatable or not yet built
        const isUnlocked = reqMet;
        const alreadyMaxed = isBuilt && !def.repeatable;

        const card = document.createElement('div');
        card.className = `build-card relative p-3 rounded-2xl border transition-all flex flex-col justify-between ${
          !isUnlocked
            ? 'opacity-50 bg-slate-900/60 border-slate-800 pointer-events-none'
            : alreadyMaxed
            ? 'bg-slate-900/80 border-slate-700/80'
            : canAfford
            ? 'bg-gradient-to-b from-slate-900/90 to-amber-950/40 border-amber-500/60 hover:border-amber-400 hover:scale-[1.02] cursor-pointer shadow-lg'
            : 'bg-slate-900/80 border-slate-700/80 hover:border-amber-600/40 cursor-pointer'
        }`;

        // Header: Icon + Name
        let statusBadge = '';
        if (!isUnlocked) {
          const reqDef = STRUCTURE_CATALOG.find(d => d.id === def.requires);
          const reqName = reqDef ? reqDef.name : 'preceding structure';
          statusBadge = `<div class="text-[9px] text-red-400 font-semibold mt-1">🔒 Requires ${reqName}</div>`;
        } else if (alreadyMaxed) {
          statusBadge = `<div class="text-[9px] text-emerald-400 font-semibold mt-1">✓ Completed</div>`;
        } else if (def.repeatable && isBuilt) {
          statusBadge = `<div class="text-[9px] text-amber-300 font-semibold mt-1">Built: ${state.structures[def.id]} (Can build more)</div>`;
        }

        card.innerHTML = `
          <div>
            <div class="flex items-center gap-2">
              <span class="text-2xl">${def.icon}</span>
              <div class="font-cinzel font-bold text-xs sm:text-sm text-amber-100 leading-tight">
                ${def.name}
              </div>
            </div>
            <p class="text-[10px] text-slate-300 mt-1 leading-snug">${def.desc}</p>
            ${statusBadge}
          </div>

          <div class="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <div class="flex items-center gap-2 text-[11px] font-fredoka">
              <span class="${state.timber >= def.cost.timber ? 'text-amber-300 font-bold' : 'text-red-400 font-semibold'}">
                🪵 ${def.cost.timber}
              </span>
              ${def.cost.stone > 0 ? `
                <span class="${state.stone >= def.cost.stone ? 'text-orange-300 font-bold' : 'text-red-400 font-semibold'}">
                  🪨 ${def.cost.stone}
                </span>` : ''}
            </div>
            <button class="px-2.5 py-1 rounded-xl text-[10px] font-cinzel font-bold uppercase tracking-wider ${
              alreadyMaxed
                ? 'bg-slate-800 text-slate-400'
                : canAfford
                ? 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 shadow'
                : 'bg-slate-800 text-slate-400'
            }">
              ${alreadyMaxed ? 'Built' : 'Place'}
            </button>
          </div>
        `;

        if (isUnlocked && !alreadyMaxed) {
          card.onclick = () => {
            this.startPlacement(def.id);
          };
        }

        this.cardsContainer.appendChild(card);
      });
    }

    // --- Free Placement Mode ---
    startPlacement(defId) {
      const def = STRUCTURE_CATALOG.find(d => d.id === defId);
      if (!def) return;

      this.selectedDef = def;
      this.isPlacing = true;
      this.closeBuildMenu();

      if (window.audio && typeof window.audio.pickup === 'function') window.audio.pickup();

      // Initial placement position 2.6m in front of player
      const p = this.player ? this.player.root.position : new THREE.Vector3(0, 0, 0);
      const rot = this.player ? this.player.root.rotation.y : 0;
      const forwardX = Math.sin(rot);
      const forwardZ = Math.cos(rot);

      let startX = p.x + forwardX * 2.6;
      let startZ = p.z + forwardZ * 2.6;

      // Special initial position for River Dock: place near riverbank
      if (def.dockWaterOnly) {
        startX = Math.min(20, Math.max(-20, startX));
        startZ = 20.8;
      }

      this.previewPos.set(startX, 0, startZ);
      this.previewRotation = 0;

      // Create 3D ghost preview model
      this.createGhostPreview(def);

      // Show placement HUD
      if (this.hudEl) this.hudEl.classList.remove('hidden');
      if (this.confirmText) {
        this.confirmText.innerText = `Build (${def.cost.timber}🪵${def.cost.stone ? ` ${def.cost.stone}🪨` : ''})`;
      }

      this.updatePreviewTransform();
    }

    createGhostPreview(def) {
      if (this.previewGroup) {
        this.scene.remove(this.previewGroup);
        this.previewGroup = null;
      }

      this.previewGroup = new THREE.Group();

      // 1. Building 3D Mesh with ghost materials
      const model = this.stationMgr.createStructureMesh(def.id);
      model.traverse(child => {
        if (child.isMesh && child.material) {
          child.material = child.material.clone();
          child.material.transparent = true;
          child.material.opacity = 0.68;
          child.castShadow = false;
          child.receiveShadow = false;
        }
      });
      this.previewGroup.add(model);

      // 2. Ground Footprint Box Indicator
      const w = def.dims.w;
      const d = def.dims.d;
      const footGeo = new THREE.PlaneGeometry(w, d);
      this.footprintMesh = new THREE.Mesh(
        footGeo,
        new THREE.MeshBasicMaterial({
          color: 0x10b981,
          transparent: true,
          opacity: 0.45,
          side: THREE.DoubleSide
        })
      );
      this.footprintMesh.rotation.x = -Math.PI / 2;
      this.footprintMesh.position.y = 0.06;
      this.previewGroup.add(this.footprintMesh);

      // 3. Footprint Outline Wire
      const edges = new THREE.EdgesGeometry(footGeo);
      this.footprintLines = new THREE.LineSegments(
        edges,
        new THREE.LineBasicMaterial({ color: 0x34d399, linewidth: 2 })
      );
      this.footprintLines.rotation.x = -Math.PI / 2;
      this.footprintLines.position.y = 0.07;
      this.previewGroup.add(this.footprintLines);

      // 4. Soft warm placement light
      const pLight = new THREE.PointLight(0x38bdf8, 1.2, 7);
      pLight.position.set(0, 1.5, 0);
      this.previewGroup.add(pLight);

      this.scene.add(this.previewGroup);
    }

    cancelPlacement() {
      if (window.audio && typeof window.audio.click === 'function') window.audio.click();
      this.isPlacing = false;
      this.selectedDef = null;

      if (this.previewGroup) {
        this.scene.remove(this.previewGroup);
        this.previewGroup = null;
      }

      if (this.hudEl) this.hudEl.classList.add('hidden');
      if (this.btnOpenBuild) this.btnOpenBuild.classList.remove('hidden');
    }

    rotatePreview() {
      if (!this.isPlacing) return;
      if (window.audio && typeof window.audio.click === 'function') window.audio.click();
      this.previewRotation = (this.previewRotation + Math.PI / 2) % (Math.PI * 2);
      this.updatePreviewTransform();
    }

    snapToLeader() {
      if (!this.isPlacing || !this.player) return;
      if (window.audio && typeof window.audio.click === 'function') window.audio.click();
      const p = this.player.root.position;
      const rot = this.player.root.rotation.y;
      this.previewPos.x = p.x + Math.sin(rot) * 2.6;
      this.previewPos.z = p.z + Math.cos(rot) * 2.6;
      this.updatePreviewTransform();
    }

    // Touch & pointer repositioning
    onCanvasPointerDown(e) {
      if (!this.isPlacing) return;
      this.isPointerDown = true;
      this.updatePlacementFromPointer(e.clientX, e.clientY);
    }

    onCanvasPointerMove(e) {
      if (!this.isPlacing || !this.isPointerDown) return;
      this.updatePlacementFromPointer(e.clientX, e.clientY);
    }

    onCanvasPointerUp(e) {
      if (!this.isPlacing) return;
      this.isPointerDown = false;
    }

    updatePlacementFromPointer(clientX, clientY) {
      this.mouse.x = (clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(clientY / window.innerHeight) * 2 + 1;
      this.raycaster.setFromCamera(this.mouse, this.gameCamera.camera);

      let targetPos = null;

      // Raycast against 3D heightfield terrain if available
      if (window.WarwickTerrain && window.WarwickTerrain.terrainMesh) {
        const hits = this.raycaster.intersectObject(window.WarwickTerrain.terrainMesh);
        if (hits.length > 0) {
          targetPos = hits[0].point;
        }
      }

      // Fallback: ground plane at Y = 2.0
      if (!targetPos) {
        const target = new THREE.Vector3();
        this.raycaster.ray.intersectPlane(this.groundPlane, target);
        targetPos = target;
      }

      if (targetPos) {
        this.previewPos.x = targetPos.x;
        this.previewPos.z = targetPos.z;
        this.updatePreviewTransform();
      }
    }

    updatePreviewTransform() {
      if (!this.previewGroup || !this.selectedDef) return;

      const x = this.previewPos.x;
      const z = this.previewPos.z;
      const ty = window.WarwickTerrain ? window.WarwickTerrain.getTerrainHeight(x, z) : 0;
      this.previewPos.y = ty;

      this.previewGroup.position.set(x, ty, z);
      this.previewGroup.rotation.y = this.previewRotation;

      // Validate location & resources
      this.validatePlacement(x, z, this.previewRotation, this.selectedDef);
    }

    validatePlacement(x, z, rotY, def) {
      const state = window.state;
      let valid = true;
      let reason = 'Valid Location — Tap Build to construct';

      // 1. Boundary check inside 120x96 terrain
      if (x < -52 || x > 52 || z < -42 || z > 25) {
        valid = false;
        reason = 'Outside fort perimeter boundaries!';
      }

      // 2. River Avon deep water check
      if (!def.dockWaterOnly && z > 23.5) {
        valid = false;
        reason = 'Cannot place in deep River Avon waters!';
      }

      // 3. River dock must be placed along the riverbank shallows
      if (def.dockWaterOnly && (z < 18.0 || z > 24.5)) {
        valid = false;
        reason = 'River Dock must be positioned along the Avon riverbank!';
      }

      // 4. Overlap with player
      if (this.player) {
        const distToPlayer = this.player.root.position.distanceTo(new THREE.Vector3(x, this.previewPos.y, z));
        if (distToPlayer < 1.1) {
          valid = false;
          reason = 'Too close to leader — step back!';
        }
      }

      // 5. Affordability check
      if (state.timber < def.cost.timber || state.stone < def.cost.stone) {
        valid = false;
        reason = `Need ${def.cost.timber} Timber & ${def.cost.stone} Stone in Burh Stockpiles!`;
      }

      this.isValidPlacement = valid;
      this.updateFootprintColors(valid, reason);
    }

    updateFootprintColors(isValid, message) {
      const colorHex = isValid ? 0x10b981 : 0xef4444;
      const lineHex = isValid ? 0x34d399 : 0xf87171;

      if (this.footprintMesh && this.footprintMesh.material) {
        this.footprintMesh.material.color.setHex(colorHex);
      }
      if (this.footprintLines && this.footprintLines.material) {
        this.footprintLines.material.color.setHex(lineHex);
      }

      if (this.statusText) {
        this.statusText.innerText = message;
        this.statusText.className = isValid ? 'text-amber-200 font-semibold' : 'text-red-300 font-semibold';
      }
      if (this.statusIcon) {
        this.statusIcon.innerText = isValid ? '✨' : '⚠️';
      }

      if (this.confirmBtn) {
        if (isValid) {
          this.confirmBtn.disabled = false;
          this.confirmBtn.classList.remove('opacity-50', 'pointer-events-none');
        } else {
          this.confirmBtn.disabled = true;
          this.confirmBtn.classList.add('opacity-50', 'pointer-events-none');
        }
      }
    }

    confirmPlacement() {
      if (!this.isPlacing || !this.selectedDef || !this.isValidPlacement) return;

      const def = this.selectedDef;
      const state = window.state;

      // Final check
      if (state.timber < def.cost.timber || state.stone < def.cost.stone) {
        if (window.audio && typeof window.audio.warning === 'function') window.audio.warning();
        return;
      }

      // Deduct resources
      state.timber -= def.cost.timber;
      state.stone -= def.cost.stone;

      // Construct permanent 3D building model with collision
      const posX = Number(this.previewPos.x.toFixed(2));
      const posZ = Number(this.previewPos.z.toFixed(2));
      const rotY = Number(this.previewRotation.toFixed(2));

      this.stationMgr.placeStructure(def.id, posX, posZ, rotY);

      // Record in persistent state
      if (!Array.isArray(state.placedStructures)) state.placedStructures = [];
      state.placedStructures.push({
        id: `${def.id}_${Date.now()}`,
        type: def.id,
        x: posX,
        z: posZ,
        rotY: rotY,
        timestamp: Date.now()
      });

      // Update milestone count
      state.structures[def.id] = (state.structures[def.id] || 0) + 1;

      // Housing benefits
      if (def.id === 'smallHut') {
        state.garrison.housingCapacity = (state.garrison.housingCapacity || 1) + 2;
      } else if (def.id === 'barracks') {
        state.garrison.housingCapacity = (state.garrison.housingCapacity || 1) + 4;
      }

      // Save state
      if (window.gameState) window.gameState.save();

      // Audio & Fanfare
      if (window.audio && typeof window.audio.fanfare === 'function') window.audio.fanfare();

      // Floating celebratory text
      const floatPos = new THREE.Vector3(posX, this.previewPos.y + 1.5, posZ);
      this.showWorldNotification(floatPos, `🏰 Built ${def.name}!`, "#38bdf8");

      // Historical chronicle trigger
      if (window.eraManager) {
        window.eraManager.triggerChronicle(def.id);
      }

      // Cleanup placement mode
      this.cancelPlacement();
    }

    showWorldNotification(pos, text, color = '#38bdf8') {
      const el = document.createElement('div');
      el.className = 'float-text';
      el.innerText = text;
      el.style.color = color;
      el.style.fontSize = '18px';
      el.style.fontWeight = 'bold';

      const tempV = new THREE.Vector3().copy(pos);
      tempV.project(this.gameCamera.camera);
      el.style.left = `${(tempV.x * 0.5 + 0.5) * window.innerWidth}px`;
      el.style.top = `${(-(tempV.y * 0.5) + 0.5) * window.innerHeight}px`;

      document.body.appendChild(el);
      setTimeout(() => el.remove(), 1600);
    }

    update(dt) {
      if (!this.isPlacing || !this.previewGroup) return;

      // Subtle breathing pulse on the placement footprint
      if (this.footprintMesh && this.footprintMesh.material) {
        const pulse = 0.38 + Math.sin(performance.now() * 0.006) * 0.12;
        this.footprintMesh.material.opacity = pulse;
      }
    }
  }

  window.BuildingPlacement = BuildingPlacement;
})(window);
