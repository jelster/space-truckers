import truckModelUrl from '../../assets/models/semi-truck.glb';
import envTextureUrl from '../../assets/environment/milkyway-pbr-hdr.env';

import { Vector3 } from '@babylonjs/core/Maths/math.vector';

const screenConfig = {
    GUI_MASK: 0x2,
    SCENE_MASK: 0x1,
    radarTextureResolution:2048,
    guiViewportSize: 2.48,
    routeDataScalingFactor: 1.0,
    followCamSetup: {
        lowerAlphaLimit: -1.25,
        upperAlphaLimit: 5.480,
        lowerBetaLimit: 1.25,
        upperBetaLimit: 1.6400,
        lowerRadiusLimit: 80.0,
        upperRadiusLimit: 100.0
    },
    numberOfRoadSegments: 16
};
const truckSetup = {
    modelUrl: truckModelUrl,
    modelScaling: 0.02,
    modelName: "semi_truck.1",
    turnSpeedRadians: Math.PI / 2,
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
