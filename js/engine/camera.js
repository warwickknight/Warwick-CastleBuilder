// Engine: Isometric Orthographic Camera & Renderer Setup
// Smooth framerate-independent exponential damping follow.
class GameCamera {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x38bdf8); // Sky color (customize per theme)
    this.scene.fog = new THREE.FogExp2(0x38bdf8, 0.012);

    // Orthographic frustum setup for crisp isometric view
    this.frustumD = 11;
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.OrthographicCamera(
      -this.frustumD * aspect, this.frustumD * aspect,
       this.frustumD,         -this.frustumD,
       1, 150
    );

    // Standard 45-degree angle offset
    this.cameraOffset = new THREE.Vector3(20, 26, 20);
    this.cameraTarget = new THREE.Vector3(0, 0, 0);
    this.camera.position.copy(this.cameraOffset);
    this.camera.lookAt(this.cameraTarget);

    window.addEventListener('resize', () => this.onResize());
  }

  onResize() {
    const aspect = window.innerWidth / window.innerHeight;
    this.camera.left = -this.frustumD * aspect;
    this.camera.right = this.frustumD * aspect;
    this.camera.top = this.frustumD;
    this.camera.bottom = -this.frustumD;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  // Smooth framerate-independent exponential lerp follow
  updateFollow(targetPos, dt = 0.016, dampingSpeed = 6.0) {
    if (!targetPos) return;
    const lerpFactor = 1.0 - Math.exp(-dampingSpeed * dt);
    this.cameraTarget.lerp(new THREE.Vector3(targetPos.x, 0, targetPos.z), lerpFactor);
    this.camera.position.set(
      this.cameraTarget.x + this.cameraOffset.x,
      this.cameraOffset.y,
      this.cameraTarget.z + this.cameraOffset.z
    );
    this.camera.lookAt(this.cameraTarget);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}

window.GameCamera = GameCamera;
