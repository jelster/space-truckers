import { CreateSphere } from "@babylonjs/core/Meshes/Builders/sphereBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import OrbitingGameObject from "../orbitingGameObject";
import sunParticles from "../systems/sun.json";
import { ParticleSystemSet } from "@babylonjs/core/Particles/particleSystemSet";
import { Color3 } from "@babylonjs/core/Maths/math.color";

import T_SunFlare from "../../assets/textures/T_SunFlare.png";
import T_SunSurface from "../../assets/textures/T_SunSurface.png";
import T_sun from "../../assets/textures/2k_sun.jpg";
import { VolumetricLightScatteringPostProcess } from "@babylonjs/core/PostProcesses/volumetricLightScatteringPostProcess";

 class Star extends OrbitingGameObject {

    starParticleSystem;
    constructor(scene, options) {
        super(scene, options);
        this.autoUpdatePosition = false;
        const starData = options;

        this.mesh = CreateSphere("star", { diameter: starData.scale }, this.scene);
        this.material = new StandardMaterial("starMat", this.scene);
        this.material.diffuseTexture = new Texture(starData.diffuseTexture, this.scene);
        this.material.ambientTexture = this.material.diffuseTexture;
        this.material.emissiveColor = Color3.White();

        this.scene.onReadyObservable.add(() => {
            this.starParticleSystem = ParticleSystemSet.Parse(sunParticles, this.scene, true);
            this.starParticleSystem.name = sunParticles.name;
            this.starParticleSystem.emitter = this.mesh;
            this.starParticleSystem.start();
            var godrays = new VolumetricLightScatteringPostProcess(
                'godrays',
                1.0,
                this.scene.activeCamera,
                this.mesh, 50,
                Texture.BILINEAR_SAMPLINGMODE,
                this.scene.getEngine(),
                false,
                this.scene);
            godrays._volumetricLightScatteringRTT.renderParticles = true;


        });
    }

    update(deltaTime) {
        this.rotation.y += deltaTime * 0.0735;

    }
}

export default Star;