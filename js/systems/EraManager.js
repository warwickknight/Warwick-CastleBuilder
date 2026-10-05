// Systems: EraManager & Historical Chronicle Cards for Warwick: Castle Builder
// Implements "Stealth learning through logistics" with authentic medieval chronicles.
(function(window) {
  'use strict';

  const CHRONICLES = {
    start: {
      id: 'start',
      title: "914 AD: Æthelflæd's Mercian Burh",
      era: "Act I — The Saxon Frontier",
      text: "Æthelflæd, Lady of the Mercians and daughter of Alfred the Great, establishes a fortified 'burh' atop the high sandstone bluff overlooking the River Avon to defend Mercia against Danish invaders.",
      takeaway: "💡 Strategic Geography: The steep river bluff created a natural obstacle, dramatically reducing the defensive perimeter needed to resist siege."
    },
    palisadeSouth: {
      id: 'palisadeSouth',
      title: "Split-Timber Stockades",
      era: "Saxon Military Engineering",
      text: "The south gate and ramparts were constructed with split-oak logs sunk into earthen trenches. Heavy cross-beams prevented battering and longship axes from penetrating the curtain.",
      takeaway: "💡 Speed of Defense: Wood allowed rapid fortification within months, protecting local farmers from hit-and-run river raids."
    },
    watchtower: {
      id: 'watchtower',
      title: "Rampart Lookout Towers",
      era: "Early Warning Defenses",
      text: "From elevated lookout platforms along the Avon gorge, Saxon sentries could spot approaching longships miles downriver, sounding the bronze war horn to muster town levies.",
      takeaway: "💡 Reconnaissance: River bends offered sightlines that denied surprise landings by Norse raiders."
    },
    riverDock: {
      id: 'riverDock',
      title: "The Avon River Lifeline",
      era: "Mercian Fluvial Trade & Raiding",
      text: "The River Avon connected Warwick to regional trade networks across the Midlands. Shallow-draft river skiffs allowed both fishing and counter-raids against hostile encampments.",
      takeaway: "💡 Waterway Dominance: Controlling the river crossing made Warwick the economic gateway between Mercia and Wessex."
    },
    motteMound: {
      id: 'motteMound',
      title: "1068 AD: The Norman Motte Earthworks",
      era: "Dawn of the Norman Castle",
      text: "Following the Norman Conquest, William the Conqueror ordered the construction of a massive motte (earth mound) at Warwick, transforming the Saxon burh into a formidable royal fortress.",
      takeaway: "💡 Vertical Dominance: Mottes concentrated military power at height, intimidating the surrounding countryside and repelling Saxon rebellions."
    },
    barracks: {
      id: 'barracks',
      title: "The Saxon Warrior Hall & Fyrd Garrison",
      era: "Saxon Military Organization",
      text: "Before a burh could muster a standing garrison of spearmen and housecarls, warriors required quarters, hearth fires, and a communal longhouse to maintain discipline and readiness.",
      takeaway: "💡 Logistics of Manpower: Fortifications require soldiers, and soldiers require housing and rations to defend the ramparts."
    }
  };

  class EraManager {
    constructor() {
      this.cardContainer = document.getElementById('chronicle-modal');
      this.cardTitle = document.getElementById('chronicle-title');
      this.cardEra = document.getElementById('chronicle-era');
      this.cardText = document.getElementById('chronicle-text');
      this.cardTakeaway = document.getElementById('chronicle-takeaway');
    }

    triggerChronicle(cardId) {
      const card = CHRONICLES[cardId];
      if (!card) return;

      const state = window.state;
      if (!state.chronicles) state.chronicles = [];
      if (!state.chronicles.includes(cardId)) {
        state.chronicles.push(cardId);
        state.silver += 20.0; // Chronicle discovery bonus
        state.morale = Math.min(100, state.morale + 10);
      }

      this.showChronicleCard(card);
    }

    showChronicleCard(card) {
      if (!this.cardContainer) return;

      if (this.cardTitle) this.cardTitle.innerText = card.title;
      if (this.cardEra) this.cardEra.innerText = card.era;
      if (this.cardText) this.cardText.innerText = card.text;
      if (this.cardTakeaway) this.cardTakeaway.innerText = card.takeaway;

      this.cardContainer.classList.remove('hidden');
      if (window.audio) window.audio.coin();
    }

    hideChronicleCard() {
      if (this.cardContainer) {
        this.cardContainer.classList.add('hidden');
      }
    }
  }

  window.EraManager = EraManager;
  window.eraManager = new EraManager();
})(window);
