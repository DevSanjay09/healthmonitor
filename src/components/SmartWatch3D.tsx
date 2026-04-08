import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text, Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

const WatchBody = () => {
  return (
    <group>
      {/* Main Case */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2.2, 2.5, 0.4]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.1} metalness={0.8} />
      </mesh>
      
      {/* Screen */}
      <mesh position={[0, 0, 0.21]}>
        <planeGeometry args={[1.9, 2.2]} />
        <meshStandardMaterial color="#000000" emissive="#001122" emissiveIntensity={0.5} />
      </mesh>

      {/* Sensors (Bottom) */}
      <mesh position={[0, 0, -0.21]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 0.05, 32]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      
      {/* Heart Rate LED (Simulated) */}
      <mesh position={[0, 0, -0.23]}>
        <circleGeometry args={[0.1, 32]} />
        <meshBasicMaterial color="#00ff00" />
      </mesh>

      {/* Straps */}
      <mesh position={[0, 2.0, 0]}>
        <boxGeometry args={[1.8, 1.5, 0.2]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <mesh position={[0, -2.0, 0]}>
        <boxGeometry args={[1.8, 1.5, 0.2]} />
        <meshStandardMaterial color="#222" />
      </mesh>
    </group>
  );
};

const ComponentLabel = ({ position, text, color = "#ffffff" }: { position: [number, number, number], text: string, color?: string }) => {
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <Text
        position={position}
        fontSize={0.15}
        color={color}
        anchorX="center"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf"
      >
        {text}
      </Text>
    </Float>
  );
};

const Scene = ({ heartRate }: { heartRate: number }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  // Pulse effect based on heart rate
  const pulseScale = 1 + Math.sin(Date.now() * (heartRate / 60) * 0.01) * 0.02;

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
      
      <group ref={groupRef} scale={[pulseScale, pulseScale, pulseScale]}>
        <WatchBody />
        
        {/* Labels for internal components */}
        <ComponentLabel position={[1.5, 1, 0.5]} text="ESP32-S3" color="#4ade80" />
        <ComponentLabel position={[-1.5, 0.5, 0.5]} text="MAX30102" color="#f87171" />
        <ComponentLabel position={[1.5, -0.5, 0.5]} text="MPU6050" color="#60a5fa" />
        <ComponentLabel position={[-1.5, -1, 0.5]} text="NEO-6M GPS" color="#fbbf24" />
        <ComponentLabel position={[0, 1.8, 0.5]} text="SIM800L GSM" color="#a78bfa" />
      </group>
      
      <OrbitControls enablePan={false} minDistance={4} maxDistance={10} />
    </>
  );
};

export const SmartWatch3D = ({ heartRate }: { heartRate: number }) => {
  return (
    <div className="w-full h-[400px] bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-800 relative">
      <div className="absolute top-4 left-4 z-10">
        <h3 className="text-xs font-mono text-neutral-500 uppercase tracking-widest">Hardware Visualization</h3>
        <p className="text-xs text-neutral-400">Interactive 3D Model</p>
      </div>
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 0, 6]} />
        <Scene heartRate={heartRate} />
      </Canvas>
    </div>
  );
};
