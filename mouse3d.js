/* Roni.Universe — 3D Chrome-Techno-Maus (Three.js).
   Mounts on every <canvas data-mouse3d="dj|mini|creator">, dances on `roni:beat`,
   follows the config from MAUS-CREATOR (`roni:mouse-updated`, `roni:creator-preview`). */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const COLORS = { chrome: '#ece9f3', gold: '#ffcf6b', pink: '#ff9ade', lila: '#bb8dff', schwarz: '#2b2631' };
const DEFAULT = { name: 'DJ MAUS', color: 'chrome', hat: 'none', glasses: 'sun', chain: true };
const reduced = matchMedia('(prefers-reduced-motion:reduce)').matches;
function readCfg() {
  try { return Object.assign({}, DEFAULT, JSON.parse(localStorage.getItem('roni.mouse') || '{}')); }
  catch (e) { return { ...DEFAULT }; }
}

function buildMouse() {
  const chrome = new THREE.MeshStandardMaterial({ color: COLORS.chrome, metalness: 1, roughness: 0.16, envMapIntensity: 1.7 });
  const pink = new THREE.MeshStandardMaterial({ color: '#ffb6e8', metalness: 0.75, roughness: 0.22 });
  const black = new THREE.MeshStandardMaterial({ color: '#0d0612', metalness: 0.85, roughness: 0.06 });
  const belly = new THREE.MeshStandardMaterial({ color: '#f6f3fb', metalness: 0.55, roughness: 0.28 });
  const gold = new THREE.MeshStandardMaterial({ color: '#ffd27a', metalness: 1, roughness: 0.16 });
  const heartMat = new THREE.MeshStandardMaterial({ color: '#ff4fc4', metalness: 0.7, roughness: 0.1, emissive: '#5a0a3d' });
  const sphere = new THREE.SphereGeometry(1, 40, 28);
  const mesh = (geo, mat, pos, scale) => { const m = new THREE.Mesh(geo, mat); if (pos) m.position.set(...pos); if (scale) m.scale.set(...scale); return m; };

  const root = new THREE.Group();
  const dancer = new THREE.Group(); root.add(dancer);
  dancer.add(mesh(sphere, chrome, [0, 1.0, 0], [0.78, 0.95, 0.72]));
  dancer.add(mesh(sphere, belly, [0, 0.95, 0.33], [0.55, 0.72, 0.45]));
  for (const s of [-1, 1]) dancer.add(mesh(sphere, pink, [s * 0.32, 0.08, 0.3], [0.26, 0.1, 0.42]));

  const arms = [];
  for (const s of [-1, 1]) {
    const g = new THREE.Group(); g.position.set(s * 0.6, 1.55, 0.22);
    g.add(mesh(new THREE.CapsuleGeometry(0.12, 0.42, 6, 14), chrome, [0, -0.3, 0]));
    g.add(mesh(sphere, pink, [0, -0.6, 0.02], [0.13, 0.11, 0.13]));
    g.userData.side = s; dancer.add(g); arms.push(g);
  }

  const tailCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.45, -0.62), new THREE.Vector3(0.55, 0.12, -1.0),
    new THREE.Vector3(1.25, 0.18, -0.85), new THREE.Vector3(1.55, 0.75, -0.45), new THREE.Vector3(1.35, 1.1, -0.2)]);
  const tail = new THREE.Group();
  tail.add(new THREE.Mesh(new THREE.TubeGeometry(tailCurve, 48, 0.055, 10, false), pink));
  dancer.add(tail);

  const head = new THREE.Group(); head.position.set(0, 1.85, 0.05); dancer.add(head);
  head.add(mesh(sphere, chrome, [0, 0.32, 0.02], [0.52, 0.5, 0.56]));
  const snout = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.95, 32), chrome); snout.rotation.x = Math.PI / 2; snout.position.set(0, 0.22, 0.7); snout.scale.set(1, 1, 0.85); head.add(snout);
  head.add(mesh(sphere, black, [0, 0.22, 1.16], [0.085, 0.075, 0.075]));
  const whiskerMat = new THREE.MeshStandardMaterial({ color: '#f3eefa', metalness: 1, roughness: 0.2 });
  for (const s of [-1, 1]) for (const k of [-1, 0, 1]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.6, 5), whiskerMat); w.position.set(s * 0.32, 0.2 + k * 0.05, 0.92); w.rotation.set(0, s * 0.25, Math.PI / 2 + s * k * 0.18); head.add(w); }
  const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.024, 8, 24, Math.PI), black);
  mouth.position.set(0, 0.0, 0.62); mouth.scale.set(0.8, 0.55, 0.8); mouth.rotation.set(0.5, 0, Math.PI); head.add(mouth);
  const ears = [];
  for (const s of [-1, 1]) {
    const e = new THREE.Group(); e.position.set(s * 0.46, 0.66, -0.12); e.rotation.set(0, s * -0.35, -s * 0.5);
    e.add(mesh(sphere, chrome, [0, 0, 0], [0.32, 0.34, 0.08]));
    e.add(mesh(sphere, pink, [0, 0, 0.045], [0.21, 0.23, 0.06]));
    head.add(e); ears.push(e);
  }
  const eyes = new THREE.Group();
  for (const s of [-1, 1]) {
    eyes.add(mesh(sphere, black, [s * 0.19, 0.44, 0.48], [0.075, 0.085, 0.06]));
    eyes.add(mesh(sphere, belly, [s * 0.19 + 0.025, 0.47, 0.53], [0.022, 0.022, 0.02]));
  }
  head.add(eyes);
  const sun = new THREE.Group();
  const lensGeo = new THREE.BoxGeometry(0.32, 0.2, 0.05);
  for (const s of [-1, 1]) {
    const l = mesh(lensGeo, black, [s * 0.19, 0.45, 0.54]); l.rotation.y = s * 0.28; sun.add(l);
    const t = mesh(new THREE.BoxGeometry(0.03, 0.03, 0.5), black, [s * 0.38, 0.45, 0.3]); sun.add(t);
  }
  sun.add(mesh(new THREE.BoxGeometry(0.1, 0.04, 0.04), black, [0, 0.48, 0.59]));
  head.add(sun);
  const heart = new THREE.Group();
  const hs = new THREE.Shape();
  hs.moveTo(0, -0.13); hs.bezierCurveTo(-0.28, 0.02, -0.18, 0.24, 0, 0.1); hs.bezierCurveTo(0.18, 0.24, 0.28, 0.02, 0, -0.13);
  const hg = new THREE.ExtrudeGeometry(hs, { depth: 0.04, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.012, bevelSegments: 2 });
  for (const s of [-1, 1]) { const h = mesh(hg, heartMat, [s * 0.19, 0.44, 0.53]); h.rotation.y = s * 0.22; heart.add(h); }
  heart.add(mesh(new THREE.BoxGeometry(0.12, 0.035, 0.035), gold, [0, 0.46, 0.58]));
  head.add(heart);

  const party = new THREE.Group(); party.position.set(0.08, 0.98, -0.02); party.rotation.z = -0.28;
  party.add(mesh(new THREE.ConeGeometry(0.27, 0.66, 28), pink, [0, 0.3, 0]));
  party.add(mesh(sphere, gold, [0, 0.66, 0], [0.09, 0.09, 0.09]));
  head.add(party);
  const crown = new THREE.Group(); crown.position.set(0, 0.86, 0);
  crown.add(new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.3, 0.2, 32, 1, true), new THREE.MeshStandardMaterial({ color: '#ffd27a', metalness: 1, roughness: 0.16, side: THREE.DoubleSide })));
  for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2; crown.add(mesh(new THREE.ConeGeometry(0.06, 0.18, 10), gold, [Math.cos(a) * 0.31, 0.18, Math.sin(a) * 0.31])); }
  crown.add(mesh(sphere, heartMat, [0, 0.03, 0.31], [0.05, 0.05, 0.03]));
  head.add(crown);

  const chain = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.045, 10, 48), gold); ring.position.set(0, 1.72, 0.1); ring.rotation.x = 1.25; chain.add(ring);
  const pend = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.05, 28), gold); pend.position.set(0, 1.38, 0.6); pend.rotation.x = Math.PI / 2 - 0.25; chain.add(pend);
  dancer.add(chain);

  function setConfig(cfg) {
    chrome.color.set(COLORS[cfg.color] || COLORS.chrome);
    chrome.roughness = cfg.color === 'schwarz' ? 0.2 : 0.13;
    party.visible = cfg.hat === 'party'; crown.visible = cfg.hat === 'crown';
    sun.visible = cfg.glasses === 'sun'; heart.visible = cfg.glasses === 'heart'; eyes.visible = cfg.glasses === 'none';
    chain.visible = !!cfg.chain;
  }
  return { root, dancer, head, arms, ears, tail, setConfig };
}

const stages = [];
let lastBeatAt = 0;
const SEQ = ['hop', 'swayL', 'hop', 'swayR', 'squash', 'nod', 'wave', 'hop'];

function mount(canvas) {
  const mode = canvas.dataset.mouse3d || 'dj';
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' }); }
  catch (e) { return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.35;
  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.add(new THREE.HemisphereLight('#ffffff', '#3a1f4d', 0.9));
  const p1 = new THREE.PointLight('#b16cff', 28, 30); p1.position.set(-3, 3.5, 3.5); scene.add(p1);
  const p2 = new THREE.PointLight('#ff5fcf', 22, 30); p2.position.set(3.2, 2.2, -2.5); scene.add(p2);
  const cam = new THREE.PerspectiveCamera(mode === 'mini' ? 30 : 28, 1, 0.1, 60);
  if (mode === 'mini') { cam.position.set(1.4, 2.6, 10.2); cam.lookAt(0, 2.0, 0); }
  else { cam.position.set(1.9, 2.4, 9.4); cam.lookAt(0, 1.85, 0); }
  const m = buildMouse(); scene.add(m.root);
  const st = { canvas, mode, renderer, scene, cam, m, beat: null, beatN: 0, yaw: -0.4, w: 0, h: 0 };
  m.setConfig(mode === 'creator' && window.RONI_CREATOR_CFG ? window.RONI_CREATOR_CFG : readCfg());
  stages.push(st);
  canvas.parentElement.classList.add('has-3d');
}

function onBeat(e) {
  if (reduced) return;
  const d = (e && e.detail) || {};
  const now = performance.now(); lastBeatAt = now;
  for (const st of stages) {
    st.beatN = d.n != null ? d.n : st.beatN + 1;
    const move = st.beatN % (st.mode === 'mini' ? 8 : 16) === 0 ? 'spin' : SEQ[st.beatN % SEQ.length];
    st.beat = { t0: now, dur: (d.dur || 380) * (move === 'spin' ? 1.9 : 1), move };
  }
}

function frame(now) {
  requestAnimationFrame(frame);
  const dj = document.getElementById('djMouse');
  const sulk = dj && dj.classList.contains('sulk');
  const idle = now - lastBeatAt > 1600;
  for (const st of stages) {
    const c = st.canvas;
    if (!c.isConnected || !c.offsetParent) continue;
    const w = c.clientWidth, h = c.clientHeight;
    if (!w || !h) continue;
    if (w !== st.w || h !== st.h) { st.w = w; st.h = h; st.renderer.setSize(w, h, false); st.cam.aspect = w / h; st.cam.updateProjectionMatrix(); }
    const { dancer, head, arms, ears, tail } = st.m;
    dancer.position.set(0, 0, 0); dancer.rotation.set(0, 0, 0); dancer.scale.set(1, 1, 1);
    head.rotation.set(0, 0, 0);
    arms.forEach(a => { a.rotation.set(-0.25, 0, a.userData.side * 0.32); });
    const wantSulk = sulk && st.mode !== 'creator';
    const baseYaw = (st.mode === 'creator' ? -0.25 + Math.sin(now / 2400) * 0.55 : -0.42) + (idle ? Math.sin(now / 1700) * 0.3 : Math.sin(now / 900) * 0.1);
    st.yaw += ((wantSulk ? Math.PI : baseYaw) - st.yaw) * 0.08;
    dancer.rotation.y = st.yaw;
    const b = st.beat;
    if (b && !wantSulk) {
      const p = Math.min(1, (now - b.t0) / b.dur), e = Math.sin(p * Math.PI) * (st.mode === 'mini' ? 1.8 : 1);
      head.rotation.x = 0.14 * e;
      switch (b.move) {
        case 'hop': dancer.position.y = 0.38 * e; dancer.scale.set(1 - 0.04 * e, 1 + 0.07 * e, 1 - 0.04 * e); arms.forEach(a => a.rotation.z = a.userData.side * (0.32 + 0.7 * e)); break;
        case 'swayL': case 'swayR': { const s = b.move === 'swayL' ? 1 : -1; dancer.rotation.z = s * 0.24 * e; dancer.position.x = -s * 0.18 * e; arms.forEach(a => a.rotation.z = a.userData.side * 0.32 + s * 0.6 * e); break; }
        case 'squash': dancer.scale.set(1 + 0.1 * e, 1 - 0.15 * e, 1 + 0.1 * e); break;
        case 'nod': head.rotation.x = 0.42 * e; dancer.position.y = 0.12 * e; break;
        case 'wave': arms[1].rotation.set(-0.2, 0, -(0.32 + 2.2 * e)); arms[1].rotation.x = -0.2 + Math.sin(now / 70) * 0.3 * e; break;
        case 'spin': { const q = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2; dancer.rotation.y = st.yaw + q * Math.PI * 2; dancer.position.y = 0.45 * e; arms.forEach(a => a.rotation.z = a.userData.side * (0.32 + 1.4 * e)); break; }
      }
      ears.forEach((ear, i) => ear.rotation.x = (i ? 1 : -1) * 0.25 * e);
    }
    dancer.scale.y *= 1 + 0.015 * Math.sin(now / 480);
    tail.rotation.y = Math.sin(now / 320) * 0.22;
    st.renderer.render(st.scene, st.cam);
  }
}

function init() {
  document.querySelectorAll('canvas[data-mouse3d]').forEach(mount);
  document.addEventListener('roni:beat', onBeat);
  document.addEventListener('roni:mouse-updated', () => { const cfg = readCfg(); stages.forEach(st => { if (st.mode !== 'creator') st.m.setConfig(cfg); }); });
  document.addEventListener('roni:creator-preview', e => { stages.forEach(st => { if (st.mode === 'creator') st.m.setConfig(Object.assign({}, DEFAULT, e.detail)); }); });
  requestAnimationFrame(frame);
  window.RONI3D = { ready: true, count: stages.length, get lastBeat() { return lastBeatAt; }, get moves() { return stages.map(s => s.beat && s.beat.move); } };
}
init();
