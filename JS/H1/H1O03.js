function setup() {
  canvas = createCanvas(450,450);
  background('white');
  canvas.parent('processing');
  noLoop();
  // colorMode(RGB,255,255,255,1);  
}

function draw() {
  noStroke();
  // fill(0,0,255,0.3);
  fill('red');
  rect(0,150,450,150);
  fill(0,255,0)
  rect(0,0,150,450);
  fill(#0000FF)  
  rect(75,0,375,450);
}