var diameter = 300;
var d = 0;

function setup() {
  canvas = createCanvas(450,450);
  canvas.parent('processing');
  colorMode(RGB, 255, 255, 255, 1);
  noStroke();
}

function draw() {
  background(255,255,255,1);
  fill(255,0,0,0.5);
  ellipse(width/2,height/2,diameter);
  push()
  translate(0,-d)
  fill(0,255,0,0.5);
  ellipse(width/2,height,diameter);
  pop()
  push()
  translate(0,d)
  fill(0,0,255,0.5);
  ellipse(width/2,0,diameter);
  pop()
  d++;
}