// Entities: Chibi Leader Rig (Æthelflæd & Norman Earls)
// Features procedural crown/circlet, flowing cape, carrying stack with wobble physics.
(function(window) {
  'use strict';

  function createChibiLeader(scene, options = {}) {
    const charGroup = new THREE.Group();
    const scale = options.scale || 1.0;
    const bodyColor = options.bodyColor || 0x15803d; // Mercian Royal Green
    const capeColor = options.capeColor || 0x1e3a8a; // Royal Indigo Blue

    // 1. Dynamic Contact Shadow on floor
    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(0.58 * scale, 16),
      new THREE.MeshBasicMaterial({ color: 0x0a0f1d, transparent: true, opacity: 0.42 })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.02;
    charGroup.add(shadow);

    // 2. Torso with Belt & Buckle
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.38 * scale, 0.46 * scale, 0.92 * scale, 14),
      new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.6 })
    );
    body.position.y = 0.86 * scale;
    body.castShadow = true;
    body.receiveShadow = true;
    charGroup.add(body);

    // Belt
    const belt = new THREE.Mesh(
      new THREE.CylinderGeometry(0.44 * scale, 0.44 * scale, 0.12 * scale, 14),
      new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.7 })
    );
    belt.position.y = 0.68 * scale;
    charGroup.add(belt);

    // Gold Buckle
    const buckle = new THREE.Mesh(
      new THREE.BoxGeometry(0.12 * scale, 0.10 * scale, 0.06 * scale),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.7, roughness: 0.3 })
    );
    buckle.position.set(0, 0.68 * scale, 0.43 * scale);
    charGroup.add(buckle);

    // Royal Cape (hanging from shoulders)
    const cape = new THREE.Mesh(
      new THREE.BoxGeometry(0.68 * scale, 1.0 * scale, 0.08 * scale),
      new THREE.MeshStandardMaterial({ color: capeColor, roughness: 0.7 })
    );
    cape.position.set(0, 0.85 * scale, -0.38 * scale);
    cape.rotation.x = 0.12; // Slight backwards angle
    cape.castShadow = true;
    charGroup.add(cape);

    // 3. Head & Royal Saxon Circlet Crown
    const headGeo = new THREE.SphereGeometry(0.43 * scale, 18, 18);
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xffdbac, roughness: 0.5 });
    const head = new THREE.Mesh(headGeo, skinMat);
    head.position.y = 1.64 * scale;
    head.castShadow = true;
    charGroup.add(head);

    // Hair (Golden-brown braided bangs)
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.75 });
    const hairBack = new THREE.Mesh(new THREE.SphereGeometry(0.46 * scale, 14, 14, 0, Math.PI * 2, 0, Math.PI * 0.65), hairMat);
    hairBack.position.set(0, 1.68 * scale, -0.05 * scale);
    charGroup.add(hairBack);

    const hairBangs = new THREE.Mesh(new THREE.BoxGeometry(0.52 * scale, 0.16 * scale, 0.24 * scale), hairMat);
    hairBangs.position.set(0, 1.92 * scale, 0.33 * scale);
    charGroup.add(hairBangs);

    // Golden Saxon Circlet / Crown (Æthelflæd's Royal Circlet)
    const circlet = new THREE.Mesh(
      new THREE.TorusGeometry(0.45 * scale, 0.05 * scale, 8, 24),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8, roughness: 0.25 })
    );
    circlet.rotation.x = Math.PI / 2;
    circlet.position.set(0, 1.88 * scale, 0);
    charGroup.add(circlet);

    // Front jewel on circlet (Ruby red)
    const gem = new THREE.Mesh(
      new THREE.SphereGeometry(0.06 * scale, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.2, metalness: 0.5 })
    );
    gem.position.set(0, 1.88 * scale, 0.44 * scale);
    charGroup.add(gem);

    // Eyes with white highlight
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
    const glintMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    [-0.14, 0.14].forEach(x => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.065 * scale, 8, 8), eyeMat);
      eye.scale.set(1, 1.3, 0.6);
      eye.position.set(x * scale, 1.68 * scale, 0.39 * scale);
      charGroup.add(eye);

      const glint = new THREE.Mesh(new THREE.SphereGeometry(0.025 * scale, 6, 6), glintMat);
      glint.position.set((x + 0.02) * scale, 1.72 * scale, 0.42 * scale);
      charGroup.add(glint);
    });

    // Rosy blush spots
    const blushMat = new THREE.MeshBasicMaterial({ color: 0xf472b6, transparent: true, opacity: 0.5 });
    [-0.23, 0.23].forEach(x => {
      const blush = new THREE.Mesh(new THREE.CircleGeometry(0.06 * scale, 8), blushMat);
      blush.position.set(x * scale, 1.56 * scale, 0.40 * scale);
      charGroup.add(blush);
    });

    // Confident smile
    const smile = new THREE.Mesh(new THREE.TorusGeometry(0.05 * scale, 0.015 * scale, 6, 8, Math.PI), eyeMat);
    smile.rotation.z = Math.PI;
    smile.position.set(0, 1.53 * scale, 0.42 * scale);
    charGroup.add(smile);

    // 4. Legs & Boots
    const legGeo = new THREE.CylinderGeometry(0.12 * scale, 0.12 * scale, 0.5 * scale, 8);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x3f2e1e, roughness: 0.8 });
    const bootMat = new THREE.MeshStandardMaterial({ color: 0x24140b, roughness: 0.6 });

    const leftLeg = new THREE.Mesh(legGeo, legMat); leftLeg.position.set(-0.2 * scale, 0.32 * scale, 0);
    const rightLeg = new THREE.Mesh(legGeo, legMat); rightLeg.position.set(0.2 * scale, 0.32 * scale, 0);
    const leftShoe = new THREE.Mesh(new THREE.BoxGeometry(0.22 * scale, 0.16 * scale, 0.34 * scale), bootMat); leftShoe.position.set(-0.2 * scale, 0.08 * scale, 0.05 * scale);
    const rightShoe = new THREE.Mesh(new THREE.BoxGeometry(0.22 * scale, 0.16 * scale, 0.34 * scale), bootMat); rightShoe.position.set(0.2 * scale, 0.08 * scale, 0.05 * scale);

    charGroup.add(leftLeg); charGroup.add(rightLeg);
    charGroup.add(leftShoe); charGroup.add(rightShoe);

    // 5. Arms & Hands
    const armGeo = new THREE.CylinderGeometry(0.1 * scale, 0.1 * scale, 0.55 * scale, 8);
    const armMat = new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.6 });
    const handGeo = new THREE.SphereGeometry(0.11 * scale, 8, 8);

    const leftArm = new THREE.Mesh(armGeo, armMat); leftArm.position.set(-0.54 * scale, 0.86 * scale, 0);
    const leftHand = new THREE.Mesh(handGeo, skinMat); leftHand.position.set(0, -0.28 * scale, 0);
    leftArm.add(leftHand);

    const rightArm = new THREE.Mesh(armGeo, armMat); rightArm.position.set(0.54 * scale, 0.86 * scale, 0);
    const rightHand = new THREE.Mesh(handGeo, skinMat); rightHand.position.set(0, -0.28 * scale, 0);
    rightArm.add(rightHand);

    // Drawn Saxon Seax Sword in leader's right hand
    const bladeGroup = new THREE.Group();
    const hilt = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025 * scale, 0.025 * scale, 0.22 * scale, 6),
      new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.8 })
    );
    const guard = new THREE.Mesh(
      new THREE.BoxGeometry(0.18 * scale, 0.04 * scale, 0.06 * scale),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8, roughness: 0.3 })
    );
    guard.position.y = 0.11 * scale;
    const steel = new THREE.Mesh(
      new THREE.BoxGeometry(0.10 * scale, 0.65 * scale, 0.025 * scale),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.2 })
    );
    steel.position.y = 0.44 * scale;
    bladeGroup.add(hilt);
    bladeGroup.add(guard);
    bladeGroup.add(steel);
    bladeGroup.rotation.x = -Math.PI / 2;
    bladeGroup.position.set(0, -0.28 * scale, 0.2 * scale);
    rightArm.add(bladeGroup);

    charGroup.add(leftArm); charGroup.add(rightArm);

    // Weapon sheath at waist (Saxon Seax Dagger)
    const seax = new THREE.Mesh(
      new THREE.BoxGeometry(0.08 * scale, 0.42 * scale, 0.12 * scale),
      new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.7 })
    );
    seax.rotation.z = -0.35;
    seax.position.set(-0.42 * scale, 0.65 * scale, 0.1 * scale);
    charGroup.add(seax);

    if (scene) scene.add(charGroup);

    return {
      root: charGroup,
      head, cape,
      leftLeg, rightLeg,
      leftArm, rightArm,
      leftShoe, rightShoe,
      bladeGroup,
      scale,
      walkCycle: 0,
      carryingCount: 0,
      carryingType: null,
      carriedStack: [],
      attackAnim: 0
    };
  }

  // Visual stack builder for carried materials:
  // Timber logs, Sandstone blocks, Spears, or Grain sacks
  function updateLeaderStackVisuals(leader, count, itemType) {
    if (!leader || !leader.root) return;

    // Clear previous stack meshes
    while (leader.carriedStack.length > 0) {
      leader.root.remove(leader.carriedStack.pop());
    }

    leader.carryingCount = count;
    leader.carryingType = itemType;
    if (count <= 0) return;

    for (let i = 0; i < count; i++) {
      let itemMesh = null;

      if (itemType === 'timber') {
        // Hexagonal / cylindrical oak timber log
        const logGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.85, 8);
        const logMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.7 });
        itemMesh = new THREE.Mesh(logGeo, logMat);
        itemMesh.rotation.z = Math.PI / 2; // Lie horizontal
        itemMesh.position.set(0, 0.95 + (i * 0.28), 0.52);
      } else if (itemType === 'stone') {
        // Cut sandstone block
        const stoneGeo = new THREE.BoxGeometry(0.68, 0.26, 0.55);
        const stoneMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.8 });
        itemMesh = new THREE.Mesh(stoneGeo, stoneMat);
        itemMesh.position.set(0, 0.95 + (i * 0.30), 0.52);
      } else if (itemType === 'spear') {
        // Forged spear bundle
        const spearGroup = new THREE.Group();
        const shaft = new THREE.Mesh(
          new THREE.CylinderGeometry(0.03, 0.03, 1.4, 6),
          new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 })
        );
        const head = new THREE.Mesh(
          new THREE.ConeGeometry(0.08, 0.24, 6),
          new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.3 })
        );
        head.position.y = 0.75;
        spearGroup.add(shaft);
        spearGroup.add(head);
        spearGroup.rotation.x = -0.4;
        spearGroup.position.set(0, 1.0 + (i * 0.2), 0.45);
        itemMesh = spearGroup;
      } else {
        // Grain sack (rounded burlap bag)
        const bagGeo = new THREE.SphereGeometry(0.28, 8, 8);
        bagGeo.scale(1, 0.8, 1);
        const bagMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, roughness: 0.9 });
        itemMesh = new THREE.Mesh(bagGeo, bagMat);
        itemMesh.position.set(0, 0.92 + (i * 0.32), 0.50);
      }

      itemMesh.castShadow = true;
      leader.root.add(itemMesh);
      leader.carriedStack.push(itemMesh);
    }
  }

  // Locomotion and wobble animation loop
  function updateLeaderAnimation(char, isMoving, dt, speedFactor = 1.0) {
    if (!char) return;

    // Toggle sword visibility (hide sword when carrying resources)
    if (char.bladeGroup) {
      char.bladeGroup.visible = (char.carryingCount === 0);
    }

    // Active weapon attack slash animation
    if (char.attackAnim > 0) {
      char.attackAnim -= dt;
      const progress = Math.max(0, 1.0 - (char.attackAnim / 0.35));
      // Swift overhead slash arc
      char.rightArm.rotation.x = -1.9 + Math.sin(progress * Math.PI) * 1.8;
      char.rightArm.rotation.z = Math.sin(progress * Math.PI) * 0.7;
      char.leftArm.rotation.x = -0.5; // Bracing pose
    } else if (isMoving) {
      char.walkCycle += dt * 14 * speedFactor;
      char.leftLeg.rotation.x = Math.sin(char.walkCycle) * 0.7;
      char.rightLeg.rotation.x = -Math.sin(char.walkCycle) * 0.7;

      // Cape flutter
      if (char.cape) {
        char.cape.rotation.x = 0.18 + Math.sin(char.walkCycle * 2) * 0.12;
      }

      if (char.carryingCount > 0) {
        char.leftArm.rotation.x = -1.15;
        char.rightArm.rotation.x = -1.15;
        char.rightArm.rotation.z = 0;
      } else {
        char.leftArm.rotation.x = -Math.sin(char.walkCycle) * 0.6;
        char.rightArm.rotation.x = Math.sin(char.walkCycle) * 0.6;
        char.rightArm.rotation.z = 0;
      }

      // Stack wobble physics (higher items sway with greater amplitude)
      if (char.carriedStack && char.carriedStack.length > 0) {
        char.carriedStack.forEach((itemMesh, i) => {
          itemMesh.rotation.z = Math.sin(char.walkCycle) * (0.05 + i * 0.035);
          itemMesh.rotation.x = Math.cos(char.walkCycle) * (0.04 + i * 0.025);
        });
      }
    } else {
      char.leftLeg.rotation.x = 0;
      char.rightLeg.rotation.x = 0;
      if (char.cape) char.cape.rotation.x = 0.12;

      if (char.carryingCount > 0) {
        char.leftArm.rotation.x = -1.15;
        char.rightArm.rotation.x = -1.15;
        char.rightArm.rotation.z = 0;
      } else {
        char.leftArm.rotation.x = 0;
        char.rightArm.rotation.x = -0.2; // Ready hand at weapon
        char.rightArm.rotation.z = 0;
      }

      if (char.carriedStack) {
        char.carriedStack.forEach(item => { item.rotation.z = 0; item.rotation.x = 0; });
      }
    }
  }


  function triggerLeaderAttack(char) {
    if (!char) return;
    char.attackAnim = 0.35;
    if (char.bladeGroup) char.bladeGroup.visible = true;
    if (window.audio) window.audio.swordSwing();
  }


  window.ChibiLeader = {
    create: createChibiLeader,
    updateStackVisuals: updateLeaderStackVisuals,
    updateAnimation: updateLeaderAnimation,
    triggerAttack: triggerLeaderAttack
  };
})(window);

