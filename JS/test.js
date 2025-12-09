var Yvel = 2;
var Xvel = 2;
var straal = 50;
var posX = straal;
var posY = straal;
var xPlr = straal/2;
var yPlr;
var afstand1;
var afstand2;

function setup() {
  canvas = createCanvas(1000,500);
  yPlr = height/2;
  background('silver');
  canvas.parent('processing');
  // noLoop();
}

function draw() {

  afstand1 = dist(xPlr,yPlr,300,posY);

  if (afstand1 < straal*1.5) {
    noLoop();
  }

  if (keyIsDown(65)) {
    xPlr -= 2.5;
  }
  if (keyIsDown(68)) {
    xPlr += 2.5;
  }
  if (keyIsDown(87)) {
    yPlr -= 2.5;
  }
  if (keyIsDown(83)) {
    yPlr += 2.5;
  }

  xPlr = constrain(xPlr,straal/2,width - straal/2);
  yPlr = constrain(yPlr,straal/2,height - straal/2);

  if (posY > height - straal || posY < straal) {
    Yvel *= -1
  }
  if (posX > width - straal || posX < straal) {
    Xvel *= -1
  }

  noStroke();
  background('silver');
  fill('steelblue');
  ellipse(xPlr,yPlr,straal);
  fill('steelblue');
  ellipse(300,posY,straal*2);
  fill('deepskyblue');
  ellipse(700,height-posY,straal*2);
  posY += Yvel;
  posX += Xvel;
}