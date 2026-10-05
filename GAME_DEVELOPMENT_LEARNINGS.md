# Game Development Playbook & Architecture Learning Document
*Insights, Patterns, and Blueprint from "Pizza Tycoon 3D: Stall to Slice"*

This document distills the architectural decisions, rendering techniques, gameplay loop design, UI/UX patterns, and technical lessons learned during the development of this prototype. Use this as your reference manual and boilerplate foundation when building your next arcade-idle / tycoon simulation game.

---

## 1. High-Level Technology Stack & Philosophy

### Core Stack
* **Rendering Engine:** [Three.js](https://threejs.org/) (r128) via CDN using an **Orthographic Camera** with a fixed 45° isometric angle.
* **UI & Styling:** HTML5 DOM overlay styled with **Tailwind CSS** (CDN) and Google Fonts (*Fredoka* for punchy arcade titles, *Inter* for numbers and labels).
* **Audio & Haptics:** Pure synthetic **Web Audio API** (Oscillators, Noise Buffers, Biquad Filters) and HTML5 **Vibration API** (`navigator.vibrate`).
* **Game Logic & State:** Vanilla ES6+ JavaScript organized in modular scripts, with `localStorage` JSON serialization.

### The "Zero-Asset Download" Architecture
One of the most powerful design decisions of this prototype is that **it requires zero external 3D models (GLTF/OBJ), zero external textures (PNG/JPG), and zero audio files (MP3/WAV)**.
* **Benefits:** Instant cold-start load times (< 1 second, under 1 MB total transfer), zero CORS issues during local testing, zero broken asset URLs, and effortless hosting on any static web host or GitHub Pages.
* **How It's Achieved:**
  1. *Meshes:* Built entirely from Three.js primitives (`BoxGeometry`, `CylinderGeometry`, `SphereGeometry`, `RingGeometry`, `TorusGeometry`).
  2. *Textures:* Generated procedurally in memory via offscreen HTML5 2D Canvas contexts (`CanvasTexture`).
  3. *Sound Effects:* Synthesized mathematically via Web Audio oscillators and noise nodes.

---

## 2. Visual Style & 3D Graphics Pipeline

### A. Isometric Camera Setup & Framing
To achieve the distinctive mobile-tycoon perspective, an orthographic camera is used instead of perspective. This eliminates lens distortion and gives a crisp, miniature architectural look.

```javascript
// Camera parameters (scene.js)
this.frustumD = 11;
const aspect = window.innerWidth / window.innerHeight;
this.camera = new THREE.OrthographicCamera(
  -this.frustumD * aspect,  this.frustumD * aspect,
   this.frustumD,          -this.frustumD,
   1, 150
);

// Standard 45-degree isometric offset
this.cameraOffset = new THREE.Vector3(20, 26, 20);
this.cameraTarget = new THREE.Vector3(0, 0, 0);
this.camera.position.copy(this.cameraOffset);
this.camera.lookAt(this.cameraTarget);
```

#### Framerate-Independent Camera Damping
The camera smoothly tracks the player without jittering using exponential lerp damping:
```javascript
updateCameraFollow(targetPos, dt) {
  if (!targetPos) return;
  const lerpFactor = 1.0 - Math.exp(-6.0 * dt); // Exponential damp
  this.cameraTarget.lerp(new THREE.Vector3(targetPos.x, 0, targetPos.z), lerpFactor);
  this.camera.position.set(
    this.cameraTarget.x + this.cameraOffset.x,
    this.cameraOffset.y,
    this.cameraTarget.z + this.cameraOffset.z
  );
  this.camera.lookAt(this.cameraTarget);
}
```

### B. Lighting and Atmosphere
* **Punchy Arcade Ambient:** Ambient light at high intensity (`0.95`, `#ffffff`) keeps colors saturated and shadows from appearing pitch black.
* **Key Sun Light:** Directional light (`intensity: 1.15`, `#fffbeb`) cast from `(16, 32, 14)` with `THREE.PCFSoftShadowMap` and shadow bias (`-0.0005`) to prevent shadow acne.
* **Local Warm Point Lights:** Stations (e.g. stone ovens, forges, furnaces) use a flickering `PointLight` with randomized intensity (`base + sin(now * 0.015) * amplitude`) to give life to the scene.
* **Dynamic Weather Fog:** Matching `scene.background` and `scene.fog` (e.g., Azure Cyan `#38bdf8` for sunny; Deep Indigo `#1e3a8a` for storm) creates an instant atmospheric shift.

### C. In-Memory Procedural Canvas Textures
Instead of downloading images, surfaces (checkered tiles, cobblestone, wood deck planks) are painted to a 512x512 canvas and wrapped into a `THREE.CanvasTexture`:
1. **Checkered Patio Tiles:** Alternate colors across grid cells, stroke an inner bevel border, and draw a subtle white highlight sheen.
2. **Timber Deck Planks:** Alternate between 5 wood color tones (`#9a3412`, `#b45309`, `#c2410c`), draw dark 2px grooves between planks, draw randomized wood grain lines, and add fastener screw dots (`ctx.arc`).
3. **Cobblestones:** Nested rounded rectangles with alternating grass/stone tones and dark borders.

> **Texture Rule:** Always configure `tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping;` and call `tex.repeat.set(u, v);` to tile textures cleanly.

### D. Procedural Chibi Character Rig
All characters (player, chef, servers, cleaner, customers, kids) share a single modular character factory function `createChibiHuman(scene, bodyColor, hatType, scale, hairColor)`.

* **Hierarchy Structure:**
  ```text
  charGroup (THREE.Group)
  ├── shadowMesh (CircleGeometry with opacity: 0.38 at y=0.22)
  ├── body (CylinderGeometry with torso color)
  ├── head (SphereGeometry with skin tone)
  │   ├── hair (Sphere & Box bangs)
  │   ├── eyes & eye glints (Spheres)
  │   ├── rosy blush spots (Circles)
  │   ├── smile (Torus half-circle)
  │   └── hat (Chef hat, baseball cap, fedora)
  ├── leftLeg & rightLeg (Cylinders)
  │   └── shoes (Boxes)
  └── leftArm & rightArm (Cylinders)
      └── hands (Spheres)
  ```
* **Sine-Wave Locomotion System:**
  ```javascript
  // Walking animation
  playerWalkCycle += dt * 14 * speedFactor;
  player.leftLeg.rotation.x = Math.sin(playerWalkCycle) * 0.7;
  player.rightLeg.rotation.x = -Math.sin(playerWalkCycle) * 0.7;

  // Natural arm swing vs. carrying posture
  if (isCarrying) {
    player.leftArm.rotation.x = -1.1; // Hold both arms forward
    player.rightArm.rotation.x = -1.1;
  } else {
    player.leftArm.rotation.x = -Math.sin(playerWalkCycle) * 0.6;
    player.rightArm.rotation.x = Math.sin(playerWalkCycle) * 0.6;
  }
  ```

### E. Stack Wobble Physics
Carried items (boxes, crates, potions, ore) are parented to the character's root group and staggered along the Y axis. Dynamic wobble is applied inside the animation loop:
```javascript
playerStack.forEach((itemMesh, index) => {
  // Higher items in the stack sway with greater amplitude
  itemMesh.rotation.z = Math.sin(playerWalkCycle) * (0.05 + index * 0.03);
  itemMesh.rotation.x = Math.cos(playerWalkCycle) * (0.04 + index * 0.02);
});
```

---

## 3. Input Handling & Movement Physics

### A. Isometric 45° Input Transform
When playing an isometric game, pressing "Up" on a keyboard or dragging "Up" on a joystick should move the character towards the top-right / top-left of the 3D grid along the camera's sightline, rather than pure world -Z.
```javascript
// Screen touch/joystick input normalized to [-1, 1]
const nx = stickX / maxRadius;
const ny = stickY / maxRadius;

// Transform into 45-degree isometric world space:
input.x = (nx + ny) * 0.7071; // cos(45°) = 0.7071
input.y = (ny - nx) * 0.7071;
```

### B. Dynamic Virtual Joystick
* The joystick container is hidden until the user touches the screen.
* On `pointerdown`, if the touch does not originate inside an interactive DOM element (header, button, active modal), the joystick base is centered directly at `(e.clientX, e.clientY)`.
* On `pointermove`, the stick thumb is clamped to `maxRadius = 45px`.
* On `pointerup`, input vectors are reset and the joystick hidden.

### C. 2D Clamped AABB Obstacle Collision
Rather than full physics engines (Cannon.js / Rapier), a lightweight 2D AABB bounding box collision list handles all solid station obstacles:
```javascript
function resolveEntityCollision(pos, radius) {
  OBSTACLES.forEach(obs => {
    // Find closest point on box to character center
    const closestX = Math.max(obs.minX, Math.min(obs.maxX, pos.x));
    const closestZ = Math.max(obs.minZ, Math.min(obs.maxZ, pos.z));
    const dx = pos.x - closestX;
    const dz = pos.z - closestZ;
    const distSq = dx * dx + dz * dz;

    if (distSq < radius * radius) {
      const dist = Math.sqrt(distSq);
      if (dist > 0.0001) {
        const overlap = radius - dist;
        pos.x += (dx / dist) * overlap;
        pos.z += (dz / dist) * overlap;
      } else {
        pos.z += radius;
      }
    }
  });
}
```

---

## 4. Interface Architecture (Hybrid DOM + 3D)

### A. High-Contrast DOM Overlay
* The 3D `<canvas>` fills the screen with `position: absolute; inset: 0; z-index: 1`.
* All HUDs, modals, joystick, and speech bubbles live in a pointer-transparent DOM layer above the canvas (`z-index: 10+`).
* Any interactive element (buttons, modal windows) re-enables `pointer-events: auto`.

### B. 3D-to-2D World Projection (Speech Bubbles & Floating Text)
Customer speech bubbles and floating cash notifications are standard HTML elements positioned by projecting 3D world positions through the camera matrix:
```javascript
function projectWorldToScreen(worldPos, yOffset, camera) {
  const tempV = new THREE.Vector3().copy(worldPos);
  tempV.y += yOffset;
  tempV.project(camera);
  
  return {
    x: (tempV.x * 0.5 + 0.5) * window.innerWidth,
    y: (-(tempV.y * 0.5) + 0.5) * window.innerHeight
  };
}
```
* **Why DOM instead of 3D Sprites?** HTML text renders crisply on Retina/high-DPI screens without pixelation, supports native emojis (`🍕`, `😊`, `😠`, `💰`), and can use CSS animations (`@keyframes floatUp`).

### C. Ground Station Rings (`createGroundZoneRing`)
* Station zones have a dual-ring mesh: an outer colored ring and an inner translucent pulsing disc.
* **Preventing Z-Fighting:** Using `polygonOffset: true; polygonOffsetFactor: -2; depthWrite: false;` guarantees rings render smoothly above floor tiles without flickering.
* **Canvas Billboard Sprite:** High-contrast pill label rendered as a 3D Sprite above the ring. Can be configured with `popupOnStep: true` to only reveal detailed prompts when the player walks into proximity.

### D. Step-and-Hold Action Timers
Workstations use physical dwell time:
```javascript
const dist = playerPos.distanceTo(stationPos);
if (dist < 1.3 && canPerformAction) {
  state.actionProgress += dt / duration;
  updateActionRing(state.actionProgress, playerPos);
  if (state.actionProgress >= 1.0) {
    state.actionProgress = 0;
    executeAction();
  }
}
```

---

## 5. Audio Architecture (Synthetic Web Audio)

External sound assets often fail to load, take bandwidth, or suffer from lag. The custom `AudioEngine` synthesizes all sound effects natively:

1. **Beeps & Chimes (`beep(freq, type, duration, gain)`):**
   * Uses `OscillatorNode` with exponential gain ramp to `0.0001` over `duration`.
   * Fast frequency sequences create fanfares: e.g. `[523, 659, 784, 1046]` spaced by `85ms`.
2. **Contactless Card Tap / Coin Till:**
   * High-pitch sine tap (`1760 Hz` followed by `2349 Hz`).
   * Cash till uses rich triangle waves (`987 Hz` followed by `1318 Hz`).
3. **Cooking / Sizzling / Steam (Filtered White Noise):**
   * Creates an audio buffer filled with random values (`Math.random() * 2 - 1`).
   * Passes noise through a `BiquadFilterNode` (`type = 'bandpass'`, `frequency = 850 Hz`).
4. **Haptic Touch:**
   * Calls `navigator.vibrate([pattern])` simultaneously with sound triggers for instant tactile impact on mobile devices.

> **Audio Context Initialization Rule:** Browsers block audio until the first user interaction. Always invoke `audio.init()` (resuming suspended `AudioContext`) on the first `pointerdown` or `keydown`.

---

## 6. Gameplay Systems & Economic Loop

### A. The "Solo Operator to Automated Enterprise" Progression
```text
Phase 1: Founder Solo Grind (Take order -> Cook -> Box -> Serve -> Clean)
Phase 2: First Automation Hire (Chef auto-bakes; Player focuses on front-of-house)
Phase 3: Front-of-House Hire (Server auto-delivers; Kitchen becomes the bottleneck)
Phase 4: Support Hires (Cleaner handles litter/tables; Manager auto-restocks inventory)
Phase 5: Capital Venue Expansions (Terrace dining, Drive-Thru lane, Fleet dispatch)
```

### B. Theory of Constraints & Bottlenecks
In this design, upgrades are not just flat "+10% speed" stat boosts; they create realistic operational tensions:
* If you hire a fast Chef without hiring a Server, the pizza packing counter fills to capacity (`MAX_TABLE_BOXES = 6`), stalling the oven.
* If you launch a high-impact Marketing Campaign without kitchen capacity, queue wait times exceed customer patience (`patience <= 0`), resulting in walkaways and negative Return on Ad Spend (ROAS).

### C. Shift & Macro Volatility Engine
* **90-Second Shift Cycles:** Days progress from Monday to Sunday.
* **Weekly Footfall Multipliers:** Monday slump (`0.55x`) to Friday dinner rush (`1.80x`).
* **Dynamic Weather:** Sunny (`1.25x`), Overcast (`1.0x`), Rainy (`0.50x`), Storm (`0.25x`). In rainy weather, outdoor diners abandon seats and flee.
* **28-Day Payday Cycle:** Week 4 triggers a payday surge (+40% traffic, multi-item bulk orders, high card tipping).
* **Price Elasticity:** Players adjust menu pricing; charging above market reduces footfall but increases per-unit gross margin.

### D. Customer AI State Machine
```text
[Spawn] ──► [Walk to Counter] ──► [Wait in Queue] ──► [Chit Placed] ──► [Wait for Food]
                                          │                                   │
                                   (Patience = 0)                      (Patience = 0)
                                          ▼                                   ▼
                                  [Storm Out: Angry]                  [Walkaway: Lost Sale]
                                                                              │
                                                                   [Order Fulfilled]
                                                                              │
                                                       ┌──────────────────────┴──────────────────────┐
                                                       ▼                                             ▼
                                                [Takeout Leaves]                             [Garden Dine-In]
                                                                                                     │
                                                                                           [Eat Slices (4 steps)]
                                                                                                     │
                                                                                           [Leave Litter Mess]
```

---

## 7. Lessons Learned & Architectural Gotchas

### ⚠️ Pitfall 1: Monolithic Script Bloat
* **Observation:** `game.js` expanded to ~1,900 lines and `scene.js` to ~1,400 lines as more features were introduced.
* **Recommendation for Next Game:** Break down systems earlier into dedicated single-responsibility controllers:
  * `CustomerManager.js` (spawn queues, archetypes, patience ticks)
  * `StationManager.js` (station positions, upgrade triggers, interaction progress)
  * `VehicleManager.js` (drive-thru lane, paths, car archetypes)
  * `CollisionManager.js` (registration and collision resolution)

### ⚠️ Pitfall 2: Modal Re-Opening Loops
* **Observation:** When the player walked onto a station pad that opens a modal (e.g. Rota or Supply Depot), closing the modal would immediately re-trigger it because the player was still standing on the trigger pad.
* **Solution:** Implement a strict per-modal cooldown timer (e.g. `cooldowns.supply = 3.5s`) upon modal close. The trigger is suppressed until the timer expires or the player leaves the zone radius.

### ⚠️ Pitfall 3: Manual Obstacle Bounding Coordinates
* **Observation:** Hardcoding obstacle boxes (`minX, maxX, minZ, maxZ`) manually in an array became tedious when props were moved or new tables unlocked.
* **Recommendation for Next Game:** Attach an obstacle bounding radius or AABB box directly to prop mesh userData during generation (e.g., `propMesh.userData.obstacle = { radius: 1.2 }`), and auto-collect them into the collision system dynamically.

### ⚠️ Pitfall 4: Canvas Z-Fighting
* **Observation:** When placing flat meshes (decals, rings, paths) at `y = 0` or directly on top of floor surfaces, WebGL produces severe flickering artifacts (z-fighting).
* **Solution:** Always apply a small vertical offset (`y = 0.02`), and use Three.js material polygon offsets:
  ```javascript
  material.polygonOffset = true;
  material.polygonOffsetFactor = -2;
  material.polygonOffsetUnits = -2;
  material.depthWrite = false;
  ```

---

## 8. Template & Adaptation Blueprint for Your Next Game

When building your next game with different mechanics and themes (e.g., **Alchemy Potion Shop**, **Blacksmith Armory**, **Coffee Roastery**, **Cyberpunk Repair Bay**, **Space Asteroid Refinement Stall**):

### Theme Translation Matrix

| Game System | Pizza Tycoon (Current) | Blacksmith / Forge (Example) | Alchemy / Potion (Example) | Cyberpunk Mechanic (Example) |
| :--- | :--- | :--- | :--- | :--- |
| **Input / Raw Stock** | Flour, Tomato Sauce, Cheese | Iron Ingot, Coal, Leather | Herbs, Crystal Vials, Moonwater | Circuit Boards, Wiring, Coolant |
| **Primary Workstation** | Prep Counter & Stone Oven | Anvil & Smelting Forge | Cauldron & Distillation Still | Diagnostic Deck & Soldering Arm |
| **Carried Finished Good** | Stack of Pizza Boxes | Stack of Forged Swords/Shields | Stack of Corked Potion Bottles | Repaired Cybernetic Implants |
| **Customer Archetypes** | Commuter, Family, Frugal Local | Town Guard, Wandering Knight, Mercenary | Village Witch, Apprentice, Nobleman | Street Hacker, Corporate Agent, Android |
| **Secondary Expansion** | Outdoor Garden Dining Terrace | Armor Fitting Dummy Hall | Tasting Parlor & Enchantment Altar | Tuning Bay / Vehicle Hover-Dock |
| **Drive-Thru Equivalent** | Side Roadway (Cars, Pickups, SUVs) | Horse-and-Cart Carriage Lane | Flying Broomstick Express Window | Flying Drone Delivery Pad |
| **Support Staff Hires** | Chef, Server, Cleaner, Manager | Apprentice Smith, Runner, Sweeper | Herb Gatherer, Bottler, Alchemist | Drone Welder, Runner, AI Assistant |
| **Operational Spoilage** | Unrefrigerated Cheese Spoilage | Oxidizing Rust on Raw Iron | Evaporation of Volatile Extracts | Battery Degradation / Short Circuit |

### 5-Step Starter Checklist for the New Game
1. **Initialize Core Template:** Copy `index.html`, `js/audio.js`, `js/input.js`, and `js/state.js`.
2. **Define New Theme Palette & Procedural Floor:** In `scene.js`, swap the checkered terracotta canvas generator for cobblestone/metal grating/wood plank tones tailored to your theme.
3. **Customize Character Props:** In `characters.js`, adjust the hats and held item meshes (e.g. replace pizza boxes with potion bottles or iron bars).
4. **Configure the Production Loop:** Set up 3 core stations:
   * Station 1: Order Desk (accept client request)
   * Station 2: Processing Station (crafting progress timer)
   * Station 3: Output Shelf (pickup finished item and deliver)
5. **Add Economic Drivers:** Plug in unit COGS, pricing slider, upgrade hiring rings, and end-of-shift P&L statements.
