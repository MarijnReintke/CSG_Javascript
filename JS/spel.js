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

  teken() {
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

    image(tileSprites[this.spriteIndex],this.x,this.y,gridSize,gridSize)

    if (MODE == 1 && !(this.x == 0 || this.x == gridSize*(gridWith-1) 
        || this.y == 0 || this.y == gridSize*(gridHeight-1))) {
      for (let tileHighlight of tileHighlights) {
        if (this.x == tileHighlight.x && this.y == tileHighlight.y) {
          tileHighlight.parent = this
        }
        if (tileHighlight.parent == this) {
          return tileHighlight.teken()
        }
      }
      let tileHighlight = new TileHighlight(this)
      tileHighlights.push(tileHighlight)
      tileHighlight.teken()
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

  teken() {
    this.x = snapToGrid(this.x)
    this.y = snapToGrid(this.y)

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
    
    let elec = new Electricity(this,shape)
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
    this.orientation = buildOrientation
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
    
    let elec = new Electricity(this,shape)
    elecs.push(elec)
    elec.teken()
    }
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

  teken() {
    this.x = snapToGrid(this.x)
    this.y = snapToGrid(this.y)

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

  teken() {
    if (this.pressed) {
      this.spriteIndex = 1
    } else {
      this.spriteIndex = 0
    }

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
    this.orientation = buildOrientation
    this.rotation
    this.tick = 0
    this.spriteIndex = 0
    this.previousState = this.open
    this.id = buildId
  }

  teken() {
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

    this.previousState = this.open

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

  teken() {
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

    push()
      imageMode(CENTER)
      translate(this.x + this.width/2,this.y + this.height/2)
      rotate(this.rotation)
      image(exitSprites[this.spriteIndex],0,0,gridSize,gridSize*3)
    pop()

    this.previousState = this.open

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

class Laser {
  constructor(x,y,parent,orientation) {
    this.x = x
    this.y = y
    this.layer = 2
    this.orientation = orientation
    this.parent = parent
    this.width = gridSize
    this.height = gridSize
    this.canCollide = true
  }

  teken() {
    push()
      fill(255,0,255)
      rect(this.x,this.y,gridSize)
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
    this.active = this.normallyActive
    this.id = buildId
  }

  teken() {
    if (gameState.activeIds.includes(this.id)) {
      this.active = !this.normallyActive
    } else {
      this.active = this.normallyActive
    }

    push()
      fill(50,50,50)
      if (this.active) {
        fill(200,150,0)
      }
      rect(this.x,this.y,gridSize)
    pop()

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
    lasers.splice(0,lasers.length)
    while (validPosition(laser,[...objectArrays, [entrance], lasers],true)) {
      lasers.push(laser)
      laser = new Laser(x+xStep,y+yStep,this,this.orientation)
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

  teken() {

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

    push()
      imageMode(CENTER)
      translate(this.x + this.width/2,this.y + this.height/2)
      rotate(this.rotation)
      image(entranceSprites[this.spriteIndex],0,0,gridSize,gridSize*3)
    pop()

    this.previousState = this.open
    this.ticksUntilClose--

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
    this.size += 5*gridScale
    this.transparency += 0.04
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
    this.y -= gridSize/20;
  }

  check() {
    if (this.tick >= this.lastTick) {
      smokeParticles.splice(smokeParticles.indexOf(this), 1);
    }
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

  teken() {
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

    image(elecOrbSprites[this.spriteIndex],this.x,this.y,gridSize,gridSize)

    for (let bomb of bombs) {
      bomb.teken()
    }

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
    this.tick = 0
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

  teken() {
    if (this.tick % 5 == 0) {
      if (this.spriteIndex == 3) {
        this.spriteIndex = 0
      } else {
        this.spriteIndex++
      }
    }

    if (elecs.length > 1) {
      this.spriteIndex = elecs[0].spriteIndex
    }


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

    this.tick++
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

  teken() {
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

    image(tileHighlightSprites[this.spriteIndex],this.x,this.y,gridSize,gridSize)
    
    this.tick++
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
        if (this.pressedInside && this.hovering) {
          this.action()
        }

        this.pressedInside = false
      }

      this.mouseWasHeld = leftPressed
    } else {
      this.spriteIndex = 3
    }

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

  teken() {
    this.clickable = levels[level.currentLevel+1]
    this.hidden = !LEVELCOMPLETE

    super.state();

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

  teken() {
    this.clickable = bombConnected
    this.hidden = (MODE !== 1)

    super.state()

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

  teken() {
    this.hidden = (MODE !== 0)

    super.state()

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

  teken() {
    this.hidden = (MODE !== 0)

    super.state()

    if (this.hidden) return

    image(levelSelectButtonSprites[this.spriteIndex],this.x,this.y,this.width,this.height)
  }

  action() {
    SetMode("LEVELSELECT")
  }
}

class MenuButton extends TextButton {
  constructor(x,y) {
    super(x,y,gridSize*6,gridSize*2)
  }

  teken() {
    this.hidden = (MODE == 0 || MODE == "LEVELSELECT")

    super.state()

    if (this.hidden) return

    image(levelSelectButtonSprites[this.spriteIndex],this.x,this.y,this.width,this.height)
  }

  action() {
    SetMode(0)
  }
}

class BackButton extends TextButton {
  constructor(x,y) {
    super(x,y,gridSize*6,gridSize*2)
  }

  teken() {
    this.hidden = (MODE !== "LEVELSELECT")

    super.state()

    if (this.hidden) return

    image(levelSelectButtonSprites[this.spriteIndex],this.x,this.y,this.width,this.height)
  }

  action() {
    SetMode(0)
  }
}

class LevelButton extends TextButton {
  constructor(x,y,lvl) {
    super(x,y,gridSize*5,gridSize*3.5)
    this.level = lvl
  }

  teken() {
    this.hidden = (MODE !== "LEVELSELECT")

    super.state()

    if (this.hidden) return

    image(levelSelectButtonSprites[this.spriteIndex],this.x,this.y,this.width,this.height)
  }

  action() {
    loadLevel(this.level)
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
  activeIds: [...level.activeIds],
  movesBeforeInterval: level.wireInterval,
}
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
const objects = [Tile, Obstruction, Hazard, Bomb, FuseAttachment, Door, Exit, Button, Switch, LaserCannon]
const objectArrays = []

var debug = false

var levels = []
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
var wireSprites

function preload() {
  let children
  
  children = 4
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
  frameRate(60)
  noSmooth();
  angleMode(DEGREES)

  for (let obj of objects) {
    obj = new obj()
    objectArrays.push(obj.getArray())
  }

  plr = new Plr(0,0)
  entrance = new Entrance()
  nextLevelButton = new NextLevelButton(width/2,height/2+80*gridScale)
  startButton = new StartButton(width-gridSize*8,height-gridSize*2.5)
  menuStartButton = new MenuStartButton(width/2-gridSize*4*1.5,height/2+gridSize*2*1.5)
  levelSelectButton = new LevelSelectButton(width/2+gridSize*4*1.5,height/2+gridSize*2*1.5)
  menuButton = new MenuButton(width-gridSize*3.5,gridSize*1.25)
  backButton = new BackButton(gridSize*3.5,gridSize*1.25)
  textButtons.push(nextLevelButton, startButton, menuStartButton, levelSelectButton, menuButton, backButton)
  let xAmount = 5
  let yAmount = 5
  let buttonWidth = gridSize*5
  let buttonHeight = gridSize*3.5
  let xSpacing = 30
  let ySpacing = 15
  let lvl = 1
  for (var a=0;a<yAmount;a++) {
    let y = a*buttonHeight+(height/2-yAmount*buttonHeight/2+buttonHeight/2-ySpacing*(yAmount-1)/2) + (a*ySpacing) + gridSize
    for (var b=0;b<xAmount;b++) {
      let x = b*buttonWidth+(width/2-xAmount*buttonWidth/2+buttonWidth/2-xSpacing*(xAmount-1)/2) + (b*xSpacing)
      levelButton = new LevelButton(x,y,lvl)
      textButtons.push(levelButton)
      lvl += 1
    }
  }

}

function draw() {

  if (MODE == 0) {
    menu()
  } else if (MODE == "LEVELSELECT") {
    levelSelect()
  } else {
    gameLoop()
  }

  for (let textButton of textButtons) {
    textButton.teken()
  }

}

function levelSelect() {
  background(0,0,0)
  push()
    fill(255,255,255)
    textSize(50*gridScale)
    textAlign(CENTER,CENTER)
    text("W.I.P",width/2,height/2)
  pop()
}

function menu() {
  background(160,150,170)

  for (var a=0;a<3;a++) {
    let smokeParticle = new SmokeParticle(random(0,width),height-75*gridScale)
    smokeParticles.push(smokeParticle)
  }

  for (let particle of smokeParticles) {
    particle.teken()
  }

  for (let particle of smokeParticles) {
    particle.check()
  }

  push()
    fill(0,0,0)
    rect(0,0,width,75*gridScale)
    rect(0,height,width,-75*gridScale)
    textAlign(CENTER,CENTER)
    textSize(150*gridScale)
    textStyle(BOLD)
    text("MENU SCREEN",width/2,250*gridScale)
  pop()

}

function drawAll() {
  push()
  let xOffset = floor(random(-shakeIntensity,shakeIntensity+1))*gridScale
  let yOffset = floor(random(-shakeIntensity,shakeIntensity+1))*gridScale
  translate(xOffset+widthOffset,yOffset+heightOffset)
  const allObjectArrays = [...objectArrays, fuses, elecOrbs, [entrance], lasers];

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
  fill(5,10,15)
  rect(gridSize*gridWith,0,gridSize*2,gridSize*gridHeight)

  for (let smokeParticle of smokeParticles) {
    smokeParticle.teken()
  }
  for (let smokeParticle of smokeParticles) {
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
  push()
    fill(28,23,30)
    rect(widthOffset,heightOffset,gridWith*gridSize,gridHeight*gridSize)
  pop()

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

  drawHoveredObjectHighlight()

  push();
  let gridScale = gridSize/40
  translate(0, heightOffset-5*gridScale);

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

  if (MODE == 1) {
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

  if (MODE == 1 || MODE == 2) {
    fill(255,255,100)
    textSize(40*gridScale)
    text(gameState.movesBeforeInterval, 15*gridScale, gridHeight*gridSize + 125*gridScale);
    textSize(30*gridScale)
    text("Moves Before Elec. Moves", String(gameState.movesBeforeInterval).length * 30*gridScale + 20*gridScale, gridHeight*gridSize + 125*gridScale);
  }

  if (MODE == 3) {
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

  if (MODE == 4) {
    fill(255,100,125)
    textSize(75*gridScale)
    text("Delete", 10*gridScale, gridHeight*gridSize + 75*gridScale);
    textSize(40*gridScale)
    text("Layer " + currentLayer + ' [UP/DOWN]', 15*gridScale, gridHeight*gridSize + 125*gridScale);
  }

  pop();

  if (countdowns.length > 0) {
    countdowns[countdowns.length-1].teken()
  }

  if (flashbangs.length > 0) {
    flashbangs[flashbangs.length-1].teken()
  }

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
    fill(255,255,255)
    textSize(125*gridScale)
    textStyle(BOLD)
    text("You Died!",width/2,height/2-55*gridScale)
    textSize(50*gridScale)
    textStyle(NORMAL)
    text("Press [R] to Restart",width/2,height/2+15*gridScale)
    pop()
  }
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

var fuseSelected = false
var fuse;
function tekenLoop() {
  plr.hidden = true
  plr.anchored = true

  bombConnected = false
  for (let bomb of bombs) {
    if (fuses.length > 0 && fuses[fuses.length-1].x == bomb.x && fuses[fuses.length-1].y == bomb.y) {
      bombConnected = true
    }
  }

  const cellX = snapToGrid(mouseX-widthOffset)
  const cellY = snapToGrid(mouseY-heightOffset)
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
    if (fuse.validPosition() && fuses.length < level.wireLimit && !bombConnected) {
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
    ellipse(cellX+widthOffset+gridSize/2,cellY+heightOffset+gridSize/2,gridSize)
  }
  else if (fuses.length == 0 && fuse.validPosition()) {
    fill(255,255,255,0.25)
    ellipse(cellX+widthOffset+gridSize/2,cellY+heightOffset+gridSize/2,gridSize)
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

function loadLevel(lvl) {

  json = levels[lvl]
  if (!json) {
    return console.warn("failed to load level " + lvl + " :(")
  }

  level.currentLevel = lvl

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

    const classes = {
      'Tile': Tile,
      'Hazard': Hazard,
      'Obstruction': Obstruction,
      'Bomb': Bomb,
      'FuseAttachment': FuseAttachment,
      'Door': Door,
      'Exit': Exit,
      'Button': Button,
      'Switch': Switch,

    };

    object = new classes[constructor](data.gridX*gridSize,data.gridY*gridSize);
    if (data.orientation) {
      object.orientation = data.orientation
    }
    if (data.id) {
      object.id = data.id
    }
    if (data.normallyActive) {
      object.normallyActive = data.normallyActive
    }

    object.getArray().push(object)
  }
  
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

      if (otherObj.layer !== obj.layer) {
        continue
      }
      if (collisionChecks && !otherObj.canCollide) {
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

  gameState.movesBeforeInterval--
  if (gameState.movesBeforeInterval == 0) {
    elecOrbs[0].nextFuse()
    gameState.movesBeforeInterval = level.wireInterval
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

  }
  if (mode == 2) {
    let elecOrb = new ElecOrb(fuseAttachments[0].x,fuseAttachments[0].y)
    elecOrbs.push(elecOrb)
    explosionTick = 0
    gameState.movesBeforeInterval = level.wireInterval
    moves = fuses.length*level.wireInterval
    plr.spawn()
  }
  if (mode == 3) {

  }
  if (mode == 4) {

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

function keyPressed(event) {

  // note to self: deze zorgen ervoor dat de website niet scrollt
  if (key === ' ' || keyCode == '37' || keyCode == '38' || keyCode == '39' || keyCode == '40') {
    event.preventDefault();
  }
  //

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
  if (key == 'Delete' && (MODE == 3 || MODE == 4)) {
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

