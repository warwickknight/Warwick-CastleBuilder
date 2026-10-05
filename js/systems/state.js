// Systems: Game State Container & LocalStorage Persistence for Warwick: Castle Builder
(function(window) {
  'use strict';

  const SAVE_KEY = 'warwick_castle_builder_save_v4';

  const defaultState = {
    // Current Historical Era
    currentAct: 1, // 1: 914 AD (Æthelflæd's Burh), 2: 1068 AD (Norman Motte & Bailey)
    eraTitle: "Act I: 914 AD – The Mercian Burh",
    leaderName: "Æthelflæd, Lady of the Mercians",

    // Resources
    timber: 20,         // Wood logs
    stone: 10,          // Sandstone blocks
    iron: 5,            // Bog iron
    grain: 15,          // Grain rations
    silver: 40.0,       // Royal silver coins / Danegeld tribute
    morale: 85,         // Garrison morale (0-100)

    // Player Carrying
    playerCarrying: 0,
    carryingType: null, // 'timber' | 'stone' | 'spear' | 'grain'
    maxCarryCapacity: 4,

    // Construction Milestones (Sequential Act I Fortification & Stores)
    structures: {
      woodStore: 0,       // Wood / Timber Storage Depot
      rockStore: 0,       // Rock / Sandstone Storage Pallet
      foodStore: 0,       // Food Store & Granary
      campfire: 0,        // 1. Camp Fire Hearth
      tent: 0,            // 2. Singular Command Tent
      spikes: 0,          // 3. Defensive Wooden Spikes
      trench: 0,          // 4. Small Dry Trench / Ditch Earthwork
      fence: 0,           // 5. Small Timber Fence Line
      archery: 0,         // 6. Small Archery Training Range
      smallHut: 0,        // 7. Small Living Hut (+2 Beds)
      palisadeSouth: 0,   // 8. South Gatehouse & Timber Palisade
      watchtower: 0,      // 9. Timber Lookout Tower
      barracks: 0,        // 10. Warrior Barracks Hall (+4 Beds)
      riverDock: 0,       // 11. River Avon Skiff & Mooring Pier
      motteMound: 0,      // 12. Great Earthwork Motte Mound
    },
    placedStructures: [], // Free placement coordinates [{ type, x, z, rotY, timestamp }]


    // Automation Staff Hires
    workers: {
      woodcutter: false,  // Auto-fells trees into timber logs
      stonemason: false,  // Auto-quarries sandstone blocks
      blacksmith: false,  // Auto-forges spears
      porter: false,      // Auto-hauls timber/stone to construction zones
    },

    // Garrison & Combat
    garrison: {
      armedLevies: 0,     // Spearmen guards
      archers: 0,         // Saxon peasant bowmen (recruited at Archery Range)
      housingCapacity: 0, // Need Huts (+2) or Barracks (+4) to expand garrison
      storedSpears: 0,
      activeRaiders: 0,
      raidsRepelled: 0,
      expeditionsWon: 0,
    },

    // Threat & Escalating Incursions
    dayNumber: 1,
    timeOfDay: 0.15,      // 0 = dawn, 0.25 = midday, 0.5 = dusk, 0.72 = midnight, 1.0 = dawn
    dayCycleDuration: 75, // 75 seconds per full 24-hour cycle
    isNight: false,
    nightThreatLevel: 1,  // 1: single wild beast, 2: two beasts, 3: Danish scout, 4: 2 raiders, 5: warband
    nightSpawned: false,

    // Chronicle Cards unlocked
    chronicles: [],

    // Stats
    totalTimberHarvested: 0,
    totalStoneQuarried: 0,
    totalSilverEarned: 0,
    dayNightCycle: 0,     // 0 to 1 time of day
  };

  class GameState {
    constructor() {
      this.data = this.load();
    }

    load() {
      try {
        const saved = localStorage.getItem(SAVE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          return Object.assign({}, defaultState, parsed, {
            structures: Object.assign({}, defaultState.structures, parsed.structures || {}),
            workers: Object.assign({}, defaultState.workers, parsed.workers || {}),
            garrison: Object.assign({}, defaultState.garrison, parsed.garrison || {}),
            placedStructures: Array.isArray(parsed.placedStructures) ? parsed.placedStructures : []
          });
        }
      } catch (e) {
        console.warn('Failed to load save from localStorage', e);
      }
      return JSON.parse(JSON.stringify(defaultState));
    }

    save() {
      try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(this.data));
      } catch (e) {
        console.warn('Failed to persist to localStorage', e);
      }
    }

    reset() {
      localStorage.removeItem(SAVE_KEY);
      this.data = JSON.parse(JSON.stringify(defaultState));
      this.save();
      window.location.reload();
    }

    getCompletionPercentage() {
      const keys = Object.keys(this.data.structures);
      let built = 0;
      keys.forEach(k => {
        if (this.data.structures[k] > 0) built++;
      });
      return Math.round((built / keys.length) * 100);
    }
  }

  window.gameState = new GameState();
  window.state = window.gameState.data;
})(window);
