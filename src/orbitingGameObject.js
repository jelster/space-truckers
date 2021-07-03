import { Scalar } from "@babylonjs/core/Maths/math.scalar";
import gameData from "./route-planning/gameData";


import BaseGameObject from "./baseGameObject";

class OrbitingGameObject extends BaseGameObject {
    angularPosition = 0.0;
    angularVelocity = 0.0;
    orbitalPeriod = 0.0;
    orbitalRadius = 0.0;
    orbitalVelocity = 0.0;
    orbitalCircumfrence = 0.0;

    constructor(scene, orbitalData) {
        super(scene);

        this.angularPosition = orbitalData?.posRadians;
        this.orbitalRadius = orbitalData?.posRadius;

        this.setOrbitalParameters(gameData.gravConstant, gameData.primaryReferenceMass);
    }

    setOrbitalParameters(gravConstant, primaryReferenceMass) {
        const Gm = gravConstant * primaryReferenceMass;
        const rCubed = Math.pow(this.orbitalRadius, 3);
        const period = Scalar.TwoPi * Math.sqrt(rCubed / Gm);
        const v = Math.sqrt(Gm / this.orbitalRadius);
        const w = v / period;

        this.orbitalPeriod = period;
        this.orbitalVelocity = v;
        this.angularVelocity = w;
        this.orbitalCircumfrence = Math.pow(Math.PI * this.orbitalRadius, 2);
    }

    update(deltaTime) {
        const angPos = this.angularPosition;
        const w = this.angularVelocity * (deltaTime ?? 0.016);
        const posRadius = this.orbitalRadius;


        this.position.x = posRadius * Math.sin(angPos);
        this.position.z = posRadius * Math.cos(angPos);
        this.angularPosition = Scalar.Repeat(angPos + w, Scalar.TwoPi);

        super.update(deltaTime);
    }
}

export default OrbitingGameObject;