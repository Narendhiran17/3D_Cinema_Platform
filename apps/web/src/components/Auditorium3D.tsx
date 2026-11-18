import React, { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, useGLTF } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Compass,
  Eye,
  Crown,
  ShieldCheck,
  Video,
} from 'lucide-react';
import { ShowSeatDTO } from '../services/api';

// Center of the CinemaScope 2.39:1 projection screen in Three.js coordinates
const SCREEN_CENTER = new THREE.Vector3(0, 3.95, 2.3);

// Default overview position inside the auditorium (rear concourse elevated view)
const OVERVIEW_POS = new THREE.Vector3(0, 4.0, -15.5);
const OVERVIEW_LOOK = new THREE.Vector3(0, 3.6, 2.3);

// Strict auditorium physical interior boundaries (in meters)
// The hall is 16m wide (-8 to +8), 22m long (-19 to +3), 7.5m high (0 to 7.5)
const BOUNDS = {
  minX: -7.0,
  maxX: 7.0,
  minY: 1.05,
  maxY: 6.2,
  minZ: -17.2,
  maxZ: 1.2,
};

interface CameraControllerProps {
  previewSeat: ShowSeatDTO | null;
  controlsRef: React.RefObject<OrbitControlsImpl>;
  cameraPreset: { pos: THREE.Vector3; look: THREE.Vector3 } | null;
  onPresetApplied: () => void;
}

/**
 * Manages smooth camera transitions and enforces strict physical boundaries
 * so the camera CANNOT clip or travel outside the auditorium walls, ceiling, or floor.
 */
const CameraBoundaryController: React.FC<CameraControllerProps> = ({
  previewSeat,
  controlsRef,
  cameraPreset,
  onPresetApplied,
}) => {
  const isTransitioning = useRef<boolean>(true);
  const targetCameraPos = useRef<THREE.Vector3>(OVERVIEW_POS.clone());
  const targetLookAt = useRef<THREE.Vector3>(OVERVIEW_LOOK.clone());
  const lastSeatId = useRef<string | null>(null);

  // When preview seat changes, initiate smooth flight to the seat's eye-point
  useEffect(() => {
    const currentId = previewSeat ? previewSeat.show_seat_id : null;
    if (currentId !== lastSeatId.current) {
      lastSeatId.current = currentId;
      isTransitioning.current = true;

      if (previewSeat) {
        targetCameraPos.current.set(
          previewSeat.eye_point[0],
          previewSeat.eye_point[1],
          previewSeat.eye_point[2]
        );
        targetLookAt.current.copy(SCREEN_CENTER);
      } else {
        targetCameraPos.current.copy(OVERVIEW_POS);
        targetLookAt.current.copy(OVERVIEW_LOOK);
      }
    }
  }, [previewSeat]);

  // Handle manual preset requests (e.g. Overview, VIP Sweet Spot, Front Row)
  useEffect(() => {
    if (cameraPreset) {
      targetCameraPos.current.copy(cameraPreset.pos);
      targetLookAt.current.copy(cameraPreset.look);
      isTransitioning.current = true;
      onPresetApplied();
    }
  }, [cameraPreset, onPresetApplied]);

  useFrame((state) => {
    const camera = state.camera;
    const controls = controlsRef.current;

    // 1. Smoothly interpolate position and lookAt during transitions
    if (isTransitioning.current && controls) {
      camera.position.lerp(targetCameraPos.current, 0.08);
      controls.target.lerp(targetLookAt.current, 0.08);
      controls.update();

      const posDist = camera.position.distanceTo(targetCameraPos.current);
      const lookDist = controls.target.distanceTo(targetLookAt.current);

      if (posDist < 0.05 && lookDist < 0.05) {
        camera.position.copy(targetCameraPos.current);
        controls.target.copy(targetLookAt.current);
        isTransitioning.current = false;
        controls.update();
      }
    }

    // 2. STRICT INDOOR BOUNDARY ENFORCEMENT
    // Guarantee camera never leaves the interior of the theater
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, BOUNDS.minX, BOUNDS.maxX);
    camera.position.y = THREE.MathUtils.clamp(camera.position.y, BOUNDS.minY, BOUNDS.maxY);
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, BOUNDS.minZ, BOUNDS.maxZ);

    // Keep OrbitControls look target inside the auditorium as well
    if (controls) {
      controls.target.x = THREE.MathUtils.clamp(controls.target.x, BOUNDS.minX + 0.5, BOUNDS.maxX - 0.5);
      controls.target.y = THREE.MathUtils.clamp(controls.target.y, 0.8, BOUNDS.maxY - 0.5);
      controls.target.z = THREE.MathUtils.clamp(controls.target.z, BOUNDS.minZ + 1.0, SCREEN_CENTER.z);
    }
  });

  return null;
};

/**
 * Loads the exported photorealistic Blender 3D cinema theater model.
 */
const BlenderAuditoriumModel: React.FC = () => {
  const { scene } = useGLTF('/models/cinema_theatre_auditorium.glb');

  useEffect(() => {
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

interface MovieScreenProps {
  videoTexture: THREE.VideoTexture | null;
  isPlaying: boolean;
}

/**
 * 3D Movie Screen displaying the live movie trailer inside the cinema auditorium.
 */
const MovieScreen: React.FC<MovieScreenProps> = ({ videoTexture, isPlaying }) => {
  const [stillTexture, setStillTexture] = useState<THREE.Texture | null>(null);

  // Load fallback still texture in case video texture is initializing
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load('/textures/cinema_screen_film_still.png', (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      setStillTexture(tex);
    });
  }, []);

  const activeTexture = videoTexture || stillTexture;

  return (
    <group position={[0, 3.95, 2.27]}>
      {/* Movie Screen Plane - dimensions match 13.5m x 5.65m CinemaScope frame */}
      {/* Rotated Math.PI around Y to face towards -Z (the auditorium audience) */}
      <mesh rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[13.48, 5.63]} />
        {activeTexture ? (
          <meshBasicMaterial map={activeTexture} toneMapped={false} side={THREE.FrontSide} />
        ) : (
          <meshStandardMaterial color="#111827" roughness={0.3} />
        )}
      </mesh>

      {/* Screen Projector Glow cast onto the audience seats & stage */}
      <spotLight
        position={[0, 0, -0.2]}
        target-position={[0, -2.5, -9.0]}
        intensity={isPlaying ? 1.6 : 0.6}
        color="#93c5fd"
        distance={20}
        angle={1.05}
        penumbra={0.85}
      />
    </group>
  );
};

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
    opacity = 0.95;
  } else if (isHeld) {
    color = '#f59e0b';
    opacity = 0.7;
  } else if (hovered) {
    color = '#34d399';
    opacity = 0.85;
  }

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
      onDoubleClick={(e) => {
        e.stopPropagation();
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
          emissiveIntensity={isSelected || hovered ? 0.7 : 0.15}
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
    <group position={[0, 3.8, 0]}>
      <Text fontSize={0.5} color="#f59e0b" anchorX="center" anchorY="middle">
        Loading 3D Cinema Theater & Trailer...
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
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoTexture, setVideoTexture] = useState<THREE.VideoTexture | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [cameraPreset, setCameraPreset] = useState<{ pos: THREE.Vector3; look: THREE.Vector3 } | null>(null);

  // Initialize HTML5 Video element for the movie trailer
  useEffect(() => {
    const video = document.createElement('video');
    video.src = '/videos/cosmic_odyssey_trailer.mp4';
    video.crossOrigin = 'anonymous';
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;

    const handleCanPlay = () => {
      const texture = new THREE.VideoTexture(video);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = false;
      setVideoTexture(texture);
      video.play().catch((err) => {
        console.warn('Video auto-play deferred until user interaction', err);
      });
    };

    video.addEventListener('canplay', handleCanPlay);
    videoRef.current = video;

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.pause();
      video.removeAttribute('src');
      video.load();
      videoRef.current = null;
    };
  }, []);

  // Sync mute state
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
      if (!isMuted && videoRef.current.paused) {
        videoRef.current.play().catch(() => {});
      }
    }
  }, [isMuted]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleAudio = () => {
    setIsMuted((prev) => !prev);
  };

  // Camera presets within physical hall bounds
  const applyPreset = (pos: THREE.Vector3, look: THREE.Vector3) => {
    setCameraPreset({ pos, look });
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas shadows camera={{ position: [0, 4.0, -15.5], fov: 55 }}>
        {/* Collision Boundary & Smooth Transition Controller */}
        <CameraBoundaryController
          previewSeat={previewSeat}
          controlsRef={controlsRef}
          cameraPreset={cameraPreset}
          onPresetApplied={() => setCameraPreset(null)}
        />

        {/* Orbit Controls with strict distance & angle clamping */}
        <OrbitControls
          ref={controlsRef}
          target={[0, 3.6, 2.3]}
          minDistance={0.8}
          maxDistance={16.5}
          minPolarAngle={Math.PI / 8}
          maxPolarAngle={Math.PI / 2.05}
          enableDamping
          dampingFactor={0.08}
        />

        {/* Ambient & Architectural Lighting */}
        <ambientLight intensity={0.45} color="#94a3b8" />
        <directionalLight
          position={[0, 6.8, -10]}
          intensity={0.7}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />

        {/* Projection Booth Spotlight focused on the screen */}
        <spotLight
          position={[0, 6.2, -18.5]}
          target-position={[0, 3.95, 2.3]}
          intensity={2.0}
          angle={0.42}
          penumbra={0.7}
          color="#f8fafc"
        />

        {/* Photorealistic Blender 3D Theater Model */}
        <Suspense fallback={<LoadingFallback />}>
          <BlenderAuditoriumModel />
        </Suspense>

        {/* Live Movie Trailer Screen */}
        <MovieScreen videoTexture={videoTexture} isPlaying={isPlaying} />

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

      {/* Top Floating Cinema HUD: Movie Trailer & Audio Controls */}
      <div
        style={{
          position: 'absolute',
          top: 16,
          left: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          zIndex: 10,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '10px',
            padding: '8px 14px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#f59e0b', fontSize: '13px', fontWeight: 700 }}>
            <Video size={16} />
            <span>TRAILER ON SCREEN</span>
          </div>

          <div style={{ height: '14px', width: '1px', background: 'rgba(255, 255, 255, 0.2)' }} />

          {/* Play/Pause Button */}
          <button
            onClick={togglePlay}
            title={isPlaying ? 'Pause Movie Trailer' : 'Play Movie Trailer'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: isPlaying ? 'rgba(59, 130, 246, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              color: isPlaying ? '#93c5fd' : '#fca5a5',
              border: `1px solid ${isPlaying ? '#3b82f6' : '#ef4444'}`,
              borderRadius: '6px',
              padding: '5px 10px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {isPlaying ? <Pause size={13} /> : <Play size={13} />}
            <span>{isPlaying ? 'Playing' : 'Paused'}</span>
          </button>

          {/* Audio Mute/Unmute Button */}
          <button
            onClick={toggleAudio}
            title={isMuted ? 'Unmute Theater Audio' : 'Mute Theater Audio'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: isMuted ? 'rgba(148, 163, 184, 0.15)' : 'rgba(16, 185, 129, 0.25)',
              color: isMuted ? '#cbd5e1' : '#34d399',
              border: `1px solid ${isMuted ? 'rgba(255, 255, 255, 0.2)' : '#10b981'}`,
              borderRadius: '6px',
              padding: '5px 12px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: isMuted ? 'none' : '0 0 12px rgba(16, 185, 129, 0.4)',
            }}
          >
            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            <span>{isMuted ? 'Audio Muted' : 'Sound ON'}</span>
          </button>
        </div>

        {/* Boundary Guard Status Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '6px',
            padding: '4px 10px',
            fontSize: '11px',
            color: '#93c5fd',
            width: 'fit-content',
          }}
        >
          <ShieldCheck size={13} color="#3b82f6" />
          <span>Interior Camera Boundary: Locked inside Theater</span>
        </div>
      </div>

      {/* Top-Right Camera Vantage Presets Bar */}
      <div
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          display: 'flex',
          gap: 6,
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '10px',
          padding: '6px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
          zIndex: 10,
        }}
      >
        <button
          onClick={() => applyPreset(new THREE.Vector3(0, 4.0, -15.5), new THREE.Vector3(0, 3.6, 2.3))}
          title="Auditorium Overview Perspective"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            background: 'rgba(255, 255, 255, 0.08)',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            padding: '5px 10px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <Compass size={13} />
          <span>Overview</span>
        </button>

        <button
          onClick={() => applyPreset(new THREE.Vector3(0, 1.55, -7.6), new THREE.Vector3(0, 3.95, 2.3))}
          title="VIP Recliner Row D Center View"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            background: 'rgba(234, 179, 8, 0.15)',
            color: '#fef08a',
            border: '1px solid rgba(234, 179, 8, 0.4)',
            borderRadius: '6px',
            padding: '5px 10px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <Crown size={13} color="#eab308" />
          <span>VIP D08</span>
        </button>

        <button
          onClick={() => applyPreset(new THREE.Vector3(0, 1.05, -4.0), new THREE.Vector3(0, 3.95, 2.3))}
          title="Front Row A Immersive View"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            background: 'rgba(255, 255, 255, 0.08)',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            padding: '5px 10px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <Eye size={13} />
          <span>Front Row A08</span>
        </button>
      </div>
    </div>
  );
};
