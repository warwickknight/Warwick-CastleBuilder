// Systems: Procedural Canvas Textures for Warwick: Castle Builder
// Zero external image files needed. All surfaces generated in-memory via HTML5 2D Canvas.
(function(window) {
  'use strict';

  // 1. River Avon Animated Water Texture (100% Seamless Periodic Waves)
  function createRiverWaterCanvas() {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 512;
    const ctx = c.getContext('2d');

    // Uniform rich river water base
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(0, 0, 512, 512);

    // Deep water current flow ribbons (mathematically periodic in X & Y)
    // 16 horizontal bands spaced by 32px (512 / 16 = 32)
    for (let r = 0; r < 16; r++) {
      const yBase = r * 32;
      const ribbonColor = (r % 2 === 0) ? 'rgba(3, 105, 161, 0.40)' : 'rgba(7, 89, 133, 0.35)';

      for (const oy of [-512, 0, 512]) {
        const y0 = yBase + oy;
        if (y0 >= -40 && y0 <= 552) {
          ctx.strokeStyle = ribbonColor;
          ctx.lineWidth = 18;
          ctx.beginPath();
          for (let x = 0; x <= 512; x += 16) {
            const u = (x / 512) * Math.PI * 2;
            // Integer frequencies (2 and 4 full cycles) guarantees u=0 and u=2PI match perfectly
            const y = y0 + Math.sin(u * 2) * 8 + Math.cos(u * 4) * 4;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      }
    }

    // Gentle surface ripples (fine white-tinted water lines)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.24)';
    ctx.lineWidth = 2.5;
    for (let r = 0; r < 16; r++) {
      const yBase = r * 32 + 12;
      for (const oy of [-512, 0, 512]) {
        const y0 = yBase + oy;
        if (y0 >= -30 && y0 <= 542) {
          ctx.beginPath();
          for (let x = 0; x <= 512; x += 16) {
            const u = (x / 512) * Math.PI * 2;
            const y = y0 + Math.sin(u * 3 + r * 0.8) * 5;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      }
    }

    // River foam bubbles & eddies with toroidal wrapping
    ctx.fillStyle = 'rgba(255, 255, 255, 0.38)';
    for (let i = 0; i < 45; i++) {
      const bx = Math.random() * 512;
      const by = Math.random() * 512;
      const rad = 2 + Math.random() * 2.8;

      for (const ox of [-512, 0, 512]) {
        for (const oy of [-512, 0, 512]) {
          const cx = bx + ox;
          const cy = by + oy;
          if (cx + rad >= 0 && cx - rad <= 512 && cy + rad >= 0 && cy - rad <= 512) {
            ctx.beginPath();
            ctx.arc(cx, cy, rad, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }

    return c;
  }

  function createRiverTexture() {
    const canvas = createRiverWaterCanvas();
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(8, 3);
    return { tex, canvas };
  }

  // 2. High Sandstone Bluff & Ashlar Stone
  function createSandstoneTexture() {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 256;
    const ctx = c.getContext('2d');

    // Warwick Sandstone base color
    ctx.fillStyle = '#b45309';
    ctx.fillRect(0, 0, 256, 256);

    // Ashlar stone blocks
    const rows = 8;
    const rowH = 256 / rows;
    const blockW = 64;

    for (let r = 0; r < rows; r++) {
      const y = r * rowH;
      const xOffset = (r % 2 === 0) ? 0 : blockW / 2;

      for (let x = -blockW; x < 256 + blockW; x += blockW) {
        const bx = x + xOffset;
        // Block tone variation
        const shade = Math.floor(Math.random() * 25);
        ctx.fillStyle = `rgb(${180 + shade}, ${115 + shade}, ${50 + Math.floor(shade / 2)})`;
        ctx.fillRect(bx + 2, y + 2, blockW - 4, rowH - 4);

        // Chisel texture specks
        ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
        for (let s = 0; s < 12; s++) {
          ctx.fillRect(bx + 6 + Math.random() * (blockW - 12), y + 4 + Math.random() * (rowH - 8), 2, 2);
        }

        // Inner bevel highlight
        ctx.strokeStyle = 'rgba(255, 240, 200, 0.25)';
        ctx.lineWidth = 1;
        ctx.strokeRect(bx + 3, y + 3, blockW - 6, rowH - 6);
      }

      // Mortar groove lines
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(256, y);
      ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 4);
    return tex;
  }

  // 3. Saxon Split-Timber Logs & Palisade Planks
  function createTimberTexture() {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 256;
    const ctx = c.getContext('2d');

    ctx.fillStyle = '#78350f';
    ctx.fillRect(0, 0, 256, 256);

    const plankW = 32;
    for (let x = 0; x < 256; x += plankW) {
      // Wood plank tone
      const tones = ['#92400e', '#78350f', '#a16207', '#b45309', '#854d0e'];
      ctx.fillStyle = tones[(x / plankW) % tones.length];
      ctx.fillRect(x + 1, 0, plankW - 2, 256);

      // Wood grain lines
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.18)';
      ctx.lineWidth = 1;
      for (let g = 0; g < 4; g++) {
        ctx.beginPath();
        ctx.moveTo(x + 4 + g * 6, 0);
        ctx.lineTo(x + 6 + g * 6, 256);
        ctx.stroke();
      }

      // Iron / wooden peg nails
      ctx.fillStyle = '#1c1917';
      [24, 128, 230].forEach(ny => {
        ctx.beginPath();
        ctx.arc(x + plankW / 2, ny, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // Dark joint border
      ctx.strokeStyle = '#291e13';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, 0, plankW, 256);
    }

    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 4);
    return tex;
  }

  // 4. Thatched Roof & Reeds Texture
  function createThatchTexture() {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 256;
    const ctx = c.getContext('2d');

    ctx.fillStyle = '#ca8a04';
    ctx.fillRect(0, 0, 256, 256);

    // Layered thatch reed lines
    ctx.strokeStyle = '#a16207';
    ctx.lineWidth = 2;
    for (let y = 0; y < 256; y += 10) {
      for (let x = 0; x < 256; x += 16) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + (Math.random() * 8 - 4), y + 14);
        ctx.stroke();
      }
    }

    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(3, 3);
    return tex;
  }

  // 5. High Bluff Vibrant English Meadow & Grass Turf (512x512 Seamless Tileable)
  function createGrassBluffTexture() {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 512;
    const ctx = c.getContext('2d');

    // Rich uniform meadow base tone (No diagonal gradients to eliminate tile edge seams!)
    ctx.fillStyle = '#2f741c';
    ctx.fillRect(0, 0, 512, 512);

    // Toroidal soft tonal variation patches (smoothly wraps across canvas edges)
    for (let p = 0; p < 24; p++) {
      const px = Math.random() * 512;
      const py = Math.random() * 512;
      const rad = 35 + Math.random() * 45;
      const color = (p % 2 === 0) ? 'rgba(20, 83, 45, 0.32)' : 'rgba(77, 124, 15, 0.30)';

      for (const ox of [-512, 0, 512]) {
        for (const oy of [-512, 0, 512]) {
          const cx = px + ox;
          const cy = py + oy;
          if (cx + rad >= 0 && cx - rad <= 512 && cy + rad >= 0 && cy - rad <= 512) {
            const pGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, rad);
            pGrad.addColorStop(0, color);
            pGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = pGrad;
            ctx.beginPath();
            ctx.arc(cx, cy, rad, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }

    // Thousands of textured grass blades with toroidal boundary wrapping
    const bladeColors = ['#22c55e', '#4ade80', '#16a34a', '#15803d', '#65a30d', '#84cc16'];
    for (let i = 0; i < 900; i++) {
      const bx = Math.random() * 512;
      const by = Math.random() * 512;
      const len = 6 + Math.random() * 8;
      const lean = (Math.random() - 0.5) * 5;
      const color = bladeColors[i % bladeColors.length];
      const lw = 1 + (i % 3 === 0 ? 1 : 0);

      for (const ox of [-512, 0, 512]) {
        for (const oy of [-512, 0, 512]) {
          const cx = bx + ox;
          const cy = by + oy;
          if (cx >= -12 && cx <= 524 && cy >= -12 && cy <= 524) {
            ctx.strokeStyle = color;
            ctx.lineWidth = lw;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.quadraticCurveTo(cx + lean * 0.5, cy - len * 0.6, cx + lean, cy - len);
            ctx.stroke();
          }
        }
      }
    }

    // Micro-clover clusters with toroidal wrapping
    for (let cl = 0; cl < 120; cl++) {
      const cx = Math.random() * 512;
      const cy = Math.random() * 512;
      for (const ox of [-512, 0, 512]) {
        for (const oy of [-512, 0, 512]) {
          const tx = cx + ox;
          const ty = cy + oy;
          if (tx >= -10 && tx <= 522 && ty >= -10 && ty <= 522) {
            ctx.fillStyle = '#10b981';
            for (let leaf = 0; leaf < 3; leaf++) {
              const ang = (leaf / 3) * Math.PI * 2;
              ctx.beginPath();
              ctx.arc(tx + Math.cos(ang) * 3.2, ty + Math.sin(ang) * 3.2, 2.6, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      }
    }

    // Tiny wildflower specks with toroidal wrapping
    for (let f = 0; f < 80; f++) {
      const fx = Math.random() * 512;
      const fy = Math.random() * 512;
      const flowerColor = (f % 5 === 0) ? '#ef4444' : (f % 3 === 0) ? '#fde047' : '#ffffff';

      for (const ox of [-512, 0, 512]) {
        for (const oy of [-512, 0, 512]) {
          const tx = fx + ox;
          const ty = fy + oy;
          if (tx >= -8 && tx <= 520 && ty >= -8 && ty <= 520) {
            ctx.fillStyle = flowerColor;
            ctx.beginPath();
            ctx.arc(tx, ty, 2.0, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#ea580c';
            ctx.beginPath();
            ctx.arc(tx, ty, 0.8, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }

    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(16, 12);
    return tex;
  }

  // 6. Tactile Bump Map for Realistic Ground Depth (Seamless)
  function createGrassBumpTexture() {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 256;
    const ctx = c.getContext('2d');

    ctx.fillStyle = '#808080'; // 50% neutral gray base
    ctx.fillRect(0, 0, 256, 256);

    for (let i = 0; i < 350; i++) {
      const bx = Math.random() * 256;
      const by = Math.random() * 256;
      const r = 2 + Math.random() * 5;
      const fill = (i % 2 === 0) ? 'rgba(255, 255, 255, 0.22)' : 'rgba(0, 0, 0, 0.22)';

      for (const ox of [-256, 0, 256]) {
        for (const oy of [-256, 0, 256]) {
          const cx = bx + ox;
          const cy = by + oy;
          if (cx + r >= 0 && cx - r <= 256 && cy + r >= 0 && cy - r <= 256) {
            ctx.fillStyle = fill;
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }

    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(16, 12);
    return tex;
  }

  window.CastleTextures = {
    createRiverTexture,
    createSandstoneTexture,
    createTimberTexture,
    createThatchTexture,
    createGrassBluffTexture,
    createGrassBumpTexture
  };
})(window);
