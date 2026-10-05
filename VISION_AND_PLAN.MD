# WARWICK: Castle Builder — Game Design & Technical Specification Document

This document outlines the design, historical framework, system architecture, and production plan for **Warwick: Castle Builder**, an arcade-simulation game inspired by hands-on tycoon mechanics that takes players across historical eras of Warwick Castle.

---

## 1. Executive Summary & Vision

* **Game Title:** Warwick: Castle Builder
* **Stylised Subtitle:** "Castle Builder" branded as a secondary tactile badge beneath "WARWICK".
* **Genre:** Arcade-Idle / Historical Settlement Simulation.
* **Core Pitch:** Play as the leader of the era—starting with Æthelflæd in 914 AD—gathering materials, constructing ramparts and stone towers, training levies, fending off raiders, and launching expeditions across the River Avon to unlock the next chapter of English history.
* **Educational Philosophy:** "Stealth learning through logistics." Players absorb military engineering, geography, and supply-chain realities naturally because game progress depends directly on authentic historical factors (e.g., river choke points, timber-to-stone transitions, food rationing).

---

## 2. Historical Timeline & Era Progression

Progression operates across distinct chronological acts. Reaching 100% completion in one era triggers a milestone sequence where the settlement transitions into the next era's architecture and leader:

```
[Act I: 914 AD] ────────► [Act II: 1068 AD] ──────► [Act III: 1312–1365] ──► [Act IV: 1471 AD]
Æthelflæd                 William the Conqueror     Guy & Thomas Beauchamp    Richard Neville
The Saxon Burh            Motte & Bailey Castle     Stone Curtain & Trebuchet The Kingmaker
(Timber & Earthenwork)    (Mound & Timber Keep)     (Caesar's/Guy's Towers)   (Early Gunpowder)

```

### Act I: 914 AD – The Mercian Burh

* **Leader:** Æthelflæd, Lady of the Mercians (Daughter of Alfred the Great).
* **Strategic Context:** Establishing fortified burhs along the frontier to protect Mercia against Danelaw incursions.
* **Primary Geography:** The high sandstone bluff overlooking the bend of the River Avon.
* **Key Structures:** Earthen ditch, split-timber palisade walls, communal granary, and primitive smithy hearth.
* **Resource Pipeline:** Timber Logs + Reeds $\rightarrow$ Wattle & Daub Walls; Bog Iron $\rightarrow$ Spears & Spud Heads.
* **Threats:** Danish longship raiding parties landing at the river bank.
* **Raiding Targets:** Danish forward camps and skirmish outposts to seize cattle, rations, and tools.

### Act II: 1068 AD – The Norman Motte & Bailey

* **Leader:** William the Conqueror / Henry de Beaumont (1st Earl of Warwick).
* **Strategic Context:** Consolidating Norman royal authority over the English Midlands following the Conquest.
* **Key Structures:** The great motte (earth mound), timber shell keep, outer bailey ditch, gatehouse, and drawbridge.
* **Resource Pipeline:** Earthworks Excavation $\rightarrow$ Timber Baileys $\rightarrow$ Quarry Stone blocks.
* **Threats:** Saxon rebel partisans emerging from the Forest of Arden.
* **Raiding Targets:** Rebel encampments and hostile estates across Warwickshire.

### Act III: 1312–1365 AD – The Stone Bastion

* **Leaders:** Guy de Beauchamp (10th Earl) & Thomas de Beauchamp (11th Earl).
* **Strategic Context:** Baronial power, the capture and trial of Piers Gaveston (1312), and wealth from the Hundred Years' War.
* **Key Structures:** Caesar’s Tower (multi-lobed stone fortress), Guy’s Tower, gatehouse barbican, portcullis, and the massive courtyard counterweight trebuchet.
* **Resource Pipeline:** Chiseled Sandstone + Mortar $\rightarrow$ Curtains & Battlements; Iron Bloom $\rightarrow$ Swords & Crossbows.
* **Threats:** Rival baronial forces and royal siege columns.
* **Raiding Targets:** Rival keeps, supply convoys, and siege encampments.

### Act IV: 1471 AD – The Kingmaker & Gunpowder Age

* **Leader:** Richard Neville, 16th Earl of Warwick ("The Kingmaker").
* **Strategic Context:** Wars of the Roses dynastic struggle (Lancaster vs. York) and the introduction of artillery defenses.
* **Key Structures:** Bear and Clarence Towers, stone gun loops, master armory, and knightly stables.
* **Resource Pipeline:** Gunpowder Ingredients (Saltpeter, Charcoal, Sulfur) + Cast Iron $\rightarrow$ Bombards & Cannons.
* **Threats:** Royal armies and rival baronial factions.
* **Raiding Targets:** Enemy supply trains and regional enemy outposts.

---

## 3. Core Gameplay Loop & Mechanics Mapping

The core loop adapts the tactile arcade-idle mechanics demonstrated in the pizza prototype to settlement defense and warfare:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Physical Interaction Loop                       │
│                                                                        │
│   1. Gather Resources ──► 2. Feed Workshops ──► 3. Arm Troops / Build  │
│      (Timber, Stone)         (Smithy, Mason)       (Spears, Walls)     │
│             ▲                                            │             │
│             │                                            ▼             │
│      5. Spoils & Tech  ◄──  4. Defend / Raid  ◄── 3b. Station on Walls │
│         (Tribute, Coins)       (River Skiffs)         or Muster Gate   │
└────────────────────────────────────────────────────────────────────────┘

```

### Mechanics Translation Matrix

| System Component | Prototype Equivalent (Pizza)

 | Warwick: Castle Builder Implementation |
| --- | --- | --- |
| **Primary Inputs** | Flour, Tomato Sauce, Cheese

 | Timber Logs, Rough Sandstone, Iron Ore, Grain Rations. |
| **Crafting Stations** | Prep Counter & Stone Pizza Oven

 | Woodcutter Pit, Smelting Hearth, Fletcher/Armory Bench, Mason Yard. |
| **Held Items & Carrying** | Stack of pizza boxes with physics wobble

 | Stack of timber beams, stone blocks, shields, or spears carried to build zones.

 |
| **Step-and-Hold Zones** | Circular ground action timer rings

 | Building pads: step onto ring, hold to place resources and erect wall segments.

 |
| **Customer Line & Demand** | Customer queue with patience timer

 | Castle Garrison Hunger/Morale: feeding the granary prevents soldier desertion. |
| **Automation / Staffing** | Chef, Server, Cleaner, Stock Manager

 | Woodcutter Levies (auto-fell trees), Blacksmith (auto-forges weapons), Sergeants (auto-equip guards).

 |
| **Secondary Expansion** | Outdoor Garden Terrace & Drive-Thru

 | River Avon Dock (boats for raids) and Sally Port (cavalry patrols).

 |
| **Operational Friction** | Cheese spoilage, litter, and queue walkouts

 | Palisade wear & tear, siege fire damage, and granary spoilage. |

---

## 4. Technical Architecture

The technical design maintains the **"Zero-Asset Download"** architecture: zero external 3D models (GLTF), zero external texture images, and zero audio files. Everything is rendered through Three.js primitives and canvas textures, with procedural Web Audio sound synthesis.

### A. Directory Structure

```text
warwick-castle-builder/
├── index.html                  # Shell, Tailwind HUD, responsive canvases[cite: 1]
├── css/
│   └── styles.css              # Custom font bindings, animations, badge styling[cite: 1]
├── js/
│   ├── main.js                 # Bootstrap, render loop, state updates[cite: 1]
│   ├── state.js                # Resource balances, era milestones, localStorage save[cite: 1]
│   ├── scene.js                # Isometric Orthographic camera, Avon river, lighting[cite: 1]
│   ├── input.js                # Virtual joystick & keyboard 45-degree isometric transform[cite: 1]
│   ├── audio.js                # Synthetic Web Audio engine (horns, anvils, wood chops)[cite: 1]
│   ├── textures.js             # Canvas-generated procedural textures (cobble, wattle, stone)[cite: 1]
│   ├── entities/
│   │   ├── ChibiLeader.js      # Player leader with carrying stack and wobble physics[cite: 1]
│   │   ├── ChibiSoldier.js     # Levies, guards, and enemy raiders[cite: 1]
│   │   ├── GarrisonManager.js  # Soldier pathing to wall battlements and guard posts
│   │   └── RaidManager.js      # Wave spawning, river skiffs, raid expeditions
│   └── systems/
│       ├── StationManager.js   # Crafting benches, build zones, step-and-hold timers[cite: 1]
│       ├── CollisionManager.js # 2D clamped AABB circular collision resolution[cite: 1]
│       └── EraManager.js       # Historical milestone tracking and era transformations

```

### B. Core Technology Stack

* **3D Engine:** [Three.js](https://threejs.org/) (r128) using an `OrthographicCamera` set at a 45° isometric angle with framerate-independent exponential lerp damping.


* **UI Layer:** HTML5 DOM overlay styled with Tailwind CSS, using *Cinzel* for title/era headings and *Fredoka* / *Inter* for arcade HUD numbers and prompts.


* **Audio & Haptics:** Native Web Audio API synthesizing square/triangle waves and filtered noise buffers; HTML5 `navigator.vibrate` for tactile feedback on mobile devices.


* **Storage:** Clean JSON serialization to `localStorage` preserving era stage, resource amounts, and unlocked building upgrades.



---

## 5. Visual & Audio Engineering

### A. Environment & Lighting

* **Orthographic Isometric Camera:**
* Fixed 45-degree angle offset (`position = [22, 28, 22]`, looking at `[0, 0, 0]`).


* Exponential follow damping: `lerpFactor = 1.0 - Math.exp(-6.0 * dt)`.




* **Avon Bluff Geometry:** Elevated terrain mesh rising from the river plane, showing exposed sandstone strata along the riverbank.
* **Procedural Canvas Textures:**
* *River Avon:* Animated canvas texture with scrolling slate-blue wave ripples and white foam edges.


* *Saxon Timber / Wattle:* Vertical cedar/oak plank stripes with dark nail dots and interwoven wattle panels.


* *Norman Ashlar Stone:* Sandstone grid with chiseled borders, bevel highlights, and randomized weathering variations.




* **Atmospheric Sun & Fog:** High-intensity directional sunlight with soft PCF shadows, paired with distance fog that dynamically shifts between bright morning sun and misty river fog.



### B. Procedural Chibi Characters

* Shared modular character factory based on Three.js primitives:


* **Leader (Æthelflæd):** Torso with Mercian green tunic, golden circlet/crown, and blue cape mesh.
* **Saxon Peasant/Levy:** Simple earth-tone tunic with soft cap and spear.
* **Norman Knight:** Hauberk chainmail texture, conical nasal helmet, and teardrop kite shield.
* **Danish Raider:** Leather armor, banded iron round shield, and bearded axe.


* **Locomotion:** Sine-wave walk cycle controlling legs and arms; switches to holding posture when carrying resources.


* **Resource Wobble Physics:** Stacked materials (timbers, stone, shields) sway on the character's back with amplitude proportional to stack height (`sin(walkCycle) * (0.05 + index * 0.03)`).



### C. Synthetic Web Audio Engine

1. **War Horn (Raid Alert / Expedition Launch):** Two detuned sawtooth oscillators (`146 Hz` and `220 Hz`) with slow 0.3s attack and gradual decay.


2. **Smithy Anvil Strike:** Pure high-frequency sine tone (`1760 Hz` into `2200 Hz`) layered with a short burst of bandpass-filtered noise.


3. **Woodcutting Chop:** Thumping low triangle wave (`90 Hz`) combined with a quick crack of high-frequency white noise.


4. **Wall Segment Completed:** Ascending major triad chime (`[523, 659, 784, 1046] Hz`) synthesized via sine waves.



---

## 6. Combat & Raiding Systems

### A. Settlement Defense (Invasions)

* **Threat Indicators:** A 15-second horn warning sounds, and an off-screen arrow points to the incoming direction along the Avon or forest path.
* **Garrison Defense:** Players place armed levies on ramparts and gatehouses. Stationed bowmen fire projectiles automatically, while spearmen hold the palisade gate.
* **Player Participation:** The player leader can attack directly or prioritize running repair supplies to crumbling wall sections under active assault.

### B. Raiding Expeditions (Offensive)

1. **The Muster Pad:** Step onto the Avon Boat Dock or Gate Muster pad with a minimum quota of equipped troops (e.g., 4 Spearmen, 2 Bowmen).
2. **Launch Expedition:** The camera focuses on the warband as they row or march out.
3. **Expedition Encounter:** The party arrives at an enemy skirmish outpost. Levies engage hostile guards automatically while the player rushes to gather supply crates, stolen silver, and prisoners to draft as laborers.
4. **Return & Trophies:** Returning to Warwick deposits substantial resource windfalls and historical chronicle entries.

---

## 7. Educational Integration: "Stealth Learning"

* **Interactive Chronicle Cards:** Completing key structures triggers a lightweight 4-second non-blocking parchment notification with an authentic historical illustration and an educational takeaway:
> *"914 AD: Æthelflæd utilized the natural sandstone cliffs over the Avon, turning the river into a defensive barrier that halved the palisade perimeter needed to withstand siege."*


* **Material Evolution:** Players learn why Norman motte-and-bailey fortifications were initially built of wood (speed of construction following conquest) before being rebuilt in stone once Norman control solidified.
* **Geographic Relevance:** The layout mirrors the real layout of Warwick Castle: the motte hill, river-side towers, inner courtyard, and outer barbican defenses.

---

## 8. Development Roadmap & Production Phases

| Phase | Duration | Scope & Key Deliverables |
| --- | --- | --- |
| **Phase 1: Foundation & Saxon Era (Act I)** | 2 Weeks | Three.js orthographic engine, Avon terrain bluff, procedural river canvas, virtual joystick, player chibi character with stack carrying, basic tree-chopping, and palisade building loop.

 |
| **Phase 2: Garrison & Raiding Mechanics** | 2 Weeks | Armory workshop, equipping levies with spears/shields, Danish river boat raids, palisade gate defense, and the Avon raid expedition sequence.

 |
| **Phase 3: Automation & Resource Balance** | 1.5 Weeks | Automated NPC workers (woodcutters, blacksmiths, repairers); obstacle collision optimization; balance of food, construction speed, and raid frequency.

 |
| **Phase 4: Era Progression & Act II (Normans)** | 2 Weeks | `EraManager` milestone logic, motte-and-bailey earthwork construction, stone quarrying, Norman knight chibi meshes, and historical chronicle cards. |
| **Phase 5: Audio, Haptics & Polish** | 1.5 Weeks | Web Audio engine integration (horns, anvils, ambient water), haptics, title screen UI overlay, save/load persistence, and performance optimization.

 |