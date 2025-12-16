kleur='white';

function setup() {
  canvas = createCanvas(500,500);
  canvas.parent('processing');
  background('coral');
}

function draw() {
  for (var rij = 0;rij < 500;rij += 50) {
    if (kleur == 'white') {
        kleur = 'black';
      }
      else {
        kleur = 'white';
      }
    for (var kolom = 0;kolom < 500;kolom += 50) {
      if (kleur == 'white') {
        kleur = 'black';
      }
      else {
        kleur = 'white';
      }
      fill(kleur);
      rect(kolom,rij,50,50);
    }
  }
}