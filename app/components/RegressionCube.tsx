import { useRef, useState, useMemo } from "react";
import { Canvas, useFrame, extend, useThree } from "@react-three/fiber";
import { OrbitControls, Text, Plane } from "@react-three/drei";
import * as THREE from "three";
import { RegressionStats } from "./RegressionStats";

// Constants for the cube dimensions
const CUBE_SIZE = 5;
const HALF_SIZE = CUBE_SIZE / 2;

// Define point interface for TypeScript
interface Point3D {
  x: number;
  y: number;
  z: number;
}

// Component for displaying the cube grid
function CubeGrid() {
  return (
    <group>
      {/* Cube wireframe */}
      <lineSegments>
        <edgesGeometry
          args={[new THREE.BoxGeometry(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE)]}
        />
        <lineBasicMaterial color="white" transparent opacity={0.5} />
      </lineSegments>

      {/* Axis labels */}
      <Text position={[HALF_SIZE + 0.5, 0, 0]} fontSize={0.5} color="red">
        X1
      </Text>
      <Text position={[0, HALF_SIZE + 0.5, 0]} fontSize={0.5} color="green">
        Y (outcome)
      </Text>
      <Text position={[0, 0, HALF_SIZE + 0.5]} fontSize={0.5} color="blue">
        X2
      </Text>

      {/* Grid for better visual reference */}
      <gridHelper args={[CUBE_SIZE, 10]} position={[0, -HALF_SIZE, 0]} />
      <gridHelper
        args={[CUBE_SIZE, 10]}
        position={[0, 0, -HALF_SIZE]}
        rotation={[Math.PI / 2, 0, 0]}
      />
      <gridHelper
        args={[CUBE_SIZE, 10]}
        position={[-HALF_SIZE, 0, 0]}
        rotation={[0, 0, Math.PI / 2]}
      />
    </group>
  );
}

// Props interface for the RegressionPlane component
interface RegressionPlaneProps {
  height: number;
  xRotation: number;
  zRotation: number;
}

// Component for the regression plane
function RegressionPlane({
  height,
  xRotation,
  zRotation,
}: RegressionPlaneProps) {
  const planeRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (planeRef.current) {
      // Apply the user-controlled rotations to the group
      // This doesn't affect the plane's initial orientation
      planeRef.current.rotation.set(
        (xRotation * Math.PI) / 180,
        0,
        (zRotation * Math.PI) / 180
      );

      // Set the height (y-position)
      planeRef.current.position.y = height * CUBE_SIZE - HALF_SIZE;
    }
  });

  return (
    <group ref={planeRef}>
      {/* Apply rotation directly to the Plane to make it horizontal */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[CUBE_SIZE, CUBE_SIZE]} />
        <meshStandardMaterial
          color="#5f9ea0"
          transparent={true}
          opacity={0.7}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

// Generate data points that follow a linear model with some noise
function generateDataPoints(count = 30, noise = 0.8): Point3D[] {
  // Real coefficients for the true relationship
  const trueBeta0 = 0; // intercept
  const trueBeta1 = 0.5; // x coefficient
  const trueBeta2 = -0.3; // z coefficient

  return Array(count)
    .fill(0)
    .map(() => {
      // Generate random x and z in the cube
      const x = (Math.random() - 0.5) * CUBE_SIZE * 0.8;
      const z = (Math.random() - 0.5) * CUBE_SIZE * 0.8;

      // Calculate y based on the linear model with noise
      const y =
        trueBeta0 +
        trueBeta1 * x +
        trueBeta2 * z +
        (Math.random() - 0.5) * noise * CUBE_SIZE * 0.4;

      // Ensure y is within the cube bounds
      const clampedY = Math.max(-HALF_SIZE * 0.9, Math.min(HALF_SIZE * 0.9, y));

      return { x, y: clampedY, z };
    });
}

// Props interface for the DataPoints component
interface DataPointsProps {
  points: Point3D[];
  onPointsChange?: (points: Point3D[]) => void;
}

// Component for the data points
function DataPoints({ points, onPointsChange }: DataPointsProps) {
  return (
    <group>
      {points.map((point, i) => (
        <mesh key={i} position={[point.x, point.y, point.z]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="orange" />
        </mesh>
      ))}
    </group>
  );
}

// Props interface for ErrorLines component
interface ErrorLinesProps {
  points: Point3D[];
  height: number;
  xRotation: number;
  zRotation: number;
}

// Component for vertical lines showing errors
function ErrorLines({ points, height, xRotation, zRotation }: ErrorLinesProps) {
  // Calculate the plane equation
  const xRad = (xRotation * Math.PI) / 180;
  const zRad = (zRotation * Math.PI) / 180;

  // Add the initial 90-degree rotation that makes the plane horizontal
  const initialXRotation = Math.PI / 2;
  const effectiveXRad = initialXRotation + xRad;

  // Normal vector of the plane
  const normalX = Math.sin(effectiveXRad);
  const normalY = Math.cos(effectiveXRad) * Math.cos(zRad);
  const normalZ = Math.sin(zRad) * Math.cos(effectiveXRad);

  // Y position of the plane at the center
  const yPosition = height * CUBE_SIZE - HALF_SIZE;

  // Calculate d in the plane equation ax + by + cz + d = 0
  const d = -normalX * 0 - normalY * yPosition - normalZ * 0;

  // For each point, we'll calculate where the plane intersects a vertical line through the point
  return (
    <group>
      {points.map((point, i) => {
        // Calculate where the plane would intersect a vertical line through this point
        // Solve for y in ax + by + cz + d = 0 where x and z are from the point
        const predictedY =
          (-normalX * point.x - normalZ * point.z - d) / normalY;

        // Create vertices array for the line
        const vertices = new Float32Array([
          point.x,
          point.y,
          point.z,
          point.x,
          predictedY,
          point.z,
        ]);

        // Draw a line from the point to the plane
        return (
          <line key={i}>
            <bufferGeometry>
              <bufferAttribute
                attach="position"
                args={[vertices, 3]}
                count={2}
              />
            </bufferGeometry>
            <lineBasicMaterial color="red" />
          </line>
        );
      })}
    </group>
  );
}

// Main component
export function RegressionCube() {
  const [height, setHeight] = useState(0.5); // Set to middle of the cube for horizontal plane
  const [xRotation, setXRotation] = useState(0); // Start with 0 degrees on x-axis for horizontal plane
  const [zRotation, setZRotation] = useState(0); // Start with 0 degrees on z-axis for horizontal plane
  const [showErrors, setShowErrors] = useState(true);
  const [noiseLevel, setNoiseLevel] = useState(0.8); // Noise level for data generation

  // Generate data points
  const points = useMemo(() => {
    return generateDataPoints(30, noiseLevel);
  }, [noiseLevel]);

  // Function to regenerate data points with different noise levels
  const regenerateData = (noise: number) => {
    setNoiseLevel(noise);
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 relative">
        <Canvas camera={{ position: [7, 5, 7], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <CubeGrid />
          <DataPoints points={points} />
          <RegressionPlane
            height={height}
            xRotation={xRotation}
            zRotation={zRotation}
          />
          {showErrors && (
            <ErrorLines
              points={points}
              height={height}
              xRotation={xRotation}
              zRotation={zRotation}
            />
          )}
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
          />
        </Canvas>

        <div className="absolute top-0 right-0 p-4 text-white bg-black bg-opacity-50 rounded-bl-lg">
          <h2 className="text-xl mb-2">Linear Regression in 3D</h2>
          <p>Adjust the sliders to fit the plane to the data points.</p>
          <p>
            The goal is to minimize the total error (sum of squared distances).
          </p>
        </div>
      </div>

      {/* Controls section */}
      <div className="bg-gray-800 p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div>
              <label htmlFor="height" className="block text-white mb-2">
                Plane Height: {(height * CUBE_SIZE - HALF_SIZE).toFixed(2)}
              </label>
              <input
                id="height"
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={height}
                onChange={(e) => setHeight(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="xRotation" className="block text-white mb-2">
                X1-Axis Rotation: {xRotation.toFixed(0)}°
              </label>
              <input
                id="xRotation"
                type="range"
                min="-70"
                max="70"
                step="1"
                value={xRotation}
                onChange={(e) => setXRotation(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="zRotation" className="block text-white mb-2">
                X2-Axis Rotation: {zRotation.toFixed(0)}°
              </label>
              <input
                id="zRotation"
                type="range"
                min="-70"
                max="70"
                step="1"
                value={zRotation}
                onChange={(e) => setZRotation(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex items-center text-white mb-2">
                <input
                  id="showErrors"
                  type="checkbox"
                  checked={showErrors}
                  onChange={(e) => setShowErrors(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="showErrors">Show Error Lines</label>
              </div>
            </div>

            <div>
              <label htmlFor="noiseLevel" className="block text-white mb-2">
                Data Noise Level: {noiseLevel.toFixed(2)}
              </label>
              <input
                id="noiseLevel"
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={noiseLevel}
                onChange={(e) => regenerateData(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          <RegressionStats
            height={height}
            xRotation={xRotation}
            zRotation={zRotation}
            points={points}
            cubeSize={CUBE_SIZE}
          />
        </div>
      </div>
    </div>
  );
}
