// Engine: Universal Dual Input Module (Virtual Touch Joystick + Keyboard WASD)
// Transforms screen vectors into 45-degree isometric world coordinates.
(function(window) {
  'use strict';

  const joyBase = document.getElementById('joystick-base');
  const joyStick = document.getElementById('joystick-stick');

  const input = { x: 0, y: 0, active: false };
  let joyTouchId = null;
  let joyCenter = { x: 0, y: 0 };
  const maxRadius = 45;

  // Touch / Pointer listener
  window.addEventListener('pointerdown', (e) => {
    // Ignore touches hitting interactive DOM UI (header, modal, buttons, inputs, drawer, placement hud)
    if (e.target.closest('header, footer, button, input, .modal, .no-joystick, #build-menu-drawer, #placement-hud')) {
      return;
    }

    if (window.buildingPlacement && window.buildingPlacement.isPlacing) {
      window.buildingPlacement.onCanvasPointerDown(e);
      return;
    }

    if (window.audio) window.audio.init();
    joyTouchId = e.pointerId;
    input.active = true;
    joyCenter = { x: e.clientX, y: e.clientY };

    if (joyBase) {
      joyBase.style.left = `${e.clientX}px`;
      joyBase.style.top = `${e.clientY}px`;
      joyBase.style.display = 'block';
    }
  });

  window.addEventListener('pointermove', (e) => {
    if (window.buildingPlacement && window.buildingPlacement.isPlacing) {
      window.buildingPlacement.onCanvasPointerMove(e);
      return;
    }

    if (!input.active || e.pointerId !== joyTouchId) return;
    const dx = e.clientX - joyCenter.x;
    const dy = e.clientY - joyCenter.y;
    const dist = Math.min(Math.hypot(dx, dy), maxRadius);
    const angle = Math.atan2(dy, dx);

    const stickX = Math.cos(angle) * dist;
    const stickY = Math.sin(angle) * dist;
    if (joyStick) {
      joyStick.style.transform = `translate(calc(-50% + ${stickX}px), calc(-50% + ${stickY}px))`;
    }

    const nx = stickX / maxRadius;
    const ny = stickY / maxRadius;

    // 45-degree isometric projection transform
    // Converts 2D screen directions into world X/Z aligned with the 45° camera
    input.x = (nx + ny) * 0.7071;
    input.y = (ny - nx) * 0.7071;
  });

  const resetJoystick = (e) => {
    if (window.buildingPlacement && window.buildingPlacement.isPlacing && e) {
      window.buildingPlacement.onCanvasPointerUp(e);
    }
    input.active = false;
    input.x = 0;
    input.y = 0;
    if (joyBase) joyBase.style.display = 'none';
    joyTouchId = null;
  };

  window.addEventListener('pointerup', resetJoystick);
  window.addEventListener('pointercancel', resetJoystick);

  // Keyboard controls (WASD / Arrow Keys, Space for Attack)
  const keys = {};
  let attackRequested = false;

  window.addEventListener('keydown', (e) => {
    if (window.audio) window.audio.init();
    keys[e.key.toLowerCase()] = true;
    if (e.key === ' ' || e.key.toLowerCase() === 'f') {
      attackRequested = true;
      e.preventDefault();
    }
  });

  window.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
  });

  function triggerAttackAction() {
    if (window.audio) window.audio.init();
    attackRequested = true;
  }

  function isAttackTriggered() {
    if (attackRequested) {
      attackRequested = false;
      return true;
    }
    return false;
  }

  function getKeyboardInput() {
    let kx = 0, ky = 0;
    if (keys['w'] || keys['arrowup']) ky -= 1;
    if (keys['s'] || keys['arrowdown']) ky += 1;
    if (keys['a'] || keys['arrowleft']) kx -= 1;
    if (keys['d'] || keys['arrowright']) kx += 1;

    if (kx !== 0 || ky !== 0) {
      // Rotate 45 degrees into isometric world coordinates
      return { x: (kx + ky) * 0.7071, y: (ky - kx) * 0.7071 };
    }
    return null;
  }

  function getMovementVector() {
    const kbd = getKeyboardInput();
    if (kbd) return kbd;
    return { x: input.x, y: input.y };
  }

  window.GameInput = {
    input,
    getMovementVector,
    isAttackTriggered,
    triggerAttackAction
  };
})(window);

