class World {
  constructor() {
    this.chunk = 16;
    this.cellSliceSize = this.chunk * this.chunk;
    this.cell = new Uint8Array(this.chunk * this.chunk * this.chunk);
  }
  getCellForVoxel(x, y, z) {
    const { cellSize } = this;
    const cellX = Math.floor(x / cellSize);
    const cellY = Math.floor(y / cellSize);
    const cellZ = Math.floor(z / cellSize);
    if (cellX !== 0 || cellY !== 0 || cellZ !== 0) {
      return null;
    }
    return this.cell;
  }

  computeVoxelOffset(x, y, z) {
    const {cellSize, cellSliceSize} = this;
    const voxelX = THREE.MathUtils.euclideanModulo(x, cellSize) | 0;
    const voxelY = THREE.MathUtils.euclideanModulo(y, cellSize) | 0;
    const voxelZ = THREE.MathUtils.euclideanModulo(z, cellSize) | 0;
    return voxelY * cellSliceSize +
           voxelZ * cellSize +
           voxelX;
  }
  getVoxel(x, y, z) {
    const cell = this.getCellForVoxel(x, y, z);
    if (!cell) {
      return 0;
    }
    const voxelOffset = this.computeVoxelOffset(x, y, z);
    return cell[voxelOffset];
  }
  setVoxel(x, y, z, v) {
    let cell = this.getCellForVoxel(x, y, z);
    if (!cell) {
      return;  // TODO: add a new cell?
    }
    const voxelOffset = this.computeVoxelOffset(x, y, z);
    cell[voxelOffset] = v;
  }
  generateGeometryDataForCell(cellX, cellY, cellZ) {
    const { chunk } = this;
    const positions = [];
    const normals = [];
    const indices = [];
    const startX = cellX * chunk;
    const startY = cellY * chunk;
    const startZ = cellZ * chunk;

    for (let y = 0; y < chunk; ++y) {
      const voxelY = startY + y;
      for (let z = 0; z < chunk; ++z) {
        const voxelZ = startZ + z;
        for (let x = 0; x < chunk; ++x) {
          const voxelX = startX + x;
          const voxel = this.getVoxel(voxelX, voxelY, voxelZ);
          if (voxel) {
            for (const { dir, corners } of VoxelWorld.faces) {
              const neighbor = this.getVoxel(
                voxelX + dir[0],
                voxelY + dir[1],
                voxelZ + dir[2]
              );
              if (!neighbor) {
                // this voxel has no neighbor in this direction so we need a face
                const ndx = positions.length / 3;
                for (const pos of corners) {
                  positions.push(pos[0] + x, pos[1] + y, pos[2] + z);
                  normals.push(...dir);
                }
                indices.push(ndx, ndx + 1, ndx + 2, ndx + 2, ndx + 1, ndx + 3);
              }
            }
          }
        }
      }
    }
    return {
      positions,
      normals,
      indices,
    };
  }
}

World.faces = [
  {
    // left
    dir: [-1, 0, 0],
  },
  {
    // right
    dir: [1, 0, 0],
  },
  {
    // bottom
    dir: [0, -1, 0],
  },
  {
    // top
    dir: [0, 1, 0],
  },
  {
    // back
    dir: [0, 0, -1],
  },
  {
    // front
    dir: [0, 0, 1],
  },
];
