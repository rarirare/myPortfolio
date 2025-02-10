let time = 0;
let direction = 1;
let sphereX = 0;
let graphics2D;

function setup() {
  // Create main canvas in WEBGL mode

  let canvas = createCanvas(windowWidth,400, WEBGL);
  canvas.parent('firstSketch');
  // Create a separate 2D graphics buffer for the pipe
  graphics2D = createGraphics(windowWidth, 400);
}

function draw() {
  background(255);
  
  // Draw pipe in 2D graphics buffer
  graphics2D.background(255);
  graphics2D.noFill();
  graphics2D.stroke(0);
  graphics2D.push();
  graphics2D.translate(width/2, height/2);
  
  // Calculate breathing effect
  let breathing = sin(time * 0.05) * 20 + 50; // Oscillates between 30 and 70
  time += 1;
  
  // Draw the pipe made of circles with breathing effect
  for (let x = -width/2; x < width/2; x += 1) {
    let y = sin(x * 0.05) * 100;
    graphics2D.circle(x, y, breathing);
  }
  graphics2D.pop();
  
  // Display the 2D graphics on main canvas
  texture(graphics2D);
  noStroke();
  plane(windowWidth, 400);
  
  // Animate the sphere
  sphereX += 2 * direction;
  
  // Reverse direction when reaching edges
  if (sphereX > width/2 || sphereX < -width/2) {
    direction *= -1;
  }
  
  // Calculate y position based on current x position
  let sphereY = sin(sphereX * 0.05) * 100;
  
  // Draw the 3D sphere
  push();
  translate(sphereX, sphereY, 30); // Lift sphere slightly above the pipe
  
  // Add lighting for 3D effect
  ambientLight(50);
  pointLight(255, 255, 255, 0, 0, 100);
  
  // Material properties for the sphere
  ambientMaterial(255, 0, 0);
  specularMaterial(250);
  shininess(50);
  
  // Draw sphere with size relative to pipe
  let sphereSize = breathing * 0.3;
  sphere(sphereSize);
  pop();
}