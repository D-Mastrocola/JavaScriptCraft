import * as THREE from "../three.js-master/build/three.module.js";
class Player {
  constructor(x, y, z) {
    this.pos = new THREE.Vector3(x, y, z);
    this.vel = new THREE.Vector3(0, 0, 0);
    this.keysPressed = {
      w: false,
      a: false,
      s: false,
      d: false,
      shift: false,
      space: false,
    };
    this.moveSpeed = 0.15;
    this.isFlying = true;
    this.jumped = false;
  }
  move(raycaster) {
    if (this.isFlying) {
      this.vel.set(0, 0, 0);
    } else {
      this.vel.set(0, this.vel.y, 0);
    }
    let direction = raycaster.ray.direction.clone();
    direction.y = 0;
    direction.normalize();
    direction.multiplyScalar(this.moveSpeed);
    if (this.keysPressed.w) {
      this.vel.add(direction);
    }
    if (this.keysPressed.a) {
      let newDir = direction.clone();
      //Rotates the vector 90 degrees
      let axis = new THREE.Vector3(0, 1, 0);
      newDir.applyAxisAngle(axis, Math.PI / 2);
      this.vel.add(newDir);
    }
    if (this.keysPressed.s) {
      let newDir = direction.clone();
      newDir.negate();
      this.vel.add(newDir);
    }
    if (this.keysPressed.d) {
      let newDir = direction.clone();
      //Rotates the vector 90 degrees
      let axis = new THREE.Vector3(0, 1, 0);
      newDir.applyAxisAngle(axis, Math.PI / 2);
      newDir.negate();
      this.vel.add(newDir);
    }
    let fly = new THREE.Vector3(0, this.moveSpeed, 0);
    if (this.keysPressed.space) {
      if (!this.isFlying && !this.jumped) {
        let jump = new THREE.Vector3(0, 0, 0);
        this.vel.y = 0;
        this.jumped = true;
        this.vel.add(jump);
      } else {
        this.vel.add(fly);
      }
    }
    fly.negate();
    if (this.keysPressed.shift) this.vel.add(fly);
  }
  applyGravity(GRAVITY) {
    let gravityVector = new THREE.Vector3(0, GRAVITY, 0);
    this.vel.add(gravityVector);
  }
  update(camera, raycaster, GRAVITY) {
    //if (!this.isFlying) this.applyGravity(GRAVITY);

    this.move(raycaster);
    this.pos.add(this.vel);
    camera.position.add(this.vel);
  }
}
export default Player;
