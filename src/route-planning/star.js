import { MeshBuilder, StandardMaterial, Texture } from "@babylonjs/core";
import OrbitingGameObject from "../orbitingGameObject";

class Star extends OrbitingGameObject {

    constructor(scene, options) {
        super(scene, options);
        this.autoUpdatePosition = false;
        const starData = options;
        
        this.mesh = MeshBuilder.CreateSphere("star", { diameter: starData.scale }, this.scene);
        this.material = new StandardMaterial("starMat", this.scene);
        this.material.emissiveTexture = new Texture(starData.diffuseTexture, this.scene);
    }

    update(deltaTime) {
        this.rotation.y += deltaTime * 0.0735;
         
    }
}

export default Star;