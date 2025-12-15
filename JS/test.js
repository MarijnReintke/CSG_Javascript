var Yvel1 = 10;
var Xvel1 = 2;

var Yvel2 = 2;
var Xvel2 = 10;

var straal = 50;

var posX1 = 300
var posY1 = straal;

var posX2 = 700
var posY2;

var xPlr = straal/2;
var yPlr;

var afstand1;
var afstand2;

var level = 1;

function setup() {
  canvas = createCanvas(1000,500);
  yPlr = height/2;
  posY2 = height-straal;
  background('silver');
  canvas.parent('processing');
  textFont("Verdana");
  textSize(100);
  // noLoop();
}

function draw() {

  if (keyIsDown(65)) {
    xPlr -= 5;
  }
  if (keyIsDown(68)) {
    xPlr += 5;
  }
  if (keyIsDown(87)) {
    yPlr -= 5;
  }
  if (keyIsDown(83)) {
    yPlr += 5;
  }

  xPlr = constrain(xPlr,straal/2,width - straal/2);
  yPlr = constrain(yPlr,straal/2,height - straal/2);

  if (posY1 > height - straal || posY1 < straal) {
    Yvel1 *= -1
  }
  if (posX1 > width - straal || posX1 < straal) {
    Xvel1 *= -1
  }

  if (posY2 > height - straal || posY2 < straal) {
    Yvel2 *= -1
  }
  if (posX2 > width - straal || posX2 < straal) {
    Xvel2 *= -1
  }

  noStroke();
  background('silver');
  fill('black');
  ellipse(xPlr,yPlr,straal);
  fill('red');
  ellipse(posX1,posY1,straal*2);
  fill('maroon');
  ellipse(posX2,posY2,straal*2);
  fill('lime');
  rect(width-20,0,20,height);

  afstand1 = dist(xPlr,yPlr,posX1,posY1);
  afstand2 = dist(xPlr,yPlr,posX2,posY2)

  if (xPlr > width-20-straal/2 && level == 10) {
    levelComplete();
  }
  if (xPlr > width-20-straal/2) {
    winScherm()
  }

  if (afstand1 < straal*1.5 || afstand2 < straal*1.5) {
    eindScherm();
    noLoop();
  }

  posY1 += Yvel1;
  posX1 += Xvel1;
  posY2 += Yvel2;
  posX2 += Xvel2;

  push()
  textSize(40)
  fill('black')
  text("Level: " + level,4,40);
  pop()
}

function eindScherm() {
  fill('black');
  text("GAME OVER!",width/5,height/2);
}

function levelComplete() {
  level += 1;
  Yvel1 = abs(Yvel1 * 1.1);
  Xvel1 = abs(Xvel1 * 1.15);
  Yvel2 = abs(Yvel2 * 1.15);
  Xvel2 = abs(Xvel2 * 1.05);

  yPlr = height/2;
  xPlr = straal;

  posX1 = 300
  posY1 = straal;

  posX2 = 700
  posY2 = height-straal;
}

function winScherm() {
  
}