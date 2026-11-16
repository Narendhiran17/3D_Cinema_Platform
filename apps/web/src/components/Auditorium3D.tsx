import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, PerspectiveCamera } from '@react-three/drei';

interface SeatProps {
  label: string;
  position: [number, number, number];
  isSelected: boolean;
  isHeld: boolean;
  isPremium: boolean;
  onSelect: (label: string) => void;
  onPreview: (label: string, pos: [number, number, number]) => void;
}

const CinemaSeat: React.FC<SeatProps> = ({
  label,
  position,
  isSelected,
  isHeld,
  isPremium,
  onSelect,
}) => {
  const [hovered, setHovered] = useState(false);

  // Determine seat color based on state
  let seatColor = '#10b981'; // Available (Emerald Green)
  if (isSelected) seatColor = '#3b82f6'; // Selected (Vibrant Blue)
  else if (isHeld) seatColor = '#f59e0b'; // Held (Amber)
  else if (isPremium) seatColor = '#d97706'; // Premium Gold

  if (hovered && !isSelected && !isHeld) {
    seatColor = '#34d399';
  }

  return (
    <group
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(label);
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

      {/* Seat Number Tag */}
      <Text
        position={[0, 1.25, -0.22]}
        fontSize={0.18}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {label}
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
          emissiveIntensity={0.2}
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
        IMAX • 3D SCREEN
      </Text>
    </group>
  );
};

interface Auditorium3DProps {
  selectedSeats: string[];
  onToggleSeat: (label: string) => void;
  previewSeat: string | null;
  onClearPreview: () => void;
}

export const Auditorium3D: React.FC<Auditorium3DProps> = ({
  selectedSeats,
  onToggleSeat,
  previewSeat,
}) => {
  const rows = ['A', 'B', 'C', 'D', 'E'];
  const cols = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas shadows>
        <PerspectiveCamera
          makeDefault
          position={previewSeat ? [0, 2.2, 4] : [0, 9, 12]}
          fov={55}
        />
        <OrbitControls
          maxPolarAngle={Math.PI / 2.05}
          minDistance={3}
          maxDistance={25}
          target={[0, 2, -2]}
        />

        {/* Cinematic Lighting */}
        <ambientLight intensity={0.35} />
        <directionalLight
          position={[5, 12, 10]}
          intensity={0.8}
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

        {/* Screen */}
        <CinemaScreen />

        {/* Auditorium Floor (Graduated slope) */}
        <mesh position={[0, 0.5, 0]} receiveShadow rotation={[-0.08, 0, 0]}>
          <boxGeometry args={[16, 0.4, 18]} />
          <meshStandardMaterial color="#111827" roughness={0.8} />
        </mesh>

        {/* 3D Seat Rows */}
        {rows.map((row, rIdx) => {
          const zPos = -4 + rIdx * 2.2;
          const yPos = 0.8 + rIdx * 0.45;
          const isPremium = row === 'D' || row === 'E';

          return (
            <group key={row}>
              {cols.map((num) => {
                // Introduce an aisle gap between 5 and 6
                const aisleOffset = num > 5 ? 0.6 : -0.6;
                const xPos = (num - 5.5) * 1.05 + aisleOffset;
                const label = `${row}${num}`;
                const isSelected = selectedSeats.includes(label);

                return (
                  <CinemaSeat
                    key={label}
                    label={label}
                    position={[xPos, yPos, zPos]}
                    isSelected={isSelected}
                    isHeld={false}
                    isPremium={isPremium}
                    onSelect={onToggleSeat}
                    onPreview={() => {}}
                  />
                );
              })}
            </group>
          );
        })}
      </Canvas>
    </div>
  );
};
