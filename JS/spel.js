class Tile {
  constructor(x,y,transparency) {
    this.layer = 1
    this.x = x
    this.y = y
    this.width = gridSize
    if (!transparency) {
      transparency = 0
    }
    this.transparency = transparency
    this.hidden = false
  }

  teken() {
    this.x = snapToGrid(this.x)
    this.y = snapToGrid(this.y)

    if (this.hidden) {
      return
    }
    push();
    noStroke();
    fill(180,190,200)
    stroke(160,170,180,1-this.transparency)
    strokeWeight(2)
    rect(this.x+1,this.y+1,this.width-2);
    pop();
  }

  validPosition() {

    for (var a=0; a < tiles.length;a++) {
      if (this.x == tiles[a].x && this.y == tiles[a].y) {
        return false
      }
    }

    for (var a=0; a < spawns.length;a++) {
      if (this.x == spawns[a].x && this.y == spawns[a].y) {
        return false
      }
    }

    return true
  }

  getArray() {
    return tiles
  }

}

class Spawn extends Tile {
  constructor(x,y) {
    super(x,y)
    this.layer = 1
  }

  getArray() {
    return spawns
  }

  teken() {
    this.x = snapToGrid(this.x)
    this.y = snapToGrid(this.y)

    if (this.hidden) {
      return
    }
    push();
    noStroke();
    fill(125,125,125)
    stroke(0,0,0,1-this.transparency)
    strokeWeight(2)
    rect(this.x+1,this.y+1,this.width-2);
    pop();
  }
}

class Obstruction {
  constructor(x,y,transparency) {
    this.layer = 2
    this.x = x
    this.y = y
    this.width = gridSize
    if (!transparency) {
      transparency = 0
    }
    this.transparency = transparency
    this.hidden = false
  }

  teken() {
    this.x = snapToGrid(this.x)
    this.y = snapToGrid(this.y)

    if (this.hidden) {
      return
    }
    push();
    noStroke();
    fill(100,100,100,1-this.transparency)
    rect(this.x,this.y,this.width);
    pop();
  }

  validPosition() {

    for (var a=0; a < bombs.length;a++) {
      if (this.x == bombs[a].x && this.y == bombs[a].y) {
        return false
      }
    }

    for (var a=0; a < fuses.length;a++) {
      if (this.x == fuses[a].x && this.y == fuses[a].y) {
        return false
      }
    }

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

    return true
  }

  getArray() {
    return obstructions
  }

}

class Hazard extends Obstruction {
  constructor(x,y,act) {
    super(x,y)
    this.layer = 2
    if (!act) {
      act = false
    }
    this.active = act
  }

  switch() {
    if (this.active) {
      this.active = false
    }
    else {
      this.active = true
    }
  }

  teken() {
    this.x = snapToGrid(this.x)
    this.y = snapToGrid(this.y)

    if (this.hidden) {
      return
    }
    push();
    noStroke();
    let aantalKringen = 5
    let offset = frameCount*aantalKringen/1.25/targetFrameRate
    for (var a=0;a<aantalKringen;a++) {
      if (this.active) {
        fill(255-((a+offset)%aantalKringen)*100/aantalKringen,0,0,1-this.transparency)
      }
      else {
        fill(100-((a+offset)%aantalKringen)*100/aantalKringen,0,0,1-this.transparency)
      }
      rect(this.x+a*gridSize/2/aantalKringen,this.y+a*gridSize/2/aantalKringen,this.width-(a*gridSize/aantalKringen))
    }
    pop();
  }

  getArray() {
    return hazards
  }

}

class Fuse extends Obstruction {
  constructor(x,y) {
    super(x,y)

    this.layer = 2
    this.R;
    this.G;
    this.B;
    this.origin;
    if (fuses.length > 0) {
      this.origin = fuses[0].origin
    }
  }

  validPosition() {
    for (var a=0; a < fuses.length;a++) {
      if (this.x == fuses[a].x && this.y == fuses[a].y) {
        return false
      }
    }

    for (var a=0; a < bombs.length;a++) {
      if (this.x == bombs[a].x && this.y == bombs[a].y) {
        return false
      }
    }

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

    if (this.x == plr.targetX && this.y == plr.targetY) {
        return false
    }

    if (bombs.length == 0) {
      return false
    }

    if (fuses.length == 0) {
      for (var a=0;a < bombs.length;a++) {
        if ((abs(this.x-bombs[a].x) + abs(this.y-bombs[a].y)) == 40) {
          this.origin = bombs[a]
          return true
        }
      }
    }
    else {
      if ((abs(this.x-fuses[fuses.length-1].x) + abs(this.y-fuses[fuses.length-1].y)) == 40) {
        return true
      }
    }

    return false
  }

  getArray() {
    return fuses
  }

  teken() {
    let originAlive = false
    for (let bomb of bombs) {
      if (bombs.indexOf(bomb) == bombs.indexOf(this.origin)) {
        originAlive = true
      }
    }
    if (originAlive == false) {
      fuses.splice(0,fuses.length)
    }
    this.x = snapToGrid(this.x)
    this.y = snapToGrid(this.y)

    let R = 225
    let G = 150
    let B = 75

    push();
    noStroke();
    if (!(fuses.indexOf(this) == -1)) {
      const progress = (fuses.indexOf(this) + 1) / fuses.length
      const factor = 0.8 + progress * 0.2
      this.R = factor * R
      this.G = factor * G
      this.B = factor * B
      fill(this.R,this.G,this.B,1 - this.transparency)
    }
    else {
      fill(R,G,B,1-this.transparency)
    }

    const fuseIndex = fuses.indexOf(this)

    let previousFuse = null
    let nextFuse = null

    if (fuseIndex === -1) {

      previousFuse = null

    } else {

      if (fuseIndex === 0) {
        previousFuse = this.origin
      } else {
        previousFuse = fuses[fuseIndex - 1]
      }

      if (fuseIndex + 1 < fuses.length) {
        nextFuse = fuses[fuseIndex + 1]
      }

    }
    const fuseWidth = 16
    const fuseOffset = (gridSize - fuseWidth) / 2
    rect(this.x + fuseOffset, this.y + fuseOffset, fuseWidth, fuseWidth)

    for (const neighbor of [previousFuse, nextFuse]) {
      if (!neighbor) continue

      const dx = neighbor.x - this.x
      const dy = neighbor.y - this.y

      if (dx === gridSize) {
        rect(this.x + gridSize / 2, this.y + fuseOffset, gridSize / 2, fuseWidth)
      } else if (dx === -gridSize) {
        rect(this.x, this.y + fuseOffset, gridSize / 2, fuseWidth)
      } else if (dy === gridSize) {
        rect(this.x + fuseOffset, this.y + gridSize / 2, fuseWidth, gridSize / 2)
      } else if (dy === -gridSize) {
        rect(this.x + fuseOffset, this.y, fuseWidth, gridSize / 2)
      }
    }

    if (MODE == 2) {
      if ((fuses.indexOf(this)) == fuses.length-1) {
        fill(255,150,0)
        rect(this.x + 15/2, this.y + 15/2, this.width-15)
        fill(255,255,100)
        rect(this.x + 25/2, this.y + 25/2, this.width-25)
      }
    }
    pop();
  }

}

class Bomb extends Obstruction {
  constructor(x,y) {
    super(x,y)
    this.layer = 2
  }

  teken() {
    this.x = snapToGrid(this.x)
    this.y = snapToGrid(this.y)

    let fuse = fuses[0]

    push();
    noStroke();
    if (fuse && fuse.origin == this) {
      fill(150,150,150,1-this.transparency);
      if (this.x-fuse.x == 40) {
        // left
        rect(this.x,this.y+10,3,20)
      }
      else if (this.x-fuse.x == -40) {
        // right
        rect(this.x+this.width-3,this.y+10,3,20)
      }
      else if (this.y-fuse.y == 40) {
        // top
        rect(this.x+10,this.y,20,3)
      }
      else if (this.y-fuse.y == -40) {
        // bottom
        rect(this.x+10,this.y+this.width-3,20,3)
      }
    }
    fill(25,25,25,1-this.transparency);
    rect(this.x+3,this.y+3,this.width-6);
    let offset = 15
    fill(50,50,50,1-this.transparency);
    rect(this.x+gridSize-this.width+offset-3,this.y+3,this.width-offset);
    // offset = 30
    // fill(150,150,150,1-this.transparency);
    // rect(this.x+gridSize-this.width+offset-3,this.y+3,this.width-offset);
    offset = 35
    fill(250,250,250,1-this.transparency);
    rect(this.x+gridSize-this.width+offset-6,this.y+6,this.width-offset);
    pop();
  }

  getArray() {
    return bombs
  }
}

class WinBlock extends Obstruction {
  constructor(x,y) {
    super(x,y)
    this.layer = 2
  }

  teken() {
    this.x = snapToGrid(this.x)
    this.y = snapToGrid(this.y)

    if (this.hidden) {
      return
    }
    push();
    noStroke();
    let aantalKringen = 5
    let offset = frameCount*aantalKringen/1.25/targetFrameRate
    for (var a=0;a<aantalKringen;a++) {
      fill(0,255-((a+offset)%aantalKringen)*100/aantalKringen,0,1-this.transparency)
      rect(this.x+a*gridSize/2/aantalKringen,this.y+a*gridSize/2/aantalKringen,this.width-(a*gridSize/aantalKringen))
    }
    pop();
  }

  getArray() {
    return winBlocks
  }
}

class Plr {
  constructor(x,y) {
    this.layer = 2
    this.targetX = x
    this.targetY = y
    this.previousX = null
    this.previousY = null
    this.x = x
    this.y = y
    this.width = gridSize
    this.spawnX = 0
    this.spawnY = 0
    this.anchored = false
    this.transparency = 0
    this.hidden = false
  }

  respawn() {
    fuses.splice(0,fuses.length)
    this.targetX = this.spawnX
    this.targetY = this.spawnY
    this.previousX = this.targetX
    this.previousY = this.targetY
  }

  teken() {
    if (this.hidden) {
      return
    }
    fill(0,0,0,1-this.transparency)
    rect(this.x,this.y,this.width);
    fill(255,255,255,1-this.transparency*0.5)
    rect(this.x + this.width-this.width*0.9,this.y + this.width-this.width*0.9,this.width*0.8);
  }

  beweeg() {
    this.targetX = constrain(this.targetX,0,width-gridSize);
    this.targetY = constrain(this.targetY,0,height-gridSize);
    this.targetY = snapToGrid(this.targetY);
    this.targetX = snapToGrid(this.targetX);
    this.collisionCheck()

    if (this.previousX !== null && this.previousY !== null && ((this.previousX !== this.targetX) || (this.previousY !== this.targetY))) {
      for (let hazard of hazards) {
        hazard.switch()
      }
      fuses.splice(fuses.length-1,1)
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
        plr.respawn()
        return
      }
    }

    for (var a = 0; a < obstructions.length; a++) {
      if (obstructions[a].x == this.targetX && obstructions[a].y == this.targetY) {
        this.targetX = this.previousX
        this.targetY = this.previousY
        return
      }
    }

    for (var a = 0; a < fuses.length; a++) {
      if (fuses[a].x == this.targetX && fuses[a].y == this.targetY) {
        this.targetX = this.previousX
        this.targetY = this.previousY
        return
      }
    }

    for (var a = 0; a < bombs.length; a++) {
      if (bombs[a].x == this.targetX && bombs[a].y == this.targetY) {
        this.targetX = this.previousX
        this.targetY = this.previousY
        return
      }
    }

  }

  hazardCheck() {
    for (var a = 0; a < hazards.length; a++) {
      if (hazards[a].active && hazards[a].x == this.targetX && hazards[a].y == this.targetY) {
        this.respawn()
      }
    }
  }

}


const targetFrameRate = 60

var plr;
var win = false

const gridSize = 40;
const gridWith = 25;
const gridHeight = 15;

var keyBaseCooldown = 0.03
var keyCooldown = 0

var MODE = 1

var selectedObject = null;
var currentObject = null;
var moves = 0
var level = 1

var hazards = []
var winBlocks = []
var obstructions = []
var fuses = []
var bombs = []
var tiles = []
var spawns = []
const objects = [Hazard,Obstruction,WinBlock,Bomb,Tile,Spawn]
const objectArrays = [bombs,hazards,winBlocks,obstructions,tiles,spawns]

var editorTabSize = 250

var debug = false

var levels = []

function preload() {
  var level1 = loadJSON('./JS/spelAssets/level1.json')
  levels.push(level1)
}

function setup() {
  canvas = createCanvas(gridWith*gridSize,gridHeight*gridSize+editorTabSize);
  canvas.parent('processing');
  textFont("Verdana");
  textSize(40);
  noStroke();
  colorMode(RGB,255,255,255,1)
  frameRate(targetFrameRate)
  plr = new Plr(0,0)
  for (var a=0;a<gridWith;a++) {
    for (var b=0;b<gridHeight;b++) {
      const tile = new Tile(a*gridSize,b*gridSize)
      tiles.push(tile)
    }
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

function drawAll() {
  for (var a=0;a < tiles.length;a++) {
    tiles[a].teken()
  }
  for (var a=0;a < spawns.length;a++) {
    spawns[a].teken()
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
  for (var a=0;a < fuses.length;a++) {
    fuses[a].teken()
  }
  for (var a=0;a < bombs.length;a++) {
    bombs[a].teken()
  }
}

function gameLoop() {
  moves = fuses.length
  keyCooldown -= 1/targetFrameRate

  background(245,250,255)

  if (MODE == 1) {
    tekenLoop()
  }
  if (MODE == 2) {
    playerLoop()
  }
  if (MODE == 3) {
    buildLoop()
  }
  if (MODE == 4) {
    deleteLoop()
  }

  if (MODE !== 3) {
    drawAll()
  }

  drawHoveredObjectHighlight()

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
  plr.hidden = false
  if (moves == 0) {
    plr.anchored = true
  }
  else {
    plr.anchored = false
  }
  plr.beweeg()
}

var fuseSelected = false
function tekenLoop() {
  plr.hidden = false
  plr.anchored = true

  const cellX = snapToGrid(mouseX)
  const cellY = snapToGrid(mouseY)
  if (outOfBounds(cellX,cellY)) {
    return
  }

  let fuse
  if (!fuse) {
    fuse = new Fuse()
  }
  fuse.x = cellX
  fuse.y = cellY
  if (fuse.validPosition() && fuses.length == 0) {
    fuse.transparency = 0.5
  }
  else {
    fuse.transparency = 1
  }
  fuse.teken()

  if (!(mouseIsPressed === true && mouseButton === LEFT)) {
    fuseSelected = false
  }

  if (mouseIsPressed === true && mouseButton === LEFT) {
    if (fuse.validPosition()) {
      fuse.transparency = 0
      fuse.getArray().push(fuse)
      fuse = null
    }
    else if (fuses.length > 0) {
      if (fuses[fuses.length-1].x == cellX && fuses[fuses.length-1].y == cellY) {
        fuseSelected = true
      }
      if (!fuseSelected == true || (fuses.length > 1 && fuses[fuses.length-2].x == cellX && fuses[fuses.length-2].y == cellY)) {
        for (var a=0;a<fuses.length-1;a++) {
          let fuse = fuses[a]
          if (fuse.x == cellX && fuse.y == cellY) {
            fuses.splice(a+1,fuses.length-1-a)
          }
        }
      }
    }
    if ((!fuseSelected && fuses.length > 0 && fuses[0].origin.x == cellX && fuses[0].origin.y == cellY) || 
    (fuseSelected && fuses.length == 1 && fuses[0].origin.x == cellX && fuses[0].origin.y == cellY)) {
      fuses.splice(0,fuses.length)
    }
  }
}

function buildLoop() {
  plr.anchored = true
  plr.hidden = true

  const cellX = snapToGrid(mouseX)
  const cellY = snapToGrid(mouseY)

  if (!selectedObject) {
    selectedObject = Hazard
  }
  if (!currentObject || currentObject.constructor.name !== selectedObject.name) {
    currentObject = new selectedObject
  }

  if (outOfBounds(cellX,cellY)) {
    currentObject.hidden = true
    drawAll()
    return
  }

  currentObject.x = cellX
  currentObject.y = cellY
  if (currentObject.validPosition()) {
    currentObject.hidden = false
  }
  else {
    currentObject.hidden = true
  }

  if (mouseIsPressed === true && mouseButton === LEFT && currentObject.validPosition()) {
    currentObject.hidden = false
    currentObject.getArray().push(currentObject)
    currentObject = null
  }

  if (currentObject) {
    currentObject.getArray().push(currentObject)
  }
  drawAll()
  if (currentObject) {
    currentObject.getArray().splice(currentObject.getArray().indexOf(currentObject),1)
  }
}

function deleteLoop() {
  plr.anchored = true
  plr.hidden = true

  if (!mouseIsPressed || mouseButton !== LEFT) {
    return
  }

  if (outOfBounds(mouseX,mouseY)) {
    return
  }

  const cellX = snapToGrid(mouseX)
  const cellY = snapToGrid(mouseY)

  for (const objectArray of objectArrays) {
    for (let a = 0; a < objectArray.length; a++) {
      const object = objectArray[a]

      if (object.x === cellX && object.y === cellY) {
        objectArray.splice(a, 1)
        return
      }
    }
  }
}

function drawHoveredObjectHighlight() {

  const cellX = snapToGrid(mouseX)
  const cellY = snapToGrid(mouseY)
  if (outOfBounds(cellX,cellY)) {
    return
  }

  if (MODE == 4) {

    for (const objectArray of objectArrays) {
      for (const object of objectArray) {
        if (object.x == cellX && object.y == cellY) {
          push()
          noFill()
          stroke(255, 255, 0)
          strokeWeight(3)
          rect(object.x + 1.5, object.y + 1.5, gridSize - 3, gridSize - 3)
          pop()
        }
      }
    }
  }

  if (MODE == 3) {
    if (!currentObject) {
      return
    }

    if (currentObject.x === cellX && currentObject.y === cellY && currentObject.validPosition()) {
      push()
      noFill()
      stroke(0, 150, 255)
      strokeWeight(3)
      rect(currentObject.x + 1.5, currentObject.y + 1.5, gridSize - 3, gridSize - 3)
      pop()
      return
    }
  }

  // if (MODE == 1) {
  //   if (fuses.length == 0) {
  //     return
  //   }
  //   if (mouseIsPressed) {
  //     return
  //   }
  //   let fuse = fuses[fuses.length-1]

  //   if (fuse.x === cellX && fuse.y === cellY) {
  //     push()
  //     noFill()
  //     stroke(255, 255, 255)
  //     strokeWeight(5)
  //     rect(fuse.x + 5/2, fuse.y + 5/2, gridSize - 5, gridSize - 5)
  //     pop()
  //     return
  //   }
  // }

}

function printLevel() {
  let levelArray = []
  for (let objectArray of objectArrays) {
    for (let object of objectArray) {
      let obj = {
        class: object.constructor.name,
        x: object.x,
        y: object.y,
        transparency: object.transparency
      }
      levelArray.push(obj)
    }
  }
  print(levelArray)
}

function loadLevel(lvl) {
  plr.respawn()
  for (let objectArray of objectArrays) {
    objectArray.splice(0,objectArray.length)
  }

  json = levels[lvl-1]
  for (var a=0;a < Object.keys(json).length; a++) {
    let data = json[a];
    let constructor = data.class

    const classes = {
      'Tile': Tile,
      'Hazard': Hazard,
      'Obstruction': Obstruction,
      'WinBlock': WinBlock,
      'Bomb': Bomb,
    };

    object = new classes[constructor](data.x,data.y,data.transparency);

    object.getArray().push(object)
  }
}

function snapToGrid(value) {
  snappedValue = floor(value / gridSize) * gridSize
  return snappedValue
}

function outOfBounds(x,y) {
  if (x >= (gridSize*gridWith) || x <= -gridSize || y >= (gridSize*gridHeight) || y <= -gridSize) {
    return true
  }
  else {
    return false
  }
}








function keyPressed(event) {
  if (event.code == 'ShiftLeft' && MODE == 3) {
    selectedObject = objects[objects.indexOf(selectedObject)+1]
  }
  if (key == 'F6') {
    printLevel()
  }
  if (key == 'F9') {
    loadLevel(1)
  }
  if (key == 'q') {
    MODE = 1
  }
  if (key == 'Enter') {
    MODE = 2
  }
  if (key == 'z') {
    MODE = 3
  }
  if (key == 'b') {
    MODE = 4
  }
  if (key == 'r') {
    plr.respawn()
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