let renderer;
let fov;
let aspect;
let near;
let far;
let camera;
let scene;
let controls;
let boxWidth;
let boxHeight;
let boxDepth;
let world;

let noiseInc = 0.025;

let init = () => {
  noise.seed(Math.round(Math.random() * 65536));
  console.log(noise);
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });

  aspect = window.innerWidth / window.innerHeight;
  near = 0.1;
  far = 100;
  fov = 75;
  camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.z = 40;
  camera.position.y = 20;
  camera.position.x = 0;

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.target.set(16, 5, 16);
  controls.update();

  scene = new THREE.Scene();
  scene.background = new THREE.Color("skyblue");

  {
    const color = 0xffffff;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-8, 32, -8);
    const light2 = new THREE.DirectionalLight(color, intensity);
    light2.position.set(40, 16, 40);
    scene.add(light);
    scene.add(light2);
  }

  world = new World();

  let xOff = 0.01;
  let yOff = 0.01;
  let zOff = 0.01;
  for (let xN = 0; xN < 32; xN++) {
    console.log(noise.perlin3(xOff, yOff, zOff));
    for (let zN = 0; zN < 32; zN++) {
      for (
        let yN = 0;
        yN < Math.abs(noise.perlin3(xOff, yOff, zOff) * 32) + 5;
        yN++
      ) {
        world.setVoxel(xN, yN, zN, 1);
        yOff += noiseInc;
      }
      zOff += noiseInc;
      yOff = 0.01;
    }
    zOff = 0.01;
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

  console.log(world);
  requestAnimationFrame(render);
};

//Keeps the proportions no matter the screen size;
function resizeRendererToDisplaySize(renderer) {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;
  const crosshair = document.getElementById("crosshair");
  if (needResize) {
    renderer.setSize(width, height, false);
    crosshair.style.top = window.innerHeight / 2 + "px";
    crosshair.style.left = window.innerWidth / 2 + "px";
  }
  return needResize;
}

//Game loop
function render(time) {
  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }
  //controls.update();
  for (let i = 0; i < world.length; i++) {
    for (let j = 0; j < world[i].length; j++) {
      for (let k = 0; k < world[i][j].length; k++) {
        world[i][j][k].update();
      }
    }
  }
  renderer.render(scene, camera);

  requestAnimationFrame(render);
}

init();
