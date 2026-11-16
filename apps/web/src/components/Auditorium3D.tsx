import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import { ShowSeatDTO } from '../services/api';

interface CameraRigProps {
  previewSeat: ShowSeatDTO | null;
}

const CameraRig: React.FC<CameraRigProps> = ({ previewSeat }) => {
  const targetPos = useRef(new THREE.Vector3(0, 9, 12));
  const targetLook = useRef(new THREE.Vector3(0, 2, -2));

  useFrame((state) => {
    if (previewSeat) {
      // First-person eye point
      targetPos.current.set(
        previewSeat.eye_point[0],
        previewSeat.eye_point[1],
        previewSeat.eye_point[2]
      );
      // Look straight at screen center
      targetLook.current.set(0, 4.5, -14);
    } else {
      // Overview perspective
      targetPos.current.set(0, 9, 12);
      targetLook.current.set(0, 2, -2);
    }

    // Smooth camera damping / interpolation
    state.camera.position.lerp(targetPos.current, 0.06);
    state.camera.lookAt(targetLook.current);
  });

  return null;
};

interface CinemaSeatProps {
  seat: ShowSeatDTO;
  isSelected: boolean;
  onSelect: (label: string) => void;
  onPreview: (seat: ShowSeatDTO) => void;
}

const CinemaSeat: React.FC<CinemaSeatProps> = ({
  seat,
  isSelected,
  onSelect,
  onPreview,
}) => {
  const [hovered, setHovered] = useState(false);
  const isPremium = seat.seat_type === 'PREMIUM';
  const isHeld = seat.status === 'HELD';

  let seatColor = '#10b981'; // Available
  if (isSelected) seatColor = '#3b82f6'; // Selected
  else if (isHeld) seatColor = '#f59e0b'; // Held
  else if (isPremium) seatColor = '#d97706'; // Premium

  if (hovered && !isSelected && !isHeld) {
    seatColor = '#34d399';
  }

  return (
    <group
      position={seat.position}
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
      {/* Seat Cushion */}
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.65, 0.15, 0.65]} />
        <meshStandardMaterial color={seatColor} roughness={0.4} metalness={0.1} />
      </mesh>

      {/* Seat Backrest */}
      <mesh position={[0, 0.8, -0.25]} rotation={[0.08, 0, 0]} castShadow>
        <boxGeometry args={[0.65, 0.75, 0.15]} />
        <meshStandardMaterial color={seatColor} roughness={0.4} metalness={0.1} />
      </mesh>

      {/* Armrests */}
      <mesh position={[-0.35, 0.55, 0]} castShadow>
        <boxGeometry args={[0.08, 0.35, 0.6]} />
        <meshStandardMaterial color="#1e293b" roughness={0.7} />
      </mesh>
      <mesh position={[0.35, 0.55, 0]} castShadow>
        <boxGeometry args={[0.08, 0.35, 0.6]} />
        <meshStandardMaterial color="#1e293b" roughness={0.7} />
      </mesh>

      {/* Seat Pedestal */}
      <mesh position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.05, 0.08, 0.35, 8]} />
        <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Seat Label */}
      <Text
        position={[0, 1.25, -0.22]}
        fontSize={0.18}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {seat.label}
      </Text>
    </group>
  );
};

const CinemaScreen: React.FC = () => {
  return (
    <group position={[0, 4.5, -14]}>
      {/* Screen Frame */}
      <mesh position={[0, 0, -0.1]}>
        <boxGeometry args={[16.2, 7.2, 0.2]} />
        <meshStandardMaterial color="#05070a" roughness={0.9} />
      </mesh>

      {/* Curved Screen Surface */}
      <mesh receiveShadow>
        <planeGeometry args={[16, 7, 32, 16]} />
        <meshStandardMaterial
          color="#f8fafc"
          emissive="#e2e8f0"
          emissiveIntensity={0.25}
          roughness={0.2}
        />
      </mesh>

      {/* Screen Title */}
      <Text
        position={[0, 0, 0.05]}
        fontSize={0.8}
        color="#090d16"
        anchorX="center"
        anchorY="middle"
      >
        IMAX • 3D LASER
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
      <Canvas shadows camera={{ position: [0, 9, 12], fov: 55 }}>
        {/* Animated Camera Rig */}
        <CameraRig previewSeat={previewSeat} />

        {!previewSeat && (
          <OrbitControls
            maxPolarAngle={Math.PI / 2.05}
            minDistance={3}
            maxDistance={25}
            target={[0, 2, -2]}
          />
        )}

        {/* Cinematic Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[5, 12, 10]}
          intensity={0.85}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <spotLight
          position={[0, 10, -5]}
          intensity={1.2}
          angle={0.6}
          penumbra={0.8}
          color="#38bdf8"
        />

        {/* Curved Screen */}
        <CinemaScreen />

        {/* Auditorium Floor (Graduated slope) */}
        <mesh position={[0, 0.5, 0]} receiveShadow rotation={[-0.08, 0, 0]}>
          <boxGeometry args={[16, 0.4, 18]} />
          <meshStandardMaterial color="#111827" roughness={0.8} />
        </mesh>

        {/* Dynamic 3D Seats */}
        {seats.map((seat) => (
          <CinemaSeat
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
