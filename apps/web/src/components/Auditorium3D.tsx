import React, { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { ShowSeatDTO } from '../services/api';

interface CameraRigProps {
  previewSeat: ShowSeatDTO | null;
}

const SCREEN_CENTER = new THREE.Vector3(0, 3.95, 2.3);
const OVERVIEW_POS = new THREE.Vector3(0, 8.5, -20.5);
const OVERVIEW_LOOK = new THREE.Vector3(0, 3.5, 0);

const CameraRig: React.FC<CameraRigProps> = ({ previewSeat }) => {
  const targetPos = useRef(OVERVIEW_POS.clone());
  const targetLook = useRef(OVERVIEW_LOOK.clone());

  useFrame((state) => {
    if (previewSeat) {
      // First-person eye point
      targetPos.current.set(
        previewSeat.eye_point[0],
        previewSeat.eye_point[1],
        previewSeat.eye_point[2]
      );
      // Look straight at CinemaScope screen center
      targetLook.current.copy(SCREEN_CENTER);
    } else {
      // Overview perspective
      targetPos.current.copy(OVERVIEW_POS);
      targetLook.current.copy(OVERVIEW_LOOK);
    }

    // Smooth camera damping / interpolation
    state.camera.position.lerp(targetPos.current, 0.06);
    state.camera.lookAt(targetLook.current);
  });

  return null;
};

/**
 * Loads the exported photorealistic Blender 3D cinema theater model.
 */
const BlenderAuditoriumModel: React.FC = () => {
  const { scene } = useGLTF('/models/cinema_theatre_auditorium.glb');

  // Ensure shadows and proper materials
  React.useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene]);

  return <primitive object={scene} />;
};

useGLTF.preload('/models/cinema_theatre_auditorium.glb');

interface InteractiveSeatBeaconProps {
  seat: ShowSeatDTO;
  isSelected: boolean;
  onSelect: (label: string) => void;
  onPreview: (seat: ShowSeatDTO) => void;
}

const InteractiveSeatBeacon: React.FC<InteractiveSeatBeaconProps> = ({
  seat,
  isSelected,
  onSelect,
  onPreview,
}) => {
  const [hovered, setHovered] = useState(false);
  const isHeld = seat.status === 'HELD';
  const isVIP = seat.seat_type === 'VIP_RECLINER';
  const isAccessible = seat.seat_type === 'ACCESSIBLE';

  let color = isVIP ? '#eab308' : isAccessible ? '#06b6d4' : '#10b981';
  let opacity = 0.35;

  if (isSelected) {
    color = '#3b82f6';
    opacity = 0.9;
  } else if (isHeld) {
    color = '#f59e0b';
    opacity = 0.7;
  } else if (hovered) {
    color = '#34d399';
    opacity = 0.85;
  }

  // Seat beacon positioned slightly above cushion surface
  const beaconPos: [number, number, number] = [
    seat.position[0],
    seat.position[1] + 0.45,
    seat.position[2] + 0.05,
  ];

  return (
    <group
      position={beaconPos}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(seat.label);
      }}
      onContextMenu={(e) => {
        e.stopPropagation();
        e.nativeEvent.preventDefault();
        onPreview(seat);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      {/* Interactive cushion highlight pad */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.55, 0.08, 0.52]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={opacity}
          emissive={color}
          emissiveIntensity={isSelected || hovered ? 0.6 : 0.15}
          roughness={0.2}
        />
      </mesh>

      {/* Floating Seat Label when hovered, selected, or VIP */}
      {(hovered || isSelected || isVIP) && (
        <group position={[0, 0.45, 0]}>
          <Text
            fontSize={hovered || isSelected ? 0.22 : 0.14}
            color={isSelected ? '#ffffff' : hovered ? '#ffffff' : '#fef08a'}
            anchorX="center"
            anchorY="middle"
          >
            {seat.label}
          </Text>
        </group>
      )}
    </group>
  );
};

const LoadingFallback: React.FC = () => {
  return (
    <group position={[0, 4, 0]}>
      <Text fontSize={0.6} color="#f59e0b" anchorX="center" anchorY="middle">
        Loading 3D Cinema Theater...
      </Text>
    </group>
  );
};

interface Auditorium3DProps {
  seats: ShowSeatDTO[];
  selectedSeats: string[];
  onToggleSeat: (label: string) => void;
  previewSeat: ShowSeatDTO | null;
  onSelectPreviewSeat: (seat: ShowSeatDTO) => void;
}

export const Auditorium3D: React.FC<Auditorium3DProps> = ({
  seats,
  selectedSeats,
  onToggleSeat,
  previewSeat,
  onSelectPreviewSeat,
}) => {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas shadows camera={{ position: [0, 8.5, -20.5], fov: 55 }}>
        {/* Animated Camera Rig */}
        <CameraRig previewSeat={previewSeat} />

        {!previewSeat && (
          <OrbitControls
            maxPolarAngle={Math.PI / 2.05}
            minDistance={4}
            maxDistance={35}
            target={[0, 3.5, 0]}
          />
        )}

        {/* Ambient & Architectural Lighting */}
        <ambientLight intensity={0.55} color="#cbd5e1" />
        <directionalLight
          position={[0, 10, -10]}
          intensity={0.9}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />

        {/* Projector beam pointing from booth to screen */}
        <spotLight
          position={[0, 6.2, -18.8]}
          target-position={[0, 3.95, 2.3]}
          intensity={2.2}
          angle={0.45}
          penumbra={0.7}
          color="#e0f2fe"
        />

        {/* Photorealistic Blender 3D Theater Model */}
        <Suspense fallback={<LoadingFallback />}>
          <BlenderAuditoriumModel />
        </Suspense>

        {/* Interactive 3D Seat Selection Beacons */}
        {seats.map((seat) => (
          <InteractiveSeatBeacon
            key={seat.show_seat_id}
            seat={seat}
            isSelected={selectedSeats.includes(seat.label)}
            onSelect={onToggleSeat}
            onPreview={onSelectPreviewSeat}
          />
        ))}
      </Canvas>
    </div>
  );
};
