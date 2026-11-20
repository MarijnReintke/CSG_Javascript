class Raster {
    constructor(x,y) {
        this.x = x
        this.y = y
        this.gridAmountX = 9
        this.gridAmountY = 9
    }
}

function setup() {
  canvas = createCanvas(1000,500);
  canvas.parent('processing');
  textFont("Courier");
  textSize(40);
  noStroke();
  colorMode(RGB,255,255,255,1)
  frameRate(60)
  noSmooth();
  angleMode(DEGREES)
}

function draw() {
    background('white')
}