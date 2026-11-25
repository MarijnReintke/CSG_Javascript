// BFS Pathfinding created by Claude
// "When drawing the fuse, how would I make the fuse find the fastest path to the grid where the player holds their left mouse button?"

var fuseSelected = false

function resetFuseSelection(leftPressed) {
  if (!leftPressed) {
    fuseSelected = false
  }
}

function fuseCellIsAvailable(x, y, ignoredObject, allowBomb = false) {
  if (outOfBounds(x, y)) {
    return false
  }

  const blockingArrays = [fuses,fuseAttachments,bombs,obstructions,doors,buttons,exits,[entrance],switches,laserCannons]
  for (const objectArray of blockingArrays) {
    for (const object of objectArray) {
      if (object !== ignoredObject && objectOverlapsCell(object,x,y) && !(allowBomb && bombs.includes(object))) {
        return false
      }
    }
  }

  return true
}

function findFusePath(start, target, ignoredObject) {
  const startKey = `${start.x},${start.y}`
  const targetKey = `${target.x},${target.y}`
  if (startKey === targetKey) {
    return []
  }

  const queue = [start]
  const parents = new Map([[startKey,null]])
  const positions = new Map([[startKey,start]])
  const directions = [[gridSize,0],[-gridSize,0],[0,gridSize],[0,-gridSize]]

  for (let queueIndex = 0; queueIndex < queue.length; queueIndex++) {
    const current = queue[queueIndex]
    const currentKey = `${current.x},${current.y}`

    for (const [stepX,stepY] of directions) {
      const next = {x:current.x+stepX,y:current.y+stepY}
      const nextKey = `${next.x},${next.y}`
      if (parents.has(nextKey) || !fuseCellIsAvailable(next.x,next.y,ignoredObject,nextKey === targetKey)) {
        continue
      }

      parents.set(nextKey,currentKey)
      positions.set(nextKey,next)
      if (nextKey === targetKey) {
        const path = []
        let pathKey = targetKey
        while (pathKey !== startKey) {
          path.unshift(positions.get(pathKey))
          pathKey = parents.get(pathKey)
        }
        return path
      }
      queue.push(next)
    }
  }

  return null
}

function updateFusePlacement(fuse, cellX, cellY, leftPressed) {
  resetFuseSelection(leftPressed)
  if (!leftPressed) {
    return fuse
  }

  let pathWasFound = false
  let path = null
  let pathOrigin = null

  if (fuses.length > 0) {
    const lastFuse = fuses[fuses.length-1]
    path = findFusePath(lastFuse,{x:cellX,y:cellY},lastFuse)
    pathOrigin = lastFuse.origin
  } else {
    for (const attachment of fuseAttachments) {
      const candidatePath = findFusePath(attachment,{x:cellX,y:cellY},attachment)
      if (candidatePath !== null && (path === null || candidatePath.length < path.length)) {
        path = candidatePath
        pathOrigin = attachment
      }
    }
  }

  if (path !== null && path.length > 0) {
    pathWasFound = true
    if (fuses.length + path.length <= level.wireLimit && !bombConnected) {
      for (const cell of path) {
        const nextFuse = new Fuse(cell.x,cell.y)
        if (fuses.length === 0) {
          nextFuse.origin = pathOrigin
        }
        fuses.push(nextFuse)
      }
      return null
    }
  }

  if (!pathWasFound && fuse.validPosition() && fuses.length < level.wireLimit && !bombConnected) {
    fuses.push(fuse)
    return null
  }

  if (!pathWasFound && fuses.length > 0) {
    if (fuses[fuses.length-1].x == cellX && fuses[fuses.length-1].y == cellY) {
      fuseSelected = true
    }
    if (!fuseSelected || (fuses.length > 1 && fuses[fuses.length-2].x == cellX && fuses[fuses.length-2].y == cellY)) {
      for (let a=0;a<fuses.length-1;a++) {
        const existingFuse = fuses[a]
        if (existingFuse.x == cellX && existingFuse.y == cellY) {
          fuses.splice(a+1,fuses.length-1-a)
        }
      }
    }
    if ((!fuseSelected && fuses.length > 0 && fuses[0].origin.x == cellX && fuses[0].origin.y == cellY) ||
    (fuseSelected && fuses.length == 1 && fuses[0].origin.x == cellX && fuses[0].origin.y == cellY)) {
      fuses.splice(0,fuses.length)
    }
  }

  return fuse
}