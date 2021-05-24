class Chunk {
  constructor(x, y, z, noiseInc) {
    this.size = 32;
    this.pos = {
      x: x * this.size,
      z: z * this.size,
      y: y * this.size,
    };
    this.blocks = [];
    this.noiseInc = noiseInc;
    this.faces = [
        { // left
          dir: [ -1,  0,  0, ],
          corners: [
            [ 0, 1, 0 ],
            [ 0, 0, 0 ],
            [ 0, 1, 1 ],
            [ 0, 0, 1 ],
          ],
        },
        { // right
          dir: [  1,  0,  0, ],
          corners: [
            [ 1, 1, 1 ],
            [ 1, 0, 1 ],
            [ 1, 1, 0 ],
            [ 1, 0, 0 ],
          ],
        },
        { // bottom
          dir: [  0, -1,  0, ],
          corners: [
            [ 1, 0, 1 ],
            [ 0, 0, 1 ],
            [ 1, 0, 0 ],
            [ 0, 0, 0 ],
          ],
        },
        { // top
          dir: [  0,  1,  0, ],
          corners: [
            [ 0, 1, 1 ],
            [ 1, 1, 1 ],
            [ 0, 1, 0 ],
            [ 1, 1, 0 ],
          ],
        },
        { // back
          dir: [  0,  0, -1, ],
          corners: [
            [ 1, 0, 0 ],
            [ 0, 0, 0 ],
            [ 1, 1, 0 ],
            [ 0, 1, 0 ],
          ],
        },
        { // front
          dir: [  0,  0,  1, ],
          corners: [
            [ 0, 0, 1 ],
            [ 1, 0, 1 ],
            [ 0, 1, 1 ],
            [ 1, 1, 1 ],
          ],
        },
      ];
    this.init();
  }
  init() {
    let noiseOff = {
      x: this.noiseInc * this.pos.x,
      y: this.noiseInc * this.pos.y,
      z: this.noiseInc * this.pos.z,
    };
    for (let xN = 0; xN < this.size; xN++) {
      this.blocks.push([]);
      for (let zN = 0; zN < this.size; zN++) {
        this.blocks[xN].push([]);
        for (let yN = 0; yN < 16; yN++) {
          if (
            yN <
            Math.abs(noise.perlin3(noiseOff.x, noiseOff.y, noiseOff.z) * 8) + 8
          ) {
            let block = new Block(
              xN + this.pos.x,
              yN + this.pos.y,
              zN + this.pos.z,
              scene
            );
            this.blocks[xN][zN].push(block);
          } else {
            this.blocks[xN][zN].push("0");
          }

          noiseOff.y += this.noiseInc;
        }
        noiseOff.z += this.noiseInc;
        noiseOff.y = this.noiseInc * this.pos.y;
      }
      noiseOff.z = this.noiseInc * this.pos.z;
      noiseOff.x += this.noiseInc;
    }
  }
  getVoxel(x, y, z) {
    return this.blocks[x][z][y];
  }
  geometryDataForCell(cellX, cellY, cellZ) {
    const cellSize = this.cellSize;
    const positions = [];
    const normals = [];
    const indices = [];
    let startX = 0;
    let startY = 0;
    let startZ = 0;
    for (let y = 0; y < cellSize; ++y) {
      const voxelY = startY + y;
      for (let z = 0; z < cellSize; ++z) {
        const voxelZ = startZ + z;
        for (let x = 0; x < cellSize; ++x) {
          const voxelX = startX + x;
          const voxel = this.getVoxel(voxelX, voxelY, voxelZ);
          if (voxel) {
            for (const { dir, corners } of this.faces) {
              const neighbor = this.getVoxel(
                voxelX + dir[0],
                voxelY + dir[1],
                voxelZ + dir[2]
              );
              if (!neighbor) {
                // this voxel has no neighbor in this direction so we need a face
                // here.
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
  update() {
    for (let i = 0; i < this.blocks.length; i++) {
      for (let j = 0; j < this.blocks[i].length; j++) {
        for (let k = 0; k < this.blocks[i][j].length; k++) {
          if (this.blocks[i][j][k] !== "0") {
            this.blocks[i][j][k].update();
          }
        }
      }
    }
  }
}
