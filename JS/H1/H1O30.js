
function setup() {
  canvas = createCanvas(451,451);
  canvas.parent('processing');
  background('coral');
  fill('white');
}

function draw() {
  for (var rij = 0;rij < 450;rij += 50) {
    for (var kolom = 0;kolom < 450;kolom += 50) {
      push()
      if (rij == 3*50 && kolom == 6*50) {
      fill('magenta');
      }
      rect(kolom,rij,50,50);
      pop()
    }
  }
}