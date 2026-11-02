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
  grad.addColorStop(0, '#1d4fb0');
  grad.addColorStop(1, '#123478');
  g.fillStyle = grad;
  g.fillRect(0, 0, c.width, c.height);
  // fine brushed lines for a printed, not glossy-plastic, feel
  g.globalAlpha = 0.05;
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
    return () => {
      env.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
  return null;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (t: number) => 1 - Math.pow(1 - t, 3);

function Card({ progress }: { progress: MutableRefObject<number> }) {
  const ref = useRef<THREE.Group>(null);
  const geometry = useMemo(cardGeometry, []);
  const materials = useMemo(() => {
    const face = new THREE.MeshPhysicalMaterial({
      map: cardTexture(),
      roughness: 0.42,
      metalness: 0.15,
      clearcoat: 0.6,
      clearcoatRoughness: 0.35,
    });
    const edge = new THREE.MeshPhysicalMaterial({
      color: '#0e2a63',
      roughness: 0.5,
      metalness: 0.2,
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
    g.position.set(lerp(-2.6, 1.15, e), lerp(-0.3, 0.15, e) + idle, lerp(-1.2, 0.4, e));
    g.rotation.set(lerp(-0.55, -0.1, e), lerp(0.85, -0.35, e), lerp(0.28, 0.02, e));
    g.scale.setScalar(lerp(0.95, 0.5, e));
    g.visible = p > 0.001 && p < 0.999;
    if (last.current !== p) {
      last.current = p;
      invalidate();
    }
  });
  return (
    <group ref={ref}>
      <mesh geometry={geometry} material={materials} castShadow />
    </group>
  );
}

/** Lazy-loaded WebGL layer: one physical card under soft studio light, moved by scroll progress. */
export default function CardScene({ progress }: { progress: MutableRefObject<number> }) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 0.4, 6], fov: 32 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      aria-hidden="true"
    >
      <Environment />
      <ambientLight intensity={0.35} />
      <directionalLight
        position={[3, 5, 4]}
        intensity={1.6}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-radius={8}
      />
      <Card progress={progress} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <shadowMaterial opacity={0.1} />
      </mesh>
    </Canvas>
  );
}
