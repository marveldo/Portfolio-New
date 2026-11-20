import * as THREE from "three";
import { CSS3DObject, CSS3DRenderer } from "three/examples/jsm/renderers/CSS3DRenderer.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { buildDesk } from "./buildDesk";

export const SCREEN_PX = { width: 1280, height: 800 };

type Pose = { pos: THREE.Vector3; look: THREE.Vector3 };

type Options = {
  stage: HTMLElement;
  flat: HTMLElement;
  host: HTMLElement;
  reducedMotion: boolean;
  onFirstFrame?: () => void;
  /** Called once the camera has finished flying into the screen. */
  onArrive?: () => void;
};

export type DeskRuntime = {
  flyTo: (zoomed: boolean, instant?: boolean) => void;
  dispose: () => void;
};

const FLY_MS = 1500;
const SCREEN_FILL = 0.94;
/** Fraction of the viewport width the resting desk is shifted right, to clear space for the hero. */
const HERO_SHIFT = 0.15;
const HERO_PULLBACK = 1.15;
/** Portrait screens: share of the viewport width the monitor fills, and how far below centre it sits (share of height). */
const PORTRAIT_FILL = 0.88;
const PORTRAIT_DROP = 0.08;
/** The camera is much closer in portrait, so the pointer parallax is scaled down to match. */
const PORTRAIT_SWAY = 0.3;
/** Below this aspect ratio the hero stacks over the scene anyway, so the desk stays centred. */
const HERO_MIN_ASPECT = 1.2;

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

export function createDeskRuntime({ stage, flat, host, reducedMotion, onFirstFrame, onArrive }: Options): DeskRuntime {
  const width = () => stage.clientWidth || window.innerWidth;
  const height = () => stage.clientHeight || window.innerHeight;
  const lowPower = (navigator.hardwareConcurrency ?? 8) <= 4;

  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, lowPower ? 1.25 : 1.75));
  renderer.setSize(width(), height());
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  stage.appendChild(renderer.domElement);

  const css = new CSS3DRenderer();
  css.setSize(width(), height());
  css.domElement.className = "css3d";
  stage.appendChild(css.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#0d0c0b");
  scene.fog = new THREE.Fog("#0d0c0b", 6, 13);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTarget = pmrem.fromScene(new RoomEnvironment(), 0.04);
  scene.environment = envTarget.texture;
  scene.environmentIntensity = 0.35;

  const camera = new THREE.PerspectiveCamera(32, width() / height(), 0.05, 50);
  const { screen, screenGlow } = buildDesk(scene, lowPower ? 1024 : 2048);

  const screenZ = screen.center.z + 0.037;
  const screenObject = new CSS3DObject(host);
  screenObject.scale.setScalar(screen.width / SCREEN_PX.width);
  screenObject.position.set(screen.center.x, screen.center.y, screenZ);
  scene.add(screenObject);

  const restLook = new THREE.Vector3(0.05, 0.6, -0.1);
  const restOffset = new THREE.Vector3(1.55, 1.55, 3.7).sub(restLook);
  const rest: Pose = { pos: new THREE.Vector3(), look: restLook.clone() };
  let sway = 1;
  const fitRest = () => {
    sway = camera.aspect < 1 ? PORTRAIT_SWAY : 1;
    if (camera.aspect < 1) {
      // Portrait (phones): frame the monitor itself rather than the whole desk, from the same angle,
      // then lift the camera so the monitor sits low and the hero copy gets the top of the screen.
      const t = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      const d = screen.width / 2 / (t * camera.aspect) / PORTRAIT_FILL;
      rest.look.copy(screen.center);
      rest.pos.copy(screen.center).addScaledVector(restOffset.clone().normalize(), d);
      const forward = new THREE.Vector3().subVectors(rest.look, rest.pos).normalize();
      const right = forward.clone().cross(camera.up).normalize();
      const lift = right.cross(forward).multiplyScalar(PORTRAIT_DROP * 2 * d * t);
      rest.pos.add(lift);
      rest.look.add(lift);
      return;
    }
    const hero = camera.aspect > HERO_MIN_ASPECT;
    // With the hero beside it, pull back a touch so the whole desk still fits in the narrower space.
    const k = Math.max(1, 1.75 / camera.aspect) * (hero ? HERO_PULLBACK : 1);
    rest.look.copy(restLook);
    rest.pos.copy(restLook).addScaledVector(restOffset, k);
    // Pan the resting camera left so the desk sits right of centre, leaving room for the hero copy.
    if (hero) {
      const viewWidth = 2 * restOffset.length() * k * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect;
      const right = new THREE.Vector3().subVectors(restLook, rest.pos).cross(camera.up).normalize();
      const pan = right.multiplyScalar(-HERO_SHIFT * viewWidth);
      rest.pos.add(pan);
      rest.look.add(pan);
    }
  };

  const zoomPose = (): Pose => {
    const t = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const d = Math.max(screen.height / 2 / t, screen.width / 2 / (t * camera.aspect)) / SCREEN_FILL;
    return {
      pos: new THREE.Vector3(screen.center.x, screen.center.y, screenZ + d),
      look: screen.center.clone(),
    };
  };

  fitRest();
  const cur: Pose = { pos: rest.pos.clone(), look: rest.look.clone() };
  let zoomed = false;
  let anim: { from: Pose; to: Pose; t0: number } | null = null;
  let isFlat = false;
  let nudge = 1e-5;
  let needsRender = true;
  let firstFrame = true;
  const mouse = new THREE.Vector2();
  const parallax = new THREE.Vector3();

  const fitFlat = () => {
    const k = Math.min((SCREEN_FILL * height()) / SCREEN_PX.height, (SCREEN_FILL * width()) / SCREEN_PX.width);
    flat.style.transform = `translate(-50%, -50%) scale(${k})`;
  };

  const enterFlat = () => {
    if (isFlat) return;
    isFlat = true;
    fitFlat();
    host.style.transform = "none";
    flat.appendChild(host);
    needsRender = true;
  };

  const leaveFlat = () => {
    if (!isFlat) return;
    isFlat = false;
    host.style.transform = "";
    nudge = -nudge;
    screenObject.position.z = screenZ + nudge;
    needsRender = true;
  };

  const flyTo = (next: boolean, instant = false) => {
    if (next === zoomed && !instant) return;
    leaveFlat();
    zoomed = next;
    const to = next ? zoomPose() : { pos: rest.pos.clone(), look: rest.look.clone() };
    if (instant || reducedMotion) {
      anim = null;
      cur.pos.copy(to.pos);
      cur.look.copy(to.look);
      if (next) {
        enterFlat();
        onArrive?.();
      }
      needsRender = true;
      return;
    }
    anim = { from: { pos: camera.position.clone(), look: cur.look.clone() }, to, t0: performance.now() };
  };

  const onPointer = (e: PointerEvent) => {
    mouse.set(e.clientX / window.innerWidth - 0.5, e.clientY / window.innerHeight - 0.5);
  };

  const onResize = () => {
    camera.aspect = width() / height();
    camera.updateProjectionMatrix();
    renderer.setSize(width(), height());
    css.setSize(width(), height());
    fitRest();
    if (zoomed && !anim) {
      const p = zoomPose();
      cur.pos.copy(p.pos);
      cur.look.copy(p.look);
    } else if (!zoomed && !anim) {
      // Snap to the new resting pose (e.g. a phone rotating) instead of drifting there via parallax.
      cur.pos.copy(rest.pos);
      cur.look.copy(rest.look);
    }
    if (isFlat) fitFlat();
    needsRender = true;
  };

  window.addEventListener("pointermove", onPointer);
  window.addEventListener("resize", onResize);

  let raf = 0;
  const clock = new THREE.Clock();
  const loop = () => {
    raf = requestAnimationFrame(loop);
    const now = performance.now();

    if (anim) {
      const k = Math.min(1, (now - anim.t0) / FLY_MS);
      const e = ease(k);
      cur.pos.lerpVectors(anim.from.pos, anim.to.pos, e);
      cur.look.lerpVectors(anim.from.look, anim.to.look, e);
      if (k === 1) {
        anim = null;
        if (zoomed) {
          enterFlat();
          onArrive?.();
        }
      }
    } else if (!zoomed) {
      const t = clock.getElapsedTime();
      parallax.set(rest.pos.x + mouse.x * 0.9 * sway, rest.pos.y - mouse.y * 0.45 * sway + Math.sin(t * 0.5) * 0.02, rest.pos.z);
      cur.pos.lerp(parallax, reducedMotion ? 1 : 0.06);
    } else if (!needsRender) {
      return;
    }

    camera.position.copy(cur.pos);
    camera.lookAt(cur.look);
    screenGlow.intensity = 1.2 + Math.sin(now * 0.002) * 0.15;
    renderer.render(scene, camera);
    if (!isFlat) css.render(scene, camera);
    needsRender = false;

    if (firstFrame) {
      firstFrame = false;
      onFirstFrame?.();
    }
  };
  camera.position.copy(cur.pos);
  loop();

  const dispose = () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("pointermove", onPointer);
    window.removeEventListener("resize", onResize);
    scene.remove(screenObject);
    host.style.transform = "";
    host.remove();
    scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      const m = mesh.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(m)) m.forEach((x) => x.dispose());
      else m?.dispose();
    });
    envTarget.dispose();
    pmrem.dispose();
    renderer.dispose();
    renderer.domElement.remove();
    css.domElement.remove();
  };

  return { flyTo, dispose };
}
