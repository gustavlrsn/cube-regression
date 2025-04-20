import { useMemo } from "react";

// Point3D interface for compatibility with RegressionCube component
interface Point3D {
  x: number;
  y: number;
  z: number;
}

// Calculate the plane equation from rotation angles and height
function calculatePlaneEquation(
  height: number,
  xRotation: number,
  zRotation: number,
  cubeSize: number
) {
  // Convert angles to radians
  const xRad = (xRotation * Math.PI) / 180;
  const zRad = (zRotation * Math.PI) / 180;

  // Add the initial 90-degree rotation that makes the plane horizontal
  const initialXRotation = Math.PI / 2;
  const effectiveXRad = initialXRotation + xRad;

  // Calculate the normal vector of the plane
  const normalX = Math.sin(effectiveXRad);
  const normalY = Math.cos(effectiveXRad) * Math.cos(zRad);
  const normalZ = Math.sin(zRad) * Math.cos(effectiveXRad);

  // Calculate the d value in the plane equation ax + by + cz + d = 0
  // The plane's y position is height * cubeSize - cubeSize/2
  const yPosition = height * cubeSize - cubeSize / 2;
  const d = -normalX * 0 - normalY * yPosition - normalZ * 0;

  // Return coefficients for the equation y = β₀ + β₁x + β₂z
  // From ax + by + cz + d = 0 -> by = -ax - cz - d -> y = (-a/b)x + (-c/b)z + (-d/b)
  const beta0 = -d / normalY; // Intercept
  const beta1 = -normalX / normalY; // Coefficient for x
  const beta2 = -normalZ / normalY; // Coefficient for z

  return { beta0, beta1, beta2, normalVector: [normalX, normalY, normalZ] };
}

// Calculate the total error (sum of squared distances) between points and the plane
function calculateError(
  points: Point3D[],
  equation: { beta0: number; beta1: number; beta2: number }
) {
  const { beta0, beta1, beta2 } = equation;

  return points.reduce((totalError, point) => {
    // Predicted y value based on the plane equation
    const predictedY = beta0 + beta1 * point.x + beta2 * point.z;

    // Squared error
    const error = Math.pow(point.y - predictedY, 2);

    return totalError + error;
  }, 0);
}

interface RegressionStatsProps {
  height: number;
  xRotation: number;
  zRotation: number;
  points: Point3D[];
  cubeSize: number;
}

export function RegressionStats({
  height,
  xRotation,
  zRotation,
  points,
  cubeSize,
}: RegressionStatsProps) {
  const equation = useMemo(() => {
    return calculatePlaneEquation(height, xRotation, zRotation, cubeSize);
  }, [height, xRotation, zRotation, cubeSize]);

  const error = useMemo(() => {
    return calculateError(points, equation);
  }, [points, equation]);

  return (
    <div className="bg-gray-900 p-4 text-white">
      <h2 className="text-xl font-bold mb-2">Regression Plane</h2>

      <div className="mb-4">
        <h3 className="text-lg font-semibold">Equation of the Plane:</h3>
        <p className="font-mono text-lg">
          y = {equation.beta0.toFixed(2)} {equation.beta1 >= 0 ? "+ " : "- "}
          {Math.abs(equation.beta1).toFixed(2)}x{" "}
          {equation.beta2 >= 0 ? "+ " : "- "}
          {Math.abs(equation.beta2).toFixed(2)}z
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold">Total Error:</h3>
        <p className="font-mono text-lg">{error.toFixed(4)}</p>
      </div>

      <div className="mt-4">
        <h3 className="text-lg font-semibold">Normal Vector:</h3>
        <p className="font-mono">
          [{equation.normalVector[0].toFixed(2)},{" "}
          {equation.normalVector[1].toFixed(2)},{" "}
          {equation.normalVector[2].toFixed(2)}]
        </p>
      </div>
    </div>
  );
}
