import { Axis } from "@babylonjs/core";
import { PBRMaterial } from "@babylonjs/core/Materials/PBR/pbrMaterial";
import { NodeMaterial } from "@babylonjs/core/Materials/Node/nodeMaterial";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Scalar } from "@babylonjs/core/Maths/math.scalar";
import { MeshBuilder} from "@babylonjs/core/Meshes/meshBuilder";
import OrbitingGameObject from "../orbitingGameObject";

class Planet extends OrbitingGameObject {
    planetData;
    diameter;
    get name() { return this.planetData?.name; }

    constructor(scene, planData) {
        super(scene, planData);
        this.planetData = planData;

        let planet = this.mesh = MeshBuilder.CreateSphere(planData.name,
            { diameter: planData.scale },
            this.scene);

        this.diameter = planData.scale;

        planet.rotation.x = Math.PI;
        let planetMat;
        if (planData.nodeMaterial) {
            planetMat = this.#createNodeMaterial(planData);
        }
        else {
            planetMat = this.#createPBRMaterial(planData);
        }
        planet.material = planetMat;
    }

    update(deltaTime) {
        this.mesh.rotate(Axis.Y,0.01);
        super.update(deltaTime);
    }

    #createNodeMaterial(planData) {
        let planetMat = NodeMaterial.Parse(planData.nodeMaterial, this.scene, "");
        return planetMat;
    }
    #createPBRMaterial(planData) {
        let planetMat = new PBRMaterial(planData.name + "-mat", this.scene);
        planetMat.roughness = 0.988;
        planetMat.metallic = 0.001;

        if (planData.diffuseTexture) {
            planetMat.albedoTexture = new Texture(planData.diffuseTexture, this.scene);
        }
        else {
            planetMat.albedoColor = planData.color ?? Color3.White();
        }
        if (planData.normalTexture) {
            planetMat.bumpTexture = new Texture(planData.normalTexture, this.scene);
            planetMat.forceIrradianceInFragment = true;
        }
        if (planData.specularTexture) {
            planetMat.reflectivityTexture = new Texture(planData.specularTexture, this.scene);
        }
        else {
            planetMat.specularColor = new Color3(25 / 255, 25 / 255, 25 / 255);
        }
        if (planData.lightMapUrl) {
            planetMat.lightmapTexture = new Texture(planData.lightMapUrl, this.scene);
        }
        planetMat.directIntensity = planData.directIntensity ?? 1.0;
        return planetMat;
    }

}

export default Planet;