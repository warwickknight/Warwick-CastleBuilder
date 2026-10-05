// Entities: Procedural Chibi Soldiers & Workers
// Handles Saxon Levies, Danish Raiders, and Automated Settlement Workers
(function(window) {
  'use strict';

  function createSoldier(scene, type = 'levy', scale = 0.95) {
    const charGroup = new THREE.Group();

    // Body tone by faction
    let bodyColor = 0xa16207; // Saxon earth-brown
    let hatType = 'cap';
    let hairColor = 0x271810;

    if (type === 'raider') {
      bodyColor = 0x3f3f46; // Dark iron / leather
      hatType = 'helmet';
      hairColor = 0xb45309; // Reddish Nordic
    } else if (type === 'woodcutter') {
      bodyColor = 0xb45309;
      hatType = 'woodman';
    } else if (type === 'mason') {
      bodyColor = 0x64748b;
      hatType = 'hood';
    } else if (type === 'archer') {
      bodyColor = 0x15803d; // Mercian green archer tunic
      hatType = 'archer';
    }

    // Shadow
    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(0.50 * scale, 14),
      new THREE.MeshBasicMaterial({ color: 0x0f172a, transparent: true, opacity: 0.35 })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.02;
    charGroup.add(shadow);

    // Torso
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35 * scale, 0.42 * scale, 0.85 * scale, 12),
      new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.7 })
    );
    body.position.y = 0.82 * scale;
    body.castShadow = true;
    charGroup.add(body);

    // Head
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xffdbac, roughness: 0.55 });
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.40 * scale, 14, 14), skinMat);
    head.position.y = 1.55 * scale;
    head.castShadow = true;
    charGroup.add(head);

    // Headgear
    if (hatType === 'helmet') {
      // Danish Spangenhelm Helmet
      const helm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.38 * scale, 0.44 * scale, 0.32 * scale, 12),
        new THREE.MeshStandardMaterial({ color: 0x71717a, metalness: 0.7, roughness: 0.4 })
      );
      helm.position.y = 1.80 * scale;
      const nasal = new THREE.Mesh(
        new THREE.BoxGeometry(0.08 * scale, 0.22 * scale, 0.12 * scale),
        new THREE.MeshStandardMaterial({ color: 0x52525b, metalness: 0.8, roughness: 0.3 })
      );
      nasal.position.set(0, 1.64 * scale, 0.38 * scale);
      charGroup.add(helm);
      charGroup.add(nasal);
    } else if (hatType === 'hood') {
      // Mason / Peasant Cowl
      const cowl = new THREE.Mesh(
        new THREE.SphereGeometry(0.44 * scale, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.7),
        new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.8 })
      );
      cowl.position.set(0, 1.58 * scale, -0.02 * scale);
      charGroup.add(cowl);
    } else if (hatType === 'archer') {
      // Archer Cowl Cap
      const cap = new THREE.Mesh(
        new THREE.ConeGeometry(0.38 * scale, 0.38 * scale, 8),
        new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.8 })
      );
      cap.rotation.x = -0.22;
      cap.position.set(0, 1.82 * scale, -0.05 * scale);
      charGroup.add(cap);

      // Quiver with arrows strapped to back
      const quiver = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12 * scale, 0.10 * scale, 0.72 * scale, 8),
        new THREE.MeshStandardMaterial({ color: 0x573c24, roughness: 0.9 })
      );
      quiver.rotation.z = -0.32;
      quiver.position.set(-0.16 * scale, 0.95 * scale, -0.32 * scale);
      charGroup.add(quiver);

      // Arrow shafts in quiver
      const fletchMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.6 });
      [-0.04, 0.04].forEach(fx => {
        const arrow = new THREE.Mesh(new THREE.CylinderGeometry(0.015 * scale, 0.015 * scale, 0.35 * scale, 4), fletchMat);
        arrow.position.set((-0.16 + fx) * scale, 1.35 * scale, -0.34 * scale);
        charGroup.add(arrow);
      });
    } else {
      // Saxon soft cloth cap
      const cap = new THREE.Mesh(
        new THREE.CylinderGeometry(0.39 * scale, 0.43 * scale, 0.20 * scale, 12),
        new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 })
      );
      cap.position.y = 1.80 * scale;
      charGroup.add(cap);
    }

    // Eyes
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x18181b });
    [-0.13, 0.13].forEach(x => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.06 * scale, 6, 6), eyeMat);
      eye.position.set(x * scale, 1.58 * scale, 0.37 * scale);
      charGroup.add(eye);
    });

    // Legs
    const legMat = new THREE.MeshStandardMaterial({ color: 0x292524, roughness: 0.8 });
    const leftLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.11 * scale, 0.11 * scale, 0.48 * scale, 8), legMat);
    const rightLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.11 * scale, 0.11 * scale, 0.48 * scale, 8), legMat);
    leftLeg.position.set(-0.18 * scale, 0.28 * scale, 0);
    rightLeg.position.set(0.18 * scale, 0.28 * scale, 0);
    charGroup.add(leftLeg);
    charGroup.add(rightLeg);

    // Arms
    const armMat = new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.7 });
    const leftArm = new THREE.Mesh(new THREE.CylinderGeometry(0.09 * scale, 0.09 * scale, 0.50 * scale, 8), armMat);
    const rightArm = new THREE.Mesh(new THREE.CylinderGeometry(0.09 * scale, 0.09 * scale, 0.50 * scale, 8), armMat);
    leftArm.position.set(-0.48 * scale, 0.80 * scale, 0);
    rightArm.position.set(0.48 * scale, 0.80 * scale, 0);
    charGroup.add(leftArm);
    charGroup.add(rightArm);

    // Weapon / Prop
    let weaponGroup = new THREE.Group();
    let nockedArrow = null;
    if (type === 'levy') {
      // Saxon Spear & Round Shield
      const spearShaft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03 * scale, 0.03 * scale, 1.6 * scale, 6),
        new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 })
      );
      const spearHead = new THREE.Mesh(
        new THREE.ConeGeometry(0.08 * scale, 0.28 * scale, 6),
        new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.3 })
      );
      spearHead.position.y = 0.85 * scale;
      const spear = new THREE.Group();
      spear.add(spearShaft);
      spear.add(spearHead);
      spear.position.set(0.18 * scale, 0.15 * scale, 0.25 * scale);
      rightArm.add(spear);

      // Round Wooden Shield on left arm
      const shield = new THREE.Mesh(
        new THREE.CylinderGeometry(0.36 * scale, 0.36 * scale, 0.06 * scale, 14),
        new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6 }) // Mercian green
      );
      shield.rotation.z = Math.PI / 2;
      shield.position.set(-0.15 * scale, -0.10 * scale, 0.15 * scale);
      leftArm.add(shield);
    } else if (type === 'raider') {
      // Danish Bearded Battle Axe
      const axeHandle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03 * scale, 0.03 * scale, 1.1 * scale, 6),
        new THREE.MeshStandardMaterial({ color: 0x573c24, roughness: 0.8 })
      );
      const axeBlade = new THREE.Mesh(
        new THREE.BoxGeometry(0.28 * scale, 0.22 * scale, 0.04 * scale),
        new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.3 })
      );
      axeBlade.position.set(0.10 * scale, 0.45 * scale, 0);
      const axe = new THREE.Group();
      axe.add(axeHandle);
      axe.add(axeBlade);
      axe.position.set(0.16 * scale, -0.05 * scale, 0.2 * scale);
      rightArm.add(axe);

      // Iron-banded Viking Shield
      const vShield = new THREE.Mesh(
        new THREE.CylinderGeometry(0.38 * scale, 0.38 * scale, 0.06 * scale, 14),
        new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.5 }) // Blood-red shield
      );
      vShield.rotation.z = Math.PI / 2;
      vShield.position.set(-0.15 * scale, -0.10 * scale, 0.15 * scale);
      leftArm.add(vShield);
    } else if (type === 'woodcutter') {
      // Woodsman Felling Axe
      const fellingAxe = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03 * scale, 0.03 * scale, 0.9 * scale, 6),
        new THREE.MeshStandardMaterial({ color: 0x78350f })
      );
      const blade = new THREE.Mesh(
        new THREE.BoxGeometry(0.22 * scale, 0.18 * scale, 0.05 * scale),
        new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.7 })
      );
      blade.position.set(0.08 * scale, 0.35 * scale, 0);
      const axeG = new THREE.Group();
      axeG.add(fellingAxe);
      axeG.add(blade);
      axeG.position.set(0.12 * scale, -0.1 * scale, 0.2 * scale);
      rightArm.add(axeG);
    } else if (type === 'mason') {
      // Stonemason Pickaxe
      const pickHandle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03 * scale, 0.03 * scale, 0.85 * scale, 6),
        new THREE.MeshStandardMaterial({ color: 0x78350f })
      );
      const pickHead = new THREE.Mesh(
        new THREE.BoxGeometry(0.32 * scale, 0.06 * scale, 0.06 * scale),
        new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 })
      );
      pickHead.position.set(0, 0.38 * scale, 0);
      const pickG = new THREE.Group();
      pickG.add(pickHandle);
      pickG.add(pickHead);
      pickG.position.set(0.12 * scale, -0.1 * scale, 0.2 * scale);
      rightArm.add(pickG);
    } else if (type === 'archer') {
      // Yew Longbow in Left Hand
      const bowGroup = new THREE.Group();
      const bowStave = new THREE.Mesh(
        new THREE.TorusGeometry(0.48 * scale, 0.025 * scale, 5, 10, Math.PI * 0.7),
        new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.7 })
      );
      bowStave.rotation.y = Math.PI / 2;
      bowStave.rotation.z = Math.PI * 0.65;
      bowGroup.add(bowStave);

      const string = new THREE.Mesh(
        new THREE.CylinderGeometry(0.006 * scale, 0.006 * scale, 0.85 * scale, 4),
        new THREE.MeshBasicMaterial({ color: 0xf1f5f9 })
      );
      string.position.set(-0.06 * scale, 0, 0);
      bowGroup.add(string);

      bowGroup.position.set(-0.15 * scale, 0.05 * scale, 0.25 * scale);
      leftArm.add(bowGroup);

      // Notched arrow in right arm
      const arrow = new THREE.Mesh(
        new THREE.CylinderGeometry(0.012 * scale, 0.012 * scale, 0.75 * scale, 4),
        new THREE.MeshStandardMaterial({ color: 0xd4a373 })
      );
      arrow.rotation.x = Math.PI / 2;
      arrow.position.set(0.04 * scale, 0.08 * scale, 0.25 * scale);
      rightArm.add(arrow);
      nockedArrow = arrow;
    }

    // Archers get the same polished look as the leader (hair, face, belt, cloak, boots)
    let archerCape = null;
    if (type === 'archer') {
      const s = scale;

      // Hair peeking out from under the cap
      const hairMat = new THREE.MeshStandardMaterial({ color: 0x5b3a1e, roughness: 0.75 });
      const hairBack = new THREE.Mesh(new THREE.SphereGeometry(0.41 * s, 14, 14, 0, Math.PI * 2, 0, Math.PI * 0.55), hairMat);
      hairBack.position.set(0, 1.55 * s, -0.08 * s);
      charGroup.add(hairBack);
      const bangs = new THREE.Mesh(new THREE.BoxGeometry(0.46 * s, 0.12 * s, 0.2 * s), hairMat);
      bangs.position.set(0, 1.76 * s, 0.30 * s);
      charGroup.add(bangs);

      // Red & white feather tucked in the cap
      const feather = new THREE.Mesh(
        new THREE.ConeGeometry(0.05 * s, 0.5 * s, 5),
        new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.6 })
      );
      feather.position.set(0.25 * s, 1.98 * s, -0.05 * s);
      feather.rotation.z = -0.9;
      charGroup.add(feather);

      // Eye glints, rosy cheeks and a friendly smile
      const glintMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      [-0.13, 0.13].forEach(x => {
        const glint = new THREE.Mesh(new THREE.SphereGeometry(0.022 * s, 6, 6), glintMat);
        glint.position.set((x + 0.02) * s, 1.60 * s, 0.425 * s);
        charGroup.add(glint);
      });
      const blushMat = new THREE.MeshBasicMaterial({ color: 0xf472b6, transparent: true, opacity: 0.45 });
      [-0.22, 0.22].forEach(x => {
        const blush = new THREE.Mesh(new THREE.CircleGeometry(0.055 * s, 8), blushMat);
        blush.position.set(x * s, 1.50 * s, 0.335 * s);
        blush.rotation.y = x < 0 ? -0.5 : 0.5;
        charGroup.add(blush);
      });
      const smile = new THREE.Mesh(
        new THREE.TorusGeometry(0.045 * s, 0.013 * s, 6, 8, Math.PI),
        new THREE.MeshBasicMaterial({ color: 0x18181b })
      );
      smile.rotation.z = Math.PI;
      smile.position.set(0, 1.46 * s, 0.395 * s);
      charGroup.add(smile);

      // Leather belt with a gold buckle and a hip dagger
      const belt = new THREE.Mesh(
        new THREE.CylinderGeometry(0.42 * s, 0.44 * s, 0.11 * s, 14),
        new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.7 })
      );
      belt.position.y = 0.66 * s;
      charGroup.add(belt);
      const buckle = new THREE.Mesh(
        new THREE.BoxGeometry(0.11 * s, 0.09 * s, 0.05 * s),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.7, roughness: 0.3 })
      );
      buckle.position.set(0, 0.66 * s, 0.43 * s);
      charGroup.add(buckle);
      const dagger = new THREE.Mesh(
        new THREE.BoxGeometry(0.07 * s, 0.34 * s, 0.1 * s),
        new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.7 })
      );
      dagger.position.set(-0.4 * s, 0.6 * s, 0.1 * s);
      dagger.rotation.z = -0.35;
      charGroup.add(dagger);

      // Hooded shoulder cloak in forest green
      const cloakMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.8 });
      archerCape = new THREE.Mesh(new THREE.BoxGeometry(0.66 * s, 0.66 * s, 0.07 * s), cloakMat);
      archerCape.position.set(0, 0.92 * s, -0.5 * s);
      archerCape.rotation.x = 0.12;
      archerCape.castShadow = true;
      charGroup.add(archerCape);
      const collar = new THREE.Mesh(
        new THREE.TorusGeometry(0.34 * s, 0.09 * s, 8, 16),
        cloakMat
      );
      collar.rotation.x = Math.PI / 2;
      collar.position.y = 1.2 * s;
      charGroup.add(collar);

      // Hands on arms
      const handGeo = new THREE.SphereGeometry(0.10 * s, 8, 8);
      [leftArm, rightArm].forEach(arm => {
        const hand = new THREE.Mesh(handGeo, skinMat);
        hand.position.set(0, -0.27 * s, 0);
        arm.add(hand);
      });

      // Leather bracer on the bow arm
      const bracer = new THREE.Mesh(
        new THREE.CylinderGeometry(0.105 * s, 0.105 * s, 0.18 * s, 8),
        new THREE.MeshStandardMaterial({ color: 0x573c24, roughness: 0.8 })
      );
      bracer.position.set(0, -0.14 * s, 0);
      leftArm.add(bracer);

      // Boots that follow the legs
      const bootMat = new THREE.MeshStandardMaterial({ color: 0x24140b, roughness: 0.6 });
      [leftLeg, rightLeg].forEach(leg => {
        const boot = new THREE.Mesh(new THREE.BoxGeometry(0.22 * s, 0.16 * s, 0.32 * s), bootMat);
        boot.position.set(0, -0.2 * s, 0.05 * s);
        leg.add(boot);
      });
    }

    if (scene) scene.add(charGroup);

    return {
      root: charGroup,
      leftLeg, rightLeg,
      leftArm, rightArm,
      nockedArrow,
      cape: archerCape,
      type,
      scale,
      walkCycle: 0,
      health: 100,
      attackClock: 0,
      state: 'idle', // 'idle' | 'walking' | 'attacking' | 'working'
      targetPos: null,
    };
  }

  function updateSoldierAnimation(soldier, isMoving, dt) {
    if (!soldier || !soldier.root) return;

    // Attack / harvesting swing animation
    if (soldier.attackClock && soldier.attackClock > 0) {
      soldier.attackClock -= dt;
      if (soldier.type === 'woodcutter') {
        soldier.rightArm.rotation.x = -1.4 + Math.sin(soldier.attackClock * 16) * 0.9;
      } else if (soldier.type === 'archer') {
        soldier.rightArm.rotation.x = -0.7;
        soldier.rightArm.rotation.z = -0.4;
        soldier.leftArm.rotation.x = -0.7;
      } else if (soldier.type === 'mason') {
        soldier.rightArm.rotation.x = -1.3 + Math.sin(soldier.attackClock * 16) * 0.8;
      } else {
        soldier.rightArm.rotation.x = -0.9 + Math.sin(soldier.attackClock * 16) * 0.7;
      }
      return;
    }

    if (isMoving) {
      soldier.walkCycle += dt * 12;
      if (soldier.cape) soldier.cape.rotation.x = 0.2 + Math.sin(soldier.walkCycle * 2) * 0.12;
      soldier.leftLeg.rotation.x = Math.sin(soldier.walkCycle) * 0.65;
      soldier.rightLeg.rotation.x = -Math.sin(soldier.walkCycle) * 0.65;
      soldier.leftArm.rotation.x = -Math.sin(soldier.walkCycle) * 0.5;
      soldier.rightArm.rotation.x = Math.sin(soldier.walkCycle) * 0.5;
    } else {
      if (soldier.cape) soldier.cape.rotation.x = 0.12;
      soldier.leftLeg.rotation.x = 0;
      soldier.rightLeg.rotation.x = 0;
      soldier.leftArm.rotation.x = 0;
      soldier.rightArm.rotation.x = 0;
    }
  }

  window.ChibiSoldier = {
    create: createSoldier,
    updateAnimation: updateSoldierAnimation,
    triggerAttack: function(soldier) {
      if (soldier) soldier.attackClock = 0.45;
    }
  };
})(window);
