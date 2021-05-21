class Block {
    constructor(x, y, z, scene) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.size = 1;
        this.geometry = new THREE.BoxGeometry(this.size, this.size, this.size);
        this.material = new THREE.MeshPhongMaterial({color: 0x229900});
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