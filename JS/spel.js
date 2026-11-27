class Block {
  constructor(x,y) {
    this.x = x
    this.y = y
    this.width = gridSize
    this.height = gridSize
    this.hidden = false
    this.canCollide = true
  }
}

class Tile extends Block {
  constructor(x,y) {
    super(x, y)
    this.layer = 0
    this.hidden = false
    this.spriteIndex = 0
  }

  update() {
    this.x = snapToGrid(this.x)
    this.y = snapToGrid(this.y)

    if (this.hidden) {
      return
    }

    if (this.x/gridSize % 2 == 0) {
      if (this.y/gridSize % 2 == 0) {
        this.spriteIndex = 1
      }
      else {
        this.spriteIndex = 0
      }
    } else {
      if (this.y/gridSize % 2 == 0) {
        this.spriteIndex = 0
      }
      else {
        this.spriteIndex = 1
      }
    }

    if (MODE == 1 && !(this.x == 0 || this.x == gridSize*(gridWith-1) 
        || this.y == 0 || this.y == gridSize*(gridHeight-1))) {
      for (let tileHighlight of tileHighlights) {
        if (this.x == tileHighlight.x && this.y == tileHighlight.y) {
          tileHighlight.parent = this
        }
      }
      if (!tileHighlights.some(tileHighlight => tileHighlight.parent == this)) {
        let tileHighlight = new TileHighlight(this)
        tileHighlights.push(tileHighlight)
      }
    }
  }

  teken() {
    if (this.hidden) {
      return
    }

    image(tileSprites[this.spriteIndex],this.x,this.y,gridSize,gridSize)

    if (MODE == 1) {
      for (let tileHighlight of tileHighlights) {
        if (tileHighlight.parent == this) {
          tileHighlight.teken()
          return
        }
      }
    }
  }

  getArray() {
    return tiles
  }

}

class Obstruction extends Block {
  constructor(x,y) {
    super(x,y)
    this.layer = 2
    this.spriteIndex = 0
  }

  update() {
    this.x = snapToGrid(this.x)
    this.y = snapToGrid(this.y)
  }

  teken() {
    if (this.hidden) {
      return
    }

    image(obstructionSprites[this.spriteIndex],this.x,this.y,gridSize,gridSize)
    
  }

  getArray() {
    return obstructions
  }

}

class Hazard extends Block {
  constructor(x,y) {
    super(x,y)
    this.layer = 2
    this.active = false
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

  update() {
    this.x = snapToGrid(this.x)
    this.y = snapToGrid(this.y)
  }

  teken() {
    if (this.hidden) {
      return
    }

    push();
    noStroke();
    let aantalKringen = 5
    let offset = round(frameCount*3/targetFrameRate)
    for (var a=0;a<aantalKringen;a++) {
      if (this.active) {
        fill(((a+offset) % 2)*255,0,0,1)
      }
      else {
        fill(((this.tickCount) % (this.interval))*255/this.interval,0,0,1)
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
  constructor(x,y) {
    super(x,y)

    this.layer = 1
    this.electrified = false
    this.origin;
    this.canCollide = false
    this.shape
    if (fuses.length > 0) {
      this.origin = fuses[0].origin
    }
  }

  validPosition() {
    const collidableObjects = [fuses,fuseAttachments,obstructions,doors,buttons,exits,[entrance],switches,laserCannons]

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
        if ((abs(this.x-fuseAttachments[a].x) + abs(this.y-fuseAttachments[a].y)) == gridSize) {
          this.origin = fuseAttachments[a]
          return true
        }
      }
    }
    else {
      if ((abs(this.x-fuses[fuses.length-1].x) + abs(this.y-fuses[fuses.length-1].y)) == gridSize) {
        return true
      }
    }

    return false
  }

  getArray() {
    return fuses
  }

  teken() {
    if (fuseAttachments.includes(this.origin)) {
      image(wireSprites[this.shape],this.x,this.y,gridSize,gridSize)
      const elec = elecs.find(elec => elec.parent == this)
      if (elec) {
        elec.teken()
      }
    }
  }

  update() {
    if (!fuseAttachments.includes(this.origin)) {
      fuses.splice(0, fuses.length)
      return
    }

    this.x = snapToGrid(this.x)
    this.y = snapToGrid(this.y)
    this.updateElectricity()
  }

  updateElectricity() {
    this.findShape()

    if (this.electrified) {
      if (!elecs.some(elec => elec.parent == this)) {
        let elec = new Electricity(this,this.shape)
        elecs.push(elec)
      }
    }
  }

  findShape() {
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
          (prevDy == -gridSize && nextDx == -gridSize)) {
        shape = "bottom-right"
      } else if (
          (prevDx == gridSize && nextDy == -gridSize) ||
          (prevDy == -gridSize && nextDx == gridSize)) {
        shape = "bottom-left"
      } else if (
          (prevDx == -gridSize && nextDy == gridSize) ||
          (prevDy == gridSize && nextDx == -gridSize)) {
        shape = "top-right"
      } else if (
          (prevDx == gridSize && nextDy == gridSize) ||
          (prevDy == gridSize && nextDx == gridSize)) {
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

    this.shape = shape
  }

}

class FuseAttachment extends Block {
  constructor(x,y) {
    super(x,y)
    this.layer = 1
    this.canCollide = false
    this.electrified = false
    this.orientation = buildOrientation
    this.shape
  }

  update() {
    this.x = snapToGrid(this.x)
    this.y = snapToGrid(this.y)

    if (MODE !== 2) {
      this.electrified = false
    } else {
      this.electrified = true
    }

    this.findShape()
    if (this.electrified && !elecs.some(elec => elec.parent == this)) {
      let elec = new Electricity(this,this.shape)
      elecs.push(elec)
    }
  }

  teken() {
    this.findShape()
    image(wireSprites[this.shape],this.x,this.y,gridSize,gridSize)
    if (this.electrified) {
      const elec = elecs.find(elec => elec.parent == this)
      if (elec) {
        elec.teken()
      }
    }
  }

  findShape() {
    let previousFuse = true
    let nextFuse = null

    let prevDx = 0
    let prevDy = 0

    if (this.orientation == 'right') {
      prevDx = -gridSize
    } else if (this.orientation == 'left') {
      prevDx = gridSize
    } else if (this.orientation == 'bottom') {
      prevDy = -gridSize
    } else if (this.orientation == 'top') {
      prevDy = gridSize
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

    this.shape = shape
  }

  getArray() {
    return fuseAttachments
  }

}

class Bomb extends Block {
  constructor(x,y) {
    super(x,y)
    this.layer = 2
    this.spriteIndex = 0
  }

  update() {
    this.x = snapToGrid(this.x)
    this.y = snapToGrid(this.y)
  }

  teken() {
    if (this.hidden) {
      return
    }

    image(dynamiteSprites[this.spriteIndex],this.x,this.y,gridSize,gridSize)
  }

  getArray() {
    return bombs
  }
}

class Button extends Block {
  constructor(x,y) {
    super(x,y)
    this.layer = 2
    this.spriteIndex
    this.canCollide = false
    this.pressed = false
  }

  update() {
    if (this.pressed) {
      this.spriteIndex = 1
    } else {
      this.spriteIndex = 0
    }
  }

  teken() {
    image(buttonSprites[this.spriteIndex],this.x,this.y,this.width,this.width)
  }

  getArray() {
    return buttons
  }
}

class Door extends Block {
  constructor(x,y) {
    super(x,y)
    this.layer = 2
    this.width
    this.height
    this.normallyActive = buildNormallyActive
    this.open = this.normallyActive
    this.canCollide = !this.open
    this.orientation = buildOrientation
    this.rotation
    this.tick = 0
    this.spriteIndex = 0
    this.previousState = this.open
    this.id = buildId
  }

  update() {
    if (gameState.activeIds.includes(this.id)) {
      this.open = !this.normallyActive
    } else {
      this.open = this.normallyActive
    }

    if (this.orientation == 'left' || this.orientation == 'right') {
      this.width = gridSize
      this.height = gridSize*3
    } else {
      this.width = gridSize*3
      this.height = gridSize
    }

    if (this.orientation == 'left') {
      this.rotation = 180
    } else if (this.orientation == 'right') {
      this.rotation = 0
    } else if (this.orientation == 'bottom') {
      this.rotation = 90
    } else if (this.orientation == 'top') {
      this.rotation = -90
    }

    if ((this.tick % 3 == 0 && this.tick > 0) || this.previousState !== this.open) {
      this.tick = 0
      if (this.spriteIndex == doorSprites.length-1) {
        this.spriteIndex = 0
      } else {
        this.spriteIndex++
      }
    }

    if (this.open) {
      this.canCollide = false
      if (this.spriteIndex !== 4) {
        this.tick++
      } else {
        this.tick = 0
      }
    } else {
      if (this.spriteIndex !== 0) {
        this.tick++
      } else {
        this.tick = 0
      }
      this.canCollide = true
    }

    this.previousState = this.open
  }

  teken() {
    push()
      imageMode(CENTER)
      translate(this.x + this.width/2,this.y + this.height/2)
      rotate(this.rotation)
      image(doorSprites[this.spriteIndex],0,0,gridSize,gridSize*3)
      fill(255,255,255)
      rotate(-this.rotation)
      textAlign(CENTER,CENTER)
      textStyle(BOLD)
      textSize(30)
      text(this.id,0,0)
    pop()

  }

  getArray() {
    return doors
  }

}

class Exit extends Block {
  constructor(x,y) {
    super(x,y)
    this.layer = 2
    this.width = gridSize
    this.height = gridSize*3
    this.open = false
    this.rotation = 180
    this.tick = 0
    this.spriteIndex = 0
    this.previousState = this.open
  }

  update() {
    let allButtonsPressed = buttons.every(obj => obj.pressed == true)
    if (!LEVELCOMPLETE) {
      if (allButtonsPressed) {
        this.open = true
      }
      else {
        this.open = false
      }
    }

    if ((this.tick % 3 == 0 && this.tick > 0) || this.previousState !== this.open) {
      this.tick = 0
      if (this.spriteIndex == exitSprites.length-1) {
        this.spriteIndex = 0
      } else {
        this.spriteIndex++
      }
    }

    if (this.open) {
      this.canCollide = false
      if (this.spriteIndex !== 4) {
        this.tick++
      } else {
        this.tick = 0
      }
    } else {
      if (this.spriteIndex !== 0) {
        this.tick++
      } else {
        this.tick = 0
      }
      this.canCollide = true
    }

    this.previousState = this.open
  }

  teken() {
    push()
      imageMode(CENTER)
      translate(this.x + this.width/2,this.y + this.height/2)
      rotate(this.rotation)
      image(exitSprites[this.spriteIndex],0,0,gridSize,gridSize*3)
    pop()

  }

  getArray() {
    return exits
  }

}

class Switch extends Block {
  constructor(x,y) {
    super(x,y)
    this.layer = 2
    this.id = buildId
  }

  teken() {
    push()
      if (gameState.activeIds.includes(this.id)) {
        fill(210,210,100)
      } else {
        fill(210,210,210)
      }
      rect(this.x,this.y,gridSize)
      fill(0,0,0)
      textAlign(CENTER,CENTER)
      textStyle(BOLD)
      textSize(30)
      text(this.id,this.x+this.width/2,this.y+this.height/2)
    pop()
  }

  getArray() {
    return switches
  }
}

class Sensor extends Block {
  constructor(x,y) {
    super(x,y)
    this.layer = 1
    this.id = buildId
    this.canCollide = false
    this.activated = false
  }

  teken() {
    for (let obj of [...elecOrbs,...elecs]) {
      if (objectOverlapsCell(obj,this.x,this.y)) {
        this.activated = true
        break
      } else {
        this.activated = false
      }
    }
    push()
      if (this.activated) {
        fill(210,210,100)
      } else {
        fill(210,210,210)
      }
      ellipse(this.x+gridSize/2,this.y+gridSize/2,gridSize)
      fill(0,0,0)
      textAlign(CENTER,CENTER)
      textStyle(BOLD)
      textSize(30)
      text(this.id,this.x+this.width/2,this.y+this.height/2+1)
    pop()
  }

  getArray() {
    return sensors
  }
}

class Laser {
  constructor(x,y,parent,orientation) {
    this.x = x
    this.y = y
    this.layer = 2
    this.orientation = orientation
    this.parent = parent
    this.width = gridSize
    this.height = gridSize
    this.canCollide = false
  }

  teken() {

    push()
      fill(255,0,0,0.6)
      if (this.orientation == "top" || this.orientation == "bottom") {
        rect(this.x+gridSize/4,this.y,gridSize/2,gridSize)
      } else {
        rect(this.x,this.y+gridSize/4,gridSize,gridSize/2)
      }
    pop()

  }

  getArray() {
    return lasers
  }
}

class LaserCannon extends Block {
  constructor(x,y) {
    super(x,y)
    this.layer = 2
    this.normallyActive = buildNormallyActive
    this.orientation = buildOrientation
    this.rotations = {
      "top": 0,
      "right": 90,
      "bottom": 180,
      "left": 270,
    }
    this.active = this.normallyActive
    this.id = buildId
  }

  update() {
    if (gameState.activeIds.includes(this.id)) {
      this.active = !this.normallyActive
    } else {
      this.active = this.normallyActive
    }
  }

  teken() {
    push()
      rectMode(CENTER)
      textAlign(CENTER)
      translate(this.x+gridSize/2,this.y+gridSize/2)
      rotate(this.rotations[this.orientation])
      fill(50,50,50)
      if (this.active) {
        fill(200,150,0)
      }
      rect(0,0,gridSize)
      fill(255,255,255)
      textAlign(CENTER,CENTER)
      textStyle(BOLD)
      textSize(30)
      text(this.id,0,-3)
    pop()

  }

  updateBeam() {
    if (gameState.activeIds.includes(this.id)) {
      this.active = !this.normallyActive
    } else {
      this.active = this.normallyActive
    }
    if (!this.active) {
      return
    }

    let yStep = 0
    let xStep = 0

    if (this.orientation == "top") {
      yStep = -gridSize
    }
    if (this.orientation == "right") {
      xStep = gridSize
    }
    if (this.orientation == "bottom") {
      yStep = gridSize
    }
    if (this.orientation == "left") {
      xStep = -gridSize
    }

    let x = this.x+xStep
    let y = this.y+yStep

    let laser = new Laser(x,y,this,this.orientation)
    while (validPosition(laser,null,true)) {
      for (let obj of elecs) {
        if (objectOverlapsCell(laser,obj.x,obj.y)) {
          return
        }
      }
      for (let obj of elecOrbs) {
        if (objectOverlapsCell(laser,obj.targetX,obj.targetY)) {
          return
        }
      } 
      lasers.push(laser)
      x += xStep
      y += yStep
      laser = new Laser(x,y,this,this.orientation)
    }
    laser = null
  }

  getArray() {
    return laserCannons
  }
}

class Entrance {
  constructor() {
    this.x = 0
    this.y = gridSize*6
    this.layer = 2
    this.width = gridSize
    this.height = gridSize*3
    this.open = false
    this.rotation = 0
    this.tick = 0
    this.time = 1
    this.ticksUntilClose = this.time*targetFrameRate
    this.spriteIndex = 0
    this.previousState = this.open
    this.canCollide = true
  }

  openAndClose() {
    this.open = true
    this.ticksUntilClose = this.time*targetFrameRate
  }

  update() {
    if (this.ticksUntilClose == 0) {
      this.ticksUntilClose = this.time*targetFrameRate
      this.open = false
    }

    if ((this.tick % 3 == 0 && this.tick > 0) || this.previousState !== this.open) {
      this.tick = 0
      if (this.spriteIndex == entranceSprites.length-1) {
        this.spriteIndex = 0
      } else {
        this.spriteIndex++
      }
    }

    if (this.open) {
      if (this.spriteIndex !== 4) {
        this.tick++
      } else {
        this.tick = 0
      }
    } else {
      if (this.spriteIndex !== 0) {
        this.tick++
      } else {
        this.tick = 0
      }
    }

    this.previousState = this.open
    this.ticksUntilClose--
  }

  teken() {
    push()
      imageMode(CENTER)
      translate(this.x + this.width/2,this.y + this.height/2)
      rotate(this.rotation)
      image(entranceSprites[this.spriteIndex],0,0,gridSize,gridSize*3)
    pop()

  }
}

class Plr {
  constructor(x,y) {
    this.layer = 2
    this.targetX = x
    this.targetY = y
    this.x = x
    this.y = y
    this.width = gridSize-8*gridScale
    this.height = gridSize
    this.spawnX = gridSize
    this.spawnY = gridSize*7
    this.previousX = this.spawnX
    this.previousY = this.spawnY
    this.anchored = false
    this.hidden = false
    this.facing = 'right'
    this.winAnimationTick = 0
  }

  spawn() {
    entrance.openAndClose()
    this.hidden = false
    this.facing = 'right'
    this.winAnimationTick = 0
    this.targetX = this.spawnX
    this.targetY = this.spawnY
    this.previousX = this.targetX
    this.previousY = this.targetY
    this.x = -gridSize
    this.y = this.spawnY
  }

  teken() {
    if (this.hidden) {
      return
    }
    push()
      fill(0,0,0,1)
      rect(this.x+4*gridScale,this.y+4*gridScale,this.width);
      fill(255,255,255,1)
      rect(this.x+4*gridScale + this.width-this.width*0.9,this.y+4*gridScale + this.width-this.width*0.9,this.width*0.8);
      fill(125,125,125)
      textAlign(CENTER,CENTER)
      textSize(15)
      textStyle(BOLD)
      text(this.facing,this.x+this.width/2,this.y+this.height/2)
    pop()
  }

  interact() {
    for (let obj of switches) {
      let distX = obj.x - this.targetX
      let distY = obj.y - this.targetY
      if ((this.facing == 'left' && distX == -gridSize && distY == 0) ||
          (this.facing == 'right' && distX == gridSize && distY == 0) ||
          (this.facing == 'top' && distY == -gridSize && distX == 0) ||
          (this.facing == 'bottom' && distY == gridSize && distX == 0)) {
        if (!gameState.activeIds.includes(obj.id)) {
          gameState.activeIds.push(obj.id)
        } else {
          gameState.activeIds.splice(gameState.activeIds.indexOf(obj.id),1)
        }
        tick()
      }
    }
  }

  winAnimation() {
    let fuseStepsRemaining = 0
    if (elecOrbs.length > 0) {
      fuseStepsRemaining = fuses.length - fuses.indexOf(elecOrbs[0].currentFuse)-1
    }
    if (this.winAnimationTick == 1.5*targetFrameRate) {
      this.targetX += gridSize
    }
    if (this.winAnimationTick >= 2.5*targetFrameRate) {
      for (let exit of exits) {
        exit.open = false
      }
      if (fuseStepsRemaining > 0) {
        if (round(this.winAnimationTick-2.5*targetFrameRate) % 2 == 0) {
          elecOrbs[0].nextFuse()
        }
      } else {
        explode()
      }
    }


    this.x += (this.targetX-this.x)/3;
    this.y += (this.targetY-this.y)/3;

    this.winAnimationTick++
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

    const allObjectArrays = [...objectArrays, [entrance]];

    for (const objectArray of allObjectArrays) {
      for (const obj of objectArray) {
        if (obj.canCollide && obj.layer == this.layer && objectOverlapsCell(obj,this.targetX,this.targetY)) {
          return true
        }
      }
    }

    for (let button of buttons) {
      if (button.x == this.targetX && button.y == this.targetY) {
        button.pressed = true
      }
    }

    for (let exit of exits) {
      if (objectOverlapsCell(exit,this.targetX,this.targetY)) {
        LEVELCOMPLETE = true
      }
    }

    return false
  }

  hazardCheck() {
    for (var a = 0; a < hazards.length; a++) {
      if (hazards[a].active && hazards[a].x == this.targetX && hazards[a].y == this.targetY) {
        GAMEOVER = true
      }
    }
    for (let orb of elecOrbs) {
      if (orb.targetX == this.targetX && orb.targetY == this.targetY) {
        GAMEOVER = true
      }
    }
    for (let elec of elecs) {
      if (elec.x == this.targetX && elec.y == this.targetY) {
        GAMEOVER = true
      }
    }
    for (let obj of lasers) {
      if (obj.x == this.targetX && obj.y == this.targetY) {
        GAMEOVER = true
      }
    }

    for (const objectArray of objectArrays) {
      for (const obj of objectArray) {
        if (obj.canCollide && obj.layer == this.layer && objectOverlapsCell(obj, this.targetX, this.targetY)) {
          GAMEOVER = true
        }
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

  update() {
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
    this.tick++;
    return true
  }

  teken() {
    push();
    fill(255, 255, 255, (1 - this.transparency));
    noStroke();
    rect(0, 0, width, height);
    pop();
  }

  getArray() {
    return flashbangs
  }
}

class Countdown {
  constructor(number) {
    this.x = width/2
    this.y = height/2
    this.transparency = 0
    this.size = 600*gridScale
    this.number = number
  }

  update() {
    if (this.transparency >= 1) {
      countdowns.splice(countdowns.indexOf(this),1)
    }

    if (countdowns.length > 1) {
      countdowns.splice(0,countdowns.length-1)
    }

    this.size += 5*gridScale
    this.transparency += 0.04
  }

  teken() {
    push()
    textAlign(CENTER,CENTER)
    fill(255,255,255,1-this.transparency)
    textSize(this.size)
    text(this.number,this.x,this.y)
    pop()
  }

  getArray() {
    return countdowns
  }
}

class SmokeParticle {
  constructor(x,y) {
    this.x = x + gridSize/2
    this.xOffset = floor(random(-60,60))*gridScale
    this.y = y + gridSize
    this.rotation = floor(random(0,360))
    this.transparency = 0
    this.time = random(1,2.5)
    this.tick = 0
    this.size = gridSize
    this.lastTick = this.time * targetFrameRate
  }

  update() {
    if (this.tick >= this.lastTick) {
      smokeParticles.splice(smokeParticles.indexOf(this), 1)
      return
    }

    this.tick++
    this.y -= gridSize/20
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

  }

  getArray() {
    return smokeParticles
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
    this.damping = 5
  }

  update() {
    if (LEVELCOMPLETE) {
      this.damping = 2
    } else {
      this.damping = 5
    }
    if (this.currentFuse) {
      this.targetX = this.currentFuse.x
      this.targetY = this.currentFuse.y
    }

    this.x += (this.targetX-this.x)/this.damping;
    this.y += (this.targetY-this.y)/this.damping;

    if (frameCount % 6 == 0) {
      if (this.spriteIndex == elecOrbSprites.length-1) {
        this.spriteIndex = 0
      } else {
        this.spriteIndex++
      }
    }
  }

  teken() {
    image(elecOrbSprites[this.spriteIndex],this.x,this.y,gridSize,gridSize)
  }

  nextFuse() {
    if (!this.currentFuse) {
      fuseAttachments[0].electrified = true
      this.currentFuse = fuses[0]
      this.targetX = this.currentFuse.x
      this.targetY = this.currentFuse.y
    }
    else {
      this.currentFuse.electrified = true
      this.currentFuse.updateElectricity()
      this.currentFuse = fuses[fuses.indexOf(this.currentFuse)+1]
      this.targetX = this.currentFuse.x
      this.targetY = this.currentFuse.y
    }
    for (let obj of sensors) {
      if (obj.x == this.targetX && obj.y == this.targetY) {
        if (!gameState.activeIds.includes(obj.id)) {
          gameState.activeIds.push(obj.id)
        } else {
          gameState.activeIds.splice(gameState.activeIds.indexOf(obj.id),1)
        }
      }
    }
  }

  getArray() {
    return elecOrbs
  }
}

class Electricity {
  constructor(parent,shape) {
    this.parent = parent
    this.x = parent.x
    this.y = parent.y
    this.totalFrames = 4
    this.spriteIndex = 0
    this.parent
    this.rotation = 0
    this.shape = shape
    if (shape == 'vertical-charged') {
      this.rotation = 90
    } else if (shape == 'top-right-charged') {
      this.rotation = 0
    } else if (shape == 'bottom-right-charged') {
      this.rotation = 90
    } else if (shape == 'bottom-left-charged') {
      this.rotation = 180
    } else if (shape == 'top-left-charged') {
      this.rotation = 270
    }
  }

  update() {
    this.spriteIndex = floor(frameCount/5) % this.totalFrames
  }

  teken() {
    let shape
    shape = String(this.spriteIndex)
    if (this.shape !== 'vertical-charged' && this.shape !== 'horizontal-charged') {
      shape = shape + "-corner"
    }

    push()
      imageMode(CENTER)
      translate(this.x+gridSize/2,this.y+gridSize/2)
      rotate(this.rotation)
      image(electricitySprites[shape],0,0,gridSize,gridSize)
    pop()
  }

  getArray() {
    return elecs
  }
}

class TileHighlight {
  constructor(parent) {
    this.x = parent.x
    this.y = parent.y
    this.tick = 0
    this.parent = parent
    this.spriteIndex = 0
  }

  update() {
    if (!this.parent) {
      tileHighlights.splice(tileHighlights.indexOf(this),1)
    }

    if (this.tick % 20 == 0) {
      if (this.spriteIndex == tileHighlightSprites.length-1) {
        this.spriteIndex = 0
      } else {
        this.spriteIndex++
      }
    }

    if (tileHighlights.length > 1) {
      this.spriteIndex = tileHighlights[0].spriteIndex
    }

    this.tick++
  }

  teken() {
    image(tileHighlightSprites[this.spriteIndex],this.x,this.y,gridSize,gridSize)
  }

  getArray() {
    return tileHighlights
  }
}

class TextButton { 
  constructor(x, y, w, h) { 
    this.width = w
    this.height = h
    this.x = x-this.width/2
    this.y = y-this.height/2
    this.hidden = true
    this.hovering = false
    this.mouseWasHeld = false
    this.selected = false
    this.clickable = true
    this.spriteIndex = 0
  } 

  state() {

    if (this.clickable && !this.hidden) {
      this.hoverCheck()

      const leftPressed = mouseIsPressed && mouseButton === LEFT

      if (!this.mouseWasHeld && leftPressed && this.hovering) {
        this.pressedInside = this.hovering
      } else if (!this.hovering) {
        this.pressedInside = false
      }

      if (this.hovering && leftPressed && this.pressedInside) {
        this.spriteIndex = 2
      } else if (this.hovering) {
        this.spriteIndex = 1
      } else {
        this.spriteIndex = 0
      }

      if (!leftPressed && this.mouseWasHeld) {
        const shouldActivate = this.pressedInside && this.hovering
        this.pressedInside = false
        this.mouseWasHeld = leftPressed
        if (shouldActivate) {
          this.action()
        }
        return
      }

      this.mouseWasHeld = leftPressed
    } else {
      this.spriteIndex = 3
    }

  }

  update() {
    this.state()
  }

  hoverCheck() { 
    if (mouseX >= this.x && mouseX <= this.x + this.width && 
        mouseY >= this.y && mouseY <= this.y + this.height) { 
      this.hovering = true
    } else { 
      this.hovering = false
    } 
  } 

  getArray() {
    return textButtons
  }
}

class NextLevelButton extends TextButton {
  constructor(x,y) {
    super(x,y,gridSize*6,gridSize*3)
  }

  update() {
    this.clickable = levels[level.currentLevel+1]
    this.hidden = !LEVELCOMPLETE

    super.update()
  }

  teken() {

    if (this.hidden) return

    image(nextLevelButtonSprites[this.spriteIndex],this.x,this.y,this.width,this.height)
  }

  action() {
    level.currentLevel++
    loadLevel(level.currentLevel)
  }
}

class StartButton extends TextButton {
  constructor(x,y) {
    super(x,y,gridSize*12.5,gridSize*3)
    this.clickable = false
  }

  update() {
    if (level.currentLevel === "Custom" && MODE === 1) {
      this.width = gridSize*6
      this.height = gridSize*1.5
      this.x = width-this.width
      this.y = gridSize/2
    } else {
      this.width = gridSize*12.5
      this.height = gridSize*3
      this.x = width-gridSize*8
      this.y = height-gridSize*2.5
    }
    this.clickable = bombConnected
    this.hidden = (MODE !== 1 || editorLoadMenuOpen)

    super.update()
  }

  teken() {

    if (this.hidden) return

    image(startButtonSprites[this.spriteIndex],this.x,this.y,this.width,this.height)
  }

  action() {
    SetMode(2)
  }
}

class MenuStartButton extends TextButton {
  constructor(x,y) {
    super(x,y,gridSize*6*1.5,gridSize*2*1.5)
  }

  update() {
    this.hidden = (MODE !== 0)

    super.update()
  }

  teken() {

    if (this.hidden) return

    image(menuStartButtonSprites[this.spriteIndex],this.x,this.y,this.width,this.height)
  }

  action() {
    loadLevel(1)
    SetMode(1)
  }
}

class LevelSelectButton extends TextButton {
  constructor(x,y) {
    super(x,y,gridSize*6*1.5,gridSize*2*1.5)
  }

  update() {
    this.hidden = (MODE !== 0)

    super.update()
  }

  teken() {

    if (this.hidden) return

    image(levelSelectButtonSprites[this.spriteIndex],this.x,this.y,this.width,this.height)
  }

  action() {
    SetMode("LEVELSELECT")
  }
}

class LevelEditorButton extends TextButton {
  constructor(x,y) {
    super(x,y,gridSize*3,gridSize*3)
  }

  update() {
    this.hidden = (MODE !== 0)
    super.update()
  }

  teken() {
    if (this.hidden) return

    push()
    stroke(255,182,6)
    strokeWeight(3)
    if (this.spriteIndex === 2) {
      fill(110,75,25)
    } else if (this.spriteIndex === 1) {
      fill(75,70,65)
    } else {
      fill(45,55,75)
    }
    rect(this.x,this.y,this.width,this.height)
    noStroke()
    fill(255,182,6)
    for (let x=0;x<3;x++) {
      for (let y=0;y<3;y++) {
        rect(this.x+18+x*16,this.y+14+y*16,12,12)
      }
    }
    stroke(255,182,6)
    strokeWeight(5)
    line(this.x+59,this.y+62,this.x+78,this.y+43)
    noStroke()
    fill(255,255,255)
    textAlign(CENTER,CENTER)
    textSize(12)
    textStyle(BOLD)
    text("EDIT",this.x+this.width/2,this.y+this.height-10)
    pop()
  }

  action() {
    createCustomLevel()
  }
}

class EditorActionButton extends TextButton {
  constructor(x,y,w,h,label,action,visible,enabled) {
    super(x,y,w,h)
    this.label = label
    this.actionCallback = action
    this.visibleWhen = visible
    this.enabledWhen = enabled || (() => true)
  }

  update() {
    this.hidden = !this.visibleWhen()
    this.clickable = this.enabledWhen()
    super.update()
  }

  teken() {
    if (this.hidden) return

    push()
    noStroke()
    if (this.spriteIndex === 2) {
      fill(110,75,25)
    } else if (this.spriteIndex === 1) {
      fill(95,80,40)
    } else if (this.spriteIndex === 3) {
      fill(35,35,45)
    } else {
      fill(45,52,68)
    }
    rect(this.x,this.y,this.width,this.height)
    stroke(255,182,6)
    strokeWeight(2)
    noFill()
    rect(this.x+1,this.y+1,this.width-2,this.height-2)
    noStroke()
    fill(255,255,255)
    textAlign(CENTER,CENTER)
    textSize(13)
    textStyle(BOLD)
    text(this.label,this.x+this.width/2,this.y+this.height/2)
    pop()
  }

  action() {
    this.actionCallback()
  }
}

class SavedLevelButton extends TextButton {
  constructor(x,y,index) {
    super(x,y,gridSize*16,gridSize)
    this.index = index
  }

  update() {
    const savedIndex = editorLoadPage*8+this.index
    this.hidden = !editorLoadMenuOpen || savedIndex >= savedCustomLevels.length
    super.update()
  }

  teken() {
    if (this.hidden) return

    const savedLevel = savedCustomLevels[editorLoadPage*8+this.index]
    push()
    noStroke()
    fill(this.spriteIndex === 2 ? 110 : this.spriteIndex === 1 ? 80 : 45,55,68)
    rect(this.x,this.y,this.width,this.height)
    stroke(255,182,6)
    strokeWeight(2)
    noFill()
    rect(this.x+1,this.y+1,this.width-2,this.height-2)
    noStroke()
    fill(255,255,255)
    textAlign(LEFT,CENTER)
    textSize(16)
    text(savedLevel.data.find(entry => entry.name)?.name || 'Untitled',this.x+12,this.y+this.height/2)
    pop()
  }

  action() {
    loadCustomLevelFromSaved(editorLoadPage*8+this.index)
  }
}

class MenuButton extends TextButton {
  constructor(x,y) {
    super(x,y,gridSize*6,gridSize*1.5)
  }

  update() {
    this.hidden = (MODE == 0 || MODE == "LEVELSELECT" || editorLoadMenuOpen || level.currentLevel === "Custom")

    super.update()
  }

  teken() {

    if (this.hidden) return

    image(menuButtonSprites[this.spriteIndex],this.x,this.y,this.width,this.height)
  }

  action() {
    SetMode(0)
  }
}

class BackButton extends TextButton {
  constructor(x,y) {
    super(x,y,gridSize*6,gridSize*1.5)
  }

  update() {
    this.hidden = (MODE !== "LEVELSELECT")

    super.update()
  }

  teken() {

    if (this.hidden) return

    image(backButtonSprites[this.spriteIndex],this.x,this.y,this.width,this.height)
  }

  action() {
    SetMode(0)
  }
}

class LevelButton extends TextButton {
  constructor(x,y,lvl) {
    super(x,y,gridSize*5*1.2,gridSize*3.5*1.2)
    this.level = lvl
  }

  update() {
    this.hidden = (MODE !== "LEVELSELECT")

    super.update()
  }

  teken() {

    if (this.hidden) return

    image(levelButtonSprites[this.spriteIndex], this.x,this.y,this.width,this.height)

    let digits = this.level.toString();
    let spacing = 50
    let startX = this.x + (this.width-(digits.length - 1)*spacing)/2-this.width/2

    for (let a = 0; a < digits.length; a++) {
      let digit = parseInt(digits[a]);
      image(numberSprites[digit],startX + a*spacing,this.y,this.width,this.height);
    }
  }

  action() {
    loadLevel(this.level)
  }
}

class QuestionMarkButton extends TextButton {
  constructor(x,y) {
    super(x,y,gridSize*1.25,gridSize*1.25)
  }

  update() {
    this.hidden = (MODE !== "LEVELSELECT")

    super.update()
  }

  teken() {

    if (this.hidden) return

    image(questionMarkSprites[this.spriteIndex], this.x,this.y,this.width,this.height)

  }

  action() {
    loadLevel(0)
  }
}

class Timer {
  constructor() {
    this.elapsedTime = 0
    this.startedAt = null
    this.displayTime = 0
  }

  get running() {
    return this.startedAt !== null
  }

  resume() {
    if (!this.running) {
      this.startedAt = millis()
    }
  }

  pause() {
    if (this.running) {
      this.elapsedTime += millis() - this.startedAt
      this.startedAt = null
    }
  }

  reset() {
    this.elapsedTime = 0
    this.startedAt = millis()
  }

  update() {
    let elapsed = this.elapsedTime

    if (this.running) {
      elapsed += millis() - this.startedAt
    }

    this.displayTime = floor(elapsed/10)/100
  }

  teken() {
    this.update()
    push()
    fill(255)
    textSize(24)
    textAlign(LEFT, TOP)
    text(this.displayTime, 10, 2)
    pop()
  }
}

const targetFrameRate = 60

var plr;
var entrance;

const gridSize = 32;
const gridScale = gridSize/40
const gridWith = 28;
const gridHeight = 16;

var keyBaseCooldown = 0.03
var keyCooldown = 0

var MODE = 0
var GAMEOVER = false
var LEVELCOMPLETE = false

var bombConnected = false

var selectedObject = null;
var currentObject = null;
var moves = 0
var level = {
  currentLevel: 0,
  wireLimit: 99,
  wireInterval: 2,
  name: "Untitled",
  activeIds: [],
}
var gameState = {
  activeIds: [],
  movesBeforeInterval: level.wireInterval,
}
var gameStates = []
var currentLayer = 2
var maxLayer = 3
var shakeIntensity = 0

var buildOrientation = 'top'
var buildId = 0
var buildNormallyActive = false

var hazards = []
var obstructions = []
var fuses = []
var bombs = []
var tiles = []
var fuseAttachments = []
var flashbangs = []
var countdowns = []
var doors = []
var smokeParticles = []
var elecOrbs = []
var elecs = []
var tileHighlights = []
var exits = []
var buttons = []
var textButtons = []
var switches = []
var laserCannons = []
var lasers = []
var sensors = []
const objects = [Tile, Obstruction, Hazard, Bomb, FuseAttachment, Door, Exit, Button, Switch, LaserCannon, Sensor]
const objectArrays = []

var debug = false

var levels = []
var currentCustomLevelId = null
var levelEditorMessage = ""
var savedCustomLevels = []
var editorLoadMenuOpen = false
var editorLoadPage = 0
var levelNameEditing = false
const customLevelsStorageKey = "escapeProtocol.customLevels.v1"
var dynamiteSprites = []
var elecOrbSprites = []
var electricitySprites = []
var tileHighlightSprites = []
var doorSprites = []
var entranceSprites = []
var exitSprites = []
var buttonSprites = []
var nextLevelButtonSprites = []
var startButtonSprites = []
var tileSprites = []
var obstructionSprites = []
var menuStartButtonSprites = []
var levelSelectButtonSprites = []
var levelEditorButton
var backButtonSprites = []
var menuButtonSprites = []
var levelButtonSprites = []
var numberSprites = []
var questionMarkSprites = []
var wireSprites

function preload() {
  let children
  
  children = 5
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

  children = 4
  for (var a=0;a<children;a++) {
    var png = loadImage('JS/spelAssets/sprites/tileHighlight/' + a + '.png')
    tileHighlightSprites.push(png)
  }

  children = 8
  for (var a=0;a<children;a++) {
    var png = loadImage('JS/spelAssets/sprites/door/' + a + '.png')
    doorSprites.push(png)
  }

  children = 8
  for (var a=0;a<children;a++) {
    var png = loadImage('JS/spelAssets/sprites/entrance/' + a + '.png')
    entranceSprites.push(png)
  }

  children = 8
  for (var a=0;a<children;a++) {
    var png = loadImage('JS/spelAssets/sprites/exit/' + a + '.png')
    exitSprites.push(png)
  }

  children = 2
  for (var a=0;a<children;a++) {
    var png = loadImage('JS/spelAssets/sprites/button/' + a + '.png')
    buttonSprites.push(png)
  }

  children = 4
  for (var a=0;a<children;a++) {
    var png = loadImage('JS/spelAssets/sprites/nextLevelButton/' + a + '.png')
    nextLevelButtonSprites.push(png)
  }

  children = 4
  for (var a=0;a<children;a++) {
    var png = loadImage('JS/spelAssets/sprites/startButton/' + a + '.png')
    startButtonSprites.push(png)
  }

  children = 3
  for (var a=0;a<children;a++) {
    var png = loadImage('JS/spelAssets/sprites/menuStartButton/' + a + '.png')
    menuStartButtonSprites.push(png)
  }

  children = 3
  for (var a=0;a<children;a++) {
    var png = loadImage('JS/spelAssets/sprites/levelSelectButton/' + a + '.png')
    levelSelectButtonSprites.push(png)
  }

  children = 2
  for (var a=0;a<children;a++) {
    var png = loadImage('JS/spelAssets/sprites/tile/' + a + '.png')
    tileSprites.push(png)
  }

  children = 1
  for (var a=0;a<children;a++) {
    var png = loadImage('JS/spelAssets/sprites/obstruction/' + a + '.png')
    obstructionSprites.push(png)
  }

  children = 3
  for (var a=0;a<children;a++) {
    var png = loadImage('JS/spelAssets/sprites/backButton/' + a + '.png')
    backButtonSprites.push(png)
  }

  children = 3
  for (var a=0;a<children;a++) {
    var png = loadImage('JS/spelAssets/sprites/menuButton/' + a + '.png')
    menuButtonSprites.push(png)
  }

  children = 3
  for (var a=0;a<children;a++) {
    var png = loadImage('JS/spelAssets/sprites/levelButton/' + a + '.png')
    levelButtonSprites.push(png)
  }

  children = 10
  for (var a=0;a<children;a++) {
    var png = loadImage('JS/spelAssets/sprites/numbers/' + a + '.png')
    numberSprites.push(png)
  }

  children = 3
  for (var a=0;a<children;a++) {
    var png = loadImage('JS/spelAssets/sprites/questionMarkButton/' + a + '.png')
    questionMarkSprites.push(png)
  }

  electricitySprites = {
    "0": loadImage('JS/spelAssets/sprites/electricity/0.png'),
    "0-corner": loadImage('JS/spelAssets/sprites/electricity/0-corner.png'),
    "1": loadImage('JS/spelAssets/sprites/electricity/1.png'),
    "1-corner": loadImage('JS/spelAssets/sprites/electricity/1-corner.png'),
    "2": loadImage('JS/spelAssets/sprites/electricity/2.png'),
    "2-corner": loadImage('JS/spelAssets/sprites/electricity/2-corner.png'),
    "3": loadImage('JS/spelAssets/sprites/electricity/3.png'),
    "3-corner": loadImage('JS/spelAssets/sprites/electricity/3-corner.png'),
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

  arrowPNG = loadImage('JS/spelAssets/arrow.png')
}

function setup() {
  canvas = createCanvas(gridWith*gridSize+230*gridScale,gridHeight*gridSize+300*gridScale);
  widthOffset = 230*gridScale/2
  heightOffset = 300*gridScale/2-gridSize
  canvas.parent('processing');
  textFont("Courier");
  textSize(40);
  noStroke();
  colorMode(RGB,255,255,255,1)
  frameRate(targetFrameRate)
  noSmooth();
  angleMode(DEGREES)

  for (let obj of objects) {
    obj = new obj()
    objectArrays.push(obj.getArray())
  }

  plr = new Plr(0,0)
  entrance = new Entrance()
  timer = new Timer()
  nextLevelButton = new NextLevelButton(width/2,height/2+80*gridScale)
  startButton = new StartButton(width-gridSize*8,height-gridSize*2.5)
  menuStartButton = new MenuStartButton(width/2-gridSize*4*1.5,height/2+gridSize*2*1.5)
  levelSelectButton = new LevelSelectButton(width/2+gridSize*4*1.5,height/2+gridSize*2*1.5)
  menuButton = new MenuButton(width-gridSize*3.5,gridSize*1.25)
  backButton = new BackButton(gridSize*3.5,gridSize*1.25)
  questionMarkButton = new QuestionMarkButton(width-gridSize*0.75,height-gridSize*0.75)
  levelEditorButton = new LevelEditorButton(width/2,height/2+gridSize*8)
  textButtons.push(nextLevelButton, startButton, menuStartButton, levelSelectButton, menuButton, backButton, questionMarkButton, levelEditorButton)
  let xAmount = 4
  let yAmount = 3
  let buttonWidth = gridSize*5*1.2
  let buttonHeight = gridSize*3.5*1.2
  let xSpacing = 50
  let ySpacing = 50
  let lvl = 1
  for (var a=0;a<yAmount;a++) {
    let y = a*buttonHeight+(height/2-yAmount*buttonHeight/2+buttonHeight/2-ySpacing*(yAmount-1)/2) + (a*ySpacing)
    for (var b=0;b<xAmount;b++) {
      let x = b*buttonWidth+(width/2-xAmount*buttonWidth/2+buttonWidth/2-xSpacing*(xAmount-1)/2) + (b*xSpacing)
      levelButton = new LevelButton(x,y,lvl)
      textButtons.push(levelButton)
      lvl += 1
    }
  }

  initializeLevelEditorControls()

}

let fps = 0
function draw() {
  fps = round(frameRate())

  if (MODE == 0) {
    menu()
  } else if (MODE == "LEVELSELECT") {
    levelSelect()
  } else {
    gameLoop()
  }

  if (editorLoadMenuOpen) {
    drawSavedLevelMenu()
  } else if (level.currentLevel === "Custom" && [1,3,4].includes(MODE)) {
    drawCustomEditorHud()
  }

  for (let textButton of textButtons) {
    textButton.update()
    textButton.teken()
  }

}

function initializeLevelEditorControls() {
  const editorVisible = () => level.currentLevel === "Custom" && [1,3,4].includes(MODE) && !editorLoadMenuOpen
  const loadMenuVisible = () => editorLoadMenuOpen
  const firstRowY = height-gridSize*2.4
  const secondRowY = height-gridSize*1.05
  const firstRowWidth = gridSize*3.75
  const secondRowWidth = gridSize*4.375
  const firstStart = (width-(firstRowWidth*8+8*7))/2+firstRowWidth/2
  const secondStart = (width-(secondRowWidth*7+10*6))/2+secondRowWidth/2

  levelEditorImportInput = document.createElement('input')
  levelEditorImportInput.type = 'file'
  levelEditorImportInput.accept = '.json,application/json'
  levelEditorImportInput.style.display = 'none'
  levelEditorImportInput.addEventListener('change', () => importCustomLevel(levelEditorImportInput))
  document.body.appendChild(levelEditorImportInput)

  const firstRow = [
    ["PLACE", () => SetMode(3)],
    ["DELETE", () => SetMode(4)],
    ["TEST", () => { if (applyEditorSettings()) SetMode(1) }],
    ["SAVE", saveCustomLevel],
    ["LOAD", openSavedLevelMenu],
    ["EXPORT", downloadCustomLevel],
    ["IMPORT", () => levelEditorImportInput.click()],
    ["MENU", () => SetMode(0)],
  ]
  for (let a=0;a<firstRow.length;a++) {
    textButtons.push(new EditorActionButton(firstStart+a*(firstRowWidth+8),firstRowY,firstRowWidth,gridSize,firstRow[a][0],firstRow[a][1],editorVisible))
  }

  const secondRow = [
    ["OBJECT -", () => cycleEditorObject(-1)],
    ["OBJECT +", () => cycleEditorObject(1)],
    ["NAME", toggleLevelNameEditing],
    ["WIRE -", () => { level.wireLimit = max(1,level.wireLimit-1) }],
    ["WIRE +", () => { level.wireLimit = min(999,level.wireLimit+1) }],
    ["TICK -", () => { level.wireInterval = max(1,level.wireInterval-1) }],
    ["TICK +", () => { level.wireInterval = min(99,level.wireInterval+1) }],
  ]
  for (let a=0;a<secondRow.length;a++) {
    textButtons.push(new EditorActionButton(secondStart+a*(secondRowWidth+10),secondRowY,secondRowWidth,gridSize,secondRow[a][0],secondRow[a][1],editorVisible))
  }

  for (let a=0;a<8;a++) {
    textButtons.push(new SavedLevelButton(width/2,height/2-105+a*36,a))
  }
  textButtons.push(
    new EditorActionButton(width/2-160,height/2+184,gridSize*4,gridSize,"< PREV",() => { editorLoadPage-- },loadMenuVisible,() => editorLoadPage>0),
    new EditorActionButton(width/2,height/2+184,gridSize*4,gridSize,"CANCEL",() => { editorLoadMenuOpen=false },loadMenuVisible),
    new EditorActionButton(width/2+160,height/2+184,gridSize*4,gridSize,"NEXT >",() => { editorLoadPage++ },loadMenuVisible,() => (editorLoadPage+1)*8<savedCustomLevels.length)
  )
}

function getLevelObjectConstructors() {
  return {
    Tile,
    Obstruction,
    Hazard,
    Bomb,
    FuseAttachment,
    Door,
    Exit,
    Button,
    Switch,
    LaserCannon,
    Sensor,
  }
}

function validateLevelData(data) {
  if (!Array.isArray(data) || data.length > 5000) {
    return "A level must be a JSON array with no more than 5,000 entries."
  }

  const objectConstructors = getLevelObjectConstructors()
  const orientations = ['top', 'right', 'bottom', 'left']
  for (const entry of data) {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      return "Every level entry must be an object."
    }
    if (entry.name !== undefined && (typeof entry.name !== 'string' || entry.name.length > 50)) {
      return "The level name must be 50 characters or fewer."
    }
    if (entry.limit !== undefined && (!Number.isInteger(entry.limit) || entry.limit < 1 || entry.limit > 999)) {
      return "The wire limit must be a whole number from 1 to 999."
    }
    if (entry.interval !== undefined && (!Number.isInteger(entry.interval) || entry.interval < 1 || entry.interval > 99)) {
      return "The wire interval must be a whole number from 1 to 99."
    }
    if (entry.class === undefined) {
      if (entry.gridX !== undefined || entry.gridY !== undefined) {
        return "Object entries must include a supported class."
      }
      continue
    }
    if (!Object.prototype.hasOwnProperty.call(objectConstructors, entry.class)) {
      return `Unsupported object type: ${entry.class}.`
    }
    if (!Number.isInteger(entry.gridX) || !Number.isInteger(entry.gridY) ||
        entry.gridX < 0 || entry.gridX >= gridWith || entry.gridY < 0 || entry.gridY >= gridHeight) {
      return "Object positions must be whole grid coordinates inside the board."
    }
    if (entry.orientation !== undefined && !orientations.includes(entry.orientation)) {
      return "Object orientation must be top, right, bottom, or left."
    }
    if (entry.id !== undefined && (!Number.isInteger(entry.id) || entry.id < 0 || entry.id > 5)) {
      return "Object IDs must be whole numbers from 0 to 5."
    }
    if (entry.normallyActive !== undefined && typeof entry.normallyActive !== 'boolean') {
      return "normallyActive must be true or false."
    }
  }
  return null
}

function readSavedCustomLevels() {
  let savedLevels
  try {
    const stored = localStorage.getItem(customLevelsStorageKey)
    savedLevels = stored ? JSON.parse(stored) : []
  } catch (error) {
    throw new Error(`Could not read saved levels: ${error.message}`)
  }
  if (!Array.isArray(savedLevels)) {
    throw new Error("Saved level data is invalid.")
  }
  for (const savedLevel of savedLevels) {
    if (!savedLevel || typeof savedLevel.id !== 'string' || validateLevelData(savedLevel.data)) {
      throw new Error("A saved level is invalid.")
    }
  }
  return savedLevels
}

function createCustomLevel() {
  const data = [{name: "Untitled", limit: 99, interval: 2}]
  for (let x=0;x<gridWith;x++) {
    for (let y=0;y<gridHeight;y++) {
      data.push({class: "Tile", gridX: x, gridY: y})
    }
  }
  currentCustomLevelId = null
  selectedObject = Bomb
  levelNameEditing = false
  editorLoadMenuOpen = false
  loadLevel(0,data)
  SetMode(3)
  currentObject = null
  levelEditorMessage = "PLACE OBJECTS. CLICK NAME TO RENAME."
}

function openSavedLevelMenu() {
  try {
    savedCustomLevels = readSavedCustomLevels()
    if (savedCustomLevels.length === 0) {
      levelEditorMessage = "No saved levels yet. Save this level first."
      return
    }
    editorLoadPage = 0
    editorLoadMenuOpen = true
    levelNameEditing = false
    levelEditorMessage = ""
  } catch (error) {
    levelEditorMessage = error.message
  }
}

function loadCustomLevelFromSaved(index) {
  const savedLevel = savedCustomLevels[index]
  if (!savedLevel) return

  editorLoadMenuOpen = false
  currentCustomLevelId = savedLevel.id
  selectedObject = Hazard
  currentObject = null
  loadLevel(0,savedLevel.data)
  SetMode(3)
  levelEditorMessage = "Loaded. Place objects or test your level."
}

function cycleEditorObject(direction) {
  let objectIndex = objects.indexOf(selectedObject)
  objectIndex = (objectIndex+direction+objects.length) % objects.length
  selectedObject = objects[objectIndex]
  currentObject = null
}

function toggleLevelNameEditing() {
  levelNameEditing = !levelNameEditing
  if (levelNameEditing) {
    level.name = ""
    levelEditorMessage = "TYPE A NAME, THEN PRESS ENTER"
  } else if (!level.name.trim()) {
    level.name = "Untitled"
  }
}

function drawCustomEditorHud() {
  push()
  noStroke()
  fill(255,182,6)
  textAlign(LEFT,CENTER)
  textSize(16)
  const modeName = MODE === 3 ? "BUILD" : MODE === 4 ? "DELETE" : "PLAYTEST"
  const name = level.name + (levelNameEditing ? "_" : "")
  const objectName = selectedObject ? selectedObject.name : "Hazard"
  text(`${modeName}  ${name}  OBJECT: ${objectName}  WIRES: ${level.wireLimit}  TICK: ${level.wireInterval}`,20,height-gridSize*4.25)
  fill(255,255,255)
  textSize(13)
  text(levelEditorMessage,20,height-gridSize*3.45,width-40,18)
  pop()
}

function drawSavedLevelMenu() {
  const panelWidth = width-gridSize*12
  const panelHeight = gridSize*14
  push()
  noStroke()
  fill(5,10,20,0.96)
  rect((width-panelWidth)/2,(height-panelHeight)/2,panelWidth,panelHeight)
  stroke(255,182,6)
  strokeWeight(4)
  noFill()
  rect((width-panelWidth)/2,(height-panelHeight)/2,panelWidth,panelHeight)
  noStroke()
  fill(255,182,6)
  textAlign(CENTER,CENTER)
  textStyle(BOLD)
  textSize(24)
  text("LOAD A SAVED LEVEL",width/2,height/2-gridSize*5.7)
  fill(255,255,255)
  textSize(14)
  text(`PAGE ${editorLoadPage+1} / ${max(1,ceil(savedCustomLevels.length/8))}`,width/2,height/2-gridSize*4.5)
  if (savedCustomLevels.length === 0) {
    text("NO SAVED LEVELS",width/2,height/2)
  }
  pop()
}

function readEditorSettings() {
  const name = level.name.trim()
  if (!name || name.length > 50) {
    throw new Error("Level name must have 1 to 50 characters.")
  }
  if (!Number.isInteger(level.wireLimit) || level.wireLimit < 1 || level.wireLimit > 999) {
    throw new Error("Wire limit must be between 1 and 999.")
  }
  if (!Number.isInteger(level.wireInterval) || level.wireInterval < 1 || level.wireInterval > 99) {
    throw new Error("Tick interval must be between 1 and 99.")
  }
  level.name = name
  return {name, wireLimit: level.wireLimit, wireInterval: level.wireInterval}
}

function applyEditorSettings() {
  try {
    readEditorSettings()
    levelEditorMessage = "Level settings applied."
    return true
  } catch (error) {
    levelEditorMessage = error.message
    return false
  }
}

function serializeCurrentLevel() {
  const settings = readEditorSettings()
  const data = [{name: settings.name, limit: settings.wireLimit, interval: settings.wireInterval}]
  for (const objectArray of objectArrays) {
    for (const object of objectArray) {
      data.push({
        class: object.constructor.name,
        gridX: object.x / gridSize,
        gridY: object.y / gridSize,
        orientation: object.orientation,
        id: object.id,
        normallyActive: object.normallyActive,
      })
    }
  }
  const validationError = validateLevelData(data)
  if (validationError) {
    throw new Error(validationError)
  }
  return data
}

function saveCustomLevel() {
  try {
    const data = serializeCurrentLevel()
    const savedLevels = readSavedCustomLevels()
    const id = currentCustomLevelId || `level-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
    const existingIndex = savedLevels.findIndex(savedLevel => savedLevel.id === id)
    const savedLevel = {id, data}
    if (existingIndex === -1) {
      savedLevels.push(savedLevel)
    } else {
      savedLevels[existingIndex] = savedLevel
    }
    localStorage.setItem(customLevelsStorageKey, JSON.stringify(savedLevels))
    currentCustomLevelId = id
    savedCustomLevels = savedLevels
    levelEditorMessage = "LEVEL SAVED"
  } catch (error) {
    levelEditorMessage = error.message
  }
}

function downloadCustomLevel() {
  try {
    const data = serializeCurrentLevel()
    const blob = new Blob([JSON.stringify(data,null,2)],{type: 'application/json'})
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const safeName = data[0].name.replace(/[^a-z0-9-_]+/gi,'-').replace(/^-|-$/g,'') || 'custom-level'
    link.href = url
    link.download = `${safeName}.json`
    document.body.appendChild(link)
    link.click()
    link.remove()
    setTimeout(() => URL.revokeObjectURL(url),1000)
    levelEditorMessage = "JSON EXPORTED"
  } catch (error) {
    levelEditorMessage = error.message
  }
}

function importCustomLevel(fileInput) {
  const file = fileInput.files[0]
  fileInput.value = ''
  if (!file) return
  file.text().then(text => {
    let data
    try {
      data = JSON.parse(text)
    } catch (error) {
      throw new Error(`Could not parse level JSON: ${error.message}`)
    }
    const validationError = validateLevelData(data)
    if (validationError) {
      throw new Error(validationError)
    }
    currentCustomLevelId = null
    selectedObject = Hazard
    currentObject = null
    loadLevel(0,data)
    SetMode(3)
    levelEditorMessage = "LEVEL IMPORTED"
  }).catch(error => {
    levelEditorMessage = error.message
  })
}

function levelSelect() {
  background(57, 52, 72)
}

function menu() {
  background(57, 52, 72)

  for (var a=0;a<3;a++) {
    let smokeParticle = new SmokeParticle(random(0,width),height-75*gridScale)
    smokeParticles.push(smokeParticle)
  }

  for (let particle of [...smokeParticles]) {
    particle.update()
  }

  for (let particle of smokeParticles) {
    particle.teken()
  }

  let xOffset = 0
  let yOffset = sin(frameCount)*10
  push()
    fill(0,0,0)
    rect(0,0,width,75*gridScale)
    rect(0,height,width,-75*gridScale)
    translate(xOffset,yOffset)
    textAlign(CENTER,CENTER)
    textStyle(BOLD)
    textSize(125*gridScale)
    text("[ESCAPE PROTOCOL]",width/2+7,250*gridScale+7)
    stroke(0,0,0)
    strokeWeight(7)
    fill(255,255,255)
    textSize(125*gridScale)
    text("[ESCAPE PROTOCOL]",width/2,250*gridScale)
  pop()

}

function drawAll() {
  push()
  let xOffset = floor(random(-shakeIntensity,shakeIntensity+1))*gridScale
  let yOffset = floor(random(-shakeIntensity,shakeIntensity+1))*gridScale
  translate(xOffset,yOffset)

  const allObjectArrays = [fuses, elecOrbs, ...objectArrays, [entrance], lasers];
  for (const objectArray of allObjectArrays) {
    for (const obj of [...objectArray]) {
      if (obj.update) {
        obj.update()
      }
    }
  }
  for (let elec of [...elecs]) {
    elec.update()
  }
  for (let tileHighlight of [...tileHighlights]) {
    tileHighlight.update()
  }
  for (let smokeParticle of [...smokeParticles]) {
    smokeParticle.update()
  }

  lasers.splice(0,lasers.length)
  for (let obj of laserCannons) {
    obj.updateBeam()
  }

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

  if (MODE == 1 && fuses.length == 0 && fuseAttachments.length > 0) {
    let yOffset = sin(frameCount*2)*5
    push()
      imageMode(CENTER)
      translate(fuseAttachments[0].x+gridSize/2,fuseAttachments[0].y+yOffset-gridSize)
      rotate(-90)
      image(arrowPNG,0,0,gridSize,gridSize)
    pop()
  }

  plr.teken()
  fill(5,10,15)
  rect(gridSize*gridWith,0,gridSize*2,gridSize*gridHeight)

  for (let smokeParticle of smokeParticles) {
    smokeParticle.teken()
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
  push()
    fill(28,23,30)
    rect(widthOffset,heightOffset,gridWith*gridSize,gridHeight*gridSize)
  pop()

  push()
    translate(widthOffset,heightOffset)
    if (MODE == 1) {
      gameState.movesBeforeInterval = level.wireInterval
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
  pop()

  drawHoveredObjectHighlight()

  push();
  let gridScale = gridSize/40
  translate(0, heightOffset-5*gridScale)

  gridScale = gridSize/40*1.25
  if (MODE == 2) {
    if (moves > 0) {
    fill(255,255,255)
    }
    else {
      fill(255,0,0)
    }
    textSize(75*gridScale)
    text(moves, 10*gridScale, gridHeight*gridSize + 75*gridScale);
    textSize(40*gridScale)
    text("Moves Left", String(moves).length * 50*gridScale + 15*gridScale, gridHeight*gridSize + 75*gridScale);
  }

  if (MODE == 1 && level.currentLevel !== "Custom") {
    if (level.wireLimit - fuses.length > 0) {
    fill(255,255,0)
    }
    else {
      fill(255,150,0)
    }
    textSize(75*gridScale)
    text(level.wireLimit - fuses.length, 10*gridScale, gridHeight*gridSize + 75*gridScale);
    textSize(40*gridScale)
    text("Wire Left", String(level.wireLimit - fuses.length).length * 50*gridScale + 15*gridScale, gridHeight*gridSize + 75*gridScale);
  }

  if ((MODE == 1 && level.currentLevel !== "Custom") || MODE == 2) {
    fill(255,255,100)
    textSize(40*gridScale)
    text(gameState.movesBeforeInterval, 15*gridScale, gridHeight*gridSize + 125*gridScale);
    textSize(30*gridScale)
    text("Moves Before Elec. Moves", String(gameState.movesBeforeInterval).length * 30*gridScale + 20*gridScale, gridHeight*gridSize + 125*gridScale);
  }

  if (MODE == 3 && level.currentLevel !== "Custom") {
    fill(100,150,255)
    textSize(75*gridScale)
    text("Build", 10, gridHeight*gridSize + 75*gridScale);
    textSize(40*gridScale)
    text(selectedObject.name, 13*gridScale, gridHeight*gridSize + 125*gridScale);
    textSize(20*gridScale)
    if (currentObject) {
      text("layer = " + currentObject.layer, 15*gridScale, gridHeight*gridSize + 150*gridScale);
      if (currentObject.orientation) {
        text("orientation = " + currentObject.orientation + ' [R]', 150*gridScale, gridHeight*gridSize + 150*gridScale);
      }
      if (currentObject.id !== undefined) {
        let xOffset = 150
        if (currentObject.orientation) {
          xOffset += 300
        }
        text("id = " + currentObject.id + ' [UP/DOWN]', xOffset*gridScale, gridHeight*gridSize + 150*gridScale);
      }
      if (currentObject.normallyActive !== undefined) {
        let xOffset = 150
        if (currentObject.orientation) {
          xOffset += 300
        }
        if (currentObject.id !== undefined) {
          xOffset += 225
        }
        text("normallyActive = " + currentObject.normallyActive + ' [N]', xOffset*gridScale, gridHeight*gridSize + 150*gridScale);
      }
    }
  }

  if (MODE == 4 && level.currentLevel !== "Custom") {
    fill(255,100,125)
    textSize(75*gridScale)
    text("Delete", 10*gridScale, gridHeight*gridSize + 75*gridScale);
    textSize(40*gridScale)
    text("Layer " + currentLayer + ' [UP/DOWN]', 15*gridScale, gridHeight*gridSize + 125*gridScale);
  }

  translate(0,-(heightOffset-5*gridScale))
  push()
    fill(255,255,255)
    textSize(50*gridScale)
    textStyle(BOLD)
    text(level.currentLevel + " - " + level.name,10*gridScale,55*gridScale)
  pop()

  if (LEVELCOMPLETE) {
    push()
    textAlign(CENTER,CENTER)
    fill(255,255,255)
    textSize(75*gridScale)
    textStyle(BOLD)
    text("Level Complete!",width/2,height/2-90*gridScale)
    pop()
  }

  if (GAMEOVER) {
    push()
    textAlign(CENTER,CENTER)
    stroke(0,0,0)
    strokeWeight(6)
    fill(255,255,255)
    textSize(125*gridScale)
    textStyle(BOLD)
    text("You Died!",width/2,height/2-55*gridScale)
    textSize(50*gridScale)
    textStyle(NORMAL)
    text("Press [R] to Restart",width/2,height/2+15*gridScale)
    text("Press [Z] to Undo",width/2,height/2+65*gridScale)
    pop()
  }

  pop();

  if (countdowns.length > 0) {
    const countdown = countdowns[countdowns.length-1]
    countdown.update()
    countdown.teken()
  }

  if (flashbangs.length > 0) {
    const flashbang = flashbangs[flashbangs.length-1]
    if (flashbang.update()) {
      flashbang.teken()
    }
  }

  push()
    fill(255,255,255)
    textSize(20*gridScale)
    text("FPS: " + fps,width-100*gridScale,height-10*gridScale)
  pop()

}

function playerLoop() {

  if (!(LEVELCOMPLETE || GAMEOVER)) {
    if (moves == 0) {
      plr.anchored = true
      explode()
    }
    else {
      plr.anchored = false
    }
    plr.beweeg()
  } else if (LEVELCOMPLETE) {
    plr.anchored = true
    plr.winAnimation()
  } else {
    plr.anchored = true
    plr.beweeg()
    if (moves == 0) {
      explode()
    }
  }
}

var fuse;
function tekenLoop() {
  plr.hidden = true
  plr.anchored = true

  if (fuses.length > 0 && bombs.length > 0 && fuses[fuses.length-1].x == bombs[0].x && fuses[fuses.length-1].y == bombs[0].y) {
    bombConnected = true
  } else {
    bombConnected = false
  }

  const cellX = snapToGrid(mouseX-widthOffset)
  const cellY = snapToGrid(mouseY-heightOffset)
  const leftPressed = mouseIsPressed === true && mouseButton === LEFT

  resetFuseSelection(leftPressed)

  if (outOfBounds(cellX,cellY)) {
    return drawAll()
  }

  if (!fuse) {
    fuse = new Fuse
  }

  fuse.x = cellX
  fuse.y = cellY

  fuse = updateFusePlacement(fuse,cellX,cellY,leftPressed)

  drawAll()

  if (mouseIsPressed === true && mouseButton === LEFT) { 
    fill(255,255,255,0.25)
    ellipse(mouseX-widthOffset,mouseY-heightOffset,gridSize)
  }
  else if (fuses.length > 0 && fuses[fuses.length-1].x == cellX && fuses[fuses.length-1].y == cellY) {
    fill(255,255,255,0.25)
    ellipse(cellX+gridSize/2,cellY+gridSize/2,gridSize)
  }
  else if (fuses.length == 0 && fuseAttachments[0] && fuseAttachments[0].x == cellX && fuseAttachments[0].y == cellY) {
    fill(255,255,255,0.25)
    ellipse(cellX+gridSize/2,cellY+gridSize/2,gridSize)
  }

  if (fuses.length > 0 && bombs.length > 0 && fuses[fuses.length-1].x == bombs[0].x && fuses[fuses.length-1].y == bombs[0].y) {
    bombConnected = true
  } else {
    bombConnected = false
  }
}

function buildLoop() {
  plr.anchored = true
  plr.hidden = true

  const cellX = snapToGrid(mouseX-widthOffset)
  const cellY = snapToGrid(mouseY-heightOffset)

  if (!selectedObject) {
    selectedObject = Hazard
  }
  if (!currentObject || currentObject.constructor.name !== selectedObject.name) {
    currentObject = new selectedObject()
  }

  currentObject.x = cellX
  currentObject.y = cellY
  if (currentObject.orientation) {
    currentObject.orientation = buildOrientation
  }
  if (currentObject.id !== undefined) {
    currentObject.id = buildId
  }
  if (currentObject.normallyActive !== undefined) {
    currentObject.normallyActive = buildNormallyActive
  }

  if (selectedObject == Door) {
    if (currentObject.orientation == 'left' || currentObject.orientation == 'right') {
      currentObject.width = gridSize
      currentObject.height = gridSize*3
    } else {
      currentObject.width = gridSize*3
      currentObject.height = gridSize
    }
  }

  if (!validPosition(currentObject)) {
    return drawAll()
  }

  if (mouseIsPressed === true && mouseButton === LEFT) {
    if (selectedObject == Bomb || selectedObject == FuseAttachment || selectedObject == Exit) {
      if (currentObject.getArray().length == 0) {
        currentObject.getArray().push(currentObject)
        currentObject = null
      }
    } else {
      currentObject.getArray().push(currentObject)
      currentObject = null
    }
  }

  if (currentObject) {
    currentObject.getArray().push(currentObject)
  }
  drawAll()
  if (currentObject) {
    currentObject.getArray().splice(currentObject.getArray().indexOf(currentObject),1)
  }

  if (!currentObject) {
    currentObject = new selectedObject()
  }
}

function deleteLoop() {
  plr.anchored = true
  plr.hidden = true

  const cellX = snapToGrid(mouseX-widthOffset)
  const cellY = snapToGrid(mouseY-heightOffset)

  if (!mouseIsPressed || mouseButton !== LEFT || outOfBounds(cellX,cellY)) {
    return
  }

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
  let objHeight = obj.height ?? gridSize
  let objWidth = obj.width ?? gridSize
  for (let a = 0; a < objHeight / gridSize; a++) {
    let objectY
    if (obj.targetY !== undefined) {
      objectY = obj.targetY + a*gridSize;
    } else {
      objectY = obj.y + a*gridSize;
    }

    for (let b = 0; b < objWidth / gridSize; b++) {
      let objectX
      if (obj.targetX !== undefined) {
        objectX = obj.targetX + b*gridSize;
      } else {
        objectX = obj.x + b*gridSize;
      }

      if (objectX == cellX && objectY == cellY) {
        return true;
      }
    }
  }

  return false;
}

function drawHoveredObjectHighlight() {

  const cellX = snapToGrid(mouseX-widthOffset)
  const cellY = snapToGrid(mouseY-heightOffset)
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
          strokeWeight(3*gridScale)
          rect(object.x+widthOffset + 1.5*gridScale, object.y+heightOffset + 1.5*gridScale, object.width - 3*gridScale, object.height - 3*gridScale)
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
      strokeWeight(3*gridScale)
      rect(currentObject.x+widthOffset + 1.5*gridScale, currentObject.y+heightOffset + 1.5*gridScale, currentObject.width - 3*gridScale, currentObject.height - 3*gridScale)
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
        gridX: object.x/gridSize,
        gridY: object.y/gridSize,
        orientation: object.orientation,
        id: object.id,
        normallyActive: object.normallyActive,
      }
      levelArray.push(obj)
    }
  }
  print(levelArray)
}

function loadLevel(lvl, customData) {

  const json = customData || levels[lvl]
  if (!json) {
    return console.warn("failed to load level " + lvl + " :(")
  }

  if (customData) {
    const validationError = validateLevelData(customData)
    if (validationError) {
      throw new Error(validationError)
    }
    level.currentLevel = "Custom"
  } else {
    currentCustomLevelId = null
    level.currentLevel = lvl
  }

  fuses.splice(0,fuses.length)
  fuse = null
  for (let objectArray of objectArrays) {
    objectArray.splice(0,objectArray.length)
  }

  level.name = "Untitled"
  level.wireLimit = 99
  level.wireInterval = 2
  for (var a=0;a < Object.keys(json).length; a++) {
    let data = json[a];
    let constructor = data.class
    if (data.limit) {
      level.wireLimit = data.limit
    }
    if (data.interval) {
      level.wireInterval = data.interval
    }
    if (data.name) {
      level.name = data.name
    }
    if (!constructor || data.gridX == null || data.gridY == null) {
      continue
    }

    const classes = getLevelObjectConstructors()

    object = new classes[constructor](data.gridX*gridSize,data.gridY*gridSize);
    if (data.orientation) {
      object.orientation = data.orientation
    }
    if (data.id !== undefined) {
      object.id = data.id
    }
    if (data.normallyActive !== undefined) {
      object.normallyActive = data.normallyActive
    }

    object.getArray().push(object)
  }
  
  timer.reset()
  timer.resume()
  SetMode(1)
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

function validPosition(obj,objArrays,collisionChecks) {

  for (let a = 0; a < obj.height / gridSize; a++) {
    const objY = obj.y + a * gridSize;
    for (let b = 0; b < obj.width / gridSize; b++) {
      const objX = obj.x + b * gridSize;

      if (outOfBounds(objX,objY)) {
        return false
      }
    }
  }

  let allObjectArrays = [...objectArrays, [entrance]]
  if (objArrays) {
    allObjectArrays = objArrays
  }
  for (const objectArray of allObjectArrays) {
    for (const otherObj of objectArray) {

      if (otherObj.layer !== obj.layer && obj.layer !== 1) {
        continue
      } else if (obj.layer == 1 && otherObj.layer == 0) {
        continue
      }
      if (collisionChecks && !otherObj.canCollide) {
        continue
      }

      if (obj.x < otherObj.x + otherObj.width &&
          obj.x + obj.width > otherObj.x &&
          obj.y < otherObj.y + otherObj.height &&
          obj.y + obj.height > otherObj.y) {
        return false
      }
    }
  }

  return true;
}

function saveGameState() {
  gameStates.push({
    activeIds: [...gameState.activeIds],
    movesBeforeInterval: gameState.movesBeforeInterval,
    playerPos: {x: plr.targetX, y: plr.targetY},
    playerFacing: plr.facing,
    fuseStates: fuses.map(fuse => ({electrified: fuse.electrified})),
    fuseAttachmentStates: fuseAttachments.map(fuse => ({electrified: fuse.electrified})),
    bombStates: bombs.map(bomb => ({spriteIndex: bomb.spriteIndex})),
    buttonStates: buttons.map(button => ({pressed: button.pressed})),
    elecOrbStates: elecOrbs.map(orb => ({
      currentFuseIndex: fuses.indexOf(orb.currentFuse),
      targetX: orb.targetX,
      targetY: orb.targetY,
    })),
    moves,
  })
}

function tick() {
  if (moves <= 0 || fuses.length == 0) {
    return
  }

  gameState.movesBeforeInterval--
  if (gameState.movesBeforeInterval == 0) {
    elecOrbs[0].nextFuse()
    lasers.splice(0,lasers.length)
    for (let obj of laserCannons) {
      obj.updateBeam()
    }
    gameState.movesBeforeInterval = level.wireInterval
  }

  moves--

  saveGameState()

  if (moves > 0 && moves <= 5) {
    let countdown = new Countdown(moves)
    countdowns.push(countdown)
  }
}

let explosionTick = 0
function explode() {
  if (bombs[0].spriteIndex == dynamiteSprites.length-1) {
    if (explosionTick % 3 == 0) {
      let particle = new SmokeParticle(bombs[0].x,bombs[0].y)
      smokeParticles.push(particle)
    }
    explosionTick++
    return false
  }

  if (explosionTick % 6 == 0) {
    if (bombs[0].spriteIndex == dynamiteSprites.length-2) {
      bombs[0].spriteIndex++
      explosionTick = 0
      elecOrbs.splice(0,elecOrbs.length)
      let flashbang = new Flashbang()
      flashbangs.push(flashbang)
      shakeIntensity = 30
      if (!LEVELCOMPLETE) {
        GAMEOVER = true
      } else {
        plr.hidden = true
      }
      return true
    }
    bombs[0].spriteIndex++
  }
  explosionTick++
  return false
}

function SetMode(mode) {
  shakeIntensity = 0
  flashbangs.splice(0,flashbangs.length)
  countdowns.splice(0,countdowns.length)
  smokeParticles.splice(0,smokeParticles.length)
  elecOrbs.splice(0,elecOrbs.length)
  elecs.splice(0,elecs.length)
  tileHighlights.splice(0,tileHighlights.length)
  for (let obj of sensors) {
    obj.activated = false
  }
  bombConnected = false
  LEVELCOMPLETE = false
  GAMEOVER = false
  gameState.activeIds = [...level.activeIds]
  plr.hidden = true
  plr.anchored = true
  for (let fuse of fuses) {
    fuse.electrified = false
  }
  for (let bomb of bombs) {
    bomb.spriteIndex = 0
  }
  for (let button of buttons) {
    button.pressed = false
  }


  if (mode == 1) {
    timer.resume()
  }
  if (mode == 2) {
    let elecOrb = new ElecOrb(fuseAttachments[0].x,fuseAttachments[0].y)
    elecOrbs.push(elecOrb)
    explosionTick = 0
    gameState.movesBeforeInterval = level.wireInterval
    moves = fuses.length*level.wireInterval
    plr.spawn()
    gameStates.splice(0,gameStates.length)
    saveGameState()
  }
  if (mode == 3) {
    timer.pause()
  }
  if (mode == 4) {
    timer.pause()
  }
  if (mode == 3 || mode == 4) {
    fuses.splice(0,fuses.length)
    fuse = null
  }

  MODE = mode

  draw()
}

function changeOrientation(value) {
  if (value == "top") {
    value = "right"
  } else if (value == "right") {
    value = "bottom"
  } else if (value == "bottom") {
    value = "left"
  } else if (value == "left") {
    value = "top"
  }
  return value
}

function undo() {
  if (MODE !== 2 || gameStates.length < 2) {
    return
  }
  shakeIntensity = 0
  flashbangs.splice(0,flashbangs.length)
  countdowns.splice(0,countdowns.length)
  smokeParticles.splice(0,smokeParticles.length)
  plr.hidden = false
  plr.winAnimationTick = 0
  gameStates.pop()
  const previousState = gameStates[gameStates.length-1]
  gameState.activeIds = [...previousState.activeIds]
  gameState.movesBeforeInterval = previousState.movesBeforeInterval
  previousState.fuseStates.forEach((state, index) => {
    fuses[index].electrified = state.electrified
  })
  previousState.fuseAttachmentStates.forEach((state, index) => {
    fuseAttachments[index].electrified = state.electrified
  })
  previousState.bombStates.forEach((state, index) => {
    bombs[index].spriteIndex = state.spriteIndex
  })
  previousState.buttonStates.forEach((state, index) => {
    buttons[index].pressed = state.pressed
  })
  previousState.elecOrbStates.forEach((state, index) => {
    let orb = elecOrbs[index]
    if (!orb) {
      orb = new ElecOrb(bombs[0].x,bombs[0].y)
      elecOrbs.push(orb)
    }
    orb.currentFuse = state.currentFuseIndex < 0 ? undefined : fuses[state.currentFuseIndex]
    orb.targetX = state.targetX
    orb.targetY = state.targetY
    if (LEVELCOMPLETE) {
      orb.x = orb.targetX
      orb.y = orb.targetY
    }
  })
  elecs.splice(0,elecs.length)
  let fuse = fuses[fuses.indexOf(elecOrbs[0].currentFuse)]
  if (fuse) {
    fuse.electrified = true
  }
  for (let fuse of [...fuseAttachments,...fuses]) {
    if (fuse.electrified) {
      fuse.findShape()
      elecs.push(new Electricity(fuse,fuse.shape))
    }
  }
  lasers.splice(0,lasers.length)
  for (let laserCannon of laserCannons) {
    laserCannon.updateBeam()
  }
  moves = previousState.moves
  plr.previousX = previousState.playerPos.x
  plr.previousY = previousState.playerPos.y
  plr.targetX = previousState.playerPos.x
  plr.targetY = previousState.playerPos.y
  plr.facing = previousState.playerFacing

  LEVELCOMPLETE = false
  GAMEOVER = false
}

function keyTyped() {
  if (!levelNameEditing || level.name.length >= 50 || key.length !== 1) {
    return
  }
  if (key >= ' ') {
    level.name += key
  }
  return false
}

function keyPressed(event) {

  if (editorLoadMenuOpen) {
    if (key === 'Escape') {
      editorLoadMenuOpen = false
    } else if (keyCode === LEFT_ARROW && editorLoadPage > 0) {
      editorLoadPage--
    } else if (keyCode === RIGHT_ARROW && (editorLoadPage+1)*8 < savedCustomLevels.length) {
      editorLoadPage++
    }
    return
  }

  if (levelNameEditing) {
    if (keyCode === BACKSPACE) {
      level.name = level.name.slice(0,-1)
      event.preventDefault()
    } else if (key === 'Enter' || key === 'Escape') {
      levelNameEditing = false
      if (!level.name.trim()) {
        level.name = "Untitled"
      }
    }
    return
  }

  const target = event.target
  if (target && (target.isContentEditable || ['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON'].includes(target.tagName))) {
    return
  }

  // note to self: deze zorgen ervoor dat de website niet scrollt
  if (key === ' ' || keyCode == '37' || keyCode == '38' || keyCode == '39' || keyCode == '40') {
    event.preventDefault();
  }
  //
  if (!plr) {
    return
  }

  if (key == 'd' && MODE == 3) {
    selectedObject = objects[objects.indexOf(selectedObject)+1]
    if (!selectedObject) {
      selectedObject = objects[0]
    }
  }
  if (key == 'a' && MODE == 3) {
    selectedObject = objects[objects.indexOf(selectedObject)-1]
    if (!selectedObject) {
      selectedObject = objects[objects.length-1]
    }
  }
  if (key == 'Tab') {
    printLevel()
  }
  if (key == 'Delete' && (MODE == 3 || MODE == 4) && level.currentLevel !== "Custom") {
    loadLevel(0)
    SetMode(3)
  }

  if (key == 'q' && MODE !== 1 && MODE !== 'LEVELSELECT' && MODE !== 0) {
    SetMode(1)
  }
  if (key == 'Enter' && bombConnected && MODE !== 2) {
    SetMode(2)
  }
  if (key == 'v') {
    if (MODE !==3 && MODE !== 'LEVELSELECT' && MODE !== 0) {
      SetMode(3)
    }
  }
  if (key == 'b' && MODE !== 4 && MODE !== 'LEVELSELECT' && MODE !== 0) {
    SetMode(4)
  }

  if (key == 'w' || keyCode == '38') {
    if (MODE == 4 && currentLayer < maxLayer) {
      currentLayer += 1
    }
    if (MODE == 3 && currentObject.id !== undefined && buildId < 5) {
      buildId += 1
    }
  }
  if (key == 's' || keyCode == '40') {
    if (MODE == 4 && currentLayer > 0) {
      currentLayer -= 1
    }
    if (MODE == 3 && currentObject.id !== undefined && buildId > 0) {
      buildId -= 1
    }
  }
  if (key == 'r') {
    if (MODE == 3 && currentObject.orientation) {
      buildOrientation = changeOrientation(buildOrientation)
    }
    if (MODE == 2) {
      SetMode(1)
    }
  }
  if (key == 'n') {
    if (MODE == 3 && currentObject.normallyActive !== undefined) {
      if (buildNormallyActive) {
        buildNormallyActive = false
      } else {
        buildNormallyActive = true
      }
    }
  }

  if (key == 'z' && MODE == 2) {
    if (keyCooldown > 0) {
      return
    }
    keyCooldown = keyBaseCooldown
    undo()
    return
  }

  if (keyCooldown > 0 || plr.anchored || plr.hidden) {
    return
  }

    keyCooldown = keyBaseCooldown
    if (event.code == 'Space' && MODE == 2) {
      tick()
    }
    if (key == 'e') {
      plr.interact()
    }
    if (key == 'w' || keyCode == '38') {
      plr.facing = 'top'
      plr.targetY += -gridSize
    }
    if (key == 'a' || keyCode == '37') {
      plr.facing = 'left'
      plr.targetX += -gridSize
    }
    if (key == 's' || keyCode == '40') {
      plr.facing = 'bottom'
      plr.targetY += gridSize
    }
    if (key == 'd' || keyCode == '39') {
      plr.facing = 'right'
      plr.targetX += gridSize
    }

}

