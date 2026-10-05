// Engine: Synthetic Web Audio & Haptics Engine for Warwick: Castle Builder
// Zero external audio files needed. Mathematically synthesizes medieval tones, horns, and strikes.
class AudioEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.ambientRunning = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  vibrate(pattern) {
    if ('vibrate' in navigator) {
      try { navigator.vibrate(pattern); } catch (e) {}
    }
  }

  beep(freq, type = 'sine', duration = 0.1, gainVal = 0.12) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  // 1. War Horn (Raid Alert / Expedition Launch)
  // Two detuned sawtooth oscillators (146 Hz and 220 Hz) with slow 0.3s attack and gradual decay
  warHorn() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    this.vibrate([100, 50, 150, 50, 200]);

    const now = this.ctx.currentTime;
    const duration = 2.2;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(146.8, now); // D3
    osc1.frequency.linearRampToValueAtTime(144.0, now + duration);

    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(220.0, now); // A3
    osc2.frequency.linearRampToValueAtTime(218.0, now + duration);

    // Warm low-pass filter to sound like an authentic curved animal horn
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(650, now);
    filter.frequency.exponentialRampToValueAtTime(450, now + duration);

    // Slow swell attack, long noble decay
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.24, now + 0.35);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + duration);
    osc2.stop(now + duration);
  }

  // 2. Woodcutting Chop: Low triangle wave (90 Hz) + quick crack of high-frequency white noise
  woodChop() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    this.vibrate(25);

    const now = this.ctx.currentTime;

    // Thump
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.12);
    oscGain.gain.setValueAtTime(0.22, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);

    // Crack of bark/splinter (Noise)
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.08);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1600;

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.18, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    noise.start(now);
  }

  // 3. Smithy Anvil Strike: High-frequency sine tone (1760 Hz into 2200 Hz) layered with bandpass noise
  anvilStrike() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    this.vibrate([20, 25]);

    const now = this.ctx.currentTime;
    const duration = 0.35;

    // Metallic ring
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1760, now);
    osc.frequency.exponentialRampToValueAtTime(2200, now + 0.05);

    gain.gain.setValueAtTime(0.20, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + duration);

    // Metal impact transient
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.04);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const nGain = this.ctx.createGain();
    nGain.gain.setValueAtTime(0.12, now);
    nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    noise.connect(nGain);
    nGain.connect(this.ctx.destination);
    noise.start(now);
  }

  // 4. Stone Mason Chisel: Short crisp click/scrape
  stoneChisel() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    this.vibrate(18);

    this.beep(1250, 'triangle', 0.06, 0.15);
    setTimeout(() => this.beep(850, 'sine', 0.08, 0.12), 40);
  }

  // 5. Wall Segment / Structure Completed Chime (Ascending triad fanfare)
  fanfare() {
    if (!this.enabled) return;
    this.init();
    this.vibrate([40, 30, 50, 30, 90]);
    [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => {
      setTimeout(() => this.beep(f, 'triangle', 0.22, 0.18), i * 90);
    });
  }

  // 6. Silver Coins / Royal Grant
  coin() {
    if (!this.enabled) return;
    this.init();
    this.vibrate([20, 25]);
    this.beep(987, 'triangle', 0.08, 0.15);
    setTimeout(() => this.beep(1318, 'triangle', 0.16, 0.15), 65);
    setTimeout(() => this.beep(1568, 'sine', 0.18, 0.10), 120);
  }

  // 7. Resource Pickup
  pickup() {
    if (!this.enabled) return;
    this.init();
    this.vibrate(15);
    this.beep(620, 'sine', 0.05, 0.12);
  }

  // 8. Resource Placed / Deposited
  place() {
    if (!this.enabled) return;
    this.init();
    this.vibrate(20);
    this.beep(440, 'triangle', 0.08, 0.14);
    setTimeout(() => this.beep(554, 'triangle', 0.10, 0.14), 50);
  }

  // 9. Combat Clash (Sword/Shield clash during raids)
  combatClash() {
    if (!this.enabled) return;
    this.init();
    this.vibrate([30, 20, 40]);
    this.beep(1400, 'sawtooth', 0.08, 0.16);
    setTimeout(() => this.beep(880, 'triangle', 0.12, 0.14), 40);
  }

  // 10. Sword Swing Slash Whoosh
  swordSwing() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    this.vibrate(20);

    const now = this.ctx.currentTime;
    const duration = 0.18;

    // Filtered noise sweep
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(3200, now + 0.08);
    filter.frequency.exponentialRampToValueAtTime(600, now + duration);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.22, now + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(now);
  }

  // 11. Wolf Howl / Night Threat Alert
  wolfHowl() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    this.vibrate([80, 50, 120]);

    const now = this.ctx.currentTime;
    const duration = 1.6;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';

    // Haunting wolf pitch bend: rise up, then long wavering wail
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(580, now + 0.35);
    osc.frequency.exponentialRampToValueAtTime(440, now + 1.2);
    osc.frequency.exponentialRampToValueAtTime(260, now + duration);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + duration);
  }

  // 12. UI Click / Tap
  click() {
    if (!this.enabled) return;
    this.init();
    this.vibrate(10);
    this.beep(800, 'sine', 0.04, 0.10);
  }

  // 14. Tree Felling (Cracking splinter + heavy thud)
  treeFall() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    this.vibrate([40, 60, 100]);

    const now = this.ctx.currentTime;
    // Low wood crackle
    this.beep(85, 'sawtooth', 0.25, 0.20);
    setTimeout(() => {
      if (this.ctx) {
        // Deep thud
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(65, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.35);
        gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.35);
      }
    }, 180);
  }

  // 15. Rock Quarry Break (Crackle and crumbled stone collapse)
  rockBreak() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    this.vibrate([30, 40, 70]);

    this.beep(220, 'triangle', 0.12, 0.22);
    setTimeout(() => this.beep(160, 'sawtooth', 0.18, 0.24), 70);
    setTimeout(() => this.beep(95, 'sine', 0.25, 0.20), 160);
  }

  // 16. Bow String Release (Taut flax/sinew twang)
  bowRelease() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    this.vibrate(25);

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(540, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.14);

    gain.gain.setValueAtTime(0.24, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.14);
  }

  // 17. Arrow Impact (Sharp wooden/target thwack)
  arrowHit() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    this.vibrate(35);

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.08);

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  }
}

window.AudioEngine = AudioEngine;
window.audio = new AudioEngine();

