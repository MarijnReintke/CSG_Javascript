var dobbelSteen = {
  x: 25,
  y: 25,
  grootte: 200,
  ogen: null,
  diameterOgen: 25,
  R: null,
  G: null,
  B: null,
  totaal: 0,
  
  gooi() {
    this.ogen = floor(random(0,6)) + 1;
    this.R = round(random(0,255));
    this.G = round(random(0,255));
    this.B = round(random(0,255));   
  },
  
  teken() {
    push();
    fill(this.R,this.G,this.B);
    stroke(this.R/2,this.G/2,this.B/2)
    strokeWeight(5)
    rect(this.x,this.y,this.grootte,this.grootte);
    noStroke()

    // hieronder volgt code om de stippen op de juiste plek te krijgen
    
    fill(this.R/4,this.G/4,this.B/4);    
    if (this.ogen!=1) {ellipse(this.x+this.grootte/6*1,this.y+this.grootte/6*1,this.diameterOgen,this.diameterOgen);}
    if (this.ogen==6) {ellipse(this.x+this.grootte/6*3,this.y+this.grootte/6*1,this.diameterOgen,this.diameterOgen);}
    if (this.ogen>3) {ellipse(this.x+this.grootte/6*5,this.y+this.grootte/6*1,this.diameterOgen,this.diameterOgen);}
    if (this.ogen==1 || this.ogen==3 || this.ogen==5) {ellipse(this.x+this.grootte/6*3,this.y+this.grootte/6*3,this.diameterOgen,this.diameterOgen);}
    if (this.ogen>3) {ellipse(this.x+this.grootte/6*1,this.y+this.grootte/6*5,this.diameterOgen,this.diameterOgen);}
    if (this.ogen==6) {ellipse(this.x+this.grootte/6*3,this.y+this.grootte/6*5,this.diameterOgen,this.diameterOgen);}
    if (this.ogen!=1) {ellipse(this.x+this.grootte/6*5,this.y+this.grootte/6*5,this.diameterOgen,this.diameterOgen);}
    pop();
  }
}

function setup() {
  canvas = createCanvas(450,450);
  canvas.parent('processing');
  colorMode(RGB,255,255,255,1);
  noStroke();
  textFont("Georgia");
  textSize(80);  
  frameRate(10);
  dobbelSteen.gooi();
}

function draw() {
  background('lightcyan');
  if (mouseIsPressed) {
    dobbelSteen.gooi();
    dobbelSteen.totaal += 1; 
  }
  dobbelSteen.teken();
  text("Totaal: " + dobbelSteen.totaal,20,height-100)
}