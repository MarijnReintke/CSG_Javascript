// BFS Pathfinding created by ChatGPT, modified by me to work with fuses and fuse attachments
// "When drawing the fuse, how would I make the fuse find the fastest path to the grid where the player holds their mouse?"

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