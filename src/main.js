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

let world;

let noiseInc = .05;

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

  controls = new THREE.OrbitControls( camera, renderer.domElement );
  controls.target.set(25,5,25)
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

  world = [];

  let xOff = 0.01;
  let yOff = 0.01;
  let zOff = 0.01;
  for (let xN = 0; xN < 50; xN++) {
    console.log(noise.perlin3(xOff, yOff, zOff));
    world.push([]);
    for(let zN = 0; zN < 50; zN++) {
      world[xN].push([]);
      for(let yN = 0; yN < Math.abs(noise.perlin3(xOff, yOff, zOff) * 20) + 5; yN++) {
        let block = new Block(xN, yN, zN, scene);
        world[xN][zN].push(block);
        yOff += noiseInc;
      }
      zOff += noiseInc;
      yOff = .01;
    }
    zOff = .01;
    xOff += noiseInc;
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
