import * as THREE from 'https://threejs.org/build/three.module.js';

class Player {
    constructor(x,y,z,fov,aspect,near,far) {
        this.x = x;
        this.y = y;
        this.z = z;
    
        this.fov = fov;
        this.aspect = aspect;
        this.near = near;
        this.far = far;
        this.cameraSpeed = .1;
        this.camera = new THREE.PerspectiveCamera(this.fov, this.aspect, this.near, this.far);
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        this.cursorLock = false;
        this.flying = true;
        this.jumped = false;
        this.jumpSpeed = .1;
        this.speedY = 0;

        this.inputs = {w: 0, a: 0, s: 0, d: 0, space: 0, shift: 0};
    }
    update(camera, controls) {
        this.setPlayerPosition(camera, controls);
    }

    setPlayerPosition(camera, controls) {
        var direction = new THREE.Vector3();
        camera.getWorldDirection( direction );
        
        if(this.inputs.w !== 0) {
            controls.moveForward(this.cameraSpeed);
        }
        if(this.inputs.a !== 0) {
            controls.moveRight(-this.cameraSpeed);
        }
        if(this.inputs.s !== 0) {
            controls.moveForward(-this.cameraSpeed);
        }
        if(this.inputs.d !== 0) {
            controls.moveRight(this.cameraSpeed);
            
        }
        if(this.inputs.space !== 0) {
            if(this.flying) {
                camera.position.y += this.cameraSpeed;
            }else if(!this.jumped) {
                yVelocity = jumpSpeed;
                jumped = true;
            }
                
        }
        if(this.inputs.shift !== 0) {
            if(this.flying) {
                camera.position.y -= this.cameraSpeed;
            }
        }

        if(!this.flying) {
            yVelocity += GRAVITY
            camera.position.y += yVelocity;
        }
    }
}

export {Player};