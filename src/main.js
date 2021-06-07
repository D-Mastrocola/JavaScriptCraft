import * as THREE from "./three.js-master/build/three.module.js";
import { PointerLockControls } from "./three.js-master/examples/jsm/controls/PointerLockControls.js";

class VoxelWorld {
  constructor(cellSize) {
    this.cellSize = cellSize;
    this.cellSliceSize = cellSize * cellSize;
    this.cell = new Uint8Array(cellSize * cellSize * cellSize);
  }
  computeVoxelOffset(x, y, z) {
    const { cellSize, cellSliceSize } = this;
    const voxelX = THREE.MathUtils.euclideanModulo(x, cellSize) | 0;
    const voxelY = THREE.MathUtils.euclideanModulo(y, cellSize) | 0;
    const voxelZ = THREE.MathUtils.euclideanModulo(z, cellSize) | 0;
    return voxelY * cellSliceSize + voxelZ * cellSize + voxelX;
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
  setVoxel(x, y, z, v) {
    const cell = this.getCellForVoxel(x, y, z);
    if (!cell) {
      return; // TODO: add a new cell?
    }
    const voxelOffset = this.computeVoxelOffset(x, y, z);
    cell[voxelOffset] = v;
  }
  getVoxel(x, y, z) {
    const cell = this.getCellForVoxel(x, y, z);
    if (!cell) {
      return 0;
    }
    const voxelOffset = this.computeVoxelOffset(x, y, z);
    return cell[voxelOffset];
  }
  generateGeometryDataForCell(cellX, cellY, cellZ) {
    const { cellSize } = this;
    const positions = [];
    const normals = [];
    const indices = [];
    const startX = cellX * cellSize;
    const startY = cellY * cellSize;
    const startZ = cellZ * cellSize;

    for (let y = 0; y < cellSize; ++y) {
      const voxelY = startY + y;
      for (let z = 0; z < cellSize; ++z) {
        const voxelZ = startZ + z;
        for (let x = 0; x < cellSize; ++x) {
          const voxelX = startX + x;
          const voxel = this.getVoxel(voxelX, voxelY, voxelZ);
          if (voxel) {
            // There is a voxel here but do we need faces for it?
            for (const { dir, corners } of VoxelWorld.faces) {
              const neighbor = this.getVoxel(
                voxelX + dir[0],
                voxelY + dir[1],
                voxelZ + dir[2]
              );
              if (!neighbor) {
                // this voxel has no neighbor in this direction so we need a face.
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

VoxelWorld.faces = [
  {
    // left
    dir: [-1, 0, 0],
    corners: [
      [0, 1, 0],
      [0, 0, 0],
      [0, 1, 1],
      [0, 0, 1],
    ],
  },
  {
    // right
    dir: [1, 0, 0],
    corners: [
      [1, 1, 1],
      [1, 0, 1],
      [1, 1, 0],
      [1, 0, 0],
    ],
  },
  {
    // bottom
    dir: [0, -1, 0],
    corners: [
      [1, 0, 1],
      [0, 0, 1],
      [1, 0, 0],
      [0, 0, 0],
    ],
  },
  {
    // top
    dir: [0, 1, 0],
    corners: [
      [0, 1, 1],
      [1, 1, 1],
      [0, 1, 0],
      [1, 1, 0],
    ],
  },
  {
    // back
    dir: [0, 0, -1],
    corners: [
      [1, 0, 0],
      [0, 0, 0],
      [1, 1, 0],
      [0, 1, 0],
    ],
  },
  {
    // front
    dir: [0, 0, 1],
    corners: [
      [0, 0, 1],
      [1, 0, 1],
      [0, 1, 1],
      [1, 1, 1],
    ],
  },
];

function main() {
  let keys = {
    w: false,
    a: false,
    s: false,
    d: false,
    shift: false,
    space: false
  }
  var clock = new THREE.Clock();
  const canvas = document.querySelector("#canvas");
  const renderer = new THREE.WebGLRenderer({ canvas });

  const cellSize = 32;

  const fov = 75;
  const aspect = 2; // the canvas default
  const near = 0.1;
  const far = 1000;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(0, 0, cellSize * 2);

  const controls = new PointerLockControls(camera, canvas);
  //controls.target(cellSize / 2, cellSize / 2, cellSize / 2);
  controls.lookSpeed = .15;
  controls.movementSpeed = 30;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color("lightblue");

  function addLight(x, y, z) {
    const color = 0xffffff;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(x, y, z);
    scene.add(light);
  }
  addLight(-1, 2, 4);
  addLight(1, -1, -2);
  const world = new VoxelWorld(cellSize);

  /* cool effect
  let xOff = 0.01;
  let yOff = 0.01;
  let zOff = 0.01;
  let noiseInc = .025;


  for (let y = 0; y < cellSize; ++y) {
    for (let z = 0; z < cellSize; ++z) {
      for (let x = 0; x < cellSize; ++x) {
        const height = (Math.abs(noise.perlin3(xOff, yOff, zOff) * cellSize));
        if (y < height) {
          console.log(height)
          world.setVoxel(x, y, z, 1);
        }
        xOff += noiseInc;
      }
      xOff = .01;
      zOff += noiseInc;
    }
    zOff = .01;
    yOff += noiseInc;
  }
  */
  noise.seed(Math.round(Math.random() * 65536));
  let noiseInc = 0.013;
  let xOff = noiseInc;
  let yOff = noiseInc;
  let zOff = noiseInc;

  for (let x = 0; x < cellSize; ++x) {
    for (let z = 0; z < cellSize; ++z) {
      for (
        let y = 0;
        y <
        (Math.abs(noise.perlin3(xOff, yOff, zOff)) * cellSize) / 2 +
          cellSize / 2;
        ++y
      ) {
        world.setVoxel(x, y, z, 1);

        yOff += noiseInc;
      }
      yOff = noiseInc;
      zOff += noiseInc;
    }
    zOff = noiseInc;
    xOff += noiseInc;
  }

  const { positions, normals, indices } = world.generateGeometryDataForCell(
    0,
    0,
    0
  );
  const geometry = new THREE.BufferGeometry();
  const material = new THREE.MeshLambertMaterial({ color: "green" });

  const positionNumComponents = 3;
  const normalNumComponents = 3;
  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(
      new Float32Array(positions),
      positionNumComponents
    )
  );
  geometry.setAttribute(
    "normal",
    new THREE.BufferAttribute(new Float32Array(normals), normalNumComponents)
  );
  geometry.setIndex(indices);
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  function render() {
    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }
    //check keys
    if(keys.space) camera.position.y += .5;
    if(keys.shift) camera.position.y -= .5;
    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }
  render();
  document.addEventListener( 'click', function () {
    controls.lock();
  });

  document.addEventListener('keydown', (e) => {
    let key = e.keyCode;
    console.log(key)
    //W
    if(key === 87) keys.w = true;
    //A
    if(key === 65) keys.a = true;
    //S
    if(key === 83) keys.s = true;
    //D
    if(key === 68) keys.d = true;
    //space
    if(key === 32) keys.space = true;
    //shift
    if(key === 16) keys.shift = true;
  });
  document.addEventListener('keyup', (e) => {
    let key = e.keyCode;
    //W
    if(key === 87) keys.w = false;
    //A
    if(key === 65) keys.a = false;
    //S
    if(key === 83) keys.s = false;
    //D
    if(key === 68) keys.d = false;
    //space
    if(key === 32) keys.space = false;
    //shift
    if(key === 16) keys.shift = false;
    
  })
  controls.addEventListener( 'lock', function () {

  
  } );
  
  controls.addEventListener( 'unlock', function () {
  
  } );
}

main();
