let colorArray = [
    0x229900,
    0x888888
]
class Block {
    constructor(x, y, z, scene, c) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.size = 1;
        this.color = colorArray[c];
        this.geometry = new THREE.BoxGeometry(this.size, this.size, this.size);
        this.material = new THREE.MeshPhongMaterial({color: this.color});
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.update();
        scene.add(this.mesh);
    }
    getPos() {
        return ['x: ' + this.x, 'y: ' + this.y]
    }
    getMesh() {
        return this.mesh;
    }

    update() {
        this.mesh.position.x = this.x; 
        this.mesh.position.y = this.y; 
        this.mesh.position.z = this.z; 
    }
}