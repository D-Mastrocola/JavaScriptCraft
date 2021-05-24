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
let geometry;
let material;

let world = [];
let worldSize = {
  x: 1,
  z: 1,
};

let noiseInc;

let init = () => {
  noise.seed(Math.round(Math.random() * 65536));
  console.log(noise);
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });

  aspect = window.innerWidth / window.innerHeight;
  near = 0.1;
  far = 100;
  fov = 75;
  camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.z = 60;
  camera.position.y = 30;
  camera.position.x = 25;

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.target.set(worldSize.x*32/2, 5, worldSize.z*32/2);
  controls.update();

  scene = new THREE.Scene();
  scene.background = new THREE.Color("skyblue");

  {
    const color = 0xffffff;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    scene.add(light);
  }
  let noiseInc = 0.03;
  for (let x = 0; x < worldSize.x; x++) {
    for (let z = 0; z < worldSize.z; z++) {
      let chunk = new Chunk(x, 0, z, noiseInc);
      world.push(chunk);
    }
  }

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
    world[i].update();
  }
  renderer.render(scene, camera);

  requestAnimationFrame(render);
}

init();
