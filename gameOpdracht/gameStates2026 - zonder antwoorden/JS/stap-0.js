/*  **********************************************************
    **                 BEGIN klasse Spel                    **
    ********************************************************** */


class Spel {
  constructor() {
    this.level = null;
    this.score = null;
    this.toestand = null;
  }

  nieuwSpel() {
    this.level = 1;
    this.score = 0;
    this.toestand = 'begin';
  }

  verwerkInvoer() {
    console.log('key: '+key+'   keyCode: '+keyCode);
    if (keyCode == 32) {
      if (this.toestand == 'tussenscherm') {
        this.level++
        this.toestand = 'speel'
      }
      if (this.toestand == 'begin') {
        this.toestand = 'speel'
      }
    }
    if (key === 'v') {
      if (this.toestand == 'speel') {
        this.score += floor(random(1,10))
        this.toestand = 'tussenscherm'
      }
    }
    if (this.toestand = 'speel') {
      
    }
    // hier komt de code die bepaalt wat er gebeurt als je een toets indrukt
  }

  tekenTekst(tekst,kleur) {
    push();
    textStyle(BOLD);
    fill(kleur);
    textSize(20);
    textAlign(CENTER,CENTER);
    text(tekst,0,0,canvas.width,canvas.height);
    pop();
  }

  tekenBeginScherm() {
    background('#e4510e');
    this.tekenTekst('Klaar voor het spel?\nDruk spatie om te starten','black');
  }

  tekenSpeelScherm() {
    background('#50b5f0')
    this.tekenTekst('Dit is level ' + this.level + '.\nDruk V om naar het volgende level te gaan.','black')
    this.tekenScorebord()
  }

  tekenTussenScherm() {
    background('#20bb0a')
    this.tekenTekst('Klaar voor het volgende level?\nDruk Spatie om te starten.','black')
    this.tekenScorebord()
  }

  tekenScorebord() {
    push()
      fill(200,200,200)
      rect(0,0,width,20)
      fill('black')
      textSize(18);
      print(this.score)
      text('Score: ' + this.score,2,2,200,20);
    pop()
  }

  teken() {
    if (this.toestand == 'begin') {
      this.tekenBeginScherm();
    }
    if (this.toestand == 'speel') {
      this.tekenSpeelScherm();
    }
    if (this.toestand == 'tussenscherm') {
      this.tekenTussenScherm();
    }
  }
}

/*  **********************************************************
    **      EINDE klasse Spel      BEGIN hoofdprogramma     **
    ********************************************************** */


function setup() {
  canvas = createCanvas(450,450);
  canvas.parent('processing');
  spel = new Spel();
  spel.nieuwSpel();
  spel.teken();
}

function keyPressed() {
  spel.verwerkInvoer();
  spel.teken();
}

/*  **********************************************************
    **               EINDE hoofdprogramma                   **
    ********************************************************** */
