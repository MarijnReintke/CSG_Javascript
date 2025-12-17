var aantalLagen = 21;
var breedte = 90;
var hoogte;
var y = 0;

function setup() {
  hoogte = breedte / 2;
  canvas = createCanvas(aantalLagen*breedte + 1,aantalLagen*hoogte + 1);
  canvas.parent('processing');
  noLoop();
  background('silver');
  fill('lightslategray');
  stroke('darkslategray');
}

function draw() {
  for (var laag = 1; laag <= aantalLagen;laag++) {
  tekenRij(laag,(aantalLagen-laag)*breedte/2, y);
  y += hoogte
  }
}

function tekenRij(aantalStenen, inspringen, y) {
  push();
  translate(inspringen,y);
  for (var steen = 0;steen < aantalStenen;steen++) {
    rect(breedte*steen,0,breedte,hoogte);
  }
  pop();
}