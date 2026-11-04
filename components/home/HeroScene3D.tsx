'use client'

import { useRef, useState } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, RoundedBox, ContactShadows, Environment, Lightformer } from '@react-three/drei'

type LayerProps = {
  size: [number, number, number]
  color: string
  baseY: number
  spreadY: number
  rotY: number
  spread: React.MutableRefObject<number>
}

function Layer({ size, color, baseY, spreadY, rotY, spread }: LayerProps) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(() => {
    ref.current.position.y = baseY + spreadY * spread.current
    ref.current.rotation.y = rotY * (0.4 + spread.current * 0.6)
  })
  return (
    <group ref={ref}>
      <RoundedBox args={size} radius={0.09} smoothness={5} castShadow receiveShadow>
        <meshStandardMaterial color={color} roughness={0.85} metalness={0} />
      </RoundedBox>
      {/* fold line */}
      <mesh position={[0, size[1] / 2 + 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[size[0] * 0.92, 0.012]} />
        <meshBasicMaterial color="#000" transparent opacity={0.08} />
      </mesh>
    </group>
  )
}

function Kit() {
  const group = useRef<THREE.Group>(null!)
  const spread = useRef(0)
  const [hovered, setHovered] = useState(false)

  useFrame((state, delta) => {
    // mouse parallax tilt
    const { x, y } = state.pointer
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, x * 0.6 + 0.5, 4, delta)
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, -y * 0.25 + 0.15, 4, delta)
    // hover spread
    spread.current = THREE.MathUtils.damp(spread.current, hovered ? 1 : 0, 5, delta)
  })

  return (
    <group
      ref={group}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Blanket (bottom) */}
      <Layer size={[2.6, 0.34, 1.8]} color="#C9A24A" baseY={-0.32} spreadY={-0.45} rotY={0.0} spread={spread} />
      {/* Bedsheet (middle) */}
      <Layer size={[2.4, 0.26, 1.65]} color="#F4F1EA" baseY={0.0} spreadY={0.0} rotY={0.12} spread={spread} />
      {/* Pillow cover (top) */}
      <Layer size={[1.7, 0.22, 1.15]} color="#CFE8D6" baseY={0.3} spreadY={0.5} rotY={-0.18} spread={spread} />
    </group>
  )
}

export default function HeroScene3D() {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 1.6, 5.2], fov: 38 }}
      gl={{ alpha: true, antialias: true }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[4, 6, 3]}
        intensity={1.8}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[-4, 1, -2]} intensity={12} color="#D4A94F" />

      <Float speed={1.6} rotationIntensity={0.15} floatIntensity={0.9} floatingRange={[-0.1, 0.15]}>
        <Kit />
      </Float>

      <ContactShadows position={[0, -1.35, 0]} opacity={0.45} scale={9} blur={2.8} far={3} />

      {/* Local lighting rig — no external HDR download needed */}
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={2.5} position={[0, 5, -3]} scale={[10, 3, 1]} />
        <Lightformer form="rect" intensity={1.5} position={[-5, 1, 2]} scale={[3, 6, 1]} />
        <Lightformer form="rect" intensity={1.2} position={[5, 2, 2]} scale={[3, 6, 1]} />
      </Environment>
    </Canvas>
  )
}