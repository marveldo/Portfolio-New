import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

export type ScreenSpec = {
  width: number;
  height: number;
  center: THREE.Vector3;
};

export type Desk = {
  screen: ScreenSpec;
  screenGlow: THREE.PointLight;
};

const mat = (color: string, roughness = 0.6, metalness = 0) =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness });

export function buildDesk(scene: THREE.Scene, shadowSize = 2048): Desk {
  const add = <T extends THREE.Object3D>(obj: T, x: number, y: number, z: number, shadow = true): T => {
    obj.position.set(x, y, z);
    obj.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        o.castShadow = shadow;
        o.receiveShadow = true;
      }
    });
    scene.add(obj);
    return obj;
  };

  add(new THREE.Mesh(new THREE.PlaneGeometry(30, 12), mat("#16130f", 0.95)), 0, 2, -1.6, false);
  const floor = add(new THREE.Mesh(new THREE.PlaneGeometry(30, 30), mat("#0f0d0b", 1)), 0, -0.9, 0, false);
  floor.rotation.x = -Math.PI / 2;

  add(new THREE.Mesh(new RoundedBoxGeometry(4.6, 0.09, 2.2, 3, 0.02), mat("#3a2c22", 0.55)), 0, -0.045, 0.1);
  for (const x of [-2.05, 2.05]) {
    add(new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.86, 1.9), mat("#211a15", 0.7)), x, -0.52, 0.1);
  }

  const screen: ScreenSpec = { width: 1.6, height: 1.0, center: new THREE.Vector3(0, 0.86, -0.42) };
  const { width: SW, height: SH, center: SC } = screen;

  const monitor = new THREE.Group();
  monitor.add(new THREE.Mesh(new RoundedBoxGeometry(SW + 0.08, SH + 0.08, 0.07, 4, 0.025), mat("#18181a", 0.35, 0.4)));
  const back = new THREE.Mesh(new RoundedBoxGeometry(1.1, 0.7, 0.08, 4, 0.04), mat("#18181a", 0.4, 0.4));
  back.position.z = -0.06;
  monitor.add(back);
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(SW, SH), new THREE.MeshBasicMaterial({ color: "#000000" }));
  glass.position.z = 0.0355;
  monitor.add(glass);
  add(monitor, SC.x, SC.y, SC.z);
  add(new THREE.Mesh(new RoundedBoxGeometry(0.12, 0.62, 0.06, 3, 0.02), mat("#2a2a2d", 0.3, 0.7)), 0, 0.3, SC.z - 0.11);
  add(new THREE.Mesh(new RoundedBoxGeometry(0.56, 0.025, 0.34, 3, 0.012), mat("#2a2a2d", 0.3, 0.7)), 0, 0.012, SC.z - 0.06);

  add(new THREE.Mesh(new RoundedBoxGeometry(1.12, 0.035, 0.38, 3, 0.012), mat("#1d1d20", 0.5, 0.2)), -0.05, 0.018, 0.48);
  const keyGeo = new RoundedBoxGeometry(0.058, 0.022, 0.058, 2, 0.008);
  const keys = new THREE.InstancedMesh(keyGeo, mat("#2c2c30", 0.55), 60);
  const m4 = new THREE.Matrix4();
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 15; c++) {
      m4.makeTranslation(-0.526 + c * 0.068, 0.045, 0.378 + r * 0.068);
      keys.setMatrixAt(r * 15 + c, m4);
    }
  }
  keys.castShadow = true;
  scene.add(keys);
  add(
    new THREE.Mesh(keyGeo, new THREE.MeshStandardMaterial({ color: "#ff6a2b", emissive: "#ff5a1f", emissiveIntensity: 0.6, roughness: 0.4 })),
    -0.526 + 14 * 0.068,
    0.046,
    0.378 + 3 * 0.068,
  );
  add(new THREE.Mesh(new RoundedBoxGeometry(0.11, 0.035, 0.18, 4, 0.03), mat("#1d1d20", 0.4, 0.2)), 0.78, 0.018, 0.52);

  const mug = new THREE.Group();
  mug.add(new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.078, 0.2, 40), mat("#e9e3d6", 0.35)));
  const coffee = new THREE.Mesh(new THREE.CircleGeometry(0.076, 32), mat("#2b170c", 0.2));
  coffee.rotation.x = -Math.PI / 2;
  coffee.position.y = 0.085;
  mug.add(coffee);
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.014, 12, 24), mat("#e9e3d6", 0.35));
  handle.position.x = 0.09;
  mug.add(handle);
  mug.rotation.y = -0.6;
  add(mug, -1.12, 0.1, 0.42);

  const books: [string, number, number][] = [
    ["#ff6a2b", 0.05, 0],
    ["#e9e3d6", 0.045, 0.12],
    ["#2f6bff", 0.05, -0.08],
  ];
  let stackY = 0;
  for (const [color, h, rot] of books) {
    const b = add(new THREE.Mesh(new RoundedBoxGeometry(0.62, h, 0.44, 2, 0.008), mat(color, 0.7)), 1.38, stackY + h / 2, -0.12);
    b.rotation.y = rot;
    stackY += h;
  }

  const lampMat = mat("#1a1a1c", 0.35, 0.6);
  const up = new THREE.Vector3(0, 1, 0);
  const rod = (a: THREE.Vector3, b: THREE.Vector3, r = 0.014) => {
    const d = new THREE.Vector3().subVectors(b, a);
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d.length(), 12), lampMat);
    m.quaternion.setFromUnitVectors(up, d.clone().normalize());
    const mid = a.clone().addScaledVector(d, 0.5);
    add(m, mid.x, mid.y, mid.z);
  };
  const base = new THREE.Vector3(-1.75, 0, -0.35);
  const joint = new THREE.Vector3(-1.62, 0.9, -0.35);
  const head = new THREE.Vector3(-1.08, 0.94, -0.3);
  const target = new THREE.Vector3(-0.6, 0, 0.3);
  add(new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.17, 0.04, 40), lampMat), base.x, 0.02, base.z);
  rod(base, joint);
  rod(joint, head);
  add(new THREE.Mesh(new THREE.SphereGeometry(0.03, 16, 16), lampMat), joint.x, joint.y, joint.z);
  const dir = new THREE.Vector3().subVectors(head, target).normalize();
  const shade = new THREE.Mesh(
    new THREE.ConeGeometry(0.12, 0.2, 32, 1, true),
    new THREE.MeshStandardMaterial({ color: "#1a1a1c", roughness: 0.35, metalness: 0.6, side: THREE.DoubleSide }),
  );
  shade.quaternion.setFromUnitVectors(up, dir);
  add(shade, head.x, head.y, head.z);
  const bulbPos = head.clone().addScaledVector(dir, -0.07);
  add(new THREE.Mesh(new THREE.SphereGeometry(0.04, 20, 20), new THREE.MeshBasicMaterial({ color: "#ffe2b8" })), bulbPos.x, bulbPos.y, bulbPos.z, false);

  const spot = new THREE.SpotLight("#ffcf9a", 26, 6, 0.75, 0.6, 1.6);
  spot.position.copy(bulbPos).addScaledVector(dir, -0.03);
  spot.target.position.copy(target);
  spot.castShadow = true;
  spot.shadow.mapSize.set(shadowSize, shadowSize);
  spot.shadow.bias = -0.0004;
  spot.shadow.radius = 6;
  scene.add(spot, spot.target);

  const key = new THREE.DirectionalLight("#9fb4ff", 0.35);
  key.position.set(3, 4, 3);
  scene.add(key);
  const screenGlow = new THREE.PointLight("#ff8a55", 1.4, 2.4, 2);
  screenGlow.position.set(SC.x, SC.y, SC.z + 0.5);
  scene.add(screenGlow);
  scene.add(new THREE.HemisphereLight("#ffe9d6", "#0d0c0b", 0.18));

  return { screen, screenGlow };
}
