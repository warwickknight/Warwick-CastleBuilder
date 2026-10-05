// Engine: Interactive Ground Station Zones & Progress Rings
// Prevents WebGL Z-fighting via polygonOffset and provides billboard canvas text labels.
(function(window) {
  'use strict';

  function createGroundZoneRing(scene, radius, colorHex, labelText, subText, options = {}) {
    const group = new THREE.Group();
    // Do not show floating billboard canvas unless explicitly requested
    const showLabel = options.showLabel === true;
    const popupOnStep = !!options.popupOnStep;
    const yOffset = options.yOffset !== undefined ? options.yOffset : 0.05;

    const hideFloorRings = !!options.hideFloorRings || !!options.noFloorRings;

    let ring = null;
    let disc = null;

    if (!hideFloorRings) {
      // Outer colored ring
      ring = new THREE.Mesh(
        new THREE.RingGeometry(radius - 0.16, radius, 32),
        new THREE.MeshBasicMaterial({
          color: colorHex,
          side: THREE.DoubleSide,
          depthWrite: false,
          polygonOffset: true,
          polygonOffsetFactor: -2,
          polygonOffsetUnits: -2
        })
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = yOffset + 0.01;
      ring.renderOrder = 3;
      group.add(ring);

      // Inner translucent disc
      disc = new THREE.Mesh(
        new THREE.CircleGeometry(radius - 0.17, 32),
        new THREE.MeshBasicMaterial({
          color: colorHex,
          transparent: true,
          opacity: 0.35,
          side: THREE.DoubleSide,
          depthWrite: false,
          polygonOffset: true,
          polygonOffsetFactor: -1,
          polygonOffsetUnits: -1
        })
      );
      disc.rotation.x = -Math.PI / 2;
      disc.position.y = yOffset;
      disc.renderOrder = 2;
      group.add(disc);
    }

    // Dynamic 3D Canvas Billboard Label (Only created if showLabel explicitly requested)
    let sprite = null, canvasText = null, ctx = null, tex = null;
    if (showLabel) {
      canvasText = document.createElement('canvas');
      canvasText.width = 256;
      canvasText.height = 128;
      ctx = canvasText.getContext('2d');

      drawZoneCanvas(ctx, labelText, subText);

      tex = new THREE.CanvasTexture(canvasText);
      sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true }));
      sprite.scale.set(2.4, 1.2, 1);
      sprite.position.y = 1.35;
      if (popupOnStep) {
        sprite.visible = false;
      }
      group.add(sprite);
    }

    scene.add(group);
    return { group, sprite, ring, disc, canvasText, ctx, tex, radius, popupOnStep, showLabel };
  }

  // Authentic Medieval Surveyor Site: Wooden Pegs & Hemp Rope boundary
  function createPeggedSurveyorZone(scene, width, depth, labelText, subText) {
    const group = new THREE.Group();
    const halfW = width * 0.5;
    const halfD = depth * 0.5;

    // 4 Wooden corner stakes
    const pegMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
    const pegGeo = new THREE.CylinderGeometry(0.06, 0.08, 0.55, 6);
    const corners = [
      [-halfW, -halfD], [halfW, -halfD],
      [halfW, halfD], [-halfW, halfD]
    ];

    corners.forEach(([cx, cz]) => {
      const peg = new THREE.Mesh(pegGeo, pegMat);
      peg.position.set(cx, 0.25, cz);
      peg.castShadow = true;
      group.add(peg);
    });

    // Hemp boundary rope connecting stakes
    const ropeMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.95 });
    for (let i = 0; i < 4; i++) {
      const c1 = corners[i];
      const c2 = corners[(i + 1) % 4];
      const ropeLen = Math.hypot(c2[0] - c1[0], c2[1] - c1[1]);
      const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, ropeLen, 4), ropeMat);
      rope.position.set((c1[0] + c2[0]) / 2, 0.35, (c1[1] + c2[1]) / 2);
      rope.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(c2[0] - c1[0], 0, c2[1] - c1[1]).normalize()
      );
      group.add(rope);
    }

    // Wooden surveyor signpost with blueprint info
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 1.2, 6), pegMat);
    post.position.set(0, 0.6, halfD + 0.3);
    group.add(post);

    const board = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.55, 0.08),
      new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.85 })
    );
    board.position.set(0, 1.05, halfD + 0.3);
    group.add(board);

    // Canvas Billboard
    const canvasText = document.createElement('canvas');
    canvasText.width = 256;
    canvasText.height = 128;
    const ctx = canvasText.getContext('2d');
    drawZoneCanvas(ctx, labelText, subText);
    const tex = new THREE.CanvasTexture(canvasText);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true }));
    sprite.scale.set(2.8, 1.4, 1);
    sprite.position.set(0, 1.45, halfD + 0.3);
    group.add(sprite);

    scene.add(group);
    return { group, sprite, radius: Math.max(halfW, halfD), showLabel: true, isPegged: true };
  }


  function drawZoneCanvas(ctx, label, sub) {
    ctx.clearRect(0, 0, 256, 128);
    ctx.fillStyle = 'rgba(11, 17, 32, 0.88)';
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(10, 12, 236, 104, 20);
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.stroke();
    } else {
      ctx.fillRect(10, 12, 236, 104);
    }

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0,0,0,0.9)';
    ctx.shadowBlur = 4;
    ctx.fillText(label, 128, 56);

    if (sub) {
      ctx.fillStyle = '#facc15';
      ctx.font = '700 22px sans-serif';
      ctx.shadowBlur = 3;
      ctx.fillText(sub, 128, 94);
    }
  }

  function updateZoneText(zone, topText, subText) {
    if (!zone || !zone.showLabel || !zone.ctx) return;
    drawZoneCanvas(zone.ctx, topText, subText);
    if (zone.tex) zone.tex.needsUpdate = true;
  }

  window.ZoneManager = {
    createGroundZoneRing,
    createPeggedSurveyorZone,
    updateZoneText
  };
})(window);

