
class BaseGameObject {
    mesh;
    scene;
    lastSceneTime = 0;

    get rotation() { return this.mesh?.rotation; }
    set rotation(value) { this.mesh.rotation = value; }

    get position() { return this.mesh?.position; }
    set position(value) { this.mesh.position = value; }

    get forward() { return this.mesh?.forward; }

    get material() { return this.mesh?.material; }
    set material(value) { this.mesh.material = value; }
    get physicsImpostor() { return this.mesh?.physicsImpostor; }
    set physicsImpostor(value) { this.mesh.physicsImpostor = value; }
    constructor(scene) {
        this.scene = scene;

        this.scene.onDisposeObservable.add(() => this.dispose());
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