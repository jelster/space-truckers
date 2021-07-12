import { Scalar } from "@babylonjs/core/Maths/math.scalar";
import globalCfg from "./route-planning/gameData";


import BaseGameObject from "./baseGameObject";
import { Vector3 } from "@babylonjs/core";

import { gravConstant, primaryReferenceMass } from "./route-planning/gameData";
class OrbitingGameObject extends BaseGameObject {
    angularPosition = 0.0;
    angularVelocity = 0.0;
    orbitalPeriod = 0.0;
    orbitalRadius = 1;
    orbitalVelocity = 0.0;
    orbitalCircumfrence = 0.0;
    autoUpdatePosition = false;

    constructor(scene,  orbitalData) {
        super(scene);
        this.autoUpdatePosition = orbitalData?.autoUpdatePosition ?? true;

        if (this.autoUpdatePosition) {
            this.angularPosition = orbitalData.posRadians ?? 0.0;
            this.orbitalRadius = orbitalData.posRadius ?? 0.01;
            this.setOrbitalParameters();
        }
    }

    setOrbitalParameters(orbitalRadius = this.orbitalRadius, primaryMass = primaryReferenceMass) {
        const parameters = this.calculateOrbitalParameters(orbitalRadius, primaryMass);

        this.orbitalPeriod = parameters.orbitalPeriod;
        this.orbitalVelocity = parameters.orbitalVelocity;
        this.angularVelocity = parameters.angularVelocity;
        this.orbitalCircumfrence = parameters.orbitalCircumfrence;
    }

    calculateOrbitalParameters(orbitalRadius = this.orbitalRadius, referenceMass = primaryReferenceMass) {
        const Gm = gravConstant * referenceMass;
        const rCubed = Math.pow(orbitalRadius, 3);
        const period = Scalar.TwoPi * Math.sqrt(rCubed / Gm);
        const v = Math.sqrt(Gm / orbitalRadius);
        const w = v / period;
        const orbitalCircumfrence = Math.pow(Math.PI * orbitalRadius, 2);
        return {
            orbitalPeriod: period,
            orbitalVelocity: v,
            angularVelocity: w,
            orbitalCircumfrence: orbitalCircumfrence
        };
    }

    update(deltaTime) {

        if (this.autoUpdatePosition) {
            const angPos = this.angularPosition;
            const w = this.angularVelocity * (deltaTime ?? 0.016);
            const posRadius = this.orbitalRadius;

            this.angularPosition = Scalar.Repeat(angPos + w, Scalar.TwoPi);
            // TODO: support inclined orbits by calculating the z-coordinate using the correct trig fn
            this.position.x = posRadius * Math.sin(this.angularPosition);
            this.position.z = posRadius * Math.cos(this.angularPosition);
        }
        super.update(deltaTime);
    }

    calculateGravitationalForce(position) {
        const mass = this.physicsImpostor?.mass;
        const m1Pos = this.position;
        if (mass <= 0) {
            return Vector3.Zero();
        }
        let direction = m1Pos.subtract(position);
        let distanceSq = direction.lengthSquared();
        if (distanceSq <= 0) {
            return Vector3.Zero();
        }
        let gravScale = (gravConstant * (mass * (1 / distanceSq)))
        if (isNaN(gravScale)) {
            throw new Error("Should not see NaN for gravScale in calculateGravitationalForce!");
        }
        let magnitude = direction.normalize().scaleInPlace(gravScale);
        
        return magnitude;
    }
}

export default OrbitingGameObject;