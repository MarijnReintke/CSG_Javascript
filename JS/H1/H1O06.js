function setup() {
  canvas = createCanvas(900,200);
  background('lavender');
  canvas.parent('processing');
  noLoop();
}

function draw() {
  noStroke();
  fill('thistle');
  translate(50,50);
  rect(0,0,100,100);
  
  translate(140,0);
  rect(0,0,100,100);
  translate(140,0);
  rect(0,0,100,100);
  
  translate(140,0);
  // BEGIN aanpassing
  push();
  stroke('cornsilk');
  strokeWeight(20);
  fill('teal');
  translate(0,40); 
  rect(0,0,100,100);
  // EINDE aanpassing
  translate(140,0);
  rect(0,0,100,100);
  pop();
  translate(280,0);
  rect(0,0,100,100);  
}
