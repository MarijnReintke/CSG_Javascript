class Block {
  constructor(x,y,transparency) {
    this.x = x
    this.y = y
    this.width = gridSize
    this.height = gridSize
    if (!transparency) {
      transparency = 0
    }
    this.transparency = transparency
    this.hidden = false
    this.canCollide = true
  }
}

class Tile extends Block {
  constructor(x,y,transparency) {
    super(x, y)
    this.layer = 0
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

  getArray() {
    return tiles
  }

}

class Spawn extends Block {
  constructor(x,y,transparency) {
    super(x,y,transparency)
    this.layer = 0
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

class Obstruction extends Block {
  constructor(x,y,transparency) {
    super(x,y,transparency)
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
    fill(100,100,100,1-this.transparency)
    rect(this.x,this.y,this.width);
    pop();
  }

  getArray() {
    return obstructions
  }

}

class Hazard extends Block {
  constructor(x,y,transparency,act) {
    super(x,y,transparency)
    if (!act) {
      act = false
    }
    this.layer = 2
    this.active = act
    this.interval = 3
    this.tickCount = 0
    this.canCollide = false
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
    let offset = round(frameCount*3/targetFrameRate)
    for (var a=0;a<aantalKringen;a++) {
      if (this.active) {
        fill(( (a+offset) % 2)*255,0,0,1-this.transparency)
      }
      else {
        fill(( (this.tickCount) % (this.interval))*255/this.interval,0,0,1-this.transparency)
      }
      rect(this.x+a*gridSize/2/aantalKringen,this.y+a*gridSize/2/aantalKringen,this.width-(a*gridSize/aantalKringen))
    }
    pop();
  }

  tick() {
    if (this.active) {
      return this.switch()
    }
    this.tickCount++
    if (this.tickCount >= this.interval) {
      this.switch()
      this.tickCount = 0
    }
  }

  getArray() {
    return hazards
  }

}

class Fuse extends Block {
  constructor(x,y,transparency) {
    super(x,y,transparency)

    this.layer = 1
    this.electrified = false
    this.origin;
    this.canCollide = false
    if (fuses.length > 0) {
      this.origin = fuses[0].origin
    }
  }

  validPosition() {
    const collidableObjects = [fuses,fuseAttachments,obstructions,doors,hazards]

    for (let array of collidableObjects) {
      for (let obj of array) {
        if (objectOverlapsCell(obj,this.x,this.y)) {
          return false
        }
      }
    }

    if (fuseAttachments.length == 0) {
      return false
    }

    if (fuses.length == 0) {
      for (var a=0;a < fuseAttachments.length;a++) {
        if ((abs(this.x-fuseAttachments[a].x) + abs(this.y-fuseAttachments[a].y)) == 40) {
          this.origin = fuseAttachments[a]
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
    if (!fuseAttachments.includes(this.origin)) {
      fuses.splice(0, fuses.length)
      return
    }

    this.x = snapToGrid(this.x)
    this.y = snapToGrid(this.y)

    const fuseIndex = fuses.indexOf(this)

    let previousFuse = null
    let nextFuse = null

    if (fuseIndex === 0) {
      previousFuse = this.origin
    } else {
      previousFuse = fuses[fuseIndex - 1]
    }

    if (fuseIndex + 1 < fuses.length) {
      nextFuse = fuses[fuseIndex + 1]
    }

    let prevDx = 0
    let prevDy = 0
    if (previousFuse) {
      prevDx = previousFuse.x - this.x
      prevDy = previousFuse.y - this.y
    }

    let nextDx = 0
    let nextDy = 0
    if (nextFuse) {
      nextDx = nextFuse.x - this.x
      nextDy = nextFuse.y - this.y
    }

    let shape

    if (previousFuse && nextFuse) {
      if (prevDx == -gridSize && nextDx == gridSize ||
          prevDx == gridSize && nextDx == -gridSize) {
        shape = "horizontal"
      } else if (
          prevDy == -gridSize && nextDy == gridSize ||
          prevDy == gridSize && nextDy == -gridSize
      ) {
        shape = "vertical"
      } else if (
          (prevDx == -gridSize && nextDy == -gridSize) ||
          (prevDy == -gridSize && nextDx == -gridSize)
      ) {
        shape = "bottom-right"
      } else if (
          (prevDx == gridSize && nextDy == -gridSize) ||
          (prevDy == -gridSize && nextDx == gridSize)
      ) {
        shape = "bottom-left"
      } else if (
          (prevDx == -gridSize && nextDy == gridSize) ||
          (prevDy == gridSize && nextDx == -gridSize)
      ) {
        shape = "top-right"
      } else if (
          (prevDx == gridSize && nextDy == gridSize) ||
          (prevDy == gridSize && nextDx == gridSize)
      ) {
        shape = "top-left"
      }
    } else if (previousFuse) {
      if (prevDx == gridSize) {
        shape = "left-end"
      } else if (prevDx == -gridSize) {
        shape = "right-end"
      } else if (prevDy == gridSize) {
        shape = "top-end"
      } else if (prevDy == -gridSize) {
        shape = "bottom-end"
      }
    }

    if (this.electrified) {
      shape = shape + "-charged"
    }

    image(wireSprites[shape],this.x,this.y,gridSize,gridSize)

    if (this.electrified) {

      if (elecs.length > 0) {
        for (let elec of elecs) {
          if (elec.parent == this) {
            elec.teken()
            return
          }
        }
      }
    
    let elec = new Electricity(this)
    elecs.push(elec)
    elec.teken()
    }
  }

}

class FuseAttachment extends Block {
  constructor(x,y) {
    super(x,y)
    this.layer = 2
    this.canCollide = false
    this.electrified = false
    this.orientation = 'top'
  }

  teken() {
    this.x = snapToGrid(this.x)
    this.y = snapToGrid(this.y)

    if (MODE !== 2) {
      this.electrified = false
    }

    let previousFuse = true
    let nextFuse = null

    let prevDx = 0
    let prevDy = 0

    if (this.orientation == 'right') {
      prevDx = -gridSize
    } else if (this.orientation == 'left') {
      prevDx = gridSize
    } else if (this.orientation == 'bottom') {
      prevDy = gridSize
    } else if (this.orientation == 'top') {
      prevDy = -gridSize
    }

    if (fuses.length > 0 && fuseAttachments.indexOf(this) == 0) {
      nextFuse = fuses[0]
    }

    let nextDx = 0
    let nextDy = 0
    if (nextFuse) {
      nextDx = nextFuse.x - this.x
      nextDy = nextFuse.y - this.y
    }

    let shape

    if (previousFuse && nextFuse) {
      if (prevDx == -gridSize && nextDx == gridSize ||
          prevDx == gridSize && nextDx == -gridSize) {
        shape = "horizontal"
      } else if (
          prevDy == -gridSize && nextDy == gridSize ||
          prevDy == gridSize && nextDy == -gridSize
      ) {
        shape = "vertical"
      } else if (
          (prevDx == -gridSize && nextDy == -gridSize) ||
          (prevDy == -gridSize && nextDx == -gridSize)
      ) {
        shape = "bottom-right"
      } else if (
          (prevDx == gridSize && nextDy == -gridSize) ||
          (prevDy == -gridSize && nextDx == gridSize)
      ) {
        shape = "bottom-left"
      } else if (
          (prevDx == -gridSize && nextDy == gridSize) ||
          (prevDy == gridSize && nextDx == -gridSize)
      ) {
        shape = "top-right"
      } else if (
          (prevDx == gridSize && nextDy == gridSize) ||
          (prevDy == gridSize && nextDx == gridSize)
      ) {
        shape = "top-left"
      }
    } else if (previousFuse) {
      if (prevDx == gridSize) {
        shape = "left-end"
      } else if (prevDx == -gridSize) {
        shape = "right-end"
      } else if (prevDy == gridSize) {
        shape = "top-end"
      } else if (prevDy == -gridSize) {
        shape = "bottom-end"
      }
    }

    if (this.electrified) {
      shape = shape + "-charged"
    }

    image(wireSprites[shape],this.x,this.y,gridSize,gridSize)

    if (this.electrified) {

      if (elecs.length > 0) {
        for (let elec of elecs) {
          if (elec.parent == this) {
            elec.teken()
            return
          }
        }
      }
    
    let elec = new Electricity(this)
    elecs.push(elec)
    elec.teken()
    }
  }

  getArray() {
    return fuseAttachments
  }
}

class Bomb extends Block {
  constructor(x,y,transparency) {
    super(x,y,transparency)
    this.layer = 2
    this.spriteIndex = 0
  }

  teken() {
    this.x = snapToGrid(this.x)
    this.y = snapToGrid(this.y)

    if (this.hidden) {
      return
    }

    image(dynamiteSprites[this.spriteIndex], this.x, this.y, this.width, this.width)
  }

  getArray() {
    return bombs
  }
}

class WinBlock extends Block {
  constructor(x,y,transparency) {
    super(x,y,transparency)
    this.layer = 2
    this.canCollide = false
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

class Door extends Block {
  constructor() {
    super()
    this.layer = 2
    this.width = gridSize
    this.height = gridSize*3
    this.open = false
  }

  teken() {
    if (this.open) {
      this.canCollide = false
    }
    else {
      this.canCollide = true
    }
    push()
    fill(255,255,255)
    rect(this.x,this.y,this.width,this.height)
    pop()
  }

  getArray() {
    return doors
  }
}

class Plr {
  constructor(x,y) {
    this.layer = 2
    this.targetX = x
    this.targetY = y
    this.x = x
    this.y = y
    this.width = gridSize-8
    this.height = gridSize
    this.spawnX = 0
    this.spawnY = 0
    this.previousX = this.spawnX
    this.previousY = this.spawnY
    this.anchored = false
    this.transparency = 0
    this.hidden = false
  }

  respawn() {
    this.targetX = this.spawnX
    this.targetY = this.spawnY
    this.previousX = this.targetX
    this.previousY = this.targetY
    this.x = this.spawnX
    this.y = this.spawnY
  }

  teken() {
    if (this.hidden) {
      return
    }
    fill(0,0,0,1-this.transparency)
    rect(this.x+4,this.y+4,this.width);
    fill(255,255,255,1-this.transparency*0.5)
    rect(this.x+4 + this.width-this.width*0.9,this.y+4 + this.width-this.width*0.9,this.width*0.8);
  }

  beweeg() {
    this.targetX = constrain(this.targetX,0,gridSize*gridWith-gridSize);
    this.targetY = constrain(this.targetY,0,gridSize*gridHeight-gridSize);
    this.targetY = snapToGrid(this.targetY);
    this.targetX = snapToGrid(this.targetX);

    if ((this.previousX != this.targetX || this.previousY != this.targetY) && !this.collisionCheck()) {
      tick()
    }
    else {
      this.targetX = this.previousX
      this.targetY = this.previousY
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
        return true
      }
    }

    const allObjectArrays = [...objectArrays, fuses, [plr]];

    for (const objectArray of allObjectArrays) {
      for (const obj of objectArray) {
        if (obj.canCollide && obj.layer == this.layer && objectOverlapsCell(obj,this.targetX,this.targetY)) {
          return true
        }
      }
    }

    return false
  }

  hazardCheck() {
    for (var a = 0; a < hazards.length; a++) {
      if (hazards[a].active && hazards[a].x == this.targetX && hazards[a].y == this.targetY) {
        this.respawn()
      }
    }
    for (let orb of elecOrbs) {
      if (orb.targetX == this.targetX && orb.targetY == this.targetY) {
        this.respawn()
      }
    }
    for (let elec of elecs) {
      if (elec.x == this.targetX && elec.y == this.targetY) {
        this.respawn()
      }
    }
  }
}

class Flashbang {
  constructor() {
    this.x = 0
    this.y = 0
    this.transparency = 0
    this.tick = 0
    this.time = 2
  }

  teken() {
    if (flashbangs.length > 1) {
      flashbangs.splice(0,flashbangs.length-1)
    }

    let lastTick = this.time * targetFrameRate
    if (this.tick >= lastTick) {
      flashbangs.splice(flashbangs.indexOf(this), 1);
      return
    }

    let progress = this.tick / lastTick;

    this.transparency = Math.pow(progress, 2);

    push();
    fill(255, 255, 255, (1 - this.transparency));
    noStroke();
    rect(0, 0, width, height);
    pop();

    this.tick++;
  }

  getArray() {
    flashbangs
  }
}

class Countdown {
  constructor(number) {
    this.x = gridSize*gridWith/2
    this.y = gridHeight*gridSize/2+gridSize
    this.transparency = 0
    this.size = 600
    this.number = number
  }

  teken() {
    if (this.transparency >= 1) {
      countdowns.splice(countdowns.indexOf(this),1)
    }

    if (countdowns.length > 1) {
      countdowns.splice(0,countdowns.length-1)
    }

    push()
    textAlign(CENTER,CENTER)
    fill(255,255,255,1-this.transparency)
    textSize(this.size)
    text(this.number,this.x,this.y)
    pop()
    this.size += 5
    this.transparency += 0.04
  }

  getArray() {
    countdowns
  }
}

class SmokeParticle {
  constructor(x,y) {
    this.x = x + gridSize/2
    this.xOffset = floor(random(-60,60))
    this.y = y + gridSize
    this.rotation = floor(random(0,360))
    this.transparency = 0
    this.time = floor(random(1,3))
    this.tick = 0
    this.size = 40
    this.lastTick = this.time * targetFrameRate
  }

  teken() {

    let progress

    progress = this.tick/this.lastTick
    let transparency
    transparency = this.transparency + (1-this.transparency) * progress

    progress = this.tick/this.lastTick;
    progress = Math.sqrt(progress)
    progress = sin(progress*180)
    let size
    size = this.size * progress;

    progress = this.tick/this.lastTick
    let x
    x = this.x + this.xOffset * progress

    push();
    translate(x,this.y)
    rectMode(CENTER)
    rotate(this.rotation)
    fill(190, 190, 190, (1 - transparency));
    noStroke();
    rect(0,0,size);
    pop();

    this.tick++;
    this.y -= 2;
  }

  check() {
    if (this.tick >= this.lastTick) {
      smokeParticles.splice(smokeParticles.indexOf(this), 1);
    }
  }

  getArray() {
    smokeParticles
  }
}

class ElecOrb {
  constructor(x,y) {
    this.x = x
    this.y = y
    this.targetX = x
    this.targetY = y
    this.spriteIndex = 0
    this.layer = 2
    this.currentFuse
  }

  teken() {
    if (this.currentFuse) {
      this.targetX = this.currentFuse.x
      this.targetY = this.currentFuse.y
    }

    this.x += (this.targetX-this.x)/5;
    this.y += (this.targetY-this.y)/5;

    image(elecOrbSprites[this.spriteIndex],this.x,this.y,gridSize,gridSize)

    if (frameCount % 6 == 0) {
      if (this.spriteIndex == elecOrbSprites.length-1) {
        this.spriteIndex = 0
      } else {
        this.spriteIndex++
      }
    }
  }

  nextFuse() {
    if (!this.currentFuse) {
      fuseAttachments[0].electrified = true
      this.currentFuse = fuses[0]
      return
    }
    this.currentFuse.electrified = true
    this.currentFuse = fuses[fuses.indexOf(this.currentFuse)+1]
    if (fuses.indexOf(this.currentFuse) == fuses.length-1) {
      elecOrbs.splice(0,elecOrbs.length)
    }
  }

  getArray() {
    elecOrbs
  }
}

class Electricity {
  constructor(parent) {
    this.parent = parent
    this.x = parent.x
    this.y = parent.y
    this.tick = 0
    this.parent
  }

  teken() {
    if (elecs.length > 1) {
      this.tick = elecs[0].tick
    }

    fill(255,255,0)

    this.tick++
  }

  getArray() {
    elecs
  }
}

const targetFrameRate = 60

var plr;

const gridSize = 40;
const gridWith = 28;
const gridHeight = 16;

var keyBaseCooldown = 0.03
var keyCooldown = 0

var MODE = 1
var GAMEOVER = false

var bombConnected = false

var selectedObject = null;
var currentObject = null;
var moves = 0
var wireLimit = 20
var wireInterval = 2
var movesBeforeInterval = wireInterval
var level = 1
var currentLayer = 2
var maxLayer = 3
var shakeIntensity = 0
var fuseAttachmentOrientation = "bottom"

var hazards = []
var winBlocks = []
var obstructions = []
var fuses = []
var bombs = []
var tiles = []
var spawns = []
var fuseAttachments = []
var flashbangs = []
var countdowns = []
var doors = []
var smokeParticles = []
var elecOrbs = []
var elecs = []
const objects = [Tile, Obstruction, Hazard, WinBlock, Bomb, Spawn, FuseAttachment, Door]
const objectArrays = []

var editorTabSize = 260

var debug = false

var levels = []
var dynamiteSprites = []
var elecOrbSprites = []
var wireSprites

function preload() {
  let children
  
  children = 1
  for (var a=0;a<children;a++) {
    var json = loadJSON('JS/spelAssets/levels/' + a + '.json')
    levels.push(json)
  }

  children = 7
  for (var a=0;a<children;a++) {
    var png = loadImage('JS/spelAssets/sprites/dynamite/' + a + '.png')
    dynamiteSprites.push(png)
  }

  children = 3
  for (var a=0;a<children;a++) {
    var png = loadImage('JS/spelAssets/sprites/elecOrb/' + a + '.png')
    elecOrbSprites.push(png)
  }

  wireSprites = {
    "horizontal": loadImage('JS/spelAssets/sprites/wire/horizontal.png'),
    "vertical": loadImage('JS/spelAssets/sprites/wire/vertical.png'),
    "top-left": loadImage('JS/spelAssets/sprites/wire/top-left.png'),
    "top-right": loadImage('JS/spelAssets/sprites/wire/top-right.png'),
    "bottom-left": loadImage('JS/spelAssets/sprites/wire/bottom-left.png'),
    "bottom-right": loadImage('JS/spelAssets/sprites/wire/bottom-right.png'),
    "left-end": loadImage('JS/spelAssets/sprites/wire/left-end.png'),
    "right-end": loadImage('JS/spelAssets/sprites/wire/right-end.png'),
    "top-end": loadImage('JS/spelAssets/sprites/wire/top-end.png'),
    "bottom-end": loadImage('JS/spelAssets/sprites/wire/bottom-end.png'),
    "horizontal-charged": loadImage('JS/spelAssets/sprites/wire/horizontal-charged.png'),
    "vertical-charged": loadImage('JS/spelAssets/sprites/wire/vertical-charged.png'),
    "top-left-charged": loadImage('JS/spelAssets/sprites/wire/top-left-charged.png'),
    "top-right-charged": loadImage('JS/spelAssets/sprites/wire/top-right-charged.png'),
    "bottom-left-charged": loadImage('JS/spelAssets/sprites/wire/bottom-left-charged.png'),
    "bottom-right-charged": loadImage('JS/spelAssets/sprites/wire/bottom-right-charged.png'),
    "left-end-charged": loadImage('JS/spelAssets/sprites/wire/left-end-charged.png'),
    "right-end-charged": loadImage('JS/spelAssets/sprites/wire/right-end-charged.png'),
    "top-end-charged": loadImage('JS/spelAssets/sprites/wire/top-end-charged.png'),
    "bottom-end-charged": loadImage('JS/spelAssets/sprites/wire/bottom-end-charged.png'),
  }
}

function setup() {
  canvas = createCanvas(gridWith*gridSize,gridHeight*gridSize+editorTabSize);
  canvas.parent('processing');
  textFont("Verdana");
  textSize(40);
  noStroke();
  colorMode(RGB,255,255,255,1)
  frameRate(targetFrameRate)
  noSmooth();
  angleMode(DEGREES)

  for (let obj of objects) {
    obj = new obj()
  objectArrays.push(obj.getArray())
    obj = null
  }

  plr = new Plr(0,0)

  for (var a=0;a<gridWith;a++) {
    for (var b=0;b<gridHeight;b++) {
      const tile = new Tile(a*gridSize,b*gridSize)
      tiles.push(tile)
    }
  }
}

function draw() {
  gameLoop()
}

function drawAll() {
  push()
  let xOffset = floor(random(-shakeIntensity,shakeIntensity+1))
  let yOffset = floor(random(-shakeIntensity,shakeIntensity+1))
  translate(xOffset,yOffset)
  const allObjectArrays = [...objectArrays, fuses, elecOrbs];

  if ((MODE == 4 || MODE == 3) && keyIsDown(32)) {
    let layer
    if (MODE == 4) {
      layer = currentLayer
    }
    else {
      layer = currentObject.layer
    }
    for (const objectArray of allObjectArrays) {
      for (const obj of objectArray) {
        if (obj.layer == layer) {
          obj.teken()
        }
      }
    }
  }
  else {
    for (var a=0;a<maxLayer;a++) {
      let layer = a
      for (const objectArray of allObjectArrays) {
        for (const obj of objectArray) {
          if (obj.layer == layer) {
            obj.teken()
          }
        }
      }
    }
  }

  plr.teken()

  for (smokeParticle of smokeParticles) {
    smokeParticle.teken()
  }
  for (smokeParticle of smokeParticles) {
    smokeParticle.check()
  }

  pop()
}

function gameLoop() {
  keyCooldown -= 1/targetFrameRate
  if (shakeIntensity > 0) {
    shakeIntensity -= 0.15
  } else {
    shakeIntensity = 0
  }

  background(5,10,15)

  if (MODE == 1) {
    movesBeforeInterval = wireInterval
    tekenLoop()
  }
  if (MODE == 2) {
    playerLoop()
    drawAll()
  }
  if (MODE == 3) {
    buildLoop()
  }
  if (MODE == 4) {
    deleteLoop()
    drawAll()
  }

  drawHoveredObjectHighlight()

  push();

  if (MODE == 2) {
    if (moves > 0) {
    fill(255,255,255)
    }
    else {
      fill(255,0,0)
    }
    textSize(75)
    text(moves, 10, gridHeight*gridSize + 75);
    textSize(40)
    text("Moves Left", String(moves).length * 50 + 15, gridHeight*gridSize + 75);
  }

  if (MODE == 1) {
    if (wireLimit - fuses.length > 0) {
    fill(255,255,0)
    }
    else {
      fill(255,150,0)
    }
    textSize(75)
    text(wireLimit - fuses.length, 10, gridHeight*gridSize + 75);
    textSize(40)
    text("Wire Left", String(wireLimit - fuses.length).length * 50 + 15, gridHeight*gridSize + 75);
  }

  if (MODE == 1 || MODE == 2) {
    fill(255,255,100)
    textSize(40)
    text(movesBeforeInterval, 15, gridHeight*gridSize + 125);
    textSize(30)
    text("Moves Before Electricity Progresses", String(movesBeforeInterval).length * 30 + 20, gridHeight*gridSize + 125);
  }

  if (MODE == 3) {
    fill(100,150,255)
    textSize(75)
    text("Build", 10, gridHeight*gridSize + 75);
    textSize(40)
    text(selectedObject.name, 13, gridHeight*gridSize + 125);
    textSize(20)
    if (currentObject) {
      text("this.layer = " + currentObject.layer, 15, gridHeight*gridSize + 150);
    }
  }

  if (MODE == 4) {
    fill(255,100,125)
    textSize(75)
    text("Delete", 10, gridHeight*gridSize + 75);
    textSize(40)
    text("Layer " + currentLayer, 15, gridHeight*gridSize + 125);
  }
  pop();

  if (countdowns.length > 0) {
    countdowns[countdowns.length-1].teken()
  }

  if (flashbangs.length > 0) {
    flashbangs[flashbangs.length-1].teken()
  }
}



function playerLoop() {
  plr.hidden = false

  if (moves == 0) {
    plr.anchored = true
    if (explode()) {
      flashbang = new Flashbang()
      flashbangs.push(flashbang)
      shakeIntensity = 30
    }
  }
  else {
    plr.anchored = false
  }

  plr.beweeg()
}

var fuseSelected = false
var fuse;
function tekenLoop() {
  plr.hidden = false
  plr.anchored = true

  bombConnected = false
  for (let bomb of bombs) {
    if (fuses.length > 0 && fuses[fuses.length-1].x == bomb.x && fuses[fuses.length-1].y == bomb.y) {
      bombConnected = true
    }
  }

  const cellX = snapToGrid(mouseX)
  const cellY = snapToGrid(mouseY)
  if (outOfBounds(cellX,cellY)) {
    return drawAll()
  }

  if (!fuse) {
    fuse = new Fuse
  }

  fuse.x = cellX
  fuse.y = cellY

  if (!(mouseIsPressed === true && mouseButton === LEFT)) {
    fuseSelected = false
  }

  if (mouseIsPressed === true && mouseButton === LEFT) {
    if (fuse.validPosition() && (fuseSelected || fuses.length == 0) && fuses.length < wireLimit && !bombConnected) {
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

  drawAll()

  if (mouseIsPressed === true && mouseButton === LEFT) { 
    fill(255,255,255,0.25)
    ellipse(mouseX,mouseY,gridSize)
  }
  else if (fuses.length > 0 && fuses[fuses.length-1].x == cellX && fuses[fuses.length-1].y == cellY) {
    fill(255,255,255,0.25)
    ellipse(cellX+gridSize/2,cellY+gridSize/2,gridSize)
  }
  else if (fuses.length == 0 && fuse.validPosition()) {
    fill(255,255,255,0.25)
    ellipse(cellX+gridSize/2,cellY+gridSize/2,gridSize)
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

  if (selectedObject == FuseAttachment) {
    currentObject.orientation = fuseAttachmentOrientation
  }

  currentObject.x = cellX
  currentObject.y = cellY
  if (!validPosition(currentObject)) {
    return drawAll()
  }

  if (mouseIsPressed === true && mouseButton === LEFT) {
    if (currentObject.constructor.name !== "FuseAttachment") {
      currentObject.hidden = false
      currentObject.getArray().push(currentObject)
      currentObject = new selectedObject
    } else if (fuseAttachments.length == 0) {
      currentObject.hidden = false
      currentObject.getArray().push(currentObject)
      currentObject = new selectedObject
    }
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
    for (let a=0; a < objectArray.length; a++) {
      const object = objectArray[a]
      if (object.layer == currentLayer && objectOverlapsCell(object,cellX,cellY)) {
        objectArray.splice(a, 1)
        return
      }
    }
  }
}


function objectOverlapsCell(obj, cellX, cellY) {
  for (let a = 0; a < obj.height / gridSize; a++) {
    let objectY = obj.y + a*gridSize;

    for (let b = 0; b < obj.width / gridSize; b++) {
      let objectX = obj.x + b*gridSize;

      if (objectX == cellX && objectY == cellY) {
        return true;
      }
    }
  }

  return false;
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
        if (object.layer == currentLayer && objectOverlapsCell(object,cellX,cellY)) {
          push()
          noFill()
          stroke(255, 75, 100)
          strokeWeight(3)
          rect(object.x + 1.5, object.y + 1.5, object.width - 3, object.height - 3)
          pop()
        }
      }
    }
  }

  if (MODE == 3) {
    if (!currentObject) {
      return
    }

    if (currentObject.x === cellX && currentObject.y === cellY && validPosition(currentObject)) {
      push()
      noFill()
      stroke(0, 150, 255)
      strokeWeight(3)
      rect(currentObject.x + 1.5, currentObject.y + 1.5, currentObject.width - 3, currentObject.height - 3)
      pop()
      return
    }
  }

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
      'Spawn': Spawn,
      'FuseAttachment': FuseAttachment
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


function validPosition(obj) {
  if (outOfBounds(obj.x, obj.y)) {
    return false;
  }

  for (const objectArray of objectArrays) {
    for (const otherObj of objectArray) {

      if (otherObj.layer !== obj.layer) {
        continue
      }

      for (let a = 0; a < otherObj.height / gridSize; a++) {
        const otherY = otherObj.y + a * gridSize;

        for (let b = 0; b < otherObj.width / gridSize; b++) {
          const otherX = otherObj.x + b * gridSize;

          for (let c = 0; c < obj.height / gridSize; c++) {
            const objY = obj.y + c * gridSize;

            for (let d = 0; d < obj.width / gridSize; d++) {
              const objX = obj.x + d * gridSize;

              if (otherX === objX && otherY === objY) {
                return false;
              }
            }
          }
        }
      }
    }
  }

  return true;
}


function tick() {
  if (moves <= 0 || fuses.length == 0) {
    return
  }
  for (let hazard of hazards) {
     hazard.tick()
  }

  movesBeforeInterval--
  if (movesBeforeInterval == 0) {
    elecOrbs[0].nextFuse()
    movesBeforeInterval = wireInterval
  }

  moves--

  if (moves > 0 && moves <= 5) {
    let countdown = new Countdown(moves)
    countdowns.push(countdown)
  }
}

let explosionTick = 0
function explode() {
  if (bombs[0].spriteIndex == dynamiteSprites.length-1) {
    if (explosionTick % 6 == 0) {
    let particle = new SmokeParticle(bombs[0].x,bombs[0].y)
    smokeParticles.push(particle)
    }
    explosionTick++
    return false
  }

  if (explosionTick % 3 == 0) {
    if (bombs[0].spriteIndex == dynamiteSprites.length-2) {
      bombs[0].spriteIndex++
      explosionTick = 0
      return true
    }
    bombs[0].spriteIndex++
  }
  explosionTick++
  return false
}

function gameOver() {

}

function SetMode(mode) {
  shakeIntensity = 0
  flashbangs.splice(0,flashbangs.length)
  countdowns.splice(0,countdowns.length)
  smokeParticles.splice(0,smokeParticles.length)
  elecOrbs.splice(0,elecOrbs.length)
  for (let fuse of fuses) {
    fuse.electrified = false
  }
  for (let bomb of bombs) {
    bomb.spriteIndex = 0
  }
  if (mode == 1) {
    plr.respawn()
  }
  if (mode == 2) {
    let elecOrb = new ElecOrb(fuseAttachments[0].x,fuseAttachments[0].y)
    elecOrbs.push(elecOrb)
    explosionTick = 0
    movesBeforeInterval = wireInterval
    moves = fuses.length*wireInterval
  }
  if (mode == 3) {

  }
  if (mode == 4) {

  }
  MODE = mode
}

function rotateFuseAttachment() {
    if (fuseAttachmentOrientation == "top") {
      fuseAttachmentOrientation = "right"
    } else if (fuseAttachmentOrientation == "right") {
      fuseAttachmentOrientation = "bottom"
    } else if (fuseAttachmentOrientation == "bottom") {
      fuseAttachmentOrientation = "left"
    } else if (fuseAttachmentOrientation == "left") {
      fuseAttachmentOrientation = "top"
    }
}

function keyPressed(event) {

  // note to self: this prevents the page from scrolling down when spacebar is pressed
  if (key === ' ') {
    event.preventDefault();
  }

  if (event.code == 'ShiftLeft' && MODE == 3) {
    selectedObject = objects[objects.indexOf(selectedObject)+1]
    if (!selectedObject) {
      selectedObject = objects[0]
    }
  }
  if (key == 'F6') {
    printLevel()
  }
  if (key == 'F9') {
    loadLevel(1)
  }

  if (key == 'q' && MODE !== 1) {
    SetMode(1)
  }
  if (key == 'Enter' && bombConnected && MODE !== 2) {
    SetMode(2)
  }
  if (key == 'z' && MODE !== 3) {
    SetMode(3)
  }
  if (key == 'b' && MODE !== 4) {
    SetMode(4)
  }

  if ((key == 'w' || keyCode == '38') && MODE == 4) {
    currentLayer += 1
    currentLayer = constrain(currentLayer, 0, maxLayer)
  }
  if ((key == 's' || keyCode == '40') && MODE == 4) {
    currentLayer -= 1
    currentLayer = constrain(currentLayer, 0, maxLayer)
  }
  if (key == 'r' && MODE == 3 && selectedObject == FuseAttachment) {
    rotateFuseAttachment()
  }

  if (key == 'r' && MODE == 2) {
    SetMode(1)
  }

  if (keyCooldown > 0 || plr.anchored) {
    return
  }
  keyCooldown = keyBaseCooldown
  if (event.code == 'Space' && MODE == 2) {
    tick()
  }
  if (key == 'w' || keyCode == '38') {
    plr.targetY += -gridSize
  }
  if (key == 'a' || keyCode == '37') {
    plr.targetX += -gridSize
  }
  if (key == 's' || keyCode == '40') {
    plr.targetY += gridSize
  }
  if (key == 'd' || keyCode == '39') {
    plr.targetX += gridSize
  }

}
