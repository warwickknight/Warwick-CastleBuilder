# 🏰 WARWICK: Castle Builder

An authentic, zero-asset 3D arcade simulation where you lead Warwick through the ages—gathering resources, engineering authentic defenses from Saxon earthworks to medieval stone, recruiting archers and garrison guards, repelling Danish invaders, and launching historical expeditions.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-black?style=flat&logo=three.js&logoColor=white)
![Mobile-Friendly](https://img.shields.io/badge/Mobile-Friendly-success?style=flat)
![Zero Assets](https://img.shields.io/badge/Assets-100%25%20Procedural-blue)

---

## ⚔️ Overview

Play as **Æthelflæd, Lady of the Mercians** (daughter of Alfred the Great), who founded the fortified burh of Warwick in 914 AD along the River Avon to guard against the Danelaw incursions.

Build your settlement from the ground up:
* **Dynamic Sandstone Terrain & River Avon:** Experience multi-elevation sandstone bluffs, the northern motte hill, winding cliffside trails, and the flowing River Avon with procedural vertex painting and water effects.
* **Free-Placement Construction:** Place defensive trenches, sharpened stakes, palisades, South Gatehouse, timber watchtowers, living huts, barracks, and archery ranges anywhere in the world with full 360° rotation and obstacle collision.
* **Tactical Archery & Combat System:** Construct an Archery Range to recruit Saxon bowmen directly on site. Archers loose physical projectile arrows in sweeping ballistic arcs against attackers.
* **Danish Raider Invasions:** Sound the war horn and defend the burh with garrison spearmen, archers, and Æthelflæd's seax blade. Defeated foes and wildlife drop realistic lingering battlefield casualties that decay smoothly into the earth.
* **Living Medieval World:** Harvest oak trees down to stumps, quarry sandstone boulders, sift riverbed bog iron, and hunt or avoid procedural wildlife (deer, hopping hares, and night-stalking wolves).
* **Zero External Downloads:** Built purely with HTML5, Three.js, and Web Audio API synthetics. Loads instantaneously on desktop and mobile browsers.

---

## 🕹️ Controls

| Control | Desktop | Mobile / Touch |
| :--- | :--- | :--- |
| **Movement** | `W`, `A`, `S`, `D` or Arrow Keys | Virtual on-screen floating joystick |
| **Interact / Harvest** | Stand near resource or station | Walk into interaction zones |
| **Attack / Defend** | Spacebar / Walk into hostiles | Action button / Proximity auto-strike |
| **Build Menu** | Click **"Build Fort"** button / `B` | Tap floating hammer icon |
| **Rotate Structure** | `Q` / `E` / Rotate handle | Tap rotate buttons on placement HUD |
| **Historical Chronicle** | Click Chronicle scroll icon 📜 | Tap scroll button |

---

## 🏗️ Architecture & File Structure

```text
Warwick - Castle Builder/
├── index.html                  # HTML5 shell, Tailwind CSS, HUD overlay, virtual joystick
├── css/
│   └── styles.css              # Custom styling, animations, floating text, HUD glassmorphism
└── js/
    ├── engine/
    │   ├── audio.js            # Synthetic Web Audio API sounds (war horns, bows, clashes, fanfare)
    │   ├── camera.js           # 45° Isometric camera & exponential follow damping
    │   ├── collision.js        # Multi-pass iterative circle-vs-box sliding obstacle collision solver
    │   ├── input.js            # Dual virtual touch joystick + WASD + 45° isometric projection
    │   ├── terrain.js          # Dynamic multi-elevation Warwick sandstone bluff & River Avon gorge
    │   └── zones.js            # Ground interaction rings & floating projected labels
    ├── entities/
    │   ├── ChibiLeader.js      # Procedural Æthelflæd rig (circlet, cloak, seax, item carrying)
    │   ├── ChibiSoldier.js     # Levies, Danish raiders, bowmen (feathered cap, cloak, quiver, bow)
    │   ├── RaidManager.js      # Incursion AI, ballistic arrow physics, garrison patrols, corpse decay
    │   └── WildlifeManager.js  # Procedural deer, hares, and wolves with flocking/stalking AI
    ├── systems/
    │   ├── BuildingPlacement.js# Free placement grid, footprint collision validation, 360° rotation
    │   ├── EraManager.js       # Historical chronicles & Anglo-Saxon educational milestones
    │   ├── ResourceManager.js  # Oak tree felling, stone quarrying, regrowing timers, stump states
    │   ├── StationManager.js   # Procedural 3D buildings, workshops, storage depots, hire zones
    │   └── state.js            # Reactive game state container & localStorage persistence
    └── main.js                 # 60 FPS loop orchestrating entities, terrain, and interactions
```

---

## 🚀 Getting Started

No build steps or dependencies required!

### Option 1: Live Local Server
Run with any static web server:
```bash
npx serve .
# or
python -m http.server 8080
```
Open `http://localhost:8080` in your web browser.

### Option 2: Direct File Execution
Double-click `index.html` to open directly in Google Chrome, Microsoft Edge, Safari, or Firefox.

---

## 📜 Historical Context

Founded in 914 AD by **Æthelflæd, Lady of the Mercians**, Warwick was established as a strategic earthen *burh* (fortified town) on a sandstone hill overlooking a major crossing point of the River Avon. It served as a critical bastion defending Mercia against Danish Viking armies from the east. Over the subsequent centuries, the simple Saxon earthen ditches and timber palisades evolved into the Norman motte-and-bailey castle and eventually the magnificent medieval stone fortress standing today.

---

## 📄 License

MIT License. Crafted for historical education and arcade game development.
