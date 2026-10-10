class Vierkant {
  constructor(y,v) {
    this.x = 0
    this.y = y
    this.xVel = v
    this.breedte = 50
  }
    // Elk vierkant heeft dezelfde startpositie van x (0) en dezelfde breedte (50).

    // Elk vierkant heeft een eigen y en een eigen snelheid

    beweeg() {
      this.x += this.xVel

      if (this.x <= 0 || this.x >= width-this.breedte) {
        this.xVel *= -1
      }

        // Verander x op basis van de snelheid

        // Als het vierkant links of rechts de rand raakt, verander de richting
    }

    teken() {
      rect(this.x,this.y,this.breedte)
        // Teken dit vierkant
    }
}

var vierkanten = [];

function setup() {
    canvas = createCanvas(450, 450);
    canvas.parent('processing');

    for (var a = 0; a < 5; a++) {
      vierkant = new Vierkant((a+1)*100,(a+1))
      vierkanten.push(vierkant)
    }
    // Maak drie vierkanten aan: één met y=100,snelheid=1, één met y=200,snelheid=2, en één met y=300,snelheid=3
}

function draw() {
    background('lightblue');

    for (var a = 0; a < vierkanten.length; a++) {
      vierkanten[a].beweeg()
      vierkanten[a].teken()
    }
    // Teken alle vierkanten (let op: for-loop)
}