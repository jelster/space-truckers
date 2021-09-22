import { SphereBuilder} from "@babylonjs/core/Meshes/Builders/sphereBuilder";
import {StandardMaterial} from "@babylonjs/core/Materials/standardMaterial";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import OrbitingGameObject from "../orbitingGameObject";
import sunParticles from "../systems/sun.json";
import { ParticleSystemSet } from "@babylonjs/core";
import T_SunFlare from "../../assets/textures/T_SunFlare.png";
import T_SunSurface from "../../assets/textures/T_SunSurface.png";
import T_sun from "../../assets/textures/2k_sun.jpg";

ParticleSystemSet.BaseAssetsUrl = document.baseURI;
class Star extends OrbitingGameObject {

    starParticleSystem;
    constructor(scene, options) {
        super(scene, options);
        this.autoUpdatePosition = false;
        const starData = options;
        
        this.mesh = SphereBuilder.CreateSphere("star", { diameter: starData.scale }, this.scene);
        this.material = new StandardMaterial("starMat", this.scene);
        this.material.diffuseTexture = new Texture(starData.diffuseTexture, this.scene);
        

        this.scene.onReadyObservable.add(() => {
            this.starParticleSystem = ParticleSystemSet.Parse(sunParticles, this.scene, true);
            this.starParticleSystem.name = sunParticles.name;
            this.starParticleSystem.emitter = this.mesh;
            this.starParticleSystem.start();
                 
        });
    }

    update(deltaTime) {
        this.rotation.y += deltaTime * 0.0735;
         
    }
}

export default Star;