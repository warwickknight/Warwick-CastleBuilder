// Engine: Lightweight 2D AABB Obstacle Collision System
// Handles sliding collisions against counters, walls, stations, and tables.
class CollisionSystem {
  constructor() {
    this.obstacles = [];
  }

  // Add an AABB box obstacle: { minX, maxX, minZ, maxZ }
  addBox(minX, maxX, minZ, maxZ) {
    this.obstacles.push({ minX, maxX, minZ, maxZ });
  }

  // Convenient helper to add a center-based box
  addCenteredBox(x, z, width, depth) {
    const halfW = width / 2;
    const halfD = depth / 2;
    const obs = {
      minX: x - halfW,
      maxX: x + halfW,
      minZ: z - halfD,
      maxZ: z + halfD,
      active: true
    };
    this.obstacles.push(obs);
    return obs;
  }

  removeObstacle(obs) {
    if (!obs) return;
    obs.active = false;
    const idx = this.obstacles.indexOf(obs);
    if (idx !== -1) this.obstacles.splice(idx, 1);
  }

  clear() {
    this.obstacles = [];
  }

  // Resolve circle-vs-box sliding collision with 2-pass relaxation
  resolve(position, radius = 0.42) {
    for (let pass = 0; pass < 2; pass++) {
      for (let i = 0; i < this.obstacles.length; i++) {
        const obs = this.obstacles[i];
        if (obs.active === false) continue;
        const closestX = Math.max(obs.minX, Math.min(obs.maxX, position.x));
        const closestZ = Math.max(obs.minZ, Math.min(obs.maxZ, position.z));
        const dx = position.x - closestX;
        const dz = position.z - closestZ;
        const distSq = dx * dx + dz * dz;

        if (distSq < radius * radius) {
          const dist = Math.sqrt(distSq);
          if (dist > 0.0001) {
            const overlap = radius - dist;
            position.x += (dx / dist) * overlap;
            position.z += (dz / dist) * overlap;
          } else {
            position.z += radius;
          }
        }
      }
    }
  }
}

window.CollisionSystem = CollisionSystem;
window.collisionSystem = new CollisionSystem();
