'use client'

import { useRef, useMemo, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function FloatingElement({
  position,
  speed,
  amplitude,
  geometry,
  color,
}: {
  position: [number, number, number]
  speed: number
  amplitude: number
  geometry: 'box' | 'octahedron' | 'torus' | 'icosahedron'
  color: string
}) {
  const ref = useRef<THREE.Mesh>(null!)
  const initialY = position[1]

  useFrame((state) => {
    const t = state.clock.elapsedTime
    ref.current.rotation.x = t * speed * 0.3
    ref.current.rotation.y = t * speed * 0.5
    ref.current.position.y = initialY + Math.sin(t * speed) * amplitude
  })

  const Geometry = useMemo(() => {
    switch (geometry) {
      case 'box':
        return <boxGeometry args={[1, 1, 1]} />
      case 'octahedron':
        return <octahedronGeometry args={[0.7]} />
      case 'torus':
        return <torusGeometry args={[0.6, 0.25, 16, 32]} />
      case 'icosahedron':
        return <icosahedronGeometry args={[0.7]} />
    }
  }, [geometry])

  return (
    <mesh ref={ref} position={position}>
      {Geometry}
      <meshStandardMaterial
        color={color}
        transparent
        opacity={0.15}
        wireframe
      />
    </mesh>
  )
}

function Scene() {
  const elements = useMemo(
    () => [
      { position: [-4, 2, -5] as [number, number, number], speed: 0.4, amplitude: 0.8, geometry: 'octahedron' as const, color: '#06b6d4' },
      { position: [3, -1, -4] as [number, number, number], speed: 0.3, amplitude: 0.6, geometry: 'box' as const, color: '#8b5cf6' },
      { position: [-2, -2, -6] as [number, number, number], speed: 0.5, amplitude: 1.0, geometry: 'torus' as const, color: '#06b6d4' },
      { position: [4, 3, -7] as [number, number, number], speed: 0.35, amplitude: 0.7, geometry: 'icosahedron' as const, color: '#a855f7' },
      { position: [0, 0, -5] as [number, number, number], speed: 0.25, amplitude: 1.2, geometry: 'octahedron' as const, color: '#22d3ee' },
      { position: [-3, 3, -8] as [number, number, number], speed: 0.45, amplitude: 0.5, geometry: 'box' as const, color: '#7c3aed' },
      { position: [2, -3, -6] as [number, number, number], speed: 0.38, amplitude: 0.9, geometry: 'torus' as const, color: '#06b6d4' },
    ],
    []
  )

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={0.4} color="#06b6d4" />
      <pointLight position={[-5, -5, 5]} intensity={0.3} color="#8b5cf6" />
      {elements.map((el, i) => (
        <FloatingElement key={i} {...el} />
      ))}
    </>
  )
}

export default function BackgroundScene() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  )
}
