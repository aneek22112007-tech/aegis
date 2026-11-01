import { Float, Lightformer, Environment, Sparkles, Line } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

/**
 * Hero scene: a glass-metal shield intercepts a stream of payment cards.
 * Green (trusted) payments pass straight through; red (scam) payments hit the
 * shield and shatter — the authorization is voided before capture.
 */

const CARD_COUNT = 16;
const SHARD_COUNT = 160;
const SHIELD_FRONT = -0.45;
const START_X = -7.5;
const END_X = 7.5;
const SAFE = new THREE.Color('#34f5b0');
const HOLD = new THREE.Color('#ffc65c');
const SCAM = new THREE.Color('#ff3b5c');

function shieldShape(): THREE.Shape {
  const s = new THREE.Shape();
  s.moveTo(0, 1.35);
  s.bezierCurveTo(0.45, 1.18, 0.82, 1.12, 1.08, 1.12);
  s.lineTo(1.08, 0.25);
  s.bezierCurveTo(1.08, -0.55, 0.62, -1.08, 0, -1.42);
  s.bezierCurveTo(-0.62, -1.08, -1.08, -0.55, -1.08, 0.25);
  s.lineTo(-1.08, 1.12);
  s.bezierCurveTo(-0.82, 1.12, -0.45, 1.18, 0, 1.35);
  return s;
}

type Card = { x: number; y: number; z: number; speed: number; kind: 0 | 1 | 2; spin: number };
type Shard = { p: THREE.Vector3; v: THREE.Vector3; r: THREE.Euler; life: number };

function newCard(card: Card, initial: boolean) {
  card.x = initial ? START_X + Math.random() * (END_X - START_X) : START_X - Math.random() * 3;
  card.y = (Math.random() - 0.5) * 2.4;
  card.z = (Math.random() - 0.5) * 0.9;
  card.speed = 1.6 + Math.random() * 1.4;
  const roll = Math.random();
  card.kind = roll < 0.24 ? 2 : roll < 0.34 ? 1 : 0;
  card.spin = Math.random() * Math.PI;
}

function Shield({ flash }: { flash: React.MutableRefObject<{ color: THREE.Color; t: number }> }) {
  const shape = useMemo(shieldShape, []);
  const geometry = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(shape, {
      depth: 0.22,
      bevelEnabled: true,
      bevelThickness: 0.08,
      bevelSize: 0.06,
      bevelSegments: 6,
      curveSegments: 48,
    });
    g.center();
    return g;
  }, [shape]);
  const outline = useMemo(
    () => shape.getPoints(64).map((p) => new THREE.Vector3(p.x * 1.08, p.y * 1.08 - 0.03, 0.2)),
    [shape],
  );
  const material = useRef<THREE.MeshPhysicalMaterial>(null);
  const ring = useRef<THREE.Mesh>(null);
  const base = useMemo(() => new THREE.Color('#0d3b3a'), []);

  useFrame((_, dt) => {
    const f = flash.current;
    f.t = Math.max(0, f.t - dt * 1.8);
    if (material.current) {
      material.current.emissive.copy(base).lerp(f.color, f.t);
      material.current.emissiveIntensity = 0.55 + f.t * 2.2;
    }
    if (ring.current) {
      ring.current.rotation.z += dt * 0.35;
      ring.current.scale.setScalar(1 + f.t * 0.08);
    }
  });

  return (
    <group>
      <mesh geometry={geometry} castShadow>
        <meshPhysicalMaterial
          ref={material}
          color="#0a1a22"
          metalness={0.85}
          roughness={0.22}
          clearcoat={1}
          clearcoatRoughness={0.1}
          emissive="#0d3b3a"
          emissiveIntensity={0.6}
        />
      </mesh>
      <Line points={outline} color="#5cffd0" lineWidth={2.2} transparent opacity={0.9} />
      {/* Emblem: a check mark cut into the face */}
      <Line
        points={[
          [-0.42, 0.02, 0.24],
          [-0.1, -0.32, 0.24],
          [0.5, 0.36, 0.24],
        ]}
        color="#b8fff0"
        lineWidth={5}
      />
      <mesh ref={ring} position={[0, 0, -0.25]}>
        <torusGeometry args={[1.85, 0.012, 16, 160]} />
        <meshBasicMaterial color="#38e8c6" transparent opacity={0.35} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, -0.3]} rotation={[0, 0, Math.PI / 5]}>
        <torusGeometry args={[2.25, 0.006, 8, 160]} />
        <meshBasicMaterial color="#7c8cff" transparent opacity={0.25} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Payments({ flash }: { flash: React.MutableRefObject<{ color: THREE.Color; t: number }> }) {
  const cardsRef = useRef<THREE.InstancedMesh>(null);
  const shardsRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const cards = useMemo<Card[]>(
    () =>
      Array.from({ length: CARD_COUNT }, () => {
        const card = { x: 0, y: 0, z: 0, speed: 0, kind: 0, spin: 0 } as Card;
        newCard(card, true);
        if (card.kind === 2 && card.x > SHIELD_FRONT) card.kind = 0;
        return card;
      }),
    [],
  );
  const shards = useMemo<Shard[]>(
    () =>
      Array.from({ length: SHARD_COUNT }, () => ({
        p: new THREE.Vector3(),
        v: new THREE.Vector3(),
        r: new THREE.Euler(),
        life: 0,
      })),
    [],
  );
  const nextShard = useRef(0);

  useEffect(() => {
    const mesh = cardsRef.current;
    if (!mesh) return;
    cards.forEach((card, i) => mesh.setColorAt(i, [SAFE, HOLD, SCAM][card.kind]));
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [cards]);

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const mesh = cardsRef.current;
    const shardMesh = shardsRef.current;
    if (!mesh || !shardMesh) return;
    let recolor = false;
    cards.forEach((card, i) => {
      const prev = card.x;
      card.x += card.speed * dt;
      if (card.kind === 2 && card.x >= SHIELD_FRONT) {
        // Scam payment hits the shield: void it and burst into shards.
        for (let k = 0; k < 22; k += 1) {
          const shard = shards[nextShard.current];
          nextShard.current = (nextShard.current + 1) % SHARD_COUNT;
          shard.p.set(SHIELD_FRONT - 0.05, card.y, card.z);
          shard.v.set(
            -1.2 - Math.random() * 2.4,
            (Math.random() - 0.5) * 3.2,
            (Math.random() - 0.5) * 2.4,
          );
          shard.r.set(Math.random() * 6, Math.random() * 6, 0);
          shard.life = 1;
        }
        flash.current.color.copy(SCAM);
        flash.current.t = 1;
        newCard(card, false);
        recolor = true;
      } else if (prev < 0 && card.x >= 0 && flash.current.t < 0.3) {
        flash.current.color.copy(card.kind === 1 ? HOLD : SAFE);
        flash.current.t = 0.35;
      }
      if (card.x > END_X) {
        newCard(card, false);
        recolor = true;
      }
      // Cards ease toward the shield centre line as they approach, then fan out again.
      const pull = Math.exp(-(card.x * card.x) / 6);
      dummy.position.set(card.x, card.y * (1 - pull * 0.55), card.z);
      dummy.rotation.set(0.25, -0.5 + Math.sin(state.clock.elapsedTime + card.spin) * 0.15, 0.08);
      const fade = Math.min(1, (card.x - START_X) / 2, (END_X - card.x) / 2);
      dummy.scale.setScalar(Math.max(0.001, fade));
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      if (recolor) mesh.setColorAt(i, [SAFE, HOLD, SCAM][card.kind]);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (recolor && mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

    shards.forEach((shard, i) => {
      if (shard.life > 0) {
        shard.life -= dt * 0.9;
        shard.v.y -= dt * 2.2;
        shard.p.addScaledVector(shard.v, dt);
        shard.r.x += dt * 6;
        shard.r.y += dt * 4;
      }
      dummy.position.copy(shard.p);
      dummy.rotation.copy(shard.r);
      dummy.scale.setScalar(Math.max(0.0001, shard.life) * 0.9);
      dummy.updateMatrix();
      shardMesh.setMatrixAt(i, dummy.matrix);
    });
    shardMesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <instancedMesh ref={cardsRef} args={[undefined, undefined, CARD_COUNT]}>
        <boxGeometry args={[0.5, 0.31, 0.02]} />
        <meshBasicMaterial toneMapped={false} transparent opacity={0.92} />
      </instancedMesh>
      <instancedMesh ref={shardsRef} args={[undefined, undefined, SHARD_COUNT]}>
        <tetrahedronGeometry args={[0.07]} />
        <meshBasicMaterial color={SCAM} toneMapped={false} />
      </instancedMesh>
    </>
  );
}

function Scene() {
  const flash = useRef({ color: new THREE.Color('#34f5b0'), t: 0 });
  const tilt = useRef<THREE.Group>(null);
  useFrame((state, dt) => {
    if (!tilt.current) return;
    const { x, y } = state.pointer;
    tilt.current.rotation.y = THREE.MathUtils.damp(tilt.current.rotation.y, x * 0.22 - 0.18, 3, dt);
    tilt.current.rotation.x = THREE.MathUtils.damp(tilt.current.rotation.x, -y * 0.1, 3, dt);
  });
  return (
    <>
      <color attach="background" args={['#04060c']} />
      <fog attach="fog" args={['#04060c', 7, 15]} />
      <ambientLight intensity={0.25} />
      <directionalLight position={[3, 4, 5]} intensity={1.6} />
      <pointLight position={[-3, 1, 2]} intensity={12} color="#2de0b5" />
      <pointLight position={[3, -2, 2]} intensity={10} color="#6f7bff" />
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={3} position={[0, 3, 4]} scale={[8, 2, 1]} />
        <Lightformer form="ring" intensity={2} color="#40ffd0" position={[-4, 0, 3]} scale={2} />
        <Lightformer
          form="rect"
          intensity={1.5}
          color="#7c8cff"
          position={[4, -1, 2]}
          scale={[2, 6, 1]}
        />
      </Environment>
      <group ref={tilt}>
        <Float speed={1.4} rotationIntensity={0.25} floatIntensity={0.5}>
          <Shield flash={flash} />
        </Float>
        <Payments flash={flash} />
      </group>
      <Sparkles
        count={70}
        scale={[12, 6, 4]}
        size={1.6}
        speed={0.25}
        color="#8ff7e0"
        opacity={0.5}
      />
    </>
  );
}

export default function ShieldScene() {
  const host = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const el = host.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={host} className="absolute inset-0" aria-hidden="true">
      <Canvas
        frameloop={visible ? 'always' : 'never'}
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 6.2], fov: 42 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
