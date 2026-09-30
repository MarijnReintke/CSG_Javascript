var cirkel = {
  diameter: 40,
  straal: null,
  x: null,
  y: null,
  alpha: 0.8,
  aantalRaak: 0,

  teken() {
    push();
    noStroke();
    fill(246, 181, 79,this.alpha);
    ellipse(this.x,this.y,this.diameter);
    pop();
  },

  kiesEenPlek() {
    cirkel.x = random(this.diameter,canvas.width - this.diameter);
    cirkel.y = random(this.diameter,canvas.height - this.diameter);
  },

  controleerRaak() {
    afstandMuisCirkel = dist(mouseX,mouseY,this.x,this.y);
    if (afstandMuisCirkel <= cirkel.diameter/2) {
      if (mouseIsPressed == true) {
        cirkel.aantalRaak += 1
        cirkel.kiesEenPlek()
        cirkel.alpha *= 0.8
      }
    }
  }
}

function preload() {
  achtergrond = loadImage("images/choco.jpg");
}

function setup() {
  canvas = createCanvas(450,450);
  canvas.parent('processing');
  colorMode(RGB,255,255,255,1);
  frameRate(10);
  textFont("Verdana");
  textSize(30);
  cirkel.straal = cirkel.diameter / 2;
  cirkel.kiesEenPlek();
}

function draw() {
  background(achtergrond);

  if (keyIsPressed) {
    background('black');
  }

  cirkel.controleerRaak();
  cirkel.teken();
  fill('white')
  text("Aantal raak: " + cirkel.aantalRaak + "!",0,0,400)
}