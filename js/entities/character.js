// Entities: Procedural Chibi Character Rig, Locomotion & Item Stacking
// Zero external 3D files needed. Full limb hierarchy with dynamic contact shadows.

function createChibiHuman(scene, bodyColor = 0x2563eb, hatType = 'none', scale = 1.0, hairColor = 0x3e2723) {
  const charGroup = new THREE.Group();

  // 1. Dynamic Contact Shadow on floor
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.55 * scale, 16),
    new THREE.MeshBasicMaterial({ color: 0x0f172a, transparent: true, opacity: 0.38 })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.02;
  charGroup.add(shadow);

  // 2. Torso
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.38 * scale, 0.44 * scale, 0.9 * scale, 14),
    new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.55 })
  );
  body.position.y = 0.85 * scale;
  body.castShadow = true;
  body.receiveShadow = true;
  charGroup.add(body);

  // 3. Head & Face
  const headGeo = new THREE.SphereGeometry(0.42 * scale, 18, 18);
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xffdbac, roughness: 0.55 });
  const head = new THREE.Mesh(headGeo, skinMat);
  head.position.y = 1.62 * scale;
  head.castShadow = true;
  charGroup.add(head);

  // Hair
  const hairMat = new THREE.MeshStandardMaterial({ color: hairColor, roughness: 0.7 });
  const hairBack = new THREE.Mesh(new THREE.SphereGeometry(0.44 * scale, 14, 14, 0, Math.PI * 2, 0, Math.PI * 0.6), hairMat);
  hairBack.position.set(0, 1.66 * scale, -0.04 * scale);
  charGroup.add(hairBack);

  const hairBangs = new THREE.Mesh(new THREE.BoxGeometry(0.48 * scale, 0.16 * scale, 0.22 * scale), hairMat);
  hairBangs.position.set(0, 1.90 * scale, 0.32 * scale);
  charGroup.add(hairBangs);

  // Eyes with white glint highlight
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
  const glintMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  [-0.14, 0.14].forEach(x => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.065 * scale, 8, 8), eyeMat);
    eye.scale.set(1, 1.3, 0.6);
    eye.position.set(x * scale, 1.66 * scale, 0.39 * scale);
    charGroup.add(eye);

    const glint = new THREE.Mesh(new THREE.SphereGeometry(0.025 * scale, 6, 6), glintMat);
    glint.position.set((x + 0.02) * scale, 1.70 * scale, 0.42 * scale);
    charGroup.add(glint);
  });

  // Rosy blush circles
  const blushMat = new THREE.MeshBasicMaterial({ color: 0xf472b6, transparent: true, opacity: 0.65 });
  [-0.23, 0.23].forEach(x => {
    const blush = new THREE.Mesh(new THREE.CircleGeometry(0.06 * scale, 8), blushMat);
    blush.position.set(x * scale, 1.54 * scale, 0.40 * scale);
    charGroup.add(blush);
  });

  // Smile
  const smile = new THREE.Mesh(new THREE.TorusGeometry(0.05 * scale, 0.015 * scale, 6, 8, Math.PI), eyeMat);
  smile.rotation.z = Math.PI;
  smile.position.set(0, 1.51 * scale, 0.41 * scale);
  charGroup.add(smile);

  // Optional Hats
  if (hatType === 'cap') {
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.44 * scale, 0.45 * scale, 0.18 * scale, 14), new THREE.MeshStandardMaterial({ color: 0xdc2626 }));
    cap.position.y = 1.94 * scale;
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.5 * scale, 0.05 * scale, 0.3 * scale), new THREE.MeshStandardMaterial({ color: 0xdc2626 }));
    visor.position.set(0, 1.88 * scale, 0.42 * scale);
    charGroup.add(cap);
    charGroup.add(visor);
  } else if (hatType === 'fedora') {
    const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.45 * scale, 0.45 * scale, 0.24 * scale, 14), new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 }));
    crown.position.y = 2.02 * scale;
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.66 * scale, 0.66 * scale, 0.04 * scale, 14), new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 }));
    brim.position.y = 1.90 * scale;
    charGroup.add(crown);
    charGroup.add(brim);
  }

  // 4. Legs & Shoes
  const legGeo = new THREE.CylinderGeometry(0.12 * scale, 0.12 * scale, 0.5 * scale, 8);
  const legMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 });
  const shoeMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 });

  const leftLeg = new THREE.Mesh(legGeo, legMat); leftLeg.position.set(-0.2 * scale, 0.32 * scale, 0);
  const rightLeg = new THREE.Mesh(legGeo, legMat); rightLeg.position.set(0.2 * scale, 0.32 * scale, 0);
  const leftShoe = new THREE.Mesh(new THREE.BoxGeometry(0.22 * scale, 0.14 * scale, 0.32 * scale), shoeMat); leftShoe.position.set(-0.2 * scale, 0.07 * scale, 0.05 * scale);
  const rightShoe = new THREE.Mesh(new THREE.BoxGeometry(0.22 * scale, 0.14 * scale, 0.32 * scale), shoeMat); rightShoe.position.set(0.2 * scale, 0.07 * scale, 0.05 * scale);

  charGroup.add(leftLeg); charGroup.add(rightLeg);
  charGroup.add(leftShoe); charGroup.add(rightShoe);

  // 5. Arms & Hands
  const armGeo = new THREE.CylinderGeometry(0.1 * scale, 0.1 * scale, 0.55 * scale, 8);
  const armMat = new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.6 });
  const handGeo = new THREE.SphereGeometry(0.11 * scale, 8, 8);

  const leftArm = new THREE.Mesh(armGeo, armMat); leftArm.position.set(-0.52 * scale, 0.85 * scale, 0);
  const leftHand = new THREE.Mesh(handGeo, skinMat); leftHand.position.set(0, -0.28 * scale, 0);
  leftArm.add(leftHand);

  const rightArm = new THREE.Mesh(armGeo, armMat); rightArm.position.set(0.52 * scale, 0.85 * scale, 0);
  const rightHand = new THREE.Mesh(handGeo, skinMat); rightHand.position.set(0, -0.28 * scale, 0);
  rightArm.add(rightHand);

  charGroup.add(leftArm); charGroup.add(rightArm);

  if (scene) scene.add(charGroup);

  return {
    root: charGroup,
    head,
    leftLeg, rightLeg,
    leftArm, rightArm,
    leftShoe, rightShoe,
    scale,
    walkCycle: 0,
    carryingCount: 0,
    carriedStack: []
  };
}

// Update walking limb animation & carrying stack wobble
function updateCharacterAnimation(char, isMoving, dt, speedFactor = 1.0) {
  if (isMoving) {
    char.walkCycle += dt * 14 * speedFactor;
    char.leftLeg.rotation.x = Math.sin(char.walkCycle) * 0.7;
    char.rightLeg.rotation.x = -Math.sin(char.walkCycle) * 0.7;

    if (char.carryingCount > 0) {
      char.leftArm.rotation.x = -1.1;
      char.rightArm.rotation.x = -1.1;
    } else {
      char.leftArm.rotation.x = -Math.sin(char.walkCycle) * 0.6;
      char.rightArm.rotation.x = Math.sin(char.walkCycle) * 0.6;
    }

    // Stack wobble physics
    if (char.carriedStack && char.carriedStack.length > 0) {
      char.carriedStack.forEach((itemMesh, i) => {
        itemMesh.rotation.z = Math.sin(char.walkCycle) * (0.05 + i * 0.03);
        itemMesh.rotation.x = Math.cos(char.walkCycle) * (0.04 + i * 0.02);
      });
    }
  } else {
    char.leftLeg.rotation.x = 0;
    char.rightLeg.rotation.x = 0;
    if (char.carryingCount > 0) {
      char.leftArm.rotation.x = -1.1;
      char.rightArm.rotation.x = -1.1;
    } else {
      char.leftArm.rotation.x = 0;
      char.rightArm.rotation.x = 0;
    }
    if (char.carriedStack) {
      char.carriedStack.forEach(item => { item.rotation.z = 0; item.rotation.x = 0; });
    }
  }
}

window.createChibiHuman = createChibiHuman;
window.updateCharacterAnimation = updateCharacterAnimation;
