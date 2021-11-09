import truckModelUrl from '../../assets/models/semi-truck.glb';
import envTextureUrl from '../../assets/environment/milkyway-pbr-hdr.env';

import { Vector3 } from '@babylonjs/core/Maths/math.vector';

const screenConfig = {
    GUI_MASK: 0x2,
    SCENE_MASK: 0x1,
    radarTextureResolution: 4096,
    guiViewportSize: 4.96,
    routeDataScalingFactor: 5.0,
    followCamSetup: {
        lowerAlphaLimit: Math.PI,
        upperAlphaLimit: 5.600,
        lowerBetaLimit: 0,
        upperBetaLimit: 1.5000,
        lowerRadiusLimit: 25.0,
        upperRadiusLimit: 180.0
    }
};
const truckSetup = {
    modelUrl: truckModelUrl,
    modelScaling: 0.02,
    modelName: "semi_truck.1",
    turnSpeedRadians: Math.PI / 60,
    maxAcceleration: 9.86,
    initialVelocity: new Vector3(1, 0, 0),
    physicsConfig: {
        mass: 5000,
        restitution: 0.1,
        damping: 0.1,
        friction: 0.00002
    }
};

const environmentConfig = {
    envTextureUrl: envTextureUrl,
    skyBoxSize: 20000,
}

export {screenConfig, truckSetup, environmentConfig};
