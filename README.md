# 3D Linear Regression Visualizer

An interactive 3D visualization tool to help understand linear regression with two independent variables.

## Purpose

This application serves as a pedagogical tool to help users understand how linear regression works in the case of two independent variables. By manipulating a plane in 3D space, users can see how the plane fits to data points and how the regression equation changes.

## Features

- Interactive 3D visualization of a regression plane and data points
- Real-time calculation of the regression equation as you adjust the plane
- Visualization of error lines between points and the plane
- Control to adjust the noise level in the generated data
- Display of total error (sum of squared distances)
- Ability to show/hide error lines

## How to Use

1. **Run the application**:

   ```
   npm install
   npm run dev
   ```

2. **Interact with the visualization**:

   - Use your mouse to rotate, pan, and zoom the 3D view
   - Use the sliders to adjust the plane:
     - **Plane Height**: Move the plane up and down
     - **X-Axis Rotation**: Rotate the plane around the X-axis
     - **Z-Axis Rotation**: Rotate the plane around the Z-axis
   - Toggle "Show Error Lines" to visualize the errors between points and the plane
   - Adjust the "Data Noise Level" to change how closely the data points follow the underlying linear relationship

3. **Understand the visualization**:
   - The X and Z axes represent your independent variables
   - The Y axis represents your dependent variable (outcome)
   - The orange points represent your data
   - The blue plane represents your regression model
   - The red lines represent errors between the actual points and the predicted values
   - The equation shown is in the form: y = β₀ + β₁x + β₂z
   - The goal is to position the plane to minimize the total error

## Learning Objectives

- Understand how a regression plane fits to 3D data points
- Visualize how changes in coefficients affect the plane's position
- See how error (residuals) is calculated in multiple regression
- Develop intuition about the relationship between regression coefficients and the plane's orientation

## Technical Implementation

Built with:

- React
- Three.js
- React Three Fiber
- TypeScript

## License

MIT
