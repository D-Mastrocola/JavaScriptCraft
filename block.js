import * as THREE from 'https://threejs.org/build/three.module.js';
 class Block {
     constructor(x,y,z,material) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.material = material;
        this.boxSize = 1;
        this.geometry = new THREE.BoxGeometry(this.boxSize, this.boxSize, this.boxSize);
        this.cube = new THREE.Mesh(this.geometry, this.material);
        this.cube.position.x = this.x;
        this.cube.position.y = this.y;
        this.cube.position.z = this.z;
     }
    
     update() {
         
     }
}
export {Block};