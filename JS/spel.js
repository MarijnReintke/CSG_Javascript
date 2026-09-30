class Obstruction {
  constructor(x,y) {
    this.x = x
    this.y = y
    this.width = gridSize
    this.transparency = 0
  }

  teken() {
    this.x = constrain(this.x,0,width-gridSize)
    this.y = constrain(this.y,0,height-gridSize)
    this.x = snapToGrid(this.x)
    this.y = snapToGrid(this.y)

    if (this.x == 0 && this.y == 0) {
      obstructions.splice(obstructions.indexOf(this),1)
    }

    push();
    noStroke();
    fill(100,100,100,1-this.transparency)
    rect(this.x,this.y,this.width);
    pop();
  }
}

class Hazard {
  constructor(x,y) {
    this.x = x
    this.y = y
    this.width = gridSize
    this.transparency = 0
  }

  teken() {
    this.x = constrain(this.x,0,width-gridSize)
    this.y = constrain(this.y,0,height-gridSize)
    this.x = snapToGrid(this.x)
    this.y = snapToGrid(this.y)

    push();
    noStroke();
    if (!(hazards.indexOf(this) == -1)) {
      fill((hazards.indexOf(this)+1)*255/(hazards.length),0,0,1-this.transparency)
    }
    else {
      fill(255,0,0,1-this.transparency)
    }
    rect(this.x,this.y,this.width)
    pop();
  }

  validPosition() {

    for (var a=0; a < hazards.length;a++) {
      if (this.x == hazards[a].x && this.y == hazards[a].y) {
        return false
      }
    }

    for (var a=0; a < winBlocks.length;a++) {
      if (this.x == winBlocks[a].x && this.y == winBlocks[a].y) {
        return false
      }
    }

    for (var a=0; a < obstructions.length;a++) {
      if (this.x == obstructions[a].x && this.y == obstructions[a].y) {
        return false
      }
    }

    if (this.x == plr.x && this.y == plr.y) {
        return false
    }

    if (hazards.length == 0) {
      return true
    }

    if ((abs(this.x-hazards[hazards.length-1].x) + abs(this.y-hazards[hazards.length-1].y)) == 40) {
      return true
    }

    return false

  }
}

class WinBlock {
  constructor(x,y) {
    this.x = x
    this.y = y
    this.width = gridSize
  }

  teken() {
    push();
    noStroke();
    fill('lime')
    rect(this.x,this.y,this.width);
    pop();
  }
}

class Plr {
  constructor(x,y) {
    this.targetX = x
    this.targetY = y
    this.previousX = null
    this.previousY = null
    this.x = x
    this.y = y
    this.width = gridSize
    this.spawnX = 0
    this.spawnY = 0
    this.hidden = false
    this.anchored = false
    this.transparency = 0
  }

  respawn() {
    this.targetX = this.spawnX
    this.targetY = this.spawnY
  }

  teken() {
    if (!this.hidden) {
      fill(0,0,0,1-this.transparency)
      rect(this.x,this.y,this.width);
      fill(255,255,255,1-this.transparency*0.5)
      rect(this.x + this.width-this.width*0.9,this.y + this.width-this.width*0.9,this.width*0.8);
    }
  }

  beweeg() {
    this.targetX = constrain(this.targetX,0,width-gridSize);
    this.targetY = constrain(this.targetY,0,height-gridSize);
    this.targetY = snapToGrid(this.targetY);
    this.targetX = snapToGrid(this.targetX);
    this.collisionCheck()

    if (this.previousX !== null && this.previousY !== null && ((this.previousX !== this.targetX) || (this.previousY !== this.targetY))) {
      hazards.splice(hazards.length-1,1)
      moves -= 1
    }
    
    this.hazardCheck()
    this.previousX = this.targetX
    this.previousY = this.targetY

    this.x += (this.targetX-this.x)/3;
    this.y += (this.targetY-this.y)/3;
  }

  collisionCheck() {

    for (var a = 0; a < winBlocks.length; a++) {
      if (winBlocks[a].x == this.targetX && winBlocks[a].y == this.targetY) {

        hazards.splice(0,hazards.length)
        for (var a=0;a < winBlocks.length;a++) {
          winBlocks.splice(a,1)
        }
        win = true

      }
    }

    for (var a = 0; a < obstructions.length; a++) {
      if (obstructions[a].x == this.targetX && obstructions[a].y == this.targetY) {
        this.targetX = this.previousX
        this.targetY = this.previousY
      }
    }

  }

  hazardCheck() {
    for (var a = 0; a < hazards.length; a++) {
      if (hazards[a].x == this.targetX && hazards[a].y == this.targetY) {
        moves = 0
        hazards.splice(0,hazards.length)
        this.respawn()
      }
    }
  }

}



var targetFrameRate = 60

var plr;
var win = false

var gridSize = 40;
var gridWith = 25;
var gridHeight = 15;

var keyBaseCooldown = 0.03
var keyCooldown = 0

var MODE = 1

var currentHazard = null;
var moves = 0
var level = 1

var hazards = []
var winBlocks = []
var obstructions = []



function setup() {
  canvas = createCanvas(gridWith*gridSize,gridHeight*gridSize);
  canvas.parent('processing');
  textFont("Verdana");
  textSize(40);
  noStroke();
  colorMode(RGB,255,255,255,1)
  frameRate(targetFrameRate)
  plr = new Plr(0,0)
  for (var a=0;a < 100;a++) {
    obstruction = new Obstruction(randomXPos(),randomYPos())
    obstructions.push(obstruction)
  }
  for (var a=0;a < 1;a++) {
    winBlock = new WinBlock(randomXPos(),randomYPos());
    winBlocks.push(winBlock)
  }
}

function draw() {
  if (win) {
    winScreen()
  }
  else {
    gameLoop()
  }
}

function gameLoop() {
  keyCooldown -= 1/targetFrameRate

  background(180,190,200)

  if (MODE == 1) {
    tekenLoop()
  }
  if (MODE == 2) {
    playerLoop()
  }


  for (var a=0;a < hazards.length;a++) {
    hazards[a].teken()
  }
  for (var a=0;a < obstructions.length;a++) {
    obstructions[a].teken()
  }
  for (var a=0;a < winBlocks.length;a++) {
    winBlocks[a].teken()
  }
  plr.teken()

  push();
  if (moves > 0) {
    fill(0,0,0)
  }
  else {
    fill(255,0,0)
  }
  textSize(75)
  text(moves,width-String(moves).length*50-5,65)
  pop();
}



function playerLoop() {
  if (moves == 0) {
    plr.anchored = true
  }
  else {
    plr.anchored = false
  }
  plr.transparency = 0
  plr.beweeg()
}

function tekenLoop() {
  plr.anchored = true
  plr.transparency = 0.5
  if (!currentHazard) {
    currentHazard = new Hazard()
  }
  currentHazard.transparency = 0.5
  currentHazard.x = mouseX - currentHazard.width/2
  currentHazard.y = mouseY - currentHazard.width/2
  currentHazard.teken()
  if (mouseIsPressed === true && mouseButton === LEFT && currentHazard.validPosition()) {
    moves += 1
    currentHazard.transparency = 0
    hazards.push(currentHazard)
    currentHazard = null
  }
}

function snapToGrid(value) {
  snappedValue = round(value/gridSize)*gridSize;
  return snappedValue
}

function keyPressed() {
  if (key == '1') {
    MODE = 1
  }
  if (key == '2') {
    MODE = 2
  }
  if (keyCooldown > 0 || plr.anchored) {
    return
  }
  keyCooldown = keyBaseCooldown
  if (key === 'w' || keyCode == '38') {
    plr.targetY += -gridSize
  }
  if (key === 'a' || keyCode == '37') {
    plr.targetX += -gridSize
  }
  if (key === 's' || keyCode == '40') {
    plr.targetY += gridSize
  }
  if (key === 'd' || keyCode == '39') {
    plr.targetX += gridSize
  }
}

function randomXPos() {
  return gridSize*(floor(random(0,gridWith-1)))
}

function randomYPos() {
  return gridSize*floor((random(0,gridHeight-1)))
}

function winScreen() {
  win = true
  background(0,175,50);
  push();
  textSize(175)
  text("You Win!",100,height/2+58);
  pop();
}