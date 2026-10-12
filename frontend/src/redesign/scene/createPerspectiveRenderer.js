import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { perspectivePose } from "./perspectivePose.js";

function rectangle(width, height, radius, Shape = THREE.Shape) {
  const s = new Shape();
  const x = -width / 2;
  const y = -height / 2;
  s.moveTo(x + radius, y);
  s.lineTo(x + width - radius, y);
  s.quadraticCurveTo(x + width, y, x + width, y + radius);
  s.lineTo(x + width, y + height - radius);
  s.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  s.lineTo(x + radius, y + height);
  s.quadraticCurveTo(x, y + height, x, y + height - radius);
  s.lineTo(x, y + radius);
  s.quadraticCurveTo(x, y, x + radius, y);
  return s;
}
export function createPerspectiveRenderer(host) {
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  renderer.setClearColor(0x000000, 0);
  renderer.domElement.setAttribute("aria-hidden", "true");
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 50);
  camera.position.set(0, 0.15, 8.8);
  camera.lookAt(0, 0, 0);
  const environment = new RoomEnvironment();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environmentMap = pmrem.fromScene(environment, 0.04);
  scene.environment = environmentMap.texture;
  environment.dispose();
  pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0xf1fff8, 0x12393a, 3));
  const key = new THREE.DirectionalLight(0xffffff, 5);
  key.position.set(-3, 5, 5);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x86cfc1, 4);
  rim.position.set(4, 1, -2);
  scene.add(rim);
  const shape = rectangle(2.7, 1.9, 0.16);
  shape.holes.push(rectangle(2.3, 1.5, 0.12, THREE.Path));
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.12,
    bevelEnabled: true,
    bevelThickness: 0.055,
    bevelSize: 0.055,
    bevelSegments: 3,
    steps: 1,
    curveSegments: 10,
  });
  geometry.center();
  const glassGeometry = new THREE.BoxGeometry(2.28, 1.48, 0.045);
  const silver = new THREE.MeshStandardMaterial({
    color: 0xd4e4df,
    metalness: 0.92,
    roughness: 0.22,
  });
  const teal = new THREE.MeshStandardMaterial({
    color: 0x46766f,
    metalness: 0.75,
    roughness: 0.26,
  });
  const glass = new THREE.MeshPhysicalMaterial({
    color: 0x225e52,
    metalness: 0.1,
    roughness: 0.12,
    transparent: true,
    opacity: 0.55,
    clearcoat: 1,
    side: THREE.DoubleSide,
  });
  const assembly = new THREE.Group();
  assembly.scale.setScalar(1.2);
  const target = new THREE.Vector3();
  const panels = [];
  for (let i = 0; i < 4; i++) {
    const panel = new THREE.Group();
    panel.add(new THREE.Mesh(geometry, i % 2 ? teal : silver));
    panel.add(new THREE.Mesh(glassGeometry, glass));
    assembly.add(panel);
    panels.push(panel);
  }
  scene.add(assembly);
  const resize = () => {
    const width = Math.max(1, host.clientWidth),
      height = Math.max(1, host.clientHeight);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.position.z = camera.aspect < 1.25 ? 10 : 8.4;
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
  };
  const sizeObserver = new ResizeObserver(resize);
  sizeObserver.observe(host);
  resize();
  host.appendChild(renderer.domElement);
  let rendered = 0;
  let lastTime = 0;
  return {
    canvas: renderer.domElement,
    render(state, time) {
      const amount =
        state.quiet || state.paused
          ? 1
          : Math.min(1, Math.max(0.04, (time - lastTime) * 7));
      lastTime = time;
      const progress = state.manualProgress ?? state.scrollProgress;
      panels.forEach((panel, index) => {
        const pose = perspectivePose(progress, index);
        panel.position.lerp(target.set(...pose.position), amount);
        panel.rotation.x = THREE.MathUtils.lerp(
          panel.rotation.x,
          pose.rotation[0],
          amount,
        );
        panel.rotation.y = THREE.MathUtils.lerp(
          panel.rotation.y,
          pose.rotation[1],
          amount,
        );
        panel.rotation.z = THREE.MathUtils.lerp(
          panel.rotation.z,
          pose.rotation[2],
          amount,
        );
      });
      const idle =
        state.quiet || state.paused ? 0 : Math.sin(time * 0.38) * 0.14;
      assembly.rotation.set(
        -0.12 + (state.quiet ? 0 : state.pointerY * 0.18),
        -0.42 + state.yaw + idle + (state.quiet ? 0 : state.pointerX * 0.2),
        -0.06,
      );
      assembly.position.y =
        state.quiet || state.paused ? 0 : Math.sin(time * 0.75) * 0.055;
      renderer.render(scene, camera);
      host.dataset.frames = String(++rendered);
    },
    dispose() {
      sizeObserver.disconnect();
      geometry.dispose();
      glassGeometry.dispose();
      silver.dispose();
      teal.dispose();
      glass.dispose();
      environmentMap.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    },
  };
}
