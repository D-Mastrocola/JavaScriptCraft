        import * as THREE from 'https://threejs.org/build/three.module.js';
        import { PointerLockControls } from 'https://threejs.org/examples/jsm/controls/PointerLockControls.js';
        import {Block} from './block.js';
        import {Player} from "./player.js";
        
        function init() {
            
        }
        function main() {
            //Defines the renderer. The renderer is what renders te scene into a 2d picture and puts it on the canvas
            const renderer = new THREE.WebGLRenderer({canvas, antialias: true});
            let cursorLock = false;
            //Define variables related to the camera
            const fov = 75;
            const aspect = window.innerWidth/window.innerHeight;
            const near = 0.1;
            const far = 100;
            const cameraSpeed = .1;
            const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
            let raycaster = new THREE.Raycaster();
            let mouse = new THREE.Vector2();

            const GRAVITY = -.005 ;

            var jumped = false;
            var flying = true
            const jumpSpeed = .1;
            var yVelocity = 0;
            
            camera.position.z = 4;
            camera.position.x = 4;
            camera.position.y = .5;

            var player = new Player(camera.position.x, camera.position.y, camera.position.z, fov, aspect, near, far);

            const scene = new THREE.Scene();
            scene.background = new THREE.Color( 'skyblue' );

            //Light
            const color = 0xFFFFFF;
            const intensity = 1;
            const light = new THREE.DirectionalLight(color, intensity);
            light.position.set(-1, 2, 4);
            scene.add(light);

            

            //Texture loader
            const loader = new THREE.TextureLoader();

            //Creates Material from the texture
            var dirtMaterial = new THREE.MeshBasicMaterial( {map: loader.load("/images/dirtBlock/dirt.png") });
        

            //Creates the geometry for the blocks
            const boxSize = 1;
            const geometry = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
            const hoveredBlockWireframe = new THREE.WireframeGeometry(geometry, {color: 0x000000});
            const hoveredBlockLines = new THREE.LineSegments(hoveredBlockWireframe);
            scene.add(hoveredBlockLines);
        
            //Stores all of the blocks
            var meshArray = [];
            var blockArray = [];
            makePlane({x: 0, y: -3, z: 0}, 1,8,8, dirtMaterial);
            //Creates a plane of dirt blocks
            function makePlane(origin, height, width, depth, material ) {
                
                for(let i = origin.y; i < origin.y + height; i++) {
                    for(let j = origin.x; j < origin.x + width; j++) {
                        for(let k = origin.z; k < origin.z + depth; k++) {
                            let block = new Block(j,i,k,material);
                            meshArray.push(block.cube);
                            blockArray.push(block);
                            scene.add(meshArray[meshArray.length - 1]);
                            //cubes.push(makeInstance(geometry, material, j - (width / 2), i - 2, k - (depth / 2)));
                        }
                    }
                }
            }
            var controls = new PointerLockControls( camera, document.body );

            document.addEventListener('click', () => {
                if(cursorLock) {
                    console.log("fdsafasfs");
                }else {
                    controls.lock();
                }
            });

            controls.addEventListener( 'lock', () => {
                cursorLock = true;
            });
            controls.addEventListener( 'unlock', () => {
                cursorLock = false;

            });
            scene.add(controls.getObject());

            //Changes the velocity of the camera based on input
            document.addEventListener("keydown", function(e) {
                //w
                if(e.keyCode === 87) {
                    player.inputs.w = 1
                }//a
                if(e.keyCode === 65) {
                    player.inputs.a = 1;
                }
                //s
                if(e.keyCode === 83) {
                    player.inputs.s = 1;
                }
                //d
                if(e.keyCode === 68) {
                    player.inputs.d = 1;
                }
                //space
                if(e.keyCode === 32) {
                    player.inputs.space = 1;
                }
                //shift
                if(e.keyCode === 16) {
                    player.inputs.shift = 1;
                }
            });

            //Changes the velocity of the camera based on input
            document.addEventListener("keyup", function(e) {
                //w
                if(e.keyCode === 87) {
                    player.inputs.w = 0;
                }//a
                if(e.keyCode === 65) {
                    player.inputs.a = 0;
                }
                //s
                if(e.keyCode === 83) {
                    player.inputs.s = 0;
                }
                //d
                if(e.keyCode === 68) {
                    player.inputs.d = 0;
                }
                //space
                if(e.keyCode === 32) {
                    player.inputs.space = 0;
                }
                //shift
                if(e.keyCode === 16) {
                    player.inputs.shift = 0;
                }
                
            });


            //Keeps the proportions no matter the screen size;
            function resizeRendererToDisplaySize(renderer) {
                const canvas = renderer.domElement;
                const width = canvas.clientWidth;
                const height = canvas.clientHeight;
                const needResize = canvas.width !== width || canvas.height !== height;
                const crosshair = document.getElementById("crosshair");
                if (needResize) {
                    renderer.setSize(width, height, false);
                    crosshair.style.top = window.innerHeight/2 + "px";
                    crosshair.style.left = window.innerWidth/2 + "px";
                }
                return needResize;
            }


            //Game loop
            function render(time) {
                time *= 0.001;  // convert time to seconds
                player.update(camera, controls);
                raycaster.setFromCamera( mouse, camera );
                for(let i = 0; i < blockArray.length; i++) {
                    blockArray[i].update();
                }
                let intersects = raycaster.intersectObjects( meshArray);
                hoveredBlockLines.visible = false;
                let selectedBlock;

                if(intersects.length > 0 && intersects[0].distance < 10) {
                    hoveredBlockLines.position.x = intersects[0].object.position.x;
                    hoveredBlockLines.position.y = intersects[0].object.position.y;
                    hoveredBlockLines.position.z = intersects[0].object.position.z;
                    scene.add(hoveredBlockLines);
                    hoveredBlockLines.visible = true;
                    selectedBlock = intersects[0];
                }
            

                if(resizeRendererToDisplaySize(renderer)) {
                    const canvas = renderer.domElement;
                    camera.aspect = canvas.clientWidth / canvas.clientHeight;
                    camera.updateProjectionMatrix(); 
                } 

                renderer.render(scene, camera);
                
                requestAnimationFrame(render);
            }

            document.addEventListener('movemouse', () => {
                mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
                mouse.y = (event.clientY / window.innerHeight) * 2 + 1;
            });

            requestAnimationFrame(render);
        }

        
        main();
        