'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Float, PerspectiveCamera } from '@react-three/drei'
import { useRef, Suspense, useMemo } from 'react'
import * as THREE from 'three'

// Animated fabric plane representing a bedsheet
function BedSheet({ position, rotation }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.MeshStandardMaterial>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.02 + (rotation?.[0] ?? 0)
      meshRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.25) * 0.015
    }
  })

  return (
    <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.3}>
      <mesh ref={meshRef} position={position} castShadow receiveShadow>
        <planeGeometry args={[4, 2.2, 32, 20]} />
        <meshStandardMaterial
          ref={materialRef}
          color="#FAFBF9"
          roughness={0.85}
          metalness={0.0}
          side={THREE.DoubleSide}
        />
      </mesh>
    </Float>
  )
}

// Pillow shape
function Pillow({ position }: { position: [number, number, number] }) {
  return (
    <Float speed={2} rotationIntensity={0.08} floatIntensity={0.4}>
      <mesh position={position} castShadow>
        <boxGeometry args={[1.1, 0.18, 0.65]} />
        <meshStandardMaterial color="#F8F9F7" roughness={0.9} metalness={0} />
      </mesh>
    </Float>
  )
}

// Blanket roll
function Blanket({ position }: { position: [number, number, number] }) {
  return (
    <Float speed={1.2} rotationIntensity={0.06} floatIntensity={0.25}>
      <mesh position={position} castShadow>
        <boxGeometry args={[2.5, 0.12, 1.8]} />
        <meshStandardMaterial color="#EDEFEB" roughness={0.95} metalness={0} />
      </mesh>
    </Float>
  )
}

// Mattress/berth base
function SleeperBerth() {
  return (
    <group position={[0.5, -0.5, 0]}>
      {/* Berth frame */}
      <mesh receiveShadow position={[0, -0.25, 0]}>
        <boxGeometry args={[5.5, 0.15, 2.5]} />
        <meshStandardMaterial color="#1E2E26" roughness={0.7} metalness={0.2} />
      </mesh>
      {/* Mattress */}
      <mesh receiveShadow position={[0, -0.12, 0]}>
        <boxGeometry args={[5.2, 0.14, 2.2]} />
        <meshStandardMaterial color="#C8CFC6" roughness={0.9} metalness={0} />
      </mesh>
      {/* Wall panel */}
      <mesh position={[-2.8, 0.8, 0]}>
        <boxGeometry args={[0.08, 2.5, 2.5]} />
        <meshStandardMaterial color="#162118" roughness={0.6} metalness={0.1} />
      </mesh>
    </group>
  )
}

// Floating particles
function Particles() {
  const particlesRef = useRef<THREE.Points>(null)
  const count = 120

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 14
      arr[i * 3 + 1] = (Math.random() - 0.5) * 8
      arr[i * 3 + 2] = (Math.random() - 0.5) * 8
    }
    return arr
  }, [])

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.015
      particlesRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.01) * 0.05
    }
  })

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.025} color="#8FB99A" transparent opacity={0.6} />
    </points>
  )
}

function Scene() {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.5, 7]} fov={55} />

      {/* Lighting */}
      <ambientLight intensity={0.3} color="#8FB99A" />
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.2}
        color="#FDFCF8"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[-3, 3, 2]} intensity={0.8} color="#C8A96E" />
      <pointLight position={[4, -1, -2]} intensity={0.5} color="#4A7C59" />

      <SleeperBerth />
      <BedSheet position={[0.5, 0.1, 0]} />
      <Pillow position={[-1.5, 0.2, 0]} />
      <Blanket position={[1.5, 0.06, 0]} />
      <Particles />

      <Environment preset="night" />
    </>
  )
}

export default function Hero3DScene() {
  return (
    <Canvas
      shadows
      gl={{ antialias: true, alpha: true }}
      style={{ position: 'absolute', inset: 0 }}
      className="bg-gradient-to-br from-[#0D2018] via-[#1A4731] to-[#0A1812]"
    >
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
    </Canvas>
  )
}



