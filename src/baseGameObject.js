class BaseGameObject {
    mesh;
    scene;
    lastSceneTime = 0;

    get rotation() { return this.mesh?.rotation; }
    set rotation(value) { this.mesh.rotation = value; }

    get position() { return this.mesh?.position; }
    set position(value) { this.mesh.position = value; }

    get material() { return this.mesh?.material; }
    set material(value) { this.mesh.material = value; }

    constructor(scene) {
        this.scene = scene;
    }

    update(deltaTime) {
        this.lastSceneTime = deltaTime;
    }

    dispose() {
        if (this.mesh) {
            this.mesh.dispose();
        }

    }
}

export default BaseGameObject;