import type { Route } from "./+types/home";
import { RegressionCube } from "../components/RegressionCube";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "3D Linear Regression Visualizer" },
    {
      name: "description",
      content:
        "Interactive 3D visualization of linear regression with two independent variables",
    },
  ];
}

export default function Home() {
  return (
    <div className="h-screen bg-gray-900">
      <RegressionCube />
    </div>
  );
}
