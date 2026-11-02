import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, type MutableRefObject } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

const W = 3.37;
const H = 2.125;

function cardTexture() {
  const c = document.createElement('canvas');
  c.width = 1348;
  c.height = 850;
  const g = c.getContext('2d')!;
  const grad = g.createLinearGradient(0, 0, c.width, c.height);
  grad.addColorStop(0, '#1c4fc4');
  grad.addColorStop(0.55, '#123a94');
  grad.addColorStop(1, '#0a2160');
  g.fillStyle = grad;
  g.fillRect(0, 0, c.width, c.height);
  // fine brushed lines for a printed, not glossy-plastic, feel
  g.globalAlpha = 0.025;
  for (let y = 0; y < c.height; y += 6) {
    g.fillStyle = y % 12 ? '#ffffff' : '#000000';
    g.fillRect(0, y, c.width, 2);
  }
  g.globalAlpha = 1;
  g.fillStyle = '#ffffff';
  g.font = '600 64px Inter, system-ui, sans-serif';
  g.fillText('AEGIS', 90, 150);
  // chip
  const chip = g.createLinearGradient(90, 300, 280, 440);
  chip.addColorStop(0, '#e3cf9a');
  chip.addColorStop(1, '#b8965a');
  g.fillStyle = chip;
  g.beginPath();
  g.roundRect(90, 300, 190, 145, 22);
  g.fill();
  g.strokeStyle = 'rgba(80,60,20,0.35)';
  g.lineWidth = 3;
  g.beginPath();
  g.moveTo(90, 372);
  g.lineTo(280, 372);
  g.moveTo(185, 300);
  g.lineTo(185, 445);
  g.stroke();
  g.fillStyle = 'rgba(255,255,255,0.92)';
  g.font = '500 54px "JetBrains Mono", ui-monospace, monospace';
  g.fillText('••••  ••••  ••••  4821', 90, 620);
  g.font = '500 40px Inter, system-ui, sans-serif';
  g.fillText('MARGARET', 90, 740);
  g.globalAlpha = 0.7;
  g.fillText('GUARDED', c.width - 300, 740);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  t.repeat.set(1 / W, 1 / H);
  t.offset.set(0.5, 0.5);
  return t;
}

function cardGeometry() {
  const r = 0.14;
  const s = new THREE.Shape();
  const x = -W / 2;
  const y = -H / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + W - r, y);
  s.quadraticCurveTo(x + W, y, x + W, y + r);
  s.lineTo(x + W, y + H - r);
  s.quadraticCurveTo(x + W, y + H, x + W - r, y + H);
  s.lineTo(x + r, y + H);
  s.quadraticCurveTo(x, y + H, x, y + H - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  const geo = new THREE.ExtrudeGeometry(s, {
    depth: 0.03,
    bevelEnabled: true,
    bevelThickness: 0.008,
    bevelSize: 0.008,
    bevelSegments: 3,
    curveSegments: 16,
  });
  geo.center();
  return geo;
}

function Environment() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    // RoomEnvironment is a bright white studio; at full strength it washes the navy card out.
    scene.environmentIntensity = 0.3;
    return () => {
      env.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
  return null;
}

/** Card starts in the clear space left of the phone and slides in behind it (scene units). */
const X0 = -0.4;
const X1 = 0.2;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (t: number) => 1 - Math.pow(1 - t, 3);

function Card({ progress }: { progress: MutableRefObject<number> }) {
  const ref = useRef<THREE.Group>(null);
  const geometry = useMemo(cardGeometry, []);
  const materials = useMemo(() => {
    const face = new THREE.MeshPhysicalMaterial({
      map: cardTexture(),
      roughness: 0.7,
      metalness: 0,
      clearcoat: 0.35,
      clearcoatRoughness: 0.3,
      envMapIntensity: 0.15,
    });
    const edge = new THREE.MeshPhysicalMaterial({
      color: '#0a1d4a',
      roughness: 0.4,
      metalness: 0.3,
      envMapIntensity: 0.6,
    });
    return [face, edge];
  }, []);
  const { invalidate } = useThree();
  const last = useRef(-1);
  useFrame((state) => {
    const g = ref.current;
    if (!g) return;
    const p = progress.current;
    const e = ease(Math.min(1, Math.max(0, p)));
    // idle float only while the card is waiting off to the side
    const idle = Math.sin(state.clock.elapsedTime * 0.8) * 0.03 * (1 - e);
    g.position.set(lerp(X0, X1, e), lerp(-0.35, 0.05, e) + idle, lerp(-0.4, -0.9, e));
    g.rotation.set(lerp(-0.55, -0.1, e), lerp(0.85, -0.35, e), lerp(0.28, 0.02, e));
    g.scale.setScalar(lerp(0.46, 0.3, e));
    g.visible = p > 0.001 && p < 0.999;
    if (last.current !== p) {
      last.current = p;
      invalidate();
    }
  });
  return (
    <group ref={ref}>
      <mesh geometry={geometry} material={materials} />
    </group>
  );
}

/** Lazy-loaded WebGL layer: one physical card under soft studio light, moved by scroll progress. */
export default function CardScene({ progress }: { progress: MutableRefObject<number> }) {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0.4, 6], fov: 32 }}
      flat
      gl={{
        antialias: true,
        alpha: true,
        premultipliedAlpha: true,
        powerPreference: 'high-performance',
        outputColorSpace: THREE.SRGBColorSpace,
      }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      // Wider than the scene column so the card is never cut off at an edge; transparent everywhere.
      style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: '-40%',
        width: '140%',
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    >
      <Environment />
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 5, 4]} intensity={0.55} />
      <directionalLight position={[-4, 1, 3]} intensity={0.2} color="#dfe8ff" />
      <Card progress={progress} />
    </Canvas>
  );
}
