

function setup() {
  canvas = createCanvas(500,500);
  background(150,50,50);
  canvas.parent('processing');
  textFont("Pacifico");
  textSize(60);
  frameRate(20);
  // noLoop();
}

function draw() {
  background(150,50,50);
  noStroke()
  fill(255,200,100)
  text("Fijne Kerstdagen!",40,height/2)
  for (var n = 1; n <= 5;n++) {
  push()
  translate(75*n,75)
  kerstboom()
  pop()
  }
  for (var n = 1; n <= 100;n++) {
    push()
    fill('white')
    ellipse(random(0,width),random(0,height),5)
    pop()
  }
}

function kerstboom() {
  push()
  fill("brown")
  stroke("maroon")
  rect(15,50,20,40)
  fill("darkgreen")
  stroke(0,50,0)
  triangle(25,0,60,50,-10,50)
  translate(0,-17)
  triangle(25,0,60,50,-10,50)
  translate(0,-17)
  triangle(25,0,60,50,-10,50)
  translate(0,-17)
  triangle(25,0,60,50,-10,50)
  pop()
}