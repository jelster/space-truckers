import { PBRMaterial } from "@babylonjs/core/Materials/PBR/pbrMaterial";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { SolidParticleSystem } from "@babylonjs/core/Particles/solidParticleSystem";
import { MeshBuilder} from "@babylonjs/core/Meshes/meshBuilder";
import { Scalar } from "@babylonjs/core/Maths/math.scalar";
import OrbitingGameObject from "../orbitingGameObject";

import rockTextureUrl from "../../assets/textures/rock.png";
import rockNormalUrl from "../../assets/textures/rockn.png";

class AsteroidBelt extends OrbitingGameObject {
    asteroidData;
    rockMat;
    rockSPS;

    constructor(scene, asteroidBeltOptions) {
        super(scene, asteroidBeltOptions);

        this.asteroidData = asteroidBeltOptions;

        const rockMat = new PBRMaterial("rockMat", this.scene);
        rockMat.albedoTexture = new Texture(rockTextureUrl, this.scene);
        rockMat.bumpTexture = new Texture(rockNormalUrl, this.scene);
        rockMat.roughness = 0.9;
        rockMat.metallic = 0.015;

        const rockSPS = this.rockSPS = new SolidParticleSystem("asteroidSPS", this.scene,
            {
                updatable: false,
                isPickable: false,
                useModelMaterial: true
            });
        const aSphere = MeshBuilder.CreateIcoSphere("spsSphere", { radius: 5, subdivisions: 4, flat: true });
        aSphere.material = rockMat;

        const numAsteroids = asteroidBeltOptions.number;
        const density = asteroidBeltOptions.density;
        const innerBeltRadius = asteroidBeltOptions.innerBeltRadius;
        const outerBeltRadius = asteroidBeltOptions.outerBeltRadius;
        const maxScale = asteroidBeltOptions.maxScale;
        rockSPS.addShape(aSphere, numAsteroids, {
            vertexFunction: (vertex) => {
                vertex.x *= 1 + (Math.random() + maxScale.x);
                vertex.y *= 1 + (Math.random() + maxScale.y);
                vertex.z *= 1 + (Math.random() + maxScale.z);
            },
            positionFunction: (part, i, s) => {
                part.scaling.set(Math.random() * 2 + 1, Math.random() + 1, Math.random() * 2 + 1);

                let theta = Math.random() * 2 * Math.PI;
                let rTheta = Scalar.RandomRange(innerBeltRadius + density * 0.5, outerBeltRadius - density * 0.5);
                part.position.x = Math.sin(theta) * rTheta;
                part.position.y = (Math.random() - 0.5) * density;
                part.position.z = Math.cos(theta) * rTheta;

                part.rotation.x = Math.random() * 3.5;
                part.rotation.y = Math.random() * 3.5;
                part.rotation.z = Math.random() * 3.5;

            }
        });

        this.mesh = rockSPS.buildMesh();
        aSphere.dispose();
        this.rockSPS = rockSPS;

    }

    update(deltaTime) {
        this.mesh.rotation.y += (Math.PI * (deltaTime ?? 0.015)) / 100;
        super.update(deltaTime);
    }
}

export default AsteroidBelt;